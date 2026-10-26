from __future__ import annotations

import base64
import json
import os
import sys
import threading
import time
import traceback
import zlib
from pathlib import Path
from typing import Any

from bridge_common import (
    TakFountainTransport,
    dump_tak_plugin_payload,
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

_TAK_LOG_PATH = Path.cwd() / "data" / "tak_send_debug.log"
_tak_log = make_tak_logger(_TAK_LOG_PATH)

_tak_debug_dir = Path.cwd() / "data" / "tak_debug"
_tak_plugin_debug_dir = Path.cwd() / "data" / "tak_plugin_debug"
_tak_transport = TakFountainTransport(_tak_log, _tak_debug_dir, _tak_plugin_debug_dir)


def _resolve_channel_index(packet: dict[str, Any], decoded: dict[str, Any]) -> int:
    for key in ("channel", "channelIndex"):
        value = packet.get(key)
        if isinstance(value, int):
            return value
        value = decoded.get(key)
        if isinstance(value, int):
            return value
    return 0


def _dump_tak_plugin_payload(sender: str, raw_payload: bytes, channel_index: int | None, hop_limit: int | None) -> str:
    return dump_tak_plugin_payload(_tak_plugin_debug_dir, sender, raw_payload, channel_index, hop_limit)


def _meshtastic_send_raw(mesh_interface: Any, tak_portnum: int, destination_id: str, channel_index: int, hop_limit: int | None):
    def _send(payload: bytes) -> None:
        mesh_interface.sendData(
            payload,
            destinationId=destination_id,
            portNum=tak_portnum,
            wantAck=False,
            channelIndex=channel_index,
            hopLimit=hop_limit,
        )

    return _send


setup_stdio_utf8()


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
    local_mesh_hop_limit = None
    local_region = "UNSET"
    local_tx_power = None
    local_node_role = "CLIENT"
    try:
        from meshtastic.protobuf import config_pb2  # type: ignore

        local_lora = getattr(getattr(getattr(interface, "localNode", None), "localConfig", None), "lora", None)
        preset_value = getattr(local_lora, "modem_preset", None)
        if preset_value is not None:
            local_modem_preset = str(config_pb2.Config.LoRaConfig.ModemPreset.Name(int(preset_value)) or "")
        raw_hop = getattr(local_lora, "hop_limit", None)
        if raw_hop is not None:
            local_mesh_hop_limit = int(raw_hop)
        region_value = getattr(local_lora, "region", None)
        if region_value is not None:
            local_region = str(config_pb2.Config.LoRaConfig.RegionCode.Name(int(region_value)) or "UNSET")
        raw_tx = getattr(local_lora, "tx_power", None)
        if raw_tx is not None:
            local_tx_power = int(raw_tx)
        local_device = getattr(getattr(getattr(interface, "localNode", None), "localConfig", None), "device", None)
        role_value = getattr(local_device, "role", None)
        if role_value is not None:
            local_node_role = str(config_pb2.Config.DeviceConfig.Role.Name(int(role_value)) or "CLIENT")
    except Exception:
        local_modem_preset = ""
        local_mesh_hop_limit = None
        local_region = "UNSET"
        local_tx_power = None
        local_node_role = "CLIENT"
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
                "meshHopLimit": local_mesh_hop_limit if str(node.get("num") or node_id or "") == local_node_num else None,
                "region": local_region if str(node.get("num") or node_id or "") == local_node_num else "UNSET",
                "txPower": local_tx_power if str(node.get("num") or node_id or "") == local_node_num else None,
                "nodeRole": local_node_role if str(node.get("num") or node_id or "") == local_node_num else "",
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
            raw_payload = extract_payload_bytes(decoded.get("payload"))
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
            raw_payload = extract_payload_bytes(decoded.get("payload"))
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
                _tak_transport.handle_ack(raw_payload)
                return
            if is_fountain_packet(raw_payload):
                cot_xml = _tak_transport.handle_data(
                    raw_payload,
                    sender,
                    channel_index,
                    hop_limit if isinstance(hop_limit, int) else None,
                    _meshtastic_send_raw(mesh_interface, 257, sender, channel_index, hop_limit if isinstance(hop_limit, int) else None),
                )
                decode_mode = "fountain"
            else:
                cot_xml = tak_decompress(raw_payload)
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
                    mesh_hop_limit = payload.get("meshHopLimit")
                    region = str(payload.get("region") or "").strip().upper()
                    tx_power = payload.get("txPower")
                    local_node = mesh_interface.localNode
                    if modem_preset or mesh_hop_limit is not None or region or tx_power is not None:
                        if len(local_node.localConfig.ListFields()) == 0:
                            local_node.requestConfig(local_node.localConfig.DESCRIPTOR.fields_by_name.get("lora"))
                        if modem_preset:
                            local_node.localConfig.lora.modem_preset = config_pb2.Config.LoRaConfig.ModemPreset.Value(modem_preset)
                        if mesh_hop_limit is not None:
                            local_node.localConfig.lora.hop_limit = max(0, min(7, int(mesh_hop_limit)))
                        if region and region != "UNSET":
                            local_node.localConfig.lora.region = config_pb2.Config.LoRaConfig.RegionCode.Value(region)
                        if tx_power is not None:
                            local_node.localConfig.lora.tx_power = max(0, min(30, int(tx_power)))
                        local_node.writeConfig("lora")
                    node_role = str(payload.get("nodeRole") or "").strip().upper()
                    if node_role:
                        if len(local_node.localConfig.ListFields()) == 0:
                            local_node.requestConfig(local_node.localConfig.DESCRIPTOR.fields_by_name.get("device"))
                        local_node.localConfig.device.role = config_pb2.Config.DeviceConfig.Role.Value(node_role)
                        local_node.writeConfig("device")
                    emit("device_meta_saved", {})
                    emit("nodes", {"nodes": snapshot_nodes(mesh_interface)})
                except Exception as exc:
                    emit("error", {"message": f"set_device_meta failed: {exc}"})
                continue
            if message.get("type") == "reset_node_db":
                try:
                    mesh_interface.localNode.resetNodeDb()
                    emit("node_db_reset", {})
                except Exception as exc:
                    emit("error", {"message": f"reset_node_db failed: {exc}"})
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
                        send_meta = _tak_transport.send_transfer(
                            _meshtastic_send_raw(mesh_interface, tak_portnum, dest_id, channel_index, hop_limit),
                            cot_xml=cot_xml,
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
                                send_meta = _tak_transport.send_transfer(
                                    _meshtastic_send_raw(mesh_interface, tak_portnum, dest_id, channel_index, hop_limit),
                                    cot_xml=cot_xml,
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
