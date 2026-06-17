import { renderShell } from "./auth.js"

const cards = [
  { front: "What is the time complexity of binary search?", back: "O(log n)" },
  { front: "What does LIFO mean?", back: "Last In, First Out" },
  { front: "What traversal commonly uses a stack?", back: "Depth-first search" },
]

const decks = ["Binary Trees", "OS Scheduling", "Sorting Algorithms", "Dynamic Programming"]

let cardIndex = 0
let showingFront = true

renderShell({
  activePage: "flashcards",
  eyebrow: "Retention Review",
  title: "Flashcards",
  description: "Flip through revision cards, move across a small deck, and browse recovery-ready collections.",
  content: `<div id="flashcards-root"></div>`,
})

function render() {
  const current = cards[cardIndex]
  document.getElementById("flashcards-root").innerHTML = `
    <section class="dashboard-grid">
      <article class="card">
        <p class="metric-card__label">Flashcard display</p>
        <div class="flashcard">
          <p class="subtle-label">${showingFront ? "Front" : "Back"}</p>
          <h3>${showingFront ? current.front : current.back}</h3>
          <p class="card-note">Use this page for quick topic reinforcement before re-entering the tutor workflow.</p>
        </div>
        <div class="flashcard-controls" style="margin-top: 16px;">
          <button id="previous-card" class="ghost-button" type="button">Previous</button>
          <button id="flip-card" class="app-button" type="button">${showingFront ? "Show Answer" : "Show Question"}</button>
          <button id="next-card" class="ghost-button" type="button">Next</button>
        </div>
      </article>
      <article class="card">
        <p class="metric-card__label">Deck list UI</p>
        <div class="deck-list">
          ${decks
            .map(
              (deck, index) => `
                <div class="deck-list__item ${index === 0 ? "deck-list__item--active" : ""}">
                  <strong>${deck}</strong>
                  <span>0 due</span>
                </div>
              `,
            )
            .join("")}
        </div>
      </article>
    </section>
  `

  document.getElementById("previous-card").addEventListener("click", () => {
    cardIndex = (cardIndex - 1 + cards.length) % cards.length
    showingFront = true
    render()
  })

  document.getElementById("next-card").addEventListener("click", () => {
    cardIndex = (cardIndex + 1) % cards.length
    showingFront = true
    render()
  })

  document.getElementById("flip-card").addEventListener("click", () => {
    showingFront = !showingFront
    render()
  })
}

render()
