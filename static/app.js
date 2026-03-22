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
const chatPeerDropdown = document.getElementById("chatPeerDropdown");
const chatPeerTrigger = document.getElementById("chatPeerTrigger");
const chatPeerLabel = document.getElementById("chatPeerLabel");
const chatPeerCashuButton = document.getElementById("chatPeerCashuButton");
const chatPeerFilterButtons = Array.from(document.querySelectorAll("[data-chat-peer-filter]"));
const nodesMapModal = document.getElementById("nodesMapModal");
const nodesMapClose = document.getElementById("nodesMapClose");
const nodesMapContainer = document.getElementById("nodesMapContainer");
const openNodesMapButton = document.getElementById("openNodesMapButton");
const nodeModal = document.getElementById("nodeModal");
const nodeModalClose = document.getElementById("nodeModalClose");
const nodeModalDot = document.getElementById("nodeModalDot");
const nodeModalPositionButton = document.getElementById("nodeModalPositionButton");
const nodeModalChatButton = document.getElementById("nodeModalChatButton");
const nodeModalSendButton = document.getElementById("nodeModalSendButton");
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
const cashuPendingRow = document.getElementById("cashuPendingRow");
const cashuPendingValue = document.getElementById("cashuPendingValue");
const cashuSwapPendingBtn = document.getElementById("cashuSwapPendingBtn");
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
const walletTestModeToggle = document.getElementById("walletTestModeToggle");
const walletTestModeBadge = document.getElementById("walletTestModeBadge");
const walletFaucetCard = document.getElementById("walletFaucetCard");
const faucetAddressButton = document.getElementById("faucetAddressButton");
const faucetInvoiceButton = document.getElementById("faucetInvoiceButton");
const faucetStatus = document.getElementById("faucetStatus");
// Swap panel
const swapBtcToCashuForm = document.getElementById("swapBtcToCashuForm");
const swapBtcAmount = document.getElementById("swapBtcAmount");
const swapBtcStatus = document.getElementById("swapBtcStatus");
const swapBtcOnchainBalance = document.getElementById("swapBtcOnchainBalance");
const swapCashuToBtcForm = document.getElementById("swapCashuToBtcForm");
const swapCashuAmount = document.getElementById("swapCashuAmount");
const swapCashuBtcAddr = document.getElementById("swapCashuBtcAddr");
const swapCashuStatus = document.getElementById("swapCashuStatus");
const swapCashuAvailable = document.getElementById("swapCashuAvailable");
const swapCashuReceiveForm = document.getElementById("swapCashuReceiveForm");
const swapCashuReceiveInput = document.getElementById("swapCashuReceiveInput");
const swapCashuReceiveStatus = document.getElementById("swapCashuReceiveStatus");
const swapCashuSendForm = document.getElementById("swapCashuSendForm");
const swapCashuSendAmount = document.getElementById("swapCashuSendAmount");
const swapCashuSendRecipient = document.getElementById("swapCashuSendRecipient");
const swapCashuSendStatus = document.getElementById("swapCashuSendStatus");
const swapCashuSendResult = document.getElementById("swapCashuSendResult");
const swapCashuSendToken = document.getElementById("swapCashuSendToken");
const swapCashuCopyTokenBtn = document.getElementById("swapCashuCopyTokenBtn");
const swapLnAmount = document.getElementById("swapLnAmount");
const swapLnInvoiceButton = document.getElementById("swapLnInvoiceButton");
const swapLnStatus = document.getElementById("swapLnStatus");
const swapLnBlock = document.getElementById("swapLnBlock");
const swapLnQr = document.getElementById("swapLnQr");
const swapLnPr = document.getElementById("swapLnPr");
const swapLnCopyBtn = document.getElementById("swapLnCopyBtn");
const swapLnCheckButton = document.getElementById("swapLnCheckButton");
const swapLnCheckStatus = document.getElementById("swapLnCheckStatus");
const activeSwapsCard = document.getElementById("activeSwapsCard");
const activeSwapsList = document.getElementById("activeSwapsList");
const clearSwapsButton = document.getElementById("clearSwapsButton");
const meshAiReplyToggle = document.getElementById("meshAiReplyToggle");
const deviceMetaModal = document.getElementById("deviceMetaModal");
const deviceMetaClose = document.getElementById("deviceMetaClose");
const deviceMetaShortName = document.getElementById("deviceMetaShortName");
const deviceMetaLongName = document.getElementById("deviceMetaLongName");
const deviceMetaLat = document.getElementById("deviceMetaLat");
const deviceMetaLon = document.getElementById("deviceMetaLon");
const deviceMetaStatus = document.getElementById("deviceMetaStatus");
const deviceMetaSave = document.getElementById("deviceMetaSave");
const settingsMintUrlInput = document.getElementById("settingsMintUrlInput");
const settingsSetMintButton = document.getElementById("settingsSetMintButton");
const settingsMintStatus = document.getElementById("settingsMintStatus");
// Send tab BTC/Cashu switcher
const sendBtcTab = document.getElementById("sendBtcTab");
const sendCashuTab = document.getElementById("sendCashuTab");
const sendBtcPanel = document.getElementById("sendBtcPanel");
const sendCashuPanel = document.getElementById("sendCashuPanel");
const sendBtcContent = document.getElementById("sendBtcContent");
const sendBtcNoWallet = document.getElementById("sendBtcNoWallet");
const sendBtcBalance = document.getElementById("sendBtcBalance");
const sendBtcForm = document.getElementById("sendBtcForm");
const sendBtcAddress = document.getElementById("sendBtcAddress");
const sendBtcAmount = document.getElementById("sendBtcAmount");
const sendBtcFeeRate = document.getElementById("sendBtcFeeRate");
const sendBtcStatus = document.getElementById("sendBtcStatus");
const sendBtcLnForm = document.getElementById("sendBtcLnForm");
const sendBtcLnInvoice = document.getElementById("sendBtcLnInvoice");
const sendBtcLnStatus = document.getElementById("sendBtcLnStatus");
const walletViewButtons = Array.from(document.querySelectorAll("[data-wallet-view]"));
const walletQuickButtons = Array.from(document.querySelectorAll(".wallet-quick-button"));
const walletViewPanels = {
  home: document.getElementById("walletPanelHome"),
  receive: document.getElementById("walletPanelReceive"),
  send: document.getElementById("walletPanelSend"),
  swap: document.getElementById("walletPanelSwap"),
  history: document.getElementById("walletPanelHistory"),
  settings: document.getElementById("walletPanelSettings"),
  fund: document.getElementById("walletPanelFund"), // legacy, hidden
};
let currentSelectedModel = "";
const LOCAL_CHAT_PEER_ID = "local-ui-user";
let latestModelManagerPayload = null;
let latestAiSettingsPayload = null;
let swapLnPollInterval = null;
let showingDonateView = false;
let latestMeshtasticConnected = false;
let latestMessages = [];
let latestNodes = [];
let latestMeshLinks = [];
const unreadPeers = new Set(); // peer IDs with unread incoming messages
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
  dmLoadingPeer: "",
  peerFilters: {
    unread: false,
    active: false,
    online: false,
  },
};
const cashuState = {
  configured: false,
  mintUrl: null,
  balance: 0,
  pendingBalance: 0,
  pendingInvoices: [],
  currentInvoiceHash: null,
};

// Tracks tokens already redeemed in this session so the button stays disabled
// across re-renders of renderDmChat().
const redeemedCashuTokens = new Set();

const walletState = {
  walletConfigured: false,
  meshtasticConnected: false,
  activeView: "home",
  history: [],
  address: null,
  mnemonic: null,
  balance: null,
  qrLoaded: false,
  testMode: false,
  network: "mainnet",
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
  if (chatPeerCashuButton) {
    chatPeerCashuButton.disabled = !chatState.selectedPeer;
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

function peerHasDmHistory(peerId) {
  return latestMessages.some((message) => isPeerDmMessage(message, peerId));
}

function passesChatPeerFilters(node) {
  const peerId = getNodeAddress(node);
  if (!peerId) {
    return false;
  }
  if (chatState.peerFilters.unread && !unreadPeers.has(peerId)) {
    return false;
  }
  if (chatState.peerFilters.active && !peerHasDmHistory(peerId)) {
    return false;
  }
  if (chatState.peerFilters.online && !node.online) {
    return false;
  }
  return true;
}

function renderChatPeerFilters() {
  chatPeerFilterButtons.forEach((button) => {
    const filterName = button.dataset.chatPeerFilter;
    const enabled = Boolean(chatState.peerFilters[filterName]);
    button.classList.toggle("is-active", enabled);
    button.setAttribute("aria-pressed", enabled ? "true" : "false");
  });
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
  populateNodeSelect(swapCashuSendRecipient, swapCashuSendRecipient?.value || "");
  const preferredChatPeer = chatState.selectedPeer || readStoredChatPeer();
  populateNodeSelect(chatPeerSelect, preferredChatPeer || chatPeerSelect?.value || "");
  if (chatPeerSelect && preferredChatPeer) {
    setChatPeerSelection(preferredChatPeer, { syncWallet: true, persist: true });
  } else if (chatPeerSelect) {
    setChatPeerSelection(chatPeerSelect.value, { syncWallet: true, persist: true });
  }
  renderChatPeerList();
}

function renderChatPeerList() {
  const listEl = document.getElementById("chatPeerList");
  if (!listEl) return;
  const nodes = getSelectableNodes();
  if (!nodes.length) {
    listEl.innerHTML = '<div class="chat-peer-empty">No nodes found</div>';
    return;
  }
  const filteredNodes = nodes.filter(passesChatPeerFilters);
  if (!filteredNodes.length) {
    listEl.innerHTML = '<div class="chat-peer-empty">No nodes match filters</div>';
    const activeNode = nodes.find((node) => getNodeAddress(node) === chatState.selectedPeer);
    if (chatPeerLabel) {
      chatPeerLabel.textContent = activeNode ? getNodeDisplayLabel(activeNode) : "Select node";
    }
    return;
  }
  // Sort: unread peers first, then alphabetically
  const sorted = [...filteredNodes].sort((a, b) => {
    const aAddr = getNodeAddress(a);
    const bAddr = getNodeAddress(b);
    const aUnread = unreadPeers.has(aAddr) ? 0 : 1;
    const bUnread = unreadPeers.has(bAddr) ? 0 : 1;
    if (aUnread !== bUnread) return aUnread - bUnread;
    return getNodeDisplayLabel(a).localeCompare(getNodeDisplayLabel(b));
  });
  listEl.innerHTML = "";
  sorted.forEach((node) => {
    const addr = getNodeAddress(node);
    const label = getNodeDisplayLabel(node);
    const isActive = addr === chatState.selectedPeer;
    const hasUnread = unreadPeers.has(addr);
    const item = document.createElement("div");
    item.className = "chat-peer-item" + (isActive ? " is-active" : "");
    item.dataset.peer = addr;
    item.innerHTML = `<span class="chat-peer-item-name">${label}</span>` +
      (hasUnread ? `<span class="chat-peer-unread" title="Unread messages"><svg width="14" height="11" viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="13" height="10" rx="1" stroke="currentColor"/><path d="M1 1l6 5 6-5" stroke="currentColor" stroke-linecap="round"/></svg></span>` : "");
    item.addEventListener("click", () => {
      unreadPeers.delete(addr);
      updateDmTabUnreadGlow();
      setChatPeerSelection(addr, { syncWallet: true, persist: true });
      listEl.hidden = true;
      renderChatPeerList();
      if (chatState.mode === CHAT_MODE_DM) {
        refreshActiveDmChat();
      }
    });
    listEl.appendChild(item);
  });
  // Update trigger label
  const activeNode = nodes.find((node) => getNodeAddress(node) === chatState.selectedPeer);
  if (chatPeerLabel) {
    chatPeerLabel.textContent = activeNode ? getNodeDisplayLabel(activeNode) : "Select node";
  }
}

function updateDmTabUnreadGlow() {
  if (!chatModeDmButton) return;
  const hasAny = unreadPeers.size > 0 && chatState.mode !== CHAT_MODE_DM;
  chatModeDmButton.classList.toggle("has-unread", hasAny);
}

function renderChatEmpty(message) {
  chatReplyText.innerHTML = "";
  const empty = document.createElement("div");
  empty.className = "chat-empty";
  empty.textContent = message;
  chatReplyText.appendChild(empty);
}

function renderChatLoading(message = "Loading DM history...") {
  chatReplyText.innerHTML = "";
  const loading = document.createElement("div");
  loading.className = "chat-loading";
  loading.textContent = message;
  chatReplyText.appendChild(loading);
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

// Parse optional "[250 sats] cashuA..." wrapper, returns { token, sats } or null
function parseCashuMessage(text) {
  const t = (text || "").trim();
  // With amount prefix: [250 sats] cashuA...
  const prefixed = /^\[(\d+)\s*sats?\]\s*(cashu[AB]\S+)/i.exec(t);
  if (prefixed) return { token: prefixed[2], sats: Number(prefixed[1]) };
  // Plain token
  if (t.startsWith("cashuA") || t.startsWith("cashuB")) return { token: t, sats: null };
  return null;
}

// Detect if a string is a Cashu token (with or without amount prefix)
function isCashuTokenText(text) {
  return parseCashuMessage(text) !== null;
}

// Parse [N/T] prefix from a message text. Returns { partNum, total, content } or null.
function parseMeshPart(text) {
  const m = /^\[(\d+)\/(\d+)\]\s*/.exec(text || "");
  if (!m) return null;
  return { partNum: Number(m[1]), total: Number(m[2]), content: text.slice(m[0].length) };
}

// Extract sats from the first fragment's content, e.g. "[250 sats] cashuA..." → 250
function extractSatsFromFragment(content) {
  const m = /^\[(\d+)\s*sats?\]/i.exec((content || "").trim());
  return m ? Number(m[1]) : null;
}

// Group sequential [N/T] mesh fragments from the same sender into one virtual message.
// - All parts present + assembled is a Cashu token → { isCashuToken: true, fragmentCount }
// - Starts at [1/T] but incomplete → { isCashuFragment: true, receivedParts, totalParts, sats }
// - Orphaned fragments (no [1/T]) fall through as regular messages
function groupCashuFragments(thread) {
  const result = [];
  let i = 0;
  while (i < thread.length) {
    const msg = thread[i];
    const part = parseMeshPart(msg.text);

    if (part && part.partNum === 1 && part.total > 1) {
      // Count how many consecutive parts we actually have
      let k = 1;
      while (k < part.total) {
        const next = thread[i + k];
        if (!next || next.sender !== msg.sender) break;
        const np = parseMeshPart(next.text);
        if (!np || np.partNum !== k + 1 || np.total !== part.total) break;
        k++;
      }

      if (k === part.total) {
        // All parts present — assemble and check
        const parts = [];
        for (let j = 0; j < part.total; j++) parts.push(parseMeshPart(thread[i + j].text).content);
        const assembled = parts.join("");
        if (isCashuTokenText(assembled)) {
          result.push({ ...msg, text: assembled, isCashuToken: true, fragmentCount: part.total });
          i += part.total;
          continue;
        }
      } else {
        // Partial transfer in progress — show progress bar
        const sats = extractSatsFromFragment(part.content);
        result.push({ ...msg, isCashuFragment: true, receivedParts: k, totalParts: part.total, sats });
        i += k;
        continue;
      }
    }

    // Single-message cashu token (short enough to fit in one packet)
    if (isCashuTokenText(msg.text)) {
      result.push({ ...msg, isCashuToken: true, fragmentCount: 1 });
      i++;
      continue;
    }

    result.push(msg);
    i++;
  }
  return result;
}

function renderDmChat() {
  const peerId = chatState.selectedPeer;
  if (!peerId) {
    renderChatEmpty("Select a node to start DM chat.");
    return;
  }
  if (chatState.dmLoadingPeer === peerId) {
    renderChatLoading();
    return;
  }
  const raw = latestMessages.filter((message) => isPeerDmMessage(message, peerId));
  if (!raw.length) {
    renderChatEmpty("No DM history with this node yet.");
    return;
  }

  const thread = groupCashuFragments(raw);

  chatReplyText.innerHTML = "";
  thread.forEach((message) => {
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${message.direction === "out" ? "user" : "node"}`;
    if (message.id != null) bubble.dataset.msgId = message.id;

    const meta = document.createElement("div");
    meta.className = "chat-bubble-meta";
    const author = message.direction === "out" ? "You" : (message.sender || "Node");
    const stamp = formatChatTime(message.createdAt);
    meta.textContent = stamp ? `${author} | ${stamp}` : author;

    if (message.direction === "out") {
      const ackIcon = document.createElement("span");
      ackIcon.className = `chat-bubble-ack chat-bubble-ack--${message.ack || "pending"}`;
      ackIcon.title = message.ack === "delivered" ? "Delivered" : message.ack === "failed" ? "Not delivered" : message.ack === "sent" ? "Sent to mesh" : "Sending...";
      bubble.appendChild(ackIcon);
    }

    const body = document.createElement("div");
    body.className = "chat-bubble-body";

    if (message.isCashuFragment) {
      const { receivedParts, totalParts, sats } = message;
      const isOutgoingFragment = message.direction === "out";

      if (sats !== null) {
        const amountBadge = document.createElement("div");
        amountBadge.style.cssText = `font-size:1.1em;font-weight:bold;color:${isOutgoingFragment ? "#aaa" : "#7ecfaa"};margin-bottom:6px`;
        amountBadge.textContent = isOutgoingFragment ? `-${sats} sats` : `+${sats} sats`;
        body.appendChild(amountBadge);
      }

      const label = document.createElement("div");
      label.style.cssText = "font-size:0.75em;opacity:0.65;margin-bottom:7px";
      label.textContent = isOutgoingFragment
        ? `Sending... ${receivedParts} / ${totalParts} parts`
        : `Receiving Cashu token... ${receivedParts} / ${totalParts} parts`;
      body.appendChild(label);

      const BLOCK_COUNT = 20;
      const filledBlocks = Math.round((receivedParts / totalParts) * BLOCK_COUNT);
      const blockTrack = document.createElement("div");
      blockTrack.style.cssText = "display:flex;gap:2px;align-items:center;margin-top:2px";
      for (let b = 0; b < BLOCK_COUNT; b++) {
        const block = document.createElement("div");
        const filled = b < filledBlocks;
        block.style.cssText = [
          "width:7px",
          "height:13px",
          "flex-shrink:0",
          filled
            ? "background:#7ecfaa;box-shadow:inset 0 1px 0 rgba(255,255,255,0.35),inset 0 -1px 0 rgba(0,0,0,0.35),inset 1px 0 0 rgba(255,255,255,0.15),inset -1px 0 0 rgba(0,0,0,0.2)"
            : "background:rgba(255,255,255,0.08);box-shadow:inset 0 1px 0 rgba(255,255,255,0.06),inset 0 -1px 0 rgba(0,0,0,0.25)",
        ].join(";");
        blockTrack.appendChild(block);
      }
      body.appendChild(blockTrack);

    } else if (message.isCashuToken) {
      const parsed = parseCashuMessage(message.text.trim());
      const token = parsed ? parsed.token : message.text.trim();
      const sats = parsed ? parsed.sats : null;
      // Amount badge
      if (sats !== null) {
        const amountBadge = document.createElement("div");
        amountBadge.style.cssText = "font-size:1.1em;font-weight:bold;color:#7ecfaa;margin-bottom:6px";
        amountBadge.textContent = `+${sats} sats`;
        body.appendChild(amountBadge);
      }

      const tokenHint = document.createElement("div");
      tokenHint.style.cssText = "font-size:0.72em;opacity:0.5;margin-bottom:8px";
      tokenHint.textContent = `Cashu token${message.fragmentCount > 1 ? ` · ${message.fragmentCount} parts` : ""}`;
      body.appendChild(tokenHint);

      const redeemBtn = document.createElement("button");
      redeemBtn.className = "wallet-action-button";
      redeemBtn.style.cssText = "padding:7px 22px;font-size:0.88em;";
      const statusSpan = document.createElement("span");
      statusSpan.style.cssText = "display:block;font-size:0.8em;margin-top:6px;opacity:0.8";

      const alreadyRedeemed = redeemedCashuTokens.has(token);
      if (alreadyRedeemed) {
        redeemBtn.textContent = "Redeemed";
        redeemBtn.disabled = true;
        bubble.style.opacity = "0.45";
        bubble.style.pointerEvents = "none";
        bubble.style.filter = "grayscale(0.4)";
      } else {
        redeemBtn.textContent = "Redeem";
      }

      redeemBtn.addEventListener("click", async () => {
        redeemBtn.disabled = true;
        statusSpan.textContent = "Redeeming...";
        try {
          const data = await fetchJson("/api/cashu/receive", {
            method: "POST",
            body: JSON.stringify({ token }),
          });
          redeemedCashuTokens.add(token);
          statusSpan.textContent = data.unverified
            ? `+${data.amount} sats (offline, unverified — confirm when online)`
            : `+${data.amount} sats added to balance`;
          redeemBtn.textContent = "Redeemed";
          if (cashuState) { cashuState.balance = data.balance; applyCashuState(); }
          bubble.style.opacity = "0.45";
          bubble.style.pointerEvents = "none";
          bubble.style.filter = "grayscale(0.4)";
        } catch (e) {
          statusSpan.textContent = e.message || "Failed";
          redeemBtn.disabled = false;
        }
      });

      body.append(redeemBtn, statusSpan);
    } else {
      body.textContent = message.text || "";
    }

    bubble.append(meta, body);
    chatReplyText.appendChild(bubble);
  });
  chatReplyText.scrollTop = chatReplyText.scrollHeight;
}

async function refreshActiveDmChat() {
  const peerId = String(chatState.selectedPeer || "").trim();
  if (!peerId) {
    renderDmChat();
    return;
  }
  chatState.dmLoadingPeer = peerId;
  renderDmChat();
  try {
    await loadMessages();
  } finally {
    if (chatState.dmLoadingPeer === peerId) {
      chatState.dmLoadingPeer = "";
    }
    if (chatState.mode === CHAT_MODE_DM && chatState.selectedPeer === peerId) {
      renderDmChat();
    }
  }
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
  if (chatPeerCashuButton) {
    chatPeerCashuButton.classList.toggle("hidden", !isDm);
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
  refreshActiveDmChat();
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

function applyMeshAiReply(enabled) {
  meshAiReplyToggle.textContent = enabled ? "on" : "off";
  meshAiReplyToggle.setAttribute("aria-pressed", String(enabled));
  meshAiReplyToggle.classList.toggle("ai-reply-btn--on", enabled);
}

function openDeviceMetaModal() {
  deviceMetaModal.classList.remove("hidden");
  deviceMetaModal.setAttribute("aria-hidden", "false");
  deviceMetaStatus.textContent = "Loading...";
  deviceMetaShortName.value = "";
  deviceMetaLongName.value = "";
  deviceMetaLat.value = "";
  deviceMetaLon.value = "";
  fetchJson("/api/device-meta").then((data) => {
    deviceMetaShortName.value = data.shortName || "";
    deviceMetaLongName.value = data.longName || "";
    deviceMetaLat.value = data.latitude != null ? data.latitude : "";
    deviceMetaLon.value = data.longitude != null ? data.longitude : "";
    deviceMetaStatus.textContent = "";
  }).catch((err) => {
    deviceMetaStatus.textContent = `Load error: ${err.message}`;
  });
}

function closeDeviceMetaModal() {
  deviceMetaModal.classList.add("hidden");
  deviceMetaModal.setAttribute("aria-hidden", "true");
}
function getFocusableElements(container) {
  return Array.from(container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter((element) => {
    return !element.disabled && element.offsetParent !== null;
  });
}

function applyTestMode() {
  const tm = walletState.testMode;
  if (walletTestModeBadge) walletTestModeBadge.hidden = !tm;
  if (walletFaucetCard) walletFaucetCard.hidden = !tm;
  if (walletTestModeToggle) walletTestModeToggle.checked = tm;

  // Show locked signet mint row in test mode, configurable row in prod mode
  const cashuMintTestRow = document.getElementById("cashuMintTestRow");
  const cashuMintProdRow = document.getElementById("cashuMintProdRow");
  const settingsMintTestRow = document.getElementById("settingsMintTestRow");
  const settingsMintProdRow = document.getElementById("settingsMintProdRow");
  if (cashuMintTestRow) cashuMintTestRow.hidden = !tm;
  if (cashuMintProdRow) cashuMintProdRow.hidden = tm;
  if (settingsMintTestRow) settingsMintTestRow.hidden = !tm;
  if (settingsMintProdRow) settingsMintProdRow.hidden = tm;

  // Update invoice input hints based on network
  if (swapCashuBtcAddr) {
    swapCashuBtcAddr.placeholder = tm ? "lntbs... (mutinynet/signet invoice)" : "lnbc... (mainnet invoice)";
  }
  if (cashuMeltInput) {
    cashuMeltInput.placeholder = tm ? "lntbs... (mutinynet/signet invoice)" : "lnbc... (mainnet invoice)";
  }
  const swapLnTestHint = document.getElementById("swapLnTestHint");
  const swapCashuTestHint = document.getElementById("swapCashuTestHint");
  if (swapLnTestHint) swapLnTestHint.hidden = !tm;
  if (swapCashuTestHint) swapCashuTestHint.hidden = !tm;

  // BTC → Lightning via Boltz: not available on testnet/mutinynet
  const sendBtcLnTestNotice = document.getElementById("sendBtcLnTestNotice");
  const sendBtcLnProdBlock = document.getElementById("sendBtcLnProdBlock");
  if (sendBtcLnTestNotice) sendBtcLnTestNotice.hidden = !tm;
  if (sendBtcLnProdBlock) sendBtcLnProdBlock.hidden = tm;
}

function setWalletStatusRow() {
  walletState.meshtasticConnected = latestMeshtasticConnected;
  const engineOk = walletState.walletConfigured;
  const meshOk = walletState.meshtasticConnected;
  walletEngineStatus.textContent = engineOk ? "Ready" : "No wallet";
  walletEngineStatus.className = engineOk ? "status-ok" : "status-err";
  walletMeshtasticStatus.textContent = meshOk ? "Connected" : "Disconnected";
  walletMeshtasticStatus.className = meshOk ? "status-ok" : "status-err";
  applyTestMode();
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
  if (swapBtcOnchainBalance) swapBtcOnchainBalance.textContent = formatSats(b.confirmed);
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
  const tm = walletState.testMode;
  const rows = [
    ["Type", "BIP84 HD Wallet (P2WPKH)"],
    ["Network", tm ? "Bitcoin Testnet (Mutinynet)" : "Bitcoin Mainnet"],
    ["Address", walletState.address ? walletState.address.slice(0, 20) + "..." : "—"],
    ["Path", tm ? "m/84'/1'/0'/0/0" : "m/84'/0'/0'/0/0"],
    ["Storage", tm ? "./data/test_wallet.json" : "./data/wallet.json"],
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
    walletState.testMode = Boolean(data.testMode);
    walletState.network = data.network || "mainnet";
    walletState.qrLoaded = false;
    applyWalletConfiguredState();
    applyTestMode();
    if (data.configured) loadWalletBalance();
  } catch { /* keep defaults */ }
  // Also load cashu state and swap list
  loadCashuState();
  fetchJson("/api/swap/list").then((data) => renderActiveSwaps(data || [])).catch(() => {});
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
  if (swapCashuAvailable) swapCashuAvailable.textContent = formatSats(cashuState.balance);
  // Pending (offline) balance row
  if (cashuPendingRow) {
    const hasPending = cashuState.pendingBalance > 0;
    cashuPendingRow.hidden = !hasPending;
    if (hasPending && cashuPendingValue) cashuPendingValue.textContent = cashuState.pendingBalance;
  }
  if (walletRefreshBalance) walletRefreshBalance.hidden = false;
  // Mint input sync
  if (cashuMintUrlInput && cashuState.mintUrl && !cashuMintUrlInput.value) {
    cashuMintUrlInput.value = cashuState.mintUrl;
  }
  if (settingsMintUrlInput && cashuState.mintUrl && !settingsMintUrlInput.value) {
    settingsMintUrlInput.value = cashuState.mintUrl;
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
    cashuState.pendingBalance = data.pendingBalance || 0;
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
    if (cashuState.pendingBalance > 0) startSwapPendingPoller();
  } catch { /* offline */ }
}

// Swap pending offline proofs at the mint and update UI
async function trySwapPending() {
  if (!cashuState.pendingBalance) return;
  try {
    const data = await fetchJson("/api/cashu/swap-pending", { method: "POST" });
    cashuState.balance = data.balance;
    cashuState.pendingBalance = data.pendingBalance || 0;
    applyCashuState();
    if (data.swapped > 0) {
      walletState.history.unshift({ id: `cashu-confirm-${Date.now()}`, direction: "Confirmed", peer: "Pending proofs", amount: data.swapped, unit: "sats", status: "Confirmed", timestamp: new Date().toLocaleString() });
      renderWalletHistory();
    }
  } catch { /* still offline */ }
}

// Auto-poll: try to confirm pending proofs every 30s when there are any
let _swapPendingInterval = null;
function startSwapPendingPoller() {
  if (_swapPendingInterval) return;
  _swapPendingInterval = setInterval(() => {
    if (cashuState.pendingBalance > 0) trySwapPending();
    else stopSwapPendingPoller();
  }, 30000);
}
function stopSwapPendingPoller() {
  if (_swapPendingInterval) { clearInterval(_swapPendingInterval); _swapPendingInterval = null; }
}

if (cashuSwapPendingBtn) {
  cashuSwapPendingBtn.addEventListener("click", async () => {
    cashuSwapPendingBtn.disabled = true;
    await trySwapPending();
    cashuSwapPendingBtn.disabled = false;
  });
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
    if (!panel) return;
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

function renderNodes(nodes = [], meshLinks = []) {
  latestNodes = Array.isArray(nodes) ? nodes.slice() : [];
  latestMeshLinks = Array.isArray(meshLinks) ? meshLinks.slice() : [];
  const onlineCount = latestNodes.filter((n) => n.online).length;
  const countEl = document.getElementById("nodesOnlineCount");
  if (countEl) countEl.innerHTML = onlineCount > 0
    ? `<span class="nodes-online-dot"></span>${onlineCount}`
    : "";
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
    const isOnline = !!payload.online;
    nodeModalDot.className = `node-dot${isOnline ? " node-dot--online" : " node-dot--offline"}`;
    nodeModalSubtitle.textContent = `${payload.role || "node"} · ${payload.observedPortnums?.length ? "live packets seen" : "snapshot only"}`;

    const raw = payload.raw || {};
    const lat = raw.position?.latitude ?? raw.latitude;
    const lon = raw.position?.longitude ?? raw.longitude;
    renderKv(nodeModalIdentity, [
      ["Name", payload.longName || payload.shortName || payload.userId || payload.id],
      ["ID", payload.userId || payload.id],
      ["Short", payload.shortName],
      ["Hardware", payload.hardware],
      ...(lat != null && lat !== 0 ? [["Lat", lat], ["Lon", lon]] : []),
    ]);
    renderKv(nodeModalStatus, [
      ["Online", isOnline ? "yes" : "no"],
      ["Live", payload.live ? "yes" : "no"],
      ["Hops", raw.hopsAway ?? "—"],
      ["SNR", formatMetric("SNR", raw.snr)],
    ]);

    const metrics = raw.deviceMetrics || payload.lastDecoded?.deviceMetrics || payload.lastDecoded?.localStats || {};
    renderKv(nodeModalMetrics, [
      ["Battery", formatMetric("Battery", metrics.batteryLevel)],
      ["Voltage", formatMetric("Voltage", metrics.voltage)],
      ["Uptime", formatMetric("Uptime", metrics.uptimeSeconds)],
      ["Ch util", formatMetric("Channel util", metrics.channelUtilization)],
      ["Air util", formatMetric("Air util tx", metrics.airUtilTx)],
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

    const peerId = payload.userId || payload.id;
    nodeModalChatButton.onclick = () => { closeNodeModal(); closeNodesMap(); openDmForNode(peerId); };
    nodeModalSendButton.onclick = () => { closeNodeModal(); closeNodesMap(); openCashuSendForNode(peerId); };

    // Location request button
    const hasPos = lat != null && lat !== 0;
    _setupLocateButton(nodeId, peerId, hasPos);

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

let _locateWatchNodeId = null;
let _locateWatchPeerId = null;
let _locateTimeout = null;

function _setupLocateButton(nodeId, peerId, hasPos) {
  clearTimeout(_locateTimeout);
  _locateWatchNodeId = null;
  _locateWatchPeerId = null;

  const btn = nodeModalPositionButton;
  const label = btn.querySelector("svg + *") || btn.lastChild;

  function setIdle() {
    btn.disabled = false;
    btn.classList.remove("node-modal-action-btn--pending", "node-modal-action-btn--success");
    btn.title = "Request current location from node";
    if (label) label.textContent = " Locate";
  }
  function setPending() {
    btn.disabled = true;
    btn.classList.add("node-modal-action-btn--pending");
    btn.classList.remove("node-modal-action-btn--success");
    if (label) label.textContent = " Locating...";
  }
  function setSuccess() {
    btn.disabled = false;
    btn.classList.remove("node-modal-action-btn--pending");
    btn.classList.add("node-modal-action-btn--success");
    if (label) label.textContent = " Show on map";
  }

  setIdle();

  btn.onclick = async () => {
    if (btn.classList.contains("node-modal-action-btn--success")) {
      // Open map and zoom to node
      closeNodeModal();
      openNodesMap();
      setTimeout(() => {
        const target = latestNodes.find((n) => (n.userId || n.id) === peerId);
        if (target?.latitude && _mapInstance) {
          _mapInstance.setView([target.latitude, target.longitude], 14, { animate: true });
        }
      }, 400);
      return;
    }
    setPending();
    _locateWatchNodeId = nodeId;
    _locateWatchPeerId = peerId;
    _locateTimeout = setTimeout(() => {
      if (_locateWatchNodeId === nodeId) { _locateWatchNodeId = null; setIdle(); }
    }, 30000);
    try {
      await fetchJson(`/api/node/${encodeURIComponent(peerId)}/request-position`, { method: "POST" });
    } catch {
      clearTimeout(_locateTimeout);
      _locateWatchNodeId = null;
      setIdle();
    }
  };
}

// ── Nodes Map ─────────────────────────────────────────────────────────────────
let _mapInstance = null;
let _mapMarkers = [];
let _mapCircles = [];
let _mapLines = [];
let _hoverLines = [];
let _mapShowRadius = false;
let _mapRadiusStyle = "fill"; // "fill" = current | "rings" = concentric bands
let _mapShowLinks = false;
let _mapColorByRole = false;
let _mapRoleFilter = new Set(); // empty = show all
let _mapHoverMaxHops = 3;
let _mapShowTooltips = true;

const _MAP_ROLE_INT = {
  "0": "CLIENT", "1": "CLIENT_MUTE", "2": "ROUTER", "3": "ROUTER_CLIENT",
  "4": "REPEATER", "5": "TRACKER", "6": "SENSOR", "7": "TAK",
  "8": "CLIENT_HIDDEN", "9": "LOST_AND_FOUND", "10": "TAK_TRACKER",
};
const _MAP_ROLE_CONFIG = {
  "CLIENT":         { color: "#4a9eff", label: "Client" },
  "CLIENT_MUTE":    { color: "#6a7a8a", label: "Client Mute" },
  "ROUTER":         { color: "#ff9043", label: "Router" },
  "ROUTER_CLIENT":  { color: "#b06aff", label: "Router Client" },
  "REPEATER":       { color: "#e8c030", label: "Repeater" },
  "TRACKER":        { color: "#00d4d4", label: "Tracker" },
  "SENSOR":         { color: "#26c6a6", label: "Sensor" },
  "TAK":            { color: "#ff6ab0", label: "TAK" },
  "CLIENT_HIDDEN":  { color: "#4a5566", label: "Hidden" },
  "LOST_AND_FOUND": { color: "#ff4444", label: "Lost & Found" },
  "TAK_TRACKER":    { color: "#ff8a65", label: "TAK Tracker" },
  "weather":        { color: "#26c6a6", label: "Weather" },
  "":               { color: "#8a9aaa", label: "Unknown" },
};

function _getNodeRoleKey(node) {
  const raw = String(node.meshtasticRole || "");
  if (_MAP_ROLE_INT[raw]) return _MAP_ROLE_INT[raw];
  const upper = raw.toUpperCase();
  if (_MAP_ROLE_CONFIG[upper]) return upper;
  if (node.role === "weather") return "weather";
  return "";
}

function _getRoleColor(node) {
  const key = _getNodeRoleKey(node);
  return (_MAP_ROLE_CONFIG[key] || _MAP_ROLE_CONFIG[""]).color;
}

function _snrToColor(snr) {
  if (snr == null) return "#4a9eff";
  if (snr >= 5)   return "#4caf50";
  if (snr >= 0)   return "#ffc107";
  return "#ff7043";
}

function _clearHoverLines() {
  _hoverLines.forEach((l) => l.remove());
  _hoverLines = [];
}

function openNodesMap() {
  nodesMapModal.classList.remove("hidden");
  nodesMapModal.setAttribute("aria-hidden", "false");

  if (!_mapInstance) {
    _mapInstance = L.map(nodesMapContainer, {
      center: [20, 0],
      zoom: 2,
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true,
      wheelPxPerZoomLevel: 120,
      wheelDebounceTime: 40,
      zoomSnap: 0.25,
      zoomDelta: 0.25,
    });
    _mapInstance.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank">Leaflet</a>');
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(_mapInstance);

    const toggleControl = L.control({ position: "bottomleft" });
    toggleControl.onAdd = function () {
      const div = L.DomUtil.create("div", "nodes-map-toggle-control");
      div.innerHTML =
        `<button id="mapToggleTooltips" class="nodes-map-toggle-btn nodes-map-toggle-btn--active" title="Node tooltips on hover">` +
          `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>` +
        `</button>` +
        `<button id="mapToggleRadius" class="nodes-map-toggle-btn" title="Signal radius">radius</button>` +
        `<button id="mapToggleLinks" class="nodes-map-toggle-btn" title="Connection lines">links</button>` +
        `<button id="mapToggleRole" class="nodes-map-toggle-btn" title="Color by role">role</button>` +
        `<div id="mapRadiusStyleControl" class="nodes-map-hops-control hidden" title="Radius style">` +
          `<span class="nodes-map-hops-label">style</span>` +
          `<button id="mapRadiusStyleBtn" class="nodes-map-style-btn nodes-map-style-btn--fill" title="Switch radius style"></button>` +
        `</div>` +
        `<div id="mapHopsControl" class="nodes-map-hops-control hidden" title="Hover hops depth">` +
          `<span class="nodes-map-hops-label">hops <span id="mapHopsVal">${_mapHoverMaxHops}</span></span>` +
          `<input id="mapHopsSlider" class="nodes-map-hops-slider" type="range" min="1" max="9" value="${_mapHoverMaxHops}">` +
        `</div>`;
      L.DomEvent.disableClickPropagation(div);
      return div;
    };
    toggleControl.addTo(_mapInstance);

    const legendControl = L.control({ position: "bottomright" });
    legendControl.onAdd = function () {
      const div = L.DomUtil.create("div", "nodes-map-legend");
      div.id = "mapLinksLegend";
      div.style.display = "none";
      div.innerHTML =
        `<div class="nodes-map-legend-row"><span class="nodes-map-legend-line" style="background:#4caf50"></span> Strong SNR (≥5 dB)</div>` +
        `<div class="nodes-map-legend-row"><span class="nodes-map-legend-line" style="background:#ffc107"></span> Medium SNR (0–5 dB)</div>` +
        `<div class="nodes-map-legend-row"><span class="nodes-map-legend-line" style="background:#ff7043"></span> Weak SNR (&lt;0 dB)</div>` +
        `<div class="nodes-map-legend-row"><span class="nodes-map-legend-line" style="background:#4a9eff"></span> No SNR data</div>` +
        `<div class="nodes-map-legend-divider"></div>` +
        `<div class="nodes-map-legend-row"><span class="nodes-map-legend-line--dashed" style="border-color:#4a9eff"></span> Direct (1 hop)</div>` +
        `<div class="nodes-map-legend-row"><span class="nodes-map-legend-line--dashed" style="border-color:#b06fff"></span> Relayed (2 hops)</div>`;
      L.DomEvent.disableClickPropagation(div);
      return div;
    };
    legendControl.addTo(_mapInstance);

    const roleLegendControl = L.control({ position: "topright" });
    roleLegendControl.onAdd = function () {
      const div = L.DomUtil.create("div", "nodes-map-legend nodes-map-role-legend");
      div.id = "mapRoleLegend";
      div.style.display = "none";
      L.DomEvent.disableClickPropagation(div);
      return div;
    };
    roleLegendControl.addTo(_mapInstance);

    document.getElementById("mapToggleTooltips").addEventListener("click", function () {
      _mapShowTooltips = !_mapShowTooltips;
      this.classList.toggle("nodes-map-toggle-btn--active", _mapShowTooltips);
      if (!_mapShowTooltips) {
        _mapMarkers.forEach(m => m.closePopup());
      }
    });
    document.getElementById("mapToggleRadius").addEventListener("click", function () {
      _mapShowRadius = !_mapShowRadius;
      this.classList.toggle("nodes-map-toggle-btn--active", _mapShowRadius);
      document.getElementById("mapRadiusStyleControl").classList.toggle("hidden", !_mapShowRadius);
      _renderMapNodes(false);
    });
    document.getElementById("mapRadiusStyleBtn").addEventListener("click", function () {
      _mapRadiusStyle = _mapRadiusStyle === "fill" ? "rings" : "fill";
      this.classList.toggle("nodes-map-style-btn--fill", _mapRadiusStyle === "fill");
      this.classList.toggle("nodes-map-style-btn--rings", _mapRadiusStyle === "rings");
      _renderMapNodes(false);
    });
    document.getElementById("mapToggleLinks").addEventListener("click", function () {
      _mapShowLinks = !_mapShowLinks;
      this.classList.toggle("nodes-map-toggle-btn--active", _mapShowLinks);
      const legend = document.getElementById("mapLinksLegend");
      if (legend) legend.style.display = _mapShowLinks ? "" : "none";
      document.getElementById("mapHopsControl").classList.toggle("hidden", !_mapShowLinks);
      _renderMapNodes(false);
    });
    document.getElementById("mapToggleRole").addEventListener("click", function () {
      _mapColorByRole = !_mapColorByRole;
      this.classList.toggle("nodes-map-toggle-btn--active", _mapColorByRole);
      const legend = document.getElementById("mapRoleLegend");
      if (legend) legend.style.display = _mapColorByRole ? "" : "none";
      if (!_mapColorByRole) _mapRoleFilter = new Set();
      _renderMapNodes(false);
    });
    document.getElementById("mapHopsSlider").addEventListener("input", function () {
      _mapHoverMaxHops = parseInt(this.value);
      document.getElementById("mapHopsVal").textContent = _mapHoverMaxHops;
    });
  }

  // Force Leaflet to recalculate size after the modal becomes visible
  requestAnimationFrame(() => {
    _mapInstance.invalidateSize();
    _renderMapNodes();
  });
}

function closeNodesMap() {
  nodesMapModal.classList.add("hidden");
  nodesMapModal.setAttribute("aria-hidden", "true");
  const panel = nodesMapModal.querySelector(".modal-panel--map");
  if (panel) panel.classList.remove("modal-panel--fullscreen");
  const icon = document.getElementById("nodesMapExpandIcon");
  if (icon) icon.innerHTML = '<path d="M1 1h4v1.5H2.5V4H1V1zm6 0h4v3h-1.5V2.5H7V1zM1 8h1.5v2.5H5V12H1V8zm8.5 2.5H7V12h4V8H9.5v2.5z"/>';
}

function _renderMapNodes(fitBounds = true) {
  if (!_mapInstance) return;

  _mapMarkers.forEach((m) => m.remove());
  _mapMarkers = [];
  _mapCircles.forEach((c) => c.remove());
  _mapCircles = [];
  _mapLines.forEach((l) => l.remove());
  _mapLines = [];

  // Lookup tables for estimated positioning
  const allByMeshNum = {};
  for (const n of latestNodes) {
    if (n.meshNum != null) allByMeshNum[String(n.meshNum)] = n;
  }
  const reverseLookup = {};
  for (const n of latestNodes) {
    if (!n.latitude || !n.longitude || n.latitude === 0 || n.longitude === 0) continue;
    for (const nb of (n.neighbors || [])) {
      const key = String(nb.nodeId || "");
      if (!key) continue;
      if (!reverseLookup[key]) reverseLookup[key] = [];
      reverseLookup[key].push({ anchorNode: n, snr: nb.snr ?? null });
    }
  }

  const withPos = latestNodes.filter(
    (n) => n.latitude != null && n.longitude != null && n.latitude !== 0 && n.longitude !== 0
  );

  _clearHoverLines();

  if (_mapShowRadius) _renderMapRadius(withPos);
  if (_mapShowLinks) _renderMapLinks(withPos);

  // Built after renderEntries is ready (closures read these by reference at call-time)
  let _renderedPos = null; // Map<meshNumStr, {lat,lon}>
  let _nodeEdges = null;   // Map<meshNumStr, [{to, snr}]>

  function _addMapMarker(lat, lon, node, estimated) {
    // Role filter — skip node if active filter doesn't include its role
    if (_mapColorByRole && _mapRoleFilter.size > 0) {
      if (!_mapRoleFilter.has(_getNodeRoleKey(node))) return;
    }

    const online = !!node.online;
    const shortName = node.shortName || (node.userId || node.id || "?").slice(0, 4);
    const label = node.longName || node.shortName || node.userId || node.id || "?";
    const status = online ? "online" : "offline";
    const battery = node.batteryLevel != null ? `${node.batteryLevel}%` : "—";
    const nodeId = node.userId || node.id;

    const dotClass = estimated
      ? (online ? "nodes-map-marker-online-est" : "nodes-map-marker-offline-est")
      : (online ? "nodes-map-marker-online" : "nodes-map-marker-offline");
    const wrapClass = estimated ? "nodes-map-marker-wrap nodes-map-marker-wrap--est" : "nodes-map-marker-wrap";
    const displayName = estimated ? `~${shortName}` : shortName;

    const roleColorStyle = _mapColorByRole
      ? ` style="background:${_getRoleColor(node)};border-color:rgba(255,255,255,0.25);box-shadow:0 0 6px ${_getRoleColor(node)}"`
      : "";

    const icon = L.divIcon({
      className: "",
      html: `<div class="${wrapClass}">` +
            `<div class="${dotClass}"${roleColorStyle}></div>` +
            `<span class="nodes-map-label">${displayName}</span>` +
            `</div>`,
      iconSize: [90, 14],
      iconAnchor: [5, 7],
      popupAnchor: [10, -6],
    });

    const popupHtml =
      `<div class="nodes-map-popup">` +
      `<div class="nodes-map-popup-name">${label}</div>` +
      `<div class="nodes-map-popup-row">${status} · battery: ${battery}</div>` +
      (estimated ? `<div class="nodes-map-popup-row nodes-map-popup-row--est">~ position estimated</div>` : "") +
      `</div>`;

    const marker = L.marker([lat, lon], { icon })
      .bindPopup(popupHtml, { closeButton: false, autoPan: false })
      .addTo(_mapInstance);

    const myMeshNum = String(node.meshNum ?? "");

    function drawHoverLinks() {
      _clearHoverLines();
      if (!_mapShowLinks || !myMeshNum || !_renderedPos || !_nodeEdges) return;

      // BFS from this node through all known edges, draw each hop with fading opacity
      const visited = new Set([myMeshNum]);
      // queue entries: { from, to, snr, hop }
      let queue = (_nodeEdges.get(myMeshNum) || []).map((e) => ({ from: myMeshNum, to: e.to, snr: e.snr, hop: 1 }));

      while (queue.length > 0) {
        const next = [];
        for (const { from, to, snr, hop } of queue) {
          if (visited.has(to) || hop > _mapHoverMaxHops) continue;
          visited.add(to);
          const fromPos = _renderedPos.get(from);
          const toPos = _renderedPos.get(to);
          if (fromPos && toPos) {
            const opacity = Math.max(0.15, 0.9 - (hop - 1) * 0.18);
            const weight = Math.max(1, 2.5 - (hop - 1) * 0.4);
            const color = hop === 1 ? _snrToColor(snr) : "#7ab8ff";
            const line = L.polyline(
              [[fromPos.lat, fromPos.lon], [toPos.lat, toPos.lon]],
              { color, weight, opacity, interactive: false }
            ).addTo(_mapInstance);
            const el = line.getElement();
            if (el) {
              el.style.setProperty("--link-opacity", String(opacity));
              el.classList.add("map-link-hover-flow");
            }
            _hoverLines.push(line);
          }
          // queue neighbors of `to` for next hop
          for (const e of (_nodeEdges.get(to) || [])) {
            if (!visited.has(e.to)) next.push({ from: to, to: e.to, snr: e.snr, hop: hop + 1 });
          }
        }
        queue = next;
      }
    }

    let _closeTimer = null;
    marker.on("mouseover", function () {
      clearTimeout(_closeTimer);
      if (_mapShowTooltips) this.openPopup();
      drawHoverLinks();
    });
    marker.on("mouseout", function () {
      const m = this;
      _closeTimer = setTimeout(() => { m.closePopup(); _clearHoverLines(); }, 250);
    });
    marker.on("popupopen", function () {
      const popupEl = this.getPopup().getElement();
      if (!popupEl) return;
      popupEl.addEventListener("mouseenter", () => clearTimeout(_closeTimer));
      popupEl.addEventListener("mouseleave", () => {
        _closeTimer = setTimeout(() => { marker.closePopup(); _clearHoverLines(); }, 250);
      });
    });
    marker.on("click", function () {
      openNodeModal(nodeId);
    });
    _mapMarkers.push(marker);
  }

  // Collect all render entries: GPS nodes + estimated nodes
  const renderEntries = [];
  withPos.forEach((node) => renderEntries.push({ lat: node.latitude, lon: node.longitude, node, estimated: false }));
  const noGpsNodes = latestNodes.filter(
    (n) => !(n.latitude != null && n.longitude != null && n.latitude !== 0 && n.longitude !== 0)
  );
  for (const node of noGpsNodes) {
    const est = _estimateNodePosition(node, withPos, allByMeshNum, reverseLookup);
    if (!est) continue;
    renderEntries.push({ lat: est.latitude, lon: est.longitude, node, estimated: true });
  }

  // Group by rounded position (~11m grid) and spread overlapping nodes in a small circle
  const SPREAD_R_M = 70; // spread radius in meters
  const posGroups = {};
  for (const entry of renderEntries) {
    const key = `${entry.lat.toFixed(4)}|${entry.lon.toFixed(4)}`;
    if (!posGroups[key]) posGroups[key] = [];
    posGroups[key].push(entry);
  }
  for (const group of Object.values(posGroups)) {
    if (group.length < 2) continue;
    const baseLat = group[0].lat;
    const baseLon = group[0].lon;
    const mPerDegLat = 111320;
    const mPerDegLon = 111320 * Math.cos(baseLat * Math.PI / 180);
    group.forEach((entry, i) => {
      const angle = (2 * Math.PI * i) / group.length;
      entry.lat = baseLat + (SPREAD_R_M / mPerDegLat) * Math.sin(angle);
      entry.lon = baseLon + (SPREAD_R_M / mPerDegLon) * Math.cos(angle);
    });
  }

  // Build position map and edge map for all rendered nodes (used by hover links)
  _renderedPos = new Map();
  for (const { lat, lon, node } of renderEntries) {
    if (node.meshNum != null) _renderedPos.set(String(node.meshNum), { lat, lon });
  }

  _nodeEdges = new Map();
  function _addEdge(fromNum, toNum, snr) {
    const k = String(fromNum);
    if (!_nodeEdges.has(k)) _nodeEdges.set(k, []);
    _nodeEdges.get(k).push({ to: String(toNum), snr: snr ?? null });
  }
  // NEIGHBORINFO edges (bidirectional)
  for (const { node } of renderEntries) {
    if (!node.meshNum) continue;
    for (const nb of (node.neighbors || [])) {
      _addEdge(node.meshNum, nb.nodeId, nb.snr);
      _addEdge(nb.nodeId, node.meshNum, nb.snr);
    }
  }
  // Observed relay edges (bidirectional)
  for (const link of latestMeshLinks) {
    if (link.from && link.via) {
      _addEdge(link.from, link.via, link.snr);
      _addEdge(link.via, link.from, link.snr);
    }
  }
  // hopsAway fallback edges
  const ourEntry = renderEntries.find((e) => e.node.hopsAway === 0);
  const hop1Entries = renderEntries.filter((e) => e.node.hopsAway === 1 && e.node.meshNum != null);
  if (ourEntry?.node.meshNum != null) {
    // hop1 → ourNode
    for (const { node } of hop1Entries) {
      _addEdge(node.meshNum, ourEntry.node.meshNum, node.snr);
      _addEdge(ourEntry.node.meshNum, node.meshNum, node.snr);
    }
    // hop2 → nearest hop1 + ourNode → that hop1 (same relay logic as _renderMapLinks)
    for (const { node } of renderEntries) {
      if (node.hopsAway !== 2 || !node.meshNum) continue;
      // find nearest hop1 by distance
      const myPos = _renderedPos.get(String(node.meshNum));
      if (!myPos) continue;
      let relay = hop1Entries[0];
      let minDist = Infinity;
      for (const h1e of hop1Entries) {
        const h1pos = _renderedPos.get(String(h1e.node.meshNum));
        if (!h1pos) continue;
        const d = (h1pos.lat - myPos.lat) ** 2 + (h1pos.lon - myPos.lon) ** 2;
        if (d < minDist) { minDist = d; relay = h1e; }
      }
      if (relay?.node.meshNum != null) {
        _addEdge(node.meshNum, relay.node.meshNum, node.snr);
        _addEdge(relay.node.meshNum, node.meshNum, node.snr);
      }
    }
    // any remaining estimated node with no edges → connect to ourNode as last resort
    for (const { node, estimated } of renderEntries) {
      if (!estimated || !node.meshNum) continue;
      if (!_nodeEdges.has(String(node.meshNum))) {
        _addEdge(node.meshNum, ourEntry.node.meshNum, node.snr ?? null);
        _addEdge(ourEntry.node.meshNum, node.meshNum, node.snr ?? null);
      }
    }
  }

  for (const { lat, lon, node, estimated } of renderEntries) {
    _addMapMarker(lat, lon, node, estimated);
  }

  // Update role legend
  const roleLegendEl = document.getElementById("mapRoleLegend");
  if (roleLegendEl && _mapColorByRole) {
    // Collect present roles across ALL nodes (not just rendered ones, so legend stays stable)
    const presentRoles = new Map(); // roleKey → label
    for (const node of latestNodes) {
      const key = _getNodeRoleKey(node);
      if (!presentRoles.has(key)) {
        const cfg = _MAP_ROLE_CONFIG[key] || _MAP_ROLE_CONFIG[""];
        presentRoles.set(key, cfg);
      }
    }
    roleLegendEl.innerHTML = '<div class="nodes-map-legend-title">ROLE</div>';
    for (const [key, cfg] of presentRoles) {
      const isActive = _mapRoleFilter.size === 0 || _mapRoleFilter.has(key);
      const item = document.createElement("div");
      item.className = `nodes-map-legend-row nodes-map-role-item${isActive ? "" : " nodes-map-role-item--dim"}`;
      item.dataset.roleKey = key;
      item.innerHTML =
        `<span class="nodes-map-role-dot" style="background:${cfg.color}"></span>` +
        `<span>${cfg.label}</span>`;
      item.addEventListener("click", () => {
        if (_mapRoleFilter.size === 0) {
          // First click: show ONLY this role
          _mapRoleFilter = new Set([key]);
        } else if (_mapRoleFilter.has(key)) {
          _mapRoleFilter.delete(key);
          // If all gone → show all
          if (_mapRoleFilter.size === 0) _mapRoleFilter = new Set();
        } else {
          _mapRoleFilter.add(key);
        }
        _renderMapNodes(false);
      });
      roleLegendEl.appendChild(item);
    }
  }

  if (fitBounds && withPos.length > 0) {
    const bounds = L.latLngBounds(withPos.map((n) => [n.latitude, n.longitude]));
    _mapInstance.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }
}

function _snrToRadius(snr) {
  if (snr == null) return 8000;
  if (snr > 10) return 15000;
  if (snr > 0)  return 10000;
  if (snr > -10) return 6000;
  return 3000;
}

function _renderMapRadius(withPos) {
  if (_mapRadiusStyle === "rings") {
    _renderMapRadiusRings(withPos);
  } else {
    _renderMapRadiusFill(withPos);
  }
}

function _renderMapRadiusFill(withPos) {
  for (const node of withPos) {
    const radius = _snrToRadius(node.snr);
    const online = !!node.online;
    const circle = L.circle([node.latitude, node.longitude], {
      radius,
      color: online ? "#4caf50" : "#8b4a4a",
      weight: 1,
      opacity: 0.45,
      fillOpacity: 0.06,
      interactive: false,
    }).addTo(_mapInstance);
    _mapCircles.push(circle);
  }
}

function _renderMapRadiusRings(withPos) {
  // Concentric signal-zone bands: strong (inner) → medium → weak (outer)
  const BANDS = [
    { scale: 1.0, color: "#ff7043", fillOpacity: 0.04, weight: 1, dashArray: "6 5", opacity: 0.55 }, // weak/outer
    { scale: 0.6, color: "#ffc107", fillOpacity: 0.05, weight: 1, dashArray: null,  opacity: 0.55 }, // medium
    { scale: 0.28, color: "#4caf50", fillOpacity: 0.10, weight: 1.5, dashArray: null, opacity: 0.75 }, // strong/inner
  ];
  const OFFLINE_BANDS = [
    { scale: 1.0, color: "#6a3a3a", fillOpacity: 0.03, weight: 1, dashArray: "6 5", opacity: 0.35 },
    { scale: 0.6, color: "#7a4a2a", fillOpacity: 0.03, weight: 1, dashArray: null,  opacity: 0.35 },
    { scale: 0.28, color: "#5a4a2a", fillOpacity: 0.06, weight: 1, dashArray: null, opacity: 0.45 },
  ];

  for (const node of withPos) {
    const baseRadius = _snrToRadius(node.snr);
    const online = !!node.online;
    const bands = online ? BANDS : OFFLINE_BANDS;

    for (const band of bands) {
      const circle = L.circle([node.latitude, node.longitude], {
        radius: baseRadius * band.scale,
        color: band.color,
        weight: band.weight,
        opacity: band.opacity,
        fillColor: band.color,
        fillOpacity: band.fillOpacity,
        dashArray: band.dashArray || undefined,
        interactive: false,
      }).addTo(_mapInstance);
      _mapCircles.push(circle);
    }
  }
}

function _haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function _deterministicAngle(str) {
  let h = 0;
  for (let i = 0; i < (str || "").length; i++)
    h = (Math.imul(31, h) + (str || "").charCodeAt(i)) | 0;
  return ((h >>> 0) % 360) * (Math.PI / 180);
}

function _estimateNodePosition(node, withPos, allByMeshNum, reverseLookup) {
  // ourNode (hopsAway=0) → place at centroid of all GPS nodes
  if (node.hopsAway === 0) {
    if (withPos.length === 0) return null;
    const lat = withPos.reduce((s, n) => s + n.latitude, 0) / withPos.length;
    const lon = withPos.reduce((s, n) => s + n.longitude, 0) / withPos.length;
    return { latitude: lat, longitude: lon };
  }

  const myKey = String(node.meshNum ?? "");
  const angle = _deterministicAngle(node.userId || node.id || myKey || "x");
  const seenKey = new Set();
  const anchors = [];

  function addAnchor(lat, lon, snr) {
    const k = `${lat.toFixed(5)}|${lon.toFixed(5)}`;
    if (seenKey.has(k)) return;
    seenKey.add(k);
    anchors.push({ lat, lon, snr: snr ?? null });
  }

  // Forward: this node's own neighbors that have GPS
  for (const nb of (node.neighbors || [])) {
    const anchor = allByMeshNum[String(nb.nodeId || "")];
    if (!anchor || !anchor.latitude || !anchor.longitude || anchor.latitude === 0 || anchor.longitude === 0) continue;
    addAnchor(anchor.latitude, anchor.longitude, nb.snr ?? null);
  }

  // Reverse: GPS nodes that list this node in their neighbors
  for (const entry of (myKey ? (reverseLookup[myKey] || []) : [])) {
    addAnchor(entry.anchorNode.latitude, entry.anchorNode.longitude, entry.snr);
  }

  // Weighted average of anchor-based estimates
  if (anchors.length > 0) {
    let totalWeight = 0, sumLat = 0, sumLon = 0;
    for (const a of anchors) {
      const distM = _snrToRadius(a.snr);
      const dLat = (distM / 111320) * Math.sin(angle);
      const dLon = (distM / (111320 * Math.cos(a.lat * Math.PI / 180))) * Math.cos(angle);
      const w = Math.max(1, (a.snr ?? -10) + 15);
      sumLat += (a.lat + dLat) * w;
      sumLon += (a.lon + dLon) * w;
      totalWeight += w;
    }
    return { latitude: sumLat / totalWeight, longitude: sumLon / totalWeight };
  }

  // hopsAway fallback: use ourNode as anchor
  if (node.hopsAway != null && node.hopsAway > 0) {
    const ourNode = withPos.find((n) => n.hopsAway === 0);
    if (!ourNode) return null;
    const syntheticSnr = 10 - node.hopsAway * 8;
    const distM = _snrToRadius(syntheticSnr);
    const dLat = (distM / 111320) * Math.sin(angle);
    const dLon = (distM / (111320 * Math.cos(ourNode.latitude * Math.PI / 180))) * Math.cos(angle);
    return { latitude: ourNode.latitude + dLat, longitude: ourNode.longitude + dLon };
  }

  return null;
}

// Link color by SNR quality:
//   green  (#4caf50) — strong  (≥ 5 dB)
//   yellow (#ffc107) — medium  (0..5 dB)
//   orange (#ff7043) — weak    (< 0 dB)
//   blue   (#4a9eff) — no SNR data
// Fallback (hopsAway only, dashed):
//   blue dashed  — direct (1 hop, estimated)
//   purple dashed — relayed (2 hops, estimated)
function _renderMapLinks(withPos) {
  const drawn = new Set();

  function drawLine(lat1, lon1, lat2, lon2, snr, color, dashed = false) {
    const key = [lat1, lon1, lat2, lon2].map((v) => v.toFixed(6)).join("|");
    const keyRev = [lat2, lon2, lat1, lon1].map((v) => v.toFixed(6)).join("|");
    if (drawn.has(key) || drawn.has(keyRev)) return;
    drawn.add(key);
    const opacity = snr == null ? 0.5 : Math.max(0.3, Math.min(0.9, 0.45 + snr / 20));
    const opts = { color, weight: dashed ? 1.5 : 2, opacity, interactive: false };
    if (dashed) opts.dashArray = "6 5";
    const line = L.polyline([[lat1, lon1], [lat2, lon2]], opts).addTo(_mapInstance);
    _mapLines.push(line);
  }

  // Build meshNum lookup
  const byMeshNum = {};
  for (const node of withPos) {
    if (node.meshNum != null) byMeshNum[String(node.meshNum)] = node;
  }

  // — Real topology from NEIGHBORINFO_APP (solid, colored by SNR) —
  const hasNeighbors = new Set();
  for (const node of withPos) {
    if (!node.neighbors || node.neighbors.length === 0) continue;
    if (node.meshNum != null) hasNeighbors.add(String(node.meshNum));
    for (const nb of node.neighbors) {
      const nbNode = byMeshNum[String(nb.nodeId || "")];
      if (!nbNode) continue;
      const snr = nb.snr ?? null;
      drawLine(node.latitude, node.longitude, nbNode.latitude, nbNode.longitude, snr, _snrToColor(snr));
    }
  }

  // — Observed relay links from packet relayNode field (solid orange, fw 2.3+) —
  for (const link of latestMeshLinks) {
    const fromNode = byMeshNum[String(link.from || "")];
    const viaNode = byMeshNum[String(link.via || "")];
    if (!fromNode || !viaNode) continue;
    const snr = link.snr ?? null;
    // sender ↔ relay: draw both legs if via has position
    drawLine(fromNode.latitude, fromNode.longitude, viaNode.latitude, viaNode.longitude, snr, _snrToColor(snr));
    if (fromNode.meshNum != null) hasNeighbors.add(String(fromNode.meshNum));
    if (viaNode.meshNum != null) hasNeighbors.add(String(viaNode.meshNum));
  }

  // — hopsAway fallback (dashed) for nodes without NEIGHBORINFO data —
  const ourNode = withPos.find((n) => n.hopsAway === 0);
  if (!ourNode) return;

  const hop1 = withPos.filter((n) => n.hopsAway === 1 && !hasNeighbors.has(String(n.meshNum ?? "")));
  const hop1All = withPos.filter((n) => n.hopsAway === 1);
  const hop2 = withPos.filter((n) => n.hopsAway === 2 && !hasNeighbors.has(String(n.meshNum ?? "")));

  // Direct nodes (1 hop) — dashed blue
  for (const node of hop1) {
    drawLine(ourNode.latitude, ourNode.longitude, node.latitude, node.longitude, node.snr ?? null, "#4a9eff", true);
  }

  // Relayed nodes (2 hops) — connect to geographically nearest hop1, dashed purple
  for (const node of hop2) {
    if (hop1All.length === 0) continue;
    let relay = hop1All[0];
    let minDist = Infinity;
    for (const h1 of hop1All) {
      const d = _haversineKm(h1.latitude, h1.longitude, node.latitude, node.longitude);
      if (d < minDist) { minDist = d; relay = h1; }
    }
    // relay → ourNode link (may already be drawn above)
    drawLine(ourNode.latitude, ourNode.longitude, relay.latitude, relay.longitude, relay.snr ?? null, "#4a9eff", true);
    // relay → hop2 node
    drawLine(relay.latitude, relay.longitude, node.latitude, node.longitude, node.snr ?? null, "#b06fff", true);
  }
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

  deviceStatus.style.cursor = connected ? "pointer" : "";
  latestMeshtasticConnected = connected;
  if (typeof status.meshAiReply === "boolean") {
    applyMeshAiReply(status.meshAiReply);
  }
  if (typeof status.walletTestMode === "boolean") {
    walletState.testMode = status.walletTestMode;
  }
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
    renderChatPeerList();
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
    renderNodes(payload.nodes || [], payload.meshLinks || []);
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
    // Clear unread for currently selected peer when entering DM mode
    if (chatState.selectedPeer) {
      unreadPeers.delete(chatState.selectedPeer);
      renderChatPeerList();
    }
    updateDmTabUnreadGlow();
    refreshActiveDmChat();
  });
}

if (chatPeerSelect) {
  chatPeerSelect.addEventListener("change", () => {
    setChatPeerSelection(chatPeerSelect.value, { syncWallet: true, persist: true });
    if (chatState.mode === CHAT_MODE_DM) {
      refreshActiveDmChat();
    }
  });
}

if (chatPeerTrigger) {
  chatPeerTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const listEl = document.getElementById("chatPeerList");
    if (listEl) listEl.hidden = !listEl.hidden;
  });
}

if (chatPeerCashuButton) {
  chatPeerCashuButton.addEventListener("click", () => {
    if (!chatState.selectedPeer) {
      return;
    }
    openCashuSendForNode(chatState.selectedPeer);
  });
}

chatPeerFilterButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const filterName = button.dataset.chatPeerFilter;
    if (!filterName || !(filterName in chatState.peerFilters)) {
      return;
    }
    chatState.peerFilters[filterName] = !chatState.peerFilters[filterName];
    renderChatPeerFilters();
    renderChatPeerList();
  });
});

document.addEventListener("click", (e) => {
  if (!chatPeerDropdown?.contains(e.target)) {
    const listEl = document.getElementById("chatPeerList");
    if (listEl) listEl.hidden = true;
  }
});

renderChatPeerFilters();

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

// ── Send tab: Cashu / Bitcoin switcher ────────────────────────────────────────
async function loadSendBtcPanel() {
  if (!walletState.walletConfigured) {
    if (sendBtcNoWallet) sendBtcNoWallet.hidden = false;
    if (sendBtcContent) sendBtcContent.hidden = true;
    return;
  }
  if (sendBtcNoWallet) sendBtcNoWallet.hidden = true;
  if (sendBtcContent) sendBtcContent.hidden = false;
  if (sendBtcBalance) sendBtcBalance.textContent = "Loading...";
  try {
    const bal = await fetchJson("/api/wallet/balance");
    if (sendBtcBalance) {
      sendBtcBalance.textContent = formatSats(bal.confirmed) +
        (bal.unconfirmed ? ` (+${formatSats(bal.unconfirmed)} unconfirmed)` : "");
    }
  } catch { if (sendBtcBalance) sendBtcBalance.textContent = "—"; }
  try {
    const fees = await fetchJson("/api/wallet/fees");
    if (sendBtcFeeRate && !sendBtcFeeRate.value) sendBtcFeeRate.value = fees.halfHourFee || 5;
  } catch { /* ignore */ }
}

if (sendBtcTab) {
  sendBtcTab.addEventListener("click", () => {
    sendBtcTab.classList.add("is-active");
    if (sendCashuTab) sendCashuTab.classList.remove("is-active");
    if (sendBtcPanel) sendBtcPanel.hidden = false;
    if (sendCashuPanel) sendCashuPanel.hidden = true;
    loadSendBtcPanel();
  });
}
if (sendCashuTab) {
  sendCashuTab.addEventListener("click", () => {
    sendCashuTab.classList.add("is-active");
    if (sendBtcTab) sendBtcTab.classList.remove("is-active");
    if (sendCashuPanel) sendCashuPanel.hidden = false;
    if (sendBtcPanel) sendBtcPanel.hidden = true;
  });
}

if (sendBtcForm) {
  sendBtcForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const toAddress = sendBtcAddress ? sendBtcAddress.value.trim() : "";
    const amountSats = Number(sendBtcAmount ? sendBtcAmount.value : 0);
    const feeRate = Number(sendBtcFeeRate ? sendBtcFeeRate.value : 5) || 5;
    if (!toAddress) { if (sendBtcStatus) sendBtcStatus.textContent = "Enter a Bitcoin address"; return; }
    if (!amountSats || amountSats < 546) { if (sendBtcStatus) sendBtcStatus.textContent = "Minimum amount is 546 sats"; return; }
    if (sendBtcStatus) sendBtcStatus.textContent = "Broadcasting...";
    try {
      const data = await fetchJson("/api/wallet/send", {
        method: "POST",
        body: JSON.stringify({ toAddress, amountSats, feeRate }),
      });
      const explorer = walletState.testMode ? "https://mutinynet.com/tx/" : "https://mempool.space/tx/";
      if (sendBtcStatus) sendBtcStatus.innerHTML = `Sent! <a href="${explorer}${data.txid}" target="_blank" rel="noopener">${data.txid.slice(0, 12)}…</a> · fee: ${formatSats(data.fee)}`;
      if (sendBtcAddress) sendBtcAddress.value = "";
      if (sendBtcAmount) sendBtcAmount.value = "";
      setTimeout(loadSendBtcPanel, 2000);
    } catch (err) { if (sendBtcStatus) sendBtcStatus.textContent = err.message; }
  });
}

if (sendBtcLnForm) {
  sendBtcLnForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const invoice = sendBtcLnInvoice ? sendBtcLnInvoice.value.trim() : "";
    if (!invoice) { if (sendBtcLnStatus) sendBtcLnStatus.textContent = "Enter a Lightning invoice"; return; }
    const tm = walletState.testMode;
    const lower = invoice.toLowerCase();
    if (tm && !lower.startsWith("lntbs")) { if (sendBtcLnStatus) sendBtcLnStatus.textContent = "Test mode: use lntbs… (signet) invoice"; return; }
    if (!tm && !lower.startsWith("lnbc")) { if (sendBtcLnStatus) sendBtcLnStatus.textContent = "Use lnbc… (mainnet) invoice"; return; }
    if (sendBtcLnStatus) sendBtcLnStatus.textContent = "Creating swap...";
    try {
      const data = await fetchJson("/api/wallet/pay-lightning", {
        method: "POST",
        body: JSON.stringify({ invoice }),
      });
      if (sendBtcLnStatus) sendBtcLnStatus.textContent = `Swap created · ${formatSats(data.expectedAmount)} BTC sent · waiting for Lightning payment…`;
      if (sendBtcLnInvoice) sendBtcLnInvoice.value = "";
      setTimeout(loadSendBtcPanel, 2000);
    } catch (err) { if (sendBtcLnStatus) sendBtcLnStatus.textContent = err.message; }
  });
}
// ── End Send BTC ──────────────────────────────────────────────────────────────

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
  const submitBtn = walletSendForm.querySelector("button[type=submit]");
  if (!amount || amount <= 0) { walletSendStatus.textContent = "Enter amount."; return; }
  walletSendStatus.textContent = "Preparing token...";
  if (submitBtn) submitBtn.disabled = true;
  try {
    const data = await fetchJson("/api/cashu/send", {
      method: "POST",
      body: JSON.stringify({ amount, peer: recipient || "unknown", memo }),
    });
    cashuState.balance = cashuState.balance - amount;
    applyCashuState();
    walletSendStatus.textContent = `Token created: ${amount} sats`;
    cashuSendTokenOutput.textContent = data.token;
    cashuSendTokenBlock.hidden = false;
    // Send via Meshtastic DM if recipient set
    if (recipient && transport === "Meshtastic DM") {
      try {
        await fetchJson("/api/mesh/send", {
          method: "POST",
          body: JSON.stringify({ destinationId: recipient, text: `[${amount} sats] ${data.token}` }),
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
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
});

cashuCopyTokenButton.addEventListener("click", async () => {
  try { await copyText(cashuSendTokenOutput.textContent); cashuCopyTokenButton.textContent = "Copied!"; setTimeout(() => { cashuCopyTokenButton.textContent = "Copy"; }, 1200); } catch { /* silent */ }
});

cashuMeltForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const pr = cashuMeltInput.value.trim();
  const submitBtn = cashuMeltForm.querySelector("button[type=submit]");
  if (!pr) { cashuMeltStatus.textContent = "Paste a Lightning invoice."; return; }
  const prLower = pr.toLowerCase();
  if (walletState.testMode && prLower.startsWith("lnbc")) {
    cashuMeltStatus.textContent = "Test mode uses mutinynet (signet). Use a signet invoice (starts with lntbs).";
    return;
  }
  if (!walletState.testMode && prLower.startsWith("lntbs")) {
    cashuMeltStatus.textContent = "This looks like a signet invoice. For mainnet, use an invoice starting with lnbc.";
    return;
  }
  cashuMeltStatus.textContent = "Paying...";
  if (submitBtn) submitBtn.disabled = true;
  try {
    const data = await fetchJson("/api/cashu/melt", { method: "POST", body: JSON.stringify({ pr }) });
    cashuState.balance = data.balance;
    cashuMeltStatus.textContent = data.isPaid ? `Paid ${data.amount} sats (fee: ${data.fee})` : "Payment failed";
    cashuMeltInput.value = "";
    applyCashuState();
  } catch (e) {
    cashuMeltStatus.textContent = e.message;
  } finally {
    if (submitBtn) submitBtn.disabled = false;
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
    cashuReceiveStatus.textContent = data.unverified
      ? `Accepted ${data.amount} sats offline (unverified — redeem online to confirm)`
      : `Received ${data.amount} sats! Balance: ${data.balance} sats`;
    cashuReceiveInput.value = "";
    applyCashuState();
    const recvStatus = data.unverified ? "Unverified (offline)" : "Confirmed";
    walletState.history.unshift({ id: `cashu-recv-${Date.now()}`, direction: "Received", peer: "Cashu token", amount: data.amount, unit: "sats", status: recvStatus, timestamp: new Date().toLocaleString() });
    renderWalletHistory();
  } catch (e) {
    cashuReceiveStatus.textContent = e.message;
  }
});

// ─── End Cashu event handlers ─────────────────────────────────────────────────

// ─── Swap panel handlers ───────────────────────────────────────────────────────

function renderActiveSwaps(swaps) {
  if (!activeSwapsCard || !activeSwapsList) return;
  const active = (swaps || []).filter((s) => !["done", "failed", "expired"].includes(s.status));
  activeSwapsCard.hidden = active.length === 0;
  if (active.length === 0) return;
  activeSwapsList.innerHTML = "";
  active.forEach((s) => {
    const el = document.createElement("div");
    el.className = "wallet-pending-item";
    const dir = s.type === "btc-to-cashu" ? "BTC → Cashu" : "Cashu → BTC";
    const amt = s.amount ? `${s.amount} sats` : "";
    el.innerHTML = `<span class="wallet-pending-label">${dir} ${amt}</span><span class="wallet-pending-status">${s.status}</span>`;
    activeSwapsList.appendChild(el);
  });
}

if (clearSwapsButton) {
  clearSwapsButton.addEventListener("click", async () => {
    try {
      await fetchJson("/api/swap/clear", { method: "POST" });
      renderActiveSwaps([]);
    } catch { /* ignore */ }
  });
}

// Settings mint button — same API as Fund panel
if (settingsSetMintButton) {
  settingsSetMintButton.addEventListener("click", async () => {
    const url = (settingsMintUrlInput?.value || "").trim();
    if (!url) { if (settingsMintStatus) settingsMintStatus.textContent = "Enter a mint URL."; return; }
    settingsSetMintButton.disabled = true;
    if (settingsMintStatus) settingsMintStatus.textContent = "Connecting to mint...";
    try {
      const data = await fetchJson("/api/cashu/mint", { method: "POST", body: JSON.stringify({ mintUrl: url }) });
      cashuState.configured = true;
      cashuState.mintUrl = data.mintUrl;
      if (settingsMintStatus) settingsMintStatus.textContent = "Connected!";
      // keep Fund panel input in sync
      if (cashuMintUrlInput) cashuMintUrlInput.value = url;
      applyCashuState();
    } catch (e) {
      if (settingsMintStatus) settingsMintStatus.textContent = e.message;
    } finally {
      settingsSetMintButton.disabled = false;
    }
  });
}

// ── Swap panel ────────────────────────────────────────────────────────────────

function clearSwapLnPoll() {
  if (swapLnPollInterval !== null) {
    clearInterval(swapLnPollInterval);
    swapLnPollInterval = null;
  }
}

function startSwapLnPoll(hash) {
  clearSwapLnPoll();
  let attempts = 0;
  const MAX_ATTEMPTS = 120; // 120 × 5s = 10 min
  swapLnPollInterval = setInterval(async () => {
    attempts++;
    if (attempts > MAX_ATTEMPTS) {
      clearSwapLnPoll();
      if (swapLnCheckStatus) swapLnCheckStatus.textContent = "Invoice expired after 10 min. Create a new one.";
      if (swapLnBlock) swapLnBlock.hidden = true;
      return;
    }
    try {
      const data = await fetchJson("/api/cashu/check", { method: "POST", body: JSON.stringify({ hash }) });
      clearSwapLnPoll();
      cashuState.balance = data.balance;
      cashuState.currentInvoiceHash = null;
      cashuState.pendingInvoices = (cashuState.pendingInvoices || []).filter((i) => i.hash !== hash);
      if (swapLnCheckStatus) swapLnCheckStatus.textContent = `Paid! +${data.amount} sats — balance updated.`;
      if (swapLnBlock) swapLnBlock.hidden = true;
      if (swapLnAmount) swapLnAmount.value = "";
      if (swapLnStatus) swapLnStatus.textContent = "";
      applyCashuState();
    } catch {
      // 402 = not paid yet, keep polling silently
    }
  }, 5000);
}

function showSwapLnInvoice(pr, qr, hash, amount) {
  cashuState.currentInvoiceHash = hash;
  cashuState.pendingInvoices = cashuState.pendingInvoices || [];
  if (!cashuState.pendingInvoices.find((i) => i.hash === hash)) {
    cashuState.pendingInvoices.push({ hash, amount, pr, createdAt: new Date().toISOString() });
  }
  if (swapLnPr) swapLnPr.value = pr;
  if (swapLnQr && qr) swapLnQr.src = qr;
  if (swapLnBlock) swapLnBlock.hidden = false;
  if (swapLnCheckStatus) swapLnCheckStatus.textContent = "Waiting for payment... (auto-checking every 5s)";
  startSwapLnPoll(hash);
}

if (swapLnInvoiceButton) {
  swapLnInvoiceButton.addEventListener("click", async () => {
    const amount = Number(swapLnAmount?.value);
    if (!amount || amount <= 0) { if (swapLnStatus) swapLnStatus.textContent = "Enter an amount."; return; }
    if (!cashuState.configured) { if (swapLnStatus) swapLnStatus.textContent = "Set a Cashu mint in Settings first."; return; }
    swapLnInvoiceButton.disabled = true;
    if (swapLnStatus) swapLnStatus.textContent = "Creating invoice...";
    try {
      const data = await fetchJson("/api/cashu/invoice", { method: "POST", body: JSON.stringify({ amount }) });
      if (swapLnStatus) swapLnStatus.textContent = walletState.testMode
        ? `Signet invoice for ${amount} sats — pay at faucet.mutinynet.com (Lightning tab)`
        : `Invoice for ${amount} sats — pay with any Lightning wallet`;
      showSwapLnInvoice(data.pr, data.qr, data.hash, amount);
    } catch (e) {
      if (swapLnStatus) swapLnStatus.textContent = e.message;
    } finally {
      swapLnInvoiceButton.disabled = false;
    }
  });
}

if (swapLnCopyBtn) {
  swapLnCopyBtn.addEventListener("click", async () => {
    try { await copyText(swapLnPr?.value || ""); if (swapLnStatus) swapLnStatus.textContent = "Copied!"; } catch { /* silent */ }
  });
}

if (swapLnCheckButton) {
  swapLnCheckButton.addEventListener("click", async () => {
    const hash = cashuState.currentInvoiceHash;
    if (!hash) { if (swapLnCheckStatus) swapLnCheckStatus.textContent = "No invoice to check."; return; }
    swapLnCheckButton.disabled = true;
    if (swapLnCheckStatus) swapLnCheckStatus.textContent = "Checking...";
    try {
      const data = await fetchJson("/api/cashu/check", { method: "POST", body: JSON.stringify({ hash }) });
      clearSwapLnPoll();
      cashuState.balance = data.balance;
      cashuState.currentInvoiceHash = null;
      cashuState.pendingInvoices = (cashuState.pendingInvoices || []).filter((i) => i.hash !== hash);
      if (swapLnCheckStatus) swapLnCheckStatus.textContent = `Paid! +${data.amount} sats`;
      if (swapLnBlock) swapLnBlock.hidden = true;
      if (swapLnAmount) swapLnAmount.value = "";
      if (swapLnStatus) swapLnStatus.textContent = "";
      applyCashuState();
    } catch (e) {
      if (swapLnCheckStatus) swapLnCheckStatus.textContent = `Not paid yet: ${e.message}`;
    } finally {
      swapLnCheckButton.disabled = false;
    }
  });
}

// Hidden stub form — no-op
if (swapBtcToCashuForm) {
  swapBtcToCashuForm.addEventListener("submit", (e) => e.preventDefault());
}

// Cashu → Lightning: show amount preview when invoice pasted
if (swapCashuBtcAddr) {
  swapCashuBtcAddr.addEventListener("input", () => {
    const inv = (swapCashuBtcAddr.value || "").trim().toLowerCase();
    const previewRow = document.getElementById("swapCashuAmountPreviewRow");
    const previewEl = document.getElementById("swapCashuAmountPreview");
    if (inv.length > 50 && inv.startsWith("ln")) {
      if (previewRow) previewRow.style.display = "";
      if (previewEl) previewEl.textContent = "Amount will be read from invoice by server";
    } else {
      if (previewRow) previewRow.style.display = "none";
    }
  });
}

// Cashu → Lightning: pay invoice (no manual amount)
if (swapCashuToBtcForm) {
  swapCashuToBtcForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const address = (swapCashuBtcAddr?.value || "").trim();
    if (!address) { if (swapCashuStatus) swapCashuStatus.textContent = "Paste a Lightning invoice."; return; }
    if (!cashuState.configured) { if (swapCashuStatus) swapCashuStatus.textContent = "Set a Cashu mint in Settings first."; return; }
    const addrLower = address.toLowerCase();
    if (walletState.testMode && addrLower.startsWith("lnbc")) {
      if (swapCashuStatus) swapCashuStatus.textContent = "Test mode uses mutinynet. Paste a signet invoice (starts with lntbs).";
      return;
    }
    if (!walletState.testMode && addrLower.startsWith("lntbs")) {
      if (swapCashuStatus) swapCashuStatus.textContent = "This looks like a signet invoice (lntbs). For mainnet, use an invoice starting with lnbc.";
      return;
    }
    const btn = swapCashuToBtcForm.querySelector("button[type=submit]");
    if (btn) btn.disabled = true;
    if (swapCashuStatus) swapCashuStatus.textContent = "Paying Lightning invoice...";
    try {
      const data = await fetchJson("/api/swap/cashu-to-btc", { method: "POST", body: JSON.stringify({ address }) });
      cashuState.balance = data.balance ?? cashuState.balance;
      applyCashuState();
      if (swapCashuStatus) swapCashuStatus.textContent = data.isPaid
        ? `Paid ${data.amount} sats over Lightning.`
        : (data.statusLabel || "Lightning payment started.");
      if (swapCashuBtcAddr) swapCashuBtcAddr.value = "";
      const previewRow = document.getElementById("swapCashuAmountPreviewRow");
      if (previewRow) previewRow.style.display = "none";
    } catch (e) {
      if (swapCashuStatus) swapCashuStatus.textContent = e.message;
    } finally {
      if (btn) btn.disabled = false;
    }
  });
}

// Receive Cashu token (Swap panel)
if (swapCashuReceiveForm) {
  swapCashuReceiveForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const token = (swapCashuReceiveInput?.value || "").trim();
    if (!token) { if (swapCashuReceiveStatus) swapCashuReceiveStatus.textContent = "Paste a cashuA... token."; return; }
    if (swapCashuReceiveStatus) swapCashuReceiveStatus.textContent = "Redeeming...";
    try {
      const data = await fetchJson("/api/cashu/receive", { method: "POST", body: JSON.stringify({ token }) });
      cashuState.balance = data.balance;
      if (swapCashuReceiveStatus) swapCashuReceiveStatus.textContent = data.unverified
        ? `Accepted ${data.amount} sats offline (unverified — redeem online to confirm)`
        : `Received ${data.amount} sats! Balance: ${data.balance} sats`;
      if (swapCashuReceiveInput) swapCashuReceiveInput.value = "";
      applyCashuState();
      const swapStatus = data.unverified ? "Unverified (offline)" : "Confirmed";
      walletState.history.unshift({ id: `cashu-recv-${Date.now()}`, direction: "Received", peer: "Cashu token", amount: data.amount, unit: "sats", status: swapStatus, timestamp: new Date().toLocaleString() });
      renderWalletHistory();
    } catch (e) {
      if (swapCashuReceiveStatus) swapCashuReceiveStatus.textContent = e.message;
    }
  });
}

// Send Cashu token (Swap panel)
if (swapCashuSendForm) {
  swapCashuSendForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const amount = Number(swapCashuSendAmount?.value);
    const recipient = (swapCashuSendRecipient?.value || "").trim();
    const btn = swapCashuSendForm.querySelector("button[type=submit]");
    if (!amount || amount <= 0) { if (swapCashuSendStatus) swapCashuSendStatus.textContent = "Enter amount."; return; }
    if (swapCashuSendStatus) swapCashuSendStatus.textContent = "Creating token...";
    if (btn) btn.disabled = true;
    try {
      const data = await fetchJson("/api/cashu/send", { method: "POST", body: JSON.stringify({ amount, peer: recipient || "manual", memo: "" }) });
      cashuState.balance = Math.max(0, cashuState.balance - amount);
      applyCashuState();
      if (swapCashuSendToken) swapCashuSendToken.value = data.token;
      if (swapCashuSendResult) swapCashuSendResult.hidden = false;
      if (swapCashuSendStatus) swapCashuSendStatus.textContent = `Token created: ${amount} sats`;
      if (recipient) {
        try {
          await fetchJson("/api/mesh/send", { method: "POST", body: JSON.stringify({ destinationId: recipient, text: data.token }) });
          if (swapCashuSendStatus) swapCashuSendStatus.textContent = `Sent ${amount} sats to ${recipient} via mesh`;
        } catch {
          if (swapCashuSendStatus) swapCashuSendStatus.textContent = "Token ready — mesh send failed, copy manually";
        }
      }
      if (swapCashuSendAmount) swapCashuSendAmount.value = "";
      walletState.history.unshift({ id: `cashu-send-${Date.now()}`, direction: "Sent", peer: recipient || "manual", amount, unit: "sats", status: "Token created", timestamp: new Date().toLocaleString() });
      renderWalletHistory();
    } catch (e) {
      if (swapCashuSendStatus) swapCashuSendStatus.textContent = e.message;
    } finally {
      if (btn) btn.disabled = false;
    }
  });
}

if (swapCashuCopyTokenBtn) {
  swapCashuCopyTokenBtn.addEventListener("click", async () => {
    try {
      await copyText(swapCashuSendToken?.value || "");
      swapCashuCopyTokenBtn.textContent = "Copied!";
      setTimeout(() => { swapCashuCopyTokenBtn.textContent = "Copy"; }, 1200);
    } catch { /* silent */ }
  });
}

// ─── End Swap panel handlers ───────────────────────────────────────────────────

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

if (walletTestModeToggle) {
  walletTestModeToggle.addEventListener("change", async () => {
    const enable = walletTestModeToggle.checked;
    try {
      const result = await fetchJson("/api/wallet/testmode", { method: "POST", body: JSON.stringify({ enabled: enable }) });
      walletState.testMode = result.testMode;
      // Reset wallet UI state since we're switching contexts
      walletState.walletConfigured = false;
      walletState.address = null;
      walletState.mnemonic = null;
      walletState.balance = null;
      walletState.qrLoaded = false;
      walletState.history = [];
      renderWalletHistory();
      applyTestMode();
      applyWalletConfiguredState();
      // Reload state for the newly active mode
      loadWalletState();
    } catch (err) {
      walletSettingsStatus.textContent = `Error: ${err.message}`;
      walletTestModeToggle.checked = !enable;
    }
  });
}


if (faucetAddressButton) {
  faucetAddressButton.addEventListener("click", async () => {
    const address = walletState.address || "your test wallet address";
    if (faucetStatus) {
      faucetStatus.textContent = `Open faucet.mutinynet.com and fund ${address}. Direct app requests are blocked by the faucet's browser token requirement.`;
    }
  });
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
deviceStatus.addEventListener("click", () => {
  if (latestMeshtasticConnected) openDeviceMetaModal();
});
meshAiReplyToggle.addEventListener("click", () => {
  const next = meshAiReplyToggle.getAttribute("aria-pressed") !== "true";
  fetchJson("/api/mesh-ai-reply", { method: "POST", body: JSON.stringify({ enabled: next }) })
    .then((data) => applyMeshAiReply(data.meshAiReply))
    .catch(() => {});
});
deviceMetaClose.addEventListener("click", closeDeviceMetaModal);
deviceMetaModal.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-device-meta")) {
    closeDeviceMetaModal();
  }
});
deviceMetaSave.addEventListener("click", () => {
  deviceMetaStatus.textContent = "Saving...";
  deviceMetaSave.disabled = true;
  const payload = {
    shortName: deviceMetaShortName.value.trim(),
    longName: deviceMetaLongName.value.trim(),
  };
  const lat = deviceMetaLat.value.trim();
  const lon = deviceMetaLon.value.trim();
  if (lat !== "" && lon !== "") {
    payload.latitude = parseFloat(lat);
    payload.longitude = parseFloat(lon);
  }
  fetchJson("/api/device-meta", { method: "POST", body: JSON.stringify(payload) }).then(() => {
    deviceMetaStatus.textContent = "Saved.";
  }).catch((err) => {
    deviceMetaStatus.textContent = `Error: ${err.message}`;
  }).finally(() => {
    deviceMetaSave.disabled = false;
  });
});
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

openNodesMapButton.addEventListener("click", openNodesMap);
nodesMapClose.addEventListener("click", closeNodesMap);
nodesMapModal.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-nodes-map")) {
    closeNodesMap();
  }
});

document.getElementById("nodesMapExpand").addEventListener("click", () => {
  const panel = nodesMapModal.querySelector(".modal-panel--map");
  const isFullscreen = panel.classList.toggle("modal-panel--fullscreen");
  const icon = document.getElementById("nodesMapExpandIcon");
  if (icon) {
    icon.innerHTML = isFullscreen
      ? '<path d="M4 1v1.5H2.5V4H1V1h3zm4 0h3v3h-1.5V2.5H7V1zM1 8h1.5v2.5H4V12H1V8zm6 2.5V12h3V8h-1.5v2.5H7z"/>'
      : '<path d="M1 1h4v1.5H2.5V4H1V1zm6 0h4v3h-1.5V2.5H7V1zM1 8h1.5v2.5H5V12H1V8zm8.5 2.5H7V12h4V8H9.5v2.5z"/>';
  }
  setTimeout(() => { if (_mapInstance) _mapInstance.invalidateSize(); }, 220);
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
    return;
  }
  if (event.key === "Escape" && !deviceMetaModal.classList.contains("hidden")) {
    closeDeviceMetaModal();
  }
});

function connectEvents() {
  const source = new EventSource("/events");
  source.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    latestMessages.push(message);
    latestMessages = latestMessages.slice(-300);
    appendLog(message);
    // Track unread incoming DM messages
    if (message.direction === "in" && message.sender) {
      const isCurrentPeer = message.sender === chatState.selectedPeer && chatState.mode === CHAT_MODE_DM;
      if (!isCurrentPeer) {
        unreadPeers.add(message.sender);
        renderChatPeerList();
        updateDmTabUnreadGlow();
      }
    }
    if (chatState.mode === CHAT_MODE_DM) {
      renderDmChat();
    }
  });
  source.addEventListener("status", () => {
    loadStatus();
  });
  source.addEventListener("position_requested", () => { /* bridge confirmed request sent */ });
  source.addEventListener("nodes", (event) => {
    const payload = JSON.parse(event.data);
    renderNodes(payload.nodes || [], payload.meshLinks || []);
    // Check if we were waiting for a position update
    if (_locateWatchPeerId) {
      const updated = (payload.nodes || []).find((n) => (n.userId || n.id) === _locateWatchPeerId);
      if (updated && updated.latitude && updated.latitude !== 0) {
        clearTimeout(_locateTimeout);
        _locateWatchNodeId = null;
        _locateWatchPeerId = null;
        const btn = nodeModalPositionButton;
        if (btn) {
          btn.disabled = false;
          btn.classList.remove("node-modal-action-btn--pending");
          btn.classList.add("node-modal-action-btn--success");
          const label = btn.querySelector("svg + *") || btn.lastChild;
          if (label) label.textContent = " Show on map";
        }
      }
    }
    if (_mapInstance && !nodesMapModal.classList.contains("hidden")) {
      _renderMapNodes(false);
    }
  });
  source.addEventListener("model-manager", (event) => {
    renderModelManager(JSON.parse(event.data));
  });
  source.addEventListener("swaps", (event) => {
    renderActiveSwaps(JSON.parse(event.data) || []);
  });
  source.addEventListener("ack_update", (event) => {
    const { id, ack } = JSON.parse(event.data);
    // Update in-memory latestMessages
    const msg = latestMessages.find((m) => m.id === id);
    if (msg) msg.ack = ack;
    // Update bubble in DOM if visible
    const bubble = chatReplyText.querySelector(`[data-msg-id="${id}"]`);
    if (bubble) {
      const icon = bubble.querySelector(".chat-bubble-ack");
      if (icon) {
        icon.className = `chat-bubble-ack chat-bubble-ack--${ack}`;
        icon.title = ack === "delivered" ? "Delivered" : ack === "failed" ? "Not delivered" : ack === "sent" ? "Sent to mesh" : "Sending...";
      }
    }
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

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/static/map-sw.js", { scope: "/" }).catch(() => {});
}
