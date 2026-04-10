\# Workflow and User Flow



\## Overview



This document describes the working flow of the EduMind system, including how users interact with the platform and how data flows between frontend, backend, and AI components.



\---



\## 1. System Workflow



EduMind follows a layered architecture:



User → Frontend → Backend → AI Model → Backend → Frontend → User



\---



\## 2. High-Level Workflow



1\. User enters a query or selects a feature

2\. Frontend captures the input

3\. Frontend sends a request to the backend API

4\. Backend processes the request

5\. Backend sends a prompt to the AI model (LLM)

6\. AI generates a response

7\. Backend receives and formats the response

8\. Backend sends response to frontend

9\. Frontend displays the result to the user



\---



\## 3. Detailed Workflow



\### Step 1: User Interaction

\- User enters a topic or question

\- Example: "Explain binary search"



\### Step 2: Frontend Processing

\- React captures input from user

\- Sends HTTP request using fetch/axios



\### Step 3: Backend Handling

\- FastAPI receives request

\- Identifies the type of request (chat, quiz, etc.)



\### Step 4: AI Processing

\- Backend sends prompt to LLM API

\- AI processes and generates response



\### Step 5: Response Handling

\- Backend receives AI output

\- Formats response into JSON



\### Step 6: Display Output

\- Frontend receives response

\- Displays it in UI



\---



\## 4. User Flow



\### 4.1 Chat Tutor Flow



User → Ask Question

→ Backend → AI

→ Response → Display



\---



\### 4.2 Topic Learning Flow



User selects topic

→ Backend processes request

→ AI generates explanation

→ Display structured content



\---



\### 4.3 Quiz Flow



User selects topic

→ Backend sends request to AI

→ AI generates questions

→ Display quiz

→ User answers → Evaluation



\---



\### 4.4 Mindmap Flow



User enters topic

→ Backend sends request to AI

→ AI generates concept hierarchy

→ Backend returns JSON

→ Frontend renders mindmap



\---



\### 4.5 Revision Flow



User requests summary

→ Backend sends prompt

→ AI generates summary

→ Display short notes



\---



\## 5. Data Flow Diagram (Text Representation)



User Input

&#x20;  ↓

Frontend (React)

&#x20;  ↓

API Request

&#x20;  ↓

Backend (FastAPI)

&#x20;  ↓

LLM API

&#x20;  ↓

AI Response

&#x20;  ↓

Backend Processing

&#x20;  ↓

Frontend Display



\---



\## 6. Interaction Flow Summary



\- Input → Processing → Output

\- Query → AI → Response

\- Topic → AI → Explanation

\- Topic → AI → Quiz



\---



\## 7. System Behavior



\- Real-time interaction with user

\- Dynamic content generation using AI

\- Continuous learning flow

\- Modular feature handling



\---



\## Conclusion



The EduMind workflow ensures smooth interaction between user, system, and AI. The structured flow enables efficient learning, adaptive responses, and seamless user experience.

