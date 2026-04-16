import { NavLink } from "react-router-dom"

type NavGroup = {
  label: string
  items: Array<{ to: string; label: string; short: string }>
}

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ to: "/", label: "Dashboard", short: "DB" }],
  },
  {
    label: "Learn",
    items: [
      { to: "/tutor", label: "AI Tutor", short: "AI" },
      { to: "/mindmap", label: "Mindmap Generator", short: "MM" },
      { to: "/flashcards", label: "Flashcards", short: "FC" },
    ],
  },
  {
    label: "Practice",
    items: [{ to: "/quiz", label: "Adaptive Quiz", short: "QZ" }],
  },
  {
    label: "Insights",
    items: [
      { to: "/analytics", label: "Progress & Analytics", short: "AN" },
      { to: "/knowledge-map", label: "Knowledge Map", short: "KM" },
    ],
  },
  {
    label: "Planning",
    items: [{ to: "/planner", label: "Study Planner", short: "PL" }],
  },
]

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__brand-mark">E</div>
        <div>
          <p className="sidebar__eyebrow">Adaptive Learning OS</p>
          <h1>EduMind</h1>
        </div>
      </div>

      <div className="sidebar__cycle">
        <span>Live Cycle</span>
        <strong>Learn -&gt; Test -&gt; Analyze -&gt; Adjust -&gt; Re-learn</strong>
      </div>

      <nav className="sidebar__nav" aria-label="Primary">
        {navGroups.map((group) => (
          <div key={group.label} className="sidebar__group">
            <p className="sidebar__group-label">{group.label}</p>
            <div className="sidebar__group-links">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    isActive ? "sidebar__link sidebar__link--active" : "sidebar__link"
                  }
                >
                  <span className="sidebar__link-mark">{item.short}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
