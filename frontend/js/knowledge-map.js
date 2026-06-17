import { renderShell } from "./auth.js"

const subjectMaps = {
  "Data Structures": [
    { label: "Stack", mastery: 0 },
    { label: "Queue", mastery: 0 },
    { label: "Tree", mastery: 0 },
    { label: "Graph", mastery: 0 },
    { label: "Heap", mastery: 0 },
    { label: "Hash", mastery: 0 },
  ],
  "Operating Systems": [
    { label: "CPU", mastery: 0 },
    { label: "Threads", mastery: 0 },
    { label: "Deadlock", mastery: 0 },
    { label: "Paging", mastery: 0 },
    { label: "Sync", mastery: 0 },
    { label: "Sched", mastery: 0 },
  ],
  Algorithms: [
    { label: "Sort", mastery: 0 },
    { label: "Search", mastery: 0 },
    { label: "Greedy", mastery: 0 },
    { label: "DP", mastery: 0 },
    { label: "Graphs", mastery: 0 },
    { label: "Bit", mastery: 0 },
  ],
}

let activeSubject = "Data Structures"

renderShell({
  activePage: "knowledge-map",
  eyebrow: "Subject Mastery",
  title: "Knowledge Map",
  description: "Inspect knowledge areas through subject tabs and topic mastery cards.",
  content: `<div id="knowledge-root"></div>`,
})

function render() {
  document.getElementById("knowledge-root").innerHTML = `
    <section class="card">
      <div class="topic-tabs">
        ${Object.keys(subjectMaps)
          .map(
            (subject) => `
              <button class="topic-tab ${subject === activeSubject ? "topic-tab--active" : ""}" data-subject="${subject}" type="button">
                ${subject}
              </button>
            `,
          )
          .join("")}
      </div>
      <div class="topic-card-grid">
        ${subjectMaps[activeSubject]
          .map(
            (topic) => `
              <article class="topic-card">
                <strong>${topic.label}</strong>
                <span>${topic.mastery}% mastery</span>
                <div class="topic-card__meter"><div style="width:${topic.mastery}%"></div></div>
                <p class="card-note">No mastery data yet. Use the tutor or flashcards to begin tracking.</p>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `

  document.querySelectorAll("[data-subject]").forEach((button) => {
    button.addEventListener("click", () => {
      activeSubject = button.getAttribute("data-subject")
      render()
    })
  })
}

render()
