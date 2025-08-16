import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { quizService } from '../../services/quizService';
import toast from 'react-hot-toast';

const CreateQuiz = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, control, handleSubmit, formState: { errors }, getValues } = useForm({
    defaultValues: {
      title: '',
      description: '',
      time_limit: '',
      difficulty: 'medium',
      questions: [
        {
          question_text: '',
          options: [
            { option_text: '', is_correct: true },
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false }
          ]
        }
      ]
    }
  });

  const { fields, append, remove: removeQuestion, update } = useFieldArray({
    control,
    name: 'questions'
  });

  // Correctly adds an option without erasing other data
  const addOption = (questionIndex) => {
    const question = getValues(`questions.${questionIndex}`);
    if (question.options.length < 6) {
      update(questionIndex, {
        ...question, // This line preserves the existing question text
        options: [...question.options, { option_text: '', is_correct: false }]
      });
    }
  };

  // Correctly removes an option without erasing other data
  const removeOption = (questionIndex, optionIndex) => {
    const question = getValues(`questions.${questionIndex}`);
    if (question.options.length > 2) {
      const newOptions = question.options.filter((_, index) => index !== optionIndex);
      if (question.options[optionIndex].is_correct && newOptions.length > 0 && !newOptions.some(opt => opt.is_correct)) {
        newOptions[0].is_correct = true;
      }
      update(questionIndex, {
        ...question, // This line preserves the existing question text
        options: newOptions
      });
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const invalidQuestions = data.questions.filter(q => !q.options.some(opt => opt.is_correct));
      if (invalidQuestions.length > 0) {
        toast.error('Each question must have a correct answer.');
        setLoading(false);
        return;
      }
      const quizData = {
        ...data,
        time_limit: data.time_limit ? parseInt(data.time_limit) : null
      };
      const result = await quizService.createQuiz(quizData);
      if (result.success) {
        toast.success('Quiz created successfully!');
        navigate('/admin/quizzes');
      } else {
        toast.error(result.error || 'Failed to create quiz');
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Create New Quiz</h1>
          <p className="text-gray-600 mt-2">Create an interactive quiz with multiple choice questions</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* --- START: Previously Missing Code --- */}
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
            </div>
          </div>
          {/* --- END: Previously Missing Code --- */}

          {/* Questions */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Questions</h2>
              <button
                  type="button"
                  onClick={() => append({ question_text: '', options: [{ option_text: '', is_correct: true }, { option_text: '', is_correct: false }] })}
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
                              onClick={() => removeQuestion(questionIndex)}
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
                        <Controller
                            control={control}
                            name={`questions.${questionIndex}.options`}
                            render={({ field }) => (
                                <>
                                  {field.value.map((option, optionIndex) => (
                                      <div key={optionIndex} className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name={`question-${questionIndex}-correct`}
                                            checked={option.is_correct}
                                            onChange={() => {
                                              const newOptions = field.value.map((opt, idx) => ({ ...opt, is_correct: idx === optionIndex }));
                                              field.onChange(newOptions);
                                            }}
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
                                        {field.value.length > 2 && (
                                            <button
                                                type="button"
                                                onClick={() => removeOption(questionIndex, optionIndex)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                      </div>
                                  ))}
                                </>
                            )}
                        />
                      </div>

                      {fields[questionIndex].options.length < 6 && (
                          <button
                              type="button"
                              onClick={() => addOption(questionIndex)}
                              className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                          >
                            + Add Option
                          </button>
                      )}
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
              {loading ? 'Creating...' : 'Create Quiz'}
            </button>
          </div>
        </form>
      </div>
  );
};

export default CreateQuiz;