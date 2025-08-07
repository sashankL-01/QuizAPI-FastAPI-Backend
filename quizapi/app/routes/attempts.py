from fastapi import APIRouter, Depends, HTTPException
from ..schemas import attempt
from ..db.database import get_db
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter()

@router.post("/attempts/", response_model=attempt.Attempt, status_code=201)
async def submit_attempt(attempt_: attempt.AttemptCreate, db: AsyncIOMotorClient = Depends(get_db)): # Submit a quiz attempt
    quiz = await db.quizzes.find_one({"_id": attempt_.quiz_id})
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    correct_answers = [q["correct_option"] for q in quiz["questions"]]
    score = sum(1 for i, answer in enumerate(attempt_.answers) if answer == correct_answers[i]) / len(correct_answers) * 100

    attempt_dict = attempt_.dict()
    attempt_dict["score"] = score
    result = await db.attempts.insert_one(attempt_dict)
    created_attempt = await db.attempts.find_one({"_id": result.inserted_id})
    return created_attempt
