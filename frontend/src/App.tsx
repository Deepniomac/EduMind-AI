import { RouterProvider } from "react-router-dom"
import { LoginPage } from "./pages/LoginPage"
import { SessionProvider } from "./app/session"
import { router } from "./app/router"
import { useSession } from "./app/useSession"

function AppContent() {
  const { isAuthenticated } = useSession()
  return isAuthenticated ? <RouterProvider router={router} /> : <LoginPage />
}

function App() {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  )
}

export default App
