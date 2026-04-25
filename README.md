# EduMind - AI Powered Adaptive Study Assistant

EduMind is a full-stack study assistant that combines a React frontend with a FastAPI backend to guide students through a structured learning cycle.

Instead of acting like a simple question-answer chatbot, the app is organized around a workflow:

Learn -> Test -> Analyze -> Adjust -> Re-learn

## Current Project State

The repository currently includes:

- A React + TypeScript + Vite frontend
- A FastAPI backend with Groq API integration support
- A demo login flow for two sample learners
- A tutor workflow that explains a topic, presents a quiz, analyzes answers, and suggests the next revision step

## Architecture

User (Browser)
-> React Frontend
-> FastAPI Backend
-> Groq / AI API

## Frontend Highlights

- Routing is handled with `react-router-dom`
- Session state is shared through a dedicated session context and hook
- Demo users are stored in local state and persisted with `localStorage`
- The tutor page supports:
  - guided demo mode
  - backend AI mode
  - typed study questions
  - quiz submission and revision feedback

## Backend Highlights

- FastAPI serves the API
- CORS is enabled for frontend-to-backend communication
- The backend reads `GROQ_API_KEY` from environment variables
- External API failures now return proper HTTP errors instead of success responses with embedded error text

## Key Files

- `frontend/src/App.tsx`: app entry composition
- `frontend/src/app/SessionContext.ts`: shared session types and context
- `frontend/src/app/session.tsx`: session provider and localStorage initialization
- `frontend/src/app/useSession.ts`: shared session hook
- `frontend/src/components/chat.tsx`: tutor workflow UI and API interaction
- `backend/main.py`: backend API and Groq integration

## How To Run

### 1. Clone the repository

```bash
git clone https://github.com/Deepniomac/EduMind-AI.git
cd EduMind-AI
```

### 2. Install backend dependencies

```bash
pip install -r requirements.txt
```

### 3. Set the backend environment variable

Create a `.env` file in `backend/` with:

```env
GROQ_API_KEY=your_api_key_here
```

### 4. Run the backend

```bash
cd backend
uvicorn main:app --reload
```

### 5. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

### 6. Open the app

Frontend:

```text
http://localhost:5173
```

Backend test endpoint:

```text
http://127.0.0.1:8000/test
```

## Demo Login Notes

The current app includes demo users for local testing. The login screen now uses quick sign-in buttons instead of displaying raw passwords in the UI.

## Documentation

Additional project notes are available in the `Docs/` folder.
