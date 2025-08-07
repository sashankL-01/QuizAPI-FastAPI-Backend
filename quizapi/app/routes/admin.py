from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from ..schemas import question,quiz,attempt,user
from ..db.database import get_db
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    #dependencies=[Depends(get_current_admin_user)],  #
    #TODO: admin authentication implimentation here
    responses={404: {"description": "Not found"}},
)


@router.get("/quizzes/", response_model=List[quiz.Quiz])
async def admin_get_quizzes(db: AsyncIOMotorClient = Depends(get_db)): #get all quizzes
    quizzes = await db.quizzes.find().to_list(1000)
    for quiz_ in quizzes:
        quiz_["_id"] = str(quiz_["_id"])
        for question_ in quiz_.get("questions", []):
            question_["_id"] = str(question_["_id"])
    return quizzes

@router.post("/quizzes/", response_model=quiz.Quiz, status_code=status.HTTP_201_CREATED)
async def admin_create_quiz(new_quiz: quiz.Quiz, db: AsyncIOMotorClient = Depends(get_db)): #create a new quiz
    quiz_dict = new_quiz.model_dump()
    quiz_dict["questions"] = []
    result = await db.quizzes.insert_one(quiz_dict)
    created_quiz = await db.quizzes.find_one({"_id": result.inserted_id})
    return created_quiz


@router.get("/quizzes/{quiz_id}", response_model=quiz.Quiz)
async def admin_get_quiz(quiz_id: str, db: AsyncIOMotorClient = Depends(get_db)): #get a specific quiz by ID
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
async def admin_update_quiz(quiz_id: str, quiz_update: quiz.QuizCreate, db: AsyncIOMotorClient = Depends(get_db)): #update an existing quiz
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
async def admin_delete_quiz(quiz_id: str, db: AsyncIOMotorClient = Depends(get_db)): #delete a quiz
    if not ObjectId.is_valid(quiz_id):
        raise HTTPException(status_code=400, detail="Invalid quiz ID")

    result = await db.quizzes.delete_one({"_id": ObjectId(quiz_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return



@router.post("/quizzes/{quiz_id}/questions/", response_model=quiz.Quiz, status_code=status.HTTP_201_CREATED)
async def admin_add_question_to_quiz(
        quiz_id: str, question_: question.QuestionCreate, db: AsyncIOMotorClient = Depends(get_db)
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
        quiz_id: str, question_index: int, question_update: question.QuestionBase,
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
        quiz_id: str, question_index: int, db: AsyncIOMotorClient = Depends(get_db)
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
