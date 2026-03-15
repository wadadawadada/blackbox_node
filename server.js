const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawnSync, spawn } = require("child_process");

const HOST = "127.0.0.1";
const DEFAULT_PORT = 7860;
const parsedPort = Number.parseInt(process.env.PORT || "", 10);
const PORT = Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : DEFAULT_PORT;
const STATIC_DIR = path.join(__dirname, "static");
const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "messages.json");
const NODES_FILE = path.join(DATA_DIR, "nodes.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const WALLET_FILE = path.join(DATA_DIR, "wallet.json");
const CASHU_FILE = path.join(DATA_DIR, "cashu.json");
const PYDEPS_DIR = path.join(__dirname, "pydeps");
const LLAMA_DIR = path.join(__dirname, "llama");
const LLAMA_EXE = path.join(LLAMA_DIR, "llama-server.exe");
const MODELS_DIR = path.join(__dirname, "models");
const LLM_HOST = "127.0.0.1";
const LLM_PORT = 8080;
const LLM_BASE_URL = `http://${LLM_HOST}:${LLM_PORT}`;
const DEFAULT_MODEL_NAME = "Qwen2.5-0.5B-Instruct-Q3_K_M.gguf";
const CURATED_MODELS = [
  {
    id: "qwen25-05b-q3km",
    name: "Qwen2.5 0.5B Instruct Q3_K_M",
    filename: "Qwen2.5-0.5B-Instruct-Q3_K_M.gguf",
    url: "https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q3_k_m.gguf?download=true",
    sizeBytes: 318000000,
    family: "Qwen",
    notes: "Smallest practical Qwen chat option.",
  },
  {
    id: "qwen25-05b-q4km",
    name: "Qwen2.5 0.5B Instruct Q4_K_M",
    filename: "Qwen2.5-0.5B-Instruct-Q4_K_M.gguf",
    url: "https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf?download=true",
    sizeBytes: 397808192,
    family: "Qwen",
    notes: "Fastest small local chat model.",
  },
  {
    id: "qwen25-05b-q5km",
    name: "Qwen2.5 0.5B Instruct Q5_K_M",
    filename: "Qwen2.5-0.5B-Instruct-Q5_K_M.gguf",
    url: "https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q5_k_m.gguf?download=true",
    sizeBytes: 447000000,
    family: "Qwen",
    notes: "Small model with slightly better quality than Q4_K_M.",
  },
  {
    id: "qwen25-15b-q5km",
    name: "Qwen2.5 1.5B Instruct Q5_K_M",
    filename: "Qwen2.5-1.5B-Instruct-Q5_K_M.gguf",
    url: "https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q5_k_m.gguf?download=true",
    sizeBytes: 1270000000,
    family: "Qwen",
    notes: "Balanced small model with better quality than 0.5B.",
  },
  {
    id: "qwen25-15b-q4km",
    name: "Qwen2.5 1.5B Instruct Q4_K_M",
    filename: "Qwen2.5-1.5B-Instruct-Q4_K_M.gguf",
    url: "https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf?download=true",
    sizeBytes: 1010000000,
    family: "Qwen",
    notes: "Smaller disk and RAM footprint than the Q5 build.",
  },
  {
    id: "qwen25-3b-q5km",
    name: "Qwen2.5 3B Instruct Q5_K_M",
    filename: "Qwen2.5-3B-Instruct-Q5_K_M.gguf",
    url: "https://huggingface.co/Qwen/Qwen2.5-3B-Instruct-GGUF/resolve/main/qwen2.5-3b-instruct-q5_k_m.gguf?download=true",
    sizeBytes: 2438740384,
    family: "Qwen",
    notes: "Current recommended general-purpose local model.",
  },
  {
    id: "qwen25-3b-q4km",
    name: "Qwen2.5 3B Instruct Q4_K_M",
    filename: "Qwen2.5-3B-Instruct-Q4_K_M.gguf",
    url: "https://huggingface.co/Qwen/Qwen2.5-3B-Instruct-GGUF/resolve/main/qwen2.5-3b-instruct-q4_k_m.gguf?download=true",
    sizeBytes: 2120000000,
    family: "Qwen",
    notes: "Compact 3B option if Q5 is too heavy.",
  },
  {
    id: "qwen25-coder-05b-q4km",
    name: "Qwen2.5 Coder 0.5B Instruct Q4_K_M",
    filename: "qwen2.5-0.5b-coder-instruct-q4_k_m.gguf",
    url: "https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-coder-instruct-q4_k_m.gguf?download=true",
    sizeBytes: 491000000,
    family: "Qwen Coder",
    notes: "Tiny coding-focused model for weak machines.",
  },
  {
    id: "qwen25-coder-15b-q5km",
    name: "Qwen2.5 Coder 1.5B Instruct Q5_K_M",
    filename: "Qwen2.5-Coder-1.5B-Instruct.Q5_K_M.gguf",
    url: "https://huggingface.co/MaziyarPanahi/Qwen2.5-Coder-1.5B-Instruct-GGUF/resolve/main/Qwen2.5-Coder-1.5B-Instruct.Q5_K_M.gguf?download=true",
    sizeBytes: 1130000000,
    family: "Qwen Coder",
    notes: "Compact coding model with better reasoning than 0.5B.",
  },
  {
    id: "qwen25-coder-3b-q4km",
    name: "Qwen2.5 Coder 3B Instruct Q4_K_M",
    filename: "qwen2.5-3b-coder-instruct-q4_k_m.gguf",
    url: "https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct-GGUF/resolve/main/qwen2.5-3b-coder-instruct-q4_k_m.gguf?download=true",
    sizeBytes: 2100000000,
    family: "Qwen Coder",
    notes: "Better fit for code-heavy local chat and debugging.",
  },
  {
    id: "smollm2-135m-iq4xs",
    name: "SmolLM2 135M Instruct IQ4_XS",
    filename: "SmolLM2-135M-Instruct-IQ4_XS.gguf",
    url: "https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct-GGUF/resolve/main/SmolLM2-135M-Instruct-IQ4_XS.gguf?download=true",
    sizeBytes: 90897760,
    family: "SmolLM",
    notes: "Ultra-small fallback model.",
  },
  {
    id: "smollm2-135m-q3km",
    name: "SmolLM2 135M Instruct Q3_K_M",
    filename: "SmolLM2-135M-Instruct-Q3_K_M.gguf",
    url: "https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct-GGUF/resolve/main/SmolLM2-135M-Instruct-Q3_K_M.gguf?download=true",
    sizeBytes: 94000000,
    family: "SmolLM",
    notes: "Absolute minimum-size chat model in the catalog.",
  },
  {
    id: "smollm2-360m-q4km",
    name: "SmolLM2 360M Instruct Q4_K_M",
    filename: "SmolLM2-360M-Instruct-Q4_K_M.gguf",
    url: "https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct-GGUF/resolve/main/SmolLM2-360M-Instruct-Q4_K_M.gguf?download=true",
    sizeBytes: 244000000,
    family: "SmolLM",
    notes: "Still lightweight, but much more usable than 135M.",
  },
  {
    id: "tinyllama-11b-q4km",
    name: "TinyLlama 1.1B Chat v1.0 Q4_K_M",
    filename: "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf",
    url: "https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf?download=true",
    sizeBytes: 670000000,
    family: "TinyLlama",
    notes: "Very small general chat model that is still reasonably usable.",
  },
  {
    id: "deepseek-coder-13b-q4km",
    name: "DeepSeek Coder 1.3B Instruct Q4_K_M",
    filename: "deepseek-coder-1.3b-instruct.Q4_K_M.gguf",
    url: "https://huggingface.co/TheBloke/deepseek-coder-1.3b-instruct-GGUF/resolve/main/deepseek-coder-1.3b-instruct.Q4_K_M.gguf?download=true",
    sizeBytes: 813000000,
    family: "DeepSeek Coder",
    notes: "Small dedicated code model with solid code completion quality.",
  },
  {
    id: "stable-code-3b-q4km",
    name: "Stable Code 3B Q4_K_M",
    filename: "stable-code-3b.Q4_K_M.gguf",
    url: "https://huggingface.co/TheBloke/stable-code-3b-GGUF/resolve/main/stable-code-3b.Q4_K_M.gguf?download=true",
    sizeBytes: 1710000000,
    family: "Stable Code",
    notes: "Code-specialized 3B model for programming tasks.",
  },
  {
    id: "mistral-7b-v03-q4km",
    name: "Mistral 7B Instruct v0.3 Q4_K_M",
    filename: "mistral-7b-instruct-v0.3.Q4_K_M.gguf",
    url: "https://huggingface.co/SanctumAI/Mistral-7B-Instruct-v0.3-GGUF/resolve/main/mistral-7b-instruct-v0.3.Q4_K_M.gguf?download=true",
    sizeBytes: 4370000000,
    family: "Mistral",
    notes: "Heavier but stronger instruction model.",
  },
  {
    id: "mistral-7b-v03-q5km",
    name: "Mistral 7B Instruct v0.3 Q5_K_M",
    filename: "mistral-7b-instruct-v0.3.Q5_K_M.gguf",
    url: "https://huggingface.co/SanctumAI/Mistral-7B-Instruct-v0.3-GGUF/resolve/main/mistral-7b-instruct-v0.3.Q5_K_M.gguf?download=true",
    sizeBytes: 5140000000,
    family: "Mistral",
    notes: "Higher-quality Mistral build if you can spare the RAM.",
  },
];
const HISTORY_LIMIT = 8;
const RESPONSE_CHAR_LIMIT = 900;
const LOCAL_CHAT_MAX_TOKENS = 384;
const DEFAULT_AI_SETTINGS = Object.freeze({
  sendCustomInstructions: false,
  customInstructions: "",
  localTemperature: 0.1,
  localTopP: 0.7,
  localMaxTokens: LOCAL_CHAT_MAX_TOKENS,
  meshTemperature: 0.1,
  meshTopP: 0.6,
  meshMaxTokens: 120,
});
const MESH_PACKET_MAX_BYTES = 120;
const MESH_PACKET_BATCH_DELAY_MS = 3200;
const MESH_ACK_RETRY_COUNT = 1;
const MESH_ACK_RETRY_DELAY_MS = 1800;
const WEATHER_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const NODE_ONLINE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const MIN_VALID_MODEL_BYTES = 1024 * 1024;

const sessions = new Map();
const clients = new Set();
let nodesRefreshInterval = null;
let messages = [];
let knownNodes = {};
let appSettings = {};
let walletData = null;
let cashuData = { mintUrl: "", proofs: [], pendingInvoices: [], history: [] };
let meshtasticStatus = { connected: false, mode: "starting", error: null };
let currentModelName = DEFAULT_MODEL_NAME;
let llmStatus = { connected: false, mode: "starting", model: currentModelName, error: null, switching: false };
let meshSendQueue = Promise.resolve();
let modelManagerOperation = {
  active: false,
  action: null,
  modelId: null,
  modelName: null,
  error: null,
  progress: 0,
  bytesDownloaded: 0,
  bytesTotal: 0,
};
let modelDownloadAbortController = null;

fs.mkdirSync(DATA_DIR, { recursive: true });
if (fs.existsSync(DB_FILE)) {
  try {
    messages = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  } catch {
    messages = [];
  }
}

if (fs.existsSync(NODES_FILE)) {
  try {
    knownNodes = JSON.parse(fs.readFileSync(NODES_FILE, "utf8"));
  } catch {
    knownNodes = {};
  }
}

if (fs.existsSync(SETTINGS_FILE)) {
  try {
    appSettings = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf8"));
  } catch {
    appSettings = {};
  }
}

if (fs.existsSync(WALLET_FILE)) {
  try {
    walletData = JSON.parse(fs.readFileSync(WALLET_FILE, "utf8"));
  } catch {
    walletData = null;
  }
}

if (fs.existsSync(CASHU_FILE)) {
  try {
    const loaded = JSON.parse(fs.readFileSync(CASHU_FILE, "utf8"));
    cashuData = { mintUrl: "", proofs: [], pendingInvoices: [], history: [], ...loaded };
  } catch { /* keep defaults */ }
}

if (typeof appSettings.lastModelName === "string" && appSettings.lastModelName.trim()) {
  currentModelName = appSettings.lastModelName.trim();
  llmStatus = { ...llmStatus, model: currentModelName };
}

appSettings.aiSettings = normalizeAiSettings(appSettings.aiSettings);

function getConfiguredMeshtasticPort() {
  return typeof appSettings.meshtasticPort === "string" && appSettings.meshtasticPort.trim()
    ? appSettings.meshtasticPort.trim()
    : "";
}

function setConfiguredMeshtasticPort(port) {
  const value = String(port || "").trim();
  if (value) {
    appSettings.meshtasticPort = value;
  } else {
    delete appSettings.meshtasticPort;
  }
  persistSettings();
}

function getMeshtasticStatusPayload(overrides = {}) {
  return {
    ...meshtasticStatus,
    selectedPort: getConfiguredMeshtasticPort() || null,
    ...overrides,
  };
}

function updateMeshtasticStatus(patch = {}, broadcastNow = true) {
  meshtasticStatus = getMeshtasticStatusPayload(patch);
  if (broadcastNow) {
    broadcast("status", { meshtastic: meshtasticStatus });
  }
  return meshtasticStatus;
}

meshtasticStatus = getMeshtasticStatusPayload();

function persistMessages() {
  fs.writeFileSync(DB_FILE, JSON.stringify(messages.slice(-300), null, 2));
}

function persistNodes() {
  fs.writeFileSync(NODES_FILE, JSON.stringify(knownNodes, null, 2));
}

function persistSettings() {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(appSettings, null, 2));
}

// ─── Wallet ──────────────────────────────────────────────────────────────────

function persistWallet() {
  if (walletData) {
    fs.writeFileSync(WALLET_FILE, JSON.stringify(walletData, null, 2), "utf8");
  } else if (fs.existsSync(WALLET_FILE)) {
    fs.unlinkSync(WALLET_FILE);
  }
}

function createWallet() {
  const { generateMnemonic, mnemonicToSeedSync } = require("@scure/bip39");
  const { wordlist } = require("@scure/bip39/wordlists/english");
  const { HDKey } = require("@scure/bip32");
  const { sha256 } = require("@noble/hashes/sha256");
  const { ripemd160 } = require("@noble/hashes/ripemd160");
  const { bech32 } = require("@scure/base");

  const mnemonic = generateMnemonic(wordlist, 128);
  const seed = mnemonicToSeedSync(mnemonic);
  const root = HDKey.fromMasterSeed(seed);

  const addresses = [];
  for (let i = 0; i < 5; i++) {
    const child = root.derive(`m/84'/0'/0'/0/${i}`);
    const pubkey = child.publicKey;
    const pubkeyHash = ripemd160(sha256(pubkey));
    const words5 = bech32.toWords(pubkeyHash);
    addresses.push(bech32.encode("bc", [0, ...words5]));
  }

  walletData = {
    address: addresses[0],
    addresses,
    derivationPath: "m/84'/0'/0'/0/0",
    network: "mainnet",
    type: "P2WPKH",
    createdAt: new Date().toISOString(),
    mnemonic,
  };
  persistWallet();
  return { address: addresses[0], mnemonic, addresses };
}

function getWalletPayload() {
  if (!walletData) return { configured: false };
  return {
    configured: true,
    address: walletData.address,
    addresses: walletData.addresses || [walletData.address],
    derivationPath: walletData.derivationPath,
    network: walletData.network,
    type: walletData.type,
    createdAt: walletData.createdAt,
  };
}

async function fetchBtcBalance(address) {
  const https = require("https");
  return new Promise((resolve) => {
    const url = `https://mempool.space/api/address/${encodeURIComponent(address)}`;
    const req = https.get(url, { timeout: 8000 }, (res) => {
      let body = "";
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => {
        try {
          const data = JSON.parse(body);
          const chain = data.chain_stats || {};
          const mem = data.mempool_stats || {};
          const confirmed = (chain.funded_txo_sum || 0) - (chain.spent_txo_sum || 0);
          const unconfirmed = (mem.funded_txo_sum || 0) - (mem.spent_txo_sum || 0);
          resolve({ confirmed, unconfirmed, total: confirmed + unconfirmed, txCount: (chain.tx_count || 0) + (mem.tx_count || 0) });
        } catch {
          resolve(null);
        }
      });
    });
    req.on("error", () => resolve(null));
    req.on("timeout", () => { req.destroy(); resolve(null); });
  });
}

async function fetchBtcTransactions(address) {
  const https = require("https");
  return new Promise((resolve) => {
    const url = `https://mempool.space/api/address/${encodeURIComponent(address)}/txs`;
    const req = https.get(url, { timeout: 10000 }, (res) => {
      let body = "";
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => {
        try {
          const txs = JSON.parse(body);
          if (!Array.isArray(txs)) { resolve([]); return; }
          const result = txs.slice(0, 20).map((tx) => {
            const myVouts = (tx.vout || []).filter((v) => v.scriptpubkey_address === address);
            const myVins = (tx.vin || []).filter((v) => v.prevout && v.prevout.scriptpubkey_address === address);
            const received = myVouts.reduce((s, v) => s + (v.value || 0), 0);
            const spent = myVins.reduce((s, v) => s + (v.prevout.value || 0), 0);
            const net = received - spent;
            return {
              txid: tx.txid,
              direction: net >= 0 ? "Received" : "Sent",
              amount: Math.abs(net),
              confirmed: tx.status && tx.status.confirmed,
              blockTime: tx.status && tx.status.block_time ? new Date(tx.status.block_time * 1000).toLocaleString() : "Pending",
            };
          });
          resolve(result);
        } catch {
          resolve([]);
        }
      });
    });
    req.on("error", () => resolve([]));
    req.on("timeout", () => { req.destroy(); resolve([]); });
  });
}

async function generateWalletQr(address) {
  const QRCode = require("qrcode");
  return QRCode.toDataURL(`bitcoin:${address}`, { width: 180, margin: 1, color: { dark: "#f2f8ff", light: "#151d27" } });
}

// ─── End Wallet ───────────────────────────────────────────────────────────────

// ─── Cashu ────────────────────────────────────────────────────────────────────

function persistCashu() {
  fs.writeFileSync(CASHU_FILE, JSON.stringify(cashuData, null, 2), "utf8");
}

function getCashuBalance() {
  return (cashuData.proofs || []).reduce((sum, p) => sum + (p.amount || 0), 0);
}

function getCashuPayload() {
  return {
    configured: Boolean(cashuData.mintUrl),
    mintUrl: cashuData.mintUrl || null,
    balance: getCashuBalance(),
    proofCount: (cashuData.proofs || []).length,
    pendingInvoices: (cashuData.pendingInvoices || []).map((inv) => ({
      hash: inv.hash,
      amount: inv.amount,
      pr: inv.pr,
      createdAt: inv.createdAt,
    })),
    history: (cashuData.history || []).slice(0, 30),
  };
}

function addCashuHistory(entry) {
  cashuData.history = cashuData.history || [];
  cashuData.history.unshift({ ...entry, timestamp: new Date().toLocaleString() });
  if (cashuData.history.length > 100) cashuData.history = cashuData.history.slice(0, 100);
}

async function cashuGetWallet() {
  const { CashuMint, CashuWallet } = require("@cashu/cashu-ts");
  if (!cashuData.mintUrl) throw new Error("No mint configured");
  const mint = new CashuMint(cashuData.mintUrl);
  const wallet = new CashuWallet(mint);
  await wallet.initKeys();
  return { wallet, mint };
}

async function cashuSetMint(mintUrl) {
  const { CashuMint } = require("@cashu/cashu-ts");
  const mint = new CashuMint(mintUrl.trim());
  const info = await mint.getInfo();
  cashuData.mintUrl = mintUrl.trim();
  cashuData.proofs = [];
  cashuData.pendingInvoices = [];
  persistCashu();
  return { ok: true, name: info.name, description: info.description, mintUrl: cashuData.mintUrl };
}

async function cashuCreateInvoice(amount) {
  const { wallet } = await cashuGetWallet();
  const { pr, hash } = await wallet.requestMint(amount);
  cashuData.pendingInvoices = cashuData.pendingInvoices || [];
  cashuData.pendingInvoices.push({ hash, amount, pr, createdAt: new Date().toISOString() });
  persistCashu();
  return { pr, hash, amount };
}

async function cashuCheckInvoice(hash) {
  const { wallet } = await cashuGetWallet();
  const pending = (cashuData.pendingInvoices || []).find((i) => i.hash === hash);
  if (!pending) throw new Error("Invoice not found");
  const { proofs } = await wallet.requestTokens(pending.amount, hash);
  cashuData.proofs = [...(cashuData.proofs || []), ...proofs];
  cashuData.pendingInvoices = (cashuData.pendingInvoices || []).filter((i) => i.hash !== hash);
  addCashuHistory({ direction: "Received", amount: pending.amount, unit: "sats", peer: "Lightning deposit", status: "Confirmed" });
  persistCashu();
  return { balance: getCashuBalance(), amount: pending.amount };
}

async function cashuSendToken(amount) {
  const { wallet } = await cashuGetWallet();
  const { getEncodedToken } = require("@cashu/cashu-ts");
  if (getCashuBalance() < amount) throw new Error(`Insufficient balance (have ${getCashuBalance()} sats)`);
  const { send, returnChange } = await wallet.send(amount, cashuData.proofs);
  cashuData.proofs = returnChange || [];
  persistCashu();
  const token = getEncodedToken({ token: [{ mint: cashuData.mintUrl, proofs: send }] });
  return { token, amount };
}

async function cashuReceiveToken(tokenString) {
  const { getDecodedToken, CashuMint, CashuWallet } = require("@cashu/cashu-ts");
  const decoded = getDecodedToken(tokenString.trim());
  const tokenMintUrl = decoded.token[0].mint;
  const mint = new CashuMint(tokenMintUrl);
  const wallet = new CashuWallet(mint);
  await wallet.initKeys();
  const newProofs = await wallet.receive(decoded);
  const amount = newProofs.reduce((s, p) => s + (p.amount || 0), 0);
  if (tokenMintUrl === cashuData.mintUrl) {
    cashuData.proofs = [...(cashuData.proofs || []), ...newProofs];
  } else {
    // Different mint — store proofs anyway, user can swap later
    cashuData.proofs = [...(cashuData.proofs || []), ...newProofs];
    if (!cashuData.mintUrl) cashuData.mintUrl = tokenMintUrl;
  }
  addCashuHistory({ direction: "Received", amount, unit: "sats", peer: "Cashu token", status: "Confirmed", mintUrl: tokenMintUrl });
  persistCashu();
  return { amount, balance: getCashuBalance(), mintUrl: tokenMintUrl };
}

async function cashuMeltToLightning(pr) {
  const { wallet } = await cashuGetWallet();
  const { getDecodedLnInvoice } = require("@cashu/cashu-ts");
  const fee = await wallet.getFee(pr);
  const decoded = getDecodedLnInvoice(pr);
  const amount = Math.round(Number(decoded.sections.find((s) => s.name === "amount")?.value || 0) / 1000);
  const totalNeeded = amount + fee;
  if (getCashuBalance() < totalNeeded) throw new Error(`Need ${totalNeeded} sats (incl. ${fee} fee), have ${getCashuBalance()}`);
  const { send } = await wallet.send(totalNeeded, cashuData.proofs);
  const result = await wallet.payLnInvoice(pr, send);
  cashuData.proofs = result.change || [];
  addCashuHistory({ direction: "Sent", amount, unit: "sats", peer: "Lightning payment", status: result.isPaid ? "Confirmed" : "Failed" });
  persistCashu();
  return { isPaid: result.isPaid, amount, fee, balance: getCashuBalance() };
}

async function generateLightningQr(pr) {
  const QRCode = require("qrcode");
  return QRCode.toDataURL(pr.toUpperCase(), { width: 200, margin: 1, color: { dark: "#f2f8ff", light: "#151d27" } });
}

// ─── End Cashu ────────────────────────────────────────────────────────────────

function clampNumber(value, min, max, fallback) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}

function clampInteger(value, min, max, fallback) {
  const num = Math.round(Number(value));
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}

function normalizeAiSettings(input) {
  const source = input && typeof input === "object" ? input : {};
  return {
    sendCustomInstructions: Boolean(source.sendCustomInstructions),
    customInstructions: typeof source.customInstructions === "string" ? source.customInstructions.replace(/\r\n/g, "\n").slice(0, 4000).trim() : DEFAULT_AI_SETTINGS.customInstructions,
    localTemperature: clampNumber(source.localTemperature, 0, 2, DEFAULT_AI_SETTINGS.localTemperature),
    localTopP: clampNumber(source.localTopP, 0.05, 1, DEFAULT_AI_SETTINGS.localTopP),
    localMaxTokens: clampInteger(source.localMaxTokens, 32, 2048, DEFAULT_AI_SETTINGS.localMaxTokens),
    meshTemperature: clampNumber(source.meshTemperature, 0, 2, DEFAULT_AI_SETTINGS.meshTemperature),
    meshTopP: clampNumber(source.meshTopP, 0.05, 1, DEFAULT_AI_SETTINGS.meshTopP),
    meshMaxTokens: clampInteger(source.meshMaxTokens, 32, 512, DEFAULT_AI_SETTINGS.meshMaxTokens),
  };
}

function getAiSettingsPayload() {
  return normalizeAiSettings(appSettings.aiSettings);
}

function updateAiSettings(nextSettings) {
  appSettings.aiSettings = normalizeAiSettings(nextSettings);
  persistSettings();
  return getAiSettingsPayload();
}

function buildInstructionSuffix(aiSettings) {
  if (!aiSettings.sendCustomInstructions || !aiSettings.customInstructions) return "";
  return `\n\nAdditional instructions:\n${aiSettings.customInstructions}`;
}

function buildLocalSystemPrompt(aiSettings) {
  return `Reply to the user's last message directly. Be useful, natural, and use the same language as the user. Give enough detail to fully answer the request, but stay concise when the user asks for something simple. Do not mention being an AI assistant or explain your role unless asked.${buildInstructionSuffix(aiSettings)}\n\nKnown mesh context:\n${buildNodeContext()}`;
}

function buildMeshSystemPrompt(aiSettings) {
  return `Reply to the user's last message directly. Use the same language as the user. Keep it concise and radio-friendly. Strong preference: fit the whole reply into one short radio packet. Use plain text only, no emoji, no decorative symbols, and no unexpected scripts from other languages. If the request is large, compress aggressively and keep only the essential answer.${buildInstructionSuffix(aiSettings)}\n\nKnown mesh context:\n${buildNodeContext()}`;
}

function addMessage(entry) {
  const item = {
    id: Date.now() + Math.random(),
    createdAt: new Date().toISOString(),
    ...entry,
  };
  messages.push(item);
  messages = messages.slice(-300);
  persistMessages();
  broadcast("message", item);
}

function clearMessages(scope, peerId = "") {
  const normalizedScope = String(scope || "").trim();
  const normalizedPeerId = String(peerId || "").trim();
  const before = messages.length;

  if (normalizedScope === "local") {
    messages = messages.filter((message) => {
      const sender = String(message.sender || "");
      const recipient = String(message.recipient || "");
      return !(
        (sender === "local-ui-user" && recipient === "local-ai")
        || (sender === "local-ai" && recipient === "local-ui-user")
      );
    });
  } else if (normalizedScope === "peer") {
    if (!normalizedPeerId) {
      throw new Error("peerId is required");
    }
    messages = messages.filter((message) => {
      const direction = String(message.direction || "");
      const sender = String(message.sender || "");
      const recipient = String(message.recipient || "");
      if (direction === "in") {
        return !(sender === normalizedPeerId && recipient === "local-ai");
      }
      if (direction === "out") {
        return !(sender === "local-ui" && recipient === normalizedPeerId);
      }
      return true;
    });
  } else {
    throw new Error("invalid scope");
  }

  if (messages.length !== before) {
    persistMessages();
  }

  return { ok: true, removed: before - messages.length, remaining: messages.length };
}

function normalizeWhitespace(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function repairText(text) {
  let value = String(text || "");
  if (!value) {
    return "";
  }

  if (value.includes("Р") || value.includes("Ñ")) {
    for (const encoding of ["latin1", "binary"]) {
      try {
        const repaired = Buffer.from(value, encoding).toString("utf8");
        if (repaired && repaired !== value && /[А-Яа-яЁё]/.test(repaired)) {
          value = repaired;
          break;
        }
      } catch {}
    }
  }

  return value;
}

function parseWeatherFromText(text) {
  const normalized = normalizeWhitespace(text);
  const lower = normalized.toLowerCase();

  if (isWeatherQuery(normalized) && !/\d/.test(normalized)) {
    return null;
  }

  const hasWeatherWords =
    /(?:weather|temp|temperature|humidity|pressure|wind|forecast|погода|темп|температ|влажност|давлен|ветер)/i.test(normalized);

  const temperature = normalized.match(/(-?\d+(?:[.,]\d+)?)\s*(?:°\s*[cf]|[cf]\b|°)/i)?.[1];
  const humidity = normalized.match(/(?:humidity|hum|влажност[ья]?)[:\s]*([0-9]{1,3})\s*%/i)?.[1];
  const pressure = normalized.match(/(?:pressure|press|давлен[иея]?)[:\s]*([0-9]{3,4})\s*(?:hpa|mb|мм|mm)?/i)?.[1];
  const wind = normalized.match(/(?:wind|ветер)[:\s]*([0-9]{1,3}(?:[.,][0-9]+)?)\s*(?:m\/s|km\/h|км\/ч|м\/с)?/i)?.[1];

  if (!hasWeatherWords && !temperature && !humidity && !pressure && !wind) {
    return null;
  }

  return {
    summary: normalized,
    temperature: temperature || null,
    humidity: humidity || null,
    pressure: pressure || null,
    wind: wind || null,
    capturedAt: new Date().toISOString(),
  };
}

function hasRealWeatherData(node) {
  if (!node?.weather) {
    return false;
  }

  return [
    node.weather.temperature,
    node.weather.humidity,
    node.weather.pressure,
    node.weather.wind,
  ].some((value) => value !== null && value !== undefined && value !== "");
}

function inferNodeRole(text) {
  const lower = normalizeWhitespace(text).toLowerCase();
  if (/(?:weather|forecast|погода|температ|влажност|давлен|ветер)/i.test(lower)) {
    return "weather";
  }
  return "generic";
}

function inferNodeRoleFromMeta(node) {
  if (node.environmentMetrics && Object.keys(node.environmentMetrics).length > 0) {
    return "weather";
  }
  const combined = [node.longName, node.shortName, node.hardware, node.lastMessage]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (/(?:weather|meteo|forecast|погода|temp|humidity|pressure|wind|температ|влажност|давлен|ветер)/i.test(combined)) {
    return "weather";
  }
  return node.role || "generic";
}

function updateKnownNode(sender, text) {
  const normalizedText = repairText(text);
  const existing = knownNodes[sender] || {
    id: sender,
    role: "generic",
    tags: [],
    lastMessage: "",
    lastSeenAt: null,
    weather: null,
  };

  const weather = parseWeatherFromText(normalizedText);
  const role = weather ? "weather" : (existing.role === "generic" ? inferNodeRole(normalizedText) : existing.role);
  const tags = new Set(existing.tags || []);
  if (role === "weather" && weather) {
    tags.add("weather");
  }

  knownNodes[sender] = {
    ...existing,
    id: sender,
    role,
    tags: Array.from(tags),
    lastMessage: normalizeWhitespace(normalizedText),
    lastSeenAt: new Date().toISOString(),
    weather: weather || (hasRealWeatherData(existing) ? existing.weather : null),
  };

  knownNodes[sender].role = inferNodeRoleFromMeta(knownNodes[sender]);
  if (!hasRealWeatherData(knownNodes[sender])) {
    knownNodes[sender].weather = null;
  }

  persistNodes();
}

function isNodeOnline(node) {
  const stamp = node.lastSeenAt || node.lastHeard;
  if (!stamp) {
    return node.snr !== null || node.hopsAway !== null;
  }
  const value = typeof stamp === "number" ? stamp * 1000 : new Date(stamp).getTime();
  return Date.now() - value <= NODE_ONLINE_MAX_AGE_MS;
}

function getNodesPayload() {
  return {
    nodes: Object.values(knownNodes)
      .sort((a, b) => {
        const aOnline = isNodeOnline(a) ? 1 : 0;
        const bOnline = isNodeOnline(b) ? 1 : 0;
        if (aOnline !== bOnline) {
          return bOnline - aOnline;
        }
        return String(a.userId || a.id).localeCompare(String(b.userId || b.id));
      })
      .map((node) => ({
        ...node,
        online: isNodeOnline(node),
        live: Array.isArray(node.observedPortnums) && node.observedPortnums.length > 0,
      })),
  };
}

function mergeBridgeNodes(nodes) {
  let changed = false;
  for (const bridgeNode of nodes || []) {
    const nodeId = String(bridgeNode.userId || bridgeNode.id || "").trim();
    if (!nodeId) {
      continue;
    }

    const existing = knownNodes[nodeId] || {
      id: nodeId,
      role: "generic",
      tags: [],
      lastMessage: "",
      lastSeenAt: null,
      weather: null,
      observedPortnums: [],
      lastDecoded: null,
    };

    knownNodes[nodeId] = {
      ...existing,
      id: nodeId,
      meshNum: bridgeNode.id || existing.meshNum || null,
      userId: bridgeNode.userId || existing.userId || nodeId,
      shortName: bridgeNode.shortName || existing.shortName || "",
      longName: bridgeNode.longName || existing.longName || "",
      hardware: bridgeNode.hardware || existing.hardware || "",
      lastHeard: bridgeNode.lastHeard || existing.lastHeard || null,
      snr: bridgeNode.snr ?? existing.snr ?? null,
      hopsAway: bridgeNode.hopsAway ?? existing.hopsAway ?? null,
      batteryLevel: bridgeNode.batteryLevel ?? existing.batteryLevel ?? null,
      voltage: bridgeNode.voltage ?? existing.voltage ?? null,
      latitude: bridgeNode.latitude ?? existing.latitude ?? null,
      longitude: bridgeNode.longitude ?? existing.longitude ?? null,
      environmentMetrics: bridgeNode.environmentMetrics || existing.environmentMetrics || null,
      raw: bridgeNode.raw || existing.raw || null,
      observedPortnums: existing.observedPortnums || [],
      lastDecoded: existing.lastDecoded || null,
    };
    knownNodes[nodeId].weather = extractWeatherFromNode(knownNodes[nodeId]) || existing.weather || null;
    knownNodes[nodeId].role = inferNodeRoleFromMeta(knownNodes[nodeId]);
    if (!hasRealWeatherData(knownNodes[nodeId])) {
      knownNodes[nodeId].weather = null;
    }
    changed = true;
  }

  if (changed) {
    persistNodes();
    broadcast("nodes", getNodesPayload());
  }
}

function mergeTelemetry(sender, payload) {
  const nodeId = String(sender || "").trim();
  if (!nodeId) {
    return;
  }

  const existing = knownNodes[nodeId] || {
    id: nodeId,
    role: "generic",
    tags: [],
    lastMessage: "",
    lastSeenAt: null,
    weather: null,
    observedPortnums: [],
    lastDecoded: null,
  };

  const telemetry = payload?.telemetry || {};
  const environmentMetrics =
    telemetry.environmentMetrics ||
    telemetry.environment ||
    telemetry.envMetrics ||
    existing.environmentMetrics ||
    {};
  const deviceMetrics =
    telemetry.deviceMetrics ||
    telemetry.device ||
    existing.deviceMetrics ||
    {};

  knownNodes[nodeId] = {
    ...existing,
    id: nodeId,
    userId: existing.userId || nodeId,
    environmentMetrics,
    deviceMetrics,
    batteryLevel: deviceMetrics.batteryLevel ?? existing.batteryLevel ?? null,
    voltage: deviceMetrics.voltage ?? existing.voltage ?? null,
    lastSeenAt: new Date().toISOString(),
    rawTelemetry: telemetry,
    lastDecoded: telemetry,
    observedPortnums: Array.from(new Set([...(existing.observedPortnums || []), String(payload?.portnum || "TELEMETRY_APP")])),
  };
  knownNodes[nodeId].weather = extractWeatherFromNode(knownNodes[nodeId]) || existing.weather || null;
  knownNodes[nodeId].role = inferNodeRoleFromMeta(knownNodes[nodeId]);
  if (!hasRealWeatherData(knownNodes[nodeId])) {
    knownNodes[nodeId].weather = null;
  }
  persistNodes();
  broadcast("nodes", getNodesPayload());
}

function mergePacket(sender, payload) {
  const nodeId = String(sender || "").trim();
  if (!nodeId) {
    return;
  }

  const existing = knownNodes[nodeId] || {
    id: nodeId,
    role: "generic",
    tags: [],
    lastMessage: "",
    lastSeenAt: null,
    weather: null,
    observedPortnums: [],
    lastDecoded: null,
  };

  const portnum = String(payload?.portnum || "UNKNOWN");
  knownNodes[nodeId] = {
    ...existing,
    id: nodeId,
    userId: existing.userId || nodeId,
    lastSeenAt: new Date().toISOString(),
    observedPortnums: Array.from(new Set([...(existing.observedPortnums || []), portnum])),
    lastDecoded: payload?.decoded || existing.lastDecoded || null,
    lastPacket: payload?.packet || existing.lastPacket || null,
  };
  persistNodes();
  broadcast("nodes", getNodesPayload());
}

function listKnownNodesText() {
  const nodes = Object.values(knownNodes).sort((a, b) => String(a.userId || a.id).localeCompare(String(b.userId || b.id)));
  if (!nodes.length) {
    return "No known nodes yet.";
  }

  const items = nodes.slice(0, 6).map((node) => {
    const suffix = node.role === "weather" ? " weather" : "";
    return `${node.longName || node.shortName || node.userId || node.id}${suffix}`;
  });
  return `Known nodes: ${items.join(", ")}.`;
}

function getBestWeatherNode() {
  const nodes = Object.values(knownNodes)
    .filter((node) => hasRealWeatherData(node))
    .sort((a, b) => new Date(b.weather.capturedAt || b.lastSeenAt || 0).getTime() - new Date(a.weather.capturedAt || a.lastSeenAt || 0).getTime());
  return nodes[0] || null;
}

function isFreshWeather(node) {
  if (!node?.weather?.capturedAt) {
    return false;
  }
  return Date.now() - new Date(node.weather.capturedAt).getTime() <= WEATHER_CACHE_MAX_AGE_MS;
}

function buildWeatherSummary(node) {
  if (!hasRealWeatherData(node)) {
    return "No weather node data yet.";
  }
  const parts = [];
  if (node.weather.temperature) {
    parts.push(`temp ${node.weather.temperature}`);
  }
  if (node.weather.humidity) {
    parts.push(`humidity ${node.weather.humidity}%`);
  }
  if (node.weather.pressure) {
    parts.push(`pressure ${node.weather.pressure}`);
  }
  if (node.weather.wind) {
    parts.push(`wind ${node.weather.wind}`);
  }

  const body = parts.length ? parts.join(", ") : node.weather.summary;
  return `${node.longName || node.shortName || node.userId || node.id}: ${body}`.slice(0, RESPONSE_CHAR_LIMIT);
}

function extractWeatherFromNode(node) {
  const env = node?.environmentMetrics || {};
  const temperature = env.temperature ?? env.airTemperature ?? env.outsideTemperature ?? null;
  const humidity = env.relativeHumidity ?? env.humidity ?? null;
  const pressure = env.barometricPressure ?? env.pressure ?? null;
  const wind = env.windSpeed ?? env.windGust ?? null;

  if (
    temperature === null &&
    humidity === null &&
    pressure === null &&
    wind === null
  ) {
    return null;
  }

  const parts = [];
  if (temperature !== null) {
    parts.push(`temp ${temperature}`);
  }
  if (humidity !== null) {
    parts.push(`humidity ${humidity}%`);
  }
  if (pressure !== null) {
    parts.push(`pressure ${pressure}`);
  }
  if (wind !== null) {
    parts.push(`wind ${wind}`);
  }

  return {
    summary: parts.join(", "),
    temperature,
    humidity,
    pressure,
    wind,
    capturedAt: new Date().toISOString(),
  };
}

function buildNodeContext() {
  const nodes = Object.values(knownNodes)
    .sort((a, b) => new Date(b.lastSeenAt || 0).getTime() - new Date(a.lastSeenAt || 0).getTime())
    .slice(0, 6)
    .map((node) => {
      const bits = [`id=${node.id}`, `role=${node.role}`];
      if (node.weather?.summary) {
        bits.push(`weather=${node.weather.summary}`);
      } else if (node.lastMessage) {
        bits.push(`last=${node.lastMessage}`);
      }
      return bits.join(" | ");
    });

  return nodes.length ? nodes.join("\n") : "No known nodes.";
}

function isNodesQuery(text) {
  return /(?:^|\b)(nodes|list nodes|show nodes|список нод|какие ноды|узлы|ноды)\b/i.test(normalizeWhitespace(text));
}

function isWeatherQuery(text) {
  return /(?:^|\b)(weather|forecast|погода|температура|температ|влажность|давление|ветер)\b/i.test(normalizeWhitespace(text));
}

function broadcast(type, payload) {
  const frame = `event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const response of clients) {
    response.write(frame);
  }
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString("utf8");
      if (body.length > 1024 * 1024) {
        req.destroy();
        reject(new Error("request too large"));
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function buildPythonEnv(includeSelectedPort = true) {
  const env = {
    ...process.env,
    PYTHONIOENCODING: "utf-8",
    PYTHONUTF8: "1",
    PYTHONPATH: process.env.PYTHONPATH ? `${PYDEPS_DIR};${process.env.PYTHONPATH}` : PYDEPS_DIR,
  };
  const selectedPort = getConfiguredMeshtasticPort();
  if (includeSelectedPort && selectedPort) {
    env.MESHTASTIC_PORT = selectedPort;
  } else {
    delete env.MESHTASTIC_PORT;
  }
  return env;
}

function findPythonLauncher() {
  const candidates = [
    ["C:\\Python311\\python.exe", ["--version"]],
    ["python", ["--version"]],
    ["py", ["--version"]],
  ];
  for (const [command, args] of candidates) {
    const result = spawnSync(command, args, { stdio: "ignore", shell: false });
    if (result.status === 0) {
      return command;
    }
  }
  return null;
}

function ensureMeshtasticDependency(pythonLauncher) {
  if (fs.existsSync(path.join(PYDEPS_DIR, "meshtastic"))) {
    return true;
  }
  fs.mkdirSync(PYDEPS_DIR, { recursive: true });

  console.log("Installing local project Python dependency: meshtastic");
  const result = spawnSync(
    pythonLauncher,
    ["-m", "pip", "install", "--disable-pip-version-check", "--target", PYDEPS_DIR, "meshtastic"],
    {
      stdio: "inherit",
      shell: false,
    }
  );
  return result.status === 0;
}

function listMeshtasticPorts() {
  const pythonLauncher = findPythonLauncher();
  if (!pythonLauncher) {
    return { ok: false, error: "Python not found in PATH", selectedPort: getConfiguredMeshtasticPort() || null, ports: [] };
  }
  if (!ensureMeshtasticDependency(pythonLauncher)) {
    return { ok: false, error: "Failed to install/load meshtastic package", selectedPort: getConfiguredMeshtasticPort() || null, ports: [] };
  }

  const result = spawnSync(pythonLauncher, ["bridge.py", "--list-ports"], {
    cwd: __dirname,
    env: buildPythonEnv(false),
    encoding: "utf8",
    shell: false,
    windowsHide: true,
  });

  if (result.status !== 0) {
    return {
      ok: false,
      error: (result.stderr || result.stdout || `port listing failed with exit code ${result.status}`).trim(),
      selectedPort: getConfiguredMeshtasticPort() || null,
      ports: [],
    };
  }

  try {
    const payload = JSON.parse(String(result.stdout || "{}").trim() || "{}");
    const detectedPorts = new Set((payload.detectedPorts || []).map((port) => String(port || "")));
    const fallbackPorts = new Set((payload.fallbackPorts || []).map((port) => String(port || "")));
    const ports = Array.isArray(payload.ports) ? payload.ports : [];

    return {
      ok: true,
      selectedPort: getConfiguredMeshtasticPort() || null,
      detectedPorts: Array.from(detectedPorts),
      fallbackPorts: Array.from(fallbackPorts),
      ports: ports.map((port) => {
        const device = String(port.device || "");
        return {
          ...port,
          device,
          isDetected: detectedPorts.has(device),
          isFallback: fallbackPorts.has(device),
          isSelected: device !== "" && device === getConfiguredMeshtasticPort(),
        };
      }),
    };
  } catch (error) {
    return {
      ok: false,
      error: `port listing parse failed: ${error.message}`,
      selectedPort: getConfiguredMeshtasticPort() || null,
      ports: [],
    };
  }
}

function getModelManagerUiStyle() {
  return `.model-manager-panel{width:min(860px,calc(100vw - 72px))!important;max-width:860px!important}
.model-manager-status{display:none!important}
.model-manager-grid{grid-template-columns:minmax(0,1fr)!important;gap:8px!important}
.model-manager-grid .modal-section:last-child{display:none!important}
.model-manager-grid .modal-section{padding:6px!important}
.model-manager-list.compact-list{display:grid;gap:8px;align-content:start}
.model-card.compact{grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:12px;padding:10px 12px}
.model-card.compact.installed{background:linear-gradient(90deg,#26372d 0%,#213129 100%)}
.model-card.compact.installable{background:#20242a}
.model-card.compact.downloading{position:relative;overflow:hidden}
.model-card.compact.downloading::before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(72,153,95,.55) 0%,rgba(72,153,95,.35) 100%);transform-origin:left center;transform:scaleX(var(--download-progress,0));pointer-events:none}
.model-card.compact > *{position:relative;z-index:1}
.model-card.compact .model-card-head{display:grid;gap:5px;min-width:0}
.model-card.compact .model-card-title{font-size:12px;line-height:1.35}
.model-card.compact .model-card-meta{font-size:9px;line-height:1.5}
.model-card.compact .model-card-tags{gap:5px}
.model-card.compact .model-tag{padding:3px 6px;font-size:7px}
.model-card.compact .model-actions{justify-content:flex-end;gap:6px}
.model-tag.installed{background:#31503d;color:#e5f7eb}
.model-card.compact .model-actions button{padding:6px 8px;font-size:9px}
.model-card.compact .model-actions .danger{background:#4a2d2d;color:#ffe3e3}
@media (max-width: 900px){.model-manager-panel{width:min(100vw - 28px,860px)!important}}
@media (max-width: 720px){.model-card.compact{grid-template-columns:minmax(0,1fr)}.model-card.compact .model-actions{justify-content:flex-start}}`;
}

function getModelManagerUiScript() {
  return `(() => {
  const stylesId = "compact-model-manager-style";
  if (!document.getElementById(stylesId)) {
    const style = document.createElement("style");
    style.id = stylesId;
    style.textContent = ${JSON.stringify(getModelManagerUiStyle())};
    document.head.appendChild(style);
  }

  const installedList = document.getElementById("installedModelsList");
  const catalogList = document.getElementById("catalogModelsList");
  const managerTitle = document.querySelector(".model-manager-grid .modal-section .modal-label");
  if (!installedList || !catalogList) {
    return;
  }

  installedList.classList.add("compact-list");
  if (managerTitle) {
    managerTitle.textContent = "Models";
  }

  function fmtBytes(bytes) {
    const value = Number(bytes || 0);
    if (!Number.isFinite(value) || value <= 0) {
      return "unknown";
    }
    if (value >= 1024 ** 3) {
      return (value / (1024 ** 3)).toFixed(2) + " GB";
    }
    return Math.round(value / (1024 ** 2)) + " MB";
  }

  function fmtProgress(downloaded, total, percent) {
    if (total > 0) {
      return percent + "% | " + fmtBytes(downloaded) + " / " + fmtBytes(total);
    }
    if (downloaded > 0) {
      return percent + "% | " + fmtBytes(downloaded);
    }
    return percent + "%";
  }

  function tag(label, extraClass) {
    const node = document.createElement("span");
    node.className = "model-tag " + (extraClass || "");
    node.textContent = label;
    return node;
  }

  function allModels(payload) {
    const installed = Array.isArray(payload?.installed) ? payload.installed : [];
    const available = Array.isArray(payload?.available) ? payload.available.filter((model) => !model.installed) : [];
    return [...installed, ...available].sort((a, b) => {
      const installedDiff = Number(Boolean(b.installed)) - Number(Boolean(a.installed));
      if (installedDiff !== 0) return installedDiff;
      const currentDiff = Number(Boolean(b.current)) - Number(Boolean(a.current));
      if (currentDiff !== 0) return currentDiff;
      return String(a.name || a.filename || "").localeCompare(String(b.name || b.filename || ""));
    });
  }

  function rerender(payload) {
    if (!window.installModelFromManager || !window.selectModelFromManager || !window.deleteModelFromManager || !window.loadModelManager) {
      return false;
    }

    const operation = payload?.operation || {};
    const models = allModels(payload);
    installedList.innerHTML = "";
    catalogList.innerHTML = "";

    if (!models.length) {
      installedList.innerHTML = '<div class="model-empty">No models available</div>';
      return true;
    }

    for (const model of models) {
      const card = document.createElement("article");
      card.className = "model-card compact " + (model.installed ? "installed" : "installable");
      const isDownloading = operation.active && operation.action === "install" && operation.modelName === model.filename;
      if (isDownloading) {
        const progress = Math.max(0, Math.min(100, Number(operation.progress || 0)));
        card.classList.add("downloading");
        card.style.setProperty("--download-progress", String(progress / 100));
      }

      const head = document.createElement("div");
      head.className = "model-card-head";

      const title = document.createElement("div");
      title.className = "model-card-title";
      title.textContent = (model.name || model.filename) + " (" + fmtBytes(model.sizeBytes) + ")";

      const tags = document.createElement("div");
      tags.className = "model-card-tags";
      if (model.current) tags.appendChild(tag("Current", "current"));
      tags.appendChild(tag(model.installed ? "Installed" : "Available", model.installed ? "installed" : "available"));

      if (model.notes) {
        const notes = document.createElement("div");
        notes.className = "model-card-meta";
        notes.textContent = isDownloading
          ? ("Downloading... " + fmtProgress(Number(operation.bytesDownloaded || 0), Number(operation.bytesTotal || 0), Math.max(0, Math.min(100, Number(operation.progress || 0)))))
          : model.notes;
        head.append(title, notes, tags);
      } else {
        if (isDownloading) {
          const notes = document.createElement("div");
          notes.className = "model-card-meta";
          notes.textContent = "Downloading... " + fmtProgress(Number(operation.bytesDownloaded || 0), Number(operation.bytesTotal || 0), Math.max(0, Math.min(100, Number(operation.progress || 0))));
          head.append(title, notes, tags);
          card.append(head);
        } else {
          head.append(title, tags);
        }
      }

      const actions = document.createElement("div");
      actions.className = "model-actions";
      const busy = Boolean(operation.active);

      if (model.installed) {
        if (!model.current) {
          const selectButton = document.createElement("button");
          selectButton.type = "button";
          selectButton.textContent = "Select";
          selectButton.disabled = busy;
          selectButton.addEventListener("click", async () => {
            try {
              await window.selectModelFromManager(model.filename);
              await window.loadModelManager();
            } catch (error) {
              const label = document.getElementById("modelManagerStatusText");
              if (label) label.textContent = "Select failed: " + error.message;
            }
          });
          actions.appendChild(selectButton);
        }

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.disabled = busy;
        deleteButton.addEventListener("click", async () => {
          try {
            await window.deleteModelFromManager(model.filename);
            await window.loadModelManager();
          } catch (error) {
            const label = document.getElementById("modelManagerStatusText");
            if (label) label.textContent = "Delete failed: " + error.message;
          }
        });
        actions.appendChild(deleteButton);
      } else {
        const installButton = document.createElement("button");
        installButton.type = "button";
        installButton.textContent = "Install";
        installButton.disabled = busy;
        installButton.addEventListener("click", async () => {
          try {
            await window.installModelFromManager(model.id);
            await window.loadModelManager();
          } catch (error) {
            const label = document.getElementById("modelManagerStatusText");
            if (label) label.textContent = "Install failed: " + error.message;
          }
        });
        actions.appendChild(installButton);

        if (isDownloading) {
          const cancelButton = document.createElement("button");
          cancelButton.type = "button";
          cancelButton.textContent = "Cancel";
          cancelButton.className = "danger";
          cancelButton.addEventListener("click", async () => {
            try {
              const response = await fetch("/api/models/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: "{}",
              });
              const payload = await response.json();
              if (!response.ok) {
                throw new Error(payload.error || response.statusText || "cancel failed");
              }
              await window.loadModelManager();
            } catch (error) {
              const label = document.getElementById("modelManagerStatusText");
              if (label) label.textContent = "Cancel failed: " + error.message;
            }
          });
          actions.appendChild(cancelButton);
        }
      }

      card.append(head, actions);
      installedList.appendChild(card);
    }
    return true;
  }

  const wire = () => {
    if (typeof window.renderModelManager !== "function") {
      setTimeout(wire, 100);
      return;
    }

    const original = window.renderModelManager;
    window.renderModelManager = function patchedRenderModelManager(payload) {
      original(payload);
      const statusLabel = document.getElementById("modelManagerStatusText");
      if (statusLabel) {
        const operation = payload?.operation || {};
        statusLabel.textContent = operation.active
          ? (
            operation.action === "install"
              ? ("Installing " + (operation.modelName || operation.modelId || "model") + " (" + fmtProgress(Number(operation.bytesDownloaded || 0), Number(operation.bytesTotal || 0), Math.max(0, Math.min(100, Number(operation.progress || 0)))) + ")")
              : ("Deleting " + (operation.modelName || operation.modelId || "model") + "...")
          )
          : (operation.error || "");
      }
      rerender(payload);
    };

    if (window.latestModelManagerPayload) {
      rerender(window.latestModelManagerPayload);
    }
  };

  wire();
})();`;
}

function openBrowser() {
  spawn("cmd", ["/c", "start", "", `http://${HOST}:${PORT}`], {
    detached: true,
    stdio: "ignore",
    shell: false,
  }).unref();
}

function listAvailableModels() {
  if (!fs.existsSync(MODELS_DIR)) {
    return [];
  }
  return fs
    .readdirSync(MODELS_DIR, { withFileTypes: true })
    .filter((entry) => {
      if (!entry.isFile() || !entry.name.toLowerCase().endsWith(".gguf")) {
        return false;
      }
      try {
        return fs.statSync(path.join(MODELS_DIR, entry.name)).size >= MIN_VALID_MODEL_BYTES;
      } catch {
        return false;
      }
    })
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function isValidModelDownload(filePath, expectedSizeBytes = 0) {
  try {
    const size = fs.statSync(filePath).size;
    if (size < MIN_VALID_MODEL_BYTES) {
      return false;
    }
    if (expectedSizeBytes > 0 && size < Math.floor(expectedSizeBytes * 0.5)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

async function downloadModelFile(url, destinationPath, onProgress) {
  const response = await fetch(url, {
    redirect: "follow",
    signal: modelDownloadAbortController?.signal,
  });
  if (!response.ok || !response.body) {
    throw new Error(`Download failed: HTTP ${response.status}`);
  }

  const total = Number(response.headers.get("content-length") || 0);
  const writer = fs.createWriteStream(destinationPath);
  let downloaded = 0;

  try {
    for await (const chunk of response.body) {
      const buffer = Buffer.from(chunk);
      downloaded += buffer.length;
      await new Promise((resolve, reject) => {
        writer.write(buffer, (error) => (error ? reject(error) : resolve()));
      });
      if (typeof onProgress === "function") {
        onProgress(downloaded, total);
      }
    }
    await new Promise((resolve, reject) => writer.end((error) => (error ? reject(error) : resolve())));
  } catch (error) {
    try {
      writer.destroy();
    } catch {}
    throw error;
  }
}

function getInstalledModels() {
  if (!fs.existsSync(MODELS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(MODELS_DIR, { withFileTypes: true })
    .filter((entry) => {
      if (!entry.isFile() || !entry.name.toLowerCase().endsWith(".gguf")) {
        return false;
      }
      return isValidModelDownload(path.join(MODELS_DIR, entry.name));
    })
    .map((entry) => {
      const filePath = path.join(MODELS_DIR, entry.name);
      const curated = CURATED_MODELS.find((model) => model.filename === entry.name) || null;
      return {
        filename: entry.name,
        path: filePath,
        sizeBytes: fs.statSync(filePath).size,
        name: curated?.name || entry.name.replace(/\.gguf$/i, ""),
        family: curated?.family || "Custom",
        notes: curated?.notes || "Installed manually.",
        curatedId: curated?.id || null,
        installed: true,
        current: entry.name === currentModelName,
      };
    })
    .sort((a, b) => a.filename.localeCompare(b.filename));
}

function getModelManagerPayload() {
  const installed = getInstalledModels();
  const installedNames = new Set(installed.map((model) => model.filename));
  const available = CURATED_MODELS.map((model) => ({
    ...model,
    installed: installedNames.has(model.filename),
    current: model.filename === currentModelName,
  }));

  return {
    currentModel: currentModelName,
    installed,
    available,
    operation: modelManagerOperation,
  };
}

function updateModelManagerOperation(patch) {
  modelManagerOperation = { ...modelManagerOperation, ...patch };
  broadcast("model-manager", getModelManagerPayload());
}

function resolveCurrentModelName() {
  const availableModels = listAvailableModels();
  if (availableModels.includes(currentModelName)) {
    return;
  }

  if (availableModels.includes(DEFAULT_MODEL_NAME)) {
    currentModelName = DEFAULT_MODEL_NAME;
  } else if (availableModels.length > 0) {
    currentModelName = availableModels[0];
  } else {
    currentModelName = DEFAULT_MODEL_NAME;
  }

  appSettings.lastModelName = currentModelName;
  persistSettings();
}

function getModelPath(modelName = currentModelName) {
  return path.join(MODELS_DIR, modelName);
}

async function llamaHealth() {
  if (!fs.existsSync(LLAMA_EXE)) {
    return { ok: false, host: LLM_BASE_URL, model: currentModelName, error: "llama-server.exe not found" };
  }
  if (!fs.existsSync(getModelPath())) {
    return { ok: false, host: LLM_BASE_URL, model: currentModelName, error: "GGUF model not found" };
  }
  try {
    const response = await fetch(`${LLM_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return {
      ok: true,
      host: LLM_BASE_URL,
      model: currentModelName,
    };
  } catch (error) {
    return { ok: false, host: LLM_BASE_URL, model: currentModelName, error: String(error.message || error) };
  }
}

function getHistory(peerId) {
  return sessions.get(peerId) || [];
}

function saveHistory(peerId, history) {
  sessions.set(peerId, history.slice(-HISTORY_LIMIT * 2));
}

function trimResponse(text) {
  const compact = String(text || "").replace(/\s+/g, " ").trim();
  if (compact.length <= RESPONSE_CHAR_LIMIT) {
    return compact;
  }
  return `${compact.slice(0, RESPONSE_CHAR_LIMIT - 3).trimEnd()}...`;
}

function takeUtf8Prefix(text, maxBytes) {
  const value = String(text || "");
  if (!value || maxBytes <= 0) {
    return "";
  }

  let usedBytes = 0;
  let endIndex = 0;
  for (const char of value) {
    const charBytes = Buffer.byteLength(char, "utf8");
    if (usedBytes + charBytes > maxBytes) {
      break;
    }
    usedBytes += charBytes;
    endIndex += char.length;
  }

  return value.slice(0, endIndex);
}

function trimResponseSafe(text) {
  const compact = String(text || "").replace(/\s+/g, " ").trim();
  if (compact.length <= RESPONSE_CHAR_LIMIT) {
    return compact;
  }
  return `${compact.slice(0, RESPONSE_CHAR_LIMIT - 3).trimEnd()}...`;
}

async function generateReply(peerId, prompt) {
  const history = getHistory(peerId);
  const aiSettings = getAiSettingsPayload();
  const response = await fetch(`${LLM_BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: currentModelName,
      messages: [
        {
          role: "system",
          content: buildLocalSystemPrompt(aiSettings),
        },
        ...history,
        { role: "user", content: prompt },
      ],
      temperature: aiSettings.localTemperature,
      top_p: aiSettings.localTopP,
      max_tokens: aiSettings.localMaxTokens,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM HTTP ${response.status}`);
  }

  const payload = await response.json();
  const reply = String(payload.choices?.[0]?.message?.content || "No response.").replace(/\s+/g, " ").trim() || "No response.";
  saveHistory(peerId, [...history, { role: "user", content: prompt }, { role: "assistant", content: reply }]);
  return reply;
}

function splitMeshText(text, reserveBytes = 0) {
  const chunks = [];
  let remaining = String(text || "").replace(/\s+/g, " ").trim();
  const maxChunkBytes = MESH_PACKET_MAX_BYTES - reserveBytes;

  if (maxChunkBytes < 24) {
    throw new Error("chunk reserve is too large for mesh packet");
  }

  while (remaining.length > 0) {
    const prefix = takeUtf8Prefix(remaining, maxChunkBytes);
    const remainingFits = prefix.length === remaining.length;
    let chunk = prefix.trimEnd();
    if (!chunk) {
      break;
    }

    if (!remainingFits) {
      const punctuation = [...chunk.matchAll(/[.!?;:,](?=\s|$)/g)];
      if (punctuation.length) {
        const splitAt = (punctuation[punctuation.length - 1].index || 0) + 1;
        if (splitAt >= Math.floor(chunk.length * 0.55)) {
          chunk = chunk.slice(0, splitAt).trimEnd();
        }
      }

      if (chunk.length === prefix.trimEnd().length) {
        const splitAt = chunk.lastIndexOf(" ");
        if (splitAt >= Math.floor(chunk.length * 0.55)) {
          chunk = chunk.slice(0, splitAt).trimEnd();
        }
      }
    }

    if (!chunk) {
      chunk = prefix.trim();
    }
    if (!chunk) {
      break;
    }

    chunks.push(chunk);
    remaining = remaining.slice(chunk.length).trimStart();
  }

  return chunks.length ? chunks : ["No response."];
}

function buildMeshPackets(text) {
  const normalized = String(text || "").replace(/\s+/g, " ").trim();
  if (!normalized) {
    return ["No response."];
  }

  let chunks = splitMeshText(normalized, 0);
  if (chunks.length <= 1) {
    return chunks;
  }

  for (let pass = 0; pass < 6; pass += 1) {
    const total = chunks.length;
    const reserve = Buffer.byteLength(`[${total}/${total}] `, "utf8");
    const recalculated = splitMeshText(normalized, reserve);
    if (recalculated.length === total) {
      return recalculated.map((chunk, index) => `[${index + 1}/${total}] ${chunk}`);
    }
    chunks = recalculated;
  }

  const total = chunks.length;
  return chunks.map((chunk, index) => `[${index + 1}/${total}] ${chunk}`);
}

async function generateMeshReply(peerId, prompt) {
  const history = getHistory(peerId);
  const aiSettings = getAiSettingsPayload();
  const response = await fetch(`${LLM_BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: currentModelName,
      messages: [
        {
          role: "system",
          content: buildMeshSystemPrompt(aiSettings),
        },
        ...history,
        { role: "user", content: prompt },
      ],
      temperature: aiSettings.meshTemperature,
      top_p: aiSettings.meshTopP,
      max_tokens: aiSettings.meshMaxTokens,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM HTTP ${response.status}`);
  }

  const payload = await response.json();
  const reply = String(payload.choices?.[0]?.message?.content || "No response.").replace(/\s+/g, " ").trim();
  saveHistory(peerId, [...history, { role: "user", content: prompt }, { role: "assistant", content: reply }]);
  return reply || "No response.";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function enqueueMeshBatch(destinationId, packets, sender = "local-ai") {
  const task = async () => {
    for (let index = 0; index < packets.length; index += 1) {
      const messageText = packets[index];
      sendBridge({
        type: "send_text",
        payload: {
          destinationId,
          text: messageText,
          wantAck: true,
          waitForAck: false,
          retryOnAckTimeout: MESH_ACK_RETRY_COUNT,
          ackTimeoutRetryDelayMs: MESH_ACK_RETRY_DELAY_MS,
        },
      });
      addMessage({
        direction: "out",
        sender,
        recipient: destinationId,
        text: messageText,
        transport: "serial",
      });
      if (index < packets.length - 1) {
        await sleep(MESH_PACKET_BATCH_DELAY_MS);
      }
    }
  };

  const queued = meshSendQueue.catch(() => {}).then(task);
  meshSendQueue = queued;
  return queued;
}

async function sendMeshReply(destinationId, text, sender = "local-ai") {
  const packets = buildMeshPackets(text);
  await enqueueMeshBatch(destinationId, packets, sender);
}

function sendBridge(command) {
  if (!bridgeProcess || bridgeProcess.killed) {
    throw new Error("Meshtastic bridge is not running");
  }
  const safeCommand = { ...command };
  if (safeCommand.payload) {
    safeCommand.payload = { ...safeCommand.payload };
    if (Object.hasOwn(safeCommand.payload, "text")) {
      safeCommand.payload.textBase64 = Buffer.from(String(safeCommand.payload.text || ""), "utf8").toString("base64");
      delete safeCommand.payload.text;
    }
  }
  bridgeProcess.stdin.write(`${JSON.stringify(safeCommand)}\n`, "utf8");
}

function isBotCommand(text) {
  const lowered = String(text || "").trim().toLowerCase();
  return lowered.startsWith("@bot") || lowered.startsWith("!ask");
}

function normalizePrompt(text) {
  const trimmed = String(text || "").trim();
  if (trimmed.toLowerCase().startsWith("@bot")) {
    return trimmed.slice(4).trim() || "Help me.";
  }
  if (trimmed.toLowerCase().startsWith("!ask")) {
    return trimmed.slice(4).trim() || "Help me.";
  }
  return trimmed;
}

async function handleInboundMesh(payload) {
  const repairedText = repairText(payload.text);
  updateKnownNode(payload.sender, repairedText);

  addMessage({
    direction: "in",
    sender: payload.sender,
    recipient: "local-ai",
    text: repairedText,
    transport: payload.transport || "serial",
  });

  if (!payload.isDirectMessage) {
    return;
  }

  if (String(repairedText || "").trim().toLowerCase() === "!reset") {
    sessions.delete(payload.sender);
    const resetText = "Context reset.";
    await sendMeshReply(payload.sender, resetText);
    return;
  }

  const prompt = isBotCommand(repairedText)
    ? normalizePrompt(repairedText)
    : String(repairedText || "").trim();

  if (isNodesQuery(prompt)) {
    await sendMeshReply(payload.sender, listKnownNodesText());
    return;
  }

  if (isWeatherQuery(prompt)) {
    const weatherNode = getBestWeatherNode();
    const weatherText = weatherNode
      ? buildWeatherSummary(weatherNode)
      : "No weather metadata found in known nodes.";
    await sendMeshReply(payload.sender, weatherText);
    return;
  }

  const reply = await generateMeshReply(payload.sender, prompt);
  await sendMeshReply(payload.sender, reply);
}

let bridgeProcess = null;
let llamaProcess = null;
let llamaHealthInterval = null;

function updateLlmStatus(patch) {
  llmStatus = { ...llmStatus, ...patch, model: currentModelName };
  broadcast("status", { llm: llmStatus });
}

function stopLlamaServer() {
  if (llamaHealthInterval) {
    clearInterval(llamaHealthInterval);
    llamaHealthInterval = null;
  }
  if (llamaProcess && !llamaProcess.killed) {
    try {
      llamaProcess.kill();
    } catch {}
  }
  llamaProcess = null;
}

function startLlamaServer() {
  resolveCurrentModelName();
  if (!fs.existsSync(LLAMA_EXE)) {
    updateLlmStatus({ connected: false, mode: "error", error: "llama-server.exe missing in ./llama", switching: false });
    return;
  }
  if (!fs.existsSync(getModelPath())) {
    updateLlmStatus({ connected: false, mode: "error", error: "GGUF model missing in ./models", switching: false });
    return;
  }

  const args = [
    "--host", LLM_HOST,
    "--port", String(LLM_PORT),
    "--model", getModelPath(),
    "--ctx-size", "1536",
    "--threads", "4",
    "--n-predict", "512",
  ];

  try {
    llamaProcess = spawn(LLAMA_EXE, args, {
      cwd: LLAMA_DIR,
      stdio: ["ignore", "pipe", "pipe"],
      shell: false,
    });
    updateLlmStatus({ connected: false, mode: "starting", error: null, switching: true });
  } catch (error) {
    updateLlmStatus({ connected: false, mode: "error", error: `llama spawn failed: ${error.message}`, switching: false });
    return;
  }

  llamaProcess.stdout.on("data", () => {});
  llamaProcess.stderr.on("data", (chunk) => {
    const text = chunk.toString("utf8").trim();
    if (text) {
      addMessage({ direction: "system", sender: "llama", recipient: "-", text, transport: "stderr" });
    }
  });
  llamaProcess.on("exit", (code) => {
    updateLlmStatus({ connected: false, mode: "stopped", error: `llama exited with code ${code}`, switching: false });
  });

  llamaHealthInterval = setInterval(async () => {
    const health = await llamaHealth();
    if (health.ok) {
      updateLlmStatus({ connected: true, mode: "local-llama", error: null, switching: false });
      clearInterval(llamaHealthInterval);
      llamaHealthInterval = null;
    }
  }, 1000);
}

async function switchModel(modelName) {
  const availableModels = listAvailableModels();
  if (!availableModels.includes(modelName)) {
    throw new Error("Model not found");
  }
  currentModelName = modelName;
  appSettings.lastModelName = currentModelName;
  persistSettings();
  stopLlamaServer();
  updateLlmStatus({ connected: false, mode: "switching", error: null, switching: true });
  broadcast("model-manager", getModelManagerPayload());
  startLlamaServer();
  return {
    ok: true,
    model: currentModelName,
    availableModels,
  };
}

function installModel(modelId) {
  const curated = CURATED_MODELS.find((model) => model.id === modelId);
  if (!curated) {
    throw new Error("Model catalog entry not found");
  }
  if (modelManagerOperation.active) {
    throw new Error("Another model operation is already running");
  }

  const destinationPath = path.join(MODELS_DIR, curated.filename);
  if (fs.existsSync(destinationPath)) {
    if (isValidModelDownload(destinationPath, curated.sizeBytes)) {
      throw new Error("Model is already installed");
    }
    try {
      fs.unlinkSync(destinationPath);
    } catch {}
  }

  fs.mkdirSync(MODELS_DIR, { recursive: true });
  const tempPath = `${destinationPath}.partial`;
  try {
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
  } catch {}

  updateModelManagerOperation({
    active: true,
    action: "install",
    modelId: curated.id,
    modelName: curated.filename,
    error: null,
    progress: 0,
    bytesDownloaded: 0,
    bytesTotal: curated.sizeBytes || 0,
  });
  addMessage({
    direction: "system",
    sender: "models",
    recipient: "-",
    text: `Installing model ${curated.filename}`,
    transport: "system",
  });

  (async () => {
    modelDownloadAbortController = new AbortController();
    try {
      let lastProgressEmitAt = 0;
      await downloadModelFile(curated.url, tempPath, (downloaded, total) => {
        const now = Date.now();
        if (now - lastProgressEmitAt < 120 && downloaded < total) {
          return;
        }
        lastProgressEmitAt = now;
        const effectiveTotal = total || curated.sizeBytes || 0;
        const progress = effectiveTotal > 0 ? Math.max(0, Math.min(100, Math.round((downloaded / effectiveTotal) * 100))) : 0;
        updateModelManagerOperation({
          progress,
          bytesDownloaded: downloaded,
          bytesTotal: effectiveTotal,
        });
      });

      if (!fs.existsSync(tempPath) || !isValidModelDownload(tempPath, curated.sizeBytes)) {
        throw new Error("downloaded file is invalid or incomplete");
      }

      fs.renameSync(tempPath, destinationPath);
      updateModelManagerOperation({
        active: false,
        error: null,
        progress: 100,
        bytesDownloaded: curated.sizeBytes || 0,
        bytesTotal: curated.sizeBytes || 0,
      });
      broadcast("status", { llm: llmStatus });
      addMessage({
        direction: "system",
        sender: "models",
        recipient: "-",
        text: `Model installed: ${curated.filename}`,
        transport: "system",
      });
    } catch (error) {
      try {
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      } catch {}
      const wasCancelled = error?.name === "AbortError";
      updateModelManagerOperation({
        active: false,
        error: wasCancelled ? "Install cancelled" : `Install failed: ${error.message}`,
        progress: 0,
        bytesDownloaded: 0,
        bytesTotal: 0,
      });
      addMessage({
        direction: "system",
        sender: "models",
        recipient: "-",
        text: wasCancelled
          ? `Install cancelled for ${curated.filename}`
          : `Install failed for ${curated.filename}: ${error.message}`,
        transport: "system",
      });
    } finally {
      modelDownloadAbortController = null;
    }
  })();

  return {
    ok: true,
    started: true,
    model: curated.filename,
  };
}

function cancelModelInstall() {
  if (!modelManagerOperation.active || modelManagerOperation.action !== "install" || !modelDownloadAbortController) {
    throw new Error("No model download is currently active");
  }
  modelDownloadAbortController.abort();
  return { ok: true, cancelled: true, model: modelManagerOperation.modelName };
}

async function deleteModel(filename) {
  const modelName = String(filename || "").trim();
  if (!modelName) {
    throw new Error("Model filename is required");
  }
  if (modelManagerOperation.active) {
    throw new Error("Another model operation is already running");
  }

  const targetPath = path.join(MODELS_DIR, modelName);
  if (!fs.existsSync(targetPath)) {
    throw new Error("Model file not found");
  }

  const installed = getInstalledModels();
  const remainingChoices = installed
    .map((model) => model.filename)
    .filter((name) => name !== modelName);

  updateModelManagerOperation({
    active: true,
    action: "delete",
    modelId: null,
    modelName,
    error: null,
  });

  if (modelName === currentModelName) {
    if (!remainingChoices.length) {
      updateModelManagerOperation({ active: false, error: "Cannot delete the last installed model" });
      throw new Error("Cannot delete the last installed model");
    }
    const fallbackModel = remainingChoices.includes(DEFAULT_MODEL_NAME)
      ? DEFAULT_MODEL_NAME
      : remainingChoices[0];
    await switchModel(fallbackModel);
  }

  fs.unlinkSync(targetPath);
  if (appSettings.lastModelName === modelName) {
    resolveCurrentModelName();
  }

  updateModelManagerOperation({
    active: false,
    error: null,
    modelName: null,
  });
  broadcast("status", { llm: llmStatus });
  addMessage({
    direction: "system",
    sender: "models",
    recipient: "-",
    text: `Model deleted: ${modelName}`,
    transport: "system",
  });

  return {
    ok: true,
    deleted: modelName,
    currentModel: currentModelName,
  };
}

function stopBridge() {
  if (nodesRefreshInterval) {
    clearInterval(nodesRefreshInterval);
    nodesRefreshInterval = null;
  }
  if (bridgeProcess && !bridgeProcess.killed) {
    try {
      bridgeProcess.kill();
    } catch {}
  }
  bridgeProcess = null;
}

function startBridge() {
  const pythonLauncher = findPythonLauncher();
  if (!pythonLauncher) {
    updateMeshtasticStatus({ connected: false, mode: "error", error: "Python not found in PATH" });
    return;
  }

  const dependencyReady = ensureMeshtasticDependency(pythonLauncher);
  if (!dependencyReady) {
    updateMeshtasticStatus({ connected: false, mode: "error", error: "Failed to install/load meshtastic package" });
    return;
  }

  updateMeshtasticStatus({ connected: false, mode: "starting", error: null });

  try {
    bridgeProcess = spawn(pythonLauncher, ["bridge.py"], {
      cwd: __dirname,
      env: buildPythonEnv(true),
      stdio: ["pipe", "pipe", "pipe"],
      shell: false,
      windowsHide: true,
    });
  } catch (error) {
    updateMeshtasticStatus({ connected: false, mode: "error", error: `bridge spawn failed: ${error.message}` });
    return;
  }

  const activeBridge = bridgeProcess;
  bridgeProcess.stdin.setDefaultEncoding("utf8");
  bridgeProcess.stdout.setEncoding("utf8");
  bridgeProcess.stderr.setEncoding("utf8");

  let stdoutBuffer = "";
  bridgeProcess.stdout.on("data", (chunk) => {
    stdoutBuffer += chunk;
    let newlineIndex = stdoutBuffer.indexOf("\n");
    while (newlineIndex !== -1) {
      const line = stdoutBuffer.slice(0, newlineIndex).trim();
      stdoutBuffer = stdoutBuffer.slice(newlineIndex + 1);
      if (line) {
        if (!line.startsWith("{")) {
          addMessage({
            direction: "system",
            sender: "bridge",
            recipient: "-",
            text: line,
            transport: "stdout",
          });
          newlineIndex = stdoutBuffer.indexOf("\n");
          continue;
        }
        try {
          const message = JSON.parse(line);
          if (message.type === "status") {
            if (activeBridge !== bridgeProcess) {
              newlineIndex = stdoutBuffer.indexOf("\n");
              continue;
            }
            updateMeshtasticStatus(message.payload);
          } else if (message.type === "nodes") {
            mergeBridgeNodes(message.payload?.nodes || []);
          } else if (message.type === "packet") {
            mergePacket(message.payload?.sender, message.payload);
          } else if (message.type === "telemetry") {
            mergeTelemetry(message.payload?.sender, message.payload);
            addMessage({
              direction: "system",
              sender: message.payload?.sender || "telemetry",
              recipient: message.payload?.recipient || "-",
              text: `telemetry ${JSON.stringify(message.payload?.telemetry || {})}`,
              transport: "telemetry",
            });
          } else if (message.type === "inbound") {
            handleInboundMesh(message.payload).catch((error) => {
              addMessage({
                direction: "system",
                sender: "bridge",
                recipient: "-",
                text: `Inbound handling failed: ${error.message}`,
                transport: "system",
              });
            });
          } else if (message.type === "sent") {
            if (activeBridge !== bridgeProcess) {
              newlineIndex = stdoutBuffer.indexOf("\n");
              continue;
            }
            updateMeshtasticStatus({ connected: true, mode: "serial", error: null });
            if (message.payload?.wantAck) {
              const deliveryState = message.payload?.acked === false
                ? "mesh ack timeout"
                : (message.payload?.acked === true ? "mesh ack ok" : "mesh queued");
              addMessage({
                direction: "system",
                sender: "bridge",
                recipient: message.payload?.destinationId || "-",
                text: `${deliveryState}: ${message.payload?.text || ""}`,
                transport: "system",
              });
            }
          } else if (message.type === "error") {
            if (activeBridge === bridgeProcess) {
              updateMeshtasticStatus({ error: message.payload.message || "bridge error" });
            }
            addMessage({
              direction: "system",
              sender: "bridge",
              recipient: message.payload?.destinationId || "-",
              text: message.payload?.message || "bridge error",
              transport: "system",
            });
          }
        } catch (error) {
          addMessage({
            direction: "system",
            sender: "bridge",
            recipient: "-",
            text: `Bridge parse error: ${error.message}`,
            transport: "system",
          });
        }
      }
      newlineIndex = stdoutBuffer.indexOf("\n");
    }
  });

  bridgeProcess.stderr.on("data", (chunk) => {
    addMessage({
      direction: "system",
      sender: "bridge",
      recipient: "-",
      text: chunk.trim(),
      transport: "stderr",
    });
  });

  bridgeProcess.on("exit", (code) => {
    if (activeBridge !== bridgeProcess) {
      return;
    }
    stopBridge();
    updateMeshtasticStatus({ connected: false, mode: "stopped", error: `bridge exited with code ${code}` });
  });

  if (nodesRefreshInterval) {
    clearInterval(nodesRefreshInterval);
  }
  nodesRefreshInterval = setInterval(() => {
    try {
      sendBridge({ type: "refresh_nodes", payload: {} });
    } catch {}
  }, 15000);

  setTimeout(() => {
    try {
      sendBridge({ type: "refresh_nodes", payload: {} });
    } catch {}
  }, 1500);
}

function restartBridge(port = undefined) {
  if (port !== undefined) {
    setConfiguredMeshtasticPort(port);
  }
  stopBridge();
  startBridge();
  return getMeshtasticStatusPayload({ mode: "starting", error: null });
}

const server = http.createServer(async (req, res) => {
  try {
    if (!req.url) {
      return sendJson(res, 404, { error: "not found" });
    }

    if (req.method === "GET" && req.url === "/events") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });
      res.write(`event: status\ndata: ${JSON.stringify({ meshtastic: getMeshtasticStatusPayload(), llm: llmStatus })}\n\n`);
      res.write(`event: nodes\ndata: ${JSON.stringify(getNodesPayload())}\n\n`);
      clients.add(res);
      req.on("close", () => clients.delete(res));
      return;
    }

    if (req.method === "GET" && req.url === "/api/status") {
      const health = await llamaHealth();
      if (health.ok) {
        llmStatus = { ...llmStatus, connected: true, mode: "local-llama", model: currentModelName, error: null };
      }
      return sendJson(res, 200, {
        meshtastic: getMeshtasticStatusPayload(),
        llm: { ...llmStatus, health, availableModels: listAvailableModels(), currentModel: currentModelName },
      });
    }

    if (req.method === "GET" && req.url === "/api/meshtastic/ports") {
      return sendJson(res, 200, listMeshtasticPorts());
    }

    if (req.method === "POST" && req.url === "/api/meshtastic/connect") {
      const body = await readJson(req);
      const port = Object.prototype.hasOwnProperty.call(body, "port")
        ? String(body.port || "").trim()
        : undefined;
      const status = restartBridge(port);
      return sendJson(res, 200, { ok: true, meshtastic: status, ports: listMeshtasticPorts() });
    }

    if (req.method === "GET" && req.url === "/api/messages") {
      return sendJson(res, 200, messages);
    }

    if (req.method === "POST" && req.url === "/api/messages/clear") {
      try {
        const body = await readJson(req);
        const result = clearMessages(body.scope, body.peerId);
        return sendJson(res, 200, result);
      } catch (error) {
        return sendJson(res, 400, { error: error.message });
      }
    }

    if (req.method === "GET" && req.url === "/api/nodes") {
      return sendJson(res, 200, getNodesPayload());
    }

    if (req.method === "GET" && req.url.startsWith("/api/node-raw")) {
      const requestUrl = new URL(req.url, `http://${HOST}:${PORT}`);
      const id = String(requestUrl.searchParams.get("id") || "").trim();
      if (!id) {
        return sendJson(res, 400, { error: "id is required" });
      }
      const node = knownNodes[id];
      if (!node) {
        return sendJson(res, 404, { error: "node not found" });
      }
      return sendJson(res, 200, {
        id,
        userId: node.userId || node.id,
        shortName: node.shortName || "",
        longName: node.longName || "",
        role: node.role || "generic",
        online: isNodeOnline(node),
        live: Array.isArray(node.observedPortnums) && node.observedPortnums.length > 0,
        observedPortnums: node.observedPortnums || [],
        lastDecoded: node.lastDecoded || null,
        raw: node.raw || null,
        lastPacket: node.lastPacket || null,
      });
    }

    if (req.method === "GET" && req.url === "/api/models") {
      return sendJson(res, 200, { currentModel: currentModelName, availableModels: listAvailableModels(), llm: llmStatus });
    }

    if (req.method === "GET" && req.url === "/api/models/manager") {
      return sendJson(res, 200, getModelManagerPayload());
    }

    if (req.method === "POST" && req.url === "/api/models/select") {
      const body = await readJson(req);
      const model = String(body.model || "").trim();
      if (!model) {
        return sendJson(res, 400, { error: "model is required" });
      }
      const result = await switchModel(model);
      return sendJson(res, 200, result);
    }

    if (req.method === "POST" && req.url === "/api/models/install") {
      const body = await readJson(req);
      const modelId = String(body.modelId || "").trim();
      if (!modelId) {
        return sendJson(res, 400, { error: "modelId is required" });
      }
      const result = installModel(modelId);
      return sendJson(res, 202, result);
    }

    if (req.method === "POST" && req.url === "/api/models/cancel") {
      const result = cancelModelInstall();
      return sendJson(res, 200, result);
    }

    if (req.method === "POST" && req.url === "/api/models/delete") {
      const body = await readJson(req);
      const filename = String(body.filename || "").trim();
      if (!filename) {
        return sendJson(res, 400, { error: "filename is required" });
      }
      const result = await deleteModel(filename);
      return sendJson(res, 200, result);
    }

    if (req.method === "GET" && req.url === "/api/ai-settings") {
      return sendJson(res, 200, { currentModel: currentModelName, settings: getAiSettingsPayload() });
    }

    if (req.method === "POST" && req.url === "/api/ai-settings") {
      const body = await readJson(req);
      const settings = updateAiSettings(body.settings || body);
      return sendJson(res, 200, { ok: true, currentModel: currentModelName, settings });
    }

    if (req.method === "POST" && req.url === "/api/chat") {
      const body = await readJson(req);
      const peerId = String(body.peerId || "").trim();
      const text = String(body.text || "").trim();
      if (!peerId || !text) {
        return sendJson(res, 400, { error: "peerId and text are required" });
      }
      addMessage({ direction: "in", sender: peerId, recipient: "local-ai", text, transport: "web" });
      const reply = await generateReply(peerId, text);
      addMessage({ direction: "out", sender: "local-ai", recipient: peerId, text: reply, transport: "web" });
      return sendJson(res, 200, { reply });
    }

    if (req.method === "POST" && req.url === "/api/mesh/send") {
      const body = await readJson(req);
      const destinationId = String(body.destinationId || "").trim();
      const text = String(body.text || "").trim();
      if (!destinationId || !text) {
        return sendJson(res, 400, { error: "destinationId and text are required" });
      }
      await sendMeshReply(destinationId, text, "local-ui");
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === "GET" && req.url === "/api/cashu") {
      return sendJson(res, 200, getCashuPayload());
    }

    if (req.method === "POST" && req.url === "/api/cashu/mint") {
      const body = await readJson(req);
      const mintUrl = String(body.mintUrl || "").trim();
      if (!mintUrl) return sendJson(res, 400, { error: "mintUrl required" });
      try {
        const result = await cashuSetMint(mintUrl);
        return sendJson(res, 200, result);
      } catch (e) {
        return sendJson(res, 502, { error: `Mint unreachable: ${e.message}` });
      }
    }

    if (req.method === "POST" && req.url === "/api/cashu/invoice") {
      const body = await readJson(req);
      const amount = Number(body.amount);
      if (!amount || amount <= 0) return sendJson(res, 400, { error: "amount required" });
      try {
        const result = await cashuCreateInvoice(amount);
        const qr = await generateLightningQr(result.pr);
        return sendJson(res, 200, { ...result, qr });
      } catch (e) {
        return sendJson(res, 502, { error: e.message });
      }
    }

    if (req.method === "POST" && req.url === "/api/cashu/check") {
      const body = await readJson(req);
      const hash = String(body.hash || "").trim();
      if (!hash) return sendJson(res, 400, { error: "hash required" });
      try {
        const result = await cashuCheckInvoice(hash);
        return sendJson(res, 200, result);
      } catch (e) {
        return sendJson(res, 402, { error: e.message });
      }
    }

    if (req.method === "POST" && req.url === "/api/cashu/send") {
      const body = await readJson(req);
      const amount = Number(body.amount);
      if (!amount || amount <= 0) return sendJson(res, 400, { error: "amount required" });
      try {
        const result = await cashuSendToken(amount);
        addCashuHistory({ direction: "Sent", amount, unit: "sats", peer: body.peer || "Cashu token", status: "Token created" });
        persistCashu();
        return sendJson(res, 200, result);
      } catch (e) {
        return sendJson(res, 400, { error: e.message });
      }
    }

    if (req.method === "POST" && req.url === "/api/cashu/receive") {
      const body = await readJson(req);
      const token = String(body.token || "").trim();
      if (!token) return sendJson(res, 400, { error: "token required" });
      try {
        const result = await cashuReceiveToken(token);
        return sendJson(res, 200, result);
      } catch (e) {
        return sendJson(res, 400, { error: e.message });
      }
    }

    if (req.method === "POST" && req.url === "/api/cashu/melt") {
      const body = await readJson(req);
      const pr = String(body.pr || "").trim();
      if (!pr) return sendJson(res, 400, { error: "Lightning invoice (pr) required" });
      try {
        const result = await cashuMeltToLightning(pr);
        return sendJson(res, 200, result);
      } catch (e) {
        return sendJson(res, 400, { error: e.message });
      }
    }

    if (req.method === "GET" && req.url === "/api/wallet") {
      return sendJson(res, 200, getWalletPayload());
    }

    if (req.method === "POST" && req.url === "/api/wallet/create") {
      if (walletData) {
        return sendJson(res, 409, { error: "Wallet already exists. Reset first." });
      }
      const result = createWallet();
      return sendJson(res, 200, result);
    }

    if (req.method === "GET" && req.url === "/api/wallet/balance") {
      if (!walletData) return sendJson(res, 404, { error: "No wallet" });
      const balance = await fetchBtcBalance(walletData.address);
      if (!balance) return sendJson(res, 502, { error: "Could not reach mempool.space" });
      return sendJson(res, 200, balance);
    }

    if (req.method === "GET" && req.url === "/api/wallet/transactions") {
      if (!walletData) return sendJson(res, 404, { error: "No wallet" });
      const txs = await fetchBtcTransactions(walletData.address);
      return sendJson(res, 200, { transactions: txs });
    }

    if (req.method === "GET" && req.url === "/api/wallet/qr") {
      if (!walletData) return sendJson(res, 404, { error: "No wallet" });
      const qr = await generateWalletQr(walletData.address);
      return sendJson(res, 200, { qr });
    }

    if (req.method === "POST" && req.url === "/api/wallet/reset") {
      walletData = null;
      persistWallet();
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === "GET" && req.url === "/") {
      const filePath = path.join(STATIC_DIR, "index.html");
      if (!fs.existsSync(filePath)) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      let html = fs.readFileSync(filePath, "utf8");
      html = html.replace(
        '<link rel="stylesheet" href="/static/styles.css">',
        '<link rel="icon" type="image/png" href="/static/ico.png?v=2">\n  <link rel="stylesheet" href="/static/styles.css">'
      );
      html = html.replace(
        '<div class="titlebar-text">BLACKBOX NODE</div>',
        '<div class="titlebar-brand" style="display:flex;align-items:center;gap:10px;min-width:0;"><img src="/static/logo.svg" alt="" class="titlebar-logo" style="width:24px;height:24px;display:block;flex:0 0 auto;"><div class="titlebar-text">BLACKBOX NODE</div></div>'
      );
      html = html.replace(
        "</body>",
        '  <script src="/model-manager-ui.js" defer></script>\n</body>'
      );
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
      return;
    }

    if (req.method === "GET" && req.url === "/favicon.ico") {
      const filePath = path.join(STATIC_DIR, "ico.png");
      if (!fs.existsSync(filePath)) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      res.writeHead(200, { "Content-Type": "image/png" });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    if (req.method === "GET" && req.url === "/model-manager-ui.js") {
      res.writeHead(200, { "Content-Type": "application/javascript; charset=utf-8" });
      res.end(getModelManagerUiScript());
      return;
    }

    if (req.method === "GET" && req.url.startsWith("/static/")) {
      const filePath = path.join(STATIC_DIR, req.url.replace("/static/", ""));

      if (!fs.existsSync(filePath)) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      const ext = path.extname(filePath);
      const contentType = {
        ".html": "text/html; charset=utf-8",
        ".js": "application/javascript; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".svg": "image/svg+xml; charset=utf-8",
        ".png": "image/png",
      }[ext] || "application/octet-stream";

      res.writeHead(200, { "Content-Type": contentType });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    sendJson(res, 404, { error: "not found" });
  } catch (error) {
    sendJson(res, 500, { error: String(error.message || error) });
  }
});

server.on("error", (error) => {
  if (error && error.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use on ${HOST}. Stop the other process or start this app with PORT=<free-port> npm start`,
    );
    process.exit(1);
  }
  throw error;
});

server.listen(PORT, HOST, () => {
  console.log(`Localist listening at http://${HOST}:${PORT}`);
  startLlamaServer();
  startBridge();
  openBrowser();
});
