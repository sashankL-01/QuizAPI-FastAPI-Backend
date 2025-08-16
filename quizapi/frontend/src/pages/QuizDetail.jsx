import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Clock, Users, BookOpen, Play, ArrowLeft } from 'lucide-react'
import { quizService } from '../services/quizService'
import toast from 'react-hot-toast'

const QuizDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchQuizDetail = useCallback(async () => {
    try {
      const quizData = await quizService.getQuizById(id)
      setQuiz(quizData)
    } catch (error) {
      toast.error('Failed to load quiz details')
      navigate('/quizzes')
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => {
    fetchQuizDetail()
  }, [fetchQuizDetail])

  const handleStartQuiz = () => {
    navigate(`/quiz/${id}/take`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Quiz not found</h3>
        <Link to="/quizzes" className="text-blue-600 hover:underline">
          Back to quizzes
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link
        to="/quizzes"
        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Quizzes
      </Link>

      {/* Quiz Header */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
          <div className="flex items-center mb-4">
            <BookOpen className="h-8 w-8 mr-3" />
            <h1 className="text-3xl font-bold">{quiz.title}</h1>
          </div>
          <p className="text-blue-100 text-lg">{quiz.description}</p>
        </div>

        <div className="p-8">
          {/* Quiz Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Questions</p>
                <p className="text-2xl font-bold text-gray-900">{quiz.question_count || 0}</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg mr-4">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Time Limit</p>
                <p className="text-2xl font-bold text-gray-900">
                  {quiz.time_limit ? `${quiz.time_limit} min` : 'No limit'}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg mr-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Difficulty</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">
                  {quiz.difficulty || 'Medium'}
                </p>
              </div>
            </div>
          </div>

          {/* Quiz Instructions */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="space-y-2 text-gray-700">
                <li>• Read each question carefully before selecting your answer</li>
                <li>• You can change your answers before submitting</li>
                {quiz.time_limit && (
                  <li>• You have {quiz.time_limit} minutes to complete this quiz</li>
                )}
                <li>• Once submitted, you cannot retake this quiz</li>
                <li>• Your results will be available immediately after submission</li>
              </ul>
            </div>
          </div>

          {/* Start Quiz Button */}
          <div className="text-center">
            {quiz.is_active ? (
              <button
                onClick={handleStartQuiz}
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition duration-200"
              >
                <Play className="h-6 w-6 mr-3" />
                Start Quiz
              </button>
            ) : (
              <div className="text-center">
                <p className="text-red-600 font-medium mb-4">This quiz is currently inactive</p>
                <Link
                  to="/quizzes"
                  className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition duration-200"
                >
                  Browse Other Quizzes
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuizDetail
