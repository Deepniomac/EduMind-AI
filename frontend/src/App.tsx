import { RouterProvider } from "react-router-dom"
import { LoginPage } from "./pages/LoginPage"
import { SessionProvider, useSession } from "./app/session"
import { router } from "./app/router"

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
