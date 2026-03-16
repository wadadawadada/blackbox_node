const logBox = document.getElementById("log");
const deviceStatus = document.getElementById("deviceStatus");
const deviceStatusTitle = document.getElementById("deviceStatusTitle");
const deviceStatusText = document.getElementById("deviceStatusText");
const modelSelect = document.getElementById("modelSelect");
const modelStatusText = document.getElementById("modelStatusText");
const openModelManagerButton = document.getElementById("openModelManagerButton");
const openAiSettingsButton = document.getElementById("openAiSettingsButton");
const openHelpButton = document.getElementById("openHelpButton");
const openWalletButton = document.getElementById("openWalletButton");
const nodesList = document.getElementById("nodesList");
const clearLogButton = document.getElementById("clearLogButton");
const chatForm = document.getElementById("chatForm");
const chatReplyText = document.getElementById("chatReplyText");
const chatText = document.getElementById("chatText");
const chatSubtitle = document.getElementById("chatSubtitle");
const chatModeAiButton = document.getElementById("chatModeAiButton");
const chatModeDmButton = document.getElementById("chatModeDmButton");
const clearChatButton = document.getElementById("clearChatButton");
const chatPeerRow = document.getElementById("chatPeerRow");
const chatPeerSelect = document.getElementById("chatPeerSelect");
const nodeModal = document.getElementById("nodeModal");
const nodeModalClose = document.getElementById("nodeModalClose");
const nodeModalSubtitle = document.getElementById("nodeModalSubtitle");
const nodeModalIdentity = document.getElementById("nodeModalIdentity");
const nodeModalStatus = document.getElementById("nodeModalStatus");
const nodeModalMetrics = document.getElementById("nodeModalMetrics");
const nodeModalPorts = document.getElementById("nodeModalPorts");
const nodeModalDecoded = document.getElementById("nodeModalDecoded");
const nodeModalRaw = document.getElementById("nodeModalRaw");
const modelManagerModal = document.getElementById("modelManagerModal");
const modelManagerClose = document.getElementById("modelManagerClose");
const modelManagerStatusText = document.getElementById("modelManagerStatusText");
const installedModelsList = document.getElementById("installedModelsList");
const catalogModelsList = document.getElementById("catalogModelsList");
const aiSettingsModal = document.getElementById("aiSettingsModal");
const aiSettingsClose = document.getElementById("aiSettingsClose");
const aiSettingsForm = document.getElementById("aiSettingsForm");
const aiSettingsStatusText = document.getElementById("aiSettingsStatusText");
const aiSettingsCurrentModel = document.getElementById("aiSettingsCurrentModel");
const aiSettingsEnableInstructions = document.getElementById("aiSettingsEnableInstructions");
const aiSettingsInstructions = document.getElementById("aiSettingsInstructions");
const aiSettingsLocalTemperature = document.getElementById("aiSettingsLocalTemperature");
const aiSettingsLocalTopP = document.getElementById("aiSettingsLocalTopP");
const aiSettingsLocalMaxTokens = document.getElementById("aiSettingsLocalMaxTokens");
const aiSettingsMeshTemperature = document.getElementById("aiSettingsMeshTemperature");
const aiSettingsMeshTopP = document.getElementById("aiSettingsMeshTopP");
const aiSettingsMeshMaxTokens = document.getElementById("aiSettingsMeshMaxTokens");
const helpModal = document.getElementById("helpModal");
const helpModalClose = document.getElementById("helpModalClose");
const helpDonateButton = document.getElementById("helpDonateButton");
const helpDefaultView = document.getElementById("helpDefaultView");
const helpDonateView = document.getElementById("helpDonateView");
const helpModalTitle = document.getElementById("helpModalTitle");
const helpModalSubtitle = document.getElementById("helpModalSubtitle");
const walletModal = document.getElementById("walletModal");
const walletModalClose = document.getElementById("walletModalClose");
const walletEngineStatus = document.getElementById("walletEngineStatus");
const walletMeshtasticStatus = document.getElementById("walletMeshtasticStatus");
const walletSendForm = document.getElementById("walletSendForm");
const walletSendStatus = document.getElementById("walletSendStatus");
const walletRecipientInput = document.getElementById("walletRecipientInput");
const walletAmountInput = document.getElementById("walletAmountInput");
const walletUnitSelect = document.getElementById("walletUnitSelect");
const walletTransportSelect = document.getElementById("walletTransportSelect");
const walletMemoInput = document.getElementById("walletMemoInput");
const walletReceiveId = document.getElementById("walletReceiveId");
const walletCopyReceiveIdButton = document.getElementById("walletCopyReceiveIdButton");
const walletHistoryBody = document.getElementById("walletHistoryBody");
const walletHistoryEmpty = document.getElementById("walletHistoryEmpty");
const walletPreferredUnitSelect = document.getElementById("walletPreferredUnitSelect");
const walletDefaultTransportSelect = document.getElementById("walletDefaultTransportSelect");
const walletInitButton = document.getElementById("walletInitButton");
const walletHomeCreateButton = document.getElementById("walletHomeCreateButton");
const walletResetButton = document.getElementById("walletResetButton");
const walletSettingsStatus = document.getElementById("walletSettingsStatus");
const walletBalanceValue = document.getElementById("walletBalanceValue");
const walletBalanceSub = document.getElementById("walletBalanceSub");
const walletRefreshBalance = document.getElementById("walletRefreshBalance");
const walletReceivePreview = document.getElementById("walletReceivePreview");
const walletHomeActivity = document.getElementById("walletHomeActivity");
const walletQrImage = document.getElementById("walletQrImage");
const walletQrLoading = document.getElementById("walletQrLoading");
const walletReceiveNoWallet = document.getElementById("walletReceiveNoWallet");
const walletReceiveContent = document.getElementById("walletReceiveContent");
const walletCreateBlock = document.getElementById("walletCreateBlock");
const walletMnemonicBlock = document.getElementById("walletMnemonicBlock");
const walletMnemonicGrid = document.getElementById("walletMnemonicGrid");
const walletMnemonicDoneButton = document.getElementById("walletMnemonicDoneButton");
const walletInfoBlock = document.getElementById("walletInfoBlock");
const walletInfoKv = document.getElementById("walletInfoKv");
const walletHomeNoWallet = document.getElementById("walletHomeNoWallet");
const walletHomeSummary = document.getElementById("walletHomeSummary");
const cashuBalanceValue = document.getElementById("cashuBalanceValue");
const cashuBalanceSub = document.getElementById("cashuBalanceSub");
// Fund
const cashuMintUrlInput = document.getElementById("cashuMintUrlInput");
const cashuSetMintButton = document.getElementById("cashuSetMintButton");
const cashuMintStatus = document.getElementById("cashuMintStatus");
const cashuMintInfo = document.getElementById("cashuMintInfo");
const cashuInvoiceAmount = document.getElementById("cashuInvoiceAmount");
const cashuCreateInvoiceButton = document.getElementById("cashuCreateInvoiceButton");
const cashuInvoiceStatus = document.getElementById("cashuInvoiceStatus");
const cashuInvoiceBlock = document.getElementById("cashuInvoiceBlock");
const cashuInvoiceQr = document.getElementById("cashuInvoiceQr");
const cashuInvoicePr = document.getElementById("cashuInvoicePr");
const cashuCopyInvoiceButton = document.getElementById("cashuCopyInvoiceButton");
const cashuCheckInvoiceButton = document.getElementById("cashuCheckInvoiceButton");
const cashuCheckStatus = document.getElementById("cashuCheckStatus");
const cashuPendingList = document.getElementById("cashuPendingList");
// Send
const cashuSendNoMint = document.getElementById("cashuSendNoMint");
const cashuSendContent = document.getElementById("cashuSendContent");
const cashuSendAvailable = document.getElementById("cashuSendAvailable");
const cashuSendTokenBlock = document.getElementById("cashuSendTokenBlock");
const cashuSendTokenOutput = document.getElementById("cashuSendTokenOutput");
const cashuCopyTokenButton = document.getElementById("cashuCopyTokenButton");
const cashuMeltForm = document.getElementById("cashuMeltForm");
const cashuMeltInput = document.getElementById("cashuMeltInput");
const cashuMeltStatus = document.getElementById("cashuMeltStatus");
// Receive
const cashuReceiveForm = document.getElementById("cashuReceiveForm");
const cashuReceiveInput = document.getElementById("cashuReceiveInput");
const cashuReceiveStatus = document.getElementById("cashuReceiveStatus");
const receiveBtcTab = document.getElementById("receiveBtcTab");
const receiveCashuTab = document.getElementById("receiveCashuTab");
const receiveBtcPanel = document.getElementById("receiveBtcPanel");
const receiveCashuPanel = document.getElementById("receiveCashuPanel");
const walletCopyAddressButton = document.getElementById("walletCopyAddressButton");
const walletShowSeedButton = document.getElementById("walletShowSeedButton");
const walletSeedRevealGrid = document.getElementById("walletSeedRevealGrid");
const walletSeedNotAvailable = document.getElementById("walletSeedNotAvailable");
const walletSeedEyeIcon = document.getElementById("walletSeedEyeIcon");
const walletSeedEyeOffIcon = document.getElementById("walletSeedEyeOffIcon");
const walletViewButtons = Array.from(document.querySelectorAll("[data-wallet-view]"));
const walletQuickButtons = Array.from(document.querySelectorAll(".wallet-quick-button"));
const walletViewPanels = {
  home: document.getElementById("walletPanelHome"),
  send: document.getElementById("walletPanelSend"),
  receive: document.getElementById("walletPanelReceive"),
  fund: document.getElementById("walletPanelFund"),
  history: document.getElementById("walletPanelHistory"),
  settings: document.getElementById("walletPanelSettings"),
};
let currentSelectedModel = "";
const LOCAL_CHAT_PEER_ID = "local-ui-user";
let latestModelManagerPayload = null;
let latestAiSettingsPayload = null;
let showingDonateView = false;
let latestMeshtasticConnected = false;
let latestMessages = [];
let latestNodes = [];
const HELP_MODAL_TITLE_DEFAULT = "About BLACKBOX NODE";
const HELP_MODAL_TITLE_DONATE = "DONATE";
const CHAT_MODE_AI = "ai";
const CHAT_MODE_DM = "dm";
const CHAT_LAST_PEER_STORAGE_KEY = "blackbox.chat.lastPeer";
const CHAT_PLACEHOLDER_AI = "Write a message. Enter to send, Shift+Enter for new line.";
const CHAT_PLACEHOLDER_DM = "Write a DM to selected node. Enter to send, Shift+Enter for new line.";
const chatState = {
  mode: CHAT_MODE_AI,
  selectedPeer: readStoredChatPeer(),
  localExchange: null,
};
const cashuState = {
  configured: false,
  mintUrl: null,
  balance: 0,
  pendingInvoices: [],
  currentInvoiceHash: null,
};

const walletState = {
  walletConfigured: false,
  meshtasticConnected: false,
  activeView: "home",
  history: [],
  address: null,
  mnemonic: null,
  balance: null,
  qrLoaded: false,
  settings: {
    preferredUnit: "sats",
    defaultTransport: "Meshtastic DM",
  },
  lastFocused: null,
};

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || `${response.status} ${response.statusText}`);
  }
  return payload;
}

function appendLog(message) {
  const item = document.createElement("article");
  item.className = `log-item ${message.direction || "system"}`;
  const meta = `${message.createdAt || new Date().toLocaleTimeString()} | ${message.transport || "n/a"} | ${message.sender} -> ${message.recipient || "-"}`;
  item.innerHTML = `<div class="log-meta">${meta}</div><div class="log-text"></div>`;
  item.querySelector(".log-text").textContent = message.text || "";
  logBox.appendChild(item);
  while (logBox.children.length > 120) {
    logBox.removeChild(logBox.firstChild);
  }
  logBox.scrollTop = logBox.scrollHeight;
}

function readStoredChatPeer() {
  try {
    return String(localStorage.getItem(CHAT_LAST_PEER_STORAGE_KEY) || "").trim();
  } catch {
    return "";
  }
}

function persistChatPeer(peerId) {
  try {
    const value = String(peerId || "").trim();
    if (value) {
      localStorage.setItem(CHAT_LAST_PEER_STORAGE_KEY, value);
    } else {
      localStorage.removeItem(CHAT_LAST_PEER_STORAGE_KEY);
    }
  } catch {}
}

function syncWalletRecipientFromChatPeer(peerId) {
  const value = String(peerId || "").trim();
  if (!value || !walletRecipientInput) {
    return;
  }
  const hasOption = Array.from(walletRecipientInput.options).some((option) => option.value === value);
  if (hasOption) {
    walletRecipientInput.value = value;
  }
}

function setChatPeerSelection(peerId, { syncWallet = true, persist = true } = {}) {
  const requested = String(peerId || "").trim();
  if (chatPeerSelect) {
    const hasOption = Array.from(chatPeerSelect.options).some((option) => option.value === requested);
    chatPeerSelect.value = hasOption ? requested : "";
    chatState.selectedPeer = requested;
  } else {
    chatState.selectedPeer = requested;
  }
  if (persist) {
    persistChatPeer(chatState.selectedPeer);
  }
  if (syncWallet && chatState.selectedPeer) {
    syncWalletRecipientFromChatPeer(chatState.selectedPeer);
  }
}

function getNodeAddress(node) {
  return String(node?.userId || node?.id || "").trim();
}

function getNodeDisplayLabel(node) {
  const address = getNodeAddress(node);
  const name = String(node?.longName || node?.shortName || address || "unknown").trim();
  if (!address) {
    return name;
  }
  return name === address ? address : `${name} (${address})`;
}

function getSelectableNodes() {
  const map = new Map();
  latestNodes.forEach((node) => {
    const address = getNodeAddress(node);
    if (!address || map.has(address)) {
      return;
    }
    map.set(address, node);
  });
  return Array.from(map.values());
}

function populateNodeSelect(selectEl, preferredValue = "") {
  if (!selectEl) {
    return;
  }
  const selectedBefore = preferredValue || selectEl.value || "";
  const nodes = getSelectableNodes();
  selectEl.innerHTML = '<option value="">Select node</option>';
  nodes.forEach((node) => {
    const option = document.createElement("option");
    const address = getNodeAddress(node);
    option.value = address;
    option.textContent = getNodeDisplayLabel(node);
    selectEl.appendChild(option);
  });
  const hasSelected = Array.from(selectEl.options).some((option) => option.value === selectedBefore);
  selectEl.value = hasSelected ? selectedBefore : "";
}

function syncNodeSelectors() {
  populateNodeSelect(walletRecipientInput, walletRecipientInput?.value || "");
  const preferredChatPeer = chatState.selectedPeer || readStoredChatPeer();
  populateNodeSelect(chatPeerSelect, preferredChatPeer || chatPeerSelect?.value || "");
  if (chatPeerSelect && preferredChatPeer) {
    setChatPeerSelection(preferredChatPeer, { syncWallet: true, persist: true });
  } else if (chatPeerSelect) {
    setChatPeerSelection(chatPeerSelect.value, { syncWallet: true, persist: true });
  }
}

function renderChatEmpty(message) {
  chatReplyText.innerHTML = "";
  const empty = document.createElement("div");
  empty.className = "chat-empty";
  empty.textContent = message;
  chatReplyText.appendChild(empty);
}

function formatChatTime(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleTimeString();
}

function renderLocalChat(userText, replyText) {
  const safeReply = replyText || "No reply";
  chatState.localExchange = { userText, replyText: safeReply };
  chatReplyText.innerHTML = "";

  const userBubble = document.createElement("div");
  userBubble.className = "chat-bubble user";
  userBubble.textContent = userText;

  const aiBubble = document.createElement("div");
  aiBubble.className = "chat-bubble ai";
  aiBubble.textContent = safeReply;

  chatReplyText.appendChild(userBubble);
  chatReplyText.appendChild(aiBubble);
  chatReplyText.scrollTop = chatReplyText.scrollHeight;
}

function renderPendingLocalChat(userText) {
  renderLocalChat(userText, "Thinking...");
}

async function clearActiveChat() {
  if (chatState.mode === CHAT_MODE_DM) {
    const peerId = String(chatState.selectedPeer || "").trim();
    if (!peerId) {
      renderChatEmpty("Select a node to start DM chat.");
      return;
    }
    await fetchJson("/api/messages/clear", {
      method: "POST",
      body: JSON.stringify({ scope: "peer", peerId }),
    });
    await loadMessages();
    return;
  }

  await fetchJson("/api/messages/clear", {
    method: "POST",
    body: JSON.stringify({ scope: "local" }),
  });
  chatState.localExchange = null;
  renderLocalChatFromState();
  await loadMessages();
}

function renderLocalChatFromState() {
  if (!chatState.localExchange) {
    renderChatEmpty("Write a prompt to test the offline model.");
    return;
  }
  renderLocalChat(chatState.localExchange.userText, chatState.localExchange.replyText);
}

function isPeerDmMessage(message, peerId) {
  if (!message || !peerId) {
    return false;
  }
  const direction = String(message.direction || "");
  if (direction !== "in" && direction !== "out") {
    return false;
  }
  const sender = String(message.sender || "");
  const recipient = String(message.recipient || "");
  if (direction === "in") {
    return sender === peerId && recipient === "local-ai";
  }
  return recipient === peerId && sender === "local-ui";
}

function renderDmChat() {
  const peerId = chatState.selectedPeer;
  if (!peerId) {
    renderChatEmpty("Select a node to start DM chat.");
    return;
  }
  const thread = latestMessages.filter((message) => isPeerDmMessage(message, peerId));
  if (!thread.length) {
    renderChatEmpty("No DM history with this node yet.");
    return;
  }

  chatReplyText.innerHTML = "";
  thread.forEach((message) => {
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${message.direction === "out" ? "user" : "node"}`;

    const meta = document.createElement("div");
    meta.className = "chat-bubble-meta";
    const author = message.direction === "out" ? "You" : (message.sender || "Node");
    const stamp = formatChatTime(message.createdAt);
    meta.textContent = stamp ? `${author} | ${stamp}` : author;

    const body = document.createElement("div");
    body.className = "chat-bubble-body";
    body.textContent = message.text || "";

    bubble.append(meta, body);
    chatReplyText.appendChild(bubble);
  });
  chatReplyText.scrollTop = chatReplyText.scrollHeight;
}

function setChatMode(mode, { focusInput = false } = {}) {
  chatState.mode = mode === CHAT_MODE_DM ? CHAT_MODE_DM : CHAT_MODE_AI;
  const isDm = chatState.mode === CHAT_MODE_DM;
  if (chatForm) {
    chatForm.classList.toggle("chat-form-dm", isDm);
  }

  if (chatModeAiButton) {
    chatModeAiButton.classList.toggle("is-active", !isDm);
    chatModeAiButton.setAttribute("aria-selected", String(!isDm));
  }
  if (chatModeDmButton) {
    chatModeDmButton.classList.toggle("is-active", isDm);
    chatModeDmButton.setAttribute("aria-selected", String(isDm));
  }
  if (chatPeerRow) {
    chatPeerRow.classList.toggle("hidden", !isDm);
  }
  if (chatSubtitle) {
    chatSubtitle.textContent = isDm ? "Direct messages with mesh nodes" : "Offline AI";
  }
  if (chatText) {
    chatText.placeholder = isDm ? CHAT_PLACEHOLDER_DM : CHAT_PLACEHOLDER_AI;
  }

  if (isDm && !chatState.selectedPeer && chatPeerSelect) {
    const firstPeer = Array.from(chatPeerSelect.options).find((option) => option.value);
    if (firstPeer) {
      setChatPeerSelection(firstPeer.value, { syncWallet: true, persist: true });
    }
  }

  if (isDm) {
    renderDmChat();
  } else {
    renderLocalChatFromState();
  }

  if (focusInput && chatText) {
    chatText.focus();
  }
}

function openDmForNode(peerId) {
  const value = String(peerId || "").trim();
  if (!value) {
    return;
  }
  setChatPeerSelection(value, { syncWallet: true, persist: true });
  setChatMode(CHAT_MODE_DM, { focusInput: true });
}

function openCashuSendForNode(peerId) {
  const value = String(peerId || "").trim();
  if (!value) {
    return;
  }
  setChatPeerSelection(value, { syncWallet: true, persist: true });
  if (chatState.mode === CHAT_MODE_DM) {
    renderDmChat();
  }
  openWalletModal();
  setWalletView("send");
  if (walletRecipientInput) {
    walletRecipientInput.focus();
  }
}

function formatBytes(bytes) {
  const value = Number(bytes || 0);
  if (!Number.isFinite(value) || value <= 0) {
    return "unknown size";
  }
  if (value >= 1024 ** 3) {
    return `${(value / (1024 ** 3)).toFixed(2)} GB`;
  }
  return `${Math.round(value / (1024 ** 2))} MB`;
}

function createTag(label, extraClass = "") {
  const tag = document.createElement("span");
  tag.className = `model-tag ${extraClass}`.trim();
  tag.textContent = label;
  return tag;
}

async function selectModelFromManager(filename) {
  await fetchJson("/api/models/select", {
    method: "POST",
    body: JSON.stringify({ model: filename }),
  });
  await loadStatus();
}

async function installModelFromManager(modelId) {
  await fetchJson("/api/models/install", {
    method: "POST",
    body: JSON.stringify({ modelId }),
  });
}

async function deleteModelFromManager(filename) {
  await fetchJson("/api/models/delete", {
    method: "POST",
    body: JSON.stringify({ filename }),
  });
  await loadStatus();
}

function renderInstalledModels(models = [], operation = {}) {
  installedModelsList.innerHTML = "";
  if (!models.length) {
    installedModelsList.innerHTML = '<div class="model-empty">No installed models</div>';
    return;
  }

  models.forEach((model) => {
    const card = document.createElement("article");
    card.className = "model-card";

    const head = document.createElement("div");
    head.className = "model-card-head";

    const titleWrap = document.createElement("div");
    const title = document.createElement("div");
    title.className = "model-card-title";
    title.textContent = model.name || model.filename;
    const meta = document.createElement("div");
    meta.className = "model-card-meta";
    meta.textContent = `${model.filename} | ${formatBytes(model.sizeBytes)} | ${model.family}`;
    titleWrap.appendChild(title);
    titleWrap.appendChild(meta);

    const tags = document.createElement("div");
    tags.className = "model-card-tags";
    if (model.current) {
      tags.appendChild(createTag("Current", "current"));
    }
    tags.appendChild(createTag("Installed", "available"));
    head.appendChild(titleWrap);
    head.appendChild(tags);
    card.appendChild(head);

    if (model.notes) {
      const notes = document.createElement("div");
      notes.className = "model-card-meta";
      notes.textContent = model.notes;
      card.appendChild(notes);
    }

    const actions = document.createElement("div");
    actions.className = "model-actions";
    const busy = Boolean(operation.active);

    if (!model.current) {
      const selectButton = document.createElement("button");
      selectButton.type = "button";
      selectButton.textContent = "Select";
      selectButton.disabled = busy;
      selectButton.addEventListener("click", async () => {
        try {
          await selectModelFromManager(model.filename);
          await loadModelManager();
        } catch (error) {
          modelManagerStatusText.textContent = `Select failed: ${error.message}`;
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
        await deleteModelFromManager(model.filename);
        await loadModelManager();
      } catch (error) {
        modelManagerStatusText.textContent = `Delete failed: ${error.message}`;
      }
    });
    actions.appendChild(deleteButton);
    card.appendChild(actions);
    installedModelsList.appendChild(card);
  });
}

function renderCatalogModels(models = [], operation = {}) {
  catalogModelsList.innerHTML = "";
  const installable = models.filter((model) => !model.installed);
  if (!installable.length) {
    catalogModelsList.innerHTML = '<div class="model-empty">Everything from the catalog is already installed</div>';
    return;
  }

  installable.forEach((model) => {
    const card = document.createElement("article");
    card.className = "model-card";

    const head = document.createElement("div");
    head.className = "model-card-head";

    const titleWrap = document.createElement("div");
    const title = document.createElement("div");
    title.className = "model-card-title";
    title.textContent = model.name;
    const meta = document.createElement("div");
    meta.className = "model-card-meta";
    meta.textContent = `${model.filename} | ${formatBytes(model.sizeBytes)} | ${model.family}`;
    titleWrap.appendChild(title);
    titleWrap.appendChild(meta);

    const tags = document.createElement("div");
    tags.className = "model-card-tags";
    tags.appendChild(createTag("Catalog", "available"));
    head.appendChild(titleWrap);
    head.appendChild(tags);
    card.appendChild(head);

    if (model.notes) {
      const notes = document.createElement("div");
      notes.className = "model-card-meta";
      notes.textContent = model.notes;
      card.appendChild(notes);
    }

    const actions = document.createElement("div");
    actions.className = "model-actions";
    const installButton = document.createElement("button");
    installButton.type = "button";
    installButton.textContent = "Install";
    installButton.disabled = Boolean(operation.active);
    installButton.addEventListener("click", async () => {
      try {
        await installModelFromManager(model.id);
        await loadModelManager();
      } catch (error) {
        modelManagerStatusText.textContent = `Install failed: ${error.message}`;
      }
    });
    actions.appendChild(installButton);
    card.appendChild(actions);
    catalogModelsList.appendChild(card);
  });
}

function renderModelManager(payload) {
  latestModelManagerPayload = payload;
  const operation = payload?.operation || {};
  if (operation.active) {
    modelManagerStatusText.textContent = `${operation.action === "install" ? "Installing" : "Deleting"} ${operation.modelName || operation.modelId || "model"}...`;
  } else if (operation.error) {
    modelManagerStatusText.textContent = operation.error;
  } else {
    modelManagerStatusText.textContent = `Current model: ${payload?.currentModel || "n/a"}`;
  }

  renderInstalledModels(payload?.installed || [], operation);
  renderCatalogModels(payload?.available || [], operation);
}

async function loadModelManager() {
  const payload = await fetchJson("/api/models/manager");
  renderModelManager(payload);
}

function openModelManager() {
  modelManagerModal.classList.remove("hidden");
  modelManagerModal.setAttribute("aria-hidden", "false");
  if (latestModelManagerPayload) {
    renderModelManager(latestModelManagerPayload);
  }
  loadModelManager().catch((error) => {
    modelManagerStatusText.textContent = `Manager error: ${error.message}`;
  });
}

function closeModelManager() {
  modelManagerModal.classList.add("hidden");
  modelManagerModal.setAttribute("aria-hidden", "true");
}

function toggleAiInstructionsInput() {
  aiSettingsInstructions.disabled = !aiSettingsEnableInstructions.checked;
}

function renderAiSettings(payload) {
  latestAiSettingsPayload = payload;
  const settings = payload?.settings || {};
  aiSettingsCurrentModel.textContent = "Current model: " + (payload?.currentModel || currentSelectedModel || "n/a");
  aiSettingsEnableInstructions.checked = Boolean(settings.sendCustomInstructions);
  aiSettingsInstructions.value = settings.customInstructions || "";
  aiSettingsLocalTemperature.value = settings.localTemperature ?? 0.1;
  aiSettingsLocalTopP.value = settings.localTopP ?? 0.7;
  aiSettingsLocalMaxTokens.value = settings.localMaxTokens ?? 384;
  aiSettingsMeshTemperature.value = settings.meshTemperature ?? 0.1;
  aiSettingsMeshTopP.value = settings.meshTopP ?? 0.6;
  aiSettingsMeshMaxTokens.value = settings.meshMaxTokens ?? 120;
  toggleAiInstructionsInput();
}

async function loadAiSettings() {
  const payload = await fetchJson("/api/ai-settings");
  renderAiSettings(payload);
  return payload;
}

function openAiSettingsModal() {
  aiSettingsModal.classList.remove("hidden");
  aiSettingsModal.setAttribute("aria-hidden", "false");
  aiSettingsStatusText.textContent = "Loading AI settings...";
  if (latestAiSettingsPayload) {
    renderAiSettings(latestAiSettingsPayload);
    aiSettingsStatusText.textContent = "Edit prompt instructions and generation controls.";
  }
  loadAiSettings().then(() => {
    aiSettingsStatusText.textContent = "Edit prompt instructions and generation controls.";
  }).catch((error) => {
    aiSettingsStatusText.textContent = `Settings error: ${error.message}`;
  });
}

function closeAiSettingsModal() {
  aiSettingsModal.classList.add("hidden");
  aiSettingsModal.setAttribute("aria-hidden", "true");
}

function collectAiSettingsForm() {
  return {
    sendCustomInstructions: aiSettingsEnableInstructions.checked,
    customInstructions: aiSettingsInstructions.value,
    localTemperature: Number(aiSettingsLocalTemperature.value),
    localTopP: Number(aiSettingsLocalTopP.value),
    localMaxTokens: Number(aiSettingsLocalMaxTokens.value),
    meshTemperature: Number(aiSettingsMeshTemperature.value),
    meshTopP: Number(aiSettingsMeshTopP.value),
    meshMaxTokens: Number(aiSettingsMeshMaxTokens.value),
  };
}

function renderHelpView() {
  helpDefaultView.classList.toggle("hidden", showingDonateView);
  helpDonateView.classList.toggle("hidden", !showingDonateView);
  helpModalTitle.textContent = showingDonateView ? HELP_MODAL_TITLE_DONATE : HELP_MODAL_TITLE_DEFAULT;
  helpModalSubtitle.classList.toggle("hidden", showingDonateView);
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const input = document.createElement("textarea");
  input.value = value;
  input.setAttribute("readonly", "true");
  input.style.position = "absolute";
  input.style.left = "-9999px";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}

function openHelpModal() {
  showingDonateView = false;
  renderHelpView();
  helpModal.classList.remove("hidden");
  helpModal.setAttribute("aria-hidden", "false");
}

function closeHelpModal() {
  showingDonateView = false;
  renderHelpView();
  helpModal.classList.add("hidden");
  helpModal.setAttribute("aria-hidden", "true");
}
function getFocusableElements(container) {
  return Array.from(container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter((element) => {
    return !element.disabled && element.offsetParent !== null;
  });
}

function setWalletStatusRow() {
  walletState.meshtasticConnected = latestMeshtasticConnected;
  const engineOk = walletState.walletConfigured;
  const meshOk = walletState.meshtasticConnected;
  walletEngineStatus.textContent = engineOk ? "Ready" : "No wallet";
  walletEngineStatus.className = engineOk ? "status-ok" : "status-err";
  walletMeshtasticStatus.textContent = meshOk ? "Connected" : "Disconnected";
  walletMeshtasticStatus.className = meshOk ? "status-ok" : "status-err";
}

function formatSats(sats) {
  if (sats === null || sats === undefined) return "—";
  const unit = walletState.settings.preferredUnit;
  if (unit === "BTC") {
    return `${(sats / 1e8).toFixed(8)} BTC`;
  }
  return `${sats.toLocaleString()} sats`;
}

function updateWalletBalanceDisplay() {
  if (!walletState.walletConfigured) {
    walletBalanceValue.textContent = "—";
    walletBalanceSub.textContent = "No wallet created";
    walletRefreshBalance.hidden = true;
    return;
  }
  if (!walletState.balance) {
    walletBalanceValue.textContent = "—";
    walletBalanceSub.textContent = "Balance unavailable (offline?)";
    walletRefreshBalance.hidden = false;
    return;
  }
  walletRefreshBalance.hidden = false;
  const b = walletState.balance;
  walletBalanceValue.textContent = formatSats(b.confirmed);
  const pendingText = b.unconfirmed !== 0 ? ` | ${b.unconfirmed >= 0 ? "+" : ""}${b.unconfirmed} pending` : "";
  walletBalanceSub.textContent = `confirmed${pendingText}`;
}

async function loadWalletBalance() {
  if (!walletState.walletConfigured) return;
  walletBalanceSub.textContent = "Refreshing...";
  try {
    const data = await fetchJson("/api/wallet/balance");
    walletState.balance = data;
    updateWalletBalanceDisplay();
  } catch {
    walletBalanceSub.textContent = "Balance fetch failed (offline?)";
  }
}

async function loadWalletTransactions() {
  if (!walletState.walletConfigured) return;
  try {
    const data = await fetchJson("/api/wallet/transactions");
    walletState.history = (data.transactions || []).map((tx) => ({
      id: tx.txid,
      direction: tx.direction,
      peer: tx.txid ? tx.txid.slice(0, 12) + "..." : "—",
      amount: tx.amount,
      unit: "sats",
      status: tx.confirmed ? "Confirmed" : "Pending",
      timestamp: tx.blockTime,
    }));
    renderWalletHistory();
    renderWalletHomeActivity();
  } catch {
    // offline — keep existing history
  }
}

async function loadWalletQr() {
  if (!walletState.walletConfigured || walletState.qrLoaded) return;
  walletQrLoading.hidden = false;
  walletQrImage.hidden = true;
  try {
    const data = await fetchJson("/api/wallet/qr");
    walletQrImage.src = data.qr;
    walletQrImage.hidden = false;
    walletQrLoading.hidden = true;
    walletState.qrLoaded = true;
  } catch {
    walletQrLoading.textContent = "QR unavailable";
  }
}

function renderWalletSettingsInfo() {
  if (!walletState.walletConfigured || !walletInfoKv) return;
  walletInfoKv.innerHTML = "";
  const rows = [
    ["Type", "BIP84 HD Wallet (P2WPKH)"],
    ["Network", "Bitcoin Mainnet"],
    ["Address", walletState.address ? walletState.address.slice(0, 20) + "..." : "—"],
    ["Path", "m/84'/0'/0'/0/0"],
    ["Storage", "./data/wallet.json"],
  ];
  rows.forEach(([k, v]) => {
    const row = document.createElement("div");
    row.className = "wallet-kv-row";
    row.innerHTML = `<span class="wallet-k">${k}</span><span class="wallet-v"></span>`;
    row.querySelector(".wallet-v").textContent = v;
    walletInfoKv.appendChild(row);
  });
}

function applyWalletConfiguredState({ showInfoBlock = true } = {}) {
  const configured = walletState.walletConfigured;
  // Home panel
  if (walletHomeNoWallet) walletHomeNoWallet.hidden = configured;
  if (walletHomeSummary) walletHomeSummary.hidden = !configured;
  // Settings panel
  if (walletCreateBlock) walletCreateBlock.classList.toggle("hidden", configured);
  if (showInfoBlock && walletInfoBlock) walletInfoBlock.classList.toggle("hidden", !configured);
  // Receive panel
  if (walletReceiveNoWallet) walletReceiveNoWallet.hidden = configured;
  if (walletReceiveContent) walletReceiveContent.hidden = !configured;
  // Address
  if (walletState.address) {
    if (walletReceiveId) walletReceiveId.value = walletState.address;
    if (walletReceivePreview) walletReceivePreview.textContent = walletState.address;
  }
  setWalletStatusRow();
  updateWalletBalanceDisplay();
  renderWalletSettingsInfo();
}

async function loadWalletState() {
  try {
    const data = await fetchJson("/api/wallet");
    walletState.walletConfigured = data.configured;
    walletState.address = data.address || null;
    walletState.mnemonic = data.mnemonic || null;
    applyWalletConfiguredState();
    if (data.configured) loadWalletBalance();
  } catch { /* keep defaults */ }
  // Also load cashu state
  loadCashuState();
}

// ─── Cashu UI ─────────────────────────────────────────────────────────────────

function applyCashuState() {
  const cfg = cashuState.configured;
  // Send tab
  if (cashuSendNoMint) cashuSendNoMint.hidden = cfg;
  if (cashuSendContent) cashuSendContent.hidden = !cfg;
  // Home balances
  if (cashuBalanceValue) cashuBalanceValue.textContent = cfg ? formatSats(cashuState.balance) : "—";
  if (cashuBalanceSub) cashuBalanceSub.textContent = cfg ? (cashuState.mintUrl || "") : "No mint configured — go to Fund";
  if (cashuSendAvailable) cashuSendAvailable.textContent = formatSats(cashuState.balance);
  if (walletRefreshBalance) walletRefreshBalance.hidden = false;
  // Mint input
  if (cashuMintUrlInput && cashuState.mintUrl && !cashuMintUrlInput.value) {
    cashuMintUrlInput.value = cashuState.mintUrl;
  }
  renderCashuPending();
}

function renderCashuPending() {
  if (!cashuPendingList) return;
  const pending = cashuState.pendingInvoices || [];
  if (!pending.length) {
    cashuPendingList.innerHTML = '<div class="wallet-hint">No pending invoices</div>';
    return;
  }
  cashuPendingList.innerHTML = "";
  pending.forEach((inv) => {
    const row = document.createElement("div");
    row.className = "cashu-pending-row";
    row.innerHTML = `<span class="cashu-pending-amount">${inv.amount} sats</span><span class="cashu-pending-time">${new Date(inv.createdAt).toLocaleTimeString()}</span><button type="button" class="wallet-inline-action cashu-check-btn" data-hash="${inv.hash}">Check</button>`;
    cashuPendingList.appendChild(row);
  });
}

async function loadCashuState() {
  try {
    const data = await fetchJson("/api/cashu");
    cashuState.configured = data.configured;
    cashuState.mintUrl = data.mintUrl || null;
    cashuState.balance = data.balance || 0;
    cashuState.pendingInvoices = data.pendingInvoices || [];
    // Merge blockchain history with cashu history
    if (data.history && data.history.length) {
      const existing = new Set(walletState.history.map((h) => h.id));
      data.history.forEach((tx) => {
        const id = `cashu-${tx.timestamp}-${tx.amount}`;
        if (!existing.has(id)) {
          walletState.history.push({ ...tx, id, unit: "sats" });
          existing.add(id);
        }
      });
      walletState.history.sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)));
      renderWalletHistory();
    }
    applyCashuState();
  } catch { /* offline */ }
}

// ─── End Cashu UI ─────────────────────────────────────────────────────────────

function renderWalletHistory() {
  walletHistoryBody.innerHTML = "";
  updateWalletBalanceDisplay();
  const hasItems = walletState.history.length > 0;
  walletHistoryEmpty.classList.toggle("hidden", hasItems);
  if (!hasItems) {
    return;
  }

  walletState.history.forEach((item) => {
    const row = document.createElement("tr");
    row.className = String(item.direction).toLowerCase() === "received" ? "wallet-row-in" : "wallet-row-out";
    const cells = [item.direction, item.peer, formatSats(item.amount), item.status, item.timestamp];
    cells.forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = String(value ?? "");
      row.appendChild(cell);
    });
    walletHistoryBody.appendChild(row);
  });
}

function renderWalletHomeActivity() {
  if (walletState.address) {
    walletReceivePreview.textContent = walletState.address;
  }
  if (!walletState.history.length) {
    walletHomeActivity.innerHTML = "<p>No transactions yet.</p>";
    return;
  }

  const item = walletState.history[0];
  walletHomeActivity.innerHTML = "";
  const summary = document.createElement("p");
  summary.textContent = `${item.direction} ${formatSats(item.amount)} ${item.status ? `| ${item.status}` : ""}`;
  const peer = document.createElement("p");
  peer.textContent = `TxID: ${item.peer} | ${item.timestamp}`;
  walletHomeActivity.append(summary, peer);
}

function setWalletView(viewName, options = {}) {
  if (!walletViewPanels[viewName]) {
    return;
  }
  walletState.activeView = viewName;

  walletViewButtons.forEach((button) => {
    const isActive = button.getAttribute("data-wallet-view") === viewName;
    if (button.classList.contains("wallet-quick-button")) {
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-current", isActive ? "page" : "false");
    }
    if (isActive && options.focusButton) {
      button.focus();
    }
  });

  Object.entries(walletViewPanels).forEach(([key, panel]) => {
    const isActive = key === viewName;
    panel.classList.toggle("is-active", isActive);
    panel.hidden = !isActive;
  });

  renderWalletHomeActivity();
  if (viewName === "receive" && walletState.walletConfigured) {
    loadWalletQr();
  }
}



function queueMeshSend() {
  const recipient = walletRecipientInput.value.trim();
  const amount = walletAmountInput.value.trim();
  const unit = walletUnitSelect.value;
  const transport = walletTransportSelect.value;
  const memo = walletMemoInput.value.trim();

  if (!recipient) {
    walletSendStatus.textContent = "Recipient required.";
    walletRecipientInput.focus();
    return;
  }
  if (!amount || Number(amount) <= 0) {
    walletSendStatus.textContent = "Amount required.";
    walletAmountInput.focus();
    return;
  }

  walletState.history.unshift({
    id: `mesh-${Date.now()}`,
    direction: "Sent",
    peer: recipient,
    amount: Number(amount),
    unit,
    status: "Queued",
    timestamp: new Date().toLocaleString(),
    memo,
    transport,
  });

  renderWalletHistory();
  renderWalletHomeActivity();
  walletSendStatus.textContent = "Payment queued for mesh delivery.";
  walletAmountInput.value = "";
  walletMemoInput.value = "";
}

function openWalletModal() {
  walletState.lastFocused = document.activeElement;
  walletModal.classList.remove("hidden");
  walletModal.setAttribute("aria-hidden", "false");
  setWalletView(walletState.activeView || "home");
  const focusTarget = walletQuickButtons[0] || walletModalClose;
  if (focusTarget) focusTarget.focus();
  loadWalletState();
}

function closeWalletModal() {
  walletModal.classList.add("hidden");
  walletModal.setAttribute("aria-hidden", "true");
  if (walletState.lastFocused && typeof walletState.lastFocused.focus === "function") {
    walletState.lastFocused.focus();
  }
}

function handleWalletModalFocusTrap(event) {
  if (event.key !== "Tab" || walletModal.classList.contains("hidden")) {
    return;
  }

  const focusables = getFocusableElements(walletModal);
  if (!focusables.length) {
    return;
  }

  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const current = document.activeElement;

  if (event.shiftKey && current === first) {
    event.preventDefault();
    last.focus();
    return;
  }

  if (!event.shiftKey && current === last) {
    event.preventDefault();
    first.focus();
  }
}

function renderNodes(nodes = []) {
  latestNodes = Array.isArray(nodes) ? nodes.slice() : [];
  syncNodeSelectors();
  nodesList.innerHTML = "";
  if (!nodes.length) {
    nodesList.innerHTML = '<div class="node-empty">No nodes yet</div>';
    if (chatState.mode === CHAT_MODE_DM) {
      renderDmChat();
    }
    return;
  }

  nodes.forEach((node) => {
    const item = document.createElement("article");
    item.className = `node-item ${node.online ? "online" : "offline"} ${node.role === "weather" ? "weather" : ""} ${node.live ? "live" : "snapshot"}`;
    const nodeAddress = getNodeAddress(node);

    const name = node.longName || node.shortName || nodeAddress || "unknown";
    const metaParts = [];
    if (nodeAddress) {
      metaParts.push(nodeAddress);
    }
    if (node.shortName && node.shortName !== name) {
      metaParts.push(node.shortName);
    }
    if (node.hardware) {
      metaParts.push(node.hardware);
    }
    if (node.batteryLevel !== null && node.batteryLevel !== undefined) {
      metaParts.push(`${node.batteryLevel}%`);
    }
    metaParts.push(node.live ? "live packets" : "snapshot only");

    item.innerHTML = `
      <span class="node-dot"></span>
      <div class="node-main">
        <div class="node-name"></div>
        <div class="node-meta"></div>
      </div>
      <div class="node-actions">
        <button type="button" class="node-action-btn node-action-message" title="Send message" aria-label="Send message to node">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M4 5h16v10H8l-4 4V5z"></path>
          </svg>
        </button>
        <button type="button" class="node-action-btn node-action-cashu" title="Send Cashu" aria-label="Send Cashu to node">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="7"></circle>
            <path d="M12 8v8M9 10h6M9 14h6"></path>
          </svg>
        </button>
      </div>
    `;
    item.querySelector(".node-name").textContent = name;
    item.querySelector(".node-meta").textContent = metaParts.join(" | ") || (node.online ? "online" : "offline");

    const messageButton = item.querySelector(".node-action-message");
    const cashuButton = item.querySelector(".node-action-cashu");
    if (!nodeAddress) {
      messageButton.disabled = true;
      cashuButton.disabled = true;
    } else {
      messageButton.addEventListener("click", (event) => {
        event.stopPropagation();
        openDmForNode(nodeAddress);
      });
      cashuButton.addEventListener("click", (event) => {
        event.stopPropagation();
        openCashuSendForNode(nodeAddress);
      });
    }

    item.addEventListener("click", () => openNodeModal(node.id || node.userId));
    nodesList.appendChild(item);
  });

  if (chatState.mode === CHAT_MODE_DM) {
    renderDmChat();
  }
}

function renderKv(container, rows) {
  container.innerHTML = "";
  rows.forEach(([label, value]) => {
    if (value === null || value === undefined || value === "") {
      return;
    }
    const row = document.createElement("div");
    row.className = "modal-kv-row";
    row.innerHTML = `<span class="modal-k">${label}</span><span class="modal-v"></span>`;
    row.querySelector(".modal-v").textContent = String(value);
    container.appendChild(row);
  });
  if (!container.children.length) {
    container.innerHTML = '<div class="node-empty">No data</div>';
  }
}

function formatMetric(label, value) {
  if (value === null || value === undefined || value === "") {
    return value;
  }
  if (label === "Voltage") {
    return `${value} V`;
  }
  if (label === "Battery") {
    return `${value}%`;
  }
  if (label === "Uptime") {
    const seconds = Number(value);
    if (Number.isFinite(seconds)) {
      if (seconds >= 86400) {
        return `${Math.round(seconds / 86400)} d`;
      }
      if (seconds >= 3600) {
        return `${Math.round(seconds / 3600)} h`;
      }
      if (seconds >= 60) {
        return `${Math.round(seconds / 60)} min`;
      }
    }
  }
  if (label === "SNR") {
    return `${value} dB`;
  }
  if (label === "Channel util" || label === "Air util tx") {
    return `${value}%`;
  }
  return value;
}

async function openNodeModal(nodeId) {
  try {
    const payload = await fetchJson(`/api/node-raw?id=${encodeURIComponent(nodeId)}`);
    nodeModalSubtitle.textContent = `${payload.role || "node"} | ${payload.observedPortnums?.length ? "live packets seen" : "snapshot only"}`;
    renderKv(nodeModalIdentity, [
      ["Name", payload.longName || payload.shortName || payload.userId || payload.id],
      ["User ID", payload.userId || payload.id],
      ["Short", payload.shortName],
      ["Role", payload.role],
    ]);
    renderKv(nodeModalStatus, [
      ["Online", payload.online ? "yes" : "no"],
      ["Live packets", payload.live ? "yes" : "no"],
      ["Ports seen", payload.observedPortnums?.length || 0],
    ]);

    const raw = payload.raw || {};
    const metrics = raw.deviceMetrics || payload.lastDecoded?.deviceMetrics || payload.lastDecoded?.localStats || {};
    renderKv(nodeModalMetrics, [
      ["Battery", formatMetric("Battery", metrics.batteryLevel)],
      ["Voltage", formatMetric("Voltage", metrics.voltage)],
      ["Uptime", formatMetric("Uptime", metrics.uptimeSeconds)],
      ["Channel util", formatMetric("Channel util", metrics.channelUtilization)],
      ["Air util tx", formatMetric("Air util tx", metrics.airUtilTx)],
      ["SNR", formatMetric("SNR", raw.snr)],
      ["Hops", raw.hopsAway],
      ["Latitude", raw.position?.latitude || raw.latitude],
      ["Longitude", raw.position?.longitude || raw.longitude],
    ]);

    nodeModalPorts.innerHTML = "";
    const ports = payload.observedPortnums || [];
    if (ports.length) {
      ports.forEach((port) => {
        const badge = document.createElement("span");
        badge.className = "modal-port";
        badge.textContent = port;
        nodeModalPorts.appendChild(badge);
      });
    } else {
      nodeModalPorts.innerHTML = '<div class="node-empty">No live packets yet</div>';
    }

    nodeModalDecoded.textContent = JSON.stringify(payload.lastDecoded || {}, null, 2);
    nodeModalRaw.textContent = JSON.stringify(payload.raw || {}, null, 2);
    nodeModal.classList.remove("hidden");
    nodeModal.setAttribute("aria-hidden", "false");
  } catch (error) {
    appendLog({ sender: "system", recipient: "-", text: `Node modal error: ${error.message}`, transport: "system" });
  }
}

function closeNodeModal() {
  nodeModal.classList.add("hidden");
  nodeModal.setAttribute("aria-hidden", "true");
}

async function loadStatus() {
  try {
    const status = await fetchJson("/api/status");
    renderDeviceStatus(status);
  } catch (error) {
    deviceStatus.className = "device-status offline";
    deviceStatusTitle.textContent = "Device not connected";
    deviceStatusText.textContent = `Status error: ${error.message}`;
    latestMeshtasticConnected = false;
    setWalletStatusRow();
  }
}

function renderDeviceStatus(status) {
  const mesh = status.meshtastic || {};
  const connected = Boolean(mesh.connected);
  const isConnecting = !connected && ["starting", "detecting"].includes(String(mesh.mode || ""));
  const port = mesh.port ? ` on ${mesh.port}` : "";
  deviceStatus.className = `device-status ${connected ? "online" : (isConnecting ? "loading" : "offline")}`;
  deviceStatusTitle.textContent = connected
    ? `Device connected${port}`
    : (isConnecting ? `Connecting${port}` : "Device not connected");
  deviceStatusText.textContent = connected
    ? "Auto-connected at startup"
    : (isConnecting ? "Link check in progress..." : (mesh.error || "Waiting for auto-connect"));

  latestMeshtasticConnected = connected;
  setWalletStatusRow();
  renderModelStatus(status.llm || {});
}

function renderModelStatus(llm) {
  const availableModels = llm.availableModels || [];
  const currentModel = llm.currentModel || llm.model || "";
  modelSelect.innerHTML = "";
  availableModels.forEach((model) => {
    const option = document.createElement("option");
    option.value = model;
    option.textContent = model;
    option.selected = model === currentModel;
    modelSelect.appendChild(option);
  });
  currentSelectedModel = currentModel;
  aiSettingsCurrentModel.textContent = "Current model: " + (currentModel || "n/a");

  if (llm.switching) {
    modelStatusText.textContent = `Switching to ${currentModel}...`;
    modelSelect.disabled = true;
    return;
  }

  modelSelect.disabled = false;
  modelStatusText.textContent = llm.connected
    ? `Current model: ${currentModel}`
    : (llm.error || llm.health?.error || `Model: ${currentModel || "n/a"}`);
}

async function loadMessages() {
  try {
    latestMessages = await fetchJson("/api/messages");
    if (!Array.isArray(latestMessages)) {
      latestMessages = [];
    }
    latestMessages = latestMessages.slice(-300);
    logBox.innerHTML = "";
    latestMessages.forEach(appendLog);
    if (chatState.mode === CHAT_MODE_DM) {
      renderDmChat();
    }
  } catch (error) {
    appendLog({ sender: "system", recipient: "-", text: error.message, transport: "system" });
  }
}

async function loadNodes() {
  try {
    const payload = await fetchJson("/api/nodes");
    renderNodes(payload.nodes || []);
  } catch (error) {
    latestNodes = [];
    syncNodeSelectors();
    nodesList.innerHTML = `<div class="node-empty">${error.message}</div>`;
    if (chatState.mode === CHAT_MODE_DM) {
      renderDmChat();
    }
  }
}

modelSelect.addEventListener("change", async () => {
  const model = modelSelect.value;
  if (!model || model === currentSelectedModel) {
    return;
  }
  modelSelect.disabled = true;
  modelStatusText.textContent = `Switching to ${model}...`;
  try {
    await fetchJson("/api/models/select", {
      method: "POST",
      body: JSON.stringify({ model }),
    });
    await loadStatus();
  } catch (error) {
    modelStatusText.textContent = `Switch failed: ${error.message}`;
    modelSelect.disabled = false;
  }
});

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = chatText.value.trim();
  if (!text) {
    return;
  }
  if (chatState.mode === CHAT_MODE_DM) {
    const destinationId = String(chatState.selectedPeer || chatPeerSelect?.value || "").trim();
    if (!destinationId) {
      renderChatEmpty("Select a node to send DM.");
      return;
    }
    try {
      await fetchJson("/api/mesh/send", {
        method: "POST",
        body: JSON.stringify({ destinationId, text }),
      });
      chatText.value = "";
      await loadMessages();
    } catch (error) {
      appendLog({ sender: "system", recipient: destinationId, text: error.message, transport: "system" });
      renderDmChat();
    }
    return;
  }

  chatText.value = "";
  renderPendingLocalChat(text);
  try {
    const result = await fetchJson("/api/chat", {
      method: "POST",
      body: JSON.stringify({ peerId: LOCAL_CHAT_PEER_ID, text }),
    });
    renderLocalChat(text, result.reply || "No reply");
  } catch (error) {
    renderLocalChat(text, `Error: ${error.message}`);
    appendLog({ sender: "system", recipient: "-", text: error.message, transport: "system" });
  }
});

clearLogButton.addEventListener("click", () => {
  logBox.innerHTML = "";
});

if (clearChatButton) {
  clearChatButton.addEventListener("click", async () => {
    clearChatButton.disabled = true;
    try {
      await clearActiveChat();
    } catch (error) {
      appendLog({ sender: "system", recipient: "-", text: error.message, transport: "system" });
    } finally {
      clearChatButton.disabled = false;
    }
  });
}

chatText.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    chatForm.requestSubmit();
  }
});

if (chatModeAiButton) {
  chatModeAiButton.addEventListener("click", () => {
    setChatMode(CHAT_MODE_AI, { focusInput: true });
  });
}

if (chatModeDmButton) {
  chatModeDmButton.addEventListener("click", () => {
    setChatMode(CHAT_MODE_DM, { focusInput: true });
  });
}

if (chatPeerSelect) {
  chatPeerSelect.addEventListener("change", () => {
    setChatPeerSelection(chatPeerSelect.value, { syncWallet: true, persist: true });
    if (chatState.mode === CHAT_MODE_DM) {
      renderDmChat();
    }
  });
}

openModelManagerButton.addEventListener("click", openModelManager);
openAiSettingsButton.addEventListener("click", openAiSettingsModal);
openHelpButton.addEventListener("click", openHelpModal);
openWalletButton.addEventListener("click", openWalletModal);
helpDonateButton.addEventListener("click", () => {
  showingDonateView = true;
  renderHelpView();
});
helpDonateView.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-copy-address]");
  if (!button) {
    return;
  }
  const address = button.getAttribute("data-copy-address") || "";
  if (!address) {
    return;
  }
  const originalLabel = button.getAttribute("aria-label") || "Copy address";
  try {
    await copyText(address);
    button.classList.add("copied");
    button.setAttribute("aria-label", "Copied");
    setTimeout(() => {
      button.classList.remove("copied");
      button.setAttribute("aria-label", originalLabel);
    }, 1200);
  } catch (error) {
    button.setAttribute("aria-label", "Copy failed");
    setTimeout(() => {
      button.setAttribute("aria-label", originalLabel);
    }, 1200);
  }
});
walletViewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const viewName = button.getAttribute("data-wallet-view") || "home";
    setWalletView(viewName);
  });
});

if (receiveBtcTab) {
  receiveBtcTab.addEventListener("click", () => {
    receiveBtcTab.classList.add("is-active");
    receiveCashuTab.classList.remove("is-active");
    receiveBtcPanel.classList.remove("hidden");
    receiveCashuPanel.classList.add("hidden");
  });
}
if (receiveCashuTab) {
  receiveCashuTab.addEventListener("click", () => {
    receiveCashuTab.classList.add("is-active");
    receiveBtcTab.classList.remove("is-active");
    receiveCashuPanel.classList.remove("hidden");
    receiveBtcPanel.classList.add("hidden");
  });
}

walletCopyReceiveIdButton.addEventListener("click", async () => {
  if (!walletReceiveId.value) return;
  try {
    await copyText(walletReceiveId.value);
    walletCopyReceiveIdButton.classList.add("copied");
    setTimeout(() => walletCopyReceiveIdButton.classList.remove("copied"), 1200);
  } catch { /* silent */ }
});

walletPreferredUnitSelect.addEventListener("change", () => {
  walletState.settings.preferredUnit = walletPreferredUnitSelect.value;
  updateWalletBalanceDisplay();
  renderWalletHistory();
  renderWalletHomeActivity();
});

walletDefaultTransportSelect.addEventListener("change", () => {
  walletState.settings.defaultTransport = walletDefaultTransportSelect.value;
  walletTransportSelect.value = walletState.settings.defaultTransport;
});

walletRefreshBalance.addEventListener("click", () => {
  loadWalletBalance();
  loadCashuState();
});

// ─── Cashu event handlers ─────────────────────────────────────────────────────

cashuSetMintButton.addEventListener("click", async () => {
  const url = cashuMintUrlInput.value.trim();
  if (!url) { cashuMintStatus.textContent = "Enter a mint URL."; return; }
  cashuSetMintButton.disabled = true;
  cashuMintStatus.textContent = "Connecting to mint...";
  try {
    const data = await fetchJson("/api/cashu/mint", { method: "POST", body: JSON.stringify({ mintUrl: url }) });
    cashuState.configured = true;
    cashuState.mintUrl = data.mintUrl;
    cashuMintStatus.textContent = "Connected!";
    if (cashuMintInfo) {
      cashuMintInfo.textContent = data.name ? `${data.name}${data.description ? " — " + data.description : ""}` : data.mintUrl;
      cashuMintInfo.hidden = false;
    }
    applyCashuState();
  } catch (e) {
    cashuMintStatus.textContent = e.message;
  } finally {
    cashuSetMintButton.disabled = false;
  }
});

cashuCreateInvoiceButton.addEventListener("click", async () => {
  const amount = Number(cashuInvoiceAmount.value);
  if (!amount || amount <= 0) { cashuInvoiceStatus.textContent = "Enter amount."; return; }
  if (!cashuState.configured) { cashuInvoiceStatus.textContent = "Set a mint first."; return; }
  cashuCreateInvoiceButton.disabled = true;
  cashuInvoiceStatus.textContent = "Creating invoice...";
  try {
    const data = await fetchJson("/api/cashu/invoice", { method: "POST", body: JSON.stringify({ amount }) });
    cashuState.currentInvoiceHash = data.hash;
    cashuInvoicePr.value = data.pr;
    cashuInvoiceQr.src = data.qr;
    cashuInvoiceBlock.hidden = false;
    cashuInvoiceStatus.textContent = `Invoice for ${amount} sats — pay with Lightning`;
    // Add to pending
    cashuState.pendingInvoices = cashuState.pendingInvoices || [];
    cashuState.pendingInvoices.push({ hash: data.hash, amount, pr: data.pr, createdAt: new Date().toISOString() });
    renderCashuPending();
  } catch (e) {
    cashuInvoiceStatus.textContent = e.message;
  } finally {
    cashuCreateInvoiceButton.disabled = false;
  }
});

cashuCheckInvoiceButton.addEventListener("click", async () => {
  const hash = cashuState.currentInvoiceHash;
  if (!hash) { cashuCheckStatus.textContent = "No invoice to check."; return; }
  cashuCheckInvoiceButton.disabled = true;
  cashuCheckStatus.textContent = "Checking...";
  try {
    const data = await fetchJson("/api/cashu/check", { method: "POST", body: JSON.stringify({ hash }) });
    cashuState.balance = data.balance;
    cashuCheckStatus.textContent = `Paid! +${data.amount} sats. Balance: ${data.balance} sats`;
    cashuInvoiceBlock.hidden = true;
    cashuState.currentInvoiceHash = null;
    cashuState.pendingInvoices = cashuState.pendingInvoices.filter((i) => i.hash !== hash);
    renderCashuPending();
    applyCashuState();
  } catch (e) {
    cashuCheckStatus.textContent = `Not paid yet: ${e.message}`;
  } finally {
    cashuCheckInvoiceButton.disabled = false;
  }
});

cashuCopyInvoiceButton.addEventListener("click", async () => {
  try { await copyText(cashuInvoicePr.value); cashuInvoiceStatus.textContent = "Copied!"; } catch { /* silent */ }
});

if (cashuPendingList) {
  cashuPendingList.addEventListener("click", async (e) => {
    const btn = e.target.closest(".cashu-check-btn");
    if (!btn) return;
    const hash = btn.getAttribute("data-hash");
    btn.disabled = true;
    btn.textContent = "...";
    try {
      const data = await fetchJson("/api/cashu/check", { method: "POST", body: JSON.stringify({ hash }) });
      cashuState.balance = data.balance;
      cashuState.pendingInvoices = cashuState.pendingInvoices.filter((i) => i.hash !== hash);
      renderCashuPending();
      applyCashuState();
    } catch (e) {
      btn.textContent = "Check";
      btn.disabled = false;
      cashuInvoiceStatus.textContent = `Not paid: ${e.message}`;
    }
  });
}

walletSendForm.removeEventListener("submit", null);
walletSendForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const amount = Number(walletAmountInput.value);
  const recipient = walletRecipientInput.value.trim();
  const transport = walletTransportSelect.value;
  const memo = walletMemoInput.value.trim();
  if (!amount || amount <= 0) { walletSendStatus.textContent = "Enter amount."; return; }
  walletSendStatus.textContent = "Preparing token...";
  try {
    const data = await fetchJson("/api/cashu/send", {
      method: "POST",
      body: JSON.stringify({ amount, peer: recipient || "unknown", memo }),
    });
    cashuState.balance = cashuState.balance - amount;
    applyCashuState();
    walletSendStatus.textContent = `Token created: ${amount} sats`;
    cashuSendTokenOutput.value = data.token;
    cashuSendTokenBlock.hidden = false;
    // Send via Meshtastic DM if recipient set
    if (recipient && transport === "Meshtastic DM") {
      try {
        await fetchJson("/api/mesh/send", {
          method: "POST",
          body: JSON.stringify({ destinationId: recipient, text: data.token }),
        });
        walletSendStatus.textContent = `Sent ${amount} sats to ${recipient} via mesh`;
      } catch {
        walletSendStatus.textContent = `Token ready — mesh send failed, copy manually`;
      }
    }
    walletAmountInput.value = "";
    walletMemoInput.value = "";
    walletState.history.unshift({ id: `cashu-send-${Date.now()}`, direction: "Sent", peer: recipient || "manual", amount, unit: "sats", status: "Token created", timestamp: new Date().toLocaleString() });
    renderWalletHistory();
  } catch (e) {
    walletSendStatus.textContent = e.message;
  }
});

cashuCopyTokenButton.addEventListener("click", async () => {
  try { await copyText(cashuSendTokenOutput.value); cashuCopyTokenButton.textContent = "Copied!"; setTimeout(() => { cashuCopyTokenButton.textContent = "Copy"; }, 1200); } catch { /* silent */ }
});

cashuMeltForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const pr = cashuMeltInput.value.trim();
  if (!pr) { cashuMeltStatus.textContent = "Paste a Lightning invoice."; return; }
  cashuMeltStatus.textContent = "Paying...";
  try {
    const data = await fetchJson("/api/cashu/melt", { method: "POST", body: JSON.stringify({ pr }) });
    cashuState.balance = data.balance;
    cashuMeltStatus.textContent = data.isPaid ? `Paid ${data.amount} sats (fee: ${data.fee})` : "Payment failed";
    cashuMeltInput.value = "";
    applyCashuState();
  } catch (e) {
    cashuMeltStatus.textContent = e.message;
  }
});

cashuReceiveForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const token = cashuReceiveInput.value.trim();
  if (!token) { cashuReceiveStatus.textContent = "Paste a cashuA... token."; return; }
  cashuReceiveStatus.textContent = "Redeeming...";
  try {
    const data = await fetchJson("/api/cashu/receive", { method: "POST", body: JSON.stringify({ token }) });
    cashuState.balance = data.balance;
    cashuReceiveStatus.textContent = `Received ${data.amount} sats! Balance: ${data.balance} sats`;
    cashuReceiveInput.value = "";
    applyCashuState();
    walletState.history.unshift({ id: `cashu-recv-${Date.now()}`, direction: "Received", peer: "Cashu token", amount: data.amount, unit: "sats", status: "Confirmed", timestamp: new Date().toLocaleString() });
    renderWalletHistory();
  } catch (e) {
    cashuReceiveStatus.textContent = e.message;
  }
});

// ─── End Cashu event handlers ─────────────────────────────────────────────────

function fillMnemonicGrid(container, mnemonic) {
  container.innerHTML = "";
  (mnemonic || "").split(" ").forEach((word, i) => {
    const el = document.createElement("div");
    el.className = "wallet-mnemonic-word";
    el.innerHTML = `<span class="wallet-mnemonic-num">${i + 1}</span><span></span>`;
    el.querySelector("span:last-child").textContent = word;
    container.appendChild(el);
  });
}

function updateSeedRevealState(visible) {
  if (!walletSeedRevealGrid || !walletSeedEyeIcon || !walletSeedEyeOffIcon) return;
  walletSeedRevealGrid.classList.toggle("hidden", !visible);
  walletSeedEyeIcon.classList.toggle("hidden", visible);
  walletSeedEyeOffIcon.classList.toggle("hidden", !visible);
  if (walletSeedNotAvailable) walletSeedNotAvailable.classList.toggle("hidden", visible);
  if (visible && walletSeedRevealGrid.children.length === 0) {
    if (walletState.mnemonic) {
      fillMnemonicGrid(walletSeedRevealGrid, walletState.mnemonic);
    } else {
      walletSeedRevealGrid.innerHTML = '<div style="grid-column:1/-1;color:var(--muted);font-size:9px">Seed not available — page was reloaded. Check data/wallet.json</div>';
    }
  }
}

if (walletShowSeedButton) {
  walletShowSeedButton.addEventListener("click", () => {
    const isHidden = walletSeedRevealGrid.classList.contains("hidden");
    updateSeedRevealState(isHidden);
  });
}

if (walletCopyAddressButton) {
  walletCopyAddressButton.addEventListener("click", async () => {
    const addr = walletState.address;
    if (!addr) return;
    try {
      await copyText(addr);
      walletCopyAddressButton.classList.add("copied");
      setTimeout(() => walletCopyAddressButton.classList.remove("copied"), 1200);
    } catch { /* silent */ }
  });
}

async function doCreateWallet(triggerButton, statusEl) {
  if (triggerButton) triggerButton.disabled = true;
  if (statusEl) statusEl.textContent = "Creating wallet...";
  try {
    const data = await fetchJson("/api/wallet/create", { method: "POST" });
    walletState.walletConfigured = true;
    walletState.address = data.address;
    walletState.mnemonic = data.mnemonic || null;
    walletState.qrLoaded = false;
    walletMnemonicGrid.innerHTML = "";
    fillMnemonicGrid(walletMnemonicGrid, data.mnemonic);
    walletCreateBlock.classList.add("hidden");
    walletMnemonicBlock.classList.remove("hidden");
    if (walletInfoBlock) walletInfoBlock.classList.add("hidden");
    if (statusEl) statusEl.textContent = "";
    applyWalletConfiguredState({ showInfoBlock: false });
  } catch (err) {
    if (statusEl) statusEl.textContent = `Error: ${err.message}`;
    if (triggerButton) triggerButton.disabled = false;
  }
}

walletInitButton.addEventListener("click", () => {
  doCreateWallet(walletInitButton, walletSettingsStatus);
});

if (walletHomeCreateButton) {
  walletHomeCreateButton.addEventListener("click", () => {
    doCreateWallet(walletHomeCreateButton, null);
  });
}

if (walletMnemonicDoneButton) {
  walletMnemonicDoneButton.addEventListener("click", () => {
    walletMnemonicBlock.classList.add("hidden");
    walletInfoBlock.classList.remove("hidden");
    renderWalletSettingsInfo();
    updateSeedRevealState(false);
    walletSettingsStatus.textContent = "Wallet ready.";
    loadWalletBalance();
    loadWalletTransactions();
  });
}

walletResetButton.addEventListener("click", async () => {
  if (!confirm("Delete wallet? This cannot be undone. Back up your seed phrase first.")) return;
  try {
    await fetchJson("/api/wallet/reset", { method: "POST" });
    walletState.walletConfigured = false;
    walletState.address = null;
    walletState.mnemonic = null;
    walletState.balance = null;
    walletState.qrLoaded = false;
    walletState.history = [];
    renderWalletHistory();
    renderWalletHomeActivity();
    applyWalletConfiguredState();
    walletSettingsStatus.textContent = "Wallet deleted.";
  } catch (err) {
    walletSettingsStatus.textContent = `Error: ${err.message}`;
  }
});
aiSettingsEnableInstructions.addEventListener("change", toggleAiInstructionsInput);
aiSettingsForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  aiSettingsStatusText.textContent = "Saving AI settings...";
  try {
    const payload = await fetchJson("/api/ai-settings", {
      method: "POST",
      body: JSON.stringify({ settings: collectAiSettingsForm() }),
    });
    renderAiSettings(payload);
    aiSettingsStatusText.textContent = "AI settings saved.";
    closeAiSettingsModal();
  } catch (error) {
    aiSettingsStatusText.textContent = `Save failed: ${error.message}`;
  }
});
modelManagerClose.addEventListener("click", closeModelManager);
aiSettingsClose.addEventListener("click", closeAiSettingsModal);
helpModalClose.addEventListener("click", closeHelpModal);
walletModalClose.addEventListener("click", closeWalletModal);
modelManagerModal.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-model-manager")) {
    closeModelManager();
  }
});
helpModal.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-help-modal")) {
    closeHelpModal();
  }
});
aiSettingsModal.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-ai-settings")) {
    closeAiSettingsModal();
  }
});
walletModal.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-wallet-modal")) {
    closeWalletModal();
  }
});

nodeModalClose.addEventListener("click", closeNodeModal);
nodeModal.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-node-modal")) {
    closeNodeModal();
  }
});
document.addEventListener("keydown", (event) => {
  handleWalletModalFocusTrap(event);
  if (event.key === "Escape" && !walletModal.classList.contains("hidden")) {
    closeWalletModal();
    return;
  }
  if (event.key === "Escape" && !aiSettingsModal.classList.contains("hidden")) {
    closeAiSettingsModal();
    return;
  }
  if (event.key === "Escape" && !helpModal.classList.contains("hidden")) {
    closeHelpModal();
    return;
  }
  if (event.key === "Escape" && !modelManagerModal.classList.contains("hidden")) {
    closeModelManager();
    return;
  }
  if (event.key === "Escape" && !nodeModal.classList.contains("hidden")) {
    closeNodeModal();
  }
});

function connectEvents() {
  const source = new EventSource("/events");
  source.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    latestMessages.push(message);
    latestMessages = latestMessages.slice(-300);
    appendLog(message);
    if (chatState.mode === CHAT_MODE_DM) {
      renderDmChat();
    }
  });
  source.addEventListener("status", () => {
    loadStatus();
  });
  source.addEventListener("nodes", (event) => {
    const payload = JSON.parse(event.data);
    renderNodes(payload.nodes || []);
  });
  source.addEventListener("model-manager", (event) => {
    renderModelManager(JSON.parse(event.data));
  });
  source.onerror = () => {
    setTimeout(() => {
      source.close();
      connectEvents();
    }, 1500);
  };
}

setWalletStatusRow();
renderWalletHistory();
if (walletPreferredUnitSelect) walletPreferredUnitSelect.value = walletState.settings.preferredUnit;
if (walletDefaultTransportSelect) walletDefaultTransportSelect.value = walletState.settings.defaultTransport;
if (walletUnitSelect) walletUnitSelect.value = walletState.settings.preferredUnit;
if (walletTransportSelect) walletTransportSelect.value = walletState.settings.defaultTransport;
applyWalletConfiguredState();
setChatMode(CHAT_MODE_AI);
setWalletView("home");
renderHelpView();
loadStatus();
loadMessages();
loadNodes();
connectEvents();




