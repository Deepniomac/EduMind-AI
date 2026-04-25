import { useState } from "react"
import { useSession } from "../app/useSession"
import { PageHeader } from "../components/layout/PageHeader"
import { Card } from "../components/shared/Card"

type SubjectCell = {
  label: string
  mastery: number
  highlight?: boolean
}

const subjectMaps: Record<string, SubjectCell[]> = {
  "Data Structures": [
    { label: "Array", mastery: 78 },
    { label: "Stack", mastery: 92, highlight: true },
    { label: "Queue", mastery: 64 },
    { label: "Linked", mastery: 58 },
    { label: "Tree", mastery: 69 },
    { label: "Graph", mastery: 53 },
    { label: "Heap", mastery: 48 },
    { label: "Hash", mastery: 71 },
    { label: "Trie", mastery: 44 },
    { label: "BST", mastery: 68 },
    { label: "DFS", mastery: 75 },
    { label: "BFS", mastery: 73 },
  ],
  "Operating Systems": [
    { label: "CPU", mastery: 62 },
    { label: "Threads", mastery: 56 },
    { label: "Deadlock", mastery: 48 },
    { label: "Paging", mastery: 66 },
    { label: "Cache", mastery: 60 },
    { label: "IO", mastery: 58 },
    { label: "FS", mastery: 64 },
    { label: "IPC", mastery: 51 },
    { label: "Sync", mastery: 57 },
    { label: "Sched", mastery: 67 },
    { label: "Mutex", mastery: 55 },
    { label: "VM", mastery: 61 },
  ],
  Algorithms: [
    { label: "Sort", mastery: 73 },
    { label: "Search", mastery: 76 },
    { label: "Greedy", mastery: 59 },
    { label: "DP", mastery: 54 },
    { label: "Backtrack", mastery: 47 },
    { label: "Divide", mastery: 70 },
    { label: "Graphs", mastery: 66 },
    { label: "MST", mastery: 52 },
    { label: "SP", mastery: 63 },
    { label: "String", mastery: 58 },
    { label: "Math", mastery: 61 },
    { label: "Bit", mastery: 50 },
  ],
}

const tabs = Object.keys(subjectMaps) as Array<keyof typeof subjectMaps>

export function KnowledgeMapPage() {
  const { displayName, phase } = useSession()
  const [activeTab, setActiveTab] = useState<keyof typeof subjectMaps>("Data Structures")
  const activeCells = subjectMaps[activeTab]
  const phaseLabel = phase === "analyze" ? "Analyze" : "Re-learn"

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={`${phaseLabel} Insights`}
        title={`Knowledge Map for ${displayName}`}
        description={`These subject hashmaps show where ${displayName} is concentrating mastery during the current ${phaseLabel.toLowerCase()} phase.`}
      />

      <section className="dashboard-grid dashboard-grid--sidebar">
        <Card title="Subject hashmaps" subtitle="These cells are larger, vertically arranged, and centered for easier scanning.">
          <div className="chip-row">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={tab === activeTab ? "app-chip app-chip--active" : "app-chip"}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="hashmap-preview hashmap-preview--vertical">
            {activeCells.map((cell) => (
              <button
                key={cell.label}
                className={cell.highlight ? "hashmap-cell hashmap-cell--highlight" : "hashmap-cell"}
                style={{ opacity: Math.max(0.3, cell.mastery / 100) }}
              >
                <span className="hashmap-cell__label">{cell.label}</span>
              </button>
            ))}
          </div>
          <p className="card-footnote">
            The highlighted cell shows the strongest topic for {displayName} inside the current subject map.
          </p>
        </Card>

        <Card title="Topic drawer preview" subtitle="This panel reflects the current strongest topic in the selected subject.">
          <div className="detail-block">
            <p className="metric-card__label">Topic</p>
            <h3>Stack</h3>
            <p className="metric-card__note">
              Mastery 92% • Last quiz 5/5 • Next action: help {displayName} connect stack logic to DFS problems.
            </p>
          </div>
        </Card>
      </section>
    </div>
  )
}
