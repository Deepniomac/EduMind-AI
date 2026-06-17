import base64
import hashlib
import json
import os
import secrets
import sqlite3
from contextlib import contextmanager
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Annotated

import requests
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
DB_PATH = BASE_DIR / os.getenv("EDUMIND_DB_PATH", "edumind.db")
SESSION_TTL_HOURS = int(os.getenv("SESSION_TTL_HOURS", "168"))
PASSWORD_ITERATIONS = 120_000
LEARNING_PHASES = ("learn", "test", "analyze", "adjust", "relearn")
DEMO_ACCOUNTS = [
    {
        "username": "Thanuja",
        "password": "EduMind123",
        "display_name": "Thanuja",
        "phase": "learn",
        "profile": "thanuja",
    },
    {
        "username": "Deepesh",
        "password": "EduMind123",
        "display_name": "Deepesh",
        "phase": "test",
        "profile": "deepesh",
    },
    {
        "username": "Hemanth",
        "password": "EduMind123",
        "display_name": "Hemanth",
        "phase": "analyze",
        "profile": "hemanth",
    },
    {
        "username": "Murali",
        "password": "EduMind123",
        "display_name": "Murali",
        "phase": "relearn",
        "profile": "murali",
    },
]

app = FastAPI(
    title="EduMind Backend",
    description="FastAPI backend for the EduMind adaptive learning workflow.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Query(BaseModel):
    query: str


class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=6, max_length=128)
    display_name: str | None = Field(default=None, max_length=80)


class LoginRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=6, max_length=128)


class QuizSubmission(BaseModel):
    answers: dict[str, int]


def utc_now() -> datetime:
    return datetime.now(UTC)


def to_iso(value: datetime) -> str:
    return value.astimezone(UTC).isoformat()


def from_iso(value: str) -> datetime:
    return datetime.fromisoformat(value)


@contextmanager
def get_db():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    try:
        yield connection
        connection.commit()
    finally:
        connection.close()


def json_dump(value) -> str:
    return json.dumps(value)


def json_load(value: str):
    return json.loads(value)


def normalize_phase(phase: str | None) -> str:
    if phase in LEARNING_PHASES:
        return phase
    if phase == "analyze":
        return "analyze"
    return "relearn"


def normalize_username(username: str) -> str:
    cleaned = username.strip()
    if not cleaned:
        raise HTTPException(status_code=400, detail="Username must not be empty")
    return cleaned.lower()


DEMO_USERNAMES = {account["username"].lower() for account in DEMO_ACCOUNTS}


def is_demo_username(username: str) -> bool:
    return normalize_username(username) in DEMO_USERNAMES


def get_demo_account(username: str) -> dict | None:
    normalized = normalize_username(username)
    for account in DEMO_ACCOUNTS:
        if normalize_username(account["username"]) == normalized:
            return account
    return None


def get_demo_profile(username: str) -> str | None:
    account = get_demo_account(username)
    return account["profile"] if account else None


def build_demo_accounts() -> list[dict[str, str]]:
    return DEMO_ACCOUNTS


DEMO_PROFILE_DATA = {
    "thanuja": {
        "dashboard": {
            "metrics": [
                {"label": "Study Time", "value": "4.2h", "note": "Intro lessons on arrays and stacks started"},
                {"label": "Lesson Progress", "value": "38%", "note": "Core explanations viewed for 2 topics"},
                {"label": "Concepts Started", "value": "6", "note": "Focus area: stack basics and arrays"},
                {"label": "Streak", "value": "2 days", "note": "Early momentum is building"},
            ],
            "priorities": [
                {"title": "Finish stack introduction", "value": "Push, pop, and peek", "progress": 42},
                {"title": "Watch the guided example", "value": "Undo/redo use case", "progress": 35},
                {"title": "Take the first checkpoint", "value": "Opens after lesson completion", "progress": 18},
                {"title": "Save notes for review", "value": "1 topic summary pending", "progress": 24},
            ],
            "subjects": [
                {"name": "Data Structures", "progress": 34},
                {"name": "Operating Systems", "progress": 12},
                {"name": "Algorithms", "progress": 21},
            ],
            "cycle_steps": [
                {"label": "Learn", "progress": 68, "status": "Current active phase"},
                {"label": "Test", "progress": 8, "status": "Waiting for first checkpoint"},
                {"label": "Analyze", "progress": 0, "status": "No quiz results yet"},
                {"label": "Adjust", "progress": 0, "status": "Revision plan not generated"},
                {"label": "Re-learn", "progress": 0, "status": "Reinforcement not started"},
            ],
            "knowledge_preview": ["34", "28", "22", "31", "18", "26", "14", "19", "21", "24", "16", "20"],
            "donut_value": "14%",
            "suggestion": "Finish the stack lesson set before attempting the first checkpoint quiz.",
        },
        "quiz": {
            "display_position": 1,
            "total_questions": 12,
            "questions": [
                {
                    "id": "q1",
                    "prompt": "What is a stack?",
                    "options": ["A LIFO data structure", "A FIFO data structure", "A sorted list", "A graph only"],
                    "correct_index": 0,
                },
                {
                    "id": "q2",
                    "prompt": "Which operation adds to the top of a stack?",
                    "options": ["pop", "peek", "push", "shift"],
                    "correct_index": 2,
                },
                {
                    "id": "q3",
                    "prompt": "Which example fits a stack best?",
                    "options": ["Bus route", "Printer queue", "Undo button history", "Random access file"],
                    "correct_index": 2,
                },
            ],
            "stats": {"recovered": 0, "correct": 0, "confidence": "new"},
        },
        "planner": {
            "week_views": [
                {
                    "label": "Week 1",
                    "sessions": [
                        {"day": "Mon", "title": "Intro to arrays", "status": "Completed"},
                        {"day": "Tue", "title": "Stack basics lesson", "status": "In progress"},
                        {"day": "Wed", "title": "Guided stack example", "status": "Planned"},
                        {"day": "Thu", "title": "First checkpoint quiz", "status": "Planned"},
                        {"day": "Fri", "title": "Review lesson notes", "status": "Planned"},
                    ],
                },
                {
                    "label": "Week 2",
                    "sessions": [
                        {"day": "Mon", "title": "Queue introduction", "status": "Planned"},
                        {"day": "Tue", "title": "Compare stack vs queue", "status": "Planned"},
                        {"day": "Wed", "title": "Practice problems", "status": "Planned"},
                        {"day": "Thu", "title": "Flashcard review", "status": "Planned"},
                        {"day": "Fri", "title": "Plan next topic", "status": "Planned"},
                    ],
                },
            ],
            "guidance": [
                {"title": "Complete one full lesson before testing", "priority": "High"},
                {"title": "Keep sessions short while building the habit", "priority": "Medium"},
                {"title": "Use the tutor guided mode first", "priority": "Medium"},
            ],
        },
    },
    "deepesh": {
        "dashboard": {
            "metrics": [
                {"label": "Study Time", "value": "7.8h", "note": "Lessons completed for stacks and queues"},
                {"label": "Checkpoint Score", "value": "71%", "note": "Latest mini quiz completed yesterday"},
                {"label": "Concepts Tested", "value": "9", "note": "Testing phase focused on recall accuracy"},
                {"label": "Streak", "value": "4 days", "note": "Consistent daily practice"},
            ],
            "priorities": [
                {"title": "Retake stack checkpoint", "value": "2 questions still missed", "progress": 71},
                {"title": "Complete queue quiz set", "value": "Set 2 of 3 finished", "progress": 66},
                {"title": "Improve timed recall", "value": "Average response 18s", "progress": 58},
                {"title": "Review incorrect answers", "value": "Peek vs pop confusion", "progress": 49},
            ],
            "subjects": [
                {"name": "Data Structures", "progress": 58},
                {"name": "Operating Systems", "progress": 41},
                {"name": "Algorithms", "progress": 47},
            ],
            "cycle_steps": [
                {"label": "Learn", "progress": 100, "status": "Base lessons completed"},
                {"label": "Test", "progress": 74, "status": "Current active phase"},
                {"label": "Analyze", "progress": 12, "status": "Waiting for full checkpoint results"},
                {"label": "Adjust", "progress": 0, "status": "No revision plan yet"},
                {"label": "Re-learn", "progress": 0, "status": "Reinforcement not started"},
            ],
            "knowledge_preview": ["58", "62", "51", "57", "49", "54", "41", "46", "44", "60", "39", "43"],
            "donut_value": "38%",
            "suggestion": "Close the remaining checkpoint gaps before moving into analysis.",
        },
        "quiz": {
            "display_position": 5,
            "total_questions": 12,
            "questions": [
                {
                    "id": "q1",
                    "prompt": "What does LIFO stand for in a stack?",
                    "options": ["Last In, First Out", "Last In, Final Out", "Linear In, First Out", "Left In, First Out"],
                    "correct_index": 0,
                },
                {
                    "id": "q2",
                    "prompt": "Which stack operation reads the top item without removing it?",
                    "options": ["peek", "pop", "push", "pull"],
                    "correct_index": 0,
                },
                {
                    "id": "q3",
                    "prompt": "Which real-world example best matches a stack?",
                    "options": ["Train schedule", "Queue at a bank", "Pile of plates", "Bus route map"],
                    "correct_index": 2,
                },
            ],
            "stats": {"recovered": 4, "correct": 3, "confidence": "building"},
        },
        "planner": {
            "week_views": [
                {
                    "label": "Week 1",
                    "sessions": [
                        {"day": "Mon", "title": "Stack lesson review", "status": "Completed"},
                        {"day": "Tue", "title": "Stack checkpoint quiz", "status": "Completed"},
                        {"day": "Wed", "title": "Queue checkpoint quiz", "status": "In progress"},
                        {"day": "Thu", "title": "Timed recall drill", "status": "Planned"},
                        {"day": "Fri", "title": "Review missed answers", "status": "Planned"},
                    ],
                },
                {
                    "label": "Week 2",
                    "sessions": [
                        {"day": "Mon", "title": "Mixed DS checkpoint", "status": "Planned"},
                        {"day": "Tue", "title": "OS basics quiz", "status": "Planned"},
                        {"day": "Wed", "title": "Algorithm warm-up quiz", "status": "Planned"},
                        {"day": "Thu", "title": "Confidence review", "status": "Planned"},
                        {"day": "Fri", "title": "Prepare for analysis", "status": "Planned"},
                    ],
                },
            ],
            "guidance": [
                {"title": "Finish the current checkpoint set this week", "priority": "High"},
                {"title": "Review every missed answer the same day", "priority": "High"},
                {"title": "Avoid starting analysis before testing is complete", "priority": "Medium"},
            ],
        },
    },
    "hemanth": {
        "dashboard": {
            "metrics": [
                {"label": "Study Time", "value": "11.2h", "note": "Lessons and checkpoints completed across 3 subjects"},
                {"label": "Checkpoint Accuracy", "value": "64%", "note": "Weak spots identified in recursion and queues"},
                {"label": "Gaps Found", "value": "5", "note": "Analysis is isolating priority review topics"},
                {"label": "Streak", "value": "5 days", "note": "Steady progress through the cycle"},
            ],
            "priorities": [
                {"title": "Review missed queue questions", "value": "Enqueue vs dequeue errors", "progress": 62},
                {"title": "Analyze recursion traces", "value": "2 stack-overflow patterns found", "progress": 57},
                {"title": "Compare weak topic clusters", "value": "Queues + recursion linked", "progress": 54},
                {"title": "Prepare adjustment plan", "value": "Revision map almost ready", "progress": 48},
            ],
            "subjects": [
                {"name": "Data Structures", "progress": 67},
                {"name": "Operating Systems", "progress": 52},
                {"name": "Algorithms", "progress": 59},
            ],
            "cycle_steps": [
                {"label": "Learn", "progress": 100, "status": "Concept coverage completed"},
                {"label": "Test", "progress": 100, "status": "Checkpoint data collected"},
                {"label": "Analyze", "progress": 76, "status": "Current active phase"},
                {"label": "Adjust", "progress": 34, "status": "Draft revision plan in progress"},
                {"label": "Re-learn", "progress": 0, "status": "Waiting for finalized plan"},
            ],
            "knowledge_preview": ["67", "71", "58", "63", "55", "60", "52", "57", "54", "69", "50", "56"],
            "donut_value": "62%",
            "suggestion": "Finish gap analysis for queues and recursion before generating the final adjustment plan.",
        },
        "quiz": {
            "display_position": 3,
            "total_questions": 12,
            "questions": [
                {
                    "id": "q1",
                    "prompt": "Which statement correctly describes a stack?",
                    "options": [
                        "A stack follows LIFO order",
                        "A queue always removes from the middle",
                        "A graph can never contain cycles",
                        "An array automatically balances itself",
                    ],
                    "correct_index": 0,
                },
                {
                    "id": "q2",
                    "prompt": "Which operation adds an item to the top of a stack?",
                    "options": ["peek", "enqueue", "push", "shift"],
                    "correct_index": 2,
                },
                {
                    "id": "q3",
                    "prompt": "Which problem type often uses a stack internally?",
                    "options": ["Breadth-first search only", "Undo/redo actions", "Binary search insertion", "Hash collisions"],
                    "correct_index": 1,
                },
            ],
            "stats": {"recovered": 3, "correct": 2, "confidence": "moderate"},
        },
        "planner": {
            "week_views": [
                {
                    "label": "Week 1",
                    "sessions": [
                        {"day": "Mon", "title": "Stack checkpoint review", "status": "Completed"},
                        {"day": "Tue", "title": "Queue gap analysis", "status": "Completed"},
                        {"day": "Wed", "title": "Recursion trace review", "status": "In progress"},
                        {"day": "Thu", "title": "Weak spot summary", "status": "Planned"},
                        {"day": "Fri", "title": "Draft adjustment plan", "status": "Planned"},
                    ],
                },
                {
                    "label": "Week 2",
                    "sessions": [
                        {"day": "Mon", "title": "Finalize revision plan", "status": "Planned"},
                        {"day": "Tue", "title": "Targeted queue relearn", "status": "Planned"},
                        {"day": "Wed", "title": "Recursion practice block", "status": "Planned"},
                        {"day": "Thu", "title": "Follow-up checkpoint", "status": "Planned"},
                        {"day": "Fri", "title": "Measure recovery progress", "status": "Planned"},
                    ],
                },
            ],
            "guidance": [
                {"title": "Prioritize queue and recursion gaps this week", "priority": "High"},
                {"title": "Document every recurring mistake pattern", "priority": "High"},
                {"title": "Do not start re-learning until the plan is finalized", "priority": "Medium"},
            ],
        },
    },
    "murali": {
        "dashboard": {
            "metrics": [
                {"label": "Re-learn Time", "value": "16.3h", "note": "Focused reinforcement on stacks, DFS, and scheduling"},
                {"label": "Revision Accuracy", "value": "88%", "note": "Most weak concepts have been recovered"},
                {"label": "Mastery Recovery", "value": "81", "note": "14 topics moved back into safe range"},
                {"label": "Revision Streak", "value": "10 days", "note": "Strongest recovery rhythm this month"},
            ],
            "priorities": [
                {"title": "Complete stack mastery pass", "value": "1 final checkpoint remaining", "progress": 93},
                {"title": "Reinforce DFS links", "value": "Graph traversal review queued", "progress": 86},
                {"title": "Retake adaptive quiz", "value": "2 recovery questions left", "progress": 91},
                {"title": "Maintain flashcard rhythm", "value": "Daily 15-minute review", "progress": 84},
            ],
            "subjects": [
                {"name": "Data Structures", "progress": 92},
                {"name": "Operating Systems", "progress": 78},
                {"name": "Algorithms", "progress": 86},
            ],
            "cycle_steps": [
                {"label": "Learn", "progress": 100, "status": "Completed base concept"},
                {"label": "Test", "progress": 100, "status": "Checkpoint cleared"},
                {"label": "Analyze", "progress": 100, "status": "Weaknesses isolated"},
                {"label": "Adjust", "progress": 100, "status": "Plan already applied"},
                {"label": "Re-learn", "progress": 92, "status": "Current active phase"},
            ],
            "knowledge_preview": ["92", "95", "88", "90", "86", "93", "78", "82", "84", "96", "79", "85"],
            "donut_value": "88%",
            "suggestion": "Finish the last recovery checkpoint, then move into maintenance review mode.",
        },
        "quiz": {
            "display_position": 10,
            "total_questions": 12,
            "questions": [
                {
                    "id": "q1",
                    "prompt": "Which traversal can be implemented iteratively with an explicit stack?",
                    "options": ["BFS only", "DFS", "Dijkstra only", "Topological sort only"],
                    "correct_index": 1,
                },
                {
                    "id": "q2",
                    "prompt": "What happens if you pop from an empty stack?",
                    "options": ["It returns zero", "Underflow error", "It wraps to the last item", "It inserts a default value"],
                    "correct_index": 1,
                },
                {
                    "id": "q3",
                    "prompt": "Which use case best validates stack mastery?",
                    "options": ["Sorting a list in O(1)", "Evaluating postfix expressions", "Finding shortest path in all graphs", "Balancing a binary tree automatically"],
                    "correct_index": 1,
                },
            ],
            "stats": {"recovered": 10, "correct": 9, "confidence": "high"},
        },
        "planner": {
            "week_views": [
                {
                    "label": "Week 1",
                    "sessions": [
                        {"day": "Mon", "title": "Stack mastery review", "status": "Completed"},
                        {"day": "Tue", "title": "DFS reinforcement", "status": "Completed"},
                        {"day": "Wed", "title": "OS scheduling relearn", "status": "Completed"},
                        {"day": "Thu", "title": "Adaptive quiz retake", "status": "In progress"},
                        {"day": "Fri", "title": "Flashcards sprint", "status": "Planned"},
                    ],
                },
                {
                    "label": "Week 2",
                    "sessions": [
                        {"day": "Mon", "title": "Final recovery checkpoint", "status": "Planned"},
                        {"day": "Tue", "title": "Mixed topic review", "status": "Planned"},
                        {"day": "Wed", "title": "Confidence validation quiz", "status": "Planned"},
                        {"day": "Thu", "title": "Maintenance review block", "status": "Planned"},
                        {"day": "Fri", "title": "Plan next learning cycle", "status": "Planned"},
                    ],
                },
            ],
            "guidance": [
                {"title": "Complete the final recovery checkpoint this week", "priority": "High"},
                {"title": "Keep one daily flashcard review session", "priority": "Medium"},
                {"title": "Shift to maintenance mode after 90%+ recovery", "priority": "Medium"},
            ],
        },
    },
}


def build_dashboard_bundle(display_name: str, phase: str, demo: bool = False, profile: str | None = None):
    if demo and profile and profile in DEMO_PROFILE_DATA:
        return DEMO_PROFILE_DATA[profile]["dashboard"]

    return {
        "metrics": [
            {"label": "Study Time", "value": "0h", "note": "No study sessions recorded yet"},
            {"label": "Revision Accuracy", "value": "0%", "note": "No quiz history yet"},
            {"label": "Mastery Score", "value": "0", "note": "Your first lesson will populate this"},
            {"label": "Streak", "value": "0 days", "note": "Begin a session to start tracking"},
        ],
        "priorities": [
            {"title": "Start your first lesson", "value": "Choose any topic", "progress": 0},
            {"title": "Take the opening quiz", "value": "Answers will build your profile", "progress": 0},
            {"title": "Review the first result", "value": "Analysis appears after submission", "progress": 0},
            {"title": "Plan the next session", "value": "Planner fills in after activity", "progress": 0},
        ],
        "subjects": [
            {"name": "Data Structures", "progress": 0},
            {"name": "Operating Systems", "progress": 0},
            {"name": "Algorithms", "progress": 0},
        ],
        "cycle_steps": [
            {"label": "Learn", "progress": 0, "status": "Waiting for your first topic"},
            {"label": "Test", "progress": 0, "status": "No quiz answers yet"},
            {"label": "Analyze", "progress": 0, "status": "No analysis generated yet"},
            {"label": "Adjust", "progress": 0, "status": "Revision plan will appear here"},
            {"label": "Re-learn", "progress": 0, "status": "No reinforcement session yet"},
        ],
        "knowledge_preview": [],
        "donut_value": "0%",
        "suggestion": "Start a first study session to generate real progress.",
    }


def build_quiz_bundle(phase: str, demo: bool = False, profile: str | None = None):
    if demo and profile and profile in DEMO_PROFILE_DATA:
        return DEMO_PROFILE_DATA[profile]["quiz"]

    return {
        "display_position": 1,
        "total_questions": 3,
        "questions": [
            {
                "id": "q1",
                "prompt": "What is a stack?",
                "options": ["A LIFO data structure", "A FIFO data structure", "A sorted list", "A tree traversal only"],
                "correct_index": 0,
            },
            {
                "id": "q2",
                "prompt": "Which operation removes the top item?",
                "options": ["peek", "push", "pop", "enqueue"],
                "correct_index": 2,
            },
            {
                "id": "q3",
                "prompt": "Which topic should a new learner start with?",
                "options": ["Any topic they choose", "Only advanced recursion", "Only memory optimization", "No topic at all"],
                "correct_index": 0,
            },
        ],
        "stats": {"recovered": 0, "correct": 0, "confidence": "new"},
    }


def build_planner_bundle(display_name: str, phase: str, demo: bool = False, profile: str | None = None):
    if demo and profile and profile in DEMO_PROFILE_DATA:
        return DEMO_PROFILE_DATA[profile]["planner"]

    return {
        "week_views": [
            {
                "label": "Week 1",
                "sessions": [
                    {"day": "Mon", "title": "Pick your first topic", "status": "Planned"},
                    {"day": "Tue", "title": "Open the tutor", "status": "Planned"},
                    {"day": "Wed", "title": "Submit the first quiz", "status": "Planned"},
                    {"day": "Thu", "title": "Review the result", "status": "Planned"},
                    {"day": "Fri", "title": "Set the next study block", "status": "Planned"},
                ],
            },
            {
                "label": "Week 2",
                "sessions": [
                    {"day": "Mon", "title": "Return to the same topic", "status": "Planned"},
                    {"day": "Tue", "title": "Strengthen weak points", "status": "Planned"},
                    {"day": "Wed", "title": "Retake the checkpoint", "status": "Planned"},
                    {"day": "Thu", "title": "Add flashcards", "status": "Planned"},
                    {"day": "Fri", "title": "Plan the next cycle", "status": "Planned"},
                ],
            },
        ],
        "guidance": [
            {"title": "Finish one lesson first", "priority": "High"},
            {"title": "Let the first quiz create your baseline", "priority": "Medium"},
            {"title": "Use planner after you have study activity", "priority": "Medium"},
        ],
    }


def seed_user_data(connection: sqlite3.Connection, user_id: int, display_name: str, phase: str, demo: bool = False, profile: str | None = None):
    dashboard = build_dashboard_bundle(display_name, phase, demo=demo, profile=profile)
    quiz = build_quiz_bundle(phase, demo=demo, profile=profile)
    planner = build_planner_bundle(display_name, phase, demo=demo, profile=profile)

    connection.execute(
        """
        INSERT OR REPLACE INTO dashboard_data (
            user_id, metrics_json, priorities_json, subjects_json, cycle_steps_json,
            knowledge_preview_json, donut_value, suggestion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            user_id,
            json_dump(dashboard["metrics"]),
            json_dump(dashboard["priorities"]),
            json_dump(dashboard["subjects"]),
            json_dump(dashboard["cycle_steps"]),
            json_dump(dashboard["knowledge_preview"]),
            dashboard["donut_value"],
            dashboard["suggestion"],
        ),
    )

    connection.execute(
        """
        INSERT OR REPLACE INTO quiz_data (
            user_id, display_position, total_questions, questions_json, stats_json
        ) VALUES (?, ?, ?, ?, ?)
        """,
        (
            user_id,
            quiz["display_position"],
            quiz["total_questions"],
            json_dump(quiz["questions"]),
            json_dump(quiz["stats"]),
        ),
    )

    connection.execute(
        """
        INSERT OR REPLACE INTO planner_data (
            user_id, week_views_json, guidance_json
        ) VALUES (?, ?, ?)
        """,
        (
            user_id,
            json_dump(planner["week_views"]),
            json_dump(planner["guidance"]),
        ),
    )


def hash_password(password: str, salt: bytes | None = None) -> tuple[str, str]:
    salt_bytes = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt_bytes, PASSWORD_ITERATIONS)
    return base64.b64encode(salt_bytes).decode("utf-8"), base64.b64encode(digest).decode("utf-8")


def verify_password(password: str, salt_b64: str, password_hash: str) -> bool:
    salt = base64.b64decode(salt_b64.encode("utf-8"))
    _, computed = hash_password(password, salt)
    return secrets.compare_digest(computed, password_hash)


def create_session(connection: sqlite3.Connection, user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    expires_at = to_iso(utc_now() + timedelta(hours=SESSION_TTL_HOURS))
    connection.execute("INSERT INTO sessions (user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?)", (user_id, token, expires_at, to_iso(utc_now())))
    return token


def user_response(row: sqlite3.Row) -> dict:
    return {
        "username": row["username"],
        "display_name": row["display_name"],
        "phase": row["phase"],
    }


def auth_response(connection: sqlite3.Connection, user_row: sqlite3.Row) -> dict:
    token = create_session(connection, user_row["id"])
    return {
        "token": token,
        "user": user_response(user_row),
    }


def get_user_by_username(connection: sqlite3.Connection, username: str) -> sqlite3.Row | None:
    return connection.execute("SELECT * FROM users WHERE username = ?", (normalize_username(username),)).fetchone()


def get_user_by_token(connection: sqlite3.Connection, token: str) -> sqlite3.Row | None:
    session_row = connection.execute(
        """
        SELECT users.*, sessions.token, sessions.expires_at
        FROM sessions
        JOIN users ON users.id = sessions.user_id
        WHERE sessions.token = ?
        """,
        (token,),
    ).fetchone()
    if not session_row:
        return None

    if from_iso(session_row["expires_at"]) <= utc_now():
        connection.execute("DELETE FROM sessions WHERE token = ?", (token,))
        return None

    return session_row


def require_current_user(authorization: Annotated[str | None, Header()] = None) -> sqlite3.Row:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization token is required")

    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(status_code=401, detail="Authorization token is required")

    with get_db() as connection:
        user_row = get_user_by_token(connection, token)
        if not user_row:
            raise HTTPException(status_code=401, detail="Invalid or expired session token")
        return user_row


def create_user(connection: sqlite3.Connection, username: str, password: str, display_name: str | None = None, phase: str = "relearn", demo: bool = False, profile: str | None = None):
    normalized_username = normalize_username(username)
    cleaned_display_name = (display_name or username).strip() or username
    phase = normalize_phase(phase)

    if get_user_by_username(connection, normalized_username):
        raise HTTPException(status_code=409, detail="Username already exists")

    salt_b64, password_hash = hash_password(password)
    created_at = to_iso(utc_now())
    cursor = connection.execute(
        """
        INSERT INTO users (username, display_name, password_salt, password_hash, phase, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (normalized_username, cleaned_display_name, salt_b64, password_hash, phase, created_at),
    )

    user_id = cursor.lastrowid
    seed_user_data(connection, user_id, cleaned_display_name, phase, demo=demo, profile=profile if demo else None)
    return connection.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()


def dashboard_payload(connection: sqlite3.Connection, user_row: sqlite3.Row) -> dict:
    profile = get_demo_profile(user_row["username"])
    demo = profile is not None
    seed_user_data(connection, user_row["id"], user_row["display_name"], user_row["phase"], demo=demo, profile=profile)
    row = connection.execute("SELECT * FROM dashboard_data WHERE user_id = ?", (user_row["id"],)).fetchone()

    return {
        "username": user_row["username"],
        "display_name": user_row["display_name"],
        "phase": user_row["phase"],
        "metrics": json_load(row["metrics_json"]),
        "priorities": json_load(row["priorities_json"]),
        "subjects": json_load(row["subjects_json"]),
        "cycle_steps": json_load(row["cycle_steps_json"]),
        "knowledge_preview": json_load(row["knowledge_preview_json"]),
        "donut_value": row["donut_value"],
        "suggestion": row["suggestion"],
    }


def quiz_payload(connection: sqlite3.Connection, user_row: sqlite3.Row, include_answers: bool = False) -> dict:
    profile = get_demo_profile(user_row["username"])
    demo = profile is not None
    seed_user_data(connection, user_row["id"], user_row["display_name"], user_row["phase"], demo=demo, profile=profile)
    row = connection.execute("SELECT * FROM quiz_data WHERE user_id = ?", (user_row["id"],)).fetchone()

    questions = json_load(row["questions_json"])
    if not include_answers:
        questions = [{"id": item["id"], "prompt": item["prompt"], "options": item["options"]} for item in questions]

    return {
        "username": user_row["username"],
        "display_name": user_row["display_name"],
        "phase": user_row["phase"],
        "display_position": row["display_position"],
        "total_questions": row["total_questions"],
        "questions": questions,
        "stats": json_load(row["stats_json"]),
    }


def planner_payload(connection: sqlite3.Connection, user_row: sqlite3.Row) -> dict:
    profile = get_demo_profile(user_row["username"])
    demo = profile is not None
    seed_user_data(connection, user_row["id"], user_row["display_name"], user_row["phase"], demo=demo, profile=profile)
    row = connection.execute("SELECT * FROM planner_data WHERE user_id = ?", (user_row["id"],)).fetchone()

    return {
        "username": user_row["username"],
        "display_name": user_row["display_name"],
        "phase": user_row["phase"],
        "week_views": json_load(row["week_views_json"]),
        "guidance": json_load(row["guidance_json"]),
    }


def score_quiz(connection: sqlite3.Connection, user_row: sqlite3.Row, answers: dict[str, int]) -> dict:
    payload = quiz_payload(connection, user_row, include_answers=True)
    questions = {question["id"]: question for question in payload["questions"]}

    if not answers:
        raise HTTPException(status_code=400, detail="At least one quiz answer is required")

    correct = 0
    results = []
    missed_prompts = []
    for question_id, question in questions.items():
        selected_index = answers.get(question_id)
        is_correct = selected_index == question["correct_index"]
        if is_correct:
            correct += 1
        else:
            missed_prompts.append(question["prompt"])

        results.append(
            {
                "id": question_id,
                "selected_index": selected_index,
                "correct_index": question["correct_index"],
                "is_correct": is_correct,
            }
        )

    total = len(questions)
    feedback = (
        "Strong work. The learner can move from concept recall into implementation details."
        if correct == total
        else "The learner should revisit the missed stack concepts before moving to harder problems."
    )
    next_step = (
        "Advance to one harder stack or DFS-linked question next."
        if correct == total
        else "Re-read push, pop, and peek. Then practice one real-world stack use case and retake the quiz."
    )

    return {
        "score": correct,
        "total": total,
        "feedback": feedback,
        "missed_prompts": missed_prompts,
        "next_step": next_step,
        "results": results,
    }


def init_db():
    with get_db() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                display_name TEXT NOT NULL,
                password_salt TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                phase TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                token TEXT NOT NULL UNIQUE,
                expires_at TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS dashboard_data (
                user_id INTEGER PRIMARY KEY,
                metrics_json TEXT NOT NULL,
                priorities_json TEXT NOT NULL,
                subjects_json TEXT NOT NULL,
                cycle_steps_json TEXT NOT NULL,
                knowledge_preview_json TEXT NOT NULL,
                donut_value TEXT NOT NULL,
                suggestion TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS quiz_data (
                user_id INTEGER PRIMARY KEY,
                display_position INTEGER NOT NULL,
                total_questions INTEGER NOT NULL,
                questions_json TEXT NOT NULL,
                stats_json TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS planner_data (
                user_id INTEGER PRIMARY KEY,
                week_views_json TEXT NOT NULL,
                guidance_json TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )

        demo_accounts = build_demo_accounts()
        legacy_usernames = ["ravidran", "keerthiswaran"]

        legacy_rows = []
        for username in legacy_usernames:
            row = get_user_by_username(connection, username)
            if row:
                legacy_rows.append(row)

        missing_accounts = [account for account in demo_accounts if not get_user_by_username(connection, account["username"])]
        for legacy_row, account in zip(legacy_rows, missing_accounts):
            connection.execute(
                "UPDATE users SET username = ?, display_name = ?, phase = ? WHERE id = ?",
                (normalize_username(account["username"]), account["display_name"], normalize_phase(account["phase"]), legacy_row["id"]),
            )
            seed_user_data(connection, legacy_row["id"], account["display_name"], account["phase"], demo=True, profile=account["profile"])

        for account in demo_accounts:
            if not get_user_by_username(connection, account["username"]):
                create_user(
                    connection,
                    username=account["username"],
                    password=account["password"],
                    display_name=account["display_name"],
                    phase=account["phase"],
                    demo=True,
                    profile=account["profile"],
                )

        for legacy_username in legacy_usernames:
            row = get_user_by_username(connection, legacy_username)
            if row:
                connection.execute("DELETE FROM users WHERE id = ?", (row["id"],))

        for account in demo_accounts:
            row = get_user_by_username(connection, account["username"])
            if row:
                connection.execute(
                    "UPDATE users SET display_name = ?, phase = ? WHERE id = ?",
                    (account["display_name"], normalize_phase(account["phase"]), row["id"]),
                )
                seed_user_data(connection, row["id"], account["display_name"], account["phase"], demo=True, profile=account["profile"])


init_db()


def query_groq(user_query: str):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured")

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    data = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": user_query},
        ],
        "max_tokens": 500,
        "temperature": 0.7,
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
    choices = result.get("choices")
    if not choices:
        raise HTTPException(status_code=502, detail="Groq API returned an unexpected response payload")

    message = choices[0].get("message", {})
    content = message.get("content")
    if not isinstance(content, str) or not content.strip():
        raise HTTPException(status_code=502, detail="Groq API returned an empty assistant response")

    return content


@app.post("/auth/register")
def register(payload: RegisterRequest):
    with get_db() as connection:
        user_row = create_user(
            connection,
            username=payload.username,
            password=payload.password,
            display_name=payload.display_name,
            phase="relearn",
        )
        return auth_response(connection, user_row)


@app.post("/auth/login")
def login(payload: LoginRequest):
    with get_db() as connection:
        user_row = get_user_by_username(connection, payload.username)
        if not user_row or not verify_password(payload.password, user_row["password_salt"], user_row["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid username or password")

        return auth_response(connection, user_row)


@app.get("/auth/me")
def auth_me(current_user: Annotated[sqlite3.Row, Depends(require_current_user)]):
    return user_response(current_user)


@app.post("/auth/logout")
def auth_logout(authorization: Annotated[str | None, Header()] = None):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization token is required")

    token = authorization.removeprefix("Bearer ").strip()
    with get_db() as connection:
        connection.execute("DELETE FROM sessions WHERE token = ?", (token,))
    return {"success": True}


@app.post("/")
def ask(query: Query):
    cleaned_query = query.query.strip()
    if not cleaned_query:
        raise HTTPException(status_code=400, detail="Query must not be empty")
    return {"response": query_groq(cleaned_query)}


@app.get("/dashboard/{username}")
def get_dashboard(username: str):
    with get_db() as connection:
        user_row = get_user_by_username(connection, username)
        if not user_row:
            raise HTTPException(status_code=404, detail="Learner profile not found")
        return dashboard_payload(connection, user_row)


@app.get("/me/dashboard")
def get_my_dashboard(current_user: Annotated[sqlite3.Row, Depends(require_current_user)]):
    with get_db() as connection:
        user_row = get_user_by_username(connection, current_user["username"])
        return dashboard_payload(connection, user_row)


@app.get("/quiz/{username}")
def get_quiz(username: str):
    with get_db() as connection:
        user_row = get_user_by_username(connection, username)
        if not user_row:
            raise HTTPException(status_code=404, detail="Learner profile not found")
        return quiz_payload(connection, user_row)


@app.get("/me/quiz")
def get_my_quiz(current_user: Annotated[sqlite3.Row, Depends(require_current_user)]):
    with get_db() as connection:
        user_row = get_user_by_username(connection, current_user["username"])
        return quiz_payload(connection, user_row)


@app.post("/quiz/submit")
def submit_legacy_quiz(payload: dict):
    username = payload.get("username", "")
    answers = payload.get("answers", {})
    with get_db() as connection:
        user_row = get_user_by_username(connection, username)
        if not user_row:
            raise HTTPException(status_code=404, detail="Learner profile not found")
        return score_quiz(connection, user_row, answers)


@app.post("/me/quiz/submit")
def submit_quiz(payload: QuizSubmission, current_user: Annotated[sqlite3.Row, Depends(require_current_user)]):
    with get_db() as connection:
        user_row = get_user_by_username(connection, current_user["username"])
        return score_quiz(connection, user_row, payload.answers)


@app.get("/planner/{username}")
def get_planner(username: str):
    with get_db() as connection:
        user_row = get_user_by_username(connection, username)
        if not user_row:
            raise HTTPException(status_code=404, detail="Learner profile not found")
        return planner_payload(connection, user_row)


@app.get("/me/planner")
def get_my_planner(current_user: Annotated[sqlite3.Row, Depends(require_current_user)]):
    with get_db() as connection:
        user_row = get_user_by_username(connection, current_user["username"])
        return planner_payload(connection, user_row)


@app.get("/test")
def test_api():
    return {"reply": "Hello from FastAPI backend!"}
