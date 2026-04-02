from __future__ import annotations

import json
import os
import sys
import threading
import base64
import time
import zlib
import itertools
import traceback
from pathlib import Path
from dataclasses import dataclass, field
from typing import Any

_TAK_LOG_PATH = Path.cwd() / "data" / "tak_send_debug.log"
_TAK_LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
_tak_log_lock = threading.Lock()

def _tak_log(msg: str) -> None:
    ts = time.strftime("%Y-%m-%dT%H:%M:%S", time.localtime())
    line = f"[{ts}] {msg}\n"
    with _tak_log_lock:
        with open(_TAK_LOG_PATH, "a", encoding="utf-8") as f:
            f.write(line)

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

def _tak_decompress(raw: bytes) -> str:
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


def _tak_payload_debug(raw: bytes) -> dict[str, Any]:
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


def _xor_bytes(left: bytes | bytearray, right: bytes | bytearray) -> bytes:
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
                rows[idx][1] = bytearray(_xor_bytes(rows[idx][1], pivot_payload))
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


def _bruteforce_small_fountain_decode(blocks: list[EncodedBlock], source_block_count: int, total_length: int) -> bytes | None:
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
                    combined = _xor_bytes(combined, solved[bit])
            if combined != payload:
                valid = False
                break
        if not valid:
            continue
        actual_block_size = len(solved[0]) if solved else None
        reassembled = _fountain_codec._reassemble(solved, total_length, actual_block_size)
        if not reassembled or reassembled[0] not in (TRANSFER_TYPE_COT, TRANSFER_TYPE_COT_ASCII):
            continue
        payload_debug = _tak_payload_debug(reassembled[1:])
        if _tak_decompress(reassembled[1:]) or payload_debug.get("zlibBytes") or payload_debug.get("raw-deflateBytes"):
            return reassembled
    return None


def _dump_failed_tak_payload(sender: str, transfer_id: int, decoded: bytes, blocks: list[EncodedBlock]) -> str:
    stamp = int(time.time() * 1000)
    safe_sender = str(sender).replace("!", "").replace(":", "_")
    base = _tak_debug_dir / f"tak_{stamp}_{safe_sender}_{transfer_id}"
    try:
        raw_path = base.with_suffix(".bin")
        raw_path.write_bytes(decoded)
        meta = {
            "sender": sender,
            "transferId": transfer_id,
            "decodedBytes": len(decoded),
            "decodedPrefix": decoded[:64].hex(),
            "payloadDebug": _tak_payload_debug(decoded[1:]) if len(decoded) > 1 else {},
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


def _dump_tak_plugin_payload(sender: str, raw_payload: bytes, channel_index: int | None, hop_limit: int | None) -> str:
    stamp = int(time.time() * 1000)
    safe_sender = str(sender).replace("!", "").replace(":", "_")
    base = _tak_plugin_debug_dir / f"atak_plugin_{stamp}_{safe_sender}"
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


def _extract_payload_bytes(value: Any) -> bytes | None:
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


_fountain_codec = FountainCodec(MAX_PAYLOAD_SIZE)
_fountain_lock = threading.Lock()
_fountain_send_states: dict[int, "SendState"] = {}
_fountain_receive_states: dict[tuple[str, int], "ReceiveState"] = {}
_tak_debug_dir = Path.cwd() / "data" / "tak_debug"
_tak_debug_dir.mkdir(parents=True, exist_ok=True)
_tak_plugin_debug_dir = Path.cwd() / "data" / "tak_plugin_debug"
_tak_plugin_debug_dir.mkdir(parents=True, exist_ok=True)


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


def _resolve_channel_index(packet: dict[str, Any], decoded: dict[str, Any]) -> int:
    for key in ("channel", "channelIndex"):
        value = packet.get(key)
        if isinstance(value, int):
            return value
        value = decoded.get(key)
        if isinstance(value, int):
            return value
    return 0


def _prune_fountain_receive_states() -> None:
    now = time.time()
    stale_keys = [
        key for key, state in _fountain_receive_states.items()
        if now - state.last_activity > 300
    ]
    for key in stale_keys:
        del _fountain_receive_states[key]


def _send_fountain_ack(
    mesh_interface: Any,
    tak_portnum: int,
    destination_id: str,
    channel_index: int,
    hop_limit: int | None,
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
    mesh_interface.sendData(
        payload,
        destinationId=destination_id,
        portNum=tak_portnum,
        wantAck=False,
        channelIndex=channel_index,
        hopLimit=hop_limit,
    )


def _handle_fountain_ack(raw_payload: bytes) -> None:
    ack = AckPacket.from_bytes(raw_payload)
    if ack is None:
        return
    with _fountain_lock:
        state = _fountain_send_states.get(ack.transfer_id)
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


def _handle_fountain_data(
    raw_payload: bytes,
    sender: str,
    channel_index: int,
    hop_limit: int | None,
    mesh_interface: Any,
    tak_portnum: int,
) -> str:
    data_block = DataBlock.from_bytes(raw_payload)
    if data_block is None:
        return ""
    ack_payload: tuple[int, int, bytes] | None = None
    transfer_type = -1
    payload = b""
    block_count = 0
    blocks_snapshot: list[EncodedBlock] = []
    with _fountain_lock:
        _prune_fountain_receive_states()
        key = (sender, data_block.transfer_id)
        state = _fountain_receive_states.get(key)
        if state is None:
            state = ReceiveState(
                transfer_id=data_block.transfer_id,
                sender=sender,
                channel_index=channel_index,
                hop_limit=hop_limit,
                source_block_count=data_block.source_block_count,
                total_length=data_block.total_length,
            )
            _fountain_receive_states[key] = state
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
            _fountain_receive_states[key] = state
        if data_block.seed in state.blocks:
            state.last_activity = time.time()
            return ""
        state.blocks[data_block.seed] = EncodedBlock(
            seed=data_block.seed,
            source_block_count=data_block.source_block_count,
            total_length=data_block.total_length,
            source_indices=_fountain_codec.regenerate_indices(
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
        decoded = _fountain_codec.decode(blocks_snapshot)
        if not decoded:
            decoded = _bruteforce_small_fountain_decode(
                blocks_snapshot,
                data_block.source_block_count,
                data_block.total_length,
            )
        elif decoded:
            transfer_type_probe = decoded[0]
            if transfer_type_probe in (TRANSFER_TYPE_COT, TRANSFER_TYPE_COT_ASCII) and not _tak_decompress(decoded[1:]):
                fallback_decoded = _bruteforce_small_fountain_decode(
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
                "portnum": "ATAK_FORWARDER",
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
        del _fountain_receive_states[key]
    if ack_payload is not None:
        transfer_id, received_blocks, ack_hash = ack_payload
        _send_fountain_ack(
            mesh_interface,
            tak_portnum,
            sender,
            channel_index,
            hop_limit,
            transfer_id,
            TYPE_COMPLETE,
            received_blocks,
            0,
            ack_hash,
        )
        time.sleep(0.2)
        _send_fountain_ack(
            mesh_interface,
            tak_portnum,
            sender,
            channel_index,
            hop_limit,
            transfer_id,
            TYPE_COMPLETE,
            received_blocks,
            0,
            ack_hash,
        )
    cot_xml = ""
    if transfer_type in (TRANSFER_TYPE_COT, TRANSFER_TYPE_COT_ASCII):
        cot_xml = _tak_decompress(payload)
    dump_path = ""
    if transfer_type in (TRANSFER_TYPE_COT, TRANSFER_TYPE_COT_ASCII) and not cot_xml:
        dump_path = _dump_failed_tak_payload(
            sender,
            data_block.transfer_id,
            bytes([transfer_type]) + payload,
            blocks_snapshot,
        )
    if transfer_type != -1:
        note = ""
        if payload[:1] == b"\xEE":
            note = "decoded payload starts with 0xEE; Meshtastic Extra Encryption is likely enabled on sender"
        if not note and payload[:4] == b"$EXI":
            note = "decoded payload starts with $EXI; sender may be using EXI instead of raw XML"
        if dump_path:
            note = f"{note} dump={dump_path}".strip()
        payload_prefix = payload[:16].hex()
        payload_debug = _tak_payload_debug(payload) if not cot_xml else {}
        emit("tak_debug", {
            "direction": "rx",
            "sender": sender,
            "recipient": "local",
            "portnum": "ATAK_FORWARDER",
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


def _send_fountain_transfer(
    mesh_interface: Any,
    tak_portnum: int,
    destination_id: str,
    cot_xml: str,
    channel_index: int = 0,
    hop_limit: int | None = None,
    local_sender_id: str = "",
) -> dict[str, Any]:
    compressed = zlib.compress(cot_xml.encode("utf-8"), level=9)
    _tak_log(f"SEND_START xml_chars={len(cot_xml)} compressed_bytes={len(compressed)} dest={destination_id} channel={channel_index} hop_limit={hop_limit} portnum={tak_portnum} interface_type={type(mesh_interface).__name__}")
    _tak_log(f"SEND_XML_PREVIEW {cot_xml[:200]}")
    if len(compressed) <= 231:
        try:
            mesh_interface.sendData(
                compressed,
                destinationId=destination_id,
                portNum=tak_portnum,
                wantAck=False,
                channelIndex=channel_index,
                hopLimit=hop_limit,
            )
            _tak_log(f"SEND_DIRECT_OK compressed_bytes={len(compressed)}")
        except Exception as exc:
            _tak_log(f"SEND_DIRECT_ERROR {exc}\n{traceback.format_exc()}")
            raise
        return {"mode": "direct", "compressedBytes": len(compressed), "blocksSent": 1, "transferId": None}

    data_with_type = bytes([TRANSFER_TYPE_COT]) + compressed
    transfer_id = generate_transfer_id(local_sender_id)
    source_block_count = _fountain_codec.get_source_block_count(len(data_with_type))
    blocks_to_send = _fountain_codec.get_recommended_block_count(
        len(data_with_type),
        adaptive_overhead(source_block_count),
    )
    condition = threading.Condition(_fountain_lock)
    state = SendState(
        transfer_id=transfer_id,
        data_hash=compute_hash(data_with_type),
        source_block_count=source_block_count,
        condition=condition,
    )
    with _fountain_lock:
        _fountain_send_states[transfer_id] = state
    _tak_log(f"SEND_FOUNTAIN_START transfer_id={transfer_id} source_blocks={source_block_count} blocks_to_send={blocks_to_send} total_bytes={len(data_with_type)}")
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
            with _fountain_lock:
                state.ack_received = False
            blocks = _fountain_codec.encode(data_with_type, blocks_to_send, transfer_id)
            _tak_log(f"SEND_FOUNTAIN_ATTEMPT attempt={attempt} blocks={len(blocks)}")
            for i, block in enumerate(blocks):
                packet = DataBlock(
                    transfer_id=transfer_id,
                    seed=block.seed,
                    source_block_count=block.source_block_count,
                    total_length=block.total_length,
                    payload=block.payload,
                ).to_bytes()
                try:
                    mesh_interface.sendData(
                        packet,
                        destinationId=destination_id,
                        portNum=tak_portnum,
                        wantAck=False,
                        channelIndex=channel_index,
                        hopLimit=hop_limit,
                    )
                    _tak_log(f"SEND_FOUNTAIN_BLOCK_OK block={i+1}/{len(blocks)} packet_bytes={len(packet)}")
                except Exception as exc:
                    _tak_log(f"SEND_FOUNTAIN_BLOCK_ERROR block={i+1}/{len(blocks)} {exc}\n{traceback.format_exc()}")
                    raise
                time.sleep(inter_packet_delay)
            timeout = min(300.0, (10000 + blocks_to_send * per_packet_time_ms * 2 + per_packet_time_ms * 4) / 1000.0)
            _tak_log(f"SEND_FOUNTAIN_WAIT_ACK timeout={timeout:.1f}s")
            with _fountain_lock:
                state.condition.wait_for(lambda: state.ack_received or state.is_complete, timeout=timeout)
                if state.is_complete:
                    _tak_log(f"SEND_FOUNTAIN_ACK_COMPLETE transfer_id={transfer_id}")
                    return {
                        "mode": "fountain",
                        "compressedBytes": len(compressed),
                        "blocksSent": blocks_to_send,
                        "transferId": transfer_id,
                    }
                if state.need_more_blocks > 0:
                    _tak_log(f"SEND_FOUNTAIN_NEED_MORE need={state.need_more_blocks}")
                    blocks_to_send = state.need_more_blocks
                    state.need_more_blocks = 0
                else:
                    blocks_to_send = max(5, source_block_count // 5)
                    _tak_log(f"SEND_FOUNTAIN_TIMEOUT_RETRY blocks_to_send={blocks_to_send}")
        _tak_log(f"SEND_FOUNTAIN_UNCONFIRMED transfer_id={transfer_id} all_attempts_done")
        return {
            "mode": "fountain-unconfirmed",
            "compressedBytes": len(compressed),
            "blocksSent": blocks_to_send,
            "transferId": transfer_id,
        }
    finally:
        with _fountain_lock:
            _fountain_send_states.pop(transfer_id, None)


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


def describe_serial_port(port: Any) -> dict[str, Any]:
    return {
        "device": str(getattr(port, "device", "") or ""),
        "name": repair_text(getattr(port, "name", "") or ""),
        "description": repair_text(getattr(port, "description", "") or ""),
        "manufacturer": repair_text(getattr(port, "manufacturer", "") or ""),
        "product": repair_text(getattr(port, "product", "") or ""),
        "serialNumber": repair_text(getattr(port, "serial_number", "") or ""),
        "location": repair_text(getattr(port, "location", "") or ""),
        "interface": repair_text(getattr(port, "interface", "") or ""),
        "hwid": repair_text(getattr(port, "hwid", "") or ""),
        "vid": getattr(port, "vid", None),
        "pid": getattr(port, "pid", None),
    }


def list_serial_ports() -> list[dict[str, Any]]:
    try:
        from serial.tools import list_ports  # type: ignore
    except Exception:
        return []
    return [describe_serial_port(port) for port in list_ports.comports()]


def looks_like_meshtastic_port(port: dict[str, Any]) -> bool:
    combined = " ".join(
        str(port.get(key, "") or "")
        for key in ("description", "manufacturer", "product", "hwid", "device")
    ).lower()
    keywords = (
        "meshtastic",
        "heltec",
        "rak",
        "lora",
        "nrf",
        "cp210",
        "ch340",
        "usb serial",
        "uart",
        "silicon labs",
        "wch",
    )
    return any(keyword in combined for keyword in keywords)


def detect_port_candidates(find_ports: Any) -> tuple[list[str], list[dict[str, Any]], list[str]]:
    detected_ports: list[str] = []
    try:
        detected_ports = [str(port) for port in (find_ports(True) or []) if port]
    except Exception:
        detected_ports = []

    available_ports = list_serial_ports()
    fallback_ports: list[str] = []
    for port in available_ports:
        device = str(port.get("device") or "")
        if not device or device in detected_ports:
            continue
        if looks_like_meshtastic_port(port):
            fallback_ports.append(device)

    return detected_ports, available_ports, fallback_ports


def snapshot_nodes(interface: Any) -> list[dict[str, Any]]:
    nodes: list[dict[str, Any]] = []
    raw_nodes = getattr(interface, "nodes", {}) or {}
    local_node_num = str(
        getattr(getattr(interface, "localNode", None), "nodeNum", None)
        or getattr(getattr(interface, "myInfo", None), "myNodeNum", None)
        or ""
    )
    local_modem_preset = ""
    try:
        from meshtastic.protobuf import config_pb2  # type: ignore

        local_lora = getattr(getattr(getattr(interface, "localNode", None), "localConfig", None), "lora", None)
        preset_value = getattr(local_lora, "modem_preset", None)
        if preset_value is not None:
            local_modem_preset = str(config_pb2.Config.LoRaConfig.ModemPreset.Name(int(preset_value)) or "")
    except Exception:
        local_modem_preset = ""
    for node_id, node in raw_nodes.items():
        user = node.get("user", {}) or {}
        position = node.get("position", {}) or {}
        metrics = node.get("deviceMetrics", {}) or {}
        environment = node.get("environmentMetrics", {}) or {}
        neighbor_info = node.get("neighborInfo", {}) or {}
        neighbors = [
            {"nodeId": str(int(n.get("nodeId") or 0)), "snr": n.get("snr")}
            for n in (neighbor_info.get("neighbors") or [])
            if n.get("nodeId")
        ]
        nodes.append(
            {
                "id": str(node.get("num") or node_id or user.get("id") or "unknown"),
                "userId": str(user.get("id") or ""),
                "shortName": repair_text(user.get("shortName") or ""),
                "longName": repair_text(user.get("longName") or ""),
                "hardware": str(user.get("hwModel") or ""),
                "meshtasticRole": str(user.get("role") or ""),
                "lastHeard": node.get("lastHeard"),
                "snr": node.get("snr"),
                "hopsAway": node.get("hopsAway"),
                "batteryLevel": metrics.get("batteryLevel"),
                "voltage": metrics.get("voltage"),
                "latitude": position.get("latitude"),
                "longitude": position.get("longitude"),
                "modemPreset": local_modem_preset if str(node.get("num") or node_id or "") == local_node_num else "",
                "environmentMetrics": environment,
                "neighbors": neighbors,
                "raw": sanitize_for_json(node),
            }
        )
    return nodes


def main() -> int:
    try:
        from pubsub import pub  # type: ignore
        from meshtastic.serial_interface import SerialInterface  # type: ignore
        from meshtastic.util import findPorts  # type: ignore
    except Exception as exc:
        emit("status", {"connected": False, "mode": "error", "error": f"bridge import failed: {exc}"})
        return 1

    if "--list-ports" in sys.argv[1:]:
        detected_ports, available_ports, fallback_ports = detect_port_candidates(findPorts)
        sys.stdout.write(
            json.dumps(
                {
                    "ports": available_ports,
                    "detectedPorts": detected_ports,
                    "fallbackPorts": fallback_ports,
                },
                ensure_ascii=True,
            )
            + "\n"
        )
        sys.stdout.flush()
        return 0

    requested_port = os.getenv("MESHTASTIC_PORT") or None
    port = requested_port
    detected_ports: list[str] = []
    available_ports: list[dict[str, Any]] = []
    fallback_ports: list[str] = []

    if not port:
        try:
            detected_ports, available_ports, fallback_ports = detect_port_candidates(findPorts)
        except Exception as exc:
            emit("status", {"connected": False, "mode": "error", "error": f"port detection failed: {exc}"})
            return 1

        if detected_ports:
            port = detected_ports[0]
        elif len(fallback_ports) == 1:
            port = fallback_ports[0]
        elif len(available_ports) == 1:
            port = str(available_ports[0].get("device") or "")

        if not port:
            emit(
                "status",
                {
                    "connected": False,
                    "mode": "error",
                    "error": "no Meshtastic serial ports detected",
                    "port": None,
                    "detectedPorts": detected_ports,
                    "fallbackPorts": fallback_ports,
                    "availablePorts": available_ports,
                },
            )
            return 1

        emit(
            "status",
            {
                "connected": False,
                "mode": "detecting",
                "port": port,
                "detectedPorts": detected_ports,
                "fallbackPorts": fallback_ports,
                "availablePorts": available_ports,
                "warning": (
                    None
                    if len(detected_ports) == 1
                    else (
                        f"multiple ports detected, auto-selecting {port}"
                        if detected_ports
                        else f"Meshtastic auto-detect missed the device, trying fallback port {port}"
                    )
                ),
            },
        )

    try:
        interface = SerialInterface(devPath=port, timeout=8)
    except Exception as exc:
        emit(
            "status",
            {
                "connected": False,
                "mode": "error",
                "error": f"serial connect failed: {exc}",
                "port": port,
                "detectedPorts": detected_ports,
                "fallbackPorts": fallback_ports,
                "availablePorts": available_ports,
            },
        )
        return 1

    emit(
        "status",
        {
            "connected": True,
            "mode": "serial",
            "port": port,
            "detectedPorts": detected_ports if detected_ports else [port],
            "fallbackPorts": fallback_ports,
            "availablePorts": available_ports,
            "source": "env" if requested_port else "auto",
            "localNodeId": str(
                getattr(getattr(interface, "localNode", None), "nodeNum", None)
                or getattr(getattr(interface, "myInfo", None), "myNodeNum", None)
                or ""
            ),
        },
    )
    emit("nodes", {"nodes": snapshot_nodes(interface)})
    mesh_interface = interface

    def on_receive(packet: dict[str, Any], interface: Any | None = None, topic: Any | None = None, **kwargs: Any) -> None:
        decoded = packet.get("decoded", {})
        text = decoded.get("text")
        telemetry = decoded.get("telemetry")
        portnum = str(decoded.get("portnum") or "")
        channel_index = _resolve_channel_index(packet, decoded)
        sender = str(packet.get("fromId") or packet.get("from") or "unknown")
        recipient = str(packet.get("toId") or packet.get("to") or "local-ai")
        to_id = str(packet.get("toId") or "")
        is_direct_message = to_id not in ("", "^all")
        active_interface = interface or kwargs.get("interface") or mesh_interface
        emit("nodes", {"nodes": snapshot_nodes(active_interface)})
        relay_node = packet.get("relayNode") or None
        hop_start = packet.get("hopStart")
        hop_limit = packet.get("hopLimit")
        rx_snr = packet.get("rxSnr")
        emit(
            "packet",
            {
                "sender": sender,
                "recipient": recipient,
                "transport": "serial",
                "isDirectMessage": is_direct_message,
                "portnum": portnum,
                "relayNode": relay_node,
                "hopStart": hop_start,
                "hopLimit": hop_limit,
                "rxSnr": rx_snr,
                "channelIndex": channel_index,
                "decoded": sanitize_for_json(decoded),
                "packet": sanitize_for_json(packet),
            },
        )
        if portnum == "ROUTING_APP":
            request_id = decoded.get("requestId")
            if request_id is not None:
                routing = decoded.get("routing", {})
                error_reason = str(routing.get("errorReason") or "NONE")
                emit("ack", {
                    "packetId": request_id,
                    "errorReason": error_reason,
                    "from": sender,
                })
            return
        # portNum 72 (ATAK_PLUGIN): PLI / GeoChat wrapped in TAKPacket protobuf
        # portNum 257 (ATAK_FORWARDER): zlib-compressed CoT XML for map items (waypoints, routes, polygons)
        if portnum in ("TAK_APP", "ATAK_PLUGIN"):
            raw_payload = _extract_payload_bytes(decoded.get("payload"))
            dump_path = _dump_tak_plugin_payload(
                sender,
                raw_payload or b"",
                channel_index,
                hop_limit if isinstance(hop_limit, int) else None,
            ) if raw_payload else ""
            emit("tak_debug", {
                "direction": "rx",
                "sender": sender,
                "recipient": recipient,
                "portnum": portnum,
                "channelIndex": channel_index,
                "hopLimit": hop_limit if isinstance(hop_limit, int) else None,
                "payloadBytes": len(raw_payload or b""),
                "note": f"ATAK_PLUGIN received; raw dump={dump_path}" if dump_path else "ATAK_PLUGIN received; this bridge does not decode TAKPacket protobuf yet",
            })
            return
        if portnum in ("ATAK_FORWARDER", "ATAK_FORWARDER_APP"):
            raw_payload = _extract_payload_bytes(decoded.get("payload"))
            if raw_payload is None:
                emit("tak_debug", {
                    "direction": "rx",
                    "sender": sender,
                    "recipient": recipient,
                    "portnum": portnum,
                    "channelIndex": channel_index,
                    "hopLimit": hop_limit if isinstance(hop_limit, int) else None,
                    "payloadBytes": 0,
                    "decode": "no-payload",
                    "note": "ATAK_FORWARDER payload missing or unsupported format",
                })
                return
            packet_type = get_packet_type(raw_payload)
            if is_fountain_packet(raw_payload) and packet_type in (TYPE_COMPLETE, TYPE_NEED_MORE):
                emit("tak_debug", {
                    "direction": "rx",
                    "sender": sender,
                    "recipient": recipient,
                    "portnum": portnum,
                    "channelIndex": channel_index,
                    "hopLimit": hop_limit if isinstance(hop_limit, int) else None,
                    "payloadBytes": len(raw_payload),
                    "decode": "fountain-ack",
                })
                _handle_fountain_ack(raw_payload)
                return
            if is_fountain_packet(raw_payload):
                cot_xml = _handle_fountain_data(
                    raw_payload,
                    sender,
                    channel_index,
                    hop_limit if isinstance(hop_limit, int) else None,
                    mesh_interface,
                    257,
                )
                decode_mode = "fountain"
            else:
                cot_xml = _tak_decompress(raw_payload)
                if cot_xml:
                    try:
                        if zlib.decompress(raw_payload).decode("utf-8"):
                            decode_mode = "zlib"
                        else:
                            decode_mode = "xml"
                    except Exception:
                        try:
                            if zlib.decompress(raw_payload, -zlib.MAX_WBITS).decode("utf-8"):
                                decode_mode = "raw-deflate"
                            else:
                                decode_mode = "xml"
                        except Exception:
                            decode_mode = "xml" if cot_xml.lstrip().startswith("<") else "unknown"
                else:
                    decode_mode = "failed"
            emit("tak_debug", {
                "direction": "rx",
                "sender": sender,
                "recipient": recipient,
                "portnum": portnum,
                "channelIndex": channel_index,
                "hopLimit": hop_limit if isinstance(hop_limit, int) else None,
                "payloadBytes": len(raw_payload),
                "decode": decode_mode,
                "xmlBytes": len(cot_xml.encode("utf-8")) if cot_xml else 0,
            })
            if cot_xml:
                emit("tak", {"sender": sender, "cotXml": cot_xml})
            return
        if telemetry or portnum == "TELEMETRY_APP":
            emit(
                "telemetry",
                {
                    "sender": sender,
                    "recipient": recipient,
                    "transport": "serial",
                    "isDirectMessage": is_direct_message,
                    "portnum": portnum,
                    "telemetry": sanitize_for_json(telemetry or decoded),
                    "packet": sanitize_for_json(packet),
                },
            )
        if not text:
            return
        emit(
            "inbound",
            {
                "sender": sender,
                "recipient": recipient,
                "text": repair_text(text),
                "transport": "serial",
                "isDirectMessage": is_direct_message,
                "channelIndex": channel_index,
            },
        )

    pub.subscribe(on_receive, "meshtastic.receive")

    def stdin_loop() -> None:
        for raw in sys.stdin:
            raw = raw.strip()
            if not raw:
                continue
            try:
                message = json.loads(raw)
            except json.JSONDecodeError:
                emit("error", {"message": "invalid json from stdin"})
                continue
            if message.get("type") == "refresh_nodes":
                emit("nodes", {"nodes": snapshot_nodes(interface)})
                continue
            if message.get("type") == "request_position":
                payload = message.get("payload", {})
                dest_id = str(payload.get("destinationId", ""))
                try:
                    if hasattr(mesh_interface, "requestPosition"):
                        mesh_interface.requestPosition(dest_id)
                    else:
                        from meshtastic import portnums_pb2  # type: ignore
                        mesh_interface.sendData(
                            b"",
                            destinationId=dest_id,
                            portNum=portnums_pb2.PortNum.Value("POSITION_APP"),
                            wantAck=False,
                            wantResponse=True,
                        )
                    emit("position_requested", {"destinationId": dest_id})
                except Exception as exc:
                    emit("error", {"message": f"position request failed: {exc}"})
                continue
            if message.get("type") == "set_device_meta":
                payload = message.get("payload", {})
                try:
                    from meshtastic.protobuf import config_pb2  # type: ignore

                    long_name = payload.get("longName")
                    short_name = payload.get("shortName")
                    if long_name is not None or short_name is not None:
                        mesh_interface.localNode.setOwner(
                            long_name=long_name if long_name is not None else None,
                            short_name=short_name if short_name is not None else None,
                        )
                    lat = payload.get("latitude")
                    lon = payload.get("longitude")
                    if lat is not None and lon is not None:
                        mesh_interface.localNode.setPosition(float(lat), float(lon), 0)
                    modem_preset = str(payload.get("modemPreset") or "").strip().upper()
                    if modem_preset:
                        local_node = mesh_interface.localNode
                        if len(local_node.localConfig.ListFields()) == 0:
                            local_node.requestConfig(local_node.localConfig.DESCRIPTOR.fields_by_name.get("lora"))
                        local_node.localConfig.lora.modem_preset = config_pb2.Config.LoRaConfig.ModemPreset.Value(modem_preset)
                        local_node.writeConfig("lora")
                    emit("device_meta_saved", {})
                    emit("nodes", {"nodes": snapshot_nodes(mesh_interface)})
                except Exception as exc:
                    emit("error", {"message": f"set_device_meta failed: {exc}"})
                continue
            if message.get("type") == "send_tak":
                payload = message.get("payload", {})
                uid = payload.get("uid", "")
                try:
                    cot_xml = payload.get("cotXml", "")
                    dest_id = str(payload.get("destinationId", "^all"))
                    channel_index = max(0, min(7, int(payload.get("channelIndex", 0) or 0)))
                    hop_limit = payload.get("hopLimit")
                    hop_limit = max(0, min(7, int(hop_limit))) if hop_limit is not None else None
                    _tak_log(f"SEND_TAK_RECEIVED uid={uid} dest={dest_id} channel={channel_index} hop_limit={hop_limit} xml_len={len(cot_xml)}")
                    _tak_log(f"SEND_TAK_INTERFACE mesh_interface={type(mesh_interface).__name__ if mesh_interface else 'None'} connected={getattr(mesh_interface, 'isConnected', None) if mesh_interface else 'N/A'}")
                    try:
                        from meshtastic import portnums_pb2  # type: ignore
                        tak_portnum = portnums_pb2.PortNum.Value("ATAK_FORWARDER")
                    except Exception:
                        tak_portnum = 257
                    _tak_log(f"SEND_TAK_PORTNUM tak_portnum={tak_portnum}")
                    local_sender_num = (
                        getattr(getattr(mesh_interface, "myInfo", None), "my_node_num", None)
                        or getattr(getattr(interface, "myInfo", None), "my_node_num", None)
                    )
                    try:
                        local_sender_id = f"!{int(local_sender_num) & 0xFFFFFFFF:08x}" if local_sender_num is not None else "local"
                    except Exception:
                        local_sender_id = str(local_sender_num or "local")
                    _tak_log(f"SEND_TAK_SENDER local_sender_id={local_sender_id}")
                    compressed = zlib.compress(cot_xml.encode("utf-8"), level=9)
                    if len(compressed) <= 231:
                        send_meta = _send_fountain_transfer(
                            mesh_interface,
                            tak_portnum,
                            dest_id,
                            cot_xml=cot_xml,
                            channel_index=channel_index,
                            hop_limit=hop_limit,
                            local_sender_id=local_sender_id,
                        )
                        emit("tak_debug", {
                            "direction": "tx",
                            "sender": local_sender_id or "local",
                            "recipient": dest_id,
                            "portnum": "ATAK_FORWARDER",
                            "channelIndex": channel_index,
                            "hopLimit": hop_limit,
                            "transport": send_meta.get("mode"),
                            "compressedBytes": send_meta.get("compressedBytes"),
                            "blocksSent": send_meta.get("blocksSent"),
                            "transferId": send_meta.get("transferId"),
                            "uid": uid,
                        })
                        _tak_log(f"SEND_TAK_DONE uid={uid} mode={send_meta.get('mode')} compressed={send_meta.get('compressedBytes')} blocks={send_meta.get('blocksSent')}")
                        emit("tak_sent", {
                            "destinationId": dest_id,
                            "uid": uid,
                            "channelIndex": channel_index,
                            "hopLimit": hop_limit,
                            "transport": send_meta.get("mode"),
                        })
                    else:
                        emit("tak_debug", {
                            "direction": "tx",
                            "sender": local_sender_id or "local",
                            "recipient": dest_id,
                            "portnum": "ATAK_FORWARDER",
                            "channelIndex": channel_index,
                            "hopLimit": hop_limit,
                            "transport": "fountain-start",
                            "compressedBytes": len(compressed),
                            "uid": uid,
                        })

                        def _async_send_tak() -> None:
                            try:
                                send_meta = _send_fountain_transfer(
                                    mesh_interface,
                                    tak_portnum,
                                    dest_id,
                                    cot_xml=cot_xml,
                                    channel_index=channel_index,
                                    hop_limit=hop_limit,
                                    local_sender_id=local_sender_id,
                                )
                                emit("tak_debug", {
                                    "direction": "tx",
                                    "sender": local_sender_id or "local",
                                    "recipient": dest_id,
                                    "portnum": "ATAK_FORWARDER",
                                    "channelIndex": channel_index,
                                    "hopLimit": hop_limit,
                                    "transport": send_meta.get("mode"),
                                    "compressedBytes": send_meta.get("compressedBytes"),
                                    "blocksSent": send_meta.get("blocksSent"),
                                    "transferId": send_meta.get("transferId"),
                                    "uid": uid,
                                })
                                _tak_log(f"SEND_TAK_DONE uid={uid} mode={send_meta.get('mode')} compressed={send_meta.get('compressedBytes')} blocks={send_meta.get('blocksSent')}")
                                emit("tak_sent", {
                                    "destinationId": dest_id,
                                    "uid": uid,
                                    "channelIndex": channel_index,
                                    "hopLimit": hop_limit,
                                    "transport": send_meta.get("mode"),
                                })
                            except Exception as async_exc:
                                _tak_log(f"SEND_TAK_ASYNC_EXCEPTION uid={uid} error={async_exc}\n{traceback.format_exc()}")
                                emit("error", {"message": f"TAK send failed: {async_exc}", "uid": uid})

                        threading.Thread(target=_async_send_tak, daemon=True).start()
                except Exception as exc:
                    _tak_log(f"SEND_TAK_EXCEPTION uid={uid} error={exc}\n{traceback.format_exc()}")
                    emit("error", {"message": f"TAK send failed: {exc}", "uid": uid})
                continue
            if message.get("type") != "send_text":
                continue
            payload = message.get("payload", {})
            try:
                text = payload.get("text", "")
                if payload.get("textBase64"):
                    text = base64.b64decode(str(payload.get("textBase64"))).decode("utf-8")
                text = repair_text(text)
                want_ack = bool(payload.get("wantAck"))
                wait_for_ack = bool(payload.get("waitForAck"))
                retry_count = max(0, int(payload.get("retryOnAckTimeout") or 0))
                retry_delay_ms = max(0, int(payload.get("ackTimeoutRetryDelayMs") or 0))
                channel_index = max(0, min(7, int(payload.get("channelIndex", 0) or 0)))
                packet = None
                acked = None
                attempts = 0
                max_attempts = 1 + (retry_count if want_ack and wait_for_ack else 0)

                for attempt in range(max_attempts):
                    attempts = attempt + 1
                    send_kwargs = {
                        "text": text,
                        "destinationId": str(payload.get("destinationId", "")),
                        "wantAck": want_ack,
                        "channelIndex": channel_index,
                    }
                    try:
                        packet = mesh_interface.sendText(**send_kwargs)
                    except TypeError:
                        # Backward compatibility with older meshtastic python APIs.
                        send_kwargs.pop("channelIndex", None)
                        packet = mesh_interface.sendText(**send_kwargs)
                    if not want_ack or not wait_for_ack:
                        break
                    try:
                        mesh_interface.waitForAckNak()
                        acked = True
                        break
                    except Exception:
                        acked = False
                        if attempt < max_attempts - 1 and retry_delay_ms > 0:
                            time.sleep(retry_delay_ms / 1000)

                if want_ack and wait_for_ack and acked is False:
                    emit(
                        "error",
                        {
                            "message": f"ack timeout for {str(payload.get('destinationId', ''))}",
                            "destinationId": str(payload.get("destinationId", "")),
                            "text": text,
                            "attempts": attempts,
                        },
                    )
                emit(
                    "sent",
                    {
                        "destinationId": str(payload.get("destinationId", "")),
                        "text": text,
                        "transport": "serial",
                        "wantAck": want_ack,
                        "acked": acked,
                        "attempts": attempts,
                        "packetId": getattr(packet, "id", None),
                        "clientMsgId": payload.get("clientMsgId"),
                        "channelIndex": channel_index,
                    },
                )
            except Exception as exc:
                emit("error", {"message": f"send failed: {exc}"})

    thread = threading.Thread(target=stdin_loop, daemon=True)
    thread.start()

    try:
        thread.join()
    except KeyboardInterrupt:
        pass
    finally:
        try:
            interface.close()
        except Exception:
            pass

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
