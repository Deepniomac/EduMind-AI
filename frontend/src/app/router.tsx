import { createBrowserRouter } from "react-router-dom"
import { AppShell } from "../components/layout/AppShell"
import { AnalyticsPage } from "../pages/AnalyticsPage"
import { DashboardPage } from "../pages/DashboardPage"
import { FlashcardsPage } from "../pages/FlashcardsPage"
import { KnowledgeMapPage } from "../pages/KnowledgeMapPage"
import { MindmapPage } from "../pages/MindmapPage"
import { QuizPage } from "../pages/QuizPage"
import { StudyPlannerPage } from "../pages/StudyPlannerPage"
import { TutorPage } from "../pages/TutorPage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "tutor", element: <TutorPage /> },
      { path: "quiz", element: <QuizPage /> },
      { path: "mindmap", element: <MindmapPage /> },
      { path: "flashcards", element: <FlashcardsPage /> },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "knowledge-map", element: <KnowledgeMapPage /> },
      { path: "planner", element: <StudyPlannerPage /> },
    ],
  },
])
