from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from bson import ObjectId

from ..schemas import auth as auth_schemas, user as user_schemas
from ..auth.jwt_handler import jwt_handler
from ..db.database import get_db

router = APIRouter(
    prefix="/auth",
    tags=["authentication"]
)

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: user_schemas.UserCreate,
    db: AsyncIOMotorClient = Depends(get_db)
):
    """Register a new user"""
    try:
        # Check if user already exists
        existing_user = await db.users.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Hash password
        hashed_password = jwt_handler.hash_password(user_data.password)

        # Create user document
        user_doc = {
            "email": user_data.email,
            "full_name": user_data.full_name,
            "hashed_password": hashed_password,
            "is_active": True,
            "is_admin": False,
            "registration_date": datetime.now(timezone.utc),
            "last_login": None,
            "total_attempts": 0,
            "quiz_attempts": [],
            "average_score": 0.0
        }

        # Insert user
        result = await db.users.insert_one(user_doc)

        # Return success response
        return {
            "message": "User registered successfully",
            "user_id": str(result.inserted_id),
            "email": user_data.email
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login")
async def login_user(
    login_data: auth_schemas.LoginRequest,
    db: AsyncIOMotorClient = Depends(get_db)
):
    """Authenticate user and return JWT tokens"""
    try:
        # Find user by email
        user = await db.users.find_one({"email": login_data.email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Verify password
        if not jwt_handler.verify_password(login_data.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Check if user is active
        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is disabled"
            )

        # Update last login
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"last_login": datetime.now(timezone.utc)}}
        )

        # Create tokens
        user_id = str(user["_id"])
        token_data = {
            "sub": user_id,
            "email": user["email"],
            "is_admin": user.get("is_admin", False)
        }

        access_token = jwt_handler.create_access_token(token_data)
        refresh_token = jwt_handler.create_refresh_token({"sub": user_id})

        # Prepare user data for response
        user_response = {
            "id": user_id,
            "email": user["email"],
            "full_name": user["full_name"],
            "is_admin": user.get("is_admin", False),
            "is_active": user.get("is_active", True)
        }

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": user_response
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )
