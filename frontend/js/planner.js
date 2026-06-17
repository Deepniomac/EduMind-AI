import { escapeHtml, fetchBackendJson, renderShell } from "./auth.js"

const fallbackPlanner = {
  week_views: [
    {
      label: "Week 1",
      sessions: [
        { day: "Mon", title: "Pick your first topic", status: "Planned" },
        { day: "Tue", title: "Open the tutor", status: "Planned" },
        { day: "Wed", title: "Submit the first quiz", status: "Planned" },
        { day: "Thu", title: "Review the result", status: "Planned" },
        { day: "Fri", title: "Set the next study block", status: "Planned" },
      ],
    },
    {
      label: "Week 2",
      sessions: [
        { day: "Mon", title: "Return to the same topic", status: "Planned" },
        { day: "Tue", title: "Strengthen weak points", status: "Planned" },
        { day: "Wed", title: "Retake the checkpoint", status: "Planned" },
        { day: "Thu", title: "Add flashcards", status: "Planned" },
        { day: "Fri", title: "Plan the next cycle", status: "Planned" },
      ],
    },
  ],
  guidance: [
    { title: "Finish one lesson first", priority: "High" },
    { title: "Let the first quiz create your baseline", priority: "Medium" },
    { title: "Use planner after you have study activity", priority: "Medium" },
  ],
}

renderShell({
  activePage: "planner",
  eyebrow: "Weekly Planning",
  title: "Study Planner",
  description: "Navigate between weeks and inspect the current revision schedule as daily cards.",
  content: `<div id="planner-root"></div>`,
})

const root = document.getElementById("planner-root")
const state = {
  planner: fallbackPlanner,
  weekIndex: 0,
  message: "Loading planner data from the backend...",
  tone: "warning",
}

function render() {
  const current = state.planner.week_views[state.weekIndex]
  root.innerHTML = `
    <div class="inline-banner inline-banner--${state.tone}" style="margin-bottom: 20px;">${escapeHtml(state.message)}</div>
    <section class="dashboard-grid">
      <article class="card">
        <div class="planner-toolbar">
          <button id="previous-week" class="ghost-button" type="button">Previous week</button>
          <strong>${escapeHtml(current.label)}</strong>
          <button id="next-week" class="ghost-button" type="button">Next week</button>
        </div>
        <div class="planner-grid" style="margin-top: 16px;">
          ${current.sessions
            .map(
              (session) => `
                <div class="planner-day">
                  <p class="subtle-label">${escapeHtml(session.day)}</p>
                  <div class="planner-session">
                    <strong>${escapeHtml(session.title)}</strong>
                    <span class="status-pill ${session.status === "Completed" ? "status-pill--success" : session.status === "In progress" ? "status-pill--warning" : ""}">
                      ${escapeHtml(session.status)}
                    </span>
                  </div>
                </div>
              `,
            )
            .join("")}
        </div>
      </article>
      <article class="card">
        <p class="metric-card__label">Planner guidance</p>
        <div class="list-stack">
          ${state.planner.guidance
            .map(
              (item) => `
                <div class="list-row">
                  <span>${escapeHtml(item.title)}</span>
                  <strong>${escapeHtml(item.priority)}</strong>
                </div>
              `,
            )
            .join("")}
        </div>
      </article>
    </section>
  `

  document.getElementById("previous-week").addEventListener("click", () => {
    state.weekIndex = state.weekIndex === 0 ? state.planner.week_views.length - 1 : state.weekIndex - 1
    render()
  })

  document.getElementById("next-week").addEventListener("click", () => {
    state.weekIndex = (state.weekIndex + 1) % state.planner.week_views.length
    render()
  })
}

async function init() {
  render()
  try {
    state.planner = await fetchBackendJson("/me/planner")
    state.weekIndex = 0
    state.message = "Planner is now using backend-stored user data."
    state.tone = "success"
  } catch (error) {
    state.message = `${error.message} Falling back to local planner data.`
    state.tone = "danger"
  }
  render()
}

init()
