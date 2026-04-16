import { useSession } from "../app/session"
import { PageHeader } from "../components/layout/PageHeader"
import { Card } from "../components/shared/Card"

const metrics = [
  { label: "Re-learn Time", value: "18.4h", note: "Most time spent revisiting stacks and trees" },
  { label: "Revision Accuracy", value: "82%", note: "Recovered 3 weak concepts this week" },
  { label: "Mastery Recovery", value: "74", note: "12 topics moved back into safe range" },
  { label: "Revision Streak", value: "9 days", note: "Best recovery rhythm this month" },
]

const features = [
  { title: "Resume Re-learn Topic", value: "Stacks and DFS", progress: 92 },
  { title: "Retake Adaptive Quiz", value: "4 revision questions queued", progress: 88 },
  { title: "Review Weak Spots", value: "Recursion + OS scheduling", progress: 79 },
  { title: "Regenerate Flashcards", value: "6 missed ideas highlighted", progress: 84 },
]

const subjects = [
  { name: "Data Structures", progress: 91 },
  { name: "Operating Systems", progress: 74 },
  { name: "Algorithms", progress: 83 },
]

const cycleSteps = [
  { label: "Learn", progress: 100, status: "Completed base concept" },
  { label: "Test", progress: 100, status: "Checkpoint cleared" },
  { label: "Analyze", progress: 100, status: "Weaknesses isolated" },
  { label: "Adjust", progress: 100, status: "Plan already applied" },
  { label: "Re-learn", progress: 96, status: "Current active phase" },
]

const mapRows = [
  ["90", "94", "88", "84", "92", "95"],
  ["81", "87", "85", "96", "79", "83"],
  ["77", "82", "91", "89", "86", "80"],
]

export function DashboardPage() {
  const { displayName, phase } = useSession()
  const phaseLabel = phase === "analyze" ? "Analyze" : "Re-learn"
  const activeIndex = phase === "analyze" ? 2 : 4

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={`${phaseLabel} Overview`}
        title={`Learning dashboard for ${displayName}`}
        description={`${displayName} is currently in the ${phaseLabel.toLowerCase()} phase, so every panel now emphasizes the most relevant progress signals and next actions for this stage.`}
      />

      <section className="metrics-grid">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <p className="metric-card__label">{metric.label}</p>
            <p className="metric-card__value">{metric.value}</p>
            <p className="metric-card__note">{metric.note}</p>
          </Card>
        ))}
      </section>

      <section className="dashboard-grid">
        <Card title={`${phaseLabel} priorities`} subtitle={`The strongest next actions for ${displayName} in this phase.`}>
          <div className="feature-grid">
            {features.map((feature) => (
              <div key={feature.title} className="feature-card">
                <p className="feature-card__title">{feature.title}</p>
                <strong>{feature.value}</strong>
                <div className="progress-bar" aria-hidden="true">
                  <div style={{ width: `${feature.progress}%` }} />
                </div>
                <span>{feature.progress}% revision-ready</span>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Adaptive cycle tracker"
          subtitle="The tracker now adapts to the signed-in user's current workflow phase."
        >
          <div className="cycle-tracker cycle-tracker--visual">
            <div className="cycle-donut" aria-hidden="true">
              <div className="cycle-donut__inner">
                <strong>{phase === "analyze" ? "68%" : "96%"}</strong>
                <span>{phaseLabel}</span>
              </div>
            </div>

            <div className="cycle-legend">
              {cycleSteps.map((step, index) => (
                <div
                  key={step.label}
                  className={index === activeIndex ? "cycle-step cycle-step--active" : "cycle-step"}
                >
                  <div className="cycle-step__header">
                    <span>{index + 1}</span>
                    <strong>{step.label}</strong>
                    <em>{step.progress}%</em>
                  </div>
                  <small>{step.status}</small>
                  <div className="progress-bar cycle-step__progress" aria-hidden="true">
                    <div style={{ width: `${step.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="card-footnote">
            Current phase: {phaseLabel}. Suggestion for {displayName}: deepen stacks using one more targeted cycle.
          </p>
        </Card>
      </section>

      <section className="dashboard-grid">
        <Card title="Subject progress" subtitle={`${displayName}'s current subject standing for this learning phase.`}>
          <div className="subject-list">
            {subjects.map((subject) => (
              <div key={subject.name} className="subject-row">
                <div className="subject-row__header">
                  <span>{subject.name}</span>
                  <strong>{subject.progress}%</strong>
                </div>
                <div className="progress-bar" aria-hidden="true">
                  <div style={{ width: `${subject.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Knowledge preview" subtitle="These mastery cells represent the strongest and weakest topic pockets right now.">
          <div className="hashmap-preview">
            {mapRows.flatMap((row, rowIndex) =>
              row.map((value, columnIndex) => {
                const numericValue = Number(value)
                return (
                  <button
                    key={`${rowIndex}-${columnIndex}`}
                    className="hashmap-cell"
                    style={{ opacity: Math.max(0.28, numericValue / 100) }}
                  >
                    {value}
                  </button>
                )
              }),
            )}
          </div>
          <p className="card-footnote">Higher intensity means stronger mastery confidence for the signed-in learner.</p>
        </Card>
      </section>
    </div>
  )
}
