from pydantic import BaseModel, Field
from typing import List, Optional
from .question import QuestionBase

class QuizBase(BaseModel):
    title: str = Field(..., min_length=1, description="The title of the quiz.")
    description: Optional[str] = Field(None, description="A brief description of the quiz.")

class QuizCreate(QuizBase):
    pass

class Quiz(QuizBase):
    id: str = Field(..., alias="_id", description="The unique identifier of the quiz.")
    questions: List[QuestionBase] = Field([], description="A list of questions in the quiz.")

    class Config:
        orm_mode = True
        allow_population_by_field_name = True
        json_encoders = {
            "id": str
        }