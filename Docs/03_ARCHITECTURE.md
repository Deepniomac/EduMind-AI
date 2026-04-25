# System Architecture

EduMind follows a client-server architecture with a frontend session layer and a backend AI integration layer.

## High-Level Flow

User (Browser)
-> React Frontend
-> FastAPI Backend
-> Groq API

## Frontend Responsibilities

- render pages and tutor workflow UI
- manage login state for demo users
- persist selected demo user in `localStorage`
- send tutor prompts to the backend when AI mode is enabled
- display guided fallback content when backend AI is not available

## Backend Responsibilities

- receive frontend requests
- validate incoming tutor prompt payloads
- load environment variables
- call the external Groq chat completion API
- return either AI responses or proper HTTP errors

## Session Structure

The frontend session layer is split into:

- `SessionContext.ts`: shared context and types
- `session.tsx`: provider and state initialization
- `useSession.ts`: hook used by pages and layout components

This split keeps the session system easier to maintain and avoids frontend hot-reload lint issues.

## Tutor Workflow

The tutor workflow in `frontend/src/components/chat.tsx` currently supports:

1. entering a study question
2. generating a learning explanation
3. answering a short quiz
4. viewing analysis results
5. receiving a revision plan

The workflow can run in:

- guided demo mode
- backend AI mode
