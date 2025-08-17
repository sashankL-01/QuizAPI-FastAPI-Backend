# QuizAPI – RESTful Quiz & Assessment API using FastAPI

<p align="center">
  <img src="https://fastapi.tiangolo.com/img/logo-margin/logo-teal.png" alt="FastAPI Logo" width="200"/>
</p>

**QuizAPI** is a comprehensive backend application built using **FastAPI** that provides APIs for managing quizzes, questions, and user attempts. This project is ideal for placement preparation tools, educational platforms, or coding practice platforms.

## 📋 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [API Documentation](#-api-documentation)
- [Authentication](#-authentication)
- [User Management](#-user-management)
- [Database](#-database)
- [Frontend Integration](#-frontend-integration)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Features

- **User Management**
  - User registration and authentication (JWT-based)
  - Profile management
  - Role-based access control (User/Admin)
  - Password security with bcrypt hashing

- **Quiz Management**
  - Create, read, update, delete (CRUD) operations for quizzes
  - Quiz listing with pagination and filtering
  - Multiple question types support
  - Quiz metadata (time limits, difficulty levels)

- **Question Management**
  - CRUD operations for questions
  - Multiple-choice question support
  - Question bank organization

- **Attempt Tracking**
  - Track and store user quiz attempts
  - Score calculation and analytics
  - Performance history and statistics
  - Time tracking for quiz completion

- **Admin Panel**
  - User management interface
  - Quiz and question administration
  - Statistics and reporting
  - System configuration

- **API Features**
  - RESTful API design
  - JWT authentication
  - CORS support for frontend integration
  - Comprehensive API documentation with Swagger/ReDoc

## 🧰 Tech Stack

- **Backend Framework:** FastAPI
- **Language:** Python 3.11+
- **Authentication:** JWT-based (python-jose)
- **Password Hashing:** Bcrypt (passlib)
- **Database:** MongoDB (with Motor for async operations)
- **API Documentation:** Swagger UI / ReDoc (built into FastAPI)
- **Validation:** Pydantic
- **Environment Management:** python-dotenv
- **Frontend:** React with Vite (optional)
- **Deployment Options:** Render / Railway / Deta

## 📂 Project Structure

```
quizapi/
├── app/                  # Main application
│   ├── auth/             # Authentication module
│   ├── db/               # Database connections and operations
│   ├── models/           # Pydantic models for data representation
│   ├── routes/           # API routes and endpoints
│   ├── schemas/          # Pydantic schemas for request/response validation
│   ├── utils/            # Utility functions and helpers
│   └── main.py           # FastAPI application entry point
├── frontend/             # React frontend (optional)
│   ├── src/              # Source code
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # React contexts
│   │   ├── pages/        # Page components
│   │   └── services/     # API services
│   └── package.json      # Frontend dependencies
└── tests/                # Test suite
    └── test_routes.py    # API route tests
```

## 🚦 Getting Started

### Prerequisites

- Python 3.11 or later
- MongoDB (local installation or cloud instance)
- Node.js and npm (for frontend)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/QuizAPI-FastAPI-Backend.git
   cd QuizAPI-FastAPI-Backend
   ```

2. Set up a virtual environment:
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Install frontend dependencies (optional):
   ```bash
   cd quizapi/frontend
   npm install
   ```

### Environment Variables

#### Backend Environment Variables
Create a `.env` file in the project root with the following variables:

```
MONGODB_URL=mongodb://localhost:27017
MONGODB_DATABASE=quizdb
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=true
ENVIRONMENT=development
```

#### Frontend Environment Variables
Create a `.env` file in the `quizapi/frontend` directory with the following variables:

```
REACT_APP_API_URL=http://localhost:8000
```

This configures the frontend to connect to your local backend instance. Modify this URL for production deployments.

### Running the Application

1. Start the backend server:
   ```bash
   cd quizapi
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. Start the frontend development server (optional):
   ```bash
   cd quizapi/frontend
   npm run dev
   ```

3. Initialize the database (first time only):
   ```bash
   python -m quizapi.app.db.init_db
   ```

4. Create sample quizzes (optional):
   ```bash
   python create_sample_quizzes.py
   ```

The API will be available at http://localhost:8000 and the frontend at http://localhost:5173.

## 📚 API Documentation

The API documentation is automatically generated and available at:

- **Swagger UI**: `/docs` - Interactive API documentation
- **ReDoc**: `/redoc` - Alternative API documentation

### Key Endpoints

- **Authentication**
  - `POST /api/auth/register` - Register a new user
  - `POST /api/auth/login` - Login and get JWT tokens
  - `POST /api/auth/refresh` - Refresh access token
  - `POST /api/auth/change-password` - Change user password

- **User Management**
  - `GET /api/users/me` - Get current user profile
  - `PUT /api/users/me` - Update user profile
  - `GET /api/users/me/attempts` - Get user's quiz attempts
  - `GET /api/users/me/stats` - Get user statistics

- **Quiz Management**
  - `GET /api/quizzes/` - List all quizzes
  - `GET /api/quizzes/{quiz_id}` - Get quiz details
  - `POST /api/quizzes/` - Create a new quiz
  - `PUT /api/quizzes/{quiz_id}` - Update a quiz
  - `DELETE /api/quizzes/{quiz_id}` - Delete a quiz

- **Question Management**
  - `GET /api/questions/` - List all questions
  - `POST /api/questions/` - Create a new question
  - `PUT /api/questions/{question_id}` - Update a question
  - `DELETE /api/questions/{question_id}` - Delete a question

- **Attempt Management**
  - `POST /api/attempts/` - Create a new quiz attempt
  - `GET /api/attempts/{attempt_id}` - Get attempt details
  - `GET /api/attempts/quiz/{quiz_id}` - Get attempts for a quiz

- **Admin Panel**
  - `GET /api/admin/users/` - Get all users
  - `GET /api/admin/users/stats` - Get user statistics
  - `PUT /api/admin/users/{user_id}/toggle-active` - Toggle user active status

## 💾 Database

The application uses MongoDB with the following collections:

- **users**: User accounts and profiles
- **quizzes**: Quiz details and metadata
- **questions**: Question bank
- **attempts**: User quiz attempts and scores

The database connections are managed asynchronously using Motor, the async driver for MongoDB.

## 🔄 Frontend Integration

The project includes an optional React frontend built with:

- **React**: UI framework
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **React Router**: Navigation
- **Context API**: State management

The frontend communicates with the backend API using fetch or axios and includes:

- User authentication flow
- Quiz listing and details
- Quiz-taking interface
- Results and statistics display
- Admin dashboard (for admin users)

## 👨‍💻 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Contributors

- [sashankL-01](https://github.com/sashankL-01)
