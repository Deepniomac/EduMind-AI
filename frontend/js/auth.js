const SESSION_KEY = "edumind-session"

export const backendBaseUrl = "http://127.0.0.1:8000"

export const demoUsers = [
  { username: "Thanuja", password: "EduMind123", displayName: "Thanuja", phase: "learn" },
  { username: "Deepesh", password: "EduMind123", displayName: "Deepesh", phase: "test" },
  { username: "Hemanth", password: "EduMind123", displayName: "Hemanth", phase: "analyze" },
  { username: "Murali", password: "EduMind123", displayName: "Murali", phase: "relearn" },
]

const PHASE_ORDER = ["learn", "test", "analyze", "adjust", "relearn"]

const PHASE_LABELS = {
  learn: "Learn",
  test: "Test",
  analyze: "Analyze",
  adjust: "Adjust",
  relearn: "Re-learn",
}

const navItems = [
  { href: "./dashboard.html", id: "dashboard", label: "Dashboard", meta: "Progress and cycle overview", icon: "DB" },
  { href: "./tutor.html", id: "tutor", label: "AI Tutor", meta: "Learn, test, analyze, adjust", icon: "AI" },
  { href: "./quiz.html", id: "quiz", label: "Quiz", meta: "Checkpoint practice flow", icon: "QZ" },
  { href: "./flashcards.html", id: "flashcards", label: "Flashcards", meta: "Fast retention review", icon: "FC" },
  { href: "./analytics.html", id: "analytics", label: "Analytics", meta: "Performance and activity", icon: "AN" },
  { href: "./knowledge-map.html", id: "knowledge-map", label: "Knowledge Map", meta: "Subject mastery view", icon: "KM" },
  { href: "./mindmap.html", id: "mindmap", label: "Mindmap", meta: "Concept cluster explorer", icon: "MM" },
  { href: "./planner.html", id: "planner", label: "Planner", meta: "Weekly study schedule", icon: "PL" },
]

function normalizePhase(phase) {
  return PHASE_ORDER.includes(phase) ? phase : "relearn"
}

function normalizeSession(session) {
  if (!session) return null
  return {
    token: session.token,
    username: session.username,
    displayName: session.displayName ?? session.display_name ?? session.username,
    phase: normalizePhase(session.phase),
  }
}

function authHeaders(baseHeaders = {}) {
  const session = getSession()
  if (!session?.token) return baseHeaders
  return { ...baseHeaders, Authorization: `Bearer ${session.token}` }
}

export function getPhaseLabel(phase) {
  return PHASE_LABELS[normalizePhase(phase)] ?? "Re-learn"
}

export function getPhaseIndex(phase) {
  const normalized = normalizePhase(phase)
  const index = PHASE_ORDER.indexOf(normalized)
  return index >= 0 ? index : PHASE_ORDER.length - 1
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

export async function fetchBackendJson(path, options = {}) {
  const nextOptions = { ...options }
  nextOptions.headers = authHeaders(options.headers ?? {})

  const response = await fetch(`${backendBaseUrl}${path}`, nextOptions)
  if (!response.ok) {
    const bodyText = await response.text().catch(() => "")
    throw new Error(`Backend error: ${response.status} ${bodyText}`.trim())
  }
  return response.json()
}

export function getSession() {
  try {
    const stored = window.localStorage.getItem(SESSION_KEY)
    if (!stored) return null
    return normalizeSession(JSON.parse(stored))
  } catch {
    window.localStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function saveSession(session) {
  const normalized = normalizeSession(session)
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(normalized))
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY)
}

export async function loginUser(username, password) {
  const data = await fetchBackendJson("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })

  const session = {
    token: data.token,
    username: data.user.username,
    displayName: data.user.display_name,
    phase: data.user.phase,
  }
  saveSession(session)
  return session
}

export async function registerUser(username, password, displayName) {
  const data = await fetchBackendJson("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, display_name: displayName || username }),
  })

  const session = {
    token: data.token,
    username: data.user.username,
    displayName: data.user.display_name,
    phase: data.user.phase,
  }
  saveSession(session)
  return session
}

export async function loadCurrentUser() {
  const session = getSession()
  if (!session?.token) return null

  const data = await fetchBackendJson("/auth/me")
  const updated = {
    token: session.token,
    username: data.username,
    displayName: data.display_name,
    phase: data.phase,
  }
  saveSession(updated)
  return updated
}

export function requireAuth() {
  const session = getSession()
  if (!session?.token) {
    window.location.href = "./login.html"
    throw new Error("Authentication required")
  }
  return session
}

export async function logout() {
  const session = getSession()
  try {
    if (session?.token) {
      await fetchBackendJson("/auth/logout", { method: "POST" })
    }
  } catch {
    // Ignore logout request failures and clear the local session anyway.
  }

  clearSession()
  window.location.href = "./login.html"
}

export function redirectFromIndex() {
  window.location.replace(getSession() ? "./dashboard.html" : "./login.html")
}

export function renderShell({ activePage, title, eyebrow, description, content, topbarNote = "Adaptive learning workspace" }) {
  const session = requireAuth()
  document.title = `${title} | EduMind`

  const sidebarMarkup = navItems
    .map(
      (item) => `
        <a href="${item.href}" class="nav-item ${item.id === activePage ? "nav-item--active" : ""}">
          <span class="nav-item__icon" aria-hidden="true">${item.icon}</span>
          <span class="nav-item__body">
            <strong>${item.label}</strong>
            <span class="nav-item__meta">${item.meta}</span>
          </span>
        </a>
      `,
    )
    .join("")

  document.getElementById("app").innerHTML = `
    <div class="app-shell">
      <aside class="app-sidebar" id="app-sidebar">
        <div class="sidebar-head">
          <span class="section-eyebrow">EduMind Menu</span>
          <button class="ghost-button sidebar-close-button" id="sidebar-close-button" type="button">Close</button>
        </div>
        <div class="sidebar-nav-wrap">
          <div class="sidebar-nav-header">
            <span class="section-eyebrow">Menu</span>
            <span class="status-pill status-pill--success">8 Pages</span>
          </div>
          <nav class="sidebar-nav" aria-label="Study navigation">${sidebarMarkup}</nav>
        </div>
      </aside>
      <main class="app-main">
        <header class="topbar">
          <div class="topbar-main">
            <button class="ghost-button mobile-menu-button" id="menu-button" type="button">Menu</button>
            <div class="topbar-copy">
              <p class="section-eyebrow">EduMind</p>
              <strong class="topbar-title">${escapeHtml(title)}</strong>
              <div class="muted">${escapeHtml(topbarNote)}</div>
            </div>
            <div class="topbar-session">
              <span class="status-pill status-pill--success">Signed In</span>
              <span class="topbar-session__name">${escapeHtml(session.displayName)} · ${escapeHtml(getPhaseLabel(session.phase))}</span>
            </div>
          </div>
          <div class="topbar-actions">
            <span class="status-pill status-pill--success">FastAPI + SQLite</span>
            <button class="ghost-button" id="logout-button" type="button">Log Out</button>
            <a href="./tutor.html" class="app-button">Open Tutor</a>
          </div>
        </header>
        <section class="shell-content">
          <div class="page-header">
            <p class="section-eyebrow">${escapeHtml(eyebrow)}</p>
            <h2>${escapeHtml(title)}</h2>
            <p>${escapeHtml(description)}</p>
          </div>
          ${content}
        </section>
      </main>
    </div>
  `

  const appSidebar = document.getElementById("app-sidebar")
  const menuButton = document.getElementById("menu-button")

  menuButton?.addEventListener("click", () => {
    if (appSidebar) {
      appSidebar.classList.toggle("is-open")
    }
  })

  document.getElementById("sidebar-close-button")?.addEventListener("click", () => {
    appSidebar?.classList.remove("is-open")
  })

  document.getElementById("logout-button")?.addEventListener("click", () => {
    void logout()
  })

  return session
}

function renderLoginPage() {
  if (getSession()) {
    window.location.href = "./dashboard.html"
    return
  }

  const demoCards = demoUsers
    .map(
      (user) => `
        <div class="demo-user-card">
          <div>
            <strong>${escapeHtml(user.displayName)}</strong>
            <div class="muted">${escapeHtml(getPhaseLabel(user.phase))} phase · seeded dashboard, quiz, and planner data</div>
          </div>
          <button class="app-button" data-demo-user="${escapeHtml(user.username)}" data-demo-password="${escapeHtml(user.password)}" type="button">Continue as ${escapeHtml(user.username)}</button>
        </div>
      `,
    )
    .join("")

  document.getElementById("app").innerHTML = `
    <main class="login-shell">
      <section class="login-hero">
        <p class="section-eyebrow">EduMind Access</p>
        <h1>Adaptive learning that closes weak spots with intention.</h1>
        <p>Create a real account or use one of the seeded demo users backed by the FastAPI database.</p>
        <div class="cycle-ribbon">
          <span>Learn</span>
          <span>Test</span>
          <span>Analyze</span>
          <span>Adjust</span>
          <span>Re-learn</span>
        </div>
      </section>
      <section class="login-card">
        <div>
          <p class="section-eyebrow">Sign In or Register</p>
          <h2>Open your learner workspace</h2>
          <p class="muted">Accounts are now stored in SQLite, passwords are hashed, and the session is saved locally with a backend token.</p>
        </div>
        <form class="login-form" id="login-form">
          <label class="field">
            <span>Display Name</span>
            <input id="display-name" placeholder="Used when creating a new account" />
          </label>
          <label class="field">
            <span>Username</span>
            <input id="username" autocomplete="username" placeholder="Enter a username" />
          </label>
          <label class="field">
            <span>Password</span>
            <input id="password" type="password" autocomplete="current-password" placeholder="Enter a password" />
          </label>
          <div class="mode-toggle">
            <button class="app-button" id="login-button" type="submit">Sign In</button>
            <button class="ghost-button" id="register-button" type="button">Create Account</button>
          </div>
        </form>
        <div class="login-demo-list">${demoCards}</div>
        <p id="login-feedback" class="muted">Demo password for both seeded demo users: <strong>EduMind123</strong></p>
      </section>
    </main>
  `

  const feedback = document.getElementById("login-feedback")
  const getFieldValues = () => ({
    displayName: document.getElementById("display-name")?.value ?? "",
    username: document.getElementById("username")?.value ?? "",
    password: document.getElementById("password")?.value ?? "",
  })

  document.getElementById("login-form")?.addEventListener("submit", async (event) => {
    event.preventDefault()
    const { username, password } = getFieldValues()

    try {
      const session = await loginUser(username, password)
      feedback.textContent = `Signed in as ${session.displayName}. Redirecting to dashboard...`
      feedback.className = "success-text"
      window.location.href = "./dashboard.html"
    } catch (error) {
      feedback.textContent = error.message
      feedback.className = "error-text"
    }
  })

  document.getElementById("register-button")?.addEventListener("click", async () => {
    const { displayName, username, password } = getFieldValues()

    try {
      const session = await registerUser(username, password, displayName)
      feedback.textContent = `Account created for ${session.displayName}. Redirecting to dashboard...`
      feedback.className = "success-text"
      window.location.href = "./dashboard.html"
    } catch (error) {
      feedback.textContent = error.message
      feedback.className = "error-text"
    }
  })

  document.querySelectorAll("[data-demo-user]").forEach((button) => {
    button.addEventListener("click", async () => {
      const username = button.getAttribute("data-demo-user")
      const password = button.getAttribute("data-demo-password")
      try {
        const session = await loginUser(username, password)
        feedback.textContent = `Signed in as ${session.displayName}. Redirecting to dashboard...`
        feedback.className = "success-text"
        window.location.href = "./dashboard.html"
      } catch (error) {
        feedback.textContent = error.message
        feedback.className = "error-text"
      }
    })
  })
}

if (window.location.pathname.endsWith("/login.html") || window.location.pathname.endsWith("\\login.html")) {
  renderLoginPage()
}
