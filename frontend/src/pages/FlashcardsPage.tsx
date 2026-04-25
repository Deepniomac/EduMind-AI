import { useSession } from "../app/useSession"
import { PageHeader } from "../components/layout/PageHeader"
import { Card } from "../components/shared/Card"

const decks = ["Binary Trees", "OS Scheduling", "Sorting Algorithms", "Dynamic Programming"]

export function FlashcardsPage() {
  const { displayName, phase } = useSession()
  const phaseLabel = phase === "analyze" ? "Analyze" : "Re-learn"

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={`${phaseLabel} Review`}
        title={`Flashcards for ${displayName}`}
        description={`These cards now act as focused reinforcement for ${displayName}'s current ${phaseLabel.toLowerCase()} stage.`}
      />

      <section className="dashboard-grid">
        <Card title="Active revision card" subtitle="This active card is highlighted so the current review target stands out immediately.">
          <div className="flashcard flashcard--active">
            <p className="flashcard__label">Front</p>
            <h3>What is the time complexity of binary search?</h3>
            <p className="card-footnote">Tap to reveal the answer and verify that {displayName} still recalls it quickly.</p>
          </div>
          <div className="chip-row">
            <button className="app-chip">Again</button>
            <button className="app-chip">Hard</button>
            <button className="app-chip">Easy</button>
          </div>
        </Card>

        <Card title="Recovery deck list" subtitle={`Each deck item is highlighted as its own content box for easier scanning.`}>
          <div className="list-stack">
            {decks.map((deck, index) => (
              <div key={deck} className="list-row list-row--highlight">
                <span>{deck}</span>
                <strong>{index + 4} due</strong>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  )
}
