# Frontend Planning for EduMind

Date: 2026-04-16

## Goal

Build EduMind as a multi-page adaptive learning dashboard that supports the full study loop:

Learn -> Test -> Analyze -> Adjust -> Re-learn

The frontend should feel like a serious study operating system, not a single chatbot page. It should support clear learning workflows, visible progress, and fast expansion as backend APIs become more specialized.

## Current Repo Reality

The current frontend is a small Vite + React + TypeScript app with:

- `App.tsx` rendering a header and a chat-based learning cycle
- no routing yet
- no shared layout system yet
- no typed API layer yet
- only two backend endpoints currently available:
  - `GET /test`
  - `POST /`

This means the right next step is not to keep adding UI into one page. The right next step is to move to a modular dashboard architecture first.

## Product Direction

EduMind should be structured around 8 main pages:

1. Dashboard
2. AI Tutor
3. Adaptive Quiz
4. Mindmap Generator
5. Flashcards
6. Progress & Analytics
7. Knowledge Map
8. Study Planner

These pages should all live inside a shared shell with a persistent sidebar, top header, consistent cards, and reusable data-visual components.

## UX Principles

- Keep the adaptive learning cycle visible across the app.
- Make progress visible at every level: subject, topic, session, and weekly plan.
- Reduce clutter by using progressive disclosure.
- Use visual hierarchy to show what the learner should do next.
- Design for desktop first, but keep all layouts responsive for tablet and mobile.
- Let pages feel connected through shared tokens, not identical blocks.

## Recommended Frontend Stack

Keep the current stack and extend it:

- React 19
- TypeScript
- Vite
- React Router for page navigation
- plain CSS or CSS Modules for now

Optional next additions after structure is in place:

- `react-router-dom` for routing
- `recharts` or `nivo` for analytics charts
- `clsx` for class composition
- `zod` for API response validation

## Recommended Source Structure

```text
frontend/
  src/
    app/
      router.tsx
      providers.tsx
    api/
      client.ts
      tutor.ts
      quiz.ts
      planner.ts
      analytics.ts
      knowledge.ts
    assets/
    components/
      layout/
        AppShell.tsx
        Sidebar.tsx
        Topbar.tsx
        PageHeader.tsx
      dashboard/
        MetricCard.tsx
        FeatureCard.tsx
        LearningCycleTracker.tsx
        SubjectProgressList.tsx
        KnowledgeHashmapPreview.tsx
      tutor/
        TutorChatPanel.tsx
        SuggestedQuestions.tsx
        TopicContextPanel.tsx
        QuickActionChips.tsx
      quiz/
        QuestionCard.tsx
        OptionButton.tsx
        QuestionMap.tsx
        SessionStats.tsx
      flashcards/
        FlashcardViewer.tsx
        RatingControls.tsx
        DeckList.tsx
      analytics/
        ActivityHeatmap.tsx
        MasteryTrendChart.tsx
        RecentActivityFeed.tsx
      knowledge/
        KnowledgeMapGrid.tsx
        TopicDetailDrawer.tsx
      planner/
        WeeklySchedule.tsx
        DailyGoalCard.tsx
        RecommendationChips.tsx
      shared/
        Card.tsx
        Badge.tsx
        ProgressBar.tsx
        EmptyState.tsx
        LoadingState.tsx
        ErrorState.tsx
    data/
      mockDashboard.ts
      mockQuiz.ts
      mockPlanner.ts
      mockKnowledge.ts
    hooks/
      useBackendHealth.ts
      useTutorSession.ts
      useAdaptiveQuiz.ts
      useFlashcards.ts
    pages/
      DashboardPage.tsx
      TutorPage.tsx
      QuizPage.tsx
      MindmapPage.tsx
      FlashcardsPage.tsx
      AnalyticsPage.tsx
      KnowledgeMapPage.tsx
      StudyPlannerPage.tsx
    styles/
      tokens.css
      globals.css
      layout.css
    types/
      dashboard.ts
      tutor.ts
      quiz.ts
      planner.ts
      analytics.ts
      knowledge.ts
    App.tsx
    main.tsx
```

## Shared Layout Plan

### App shell

Every page should render inside one reusable shell:

- left sidebar for navigation
- top bar for page title, quick search, profile, and backend status
- content area with page-specific layout

### Sidebar sections

- Overview
  - Dashboard
- Learn
  - AI Tutor
  - Mindmap Generator
  - Flashcards
- Practice
  - Adaptive Quiz
- Insights
  - Progress & Analytics
  - Knowledge Map
- Planning
  - Study Planner

### Persistent global UI

- backend connectivity badge
- current subject/topic breadcrumb
- adaptive cycle mini-tracker
- quick action launcher

## Page-by-Page Planning

## 1. Dashboard

Purpose:
The main overview page showing where the student stands and what they should do next.

Main sections:

- metric cards
  - total study time
  - quiz accuracy
  - mastery score
  - streak
- feature card grid with visual hierarchy
  - continue current topic
  - take adaptive quiz
  - revise weak areas
  - generate flashcards
- adaptive learning cycle tracker
  - highlight current phase
  - show latest transition timestamp
- subject progress bars
  - Data Structures
  - Operating Systems
  - Algorithms
- knowledge hashmap preview
  - click a cell to open knowledge map

Important interactions:

- clicking a feature card routes to the relevant page
- clicking a subject filters the rest of the dashboard
- clicking a hashmap cell opens topic details

## 2. AI Tutor

Purpose:
A guided study interface, richer than a normal chatbot.

Layout:

- main chat panel
- right sidebar with context panels

Main sections:

- tutor conversation feed
- suggested questions list
- topic context panel
  - current subject
  - difficulty
  - prerequisite concepts
  - next concepts
- quick action chips
  - summarize
  - mindmap
  - quiz me
  - make flashcards

Important interactions:

- user sends question
- assistant reply renders as rich study content
- quick action chip transforms current tutor context
- sidebar suggestions refill based on topic

Backend phase 1 mapping:

- `POST /` handles tutor prompts
- `GET /test` powers backend health badge

Future backend endpoints:

- `POST /tutor/explain`
- `POST /tutor/followup`
- `POST /tutor/actions`

## 3. Adaptive Quiz

Purpose:
Deliver topic quizzes with visible progress and adaptive feedback.

Main sections:

- question card
- answer options
- live question map
- session stats panel
- AI difficulty note

Important interactions:

- select option
- immediate or delayed correctness feedback
- jump using question map dots
- submit quiz
- show analysis summary and next recommended topic

Visual behavior:

- unanswered: neutral
- selected: emphasized
- correct: green
- wrong: red

Future backend endpoints:

- `POST /quiz/start`
- `POST /quiz/answer`
- `POST /quiz/submit`
- `GET /quiz/session/:id`

## 4. Mindmap Generator

Purpose:
Visualize concept relationships for a chosen topic.

Main sections:

- topic input
- generate button
- zoom controls
- SVG or canvas mindmap viewer
- key concepts side panel

Important interactions:

- generate mindmap from topic
- click node to inspect concept
- send node to tutor or flashcards

Future backend endpoints:

- `POST /mindmap/generate`
- `GET /mindmap/:topic`

## 5. Flashcards

Purpose:
Support revision using spaced repetition.

Main sections:

- active flashcard viewer
- flip interaction
- response rating controls
  - Again
  - Hard
  - Easy
- deck list
- due today summary

Important interactions:

- click card to flip
- rate recall difficulty
- auto-advance to next due card
- filter decks by subject

Future backend endpoints:

- `GET /flashcards/decks`
- `POST /flashcards/generate`
- `POST /flashcards/review`

## 6. Progress & Analytics

Purpose:
Give the student actionable insight rather than raw numbers.

Main sections:

- metrics summary
- activity heatmap
- mastery trend chart
- weak-topic list
- recent activity feed

Important interactions:

- filter by time range
- filter by subject
- click a weak topic to jump into tutor or quiz

Future backend endpoints:

- `GET /analytics/overview`
- `GET /analytics/activity`
- `GET /analytics/mastery`

## 7. Knowledge Map

Purpose:
Represent mastery at topic level using a concept grid or hashmap.

Main sections:

- subject tabs
- knowledge hashmap grid
- mastery legend
- topic detail drawer

Grid behavior:

- each cell = concept or topic
- color intensity = mastery level
- hover reveals score and last review
- click opens detail drawer

Topic detail drawer:

- mastery percentage
- last quiz result
- linked prerequisites
- recommended next action

Future backend endpoints:

- `GET /knowledge-map`
- `GET /knowledge-map/:subject`
- `GET /knowledge-map/topic/:id`

## 8. Study Planner

Purpose:
Convert analytics into a concrete weekly schedule.

Main sections:

- weekly planner grid
- daily goal progress
- recommendation chips
- study-load summary

Important interactions:

- accept or regenerate AI recommendations
- drag sessions between days in a later phase
- mark planned sessions complete

Future backend endpoints:

- `GET /planner/week`
- `POST /planner/generate`
- `POST /planner/update`

## Shared Components to Build First

These components will be reused across multiple pages and should be built before page-specific details:

- `AppShell`
- `Sidebar`
- `Topbar`
- `Card`
- `Badge`
- `ProgressBar`
- `PageHeader`
- `EmptyState`
- `LoadingState`
- `ErrorState`

After that, build the visual components that define EduMind's identity:

- `LearningCycleTracker`
- `KnowledgeHashmapPreview`
- `QuestionMap`
- `ActivityHeatmap`
- `WeeklySchedule`

## State Management Plan

Start simple and local. Do not jump into a heavy global store too early.

Recommended approach:

- React local state for page interactions
- custom hooks for page-specific logic
- a lightweight app context only for shared global data

Use app-level context for:

- backend health
- active subject
- active topic
- user preferences
- selected learning mode

Keep page state local for:

- chat messages
- current quiz session
- flashcard flip state
- planner editing state

## API Integration Strategy

The backend is currently minimal, so the frontend should support two modes:

### Mode 1: Mock-first UI mode

Use local mock data for:

- dashboard metrics
- quiz questions
- planner schedule
- analytics heatmap
- knowledge map cells

This allows all pages to be designed and demoed before backend expansion.

### Mode 2: Live API mode

Once backend endpoints exist, swap page hooks from mock adapters to API adapters.

Suggested client design:

```ts
type ApiMode = "mock" | "live"
```

Each feature hook should decide which adapter to use based on configuration.

Example:

- `useAdaptiveQuiz()` can read mock quiz data today
- later it can call `/quiz/start` and `/quiz/answer`

## Suggested Type Models

Core types to define early:

- `Subject`
- `Topic`
- `MasteryLevel`
- `LearningCycleStage`
- `TutorMessage`
- `QuizQuestion`
- `QuizSession`
- `Flashcard`
- `ActivityEntry`
- `StudySession`

Example:

```ts
export type LearningCycleStage =
  | "learn"
  | "test"
  | "analyze"
  | "adjust"
  | "relearn"
```

## Visual Design Direction

The current app still uses starter Vite styling. EduMind needs a clearer visual identity.

Recommended direction:

- academic + futuristic, but still warm
- off-white or deep slate surfaces instead of default black
- strong blue, teal, amber accents
- visible card hierarchy
- dense but readable dashboard layouts

Token categories to define:

- colors
- spacing
- radius
- shadow
- typography scale
- chart and mastery colors

Important custom visual patterns:

- knowledge hashmap cells with mastery gradients
- adaptive cycle tracker with connected stages
- heatmap blocks for study consistency
- feature cards with dominant call-to-action

## Responsive Behavior

Desktop:

- full sidebar visible
- multi-column cards
- split-panel pages

Tablet:

- collapsible sidebar
- reduced analytics density
- stacked side panels where needed

Mobile:

- drawer navigation
- single-column content
- horizontal scrolling only for planner or heatmap when necessary

## Accessibility Plan

- keyboard navigation for sidebar and question map
- visible focus states on interactive cards
- color is never the only signal for correctness or mastery
- flashcards work without hover
- SVG mindmap nodes have labels and accessible names

## Implementation Phases

## Phase 1: Foundation

- add routing
- create app shell
- define design tokens
- move current chat page into `TutorPage`
- create placeholder pages for all 8 routes

## Phase 2: Dashboard and Shared Visuals

- build dashboard cards
- build learning cycle tracker
- build subject progress section
- build knowledge hashmap preview

## Phase 3: Learning Tools

- build AI Tutor page
- build Adaptive Quiz page
- build Mindmap page
- build Flashcards page

## Phase 4: Insights and Planning

- build Analytics page
- build Knowledge Map page
- build Study Planner page

## Phase 5: API Wiring

- add typed API client
- connect tutor health and chat to FastAPI
- add mock/live adapters for each feature
- replace mock data feature by feature

## Phase 6: Polish

- loading and empty states
- animation and transitions
- mobile behavior
- accessibility cleanup

## Immediate Build Order Recommendation

If implementation starts now, build in this order:

1. App shell and routing
2. Dashboard
3. AI Tutor migration from current `Chat` component
4. Adaptive Quiz
5. Knowledge Map
6. Analytics
7. Study Planner
8. Flashcards
9. Mindmap Generator

This order gives EduMind a believable product skeleton very quickly while reusing the current learning-cycle logic.

## Mapping From Current Code

Current files:

- `frontend/src/App.tsx`
- `frontend/src/components/header.tsx`
- `frontend/src/components/chat.tsx`

Recommended migration:

- move current chat logic into `pages/TutorPage.tsx`
- replace inline styles with reusable CSS classes or component styles
- remove Vite starter CSS from `App.css`
- convert `Header` into `Topbar`
- introduce `Sidebar` and `AppShell`

## Final Recommendation

The frontend should now be treated as a dashboard product, not a single-page demo. The key architectural move is:

single chat page -> routed application shell with reusable study components

That gives you a clean base for the 8-page EduMind experience while still letting the current backend power the first live interactions.
