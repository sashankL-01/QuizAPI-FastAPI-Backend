from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .db.connection import close_mongo_connection, connect_to_mongo, db_manager
from .db.init_db import initialize_database
from .routes import quizzes, questions, attempts, admin, auth, users

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    db = db_manager.db
    await initialize_database(db)
    yield
    await close_mongo_connection()

app = FastAPI(
    title="QuizAPI",
    description="A backend application built using FastAPI for managing quizzes, questions, and user attempts.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration
origins = [ ]    #list of allowed origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # put origins here in production
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


app.include_router(auth.router, prefix="/api", tags=["Authentication"])

app.include_router(users.router, prefix="/api", tags=["Users"])
app.include_router(quizzes.router, prefix="/api", tags=["Quizzes"])
app.include_router(questions.router, prefix="/api", tags=["Questions"])
app.include_router(attempts.router, prefix="/api", tags=["Attempts"])
app.include_router(admin.router, prefix="/api", tags=["Admin Panel"])


@app.get("/", tags=["Root"])
async def read_root(): # Root endpoint to check if the API is running
    return {"message": "Welcome to the QuizAPI!"}
