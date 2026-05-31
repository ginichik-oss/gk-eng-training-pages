const LEGACY_STORAGE_KEY = "gk-eng-training-v1";
const STORAGE_KEY = "gk-eng-training-secure-v2";
const AUTO_LOCK_STORAGE_KEY = "gk-eng-training-auto-lock-minutes";
const SUPABASE_SESSION_KEY = "gk-eng-training-supabase-session-v1";
const SUPABASE_URL = "https://wvauqvmvsgzhuuvqhkxh.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2YXVxdm12c2d6aHV1dnFoa3hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNTQ0ODIsImV4cCI6MjA5NTgzMDQ4Mn0.nE9qoDaWrFR9Mjzgoi4lK3bLaKPX9hWPUwjtgf5pxM0";
const REMOTE_VAULT_TABLE = "user_vaults";
const DEFAULT_AUTO_LOCK_MINUTES = 15;
const KDF_ITERATIONS = 250000;
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const promptBank = [
  {
    theme: "LP meeting",
    text: "LPに、Dearsの人材活性化が単なるESGではなくリターン創出に繋がることを説明するとしたら。",
    en: "If you were explaining to an LP how Dears' human capital activation connects to return generation, rather than being merely ESG.",
  },
  {
    theme: "LP meeting",
    text: "LPから「なぜ小型・中堅の日本企業なのか」と聞かれた時に、最初の30秒で答えるなら。",
    en: "If an LP asks, \"Why small and mid-sized Japanese companies?\", how would you answer in the first 30 seconds?",
  },
  {
    theme: "LP meeting",
    text: "投資判断で慎重に見ているポイントを、弱気に聞こえずに伝えるなら。",
    en: "How would you communicate the points you are scrutinizing in investment decisions without sounding defensive or bearish?",
  },
  {
    theme: "LP meeting",
    text: "まだ検証中の論点について、曖昧に逃げず、誠実に答えるなら。",
    en: "How would you respond honestly to a point that is still being validated, without sounding evasive or vague?",
  },
  {
    theme: "LP meeting",
    text: "チームの強みを、個人の経歴の羅列ではなくプラットフォームとして語るなら。",
    en: "How would you describe the team's strengths as a platform, rather than listing individual backgrounds?",
  },
  {
    theme: "LP meeting",
    text: "LPから過去トラックレコードの再現性を聞かれた時に、言い過ぎずに返すなら。",
    en: "If an LP asks about the repeatability of past track record, how would you respond without overstating it?",
  },
  {
    theme: "LP meeting",
    text: "女性活躍をKPIではなく経営改善の文脈で説明するなら。",
    en: "How would you explain women's participation and leadership in the context of management improvement, rather than as a KPI?",
  },
  {
    theme: "LP meeting",
    text: "バリュエーション規律について、会話の流れを止めずに自然に言うなら。",
    en: "How would you naturally discuss valuation discipline without disrupting the flow of conversation?",
  },
  {
    theme: "LP meeting",
    text: "ファンドサイズや進捗について、まだ開示範囲が限定的な場合の言い方は。",
    en: "How should you speak about fund size and progress when the scope of disclosure is still limited?",
  },
  {
    theme: "LP meeting",
    text: "競合ファンドとの差別化を、過度な自慢に聞こえない形で表現するなら。",
    en: "How would you describe differentiation from competing funds without sounding overly self-congratulatory?",
  },
  {
    theme: "Formal casual",
    text: "ランチで、日本のPE市場について聞かれた時に、軽く全体感を伝えるなら。",
    en: "If asked over lunch about the Japanese PE market, how would you give a light, high-level view?",
  },
  {
    theme: "Formal casual",
    text: "相手の見方に部分的に同意しつつ、自分の見方を加えるなら。",
    en: "How would you partially agree with the other person's view while adding your own perspective?",
  },
  {
    theme: "Formal casual",
    text: "会食で、少し踏み込んだ質問に対して、丁寧に線を引くなら。",
    en: "At dinner, how would you politely draw a line when asked a slightly sensitive question?",
  },
  {
    theme: "Formal casual",
    text: "日本企業の意思決定の特徴を、ステレオタイプにしすぎず説明するなら。",
    en: "How would you explain the characteristics of Japanese corporate decision-making without over-stereotyping?",
  },
  {
    theme: "Formal casual",
    text: "相手のファンド戦略について、知的に興味を示す質問をするとしたら。",
    en: "What question would you ask to show thoughtful interest in the other person's fund strategy?",
  },
  {
    theme: "Formal casual",
    text: "少し複雑な話に入る前に、会話の前提を揃えるなら。",
    en: "Before entering a more complex topic, how would you align the assumptions for the conversation?",
  },
  {
    theme: "Formal casual",
    text: "その場で答えきれない時、後で確認して返すと自然に言うなら。",
    en: "When you cannot fully answer on the spot, how would you naturally say that you will confirm and revert later?",
  },
  {
    theme: "Formal casual",
    text: "会話を次のトピックに移す時に、滑らかに橋渡しするなら。",
    en: "How would you smoothly bridge the conversation to the next topic?",
  },
  {
    theme: "Formal casual",
    text: "相手の懸念を受け止めた上で、こちらの仮説を話すなら。",
    en: "How would you acknowledge the other person's concern before sharing your own hypothesis?",
  },
  {
    theme: "Formal casual",
    text: "日本の中小企業オーナーとの信頼関係づくりを、自然に説明するなら。",
    en: "How would you naturally explain trust-building with Japanese SME owners?",
  },
  {
    theme: "Dears narrative",
    text: "Dears Capitalを一文で説明するなら。",
    en: "How would you describe Dears Capital in one sentence?",
  },
  {
    theme: "Dears narrative",
    text: "WONDER ENGAGEMENTの意味を、専門用語に頼りすぎず説明するなら。",
    en: "How would you explain the meaning of WONDER ENGAGEMENT without relying too heavily on technical jargon?",
  },
  {
    theme: "Dears narrative",
    text: "Dears Brain Holdingsの知見がなぜPEに活きるのかを説明するなら。",
    en: "How would you explain why Dears Brain Holdings' know-how is relevant to PE?",
  },
  {
    theme: "Dears narrative",
    text: "3S Capitalの支援を、単なる外部コンサルではなくプラットフォームとして語るなら。",
    en: "How would you describe 3S Capital's support as a platform capability rather than simply external consulting?",
  },
  {
    theme: "Dears narrative",
    text: "創業者に対して、Dearsは買収者ではなく成長パートナーだと伝えるなら。",
    en: "How would you tell a founder that Dears is a growth partner, not merely an acquirer?",
  },
  {
    theme: "Dears narrative",
    text: "人材・組織の改善がEBITDAに繋がる道筋を、実務的に説明するなら。",
    en: "How would you explain, in practical terms, the path from human capital and organizational improvement to EBITDA?",
  },
  {
    theme: "Dears narrative",
    text: "Dearsの投資テーマを、ミッション先行ではなく投資規律から話すなら。",
    en: "How would you discuss Dears' investment theme from the perspective of investment discipline, rather than leading with mission?",
  },
  {
    theme: "Dears narrative",
    text: "日本のSMEに未開拓の成長余地があるという見方を、簡潔に言うなら。",
    en: "How would you concisely express the view that Japanese SMEs have untapped growth potential?",
  },
  {
    theme: "Dears narrative",
    text: "PMIにおけるbody-on supportを、海外LPにも通じる言い方にするなら。",
    en: "How would you describe body-on support in PMI in language that also resonates with overseas LPs?",
  },
  {
    theme: "Dears narrative",
    text: "Dearsの第一号案件を一般論として説明する時、開示を抑えて言うなら。",
    en: "When explaining Dears' first investment in general terms, how would you keep the disclosure appropriately limited?",
  },
];

const seedPhrases = [
  {
    jp: "そこはかなり慎重に見ています。",
    en: "We are very disciplined around that point.",
    context: "LP meeting",
    register: "institutional",
    tags: ["risk", "discipline"],
    whyBetter: "慎重さを弱さではなく投資規律として伝えられる。",
  },
  {
    jp: "これは単なるESGではなく、企業価値向上のための実務的なレバーです。",
    en: "We do not view this as ESG branding, but as a practical operating lever for value creation.",
    context: "LP meeting",
    register: "institutional",
    tags: ["human capital", "value creation"],
    whyBetter: "ESG色を抑え、リターン創出の文脈に置ける。",
  },
  {
    jp: "その点はまだ検証中です。",
    en: "That is still something we are validating.",
    context: "LP meeting",
    register: "institutional",
    tags: ["DD", "open point"],
    whyBetter: "未確定であることをプロフェッショナルに表現できる。",
  },
  {
    jp: "私たちは創業者が築いてきたものを尊重しながら、次の成長段階に必要な経営資源を提供します。",
    en: "We aim to respect what the founder has built while providing the management resources required for the next stage of growth.",
    context: "Founder conversation",
    register: "polished casual",
    tags: ["founder", "partnership"],
    whyBetter: "買収者ではなく成長パートナーとして聞こえる。",
  },
  {
    jp: "そこは一概には言えませんが、私たちの仮説はこうです。",
    en: "It is hard to generalize, but our working hypothesis is as follows.",
    context: "Formal casual",
    register: "softening",
    tags: ["discussion", "hypothesis"],
    whyBetter: "断定を避けながら、議論を前に進められる。",
  },
  {
    jp: "資本だけではなく、経営の仕組みと組織づくりが必要です。",
    en: "Capital alone is not enough; these companies also need management systems and organization-building support.",
    context: "Dears narrative",
    register: "institutional",
    tags: ["SME", "organization"],
    whyBetter: "Dearsの支援価値を簡潔に説明できる。",
  },
  {
    jp: "その懸念はよく理解できます。",
    en: "I fully understand that concern.",
    context: "Formal casual",
    register: "softening",
    tags: ["objection", "empathy"],
    whyBetter: "反論の前に相手の懸念を受け止められる。",
  },
  {
    jp: "この点は投資前からかなり深く見にいきます。",
    en: "We spend a meaningful amount of time diligencing this before making an investment.",
    context: "DD / IC",
    register: "institutional",
    tags: ["DD", "process"],
    whyBetter: "プロセスの厚みを自然に示せる。",
  },
];

const intervals = {
  Again: 1,
  Hard: 3,
  Good: 7,
  Easy: 21,
  Mastered: 75,
};

let state = null;
let cryptoKey = null;
let cryptoSalt = null;
let isUnlocked = false;
let pendingSave = Promise.resolve();
let autoLockTimer = null;
let activeView = "daily";
let activeTheme = "LP meeting";
let activeQuizContext = "all";
let currentQuizId = null;
let authSession = null;
let remoteEnvelope = null;
let remoteVaultMeta = null;
let syncStatus = "Not signed in";

const els = {};

document.addEventListener("DOMContentLoaded", async () => {
  bindElements();
  bindEvents();
  registerServiceWorker();
  await initializeSecureApp();
});

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}

function bindElements() {
  els.lockScreen = document.querySelector("#lockScreen");
  els.lockForm = document.querySelector("#lockForm");
  els.lockTitle = document.querySelector("#lockTitle");
  els.lockMessage = document.querySelector("#lockMessage");
  els.authPanel = document.querySelector("#authPanel");
  els.authStatus = document.querySelector("#authStatus");
  els.authEmail = document.querySelector("#authEmail");
  els.authPassword = document.querySelector("#authPassword");
  els.signInBtn = document.querySelector("#signInBtn");
  els.signUpBtn = document.querySelector("#signUpBtn");
  els.signOutBtn = document.querySelector("#signOutBtn");
  els.passphraseLabel = document.querySelector("#passphraseLabel");
  els.passphraseInput = document.querySelector("#passphraseInput");
  els.confirmPassphraseLabel = document.querySelector("#confirmPassphraseLabel");
  els.confirmPassphraseInput = document.querySelector("#confirmPassphraseInput");
  els.autoLockLabel = document.querySelector("#autoLockLabel");
  els.autoLockMinutes = document.querySelector("#autoLockMinutes");
  els.unlockBtn = document.querySelector("#unlockBtn");
  els.todayLabel = document.querySelector("#todayLabel");
  els.viewTitle = document.querySelector("#viewTitle");
  els.statPhrases = document.querySelector("#statPhrases");
  els.statDue = document.querySelector("#statDue");
  els.statCandidates = document.querySelector("#statCandidates");
  els.securityBadge = document.querySelector("#securityBadge");
  els.lockNowBtn = document.querySelector("#lockNowBtn");
  els.dailyConfidentiality = document.querySelector("#dailyConfidentiality");
  els.dailyQuestions = document.querySelector("#dailyQuestions");
  els.saveDailyBtn = document.querySelector("#saveDailyBtn");
  els.candidateList = document.querySelector("#candidateList");
  els.phraseForm = document.querySelector("#phraseForm");
  els.editingPhraseId = document.querySelector("#editingPhraseId");
  els.editingCandidateId = document.querySelector("#editingCandidateId");
  els.sourceQuestionJp = document.querySelector("#sourceQuestionJp");
  els.sourceQuestionEn = document.querySelector("#sourceQuestionEn");
  els.phraseJp = document.querySelector("#phraseJp");
  els.phraseEn = document.querySelector("#phraseEn");
  els.phraseContext = document.querySelector("#phraseContext");
  els.phraseRegister = document.querySelector("#phraseRegister");
  els.phraseConfidentiality = document.querySelector("#phraseConfidentiality");
  els.phraseTags = document.querySelector("#phraseTags");
  els.phraseWhy = document.querySelector("#phraseWhy");
  els.resetPhraseFormBtn = document.querySelector("#resetPhraseFormBtn");
  els.clearResolvedCandidatesBtn = document.querySelector("#clearResolvedCandidatesBtn");
  els.bankSearch = document.querySelector("#bankSearch");
  els.bankFilter = document.querySelector("#bankFilter");
  els.phraseTable = document.querySelector("#phraseTable");
  els.newPhraseBtn = document.querySelector("#newPhraseBtn");
  els.quizCard = document.querySelector("#quizCard");
  els.reviewRemaining = document.querySelector("#reviewRemaining");
  els.reviewMastered = document.querySelector("#reviewMastered");
  els.quizContextFilters = document.querySelector("#quizContextFilters");
  els.importText = document.querySelector("#importText");
  els.importContext = document.querySelector("#importContext");
  els.importSource = document.querySelector("#importSource");
  els.importConfidentiality = document.querySelector("#importConfidentiality");
  els.importFile = document.querySelector("#importFile");
  els.importBtn = document.querySelector("#importBtn");
  els.exportBtn = document.querySelector("#exportBtn");
  els.exportPlaintextBtn = document.querySelector("#exportPlaintextBtn");
  els.copyCodexPromptBtn = document.querySelector("#copyCodexPromptBtn");
  els.resetDataBtn = document.querySelector("#resetDataBtn");
  els.dataPreview = document.querySelector("#dataPreview");
  els.toast = document.querySelector("#toast");
}

function bindEvents() {
  els.lockForm.addEventListener("submit", handleUnlockSubmit);
  els.signInBtn.addEventListener("click", handleSignIn);
  els.signUpBtn.addEventListener("click", handleSignUp);
  els.signOutBtn.addEventListener("click", handleSignOut);
  els.lockNowBtn.addEventListener("click", lockApp);
  ["click", "keydown", "mousemove", "touchstart"].forEach((eventName) => {
    window.addEventListener(eventName, resetAutoLockTimer, { passive: true });
  });

  document.querySelectorAll(".nav-button").forEach((button) => {
    button.addEventListener("click", () => setActiveView(button.dataset.view));
  });

  document.querySelectorAll(".segment").forEach((button) => {
    button.addEventListener("click", () => {
      activeTheme = button.dataset.theme;
      document.querySelectorAll(".segment").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderDaily();
    });
  });

  els.saveDailyBtn.addEventListener("click", saveDailyIntake);
  els.phraseForm.addEventListener("submit", savePhraseFromForm);
  els.resetPhraseFormBtn.addEventListener("click", resetPhraseForm);
  els.clearResolvedCandidatesBtn.addEventListener("click", clearResolvedCandidates);
  els.bankSearch.addEventListener("input", renderBank);
  els.bankFilter.addEventListener("change", renderBank);
  els.newPhraseBtn.addEventListener("click", () => {
    resetPhraseForm();
    setActiveView("candidates");
    els.phraseJp.focus();
  });
  els.importBtn.addEventListener("click", importTextToCandidates);
  els.importFile.addEventListener("change", handleImportFile);
  els.exportBtn.addEventListener("click", exportState);
  els.exportPlaintextBtn.addEventListener("click", exportPlaintextState);
  els.copyCodexPromptBtn.addEventListener("click", copyCodexPrompt);
  els.resetDataBtn.addEventListener("click", resetLocalData);
}

async function initializeSecureApp() {
  if (!window.crypto?.subtle) {
    document.body.classList.add("is-locked");
    els.lockTitle.textContent = "Secure browser required";
    els.lockMessage.textContent = "This app needs Web Crypto support to encrypt local data. Open it in a modern browser.";
    els.unlockBtn.disabled = true;
    return;
  }
  const storedMinutes = Number(localStorage.getItem(AUTO_LOCK_STORAGE_KEY)) || DEFAULT_AUTO_LOCK_MINUTES;
  els.autoLockMinutes.value = String(storedMinutes);
  authSession = loadStoredAuthSession();
  if (authSession) {
    try {
      await ensureAuthSession();
    } catch {
      clearStoredAuthSession();
      authSession = null;
      syncStatus = "Sign in again";
    }
    if (authSession) {
      try {
        await loadRemoteVault();
      } catch {
        remoteEnvelope = null;
        remoteVaultMeta = null;
        syncStatus = "Remote vault unavailable";
      }
    }
  }
  updateAuthUi();
  if (isSupabaseConfigured() && !authSession) {
    showLockScreen("auth");
    return;
  }
  const hasSecureState = Boolean(localStorage.getItem(STORAGE_KEY));
  const hasLegacyState = Boolean(localStorage.getItem(LEGACY_STORAGE_KEY));
  showLockScreen(remoteEnvelope || hasSecureState ? "unlock" : "setup", hasLegacyState);
}

function initialState() {
  return normalizeState({
    phrases: seedPhrases.map((phrase) => newPhrase(phrase)),
    candidates: [],
    intakes: [],
    createdAt: new Date().toISOString(),
  });
}

function loadLegacyState() {
  const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!raw) return initialState();
  try {
    return normalizeState(JSON.parse(raw));
  } catch {
    return initialState();
  }
}

function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

function loadStoredAuthSession() {
  try {
    const raw = localStorage.getItem(SUPABASE_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeAuthSession(session) {
  authSession = {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at || Math.floor(Date.now() / 1000) + Number(session.expires_in || 3600),
    user: session.user,
  };
  localStorage.setItem(SUPABASE_SESSION_KEY, JSON.stringify(authSession));
}

function clearStoredAuthSession() {
  localStorage.removeItem(SUPABASE_SESSION_KEY);
}

function supabaseHeaders(token = authSession?.access_token) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token || SUPABASE_ANON_KEY}`,
  };
}

async function supabaseRequest(path, options = {}) {
  const { token, headers = {}, ...fetchOptions } = options;
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...fetchOptions,
    headers: {
      ...supabaseHeaders(token),
      ...(fetchOptions.body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(data?.msg || data?.message || `Supabase request failed: ${response.status}`);
  }
  return data;
}

async function ensureAuthSession() {
  if (!authSession) return null;
  const expiresAt = Number(authSession.expires_at || 0) * 1000;
  if (expiresAt > Date.now() + 60000) return authSession;
  const refreshed = await supabaseRequest("/auth/v1/token?grant_type=refresh_token", {
    method: "POST",
    token: SUPABASE_ANON_KEY,
    body: JSON.stringify({ refresh_token: authSession.refresh_token }),
  });
  storeAuthSession(refreshed);
  return authSession;
}

async function handleSignIn() {
  const email = els.authEmail.value.trim();
  const password = els.authPassword.value;
  if (!email || !password) {
    showToast("Enter email and login password");
    return;
  }
  setAuthBusy(true);
  try {
    const session = await supabaseRequest("/auth/v1/token?grant_type=password", {
      method: "POST",
      token: SUPABASE_ANON_KEY,
      body: JSON.stringify({ email, password }),
    });
    storeAuthSession(session);
    els.authPassword.value = "";
    try {
      await loadRemoteVault();
    } catch {
      remoteEnvelope = null;
      remoteVaultMeta = null;
      syncStatus = "Remote vault unavailable";
    }
    updateAuthUi();
    const hasLocalState = Boolean(localStorage.getItem(STORAGE_KEY));
    showLockScreen(remoteEnvelope || hasLocalState ? "unlock" : "setup");
    showToast("Signed in");
  } catch (error) {
    syncStatus = error.message;
    updateAuthUi();
    showToast("Could not sign in");
  } finally {
    setAuthBusy(false);
  }
}

async function handleSignUp() {
  const email = els.authEmail.value.trim();
  const password = els.authPassword.value;
  if (!email || password.length < 8) {
    showToast("Use email and at least 8 password characters");
    return;
  }
  setAuthBusy(true);
  try {
    const session = await supabaseRequest("/auth/v1/signup", {
      method: "POST",
      token: SUPABASE_ANON_KEY,
      body: JSON.stringify({ email, password }),
    });
    if (session.access_token) {
      storeAuthSession(session);
      els.authPassword.value = "";
      try {
        await loadRemoteVault();
      } catch {
        remoteEnvelope = null;
        remoteVaultMeta = null;
        syncStatus = "Remote vault unavailable";
      }
      updateAuthUi();
      showLockScreen(remoteEnvelope || localStorage.getItem(STORAGE_KEY) ? "unlock" : "setup");
      showToast("Login created");
      return;
    }
    syncStatus = "Check your email to confirm login";
    updateAuthUi();
    showToast("Check email to confirm");
  } catch (error) {
    syncStatus = error.message;
    updateAuthUi();
    showToast("Could not create login");
  } finally {
    setAuthBusy(false);
  }
}

async function handleSignOut() {
  await pendingSave;
  if (authSession?.access_token) {
    supabaseRequest("/auth/v1/logout", { method: "POST" }).catch(() => {});
  }
  authSession = null;
  remoteEnvelope = null;
  remoteVaultMeta = null;
  syncStatus = "Not signed in";
  clearStoredAuthSession();
  updateAuthUi();
  await lockApp(true);
  showLockScreen("auth");
  showToast("Signed out");
}

function setAuthBusy(isBusy) {
  els.signInBtn.disabled = isBusy;
  els.signUpBtn.disabled = isBusy;
  els.signOutBtn.disabled = isBusy;
}

function updateAuthUi() {
  if (!els.authPanel) return;
  const signedIn = Boolean(authSession?.user);
  els.authStatus.textContent = signedIn
    ? `${authSession.user.email || "Signed in"} | ${syncStatus}`
    : syncStatus || "Not signed in";
  els.authEmail.disabled = signedIn;
  els.authEmail.value = signedIn ? authSession.user.email || "" : els.authEmail.value;
  els.authPassword.closest("label").hidden = signedIn;
  els.signInBtn.hidden = signedIn;
  els.signUpBtn.hidden = signedIn;
  els.signOutBtn.hidden = !signedIn;
}

async function loadRemoteVault() {
  await ensureAuthSession();
  const userId = authSession?.user?.id;
  if (!userId) return null;
  const rows = await supabaseRequest(
    `/rest/v1/${REMOTE_VAULT_TABLE}?select=encrypted_vault,updated_at,client_updated_at&user_id=eq.${encodeURIComponent(
      userId,
    )}&limit=1`,
  );
  const row = Array.isArray(rows) ? rows[0] : null;
  remoteEnvelope = row?.encrypted_vault || null;
  remoteVaultMeta = row ? { updatedAt: row.updated_at, clientUpdatedAt: row.client_updated_at } : null;
  syncStatus = remoteEnvelope ? "Remote vault ready" : "No remote vault yet";
  return remoteEnvelope;
}

async function saveRemoteVault(envelope) {
  await ensureAuthSession();
  const userId = authSession?.user?.id;
  if (!userId) throw new Error("Not signed in");
  const now = new Date().toISOString();
  const rows = await supabaseRequest(`/rest/v1/${REMOTE_VAULT_TABLE}?on_conflict=user_id`, {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({
      user_id: userId,
      encrypted_vault: envelope,
      client_updated_at: now,
    }),
  });
  remoteEnvelope = Array.isArray(rows) && rows[0]?.encrypted_vault ? rows[0].encrypted_vault : envelope;
  remoteVaultMeta = { updatedAt: Array.isArray(rows) ? rows[0]?.updated_at : null, clientUpdatedAt: now };
  syncStatus = "Synced";
  updateAuthUi();
}

function showLockScreen(mode, hasLegacyState = false) {
  document.body.classList.add("is-locked");
  els.lockForm.dataset.mode = mode;
  els.passphraseInput.value = "";
  els.confirmPassphraseInput.value = "";
  const authOnly = mode === "auth";
  els.passphraseLabel.hidden = authOnly;
  els.confirmPassphraseLabel.hidden = authOnly || mode !== "setup";
  els.autoLockLabel.hidden = authOnly;
  els.unlockBtn.hidden = authOnly;
  els.confirmPassphraseInput.required = mode === "setup";
  els.passphraseInput.required = !authOnly;
  els.passphraseInput.autocomplete = mode === "setup" ? "new-password" : "current-password";
  els.lockTitle.textContent = authOnly
    ? "Sign in to Eng Training"
    : mode === "setup"
      ? "Set a vault passphrase"
      : "Unlock Eng Training";
  els.unlockBtn.textContent = mode === "setup" ? "Encrypt and start" : "Unlock";
  els.lockMessage.textContent = authOnly
    ? "Sign in first. The cloud stores only the encrypted vault; your vault passphrase still opens the contents locally."
    : mode === "setup"
      ? hasLegacyState
        ? "Existing local data will be migrated into an encrypted vault. Use a strong passphrase."
        : "Create an encrypted vault before storing fund or LP-related notes."
      : "Enter your vault passphrase to decrypt the synced vault.";
  window.setTimeout(() => (authOnly ? els.authEmail : els.passphraseInput).focus(), 50);
}

async function handleUnlockSubmit(event) {
  event.preventDefault();
  const mode = els.lockForm.dataset.mode;
  if (mode === "auth") {
    showToast("Sign in first");
    return;
  }
  const passphrase = els.passphraseInput.value;
  if (passphrase.length < 10) {
    showToast("Use at least 10 characters");
    return;
  }

  try {
    if (mode === "setup") {
      if (passphrase !== els.confirmPassphraseInput.value) {
        showToast("Passphrases do not match");
        return;
      }
      cryptoSalt = crypto.getRandomValues(new Uint8Array(16));
      cryptoKey = await deriveAesKey(passphrase, cryptoSalt);
      state = loadLegacyState();
      localStorage.setItem(AUTO_LOCK_STORAGE_KEY, els.autoLockMinutes.value);
      await saveState();
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      unlockApp();
      showToast("Encrypted vault created");
      return;
    }

    const envelope = getStoredEnvelope();
    cryptoSalt = base64ToBytes(envelope.salt);
    cryptoKey = await deriveAesKey(passphrase, cryptoSalt);
    state = normalizeState(await decryptEnvelope(envelope));
    localStorage.setItem(AUTO_LOCK_STORAGE_KEY, els.autoLockMinutes.value);
    if (authSession && !remoteEnvelope) await saveState();
    unlockApp();
    showToast("Unlocked");
  } catch {
    cryptoKey = null;
    cryptoSalt = null;
    state = null;
    showToast("Could not unlock. Check the passphrase.");
  }
}

function unlockApp() {
  isUnlocked = true;
  document.body.classList.remove("is-locked");
  renderAll();
  resetAutoLockTimer();
}

async function lockApp(force = false) {
  if (!isUnlocked && !force) return;
  await pendingSave;
  isUnlocked = false;
  state = null;
  cryptoKey = null;
  cryptoSalt = null;
  currentQuizId = null;
  window.clearTimeout(autoLockTimer);
  showLockScreen("unlock");
}

function resetAutoLockTimer() {
  if (!isUnlocked) return;
  window.clearTimeout(autoLockTimer);
  const minutes = Number(els.autoLockMinutes?.value) || DEFAULT_AUTO_LOCK_MINUTES;
  autoLockTimer = window.setTimeout(lockApp, minutes * 60 * 1000);
}

function getStoredEnvelope() {
  if (remoteEnvelope) return remoteEnvelope;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) throw new Error("No encrypted vault");
  const envelope = JSON.parse(raw);
  if (!envelope?.salt || !envelope?.iv || !envelope?.ciphertext) {
    throw new Error("Invalid encrypted vault");
  }
  return envelope;
}

async function deriveAesKey(passphrase, salt) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: KDF_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function encryptEnvelope(payload) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedPayload = textEncoder.encode(JSON.stringify(payload));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, cryptoKey, encodedPayload);
  return {
    version: 2,
    cipher: "AES-GCM",
    kdf: "PBKDF2-SHA256",
    iterations: KDF_ITERATIONS,
    salt: bytesToBase64(cryptoSalt),
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
    updatedAt: new Date().toISOString(),
  };
}

async function decryptEnvelope(envelope) {
  return decryptEnvelopeWithKey(envelope, cryptoKey);
}

async function decryptEnvelopeWithKey(envelope, key) {
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBytes(envelope.iv) },
    key,
    base64ToBytes(envelope.ciphertext),
  );
  return JSON.parse(textDecoder.decode(plaintext));
}

function bytesToBase64(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function normalizeState(input) {
  const normalized = {
    phrases: Array.isArray(input.phrases)
      ? input.phrases.map((phrase) => ({
          ...phrase,
          tags: Array.isArray(phrase.tags) ? phrase.tags : parseTags(phrase.tags || ""),
          status: phrase.status || "active",
          dueAt: phrase.dueAt || todayIso(),
          intervalDays: phrase.intervalDays || 0,
          ease: phrase.ease || 2.5,
          reviewCount: phrase.reviewCount || 0,
          lapseCount: phrase.lapseCount || 0,
          confidentiality: phrase.confidentiality || "internal",
          sourceQuestionJp: sourceQuestionJpValue(phrase),
          sourceQuestionEn: sourceQuestionEnValue(phrase),
        }))
      : [],
    candidates: Array.isArray(input.candidates)
      ? input.candidates.map((candidate) => ({
          ...candidate,
          confidentiality: candidate.confidentiality || "internal",
          sourceQuestionJp: sourceQuestionJpValue(candidate),
          sourceQuestionEn: sourceQuestionEnValue(candidate),
        }))
      : [],
    intakes: Array.isArray(input.intakes)
      ? input.intakes.map((intake) => ({
          ...intake,
          confidentiality: intake.confidentiality || "internal",
        }))
      : [],
    createdAt: input.createdAt || new Date().toISOString(),
    updatedAt: input.updatedAt || new Date().toISOString(),
  };
  return hydrateSourceQuestions(normalized);
}

async function saveState() {
  if (!state || !cryptoKey || !cryptoSalt) return pendingSave;
  state.updatedAt = new Date().toISOString();
  pendingSave = encryptEnvelope(state).then(async (envelope) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
    remoteEnvelope = envelope;
    if (isSupabaseConfigured() && authSession) {
      try {
        await saveRemoteVault(envelope);
      } catch (error) {
        syncStatus = `Saved locally; sync failed`;
        updateAuthUi();
      }
    }
  });
  return pendingSave;
}

function newPhrase(values) {
  return {
    id: crypto.randomUUID(),
    sourceQuestionJp: sourceQuestionJpValue(values),
    sourceQuestionEn: sourceQuestionEnValue(values),
    jp: values.jp || "",
    en: values.en || "",
    context: values.context || "LP meeting",
    register: values.register || "institutional",
    confidentiality: values.confidentiality || "internal",
    tags: Array.isArray(values.tags) ? values.tags : parseTags(values.tags || ""),
    whyBetter: values.whyBetter || "",
    source: values.source || "seed",
    status: values.status || "active",
    createdAt: values.createdAt || new Date().toISOString(),
    updatedAt: values.updatedAt || new Date().toISOString(),
    dueAt: values.dueAt || todayIso(),
    intervalDays: values.intervalDays || 0,
    ease: values.ease || 2.5,
    reviewCount: values.reviewCount || 0,
    lapseCount: values.lapseCount || 0,
  };
}

function newCandidate(values) {
  return {
    id: crypto.randomUUID(),
    sourceQuestionJp: sourceQuestionJpValue(values),
    sourceQuestionEn: sourceQuestionEnValue(values),
    jp: (values.jp || values.content || "").trim(),
    context: values.context || "LP meeting",
    confidentiality: values.confidentiality || "internal",
    source: values.source || values.sourceProject || "daily intake",
    sourcePath: values.sourcePath || "",
    title: values.title || "",
    status: values.status || "open",
    createdAt: values.createdAt || values.capturedAt || new Date().toISOString(),
  };
}

function sourceQuestionJpValue(values) {
  return String(
    values?.sourceQuestionJp || values?.questionJp || values?.promptJp || values?.originalQuestionJp || "",
  ).trim();
}

function sourceQuestionEnValue(values) {
  const explicit = String(
    values?.sourceQuestionEn || values?.questionEn || values?.promptEn || values?.originalQuestionEn || "",
  ).trim();
  if (explicit) return explicit;
  const questionJp = sourceQuestionJpValue(values);
  return promptBank.find((prompt) => prompt.text === questionJp)?.en || "";
}

function hydrateSourceQuestions(normalized) {
  normalized.candidates = normalized.candidates.map((candidate) => fillSourceQuestion(candidate, normalized.intakes));
  normalized.phrases = normalized.phrases.map((phrase) => fillSourceQuestion(phrase, normalized.intakes));
  return normalized;
}

function fillSourceQuestion(record, intakes) {
  const prompt = findSourcePrompt(record, intakes);
  if (!prompt) return record;
  return {
    ...record,
    sourceQuestionJp: record.sourceQuestionJp || prompt.text,
    sourceQuestionEn: record.sourceQuestionEn || prompt.en || "",
  };
}

function findSourcePrompt(record, intakes) {
  const questionJp = sourceQuestionJpValue(record) || String(record.title || "").trim();
  const promptFromQuestion = promptBank.find((prompt) => prompt.text === questionJp);
  if (promptFromQuestion) return promptFromQuestion;

  const answer = String(record.jp || "").trim();
  if (!answer) return null;
  for (const intake of intakes) {
    const answers = intake.answers || {};
    const promptId = Object.keys(answers).find((key) => String(answers[key] || "").trim() === answer);
    const prompt = promptFromId(promptId);
    if (prompt) return prompt;
  }
  return null;
}

function promptFromId(promptId) {
  const match = /^prompt-(\d+)$/.exec(String(promptId || ""));
  if (!match) return null;
  return promptBank[Number(match[1])] || null;
}

function renderAll() {
  renderChrome();
  renderDaily();
  renderCandidates();
  renderBank();
  renderQuiz();
  renderImportPreview();
}

function renderChrome() {
  els.todayLabel.textContent = formatDateLabel(new Date());
  els.viewTitle.textContent = viewTitle(activeView);
  els.statPhrases.textContent = state.phrases.length;
  els.statDue.textContent = duePhrases().length;
  els.statCandidates.textContent = state.candidates.filter((item) => item.status !== "resolved").length;
  els.securityBadge.textContent = `encrypted | ${authSession ? syncStatus : "local only"} | auto-lock ${
    els.autoLockMinutes.value
  }m`;
}

function setActiveView(view) {
  activeView = view;
  document.querySelectorAll(".nav-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  document.querySelectorAll(".view").forEach((section) => {
    section.classList.toggle("active", section.id === `view-${view}`);
  });
  renderChrome();
  if (view === "quiz") renderQuiz();
  if (view === "bank") renderBank();
  if (view === "candidates") renderCandidates();
}

function viewTitle(view) {
  const titles = {
    daily: "Daily Intake",
    candidates: "Candidate Inbox",
    bank: "Phrase Bank",
    quiz: "Quiz",
    import: "Import / Export",
  };
  return titles[view] || "Eng Training";
}

function renderDaily() {
  const prompts = getDailyPrompts(activeTheme);
  const today = todayIso();
  const existing = state.intakes.find((item) => item.date === today && item.theme === activeTheme);
  const answers = existing?.answers || {};

  els.dailyQuestions.innerHTML = prompts
    .map(
      (prompt, index) => `
        <article class="question-item">
          <div class="question-title">
            <span>${index + 1}</span>
            <div>
              <p>${escapeHtml(prompt.text)}</p>
              <small>${escapeHtml(prompt.en || "")}</small>
            </div>
          </div>
          <textarea data-prompt-id="${prompt.id}" placeholder="日本語で、実際に言いたいことを書く">${escapeHtml(
            answers[prompt.id] || "",
          )}</textarea>
        </article>
      `,
    )
    .join("");
}

function getDailyPrompts(theme) {
  const today = todayIso();
  const filtered = promptBank
    .map((prompt, index) => ({ ...prompt, id: `prompt-${index}` }))
    .filter((prompt) => prompt.theme === theme);
  return seededShuffle(filtered, hashString(`${today}-${theme}`)).slice(0, 10);
}

function saveDailyIntake() {
  const today = todayIso();
  const prompts = getDailyPrompts(activeTheme);
  const answers = {};
  const newCandidates = [];

  els.dailyQuestions.querySelectorAll("textarea").forEach((textarea) => {
    const value = textarea.value.trim();
    if (!value) return;
    answers[textarea.dataset.promptId] = value;
    const prompt = prompts.find((item) => item.id === textarea.dataset.promptId);
    const alreadyExists = state.candidates.some(
      (candidate) => candidate.jp === value && candidate.source === `daily:${today}:${activeTheme}`,
    );
    if (!alreadyExists) {
      newCandidates.push(
        newCandidate({
          sourceQuestionJp: prompt?.text || "",
          sourceQuestionEn: prompt?.en || "",
          jp: value,
          context: activeTheme,
          confidentiality: els.dailyConfidentiality.value,
          source: `daily:${today}:${activeTheme}`,
          title: prompt?.text || activeTheme,
        }),
      );
    }
  });

  const existingIndex = state.intakes.findIndex((item) => item.date === today && item.theme === activeTheme);
  const intake = {
    id: existingIndex >= 0 ? state.intakes[existingIndex].id : crypto.randomUUID(),
    date: today,
    theme: activeTheme,
    confidentiality: els.dailyConfidentiality.value,
    answers,
    updatedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    state.intakes[existingIndex] = intake;
  } else {
    state.intakes.push(intake);
  }

  state.candidates.unshift(...newCandidates);
  saveState();
  renderAll();
  showToast(`${newCandidates.length} candidates added`);
}

function sourceQuestionHtml(record) {
  const jp = sourceQuestionJpValue(record);
  const en = sourceQuestionEnValue(record);
  if (!jp && !en) return "";
  return `
    <div class="source-question">
      <strong>Original question</strong>
      ${jp ? `<p><span>JP</span>${escapeHtml(jp)}</p>` : ""}
      ${en ? `<p><span>EN</span>${escapeHtml(en)}</p>` : ""}
    </div>
  `;
}

function renderCandidates() {
  const openCandidates = [...state.candidates].sort((a, b) => statusSort(a, b));
  if (openCandidates.length === 0) {
    els.candidateList.innerHTML = `<div class="empty-state">Inbox is clear</div>`;
    return;
  }

  els.candidateList.innerHTML = openCandidates
    .map(
      (candidate) => `
        <article class="candidate-row ${candidate.status === "resolved" ? "resolved" : ""}">
          <div class="candidate-meta">
            <span class="pill">${escapeHtml(candidate.context)}</span>
            <span class="pill ${confidentialityClass(candidate.confidentiality)}">${escapeHtml(candidate.confidentiality)}</span>
            <span class="pill blue">${escapeHtml(candidate.source)}</span>
            ${
              candidate.status === "resolved"
                ? `<span class="pill warn">resolved</span>`
                : `<span class="pill">open</span>`
            }
          </div>
          ${sourceQuestionHtml(candidate)}
          <div class="answer-preview">
            <strong>Japanese answer</strong>
            <p>${escapeHtml(candidate.jp)}</p>
          </div>
          <div class="row-actions">
            <button type="button" data-action="use-candidate" data-id="${candidate.id}">Use</button>
            <button type="button" data-action="resolve-candidate" data-id="${candidate.id}">Resolve</button>
            <button type="button" data-action="delete-candidate" data-id="${candidate.id}">Delete</button>
          </div>
        </article>
      `,
    )
    .join("");

  els.candidateList.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", handleCandidateAction);
  });
}

function handleCandidateAction(event) {
  const id = event.currentTarget.dataset.id;
  const action = event.currentTarget.dataset.action;
  const candidate = state.candidates.find((item) => item.id === id);
  if (!candidate) return;

  if (action === "use-candidate") {
    resetPhraseForm();
    els.editingCandidateId.value = candidate.id;
    els.sourceQuestionJp.value = candidate.sourceQuestionJp || "";
    els.sourceQuestionEn.value = candidate.sourceQuestionEn || "";
    els.phraseJp.value = candidate.jp;
    els.phraseContext.value = optionOrDefault(els.phraseContext, candidate.context);
    els.phraseConfidentiality.value = optionOrDefault(els.phraseConfidentiality, candidate.confidentiality);
    els.phraseEn.focus();
  }

  if (action === "resolve-candidate") {
    candidate.status = "resolved";
    saveState();
    renderAll();
  }

  if (action === "delete-candidate") {
    state.candidates = state.candidates.filter((item) => item.id !== id);
    saveState();
    renderAll();
  }
}

function savePhraseFromForm(event) {
  event.preventDefault();
  const id = els.editingPhraseId.value;
  const candidateId = els.editingCandidateId.value;
  const candidate = candidateId ? state.candidates.find((item) => item.id === candidateId) : null;
  const payload = {
    sourceQuestionJp: els.sourceQuestionJp.value.trim() || candidate?.sourceQuestionJp || "",
    sourceQuestionEn: els.sourceQuestionEn.value.trim() || candidate?.sourceQuestionEn || "",
    jp: els.phraseJp.value.trim(),
    en: els.phraseEn.value.trim(),
    context: els.phraseContext.value,
    register: els.phraseRegister.value,
    confidentiality: els.phraseConfidentiality.value,
    tags: parseTags(els.phraseTags.value),
    whyBetter: els.phraseWhy.value.trim(),
    source: candidateId ? "candidate" : "manual",
  };

  if (!payload.jp || !payload.en) {
    showToast("Japanese and English are required");
    return;
  }

  if (id) {
    const phrase = state.phrases.find((item) => item.id === id);
    Object.assign(phrase, payload, { updatedAt: new Date().toISOString() });
  } else {
    state.phrases.unshift(newPhrase(payload));
  }

  if (candidateId) {
    if (candidate) candidate.status = "resolved";
  }

  saveState();
  resetPhraseForm();
  renderAll();
  showToast("Card saved");
}

function resetPhraseForm() {
  els.phraseForm.reset();
  els.editingPhraseId.value = "";
  els.editingCandidateId.value = "";
  els.sourceQuestionJp.value = "";
  els.sourceQuestionEn.value = "";
  els.phraseContext.value = "LP meeting";
  els.phraseRegister.value = "institutional";
  els.phraseConfidentiality.value = "internal";
}

function clearResolvedCandidates() {
  const before = state.candidates.length;
  state.candidates = state.candidates.filter((candidate) => candidate.status !== "resolved");
  saveState();
  renderAll();
  showToast(`${before - state.candidates.length} candidates cleared`);
}

function renderBank() {
  const query = els.bankSearch.value.trim().toLowerCase();
  const filter = els.bankFilter.value;
  let phrases = [...state.phrases];

  if (query) {
    phrases = phrases.filter((phrase) =>
      [
        phrase.sourceQuestionJp,
        phrase.sourceQuestionEn,
        phrase.jp,
        phrase.en,
        phrase.context,
        phrase.register,
        phrase.confidentiality,
        phrase.tags.join(" "),
        phrase.whyBetter,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }

  if (filter === "active") phrases = phrases.filter((phrase) => phrase.status === "active");
  if (filter === "mastered") phrases = phrases.filter((phrase) => phrase.status === "mastered");
  if (filter === "due") phrases = phrases.filter((phrase) => isDue(phrase));

  if (phrases.length === 0) {
    els.phraseTable.innerHTML = `<div class="empty-state">No cards</div>`;
    return;
  }

  els.phraseTable.innerHTML = phrases
    .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt))
    .map(
      (phrase) => `
        <article class="phrase-row">
          <div class="phrase-meta">
            <span class="pill">${escapeHtml(phrase.context)}</span>
            <span class="pill blue">${escapeHtml(phrase.register)}</span>
            <span class="pill ${confidentialityClass(phrase.confidentiality)}">${escapeHtml(phrase.confidentiality)}</span>
            <span class="pill ${phrase.status === "mastered" ? "warn" : ""}">${escapeHtml(phrase.status)}</span>
            <span class="pill">due ${escapeHtml(phrase.dueAt)}</span>
          </div>
          ${sourceQuestionHtml(phrase)}
          <div class="phrase-main">
            <p><strong>Japanese</strong>${escapeHtml(phrase.jp)}</p>
            <p><strong>English</strong>${escapeHtml(phrase.en)}</p>
          </div>
          ${
            phrase.whyBetter
              ? `<p class="muted-line">${escapeHtml(phrase.whyBetter)}</p>`
              : ""
          }
          <div class="row-actions">
            <button type="button" data-action="edit-phrase" data-id="${phrase.id}">Edit</button>
            <button type="button" data-action="master-phrase" data-id="${phrase.id}">Mastered</button>
            <button type="button" data-action="delete-phrase" data-id="${phrase.id}">Delete</button>
          </div>
        </article>
      `,
    )
    .join("");

  els.phraseTable.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", handlePhraseAction);
  });
}

function handlePhraseAction(event) {
  const id = event.currentTarget.dataset.id;
  const action = event.currentTarget.dataset.action;
  const phrase = state.phrases.find((item) => item.id === id);
  if (!phrase) return;

  if (action === "edit-phrase") {
    setActiveView("candidates");
    els.editingPhraseId.value = phrase.id;
    els.editingCandidateId.value = "";
    els.sourceQuestionJp.value = phrase.sourceQuestionJp || "";
    els.sourceQuestionEn.value = phrase.sourceQuestionEn || "";
    els.phraseJp.value = phrase.jp;
    els.phraseEn.value = phrase.en;
    els.phraseContext.value = optionOrDefault(els.phraseContext, phrase.context);
    els.phraseRegister.value = optionOrDefault(els.phraseRegister, phrase.register);
    els.phraseConfidentiality.value = optionOrDefault(els.phraseConfidentiality, phrase.confidentiality);
    els.phraseTags.value = phrase.tags.join(", ");
    els.phraseWhy.value = phrase.whyBetter || "";
    els.phraseEn.focus();
  }

  if (action === "master-phrase") {
    applyReview(phrase, "Mastered");
    saveState();
    renderAll();
  }

  if (action === "delete-phrase") {
    state.phrases = state.phrases.filter((item) => item.id !== id);
    saveState();
    renderAll();
  }
}

function renderQuiz() {
  renderQuizFilters();
  const due = duePhrases().filter((phrase) => activeQuizContext === "all" || phrase.context === activeQuizContext);
  const mastered = state.phrases.filter((phrase) => phrase.status === "mastered").length;
  els.reviewRemaining.textContent = due.length;
  els.reviewMastered.textContent = mastered;

  if (!due.length) {
    currentQuizId = null;
    els.quizCard.innerHTML = `<div class="empty-state">No due cards</div>`;
    return;
  }

  if (!currentQuizId || !due.some((phrase) => phrase.id === currentQuizId)) {
    currentQuizId = due[0].id;
  }

  const phrase = due.find((item) => item.id === currentQuizId);
  els.quizCard.innerHTML = `
    <div class="quiz-prompt">
      <div class="phrase-meta">
        <span class="pill">${escapeHtml(phrase.context)}</span>
        <span class="pill blue">${escapeHtml(phrase.register)}</span>
        <span class="pill ${confidentialityClass(phrase.confidentiality)}">${escapeHtml(phrase.confidentiality)}</span>
        <span class="pill">review ${phrase.reviewCount}</span>
      </div>
      ${sourceQuestionHtml(phrase)}
      <div class="quiz-intent">
        <strong>Japanese answer</strong>
        <h2>${escapeHtml(phrase.jp)}</h2>
      </div>
      <div class="answer-box">
        <textarea id="quizAnswer" rows="5" placeholder="Type your English"></textarea>
        <button class="secondary-action" type="button" id="revealAnswerBtn">Reveal</button>
        <div class="answer-reveal" id="answerReveal" hidden>
          <strong>Target phrase</strong>
          <p>${escapeHtml(phrase.en)}</p>
          ${phrase.whyBetter ? `<p>${escapeHtml(phrase.whyBetter)}</p>` : ""}
        </div>
      </div>
      <div class="score-actions" id="scoreActions" hidden>
        ${Object.keys(intervals)
          .map((score) => `<button type="button" data-score="${score}">${score}</button>`)
          .join("")}
      </div>
    </div>
  `;

  document.querySelector("#revealAnswerBtn").addEventListener("click", () => {
    document.querySelector("#answerReveal").hidden = false;
    document.querySelector("#scoreActions").hidden = false;
  });
  document.querySelectorAll("#scoreActions button").forEach((button) => {
    button.addEventListener("click", () => {
      applyReview(phrase, button.dataset.score);
      saveState();
      currentQuizId = null;
      renderAll();
    });
  });
}

function renderQuizFilters() {
  const contexts = ["all", ...new Set(state.phrases.map((phrase) => phrase.context))];
  els.quizContextFilters.innerHTML = contexts
    .map(
      (context) =>
        `<button type="button" class="${activeQuizContext === context ? "active" : ""}" data-context="${escapeHtml(
          context,
        )}">${escapeHtml(context)}</button>`,
    )
    .join("");
  els.quizContextFilters.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      activeQuizContext = button.dataset.context;
      currentQuizId = null;
      renderQuiz();
    });
  });
}

function applyReview(phrase, score) {
  const days = intervals[score] || 7;
  phrase.reviewCount += 1;
  phrase.intervalDays = days;
  phrase.dueAt = addDaysIso(days);
  phrase.updatedAt = new Date().toISOString();
  phrase.lastScore = score;

  if (score === "Again") {
    phrase.status = "active";
    phrase.lapseCount += 1;
    phrase.ease = Math.max(1.3, phrase.ease - 0.25);
  } else if (score === "Mastered") {
    phrase.status = "mastered";
    phrase.masteredAt = new Date().toISOString();
    phrase.ease = Math.min(3.0, phrase.ease + 0.1);
  } else {
    phrase.status = "active";
    phrase.ease = Math.min(3.0, phrase.ease + (score === "Easy" ? 0.08 : 0.02));
  }
}

function duePhrases() {
  return state.phrases.filter((phrase) => isDue(phrase)).sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));
}

function isDue(phrase) {
  return new Date(phrase.dueAt + "T00:00:00") <= new Date(todayIso() + "T23:59:59");
}

async function importTextToCandidates() {
  const text = els.importText.value.trim();
  if (!text) {
    showToast("Paste text or choose a file first");
    return;
  }

  const encryptedEnvelope = parseEncryptedEnvelope(text);
  if (encryptedEnvelope) {
    await restoreEncryptedBackup(encryptedEnvelope);
    return;
  }

  const imported = parseImportPayload(
    text,
    els.importContext.value,
    els.importSource.value.trim(),
    els.importConfidentiality.value,
  );
  const phraseRecords = imported.filter((item) => item.en);
  const candidateRecords = imported.filter((item) => !item.en);

  state.phrases.unshift(
    ...phraseRecords.map((item) =>
      newPhrase({
        sourceQuestionJp: item.sourceQuestionJp,
        sourceQuestionEn: item.sourceQuestionEn,
        jp: item.jp,
        en: item.en,
        context: item.context,
        register: item.register || "institutional",
        confidentiality: item.confidentiality || els.importConfidentiality.value,
        tags: item.tags || [],
        whyBetter: item.whyBetter || "",
        source: item.source || "import",
      }),
    ),
  );
  state.candidates.unshift(...candidateRecords.map((item) => newCandidate(item)));
  saveState();
  els.importText.value = "";
  renderAll();
  showToast(`${candidateRecords.length} candidates and ${phraseRecords.length} cards imported`);
}

function parseEncryptedEnvelope(text) {
  try {
    const parsed = JSON.parse(text);
    if (parsed?.version === 2 && parsed?.cipher === "AES-GCM" && parsed?.salt && parsed?.iv && parsed?.ciphertext) {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

async function restoreEncryptedBackup(envelope) {
  const ok = window.confirm("Restore this encrypted backup? Current local learning data will be replaced.");
  if (!ok) return;
  const passphrase = window.prompt("Enter the passphrase used for this encrypted backup.");
  if (!passphrase) return;

  try {
    const salt = base64ToBytes(envelope.salt);
    const key = await deriveAesKey(passphrase, salt);
    const restoredState = normalizeState(await decryptEnvelopeWithKey(envelope, key));
    state = restoredState;
    cryptoSalt = salt;
    cryptoKey = key;
    await saveState();
    els.importText.value = "";
    renderAll();
    showToast("Encrypted backup restored");
  } catch {
    showToast("Could not restore backup. Check the passphrase.");
  }
}

function parseImportPayload(text, context, source, confidentiality = "internal") {
  try {
    const parsed = JSON.parse(text);
    const records = Array.isArray(parsed) ? parsed : [parsed];
    return records
      .map((record) => ({
        jp: record.jp || record.content || record.text || "",
        en: record.en || "",
        context: record.context || context,
        register: record.register || "",
        confidentiality: record.confidentiality || confidentiality,
        tags: record.tags || [],
        whyBetter: record.whyBetter || record.why_better || "",
        source: record.sourceProject || record.source || source,
        sourcePath: record.sourcePath || "",
        sourceQuestionJp:
          record.sourceQuestionJp || record.questionJp || record.promptJp || record.originalQuestionJp || "",
        sourceQuestionEn:
          record.sourceQuestionEn || record.questionEn || record.promptEn || record.originalQuestionEn || "",
        title: record.title || "",
        createdAt: record.capturedAt || record.createdAt || new Date().toISOString(),
      }))
      .filter((record) => record.jp.trim().length > 0);
  } catch {
    return splitFreeText(text).map((chunk) => ({
      jp: chunk,
      context,
      confidentiality,
      source,
      title: firstLine(chunk),
    }));
  }
}

function splitFreeText(text) {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n(?=#{1,6}\s)|\n\s*\n|^-{3,}$/gm)
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .flatMap((part) => {
      if (part.length <= 1200) return [part];
      const chunks = [];
      for (let index = 0; index < part.length; index += 1200) {
        chunks.push(part.slice(index, index + 1200).trim());
      }
      return chunks;
    });
}

function handleImportFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    els.importText.value = String(reader.result || "");
    showToast(`${file.name} loaded`);
  };
  reader.readAsText(file);
}

async function exportState() {
  await pendingSave;
  const envelope = getStoredEnvelope();
  const payload = JSON.stringify(envelope, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `gk-eng-training-encrypted-${todayIso()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Encrypted backup exported");
}

function exportPlaintextState() {
  const hasRestricted = hasRestrictedContent();
  const message = hasRestricted
    ? "This will create a plaintext JSON file containing confidential content. Continue only if you will store it securely."
    : "This will create a plaintext JSON file. Continue?";
  if (!window.confirm(message)) return;
  const payload = JSON.stringify(state, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `gk-eng-training-plaintext-${todayIso()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Plaintext export started");
}

async function copyCodexPrompt() {
  const candidates = state.candidates.filter((candidate) => candidate.status !== "resolved").slice(0, 12);
  if (candidates.some((candidate) => candidate.confidentiality !== "public")) {
    const ok = window.confirm(
      "This prompt may include internal or confidential notes. Only copy it if you intend to paste it into an approved environment.",
    );
    if (!ok) return;
  }
  const prompt = [
    "以下の日本語メモを、Ginichi KuramasuがLP meeting / formal casual discussionで使える英語フレーズカードにしてください。",
    "出力はJSON配列。各要素は sourceQuestionJp, sourceQuestionEn, jp, en, context, register, tags, whyBetter を含めてください。",
    "Dears CapitalはESG/DEIファンドではなく、human capital-led value creationを通じた企業価値向上を重視するPEファンドとして表現してください。",
    "",
    JSON.stringify(candidates, null, 2),
  ].join("\n");

  try {
    await navigator.clipboard.writeText(prompt);
    showToast("Codex prompt copied");
  } catch {
    els.dataPreview.textContent = prompt;
    showToast("Prompt shown in Data panel");
  }
}

function renderImportPreview() {
  const restrictedCandidates = state.candidates.filter(
    (candidate) => candidate.status !== "resolved" && candidate.confidentiality !== "public",
  ).length;
  const preview = {
    storage: authSession ? "encrypted local vault + Supabase sync" : "encrypted local vault",
    signedIn: Boolean(authSession),
    syncStatus,
    remoteVaultUpdatedAt: remoteVaultMeta?.updatedAt || null,
    autoLockMinutes: Number(els.autoLockMinutes.value),
    phrases: state.phrases.length,
    due: duePhrases().length,
    candidates: state.candidates.filter((candidate) => candidate.status !== "resolved").length,
    restrictedCandidates,
    lastUpdated: state.updatedAt,
  };
  els.dataPreview.textContent = JSON.stringify(preview, null, 2);
}

function resetLocalData() {
  const ok = window.confirm("Reset the encrypted local vault and all learning data in this browser?");
  if (!ok) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  state = initialState();
  currentQuizId = null;
  saveState();
  renderAll();
  showToast("Local vault reset");
}

function statusSort(a, b) {
  if (a.status === b.status) return new Date(b.createdAt) - new Date(a.createdAt);
  return a.status === "open" ? -1 : 1;
}

function confidentialityClass(value) {
  if (value === "highly confidential") return "high";
  if (value === "confidential" || value === "internal") return "private";
  return "";
}

function hasRestrictedContent() {
  return [...state.phrases, ...state.candidates, ...state.intakes].some(
    (item) => (item.confidentiality || "internal") !== "public",
  );
}

function parseTags(value) {
  if (Array.isArray(value)) return value.map((tag) => String(tag).trim()).filter(Boolean);
  return String(value)
    .split(/[,\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function optionOrDefault(select, value) {
  return [...select.options].some((option) => option.value === value) ? value : select.options[0].value;
}

function todayIso() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000).toISOString().slice(0, 10);
}

function addDaysIso(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000).toISOString().slice(0, 10);
}

function formatDateLabel(date) {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "full",
  }).format(date);
}

function firstLine(text) {
  return text
    .split("\n")
    .map((line) => line.replace(/^#{1,6}\s+/, "").trim())
    .find(Boolean);
}

function seededShuffle(items, seed) {
  const list = [...items];
  let value = seed;
  for (let index = list.length - 1; index > 0; index -= 1) {
    value = (value * 9301 + 49297) % 233280;
    const random = value / 233280;
    const swapIndex = Math.floor(random * (index + 1));
    [list[index], list[swapIndex]] = [list[swapIndex], list[index]];
  }
  return list;
}

function hashString(input) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash) + 1;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    els.toast.classList.remove("show");
  }, 2200);
}
