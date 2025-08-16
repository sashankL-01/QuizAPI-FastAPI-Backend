import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { Award, Clock, CheckCircle, XCircle } from 'lucide-react'
import { quizService } from '../services/quizService'
import toast from 'react-hot-toast'

const QuizResults = () => {
  const { id: quizId } = useParams()
  const [searchParams] = useSearchParams()
  const attemptId = searchParams.get('attempt')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchResults = useCallback(async () => {
    try {
      const resultsData = await quizService.getQuizResults(attemptId)
      setResults(resultsData)
    } catch (error) {
      toast.error('Failed to load quiz results')
    } finally {
      setLoading(false)
    }
  }, [attemptId])

  useEffect(() => {
    if (attemptId) {
      fetchResults()
    }
  }, [attemptId, fetchResults])

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Results not found</h3>
        <Link to="/quizzes" className="text-blue-600 hover:underline">
          Back to quizzes
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Results Header */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className={`${getScoreBgColor(results.score)} p-8 text-center`}>
          <div className="flex justify-center mb-4">
            <Award className={`h-16 w-16 ${getScoreColor(results.score)}`} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Completed!</h1>
          <p className="text-xl text-gray-700">{results.quiz_title}</p>
        </div>

        <div className="p-8">
          {/* Score Display */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getScoreBgColor(results.score)} mb-4`}>
              <span className={`text-4xl font-bold ${getScoreColor(results.score)}`}>
                {Math.round(results.score)}%
              </span>
            </div>
            <p className="text-lg text-gray-600">Your Score</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{results.correct_answers}</p>
              <p className="text-gray-600">Correct</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-2">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{results.incorrect_answers}</p>
              <p className="text-gray-600">Incorrect</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {results.time_taken ? `${Math.round(results.time_taken / 60)}m` : 'N/A'}
              </p>
              <p className="text-gray-600">Time Taken</p>
            </div>
          </div>

          {/* Performance Message */}
          <div className="text-center mb-8">
            <div className={`inline-block px-6 py-3 rounded-lg ${getScoreBgColor(results.score)}`}>
              <p className={`font-semibold ${getScoreColor(results.score)}`}>
                {results.score >= 80
                  ? '🎉 Excellent work! You have a strong understanding of the material.'
                  : results.score >= 60
                  ? '👍 Good job! You have a solid grasp of most concepts.'
                  : '📚 Keep studying! Review the material and try again when ready.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Question Review */}
      {results.question_results && (
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Question Review</h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {results.question_results.map((question, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-lg font-medium text-gray-900 flex-1">
                      {index + 1}. {question.question_text}
                    </h4>
                    <div className="ml-4">
                      {question.is_correct ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-600 w-24">Your answer:</span>
                      <span className={`text-sm ${question.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                        {question.user_answer || 'Not answered'}
                      </span>
                    </div>
                    {!question.is_correct && (
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-600 w-24">Correct answer:</span>
                        <span className="text-sm text-green-600">{question.correct_answer}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="text-center space-x-4">
        <Link
          to="/quizzes"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Browse More Quizzes
        </Link>
        <Link
          to="/dashboard"
          className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition duration-200"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default QuizResults
