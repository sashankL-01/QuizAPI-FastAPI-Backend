from pydantic import BaseModel, Field
from typing import List, Optional

class QuestionBase(BaseModel):
    question_text: str = Field(..., min_length=1, description="The text of the question.")
    options: List[str] = Field(..., min_items=4, description="A list of possible answers for the question.")
    correct_option: int = Field(..., ge=0, description="The index of the correct option in the options list.")

class QuestionCreate(QuestionBase):
    pass

class Question(QuestionBase):
    id: str = Field(..., alias="_id", description="The unique identifier of the question.")

    class Config:
        orm_mode = True
        allow_population_by_field_name = True
        json_encoders = {
            "id": str
        }