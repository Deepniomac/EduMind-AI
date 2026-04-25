import { useSession } from "../app/useSession"
import { PageHeader } from "../components/layout/PageHeader"
import { Card } from "../components/shared/Card"

const options = [
  "A stack follows LIFO order",
  "A queue always removes from the middle",
  "A graph can never contain cycles",
  "An array automatically balances itself",
]

export function QuizPage() {
  const { displayName, phase } = useSession()
  const phaseLabel = phase === "analyze" ? "Analyze" : "Re-learn"

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={`${phaseLabel} Practice`}
        title={`Adaptive Quiz for ${displayName}`}
        description={`This quiz view reflects ${displayName}'s current ${phaseLabel.toLowerCase()} stage and keeps the checkpoint focused on the next useful question.`}
      />

      <section className="dashboard-grid">
        <Card title={`${phaseLabel} checkpoint`} subtitle="Single-question validation aligned with the learner's current phase.">
          <div className="quiz-question">
            <p className="quiz-question__eyebrow">{phaseLabel} Question 4 of 12</p>
            <h3>Which statement correctly describes a stack?</h3>
            <div className="quiz-options">
              {options.map((option, index) => (
                <button
                  key={option}
                  className={index === 0 ? "quiz-option quiz-option--correct" : "quiz-option"}
                >
                  {option}
                </button>
              ))}
            </div>
            <p className="card-footnote">Suggestion for {displayName}: if this stays easy, move to a harder DFS-linked stack question next.</p>
          </div>
        </Card>

        <Card title="Question map" subtitle="Jump between checkpoints and verify that concepts stay stable.">
          <div className="question-map">
            {Array.from({ length: 12 }, (_, index) => (
              <button
                key={index}
                className={index < 11 ? "question-dot question-dot--done" : "question-dot"}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div className="stats-inline">
            <span>Recovered: 11</span>
            <span>Correct: 10</span>
            <span>Confidence: high</span>
          </div>
        </Card>
      </section>
    </div>
  )
}
