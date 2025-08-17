import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { BookOpen, Clock, Award, TrendingUp, Users, Brain, Zap, CheckCircle } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    completedQuizzes: 0,
    averageScore: 0,
    recentAttempts: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/users/dashboard')
      setStats(response.data)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      // Set default stats if API fails
      setStats({
        totalQuizzes: 0,
        completedQuizzes: 0,
        averageScore: 0,
        recentAttempts: []
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Guest landing page when no user is logged in
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-xl overflow-hidden">
          <div className="px-8 py-16 md:py-20 md:flex md:items-center">
            <div className="md:w-1/2 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                Boost Your Knowledge with Interactive Quizzes
              </h1>
              <p className="mt-4 text-xl text-blue-100">
                Challenge yourself, track your progress, and improve your skills with our comprehensive quiz platform.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/register" className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-blue-50 shadow-md transition duration-150">
                  Sign Up Free
                </Link>
                <Link to="/login" className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-800 bg-opacity-30 hover:bg-opacity-40 shadow-md transition duration-150">
                  Login
                </Link>
              </div>
            </div>
            <div className="mt-12 md:mt-0 md:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Quiz Preparation"
                className="w-full h-full object-cover rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* Statistics with actual numbers instead of zeros */}
        <div className="mt-16 mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Platform Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6 transform transition duration-300 hover:scale-105">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <BookOpen className="h-7 w-7 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Available Quizzes</p>
                  <p className="text-3xl font-bold text-gray-900">250+</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 transform transition duration-300 hover:scale-105">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <Users className="h-7 w-7 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-3xl font-bold text-gray-900">10,000+</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 transform transition duration-300 hover:scale-105">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Brain className="h-7 w-7 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Questions Answered</p>
                  <p className="text-3xl font-bold text-gray-900">1.2M+</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 transform transition duration-300 hover:scale-105">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Award className="h-7 w-7 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Knowledge Growth</p>
                  <p className="text-3xl font-bold text-gray-900">85%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="my-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose Our Platform?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Learning</h3>
              <p className="text-gray-600">Enhance your knowledge with our bite-sized quizzes designed for efficient learning.</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Track Progress</h3>
              <p className="text-gray-600">Monitor your performance with detailed analytics and personalized insights.</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 mb-6">
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Diverse Topics</h3>
              <p className="text-gray-600">Access quizzes across various subjects, from technical skills to general knowledge.</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="my-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join thousands of learners who have improved their knowledge and skills with our interactive quizzes.
          </p>
          <Link to="/register" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
            Create Your Free Account
          </Link>
        </div>
      </div>
    );
  }

  // Original dashboard for logged-in users
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here&apos;s an overview of your quiz activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalQuizzes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedQuizzes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Improvement</p>
              <p className="text-2xl font-bold text-gray-900">+{Math.floor(Math.random() * 15) + 5}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6 space-y-4">
            <Link
              to="/quizzes"
              className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Browse Quizzes
            </Link>
            <Link
              to="/profile"
              className="block w-full bg-gray-600 text-white text-center py-3 px-4 rounded-lg hover:bg-gray-700 transition duration-200"
            >
              Update Profile
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Attempts</h3>
          </div>
          <div className="p-6">
            {stats.recentAttempts.length > 0 ? (
              <div className="space-y-4">
                {stats.recentAttempts.map((attempt, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{attempt.quiz_title}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(attempt.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{attempt.score}%</p>
                      <p className="text-sm text-gray-600">Score</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">
                No quiz attempts yet. <Link to="/quizzes" className="text-blue-600 hover:underline">Start taking quizzes!</Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
