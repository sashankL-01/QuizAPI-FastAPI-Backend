import os
from motor.motor_asyncio import AsyncIOMotorClient
from ..utils.config import get_settings

class DB: #mongodb client and database manager
    client: AsyncIOMotorClient = None
    db = None

db_manager = DB()

async def connect_to_mongo():
    print("Connecting to MongoDB...")
    settings = get_settings()
    db_manager.client = AsyncIOMotorClient(settings.mongodb_url)
    db_manager.db = db_manager.client[settings.mongodb_database]
    print("Successfully connected to MongoDB!")

async def close_mongo_connection():
    print("Closing MongoDB connection...")
    if db_manager.client:
        db_manager.client.close()
    print("MongoDB connection closed.")