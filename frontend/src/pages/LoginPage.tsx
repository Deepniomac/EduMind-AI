import { useState, type FormEvent } from "react"
import { demoCredentials, useSession } from "../app/session"

export function LoginPage() {
  const { login } = useSession()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const ok = login(username, password)
    if (!ok) {
      setError("Use one of the listed credentials exactly as provided.")
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <p className="page-header__eyebrow">EduMind Access</p>
        <h1>Sign in to continue</h1>
        <p className="page-header__description">
          Choose one of the available users to open the corresponding learning-phase dashboard.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-field">
            <span>Username</span>
            <input value={username} onChange={(event) => setUsername(event.target.value)} />
          </label>

          <label className="login-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <button className="app-button login-button" type="submit">
            Sign In
          </button>
        </form>

        <div className="login-hint">
          {demoCredentials.map((user) => (
            <div key={user.username} className="login-hint__row">
              <strong>{user.username}</strong> / {user.password}
            </div>
          ))}
        </div>

        {error ? <p className="login-error">{error}</p> : null}
      </div>
    </div>
  )
}
