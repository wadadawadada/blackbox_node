# BLACKBOX NODE

> **Built for when the internet is gone.**

Power outages, blackouts, infrastructure failures, or simply living off-grid — Blackbox Node keeps communication, AI assistance, and basic economic infrastructure running without a cloud, without a server, without a cell tower.

It combines a fully local AI (runs on your machine, no internet required) with [Meshtastic](https://meshtastic.org/) — an open-source, long-range radio mesh network built on **LoRa** technology. The result is a self-contained node that can think, talk over radio, and move money when nothing else works.

---

## What is Meshtastic and LoRa?

[Meshtastic](https://meshtastic.org/) is a free, open-source project that lets inexpensive hardware form a decentralized mesh radio network. Nodes communicate with each other directly over radio, routing messages hop by hop through the mesh without any internet or cellular infrastructure.

The radios use **LoRa** (Long Range) — a spread-spectrum radio modulation that can reach **5–15+ km** in open terrain on a single battery charge. Every node is both a receiver and a repeater. The more nodes in an area, the more resilient and wide-reaching the network becomes.

Popular hardware you can use with Meshtastic:
- [Heltec LoRa 32](https://heltec.org/project/wifi-lora-32-v3/) — compact ESP32-based module, great starter device
- [LILYGO T-Beam](https://www.lilygo.cc/products/t-beam-v1-1-esp32-lora) — built-in GPS, battery management, great for portable nodes
- [RAK WisBlock](https://store.rakwireless.com/collections/wisblock-core) — modular system, highly configurable
- [Seeed SenseCAP T1000](https://www.seeedstudio.com/SenseCAP-Card-Tracker-T1000-A-p-5697.html) — card-sized GPS tracker form factor

These devices typically cost $20–$60 and run for days on a small battery or indefinitely on solar.

---

## What Blackbox Node does

### Local offline AI
Runs a quantized LLM entirely on your machine via `llama.cpp`. No API keys, no cloud calls, no internet required during normal operation. You choose which model to load — from tiny 0.5B models for weak hardware up to 3B+ for better responses.

### AI over the mesh
Other Meshtastic nodes in range can query your AI by radio. Send `@bot your question` or `!ask your question` from any Meshtastic device and the response comes back over the air. The mesh becomes a shared intelligence layer for everyone in range.

### Communication
All inbound and outbound Meshtastic messages are tracked and displayed in the web UI. Node positions, telemetry, battery levels, and environment readings are recorded and browsable. Direct messages and channel broadcasts are both supported.

![Chat and message log](static/img/chat.png)

### Off-grid payments
Blackbox Node includes a built-in **Bitcoin wallet** (on-chain, BIP-39/HD) and a **Cashu ecash wallet** for Lightning-compatible off-grid transactions.

[Cashu](https://cashu.space) tokens are bearer instruments — self-contained strings of value that can be copied and pasted like text. This means payments can be sent over Meshtastic radio as plain text messages: no internet, no payment processors, just radio waves. When connectivity returns, tokens can be melted back to Lightning or held as ecash.

This makes it possible to run basic economic activity — tipping, paying for services, splitting resources — entirely over a radio mesh network.

![Wallet](static/img/wallet.png)

---

## Two modes

| Mode | What it needs |
|---|---|
| **Local offline AI only** | A machine running Node.js and Python, a GGUF model file. No radio, no internet. |
| **Full off-grid mesh node** | Same as above, plus a Meshtastic device connected by USB serial. |

The app starts in whatever mode it can. Radio features stay inactive until a device is found.

---

## Installation

### Fast path

The normal install flow is:

```bat
npm install
npm start
```

During `npm install`, the project bootstraps the local AI runtime automatically:
- installs JavaScript dependencies
- downloads a Windows `llama.cpp` runtime into `./llama/` if missing
- downloads a starter GGUF model into `./models/` if missing
- attempts to install the Meshtastic Python package into `./pydeps/` if Python is available

That is enough for the web UI and local AI to start on a clean machine.

### 1. Prerequisites

Install these before anything else:

- **[Node.js 18+](https://nodejs.org/)** — the main runtime
- **[Python 3.11+](https://www.python.org/downloads/)** — for the Meshtastic radio bridge

Verify both are available:
```bat
node --version
python --version
```

### 2. Clone and install Node dependencies

```bat
git clone https://github.com/wadadawadada/blackbox_node.git
cd blackbox_node
npm install
```

This creates `node_modules/` and runs the bootstrap installer for the local AI runtime.

### 3. Set up llama.cpp (manual fallback only)

Skip this step unless automatic bootstrap failed or you want to replace the runtime manually.

Otherwise, the `llama/` folder must contain `llama-server.exe` and its companion DLLs. Download a prebuilt Windows release from the [llama.cpp releases page](https://github.com/ggerganov/llama.cpp/releases) — look for the `win-cuda`, `win-vulkan`, or `win-cpu` zip for your hardware.

Extract `llama-server.exe`, `llama.dll`, and the bundled `ggml*.dll` files into `./llama/`:
```
llama/
  llama-server.exe
  llama.dll
  ggml.dll
  ggml-base.dll
  ggml-cpu.dll      ← older CPU builds
  ggml-cpu-*.dll    ← newer CPU builds may use per-CPU variants instead
  ggml-rpc.dll      ← plus any other ggml-*.dll from the release
```

> **Which build to pick:**
> - No GPU → `llama-b...-bin-win-cpu-x64.zip`
> - NVIDIA GPU → `llama-b...-bin-win-cuda-cu12.x-x64.zip`
> - AMD / Intel GPU → `llama-b...-bin-win-vulkan-x64.zip`

### 4. Download a model (manual fallback only)

Skip this step unless automatic bootstrap failed or you want to add more models manually.

Otherwise, create the `models/` folder and download at least one `.gguf` model file into it.

**Option A — use the built-in model manager** (easiest):
1. Run `npm start`
2. Open `http://127.0.0.1:7860`
3. Go to **Settings → Models** and click **Install** next to any model

![LLM Manager](static/img/llm_manager.png)

**Option B — download manually** (no internet on first run):
```bat
mkdir models
```
Then place any `.gguf` file into `models/`. Recommended starter: `Qwen2.5-3B-Instruct-Q5_K_M.gguf` (~2.3 GB).

### 5. (Optional) Connect a Meshtastic device

Plug in your Meshtastic device via USB before starting. The app auto-detects serial ports and installs Python dependencies automatically on first connect.

No device? The app starts fine — radio features just show as disconnected.

---

## Quick start

```bat
npm install
npm start
```

On launch:
- Web UI opens at `http://127.0.0.1:7860`
- `llama-server.exe` starts from `./llama/` and loads the selected model
- Python Meshtastic bridge (`bridge.py`) connects to a detected serial device
- The installer prepares `./llama/`, `./models/`, and tries to prepare `./pydeps/`

---

## Requirements

| Requirement | Notes |
|---|---|
| Node.js 18+ | Runtime for the web server |
| Python 3.11+ | Required only for Meshtastic radio features |
| Internet during `npm install` | Needed to download `llama.cpp`, a starter model, and optional Python deps |
| `./llama/llama-server.exe` | Auto-downloaded on install if missing |
| At least one `.gguf` in `./models/` | Auto-downloaded on install if missing |
| Meshtastic device on USB serial | Optional — radio features only |

---

## Features

**AI**
- Local LLM via `llama.cpp` — fully offline after model download
- Mesh-triggered queries: `@bot ...` / `!ask ...` from any Meshtastic device
- `!reset` clears per-peer conversation context
- Configurable system prompt, temperature, top-p, and token limits per mode (local / mesh)
- Built-in model manager: download, select, and delete GGUF models from a curated list

**Meshtastic / Radio**
- Auto-detects Meshtastic serial devices on startup
- Inbound message log and node list with telemetry (battery, SNR, position, environment)
- Node detail view with raw packet data
- Weather/environment parsing from telemetry and text broadcasts
- `nodes` / `list nodes` query returns a compact node list over the mesh
- `weather` / `forecast` query returns the latest parsed weather data
- Reconnect and port-selection UI

**Payments**
- Bitcoin HD wallet (BIP-39, on-chain receive)
- Cashu ecash wallet: set a mint, receive/send tokens, melt to Lightning
- Cashu tokens are plain text — transferable over radio or any channel
- Lightning invoice payment via Cashu melt
- QR code generation for Bitcoin addresses and Lightning invoices
- Transaction history

**UI & Storage**
- Dark web UI: message log, node list, local chat, wallet, settings
- All data stored locally in `./data/` (messages, nodes, settings, wallet, Cashu proofs)
- No external databases, no accounts, no telemetry

---

## Defaults

| Setting | Value |
|---|---|
| Web UI | `http://127.0.0.1:7860` |
| LLM backend | `http://127.0.0.1:8080` |
| Starter model installed by bootstrap | `Qwen2.5-0.5B-Instruct-Q3_K_M.gguf` |
| Default model | `Qwen2.5-0.5B-Instruct-Q3_K_M.gguf` |

---

## Notes

- The app runs without a radio — Meshtastic features simply show as disconnected.
- If Python is missing, the web UI and local AI still work, but Meshtastic radio features stay unavailable.
- Automatic bootstrap currently targets Windows for `llama.cpp` runtime download.
- Downloading models or auto-installing Python packages requires internet during `npm install`. Runtime is otherwise fully local.
- Cashu token operations require internet access to reach the mint. Tokens already in your wallet can be held and transferred offline.

---

## Donate

If this project is useful to you, consider supporting development:

| Chain | Address |
|---|---|
| BTC | `bc1p3p87l267hte2dgg60jjt7w9xk8vfcjenr534yya0hedhet4l4fvq2x2svp` |
| XMR | `42SWAqWMKAiAHokhaGjBRUdcdQqvMk3rmBAnnUpPNGhridJKFAknqCQeYnixXhbPtyEHzxBmUkMxAjQtLSQbiVq57Pbvge5` |
| ETH | `0xaA01e4F453d5ae9903EebeABA803f3388D20d024` |
| SOL | `4xgvfwv3TTt1SnavP5okbjBBsfRmoLpdeQKXguVdXheF` |
