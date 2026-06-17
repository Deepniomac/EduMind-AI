import { backendBaseUrl, escapeHtml, getPhaseLabel, getSession, renderShell } from "./auth.js"

const studyQuestion = "How does stack work?"

const studyAnswer = `Re-learn

Question: "How does stack work?"

A stack is a linear data structure that follows the Last In, First Out rule.

Think of it like a stack of plates:
1. You place a new plate on top.
2. You also remove the top plate first.

Core operations:
- push: add an item on top
- pop: remove the top item
- peek: view the top item without removing it

Why it matters:
- function call handling
- undo and redo actions
- expression evaluation
- depth-first search`

const quiz = [
  {
    id: "q1",
    prompt: "Which rule defines how a stack works?",
    options: ["Last In, First Out", "First In, First Out", "Random insertion order", "Circular indexing only"],
    correctIndex: 0,
  },
  {
    id: "q2",
    prompt: "Which operation adds a new item to the top of a stack?",
    options: ["peek", "enqueue", "push", "swap"],
    correctIndex: 2,
  },
  {
    id: "q3",
    prompt: "After pushing 10, 20, and 30, what will pop remove first?",
    options: ["10", "20", "30", "Nothing"],
    correctIndex: 2,
  },
]

const state = {
  question: studyQuestion,
  mode: "demo",
  backendStatus: "idle",
  loading: false,
  storedRecord: null,
  learnText: "",
  selectedById: Object.fromEntries(quiz.map((item) => [item.id, null])),
  analysisText: "",
  planText: "",
  scoreText: "",
  bannerText: "",
  bannerTone: "",
}

const activeSession = getSession()

const session = renderShell({
  activePage: "tutor",
  eyebrow: getPhaseLabel(activeSession?.phase),
  title: "AI Tutor",
  description: "Run the full EduMind cycle with a topic prompt, learning explanation, mini quiz, analysis, and revision plan.",
  content: `<div id="tutor-root"></div>`,
  topbarNote: "Tutor workflow powered by guided mode and FastAPI calls",
})

function setBanner(text, tone = "") {
  state.bannerText = text
  state.bannerTone = tone
}

async function checkBackend() {
  state.backendStatus = "checking"
  render()

  try {
    const response = await fetch(`${backendBaseUrl}/test`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    state.backendStatus = "connected"
    setBanner("Backend connection verified successfully.", "success")
  } catch {
    state.backendStatus = "disconnected"
    setBanner("Backend could not be reached. Guided mode remains available.", "danger")
  }

  render()
}

async function askBackendText(prompt) {
  const response = await fetch(`${backendBaseUrl}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: prompt }),
  })

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "")
    throw new Error(`Backend error: ${response.status} ${bodyText}`.trim())
  }

  const data = await response.json()
  if (typeof data.response !== "string") {
    throw new Error("Backend returned no response text.")
  }

  return data.response
}

async function startLearningCycle() {
  state.loading = true
  state.learnText = ""
  state.analysisText = ""
  state.planText = ""
  state.scoreText = ""
  state.selectedById = Object.fromEntries(quiz.map((item) => [item.id, null]))
  setBanner(state.mode === "ai" ? "Generating explanation from FastAPI backend..." : "Starting guided learning cycle.", "warning")
  render()

  const prompt = (state.question || studyQuestion).trim()
  state.question = prompt || studyQuestion

  try {
    if (state.mode === "ai") {
      if (state.backendStatus !== "connected") {
        throw new Error("Backend is not connected.")
      }

      const answer = await askBackendText(`Explain the topic "${state.question}" in a simple student-friendly way with a push/pop example.`)
      state.learnText = answer
      state.storedRecord = { question: state.question, answer }
      setBanner("AI explanation loaded successfully.", "success")
    } else {
      state.learnText = studyAnswer
      state.storedRecord = { question: state.question, answer: studyAnswer }
      setBanner("Guided mode explanation is ready.", "success")
    }
  } catch (error) {
    state.learnText = studyAnswer
    state.storedRecord = { question: state.question, answer: studyAnswer }
    setBanner(`${error.message} Falling back to guided explanation.`, "danger")
  }

  state.loading = false
  render()
}

function submitAnswers() {
  const total = quiz.length
  const correct = quiz.filter((item) => state.selectedById[item.id] === item.correctIndex).length
  const missed = quiz.filter((item) => state.selectedById[item.id] !== item.correctIndex)

  state.scoreText = `Score: ${correct}/${total}`
  state.analysisText =
    missed.length === 0
      ? `Analyze

You answered every stack question correctly.
That means the learner already understands the core LIFO rule and can move to implementation details.`
      : `Analyze

Focus again on:
${missed.map((item) => `- ${item.prompt}`).join("\n")}

The learner understands the topic partially, but still needs one more stack revision cycle.`

  state.planText = `Adjust / Revision Plan

1. Re-read the stack example with push, pop, and peek.
2. Practice one real-world use case like undo/redo or function calls.
3. Re-take the stack mini quiz to confirm the concept is stable.

Re-learn target:
Use the same question, "${state.question}", and deepen the example.`

  setBanner("Quiz submitted and analysis generated.", "success")
  render()
}

function resetWorkflow() {
  state.question = studyQuestion
  state.mode = "demo"
  state.backendStatus = "idle"
  state.loading = false
  state.storedRecord = null
  state.learnText = ""
  state.selectedById = Object.fromEntries(quiz.map((item) => [item.id, null]))
  state.analysisText = ""
  state.planText = ""
  state.scoreText = ""
  setBanner("Workflow reset. Start a fresh learning cycle anytime.")
  render()
}

function renderStep(index, title, body, stateText = "active") {
  return `
    <section class="step-card">
      <div class="step-card__header">
        <div class="step-card__title-wrap">
          <span class="step-index">${index}</span>
          <strong>${title}</strong>
        </div>
        <span class="step-state">${stateText}</span>
      </div>
      ${body}
    </section>
  `
}

function render() {
  const phaseLabel = getPhaseLabel(session.phase)
  const canSubmit = quiz.every((item) => state.selectedById[item.id] !== null)
  const bannerClass = state.bannerTone ? `inline-banner inline-banner--${state.bannerTone}` : "inline-banner"

  document.getElementById("tutor-root").innerHTML = `
    <div class="tutor-controls">
      <section class="card">
        <div class="tutor-input-row">
          <input id="topic-input" class="app-input" value="${escapeHtml(state.question)}" placeholder="Enter a study topic" />
          <button id="start-cycle" class="app-button" type="button" ${state.loading ? "disabled" : ""}>
            ${state.loading ? "Generating..." : `Start ${phaseLabel}`}
          </button>
        </div>
        <div class="mode-toggle" style="margin-top: 14px;">
          <button id="mode-demo" class="${state.mode === "demo" ? "is-active" : ""}" type="button">Guided mode</button>
          <button id="mode-ai" class="${state.mode === "ai" ? "is-active" : ""}" type="button">Use backend AI</button>
          <span class="status-pill ${state.backendStatus === "connected" ? "status-pill--success" : state.backendStatus === "disconnected" ? "status-pill--danger" : state.backendStatus === "checking" ? "status-pill--warning" : ""}">
            Backend: ${state.backendStatus}
          </span>
          <button id="reset-workflow" class="ghost-button" type="button">Reset workflow</button>
        </div>
        <div class="${bannerClass}" style="margin-top: 14px;">${escapeHtml(state.bannerText || "Use guided mode or switch to backend AI for live FastAPI responses.")}</div>
        ${
          state.storedRecord
            ? `<div class="study-record" style="margin-top: 14px;">
                <strong>Stored study data for ${escapeHtml(session.displayName)}</strong>
                <div>${escapeHtml(state.storedRecord.question)}</div>
                <p class="muted">The current answer is stored in the page state for this learning cycle.</p>
              </div>`
            : ""
        }
      </section>

      <div class="step-grid">
        ${renderStep(1, "Learn", state.learnText ? `<div class="preformatted-block">${escapeHtml(state.learnText)}</div>` : `<p class="muted">Press Start to generate the explanation step.</p>`)}

        ${renderStep(
          2,
          "Test",
          `
            <div class="question-list">
              ${quiz
                .map(
                  (item) => `
                    <div class="question-panel">
                      <strong>${escapeHtml(item.prompt)}</strong>
                      <div class="answer-options">
                        ${item.options
                          .map(
                            (option, index) => `
                              <button class="answer-option ${state.selectedById[item.id] === index ? "is-selected" : ""}" data-question="${item.id}" data-option="${index}" type="button">
                                ${String.fromCharCode(65 + index)}. ${escapeHtml(option)}
                              </button>
                            `,
                          )
                          .join("")}
                      </div>
                    </div>
                  `,
                )
                .join("")}
              <div class="tutor-summary">
                <button id="submit-quiz" class="app-button" type="button" ${!canSubmit ? "disabled" : ""}>Submit quiz</button>
                ${state.scoreText ? `<span class="status-pill status-pill--success">${escapeHtml(state.scoreText)}</span>` : ""}
              </div>
            </div>
          `,
        )}

        ${renderStep(3, "Analyze", state.analysisText ? `<div class="preformatted-block">${escapeHtml(state.analysisText)}</div>` : `<p class="muted">Answer the quiz to generate analysis.</p>`)}
        ${renderStep(4, "Adjust", state.planText ? `<div class="preformatted-block">${escapeHtml(state.planText)}</div>` : `<p class="muted">A revision plan appears here after analysis.</p>`)}
        ${renderStep(5, phaseLabel, `<p class="muted">The tutor is centered on the ${phaseLabel.toLowerCase()} phase for ${escapeHtml(session.displayName)}. Run another cycle anytime.</p>`)}
      </div>
    </div>
  `

  document.getElementById("topic-input").addEventListener("input", (event) => {
    state.question = event.target.value
  })

  document.getElementById("start-cycle").addEventListener("click", startLearningCycle)
  document.getElementById("reset-workflow").addEventListener("click", resetWorkflow)
  document.getElementById("submit-quiz").addEventListener("click", submitAnswers)

  document.getElementById("mode-demo").addEventListener("click", () => {
    state.mode = "demo"
    state.backendStatus = "idle"
    setBanner("Guided mode uses the local EduMind explanation and quiz flow.")
    render()
  })

  document.getElementById("mode-ai").addEventListener("click", async () => {
    state.mode = "ai"
    setBanner("Checking FastAPI backend before using AI mode.", "warning")
    render()
    await checkBackend()
  })

  document.querySelectorAll("[data-question]").forEach((button) => {
    button.addEventListener("click", () => {
      const questionId = button.getAttribute("data-question")
      const optionIndex = Number(button.getAttribute("data-option"))
      state.selectedById[questionId] = optionIndex
      render()
    })
  })
}

render()
