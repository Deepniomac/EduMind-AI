# EduMind - AI Powered Adaptive Study Assistant

EduMind is a full-stack adaptive learning project built around this learning workflow:

`Learn -> Test -> Analyze -> Adjust -> Re-learn`

The current implementation uses:

- FastAPI for the backend
- SQLite for persistent local storage
- HTML, CSS, and Vanilla JavaScript for the frontend
- Groq for AI-generated tutor explanations

## Current Implementation

The project currently includes:

- A FastAPI backend with Groq API integration
- SQLite-backed user registration and login
- Password hashing with PBKDF2
- Token-based authenticated sessions stored in `localStorage`
- Seeded demo users available through the real backend auth flow
- A static multi-page frontend with reusable layout and modular JavaScript
- A tutor workflow with:
  - guided mode
  - backend AI mode
  - backend health check
  - quiz step
  - analysis step
  - revision plan step
- Backend-driven dashboard data per user
- Backend-driven quiz loading and quiz submission
- Backend-driven planner data per user
- Supporting documentation in the `Docs/` folder

## Architecture

User (Browser)  
-> HTML/CSS/Vanilla JavaScript Frontend  
-> FastAPI Backend  
-> SQLite  
-> Groq API

## Frontend Pages

The current frontend includes these pages:

- `frontend/index.html`
- `frontend/login.html`
- `frontend/dashboard.html`
- `frontend/tutor.html`
- `frontend/quiz.html`
- `frontend/flashcards.html`
- `frontend/analytics.html`
- `frontend/knowledge-map.html`
- `frontend/mindmap.html`
- `frontend/planner.html`

## Main Features Implemented

### Login and Registration

- New account creation
- Real backend login
- Seeded demo user quick sign-in buttons
- Token session persistence with `localStorage`
- Redirect to dashboard after authentication

### Dashboard

- Learner name display
- Progress metric cards
- Learning cycle tracker
- Subject progress bars
- Knowledge preview section
- Backend-loaded learner dashboard data

### Tutor

- Topic input
- Guided mode
- Backend AI mode
- FastAPI `GET /test` integration
- FastAPI `POST /` integration
- Loading and error handling
- AI explanation rendering
- Quiz answer selection
- Quiz submission
- Score display
- Analysis display
- Revision plan display
- Workflow reset

### Quiz

- Backend-served questions
- Backend quiz submission
- Backend-generated score and feedback
- Learner-specific quiz stats

### Planner

- Backend-served weekly schedule
- Learner-specific planner guidance
- Previous and next week navigation

### Other Pages

- Flashcards page with card navigation
- Analytics page with activity and chart sections
- Knowledge map page with subject tabs and mastery cards
- Mindmap page with predefined concept nodes

## Backend Highlights

- FastAPI API server
- SQLite-backed persistent storage
- Password hashing using PBKDF2
- Opaque token-based session authentication
- CORS enabled for frontend communication
- Environment variable loading from `backend/.env`
- Groq API request handling through `requests`
- Empty query validation with HTTP `400`
- Upstream API failure handling
- Safer response parsing for Groq output

## API Endpoints

### Authentication

#### `POST /auth/register`

Creates a new user, seeds learner data, and returns an auth token.

#### `POST /auth/login`

Logs in an existing user and returns an auth token.

#### `GET /auth/me`

Returns the currently authenticated user profile.

#### `POST /auth/logout`

Invalidates the current session token.

### Tutor

#### `POST /`

Request:

```json
{
  "query": "Explain stack in simple words"
}
```

Success response:

```json
{
  "response": "AI explanation text"
}
```

Possible errors:

- `400` if the query is empty
- `500` if `GROQ_API_KEY` is missing
- `502` or upstream status if Groq fails

#### `GET /test`

Response:

```json
{
  "reply": "Hello from FastAPI backend!"
}
```

### Dashboard

#### `GET /dashboard/{username}`

Legacy learner-specific dashboard endpoint by username.

#### `GET /me/dashboard`

Authenticated dashboard endpoint for the signed-in user.

### Quiz

#### `GET /quiz/{username}`

Legacy learner-specific quiz endpoint by username.

#### `GET /me/quiz`

Authenticated quiz endpoint for the signed-in user.

#### `POST /quiz/submit`

Legacy quiz submission endpoint with explicit username.

#### `POST /me/quiz/submit`

Authenticated quiz submission endpoint for the signed-in user.

### Planner

#### `GET /planner/{username}`

Legacy learner-specific planner endpoint by username.

#### `GET /me/planner`

Authenticated planner endpoint for the signed-in user.

## Key Files

- `backend/main.py`
- `backend/.env.example`
- `backend/edumind.db` (created automatically on first run)
- `requirements.txt`
- `frontend/index.html`
- `frontend/login.html`
- `frontend/dashboard.html`
- `frontend/tutor.html`
- `frontend/quiz.html`
- `frontend/planner.html`
- `frontend/js/auth.js`
- `frontend/js/dashboard.js`
- `frontend/js/tutor.js`
- `frontend/js/quiz.js`
- `frontend/js/planner.js`
- `frontend/css/style.css`
- `Docs/05_FEATURE_IMPLEMENTATION_AND_API.md`

## Setup and Run

### 1. Clone the repository

```bash
git clone https://github.com/Deepniomac/EduMind-AI.git
cd EduMind-AI
```

### 2. Install backend dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Copy:

```text
backend/.env.example
```

to:

```text
backend/.env
```

Then set:

```env
GROQ_API_KEY=your_groq_api_key_here
EDUMIND_DB_PATH=edumind.db
SESSION_TTL_HOURS=168
```

### 4. Run the backend

From the project root:

```bash
python -m uvicorn backend.main:app --reload --port 8000
```

Or, if you first change into the backend folder:

```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

Do not use `backend.main:app` from inside the `backend` folder. That import path only works when you run Uvicorn from the project root.

Backend will be available at:

```text
http://127.0.0.1:8000
```

### 5. Run the frontend

Serve the frontend folder as static files:

```bash
cd frontend
python -m http.server 5500
```

Frontend will be available at:

```text
http://127.0.0.1:5500/login.html
```

If you are using the existing Five Server preview from the workspace root, open:

```text
http://127.0.0.1:5500/frontend/login.html
```

You can also open:

```text
http://127.0.0.1:5500/index.html
```

The index page automatically redirects to `login.html` or `dashboard.html` depending on the saved session.

## Seeded Demo Users

These seeded accounts are created automatically in SQLite on first backend run:

- `Thanuja`
- `Deepesh`
- `Hemanth`
- `Murali`

Demo password for both:

```text
EduMind123
```

## Current Scope Notes

- The tutor explanation uses the backend AI endpoint
- Dashboard, quiz, and planner now use backend endpoints
- Real registration/login is now available
- Analytics, flashcards, knowledge map, and mindmap are still frontend-driven demo modules
- There is no production-grade authorization model yet
- There is no cloud database yet

## Documentation

Additional documentation is available in:

- `Docs/01_ABSTRACT.md`
- `Docs/02_TECH_STACK.md`
- `Docs/03_ARCHITECTURE.md`
- `Docs/04_FRONTEND_EXPLANATION.md`
- `Docs/05_FEATURE_IMPLEMENTATION_AND_API.md`
