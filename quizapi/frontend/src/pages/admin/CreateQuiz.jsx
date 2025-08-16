import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Save, Check, Square } from 'lucide-react';
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
        toast.error('Each question must have at least one correct answer.');
        setLoading(false);
        return;
      }
      const quizData = {
        title: data.title,
        description: data.description,
        time_limit: data.time_limit ? parseInt(data.time_limit) : null,
        difficulty: data.difficulty,
        questions: data.questions
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
        <button onClick={() => navigate('/admin/quizzes')} className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quizzes
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Create New Quiz</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Quiz Information Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quiz Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Title *</label>
              <input {...register('title', { required: 'Quiz title is required' })} type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea {...register('description', { required: 'Description is required' })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit (minutes)</label>
              <input {...register('time_limit')} type="number" min="1" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select {...register('difficulty')} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Questions</h2>
            <button type="button" onClick={() => append({ question_text: '', options: [{ option_text: '', is_correct: true }, { option_text: '', is_correct: false }] })} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg">
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </button>
          </div>
          <div className="space-y-8">
            {fields.map((field, questionIndex) => (
              <div key={field.id} className="border rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium">Question {questionIndex + 1}</h3>
                  {fields.length > 1 && <button type="button" onClick={() => removeQuestion(questionIndex)} className="text-red-600"><Trash2 className="h-4 w-4" /></button>}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question Text *</label>
                  <textarea {...register(`questions.${questionIndex}.question_text`, { required: 'Question text is required' })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  {errors.questions?.[questionIndex]?.question_text && <p className="mt-1 text-sm text-red-600">{errors.questions[questionIndex].question_text.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Answer Options</label>
                  <div className="text-sm text-gray-500 mb-3">Check the box next to each correct answer (multiple answers allowed)</div>
                  <Controller
                    control={control}
                    name={`questions.${questionIndex}.options`}
                    render={({ field }) => (
                      <div className="space-y-3">
                        {field.value.map((option, optionIndex) => (
                          <div key={optionIndex} className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${
                            option.is_correct 
                              ? 'border-green-500 bg-green-50' 
                              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                          }`}>
                            <div className="flex items-center space-x-2 flex-1">
                              <span className={`font-medium text-sm ${
                                option.is_correct ? 'text-green-700' : 'text-gray-600'
                              }`}>
                                {String.fromCharCode(65 + optionIndex)}.
                              </span>
                              <input
                                {...register(`questions.${questionIndex}.options.${optionIndex}.option_text`, { required: 'Option text is required' })}
                                type="text"
                                className={`flex-1 px-3 py-2 border rounded-md transition-all ${
                                  option.is_correct 
                                    ? 'border-green-300 bg-white focus:border-green-500 focus:ring-green-200' 
                                    : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-200'
                                } focus:outline-none focus:ring-2`}
                                placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                              />
                            </div>

                            <div className="flex items-center space-x-2">
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={option.is_correct}
                                  onChange={(e) => {
                                    const newOptions = field.value.map((opt, idx) =>
                                      idx === optionIndex ? { ...opt, is_correct: e.target.checked } : opt
                                    );
                                    field.onChange(newOptions);
                                  }}
                                  className="sr-only"
                                />
                                <div className={`flex items-center justify-center w-6 h-6 rounded border-2 transition-all ${
                                  option.is_correct
                                    ? 'border-green-500 bg-green-500 text-white'
                                    : 'border-gray-300 bg-white hover:border-green-400'
                                }`}>
                                  {option.is_correct ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    <Square className="h-4 w-4 text-transparent" />
                                  )}
                                </div>
                                <span className="text-sm text-gray-600">Correct</span>
                              </label>

                              {option.is_correct && (
                                <span className="text-green-600 text-xs font-medium bg-green-100 px-2 py-1 rounded">
                                  ✓
                                </span>
                              )}
                            </div>

                            {field.value.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeOption(questionIndex, optionIndex)}
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                                title="Remove option"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  />
                  {getValues(`questions.${questionIndex}.options`)?.length < 6 && (
                    <button
                      type="button"
                      onClick={() => addOption(questionIndex)}
                      className="mt-3 inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Option
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button type="button" onClick={() => navigate('/admin/quizzes')} className="px-6 py-2 border rounded-lg">Cancel</button>
          <button type="submit" disabled={loading} className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creating...' : 'Create Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuiz;

