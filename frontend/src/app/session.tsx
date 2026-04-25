import { useMemo, useState, type ReactNode } from "react"
import { SessionContext, type LearningPhase, type SessionState } from "./SessionContext"

type DemoUser = {
  username: string
  password: string
  displayName: string
  phase: LearningPhase
}

const demoUsers: DemoUser[] = [
  {
    username: "Ravidran",
    password: "EduMind123",
    displayName: "Ravidran",
    phase: "analyze",
  },
  {
    username: "Keerthiswaran",
    password: "EduMind123",
    displayName: "Keerthiswaran",
    phase: "relearn",
  },
]

const defaultUser = demoUsers[1]

function getDefaultUser(): DemoUser {
  return defaultUser
}

function getStoredUser(): DemoUser | null {
  const stored = window.localStorage.getItem("edumind-demo-user")
  if (!stored) return null

  return (
    demoUsers.find((user) => user.username.toLowerCase() === stored.toLowerCase()) ??
    null
  )
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [activeUser, setActiveUser] = useState<DemoUser | null>(() => getStoredUser())

  const value = useMemo<SessionState>(
    () => ({
      isAuthenticated: activeUser !== null,
      displayName: activeUser?.displayName ?? getDefaultUser().displayName,
      username: activeUser?.username ?? getDefaultUser().username,
      phase: activeUser?.phase ?? getDefaultUser().phase,
      login: (username, password) => {
        const matchedUser = demoUsers.find(
          (user) =>
            user.username.toLowerCase() === username.trim().toLowerCase() &&
            user.password === password,
        )

        if (matchedUser) {
          setActiveUser(matchedUser)
          window.localStorage.setItem("edumind-demo-user", matchedUser.username)
          return true
        }

        return false
      },
      logout: () => {
        setActiveUser(null)
        window.localStorage.removeItem("edumind-demo-user")
      },
    }),
    [activeUser],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

