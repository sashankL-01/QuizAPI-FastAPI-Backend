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

## 🚀 Deployment

The QuizAPI application can be deployed using various cloud platforms and services. Here are instructions for deploying both the backend and frontend components:

### Backend Deployment Options

#### Option 1: Deploy on Render

1. Sign up for a [Render](https://render.com/) account if you don't have one.
2. Create a new Web Service and connect your GitHub repository.
3. Configure the service with the following settings:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `cd quizapi && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Environment Variables**: Add all the variables from your `.env` file
   - **Plan**: Choose an appropriate plan (the "Starter" plan is good for testing)

4. Set up a MongoDB database:
   - Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for a managed MongoDB solution
   - Create a new cluster and database
   - Update your `MONGODB_URL` and `MONGODB_DATABASE` environment variables in Render

#### Option 2: Deploy on Railway

1. Create a [Railway](https://railway.app/) account.
2. Create a new project and connect your GitHub repository.
3. Add a MongoDB plugin from the Railway dashboard.
4. Configure the service:
   - **Start Command**: `cd quizapi && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Environment Variables**: Add all variables from your `.env` file
   - Railway will automatically provide the `PORT` variable

#### Option 3: Deploy on Deta

1. Sign up for [Deta](https://www.deta.sh/) if you haven't already.
2. Install the Deta CLI: `curl -fsSL https://get.deta.dev/cli.sh | sh`
3. Login to Deta: `deta login`
4. Initialize and deploy:
   ```bash
   cd quizapi
   deta new --python
   deta deploy
   ```
5. Set environment variables: `deta update -e .env`

### Frontend Deployment

#### Option 1: Deploy on Vercel

1. Sign up for a [Vercel](https://vercel.com/) account.
2. Install the Vercel CLI: `npm i -g vercel`
3. Navigate to the frontend directory: `cd quizapi/frontend`
4. Build the frontend: `npm run build`
5. Deploy to Vercel: `vercel`
6. Set environment variables in the Vercel dashboard:
   - `REACT_APP_API_URL`: The URL of your deployed backend API

#### Option 2: Deploy on Netlify

1. Sign up for [Netlify](https://www.netlify.com/).
2. Install Netlify CLI: `npm install -g netlify-cli`
3. Build the frontend: 
   ```bash
   cd quizapi/frontend
   npm run build
   ```
4. Deploy to Netlify: `netlify deploy`
5. Configure environment variables in the Netlify dashboard.

### Docker Deployment

You can also use Docker to containerize and deploy your application:

1. Create a `Dockerfile` in the project root:
   ```dockerfile
   FROM python:3.11-slim

   WORKDIR /app

   COPY quizapi/requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt

   COPY . .

   CMD ["uvicorn", "quizapi.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
   ```

2. Build the Docker image:
   ```bash
   docker build -t quizapi .
   ```

3. Run the container:
   ```bash
   docker run -p 8000:8000 --env-file .env quizapi
   ```

4. For deploying with Docker Compose (with MongoDB):
   Create a `docker-compose.yml` file:
   ```yaml
   version: '3'
   services:
     api:
       build: .
       ports:
         - "8000:8000"
       env_file: .env
       depends_on:
         - mongo
     mongo:
       image: mongo:latest
       ports:
         - "27017:27017"
       volumes:
         - mongodb_data:/data/db

   volumes:
     mongodb_data:
   ```

5. Run with Docker Compose:
   ```bash
   docker-compose up -d
   ```

### Connecting Frontend and Backend

For production deployment, ensure that:

1. The backend API is accessible from the frontend (CORS settings)
2. The frontend environment variable `REACT_APP_API_URL` points to the deployed backend
3. Update the `CORS_ORIGINS` in your backend configuration to include your frontend domain

### Continuous Integration/Deployment

Set up CI/CD using GitHub Actions for automated testing and deployment:

1. Create a `.github/workflows/main.yml` file:
   ```yaml
   name: CI/CD Pipeline

   on:
     push:
       branches: [ main ]
     pull_request:
       branches: [ main ]

   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Set up Python
           uses: actions/setup-python@v4
           with:
             python-version: '3.11'
         - name: Install dependencies
           run: pip install -r requirements.txt
         - name: Run tests
           run: pytest

     deploy:
       needs: test
       runs-on: ubuntu-latest
       if: github.ref == 'refs/heads/main'
       steps:
         - uses: actions/checkout@v3
         # Add deployment steps for your chosen platform
         # Example for Railway:
         - name: Install Railway
           run: npm i -g @railway/cli
         - name: Deploy to Railway
           run: railway up
           env:
             RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
   ```

Remember to:
- Set up environment variables in your deployment platform
- Configure database connections properly
- Set up proper CORS settings
- Secure your API endpoints in production

## 👨‍💻 Contributors

- [sashankL-01](https://github.com/sashankL-01)