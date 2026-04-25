import { useState } from "react"
import { useSession } from "../app/useSession"
import { PageHeader } from "../components/layout/PageHeader"
import { Card } from "../components/shared/Card"

const weekViews = [
  {
    label: "Week 1",
    sessions: [
      { day: "Mon", title: "Stacks recap", status: "Completed" },
      { day: "Tue", title: "OS quiz recovery", status: "Completed" },
      { day: "Wed", title: "Flashcards sprint", status: "In progress" },
      { day: "Thu", title: "Mindmap revision", status: "Upcoming" },
      { day: "Fri", title: "Tutor deep dive", status: "Upcoming" },
      { day: "Sat", title: "Algorithms recovery", status: "Upcoming" },
      { day: "Sun", title: "Weekly recap", status: "Upcoming" },
    ],
  },
  {
    label: "Week 2",
    sessions: [
      { day: "Mon", title: "Queue reinforcement", status: "Upcoming" },
      { day: "Tue", title: "Scheduler revision", status: "Upcoming" },
      { day: "Wed", title: "DFS card review", status: "Upcoming" },
      { day: "Thu", title: "BST relearn block", status: "Upcoming" },
      { day: "Fri", title: "Greedy recap", status: "Upcoming" },
      { day: "Sat", title: "Mock quiz pass", status: "Upcoming" },
      { day: "Sun", title: "Reflection notes", status: "Upcoming" },
    ],
  },
]

export function StudyPlannerPage() {
  const { displayName, phase } = useSession()
  const [weekIndex, setWeekIndex] = useState(0)
  const currentWeek = weekViews[weekIndex]
  const phaseLabel = phase === "analyze" ? "Analyze" : "Re-learn"

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={`${phaseLabel} Planning`}
        title={`Weekly Scheduler for ${displayName}`}
        description={`This scheduler breaks ${displayName}'s ${phaseLabel.toLowerCase()} plan into individual day cards with week-by-week navigation.`}
      />

      <section className="dashboard-grid dashboard-grid--sidebar">
        <Card title="Weekly schedule" subtitle="Each day is now spaced vertically so the schedule feels less cramped.">
          <div className="planner-toolbar">
            <button
              className="planner-arrow"
              onClick={() => setWeekIndex((current) => (current === 0 ? weekViews.length - 1 : current - 1))}
            >
              ←
            </button>
            <strong>{currentWeek.label}</strong>
            <button
              className="planner-arrow"
              onClick={() => setWeekIndex((current) => (current + 1) % weekViews.length)}
            >
              →
            </button>
          </div>

          <div className="planner-grid planner-grid--vertical">
            {currentWeek.sessions.map((session) => (
              <div key={`${currentWeek.label}-${session.day}`} className="planner-day">
                <p className="planner-day__label">{session.day}</p>
                <div className="planner-session">
                  <strong>{session.title}</strong>
                  <span
                    className={
                      session.status === "Completed"
                        ? "planner-session__status planner-session__status--done"
                        : session.status === "In progress"
                          ? "planner-session__status planner-session__status--active"
                          : "planner-session__status"
                    }
                  >
                    {session.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="AI recommendations" subtitle={`Suggestions adapted to ${displayName}'s current ${phaseLabel.toLowerCase()} phase.`}>
          <div className="chip-row chip-row--recommendations">
            <span className="app-chip app-chip--active">Prioritize stack retention for {displayName}</span>
            <span className="app-chip">Add one more DFS flashcard review</span>
            <span className="app-chip">Keep Saturday focused on recovery only</span>
          </div>
          <div className="detail-block">
            <p className="metric-card__label">Daily goal</p>
            <h3>2 of 3 recovery sessions completed</h3>
            <div className="progress-bar" aria-hidden="true">
              <div style={{ width: "66%" }} />
            </div>
          </div>
        </Card>
      </section>
    </div>
  )
}
