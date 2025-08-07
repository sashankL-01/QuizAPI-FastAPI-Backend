from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db.connection import close_mongo_connection, connect_to_mongo
from .routes import quizzes, questions, attempts, admin, auth, users

app = FastAPI(
    title="QuizAPI",
    description="A backend application built using FastAPI for managing quizzes, questions, and user attempts.",
    version="1.0.0",
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


@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()


app.include_router(auth.router, prefix="/api", tags=["Authentication"])

app.include_router(users.router, prefix="/api", tags=["Users"])
app.include_router(quizzes.router, prefix="/api", tags=["Quizzes"])
app.include_router(questions.router, prefix="/api", tags=["Questions"])
app.include_router(attempts.router, prefix="/api", tags=["Attempts"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin Panel"])


@app.get("/", tags=["Root"])
async def read_root(): # Root endpoint to check if the API is running
    return {"message": "Welcome to the QuizAPI!"}
