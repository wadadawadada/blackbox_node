from __future__ import annotations

import json
import os
import sys
import threading
import base64
import time
from typing import Any


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
                "decoded": sanitize_for_json(decoded),
                "packet": sanitize_for_json(packet),
            },
        )
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
                    emit("device_meta_saved", {})
                    emit("nodes", {"nodes": snapshot_nodes(mesh_interface)})
                except Exception as exc:
                    emit("error", {"message": f"set_device_meta failed: {exc}"})
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
                packet = None
                acked = None
                attempts = 0
                max_attempts = 1 + (retry_count if want_ack and wait_for_ack else 0)

                for attempt in range(max_attempts):
                    attempts = attempt + 1
                    packet = mesh_interface.sendText(
                        text=text,
                        destinationId=str(payload.get("destinationId", "")),
                        wantAck=want_ack,
                    )
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
