import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { quizService } from '../../services/quizService';
import toast from 'react-hot-toast';

const EditQuiz = () => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  const { register, control, handleSubmit, formState: { errors }, watch, reset } = useForm({
    defaultValues: {
      title: '',
      description: '',
      time_limit: '',
      difficulty: 'medium',
      is_active: true,
      questions: []
    }
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'questions'
  });

  useEffect(() => {
    fetchQuizData();
  }, [id]);

  const fetchQuizData = async () => {
    try {
      const [quizResult, questionsResult] = await Promise.all([
        quizService.getQuizById(id),
        quizService.getQuizQuestions(id)
      ]);

      if (quizResult.success && questionsResult.success) {
        const quizData = quizResult.data;
        const questionsData = questionsResult.data;

        reset({
          title: quizData.title,
          description: quizData.description,
          time_limit: quizData.time_limit?.toString() || '',
          difficulty: quizData.difficulty || 'medium',
          is_active: quizData.is_active,
          questions: questionsData.map(q => ({
            id: q.id,
            question_text: q.question_text,
            question_type: q.question_type,
            options: q.options || [
              { option_text: '', is_correct: true },
              { option_text: '', is_correct: false }
            ]
          }))
        });

        replace(questionsData.map(q => ({
          id: q.id,
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.options || [
            { option_text: '', is_correct: true },
            { option_text: '', is_correct: false }
          ]
        })));
      } else {
        toast.error('Failed to load quiz data');
        navigate('/admin/quizzes');
      }
    } catch (error) {
      toast.error('Failed to load quiz data');
      navigate('/admin/quizzes');
    } finally {
      setInitialLoading(false);
    }
  };

  const addQuestion = () => {
    append({
      question_text: '',
      question_type: 'multiple_choice',
      options: [
        { option_text: '', is_correct: true },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false }
      ]
    });
  };

  const setCorrectAnswer = (questionIndex, optionIndex) => {
    const currentOptions = watch(`questions.${questionIndex}.options`);
    const newOptions = currentOptions.map((option, index) => ({
      ...option,
      is_correct: index === optionIndex
    }));
    // This would need to be handled differently in a real implementation
    // For now, we'll use a workaround
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Validate that each question has at least one correct answer
      const invalidQuestions = data.questions.filter(q =>
        !q.options.some(opt => opt.is_correct)
      );

      if (invalidQuestions.length > 0) {
        toast.error('Each question must have at least one correct answer');
        setLoading(false);
        return;
      }

      const quizData = {
        ...data,
        time_limit: data.time_limit ? parseInt(data.time_limit) : null
      };

      const result = await quizService.updateQuiz(id, quizData);
      if (result.success) {
        toast.success('Quiz updated successfully!');
        navigate('/admin/quizzes');
      } else {
        toast.error(result.error || 'Failed to update quiz');
      }
    } catch (error) {
      toast.error('Failed to update quiz');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/quizzes')}
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quizzes
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Quiz</h1>
        <p className="text-gray-600 mt-2">Update quiz information and questions</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Quiz Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quiz Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quiz Title *
              </label>
              <input
                {...register('title', { required: 'Quiz title is required' })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter quiz title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter quiz description"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Limit (minutes)
              </label>
              <input
                {...register('time_limit')}
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Leave empty for no time limit"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                {...register('difficulty')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  {...register('is_active')}
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Quiz is active</span>
              </label>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Questions</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </button>
          </div>

          <div className="space-y-8">
            {fields.map((field, questionIndex) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Question {questionIndex + 1}
                  </h3>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(questionIndex)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text *
                  </label>
                  <textarea
                    {...register(`questions.${questionIndex}.question_text`, {
                      required: 'Question text is required'
                    })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your question"
                  />
                  {errors.questions?.[questionIndex]?.question_text && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.questions[questionIndex].question_text.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Answer Options
                  </label>
                  <div className="space-y-2">
                    {watch(`questions.${questionIndex}.options`)?.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={`question-${questionIndex}-correct`}
                          {...register(`questions.${questionIndex}.options.${optionIndex}.is_correct`)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <input
                          {...register(`questions.${questionIndex}.options.${optionIndex}.option_text`, {
                            required: 'Option text is required'
                          })}
                          type="text"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={`Option ${optionIndex + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/quizzes')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Updating...' : 'Update Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditQuiz;
