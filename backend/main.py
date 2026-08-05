from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.ai_chat_routes import router as aichat_router
from routes.messages_sessions_routes import router as messages_router
import os

app = FastAPI(title="LocalMind Chat", version="1.0.0")

origins = [
    origin.strip().rstrip("/")
    for origin in os.environ.get("FRONTEND_ORIGIN", "http://localhost:3000").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(aichat_router)
app.include_router(messages_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
