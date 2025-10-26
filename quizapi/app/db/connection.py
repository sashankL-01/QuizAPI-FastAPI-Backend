import os
from motor.motor_asyncio import AsyncIOMotorClient
from ..utils.config import get_settings
import ssl
import certifi


class DB:  # mongodb client and database manager
    client: AsyncIOMotorClient = None
    db = None


db_manager = DB()


async def connect_to_mongo():
    print("Connecting to MongoDB...")
    settings = get_settings()
    ca = certifi.where()

    # Enhanced client options for better compatibility with MongoDB Atlas
    client_options = {
        "tls": True,
        "tlsCAFile": ca,
        "retryWrites": True,
        "w": "majority",
        "serverSelectionTimeoutMS": 30000,
        "connectTimeoutMS": 20000,
        # Use the modern pymongo/motor TLS options. Do NOT use the old
        # `ssl_cert_reqs` key (unsupported) — use tlsAllowInvalidCertificates
        # if you intentionally want to allow invalid certs. Here we keep
        # verification enabled and provide the certifi CA bundle.
        "tlsAllowInvalidCertificates": False,
    }

    try:
        # Print the MongoDB URL for debugging (exclude password)
        safe_url = settings.mongodb_url.replace(
            settings.mongodb_url.split("@")[0], "mongodb+srv://****:****"
        )
        print(f"Connecting to: {safe_url}")

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
