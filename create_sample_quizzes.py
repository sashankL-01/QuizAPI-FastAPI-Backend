#!/usr/bin/env python3
"""
Script to create 50 sample quizzes for the Quiz API application.
This script will populate the database with diverse quizzes across different subjects and difficulty levels.
"""

import asyncio
import random
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "quizdb")

# Sample quiz data organized by subjects
QUIZ_TEMPLATES = {
    "Programming": {
        "Python": [
            {
                "title": "Python Basics Quiz",
                "description": "Test your knowledge of Python fundamentals including data types, variables, and basic syntax.",
                "difficulty": "easy",
                "time_limit": 15,
                "questions": [
                    {
                        "question_text": "Which of the following is the correct way to declare a variable in Python?",
                        "options": [
                            {"option_text": "int x = 5", "is_correct": False},
                            {"option_text": "x = 5", "is_correct": True},
                            {"option_text": "var x = 5", "is_correct": False},
                            {"option_text": "declare x = 5", "is_correct": False}
                        ]
                    },
                    {
                        "question_text": "What is the output of print(type(5.0))?",
                        "options": [
                            {"option_text": "<class 'int'>", "is_correct": False},
                            {"option_text": "<class 'float'>", "is_correct": True},
                            {"option_text": "<class 'double'>", "is_correct": False},
                            {"option_text": "<class 'number'>", "is_correct": False}
                        ]
                    },
                    {
                        "question_text": "Which method is used to add an element to a list in Python?",
                        "options": [
                            {"option_text": "add()", "is_correct": False},
                            {"option_text": "append()", "is_correct": True},
                            {"option_text": "insert()", "is_correct": False},
                            {"option_text": "push()", "is_correct": False}
                        ]
                    }
                ]
            },
            {
                "title": "Python Data Structures",
                "description": "Advanced quiz on Python lists, dictionaries, sets, and tuples.",
                "difficulty": "medium",
                "time_limit": 25,
                "questions": [
                    {
                        "question_text": "Which of the following data structures is mutable in Python?",
                        "options": [
                            {"option_text": "tuple", "is_correct": False},
                            {"option_text": "string", "is_correct": False},
                            {"option_text": "list", "is_correct": True},
                            {"option_text": "frozenset", "is_correct": False}
                        ]
                    },
                    {
                        "question_text": "What is the time complexity of accessing an element in a dictionary?",
                        "options": [
                            {"option_text": "O(1)", "is_correct": True},
                            {"option_text": "O(n)", "is_correct": False},
                            {"option_text": "O(log n)", "is_correct": False},
                            {"option_text": "O(n²)", "is_correct": False}
                        ]
                    }
                ]
            }
        ],
        "JavaScript": [
            {
                "title": "JavaScript Fundamentals",
                "description": "Essential JavaScript concepts including variables, functions, and DOM manipulation.",
                "difficulty": "easy",
                "time_limit": 20,
                "questions": [
                    {
                        "question_text": "Which keyword is used to declare a constant in JavaScript?",
                        "options": [
                            {"option_text": "var", "is_correct": False},
                            {"option_text": "let", "is_correct": False},
                            {"option_text": "const", "is_correct": True},
                            {"option_text": "final", "is_correct": False}
                        ]
                    },
                    {
                        "question_text": "What does '===' operator do in JavaScript?",
                        "options": [
                            {"option_text": "Assigns a value", "is_correct": False},
                            {"option_text": "Compares values only", "is_correct": False},
                            {"option_text": "Compares values and types", "is_correct": True},
                            {"option_text": "Declares a variable", "is_correct": False}
                        ]
                    }
                ]
            }
        ]
    },
    "Science": {
        "Physics": [
            {
                "title": "Basic Physics Concepts",
                "description": "Fundamental physics principles including motion, force, and energy.",
                "difficulty": "medium",
                "time_limit": 30,
                "questions": [
                    {
                        "question_text": "What is the unit of force in the SI system?",
                        "options": [
                            {"option_text": "Joule", "is_correct": False},
                            {"option_text": "Newton", "is_correct": True},
                            {"option_text": "Watt", "is_correct": False},
                            {"option_text": "Pascal", "is_correct": False}
                        ]
                    },
                    {
                        "question_text": "Which law states that for every action, there is an equal and opposite reaction?",
                        "options": [
                            {"option_text": "Newton's First Law", "is_correct": False},
                            {"option_text": "Newton's Second Law", "is_correct": False},
                            {"option_text": "Newton's Third Law", "is_correct": True},
                            {"option_text": "Law of Conservation of Energy", "is_correct": False}
                        ]
                    }
                ]
            }
        ],
        "Chemistry": [
            {
                "title": "Chemical Elements and Compounds",
                "description": "Test your knowledge of the periodic table, chemical bonding, and reactions.",
                "difficulty": "medium",
                "time_limit": 25,
                "questions": [
                    {
                        "question_text": "What is the chemical symbol for gold?",
                        "options": [
                            {"option_text": "Go", "is_correct": False},
                            {"option_text": "Au", "is_correct": True},
                            {"option_text": "Gd", "is_correct": False},
                            {"option_text": "Ag", "is_correct": False}
                        ]
                    },
                    {
                        "question_text": "What type of bond forms between a metal and a non-metal?",
                        "options": [
                            {"option_text": "Covalent bond", "is_correct": False},
                            {"option_text": "Ionic bond", "is_correct": True},
                            {"option_text": "Metallic bond", "is_correct": False},
                            {"option_text": "Hydrogen bond", "is_correct": False}
                        ]
                    }
                ]
            }
        ]
    },
    "Mathematics": {
        "Algebra": [
            {
                "title": "Basic Algebra",
                "description": "Fundamental algebraic concepts including equations, inequalities, and functions.",
                "difficulty": "easy",
                "time_limit": 20,
                "questions": [
                    {
                        "question_text": "What is the value of x in the equation 2x + 5 = 15?",
                        "options": [
                            {"option_text": "5", "is_correct": True},
                            {"option_text": "10", "is_correct": False},
                            {"option_text": "7.5", "is_correct": False},
                            {"option_text": "2.5", "is_correct": False}
                        ]
                    },
                    {
                        "question_text": "Which of the following is a quadratic equation?",
                        "options": [
                            {"option_text": "x + 5 = 0", "is_correct": False},
                            {"option_text": "x² + 2x + 1 = 0", "is_correct": True},
                            {"option_text": "x³ + x = 0", "is_correct": False},
                            {"option_text": "2x = 8", "is_correct": False}
                        ]
                    }
                ]
            }
        ],
        "Geometry": [
            {
                "title": "Geometry Basics",
                "description": "Essential geometric concepts including shapes, angles, and area calculations.",
                "difficulty": "medium",
                "time_limit": 25,
                "questions": [
                    {
                        "question_text": "What is the sum of interior angles in a triangle?",
                        "options": [
                            {"option_text": "90°", "is_correct": False},
                            {"option_text": "180°", "is_correct": True},
                            {"option_text": "270°", "is_correct": False},
                            {"option_text": "360°", "is_correct": False}
                        ]
                    },
                    {
                        "question_text": "What is the area of a circle with radius 5?",
                        "options": [
                            {"option_text": "25π", "is_correct": True},
                            {"option_text": "10π", "is_correct": False},
                            {"option_text": "5π", "is_correct": False},
                            {"option_text": "15π", "is_correct": False}
                        ]
                    }
                ]
            }
        ]
    },
    "History": {
        "World History": [
            {
                "title": "Ancient Civilizations",
                "description": "Explore the history of ancient civilizations including Egypt, Greece, and Rome.",
                "difficulty": "medium",
                "time_limit": 30,
                "questions": [
                    {
                        "question_text": "Which ancient wonder of the world was located in Alexandria?",
                        "options": [
                            {"option_text": "Hanging Gardens", "is_correct": False},
                            {"option_text": "Lighthouse of Alexandria", "is_correct": True},
                            {"option_text": "Colossus of Rhodes", "is_correct": False},
                            {"option_text": "Statue of Zeus", "is_correct": False}
                        ]
                    },
                    {
                        "question_text": "Who was the first Roman Emperor?",
                        "options": [
                            {"option_text": "Julius Caesar", "is_correct": False},
                            {"option_text": "Augustus", "is_correct": True},
                            {"option_text": "Nero", "is_correct": False},
                            {"option_text": "Marcus Aurelius", "is_correct": False}
                        ]
                    }
                ]
            }
        ]
    },
    "Geography": {
        "World Geography": [
            {
                "title": "Countries and Capitals",
                "description": "Test your knowledge of world countries, capitals, and geographical features.",
                "difficulty": "easy",
                "time_limit": 15,
                "questions": [
                    {
                        "question_text": "What is the capital of Australia?",
                        "options": [
                            {"option_text": "Sydney", "is_correct": False},
                            {"option_text": "Melbourne", "is_correct": False},
                            {"option_text": "Canberra", "is_correct": True},
                            {"option_text": "Perth", "is_correct": False}
                        ]
                    },
                    {
                        "question_text": "Which is the largest continent by area?",
                        "options": [
                            {"option_text": "Africa", "is_correct": False},
                            {"option_text": "Asia", "is_correct": True},
                            {"option_text": "North America", "is_correct": False},
                            {"option_text": "Europe", "is_correct": False}
                        ]
                    }
                ]
            }
        ]
    }
}

# Additional quiz variations
QUIZ_VARIATIONS = [
    {
        "title": "Web Development Fundamentals",
        "description": "Essential concepts in HTML, CSS, and web development best practices.",
        "difficulty": "easy",
        "time_limit": 20,
        "questions": [
            {
                "question_text": "Which HTML tag is used to create a hyperlink?",
                "options": [
                    {"option_text": "<link>", "is_correct": False},
                    {"option_text": "<a>", "is_correct": True},
                    {"option_text": "<href>", "is_correct": False},
                    {"option_text": "<url>", "is_correct": False}
                ]
            },
            {
                "question_text": "What does CSS stand for?",
                "options": [
                    {"option_text": "Computer Style Sheets", "is_correct": False},
                    {"option_text": "Cascading Style Sheets", "is_correct": True},
                    {"option_text": "Creative Style System", "is_correct": False},
                    {"option_text": "Colorful Style Sheets", "is_correct": False}
                ]
            }
        ]
    },
    {
        "title": "Database Management Systems",
        "description": "Comprehensive quiz on SQL, database design, and DBMS concepts.",
        "difficulty": "hard",
        "time_limit": 35,
        "questions": [
            {
                "question_text": "Which SQL command is used to retrieve data from a database?",
                "options": [
                    {"option_text": "GET", "is_correct": False},
                    {"option_text": "SELECT", "is_correct": True},
                    {"option_text": "RETRIEVE", "is_correct": False},
                    {"option_text": "FETCH", "is_correct": False}
                ]
            },
            {
                "question_text": "What is a primary key in a database?",
                "options": [
                    {"option_text": "A key that opens the database", "is_correct": False},
                    {"option_text": "A unique identifier for each record", "is_correct": True},
                    {"option_text": "The first column in a table", "is_correct": False},
                    {"option_text": "A password for the database", "is_correct": False}
                ]
            }
        ]
    },
    {
        "title": "Machine Learning Basics",
        "description": "Introduction to machine learning algorithms, concepts, and applications.",
        "difficulty": "hard",
        "time_limit": 40,
        "questions": [
            {
                "question_text": "Which type of machine learning uses labeled training data?",
                "options": [
                    {"option_text": "Unsupervised Learning", "is_correct": False},
                    {"option_text": "Supervised Learning", "is_correct": True},
                    {"option_text": "Reinforcement Learning", "is_correct": False},
                    {"option_text": "Semi-supervised Learning", "is_correct": False}
                ]
            },
            {
                "question_text": "What is overfitting in machine learning?",
                "options": [
                    {"option_text": "Model performs well on training data but poorly on new data", "is_correct": True},
                    {"option_text": "Model performs poorly on all data", "is_correct": False},
                    {"option_text": "Model takes too long to train", "is_correct": False},
                    {"option_text": "Model uses too much memory", "is_correct": False}
                ]
            }
        ]
    }
]

async def connect_to_database():
    """Connect to MongoDB database."""
    client = AsyncIOMotorClient(MONGODB_URL)
    database = client[DATABASE_NAME]
    return database

async def create_quiz(db, quiz_data):
    """Create a single quiz in the database."""
    try:
        # Add metadata
        quiz_data["created_at"] = datetime.utcnow()
        quiz_data["created_by"] = "system"  # You can change this to an actual admin user ID

        result = await db.quizzes.insert_one(quiz_data)
        return result.inserted_id
    except Exception as e:
        print(f"Error creating quiz '{quiz_data.get('title', 'Unknown')}': {e}")
        return None

async def generate_quizzes():
    """Generate and insert 50 quizzes into the database."""
    db = await connect_to_database()

    quizzes_created = 0
    quiz_list = []

    # Collect all quiz templates
    for subject, subcategories in QUIZ_TEMPLATES.items():
        for subcategory, quizzes in subcategories.items():
            quiz_list.extend(quizzes)

    # Add variation quizzes
    quiz_list.extend(QUIZ_VARIATIONS)

    # Generate additional quizzes to reach 50
    while len(quiz_list) < 50:
        # Create variations of existing quizzes
        base_quiz = random.choice(quiz_list[:10])  # Pick from first 10 to avoid infinite recursion

        # Create a variation
        variation = base_quiz.copy()
        variation["title"] = f"{base_quiz['title']} - Advanced"
        variation["description"] = f"Advanced version: {base_quiz['description']}"

        # Modify difficulty
        difficulties = ["easy", "medium", "hard"]
        current_difficulty = variation.get("difficulty", "medium")
        if current_difficulty == "easy":
            variation["difficulty"] = "medium"
        elif current_difficulty == "medium":
            variation["difficulty"] = "hard"

        # Increase time limit
        if variation.get("time_limit"):
            variation["time_limit"] += 10

        quiz_list.append(variation)

    # Shuffle the quiz list
    random.shuffle(quiz_list)

    # Create quizzes in the database
    print(f"Creating {len(quiz_list[:50])} quizzes...")

    for i, quiz_data in enumerate(quiz_list[:50], 1):
        quiz_id = await create_quiz(db, quiz_data)
        if quiz_id:
            quizzes_created += 1
            print(f"✓ Created quiz {i}: '{quiz_data['title']}'")
        else:
            print(f"✗ Failed to create quiz {i}: '{quiz_data['title']}'")

    print(f"\n🎉 Successfully created {quizzes_created} out of 50 quizzes!")

    # Print summary
    difficulties = {}
    subjects = {}

    for quiz in quiz_list[:50]:
        diff = quiz.get("difficulty", "medium")
        difficulties[diff] = difficulties.get(diff, 0) + 1

        # Extract subject from title (simple heuristic)
        title = quiz["title"].lower()
        if "python" in title or "javascript" in title or "web" in title or "database" in title or "machine learning" in title:
            subjects["Programming/Tech"] = subjects.get("Programming/Tech", 0) + 1
        elif "physics" in title or "chemistry" in title:
            subjects["Science"] = subjects.get("Science", 0) + 1
        elif "algebra" in title or "geometry" in title:
            subjects["Mathematics"] = subjects.get("Mathematics", 0) + 1
        elif "history" in title or "ancient" in title:
            subjects["History"] = subjects.get("History", 0) + 1
        elif "geography" in title or "countries" in title:
            subjects["Geography"] = subjects.get("Geography", 0) + 1
        else:
            subjects["Mixed"] = subjects.get("Mixed", 0) + 1

    print("\n📊 Quiz Summary:")
    print("Difficulty Distribution:")
    for difficulty, count in difficulties.items():
        print(f"  {difficulty.capitalize()}: {count} quizzes")

    print("\nSubject Distribution:")
    for subject, count in subjects.items():
        print(f"  {subject}: {count} quizzes")

async def main():
    """Main function to run the quiz creation script."""
    print("🚀 Starting Quiz Creation Script...")
    print("=" * 50)

    try:
        await generate_quizzes()
        print("\n✅ Quiz creation completed successfully!")
    except Exception as e:
        print(f"\n❌ Error occurred: {e}")
    finally:
        print("\n" + "=" * 50)
        print("Script execution finished.")

if __name__ == "__main__":
    # Run the script
    asyncio.run(main())
