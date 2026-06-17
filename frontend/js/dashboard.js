import { escapeHtml, fetchBackendJson, getPhaseIndex, getPhaseLabel, renderShell } from "./auth.js"

const fallbackData = {
  metrics: [
    { label: "Study Time", value: "0h", note: "No study sessions recorded yet" },
    { label: "Revision Accuracy", value: "0%", note: "Take the first quiz to build a baseline" },
    { label: "Mastery Score", value: "0", note: "Your first lesson will populate this" },
    { label: "Streak", value: "0 days", note: "Begin a session to start tracking" },
  ],
  priorities: [
    { title: "Start your first lesson", value: "Choose any topic", progress: 0 },
    { title: "Take the opening quiz", value: "Answers will build your profile", progress: 0 },
    { title: "Review the first result", value: "Analysis appears after submission", progress: 0 },
    { title: "Plan the next session", value: "Planner fills in after activity", progress: 0 },
  ],
  subjects: [
    { name: "Data Structures", progress: 0 },
    { name: "Operating Systems", progress: 0 },
    { name: "Algorithms", progress: 0 },
  ],
  cycle_steps: [
    { label: "Learn", progress: 0, status: "Waiting for your first topic" },
    { label: "Test", progress: 0, status: "No quiz answers yet" },
    { label: "Analyze", progress: 0, status: "No analysis generated yet" },
    { label: "Adjust", progress: 0, status: "Revision plan will appear here" },
    { label: "Re-learn", progress: 0, status: "No reinforcement session yet" },
  ],
  knowledge_preview: [],
  donut_value: "0%",
  suggestion: "Start a first study session to generate real progress.",
}

const session = renderShell({
  activePage: "dashboard",
  eyebrow: "Adaptive Overview",
  title: "Learning dashboard",
  description: "A learner-centered snapshot of progress, recovery strength, and the next best actions inside EduMind.",
  content: `<div id="dashboard-root"></div>`,
})

const root = document.getElementById("dashboard-root")

function renderStatus(message, tone = "warning") {
  return `<div class="inline-banner inline-banner--${tone}" style="margin-bottom: 20px;">${escapeHtml(message)}</div>`
}

function renderDashboard(data, statusMessage = "") {
  const phaseLabel = getPhaseLabel(data.phase ?? session.phase)
  const activeIndex = getPhaseIndex(data.phase ?? session.phase)
  const knowledgePreview = data.knowledge_preview?.length
    ? `
        <div class="hashmap-preview">
          ${data.knowledge_preview
            .map(
              (value) => `
                <div class="hashmap-cell" style="opacity:${Math.max(0.28, Number(value) / 100)}">${escapeHtml(value)}</div>
              `,
            )
            .join("")}
        </div>
      `
    : '<div class="empty-state">No mastery data yet. Start a study session to populate this view.</div>'

  root.innerHTML = `
    ${statusMessage}
    <section class="metrics-grid">
      ${data.metrics
        .map(
          (metric) => `
            <article class="card">
              <p class="metric-card__label">${escapeHtml(metric.label)}</p>
              <p class="metric-card__value">${escapeHtml(metric.value)}</p>
              <p class="card-note">${escapeHtml(metric.note)}</p>
            </article>
          `,
        )
        .join("")}
    </section>

    <section class="dashboard-grid" style="margin-top: 20px;">
      <article class="card">
        <p class="metric-card__label">${escapeHtml(phaseLabel)} priorities for ${escapeHtml(data.display_name ?? session.displayName)}</p>
        <div class="feature-grid">
          ${data.priorities
            .map(
              (item) => `
                <div class="feature-card">
                  <strong>${escapeHtml(item.title)}</strong>
                  <span>${escapeHtml(item.value)}</span>
                  <div class="progress-bar"><div style="width:${item.progress}%"></div></div>
                  <span class="muted">${item.progress}% revision-ready</span>
                </div>
              `,
            )
            .join("")}
        </div>
      </article>

      <article class="card">
        <p class="metric-card__label">Learning cycle tracker</p>
        <div class="cycle-tracker">
          <div class="cycle-donut">
            <div class="cycle-donut__inner">
              <strong>${escapeHtml(data.donut_value)}</strong>
              <span>${escapeHtml(phaseLabel)}</span>
            </div>
          </div>
          ${data.cycle_steps
            .map(
              (step, index) => `
                <div class="cycle-step ${index === activeIndex ? "cycle-step--active" : ""}">
                  <div class="cycle-step__header">
                    <span>${index + 1}</span>
                    <strong>${escapeHtml(step.label)}</strong>
                    <span>${step.progress}%</span>
                  </div>
                  <p class="card-note">${escapeHtml(step.status)}</p>
                  <div class="progress-bar"><div style="width:${step.progress}%"></div></div>
                </div>
              `,
            )
            .join("")}
        </div>
        <p class="card-note" style="margin-top: 14px;">${escapeHtml(data.suggestion)}</p>
      </article>
    </section>

    <section class="dashboard-grid" style="margin-top: 20px;">
      <article class="card">
        <p class="metric-card__label">Subject progress bars</p>
        <div class="subject-list">
          ${data.subjects
            .map(
              (subject) => `
                <div>
                  <div class="subject-row__header">
                    <strong>${escapeHtml(subject.name)}</strong>
                    <span>${subject.progress}%</span>
                  </div>
                  <div class="progress-bar"><div style="width:${subject.progress}%"></div></div>
                </div>
              `,
            )
            .join("")}
        </div>
      </article>

      <article class="card">
        <p class="metric-card__label">Knowledge preview</p>
        ${knowledgePreview}
        <p class="card-note" style="margin-top: 14px;">Higher intensity means stronger mastery confidence for the signed-in learner.</p>
      </article>
    </section>
  `
}

async function init() {
  root.innerHTML = renderStatus("Loading dashboard data from the backend...", "warning")

  try {
    const data = await fetchBackendJson("/me/dashboard")
    renderDashboard(data, renderStatus("Dashboard is now using backend-supplied learner data.", "success"))
  } catch (error) {
    renderDashboard(
      { ...fallbackData, display_name: session.displayName, phase: session.phase },
      renderStatus(`${error.message} Falling back to local dashboard data.`, "danger"),
    )
  }
}

init()
