# EduMind Vanilla Frontend

This frontend now uses only:

- HTML
- CSS
- Vanilla JavaScript

The FastAPI backend remains unchanged and is called through the browser `fetch()` API.

## Pages

- `index.html`
- `login.html`
- `dashboard.html`
- `tutor.html`
- `quiz.html`
- `flashcards.html`
- `analytics.html`
- `knowledge-map.html`
- `mindmap.html`
- `planner.html`

## Folder Structure

```text
frontend/
  index.html
  login.html
  dashboard.html
  tutor.html
  quiz.html
  flashcards.html
  analytics.html
  knowledge-map.html
  mindmap.html
  planner.html
  css/
    style.css
    dashboard.css
    tutor.css
  js/
    auth.js
    dashboard.js
    tutor.js
    quiz.js
    flashcards.js
    analytics.js
    knowledge-map.js
    mindmap.js
    planner.js
```

## How To Run

### 1. Run the FastAPI backend

From the project root:

```bash
python -m uvicorn backend.main:app --reload --port 8000
```

Or, if you first change into the backend folder:

```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

Backend URLs:

- `http://127.0.0.1:8000/`
- `http://127.0.0.1:8000/test`

### 2. Serve the frontend as static files

From the project root:

```bash
cd frontend
python -m http.server 5500
```

### 3. Open the app

```text
http://127.0.0.1:5500/login.html
```

You can also open:

```text
http://127.0.0.1:5500/index.html
```

The index page redirects to `login.html` or `dashboard.html` based on the saved session in `localStorage`.

## Session Storage

The frontend stores the logged-in learner in:

- `localStorage["edumind-session"]`

## Tutor Integration

`js/tutor.js` uses:

- `GET /test` to verify backend connectivity
- `POST /` to request the AI explanation

If the backend is unavailable, the tutor falls back to the guided local explanation.

`js/dashboard.js` uses:

- `GET /dashboard/{username}`

`js/quiz.js` uses:

- `GET /quiz/{username}`
- `POST /quiz/submit`

## Current Integration Scope

At the moment:

- the tutor page is connected to the backend
- the dashboard page is connected to the backend
- the quiz page is connected to the backend
- the other pages are still frontend-driven demo screens
- a real Groq API key is still required in `backend/.env`

So the project is ready to set up and run locally, but it is not yet a fully backend-driven real-time platform across every page.
