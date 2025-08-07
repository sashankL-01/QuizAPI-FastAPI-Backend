from pydantic import BaseSettings
from functools import lru_cache


class Settings(BaseSettings): # Configuration settings for the application
    # Default to a local MongoDB instance if no environment variable is set.
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DATABASE: str = "quizdb"

    # Secret key for JWT
    SECRET_KEY: str = "a_very_secret_key_that_should_be_in_an_env_file"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings(): # Caches the settings to avoid reloading them multiple times
    return Settings()