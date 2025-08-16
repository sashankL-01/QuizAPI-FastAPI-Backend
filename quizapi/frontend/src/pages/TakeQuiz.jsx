import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Clock, ChevronLeft, ChevronRight, Send } from 'lucide-react'
import { quizService } from '../services/quizService'
import toast from 'react-hot-toast'

const TakeQuiz = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const fetchQuizData = useCallback(async () => {
    try {
      const [quizData, questionsData] = await Promise.all([
        quizService.getQuizById(id),
        quizService.getQuizQuestions(id)
      ])
      setQuiz(quizData)
      setQuestions(questionsData)
    } catch (error) {
      toast.error('Failed to load quiz')
      navigate('/quizzes')
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  const handleSubmitQuiz = useCallback(async () => {
    if (submitting) return

    setSubmitting(true)
    try {
      const result = await quizService.submitQuizAttempt(id, answers)
      toast.success('Quiz submitted successfully!')
      navigate(`/quiz/${id}/results/${result.data.attempt_id}`)
    } catch (error) {
      toast.error('Failed to submit quiz')
      setSubmitting(false)
    }
  }, [id, answers, submitting, navigate])

  useEffect(() => {
    fetchQuizData()
  }, [fetchQuizData])

  useEffect(() => {
    if (quiz?.time_limit && timeLeft === null) {
      setTimeLeft(quiz.time_limit * 60) // Convert to seconds
    }
  }, [quiz, timeLeft])

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      handleSubmitQuiz()
    }
  }, [timeLeft, handleSubmitQuiz])

  const handleAnswerChange = (questionId, answerId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }))
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getAnsweredCount = () => {
    return Object.keys(answers).length
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Quiz not available</h3>
        <button
          onClick={() => navigate('/quizzes')}
          className="text-blue-600 hover:underline"
        >
          Back to quizzes
        </button>
      </div>
    )
  }

  const currentQ = questions[currentQuestion]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="text-gray-600">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>
          <div className="text-right">
            {timeLeft !== null && (
              <div className="flex items-center text-lg font-semibold">
                <Clock className="h-5 w-5 mr-2 text-gray-500" />
                <span className={timeLeft < 300 ? 'text-red-600' : 'text-gray-900'}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
            <p className="text-sm text-gray-600 mt-1">
              {getAnsweredCount()} of {questions.length} answered
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-lg shadow p-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {currentQ.question_text}
          </h2>

          <div className="space-y-3">
            {currentQ.options?.map((option) => (
              <label
                key={option.id}
                className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="radio"
                  name={`question-${currentQ.id}`}
                  value={option.id}
                  checked={answers[currentQ.id] === option.id}
                  onChange={() => handleAnswerChange(currentQ.id, option.id)}
                  className="mr-4 text-blue-600"
                />
                <span className="text-gray-900">{option.option_text}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="flex items-center px-6 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </button>

          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              disabled={submitting || getAnsweredCount() === 0}
              className="flex items-center px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4 mr-2" />
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </button>
          )}
        </div>
      </div>

      {/* Question Navigator */}
      <div className="bg-white rounded-lg shadow mt-6 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Navigator</h3>
        <div className="grid grid-cols-10 gap-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                index === currentQuestion
                  ? 'bg-blue-600 text-white'
                  : answers[questions[index].id]
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TakeQuiz
