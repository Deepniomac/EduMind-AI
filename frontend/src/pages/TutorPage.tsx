import { useSession } from "../app/session"
import { PageHeader } from "../components/layout/PageHeader"
import Chat from "../components/chat"

export function TutorPage() {
  const { displayName, phase } = useSession()
  const phaseLabel = phase === "analyze" ? "Analyze" : "Re-learn"

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={phaseLabel}
        title="AI Tutor"
        description={`This tutor workspace is centered on the ${phaseLabel.toLowerCase()} phase so ${displayName} can work through the right concept checkpoints with guided examples.`}
      />
      <Chat />
    </div>
  )
}
