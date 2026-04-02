from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
import os 
import requests
from dotenv import load_dotenv
from pydantic import BaseModel 


load_dotenv()  # Load environment variables from .env file

GROQ_API_KEY = os.getenv("GROQ_API_KEY") 

# FastAPI app initialization 
app = FastAPI()




# Allow React frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for now allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



class Query(BaseModel):
    query: str
    
def query_groq(query: str):
    url = "https://api.groq.com/openai/v1/chat/completions" 
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}", 
        "Content-Type": "application/json"
    }
    data = {
        "model": "llama-3.1-8b-instant", 
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": query}
        ],
        "max_tokens": 1000,
        "temperature": 0.7 
    }
    response = requests.post(url, headers=headers, json=data)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"GROQ API error: {response.status_code} - {response.text}")

    result = response.json()
    return result['choices'][0]['message']['content'] 



@app.get("/")
def ask(query: Query):
    try:
        response = query_groq(query.query)
        return {"response": response}
    except Exception as e:
        return {"error": str(e)}

@app.get("/test")
def test_api():
    return {"reply": "Hello from FastAPI backend!"}

