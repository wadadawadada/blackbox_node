"""MeshCore bridge process.

Speaks the same newline-delimited JSON protocol to server.js as bridge.py
(the Meshtastic bridge) — see bridge_common.py for the shared pieces of
that protocol and the TAK fountain-transfer state machine. server.js does
not know or care which bridge is running; it only understands the
{type, payload} JSON messages documented in bridge_common.py.

Unlike bridge.py, the `meshcore` python package is asyncio-based, so this
whole bridge runs its own asyncio event loop in the main thread and reads
stdin commands from a background thread that hands work back to the loop
via `asyncio.run_coroutine_threadsafe`.

MeshCore has no protobuf portnum registry, no telemetry/position push, and
no LoRa modem-preset/region concept the way Meshtastic does — snapshot_nodes()
below deliberately leaves those fields null/empty rather than inventing
values, and telemetry-dependent slash commands are expected to be rejected
upstream in server.js when this transport is active.
"""

from __future__ import annotations

import asyncio
import base64
import json
import os
import sys
import threading
import time
import zlib
from pathlib import Path
from typing import Any

from bridge_common import (
    TakFountainTransport,
    emit,
    extract_payload_bytes,
    get_packet_type,
    is_fountain_packet,
    make_tak_logger,
    repair_text,
    sanitize_for_json,
    setup_stdio_utf8,
    tak_decompress,
)
from tak_fountain import TYPE_COMPLETE, TYPE_NEED_MORE

setup_stdio_utf8()

_TAK_LOG_PATH = Path.cwd() / "data" / "tak_send_debug.log"
_tak_log = make_tak_logger(_TAK_LOG_PATH)

_tak_debug_dir = Path.cwd() / "data" / "tak_debug"
_tak_plugin_debug_dir = Path.cwd() / "data" / "tak_plugin_debug"
_tak_transport = TakFountainTransport(_tak_log, _tak_debug_dir, _tak_plugin_debug_dir)

# MeshCore has no reserved ATAK portnum; pick a data_type in the app-registered
# range (0x0001-0xFEFF) for our fountain-coded CoT payloads over send_binary_req.
TAK_DATA_TYPE = 0x424C  # "BL" for Blackbox

MAX_DIRECT_TAK_BYTES = 160  # channel/binary datagram payload budget is tighter than Meshtastic's


def _contact_id(contact: dict[str, Any]) -> str:
    """MeshCore addresses contacts by public key, not a numeric node id."""
    pubkey = str(contact.get("public_key") or contact.get("publicKey") or "")
    return pubkey[:12] if pubkey else str(contact.get("adv_name") or contact.get("advName") or "unknown")


def snapshot_nodes(contacts: dict[str, Any]) -> list[dict[str, Any]]:
    nodes: list[dict[str, Any]] = []
    for pubkey, contact in (contacts or {}).items():
        contact = contact or {}
        adv_name = repair_text(contact.get("adv_name") or contact.get("advName") or "")
        pubkey_str = str(contact.get("public_key") or contact.get("publicKey") or pubkey or "")
        nodes.append(
            {
                "id": pubkey_str[:12] if pubkey_str else str(pubkey),
                "userId": pubkey_str,
                "shortName": adv_name[:4] if adv_name else "",
                "longName": adv_name,
                "hardware": "",
                "meshtasticRole": "",
                "lastHeard": contact.get("last_advert") or contact.get("lastAdvert"),
                "snr": None,
                "hopsAway": None,
                "batteryLevel": None,
                "voltage": None,
                "latitude": contact.get("adv_lat") or contact.get("advLat"),
                "longitude": contact.get("adv_lon") or contact.get("advLon"),
                "modemPreset": "",
                "meshHopLimit": None,
                "region": "UNSET",
                "txPower": None,
                "nodeRole": "",
                "environmentMetrics": {},
                "neighbors": [],
                "raw": sanitize_for_json(contact),
            }
        )
    return nodes


class MeshCoreBridge:
    def __init__(self, loop: asyncio.AbstractEventLoop):
        self.loop = loop
        self.meshcore: Any = None
        self.contacts: dict[str, Any] = {}

    async def connect(self) -> None:
        try:
            from meshcore import MeshCore, EventType  # type: ignore
        except Exception as exc:
            emit("status", {"connected": False, "mode": "error", "error": f"bridge import failed: {exc}"})
            raise

        self.EventType = EventType
        transport = (os.getenv("MESHCORE_TRANSPORT") or "serial").strip().lower()
        try:
            if transport == "ble":
                address = os.getenv("MESHCORE_BLE_ADDRESS") or None
                pin = os.getenv("MESHCORE_BLE_PIN") or None
                self.meshcore = await MeshCore.create_ble(address, pin=pin) if pin else await MeshCore.create_ble(address)
                conn_info = {"transport": "ble", "address": address}
            elif transport == "tcp":
                host = os.getenv("MESHCORE_TCP_HOST") or "127.0.0.1"
                port = int(os.getenv("MESHCORE_TCP_PORT") or "4000")
                self.meshcore = await MeshCore.create_tcp(host, port)
                conn_info = {"transport": "tcp", "host": host, "port": port}
            else:
                port = os.getenv("MESHCORE_PORT") or os.getenv("MESHTASTIC_PORT")
                baud = int(os.getenv("MESHCORE_BAUD") or "115200")
                if not port:
                    emit("status", {"connected": False, "mode": "error", "error": "no MeshCore serial port configured"})
                    raise RuntimeError("no MeshCore serial port configured")
                self.meshcore = await MeshCore.create_serial(port, baud)
                conn_info = {"transport": "serial", "port": port}
        except Exception as exc:
            emit("status", {"connected": False, "mode": "error", "error": f"connect failed: {exc}", **{}})
            raise

        emit("status", {"connected": True, "mode": conn_info.get("transport"), **conn_info})

        self.meshcore.subscribe(EventType.CONTACT_MSG_RECV, self._on_contact_msg)
        self.meshcore.subscribe(EventType.CHANNEL_MSG_RECV, self._on_channel_msg)
        self.meshcore.subscribe(EventType.CONTACTS, self._on_contacts_updated)
        self.meshcore.subscribe(EventType.NEW_CONTACT, self._on_contacts_updated)
        self.meshcore.subscribe(EventType.ADVERTISEMENT, self._on_contacts_updated)
        try:
            self.meshcore.subscribe(EventType.DISCONNECTED, self._on_disconnected)
        except Exception:
            pass

        if hasattr(self.meshcore, "start_auto_message_fetching"):
            try:
                await self.meshcore.start_auto_message_fetching()
            except Exception:
                pass

        await self._refresh_contacts()

    async def _refresh_contacts(self) -> None:
        try:
            result = await self.meshcore.commands.get_contacts()
            contacts = getattr(result, "payload", None)
            if isinstance(contacts, dict):
                self.contacts = contacts
                emit("nodes", {"nodes": snapshot_nodes(self.contacts)})
        except Exception as exc:
            emit("error", {"message": f"get_contacts failed: {exc}"})

    async def _on_contacts_updated(self, event: Any) -> None:
        await self._refresh_contacts()

    async def _on_disconnected(self, event: Any) -> None:
        payload = getattr(event, "payload", {}) or {}
        emit("status", {"connected": False, "mode": "error", "error": str(payload.get("reason") or "disconnected")})

    def _find_contact_by_prefix(self, pubkey_prefix: str) -> dict[str, Any] | None:
        for pubkey, contact in self.contacts.items():
            full_key = str((contact or {}).get("public_key") or (contact or {}).get("publicKey") or pubkey or "")
            if full_key.startswith(pubkey_prefix) or str(pubkey).startswith(pubkey_prefix):
                return contact
        return None

    async def _on_contact_msg(self, event: Any) -> None:
        payload = getattr(event, "payload", {}) or {}
        text = payload.get("text")
        pubkey_prefix = str(payload.get("pubkey_prefix") or payload.get("pubkeyPrefix") or "unknown")
        contact = self._find_contact_by_prefix(pubkey_prefix)
        sender = _contact_id(contact) if contact else pubkey_prefix

        data_type = payload.get("data_type") if isinstance(payload.get("data_type"), int) else None
        raw_bytes = extract_payload_bytes(payload.get("data") or payload.get("payload"))
        if data_type == TAK_DATA_TYPE and raw_bytes is not None:
            self._handle_tak_payload(sender, raw_bytes)
            return

        if not text:
            return
        emit(
            "inbound",
            {
                "sender": sender,
                "recipient": "local-ai",
                "text": repair_text(text),
                "transport": "meshcore",
                "isDirectMessage": True,
                "channelIndex": 0,
            },
        )

    async def _on_channel_msg(self, event: Any) -> None:
        payload = getattr(event, "payload", {}) or {}
        text = payload.get("text")
        channel_idx = int(payload.get("channel_idx") or payload.get("channelIdx") or 0)
        if not text:
            return
        emit(
            "inbound",
            {
                "sender": "channel",
                "recipient": "^all",
                "text": repair_text(text),
                "transport": "meshcore",
                "isDirectMessage": False,
                "channelIndex": channel_idx,
            },
        )

    def _handle_tak_payload(self, sender: str, raw_payload: bytes) -> None:
        packet_type = get_packet_type(raw_payload)
        if is_fountain_packet(raw_payload) and packet_type in (TYPE_COMPLETE, TYPE_NEED_MORE):
            emit("tak_debug", {
                "direction": "rx",
                "sender": sender,
                "recipient": "local",
                "channelIndex": 0,
                "hopLimit": None,
                "payloadBytes": len(raw_payload),
                "decode": "fountain-ack",
            })
            _tak_transport.handle_ack(raw_payload)
            return
        if is_fountain_packet(raw_payload):
            cot_xml = _tak_transport.handle_data(
                raw_payload,
                sender,
                0,
                None,
                self._make_tak_send_raw(sender),
            )
        else:
            cot_xml = tak_decompress(raw_payload)
        if cot_xml:
            emit("tak", {"sender": sender, "cotXml": cot_xml})

    def _make_tak_send_raw(self, destination_contact_id: str):
        def _send(payload: bytes) -> None:
            asyncio.run_coroutine_threadsafe(self._send_tak_raw(destination_contact_id, payload), self.loop)

        return _send

    async def _send_tak_raw(self, destination_contact_id: str, payload: bytes) -> None:
        contact = self._find_contact_by_prefix(destination_contact_id)
        if contact is None:
            emit("error", {"message": f"unknown MeshCore contact for TAK send: {destination_contact_id}"})
            return
        try:
            await self.meshcore.commands.send_binary_req(contact, payload)
        except Exception as exc:
            emit("error", {"message": f"TAK raw send failed: {exc}"})

    async def send_text(self, payload: dict[str, Any]) -> None:
        text = payload.get("text", "")
        if payload.get("textBase64"):
            text = base64.b64decode(str(payload.get("textBase64"))).decode("utf-8")
        text = repair_text(text)
        destination_id = str(payload.get("destinationId", ""))
        channel_index = max(0, min(7, int(payload.get("channelIndex", 0) or 0)))

        try:
            if destination_id in ("", "^all"):
                result = await self.meshcore.commands.send_chan_msg(channel_index, text)
            else:
                contact = self._find_contact_by_prefix(destination_id)
                if contact is None:
                    emit("error", {"message": f"unknown MeshCore contact: {destination_id}"})
                    return
                result = await self.meshcore.commands.send_msg(contact, text)
            ok = getattr(result, "type", None) != self.EventType.ERROR
            emit(
                "sent",
                {
                    "destinationId": destination_id,
                    "text": text,
                    "transport": "meshcore",
                    "wantAck": False,
                    "acked": ok,
                    "attempts": 1,
                    "packetId": None,
                    "clientMsgId": payload.get("clientMsgId"),
                    "channelIndex": channel_index,
                },
            )
        except Exception as exc:
            emit("error", {"message": f"send failed: {exc}"})

    async def send_tak(self, payload: dict[str, Any]) -> None:
        uid = payload.get("uid", "")
        cot_xml = payload.get("cotXml", "")
        dest_id = str(payload.get("destinationId", ""))
        contact = self._find_contact_by_prefix(dest_id) if dest_id and dest_id != "^all" else None
        if contact is None:
            emit("error", {"message": "MeshCore TAK send requires a specific contact (broadcast not supported)", "uid": uid})
            return

        def _run_send() -> dict[str, Any]:
            return _tak_transport.send_transfer(
                self._make_tak_send_raw(dest_id),
                cot_xml=cot_xml,
                local_sender_id="meshcore-local",
                max_direct_bytes=MAX_DIRECT_TAK_BYTES,
            )

        try:
            send_meta = await asyncio.to_thread(_run_send)
            emit("tak_sent", {
                "destinationId": dest_id,
                "uid": uid,
                "channelIndex": 0,
                "hopLimit": None,
                "transport": send_meta.get("mode"),
            })
        except Exception as exc:
            emit("error", {"message": f"TAK send failed: {exc}", "uid": uid})

    async def set_device_meta(self, payload: dict[str, Any]) -> None:
        # MeshCore companion protocol does not expose LoRa modem-preset/region/
        # hop-limit/tx-power configuration the way Meshtastic does; only the
        # advertised name is meaningfully portable.
        long_name = payload.get("longName")
        try:
            if long_name and hasattr(self.meshcore.commands, "set_advert_name"):
                await self.meshcore.commands.set_advert_name(str(long_name))
            emit("device_meta_saved", {})
            emit("nodes", {"nodes": snapshot_nodes(self.contacts)})
        except Exception as exc:
            emit("error", {"message": f"set_device_meta failed: {exc}"})

    async def refresh_nodes(self) -> None:
        await self._refresh_contacts()


def _stdin_loop(bridge: MeshCoreBridge, loop: asyncio.AbstractEventLoop) -> None:
    for raw in sys.stdin:
        raw = raw.strip()
        if not raw:
            continue
        try:
            message = json.loads(raw)
        except json.JSONDecodeError:
            emit("error", {"message": "invalid json from stdin"})
            continue

        msg_type = message.get("type")
        payload = message.get("payload", {})

        if msg_type == "refresh_nodes":
            asyncio.run_coroutine_threadsafe(bridge.refresh_nodes(), loop)
        elif msg_type == "send_text":
            asyncio.run_coroutine_threadsafe(bridge.send_text(payload), loop)
        elif msg_type == "send_tak":
            asyncio.run_coroutine_threadsafe(bridge.send_tak(payload), loop)
        elif msg_type == "set_device_meta":
            asyncio.run_coroutine_threadsafe(bridge.set_device_meta(payload), loop)
        elif msg_type in ("request_position", "reset_node_db"):
            # No MeshCore equivalent: position pull and remote node-db reset
            # are not part of the companion protocol.
            emit("error", {"message": f"{msg_type} is not supported on the MeshCore transport"})
        # unknown message types are ignored, matching bridge.py's behavior


async def _main_async() -> int:
    loop = asyncio.get_running_loop()
    bridge = MeshCoreBridge(loop)
    try:
        await bridge.connect()
    except Exception:
        return 1

    emit("nodes", {"nodes": snapshot_nodes(bridge.contacts)})

    stdin_thread = threading.Thread(target=_stdin_loop, args=(bridge, loop), daemon=True)
    stdin_thread.start()

    try:
        while stdin_thread.is_alive():
            await asyncio.sleep(0.5)
    except KeyboardInterrupt:
        pass
    finally:
        try:
            await bridge.meshcore.disconnect()
        except Exception:
            pass

    return 0


def main() -> int:
    if "--list-ports" in sys.argv[1:]:
        try:
            from serial.tools import list_ports  # type: ignore
        except Exception:
            sys.stdout.write(json.dumps({"ports": [], "detectedPorts": [], "fallbackPorts": []}) + "\n")
            return 0
        ports = [
            {
                "device": str(getattr(p, "device", "") or ""),
                "description": repair_text(getattr(p, "description", "") or ""),
                "manufacturer": repair_text(getattr(p, "manufacturer", "") or ""),
            }
            for p in list_ports.comports()
        ]
        sys.stdout.write(json.dumps({"ports": ports, "detectedPorts": [], "fallbackPorts": [p["device"] for p in ports]}) + "\n")
        sys.stdout.flush()
        return 0

    return asyncio.run(_main_async())


if __name__ == "__main__":
    raise SystemExit(main())
