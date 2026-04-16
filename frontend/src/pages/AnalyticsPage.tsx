import { useSession } from "../app/session"
import { PageHeader } from "../components/layout/PageHeader"
import { Card } from "../components/shared/Card"

const weeks = [
  [1, 2, 1, 3, 4, 2, 0],
  [0, 1, 2, 2, 3, 4, 2],
  [1, 3, 4, 2, 1, 2, 3],
  [2, 4, 3, 4, 2, 1, 1],
  [3, 2, 1, 3, 4, 3, 2],
]

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const activities = [
  "Completed adaptive re-learn quiz on stacks",
  "Reviewed 14 flashcards in Algorithms",
  "Generated next week's recovery planner",
  "Asked tutor for a deeper recursion re-learn explanation",
]

export function AnalyticsPage() {
  const { displayName, phase } = useSession()
  const phaseLabel = phase === "analyze" ? "Analyze" : "Re-learn"

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={`${phaseLabel} Insights`}
        title={`Progress & Analytics for ${displayName}`}
        description={`This analytics view measures progress for ${displayName}'s current ${phaseLabel.toLowerCase()} phase.`}
      />

      <section className="dashboard-grid">
        <Card title="Activity heatmap" subtitle={`A denser weekly view with labels and a clearer activity legend for ${phaseLabel.toLowerCase()} sessions.`}>
          <div className="heatmap-wrapper">
            <div className="heatmap-axis">
              {weekdayLabels.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="heatmap-grid heatmap-grid--enhanced">
              {weeks.flatMap((week, rowIndex) =>
                week.map((value, columnIndex) => (
                  <div
                    key={`${rowIndex}-${columnIndex}`}
                    className="heatmap-cell"
                    style={{ opacity: 0.18 + value * 0.18 }}
                    title={`${weekdayLabels[columnIndex]}: ${value} study block(s)`}
                  >
                    {value}
                  </div>
                )),
              )}
            </div>
          </div>
          <div className="heatmap-legend">
            <span>Light</span>
            <div className="heatmap-legend__scale">
              {[1, 2, 3, 4].map((value) => (
                <span key={value} style={{ opacity: 0.18 + value * 0.18 }} />
              ))}
            </div>
            <span>Deep focus</span>
          </div>
        </Card>

        <Card title="Recent activity" subtitle={`A visible feed of the latest work ${displayName} completed most recently.`}>
          <div className="list-stack">
            {activities.map((activity) => (
              <div key={activity} className="list-row">
                <span>{activity}</span>
                <strong>Today</strong>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  )
}
