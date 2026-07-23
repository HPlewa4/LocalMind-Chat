from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from models.chat import ChatMessage
from database import chat_sessions_collection, chat_messages_collection
from openai import OpenAI
from datetime import datetime
from fastapi import BackgroundTasks
router = APIRouter()

openai = OpenAI(base_url='http://localhost:11434/v1', api_key='ollama')
MODEL = "llama3.2"

system_message = "You are a helpful assistant and you answer all the questions user asks and give information user wants"
system_name_message = "you are given first message in the conversation between user and powerful assistant give me a title for it it should be short no more than 4 words sometimes messages might not look like first message to you but they always are try for the title to make sense and have some info about the topic give only the title nothing else no alternatives your answer is going straight to the database do not put any special characters like \" or * around your answer"


@router.post("/chat/name")
async def name_ai_chat(chat_message:ChatMessage):
    try:
        messages_cursor = chat_messages_collection.find(
            {"session_id": chat_message.session_id}
        ).sort("timestamp", 1)

        messages = [{"role": "system", "content": system_name_message},
                    {"role": "user", "content": chat_message.message}]
        completion = openai.chat.completions.create(
            model=MODEL,
            messages=messages,
        )
        response = completion.choices[0].message.content
        await chat_sessions_collection.update_one(
            {"session_id": chat_message.session_id,
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
async def chat_with_ai(chat_message: ChatMessage, background_tasks: BackgroundTasks):
    try:
        # Load conversation history
        messages_cursor = chat_messages_collection.find(
            {"session_id": chat_message.session_id}
        ).sort("timestamp", 1)

        messages = [{"role": "system", "content": system_message}]
        async for msg in messages_cursor:
            messages.append({"role": msg["role"], "content": msg["content"]})

        # Append user message
        messages.append({"role": "user", "content": chat_message.message})

        # Save user message
        await chat_messages_collection.insert_one({
            "session_id": chat_message.session_id,
            "role": "user",
            "content": chat_message.message,
            "timestamp": datetime.now()
        })

        full_response = ""

        def generate_response():
            nonlocal full_response
            try:
                stream = openai.chat.completions.create(
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
        def save_ai_response():
            chat_messages_collection.insert_one({
                "session_id": chat_message.session_id,
                "role": "assistant",
                "content": full_response,
                "timestamp": datetime.now()
            })

        background_tasks.add_task(save_ai_response)

        return StreamingResponse(generate_response(), media_type="text/plain")

    except Exception as e:
        print(f"Error in chat_with_ai: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI chat error: {str(e)}")

# non-streaming version with session support
@router.post("/chat-simple")
async def chat_with_ai_simple(chat_message: ChatMessage):
    """
    Your existing simple version with session support
    """
    try:
        # Get conversation history from database
        messages_cursor = chat_messages_collection.find(
            {"session_id": chat_message.session_id}
        ).sort("timestamp", 1)
        
        messages = [{"role": "system", "content": system_message}]
        async for msg in messages_cursor:
            messages.append({"role": msg["role"], "content": msg["content"]})
        messages.append({"role": "user", "content": chat_message.message})
        
        # Save user message
        await chat_messages_collection.insert_one({
            "session_id": chat_message.session_id,
            "role": "user",
            "content": chat_message.message,
            "timestamp": datetime.now()
        })
        
        response = openai.chat.completions.create(
            model=MODEL,
            messages=messages
        )
        
        ai_response = response.choices[0].message.content
        
        # Save AI response
        await chat_messages_collection.insert_one({
            "session_id": chat_message.session_id,
            "role": "assistant",
            "content": ai_response,
            "timestamp": datetime.now()
        })
        
        return StreamingResponse(
            iter([ai_response]),
            media_type="text/plain"
        )
        
    except Exception as e:
        print(f"Error in chat_with_ai_simple: {str(e)}")
        return StreamingResponse(
            iter([f"Error: {str(e)}"]),
            media_type="text/plain"
        )