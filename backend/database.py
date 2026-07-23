from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("MONGO_DB")

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]
chat_sessions_collection = db["chat_sessions"]  
chat_messages_collection = db["chat_messages"]