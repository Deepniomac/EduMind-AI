import { escapeHtml, fetchBackendJson, getPhaseLabel, getSession, renderShell } from "./auth.js"

const fallbackQuiz = {
  display_position: 1,
  total_questions: 3,
  questions: [
    {
      id: "q1",
      prompt: "What is a stack?",
      options: ["A LIFO data structure", "A FIFO data structure", "A sorted list", "A tree traversal only"],
    },
    {
      id: "q2",
      prompt: "Which operation removes the top item?",
      options: ["peek", "push", "pop", "enqueue"],
    },
    {
      id: "q3",
      prompt: "Which topic should a new learner start with?",
      options: ["Any topic they choose", "Only advanced recursion", "Only memory optimization", "No topic at all"],
    },
  ],
  stats: { recovered: 0, correct: 0, confidence: "new" },
}

const activeSession = getSession()

const session = renderShell({
  activePage: "quiz",
  eyebrow: `${getPhaseLabel(activeSession?.phase)} Practice`,
  title: "Adaptive Quiz",
  description: "A backend-backed checkpoint page with learner-specific questions and answer submission.",
  content: `<div id="quiz-root"></div>`,
})

const root = document.getElementById("quiz-root")

const state = {
  quiz: null,
  loading: true,
  submitting: false,
  answers: {},
  result: null,
  message: "Loading quiz data from the backend...",
  tone: "warning",
}

function setMessage(message, tone = "warning") {
  state.message = message
  state.tone = tone
}

function render() {
  const quiz = state.quiz ?? fallbackQuiz
  const phaseLabel = getPhaseLabel(session.phase)
  const answeredCount = Object.keys(state.answers).length

  root.innerHTML = `
    <div class="inline-banner inline-banner--${state.tone}" style="margin-bottom: 20px;">${escapeHtml(state.message)}</div>
    <section class="dashboard-grid">
      <article class="card">
        <p class="metric-card__label">${escapeHtml(phaseLabel)} checkpoint for ${escapeHtml(session.displayName)}</p>
        <div class="question-card">
          <p class="subtle-label">Question set ${quiz.display_position} of ${quiz.total_questions}</p>
          <div class="quiz-options">
            ${quiz.questions
              .map(
                (question) => `
                  <div class="question-panel">
                    <strong>${escapeHtml(question.prompt)}</strong>
                    <div class="answer-options">
                      ${question.options
                        .map(
                          (option, index) => `
                            <button class="answer-option ${state.answers[question.id] === index ? "is-selected" : ""}" data-question="${question.id}" data-option="${index}" type="button">
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
          </div>
          <div class="tutor-summary" style="margin-top: 16px;">
            <span class="status-pill">${answeredCount}/${quiz.questions.length} answered</span>
            <button id="submit-quiz" class="app-button" type="button" ${answeredCount !== quiz.questions.length || state.submitting ? "disabled" : ""}>
              ${state.submitting ? "Submitting..." : "Submit quiz"}
            </button>
          </div>
          ${
            state.result
              ? `
                <div class="study-record" style="margin-top: 16px;">
                  <strong>Score: ${state.result.score}/${state.result.total}</strong>
                  <p class="muted">${escapeHtml(state.result.feedback)}</p>
                  ${
                    state.result.missed_prompts.length
                      ? `<p class="muted">Missed: ${escapeHtml(state.result.missed_prompts.join(" | "))}</p>`
                      : `<p class="muted">All submitted answers were correct.</p>`
                  }
                  <p class="muted">Next step: ${escapeHtml(state.result.next_step)}</p>
                </div>
              `
              : ""
          }
        </div>
      </article>

      <article class="card">
        <p class="metric-card__label">Question navigator</p>
        <div class="question-map">
          ${Array.from({ length: quiz.total_questions }, (_, index) => {
            const isPrimary = index === quiz.display_position - 1
            const isDone = index < answeredCount
            return `<button class="question-dot ${isPrimary ? "question-dot--active" : isDone ? "question-dot--done" : ""}" type="button">${index + 1}</button>`
          }).join("")}
        </div>
        <div class="study-record" style="margin-top: 16px;">
          <strong>Current recovery stats</strong>
          <p class="muted">Recovered: ${quiz.stats.recovered}</p>
          <p class="muted">Correct trend: ${quiz.stats.correct}</p>
          <p class="muted">Confidence: ${escapeHtml(quiz.stats.confidence)}</p>
        </div>
      </article>
    </section>
  `

  document.querySelectorAll("[data-question]").forEach((button) => {
    button.addEventListener("click", () => {
      state.answers[button.getAttribute("data-question")] = Number(button.getAttribute("data-option"))
      render()
    })
  })

  document.getElementById("submit-quiz")?.addEventListener("click", submitQuiz)
}

async function loadQuiz() {
  try {
    const quiz = await fetchBackendJson("/me/quiz")
    state.quiz = quiz
    state.loading = false
    setMessage("Quiz questions are now loading from the backend.", "success")
  } catch (error) {
    state.quiz = fallbackQuiz
    state.loading = false
    setMessage(`${error.message} Falling back to local quiz data.`, "danger")
  }

  render()
}

async function submitQuiz() {
  state.submitting = true
  setMessage("Submitting quiz answers to the backend...", "warning")
  render()

  try {
    state.result = await fetchBackendJson("/me/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers: state.answers,
      }),
    })
    setMessage("Quiz submitted successfully. Result is now backend-generated.", "success")
  } catch (error) {
    setMessage(error.message, "danger")
  }

  state.submitting = false
  render()
}

render()
loadQuiz()
