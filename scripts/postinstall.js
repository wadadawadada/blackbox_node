const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT_DIR = path.resolve(__dirname, "..");
const LLAMA_DIR = path.join(ROOT_DIR, "llama");
const MODELS_DIR = path.join(ROOT_DIR, "models");
const PYDEPS_DIR = path.join(ROOT_DIR, "pydeps");

const LLAMA_SERVER_FILENAME = process.platform === "win32" ? "llama-server.exe" : "llama-server";
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

function getRequiredLlamaFiles() {
  if (process.platform === "win32") {
    return ["llama-server.exe", "llama.dll", "ggml.dll", "ggml-base.dll"];
  }
  return ["llama-server"];
}

function hasLlamaRuntime() {
  if (!exists(LLAMA_DIR)) {
    return false;
  }

  const requiredFiles = getRequiredLlamaFiles();
  if (!requiredFiles.every((filename) => exists(path.join(LLAMA_DIR, filename)))) {
    return false;
  }

  if (process.platform !== "win32") {
    return true;
  }

  const entries = fs.readdirSync(LLAMA_DIR, { withFileTypes: true });
  return entries.some((entry) => entry.isFile() && /^ggml-.*\.dll$/i.test(entry.name) && entry.name.toLowerCase() !== "ggml-base.dll" && entry.name.toLowerCase() !== "ggml-rpc.dll");
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

function runCommand(command, args, errorMessage) {
  const result = spawnSync(command, args, {
    cwd: ROOT_DIR,
    stdio: "inherit",
    shell: false,
  });
  if (result.status !== 0) {
    throw new Error(errorMessage);
  }
}

function extractZip(zipPath, destinationDir) {
  fs.mkdirSync(destinationDir, { recursive: true });
  if (process.platform === "win32") {
    runCommand(
      "powershell",
      [
        "-NoProfile",
        "-Command",
        `Expand-Archive -LiteralPath '${zipPath.replace(/'/g, "''")}' -DestinationPath '${destinationDir.replace(/'/g, "''")}' -Force`,
      ],
      "Failed to extract llama runtime archive (zip)",
    );
    return;
  }
  runCommand("unzip", ["-o", zipPath, "-d", destinationDir], "Failed to extract llama runtime archive (zip). Ensure unzip is installed.");
}

function extractTarArchive(archivePath, destinationDir) {
  fs.mkdirSync(destinationDir, { recursive: true });
  runCommand("tar", ["-xzf", archivePath, "-C", destinationDir], "Failed to extract llama runtime archive (tar.gz). Ensure tar is installed.");
}

function extractArchive(archivePath, destinationDir) {
  const lower = path.basename(archivePath).toLowerCase();
  if (lower.endsWith(".zip")) {
    extractZip(archivePath, destinationDir);
    return;
  }
  if (lower.endsWith(".tar.gz") || lower.endsWith(".tgz")) {
    extractTarArchive(archivePath, destinationDir);
    return;
  }
  throw new Error(`Unsupported runtime archive format: ${path.basename(archivePath)}`);
}

function copyRuntimeFiles(extractedDir) {
  const files = listFilesRecursive(extractedDir);
  fs.mkdirSync(LLAMA_DIR, { recursive: true });

  const serverSource = files.find((filePath) => path.basename(filePath).toLowerCase() === LLAMA_SERVER_FILENAME.toLowerCase());
  if (!serverSource) {
    throw new Error(`Missing ${LLAMA_SERVER_FILENAME} in extracted llama runtime`);
  }

  const serverTarget = path.join(LLAMA_DIR, LLAMA_SERVER_FILENAME);
  fs.copyFileSync(serverSource, serverTarget);
  if (process.platform !== "win32") {
    try {
      fs.chmodSync(serverTarget, 0o755);
    } catch {}
  }

  if (process.platform === "win32") {
    const requiredFiles = getRequiredLlamaFiles();
    for (const filename of requiredFiles) {
      if (filename.toLowerCase() === LLAMA_SERVER_FILENAME.toLowerCase()) {
        continue;
      }
      const source = files.find((filePath) => path.basename(filePath).toLowerCase() === filename.toLowerCase());
      if (!source) {
        throw new Error(`Missing ${filename} in extracted llama runtime`);
      }
      fs.copyFileSync(source, path.join(LLAMA_DIR, filename));
    }

    for (const source of files) {
      const basename = path.basename(source);
      if (basename.toLowerCase() === LLAMA_SERVER_FILENAME.toLowerCase()) {
        continue;
      }
      if (!basename.toLowerCase().endsWith(".dll")) {
        continue;
      }
      fs.copyFileSync(source, path.join(LLAMA_DIR, basename));
    }
    return;
  }

  for (const source of files) {
    const basename = path.basename(source);
    const lower = basename.toLowerCase();
    const isRuntimeLib = lower.endsWith(".dylib")
      || lower.endsWith(".metal")
      || lower.endsWith(".so")
      || lower.includes(".so.");
    if (!isRuntimeLib) {
      continue;
    }
    fs.copyFileSync(source, path.join(LLAMA_DIR, basename));
  }
}

function isSupportedRuntimeArchive(filename) {
  const lower = String(filename || "").toLowerCase();
  return lower.endsWith(".zip") || lower.endsWith(".tar.gz") || lower.endsWith(".tgz");
}

function getPlatformTokens() {
  if (process.platform === "win32") {
    return ["win", "windows"];
  }
  if (process.platform === "darwin") {
    return ["mac", "macos", "darwin", "osx"];
  }
  if (process.platform === "linux") {
    return ["linux", "ubuntu"];
  }
  return [process.platform];
}

function getArchTokens() {
  if (process.arch === "x64") {
    return ["x64", "x86_64", "amd64"];
  }
  if (process.arch === "arm64") {
    return ["arm64", "aarch64"];
  }
  return [process.arch];
}

function scoreLlamaAssetName(assetName, flavor) {
  const name = String(assetName || "").toLowerCase();
  if (!isSupportedRuntimeArchive(name)) {
    return Number.NEGATIVE_INFINITY;
  }
  if (name.includes("source")) {
    return Number.NEGATIVE_INFINITY;
  }

  const platformTokens = getPlatformTokens();
  if (!platformTokens.some((token) => name.includes(token))) {
    return Number.NEGATIVE_INFINITY;
  }

  let score = 120;
  const archTokens = getArchTokens();
  if (archTokens.some((token) => name.includes(token))) {
    score += 80;
  }

  const normalizedFlavor = String(flavor || "cpu").trim().toLowerCase();
  if (normalizedFlavor === "cpu") {
    if (name.includes("cpu")) score += 20;
    if (name.includes("cuda")) score -= 25;
    if (name.includes("vulkan")) score -= 15;
  } else if (normalizedFlavor === "vulkan") {
    if (name.includes("vulkan")) score += 40;
  } else if (normalizedFlavor === "metal") {
    if (name.includes("metal")) score += 40;
  } else if (normalizedFlavor.startsWith("cuda")) {
    if (name.includes("cuda")) score += 45;
    if (normalizedFlavor.includes("12") && (name.includes("cu12") || name.includes("cuda-12"))) score += 15;
    if (normalizedFlavor.includes("13") && (name.includes("cu13") || name.includes("cuda-13"))) score += 15;
  }

  if (name.includes("server")) score += 5;
  return score;
}

async function resolveLlamaAsset() {
  const flavor = String(process.env.BLACKBOX_LLAMA_FLAVOR || "cpu").trim().toLowerCase();
  const repos = ["ggml-org/llama.cpp", "ggerganov/llama.cpp"];

  for (const repo of repos) {
    try {
      const release = await fetchJson(`https://api.github.com/repos/${repo}/releases/latest`);
      const assets = Array.isArray(release.assets) ? release.assets : [];
      let best = null;
      let bestScore = Number.NEGATIVE_INFINITY;
      for (const asset of assets) {
        const name = String(asset?.name || "");
        const score = scoreLlamaAssetName(name, flavor);
        if (!Number.isFinite(score)) continue;
        if (score > bestScore) {
          best = asset;
          bestScore = score;
        }
      }
      if (best?.browser_download_url && best?.name && bestScore >= 120) {
        return { url: String(best.browser_download_url), name: String(best.name) };
      }
    } catch {}
  }

  throw new Error(`Could not find a llama.cpp release asset for platform=${process.platform} arch=${process.arch} flavor=${flavor}`);
}

async function ensureLlamaRuntime() {
  if (hasLlamaRuntime()) {
    log("llama runtime already present");
    return;
  }

  log(`downloading llama.cpp runtime for ${process.platform}/${process.arch}`);
  const asset = await resolveLlamaAsset();
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "blackbox-llama-"));
  const archivePath = path.join(tempRoot, path.basename(asset.name || "llama-runtime.zip"));
  const extractDir = path.join(tempRoot, "extract");

  try {
    await downloadFile(asset.url, archivePath, "llama.cpp runtime");
    extractArchive(archivePath, extractDir);
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
