import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { createArticle, createFullQuiz } from '../../services/api/educationApi';

import ComponentErrorBoundary from '../../components/error/ComponentErrorBoundary';
import {
    MobileCard,
    MobileCardHeader,
    MobileCardTitle,
    MobileCardContent,
    MobileButton,
    Form,
    FormGroup,
    Label,
    Input,
    Select,
    TextArea
} from '../../components/ui';
import { useGet } from '../../hooks/useSimpleApi';
import {
    BookOpen,
    HelpCircle,
    Plus,
    Save,
    ArrowLeft,
    Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Schemas for form validation
const articleSchema = z.object({
    titleEn: z.string().min(1, 'English title is required'),
    titleRw: z.string().optional(),
    titleFr: z.string().optional(),
    contentEn: z.string().min(10, 'English content must be at least 10 characters'),
    contentRw: z.string().optional(),
    contentFr: z.string().optional(),
    summaryEn: z.string().min(1, 'Summary is required'),
    summaryRw: z.string().optional(),
    summaryFr: z.string().optional(),
    category: z.string().min(1, 'Category is required'),
    difficultyLevel: z.string().min(1, 'Difficulty level is required'),
    estimatedReadTimeMinutes: z.number().min(1).max(480).default(15),
    tags: z.array(z.string()).optional(),
    isPublic: z.boolean().default(true),
    featuredImage: z.string().optional(),
    youtubeVideoUrl: z.string().optional(),
    relatedArtifactId: z.number().optional(),
    relatedHeritageSiteId: z.number().optional()
});

const quizSchema = z.object({
    titleEn: z.string().min(1, 'English title is required'),
    titleRw: z.string().optional(),
    titleFr: z.string().optional(),
    descriptionEn: z.string().min(10, 'English description is required'),
    descriptionRw: z.string().optional(),
    descriptionFr: z.string().optional(),
    articleId: z.number().min(1, 'Article ID is required'),
    category: z.string().min(1, 'Category is required'),
    difficultyLevel: z.string().min(1, 'Difficulty level is required'),
    passingScorePercentage: z.number().min(1).max(100).default(70),
    timeLimitMinutes: z.number().min(1).max(480).default(30),
    maxAttempts: z.number().min(1).max(10).default(3),
    tags: z.string().optional(),
    isPublic: z.boolean().default(true),
    featuredImage: z.string().optional(),
    youtubeVideoUrl: z.string().optional(),
    relatedArtifactId: z.number().optional(),
    relatedHeritageSiteId: z.number().optional()
});

const questionSchema = z.object({
    questionTextEn: z.string().min(1, 'Question text in English is required'),
    questionTextRw: z.string().optional(),
    questionTextFr: z.string().optional(),
    explanationEn: z.string().optional(),
    explanationRw: z.string().optional(),
    explanationFr: z.string().optional(),
    questionType: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_IN_BLANK']).default('MULTIPLE_CHOICE'),
    points: z.number().min(1).max(10).default(1),
    options: z.array(z.object({
        optionTextEn: z.string().min(1, 'Option text in English is required'),
        optionTextRw: z.string().optional(),
        optionTextFr: z.string().optional(),
        isCorrect: z.boolean().default(false)
    })).min(2, 'At least 2 options are required').max(6, 'Cannot have more than 6 options')
});

const EducationalContentCreation = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { id: articleId } = useParams();
    const [contentType, setContentType] = useState('article');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showQuizBuilder, setShowQuizBuilder] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingArticle, setEditingArticle] = useState(null);

    // Detect content type from URL parameters
    useEffect(() => {
        const type = searchParams.get('type') || 'article';
        setContentType(type);
    }, [searchParams]);

    // Form hooks
    const articleForm = useForm({
        resolver: zodResolver(articleSchema),
        defaultValues: {
            titleEn: '',
            titleRw: '',
            titleFr: '',
            contentEn: '',
            contentRw: '',
            contentFr: '',
            summaryEn: '',
            summaryRw: '',
            summaryFr: '',
            category: '',
            difficultyLevel: '',
            estimatedReadTimeMinutes: 15,
            tags: [],
            isPublic: true,
            featuredImage: '',
            youtubeVideoUrl: '',
            relatedArtifactId: undefined,
            relatedHeritageSiteId: undefined
        }
    });

    const quizForm = useForm({
        resolver: zodResolver(quizSchema),
        defaultValues: {
            titleEn: '',
            titleRw: '',
            titleFr: '',
            descriptionEn: '',
            descriptionRw: '',
            descriptionFr: '',
            articleId: undefined,
            category: '',
            difficultyLevel: '',
            passingScorePercentage: 70,
            timeLimitMinutes: 30,
            maxAttempts: 3,
            tags: '',
            isPublic: true,
            featuredImage: '',
            youtubeVideoUrl: '',
            relatedArtifactId: undefined,
            relatedHeritageSiteId: undefined
        }
    });

    const questionForm = useForm({
        resolver: zodResolver(questionSchema),
        defaultValues: {
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
        }
    });

    // Field arrays for dynamic form elements
    const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
        control: questionForm.control,
        name: 'options'
    });

    const { fields: tagFields, append: appendTag, remove: removeTagField } = useFieldArray({
        control: articleForm.control,
        name: 'tags'
    });

    // Constants
    const categories = [
        'History', 'Culture', 'Archaeology', 'Architecture', 'Traditional Crafts',
        'Music & Dance', 'Language', 'Religion', 'Royal Heritage', 'Colonial Period',
        'Independence Era', 'Modern Rwanda'
    ];

    const difficultyLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
    const questionTypes = [
        { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice' },
        { value: 'TRUE_FALSE', label: 'True/False' },
        { value: 'FILL_IN_BLANK', label: 'Fill in the Blank' }
    ];

    // API hooks
    const { data: articlesData, loading: articlesLoading } = useGet('/api/education/articles', {}, {
        onSuccess: (data) => console.log('Articles loaded for quiz creation:', data),
        onError: (error) => console.error('Failed to load articles:', error)
    });

    // Article creation handler
    const handleArticleSubmit = async (data) => {
        try {
            setIsSubmitting(true);
            const processedData = {
                ...data,
                tags: data.tags || []
            };
            await createArticle(processedData);
            toast.success('Article created successfully!');
            navigate('/dashboard/education/articles');
        } catch (error) {
            console.error('Error creating article:', error);
            toast.error('Failed to create article. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Quiz creation handler
    const handleQuizSubmit = async (data) => {
        try {
            setIsSubmitting(true);

            // Prepare quiz data
            const quizData = {
                ...data,
                tags: data.tags || ''
            };

            // Prepare questions data
            const questionsData = [questionForm.getValues()];

            // Create quiz with questions
            const quizCreationData = {
                quiz: quizData,
                questions: questionsData
            };

            await createFullQuiz(quizCreationData);
            toast.success('Quiz created successfully!');
            navigate('/dashboard/education/quizzes');
        } catch (error) {
            console.error('Error creating quiz:', error);
            toast.error('Failed to create quiz. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper functions
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

    const addTag = () => {
        if (tagFields.length < 10) {
            appendTag('');
        }
    };

    const removeTag = (index) => {
        removeTagField(index);
    };

    const handleCorrectAnswerChange = (index) => {
        const currentOptions = questionForm.getValues('options');
        const updatedOptions = currentOptions.map((option, i) => ({
            ...option,
            isCorrect: i === index
        }));
        questionForm.setValue('options', updatedOptions);
    };

    // Articles for quiz creation
    const articles = articlesData?.data || articlesData || [];

    return (
        <ComponentErrorBoundary>
            <div className="container mx-auto p-4 space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Create Educational Content
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            {contentType === 'article'
                                ? 'Add new articles to educate about Rwanda\'s heritage'
                                : 'Create interactive quizzes to test knowledge about Rwanda\'s heritage'
                            }
                        </p>
                    </div>

                    {/* Content Type Toggle */}
                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <button
                            onClick={() => setContentType('article')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${contentType === 'article'
                                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            <BookOpen className="w-4 h-4 inline mr-2" />
                            Article
                        </button>
                        <button
                            onClick={() => setContentType('quiz')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${contentType === 'quiz'
                                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            <HelpCircle className="w-4 h-4 inline mr-2" />
                            Quiz
                        </button>
                    </div>
                </div>

                {/* Article Creation Form */}
                {contentType === 'article' && (
                    <MobileCard>
                        <MobileCardHeader>
                            <MobileCardTitle icon={BookOpen}>
                                Create Educational Article
                            </MobileCardTitle>
                        </MobileCardHeader>
                        <MobileCardContent>
                            <form onSubmit={articleForm.handleSubmit(handleArticleSubmit)} className="space-y-6">
                                {/* Title Section */}
                                <div className="space-y-4">
                                    <Label className="text-lg font-semibold">Title *</Label>
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                        <FormGroup>
                                            <Label htmlFor="titleEn">English *</Label>
                                            <Input
                                                id="titleEn"
                                                placeholder="Enter title in English"
                                                {...articleForm.register('titleEn')}
                                                className="w-full"
                                            />
                                            {articleForm.formState.errors.titleEn && (
                                                <span className="text-red-500 text-sm">{articleForm.formState.errors.titleEn.message}</span>
                                            )}
                                        </FormGroup>
                                        <FormGroup>
                                            <Label htmlFor="titleRw">Kinyarwanda</Label>
                                            <Input
                                                id="titleRw"
                                                placeholder="Enter title in Kinyarwanda"
                                                {...articleForm.register('titleRw')}
                                                className="w-full"
                                            />
                                        </FormGroup>
                                        <FormGroup>
                                            <Label htmlFor="titleFr">French</Label>
                                            <Input
                                                id="titleFr"
                                                placeholder="Enter title in French"
                                                {...articleForm.register('titleFr')}
                                                className="w-full"
                                            />
                                        </FormGroup>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="space-y-4">
                                    <Label className="text-lg font-semibold">Content *</Label>
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                        <FormGroup>
                                            <Label htmlFor="contentEn">English *</Label>
                                            <TextArea
                                                id="contentEn"
                                                placeholder="Write article content in English"
                                                rows={8}
                                                {...articleForm.register('contentEn')}
                                                className="w-full"
                                            />
                                            {articleForm.formState.errors.contentEn && (
                                                <span className="text-red-500 text-sm">{articleForm.formState.errors.contentEn.message}</span>
                                            )}
                                        </FormGroup>
                                        <FormGroup>
                                            <Label htmlFor="contentRw">Kinyarwanda</Label>
                                            <TextArea
                                                id="contentRw"
                                                placeholder="Write article content in Kinyarwanda"
                                                rows={8}
                                                {...articleForm.register('contentRw')}
                                                className="w-full"
                                            />
                                        </FormGroup>
                                        <FormGroup>
                                            <Label htmlFor="contentFr">French</Label>
                                            <TextArea
                                                id="contentFr"
                                                placeholder="Write article content in French"
                                                rows={8}
                                                {...articleForm.register('contentFr')}
                                                className="w-full"
                                            />
                                        </FormGroup>
                                    </div>
                                </div>

                                {/* Summary Section */}
                                <div className="space-y-4">
                                    <Label className="text-lg font-semibold">Summary *</Label>
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                        <FormGroup>
                                            <Label htmlFor="summaryEn">English *</Label>
                                            <TextArea
                                                id="summaryEn"
                                                placeholder="Brief summary of the article"
                                                rows={3}
                                                {...articleForm.register('summaryEn')}
                                                className="w-full"
                                            />
                                            {articleForm.formState.errors.summaryEn && (
                                                <span className="text-red-500 text-sm">{articleForm.formState.errors.summaryEn.message}</span>
                                            )}
                                        </FormGroup>
                                        <FormGroup>
                                            <Label htmlFor="summaryRw">Kinyarwanda</Label>
                                            <TextArea
                                                id="summaryRw"
                                                placeholder="Brief summary in Kinyarwanda"
                                                rows={3}
                                                {...articleForm.register('summaryRw')}
                                                className="w-full"
                                            />
                                        </FormGroup>
                                        <FormGroup>
                                            <Label htmlFor="summaryFr">French</Label>
                                            <TextArea
                                                id="summaryFr"
                                                placeholder="Brief summary in French"
                                                rows={3}
                                                {...articleForm.register('summaryFr')}
                                                className="w-full"
                                            />
                                        </FormGroup>
                                    </div>
                                </div>

                                {/* Basic Settings with Proper Dropdowns */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormGroup>
                                        <Label>Category *</Label>
                                        <Select
                                            {...articleForm.register('category')}
                                            className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                        >
                                            <option value="">Select a category</option>
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>
                                                    {cat}
                                                </option>
                                            ))}
                                        </Select>
                                        {articleForm.formState.errors.category && (
                                            <span className="text-red-500 text-sm">{articleForm.formState.errors.category.message}</span>
                                        )}
                                    </FormGroup>

                                    <FormGroup>
                                        <Label>Difficulty Level *</Label>
                                        <Select
                                            {...articleForm.register('difficultyLevel')}
                                            className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                        >
                                            <option value="">Select difficulty level</option>
                                            {difficultyLevels.map(level => (
                                                <option key={level} value={level}>
                                                    {level}
                                                </option>
                                            ))}
                                        </Select>
                                        {articleForm.formState.errors.difficultyLevel && (
                                            <span className="text-red-500 text-sm">{articleForm.formState.errors.difficultyLevel.message}</span>
                                        )}
                                    </FormGroup>

                                    <FormGroup>
                                        <Label htmlFor="estimatedReadTimeMinutes">Read Time (minutes) *</Label>
                                        <Input
                                            id="estimatedReadTimeMinutes"
                                            type="number"
                                            min="1"
                                            max="480"
                                            placeholder="15"
                                            {...articleForm.register('estimatedReadTimeMinutes', { valueAsNumber: true })}
                                            className="w-full"
                                        />
                                        {articleForm.formState.errors.estimatedReadTimeMinutes && (
                                            <span className="text-red-500 text-sm">{articleForm.formState.errors.estimatedReadTimeMinutes.message}</span>
                                        )}
                                    </FormGroup>
                                </div>

                                {/* Tags Section */}
                                <FormGroup>
                                    <div className="flex items-center justify-between mb-2">
                                        <Label>Tags</Label>
                                        <button
                                            type="button"
                                            onClick={addTag}
                                            disabled={tagFields.length >= 10}
                                            className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                                        >
                                            <Plus className="w-4 h-4 inline mr-1" />
                                            Add Tag
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {tagFields.map((field, index) => (
                                            <div key={field.id} className="flex gap-2">
                                                <Input
                                                    placeholder={`Tag ${index + 1}`}
                                                    {...articleForm.register(`tags.${index}`)}
                                                    className="flex-1"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeTag(index)}
                                                    disabled={tagFields.length <= 1}
                                                    className="p-2 text-red-500 hover:text-red-700 disabled:text-gray-400"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Tags help users find your content more easily (max 10 tags)
                                    </p>
                                </FormGroup>

                                {/* Public/Private Toggle */}
                                <FormGroup>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="isPublic"
                                            {...articleForm.register('isPublic')}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <Label htmlFor="isPublic">Make this article public</Label>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Public articles are visible to all users, private ones require authentication
                                    </p>
                                </FormGroup>

                                {/* Enhanced Content Fields */}
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                                        Enhanced Content Options
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormGroup>
                                            <Label htmlFor="featuredImage">Featured Image URL</Label>
                                            <Input
                                                id="featuredImage"
                                                placeholder="https://example.com/image.jpg"
                                                {...articleForm.register('featuredImage')}
                                                className="w-full"
                                            />
                                            <p className="text-sm text-gray-500 mt-1">
                                                Optional: Add a featured image to make your article more engaging
                                            </p>
                                        </FormGroup>

                                        <FormGroup>
                                            <Label htmlFor="youtubeVideoUrl">YouTube Video URL</Label>
                                            <Input
                                                id="youtubeVideoUrl"
                                                placeholder="https://www.youtube.com/watch?v=..."
                                                {...articleForm.register('youtubeVideoUrl')}
                                                className="w-full"
                                            />
                                            <p className="text-sm text-gray-500 mt-1">
                                                Optional: Link to a YouTube video for additional content
                                            </p>
                                        </FormGroup>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <FormGroup>
                                            <Label htmlFor="relatedArtifactId">Related Artifact ID</Label>
                                            <Input
                                                id="relatedArtifactId"
                                                type="number"
                                                placeholder="123"
                                                {...articleForm.register('relatedArtifactId', { valueAsNumber: true })}
                                                className="w-full"
                                            />
                                            <p className="text-sm text-gray-500 mt-1">
                                                Optional: Link to a related artifact
                                            </p>
                                        </FormGroup>

                                        <FormGroup>
                                            <Label htmlFor="relatedHeritageSiteId">Related Heritage Site ID</Label>
                                            <Input
                                                id="relatedHeritageSiteId"
                                                type="number"
                                                placeholder="456"
                                                {...articleForm.register('relatedHeritageSiteId', { valueAsNumber: true })}
                                                className="w-full"
                                            />
                                            <p className="text-sm text-gray-500 mt-1">
                                                Optional: Link to a related heritage site
                                            </p>
                                        </FormGroup>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                                    <MobileButton
                                        variant="outline"
                                        onClick={() => navigate('/dashboard/education/articles')}
                                        className="sm:mr-auto"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back to Articles
                                    </MobileButton>
                                    <MobileButton
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {isSubmitting ? 'Creating...' : 'Create Article'}
                                    </MobileButton>
                                </div>
                            </form>
                        </MobileCardContent>
                    </MobileCard>
                )}

                {/* Quiz Creation Form */}
                {contentType === 'quiz' && (
                    <div className="space-y-6">
                        {/* Quiz Basic Info */}
                        <MobileCard>
                            <MobileCardHeader>
                                <MobileCardTitle icon={HelpCircle}>Quiz Information</MobileCardTitle>
                            </MobileCardHeader>
                            <MobileCardContent>
                                <form onSubmit={quizForm.handleSubmit(handleQuizSubmit)} className="space-y-6">
                                    {/* Title Section */}
                                    <div className="space-y-4">
                                        <Label className="text-lg font-semibold">Title *</Label>
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                            <FormGroup>
                                                <Label htmlFor="quiz-titleEn">English *</Label>
                                                <Input
                                                    id="quiz-titleEn"
                                                    placeholder="Enter quiz title in English"
                                                    {...quizForm.register('titleEn')}
                                                    className="w-full"
                                                />
                                                {quizForm.formState.errors.titleEn && (
                                                    <span className="text-red-500 text-sm">{quizForm.formState.errors.titleEn.message}</span>
                                                )}
                                            </FormGroup>
                                            <FormGroup>
                                                <Label htmlFor="quiz-titleRw">Kinyarwanda</Label>
                                                <Input
                                                    id="quiz-titleRw"
                                                    placeholder="Enter quiz title in Kinyarwanda"
                                                    {...quizForm.register('titleRw')}
                                                    className="w-full"
                                                />
                                            </FormGroup>
                                            <FormGroup>
                                                <Label htmlFor="quiz-titleFr">French</Label>
                                                <Input
                                                    id="quiz-titleFr"
                                                    placeholder="Enter quiz title in French"
                                                    {...quizForm.register('titleFr')}
                                                    className="w-full"
                                                />
                                            </FormGroup>
                                        </div>
                                    </div>

                                    {/* Description Section */}
                                    <div className="space-y-4">
                                        <Label className="text-lg font-semibold">Description *</Label>
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                            <FormGroup>
                                                <Label htmlFor="quiz-descriptionEn">English *</Label>
                                                <TextArea
                                                    id="quiz-descriptionEn"
                                                    placeholder="Describe what this quiz covers"
                                                    rows={4}
                                                    {...quizForm.register('descriptionEn')}
                                                    className="w-full"
                                                />
                                                {quizForm.formState.errors.descriptionEn && (
                                                    <span className="text-sm text-red-500">{quizForm.formState.errors.descriptionEn.message}</span>
                                                )}
                                            </FormGroup>
                                            <FormGroup>
                                                <Label htmlFor="quiz-descriptionRw">Kinyarwanda</Label>
                                                <TextArea
                                                    id="quiz-descriptionRw"
                                                    placeholder="Describe what this quiz covers in Kinyarwanda"
                                                    rows={4}
                                                    {...quizForm.register('descriptionRw')}
                                                    className="w-full"
                                                />
                                            </FormGroup>
                                            <FormGroup>
                                                <Label htmlFor="quiz-descriptionFr">French</Label>
                                                <TextArea
                                                    id="quiz-descriptionFr"
                                                    placeholder="Describe what this quiz covers in French"
                                                    rows={4}
                                                    {...quizForm.register('descriptionFr')}
                                                    className="w-full"
                                                />
                                            </FormGroup>
                                        </div>
                                    </div>

                                    {/* Quiz Settings with Proper Dropdowns */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <FormGroup>
                                            <Label htmlFor="quiz-articleId">Related Article *</Label>
                                            <Select
                                                id="quiz-articleId"
                                                {...quizForm.register('articleId', { valueAsNumber: true })}
                                                className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                                required
                                            >
                                                <option value="">Select an article</option>
                                                {articles.map(article => (
                                                    <option key={article.id} value={article.id}>
                                                        {article.titleEn || article.title}
                                                    </option>
                                                ))}
                                            </Select>
                                            {quizForm.formState.errors.articleId && (
                                                <span className="text-sm text-red-500">{quizForm.formState.errors.articleId.message}</span>
                                            )}
                                        </FormGroup>

                                        <FormGroup>
                                            <Label>Category *</Label>
                                            <Select
                                                {...quizForm.register('category')}
                                                className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                            >
                                                <option value="">Select a category</option>
                                                {categories.map(cat => (
                                                    <option key={cat} value={cat}>
                                                        {cat}
                                                    </option>
                                                ))}
                                            </Select>
                                            {quizForm.formState.errors.category && (
                                                <span className="text-sm text-red-500">{quizForm.formState.errors.category.message}</span>
                                            )}
                                        </FormGroup>

                                        <FormGroup>
                                            <Label>Difficulty Level *</Label>
                                            <Select
                                                {...quizForm.register('difficultyLevel')}
                                                className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                            >
                                                <option value="">Select difficulty level</option>
                                                {difficultyLevels.map(level => (
                                                    <option key={level} value={level}>
                                                        {level}
                                                    </option>
                                                ))}
                                            </Select>
                                            {quizForm.formState.errors.difficultyLevel && (
                                                <span className="text-sm text-red-500">{quizForm.formState.errors.difficultyLevel.message}</span>
                                            )}
                                        </FormGroup>

                                        <FormGroup>
                                            <Label htmlFor="quiz-tags">Tags</Label>
                                            <Input
                                                id="quiz-tags"
                                                placeholder="Enter tags separated by commas"
                                                {...quizForm.register('tags')}
                                                className="w-full"
                                            />
                                            <p className="text-sm text-gray-500 mt-1">
                                                Tags help users find your quiz more easily
                                            </p>
                                        </FormGroup>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormGroup>
                                            <Label htmlFor="quiz-passingScorePercentage">Passing Score (%) *</Label>
                                            <Input
                                                id="quiz-passingScorePercentage"
                                                type="number"
                                                min="1"
                                                max="100"
                                                placeholder="70"
                                                {...quizForm.register('passingScorePercentage', { valueAsNumber: true })}
                                                className="w-full"
                                            />
                                            <p className="text-sm text-gray-500 mt-1">
                                                Minimum score required to pass the quiz
                                            </p>
                                        </FormGroup>

                                        <FormGroup>
                                            <Label htmlFor="quiz-timeLimitMinutes">Time Limit (minutes) *</Label>
                                            <Input
                                                id="quiz-timeLimitMinutes"
                                                type="number"
                                                min="1"
                                                max="480"
                                                placeholder="30"
                                                {...quizForm.register('timeLimitMinutes', { valueAsNumber: true })}
                                                className="w-full"
                                            />
                                            <p className="text-sm text-gray-500 mt-1">
                                                Maximum time allowed to complete the quiz
                                            </p>
                                        </FormGroup>

                                        <FormGroup>
                                            <Label htmlFor="quiz-maxAttempts">Max Attempts *</Label>
                                            <Input
                                                id="quiz-maxAttempts"
                                                type="number"
                                                min="1"
                                                max="10"
                                                placeholder="3"
                                                {...quizForm.register('maxAttempts', { valueAsNumber: true })}
                                                className="w-full"
                                            />
                                            <p className="text-sm text-gray-500 mt-1">
                                                Maximum number of attempts allowed
                                            </p>
                                        </FormGroup>
                                    </div>

                                    {/* Public/Private Toggle */}
                                    <FormGroup>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="quiz-isPublic"
                                                {...quizForm.register('isPublic')}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <Label htmlFor="quiz-isPublic">Make this quiz public</Label>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Public quizzes are visible to all users, private ones require authentication
                                        </p>
                                    </FormGroup>

                                    {/* Enhanced Content Fields */}
                                    <div className="border-t pt-6">
                                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                                            Enhanced Content Options
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormGroup>
                                                <Label htmlFor="quiz-featuredImage">Featured Image URL</Label>
                                                <Input
                                                    id="quiz-featuredImage"
                                                    placeholder="https://example.com/image.jpg"
                                                    {...quizForm.register('featuredImage')}
                                                    className="w-full"
                                                />
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Optional: Add a featured image to make your quiz more engaging
                                                </p>
                                            </FormGroup>

                                            <FormGroup>
                                                <Label htmlFor="quiz-youtubeVideoUrl">YouTube Video URL</Label>
                                                <Input
                                                    id="quiz-youtubeVideoUrl"
                                                    placeholder="https://www.youtube.com/watch?v=..."
                                                    {...quizForm.register('youtubeVideoUrl')}
                                                    className="w-full"
                                                />
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Optional: Link to a YouTube video for additional context
                                                </p>
                                            </FormGroup>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            <FormGroup>
                                                <Label htmlFor="quiz-relatedArtifactId">Related Artifact ID</Label>
                                                <Input
                                                    id="quiz-relatedArtifactId"
                                                    type="number"
                                                    placeholder="123"
                                                    {...quizForm.register('relatedArtifactId', { valueAsNumber: true })}
                                                    className="w-full"
                                                />
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Optional: Link to a related artifact
                                                </p>
                                            </FormGroup>

                                            <FormGroup>
                                                <Label htmlFor="quiz-relatedHeritageSiteId">Related Heritage Site ID</Label>
                                                <Input
                                                    id="quiz-relatedHeritageSiteId"
                                                    type="number"
                                                    placeholder="456"
                                                    {...quizForm.register('relatedHeritageSiteId', { valueAsNumber: true })}
                                                    className="w-full"
                                                />
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Optional: Link to a related heritage site
                                                </p>
                                            </FormGroup>
                                        </div>
                                    </div>
                                </form>
                            </MobileCardContent>
                        </MobileCard>

                        {/* Quiz Questions Builder */}
                        <MobileCard>
                            <MobileCardHeader>
                                <MobileCardTitle icon={HelpCircle}>Quiz Questions</MobileCardTitle>
                            </MobileCardHeader>
                            <MobileCardContent>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold">Question 1</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-500">Question Type:</span>
                                            <Select
                                                {...questionForm.register('questionType')}
                                                className="w-32 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                            >
                                                {questionTypes.map(type => (
                                                    <option key={type.value} value={type.value}>
                                                        {type.label}
                                                    </option>
                                                ))}
                                            </Select>
                                            <span className="text-sm text-gray-500">Points:</span>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="10"
                                                {...questionForm.register('points', { valueAsNumber: true })}
                                                className="w-20"
                                            />
                                        </div>
                                    </div>

                                    {/* Question Text */}
                                    <div className="space-y-4">
                                        <Label className="text-lg font-semibold">Question Text *</Label>
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                            <FormGroup>
                                                <Label htmlFor="questionTextEn">English *</Label>
                                                <TextArea
                                                    id="questionTextEn"
                                                    placeholder="Enter your question in English"
                                                    rows={3}
                                                    {...questionForm.register('questionTextEn')}
                                                    className="w-full"
                                                />
                                                {questionForm.formState.errors.questionTextEn && (
                                                    <span className="text-red-500 text-sm">{questionForm.formState.errors.questionTextEn.message}</span>
                                                )}
                                            </FormGroup>
                                            <FormGroup>
                                                <Label htmlFor="questionTextRw">Kinyarwanda</Label>
                                                <TextArea
                                                    id="questionTextRw"
                                                    placeholder="Enter your question in Kinyarwanda"
                                                    rows={3}
                                                    {...questionForm.register('questionTextRw')}
                                                    className="w-full"
                                                />
                                            </FormGroup>
                                            <FormGroup>
                                                <Label htmlFor="questionTextFr">French</Label>
                                                <TextArea
                                                    id="questionTextFr"
                                                    placeholder="Enter your question in French"
                                                    rows={3}
                                                    {...questionForm.register('questionTextFr')}
                                                    className="w-full"
                                                />
                                            </FormGroup>
                                        </div>
                                    </div>

                                    {/* Question Options */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-lg font-semibold">Answer Options</Label>
                                            <button
                                                type="button"
                                                onClick={addQuestionOption}
                                                disabled={questionFields.length >= 6}
                                                className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                                            >
                                                <Plus className="w-4 h-4 inline mr-1" />
                                                Add Option
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {questionFields.map((field, index) => (
                                                <div key={field.id} className="flex items-center gap-3 p-3 border rounded-lg">
                                                    <div className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="correctAnswer"
                                                            checked={questionForm.watch(`options.${index}.isCorrect`)}
                                                            onChange={() => handleCorrectAnswerChange(index)}
                                                            className="mr-2"
                                                        />
                                                        <span className="text-sm font-medium text-gray-600">
                                                            Option {index + 1}
                                                        </span>
                                                    </div>

                                                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-2">
                                                        <Input
                                                            placeholder="English"
                                                            {...questionForm.register(`options.${index}.optionTextEn`)}
                                                            className="w-full"
                                                        />
                                                        <Input
                                                            placeholder="Kinyarwanda"
                                                            {...questionForm.register(`options.${index}.optionTextRw`)}
                                                            className="w-full"
                                                        />
                                                        <Input
                                                            placeholder="French"
                                                            {...questionForm.register(`options.${index}.optionTextFr`)}
                                                            className="w-full"
                                                        />
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => removeQuestionOption(index)}
                                                        disabled={questionFields.length <= 2}
                                                        className="p-1 text-red-500 hover:text-red-700 disabled:text-gray-400"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        {questionForm.formState.errors.options && (
                                            <span className="text-red-500 text-sm">{questionForm.formState.errors.options.message}</span>
                                        )}
                                    </div>

                                    {/* Explanation */}
                                    <div className="space-y-4">
                                        <Label className="text-lg font-semibold">Explanation (Optional)</Label>
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                            <FormGroup>
                                                <Label htmlFor="explanationEn">English</Label>
                                                <TextArea
                                                    id="explanationEn"
                                                    placeholder="Explain the correct answer"
                                                    rows={2}
                                                    {...questionForm.register('explanationEn')}
                                                    className="w-full"
                                                />
                                            </FormGroup>
                                            <FormGroup>
                                                <Label htmlFor="explanationRw">Kinyarwanda</Label>
                                                <TextArea
                                                    id="explanationRw"
                                                    placeholder="Explain the correct answer in Kinyarwanda"
                                                    rows={2}
                                                    {...questionForm.register('explanationRw')}
                                                    className="w-full"
                                                />
                                            </FormGroup>
                                            <FormGroup>
                                                <Label htmlFor="explanationFr">French</Label>
                                                <TextArea
                                                    id="explanationFr"
                                                    placeholder="Explain the correct answer in French"
                                                    rows={2}
                                                    {...questionForm.register('explanationFr')}
                                                    className="w-full"
                                                />
                                            </FormGroup>
                                        </div>
                                    </div>

                                    {/* Quiz Creation Actions */}
                                    <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                                        <MobileButton
                                            variant="outline"
                                            onClick={() => navigate('/dashboard/education/quizzes')}
                                            className="sm:mr-auto"
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Back to Quizzes
                                        </MobileButton>
                                        <MobileButton
                                            onClick={quizForm.handleSubmit(handleQuizSubmit)}
                                            disabled={isSubmitting}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            {isSubmitting ? 'Creating...' : 'Create Quiz'}
                                        </MobileButton>
                                    </div>
                                </div>
                            </MobileCardContent>
                        </MobileCard>
                    </div>
                )}
            </div>
        </ComponentErrorBoundary>
    );
};

export default EducationalContentCreation;
