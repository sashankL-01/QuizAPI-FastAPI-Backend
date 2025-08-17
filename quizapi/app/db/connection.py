import os
from motor.motor_asyncio import AsyncIOMotorClient
from ..utils.config import get_settings
import ssl
import certifi

class DB: #mongodb client and database manager
    client: AsyncIOMotorClient = None
    db = None

db_manager = DB()

async def connect_to_mongo():
    print("Connecting to MongoDB...")
    settings = get_settings()

    ca = certifi.where()

    client_options = {
        "tls": True,
        "tlsCAFile": ca,  # Use the certifi CA bundle for verification
        "retryWrites": True,
        "serverSelectionTimeoutMS": 30000  # Increase timeout to 30 seconds
    }

    try:
        db_manager.client = AsyncIOMotorClient(settings.mongodb_url, **client_options)
        db_manager.db = db_manager.client[settings.mongodb_database]
        await db_manager.db.command("ping")
        print("Successfully connected to MongoDB!")
    except Exception as e:
        print(f"MongoDB connection error: {e}")
        raise

async def close_mongo_connection():
    print("Closing MongoDB connection...")
    if db_manager.client:
        db_manager.client.close()
    print("MongoDB connection closed.")