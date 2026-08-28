from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo.errors import PyMongoError
from routes.ai_chat_routes import router as aichat_router
from routes.messages_sessions_routes import router as messages_router
from database import client
import os

app = FastAPI(title="LocalMind Chat", version="1.0.0")

origins = [
    origin.strip().rstrip("/")
    for origin in os.environ.get(
        "FRONTEND_ORIGIN",
        "http://localhost:3000,https://local-mind-chat.vercel.app",
    ).split(",")
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


@app.exception_handler(PyMongoError)
async def mongo_error_handler(request, exc):
    return JSONResponse(
        status_code=503,
        content={
            "detail": "Database unavailable. Check MongoDB Atlas network access and Render's MONGO_URI."
        },
    )


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/health/database")
async def database_health():
    await client.admin.command("ping")
    return {"status": "ok"}
