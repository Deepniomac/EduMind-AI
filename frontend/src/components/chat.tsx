import { useEffect, useState, type ReactNode } from "react"
import { useSession } from "../app/useSession"

type BackendMode = "demo" | "ai"
type LearningPhase = "idle" | "learn" | "test" | "analyze" | "adjust" | "relearn"

type QuizQuestion = {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
}

type StoredStudyRecord = {
  question: string
  answer: string
}

const studyQuestion = "How does stack work?"

const studyAnswer = `Re-learn

Question: "How does stack work?"

A stack is a linear data structure that follows the Last In, First Out rule.

Think of it like a stack of plates:
1) You place a new plate on top
2) You also remove the top plate first

Core operations:
- push: add an item on top
- pop: remove the top item
- peek: view the top item without removing it

Why it matters:
- function call handling
- undo and redo actions
- expression evaluation
- depth-first search

Mini example:
Push 10, then 20, then 30
Top is now 30
If you pop once, 30 is removed and 20 becomes the new top`

const demoQuiz: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "Which rule defines how a stack works?",
    options: [
      "Last In, First Out",
      "First In, First Out",
      "Random insertion order",
      "Circular indexing only",
    ],
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

function demoAnalyzeAndPlan(selectedById: Record<string, number | null>) {
  const total = demoQuiz.length
  const correct = demoQuiz.filter((question) => selectedById[question.id] === question.correctIndex).length
  const missedQuestions = demoQuiz
    .filter((question) => selectedById[question.id] !== question.correctIndex)
    .map((question) => question.prompt)

  const analysis =
    missedQuestions.length === 0
      ? `Analyze

Score: ${correct}/${total}

You answered every stack question correctly.
That means the learner already understands the core LIFO rule and can move to implementation details.`
      : `Analyze

Score: ${correct}/${total}

Focus again on:
- ${missedQuestions.join("\n- ")}

The learner understands the topic partially, but still needs one more stack revision cycle.`

  const plan = `Adjust / Revision Plan

1) Re-read the stack example with push, pop, and peek.
2) Practice one real-world use case like undo/redo or function calls.
3) Re-take the stack mini quiz to confirm the concept is stable.

Re-learn target:
Use the same question, "${studyQuestion}", and deepen the example.`

  return { analysis, plan }
}

function Chat() {
  const { displayName, phase } = useSession()
  const phaseLabel = phase === "analyze" ? "Analyze" : "Re-learn"
  const reviewPhase: LearningPhase = "test"
  const [question, setQuestion] = useState(studyQuestion)
  const [mode, setMode] = useState<BackendMode>("demo")
  const [backendStatus, setBackendStatus] = useState<"idle" | "checking" | "connected" | "disconnected">("idle")
  const [storedRecord, setStoredRecord] = useState<StoredStudyRecord | null>(null)

  const [learnText, setLearnText] = useState("")
  const [quiz, setQuiz] = useState<QuizQuestion[]>([])
  const [selectedById, setSelectedById] = useState<Record<string, number | null>>({})
  const [analysisText, setAnalysisText] = useState("")
  const [planText, setPlanText] = useState("")
  const [activePhase, setActivePhase] = useState<LearningPhase>(phase === "analyze" ? "analyze" : "relearn")
  const [loading, setLoading] = useState(false)

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

  function resetCycle() {
    setQuestion(studyQuestion)
    setStoredRecord(null)
    setLearnText("")
    setQuiz([])
    setSelectedById({})
    setAnalysisText("")
    setPlanText("")
    setActivePhase(reviewPhase)
  }

  async function startLearningCycle() {
    const sanitizedQuestion = question.trim() || studyQuestion
    setQuestion(sanitizedQuestion)
    setLoading(true)
    setActivePhase("learn")
    setLearnText("")
    setQuiz([])
    setSelectedById({})
    setAnalysisText("")
    setPlanText("")

    try {
      if (mode === "ai" && backendStatus === "connected") {
        const aiLearn = await askBackendText(
          `Explain the topic "${sanitizedQuestion}" in a simple student-friendly way with a push/pop example.`
        )
        setLearnText(aiLearn)
        setStoredRecord({ question: sanitizedQuestion, answer: aiLearn })
      } else {
        setLearnText(studyAnswer)
        setStoredRecord({ question: sanitizedQuestion, answer: studyAnswer })
      }
    } catch {
      setLearnText(studyAnswer)
      setStoredRecord({ question: sanitizedQuestion, answer: studyAnswer })
    }

    const initialSelected: Record<string, number | null> = {}
    for (const item of demoQuiz) initialSelected[item.id] = null

    setQuiz(demoQuiz)
    setSelectedById(initialSelected)
    setActivePhase(reviewPhase)
    setLoading(false)
  }

  function onPick(questionId: string, optionIndex: number) {
    setSelectedById((current) => ({ ...current, [questionId]: optionIndex }))
  }

  function submitAnswers() {
    setActivePhase("analyze")
    const { analysis, plan } = demoAnalyzeAndPlan(selectedById)
    setAnalysisText(analysis)
    setPlanText(plan)
    setActivePhase("adjust")
  }

  const canSubmit = quiz.length > 0 && quiz.every((item) => selectedById[item.id] !== null)

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
          <div
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "minmax(0, 1fr) auto",
              alignItems: "center",
            }}
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              style={{
                padding: 10,
                fontSize: 16,
                borderRadius: 8,
                border: "1px solid #ffffff33",
                background: "#00000022",
                color: "white",
              }}
            />
            <button
              disabled={loading}
              onClick={startLearningCycle}
              style={{
                padding: "10px 20px",
                background: "#1565C0",
                color: "white",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                borderRadius: 10,
              }}
            >
              {loading ? "Generating..." : `Start ${phaseLabel}`}
            </button>
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
              <input type="radio" checked={mode === "demo"} onChange={() => setMode("demo")} />
              Guided mode
            </label>
            <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
              <input type="radio" checked={mode === "ai"} onChange={() => setMode("ai")} />
              Use backend AI
            </label>
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
              Study question: {studyQuestion}
            </span>
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
            ) : null}
            <button
              onClick={resetCycle}
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

          {storedRecord ? (
            <div
              style={{
                marginTop: 16,
                padding: 14,
                borderRadius: 12,
                border: "1px solid #ffffff22",
                background: "#08131f",
              }}
            >
              <div style={{ marginBottom: 6, color: "#95a9c4", fontSize: 12, textTransform: "uppercase" }}>
                Stored study data for {displayName}
              </div>
              <div style={{ color: "white", fontWeight: 700 }}>{storedRecord.question}</div>
              <div style={{ color: "white", opacity: 0.78, marginTop: 6 }}>
                The answer for this selected study question is stored on the page during this learning cycle.
              </div>
            </div>
          ) : null}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
          <StepCard stepIndex={1} title="Learn" active>
            {learnText ? (
              <PreformattedText text={learnText} />
            ) : (
              <MutedText>{`Press “Start ${phaseLabel}” to run the stack study question and store its answer on the page.`}</MutedText>
            )}
          </StepCard>

          <StepCard stepIndex={2} title="Test" active>
            {quiz.length === 0 ? (
              <MutedText>The stack quiz appears here after the Learn step.</MutedText>
            ) : (
              <div style={{ textAlign: "left" }}>
                {quiz.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      marginBottom: 14,
                      padding: 12,
                      borderRadius: 10,
                      border: "1px solid #ffffff22",
                      background: "#ffffff08",
                    }}
                  >
                    <div style={{ marginBottom: 10, color: "white", fontWeight: 600 }}>{item.prompt}</div>
                    <div style={{ display: "grid", gap: 8 }}>
                      {item.options.map((option, index) => {
                        const selected = selectedById[item.id] === index
                        return (
                          <button
                            key={option}
                            onClick={() => onPick(item.id, index)}
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
                            {String.fromCharCode(65 + index)}. {option}
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

          <StepCard stepIndex={3} title="Analyze" active>
            {analysisText ? (
              <PreformattedText text={analysisText} />
            ) : (
              <MutedText>Answer the stack quiz to generate the analysis.</MutedText>
            )}
          </StepCard>

          <StepCard stepIndex={4} title="Adjust" active>
            {planText ? (
              <PreformattedText text={planText} />
            ) : (
              <MutedText>A stack-focused revision plan appears here after analysis.</MutedText>
            )}
          </StepCard>

          <StepCard stepIndex={5} title={phase === "analyze" ? "Analyze" : "Re-learn"} active>
            <div style={{ display: "grid", gap: 10, justifyItems: "start" }}>
              <div style={{ color: "white" }}>
                The workflow is currently centered on the {phaseLabel.toLowerCase()} phase for {displayName}.
              </div>
              <button
                onClick={() => {
                  setActivePhase(phase === "analyze" ? "analyze" : "relearn")
                  setTimeout(() => {
                    void startLearningCycle()
                  }, 50)
                }}
                style={{
                  padding: "10px 20px",
                  background: "#1565C0",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  opacity: 1,
                  borderRadius: 10,
                  width: 220,
                  justifySelf: "center",
                }}
              >
                Refresh {phaseLabel}
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
  const lines = props.text.split("\n")
  return (
    <div
      style={{
        whiteSpace: "pre-wrap",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSize: 13,
      }}
    >
      {lines.map((line, index) => (
        <div key={index} style={{ marginBottom: 6 }}>
          {line === "" ? "\u00A0" : line}
        </div>
      ))}
    </div>
  )
}

export default Chat
