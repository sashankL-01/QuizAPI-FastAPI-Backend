from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class AttemptBase(BaseModel):
    quiz_id: str = Field(..., description="The ID of the quiz being attempted")
    answers: List[int] = Field(..., description="List of selected answer indices")
    time_taken: Optional[int] = Field(None, description="Time taken in seconds")

class AttemptCreate(AttemptBase):
    pass

class Attempt(AttemptBase):
    id: str = Field(..., alias="_id", description="The unique identifier of the attempt")
    user_id: str = Field(..., description="The ID of the user who made the attempt")
    score: float = Field(..., description="Score achieved in the attempt")
    max_score: float = Field(..., description="Maximum possible score for the quiz")
    percentage: float = Field(..., description="Score as a percentage")
    attempt_date: datetime = Field(..., description="When the attempt was made")
    is_completed: bool = Field(default=True, description="Whether the attempt was completed")
    correct_answers: int = Field(..., description="Number of correct answers")
    total_questions: int = Field(..., description="Total number of questions in the quiz")

    model_config = {
        "from_attributes": True,
        "populate_by_name": True,
        "json_encoders": {
            str: str,
            datetime: lambda v: v.isoformat() if v else None
    }
        }

class AttemptStats(BaseModel):
    total_attempts: int
    average_score: float
    highest_score: float
    completion_rate: float
