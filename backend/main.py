from fastapi import FastAPI
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

    response = requests.post(url, headers=headers, json=data)

    if response.status_code != 200:
        raise Exception(f"GROQ API error: {response.status_code} - {response.text}")

    result = response.json()

    # Extract only the reply text
    return result["choices"][0]["message"]["content"]

# Correct endpoint (POST, not GET)
@app.post("/")
def ask(query: Query):
    try:
        reply = query_groq(query.query)
        return {"response": reply}
    except Exception as e:
        return {"error": str(e)}

# Test endpoint
@app.get("/test")
def test_api():
    return {"reply": "Hello from FastAPI backend!"}
