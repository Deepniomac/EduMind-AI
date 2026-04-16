import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

export type LearningPhase = "analyze" | "relearn"

type DemoUser = {
  username: string
  password: string
  displayName: string
  phase: LearningPhase
}

type SessionState = {
  isAuthenticated: boolean
  displayName: string
  username: string
  phase: LearningPhase
  login: (username: string, password: string) => boolean
  logout: () => void
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

const SessionContext = createContext<SessionState | null>(null)

function getDefaultUser(): DemoUser {
  return demoUsers[1]
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [activeUser, setActiveUser] = useState<DemoUser | null>(null)

  useEffect(() => {
    const stored = window.localStorage.getItem("edumind-demo-user")
    if (!stored) return

    const matchedUser = demoUsers.find(
      (user) => user.username.toLowerCase() === stored.toLowerCase(),
    )

    if (matchedUser) {
      setActiveUser(matchedUser)
    }
  }, [])

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

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error("useSession must be used within SessionProvider")
  }
  return context
}

export const demoCredentials = demoUsers
