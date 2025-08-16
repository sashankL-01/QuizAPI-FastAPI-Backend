from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from bson import ObjectId
from datetime import datetime
from ..schemas import attempt
from ..db.database import get_db
from ..auth.dependencies import get_current_user
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter()

@router.post("/quizzes/{quiz_id}/submit", response_model=attempt.Attempt, status_code=201)
async def submit_quiz_attempt(
    quiz_id: str,
    submission_data: attempt.AttemptCreate,
    current_user = Depends(get_current_user),
    db: AsyncIOMotorClient = Depends(get_db)
):
    """Submit a quiz attempt"""
    try:
        # Validate quiz_id
        if not ObjectId.is_valid(quiz_id):
            raise HTTPException(status_code=400, detail="Invalid quiz ID")

        # Check if quiz exists
        quiz = await db.quizzes.find_one({"_id": ObjectId(quiz_id)})
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")

        # Extract answers from submission data
        answers = submission_data.answers

        # Calculate score
        total_questions = len(quiz["questions"])
        correct_count = 0

        for answer_data in answers:
            question_index = answer_data.question_index
            selected_options = answer_data.selected_options

            if question_index < len(quiz["questions"]):
                question = quiz["questions"][question_index]
                correct_options = [i for i, opt in enumerate(question["options"]) if opt["is_correct"]]

                # Check if selected options match correct options
                if set(selected_options) == set(correct_options):
                    correct_count += 1

        score = (correct_count / total_questions * 100) if total_questions > 0 else 0

        # Create attempt document
        attempt_data = {
            "user_id": current_user.id,
            "quiz_id": quiz_id,
            "answers": [answer.model_dump() for answer in answers],
            "score": round(score, 2),
            "completed_at": datetime.utcnow(),
            "time_taken": submission_data.time_taken
        }

        # Insert attempt
        result = await db.attempts.insert_one(attempt_data)

        # Retrieve the created attempt
        created_attempt = await db.attempts.find_one({"_id": result.inserted_id})
        created_attempt["_id"] = str(created_attempt["_id"])

        return created_attempt

    except Exception as e:
        print(f"Quiz submission error: {str(e)}")  # For debugging
        raise HTTPException(status_code=500, detail=f"Failed to submit quiz: {str(e)}")

@router.get("/attempts/", response_model=List[attempt.Attempt])
async def get_user_attempts(
    current_user = Depends(get_current_user),
    db: AsyncIOMotorClient = Depends(get_db)
):
    """Get all attempts by the current user"""
    attempts = await db.attempts.find({"user_id": current_user.id}).to_list(1000)
    for attempt_doc in attempts:
        attempt_doc["_id"] = str(attempt_doc["_id"])
    return attempts

@router.get("/attempts/{attempt_id}", response_model=attempt.Attempt)
async def get_attempt_by_id(
    attempt_id: str,
    current_user = Depends(get_current_user),
    db: AsyncIOMotorClient = Depends(get_db)
):
    """Get a specific attempt by ID"""
    if not ObjectId.is_valid(attempt_id):
        raise HTTPException(status_code=400, detail="Invalid attempt ID")

    attempt_doc = await db.attempts.find_one({
        "_id": ObjectId(attempt_id),
        "user_id": current_user.id
    })

    if not attempt_doc:
        raise HTTPException(status_code=404, detail="Attempt not found")

    attempt_doc["_id"] = str(attempt_doc["_id"])
    return attempt_doc
