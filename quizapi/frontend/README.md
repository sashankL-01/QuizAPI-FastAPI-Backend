# QuizAPI Frontend

A modern React frontend application for the QuizAPI platform built with React, TailwindCSS, and modern best practices.

## 🚀 Features

- **User Authentication**: Login, registration, and JWT-based authentication
- **Quiz Management**: Browse, take, and review quizzes
- **Real-time Progress Tracking**: Monitor quiz progress and scores
- **Admin Panel**: Complete admin interface for managing quizzes, questions, and users
- **Responsive Design**: Mobile-first design with TailwindCSS
- **Modern UI/UX**: Clean, intuitive interface with smooth animations

## 🛠️ Tech Stack

- **Frontend Framework**: React 18
- **Styling**: TailwindCSS
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Form Handling**: React Hook Form
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📦 Installation

1. **Navigate to frontend directory**:
   ```bash
   cd quizapi/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the frontend directory:
   ```env
   REACT_APP_API_URL=http://localhost:8000
   ```

4. **Start development server**:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`

## 🔧 Available Scripts

- `npm start` - Start development server
- `npm build` - Build production bundle
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## 📁 Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/          # Reusable components
│   │   ├── AdminRoute.js
│   │   ├── Navbar.js
│   │   └── ProtectedRoute.js
│   ├── contexts/           # React contexts
│   │   └── AuthContext.js
│   ├── pages/              # Page components
│   │   ├── Home.js
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── Dashboard.js
│   │   ├── QuizList.js
│   │   ├── QuizDetail.js
│   │   ├── TakeQuiz.js
│   │   ├── QuizResults.js
│   │   ├── Profile.js
│   │   └── admin/          # Admin pages
│   │       ├── AdminDashboard.js
│   │       ├── ManageQuizzes.js
│   │       ├── ManageQuestions.js
│   │       ├── ManageUsers.js
│   │       ├── CreateQuiz.js
│   │       └── EditQuiz.js
│   ├── services/           # API services
│   │   ├── api.js
│   │   ├── authService.js
│   │   └── quizService.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## 🎨 Key Features

### User Features
- **Home Page**: Landing page with feature overview
- **Authentication**: Secure login and registration
- **Dashboard**: Personal progress tracking and statistics
- **Quiz Taking**: Interactive quiz interface with timer
- **Results**: Detailed quiz results with explanations
- **Profile Management**: User profile and password management

### Admin Features
- **Admin Dashboard**: Overview of platform statistics
- **Quiz Management**: Create, edit, and delete quizzes
- **Question Management**: Manage quiz questions and answers
- **User Management**: View and manage user accounts

### Technical Features
- **Responsive Design**: Works on all device sizes
- **Protected Routes**: Role-based access control
- **Token Management**: Automatic token refresh
- **Error Handling**: Comprehensive error handling
- **Loading States**: User-friendly loading indicators

## 🔐 Authentication Flow

1. Users register/login through secure forms
2. JWT tokens are stored in HTTP-only cookies
3. Automatic token refresh on expiration
4. Role-based route protection (Admin/User)

## 🎯 Usage

### For Regular Users
1. Register for a new account or login
2. Browse available quizzes
3. Take quizzes with real-time progress tracking
4. View detailed results and explanations
5. Track progress on personal dashboard

### For Administrators
1. Access admin panel from navigation
2. Create and manage quizzes
3. Add/edit questions and answers
4. Monitor user activity and statistics
5. Manage user accounts

## 🚀 Production Build

To create a production build:

```bash
npm run build
```

This creates an optimized build in the `build/` directory ready for deployment.

## 🌐 API Integration

The frontend integrates with the FastAPI backend through:
- RESTful API endpoints
- JWT authentication
- Automatic error handling
- Request/response interceptors

## 📱 Responsive Design

Built with mobile-first approach:
- Optimized for phones, tablets, and desktops
- Touch-friendly interface
- Adaptive layouts and components

## 🎨 UI Components

Custom styled components using TailwindCSS:
- Form inputs and validation
- Navigation and menus
- Cards and modals
- Progress indicators
- Interactive quiz interface

## 🔧 Development

### Adding New Features
1. Create components in appropriate directories
2. Add routes in `App.js`
3. Implement API services
4. Add proper error handling

### Styling Guidelines
- Use TailwindCSS utility classes
- Follow established color scheme
- Maintain consistent spacing
- Ensure responsive design

## 📄 License

This project is part of the QuizAPI platform. See the main project README for license information.

## 🤝 Contributing

Please see the main project README for contribution guidelines.
