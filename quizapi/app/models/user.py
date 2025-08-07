from pydantic import BaseModel, EmailStr

class User(BaseModel): # Represents a user in the system
    email: EmailStr
    full_name: str
    hashed_password: str