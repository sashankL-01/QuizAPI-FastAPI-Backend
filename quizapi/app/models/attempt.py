from pydantic import BaseModel, Field
from typing import List

class Attempt(BaseModel): # Represents a quiz attempt
    quiz_id: str
    user_id: str
    answers: List[int]
    score: float