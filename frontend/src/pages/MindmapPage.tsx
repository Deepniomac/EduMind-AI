import { useState } from "react"
import { useSession } from "../app/session"
import { PageHeader } from "../components/layout/PageHeader"
import { Card } from "../components/shared/Card"

type NodeInfo = {
  title: string
  note: string
  confidence: string
  nextUse: string
}

const supportedTopic = "Data Structures"

const nodeDetails: Record<string, NodeInfo> = {
  "Data Structures": {
    title: "Data Structures",
    note: "The central re-learn topic connecting storage patterns and retrieval behavior.",
    confidence: "High",
    nextUse: "Review how each child concept supports problem solving speed.",
  },
  Arrays: {
    title: "Arrays",
    note: "Contiguous storage with fast index access but costly middle insertions.",
    confidence: "Medium",
    nextUse: "Compare arrays with linked lists in revision notes.",
  },
  Stacks: {
    title: "Stacks",
    note: "LIFO structure used in recursion, undo systems, and DFS.",
    confidence: "High",
    nextUse: "Reconnect the stack model to the tutor re-learn question.",
  },
  Queues: {
    title: "Queues",
    note: "FIFO behavior that appears in scheduling and BFS flows.",
    confidence: "Medium",
    nextUse: "Contrast it with stacks using one real-world example.",
  },
  "Linked Lists": {
    title: "Linked Lists",
    note: "Node-based structure with efficient inserts but slower random access.",
    confidence: "Medium",
    nextUse: "Review pointer navigation and memory tradeoffs.",
  },
  Trees: {
    title: "Trees",
    note: "Hierarchical structure useful for search and recursive traversal.",
    confidence: "Medium",
    nextUse: "Tie tree traversal back to stack behavior.",
  },
  Graphs: {
    title: "Graphs",
    note: "General network model for connectivity, traversal, and shortest path thinking.",
    confidence: "Developing",
    nextUse: "Re-learn traversal strategies after stack mastery is secure.",
  },
  Hashing: {
    title: "Hashing",
    note: "Maps keys to buckets for fast lookup in average cases.",
    confidence: "Medium",
    nextUse: "Review collisions and load factor behavior.",
  },
  Heaps: {
    title: "Heaps",
    note: "Priority-friendly tree structure commonly used in scheduling and optimization.",
    confidence: "Developing",
    nextUse: "Practice insert and delete flow with one min-heap example.",
  },
  Tries: {
    title: "Tries",
    note: "Prefix tree useful for dictionaries and autocomplete.",
    confidence: "Developing",
    nextUse: "Compare trie paths with tree edge traversal.",
  },
}

const nodePositions = [
  { id: "Data Structures", x: "50%", y: "18%", root: true },
  { id: "Arrays", x: "24%", y: "49%" },
  { id: "Stacks", x: "42%", y: "49%" },
  { id: "Queues", x: "62%", y: "49%" },
  { id: "Linked Lists", x: "82%", y: "49%" },
  { id: "Tries", x: "18%", y: "78%" },
  { id: "Trees", x: "36%", y: "78%" },
  { id: "Graphs", x: "54%", y: "78%" },
  { id: "Hashing", x: "73%", y: "78%" },
  { id: "Heaps", x: "88%", y: "78%" },
] as const satisfies ReadonlyArray<{ id: string; x: string; y: string; root?: boolean }>

export function MindmapPage() {
  const { displayName, phase } = useSession()
  const [topic, setTopic] = useState(supportedTopic)
  const [generatedTopic, setGeneratedTopic] = useState(supportedTopic)
  const [activeNode, setActiveNode] = useState("Stacks")

  const isGenerated = generatedTopic.toLowerCase() === supportedTopic.toLowerCase()
  const phaseLabel = phase === "analyze" ? "Analyze" : "Re-learn"

  function handleGenerate() {
    if (topic.trim().toLowerCase() === supportedTopic.toLowerCase()) {
      setGeneratedTopic(supportedTopic)
    }
  }

  const info = nodeDetails[activeNode]

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={`${phaseLabel} Mapping`}
        title={`Mindmap Generator for ${displayName}`}
        description={`This map now stays cleaner and focuses on clickable concept nodes so ${displayName} can inspect the current ${phaseLabel.toLowerCase()} structure more clearly.`}
      />

      <section className="dashboard-grid dashboard-grid--mindmap">
        <Card
          title="Generator controls"
          subtitle="The page stays focused on Data Structures for a clean concept map."
        >
          <div className="toolbar-row toolbar-row--mindmap">
            <input className="app-input" value={topic} onChange={(event) => setTopic(event.target.value)} />
            <button className="app-button" onClick={handleGenerate}>
              Generate
            </button>
          </div>
          <div className="chip-row chip-row--mindmap">
            <span className="app-chip app-chip--active">Phase: {phaseLabel}</span>
            <span className="app-chip">Mode: concept cluster</span>
            <span className="app-chip">Focus learner: {displayName}</span>
          </div>
          <p className="card-footnote">Generate "Data Structures" to keep the concept map visible.</p>
        </Card>

        <Card title="Rendered mindmap" subtitle="Click any node to inspect what it means and what should be revised next.">
          {isGenerated ? (
            <div className="mindmap-panel">
              <div className="mindmap-frame mindmap-frame--canvas">
                {nodePositions.map((node) => (
                  <button
                    key={node.id}
                    className={
                      activeNode === node.id
                        ? "mindmap-node mindmap-node--active"
                        : "root" in node && node.root
                          ? "mindmap-node mindmap-node--root"
                          : "mindmap-node"
                    }
                    style={{ left: node.x, top: node.y }}
                    onClick={() => setActiveNode(node.id)}
                  >
                    {node.id}
                  </button>
                ))}
              </div>

              <div className="mindmap-inspector">
                <p className="metric-card__label">Selected node</p>
                <h3>{info.title}</h3>
                <p className="metric-card__note">{info.note}</p>
                <div className="mindmap-inspector__meta">
                  <span className="app-chip">Confidence: {info.confidence}</span>
                  <span className="app-chip">For {displayName}</span>
                </div>
                <p className="card-footnote">Next revision action: {info.nextUse}</p>
              </div>
            </div>
          ) : (
            <div className="mindmap-placeholder">
              <strong>Generate the Data Structures map</strong>
              <p className="card-footnote">
                The page currently supports one predefined topic so the concept map stays clean and readable.
              </p>
            </div>
          )}
        </Card>
      </section>
    </div>
  )
}
