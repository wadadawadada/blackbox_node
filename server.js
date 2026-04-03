const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const { spawnSync, spawn } = require("child_process");
const { webcrypto } = require("crypto");

// cashu-ts expects Web Crypto APIs on globalThis.
// Older Node runtimes may not expose them there by default.
if ((!globalThis.crypto || typeof globalThis.crypto.getRandomValues !== "function") && webcrypto) {
  Object.defineProperty(globalThis, "crypto", {
    value: webcrypto,
    configurable: true,
    writable: true,
  });
}

const HOST = "127.0.0.1";
const DEFAULT_PORT = 7860;
const parsedPort = Number.parseInt(process.env.PORT || "", 10);
const PORT = Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : DEFAULT_PORT;
const STATIC_DIR = path.join(__dirname, "static");
const DATA_DIR = path.join(__dirname, "data");
const TAK_CAPTURE_DIR = path.join(DATA_DIR, "tak_capture");
const DB_FILE = path.join(DATA_DIR, "messages.json");
const NODES_FILE = path.join(DATA_DIR, "nodes.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const WALLET_FILE = path.join(DATA_DIR, "wallet.json");
const CASHU_FILE = path.join(DATA_DIR, "cashu.json");
const TEST_WALLET_FILE = path.join(DATA_DIR, "test_wallet.json");
const TEST_CASHU_FILE = path.join(DATA_DIR, "test_cashu.json");
const TEST_CASHU_DEFAULT_MINT = "https://cashu.mutinynet.com";
const MUTINYNET_FAUCET_URL = "https://faucet.mutinynet.com";
const SWAPS_FILE = path.join(DATA_DIR, "swaps.json");
const PYDEPS_DIR = path.join(__dirname, "pydeps");
const LLAMA_DIR = path.join(__dirname, "llama");
const LLAMA_EXE = process.platform === "win32"
  ? path.join(LLAMA_DIR, "llama-server.exe")
  : (() => { try { return require("child_process").execSync("which llama-server", { encoding: "utf8" }).trim(); } catch { return path.join(LLAMA_DIR, "llama-server"); } })();
const MODELS_DIR = path.join(__dirname, "models");
const LLM_HOST = "127.0.0.1";
const LLM_PORT = (() => {
  const env = parseInt(process.env.LLM_PORT, 10);
  return Number.isInteger(env) && env > 0 ? env : 8080;
})();
const LLM_BASE_URL = `http://${LLM_HOST}:${LLM_PORT}`;
const DEFAULT_MODEL_NAME = "Qwen2.5-0.5B-Instruct-Q4_K_M.gguf";
const CURATED_MODELS = [
  {
    id: "smollm2-135m-iq4xs",
    name: "SmolLM2 135M Instruct IQ4_XS",
    filename: "SmolLM2-135M-Instruct-IQ4_XS.gguf",
    url: "https://huggingface.co/bartowski/SmolLM2-135M-Instruct-GGUF/resolve/main/SmolLM2-135M-Instruct-IQ4_XS.gguf?download=true",
    sizeBytes: 90897760,
    family: "Pi Chat",
    notes: "Tier XS | under 100 MB | emergency fallback for the weakest hardware.",
  },
  {
    id: "qwen25-05b-q4km",
    name: "Qwen2.5 0.5B Instruct Q4_K_M",
    filename: "Qwen2.5-0.5B-Instruct-Q4_K_M.gguf",
    url: "https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf?download=true",
    sizeBytes: 397808192,
    family: "Pi Chat",
    notes: "Tier S | about 400 MB | best default balance of speed and quality for compact devices.",
  },
  {
    id: "tinyllama-11b-q4km",
    name: "TinyLlama 1.1B Chat v1.0 Q4_K_M",
    filename: "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf",
    url: "https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf?download=true",
    sizeBytes: 670000000,
    family: "Pi Chat",
    notes: "Tier M | about 670 MB | lightweight chat model that feels more capable than sub-500M options.",
  },
  {
    id: "smollm2-17b-q4km",
    name: "SmolLM2 1.7B Instruct Q4_K_M",
    filename: "SmolLM2-1.7B-Instruct-Q4_K_M.gguf",
    url: "https://huggingface.co/bartowski/SmolLM2-1.7B-Instruct-GGUF/resolve/main/SmolLM2-1.7B-Instruct-Q4_K_M.gguf?download=true",
    sizeBytes: 1055609824,
    family: "Pi Chat",
    notes: "Tier L | about 1.1 GB | stronger small-chat option for constrained hardware.",
  },
  {
    id: "qwen25-3b-q4km",
    name: "Qwen2.5 3B Instruct Q4_K_M",
    filename: "Qwen2.5-3B-Instruct-Q4_K_M.gguf",
    url: "https://huggingface.co/Qwen/Qwen2.5-3B-Instruct-GGUF/resolve/main/qwen2.5-3b-instruct-q4_k_m.gguf?download=true",
    sizeBytes: 2120000000,
    family: "Pi Chat",
    notes: "Tier XL | about 2.1 GB | strongest practical general chat model in this compact catalog.",
  },
  {
    id: "qwen25-coder-05b-q4km",
    name: "Qwen2.5 Coder 0.5B Instruct Q4_K_M",
    filename: "Qwen2.5-Coder-0.5B-Instruct-Q4_K_M.gguf",
    url: "https://huggingface.co/bartowski/Qwen2.5-Coder-0.5B-Instruct-GGUF/resolve/main/Qwen2.5-Coder-0.5B-Instruct-Q4_K_M.gguf?download=true",
    sizeBytes: 397808288,
    family: "Pi Coder",
    notes: "Tier S | about 400 MB | smallest genuinely useful coding model for weak hardware.",
  },
  {
    id: "deepseek-coder-13b-q4km",
    name: "DeepSeek Coder 1.3B Instruct Q4_K_M",
    filename: "deepseek-coder-1.3b-instruct.Q4_K_M.gguf",
    url: "https://huggingface.co/TheBloke/deepseek-coder-1.3b-instruct-GGUF/resolve/main/deepseek-coder-1.3b-instruct.Q4_K_M.gguf?download=true",
    sizeBytes: 813000000,
    family: "Pi Coder",
    notes: "Tier M | about 800 MB | better code completion while still manageable on compact hardware.",
  },
  {
    id: "qwen25-coder-15b-q5km",
    name: "Qwen2.5 Coder 1.5B Instruct Q5_K_M",
    filename: "Qwen2.5-Coder-1.5B-Instruct.Q5_K_M.gguf",
    url: "https://huggingface.co/MaziyarPanahi/Qwen2.5-Coder-1.5B-Instruct-GGUF/resolve/main/Qwen2.5-Coder-1.5B-Instruct.Q5_K_M.gguf?download=true",
    sizeBytes: 1130000000,
    family: "Pi Coder",
    notes: "Tier L | about 1.1 GB | compact coding model with noticeably better reasoning than 0.5B.",
  },
  {
    id: "stable-code-3b-q4km",
    name: "Stable Code 3B Q4_K_M",
    filename: "stable-code-3b.Q4_K_M.gguf",
    url: "https://huggingface.co/TheBloke/stable-code-3b-GGUF/resolve/main/stable-code-3b.Q4_K_M.gguf?download=true",
    sizeBytes: 1710000000,
    family: "Pi Coder",
    notes: "Tier XL | about 1.7 GB | stronger code-specialized option when you can spare more RAM.",
  },
  {
    id: "qwen25-coder-3b-q4km",
    name: "Qwen2.5 Coder 3B Instruct Q4_K_M",
    filename: "Qwen2.5-Coder-3B-Instruct-Q4_K_M.gguf",
    url: "https://huggingface.co/bartowski/Qwen2.5-Coder-3B-Instruct-GGUF/resolve/main/Qwen2.5-Coder-3B-Instruct-Q4_K_M.gguf?download=true",
    sizeBytes: 1929903360,
    family: "Pi Coder",
    notes: "Tier XXL | about 1.9 GB | best coding model in this catalog before moving into heavy desktop-class sizes.",
  },
  {
    id: "deepseek-r1-qwen-15b-q4km",
    name: "DeepSeek R1 Distill Qwen 1.5B Q4_K_M",
    filename: "DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M.gguf",
    url: "https://huggingface.co/bartowski/DeepSeek-R1-Distill-Qwen-1.5B-GGUF/resolve/main/DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M.gguf?download=true",
    sizeBytes: 1117320800,
    family: "DeepSeek",
    notes: "Tier L | about 1.1 GB | compact reasoning-oriented DeepSeek for constrained hardware.",
  },
  {
    id: "mistral-7b-v03-q3km",
    name: "Mistral 7B Instruct v0.3 Q3_K_M",
    filename: "mistral-7b-instruct-v0.3.Q3_K_M.gguf",
    url: "https://huggingface.co/SanctumAI/Mistral-7B-Instruct-v0.3-GGUF/resolve/main/mistral-7b-instruct-v0.3.Q3_K_M.gguf?download=true",
    sizeBytes: 3522940864,
    family: "Mistral",
    notes: "Tier M1 | about 3.5 GB | entry point into real Mistral models on compact systems.",
  },
  {
    id: "ministral-8b-q4km",
    name: "Ministral 8B Instruct 2410 Q4_K_M",
    filename: "Ministral-8B-Instruct-2410-Q4_K_M.gguf",
    url: "https://huggingface.co/bartowski/Ministral-8B-Instruct-2410-GGUF/resolve/main/Ministral-8B-Instruct-2410-Q4_K_M.gguf?download=true",
    sizeBytes: 4911500096,
    family: "Mistral",
    notes: "Tier M2 | about 4.9 GB | newer Mistral-family instruct model with a good quality-to-size tradeoff.",
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
const MESH_PACKET_MAX_BYTES_CASHU = 72;
const MESH_PACKET_BATCH_DELAY_MS = 3200;
const MESH_PACKET_BATCH_DELAY_MS_CASHU = 6000;
const MESH_ACK_RETRY_COUNT = 1;
const MESH_ACK_RETRY_DELAY_MS = 1800;
const WEATHER_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const NODE_ONLINE_MAX_AGE_MS = 5 * 60 * 1000;
const NODES_STATUS_PUSH_INTERVAL_MS = 60 * 1000;
const MIN_VALID_MODEL_BYTES = 1024 * 1024;

const sessions = new Map();
const clients = new Set();
const latestTakFeatures = new Map(); // uid -> feature
let nodesRefreshInterval = null;
let nodesStatusPushInterval = null;
let messages = [];
let knownNodes = {};
let appSettings = {};
let walletData = null;
let cashuData = { mintUrl: "", proofs: [], pendingInvoices: [], pendingSwapProofs: [], receivedSecrets: [], offgridSecrets: [], offgridPackets: [], history: [] };
let testWalletData = null;
let testCashuData = { mintUrl: TEST_CASHU_DEFAULT_MINT, proofs: [], pendingInvoices: [], pendingSwapProofs: [], receivedSecrets: [], offgridSecrets: [], offgridPackets: [], history: [] };
let swaps = [];
let meshtasticStatus = { connected: false, mode: "starting", error: null };
let localMeshNodeId = null;
// Observed mesh links from relayNode field in packets: key = "fromMeshNum|viaMeshNum"
const MESH_LINK_TTL_MS = 5 * 60 * 1000;
let meshLinks = {};
let currentModelName = DEFAULT_MODEL_NAME;
let llmStatus = { connected: false, mode: "starting", model: currentModelName, error: null, switching: false };
let meshSendQueue = Promise.resolve();
// Map clientMsgId -> message.id (for linking sent event to outgoing message)
const pendingMsgByClientId = new Map();
// Map packetId -> message.id (for linking routing ack to outgoing message)
const pendingMsgByPacketId = new Map();
let modelManagerOperation = {
  active: false,
  action: null,
  modelId: null,
  modelName: null,
  error: null,
  cancelling: false,
  progress: 0,
  bytesDownloaded: 0,
  bytesTotal: 0,
};
let modelDownloadAbortController = null;

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(TAK_CAPTURE_DIR, { recursive: true });
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
    cashuData = { mintUrl: "", proofs: [], pendingInvoices: [], pendingSwapProofs: [], receivedSecrets: [], offgridSecrets: [], offgridPackets: [], history: [], ...loaded };
    if (!Array.isArray(cashuData.offgridSecrets)) {
      cashuData.offgridSecrets = (cashuData.proofs || []).map((proof) => String(proof?.secret || "")).filter(Boolean);
    }
  } catch { /* keep defaults */ }
}

if (fs.existsSync(TEST_WALLET_FILE)) {
  try {
    testWalletData = JSON.parse(fs.readFileSync(TEST_WALLET_FILE, "utf8"));
  } catch {
    testWalletData = null;
  }
}

if (fs.existsSync(TEST_CASHU_FILE)) {
  try {
    const loaded = JSON.parse(fs.readFileSync(TEST_CASHU_FILE, "utf8"));
    testCashuData = { mintUrl: TEST_CASHU_DEFAULT_MINT, proofs: [], pendingInvoices: [], pendingSwapProofs: [], receivedSecrets: [], offgridSecrets: [], offgridPackets: [], history: [], ...loaded };
    if (!Array.isArray(testCashuData.offgridSecrets)) {
      testCashuData.offgridSecrets = (testCashuData.proofs || []).map((proof) => String(proof?.secret || "")).filter(Boolean);
    }
    // Always enforce signet mint for test mode — never allow mainnet mint in test mode
    if (!testCashuData.mintUrl || getMintNetwork(testCashuData.mintUrl) === "mainnet") {
      testCashuData.mintUrl = TEST_CASHU_DEFAULT_MINT;
    }
  } catch { /* keep defaults */ }
}

if (fs.existsSync(SWAPS_FILE)) {
  try { swaps = JSON.parse(fs.readFileSync(SWAPS_FILE, "utf8")); } catch { swaps = []; }
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

function getConfiguredTakChannel() {
  return normalizeChannelIndex(appSettings.takMeshtasticChannel, 0);
}

function setConfiguredTakChannel(channel) {
  appSettings.takMeshtasticChannel = normalizeChannelIndex(channel, 0);
  persistSettings();
}

function normalizeChannelIndex(value, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? fallback), 10);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 7 ? parsed : fallback;
}

function getConfiguredTakHopLimit() {
  const value = Number.parseInt(String(appSettings.takHopLimit ?? "3"), 10);
  return Number.isInteger(value) && value >= 0 && value <= 7 ? value : 3;
}

function setConfiguredTakHopLimit(hopLimit) {
  const value = Number.parseInt(String(hopLimit ?? "3"), 10);
  appSettings.takHopLimit = Number.isInteger(value) && value >= 0 && value <= 7 ? value : 3;
  persistSettings();
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
    takChannel: getConfiguredTakChannel(),
    takHopLimit: getConfiguredTakHopLimit(),
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

function isTestMode() {
  return typeof appSettings.walletTestMode === "boolean" ? appSettings.walletTestMode : true;
}

function isMeshAiReplyEnabled() {
  return Boolean(appSettings.meshAiReply);
}

function getActiveWalletData() {
  return isTestMode() ? testWalletData : walletData;
}

function getActiveCashuData() {
  return isTestMode() ? testCashuData : cashuData;
}

function persistActiveCashu() {
  if (isTestMode()) {
    fs.writeFileSync(TEST_CASHU_FILE, JSON.stringify(testCashuData, null, 2), "utf8");
  } else {
    fs.writeFileSync(CASHU_FILE, JSON.stringify(cashuData, null, 2), "utf8");
  }
}

const _cashuOpLocks = new Map();

function getCashuLockKey() {
  return isTestMode() ? "test" : "prod";
}

async function withCashuLock(fn) {
  const key = getCashuLockKey();
  const previous = _cashuOpLocks.get(key) || Promise.resolve();
  let release;
  const current = new Promise((resolve) => { release = resolve; });
  const queued = previous.finally(() => current);
  _cashuOpLocks.set(key, queued);
  await previous;
  try {
    return await fn();
  } finally {
    release();
    if (_cashuOpLocks.get(key) === queued) {
      _cashuOpLocks.delete(key);
    }
  }
}

function normalizeCashuError(error) {
  const message = String(error?.message || error || "Cashu operation failed");
  if (message.toLowerCase().includes("token already spent")) {
    return "Cashu proofs were already spent. This usually means the same send/payment was submitted twice or the local wallet state is stale.";
  }
  return message;
}

function persistWallet() {
  if (walletData) {
    fs.writeFileSync(WALLET_FILE, JSON.stringify(walletData, null, 2), "utf8");
  } else if (fs.existsSync(WALLET_FILE)) {
    fs.unlinkSync(WALLET_FILE);
  }
}

function persistTestWallet() {
  if (testWalletData) {
    fs.writeFileSync(TEST_WALLET_FILE, JSON.stringify(testWalletData, null, 2), "utf8");
  } else if (fs.existsSync(TEST_WALLET_FILE)) {
    fs.unlinkSync(TEST_WALLET_FILE);
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

function createTestWallet() {
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
    const child = root.derive(`m/84'/1'/0'/0/${i}`);
    const pubkey = child.publicKey;
    const pubkeyHash = ripemd160(sha256(pubkey));
    const words5 = bech32.toWords(pubkeyHash);
    addresses.push(bech32.encode("tb", [0, ...words5]));
  }

  testWalletData = {
    address: addresses[0],
    addresses,
    derivationPath: "m/84'/1'/0'/0/0",
    network: "testnet",
    type: "P2WPKH",
    createdAt: new Date().toISOString(),
    mnemonic,
  };
  persistTestWallet();
  return { address: addresses[0], mnemonic, addresses };
}

function getWalletPayload() {
  const data = getActiveWalletData();
  if (!data) {
    return {
      configured: false,
      testMode: isTestMode(),
    };
  }
  return {
    configured: true,
    testMode: isTestMode(),
    address: data.address,
    addresses: data.addresses || [data.address],
    derivationPath: data.derivationPath,
    network: data.network,
    type: data.type,
    createdAt: data.createdAt,
    mnemonic: data.mnemonic || null,
  };
}

function getMempoolBase() {
  return isTestMode() ? "https://mutinynet.com/api" : "https://mempool.space/api";
}

async function fetchBtcBalance(address) {
  const https = require("https");
  return new Promise((resolve) => {
    const url = `${getMempoolBase()}/address/${encodeURIComponent(address)}`;
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
    const url = `${getMempoolBase()}/address/${encodeURIComponent(address)}/txs`;
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

async function fetchBtcUtxos(address) {
  const https = require("https");
  return new Promise((resolve) => {
    const url = `${getMempoolBase()}/address/${encodeURIComponent(address)}/utxo`;
    const req = https.get(url, { timeout: 8000 }, (res) => {
      let body = "";
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => {
        try { resolve(JSON.parse(body)); } catch { resolve([]); }
      });
    });
    req.on("error", () => resolve([]));
    req.on("timeout", () => { req.destroy(); resolve([]); });
  });
}

async function fetchFeeEstimate() {
  const https = require("https");
  return new Promise((resolve) => {
    const url = `${getMempoolBase()}/v1/fees/recommended`;
    const req = https.get(url, { timeout: 8000 }, (res) => {
      let body = "";
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => {
        try { resolve(JSON.parse(body)); } catch { resolve({ fastestFee: 10, halfHourFee: 5, hourFee: 3, minimumFee: 1 }); }
      });
    });
    req.on("error", () => resolve({ fastestFee: 10, halfHourFee: 5, hourFee: 3, minimumFee: 1 }));
    req.on("timeout", () => { req.destroy(); resolve({ fastestFee: 10, halfHourFee: 5, hourFee: 3, minimumFee: 1 }); });
  });
}

function deriveWalletKey() {
  const { mnemonicToSeedSync } = require("@scure/bip39");
  const { HDKey } = require("@scure/bip32");
  const wd = getActiveWalletData();
  const seed = mnemonicToSeedSync(wd.mnemonic);
  return HDKey.fromMasterSeed(seed).derive(wd.derivationPath);
}

async function buildAndBroadcastBtcTx(toAddress, amountSats, feeRateSatPerVb) {
  const { Transaction, p2wpkh } = require("@scure/btc-signer");
  const btcNet = isTestMode() ? require("@scure/btc-signer").TEST_NETWORK : undefined;
  const https = require("https");

  const key = deriveWalletKey();
  const myAddress = getActiveWalletData().address;
  const script = p2wpkh(key.publicKey, btcNet).script;

  const utxos = await fetchBtcUtxos(myAddress);
  const confirmedUtxos = utxos.filter((u) => u.status && u.status.confirmed);
  if (!confirmedUtxos.length) throw new Error("No confirmed UTXOs — wallet has no spendable funds");

  // vbyte estimates for P2WPKH: overhead=10, input=68, output=31
  // Select UTXOs greedily
  const selected = [];
  let inputTotal = 0n;
  for (const utxo of confirmedUtxos) {
    selected.push(utxo);
    inputTotal += BigInt(utxo.value);
    const estVbytes = 10 + selected.length * 68 + 31 * 2;
    const estFee = BigInt(Math.ceil(estVbytes * feeRateSatPerVb));
    if (inputTotal >= BigInt(amountSats) + estFee) break;
  }

  const estVbytes = 10 + selected.length * 68 + 31 * 2;
  const fee = BigInt(Math.ceil(estVbytes * feeRateSatPerVb));
  const changeAmount = inputTotal - BigInt(amountSats) - fee;
  if (changeAmount < 0n) throw new Error(`Insufficient funds: need ${amountSats + Number(fee)} sats, have ${Number(inputTotal)}`);

  const tx = new Transaction();
  for (const utxo of selected) {
    tx.addInput({
      txid: utxo.txid,
      index: utxo.vout,
      witnessUtxo: { script, amount: BigInt(utxo.value) },
    });
  }
  tx.addOutputAddress(toAddress, BigInt(amountSats), btcNet);
  if (changeAmount >= 546n) {
    tx.addOutputAddress(myAddress, changeAmount, btcNet);
  }
  tx.sign(key.privateKey);
  tx.finalize();
  const rawHex = tx.hex;

  // Broadcast
  return new Promise((resolve, reject) => {
    const mempoolBase = getMempoolBase();
    const url = new URL(`${mempoolBase}/tx`);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: "POST",
      headers: { "Content-Type": "text/plain", "Content-Length": Buffer.byteLength(rawHex) },
      timeout: 15000,
    };
    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (d) => { body += d; });
      res.on("end", () => {
        if (res.statusCode === 200) { resolve({ txid: body.trim(), fee: Number(fee) }); }
        else { reject(new Error(`Broadcast failed (${res.statusCode}): ${body.trim().slice(0, 200)}`)); }
      });
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("Broadcast timeout")); });
    req.write(rawHex);
    req.end();
  });
}

// ─── End Wallet ───────────────────────────────────────────────────────────────

// ─── Cashu ────────────────────────────────────────────────────────────────────

function persistCashu() {
  fs.writeFileSync(CASHU_FILE, JSON.stringify(cashuData, null, 2), "utf8");
}

function getProofsBalance(proofs) {
  return (Array.isArray(proofs) ? proofs : []).reduce((sum, p) => sum + (p.amount || 0), 0);
}

function getCashuBalance() {
  return getProofsBalance(getActiveCashuData().proofs || []);
}

function getCashuPendingBalance() {
  return getProofsBalance(getActiveCashuData().pendingSwapProofs || []);
}

function createCashuOffgridPacket(proofs, amountOverride = null) {
  const secrets = [...new Set((Array.isArray(proofs) ? proofs : [])
    .map((proof) => String(proof?.secret || "").trim())
    .filter(Boolean))];
  return {
    id: `pkt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    amount: Math.max(0, Number(amountOverride ?? getProofsBalance(proofs)) || 0),
    secrets,
  };
}

function syncCashuOffgridState(cd = getActiveCashuData()) {
  const proofMap = new Map();
  for (const proof of Array.isArray(cd.proofs) ? cd.proofs : []) {
    const secret = String(proof?.secret || "").trim();
    if (secret) proofMap.set(secret, proof);
  }

  const normalizedPackets = [];
  const assignedSecrets = new Set();
  const hasPacketArray = Array.isArray(cd.offgridPackets);
  const sourcePackets = hasPacketArray ? cd.offgridPackets : null;
  const hasLegacySecrets = Array.isArray(cd.offgridSecrets) && cd.offgridSecrets.length > 0;

  if (hasPacketArray && (sourcePackets.length > 0 || !hasLegacySecrets)) {
    for (const packet of sourcePackets) {
      const packetSecrets = [];
      for (const rawSecret of Array.isArray(packet?.secrets) ? packet.secrets : []) {
        const secret = String(rawSecret || "").trim();
        if (!secret || assignedSecrets.has(secret) || !proofMap.has(secret)) continue;
        assignedSecrets.add(secret);
        packetSecrets.push(secret);
      }
      if (!packetSecrets.length) continue;
      const amount = packetSecrets.reduce((sum, secret) => sum + Number(proofMap.get(secret)?.amount || 0), 0);
      normalizedPackets.push({
        id: String(packet?.id || createCashuOffgridPacket([], 0).id),
        amount,
        secrets: packetSecrets,
      });
    }
  } else {
    const legacySecrets = [...new Set((Array.isArray(cd.offgridSecrets) ? cd.offgridSecrets : [])
      .map((secret) => String(secret || "").trim())
      .filter(Boolean))];
    for (const secret of legacySecrets) {
      if (assignedSecrets.has(secret)) continue;
      const proof = proofMap.get(secret);
      if (!proof) continue;
      assignedSecrets.add(secret);
      normalizedPackets.push(createCashuOffgridPacket([proof]));
    }
  }

  cd.offgridPackets = normalizedPackets;
  cd.offgridSecrets = [...normalizedPackets.flatMap((packet) => packet.secrets)];
  return { packets: cd.offgridPackets, secrets: cd.offgridSecrets };
}

function syncCashuOffgridSecrets(cd = getActiveCashuData()) {
  return syncCashuOffgridState(cd).secrets;
}

function getCashuOffgridPackets(cd = getActiveCashuData()) {
  return syncCashuOffgridState(cd).packets.map((packet) => ({
    id: packet.id,
    amount: Number(packet.amount || 0),
    secrets: [...packet.secrets],
  }));
}

function getCashuOffgridProofs(cd = getActiveCashuData()) {
  const offgridSecrets = new Set(syncCashuOffgridSecrets(cd));
  return (cd.proofs || []).filter((proof) => offgridSecrets.has(String(proof?.secret || "")));
}

function getCashuGeneralProofs(cd = getActiveCashuData()) {
  const offgridSecrets = new Set(syncCashuOffgridSecrets(cd));
  return (cd.proofs || []).filter((proof) => !offgridSecrets.has(String(proof?.secret || "")));
}

function getCashuOffgridBalance() {
  return getCashuOffgridPackets().reduce((sum, packet) => sum + Number(packet.amount || 0), 0);
}

function getCashuGeneralBalance() {
  return getProofsBalance(getCashuGeneralProofs());
}

function selectProofsByCounts(selection, proofs) {
  const normalized = new Map();
  for (const item of Array.isArray(selection) ? selection : []) {
    const amount = Math.floor(Number(item?.amount || 0));
    const count = Math.floor(Number(item?.count || 0));
    if (!(amount > 0) || !(count > 0)) continue;
    normalized.set(amount, (normalized.get(amount) || 0) + count);
  }
  if (!normalized.size) return null;

  const buckets = new Map();
  for (const proof of Array.isArray(proofs) ? proofs : []) {
    const amount = Math.floor(Number(proof?.amount || 0));
    if (!(amount > 0)) continue;
    if (!buckets.has(amount)) buckets.set(amount, []);
    buckets.get(amount).push(proof);
  }

  const send = [];
  for (const [amount, count] of normalized.entries()) {
    const bucket = buckets.get(amount) || [];
    if (bucket.length < count) {
      throw new Error(`Not enough ready ${amount} sats units.`);
    }
    for (let i = 0; i < count; i += 1) {
      send.push(bucket.pop());
    }
  }

  const sendSecrets = new Set(send.map((proof) => String(proof?.secret || "")).filter(Boolean));
  const keep = (Array.isArray(proofs) ? proofs : []).filter((proof) => !sendSecrets.has(String(proof?.secret || "")));
  return { send, returnChange: keep };
}

function selectOffgridPacketsByCounts(selection, packets) {
  const normalized = new Map();
  for (const item of Array.isArray(selection) ? selection : []) {
    const amount = Math.floor(Number(item?.amount || 0));
    const count = Math.floor(Number(item?.count || 0));
    if (!(amount > 0) || !(count > 0)) continue;
    normalized.set(amount, (normalized.get(amount) || 0) + count);
  }
  if (!normalized.size) return null;

  const buckets = new Map();
  for (const packet of Array.isArray(packets) ? packets : []) {
    const amount = Math.floor(Number(packet?.amount || 0));
    if (!(amount > 0)) continue;
    if (!buckets.has(amount)) buckets.set(amount, []);
    buckets.get(amount).push(packet);
  }

  const selectedPackets = [];
  for (const [amount, count] of normalized.entries()) {
    const bucket = buckets.get(amount) || [];
    if (bucket.length < count) {
      throw new Error(`Not enough ready ${amount} sats amounts.`);
    }
    for (let i = 0; i < count; i += 1) {
      selectedPackets.push(bucket.pop());
    }
  }

  const selectedIds = new Set(selectedPackets.map((packet) => String(packet?.id || "")).filter(Boolean));
  const remainingPackets = (Array.isArray(packets) ? packets : []).filter((packet) => !selectedIds.has(String(packet?.id || "")));
  return { selectedPackets, remainingPackets };
}

function groupCashuProofInventory(proofs, status = "confirmed") {
  const buckets = new Map();
  for (const proof of Array.isArray(proofs) ? proofs : []) {
    const amount = Number(proof?.amount || 0);
    if (!(amount > 0)) continue;
    if (!buckets.has(amount)) {
      buckets.set(amount, { amount, count: 0, total: 0, status });
    }
    const bucket = buckets.get(amount);
    bucket.count += 1;
    bucket.total += amount;
  }
  return [...buckets.values()].sort((a, b) => a.amount - b.amount);
}

function groupCashuPacketInventory(packets, status = "offgrid") {
  const buckets = new Map();
  for (const packet of Array.isArray(packets) ? packets : []) {
    const amount = Number(packet?.amount || 0);
    if (!(amount > 0)) continue;
    if (!buckets.has(amount)) {
      buckets.set(amount, { amount, count: 0, total: 0, status });
    }
    const bucket = buckets.get(amount);
    bucket.count += 1;
    bucket.total += amount;
  }
  return [...buckets.values()].sort((a, b) => a.amount - b.amount);
}

function getCashuInventoryPayload() {
  const cd = getActiveCashuData();
  const generalProofs = getCashuGeneralProofs(cd);
  const offgridProofs = getCashuOffgridProofs(cd);
  const offgridPackets = getCashuOffgridPackets(cd);
  return {
    confirmed: groupCashuProofInventory(cd.proofs || [], "confirmed"),
    general: groupCashuProofInventory(generalProofs, "general"),
    offgrid: groupCashuPacketInventory(offgridPackets, "offgrid"),
    pending: groupCashuProofInventory(cd.pendingSwapProofs || [], "pending"),
    confirmedProofCount: (cd.proofs || []).length,
    generalProofCount: generalProofs.length,
    offgridProofCount: offgridProofs.length,
    offgridPacketCount: offgridPackets.length,
    pendingProofCount: (cd.pendingSwapProofs || []).length,
  };
}

function getCashuPayload() {
  const cd = getActiveCashuData();
  syncCashuOffgridState(cd);
  return {
    configured: Boolean(cd.mintUrl),
    mintUrl: cd.mintUrl || null,
    balance: getCashuBalance(),
    generalBalance: getCashuGeneralBalance(),
    offgridBalance: getCashuOffgridBalance(),
    pendingBalance: getCashuPendingBalance(),
    proofCount: (cd.proofs || []).length,
    pendingInvoices: (cd.pendingInvoices || []).map((inv) => ({
      hash: inv.hash,
      amount: inv.amount,
      pr: inv.pr,
      createdAt: inv.createdAt,
    })),
    inventory: getCashuInventoryPayload(),
    history: (cd.history || []).slice(0, 30),
    testMode: isTestMode(),
  };
}

function addCashuHistory(entry) {
  const cd = getActiveCashuData();
  cd.history = cd.history || [];
  cd.history.unshift({ ...entry, timestamp: new Date().toLocaleString() });
  if (cd.history.length > 100) cd.history = cd.history.slice(0, 100);
}

// cashu-ts v3.x is ESM-only via @scure/base v2; use dynamic import() to load it in CommonJS
let _cashuModulePromise = null;
function getCashuModule() {
  if (!_cashuModulePromise) {
    _cashuModulePromise = import("@cashu/cashu-ts");
  }
  return _cashuModulePromise;
}

// Cache wallet instances per mintUrl to avoid hitting /keys on every call
const _cashuWalletCache = new Map();
function _cashuWalletCacheKey() {
  return `${isTestMode() ? "test" : "prod"}:${getActiveCashuData().mintUrl}`;
}
async function cashuGetWallet() {
  const { Wallet } = await getCashuModule();
  const cd = getActiveCashuData();
  if (!cd.mintUrl) throw new Error("No mint configured");
  const key = _cashuWalletCacheKey();
  if (_cashuWalletCache.has(key)) {
    return _cashuWalletCache.get(key);
  }
  const wallet = new Wallet(cd.mintUrl, { unit: "sat" });
  await wallet.loadMint(true);
  const result = { wallet };
  _cashuWalletCache.set(key, result);
  return result;
}

async function cashuPruneSpentProofs() {
  const cd = getActiveCashuData();
  if (!cd.mintUrl || !(cd.proofs || []).length) return { removedCount: 0, removedAmount: 0 };
  const { wallet } = await cashuGetWallet();
  const states = await wallet.checkProofsStates(cd.proofs);
  const spentSecrets = new Set(
    states
      .filter((s) => String(s?.state || "").toUpperCase() === "SPENT")
      .map((s) => String(s?.secret || ""))
      .filter(Boolean)
  );
  if (!spentSecrets.size) return { removedCount: 0, removedAmount: 0 };

  const spentProofs = cd.proofs.filter((p) => spentSecrets.has(p.secret));
  cd.proofs = cd.proofs.filter((p) => !spentSecrets.has(p.secret));
  syncCashuOffgridState(cd);
  const removedAmount = spentProofs.reduce((sum, p) => sum + (p.amount || 0), 0);
  addCashuHistory({
    direction: "Reconciled",
    amount: removedAmount,
    unit: "sats",
    peer: "Spent proofs removed",
    status: "Cleaned",
  });
  persistActiveCashu();
  return { removedCount: spentProofs.length, removedAmount };
}
function cashuInvalidateWalletCache() {
  _cashuWalletCache.clear();
}

async function cashuSetMint(mintUrl) {
  const { Mint } = await getCashuModule();
  const mint = new Mint(mintUrl.trim());
  const info = await mint.getInfo();
  const cd = getActiveCashuData();
  cd.mintUrl = mintUrl.trim();
  cd.proofs = [];
  cd.pendingInvoices = [];
  cd.pendingSwapProofs = [];
  cd.receivedSecrets = [];
  cd.offgridSecrets = [];
  cd.offgridPackets = [];
  cashuInvalidateWalletCache();
  persistActiveCashu();
  return { ok: true, name: info.name, description: info.description, mintUrl: cd.mintUrl };
}

async function cashuCreateInvoice(amount) {
  const { wallet } = await cashuGetWallet();
  const mintQuote = await wallet.createMintQuote(amount);
  const pr = String(mintQuote.request || "");
  const hash = String(mintQuote.quote || "");
  const cd = getActiveCashuData();

  const invoiceNet = detectInvoiceNetwork(pr);
  const mintNet = getMintNetwork(cd.mintUrl);
  console.log(`[cashu] invoice created: prefix=${pr.slice(0, 8)} invoiceNet=${invoiceNet} mintNet=${mintNet} mint=${cd.mintUrl}`);
  if (isTestMode() && invoiceNet === "mainnet") {
    throw new Error(
      `Your test mint (${cd.mintUrl}) is a mainnet mint — it generates real Bitcoin invoices (lnbc...). ` +
      `In test mode you need a signet mint. Go to Settings and set the Cashu mint to https://cashu.mutinynet.com`
    );
  }
  if (invoiceNet !== "unknown" && invoiceNet !== mintNet) {
    throw new Error(
      `Mint network mismatch: mint ${cd.mintUrl} is configured as ${mintNet} but generated a ${invoiceNet} invoice (${pr.slice(0, 10)}...). ` +
      `For mutinynet/signet faucet you need a mint that generates lntbs invoices.`
    );
  }

  cd.pendingInvoices = cd.pendingInvoices || [];
  cd.pendingInvoices.push({ hash, amount, pr, createdAt: new Date().toISOString() });
  persistActiveCashu();
  return { pr, hash, amount };
}

async function cashuCheckInvoice(hash) {
  const { wallet } = await cashuGetWallet();
  const cd = getActiveCashuData();
  const pending = (cd.pendingInvoices || []).find((i) => i.hash === hash);
  if (!pending) throw new Error("Invoice not found");
  const quoteStatus = await wallet.checkMintQuote(hash);
  const quoteState = String(quoteStatus?.state || "").toUpperCase();
  if (quoteState !== "PAID" && quoteState !== "ISSUED") {
    throw new Error("Invoice not yet paid");
  }
  const proofs = await wallet.mintProofs(pending.amount, hash);
  cd.proofs = [...(cd.proofs || []), ...proofs];
  syncCashuOffgridState(cd);
  cd.pendingInvoices = (cd.pendingInvoices || []).filter((i) => i.hash !== hash);
  addCashuHistory({ direction: "Received", amount: pending.amount, unit: "sats", peer: "Lightning deposit", status: "Confirmed" });
  persistActiveCashu();
  return { balance: getCashuBalance(), amount: pending.amount };
}

// Select proofs that exactly sum to amount without contacting the mint.
// Cashu uses power-of-2 denominations, so greedy descending always finds
// an exact match when the denominations are available.
// Returns { send, returnChange } or null if exact match is impossible.
function selectProofsExact(amount, proofs) {
  const sorted = [...proofs].sort((a, b) => b.amount - a.amount);
  const send = [];
  const keep = [];
  let remaining = amount;
  for (const proof of sorted) {
    if (remaining > 0 && proof.amount <= remaining) {
      send.push(proof);
      remaining -= proof.amount;
    } else {
      keep.push(proof);
    }
  }
  if (remaining !== 0) return null;
  return { send, returnChange: keep };
}

function describeProofAmounts(proofs, limit = 12) {
  const amounts = Array.isArray(proofs)
    ? proofs
      .map((proof) => Number(proof?.amount || 0))
      .filter((amount) => amount > 0)
      .sort((a, b) => b - a)
    : [];
  if (!amounts.length) return "none";
  const shown = amounts.slice(0, limit).join(", ");
  return amounts.length > limit ? `${shown}, ...` : shown;
}

function summarizeCashuInventory(proofs, limit = 8) {
  const buckets = groupCashuProofInventory(proofs || []);
  if (!buckets.length) return "none";
  const shown = buckets
    .slice(0, limit)
    .map((bucket) => `${bucket.count}x${bucket.amount}`)
    .join(", ");
  return buckets.length > limit ? `${shown}, ...` : shown;
}

function isLikelyCashuNetworkError(error) {
  const msg = String(error?.message || error || "").toLowerCase();
  return [
    "fetch failed",
    "failed to fetch",
    "network",
    "socket",
    "timeout",
    "timed out",
    "unreachable",
    "enotfound",
    "econnrefused",
    "econnreset",
    "getaddrinfo",
  ].some((needle) => msg.includes(needle));
}

const CASHU_CHANGE_PRESETS = {
  balanced: {
    label: "Balanced",
    maxDenomination: 256,
  },
  pocket: {
    label: "Smaller proofs",
    maxDenomination: 64,
  },
  wide: {
    label: "Fewer proofs",
    maxDenomination: 1024,
  },
};

function normalizeCashuChangePreset(value) {
  const key = String(value || "balanced").trim().toLowerCase();
  return CASHU_CHANGE_PRESETS[key] ? key : "balanced";
}

function buildCashuChangeDenominations(amount, preset = "balanced") {
  const normalizedAmount = Math.max(0, Number(amount) || 0);
  if (!normalizedAmount) return [];
  const config = CASHU_CHANGE_PRESETS[normalizeCashuChangePreset(preset)];
  const maxDenomination = Math.max(1, Number(config.maxDenomination) || normalizedAmount);
  const outputs = [];
  let remaining = normalizedAmount;
  let covered = 0;
  const maxOutputs = 24;

  while (remaining > 0 && outputs.length < maxOutputs) {
    const nextCover = covered + 1;
    const denom = Math.min(maxDenomination, nextCover, remaining);
    outputs.push(denom);
    covered += denom;
    remaining -= denom;
  }

  if (remaining > 0) {
    throw new Error("Requested change plan would create too many outputs. Try a smaller amount or a wider preset.");
  }

  return outputs.sort((a, b) => b - a);
}

function buildCashuCompactDenominations(amount) {
  let remaining = Math.max(0, Math.floor(Number(amount) || 0));
  const outputs = [];
  while (remaining > 0) {
    const denom = 2 ** Math.floor(Math.log2(remaining));
    outputs.push(denom);
    remaining -= denom;
  }
  return outputs.sort((a, b) => b - a);
}

async function cashuMakeChange(amount, preset = "balanced") {
  const normalizedAmount = Math.floor(Number(amount) || 0);
  const cd = getActiveCashuData();
  if (!(normalizedAmount > 0)) throw new Error("amount required");
  if (getCashuBalance() < normalizedAmount) throw new Error(`Insufficient balance (have ${getCashuBalance()} sats)`);

  const plan = buildCashuChangeDenominations(normalizedAmount, preset);
  if (!plan.length) throw new Error("Could not build a change plan");
  if (plan.length < 2) {
    throw new Error("Chosen amount does not need splitting. Pick a larger amount or a smaller preset.");
  }

  const beforeBalance = getCashuBalance();
  const { wallet } = await cashuGetWallet();

  let sendResult;
  try {
    sendResult = await wallet.send(normalizedAmount, cd.proofs, undefined, {
      send: { type: "random", denominations: plan },
    });
  } catch (error) {
    if (isLikelyCashuNetworkError(error)) {
      throw new Error("Mint is unreachable. Reconnect internet to prepare off-grid change.");
    }
    throw error;
  }

  const send = Array.isArray(sendResult?.send) ? sendResult.send : [];
  const keep = Array.isArray(sendResult?.keep) ? sendResult.keep : [];
  if (!send.length) {
    throw new Error("Mint returned empty change outputs.");
  }

  cd.proofs = [...keep, ...send];
  cd.offgridSecrets = [];
  cd.offgridPackets = [];
  syncCashuOffgridState(cd);
  persistActiveCashu();

  const afterBalance = getCashuBalance();
  const fee = Math.max(0, beforeBalance - afterBalance);
  const presetKey = normalizeCashuChangePreset(preset);
  addCashuHistory({
    direction: "Rebalanced",
    amount: normalizedAmount,
    unit: "sats",
    peer: CASHU_CHANGE_PRESETS[presetKey].label,
    status: `Prepared ${send.length} proofs${fee ? ` (fee ${fee})` : ""}`,
  });
  persistActiveCashu();

  return {
    ok: true,
    amount: normalizedAmount,
    fee,
    preset: presetKey,
    proofsCreated: send.length,
    proofAmounts: send.map((proof) => Number(proof?.amount || 0)).sort((a, b) => a - b),
    balance: getCashuBalance(),
    pendingBalance: getCashuPendingBalance(),
    wallet: getCashuPayload(),
  };
}

async function cashuPrepareOffgridAmount(amount) {
  const normalizedAmount = Math.floor(Number(amount) || 0);
  const cd = getActiveCashuData();
  if (!(normalizedAmount > 0)) throw new Error("amount required");

  const generalProofs = getCashuGeneralProofs(cd);
  const generalBalance = getProofsBalance(generalProofs);
  if (generalBalance < normalizedAmount) {
    throw new Error(`Need ${normalizedAmount} sats available to prepare, have ${generalBalance} sats.`);
  }

  const beforeBalance = getCashuBalance();
  const existingOffgridProofs = getCashuOffgridProofs(cd);
  const existingOffgridPackets = getCashuOffgridPackets(cd);

  const { wallet } = await cashuGetWallet();
  let sendResult;
  try {
    sendResult = await wallet.send(normalizedAmount, generalProofs);
  } catch (error) {
    if (isLikelyCashuNetworkError(error)) {
      throw new Error("Mint is unreachable. Reconnect internet to prepare a new off-grid amount.");
    }
    throw error;
  }

  const send = Array.isArray(sendResult?.send) ? sendResult.send : [];
  const keep = Array.isArray(sendResult?.keep) ? sendResult.keep : [];
  if (!send.length) {
    throw new Error("Mint returned empty off-grid amount.");
  }

  cd.proofs = [...keep, ...existingOffgridProofs, ...send];
  cd.offgridPackets = [...existingOffgridPackets, createCashuOffgridPacket(send, normalizedAmount)];
  syncCashuOffgridState(cd);
  persistActiveCashu();
  const fee = Math.max(0, beforeBalance - getCashuBalance());

  addCashuHistory({
    direction: "Prepared",
    amount: normalizedAmount,
    unit: "sats",
    peer: "Off-grid amount",
    status: fee ? `Ready (fee ${fee})` : "Ready",
  });
  persistActiveCashu();

  return {
    ok: true,
    amount: normalizedAmount,
    proofsCreated: send.length,
    fee,
    wallet: getCashuPayload(),
  };
}

async function cashuCompactInventory() {
  const cd = getActiveCashuData();
  const balance = getCashuBalance();
  if (!(balance > 0)) throw new Error("No confirmed proofs to compact.");

  const currentProofs = Array.isArray(cd.proofs) ? cd.proofs : [];
  const currentPlan = currentProofs
    .map((proof) => Number(proof?.amount || 0))
    .filter((amount) => amount > 0)
    .sort((a, b) => b - a);
  const compactPlan = buildCashuCompactDenominations(balance);
  const alreadyCompact =
    currentPlan.length === compactPlan.length &&
    currentPlan.every((amount, index) => amount === compactPlan[index]);

  if (alreadyCompact) {
    cd.offgridSecrets = [];
    cd.offgridPackets = [];
    persistActiveCashu();
    return {
      ok: true,
      compacted: false,
      amount: balance,
      fee: 0,
      proofsCreated: currentPlan.length,
      proofAmounts: currentPlan.slice(),
      balance,
      pendingBalance: getCashuPendingBalance(),
      wallet: getCashuPayload(),
    };
  }

  const beforeBalance = balance;
  const { wallet } = await cashuGetWallet();

  let sendResult;
  try {
    sendResult = await wallet.send(balance, currentProofs, undefined, {
      send: { type: "random", denominations: compactPlan },
    });
  } catch (error) {
    if (isLikelyCashuNetworkError(error)) {
      throw new Error("Mint is unreachable. Reconnect internet to compact proof inventory.");
    }
    throw error;
  }

  const send = Array.isArray(sendResult?.send) ? sendResult.send : [];
  const keep = Array.isArray(sendResult?.keep) ? sendResult.keep : [];
  if (!send.length) {
    throw new Error("Mint returned empty compacted proofs.");
  }

  cd.proofs = [...keep, ...send];
  cd.offgridSecrets = [];
  cd.offgridPackets = [];
  persistActiveCashu();

  const afterBalance = getCashuBalance();
  const fee = Math.max(0, beforeBalance - afterBalance);
  addCashuHistory({
    direction: "Rebalanced",
    amount: beforeBalance,
    unit: "sats",
    peer: "Compact inventory",
    status: `Compacted to ${send.length} proofs${fee ? ` (fee ${fee})` : ""}`,
  });
  persistActiveCashu();

  return {
    ok: true,
    compacted: true,
    amount: beforeBalance,
    fee,
    proofsCreated: send.length,
    proofAmounts: send.map((proof) => Number(proof?.amount || 0)).sort((a, b) => b - a),
    balance: getCashuBalance(),
    pendingBalance: getCashuPendingBalance(),
      wallet: getCashuPayload(),
    };
  }

function cashuRemoveOffgridAmount(amount, count = 1) {
  const normalizedAmount = Math.floor(Number(amount) || 0);
  const normalizedCount = Math.floor(Number(count) || 0);
  const cd = getActiveCashuData();
  if (!(normalizedAmount > 0)) throw new Error("amount required");
  if (!(normalizedCount > 0)) throw new Error("count required");

  const offgridPackets = getCashuOffgridPackets(cd);
  const selected = selectOffgridPacketsByCounts([{ amount: normalizedAmount, count: normalizedCount }], offgridPackets);
  if (!selected?.selectedPackets?.length) {
    throw new Error(`No ready ${normalizedAmount} sats units to remove.`);
  }

  cd.offgridPackets = selected.remainingPackets;
  cd.offgridSecrets = [];
  syncCashuOffgridState(cd);
  persistActiveCashu();

  addCashuHistory({
    direction: "Rebalanced",
    amount: normalizedAmount * normalizedCount,
    unit: "sats",
    peer: "Removed from off-grid",
    status: normalizedCount > 1 ? `${normalizedCount} units returned` : "Returned",
  });
  persistActiveCashu();

  return {
    ok: true,
    amount: normalizedAmount,
    count: normalizedCount,
    wallet: getCashuPayload(),
  };
}

async function cashuSendToken(amount, options = {}) {
  const { getEncodedToken } = await getCashuModule();
  const cd = getActiveCashuData();
  const exactOfflineOnly = Boolean(options.exactOfflineOnly);
  const selection = Array.isArray(options.selection) ? options.selection : null;

  // Best-effort: skip if mint is unreachable (offline mode).
  try { await cashuPruneSpentProofs(); } catch (_) { /* no internet — continue offline */ }
  if (getCashuOffgridBalance() < amount) throw new Error(`Insufficient off-grid balance (have ${getCashuOffgridBalance()} sats)`);

  if (selection?.length) {
    const selected = selectOffgridPacketsByCounts(selection, getCashuOffgridPackets(cd));
    if (!selected?.selectedPackets?.length) {
      throw new Error("Selected off-grid amounts are no longer available.");
    }
    const selectedAmount = selected.selectedPackets.reduce((sum, packet) => sum + Number(packet.amount || 0), 0);
    const sentSecrets = new Set(selected.selectedPackets.flatMap((packet) => packet.secrets));
    const sendProofs = (cd.proofs || []).filter((proof) => sentSecrets.has(String(proof?.secret || "")));
    cd.proofs = (cd.proofs || []).filter((proof) => !sentSecrets.has(String(proof?.secret || "")));
    cd.offgridPackets = selected.remainingPackets;
    cd.offgridSecrets = [];
    syncCashuOffgridState(cd);
    if (cd.receivedSecrets) {
      cd.receivedSecrets = cd.receivedSecrets.filter((secret) => !sentSecrets.has(secret));
    }
    persistActiveCashu();
    const token = getEncodedToken({ mint: cd.mintUrl, proofs: sendProofs });
    return {
      token,
      amount: selectedAmount,
      mode: "offline-exact",
      proofAmounts: sendProofs.map((proof) => Number(proof?.amount || 0)).sort((a, b) => a - b),
      balance: getCashuBalance(),
      generalBalance: getCashuGeneralBalance(),
      offgridBalance: getCashuOffgridBalance(),
      pendingBalance: getCashuPendingBalance(),
      wallet: getCashuPayload(),
    };
  }

  // Try offline-first: select proofs without contacting the mint.
  // Works when available denominations can exactly represent the amount.
  const offgridProofs = getCashuOffgridProofs(cd);
  const offline = selectProofsExact(amount, offgridProofs);
  if (offline) {
    cd.proofs = [...getCashuGeneralProofs(cd), ...offline.returnChange];
    syncCashuOffgridState(cd);
    // Remove sent proof secrets from receivedSecrets so the sender can reclaim
    // the token if the recipient never redeems it.
    if (cd.receivedSecrets) {
      const sentSecrets = new Set(offline.send.map((p) => p.secret));
      cd.receivedSecrets = cd.receivedSecrets.filter((s) => !sentSecrets.has(s));
    }
    persistActiveCashu();
    const token = getEncodedToken({ mint: cd.mintUrl, proofs: offline.send });
    return {
      token,
      amount,
      mode: "offline-exact",
      proofAmounts: offline.send.map((proof) => Number(proof?.amount || 0)).sort((a, b) => a - b),
      balance: getCashuBalance(),
      generalBalance: getCashuGeneralBalance(),
      offgridBalance: getCashuOffgridBalance(),
      pendingBalance: getCashuPendingBalance(),
      wallet: getCashuPayload(),
    };
  }

  if (exactOfflineOnly) {
    throw new Error(
      `Off-grid send for ${amount} sats is not possible with current ready off-grid amounts. ` +
      `Inventory: ${summarizeCashuInventory(offgridProofs)}. ` +
      `Open Change and prepare the amount first.`,
    );
  }

  // Exact change not possible — need mint to split proofs (requires internet).
  const { wallet } = await cashuGetWallet();
  let sendResult;
  try {
    sendResult = await wallet.send(amount, offgridProofs);
  } catch (error) {
    if (isLikelyCashuNetworkError(error)) {
      throw new Error(
        `Offline send could not make exact change for ${amount} sats. ` +
        `Current ready off-grid amounts: ${describeProofAmounts(offgridProofs)}. ` +
        `Reconnect internet so the mint can split proofs, or send an amount that exactly matches your ready off-grid amounts.`,
      );
    }
    throw error;
  }
  const send = Array.isArray(sendResult?.send) ? sendResult.send : [];
  const keep = Array.isArray(sendResult?.keep) ? sendResult.keep : [];
  if (!send.length) {
    throw new Error("Mint returned empty token payload.");
  }
  cd.proofs = [...getCashuGeneralProofs(cd), ...keep];
  cd.offgridPackets = [];
  syncCashuOffgridState(cd);
  // Same: remove sent secrets so sender can reclaim if needed.
  if (cd.receivedSecrets) {
    const sentSecrets = new Set(send.map((p) => p.secret));
    cd.receivedSecrets = cd.receivedSecrets.filter((s) => !sentSecrets.has(s));
  }
  persistActiveCashu();
  const token = getEncodedToken({ mint: cd.mintUrl, proofs: send });
  return {
    token,
    amount,
    mode: "mint-split",
    proofAmounts: send.map((proof) => Number(proof?.amount || 0)).sort((a, b) => a - b),
    balance: getCashuBalance(),
    generalBalance: getCashuGeneralBalance(),
    offgridBalance: getCashuOffgridBalance(),
    pendingBalance: getCashuPendingBalance(),
    wallet: getCashuPayload(),
  };
}

function normalizeIncomingCashuTokenInput(rawInput) {
  const text = String(rawInput || "").trim();
  if (!text) return "";

  const sanitize = (candidate) => String(candidate || "")
    .replace(/\s+/g, "")
    .replace(/^[`'"]+|[`'"]+$/g, "")
    .replace(/[),.;:!?]+$/g, "")
    .trim();

  const direct = /(?:\[\d+\s*sats?\]\s*)?(cashu[AB][^\s]+)/i.exec(text);
  if (direct?.[1]) return sanitize(direct[1]);

  const joinedFragments = text
    .split(/\r?\n+/)
    .map((line) => String(line || "").replace(/^\s*\[\d+\/\d+\]\s*/g, "").trim())
    .filter(Boolean)
    .join("");
  const fromFragments = /(?:\[\d+\s*sats?\]\s*)?(cashu[AB][^\s]+)/i.exec(joinedFragments);
  if (fromFragments?.[1]) return sanitize(fromFragments[1]);

  const compact = text.replace(/\s+/g, "");
  const fromCompact = /(cashu[AB][A-Za-z0-9_\-+=/]+)/i.exec(compact);
  if (fromCompact?.[1]) return sanitize(fromCompact[1]);

  return sanitize(text);
}

function decodeTokenToMintAndProofs(decoded) {
  if (decoded && typeof decoded === "object") {
    const normalizedUnit = String(decoded.unit || "").trim() || "sat";
    if (typeof decoded.mint === "string" && Array.isArray(decoded.proofs)) {
      return {
        mintUrl: decoded.mint,
        proofs: decoded.proofs,
        unit: normalizedUnit,
        receiveToken: {
          mint: decoded.mint,
          proofs: decoded.proofs,
          unit: normalizedUnit,
          ...(decoded.memo ? { memo: decoded.memo } : {}),
        },
      };
    }
    if (Array.isArray(decoded.token) && decoded.token.length) {
      const mintUrl = String(decoded.token[0]?.mint || "").trim();
      const proofs = decoded.token.flatMap((entry) => (Array.isArray(entry?.proofs) ? entry.proofs : []));
      const nestedUnit = String(decoded.token[0]?.unit || decoded.unit || "").trim() || "sat";
      return {
        mintUrl,
        proofs,
        unit: nestedUnit,
        receiveToken: {
          mint: mintUrl,
          proofs,
          unit: nestedUnit,
          ...(decoded.memo ? { memo: decoded.memo } : {}),
        },
      };
    }
  }
  return {
    mintUrl: "",
    proofs: [],
    unit: "sat",
    receiveToken: { mint: "", proofs: [], unit: "sat" },
  };
}

function extractFreshProofsFromReceiveResult(receiveResult) {
  if (Array.isArray(receiveResult)) return receiveResult;
  // cashu-ts v2+: { keep: [...], send: [...] }
  if (Array.isArray(receiveResult?.keep)) return receiveResult.keep;
  if (Array.isArray(receiveResult?.proofs)) return receiveResult.proofs;
  // cashu-ts v0.9.x: { token: [{ mint, proofs }] } — token is an array, not nested object
  if (Array.isArray(receiveResult?.token)) {
    return receiveResult.token.flatMap((entry) => (Array.isArray(entry?.proofs) ? entry.proofs : []));
  }
  // Legacy nested format: { token: { token: [{ proofs }] } }
  const entries = receiveResult?.token?.token;
  if (!Array.isArray(entries)) return [];
  return entries.flatMap((entry) => (Array.isArray(entry?.proofs) ? entry.proofs : []));
}

function receiveResultHasErrors(receiveResult) {
  const err = receiveResult?.tokensWithErrors;
  if (!err) return false;
  if (Array.isArray(err)) return err.length > 0;
  if (Array.isArray(err.token)) return err.token.length > 0;
  return false;
}

async function cashuReceiveToken(tokenString) {
  const { getDecodedToken, Wallet } = await getCashuModule();
  const normalizedToken = normalizeIncomingCashuTokenInput(tokenString);
  const decoded = getDecodedToken(normalizedToken);
  const parsed = decodeTokenToMintAndProofs(decoded);
  const tokenMintUrl = String(parsed.mintUrl || "").trim();
  const incomingProofs = Array.isArray(parsed.proofs) ? parsed.proofs : [];
  const tokenUnit = String(parsed.unit || "sat").trim() || "sat";
  const receiveToken = (parsed.receiveToken && typeof parsed.receiveToken === "object")
    ? parsed.receiveToken
    : { mint: tokenMintUrl, proofs: incomingProofs, unit: tokenUnit };
  if (!tokenMintUrl || !incomingProofs.length) {
    throw new Error("Token is invalid or contains no proofs.");
  }

  // Deduplication: reject if any proof secret was already received (prevents double-redeem).
  const cd = getActiveCashuData();
  cd.receivedSecrets = cd.receivedSecrets || [];
  const receivedSet = new Set(cd.receivedSecrets);
  if (incomingProofs.some((p) => receivedSet.has(p.secret))) {
    throw new Error("Token already redeemed");
  }

  function recordSecrets(proofs) {
    cd.receivedSecrets = [...(cd.receivedSecrets || []), ...proofs.map((p) => p.secret)];
    // Cap to last 2000 secrets to avoid unbounded growth
    if (cd.receivedSecrets.length > 2000) cd.receivedSecrets = cd.receivedSecrets.slice(-2000);
  }

  function isSpentLikeError(errorMessage) {
    const msg = String(errorMessage || "").toLowerCase();
    return msg.includes("spent") || msg.includes("redeem") || msg.includes("already used");
  }

  // Try online receive (swaps proofs at mint for fresh ones, validates against double-spend).
  try {
    const wallet = new Wallet(tokenMintUrl, { unit: tokenUnit });
    await wallet.loadMint(true);
    const receiveResult = await wallet.receive(receiveToken);
    if (receiveResultHasErrors(receiveResult)) {
      throw new Error("Token was already spent or could not be reissued by the mint");
    }
    const newProofs = extractFreshProofsFromReceiveResult(receiveResult);
    const amount = newProofs.reduce((s, p) => s + (p.amount || 0), 0);
    if (!amount || !newProofs.length) {
      throw new Error("Token was already spent or returned no fresh proofs");
    }
    cd.proofs = [...(cd.proofs || []), ...newProofs];
    syncCashuOffgridState(cd);
    if (!cd.mintUrl) cd.mintUrl = tokenMintUrl;
    recordSecrets(incomingProofs);
    addCashuHistory({ direction: "Received", amount, unit: "sats", peer: "Cashu token", status: "Confirmed", mintUrl: tokenMintUrl });
    persistActiveCashu();
    return { amount, balance: getCashuBalance(), mintUrl: tokenMintUrl };
  } catch (onlineErr) {
    if (isSpentLikeError(onlineErr?.message || onlineErr)) {
      throw new Error("Token already redeemed or spent at mint.");
    }

    // Offline fallback: accept the raw proofs without mint verification.
    // The proofs are stored as-is and should be swapped at mint when connectivity returns.
    // Risk: sender could double-spend the same token; acceptable for trusted mesh peers.
    console.warn("[cashu] Online receive failed, accepting proofs offline:", onlineErr.message);
    if (!incomingProofs.length) throw new Error("Token contains no proofs");
    const walletSecrets = new Set((cd.proofs || []).map((p) => p?.secret).filter(Boolean));
    const pendingSecrets = new Set((cd.pendingSwapProofs || []).map((p) => p?.secret).filter(Boolean));
    const uniquePendingProofs = incomingProofs.filter((proof) => {
      const secret = String(proof?.secret || "").trim();
      if (!secret) return false;
      return !walletSecrets.has(secret) && !pendingSecrets.has(secret);
    });
    if (!uniquePendingProofs.length) {
      throw new Error("Token is already pending confirmation");
    }
    const amount = uniquePendingProofs.reduce((s, p) => s + (p.amount || 0), 0);
    // Store separately so we know these need to be swapped at the mint later
    cd.pendingSwapProofs = [...(cd.pendingSwapProofs || []), ...uniquePendingProofs];
    if (!cd.mintUrl) cd.mintUrl = tokenMintUrl;
    recordSecrets(uniquePendingProofs);
    addCashuHistory({ direction: "Received", amount, unit: "sats", peer: "Cashu token (pending — will confirm when online)", status: "Pending", mintUrl: tokenMintUrl });
    persistActiveCashu();
    return { amount, balance: getCashuBalance(), pendingBalance: getCashuPendingBalance(), mintUrl: tokenMintUrl, unverified: true };
  }
}

// Swap offline-received (pending) proofs at the mint to get fresh verified ones.
// Called automatically when internet is available.
async function cashuSwapPending() {
  const cd = getActiveCashuData();
  const pending = cd.pendingSwapProofs || [];
  if (!pending.length) return { swapped: 0, pendingBalance: 0 };
  if (!cd.mintUrl) throw new Error("No mint configured");

  const { Wallet } = await getCashuModule();
  const wallet = new Wallet(cd.mintUrl, { unit: "sat" });
  await wallet.loadMint(true);

  // Re-encode pending proofs as a token and receive them (= swap at mint)
  const tokenObj = { mint: cd.mintUrl, proofs: pending, unit: "sat" };
  const receiveResult = await wallet.receive(tokenObj);
  const batchHasErrors = receiveResultHasErrors(receiveResult);
  let freshProofs = extractFreshProofsFromReceiveResult(receiveResult);

  // Some mints return partial failures for mixed pending sets. Salvage what can be
  // reissued proof-by-proof. Never drop unresolved proofs to avoid silent loss.
  if (batchHasErrors || freshProofs.length === 0) {
    const recovered = [];
    const droppedSpent = [];
    const maybeSpent = [];
    const unresolved = [];

    function isSpentLikeError(errorMessage) {
      const msg = String(errorMessage || "").toLowerCase();
      return msg.includes("spent") || msg.includes("redeem") || msg.includes("already used");
    }

    for (const proof of pending) {
      try {
        const singleToken = { mint: cd.mintUrl, proofs: [proof], unit: "sat" };
        const singleResult = await wallet.receive(singleToken);
        if (receiveResultHasErrors(singleResult)) {
          maybeSpent.push(proof);
          continue;
        }
        const singleFresh = extractFreshProofsFromReceiveResult(singleResult);
        if (!singleFresh.length) {
          maybeSpent.push(proof);
          continue;
        }
        recovered.push(...singleFresh);
      } catch (err) {
        if (isSpentLikeError(err?.message || err)) {
          maybeSpent.push(proof);
        } else {
          unresolved.push(proof);
        }
      }
    }

    if (maybeSpent.length > 0) {
      try {
        const spentStates = await wallet.checkProofsStates(maybeSpent);
        const spentSecrets = new Set(
          spentStates
            .filter((s) => String(s?.state || "").toUpperCase() === "SPENT")
            .map((s) => String(s?.secret || ""))
            .filter(Boolean)
        );
        for (const proof of maybeSpent) {
          const secret = String(proof?.secret || "");
          if (secret && spentSecrets.has(secret)) {
            droppedSpent.push(proof);
          } else {
            unresolved.push(proof);
          }
        }
      } catch {
        unresolved.push(...maybeSpent);
      }
    }

    const recoveredAmount = recovered.reduce((s, p) => s + (p.amount || 0), 0);
    const droppedAmount = droppedSpent.reduce((s, p) => s + (p.amount || 0), 0);
    cd.proofs = [...(cd.proofs || []), ...recovered];
    syncCashuOffgridState(cd);
    cd.pendingSwapProofs = unresolved;

    if (recoveredAmount > 0) {
      addCashuHistory({ direction: "Confirmed", amount: recoveredAmount, unit: "sats", peer: "Pending proofs verified", status: "Confirmed" });
    }
    if (droppedAmount > 0) {
      addCashuHistory({ direction: "Reconciled", amount: droppedAmount, unit: "sats", peer: "Spent pending proofs removed", status: "Cleaned" });
    }
    persistActiveCashu();

    return {
      swapped: recoveredAmount,
      dropped: droppedAmount,
      unresolved: unresolved.length,
      balance: getCashuBalance(),
      pendingBalance: getCashuPendingBalance(),
    };
  }

  const amount = freshProofs.reduce((s, p) => s + (p.amount || 0), 0);
  cd.proofs = [...(cd.proofs || []), ...freshProofs];
  syncCashuOffgridState(cd);
  cd.pendingSwapProofs = [];
  addCashuHistory({ direction: "Confirmed", amount, unit: "sats", peer: "Pending proofs verified", status: "Confirmed" });
  persistActiveCashu();
  return { swapped: amount, balance: getCashuBalance(), pendingBalance: 0 };
}

function detectInvoiceNetwork(pr) {
  const lower = (pr || "").toLowerCase();
  if (lower.startsWith("lntbs")) return "signet";
  if (lower.startsWith("lntb")) return "testnet";
  if (lower.startsWith("lnbc")) return "mainnet";
  return "unknown";
}

function getMintNetwork(mintUrl) {
  const lower = (mintUrl || "").toLowerCase();
  if (lower.includes("mutinynet") || lower.includes("signet")) return "signet";
  if (lower.includes("testnet")) return "testnet";
  return "mainnet";
}

async function cashuMeltToLightning(pr) {
  const { wallet } = await cashuGetWallet();
  const cd = getActiveCashuData();

  await cashuPruneSpentProofs();

  // Validate invoice network against the mint's network before contacting it
  const invoiceNet = detectInvoiceNetwork(pr);
  const mintNet = getMintNetwork(cd.mintUrl);
  if (invoiceNet !== "unknown" && invoiceNet !== mintNet) {
    const hint = mintNet === "signet"
      ? `Your mint (${cd.mintUrl}) is on signet/mutinynet — paste a signet invoice (starts with lntbs).`
      : `Your mint (${cd.mintUrl}) is on mainnet — paste a mainnet invoice (starts with lnbc).`;
    throw new Error(`Network mismatch: invoice is for ${invoiceNet} but mint is on ${mintNet}. ${hint}`);
  }

  // createMeltQuote returns amount + fee_reserve directly — no need to decode the invoice
  const meltQuote = await wallet.createMeltQuote(pr);
  const amount = Number(meltQuote.amount || 0);
  const fee = Number(meltQuote.fee_reserve || 0);
  const totalNeeded = amount + fee;
  if (getCashuBalance() < totalNeeded) throw new Error(`Need ${totalNeeded} sats (incl. ${fee} fee), have ${getCashuBalance()}`);

  const sendResult = await wallet.send(totalNeeded, cd.proofs);
  const send = Array.isArray(sendResult?.send) ? sendResult.send : [];
  const keep = Array.isArray(sendResult?.keep) ? sendResult.keep : [];
  // Save keep immediately — if meltTokens throws, these proofs are not lost
  cd.proofs = keep;
  syncCashuOffgridState(cd);
  persistActiveCashu();

  try {
    const result = await wallet.meltTokens(meltQuote, send);
    if (result.change?.length) {
      cd.proofs = [...cd.proofs, ...result.change];
      syncCashuOffgridState(cd);
    }
    addCashuHistory({ direction: "Sent", amount, unit: "sats", peer: "Lightning payment", status: result.isPaid ? "Confirmed" : "Failed" });
    persistActiveCashu();
    return { isPaid: result.isPaid, amount, fee, balance: getCashuBalance() };
  } catch (e) {
    // Intercept the opaque gRPC network error from LND and give a human-readable message
    if (e.message && e.message.toLowerCase().includes("active network")) {
      throw new Error(`Network mismatch: the invoice network doesn't match your Cashu mint's network (${cd.mintUrl}). Check the invoice and your mint URL in Settings.`);
    }
    throw e;
  }
}

async function waitForCashuInvoicePayment(hash, timeoutMs = 30000, pollMs = 2000) {
  const deadline = Date.now() + timeoutMs;
  let lastError = "Invoice not paid yet";
  while (Date.now() < deadline) {
    try {
      return await cashuCheckInvoice(hash);
    } catch (error) {
      lastError = error?.message || lastError;
      await sleep(pollMs);
    }
  }
  throw new Error(lastError);
}

async function callMutinynetFaucet(path, body) {
  const https = require("https");
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const options = {
      hostname: "faucet.mutinynet.com",
      path,
      method: "POST",
      timeout: 15000,
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) },
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("Faucet request timed out")); });
    req.write(payload);
    req.end();
  });
}

async function generateLightningQr(pr) {
  const QRCode = require("qrcode");
  return QRCode.toDataURL(pr.toUpperCase(), { width: 200, margin: 1, color: { dark: "#f2f8ff", light: "#151d27" } });
}

// ─── End Cashu ────────────────────────────────────────────────────────────────

// ─── Swap Tracking ──────────────────────────────────────────────────────────────

function persistSwaps() {
  fs.writeFileSync(SWAPS_FILE, JSON.stringify(swaps, null, 2), "utf8");
}

function getSwapsPayload() {
  return swaps.map((s) => ({
    id: s.id,
    type: s.type,
    status: s.status,
    statusLabel: s.statusLabel || s.status,
    amount: s.amount,
    lockupAddress: s.lockupAddress || null,
    expectedAmount: s.expectedAmount || null,
    onchainAmount: s.onchainAmount || null,
    receiverAddress: s.receiverAddress || null,
    createdAt: s.createdAt,
    error: s.error || null,
  }));
}

function createSwapId(prefix) {
  const { randomUUID } = require("crypto");
  return `${prefix}-${randomUUID()}`;
}

function getInvoiceAmountFromBolt11(pr) {
  // Parse amount from bolt11 invoice prefix without depending on cashu-ts.
  // Format: ln[bc|tbs|bcrt]{amount}{multiplier}1...
  // Multipliers: m=milli-BTC(1e5 sat), u=micro-BTC(100 sat), n=nano-BTC(0.1 sat), p=pico-BTC(0.0001 sat)
  const match = /^ln(?:bc|tbs|bcrt)(\d+)([munp]?)1/i.exec(String(pr || ""));
  if (!match) return 0;
  const value = Number(match[1]);
  const mult = match[2].toLowerCase();
  const satFactors = { "": 1e8, m: 1e5, u: 100, n: 0.1, p: 0.0001 };
  return Math.round(value * (satFactors[mult] ?? 0));
}

async function startSubmarineSwap(amount) {
  if (!getActiveCashuData().mintUrl) throw new Error("Set a Cashu mint first (Settings tab)");

  const { pr, hash } = await cashuCreateInvoice(amount);
  const swap = {
    id: createSwapId("swap-in"),
    type: "btc-to-cashu",
    status: "invoice_pending",
    statusLabel: isTestMode()
      ? "Requesting Mutinynet Lightning payment..."
      : "Lightning invoice created. Pay it to receive Cashu.",
    amount,
    invoiceHash: hash,
    invoice: pr,
    createdAt: new Date().toISOString(),
  };

  swaps.unshift(swap);
  persistSwaps();
  broadcast("swaps", getSwapsPayload());

  if (isTestMode()) {
    swap.statusLabel = "Lightning invoice created. Pay it with the Mutinynet faucet site or any Lightning wallet.";
    persistSwaps();
    broadcast("swaps", getSwapsPayload());
    return {
      ...swap,
      pr,
      hash,
      autoPaid: false,
      faucetHint: "Mutinynet faucet Lightning payouts require a browser session token, so auto-pay is not available from the app backend.",
    };
  }

  return { ...swap, pr, hash, autoPaid: false };
}

async function startReverseSwap(amount, receiverAddress) {
  const pr = String(receiverAddress || "").trim();
  if (!pr) throw new Error("Lightning invoice required");

  const invoiceAmount = getInvoiceAmountFromBolt11(pr);
  if (!invoiceAmount || invoiceAmount < 1) throw new Error("Amountless Lightning invoices are not supported");
  if (amount && amount !== invoiceAmount) {
    throw new Error(`Invoice amount is ${invoiceAmount} sats, but form amount is ${amount} sats`);
  }

  const swap = {
    id: createSwapId("swap-out"),
    type: "cashu-to-btc",
    status: "payment_pending",
    statusLabel: "Paying Lightning invoice...",
    amount: invoiceAmount,
    receiverAddress: pr,
    createdAt: new Date().toISOString(),
  };

  swaps.unshift(swap);
  persistSwaps();
  broadcast("swaps", getSwapsPayload());

  try {
    const meltResult = await cashuMeltToLightning(pr);
    swap.status = meltResult.isPaid ? "done" : "payment_failed";
    swap.statusLabel = meltResult.isPaid
      ? `Done - paid ${meltResult.amount} sats over Lightning`
      : "Lightning payment failed";
    swap.fee = meltResult.fee;
    persistSwaps();
    broadcast("swaps", getSwapsPayload());
    broadcast("cashu", getCashuPayload());
    return { ...swap, ...meltResult };
  } catch (error) {
    swap.status = "payment_failed";
    swap.statusLabel = `Payment failed: ${error.message}`;
    swap.error = error.message;
    persistSwaps();
    broadcast("swaps", getSwapsPayload());
    throw error;
  }
}

async function pollSwap(swap) {
  if (swap.type === "btc-to-cashu" && !["done", "expired", "payment_failed"].includes(swap.status) && swap.invoiceHash) {
    // Expire swaps whose invoice is no longer in pendingInvoices (already cleaned up or never funded)
    const cd = getActiveCashuData();
    const stillPending = (cd.pendingInvoices || []).some((i) => i.hash === swap.invoiceHash);
    if (!stillPending) {
      swap.status = "expired";
      swap.statusLabel = "Invoice expired or already processed";
      persistSwaps();
      return;
    }
    try {
      const result = await cashuCheckInvoice(swap.invoiceHash);
      swap.status = "done";
      swap.statusLabel = `Done - received ${result.amount} sats in Cashu`;
      swap.receivedAmount = result.amount;
      persistSwaps();
      broadcast("cashu", getCashuPayload());
    } catch {
      // Not paid yet — leave status as-is
    }
  }
}

function startSwapPolling() {
  setInterval(async () => {
    const active = swaps.filter((s) => !["done", "expired", "payment_failed"].includes(s.status));
    for (const swap of active) await pollSwap(swap);
    if (active.length) broadcast("swaps", getSwapsPayload());
  }, 12000);
}

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
  return item;
}

function updateMessageAck(messageId, ack) {
  const msg = messages.find((m) => m.id === messageId);
  if (!msg) return;
  msg.ack = ack;
  persistMessages();
  broadcast("ack_update", { id: messageId, ack });
}

function isChannelThreadMessage(message, channelIndex) {
  const direction = String(message?.direction || "");
  if (direction !== "in" && direction !== "out") {
    return false;
  }
  if (normalizeChannelIndex(message?.channelIndex, -1) !== channelIndex) {
    return false;
  }
  if (direction === "in") {
    if (Object.hasOwn(message, "isDirectMessage")) {
      return message.isDirectMessage === false;
    }
    return String(message?.recipient || "") === "^all";
  }
  return String(message?.recipient || "") === "^all";
}

function clearMessages(scope, peerId = "", channelIndex = null) {
  const normalizedScope = String(scope || "").trim();
  const normalizedPeerId = String(peerId || "").trim();
  const normalizedChannelIndex = channelIndex == null ? null : normalizeChannelIndex(channelIndex, -1);
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
  } else if (normalizedScope === "channel") {
    if (normalizedChannelIndex == null || normalizedChannelIndex < 0) {
      throw new Error("channelIndex is required");
    }
    messages = messages.filter((message) => !isChannelThreadMessage(message, normalizedChannelIndex));
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

function makeNodeSnapshotSignature(node) {
  const environmentMetrics = node?.environmentMetrics ? JSON.stringify(node.environmentMetrics) : "";
  const neighbors = Array.isArray(node?.neighbors)
    ? node.neighbors.map((nb) => `${nb?.nodeId ?? ""}:${nb?.snr ?? ""}`).join(",")
    : "";
  const weather = node?.weather
    ? [
        node.weather.summary ?? "",
        node.weather.temperature ?? "",
        node.weather.humidity ?? "",
        node.weather.pressure ?? "",
        node.weather.wind ?? "",
      ].join("|")
    : "";
  return [
    node?.id ?? "",
    node?.meshNum ?? "",
    node?.userId ?? "",
    node?.shortName ?? "",
    node?.longName ?? "",
    node?.hardware ?? "",
    node?.meshtasticRole ?? "",
    node?.modemPreset ?? "",
    node?.lastHeard ?? "",
    node?.snr ?? "",
    node?.hopsAway ?? "",
    node?.batteryLevel ?? "",
    node?.voltage ?? "",
    node?.latitude ?? "",
    node?.longitude ?? "",
    environmentMetrics,
    neighbors,
    node?.role ?? "",
    weather,
  ].join("~");
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
  const now = Date.now();
  const nodes = Object.values(knownNodes);
  const onlineMeshNums = new Set(
    nodes
      .filter((node) => isNodeOnline(node) && node.meshNum != null)
      .map((node) => String(node.meshNum))
  );
  const activeLinks = Object.values(meshLinks).filter((l) =>
    now - l.lastSeen < MESH_LINK_TTL_MS &&
    onlineMeshNums.has(String(l.from ?? "")) &&
    onlineMeshNums.has(String(l.via ?? ""))
  );
  return {
    nodes: nodes
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
    meshLinks: activeLinks,
  };
}

// Track observed relay connections from packet relayNode field (Meshtastic fw 2.3+)
function trackMeshLink(payload) {
  if (!payload) return;
  const relayNode = payload.relayNode;
  if (!relayNode) return;
  const senderNode = findNodeByMeshNum(payload.sender);
  const relayNodeObj = findNodeByMeshNumInt(relayNode);
  if (!senderNode || !relayNodeObj) return;
  const snr = payload.rxSnr ?? null;
  const now = Date.now();
  // Link: sender <-> relay
  const key = `${senderNode.meshNum}|${relayNodeObj.meshNum}`;
  meshLinks[key] = { from: senderNode.meshNum, via: relayNodeObj.meshNum, snr, lastSeen: now };
}

function findNodeByMeshNum(userId) {
  // userId is "!hexid" format; find by userId key
  return knownNodes[String(userId || "")] || null;
}

function findNodeByMeshNumInt(meshNumInt) {
  // meshNumInt is an integer node num; find node whose meshNum matches
  const target = String(meshNumInt);
  return Object.values(knownNodes).find((n) => String(n.meshNum || "") === target) || null;
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

    const nextNode = {
      ...existing,
      id: nodeId,
      meshNum: bridgeNode.id || existing.meshNum || null,
      userId: bridgeNode.userId || existing.userId || nodeId,
      shortName: bridgeNode.shortName || existing.shortName || "",
      longName: bridgeNode.longName || existing.longName || "",
      hardware: bridgeNode.hardware || existing.hardware || "",
      meshtasticRole: bridgeNode.meshtasticRole || existing.meshtasticRole || "",
      modemPreset: bridgeNode.modemPreset || existing.modemPreset || "",
      lastHeard: bridgeNode.lastHeard || existing.lastHeard || null,
      snr: bridgeNode.snr ?? existing.snr ?? null,
      hopsAway: bridgeNode.hopsAway ?? existing.hopsAway ?? null,
      batteryLevel: bridgeNode.batteryLevel ?? existing.batteryLevel ?? null,
      voltage: bridgeNode.voltage ?? existing.voltage ?? null,
      latitude: bridgeNode.latitude ?? existing.latitude ?? null,
      longitude: bridgeNode.longitude ?? existing.longitude ?? null,
      environmentMetrics: bridgeNode.environmentMetrics || existing.environmentMetrics || null,
      neighbors: bridgeNode.neighbors && bridgeNode.neighbors.length > 0 ? bridgeNode.neighbors : (existing.neighbors || []),
      raw: bridgeNode.raw || existing.raw || null,
      observedPortnums: existing.observedPortnums || [],
      lastDecoded: existing.lastDecoded || null,
    };
    nextNode.weather = extractWeatherFromNode(nextNode) || existing.weather || null;
    nextNode.role = inferNodeRoleFromMeta(nextNode);
    if (!hasRealWeatherData(nextNode)) {
      nextNode.weather = null;
    }
    if (makeNodeSnapshotSignature(existing) !== makeNodeSnapshotSignature(nextNode)) {
      changed = true;
    }
    knownNodes[nodeId] = nextNode;
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

// ── TAK / CoT helpers ─────────────────────────────────────────────────────────
function _hexToArgbInt(hex) {
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const v = ((0xFF << 24) | (r << 16) | (g << 8) | b) >>> 0;
    return v > 0x7FFFFFFF ? v - 0x100000000 : v;
  } catch { return -16711936; }
}
function _argbIntToHexColor(value, fallback = "#4a9eff") {
  try {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    const unsigned = (n >>> 0);
    const r = ((unsigned >> 16) & 0xFF).toString(16).padStart(2, "0");
    const g = ((unsigned >> 8) & 0xFF).toString(16).padStart(2, "0");
    const b = (unsigned & 0xFF).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  } catch {
    return fallback;
  }
}
function _hexToAlphaArgbInt(hex, alpha = 0x7f) {
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const a = Math.max(0, Math.min(255, Number(alpha) || 0));
    const v = ((a << 24) | (r << 16) | (g << 8) | b) >>> 0;
    return v > 0x7FFFFFFF ? v - 0x100000000 : v;
  } catch { return 2147418112; }
}
function _cotNow() { return new Date().toISOString().replace(/\.\d{3}Z$/, "Z"); }
function _cotStale() { return new Date(Date.now() + 2 * 60000).toISOString().replace(/\.\d{3}Z$/, "Z"); }
function _cotPast(ms = 1000) { return new Date(Date.now() - ms).toISOString().replace(/\.\d{3}Z$/, "Z"); }
function _xmlEsc(s) { return String(s || "").replace(/[<>&"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c])); }
function _cotDoc(eventXml) { return `<?xml version='1.0' encoding='UTF-8' standalone='yes'?>${eventXml}`; }
function _cotPrecisionLocation(tagName = "precisionLocation", geopointsrc = "???") {
  return `<${tagName} geopointsrc="${geopointsrc}" altsrc="???"></${tagName}>`;
}
function _cotMarti() { return `<marti></marti>`; }
function _cotGeofence() {
  return `<__geofence elevationMonitored="false" tracking="false" monitor="All" trigger="Both" maxElevation="NaN" minElevation="NaN"></__geofence>`;
}
function _cotRemarks(remarks = "") {
  const text = String(remarks || "").trim();
  return text ? `<remarks>${_xmlEsc(text)}</remarks>` : "";
}
function _hexToTakColorHex(color = "#4a9eff", alpha = 0xff) {
  try {
    const clean = String(color).trim().replace(/^#/, "");
    const hex = clean.length === 3
      ? clean.split("").map(ch => ch + ch).join("")
      : clean.slice(0, 6);
    const a = Math.max(0, Math.min(255, Number(alpha) || 0)).toString(16).padStart(2, "0").toUpperCase();
    return `${a}${hex.toUpperCase()}`;
  } catch {
    return alpha >= 0xff ? "FF4A9EFF" : "7F4A9EFF";
  }
}
function _cotKmlStyleLink(uid, color = "#4a9eff", fillColor = null, strokeWeight = 1) {
  return `<link type="b-x-KmlStyle" relation="p-c" uid="${uid}.style"><Style><LineStyle><color>${_hexToTakColorHex(color, 0xff)}</color><width>${Math.max(1, Number(strokeWeight) || 1)}</width></LineStyle><PolyStyle><color>${_hexToTakColorHex(fillColor || color, 0x7f)}</color></PolyStyle></Style></link>`;
}

function _fmtCoord(n) { return parseFloat(n.toFixed(6)); }
function _fmtMeters(n) { return Number.parseFloat(String(n || 0)); }
function _closeRing(points) {
  const list = Array.isArray(points) ? points.slice() : [];
  if (list.length < 3) return list;
  const first = list[0];
  const last = list[list.length - 1];
  if (!first || !last) return list;
  if (Math.abs(first[0] - last[0]) > 1e-7 || Math.abs(first[1] - last[1]) > 1e-7) {
    list.push(first);
  }
  return list;
}
function _latLngOffsetMeters(center, eastMeters, northMeters) {
  const lat = Number(center?.[0] || 0);
  const lon = Number(center?.[1] || 0);
  const mPerDegLat = 111320;
  const mPerDegLon = Math.max(1, 111320 * Math.cos(lat * Math.PI / 180));
  return [lat + (northMeters / mPerDegLat), lon + (eastMeters / mPerDegLon)];
}
function rectangleToLatLngs(center, lengthMeters, widthMeters, angleDeg = 0) {
  if (!Array.isArray(center) || center.length < 2) return [];
  const halfL = Number(lengthMeters || 0) / 2;
  const halfW = Number(widthMeters || 0) / 2;
  if (!(halfL > 0) || !(halfW > 0)) return [];
  const angle = (Number(angleDeg) || 0) * Math.PI / 180;
  const corners = [
    [-halfW, -halfL],
    [ halfW, -halfL],
    [ halfW,  halfL],
    [-halfW,  halfL],
  ];
  return corners.map(([x, y]) => {
    const east = x * Math.cos(angle) - y * Math.sin(angle);
    const north = x * Math.sin(angle) + y * Math.cos(angle);
    return _latLngOffsetMeters(center, east, north);
  });
}
function _cotShapeDetail({ uid, label, color, fillColor, strokeWeight, strokeStyle, remarks = "", shapeXml, extraDetailXml = "", includeRemarks = true, includeGeofence = true }) {
  const escaped = _xmlEsc(label || "");
  const strokeArgb = _hexToArgbInt(color || "#4a9eff");
  const fillArgb = _hexToAlphaArgbInt(fillColor || color || "#4a9eff", 0x7f);
  const width = Math.max(1, Number(strokeWeight) || 1);
  const style = _xmlEsc(String(strokeStyle || "solid"));
  return `<detail><contact endpoint="0.0.0.0:4242:tcp" callsign="${escaped || uid}"/><uid Droid="${escaped || uid}"/>${_cotPrecisionLocation("precisionLocation")}<strokeColor value="${strokeArgb}"/><fillColor value="${fillArgb}"/><strokeWeight value="${width}"/><strokeStyle value="${style}"/>${extraDetailXml}${_cotMarti()}${shapeXml}${includeGeofence ? _cotGeofence() : ""}${includeRemarks ? _cotRemarks(remarks || escaped) : ""}</detail>`;
}

function compressCotXml(xml) {
  return zlib.deflateSync(Buffer.from(String(xml || ""), "utf8"), { level: 9 });
}

function reduceTakGeometryPoints(type, points, targetCount) {
  if (!Array.isArray(points) || points.length === 0) return [];
  const minPoints = type === "polygon" ? 3 : 2;
  if (points.length <= targetCount || targetCount < minPoints) {
    return points.slice();
  }

  if (type === "polygon") {
    const result = [];
    for (let i = 0; i < targetCount; i += 1) {
      const idx = Math.min(points.length - 1, Math.floor((i * points.length) / targetCount));
      result.push(points[idx]);
    }
    while (result.length < minPoints) {
      result.push(points[Math.min(points.length - 1, result.length)]);
    }
    return result;
  }

  const result = [points[0]];
  const interior = targetCount - 2;
  for (let i = 1; i <= interior; i += 1) {
    const idx = Math.min(points.length - 2, Math.floor((i * (points.length - 2)) / (interior + 1)) + 1);
    result.push(points[idx]);
  }
  result.push(points[points.length - 1]);
  return result;
}

function getTakFeatureCenter(feature) {
  if (Array.isArray(feature.latlng) && feature.latlng.length >= 2) {
    return [_fmtCoord(feature.latlng[0]), _fmtCoord(feature.latlng[1])];
  }
  if (Array.isArray(feature.latlngs) && feature.latlngs.length > 0) {
    const lat = feature.latlngs.reduce((sum, point) => sum + point[0], 0) / feature.latlngs.length;
    const lon = feature.latlngs.reduce((sum, point) => sum + point[1], 0) / feature.latlngs.length;
    return [_fmtCoord(lat), _fmtCoord(lon)];
  }
  return null;
}

function featureToCot({ uid, type, latlng, latlngs, label, color, fillColor, strokeWeight, strokeStyle, remarks, cotType, iconsetPath, radiusMeters, rangeMeters, bearingDeg, majorMeters, minorMeters, angleDeg }) {
  const now = _cotNow(), stale = _cotStale();
  const argb = _hexToArgbInt(color || "#4a9eff");
  const defaultLabel = type === "marker"
    ? "WPT"
    : type === "polyline"
      ? "Route"
      : type === "polygon"
        ? "Shape"
        : type === "circle"
          ? "Circle"
          : type === "ruler"
            ? "Ruler"
          : "Ellipse";
  const name = _xmlEsc(label || defaultLabel);
  const cotUid = String(uid || `tak-${Date.now()}`);
  if (type === "marker" && latlng) {
    const lat = _fmtCoord(latlng[0]), lon = _fmtCoord(latlng[1]);
    const iconXml = iconsetPath ? `<usericon iconsetpath="${_xmlEsc(iconsetPath)}"/>` : "";
    return _cotDoc(`<event version="2.0" uid="${cotUid}" type="${_xmlEsc(cotType || "b-m-p-w")}" time="${now}" start="${now}" stale="${stale}" how="h-e"><point lat="${lat}" lon="${lon}" hae="9999999.0" ce="9999999.0" le="9999999.0"/><detail><contact endpoint="0.0.0.0:4242:tcp" callsign="${name}"/><uid Droid="${name || cotUid}"/>${_cotPrecisionLocation("precisionLocation")}<color argb="${argb}"/>${iconXml}${_cotMarti()}${_cotRemarks(remarks)}<archive/></detail></event>`);
  }
  if (type === "polyline" && latlngs?.length >= 2) {
    const cLat = _fmtCoord(latlngs.reduce((a, p) => a + p[0], 0) / latlngs.length);
    const cLon = _fmtCoord(latlngs.reduce((a, p) => a + p[1], 0) / latlngs.length);
    const verts = latlngs.map((p) => `<vertex lat="${_fmtCoord(p[0])}" lon="${_fmtCoord(p[1])}"/>`).join("");
    return _cotDoc(`<event version="2.0" uid="${cotUid}" type="u-d-f" time="${now}" start="${now}" stale="${stale}" how="h-e"><point lat="${cLat}" lon="${cLon}" hae="9999999.0" ce="9999999.0" le="9999999.0"/>${_cotShapeDetail({ uid: cotUid, label: label || defaultLabel, color, fillColor: color, strokeWeight, strokeStyle, remarks, shapeXml: `<shape><lineString>${verts}</lineString>${_cotKmlStyleLink(cotUid, color, color, strokeWeight)}</shape>`, includeRemarks: true, includeGeofence: false })}</event>`);
  }
  if (type === "polygon" && latlngs?.length >= 3) {
    const ring = _closeRing(latlngs);
    const cLat = _fmtCoord(ring.reduce((a, p) => a + p[0], 0) / ring.length);
    const cLon = _fmtCoord(ring.reduce((a, p) => a + p[1], 0) / ring.length);
    const verts = ring.map(p => `<vertex lat="${_fmtCoord(p[0])}" lon="${_fmtCoord(p[1])}"/>`).join("");
    return _cotDoc(`<event version="2.0" uid="${cotUid}" type="u-d-f" time="${now}" start="${now}" stale="${stale}" how="h-e"><point lat="${cLat}" lon="${cLon}" hae="9999999.0" ce="9999999.0" le="9999999.0"/>${_cotShapeDetail({ uid: cotUid, label: label || defaultLabel, color, fillColor, strokeWeight, strokeStyle, remarks, shapeXml: `<shape><polygon>${verts}</polygon>${_cotKmlStyleLink(cotUid, color, fillColor, strokeWeight)}</shape>`, includeRemarks: true })}</event>`);
  }
  if (type === "circle" && latlng && Number(radiusMeters) > 0) {
    const lat = _fmtCoord(latlng[0]), lon = _fmtCoord(latlng[1]);
    const r = _fmtMeters(radiusMeters);
    return _cotDoc(`<event version="2.0" uid="${cotUid}" type="u-d-c-c" time="${now}" start="${now}" stale="${stale}" how="h-e"><point lat="${lat}" lon="${lon}" hae="9999999.0" ce="9999999.0" le="9999999.0"/>${_cotShapeDetail({ uid: cotUid, label: label || defaultLabel, color, fillColor, strokeWeight, strokeStyle, remarks, shapeXml: `<shape><ellipse major="${r}" angle="360.0" minor="${r}"></ellipse>${_cotKmlStyleLink(cotUid, color, fillColor, strokeWeight)}</shape>`, includeRemarks: true })}</event>`);
  }
  if (type === "ruler" && latlng && Number(rangeMeters) > 0) {
    const lat = _fmtCoord(latlng[0]), lon = _fmtCoord(latlng[1]);
    const range = _fmtMeters(rangeMeters);
    const bearing = _fmtMeters(bearingDeg || 0);
    return _cotDoc(`<event version="2.0" uid="${cotUid}" type="u-rb-a" time="${now}" start="${now}" stale="${stale}" how="h-e"><point lat="${lat}" lon="${lon}" hae="9999999.0" ce="9999999.0" le="9999999.0"/><detail><contact endpoint="0.0.0.0:4242:tcp" callsign="${name}"/><uid Droid="${name || cotUid}"/>${_cotRemarks(remarks)}${_cotPrecisionLocation("precisionLocation", "User")}<color value="${argb}"></color><range value="${range}"></range><rangeUnits value="1"></rangeUnits><bearing value="${bearing}"></bearing><bearingUnits value="0"></bearingUnits><inclination value="0.0"></inclination><northRef value="1"></northRef>${_cotMarti()}</detail></event>`);
  }
  if (type === "ellipse" && latlng && Number(majorMeters) > 0 && Number(minorMeters) > 0) {
    const lat = _fmtCoord(latlng[0]), lon = _fmtCoord(latlng[1]);
    const major = _fmtMeters(majorMeters);
    const minor = _fmtMeters(minorMeters);
    const angle = _fmtMeters(angleDeg || 0);
    return _cotDoc(`<event version="2.0" uid="${cotUid}" type="u-d-c-e" time="${now}" start="${now}" stale="${stale}" how="h-e"><point lat="${lat}" lon="${lon}" hae="9999999.0" ce="9999999.0" le="9999999.0"/>${_cotShapeDetail({ uid: cotUid, label: label || defaultLabel, color, fillColor, strokeWeight, strokeStyle, remarks, shapeXml: `<shape><ellipse major="${major}" angle="${angle}" minor="${minor}"></ellipse>${_cotKmlStyleLink(cotUid, color, fillColor, strokeWeight)}</shape>`, includeRemarks: true })}</event>`);
  }
  return null;
}

function buildTakDeleteCot(feature = {}) {
  const uid = String(feature.uid || "").trim();
  if (!uid) return null;
  const point = getTakFeatureCenter(feature) || [0, 0];
  const now = _cotNow();
  const stale = _cotPast(1000);
  const rawType = String(feature.rawType || feature.cotType || (
    feature.type === "marker" ? "b-m-p-w"
      : feature.type === "circle" ? "u-d-c-c"
      : feature.type === "ruler" ? "u-rb-a"
      : "b-m-p-w"
  ));
  return _cotDoc(
    `<event version="2.0" uid="${_xmlEsc(uid)}" type="${_xmlEsc(rawType)}" time="${now}" start="${now}" stale="${stale}" how="h-e">` +
      `<point lat="${_fmtCoord(point[0])}" lon="${_fmtCoord(point[1])}" hae="9999999.0" ce="9999999.0" le="9999999.0"/>` +
      `<detail><__forcedelete/></detail>` +
    `</event>`
  );
}

function buildTakCotForMesh(feature, maxPacketBytes = 233) {
  const baseFeature = {
    uid: feature.uid,
    type: feature.type,
    latlng: feature.latlng,
    latlngs: Array.isArray(feature.latlngs) ? feature.latlngs.slice() : null,
    radiusMeters: feature.radiusMeters ?? null,
    rangeMeters: feature.rangeMeters ?? null,
    bearingDeg: feature.bearingDeg ?? null,
    majorMeters: feature.majorMeters ?? null,
    minorMeters: feature.minorMeters ?? null,
    angleDeg: feature.angleDeg ?? null,
    label: feature.label || "",
    color: feature.color || "#4a9eff",
    fillColor: feature.fillColor || feature.color || "#4a9eff",
    strokeWeight: feature.strokeWeight ?? 1,
    strokeStyle: feature.strokeStyle || "solid",
    remarks: feature.remarks || "",
    cotType: feature.cotType || "",
    iconsetPath: feature.iconsetPath || "",
  };

  const firstXml = featureToCot(baseFeature);
  if (!firstXml) {
    return { cotXml: null, error: "invalid feature type" };
  }

  const firstCompressed = compressCotXml(firstXml);
  if (firstCompressed.length <= maxPacketBytes) {
    return { cotXml: firstXml, simplified: false, compressedBytes: firstCompressed.length, transportHint: "direct" };
  }

  return {
    cotXml: firstXml,
    simplified: false,
    compressedBytes: firstCompressed.length,
    originalPoints: Array.isArray(baseFeature.latlngs) ? baseFeature.latlngs.length : null,
    sentPoints: Array.isArray(baseFeature.latlngs) ? baseFeature.latlngs.length : null,
    transportHint: "fountain",
  };
}

function parseCotXml(xml) {
  try {
    const attr = (fragment, name) => fragment?.match(new RegExp(`\\b${name}=['"]([^'"]+)['"]`, "i"))?.[1] || "";
    const uid = xml.match(/\buid=['"]([^'"]+)['"]/)?.[1] || "";
    const type = xml.match(/\btype=['"]([^'"]+)['"]/)?.[1] || "";
    const isForceDelete = /<__forcedelete\b/i.test(xml);
    const staleValue = xml.match(/\bstale=['"]([^'"]+)['"]/)?.[1] || "";
    const isStaleDelete = !!staleValue && !Number.isNaN(Date.parse(staleValue)) && Date.parse(staleValue) <= Date.now();
    if (isForceDelete || isStaleDelete) {
      return {
        uid,
        rawType: type,
        cotType: type,
        type: "delete",
      };
    }
    const pm = xml.match(/<point[^>]+lat=['"]([^'"]+)['"][^>]+lon=['"]([^'"]+)['"]/);
    const lat = pm ? parseFloat(pm[1]) : 0;
    const lon = pm ? parseFloat(pm[2]) : 0;
    const callsign = xml.match(/<contact[^>]+callsign=['"]([^'"]+)['"]/)?.[1] || "";
    const remarks = xml.match(/<remarks>([^<]*)<\/remarks>/)?.[1] || "";
    const label = callsign || remarks || "";
    const iconsetPath = xml.match(/<usericon[^>]+iconsetpath=['"]([^'"]+)['"]/)?.[1] || "";
    const vertexPoints = [...xml.matchAll(/<vertex[^>]+lat=['"]([^'"]+)['"][^>]+lon=['"]([^'"]+)['"]/g)]
      .map(m => [parseFloat(m[1]), parseFloat(m[2])])
      .filter(p => !isNaN(p[0]) && !isNaN(p[1]));
    const linkPoints = [...xml.matchAll(/<link[^>]+point=['"]([^'"]+)['"]/g)]
      .map(m => {
        const p = m[1].split(",");
        return [parseFloat(p[0]), parseFloat(p[1])];
      })
      .filter(p => !isNaN(p[0]) && !isNaN(p[1]));
    const ellipseTag = xml.match(/<ellipse\b([^>]*)>/i)?.[1] || "";
    const rectangleTag = xml.match(/<rectangle\b([^>]*)>/i)?.[1] || "";
    let majorMeters = null;
    let minorMeters = null;
    let angleDeg = 0;
    let rectLengthMeters = null;
    let rectWidthMeters = null;
    if (ellipseTag) {
      majorMeters = parseFloat(attr(ellipseTag, "major"));
      minorMeters = parseFloat(attr(ellipseTag, "minor"));
      angleDeg = parseFloat(attr(ellipseTag, "angle") || "0");
    }
    if (rectangleTag) {
      rectLengthMeters = parseFloat(attr(rectangleTag, "length") || attr(rectangleTag, "height") || attr(rectangleTag, "major"));
      rectWidthMeters = parseFloat(attr(rectangleTag, "width") || attr(rectangleTag, "minor"));
      angleDeg = parseFloat(attr(rectangleTag, "angle") || attr(rectangleTag, "azimuth") || attr(rectangleTag, "heading") || "0");
    }
    const radiusMatch =
      xml.match(/<circle\b[^>]*\bradius=['"]([^'"]+)['"][^>]*>/i)
      || xml.match(/<radius\b[^>]*\bvalue=['"]([^'"]+)['"][^>]*>/i);
    const radiusMeters = radiusMatch ? parseFloat(radiusMatch[1]) : null;
    const rangeMeters = parseFloat(xml.match(/<range\b[^>]*\bvalue=['"]([^'"]+)['"][^>]*>/i)?.[1] || "");
    const bearingDeg = parseFloat(xml.match(/<bearing\b[^>]*\bvalue=['"]([^'"]+)['"][^>]*>/i)?.[1] || "");
    const hasPolygonHint = type === "u-d-f" || type === "u-d-r" || /<polygon\b/i.test(xml) || /<shape\b/i.test(xml);
    const hasLineStringHint = /<lineString\b/i.test(xml) || /<polyline\b/i.test(xml);
    let featureType = null, latlng = null, latlngs = null, metadataOnly = false;
    if (vertexPoints.length >= 3 && hasPolygonHint && !hasLineStringHint) {
      featureType = "polygon";
      latlngs = vertexPoints;
    } else if (vertexPoints.length >= 2 && hasLineStringHint) {
      featureType = "polyline";
      latlngs = vertexPoints;
    } else if (linkPoints.length >= 2) {
      featureType = hasPolygonHint ? "polygon" : "polyline";
      latlngs = linkPoints;
    } else if (!isNaN(lat) && !isNaN(lon) && rectLengthMeters != null && rectWidthMeters != null && !isNaN(rectLengthMeters) && !isNaN(rectWidthMeters) && rectLengthMeters > 0 && rectWidthMeters > 0) {
      featureType = "rectangle";
      latlng = [lat, lon];
      latlngs = rectangleToLatLngs([lat, lon], rectLengthMeters, rectWidthMeters, angleDeg);
    } else if (!isNaN(lat) && !isNaN(lon) && type === "u-rb-a" && !isNaN(rangeMeters) && rangeMeters > 0 && !isNaN(bearingDeg)) {
      featureType = "ruler";
      latlng = [lat, lon];
    } else if (!isNaN(lat) && !isNaN(lon) && type === "u-d-r") {
      featureType = "rectangle";
      latlng = [lat, lon];
      metadataOnly = true;
    } else if (!isNaN(lat) && !isNaN(lon) && type === "u-d-f") {
      featureType = "polygon";
      latlng = [lat, lon];
      metadataOnly = true;
    } else if (!isNaN(lat) && !isNaN(lon) && type === "b-m-r") {
      featureType = "polyline";
      latlng = [lat, lon];
      metadataOnly = true;
    } else if (!isNaN(lat) && !isNaN(lon) && radiusMeters != null && !isNaN(radiusMeters) && radiusMeters > 0) {
      featureType = "circle";
      latlng = [lat, lon];
    } else if (!isNaN(lat) && !isNaN(lon) && majorMeters != null && minorMeters != null && !isNaN(majorMeters) && !isNaN(minorMeters) && majorMeters > 0 && minorMeters > 0) {
      featureType = Math.abs(majorMeters - minorMeters) < 0.5 ? "circle" : "ellipse";
      latlng = [lat, lon];
    } else if (!isNaN(lat) && !isNaN(lon) && (type.startsWith("a-") || type.startsWith("b-") || type.startsWith("u-") || type.startsWith("s-") || type.startsWith("t-"))) {
      featureType = "marker";
      latlng = [lat, lon];
    }
    if (!featureType) return null;
    const argbStr =
      xml.match(/\bargb=['"](-?\d+)['"]/)?.[1]
      || xml.match(/strokeColor[^>]*value=['"](-?\d+)['"]/)?.[1]
      || xml.match(/<color\b[^>]*value=['"](-?\d+)['"][^>]*>/i)?.[1];
    let color = "#4a9eff";
    let fillColor = color;
    if (argbStr) {
      color = _argbIntToHexColor(parseInt(argbStr), "#4a9eff");
    }
    const fillArgbStr = xml.match(/fillColor[^>]*value=['"](-?\d+)['"]/)?.[1];
    if (fillArgbStr) fillColor = _argbIntToHexColor(parseInt(fillArgbStr), color);
    const strokeWeight = Number.parseFloat(xml.match(/strokeWeight[^>]*value=['"]([^'"]+)['"]/)?.[1] || "") || 1;
    const strokeStyle = xml.match(/strokeStyle[^>]*value=['"]([^'"]+)['"]/)?.[1] || "solid";
    return {
      uid,
      rawType: type,
      cotType: type,
      type: featureType,
      latlng,
      latlngs,
      label,
      remarks,
      color,
      fillColor,
      strokeWeight,
      strokeStyle,
      iconsetPath,
      metadataOnly,
      radiusMeters: featureType === "circle" ? (radiusMeters != null && !isNaN(radiusMeters) ? radiusMeters : Math.max(majorMeters || 0, minorMeters || 0)) : null,
      majorMeters: featureType === "ellipse" ? majorMeters : null,
      minorMeters: featureType === "ellipse" ? minorMeters : null,
      rectLengthMeters: featureType === "rectangle" ? rectLengthMeters : null,
      rectWidthMeters: featureType === "rectangle" ? rectWidthMeters : null,
      angleDeg: featureType === "ellipse" || featureType === "rectangle" ? angleDeg : null,
      rangeMeters: featureType === "ruler" ? rangeMeters : null,
      bearingDeg: featureType === "ruler" ? bearingDeg : null,
    };
  } catch { return null; }
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

function sanitizeFilenamePart(value, fallback = "item") {
  const safe = String(value || "")
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1f]+/g, "_")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 64);
  return safe || fallback;
}

function captureTakEvent({ direction, sender, uid, rawType, featureType, cotXml, metadata = {} }) {
  const xml = String(cotXml || "").trim();
  if (!xml) return null;
  const capturedAt = new Date().toISOString();
  const stamp = capturedAt.replace(/[:.]/g, "-");
  const baseName = [
    stamp,
    sanitizeFilenamePart(direction, "tak"),
    sanitizeFilenamePart(sender, "unknown"),
    sanitizeFilenamePart(uid || featureType || rawType, "event"),
    Math.random().toString(36).slice(2, 8),
  ].join("_");
  const xmlPath = path.join(TAK_CAPTURE_DIR, `${baseName}.xml`);
  const jsonPath = path.join(TAK_CAPTURE_DIR, `${baseName}.json`);
  const payload = {
    capturedAt,
    direction: direction || null,
    sender: sender || null,
    uid: uid || null,
    rawType: rawType || null,
    featureType: featureType || null,
    bytes: Buffer.byteLength(xml, "utf8"),
    metadata: metadata || {},
    xmlFile: path.basename(xmlPath),
  };
  fs.writeFileSync(xmlPath, xml, "utf8");
  fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), "utf8");
  return {
    xmlPath,
    jsonPath,
    xmlFile: path.basename(xmlPath),
    jsonFile: path.basename(jsonPath),
  };
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
.model-manager-grid{grid-template-columns:minmax(0,1fr)!important;grid-template-rows:minmax(0,1fr)!important;gap:8px!important;min-height:0!important;height:100%!important;overflow:hidden!important}
.model-manager-grid .modal-section:last-child{display:none!important}
.model-manager-grid .modal-section{display:grid!important;grid-template-rows:auto minmax(0,1fr)!important;min-height:0!important;overflow:hidden!important;padding:6px!important}
.model-manager-list.compact-list{display:flex!important;flex-direction:column;gap:8px;min-height:0!important;overflow-y:auto!important;padding-right:2px}
.model-card.compact{grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:12px;position:relative;overflow:hidden;min-height:72px;padding:10px 10px 12px 16px}
.model-card.compact.installed{background:linear-gradient(90deg,#26372d 0%,#213129 100%)}
.model-card.compact.installable{background:#20242a}
.model-card.compact::before{content:"";position:absolute;left:0;top:0;bottom:0;width:6px;background:var(--model-accent,#6a7a8a);box-shadow:inset -1px 0 0 rgba(0,0,0,.35)}
.model-card.compact.downloading{position:relative;overflow:hidden}
.model-card.compact.downloading::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(72,153,95,.55) 0%,rgba(72,153,95,.35) 100%);transform-origin:left center;transform:scaleX(var(--download-progress,0));pointer-events:none}
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
  let style = document.getElementById(stylesId);
  if (!style) {
    style = document.createElement("style");
    style.id = stylesId;
    document.head.appendChild(style);
  }
  style.textContent = ${JSON.stringify(getModelManagerUiStyle())};

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
  let pinnedModelId = "";

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

  function modelKey(model) {
    return String(model?.filename || model?.id || "");
  }

  function findCardByModelId(root, modelId) {
    if (!root || !modelId) {
      return null;
    }
    return Array.from(root.querySelectorAll("[data-model-id]"))
      .find((card) => card.dataset.modelId === String(modelId)) || null;
  }

  function keepCardVisible(container, card) {
    if (!container || !card) {
      return;
    }
    const top = container.scrollTop;
    const bottom = top + container.clientHeight;
    const cardTop = card.offsetTop;
    const cardBottom = cardTop + card.offsetHeight;
    if (cardTop < top) {
      container.scrollTop = cardTop;
    } else if (cardBottom > bottom) {
      container.scrollTop = Math.max(0, cardBottom - container.clientHeight);
    }
  }

  function accent(model) {
    const haystack = [model?.family, model?.name, model?.filename]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (haystack.includes("deepseek")) return "#4a9eff";
    if (haystack.includes("mistral") || haystack.includes("ministral")) return "#ff9a3c";
    if (haystack.includes("qwen")) return "#39c78d";
    if (haystack.includes("smollm")) return "#b8ef4e";
    if (haystack.includes("tinyllama") || haystack.includes("llama")) return "#ff6b57";
    if (haystack.includes("stable code") || haystack.includes("stable-code")) return "#b18cff";
    return "#6a7a8a";
  }

  function groupRank(model) {
    const haystack = [model?.family, model?.name, model?.filename]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (haystack.includes("deepseek")) return 0;
    if (haystack.includes("mistral") || haystack.includes("ministral")) return 1;
    if (haystack.includes("qwen")) return 2;
    if (haystack.includes("smollm")) return 3;
    if (haystack.includes("tinyllama") || haystack.includes("llama")) return 4;
    if (haystack.includes("stable code") || haystack.includes("stable-code")) return 5;
    return 9;
  }

  function allModels(payload) {
    const installed = Array.isArray(payload?.installed) ? payload.installed : [];
    const available = Array.isArray(payload?.available) ? payload.available.filter((model) => !model.installed) : [];
    return [...installed, ...available].sort((a, b) => {
      const installedDiff = Number(Boolean(b.installed)) - Number(Boolean(a.installed));
      if (installedDiff !== 0) return installedDiff;
      const currentDiff = Number(Boolean(b.current)) - Number(Boolean(a.current));
      if (currentDiff !== 0) return currentDiff;
      const groupDiff = groupRank(a) - groupRank(b);
      if (groupDiff !== 0) return groupDiff;
      const sizeDiff = Number(a?.sizeBytes || 0) - Number(b?.sizeBytes || 0);
      if (sizeDiff !== 0) return sizeDiff;
      return String(a.name || a.filename || "").localeCompare(String(b.name || b.filename || ""));
    });
  }

  function rerender(payload, options = {}) {
    if (!window.installModelFromManager || !window.selectModelFromManager || !window.deleteModelFromManager || !window.loadModelManager) {
      return false;
    }

    const operation = payload?.operation || {};
    const models = allModels(payload);
    const savedScrollTop = Number.isFinite(Number(options.scrollTop))
      ? Number(options.scrollTop)
      : installedList.scrollTop;
    const activeModelId = operation.active
      ? String(operation.modelName || operation.modelId || pinnedModelId || "")
      : "";
    installedList.innerHTML = "";
    catalogList.innerHTML = "";

    if (!models.length) {
      installedList.innerHTML = '<div class="model-empty">No models available</div>';
      return true;
    }

    for (const model of models) {
      const card = document.createElement("article");
      card.className = "model-card compact " + (model.installed ? "installed" : "installable");
      card.dataset.modelId = modelKey(model);
      card.style.setProperty("--model-accent", accent(model));
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
      if (model.installed) tags.appendChild(tag("Installed", "installed"));

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
      const isCancelling = Boolean(operation.cancelling);

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
          pinnedModelId = modelKey(model);
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
          cancelButton.textContent = isCancelling ? "Cancelling..." : "Cancel";
          cancelButton.className = "danger";
          cancelButton.disabled = isCancelling;
          cancelButton.addEventListener("click", async () => {
            pinnedModelId = modelKey(model);
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
    installedList.scrollTop = savedScrollTop;
    if (activeModelId) {
      requestAnimationFrame(() => {
        keepCardVisible(installedList, findCardByModelId(installedList, activeModelId));
      });
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
      const previousScrollTop = installedList.scrollTop;
      original(payload);
      const statusLabel = document.getElementById("modelManagerStatusText");
      if (statusLabel) {
        const operation = payload?.operation || {};
        statusLabel.textContent = operation.active
          ? (
            operation.action === "install"
              ? (
                operation.cancelling
                  ? ("Cancelling " + (operation.modelName || operation.modelId || "model") + "...")
                  : ("Installing " + (operation.modelName || operation.modelId || "model") + " (" + fmtProgress(Number(operation.bytesDownloaded || 0), Number(operation.bytesTotal || 0), Math.max(0, Math.min(100, Number(operation.progress || 0)))) + ")")
              )
              : ("Deleting " + (operation.modelName || operation.modelId || "model") + "...")
          )
          : (operation.error || "");
      }
      rerender(payload, { scrollTop: previousScrollTop });
    };

    if (window.latestModelManagerPayload) {
      rerender(window.latestModelManagerPayload);
    }
  };

  wire();
})();`;
}

function openBrowser() {
  const url = `http://${HOST}:${PORT}`;
  const platform = process.platform;
  let cmd, args;
  if (platform === "darwin") {
    cmd = "open";
    args = [url];
  } else if (platform === "win32") {
    cmd = "cmd";
    args = ["/c", "start", "", url];
  } else {
    cmd = "xdg-open";
    args = [url];
  }
  try {
    const child = spawn(cmd, args, {
      detached: true,
      stdio: "ignore",
      shell: false,
    });
    child.on("error", () => {});
    child.unref();
  } catch (_) {}
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
    return { ok: false, host: LLM_BASE_URL, model: currentModelName, error: "llama-server not found" };
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

function splitMeshText(text, reserveBytes = 0, packetMaxBytes = MESH_PACKET_MAX_BYTES) {
  const chunks = [];
  let remaining = String(text || "").replace(/\s+/g, " ").trim();
  const maxChunkBytes = packetMaxBytes - reserveBytes;

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

function buildMeshPackets(text, packetMaxBytes = MESH_PACKET_MAX_BYTES) {
  const normalized = String(text || "").replace(/\s+/g, " ").trim();
  if (!normalized) {
    return ["No response."];
  }

  let chunks = splitMeshText(normalized, 0, packetMaxBytes);
  if (chunks.length <= 1) {
    return chunks;
  }

  for (let pass = 0; pass < 6; pass += 1) {
    const total = chunks.length;
    const reserve = Buffer.byteLength(`[${total}/${total}] `, "utf8");
    const recalculated = splitMeshText(normalized, reserve, packetMaxBytes);
    if (recalculated.length === total) {
      return recalculated.map((chunk, index) => `[${index + 1}/${total}] ${chunk}`);
    }
    chunks = recalculated;
  }

  const total = chunks.length;
  return chunks.map((chunk, index) => `[${index + 1}/${total}] ${chunk}`);
}

function isCashuMeshText(text) {
  const normalized = String(text || "").trim();
  if (!normalized) {
    return false;
  }
  return /^(\[\d+\s*sats?\]\s*)?(cashu[AB]\S+)/i.test(normalized);
}

function sanitizeMeshReply(text) {
  let s = String(text || "").trim();
  s = s
    .replace(/<\|im_start\|>[\s\S]*/i, "")
    .replace(/<\|im_end\|>[\s\S]*/i, "")
    .replace(/<\|eot_id\|>[\s\S]*/i, "")
    .replace(/<\|start_header_id\|>[\s\S]*/i, "")
    .replace(/\[\/INST\][\s\S]*/i, "")
    .replace(/<\/s>[\s\S]*/i, "")
    .replace(/<\|end\|>[\s\S]*/i, "")
    .replace(/<\|[^|>]{1,30}\|>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return s || "No response.";
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
        { role: "system", content: buildMeshSystemPrompt(aiSettings) },
        ...history,
        { role: "user", content: prompt },
      ],
      temperature: aiSettings.meshTemperature,
      top_p: aiSettings.meshTopP,
      max_tokens: aiSettings.meshMaxTokens,
      stop: ["<|im_end|>", "<|im_start|>", "<|eot_id|>", "<|start_header_id|>", "[/INST]", "<<SYS>>", "</s>", "<|end|>"],
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM HTTP ${response.status}`);
  }

  const data = await response.json();
  const reply = sanitizeMeshReply(data.choices?.[0]?.message?.content || "");
  saveHistory(peerId, [...history, { role: "user", content: prompt }, { role: "assistant", content: reply }]);
  return reply;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function enqueueMeshBatch(
  destinationId,
  packets,
  sender = "local-ai",
  batchDelayMs = MESH_PACKET_BATCH_DELAY_MS,
  options = {},
) {
  const isDirectMessage = Object.hasOwn(options, "isDirectMessage")
    ? Boolean(options.isDirectMessage)
    : destinationId !== "^all";
  const channelIndex = normalizeChannelIndex(options.channelIndex, 0);
  const task = async () => {
    for (let index = 0; index < packets.length; index += 1) {
      const messageText = packets[index];
      const clientMsgId = `cmid_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      sendBridge({
        type: "send_text",
        payload: {
          destinationId,
          text: messageText,
          wantAck: true,
          waitForAck: false,
          retryOnAckTimeout: MESH_ACK_RETRY_COUNT,
          ackTimeoutRetryDelayMs: MESH_ACK_RETRY_DELAY_MS,
          clientMsgId,
          channelIndex,
        },
      });
      const msg = addMessage({
        direction: "out",
        sender,
        recipient: destinationId,
        text: messageText,
        transport: "serial",
        ack: "pending",
        channelIndex,
        isDirectMessage,
      });
      pendingMsgByClientId.set(clientMsgId, msg.id);
      if (index < packets.length - 1) {
        await sleep(batchDelayMs);
      }
    }
  };

  const queued = meshSendQueue.catch(() => {}).then(task);
  meshSendQueue = queued;
  return queued;
}

async function sendMeshReply(destinationId, text, sender = "local-ai", options = {}) {
  const isCashu = isCashuMeshText(text);
  const packetMaxBytes = isCashu ? MESH_PACKET_MAX_BYTES_CASHU : MESH_PACKET_MAX_BYTES;
  const batchDelayMs = isCashu ? MESH_PACKET_BATCH_DELAY_MS_CASHU : MESH_PACKET_BATCH_DELAY_MS;
  const packets = buildMeshPackets(text, packetMaxBytes);
  await enqueueMeshBatch(destinationId, packets, sender, batchDelayMs, options);
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
  const isDirectMessage = Boolean(payload.isDirectMessage);
  const channelIndex = normalizeChannelIndex(payload.channelIndex, 0);

  addMessage({
    direction: "in",
    sender: payload.sender,
    recipient: isDirectMessage ? "local-ai" : "^all",
    text: repairedText,
    transport: payload.transport || "serial",
    isDirectMessage,
    channelIndex,
  });

  if (!isDirectMessage) {
    return;
  }

  if (!isMeshAiReplyEnabled()) {
    return;
  }

  if (String(repairedText || "").trim().toLowerCase() === "!reset") {
    sessions.delete(payload.sender);
    const resetText = "Context reset.";
    await sendMeshReply(payload.sender, resetText);
    return;
  }

  const prompt = String(repairedText || "").trim();

  const reply = await generateMeshReply(payload.sender, prompt);
  await sendMeshReply(payload.sender, reply);
}

let bridgeProcess = null;
let llamaProcess = null;
let bridgeRetryTimeout = null;
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
    updateLlmStatus({ connected: false, mode: "error", error: "llama-server not found", switching: false });
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
      cwd: fs.existsSync(LLAMA_DIR) ? LLAMA_DIR : __dirname,
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
    cancelling: false,
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

  const abortController = new AbortController();
  modelDownloadAbortController = abortController;

  (async () => {
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
        cancelling: false,
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
        cancelling: false,
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
  updateModelManagerOperation({
    cancelling: true,
    error: null,
  });
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
  if (bridgeRetryTimeout) {
    clearTimeout(bridgeRetryTimeout);
    bridgeRetryTimeout = null;
  }
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
            if (message.payload?.localNodeId) localMeshNodeId = String(message.payload.localNodeId);
            updateMeshtasticStatus(message.payload);
          } else if (message.type === "nodes") {
            mergeBridgeNodes(message.payload?.nodes || []);
          } else if (message.type === "packet") {
            trackMeshLink(message.payload);
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
          } else if (message.type === "ack") {
            const { packetId, errorReason } = message.payload || {};
            if (packetId != null) {
              const msgId = pendingMsgByPacketId.get(packetId);
              if (msgId != null) {
                const ack = (!errorReason || errorReason === "NONE") ? "delivered" : "failed";
                updateMessageAck(msgId, ack);
                pendingMsgByPacketId.delete(packetId);
              }
            }
          } else if (message.type === "sent") {
            if (activeBridge !== bridgeProcess) {
              newlineIndex = stdoutBuffer.indexOf("\n");
              continue;
            }
            updateMeshtasticStatus({ connected: true, mode: "serial", error: null });
            const clientMsgId = message.payload?.clientMsgId;
            const packetId = message.payload?.packetId;
            if (clientMsgId && pendingMsgByClientId.has(clientMsgId)) {
              const msgId = pendingMsgByClientId.get(clientMsgId);
              pendingMsgByClientId.delete(clientMsgId);
              updateMessageAck(msgId, "sent");
              if (packetId != null) {
                pendingMsgByPacketId.set(packetId, msgId);
              }
            }
          } else if (message.type === "device_meta_saved") {
            // no-op, nodes snapshot follows
          } else if (message.type === "position_requested") {
            broadcast("position_requested", { nodeId: message.payload?.destinationId });
          } else if (message.type === "tak_sent") {
            const transport = String(message.payload?.transport || "");
            broadcast("tak_send_status", {
              uid: message.payload?.uid,
              status: transport === "fountain-unconfirmed" ? "unconfirmed" : "sent",
              transport,
            });
          } else if (message.type === "tak") {
            const cotXml = message.payload?.cotXml || "";
            if (cotXml) {
              const feature = parseCotXml(cotXml);
              const capture = captureTakEvent({
                direction: "incoming",
                sender: message.payload?.sender || "unknown",
                uid: feature?.uid || "",
                rawType: feature?.rawType || "",
                featureType: feature?.type || "",
                cotXml,
                metadata: feature
                  ? {
                      parsed: true,
                      label: feature.label || "",
                      color: feature.color || "",
                      latlng: feature.latlng || null,
                      latlngs: Array.isArray(feature.latlngs) ? feature.latlngs : null,
                      radiusMeters: feature.radiusMeters ?? null,
                      majorMeters: feature.majorMeters ?? null,
                      minorMeters: feature.minorMeters ?? null,
                      rectLengthMeters: feature.rectLengthMeters ?? null,
                      rectWidthMeters: feature.rectWidthMeters ?? null,
                      angleDeg: feature.angleDeg ?? null,
                      rangeMeters: feature.rangeMeters ?? null,
                      bearingDeg: feature.bearingDeg ?? null,
                      metadataOnly: feature.metadataOnly === true,
                    }
                  : {
                      parsed: false,
                      preview: cotXml.replace(/\s+/g, " ").slice(0, 320),
                    },
              });
              if (feature) {
                addMessage({
                  direction: "system",
                  sender: "tak",
                  recipient: "-",
                  text: `TAK parsed raw=${feature.rawType || "-"} type=${feature.type} uid=${feature.uid || "-"} label=${feature.label || "-"} lat=${Array.isArray(feature.latlng) ? feature.latlng[0] : "-"} lon=${Array.isArray(feature.latlng) ? feature.latlng[1] : "-"} radius=${feature.radiusMeters ?? "-"} major=${feature.majorMeters ?? "-"} minor=${feature.minorMeters ?? "-"} rectL=${feature.rectLengthMeters ?? "-"} rectW=${feature.rectWidthMeters ?? "-"} range=${feature.rangeMeters ?? "-"} bearing=${feature.bearingDeg ?? "-"} metaOnly=${feature.metadataOnly === true ? 1 : 0} capture=${capture?.xmlFile || "-"}`,
                  transport: "tak",
                });
                feature.sender = message.payload?.sender || null;
                if (feature.type === "delete") latestTakFeatures.delete(feature.uid);
                else latestTakFeatures.set(feature.uid, feature);
                broadcast("tak_feature", feature);
              } else {
                addMessage({
                  direction: "system",
                  sender: "tak",
                  recipient: "-",
                  text: `TAK XML received but not rendered from ${message.payload?.sender || "unknown"} capture=${capture?.xmlFile || "-"}: ${cotXml.replace(/\s+/g, " ").slice(0, 320)}`,
                  transport: "tak",
                });
              }
            }
          } else if (message.type === "tak_debug") {
            const payload = message.payload || {};
            const side = payload.direction || "rx";
            const portnum = payload.portnum || "UNKNOWN";
            const sender = payload.sender || "unknown";
            const channel = payload.channelIndex ?? 0;
            const hop = payload.hopLimit ?? "-";
            const transport = payload.transport ? ` ${payload.transport}` : "";
            const decode = payload.decode ? ` decode=${payload.decode}` : "";
            const bytes = payload.compressedBytes != null
              ? ` ${payload.compressedBytes}B`
              : payload.payloadBytes != null
                ? ` ${payload.payloadBytes}B`
                : "";
            const blocks = payload.blocksReceived != null && payload.sourceBlockCount != null
              ? ` blocks=${payload.blocksReceived}/${payload.sourceBlockCount}`
              : "";
            const totalLen = payload.totalLength != null ? ` len=${payload.totalLength}` : "";
            const transferType = payload.transferType != null ? ` type=${payload.transferType}` : "";
            const prefix = payload.payloadPrefix ? ` prefix=${payload.payloadPrefix}` : "";
            const cotBytes = payload.cotXmlBytes != null ? ` cot=${payload.cotXmlBytes}` : "";
            const payloadDebug = payload.payloadDebug || {};
            const inflate =
              payloadDebug.zlibBytes != null
                ? ` zlib=${payloadDebug.zlibBytes}`
                : payloadDebug["raw-deflateBytes"] != null
                  ? ` rawdeflate=${payloadDebug["raw-deflateBytes"]}`
                  : "";
            const inflatePrefix = payloadDebug.zlibPrefix
              ? ` zprefix=${payloadDebug.zlibPrefix}`
              : payloadDebug["raw-deflatePrefix"]
                ? ` rprefix=${payloadDebug["raw-deflatePrefix"]}`
                : "";
            const preview = payloadDebug.zlibPreview
              ? ` preview=${JSON.stringify(payloadDebug.zlibPreview)}`
              : payloadDebug["raw-deflatePreview"]
                ? ` preview=${JSON.stringify(payloadDebug["raw-deflatePreview"])}`
                : "";
            const extra = payload.note ? ` ${payload.note}` : "";
            addMessage({
              direction: "system",
              sender: "tak",
              recipient: "-",
              text: `${side.toUpperCase()} ${portnum} from ${sender} ch${channel} hop ${hop}${transport}${bytes}${decode}${blocks}${totalLen}${transferType}${cotBytes}${prefix}${inflate}${inflatePrefix}${preview}${extra}`,
              transport: "tak",
            });
          } else if (message.type === "error") {
            if (activeBridge === bridgeProcess) {
              updateMeshtasticStatus({ error: message.payload.message || "bridge error" });
            }
            if (message.payload?.uid) {
              broadcast("tak_send_status", { uid: message.payload.uid, status: "error", reason: message.payload.message || "" });
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
    if (code !== 0) {
      updateMeshtasticStatus({ connected: false, mode: "connecting", error: `bridge exited with code ${code}, retrying...` });
      bridgeRetryTimeout = setTimeout(() => {
        bridgeRetryTimeout = null;
        if (!bridgeProcess) {
          startBridge();
        }
      }, 5000);
    } else {
      updateMeshtasticStatus({ connected: false, mode: "stopped", error: `bridge exited with code ${code}` });
    }
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

  if (nodesStatusPushInterval) {
    clearInterval(nodesStatusPushInterval);
  }
  nodesStatusPushInterval = setInterval(() => {
    if (clients.size > 0) {
      broadcast("nodes", getNodesPayload());
    }
  }, NODES_STATUS_PUSH_INTERVAL_MS);
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
      if (latestTakFeatures.size > 0) {
        res.write(`event: tak_features\ndata: ${JSON.stringify([...latestTakFeatures.values()])}\n\n`);
      }
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
        walletTestMode: isTestMode(),
        meshAiReply: isMeshAiReplyEnabled(),
      });
    }

    if (req.method === "POST" && req.url === "/api/mesh-ai-reply") {
      const body = await readJson(req);
      appSettings.meshAiReply = Boolean(body.enabled);
      persistSettings();
      broadcast("status", { meshAiReply: appSettings.meshAiReply });
      return sendJson(res, 200, { ok: true, meshAiReply: appSettings.meshAiReply });
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
        const result = clearMessages(body.scope, body.peerId, body.channelIndex);
        return sendJson(res, 200, result);
      } catch (error) {
        return sendJson(res, 400, { error: error.message });
      }
    }

    if (req.method === "GET" && req.url === "/api/nodes") {
      return sendJson(res, 200, getNodesPayload());
    }

    if (req.method === "GET" && req.url === "/api/device-meta") {
      const localNode = localMeshNodeId
        ? Object.values(knownNodes).find((n) => String(n.meshNum) === localMeshNodeId)
        : null;
      return sendJson(res, 200, {
        shortName: localNode?.shortName || "",
        longName: localNode?.longName || "",
        latitude: localNode?.latitude ?? null,
        longitude: localNode?.longitude ?? null,
        modemPreset: localNode?.modemPreset || "LONG_FAST",
        takChannel: getConfiguredTakChannel(),
        takHopLimit: getConfiguredTakHopLimit(),
      });
    }

    if (req.method === "POST" && req.url === "/api/device-meta") {
      const body = await readJson(req);
      if (Object.prototype.hasOwnProperty.call(body, "takChannel")) {
        setConfiguredTakChannel(body.takChannel);
      }
      if (Object.prototype.hasOwnProperty.call(body, "takHopLimit")) {
        setConfiguredTakHopLimit(body.takHopLimit);
      }
      try {
        const bridgePayload = { ...body };
        delete bridgePayload.takChannel;
        delete bridgePayload.takHopLimit;
        sendBridge({ type: "set_device_meta", payload: bridgePayload });
        return sendJson(res, 200, { ok: true });
      } catch (e) {
        return sendJson(res, 503, { error: e.message });
      }
    }

    if (req.method === "POST" && req.url.startsWith("/api/node/") && req.url.endsWith("/request-position")) {
      const nodeId = decodeURIComponent(req.url.slice("/api/node/".length, -"/request-position".length));
      if (!nodeId) return sendJson(res, 400, { error: "nodeId required" });
      try {
        sendBridge({ type: "request_position", payload: { destinationId: nodeId } });
        return sendJson(res, 200, { ok: true, nodeId });
      } catch (e) {
        return sendJson(res, 503, { error: "bridge not connected" });
      }
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

    if (req.method === "POST" && req.url === "/api/tak/send") {
      const body = await readJson(req);
      const uid = body.uid || `tak-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const feature = {
        uid,
        type: body.type,
        latlng: body.latlng,
        latlngs: body.latlngs,
        radiusMeters: body.radiusMeters ?? null,
        rangeMeters: body.rangeMeters ?? null,
        bearingDeg: body.bearingDeg ?? null,
        majorMeters: body.majorMeters ?? null,
        minorMeters: body.minorMeters ?? null,
        angleDeg: body.angleDeg ?? null,
        label: body.label || "",
        color: body.color || "#4a9eff",
        fillColor: body.fillColor || body.color || "#4a9eff",
        strokeWeight: body.strokeWeight ?? 1,
        strokeStyle: body.strokeStyle || "solid",
        remarks: body.remarks || "",
        cotType: body.cotType || "",
        iconsetPath: body.iconsetPath || "",
        markerPreset: body.markerPreset || "",
      };
      const takBuild = buildTakCotForMesh(feature);
      if (!takBuild?.cotXml) {
        return sendJson(res, 400, {
          error: takBuild?.error || "invalid feature type",
          compressedBytes: takBuild?.compressedBytes ?? null,
          originalPoints: takBuild?.originalPoints ?? null,
          sentPoints: takBuild?.sentPoints ?? null,
        });
      }
      const cotXml = takBuild.cotXml;
      const compressedBytes = takBuild.compressedBytes ?? compressCotXml(cotXml).length;
      const capture = captureTakEvent({
        direction: "outgoing",
        sender: "local-ui",
        uid,
        rawType: feature.type,
        featureType: feature.type,
        cotXml,
        metadata: {
          label: feature.label || "",
          color: feature.color || "",
          fillColor: feature.fillColor || "",
          strokeWeight: feature.strokeWeight ?? 1,
          strokeStyle: feature.strokeStyle || "",
          remarks: feature.remarks || "",
          cotType: feature.cotType || "",
          iconsetPath: feature.iconsetPath || "",
          latlng: feature.latlng || null,
          latlngs: Array.isArray(feature.latlngs) ? feature.latlngs : null,
          radiusMeters: feature.radiusMeters ?? null,
          rangeMeters: feature.rangeMeters ?? null,
          bearingDeg: feature.bearingDeg ?? null,
          majorMeters: feature.majorMeters ?? null,
          minorMeters: feature.minorMeters ?? null,
          angleDeg: feature.angleDeg ?? null,
          compressedBytes,
          channelIndex: getConfiguredTakChannel(),
          hopLimit: getConfiguredTakHopLimit(),
        },
      });
      let bridgeOnline = true;
      try {
        sendBridge({
          type: "send_tak",
          payload: {
            cotXml,
            destinationId: "^all",
            uid,
            channelIndex: getConfiguredTakChannel(),
            hopLimit: getConfiguredTakHopLimit(),
          },
        });
      } catch (_) { bridgeOnline = false; }
      if (bridgeOnline) broadcast("tak_send_status", { uid, status: "queued" });
      if (!bridgeOnline) broadcast("tak_send_status", { uid, status: "error", reason: "bridge_offline" });
      return sendJson(res, 200, {
        ok: bridgeOnline,
        uid,
        captureFile: capture?.xmlFile || null,
        error: bridgeOnline ? null : "bridge not connected",
        simplified: takBuild.simplified === true,
        downgradedTo: takBuild.downgradedTo || null,
        compressedBytes,
        originalPoints: takBuild.originalPoints ?? null,
        sentPoints: takBuild.sentPoints ?? null,
      });
    }

    if (req.method === "POST" && req.url === "/api/tak/delete") {
      const body = await readJson(req);
      const uid = String(body.uid || "").trim();
      if (!uid) {
        return sendJson(res, 400, { error: "uid is required" });
      }
      const feature = {
        uid,
        type: body.type || "",
        rawType: body.rawType || "",
        cotType: body.cotType || "",
        latlng: body.latlng || null,
        radiusMeters: body.radiusMeters ?? null,
        rangeMeters: body.rangeMeters ?? null,
        bearingDeg: body.bearingDeg ?? null,
      };
      const cotXml = buildTakDeleteCot(feature);
      if (!cotXml) {
        return sendJson(res, 400, { error: "unable to build TAK delete event" });
      }
      const compressedBytes = compressCotXml(cotXml).length;
      const capture = captureTakEvent({
        direction: "outgoing",
        sender: "local-ui",
        uid,
        rawType: feature.rawType || feature.cotType || feature.type || "delete",
        featureType: "delete",
        cotXml,
        metadata: {
          delete: true,
          targetType: feature.type || "",
          latlng: feature.latlng || null,
          radiusMeters: feature.radiusMeters ?? null,
          rangeMeters: feature.rangeMeters ?? null,
          bearingDeg: feature.bearingDeg ?? null,
          compressedBytes,
          channelIndex: getConfiguredTakChannel(),
          hopLimit: getConfiguredTakHopLimit(),
        },
      });
      let bridgeOnline = true;
      try {
        sendBridge({
          type: "send_tak",
          payload: {
            cotXml,
            destinationId: "^all",
            uid,
            channelIndex: getConfiguredTakChannel(),
            hopLimit: getConfiguredTakHopLimit(),
          },
        });
      } catch (_) { bridgeOnline = false; }
      if (bridgeOnline) broadcast("tak_send_status", { uid, status: "queued" });
      if (!bridgeOnline) broadcast("tak_send_status", { uid, status: "error", reason: "bridge_offline" });
      return sendJson(res, 200, {
        ok: bridgeOnline,
        uid,
        captureFile: capture?.xmlFile || null,
        error: bridgeOnline ? null : "bridge not connected",
        compressedBytes,
      });
    }

    if (req.method === "POST" && req.url === "/api/mesh/send") {
      const body = await readJson(req);
      const destinationId = String(body.destinationId || "").trim();
      const text = String(body.text || "").trim();
      const hasChannelIndex = Object.hasOwn(body, "channelIndex");
      const channelIndex = normalizeChannelIndex(body.channelIndex, 0);
      const targetId = destinationId || (hasChannelIndex ? "^all" : "");
      if (!targetId || !text) {
        return sendJson(res, 400, { error: "destinationId or channelIndex, and text are required" });
      }
      const isDirectMessage = targetId !== "^all";
      await sendMeshReply(targetId, text, "local-ui", { channelIndex, isDirectMessage });
      return sendJson(res, 200, { ok: true, destinationId: targetId, channelIndex, isDirectMessage });
    }

    if (req.method === "GET" && req.url === "/api/cashu") {
      return sendJson(res, 200, getCashuPayload());
    }

    if (req.method === "POST" && req.url === "/api/cashu/mint") {
      const body = await readJson(req);
      const mintUrl = String(body.mintUrl || "").trim();
      if (!mintUrl) return sendJson(res, 400, { error: "mintUrl required" });
      if (isTestMode() && getMintNetwork(mintUrl) === "mainnet") {
        return sendJson(res, 400, { error: `Test mode requires a signet/mutinynet mint, not a mainnet mint. Use ${TEST_CASHU_DEFAULT_MINT}` });
      }
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
        const result = await withCashuLock(() => cashuCheckInvoice(hash));
        return sendJson(res, 200, result);
      } catch (e) {
        return sendJson(res, 402, { error: normalizeCashuError(e) });
      }
    }

    if (req.method === "POST" && req.url === "/api/cashu/send") {
      const body = await readJson(req);
      const selection = Array.isArray(body.selection) ? body.selection : [];
      const selectionAmount = selection.reduce((sum, item) => {
        const amount = Math.floor(Number(item?.amount || 0));
        const count = Math.floor(Number(item?.count || 0));
        return sum + ((amount > 0 && count > 0) ? amount * count : 0);
      }, 0);
      const amount = Number(body.amount || selectionAmount);
      if (!amount || amount <= 0) return sendJson(res, 400, { error: "amount required" });
      try {
        const result = await withCashuLock(() => cashuSendToken(amount, {
          exactOfflineOnly: body.exactOfflineOnly,
          selection,
        }));
        addCashuHistory({
          direction: "Sent",
          amount: result.amount || amount,
          unit: "sats",
          peer: body.peer || "Cashu token",
          status: result.mode === "offline-exact" ? "Token created (off-grid)" : "Token created via mint split",
        });
        persistActiveCashu();
        return sendJson(res, 200, result);
      } catch (e) {
        console.error("[cashu/send] error:", String(e?.message || e));
        return sendJson(res, 400, { error: normalizeCashuError(e) });
      }
    }

    if (req.method === "POST" && req.url === "/api/cashu/make-change") {
      const body = await readJson(req);
      const amount = Number(body.amount);
      const preset = String(body.preset || "balanced");
      if (!amount || amount <= 0) return sendJson(res, 400, { error: "amount required" });
      try {
        const result = await withCashuLock(() => cashuMakeChange(amount, preset));
        return sendJson(res, 200, result);
      } catch (e) {
        console.error("[cashu/make-change] error:", String(e?.message || e));
        return sendJson(res, 400, { error: normalizeCashuError(e) });
      }
    }

    if (req.method === "POST" && req.url === "/api/cashu/offgrid/prepare") {
      const body = await readJson(req);
      const amount = Number(body.amount);
      if (!amount || amount <= 0) return sendJson(res, 400, { error: "amount required" });
      try {
        const result = await withCashuLock(() => cashuPrepareOffgridAmount(amount));
        return sendJson(res, 200, result);
      } catch (e) {
        console.error("[cashu/offgrid/prepare] error:", String(e?.message || e));
        return sendJson(res, 400, { error: normalizeCashuError(e) });
      }
    }

    if (req.method === "POST" && req.url === "/api/cashu/offgrid/remove") {
      const body = await readJson(req);
      const amount = Number(body.amount);
      const count = Number(body.count || 1);
      if (!amount || amount <= 0) return sendJson(res, 400, { error: "amount required" });
      try {
        const result = await withCashuLock(() => cashuRemoveOffgridAmount(amount, count));
        return sendJson(res, 200, result);
      } catch (e) {
        console.error("[cashu/offgrid/remove] error:", String(e?.message || e));
        return sendJson(res, 400, { error: normalizeCashuError(e) });
      }
    }

    if (req.method === "POST" && req.url === "/api/cashu/compact") {
      try {
        const result = await withCashuLock(() => cashuCompactInventory());
        return sendJson(res, 200, result);
      } catch (e) {
        console.error("[cashu/compact] error:", String(e?.message || e));
        return sendJson(res, 400, { error: normalizeCashuError(e) });
      }
    }

    if (req.method === "POST" && req.url === "/api/cashu/receive") {
      const body = await readJson(req);
      const tokenRaw = String(body.token || "");
      const token = normalizeIncomingCashuTokenInput(tokenRaw);
      if (!token) return sendJson(res, 400, { error: "token required" });
      try {
        const result = await withCashuLock(() => cashuReceiveToken(token));
        return sendJson(res, 200, result);
      } catch (e) {
        console.error("[cashu/receive]", {
          error: String(e?.message || e || "unknown error"),
          tokenLength: token.length,
          tokenPreview: token.slice(0, 24),
        });
        return sendJson(res, 400, { error: normalizeCashuError(e) });
      }
    }

    if (req.method === "POST" && req.url === "/api/cashu/swap-pending") {
      try {
        const result = await withCashuLock(() => cashuSwapPending());
        return sendJson(res, 200, result);
      } catch (e) {
        return sendJson(res, 400, { error: normalizeCashuError(e) });
      }
    }

    if (req.method === "POST" && req.url === "/api/cashu/melt") {
      const body = await readJson(req);
      const pr = String(body.pr || "").trim();
      if (!pr) return sendJson(res, 400, { error: "Lightning invoice (pr) required" });
      try {
        const result = await withCashuLock(() => cashuMeltToLightning(pr));
        return sendJson(res, 200, result);
      } catch (e) {
        return sendJson(res, 400, { error: normalizeCashuError(e) });
      }
    }

    if (req.method === "GET" && req.url === "/api/wallet") {
      return sendJson(res, 200, getWalletPayload());
    }

    // ── Swap endpoints ──────────────────────────────────────────────────────
    if (req.method === "GET" && req.url === "/api/swap/list") {
      return sendJson(res, 200, getSwapsPayload());
    }

    if (req.method === "POST" && req.url === "/api/swap/clear") {
      swaps = [];
      persistSwaps();
      broadcast("swaps", getSwapsPayload());
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === "POST" && req.url === "/api/swap/btc-to-cashu") {
      const body = await readJson(req);
      const amount = Number(body.amount);
      if (!amount || amount < 1000) return sendJson(res, 400, { error: "Minimum 1000 sats" });
      try {
        const swap = await startSubmarineSwap(amount);
        if (swap.pr && !swap.qr) swap.qr = await generateLightningQr(swap.pr);
        return sendJson(res, 200, swap);
      } catch (e) {
        return sendJson(res, 502, { error: e.message });
      }
    }

    if (req.method === "POST" && req.url === "/api/swap/cashu-to-btc") {
      const body = await readJson(req);
      const receiverAddress = String(body.address || "").trim();
      if (!receiverAddress) return sendJson(res, 400, { error: "Lightning invoice required" });
      try {
        const swap = await startReverseSwap(0, receiverAddress);
        return sendJson(res, 200, swap);
      } catch (e) {
        return sendJson(res, 502, { error: e.message });
      }
    }

    if (req.method === "DELETE" && req.url.startsWith("/api/swap/")) {
      const id = req.url.split("/api/swap/")[1];
      swaps = swaps.filter((s) => s.id !== id);
      persistSwaps();
      return sendJson(res, 200, { ok: true });
    }
    // ── End Swap endpoints ──────────────────────────────────────────────────

    if (req.method === "POST" && req.url === "/api/wallet/testmode") {
      const body = await readJson(req);
      const enable = Boolean(body.enabled);
      appSettings.walletTestMode = enable;
      // Enforce signet mint when entering test mode
      if (enable && getMintNetwork(testCashuData.mintUrl) === "mainnet") {
        testCashuData.mintUrl = TEST_CASHU_DEFAULT_MINT;
        testCashuData.proofs = [];
        testCashuData.pendingInvoices = [];
        fs.writeFileSync(TEST_CASHU_FILE, JSON.stringify(testCashuData, null, 2), "utf8");
      }
      cashuInvalidateWalletCache();
      persistSettings();
      broadcast("status", { walletTestMode: enable });
      return sendJson(res, 200, { testMode: enable, testMintUrl: testCashuData.mintUrl });
    }
    if (req.method === "POST" && req.url === "/api/wallet/faucet") {
      if (!isTestMode()) return sendJson(res, 403, { error: "Faucet only available in test mode" });
      const activeWallet = getActiveWalletData();
      return sendJson(res, 400, {
        error: "Mutinynet faucet requests now require a browser session token. Open faucet.mutinynet.com in a browser and use your test wallet address or Lightning invoice there.",
        address: activeWallet?.address || null,
      });
    }

    if (req.method === "POST" && req.url === "/api/wallet/create") {
      const activeData = getActiveWalletData();
      if (activeData) {
        return sendJson(res, 409, { error: "Wallet already exists. Reset first." });
      }
      const result = isTestMode() ? createTestWallet() : createWallet();
      return sendJson(res, 200, result);
    }

    if (req.method === "GET" && req.url === "/api/wallet/balance") {
      const activeWallet = getActiveWalletData();
      if (!activeWallet) return sendJson(res, 404, { error: "No wallet" });
      const balance = await fetchBtcBalance(activeWallet.address);
      if (!balance) return sendJson(res, 502, { error: "Could not reach mempool.space" });
      return sendJson(res, 200, balance);
    }

    if (req.method === "GET" && req.url === "/api/wallet/transactions") {
      const activeWallet = getActiveWalletData();
      if (!activeWallet) return sendJson(res, 404, { error: "No wallet" });
      const txs = await fetchBtcTransactions(activeWallet.address);
      return sendJson(res, 200, { transactions: txs });
    }

    if (req.method === "GET" && req.url === "/api/wallet/qr") {
      const activeWallet = getActiveWalletData();
      if (!activeWallet) return sendJson(res, 404, { error: "No wallet" });
      const qr = await generateWalletQr(activeWallet.address);
      return sendJson(res, 200, { qr });
    }

    if (req.method === "GET" && req.url === "/api/wallet/fees") {
      const fees = await fetchFeeEstimate();
      return sendJson(res, 200, fees);
    }

    if (req.method === "POST" && req.url === "/api/wallet/send") {
      const activeWallet = getActiveWalletData();
      if (!activeWallet) return sendJson(res, 404, { error: "No wallet" });
      const body = await readJson(req);
      const toAddress = String(body.toAddress || "").trim();
      const amountSats = Number(body.amountSats);
      const feeRate = Math.max(1, Number(body.feeRate) || 5);
      if (!toAddress) return sendJson(res, 400, { error: "toAddress required" });
      if (!amountSats || amountSats < 546) return sendJson(res, 400, { error: "Minimum amount is 546 sats" });
      try {
        const result = await buildAndBroadcastBtcTx(toAddress, amountSats, feeRate);
        return sendJson(res, 200, result);
      } catch (e) {
        return sendJson(res, 502, { error: e.message });
      }
    }

    if (req.method === "POST" && req.url === "/api/wallet/pay-lightning") {
      const activeWallet = getActiveWalletData();
      if (!activeWallet) return sendJson(res, 404, { error: "No wallet" });
      const body = await readJson(req);
      const invoice = String(body.invoice || "").trim();
      if (!invoice) return sendJson(res, 400, { error: "invoice required" });
      const invoiceNet = detectInvoiceNetwork(invoice);
      const expectedNet = isTestMode() ? "signet" : "mainnet";
      if (invoiceNet !== "unknown" && invoiceNet !== expectedNet) {
        return sendJson(res, 400, { error: `Network mismatch: got ${invoiceNet} invoice, expected ${expectedNet}` });
      }
      try {
        // Generate ephemeral refund keypair
        const crypto = require("crypto");
        const { secp256k1 } = require("@noble/curves/secp256k1");
        const refundPriv = crypto.randomBytes(32);
        const refundPub = secp256k1.getPublicKey(refundPriv, true);
        const refundPubHex = Buffer.from(refundPub).toString("hex");

        // Create Boltz submarine swap (v2 API: from/to instead of pair)
        const boltzBase = isTestMode()
          ? "https://api.testnet.boltz.exchange"
          : "https://api.boltz.exchange";
        // v2 API uses { from, to } not { pair }
        const swapBody = JSON.stringify({ from: "BTC", to: "BTC", invoice, refundPublicKey: refundPubHex });
        const swapData = await new Promise((resolve, reject) => {
          const https = require("https");
          const url = new URL(`${boltzBase}/v2/swap/submarine`);
          const opts = {
            hostname: url.hostname, path: url.pathname, method: "POST",
            headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(swapBody) },
            timeout: 15000,
          };
          const req2 = https.request(opts, (res2) => {
            let d = "";
            res2.on("data", (c) => { d += c; });
            res2.on("end", () => {
              console.log(`[boltz] submarine swap response (${res2.statusCode}):`, d.slice(0, 500));
              try {
                const parsed = JSON.parse(d);
                if (parsed.error) reject(new Error(`Boltz: ${parsed.error}`));
                else resolve(parsed);
              } catch { reject(new Error(`Boltz error: ${d.slice(0, 200)}`)); }
            });
          });
          req2.on("error", reject);
          req2.on("timeout", () => { req2.destroy(); reject(new Error("Boltz timeout")); });
          req2.write(swapBody);
          req2.end();
        });

        console.log("[boltz] swap data keys:", Object.keys(swapData));
        const swapAddress = swapData.address || swapData.lockupAddress;
        // v2 returns lockupAmount; some versions use expectedAmount
        const expectedAmount = swapData.lockupAmount || swapData.expectedAmount;
        if (!swapAddress || !expectedAmount) throw new Error(`Invalid Boltz response — got: ${JSON.stringify(swapData).slice(0, 200)}`);

        // Fetch fee for the on-chain tx
        const fees = await fetchFeeEstimate();
        const feeRate = fees.halfHourFee || 5;

        // Send BTC to swap address
        const txResult = await buildAndBroadcastBtcTx(swapAddress, expectedAmount, feeRate);

        // Track as a swap
        const swap = {
          id: createSwapId("btc-ln"),
          type: "btc-ln-swap",
          status: "payment_pending",
          statusLabel: "BTC sent to Boltz, waiting for Lightning payment...",
          amount: expectedAmount,
          boltzId: swapData.id,
          txid: txResult.txid,
          createdAt: new Date().toISOString(),
        };
        swaps.push(swap);
        persistSwaps();
        broadcast("swaps", getSwapsPayload());

        return sendJson(res, 200, { swapId: swapData.id, txid: txResult.txid, expectedAmount });
      } catch (e) {
        return sendJson(res, 502, { error: e.message });
      }
    }

    if (req.method === "GET" && req.url.startsWith("/api/qr")) {
      const urlObj = new URL(req.url, "http://localhost");
      const data = urlObj.searchParams.get("data") || "";
      if (!data) return sendJson(res, 400, { error: "data param required" });
      const QRCode = require("qrcode");
      const qr = await QRCode.toDataURL(data, { width: 180, margin: 1, color: { dark: "#f2f8ff", light: "#151d27" } });
      return sendJson(res, 200, { qr });
    }

    if (req.method === "POST" && req.url === "/api/wallet/reset") {
      if (isTestMode()) {
        testWalletData = null;
        persistTestWallet();
      } else {
        walletData = null;
        persistWallet();
      }
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
        '<div class="titlebar-text">BLACK<span style="color:var(--success)">BOX</span> NODE</div>',
        '<div class="titlebar-brand" style="display:flex;align-items:center;gap:10px;min-width:0;"><img src="/static/logo.svg" alt="" class="titlebar-logo" style="width:24px;height:24px;display:block;flex:0 0 auto;"><div class="titlebar-text">BLACK<span style="color:var(--success)">BOX</span> NODE</div></div>'
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

      const headers = { "Content-Type": contentType };
      if (filePath.endsWith("map-sw.js")) headers["Service-Worker-Allowed"] = "/";
      res.writeHead(200, headers);
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
  startSwapPolling();
});
