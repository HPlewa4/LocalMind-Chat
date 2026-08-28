from fastapi import APIRouter, Header, HTTPException
from fastapi.responses import StreamingResponse
from models.chat import ChatMessage
from database import chat_sessions_collection, chat_messages_collection
from openai import OpenAI
from datetime import datetime
from fastapi import BackgroundTasks
import os

router = APIRouter()

HOSTED = os.environ.get("HOSTED", "false").lower() == "true"
BASE_URL = (
    "https://api.groq.com/openai/v1"
    if HOSTED
    else f'{os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")}/v1'
)
API_KEY = os.environ.get("GROQ_API_KEY") if HOSTED else "ollama"
MODEL = (
    os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")
    if HOSTED
    else os.environ.get("OLLAMA_MODEL", "llama3.2:latest")
)

if HOSTED and not API_KEY:
    raise RuntimeError("GROQ_API_KEY must be set when HOSTED=true")

llm_client = OpenAI(base_url=BASE_URL, api_key=API_KEY)

system_message = "You are a helpful assistant and you answer all the questions user asks and give information user wants"
system_name_message = "you are given first message in the conversation between user and powerful assistant give me a title for it it should be short no more than 4 words sometimes messages might not look like first message to you but they always are try for the title to make sense and have some info about the topic give only the title nothing else no alternatives your answer is going straight to the database do not put any special characters like \" or * around your answer"


@router.post("/chat/name")
async def name_ai_chat(chat_message: ChatMessage, owner_id: str = Header(..., alias="X-Chat-Browser-Id")):
    try:
        messages_cursor = chat_messages_collection.find(
            {"session_id": chat_message.session_id, "owner_id": owner_id}
        ).sort("timestamp", 1)

        messages = [{"role": "system", "content": system_name_message},
                    {"role": "user", "content": chat_message.message}]
        completion = llm_client.chat.completions.create(
            model=MODEL,
            messages=messages,
        )
        response = completion.choices[0].message.content
        await chat_sessions_collection.update_one(
            {"session_id": chat_message.session_id,
             "owner_id": owner_id,
             "ai_named": False 
             },
            {"$set": 
             {"title": response,
                "ai_named": True         
                      }}
        )
        return response
    except Exception as e:
        print(f"Error in name_ai_chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI chat error: {str(e)}")

@router.post("/chat")
async def chat_with_ai(chat_message: ChatMessage, background_tasks: BackgroundTasks, owner_id: str = Header(..., alias="X-Chat-Browser-Id")):
    try:
        session = await chat_sessions_collection.find_one({
            "session_id": chat_message.session_id,
            "owner_id": owner_id,
        })
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")

        # Load conversation history
        messages_cursor = chat_messages_collection.find(
            {"session_id": chat_message.session_id, "owner_id": owner_id}
        ).sort("timestamp", 1)

        messages = [{"role": "system", "content": system_message}]
        async for msg in messages_cursor:
            messages.append({"role": msg["role"], "content": msg["content"]})

        # Append user message
        messages.append({"role": "user", "content": chat_message.message})

        # Save user message
        await chat_messages_collection.insert_one({
            "session_id": chat_message.session_id,
            "owner_id": owner_id,
            "role": "user",
            "content": chat_message.message,
            "timestamp": datetime.now()
        })

        full_response = ""

        def generate_response():
            nonlocal full_response
            try:
                stream = llm_client.chat.completions.create(
                    model=MODEL,
                    messages=messages,
                    stream=True
                )
                for chunk in stream:
                    if chunk.choices[0].delta.content is not None:
                        content = chunk.choices[0].delta.content
                        full_response += content
                        yield content
            except Exception as e:
                yield f"Error: {str(e)}"

        # Save AI response in background after streaming
        async def save_ai_response():
            await chat_messages_collection.insert_one({
                "session_id": chat_message.session_id,
                "owner_id": owner_id,
                "role": "assistant",
                "content": full_response,
                "timestamp": datetime.now()
            })

        background_tasks.add_task(save_ai_response)

        return StreamingResponse(generate_response(), media_type="text/plain")

    except Exception as e:
        print(f"Error in chat_with_ai: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI chat error: {str(e)}")
