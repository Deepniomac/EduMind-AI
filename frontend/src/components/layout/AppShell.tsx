import { Outlet, useLocation } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/tutor": "AI Tutor",
  "/quiz": "Adaptive Quiz",
  "/mindmap": "Mindmap Generator",
  "/flashcards": "Flashcards",
  "/analytics": "Progress & Analytics",
  "/knowledge-map": "Knowledge Map",
  "/planner": "Study Planner",
}

export function AppShell() {
  const location = useLocation()
  const title = pageTitles[location.pathname] ?? "EduMind"

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-shell__main">
        <Topbar title={title} />
        <main className="app-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
