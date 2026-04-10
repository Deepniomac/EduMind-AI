\# API Design



\## Overview



This document defines the API endpoints for the EduMind system. These APIs handle communication between the frontend (React) and backend (FastAPI), and enable interaction with AI models.



\---



\## 1. API Architecture



Frontend (React) → Backend (FastAPI) → LLM API → Backend → Frontend



\- Frontend sends HTTP requests

\- Backend processes requests and calls AI

\- Backend returns structured responses



\---



\## 2. Base URL

http://127.0.0.1:8000

\---



\## 3. API Endpoints



\---



\### 3.1 Chat Tutor API



\#### Endpoint



POST /ask





\#### Description

Handles general user questions and returns AI-generated responses.



\#### Request Body

```json

{

&#x20; "question": "Explain binary search"

}



Response



{

&#x20; "reply": "Binary search is a searching algorithm..."

}

\# 3.2 Topic Explanation API



\#Endpoint



POST /explain



Request body

&#x20;

{

&#x20; "topic": "Operating Systems"

}



Response 



{

&#x20; "explanation": "Operating Systems manage hardware..."

}



\#Quiz Generator API



\#Endpoint



POST /quiz



\#Description



Generates quiz questions for a given topic.

Request Body



JSON

{

&#x20; "topic": "Data Structures",

&#x20; "difficulty": "medium"

}



Response



JSON

{

&#x20; "questions": \[

&#x20;   {

&#x20;     "question": "What is a stack?",

&#x20;     "options": \["FIFO", "LIFO", "Tree", "Graph"],

&#x20;     "answer": "LIFO"

&#x20;   }

&#x20; ]

}



\# 

3.4 Mindmap Generator API

Endpoint



POST /mindmap



Description

Generates a hierarchical concept structure for visualization.

Request Body



JSON

{

&#x20; "topic": "Computer Networks"

}



Response



JSON

{

&#x20; "topic": "Computer Networks",

&#x20; "children": \[

&#x20;   {

&#x20;     "name": "Protocols",

&#x20;     "children": \[

&#x20;       {"name": "TCP"},

&#x20;       {"name": "UDP"}

&#x20;     ]

&#x20;   }

&#x20; ]

}



\# 3.5 Revision Summary API



Endpoint



POST /summary



Description

Generates short revision notes.

Request Body



JSON

{

&#x20; "topic": "Operating Systems"

}





Response

JSON

{

&#x20; "summary": "Key concepts include process management..."

}



\# 4. Request Handling Flow

* Frontend sends POST request
* FastAPI endpoint receives data
* Backend constructs prompt
* Backend sends request to LLM API
* LLM returns generated content
* Backend formats response
* Response sent back to frontend





\# 5. Error Handling



Example response:



JSON

{

&#x20; "error": "Failed to process request"

}

Possible errors:



* Invalid input
* API failure
* Server error



\# 6. Data Format



* All requests use JSON format
* All responses return JSON
* UTF-8 encoding



\# 7. Future Enhancements

* Authentication APIs
* User profile management
* Progress tracking endpoints
* History retrieval APIs



Conclusion



The API design provides a structured interface between frontend and backend, enabling seamless communication and integration with AI models for intelligent content generation

