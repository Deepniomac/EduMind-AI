# Frontend Explanation

The frontend is built with React, TypeScript, and Vite.

## Purpose

The frontend is responsible for:

- collecting learner input
- handling demo login state
- routing between pages
- showing tutor workflow steps
- calling the backend when AI mode is enabled

## Main Frontend Files

- `src/main.tsx`: React bootstrap entry
- `src/App.tsx`: wraps the app with the session provider
- `src/app/SessionContext.ts`: session types and context object
- `src/app/session.tsx`: session provider logic
- `src/app/useSession.ts`: shared session hook
- `src/components/chat.tsx`: tutor interaction flow
- `src/app/router.tsx`: page routing

## Login and Session Behavior

- The app uses demo users for the current local workflow
- Selected users are persisted in `localStorage`
- The login page now supports quick sign-in buttons
- Raw demo passwords are no longer displayed in the page UI

## Tutor Page Behavior

The tutor page supports both demo mode and backend AI mode.

When a learner starts a cycle, the page:

1. uses the typed study question
2. loads a learning explanation
3. presents quiz questions
4. analyzes the selected answers
5. builds a revision plan

The recent update also fixed the quiz flow so users in the analyze phase are no longer blocked from answering questions.
