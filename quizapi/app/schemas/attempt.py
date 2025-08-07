from pydantic import BaseModel, Field
from typing import List

class AttemptBase(BaseModel):
    quiz_id: str = Field(..., description="The ID of the quiz being attempted.")
    user_id: str = Field(..., description="The ID of the user attempting the quiz.")
    answers: List[int] = Field(..., description="A list of the user's answers, represented by the index of the selected option for each question.")

class AttemptCreate(AttemptBase):
    pass

class Attempt(AttemptBase):
    id: str = Field(..., alias="_id", description="The unique identifier of the attempt.")
    score: float = Field(..., description="The score achieved by the user in the quiz attempt.")

    class Config:
        orm_mode = True
        allow_population_by_field_name = True
        json_encoders = {
            "id": str
        }