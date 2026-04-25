from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import requests
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model
class Query(BaseModel):
    query: str

# Function to call Groq API
def query_groq(user_query: str):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured")

    url = "https://api.groq.com/openai/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": user_query}
        ],
        "max_tokens": 500,
        "temperature": 0.7
    }

    try:
        response = requests.post(url, headers=headers, json=data, timeout=30)
        response.raise_for_status()
    except requests.RequestException as exc:
        status_code = 502
        detail = "Failed to reach Groq API"

        if exc.response is not None:
            status_code = exc.response.status_code
            detail = exc.response.text

        raise HTTPException(status_code=status_code, detail=detail) from exc

    result = response.json()

    # Extract only the reply text
    return result["choices"][0]["message"]["content"]

# Correct endpoint (POST, not GET)
@app.post("/")
def ask(query: Query):
    reply = query_groq(query.query)
    return {"response": reply}

# Test endpoint
@app.get("/test")
def test_api():
    return {"reply": "Hello from FastAPI backend!"}
