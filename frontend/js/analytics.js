import { renderShell } from "./auth.js"

const heatmapValues = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
]

const performance = [
  { label: "Mon", value: 0 },
  { label: "Tue", value: 0 },
  { label: "Wed", value: 0 },
  { label: "Thu", value: 0 },
  { label: "Fri", value: 0 },
]

const recent = ["No activity recorded yet. Start your first session to populate analytics."]

renderShell({
  activePage: "analytics",
  eyebrow: "Progress & Analytics",
  title: "Analytics",
  description: "Track study activity, visualize progress, and review recent learning performance.",
  content: `
    <section class="dashboard-grid">
      <article class="card">
        <p class="metric-card__label">Study activity section</p>
        <div class="heatmap">
          ${heatmapValues
            .flatMap((week) =>
              week.map((value) => `<div class="heatmap-cell" style="opacity:${0.18 + value * 0.18}">${value}</div>`),
            )
            .join("")}
        </div>
      </article>
      <article class="card">
        <p class="metric-card__label">Progress chart section</p>
        <div class="chart-bars">
          ${performance
            .map(
              (item) => `
                <div class="chart-bar">
                  <div class="chart-bar__fill" style="height:${item.value}%"></div>
                  <strong>${item.label}</strong>
                </div>
              `,
            )
            .join("")}
        </div>
      </article>
    </section>
    <section class="card" style="margin-top: 20px;">
      <p class="metric-card__label">Recent performance section</p>
      <div class="activity-list">
        ${recent.map((item) => `<div class="list-row"><span>${item}</span><strong>Today</strong></div>`).join("")}
      </div>
    </section>
  `,
})
