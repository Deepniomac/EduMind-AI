import { createContext } from "react"

export type LearningPhase = "analyze" | "relearn"

export type SessionState = {
  isAuthenticated: boolean
  displayName: string
  username: string
  phase: LearningPhase
  login: (username: string, password: string) => boolean
  logout: () => void
}

export const SessionContext = createContext<SessionState | null>(null)
