import { useEffect, useMemo, useState, type ReactNode } from "react"

type BackendMode = "demo" | "ai"

type QuizQuestion = {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
}

function detectTopic(rawQuestion: string): "react" | "python" | "general" {
  const q = rawQuestion.toLowerCase()
  if (q.includes("react")) return "react"
  if (q.includes("javascript") || q.includes("typescript") || q.includes("vite")) return "react"
  if (q.includes("python")) return "python"
  if (q.includes("fastapi")) return "python"
  return "general"
}

function demoGenerateLearn(question: string) {
  const topic = detectTopic(question)
  const focus =
    topic === "react"
      ? "React state, components, and rendering"
      : topic === "python"
        ? "FastAPI request handling and Python basics"
        : "core concepts and a simple mental model"

  return `Learn (Demo)\n\nYou asked: “${question}”\n\nHere’s the key idea: focus on ${focus}. Break it into 3 parts:\n1) What it is (definition)\n2) How it works (steps)\n3) Why it matters (use-case)\n\nNext, we’ll test your understanding with a quick quiz.`
}

function demoGenerateQuiz(question: string): QuizQuestion[] {
  const topic = detectTopic(question)

  if (topic === "react") {
    return [
      {
        id: "q1",
        prompt: "In React, what should state represent?",
        options: ["Server database only", "UI data that changes over time", "HTML file content", "Random constants"],
        correctIndex: 1,
      },
      {
        id: "q2",
        prompt: "What does a component return?",
        options: ["Only side effects", "A UI description (JSX)", "A network request", "A CSS file"],
        correctIndex: 1,
      },
      {
        id: "q3",
        prompt: "Which hook is used to store local state in a function component?",
        options: ["useEffect", "useState", "useReducer only", "useMemo only"],
        correctIndex: 1,
      },
    ]
  }

  if (topic === "python") {
    return [
      {
        id: "q1",
        prompt: "In FastAPI, what do endpoint functions typically do?",
        options: ["Only render HTML templates", "Handle HTTP requests and return responses", "Compile React apps", "Manage git branches"],
        correctIndex: 1,
      },
      {
        id: "q2",
        prompt: "What is a common way to structure request data in FastAPI?",
        options: ["Using Pydantic models", "Using plain text only", "Using bash scripts", "Using SQL migrations"],
        correctIndex: 0,
      },
      {
        id: "q3",
        prompt: "How do you call an external HTTP API in Python?",
        options: ["Using requests (commonly)", "Using git push", "Using Vite dev server", "Using CSS variables"],
        correctIndex: 0,
      },
    ]
  }

  return [
    {
      id: "q1",
      prompt: "A good study strategy starts with…",
      options: ["Memorizing without understanding", "Building a mental model", "Skipping practice", "Only reading once"],
      correctIndex: 1,
    },
    {
      id: "q2",
      prompt: "Testing your knowledge helps because it…",
      options: ["Hides weaknesses", "Reveals gaps", "Prevents recall", "Removes context"],
      correctIndex: 1,
    },
    {
      id: "q3",
      prompt: "“Adjust” in a learning loop means…",
      options: ["Do nothing", "Change strategy based on results", "Only take more notes", "Avoid review"],
      correctIndex: 1,
    },
  ]
}

function demoAnalyzeAndPlan(args: {
  question: string
  quiz: QuizQuestion[]
  selectedById: Record<string, number | null>
}) {
  const { quiz, selectedById } = args
  const total = quiz.length
  const correct = quiz.filter((q) => selectedById[q.id] === q.correctIndex).length

  const wrong = quiz
    .filter((q) => selectedById[q.id] !== q.correctIndex)
    .map((q) => q.prompt)

  const weaknessText =
    wrong.length === 0
      ? "You got everything right. Next, increase difficulty and move faster."
      : `You missed ${wrong.length} question(s). Re-focus on:\n- ${wrong.join("\n- ")}`

  const analysis = `Analyze (Demo)\n\nScore: ${correct}/${total}\n\n${weaknessText}\n\nWhat to do next: convert the wrong answers into 1-2 short “rules” you can recall quickly.`

  const plan = `Adjust / Revision Plan (Demo)\n\n1) Review the concept behind each missed question.\n2) Write a 1-sentence explanation + a small example.\n3) Re-test using a similar quiz (repeat the loop).\n\nTopic: “${args.question}”`

  return { analysis, plan }
}

async function askBackendText(prompt: string): Promise<string> {
  const res = await fetch("http://127.0.0.1:8000/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: prompt }),
  })
  if (!res.ok) {
    const bodyText = await res.text().catch(() => "")
    throw new Error(`Backend error: ${res.status} ${bodyText}`.trim())
  }
  const data = (await res.json()) as { response?: unknown; error?: unknown }
  if (typeof data.response !== "string") {
    throw new Error(typeof data.error === "string" ? data.error : "Backend returned no response")
  }
  return data.response
}

function Chat() {
  const [question, setQuestion] = useState("")
  const [mode, setMode] = useState<BackendMode>("demo")
  const [backendStatus, setBackendStatus] = useState<"idle" | "checking" | "connected" | "disconnected">("idle")

  const [learnText, setLearnText] = useState("")
  const [quiz, setQuiz] = useState<QuizQuestion[]>([])
  const [selectedById, setSelectedById] = useState<Record<string, number | null>>({})
  const [analysisText, setAnalysisText] = useState("")
  const [planText, setPlanText] = useState("")

  const [activePhase, setActivePhase] = useState<
    "idle" | "learn" | "test" | "analyze" | "adjust" | "relearn"
  >("idle")
  const [loading, setLoading] = useState(false)

  const topic = useMemo(() => detectTopic(question), [question])

  useEffect(() => {
    let cancelled = false
    async function check() {
      if (mode !== "ai") return
      setBackendStatus("checking")
      try {
        const res = await fetch("http://127.0.0.1:8000/test")
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        if (!cancelled) setBackendStatus("connected")
      } catch {
        if (!cancelled) setBackendStatus("disconnected")
      }
    }
    check()
    return () => {
      cancelled = true
    }
  }, [mode])

  function resetCycle(keepQuestion = true) {
    if (!keepQuestion) setQuestion("")
    setLearnText("")
    setQuiz([])
    setSelectedById({})
    setAnalysisText("")
    setPlanText("")
    setActivePhase("idle")
  }

  async function startLearningCycle() {
    if (!question.trim()) return
    setLoading(true)
    setActivePhase("learn")
    setLearnText("")
    setQuiz([])
    setSelectedById({})
    setAnalysisText("")
    setPlanText("")

    // Step 1: Learn (demo always works; AI optional)
    try {
      if (mode === "ai" && backendStatus === "connected") {
        const aiLearn = await askBackendText(
          `Create a clear study explanation for: "${question}". Keep it structured with headings.`
        )
        setLearnText(aiLearn)
      } else {
        setLearnText(demoGenerateLearn(question))
      }
    } catch {
      setLearnText(demoGenerateLearn(question))
    }

    // Step 2: Test (demo quiz for presentation reliability)
    const demoQuiz = demoGenerateQuiz(question)
    setQuiz(demoQuiz)
    const initialSelected: Record<string, number | null> = {}
    for (const q of demoQuiz) initialSelected[q.id] = null
    setSelectedById(initialSelected)

    setActivePhase("test")
    setLoading(false)
  }

  function submitAnswers() {
    setActivePhase("analyze")
    const { analysis, plan } = demoAnalyzeAndPlan({ question, quiz, selectedById })
    setAnalysisText(analysis)
    setPlanText(plan)
    setActivePhase("adjust")
  }

  function onPick(qid: string, index: number) {
    setSelectedById((prev) => ({ ...prev, [qid]: index }))
  }

  const canSubmit = quiz.length > 0 && quiz.every((q) => selectedById[q.id] !== null)

  return (
    <div style={{ textAlign: "center", marginTop: 40, padding: 16 }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div
          style={{
            background: "#ffffff14",
            border: "1px solid #ffffff22",
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            textAlign: "left",
          }}
        >
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Ask your study question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              style={{
                flex: "1 1 320px",
                padding: 10,
                fontSize: 16,
                borderRadius: 8,
                border: "1px solid #ffffff33",
                background: "#00000022",
                color: "white",
              }}
            />
            <button
              disabled={loading || !question.trim()}
              onClick={startLearningCycle}
              style={{
                padding: "10px 20px",
                background: "#1565C0",
                color: "white",
                border: "none",
                cursor: loading || !question.trim() ? "not-allowed" : "pointer",
                opacity: loading || !question.trim() ? 0.7 : 1,
              }}
            >
              {loading ? "Generating..." : "Start Learning Cycle"}
            </button>
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
              <input type="radio" checked={mode === "demo"} onChange={() => setMode("demo")} />
              Demo mode (works offline)
            </label>
            <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
              <input type="radio" checked={mode === "ai"} onChange={() => setMode("ai")} />
              Use backend AI (optional)
            </label>

            {mode === "ai" ? (
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 999,
                  border: "1px solid #ffffff33",
                  background: "#00000022",
                  color: "white",
                  fontSize: 12,
                }}
              >
                Backend: {backendStatus}
              </span>
            ) : (
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 999,
                  border: "1px solid #ffffff33",
                  background: "#00000022",
                  color: "white",
                  fontSize: 12,
                }}
              >
                Topic guess: {topic}
              </span>
            )}

            <button
              onClick={() => resetCycle(true)}
              style={{
                marginLeft: "auto",
                padding: "8px 14px",
                background: "#ffffff14",
                color: "white",
                border: "1px solid #ffffff33",
                cursor: "pointer",
                borderRadius: 8,
              }}
            >
              Reset
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
          <StepCard
            stepIndex={1}
            title="Learn"
            active={
              activePhase === "learn" ||
              activePhase === "test" ||
              activePhase === "analyze" ||
              activePhase === "adjust"
            }
          >
            {learnText ? (
              <PreformattedText text={learnText} />
            ) : (
              <MutedText>Click “Start Learning Cycle” to generate explanation.</MutedText>
            )}
          </StepCard>

          <StepCard
            stepIndex={2}
            title="Test"
            active={activePhase === "test" || activePhase === "analyze" || activePhase === "adjust"}
          >
            {quiz.length === 0 ? (
              <MutedText>Quiz appears here after the Learn step.</MutedText>
            ) : (
              <div style={{ textAlign: "left" }}>
                {quiz.map((q) => (
                  <div
                    key={q.id}
                    style={{
                      marginBottom: 14,
                      padding: 12,
                      borderRadius: 10,
                      border: "1px solid #ffffff22",
                      background: "#ffffff08",
                    }}
                  >
                    <div style={{ marginBottom: 10, color: "white", fontWeight: 600 }}>{q.prompt}</div>
                    <div style={{ display: "grid", gap: 8 }}>
                      {q.options.map((opt, idx) => {
                        const selected = selectedById[q.id] === idx
                        return (
                          <button
                            key={idx}
                            onClick={() => onPick(q.id, idx)}
                            disabled={activePhase === "analyze" || activePhase === "adjust"}
                            style={{
                              textAlign: "left",
                              padding: "10px 12px",
                              borderRadius: 10,
                              border: selected ? "2px solid #90CAF9" : "1px solid #ffffff22",
                              background: selected ? "#1565C0" : "#00000022",
                              color: "white",
                              cursor:
                                activePhase === "analyze" || activePhase === "adjust" ? "not-allowed" : "pointer",
                            }}
                          >
                            {String.fromCharCode(65 + idx)}. {opt}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}

                <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 6 }}>
                  <button
                    disabled={!canSubmit || activePhase === "analyze" || activePhase === "adjust"}
                    onClick={submitAnswers}
                    style={{
                      padding: "10px 20px",
                      background: "#1565C0",
                      color: "white",
                      border: "none",
                      cursor:
                        !canSubmit || activePhase === "analyze" || activePhase === "adjust"
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        !canSubmit || activePhase === "analyze" || activePhase === "adjust" ? 0.7 : 1,
                      borderRadius: 10,
                    }}
                  >
                    Submit Answers
                  </button>
                </div>
              </div>
            )}
          </StepCard>

          <StepCard
            stepIndex={3}
            title="Analyze"
            active={activePhase === "analyze" || activePhase === "adjust"}
          >
            {analysisText ? <PreformattedText text={analysisText} /> : <MutedText>After you submit answers, analysis appears here.</MutedText>}
          </StepCard>

          <StepCard stepIndex={4} title="Adjust" active={activePhase === "adjust" || activePhase === "relearn"}>
            {planText ? <PreformattedText text={planText} /> : <MutedText>Revision plan appears after analysis.</MutedText>}
          </StepCard>

          <StepCard stepIndex={5} title="Re-learn" active={activePhase === "relearn"}>
            <div style={{ display: "grid", gap: 10, justifyItems: "start" }}>
              <div style={{ color: "white" }}>
                Re-run the cycle to practice with the updated plan. (In demo mode, the quiz is regenerated instantly.)
              </div>
              <button
                disabled={activePhase !== "adjust"}
                onClick={() => {
                  setActivePhase("relearn")
                  // Keep the same question, regenerate the loop from scratch.
                  setTimeout(() => startLearningCycle(), 50)
                }}
                style={{
                  padding: "10px 20px",
                  background: "#1565C0",
                  color: "white",
                  border: "none",
                  cursor: activePhase !== "adjust" ? "not-allowed" : "pointer",
                  opacity: activePhase !== "adjust" ? 0.7 : 1,
                  borderRadius: 10,
                  width: 220,
                  justifySelf: "center",
                }}
              >
                Start Re-learn
              </button>
            </div>
          </StepCard>
        </div>
      </div>
    </div>
  )
}

function StepCard(props: { stepIndex: number; title: string; active: boolean; children: ReactNode }) {
  return (
    <div
      style={{
        borderRadius: 12,
        padding: 16,
        border: props.active ? "2px solid #90CAF9" : "1px solid #ffffff22",
        background: "#00000022",
        color: "white",
        textAlign: "left",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 999,
            display: "grid",
            placeItems: "center",
            border: "1px solid #ffffff33",
            background: props.active ? "#1565C0" : "#00000022",
            fontWeight: 700,
          }}
        >
          {props.stepIndex}
        </div>
        <div style={{ fontSize: 18, fontWeight: 800 }}>{props.title}</div>
        {props.active ? (
          <span style={{ marginLeft: "auto", fontSize: 12, opacity: 0.9 }}>active</span>
        ) : (
          <span style={{ marginLeft: "auto", fontSize: 12, opacity: 0.6 }}>pending</span>
        )}
      </div>
      <div>{props.children}</div>
    </div>
  )
}

function MutedText(props: { children: ReactNode }) {
  return <div style={{ color: "white", opacity: 0.75 }}>{props.children}</div>
}

function PreformattedText(props: { text: string }) {
  // Render line breaks without pulling in a markdown parser.
  const lines = props.text.split("\n")
  return (
    <div
      style={{
        whiteSpace: "pre-wrap",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSize: 13,
      }}
    >
      {lines.map((line, idx) => (
        <div key={idx} style={{ marginBottom: 6 }}>
          {line === "" ? "\u00A0" : line}
        </div>
      ))}
    </div>
  )
}

export default Chat