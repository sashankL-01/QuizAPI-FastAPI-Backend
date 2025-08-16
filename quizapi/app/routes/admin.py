from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from ..schemas import question,quiz,attempt,user
from ..db.database import get_db
from ..auth.dependencies import get_current_admin_user
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from datetime import datetime

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(get_current_admin_user)],
    responses={404: {"description": "Not found"}},
)


# User Management Endpoints
@router.get("/users", response_model=List[user.User])
async def admin_get_all_users(
    skip: int = Query(0, ge=0, description="Number of users to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of users to return"),
    active_only: bool = Query(False, description="Filter active users only"),
    current_admin: user.User = Depends(get_current_admin_user),
    db: AsyncIOMotorClient = Depends(get_db)
):   # Get all users with pagination and filtering options
    filter_query = {}
    if active_only:
        filter_query["is_active"] = True

    users_cursor = db.users.find(filter_query).skip(skip).limit(limit)
    users = await users_cursor.to_list(length=limit)

    for user_doc in users:
        user_doc["_id"] = str(user_doc["_id"])
        # Convert datetime fields to ISO format if they exist
        if "registration_date" in user_doc and user_doc["registration_date"]:
            user_doc["registration_date"] = user_doc["registration_date"].isoformat()
        if "last_login" in user_doc and user_doc["last_login"]:
            user_doc["last_login"] = user_doc["last_login"].isoformat()

    return users

@router.get("/users/stats", response_model=user.UserStats)
async def admin_get_user_stats(
    current_admin: user.User = Depends(get_current_admin_user),
    db: AsyncIOMotorClient = Depends(get_db)
):
    """Get overall user statistics"""
    total_users = await db.users.count_documents({})
    active_users = await db.users.count_documents({"is_active": True})

    # Calculate total attempts and average score
    pipeline = [
        {"$group": {
            "_id": None,
            "total_attempts": {"$sum": "$total_attempts"},
            "avg_score": {"$avg": "$average_score"}
        }}
    ]

    stats_result = await db.users.aggregate(pipeline).to_list(1)
    total_attempts = stats_result[0]["total_attempts"] if stats_result else 0
    average_score = stats_result[0]["avg_score"] if stats_result else 0.0

    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_attempts": total_attempts,
        "average_score": round(average_score, 2)
    }

@router.get("/users/{user_id}", response_model=user.User)
async def admin_get_user(
    user_id: str,
    current_admin: user.User = Depends(get_current_admin_user),
    db: AsyncIOMotorClient = Depends(get_db)
):
    """Get a specific user by ID"""
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")

    user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")

    user_doc["_id"] = str(user_doc["_id"])
    if "registration_date" in user_doc and user_doc["registration_date"]:
        user_doc["registration_date"] = user_doc["registration_date"].isoformat()
    if "last_login" in user_doc and user_doc["last_login"]:
        user_doc["last_login"] = user_doc["last_login"].isoformat()

    return user_doc

@router.put("/users/{user_id}/toggle-active", response_model=user.User)
async def admin_toggle_user_active(
    user_id: str,
    current_admin: user.User = Depends(get_current_admin_user),
    db: AsyncIOMotorClient = Depends(get_db)
):
    """Toggle user active status"""
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")

    # Prevent admin from deactivating themselves
    if user_id == current_admin.id:
        raise HTTPException(
            status_code=400,
            detail="Cannot change your own active status"
        )

    user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")

    new_status = not user_doc.get("is_active", True)
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_active": new_status}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    updated_user = await db.users.find_one({"_id": ObjectId(user_id)})
    updated_user["_id"] = str(updated_user["_id"])
    return updated_user

@router.put("/users/{user_id}/toggle-admin", response_model=user.User)
async def admin_toggle_user_admin(
    user_id: str,
    current_admin: user.User = Depends(get_current_admin_user),
    db: AsyncIOMotorClient = Depends(get_db)
):
    """Toggle user admin status"""
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")

    # Prevent admin from removing their own admin status
    if user_id == current_admin.id:
        raise HTTPException(
            status_code=400,
            detail="Cannot change your own admin status"
        )

    user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")

    new_admin_status = not user_doc.get("is_admin", False)
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_admin": new_admin_status}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    updated_user = await db.users.find_one({"_id": ObjectId(user_id)})
    updated_user["_id"] = str(updated_user["_id"])
    return updated_user

@router.get("/users/{user_id}/attempts", response_model=List[attempt.Attempt])
async def admin_get_user_attempts(
    user_id: str,
    current_admin: user.User = Depends(get_current_admin_user),
    db: AsyncIOMotorClient = Depends(get_db)
):
    """Get all attempts by a specific user"""
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")

    # Check if user exists
    user_exists = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user_exists:
        raise HTTPException(status_code=404, detail="User not found")

    attempts = await db.attempts.find({"user_id": user_id}).to_list(1000)
    for attempt_doc in attempts:
        attempt_doc["_id"] = str(attempt_doc["_id"])

    return attempts

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_user(
    user_id: str,
    current_admin: user.User = Depends(get_current_admin_user),
    db: AsyncIOMotorClient = Depends(get_db)
):
    """Delete a user (soft delete by setting is_active to False)"""
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")

    # Prevent admin from deleting themselves
    if user_id == current_admin.id:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete your own account"
        )

    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_active": False, "deleted_at": datetime.utcnow()}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

# Quiz Management Endpoints (with admin authentication)
@router.get("/quizzes", response_model=List[quiz.Quiz])
async def admin_get_quizzes(
    current_admin: user.User = Depends(get_current_admin_user),
    db: AsyncIOMotorClient = Depends(get_db)
):
    """Get all quizzes"""
    quizzes = await db.quizzes.find().to_list(1000)
    for quiz_ in quizzes:
        quiz_["_id"] = str(quiz_["_id"])
        for question_ in quiz_.get("questions", []):
            question_["_id"] = str(question_["_id"])
    return quizzes

@router.post("/quizzes", response_model=quiz.Quiz, status_code=status.HTTP_201_CREATED)
async def admin_create_quiz(
    new_quiz: quiz.QuizCreate,
    db: AsyncIOMotorClient = Depends(get_db)
):
    """Create a new quiz with questions"""
    # Convert the quiz data to dictionary
    quiz_dict = new_quiz.model_dump()

    # Insert the quiz into database
    result = await db.quizzes.insert_one(quiz_dict)

    # Retrieve the created quiz
    created_quiz = await db.quizzes.find_one({"_id": result.inserted_id})

    # Format the response
    created_quiz["_id"] = str(created_quiz["_id"])

    return created_quiz


@router.get("/quizzes/{quiz_id}", response_model=quiz.Quiz)
async def admin_get_quiz(
    quiz_id: str,
    db: AsyncIOMotorClient = Depends(get_db)
): #get a specific quiz by ID
    if not ObjectId.is_valid(quiz_id):
        raise HTTPException(status_code=400, detail="Invalid quiz ID")

    quiz_ = await db.quizzes.find_one({"_id": ObjectId(quiz_id)})
    if not quiz_:
        raise HTTPException(status_code=404, detail="Quiz not found")

    quiz_["_id"] = str(quiz_["_id"])
    for question_ in quiz_.get("questions", []):
        question_["_id"] = str(question_["_id"])
    return quiz_

@router.put("/quizzes/{quiz_id}", response_model=quiz.Quiz)
async def admin_update_quiz(
    quiz_id: str,
    quiz_update: quiz.QuizCreate,
    db: AsyncIOMotorClient = Depends(get_db)
): #update an existing quiz
    if not ObjectId.is_valid(quiz_id):
        raise HTTPException(status_code=400, detail="Invalid quiz ID")

    result = await db.quizzes.update_one(
        {"_id": ObjectId(quiz_id)},
        {"$set": quiz_update.model_dump(exclude_unset=True)}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Quiz not found")

    updated_quiz = await db.quizzes.find_one({"_id": ObjectId(quiz_id)})
    return updated_quiz


@router.delete("/quizzes/{quiz_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_quiz(
    quiz_id: str,
    db: AsyncIOMotorClient = Depends(get_db)
): #delete a quiz
    if not ObjectId.is_valid(quiz_id):
        raise HTTPException(status_code=400, detail="Invalid quiz ID")

    result = await db.quizzes.delete_one({"_id": ObjectId(quiz_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return



@router.post("/quizzes/{quiz_id}/questions", response_model=quiz.Quiz, status_code=status.HTTP_201_CREATED)
async def admin_add_question_to_quiz(
        quiz_id: str,
        question_: question.QuestionCreate,
        db: AsyncIOMotorClient = Depends(get_db)
):  #add a new question to a quiz
    if not ObjectId.is_valid(quiz_id):
        raise HTTPException(status_code=400, detail="Invalid quiz ID")

    question_dict = question_.model_dump()

    result = await db.quizzes.update_one(
        {"_id": ObjectId(quiz_id)},
        {"$push": {"questions": question_dict}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Quiz not found")

    updated_quiz = await db.quizzes.find_one({"_id": ObjectId(quiz_id)})
    return updated_quiz


@router.put("/quizzes/{quiz_id}/questions/{question_index}", response_model=quiz.Quiz)
async def admin_update_question_in_quiz(
        quiz_id: str,
        question_index: int,
        question_update: question.QuestionBase,
        db: AsyncIOMotorClient = Depends(get_db) #dependency injection executed before the endpoint function is called
): #update a specific question in a quiz
    if not ObjectId.is_valid(quiz_id):
        raise HTTPException(status_code=400, detail="Invalid quiz ID")

    quiz_ = await db.quizzes.find_one({"_id": ObjectId(quiz_id)})
    if not quiz_:
        raise HTTPException(status_code=404, detail="Quiz not found")
    if not 0 <= question_index < len(quiz_.get("questions", [])):
        raise HTTPException(status_code=404, detail="Question index out of bounds")

    update_fields = {f"questions.{question_index}.{key}": value for key, value in
                     question_update.model_dump(exclude_unset=True).items()}

    if not update_fields:
        raise HTTPException(status_code=400, detail="No update data provided")

    await db.quizzes.update_one(
        {"_id": ObjectId(quiz_id)},
        {"$set": update_fields}
    )

    updated_quiz = await db.quizzes.find_one({"_id": ObjectId(quiz_id)})
    return updated_quiz


@router.delete("/quizzes/{quiz_id}/questions/{question_index}", response_model=quiz.Quiz)
async def admin_delete_question_from_quiz(
        quiz_id: str,
        question_index: int,
        db: AsyncIOMotorClient = Depends(get_db)
): #delete a specific question from a quiz
    if not ObjectId.is_valid(quiz_id):
        raise HTTPException(status_code=400, detail="Invalid quiz ID")

    quiz_ = await db.quizzes.find_one({"_id": ObjectId(quiz_id)})
    if not quiz_:
        raise HTTPException(status_code=404, detail="Quiz not found")
    if not 0 <= question_index < len(quiz_.get("questions", [])):
        raise HTTPException(status_code=404, detail="Question index out of bounds")

    # To delete an element from an array by index, we first set it to null, then pull all nulls
    unset_op = {f"questions.{question_index}": 1}
    await db.quizzes.update_one({"_id": ObjectId(quiz_id)}, {"$unset": unset_op})

    pull_op = {"questions": None}
    await db.quizzes.update_one({"_id": ObjectId(quiz_id)}, {"$pull": pull_op})

    updated_quiz = await db.quizzes.find_one({"_id": ObjectId(quiz_id)})
    return updated_quiz
