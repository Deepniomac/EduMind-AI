import { renderShell } from "./auth.js"

const supportedTopic = "Data Structures"

const nodes = [
  { id: "Data Structures", x: "50%", y: "18%", root: true },
  { id: "Arrays", x: "24%", y: "48%" },
  { id: "Stacks", x: "42%", y: "48%" },
  { id: "Queues", x: "62%", y: "48%" },
  { id: "Linked Lists", x: "82%", y: "48%" },
  { id: "Trees", x: "36%", y: "78%" },
  { id: "Graphs", x: "54%", y: "78%" },
  { id: "Hashing", x: "73%", y: "78%" },
]

const details = {
  Stacks: "LIFO structure used in recursion, undo systems, and DFS.",
  Queues: "FIFO structure used in scheduling and breadth-first flows.",
  Trees: "Hierarchical structure useful for search and recursive traversal.",
  Graphs: "Network model for traversal and shortest-path thinking.",
}

let topic = supportedTopic
let generated = supportedTopic
let activeNode = "Stacks"

renderShell({
  activePage: "mindmap",
  eyebrow: "Concept Mapping",
  title: "Mindmap Generator",
  description: "Generate a simple concept map view and inspect individual concept nodes.",
  content: `<div id="mindmap-root"></div>`,
})

function render() {
  const showMap = generated.trim().toLowerCase() === supportedTopic.toLowerCase()

  document.getElementById("mindmap-root").innerHTML = `
    <section class="dashboard-grid">
      <article class="card">
        <p class="metric-card__label">Topic input</p>
        <div class="mindmap-toolbar">
          <input id="mindmap-topic" class="app-input" value="${topic}" />
          <button id="generate-map" class="app-button" type="button">Generate</button>
        </div>
        <p class="card-note" style="margin-top: 14px;">Generate "${supportedTopic}" to keep the concept map visible and readable.</p>
      </article>
      <article class="card">
        <p class="metric-card__label">Display concept nodes</p>
        ${
          showMap
            ? `
              <div class="mindmap-canvas">
                ${nodes
                  .map(
                    (node) => `
                      <button class="mindmap-node ${activeNode === node.id || node.root ? "mindmap-node--active" : ""}" data-node="${node.id}" type="button" style="left:${node.x};top:${node.y};">
                        ${node.id}
                      </button>
                    `,
                  )
                  .join("")}
              </div>
              <div class="mindmap-inspector" style="margin-top: 16px;">
                <p class="subtle-label">Selected node</p>
                <h3>${activeNode}</h3>
                <p class="card-note">${details[activeNode] ?? "Central concept in the current map."}</p>
              </div>
            `
            : `
              <div class="mindmap-placeholder">
                <strong>No generated map yet</strong>
                <p class="card-note">This vanilla version supports a clean predefined Data Structures map.</p>
              </div>
            `
        }
      </article>
    </section>
  `

  document.getElementById("mindmap-topic").addEventListener("input", (event) => {
    topic = event.target.value
  })

  document.getElementById("generate-map").addEventListener("click", () => {
    generated = topic
    render()
  })

  document.querySelectorAll("[data-node]").forEach((button) => {
    button.addEventListener("click", () => {
      activeNode = button.getAttribute("data-node")
      render()
    })
  })
}

render()
