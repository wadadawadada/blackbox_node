const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT_DIR = path.resolve(__dirname, "..");
const LLAMA_DIR = path.join(ROOT_DIR, "llama");
const MODELS_DIR = path.join(ROOT_DIR, "models");
const PYDEPS_DIR = path.join(ROOT_DIR, "pydeps");

const REQUIRED_LLAMA_FILES = ["llama-server.exe", "llama.dll", "ggml.dll", "ggml-base.dll"];
const DEFAULT_MODEL = {
  filename: "Qwen2.5-0.5B-Instruct-Q3_K_M.gguf",
  url: "https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q3_k_m.gguf?download=true",
};

function log(message) {
  process.stdout.write(`[postinstall] ${message}\n`);
}

function formatBytes(bytes) {
  const value = Number(bytes || 0);
  if (!Number.isFinite(value) || value <= 0) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = value;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  const digits = size >= 100 || unitIndex === 0 ? 0 : size >= 10 ? 1 : 2;
  return `${size.toFixed(digits)} ${units[unitIndex]}`;
}

function createDownloadProgressReporter(label, totalBytes = 0) {
  const isTTY = Boolean(process.stdout.isTTY);
  let lastPercentLogged = -10;
  let lastBytesLogged = 0;

  return (downloadedBytes, force = false) => {
    const downloaded = Number(downloadedBytes || 0);
    const total = Number(totalBytes || 0);
    const suffix = total > 0
      ? `${Math.max(0, Math.min(100, Math.round((downloaded / total) * 100)))}% (${formatBytes(downloaded)} / ${formatBytes(total)})`
      : formatBytes(downloaded);

    if (isTTY) {
      process.stdout.write(`\r[postinstall] downloading ${label} ${suffix}   `);
      if (force) {
        process.stdout.write("\n");
      }
      return;
    }

    if (total > 0) {
      const percent = Math.max(0, Math.min(100, Math.floor((downloaded / total) * 100)));
      if (!force && percent < lastPercentLogged + 10) {
        return;
      }
      lastPercentLogged = percent;
      log(`downloading ${label} ${percent}% (${formatBytes(downloaded)} / ${formatBytes(total)})`);
      return;
    }

    if (!force && downloaded < lastBytesLogged + (25 * 1024 * 1024)) {
      return;
    }
    lastBytesLogged = downloaded;
    log(`downloading ${label} ${formatBytes(downloaded)}`);
  };
}

function exists(filePath) {
  try {
    fs.accessSync(filePath);
    return true;
  } catch {
    return false;
  }
}

function hasLlamaRuntime() {
  if (!exists(LLAMA_DIR)) {
    return false;
  }

  if (!REQUIRED_LLAMA_FILES.every((filename) => exists(path.join(LLAMA_DIR, filename)))) {
    return false;
  }

  const entries = fs.readdirSync(LLAMA_DIR, { withFileTypes: true });
  return entries.some((entry) => {
    if (!entry.isFile()) {
      return false;
    }
    const name = entry.name.toLowerCase();
    if (!/^ggml-.*\.dll$/.test(name)) {
      return false;
    }
    return name !== "ggml-base.dll" && name !== "ggml-rpc.dll";
  });
}

function hasAnyModel() {
  if (!exists(MODELS_DIR)) {
    return false;
  }
  return fs.readdirSync(MODELS_DIR, { withFileTypes: true }).some((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".gguf"));
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "blackbox-node-installer",
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.json();
}

async function downloadFile(url, destinationPath, label = path.basename(destinationPath)) {
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent": "blackbox-node-installer",
    },
  });
  if (!response.ok || !response.body) {
    throw new Error(`Download failed: HTTP ${response.status} for ${url}`);
  }

  await fs.promises.mkdir(path.dirname(destinationPath), { recursive: true });
  const writer = fs.createWriteStream(destinationPath);
  const totalBytes = Number(response.headers.get("content-length") || 0);
  const reportProgress = createDownloadProgressReporter(label, totalBytes);
  let downloadedBytes = 0;
  try {
    for await (const chunk of response.body) {
      const buffer = Buffer.from(chunk);
      downloadedBytes += buffer.length;
      await new Promise((resolve, reject) => {
        writer.write(buffer, (error) => (error ? reject(error) : resolve()));
      });
      reportProgress(downloadedBytes);
    }
    await new Promise((resolve, reject) => writer.end((error) => (error ? reject(error) : resolve())));
    reportProgress(downloadedBytes, true);
  } catch (error) {
    try {
      writer.destroy();
    } catch {}
    try {
      fs.unlinkSync(destinationPath);
    } catch {}
    throw error;
  }
}

function listFilesRecursive(directoryPath) {
  const results = [];
  const entries = fs.readdirSync(directoryPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...listFilesRecursive(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

function extractZip(zipPath, destinationDir) {
  const command = [
    "-NoProfile",
    "-Command",
    `Expand-Archive -LiteralPath '${zipPath.replace(/'/g, "''")}' -DestinationPath '${destinationDir.replace(/'/g, "''")}' -Force`,
  ];
  const result = spawnSync("powershell", command, {
    cwd: ROOT_DIR,
    stdio: "inherit",
    shell: false,
  });
  if (result.status !== 0) {
    throw new Error("Failed to extract llama runtime archive");
  }
}

function copyRuntimeFiles(extractedDir) {
  const files = listFilesRecursive(extractedDir);
  fs.mkdirSync(LLAMA_DIR, { recursive: true });

  for (const filename of REQUIRED_LLAMA_FILES) {
    const source = files.find((filePath) => path.basename(filePath).toLowerCase() === filename.toLowerCase());
    if (!source) {
      throw new Error(`Missing ${filename} in extracted llama runtime`);
    }
    fs.copyFileSync(source, path.join(LLAMA_DIR, filename));
  }

  for (const source of files) {
    const basename = path.basename(source);
    if (basename.toLowerCase() === "llama-server.exe") {
      continue;
    }
    if (!basename.toLowerCase().endsWith(".dll")) {
      continue;
    }
    fs.copyFileSync(source, path.join(LLAMA_DIR, basename));
  }
}

async function resolveWindowsLlamaAssetUrl() {
  const flavor = String(process.env.BLACKBOX_LLAMA_FLAVOR || "cpu").trim().toLowerCase();
  const patterns = {
    cpu: /win-cpu-x64\.zip$/i,
    vulkan: /win-vulkan-x64\.zip$/i,
    cuda12: /win-cuda-12(?:\.[0-9]+)?-x64\.zip$/i,
    cuda13: /win-cuda-13(?:\.[0-9]+)?-x64\.zip$/i,
  };
  const pattern = patterns[flavor] || patterns.cpu;

  for (const repo of ["ggml-org/llama.cpp", "ggerganov/llama.cpp"]) {
    try {
      const release = await fetchJson(`https://api.github.com/repos/${repo}/releases/latest`);
      const assets = Array.isArray(release.assets) ? release.assets : [];
      const asset = assets.find((item) => pattern.test(String(item.name || "")));
      if (asset && asset.browser_download_url) {
        return asset.browser_download_url;
      }
    } catch {}
  }

  throw new Error(`Could not find a llama.cpp release asset for flavor "${flavor}"`);
}

async function ensureLlamaRuntime() {
  if (hasLlamaRuntime()) {
    log("llama runtime already present");
    return;
  }

  if (process.platform !== "win32") {
    throw new Error("Automatic llama runtime install is currently implemented for Windows only");
  }

  log("downloading llama.cpp runtime");
  const assetUrl = await resolveWindowsLlamaAssetUrl();
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "blackbox-llama-"));
  const archivePath = path.join(tempRoot, "llama-runtime.zip");
  const extractDir = path.join(tempRoot, "extract");

  try {
    await downloadFile(assetUrl, archivePath, "llama.cpp runtime");
    extractZip(archivePath, extractDir);
    copyRuntimeFiles(extractDir);
    log("llama runtime installed");
  } finally {
    try {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    } catch {}
  }
}

async function ensureStarterModel() {
  if (hasAnyModel()) {
    log("GGUF model already present");
    return;
  }

  const targetPath = path.join(MODELS_DIR, DEFAULT_MODEL.filename);
  log(`downloading starter model ${DEFAULT_MODEL.filename}`);
  await downloadFile(DEFAULT_MODEL.url, targetPath, DEFAULT_MODEL.filename);
  log("starter model installed");
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

function ensureMeshtasticDependency() {
  if (exists(path.join(PYDEPS_DIR, "meshtastic"))) {
    log("python meshtastic package already present");
    return;
  }

  const pythonLauncher = findPythonLauncher();
  if (!pythonLauncher) {
    log("python not found, skipping Meshtastic Python dependency bootstrap");
    return;
  }

  fs.mkdirSync(PYDEPS_DIR, { recursive: true });
  log("installing Meshtastic Python package into ./pydeps");
  const result = spawnSync(
    pythonLauncher,
    ["-m", "pip", "install", "--disable-pip-version-check", "--target", PYDEPS_DIR, "meshtastic"],
    {
      cwd: ROOT_DIR,
      stdio: "inherit",
      shell: false,
    }
  );

  if (result.status !== 0) {
    log("Meshtastic Python dependency install failed; radio features may stay unavailable until Python is fixed");
    return;
  }

  log("Meshtastic Python package installed");
}

async function main() {
  if (String(process.env.BLACKBOX_SKIP_BOOTSTRAP || "").trim() === "1") {
    log("bootstrap skipped by BLACKBOX_SKIP_BOOTSTRAP=1");
    return;
  }

  await ensureLlamaRuntime();
  await ensureStarterModel();
  ensureMeshtasticDependency();
}

main().catch((error) => {
  process.stderr.write(`[postinstall] bootstrap failed: ${error.message}\n`);
  process.exitCode = 1;
});
