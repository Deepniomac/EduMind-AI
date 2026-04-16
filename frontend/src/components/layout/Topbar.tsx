import { useSession } from "../../app/session"

export function Topbar({ title }: { title: string }) {
  const { displayName, logout } = useSession()

  return (
    <header className="topbar">
      <div>
        <p className="topbar__eyebrow">EduMind Workspace for {displayName}</p>
        <h2>{title}</h2>
      </div>

      <div className="topbar__actions">
        <button className="topbar__logout" onClick={logout}>
          Logout
        </button>
        <div className="topbar__profile">K</div>
      </div>
    </header>
  )
}
