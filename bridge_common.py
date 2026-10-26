"""Transport-agnostic helpers shared by bridge.py (Meshtastic) and bridge_meshcore.py (MeshCore).

Both bridges speak the same newline-delimited JSON protocol to server.js
(see emit()/stdin command handling). This module holds the pieces of that
protocol, plus the TAK fountain-transfer send/receive state machines, that
do not depend on which mesh library/transport is underneath.

Callers plug in their own `send_raw(payload: bytes) -> None` callback for
the fountain transfer so this module never has to know whether it is
talking to a meshtastic SerialInterface or a meshcore MeshCore client.
"""

from __future__ import annotations

import base64
import itertools
import json
import sys
import threading
import time
import traceback
import zlib
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Callable

from tak_fountain import (
    MAX_PAYLOAD_SIZE,
    TRANSFER_TYPE_COT,
    TRANSFER_TYPE_COT_ASCII,
    TYPE_COMPLETE,
    TYPE_NEED_MORE,
    AckPacket,
    DataBlock,
    EncodedBlock,
    FountainCodec,
    adaptive_overhead,
    compute_hash,
    generate_transfer_id,
    get_packet_type,
    is_fountain_packet,
)

SendRawFn = Callable[[bytes], None]


def make_tak_logger(log_path: Path) -> Callable[[str], None]:
    log_path.parent.mkdir(parents=True, exist_ok=True)
    lock = threading.Lock()

    def _log(msg: str) -> None:
        ts = time.strftime("%Y-%m-%dT%H:%M:%S", time.localtime())
        line = f"[{ts}] {msg}\n"
        with lock:
            with open(log_path, "a", encoding="utf-8") as f:
                f.write(line)

    return _log


def tak_decompress(raw: bytes) -> str:
    """Decompress a TAK payload (zlib, raw deflate, or raw UTF-8 XML)."""

    def _inflate_candidates(data: bytes) -> list[bytes]:
        outputs: list[bytes] = []
        for wbits in (zlib.MAX_WBITS, -zlib.MAX_WBITS):
            try:
                inflated = zlib.decompress(data, wbits)
            except Exception:
                continue
            outputs.append(inflated)
        if not outputs:
            outputs.append(data)
        return outputs

    def _decode_xml_bytes(data: bytes) -> str:
        for encoding in ("utf-8", "utf-8-sig", "utf-16", "utf-16-le", "utf-16-be"):
            try:
                text = data.decode(encoding)
            except Exception:
                continue
            if text.lstrip().startswith("<"):
                return text
        return ""

    for candidate in _inflate_candidates(raw):
        text = _decode_xml_bytes(candidate)
        if text:
            return text
    return ""


def tak_payload_debug(raw: bytes) -> dict[str, Any]:
    info: dict[str, Any] = {
        "rawBytes": len(raw),
        "rawPrefix": raw[:24].hex(),
    }
    for label, wbits in (("zlib", zlib.MAX_WBITS), ("raw-deflate", -zlib.MAX_WBITS)):
        try:
            inflated = zlib.decompress(raw, wbits)
        except Exception:
            continue
        info[f"{label}Bytes"] = len(inflated)
        info[f"{label}Prefix"] = inflated[:24].hex()
        for encoding in ("utf-8", "utf-8-sig", "utf-16", "utf-16-le", "utf-16-be"):
            try:
                text = inflated.decode(encoding)
            except Exception:
                continue
            preview = text[:120].replace("\n", " ").replace("\r", " ")
            info[f"{label}Preview"] = preview
            if text.lstrip().startswith("<"):
                info[f"{label}Xml"] = True
                return info
            break
    return info


def xor_bytes(left: bytes | bytearray, right: bytes | bytearray) -> bytes:
    size = min(len(left), len(right))
    out = bytearray(left)
    for idx in range(size):
        out[idx] ^= right[idx]
    return bytes(out)


def _matrix_rank_bitmasks(rows: list[int], width: int) -> int:
    rank = 0
    work = [row for row in rows if row]
    bit = 0
    while bit < width and rank < len(work):
        pivot = None
        for idx in range(rank, len(work)):
            if work[idx] & (1 << bit):
                pivot = idx
                break
        if pivot is None:
            bit += 1
            continue
        work[rank], work[pivot] = work[pivot], work[rank]
        for idx in range(len(work)):
            if idx != rank and (work[idx] & (1 << bit)):
                work[idx] ^= work[rank]
        rank += 1
        bit += 1
    return rank


def _solve_source_blocks_from_masks(masks: list[int], payloads: list[bytes], source_block_count: int) -> list[bytes] | None:
    rows: list[list[Any]] = [[mask, bytearray(payload)] for mask, payload in zip(masks, payloads)]
    pivot_row_for_col = [-1] * source_block_count
    row_index = 0
    for col in range(source_block_count):
        pivot = None
        for idx in range(row_index, len(rows)):
            if rows[idx][0] & (1 << col):
                pivot = idx
                break
        if pivot is None:
            continue
        rows[row_index], rows[pivot] = rows[pivot], rows[row_index]
        pivot_mask, pivot_payload = rows[row_index]
        for idx in range(len(rows)):
            if idx != row_index and (rows[idx][0] & (1 << col)):
                rows[idx][0] ^= pivot_mask
                rows[idx][1] = bytearray(xor_bytes(rows[idx][1], pivot_payload))
        pivot_row_for_col[col] = row_index
        row_index += 1
        if row_index == len(rows):
            break
    if any(idx < 0 for idx in pivot_row_for_col):
        return None
    solved = [b""] * source_block_count
    for col, idx in enumerate(pivot_row_for_col):
        row_mask, row_payload = rows[idx]
        if row_mask != (1 << col):
            return None
        solved[col] = bytes(row_payload)
    return solved


def bruteforce_small_fountain_decode(
    fountain_codec: FountainCodec,
    blocks: list[EncodedBlock],
    source_block_count: int,
    total_length: int,
) -> bytes | None:
    if source_block_count < 2 or source_block_count > 4 or len(blocks) < source_block_count:
        return None
    payloads = [bytes(block.payload) for block in blocks]
    candidate_masks = list(range(1, 1 << source_block_count))
    for masks in itertools.product(candidate_masks, repeat=len(blocks)):
        if _matrix_rank_bitmasks(list(masks), source_block_count) < source_block_count:
            continue
        solved = _solve_source_blocks_from_masks(list(masks), payloads, source_block_count)
        if not solved:
            continue
        valid = True
        for mask, payload in zip(masks, payloads):
            combined = bytes(len(payload))
            for bit in range(source_block_count):
                if mask & (1 << bit):
                    combined = xor_bytes(combined, solved[bit])
            if combined != payload:
                valid = False
                break
        if not valid:
            continue
        actual_block_size = len(solved[0]) if solved else None
        reassembled = fountain_codec._reassemble(solved, total_length, actual_block_size)
        if not reassembled or reassembled[0] not in (TRANSFER_TYPE_COT, TRANSFER_TYPE_COT_ASCII):
            continue
        payload_debug = tak_payload_debug(reassembled[1:])
        if tak_decompress(reassembled[1:]) or payload_debug.get("zlibBytes") or payload_debug.get("raw-deflateBytes"):
            return reassembled
    return None


def dump_failed_tak_payload(debug_dir: Path, sender: str, transfer_id: int, decoded: bytes, blocks: list[EncodedBlock]) -> str:
    stamp = int(time.time() * 1000)
    safe_sender = str(sender).replace("!", "").replace(":", "_")
    base = debug_dir / f"tak_{stamp}_{safe_sender}_{transfer_id}"
    try:
        raw_path = base.with_suffix(".bin")
        raw_path.write_bytes(decoded)
        meta = {
            "sender": sender,
            "transferId": transfer_id,
            "decodedBytes": len(decoded),
            "decodedPrefix": decoded[:64].hex(),
            "payloadDebug": tak_payload_debug(decoded[1:]) if len(decoded) > 1 else {},
            "blocks": [
                {
                    "seed": block.seed,
                    "sourceBlockCount": block.source_block_count,
                    "totalLength": block.total_length,
                    "sourceIndices": block.source_indices,
                    "payloadPrefix": bytes(block.payload[:32]).hex(),
                    "payloadBase64": base64.b64encode(bytes(block.payload)).decode("ascii"),
                }
                for block in blocks
            ],
        }
        meta_path = base.with_suffix(".json")
        meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
        return str(meta_path)
    except Exception:
        return ""


def dump_tak_plugin_payload(debug_dir: Path, sender: str, raw_payload: bytes, channel_index: int | None, hop_limit: int | None) -> str:
    stamp = int(time.time() * 1000)
    safe_sender = str(sender).replace("!", "").replace(":", "_")
    base = debug_dir / f"atak_plugin_{stamp}_{safe_sender}"
    try:
        raw_path = base.with_suffix(".bin")
        raw_path.write_bytes(raw_payload)
        meta = {
            "sender": sender,
            "channelIndex": channel_index,
            "hopLimit": hop_limit,
            "payloadBytes": len(raw_payload),
            "payloadPrefix": raw_payload[:64].hex(),
            "payloadBase64": base64.b64encode(raw_payload).decode("ascii"),
        }
        meta_path = base.with_suffix(".json")
        meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
        return str(meta_path)
    except Exception:
        return ""


def extract_payload_bytes(value: Any) -> bytes | None:
    if isinstance(value, (bytes, bytearray, memoryview)):
        return bytes(value)
    if isinstance(value, list):
        try:
            return bytes(int(item) & 0xFF for item in value)
        except Exception:
            return None
    if isinstance(value, str):
        stripped = value.strip()
        if not stripped:
            return None
        if stripped.startswith("<"):
            return stripped.encode("utf-8")
        compact = stripped.replace(" ", "")
        if len(compact) % 2 == 0:
            try:
                return bytes.fromhex(compact)
            except Exception:
                return stripped.encode("utf-8")
        return stripped.encode("utf-8")
    return None


def setup_stdio_utf8() -> None:
    if hasattr(sys.stdin, "reconfigure"):
        sys.stdin.reconfigure(encoding="utf-8")
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8")


def emit(message_type: str, payload: dict[str, Any]) -> None:
    sys.stdout.write(json.dumps({"type": message_type, "payload": payload}, ensure_ascii=True) + "\n")
    sys.stdout.flush()


def repair_text(value: Any) -> str:
    text = str(value or "")
    if not text:
        return ""

    if "Р" in text or "Ñ" in text:
        for source_encoding in ("cp1251", "latin1"):
            try:
                repaired = text.encode(source_encoding).decode("utf-8")
            except Exception:
                continue
            if repaired and repaired != text:
                text = repaired
                break

    return text


def sanitize_for_json(value: Any) -> Any:
    if isinstance(value, dict):
        return {str(key): sanitize_for_json(item) for key, item in value.items()}
    if isinstance(value, (list, tuple, set)):
        return [sanitize_for_json(item) for item in value]
    if isinstance(value, bytes):
        try:
            return value.decode("utf-8")
        except Exception:
            return value.hex()
    if isinstance(value, str):
        return repair_text(value)
    if value is None or isinstance(value, (bool, int, float)):
        return value
    return str(value)


@dataclass(slots=True)
class SendState:
    transfer_id: int
    data_hash: bytes
    source_block_count: int
    condition: threading.Condition
    is_complete: bool = False
    ack_received: bool = False
    need_more_blocks: int = 0


@dataclass(slots=True)
class ReceiveState:
    transfer_id: int
    sender: str
    channel_index: int
    hop_limit: int | None
    source_block_count: int
    total_length: int
    blocks: dict[int, EncodedBlock] = field(default_factory=dict)
    is_complete: bool = False
    last_activity: float = field(default_factory=time.time)


class TakFountainTransport:
    """Runs the TAK fountain-code send/receive state machine over an
    arbitrary transport, given only a `send_raw(bytes) -> None` callback.

    This is the transport-agnostic twin of the fountain logic that used to
    live directly in bridge.py wired to a meshtastic SerialInterface. Each
    bridge (Meshtastic, MeshCore, ...) constructs one instance per
    connection and supplies its own way of pushing raw bytes onto the mesh.
    """

    def __init__(self, tak_log: Callable[[str], None], debug_dir: Path, plugin_debug_dir: Path):
        self._fountain_codec = FountainCodec(MAX_PAYLOAD_SIZE)
        self._lock = threading.Lock()
        self._send_states: dict[int, SendState] = {}
        self._receive_states: dict[tuple[str, int], ReceiveState] = {}
        self._tak_log = tak_log
        self.debug_dir = debug_dir
        self.plugin_debug_dir = plugin_debug_dir
        debug_dir.mkdir(parents=True, exist_ok=True)
        plugin_debug_dir.mkdir(parents=True, exist_ok=True)

    def _resolve_channel_index(self, packet: dict[str, Any], decoded: dict[str, Any]) -> int:
        for key in ("channel", "channelIndex"):
            value = packet.get(key)
            if isinstance(value, int):
                return value
            value = decoded.get(key)
            if isinstance(value, int):
                return value
        return 0

    def _prune_receive_states(self) -> None:
        now = time.time()
        stale_keys = [key for key, state in self._receive_states.items() if now - state.last_activity > 300]
        for key in stale_keys:
            del self._receive_states[key]

    def send_ack(
        self,
        send_raw: SendRawFn,
        transfer_id: int,
        packet_type: int,
        received_blocks: int,
        needed_blocks: int,
        data_hash: bytes,
    ) -> None:
        payload = AckPacket(
            transfer_id=transfer_id,
            packet_type=packet_type,
            received_blocks=received_blocks,
            needed_blocks=needed_blocks,
            data_hash=data_hash,
        ).to_bytes()
        send_raw(payload)

    def handle_ack(self, raw_payload: bytes) -> None:
        ack = AckPacket.from_bytes(raw_payload)
        if ack is None:
            return
        with self._lock:
            state = self._send_states.get(ack.transfer_id)
            if state is None:
                return
            state.ack_received = True
            if ack.packet_type == TYPE_COMPLETE:
                if ack.data_hash == state.data_hash:
                    state.is_complete = True
                else:
                    state.need_more_blocks = max(1, state.source_block_count // 4)
            elif ack.packet_type == TYPE_NEED_MORE:
                state.need_more_blocks = max(1, ack.needed_blocks)
            state.condition.notify_all()

    def handle_data(
        self,
        raw_payload: bytes,
        sender: str,
        channel_index: int,
        hop_limit: int | None,
        send_raw: SendRawFn,
    ) -> str:
        data_block = DataBlock.from_bytes(raw_payload)
        if data_block is None:
            return ""
        ack_payload: tuple[int, int, bytes] | None = None
        transfer_type = -1
        payload = b""
        block_count = 0
        blocks_snapshot: list[EncodedBlock] = []
        with self._lock:
            self._prune_receive_states()
            key = (sender, data_block.transfer_id)
            state = self._receive_states.get(key)
            if state is None:
                state = ReceiveState(
                    transfer_id=data_block.transfer_id,
                    sender=sender,
                    channel_index=channel_index,
                    hop_limit=hop_limit,
                    source_block_count=data_block.source_block_count,
                    total_length=data_block.total_length,
                )
                self._receive_states[key] = state
            elif state.is_complete:
                return ""
            elif (
                state.source_block_count != data_block.source_block_count
                or state.total_length != data_block.total_length
            ):
                state = ReceiveState(
                    transfer_id=data_block.transfer_id,
                    sender=sender,
                    channel_index=channel_index,
                    hop_limit=hop_limit,
                    source_block_count=data_block.source_block_count,
                    total_length=data_block.total_length,
                )
                self._receive_states[key] = state
            if data_block.seed in state.blocks:
                state.last_activity = time.time()
                return ""
            state.blocks[data_block.seed] = EncodedBlock(
                seed=data_block.seed,
                source_block_count=data_block.source_block_count,
                total_length=data_block.total_length,
                source_indices=self._fountain_codec.regenerate_indices(
                    data_block.seed,
                    data_block.source_block_count,
                    data_block.transfer_id,
                ),
                payload=data_block.payload,
            )
            state.last_activity = time.time()
            block_count = len(state.blocks)
            blocks_snapshot = list(state.blocks.values())
            if len(state.blocks) < state.source_block_count:
                return ""
            decoded = self._fountain_codec.decode(blocks_snapshot)
            if not decoded:
                decoded = bruteforce_small_fountain_decode(
                    self._fountain_codec,
                    blocks_snapshot,
                    data_block.source_block_count,
                    data_block.total_length,
                )
            elif decoded:
                transfer_type_probe = decoded[0]
                if transfer_type_probe in (TRANSFER_TYPE_COT, TRANSFER_TYPE_COT_ASCII) and not tak_decompress(decoded[1:]):
                    fallback_decoded = bruteforce_small_fountain_decode(
                        self._fountain_codec,
                        blocks_snapshot,
                        data_block.source_block_count,
                        data_block.total_length,
                    )
                    if fallback_decoded:
                        decoded = fallback_decoded
            if not decoded:
                emit("tak_debug", {
                    "direction": "rx",
                    "sender": sender,
                    "recipient": "local",
                    "channelIndex": channel_index,
                    "hopLimit": hop_limit,
                    "decode": "fountain-decode-failed",
                    "transferId": data_block.transfer_id,
                    "blocksReceived": len(state.blocks),
                    "sourceBlockCount": data_block.source_block_count,
                    "totalLength": data_block.total_length,
                })
                return ""
            transfer_type = decoded[0]
            payload = decoded[1:]
            state.is_complete = True
            ack_hash = compute_hash(decoded)
            ack_payload = (data_block.transfer_id, len(state.blocks), ack_hash)
            del self._receive_states[key]
        if ack_payload is not None:
            transfer_id, received_blocks, ack_hash = ack_payload
            self.send_ack(send_raw, transfer_id, TYPE_COMPLETE, received_blocks, 0, ack_hash)
            time.sleep(0.2)
            self.send_ack(send_raw, transfer_id, TYPE_COMPLETE, received_blocks, 0, ack_hash)
        cot_xml = ""
        if transfer_type in (TRANSFER_TYPE_COT, TRANSFER_TYPE_COT_ASCII):
            cot_xml = tak_decompress(payload)
        dump_path = ""
        if transfer_type in (TRANSFER_TYPE_COT, TRANSFER_TYPE_COT_ASCII) and not cot_xml:
            dump_path = dump_failed_tak_payload(
                self.debug_dir,
                sender,
                data_block.transfer_id,
                bytes([transfer_type]) + payload,
                blocks_snapshot,
            )
        if transfer_type != -1:
            note = ""
            if payload[:1] == b"\xEE":
                note = "decoded payload starts with 0xEE; sender-side extra encryption is likely enabled"
            if not note and payload[:4] == b"$EXI":
                note = "decoded payload starts with $EXI; sender may be using EXI instead of raw XML"
            if dump_path:
                note = f"{note} dump={dump_path}".strip()
            payload_prefix = payload[:16].hex()
            payload_debug = tak_payload_debug(payload) if not cot_xml else {}
            emit("tak_debug", {
                "direction": "rx",
                "sender": sender,
                "recipient": "local",
                "channelIndex": channel_index,
                "hopLimit": hop_limit,
                "decode": "fountain-complete",
                "transferId": data_block.transfer_id,
                "blocksReceived": block_count,
                "sourceBlockCount": data_block.source_block_count,
                "totalLength": data_block.total_length,
                "transferType": transfer_type,
                "payloadBytes": len(payload),
                "payloadPrefix": payload_prefix,
                "cotXmlBytes": len(cot_xml.encode("utf-8")) if cot_xml else 0,
                "payloadDebug": payload_debug,
                "note": note,
            })
        return cot_xml

    def send_transfer(
        self,
        send_raw: SendRawFn,
        cot_xml: str,
        local_sender_id: str = "",
        max_direct_bytes: int = 231,
    ) -> dict[str, Any]:
        compressed = zlib.compress(cot_xml.encode("utf-8"), level=9)
        self._tak_log(f"SEND_START xml_chars={len(cot_xml)} compressed_bytes={len(compressed)}")
        self._tak_log(f"SEND_XML_PREVIEW {cot_xml[:200]}")
        if len(compressed) <= max_direct_bytes:
            try:
                send_raw(compressed)
                self._tak_log(f"SEND_DIRECT_OK compressed_bytes={len(compressed)}")
            except Exception as exc:
                self._tak_log(f"SEND_DIRECT_ERROR {exc}\n{traceback.format_exc()}")
                raise
            return {"mode": "direct", "compressedBytes": len(compressed), "blocksSent": 1, "transferId": None}

        data_with_type = bytes([TRANSFER_TYPE_COT]) + compressed
        transfer_id = generate_transfer_id(local_sender_id)
        source_block_count = self._fountain_codec.get_source_block_count(len(data_with_type))
        blocks_to_send = self._fountain_codec.get_recommended_block_count(
            len(data_with_type),
            adaptive_overhead(source_block_count),
        )
        condition = threading.Condition(self._lock)
        state = SendState(
            transfer_id=transfer_id,
            data_hash=compute_hash(data_with_type),
            source_block_count=source_block_count,
            condition=condition,
        )
        with self._lock:
            self._send_states[transfer_id] = state
        self._tak_log(
            f"SEND_FOUNTAIN_START transfer_id={transfer_id} source_blocks={source_block_count} "
            f"blocks_to_send={blocks_to_send} total_bytes={len(data_with_type)}"
        )
        import os

        try:
            inter_packet_delay = max(0.25, float(os.environ.get("TAK_FOUNTAIN_INTER_PACKET_DELAY_SEC", "1.6")))
        except Exception:
            inter_packet_delay = 1.6
        try:
            per_packet_time_ms = max(100, int(os.environ.get("TAK_FOUNTAIN_PACKET_TIME_MS", "3200")))
        except Exception:
            per_packet_time_ms = 3200
        try:
            attempt = 0
            while attempt < 3 and not state.is_complete:
                attempt += 1
                with self._lock:
                    state.ack_received = False
                blocks = self._fountain_codec.encode(data_with_type, blocks_to_send, transfer_id)
                self._tak_log(f"SEND_FOUNTAIN_ATTEMPT attempt={attempt} blocks={len(blocks)}")
                for i, block in enumerate(blocks):
                    packet = DataBlock(
                        transfer_id=transfer_id,
                        seed=block.seed,
                        source_block_count=block.source_block_count,
                        total_length=block.total_length,
                        payload=block.payload,
                    ).to_bytes()
                    try:
                        send_raw(packet)
                        self._tak_log(f"SEND_FOUNTAIN_BLOCK_OK block={i+1}/{len(blocks)} packet_bytes={len(packet)}")
                    except Exception as exc:
                        self._tak_log(f"SEND_FOUNTAIN_BLOCK_ERROR block={i+1}/{len(blocks)} {exc}\n{traceback.format_exc()}")
                        raise
                    time.sleep(inter_packet_delay)
                timeout = min(300.0, (10000 + blocks_to_send * per_packet_time_ms * 2 + per_packet_time_ms * 4) / 1000.0)
                self._tak_log(f"SEND_FOUNTAIN_WAIT_ACK timeout={timeout:.1f}s")
                with self._lock:
                    state.condition.wait_for(lambda: state.ack_received or state.is_complete, timeout=timeout)
                    if state.is_complete:
                        self._tak_log(f"SEND_FOUNTAIN_ACK_COMPLETE transfer_id={transfer_id}")
                        return {
                            "mode": "fountain",
                            "compressedBytes": len(compressed),
                            "blocksSent": blocks_to_send,
                            "transferId": transfer_id,
                        }
                    if state.need_more_blocks > 0:
                        self._tak_log(f"SEND_FOUNTAIN_NEED_MORE need={state.need_more_blocks}")
                        blocks_to_send = state.need_more_blocks
                        state.need_more_blocks = 0
                    else:
                        blocks_to_send = max(5, source_block_count // 5)
                        self._tak_log(f"SEND_FOUNTAIN_TIMEOUT_RETRY blocks_to_send={blocks_to_send}")
            self._tak_log(f"SEND_FOUNTAIN_UNCONFIRMED transfer_id={transfer_id} all_attempts_done")
            return {
                "mode": "fountain-unconfirmed",
                "compressedBytes": len(compressed),
                "blocksSent": blocks_to_send,
                "transferId": transfer_id,
            }
        finally:
            with self._lock:
                self._send_states.pop(transfer_id, None)
