import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HelpCircle, Plus, Save, Trash2, AlertCircle } from 'lucide-react';

// Mock UI components (replace with your actual imports)
const MobileCard = ({ children }) => <div className="bg-white dark:bg-gray-800 rounded-lg shadow">{children}</div>;
const MobileCardHeader = ({ children }) => <div className="p-4 border-b border-gray-200 dark:border-gray-700">{children}</div>;
const MobileCardTitle = ({ icon: Icon, children }) => (
    <div className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
        {Icon && <Icon className="w-5 h-5" />}
        {children}
    </div>
);
const MobileCardContent = ({ children }) => <div className="p-4">{children}</div>;
const MobileButton = ({ variant = 'default', size = 'default', className = '', ...props }) => (
    <button
        className={`px-4 py-2 rounded-md font-medium transition-colors ${variant === 'outline'
            ? 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
            } ${size === 'sm' ? 'text-sm px-3 py-1' : ''} ${className}`}
        {...props}
    />
);
const FormGroup = ({ children }) => <div className="space-y-2">{children}</div>;
const Label = ({ className = '', ...props }) => (
    <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`} {...props} />
);

// Properly handle refs for form components
const Input = React.forwardRef(({ className = '', ...props }, ref) => (
    <input
        ref={ref}
        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 ${className}`}
        {...props}
    />
));

const TextArea = React.forwardRef(({ className = '', ...props }, ref) => (
    <textarea
        ref={ref}
        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 ${className}`}
        {...props}
    />
));

// Add display names for debugging
Input.displayName = 'Input';
TextArea.displayName = 'TextArea';

// Mock toast
const toast = {
    success: (message) => console.log('Success:', message),
    error: (message) => console.log('Error:', message),
    warning: (message) => console.log('Warning:', message)
};

// Constants
const questionTypes = [
    { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice' },
    { value: 'TRUE_FALSE', label: 'True/False' },
    { value: 'FILL_IN_BLANK', label: 'Fill in Blank' }
];

// Question schema
const questionSchema = z.object({
    questionTextEn: z.string().min(1, 'Question text in English is required'),
    questionTextRw: z.string().optional(),
    questionTextFr: z.string().optional(),
    explanationEn: z.string().optional(),
    explanationRw: z.string().optional(),
    explanationFr: z.string().optional(),
    questionType: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_IN_BLANK']).default('MULTIPLE_CHOICE'),
    points: z.number().min(1).max(10).default(1),
    options: z
        .array(
            z.object({
                optionTextEn: z.string().min(1, 'Option text in English is required'),
                optionTextRw: z.string().optional(),
                optionTextFr: z.string().optional(),
                isCorrect: z.boolean().default(false)
            })
        )
        .min(2, 'At least 2 options are required')
        .max(6, 'Cannot have more than 6 options')
});

const blankQuestion = {
    questionTextEn: '',
    questionTextRw: '',
    questionTextFr: '',
    explanationEn: '',
    explanationRw: '',
    explanationFr: '',
    questionType: 'MULTIPLE_CHOICE',
    points: 1,
    options: [
        { optionTextEn: '', optionTextRw: '', optionTextFr: '', isCorrect: false },
        { optionTextEn: '', optionTextRw: '', optionTextFr: '', isCorrect: false }
    ]
};

const QuizQuestionsBuilder = ({
    onQuestionsChange = () => { },
    questions = [],
    currentQuestionIndex = 0,
    setCurrentQuestionIndex = () => { }
}) => {
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [savedQuestions, setSavedQuestions] = useState(questions);
    const [isSaving, setIsSaving] = useState(false);

    // Form hook
    const questionForm = useForm({
        resolver: zodResolver(questionSchema),
        defaultValues: blankQuestion
    });

    // Field arrays for dynamic form elements
    const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
        control: questionForm.control,
        name: 'options'
    });

    // Watch form changes to detect unsaved changes
    useEffect(() => {
        const subscription = questionForm.watch(() => {
            setHasUnsavedChanges(true);
        });
        return () => subscription.unsubscribe();
    }, [questionForm.watch]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Reset any pending operations
            setIsSaving(false);
            setHasUnsavedChanges(false);
        };
    }, []);

    // Initialize with at least one question
    useEffect(() => {
        if (savedQuestions.length === 0) {
            const initialQuestion = { ...blankQuestion };
            setSavedQuestions([initialQuestion]);
            onQuestionsChange([initialQuestion]);
            setCurrentQuestionIndex(0);
            questionForm.reset(initialQuestion);
        } else {
            questionForm.reset(savedQuestions[currentQuestionIndex] || blankQuestion);
        }
    }, []);

    // Save current question changes
    const saveCurrentQuestion = async () => {
        if (isSaving) return false; // Prevent multiple simultaneous saves

        try {
            setIsSaving(true);
            const isValid = await questionForm.trigger();
            if (!isValid) {
                toast.error('Please fix the errors before saving');
                return false;
            }

            const currentQuestionData = questionForm.getValues();

            // Check if at least one option is marked as correct
            const hasCorrectAnswer = currentQuestionData.options.some(opt => opt.isCorrect);
            if (!hasCorrectAnswer) {
                toast.warning('Please select a correct answer');
                return false;
            }

            // Check if all required option texts are filled
            const hasEmptyOptions = currentQuestionData.options.some(opt => !opt.optionTextEn.trim());
            if (hasEmptyOptions) {
                toast.warning('Please fill in all required option texts');
                return false;
            }

            const updatedQuestions = [...savedQuestions];
            updatedQuestions[currentQuestionIndex] = currentQuestionData;
            setSavedQuestions(updatedQuestions);
            onQuestionsChange(updatedQuestions);
            setHasUnsavedChanges(false);
            toast.success(`Question ${currentQuestionIndex + 1} saved!`);
            return true;
        } catch (error) {
            console.error('Error saving question:', error);
            toast.error('Error saving question');
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    // Navigate to a different question
    const navigateToQuestion = async (index) => {
        if (hasUnsavedChanges) {
            const confirmNavigation = window.confirm(
                'You have unsaved changes. Do you want to save them before navigating?'
            );

            if (confirmNavigation) {
                const saved = await saveCurrentQuestion();
                if (!saved) return; // Don't navigate if save failed
            } else {
                // Discard changes and reset form to saved state
                setHasUnsavedChanges(false);
            }
        }

        setCurrentQuestionIndex(index);
        questionForm.reset(savedQuestions[index]);
    };

    // Add a new blank question
    const addQuestion = async () => {
        if (hasUnsavedChanges) {
            const confirmAdd = window.confirm(
                'You have unsaved changes. Do you want to save them before adding a new question?'
            );

            if (confirmAdd) {
                const saved = await saveCurrentQuestion();
                if (!saved) return;
            }
        }

        const newQuestion = { ...blankQuestion };
        const updatedQuestions = [...savedQuestions, newQuestion];
        setSavedQuestions(updatedQuestions);
        onQuestionsChange(updatedQuestions);
        setCurrentQuestionIndex(updatedQuestions.length - 1);
        questionForm.reset(newQuestion);
        setHasUnsavedChanges(false);
    };

    // Remove question by index
    const removeQuestionByIndex = (index) => {
        if (savedQuestions.length <= 1) {
            toast.error('You must have at least one question');
            return;
        }

        const confirmDelete = window.confirm(
            `Are you sure you want to delete Question ${index + 1}?`
        );

        if (!confirmDelete) return;

        const updatedQuestions = savedQuestions.filter((_, i) => i !== index);
        setSavedQuestions(updatedQuestions);
        onQuestionsChange(updatedQuestions);

        if (updatedQuestions.length > 0) {
            const newIndex = Math.min(currentQuestionIndex, updatedQuestions.length - 1);
            setCurrentQuestionIndex(newIndex);
            questionForm.reset(updatedQuestions[newIndex]);
        }
        setHasUnsavedChanges(false);
    };

    // Options management
    const addQuestionOption = () => {
        if (questionFields.length < 6) {
            appendQuestion({ optionTextEn: '', optionTextRw: '', optionTextFr: '', isCorrect: false });
        }
    };

    const removeQuestionOption = (index) => {
        if (questionFields.length > 2) {
            removeQuestion(index);
        }
    };

    const handleCorrectAnswerChange = (index) => {
        const currentOptions = questionForm.getValues('options');
        const updatedOptions = currentOptions.map((option, i) => ({
            ...option,
            isCorrect: i === index
        }));
        questionForm.setValue('options', updatedOptions);
    };

    return (
        <MobileCard>
            <MobileCardHeader>
                <div className="flex items-center justify-between">
                    <MobileCardTitle icon={HelpCircle}>
                        Quiz Questions {savedQuestions.length > 0 ? `(${savedQuestions.length})` : ''}
                    </MobileCardTitle>
                    {hasUnsavedChanges && (
                        <div className="flex items-center gap-2 text-amber-600">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Unsaved changes</span>
                        </div>
                    )}
                </div>
            </MobileCardHeader>

            <MobileCardContent>
                <div className="space-y-6">
                    {/* Question Navigation */}
                    {savedQuestions.length > 0 && (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex-wrap">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Questions:</span>
                            {savedQuestions.map((_, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => navigateToQuestion(index)}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${currentQuestionIndex === index
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                                        }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                            <MobileButton
                                type="button"
                                onClick={addQuestion}
                                variant="outline"
                                size="sm"
                                className="ml-auto text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Question
                            </MobileButton>
                        </div>
                    )}

                    {/* Current Question Editor */}
                    {savedQuestions.length > 0 && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Question {currentQuestionIndex + 1}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Type:</span>
                                    <select
                                        {...questionForm.register('questionType')}
                                        className="w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                                    >
                                        {questionTypes.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Points:</span>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="10"
                                        {...questionForm.register('points', { valueAsNumber: true })}
                                        className="w-20"
                                    />
                                </div>
                            </div>

                            {/* Question Actions */}
                            <div className="flex items-center gap-2">
                                <MobileButton
                                    type="button"
                                    onClick={saveCurrentQuestion}
                                    variant={hasUnsavedChanges ? 'default' : 'outline'}
                                    size="sm"
                                    disabled={isSaving}
                                >
                                    <Save className={`h-4 w-4 mr-2 ${isSaving ? 'animate-spin' : ''}`} />
                                    {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'Saved'}
                                </MobileButton>
                                <MobileButton
                                    type="button"
                                    onClick={() => removeQuestionByIndex(currentQuestionIndex)}
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Question
                                </MobileButton>
                            </div>

                            {/* Question Text */}
                            <div className="space-y-4">
                                <Label className="text-lg font-semibold text-gray-900 dark:text-gray-100">Question Text *</Label>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    <FormGroup>
                                        <Label htmlFor="questionTextEn" className="text-gray-700 dark:text-gray-300">English *</Label>
                                        <TextArea
                                            id="questionTextEn"
                                            placeholder="Enter your question in English"
                                            rows={3}
                                            {...questionForm.register('questionTextEn')}
                                        />
                                        {questionForm.formState.errors.questionTextEn && (
                                            <span className="text-red-500 dark:text-red-400 text-sm">
                                                {questionForm.formState.errors.questionTextEn.message}
                                            </span>
                                        )}
                                    </FormGroup>
                                    <FormGroup>
                                        <Label htmlFor="questionTextRw" className="text-gray-700 dark:text-gray-300">Kinyarwanda</Label>
                                        <TextArea
                                            id="questionTextRw"
                                            placeholder="Enter your question in Kinyarwanda"
                                            rows={3}
                                            {...questionForm.register('questionTextRw')}
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label htmlFor="questionTextFr" className="text-gray-700 dark:text-gray-300">French</Label>
                                        <TextArea
                                            id="questionTextFr"
                                            placeholder="Enter your question in French"
                                            rows={3}
                                            {...questionForm.register('questionTextFr')}
                                        />
                                    </FormGroup>
                                </div>
                            </div>

                            {/* Question Options */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-lg font-semibold text-gray-900 dark:text-gray-100">Answer Options</Label>
                                    <button
                                        type="button"
                                        onClick={addQuestionOption}
                                        disabled={questionFields.length >= 6}
                                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:text-gray-400 dark:disabled:text-gray-500"
                                    >
                                        <Plus className="w-4 h-4 inline mr-1" />
                                        Add Option
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {questionFields.map((field, index) => (
                                        <div key={field.id} className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                                            <div className="flex items-center pt-2">
                                                <input
                                                    type="radio"
                                                    name="correctAnswer"
                                                    id={`correctAnswer-${index}`}
                                                    checked={questionForm.watch(`options.${index}.isCorrect`)}
                                                    onChange={() => handleCorrectAnswerChange(index)}
                                                    className="mr-2"
                                                    aria-label={`Mark option ${index + 1} as correct answer`}
                                                />
                                                <label
                                                    htmlFor={`correctAnswer-${index}`}
                                                    className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap cursor-pointer"
                                                >
                                                    Option {index + 1}
                                                </label>
                                            </div>

                                            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-2">
                                                <div>
                                                    <Input
                                                        placeholder="English *"
                                                        {...questionForm.register(`options.${index}.optionTextEn`)}
                                                        aria-label={`Option ${index + 1} in English`}
                                                    />
                                                    {questionForm.formState.errors.options?.[index]?.optionTextEn && (
                                                        <span className="text-red-500 dark:text-red-400 text-xs">
                                                            {questionForm.formState.errors.options[index].optionTextEn.message}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <Input
                                                        placeholder="Kinyarwanda"
                                                        {...questionForm.register(`options.${index}.optionTextRw`)}
                                                        aria-label={`Option ${index + 1} in Kinyarwanda`}
                                                    />
                                                </div>
                                                <div>
                                                    <Input
                                                        placeholder="French"
                                                        {...questionForm.register(`options.${index}.optionTextFr`)}
                                                        aria-label={`Option ${index + 1} in French`}
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => removeQuestionOption(index)}
                                                disabled={questionFields.length <= 2}
                                                className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:text-gray-400 dark:disabled:text-gray-500 mt-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {questionForm.formState.errors.options && (
                                    <span className="text-red-500 dark:text-red-400 text-sm">
                                        {questionForm.formState.errors.options.message}
                                    </span>
                                )}
                            </div>

                            {/* Explanation */}
                            <div className="space-y-4">
                                <Label className="text-lg font-semibold text-gray-900 dark:text-gray-100">Explanation (Optional)</Label>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    <FormGroup>
                                        <Label htmlFor="explanationEn" className="text-gray-700 dark:text-gray-300">English</Label>
                                        <TextArea
                                            id="explanationEn"
                                            placeholder="Explain the correct answer"
                                            rows={2}
                                            {...questionForm.register('explanationEn')}
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label htmlFor="explanationRw" className="text-gray-700 dark:text-gray-300">Kinyarwanda</Label>
                                        <TextArea
                                            id="explanationRw"
                                            placeholder="Explain in Kinyarwanda"
                                            rows={2}
                                            {...questionForm.register('explanationRw')}
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label htmlFor="explanationFr" className="text-gray-700 dark:text-gray-300">French</Label>
                                        <TextArea
                                            id="explanationFr"
                                            placeholder="Explain in French"
                                            rows={2}
                                            {...questionForm.register('explanationFr')}
                                        />
                                    </FormGroup>
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <MobileButton
                                    type="button"
                                    onClick={() => navigateToQuestion(currentQuestionIndex - 1)}
                                    variant="outline"
                                    size="sm"
                                    disabled={currentQuestionIndex === 0}
                                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:text-gray-400 dark:disabled:text-gray-500"
                                >
                                    ← Previous
                                </MobileButton>

                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Question {currentQuestionIndex + 1} of {savedQuestions.length}
                                </span>

                                <MobileButton
                                    type="button"
                                    onClick={() => navigateToQuestion(currentQuestionIndex + 1)}
                                    variant="outline"
                                    size="sm"
                                    disabled={currentQuestionIndex === savedQuestions.length - 1}
                                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:text-gray-400 dark:disabled:text-gray-500"
                                >
                                    Next →
                                </MobileButton>
                            </div>
                        </div>
                    )}
                </div>
            </MobileCardContent>
        </MobileCard>
    );
};

export default QuizQuestionsBuilder;