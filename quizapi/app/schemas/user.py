from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr = Field(..., description="The email address of the user.")
    full_name: Optional[str] = Field(None, description="The full name of the user.")

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="The password for the user account.")

class User(UserBase):
    id: str = Field(..., alias="_id", description="The unique identifier of the user.")

    class Config:
        orm_mode = True
        allow_population_by_field_name = True
        json_encoders = {
            "id": str
        }