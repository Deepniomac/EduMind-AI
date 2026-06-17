# EduMind Feature Implementation and API Endpoints

## Project Summary

EduMind is an AI-assisted adaptive study application built with:

- Frontend: HTML + CSS + Vanilla JavaScript
- Backend: FastAPI
- AI Provider: Groq Chat Completions API

The current learning workflow shown in the product is:

`Learn -> Test -> Analyze -> Adjust -> Re-learn`

---

## Feature Implementation Format

Use the following format whenever a new feature is added:

```md
## Feature: <Feature Name>

### Purpose
Short description of what the feature does.

### Implementation Status
- Implemented / Partial / Prototype / Planned

### Frontend
- Route/Page:
- Components:
- User interaction:
- State handled:

### Backend
- API endpoint(s):
- Request payload:
- Response payload:
- External services:

### Logic Summary
Step-by-step explanation of how the feature works.

### Notes
- Edge cases
- Limitations
- Future improvements
```

---

## Implemented Features

## Feature: Demo Login and Session Selection

### Purpose
Allows the user to sign in using demo accounts and loads a learner-specific phase view.

### Implementation Status
- Implemented

### Frontend
- Route/Page: `frontend/login.html`
- Script: `frontend/js/auth.js`
- User interaction:
  - manual username/password login
  - quick sign-in buttons for demo users
- State handled:
  - authenticated user
  - learner display name
  - learner phase
  - localStorage persistence using `edumind-demo-user`

### Backend
- API endpoint(s): none

### Logic Summary
1. User opens the app.
2. If no active session exists, the login page is shown.
3. The app checks entered credentials against local demo users.
4. On success, the selected username is stored in `localStorage`.
5. The app loads the main router and personalizes screens using the learner's phase.

### Notes
- Authentication is frontend-only.
- This is demo authentication, not secure production auth.

---

## Feature: Dashboard Overview

### Purpose
Shows learner-specific progress, cycle status, subject progress, and knowledge preview.

### Implementation Status
- Implemented with backend-driven learner data

### Frontend
- Route/Page: `frontend/dashboard.html`
- Script: `frontend/js/dashboard.js`
- User interaction:
  - passive dashboard viewing
- State handled:
  - learner display name
  - active learning phase

### Backend
- API endpoint(s):
  - `GET /dashboard/{username}`

### Logic Summary
1. Dashboard reads the current learner from session context.
2. Labels and metrics adapt based on whether the learner is in `analyze` or `relearn`.
3. Static progress cards, cycle tracker, subject bars, and knowledge cells are rendered.

### Notes
- Current metrics are served from backend demo learner profiles.
- No database persistence is connected yet.

---

## Feature: AI Tutor Learning Cycle

### Purpose
Runs the main study workflow where a learner enters a topic, receives an explanation, takes a quiz, sees analysis, and gets a revision plan.

### Implementation Status
- Implemented

### Frontend
- Route/Page: `frontend/tutor.html`
- Script:
  - `frontend/js/tutor.js`
- User interaction:
  - enter a study question
  - switch between guided demo mode and backend AI mode
  - start learning cycle
  - answer quiz questions
  - submit answers
  - reset cycle
  - refresh analyze or re-learn flow
- State handled:
  - current question
  - backend mode
  - backend connection status
  - stored study record
  - learn text
  - quiz data
  - selected answers
  - analysis text
  - revision plan text
  - active phase
  - loading state

### Backend
- API endpoint(s):
  - `POST /`
  - `GET /test`
- External services:
  - Groq Chat Completions API

### Logic Summary
1. User enters a study topic.
2. User chooses either:
   - Guided mode: uses local demo content
   - AI mode: calls the FastAPI backend
3. The Learn step generates or loads an explanation.
4. A quiz is displayed.
5. User selects answers and submits.
6. The app calculates score and missed questions.
7. The app generates analysis text.
8. The app creates an adjustment/revision plan.
9. The learner can restart or refresh the cycle.

### Notes
- Quiz content is currently hardcoded around the stack topic.
- AI mode currently generates only the explanation step.
- Analysis and revision planning are frontend-generated demo logic.

---

## Feature: Backend AI Response Proxy

### Purpose
Accepts a learner query from the frontend and returns an AI-generated explanation.

### Implementation Status
- Implemented

### Frontend
- Used by: `frontend/js/tutor.js`

### Backend
- File: `backend/main.py`
- API endpoint(s): `POST /`
- Request payload:

```json
{
  "query": "Explain stack in a student-friendly way"
}
```

- Response payload:

```json
{
  "response": "AI generated explanation text"
}
```

- External services:
  - `https://api.groq.com/openai/v1/chat/completions`

### Logic Summary
1. Frontend sends a JSON body with `query`.
2. FastAPI validates the body using the `Query` model.
3. Backend checks whether `GROQ_API_KEY` exists.
4. Backend sends the request to Groq using model `llama-3.1-8b-instant`.
5. The returned assistant message is extracted.
6. Backend responds with `{ "response": "<text>" }`.

### Notes
- If `GROQ_API_KEY` is missing, the backend returns HTTP 500.
- If Groq fails, the backend returns an HTTP error based on the upstream response.

---

## Feature: Backend Health/Test Check

### Purpose
Allows the frontend to verify whether the backend is reachable.

### Implementation Status
- Implemented

### Frontend
- Used by: `frontend/js/tutor.js`
- Trigger:
  - runs when the user switches to AI mode

### Backend
- File: `backend/main.py`
- API endpoint(s): `GET /test`

### Logic Summary
1. Frontend changes mode to `ai`.
2. A request is sent to `/test`.
3. If the response is successful, backend status becomes `connected`.
4. If the request fails, backend status becomes `disconnected`.

### Notes
- This is a lightweight connectivity check.
- It does not verify whether the Groq API key is valid.

---

## Feature: Adaptive Quiz Page

### Purpose
Displays a quiz-style revision checkpoint aligned to the learner's phase.

### Implementation Status
- Implemented with backend-served quiz loading and backend submission

### Frontend
- Route/Page: `frontend/quiz.html`
- Script: `frontend/js/quiz.js`
- User interaction:
  - answer selection UI
  - question map navigation UI

### Backend
- API endpoint(s):
  - `GET /quiz/{username}`
  - `POST /quiz/submit`

### Logic Summary
1. The page reads the signed-in learner and active phase.
2. A sample checkpoint question is displayed.
3. Static answer options and progress indicators are rendered.

### Notes
- Quiz data is currently served from backend demo learner profiles.
- Submission is processed by the backend, but there is no database persistence yet.

---

## Feature: Flashcards Review

### Purpose
Provides a flashcard-style review screen for topic reinforcement.

### Implementation Status
- Implemented as a frontend prototype

### Frontend
- Route/Page: `frontend/flashcards.html`
- Script: `frontend/js/flashcards.js`
- User interaction:
  - flashcard action buttons
  - deck list browsing

### Backend
- API endpoint(s): none

### Logic Summary
1. The page renders an active flashcard.
2. Review actions and deck summaries are displayed.
3. Content is adapted visually using learner phase labels.

### Notes
- No spaced repetition logic or storage is connected yet.

---

## Feature: Analytics View

### Purpose
Shows study activity and progress insights.

### Implementation Status
- Implemented as a frontend prototype

### Frontend
- Route/Page: `frontend/analytics.html`
- Script: `frontend/js/analytics.js`
- User interaction:
  - passive analytics viewing

### Backend
- API endpoint(s): none

### Logic Summary
1. The page renders a study heatmap and recent activity feed.
2. Labels are personalized using current learner and phase context.

### Notes
- Activity and analytics data are currently static.

---

## Feature: Knowledge Map

### Purpose
Visualizes subject mastery as clickable topic cells.

### Implementation Status
- Implemented as a frontend prototype

### Frontend
- Route/Page: `frontend/knowledge-map.html`
- Script: `frontend/js/knowledge-map.js`
- User interaction:
  - switch subject tabs
  - inspect highlighted mastery cells

### Backend
- API endpoint(s): none

### Logic Summary
1. The page loads predefined subject maps.
2. The learner can switch between subjects.
3. Each topic cell shows a mastery strength visually.
4. A detail drawer highlights the strongest current topic.

### Notes
- Topic mastery is not yet loaded from a backend profile.

---

## Feature: Mindmap Generator

### Purpose
Displays a concept map for a supported topic and lets the learner inspect nodes.

### Implementation Status
- Implemented as a frontend prototype

### Frontend
- Route/Page: `frontend/mindmap.html`
- Script: `frontend/js/mindmap.js`
- User interaction:
  - enter topic
  - click Generate
  - click concept nodes

### Backend
- API endpoint(s): none

### Logic Summary
1. The page accepts a topic input.
2. It currently supports a predefined topic: `Data Structures`.
3. If generated, the concept map is shown.
4. Clicking a node updates the right-side inspector.

### Notes
- This is not dynamically AI-generated yet.
- Topic coverage is intentionally limited to one supported map.

---

## Feature: Study Planner

### Purpose
Displays a week-by-week revision schedule and recommendations.

### Implementation Status
- Implemented as a frontend prototype

### Frontend
- Route/Page: `frontend/planner.html`
- Script: `frontend/js/planner.js`
- User interaction:
  - previous and next week navigation

### Backend
- API endpoint(s): none

### Logic Summary
1. The page loads predefined weekly schedules.
2. The learner can move between week views.
3. Daily sessions and recommendation chips are displayed.

### Notes
- Planner data is currently static.
- No AI scheduling API is connected yet.

---

## API Endpoints

## 1. POST `/`

### Purpose
Send a study prompt to the backend and receive an AI-generated explanation.

### Request Body

```json
{
  "query": "Explain the topic in simple words"
}
```

### Success Response

```json
{
  "response": "Generated explanation"
}
```

### Error Responses

- `500`: `GROQ_API_KEY` is not configured
- `502` or upstream error code: failed request to Groq API

### Used In

- `frontend/js/tutor.js`

---

## 2. GET `/test`

### Purpose
Check whether the backend server is running and reachable.

### Request Body

- None

### Success Response

```json
{
  "reply": "Hello from FastAPI backend!"
}
```

### Used In

- `frontend/js/tutor.js`

---

## Current Backend Models

## Query

```json
{
  "query": "string"
}
```

Description:

- `query`: learner question or prompt sent from the frontend to the backend

---

## Current Limitations

- Only two backend endpoints currently exist.
- Only the tutor explanation step is connected to AI.
- Most pages are UI-driven prototypes using static data.
- There is no database integration yet.
- There is no production authentication or user management yet.
- There is no persistent learner progress API yet.

---

## Suggested Next API Endpoints

If you want to expand the backend properly, the next useful endpoints would be:

- `POST /login`
- `GET /dashboard`
- `POST /quiz/generate`
- `POST /quiz/submit`
- `POST /flashcards/generate`
- `GET /analytics/{userId}`
- `GET /knowledge-map/{userId}`
- `POST /planner/generate`
- `POST /mindmap/generate`

---

## Reference Files

- `backend/main.py`
- `frontend/js/auth.js`
- `frontend/js/dashboard.js`
- `frontend/js/tutor.js`
- `frontend/js/quiz.js`
- `frontend/js/flashcards.js`
- `frontend/js/analytics.js`
- `frontend/js/knowledge-map.js`
- `frontend/js/mindmap.js`
- `frontend/js/planner.js`
