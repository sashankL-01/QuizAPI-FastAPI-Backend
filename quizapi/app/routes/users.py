from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from ..schemas import user, attempt
from ..db.database import get_db
from ..db.init_db import update_user_stats
from ..auth.dependencies import get_current_user, get_current_active_user
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from datetime import datetime,timezone
import bcrypt

router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}},
)

@router.get("/me", response_model=user.User)
async def get_current_user_profile(current_user: user.User = Depends(get_current_user)):  # Get current user's profile
    return current_user

@router.put("/me", response_model=user.User)
async def update_current_user(
    user_update: user.UserUpdate,
    current_user: user.User = Depends(get_current_active_user),
    db: AsyncIOMotorClient = Depends(get_db)
):   # Update current user's profile
    update_data = user_update.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    result = await db.users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    updated_user = await db.users.find_one({"_id": ObjectId(current_user.id)})
    updated_user["_id"] = str(updated_user["_id"])
    return user.User(**updated_user)

@router.get("/me/attempts", response_model=List[attempt.Attempt])
async def get_user_attempts(
    current_user: user.User = Depends(get_current_active_user),
    db: AsyncIOMotorClient = Depends(get_db)
):   # Get current user's quiz attempts
    attempts = await db.attempts.find({"user_id": current_user.id}).sort("attempt_date", -1).to_list(1000)
    for attempt_doc in attempts:
        attempt_doc["_id"] = str(attempt_doc["_id"])
        if "attempt_date" in attempt_doc and attempt_doc["attempt_date"]:
            attempt_doc["attempt_date"] = attempt_doc["attempt_date"].isoformat()
    return attempts

@router.get("/me/stats")
async def get_user_stats(
    current_user: user.User = Depends(get_current_active_user),
    db: AsyncIOMotorClient = Depends(get_db)
):  # Get current user's statistics
    user_doc = await db.users.find_one({"_id": ObjectId(current_user.id)})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    # Get recent attempts for detailed stats
    recent_attempts = await db.attempts.find(
        {"user_id": current_user.id}
    ).sort("attempt_date", -1).limit(10).to_list(10)
    best_score = max((attempt_["score"] for attempt_ in recent_attempts), default=0.0)
    recent_average = sum(attempt_["score"] for attempt_ in recent_attempts) / len(recent_attempts) if recent_attempts else 0.0
    return {
        "total_attempts": user_doc.get("total_attempts", 0),
        "average_score": user_doc.get("average_score", 0.0),
        "best_score": best_score,
        "recent_average": round(recent_average, 2),
        "registration_date": user_doc.get("registration_date"),
        "last_login": user_doc.get("last_login")
    }

@router.post("/me/login")
async def update_last_login(
    current_user: user.User = Depends(get_current_user),
    db: AsyncIOMotorClient = Depends(get_db)
):  # Update user's last login timestamp
    result = await db.users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": {"last_login": datetime.now(timezone.utc)}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Last login updated successfully"}

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_current_user(
    current_user: user.User = Depends(get_current_active_user),
    db: AsyncIOMotorClient = Depends(get_db)
):   # Delete (deactivate) current user's account
    result = await db.users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": {"is_active": False, "deleted_at": datetime.now(timezone.utc)}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
