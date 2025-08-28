import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createFullQuiz } from '../../services/api/educationApi';

import ComponentErrorBoundary from '../../components/error/ComponentErrorBoundary';
import ArticleCreationForm from '../../components/education/ArticleCreationForm';
import QuizInformationForm from '../../components/education/QuizInformationForm';
import QuizQuestionsBuilder from '../../components/education/QuizQuestionsBuilder';
import { useGet } from '../../hooks/useSimpleApi';
import {
    BookOpen,
    HelpCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

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

    // Multiple question state variables
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // Detect content type from URL parameters
    useEffect(() => {
        const type = searchParams.get('type') || 'article';
        setContentType(type);
    }, [searchParams]);

    // Detect edit mode and load article data
    useEffect(() => {
        if (articleId && contentType === 'article') {
            setIsEditMode(true);
            // Load existing article data
            fetchArticleData(articleId);
        } else {
            setIsEditMode(false);
            setEditingArticle(null);
        }
    }, [articleId, contentType]);

    // Fetch article data for editing
    const fetchArticleData = async (id) => {
        try {
            const response = await fetch(`/api/education/articles/${id}`);
            if (response.ok) {
                const articleData = await response.json();
                setEditingArticle(articleData);
            } else {
                toast.error('Failed to load article for editing');
                navigate('/dashboard/education/articles');
            }
        } catch (error) {
            console.error('Error fetching article:', error);
            toast.error('Failed to load article for editing');
            navigate('/dashboard/education/articles');
        }
    };

    // API hooks
    const { data: articlesData, loading: articlesLoading } = useGet('/api/education/articles', {}, {
        onSuccess: (data) => console.log('Articles loaded for quiz creation:', data),
        onError: (error) => console.error('Failed to load articles:', error)
    });

    // Quiz creation handler
    const handleQuizSubmit = async (quizData) => {
        try {
            setIsSubmitting(true);

            // Check if we have questions
            if (questions.length === 0) {
                toast.error('Please add at least one question to the quiz');
                return;
            }

            // Transform quiz data to match backend DTO structure
            const transformedQuizData = {
                titleEn: quizData.titleEn || '',
                titleRw: quizData.titleRw || '',
                titleFr: quizData.titleFr || '',
                descriptionEn: quizData.descriptionEn || '',
                descriptionRw: quizData.descriptionRw || '',
                descriptionFr: quizData.descriptionFr || '',
                articleId: quizData.articleId,
                category: quizData.category || '',
                difficultyLevel: quizData.difficultyLevel || '',
                passingScorePercentage: quizData.passingScorePercentage || 70,
                timeLimitMinutes: quizData.timeLimitMinutes || 30,
                maxAttempts: quizData.maxAttempts || 3,
                tags: quizData.tags || '',
                isActive: true,
                isPublic: quizData.isPublic !== undefined ? quizData.isPublic : true
            };

            // Validate required fields before sending
            const requiredFields = ['titleEn', 'descriptionEn', 'articleId', 'category', 'difficultyLevel'];
            const missingFields = requiredFields.filter(field => !transformedQuizData[field]);

            if (missingFields.length > 0) {
                toast.error(`Missing required fields: ${missingFields.join(', ')}`);
                return;
            }

            // Validate questions have required fields
            const invalidQuestions = questions.filter(q => !q.questionTextEn || !q.options || q.options.length === 0);
            if (invalidQuestions.length > 0) {
                toast.error(`Question ${invalidQuestions[0].questionOrder || 1} is missing required fields`);
                return;
            }

            // Validate at least one correct answer per question
            const questionsWithoutCorrectAnswer = questions.filter(q => !q.options.some(opt => opt.isCorrect));
            if (questionsWithoutCorrectAnswer.length > 0) {
                toast.error(`Question ${questionsWithoutCorrectAnswer[0].questionOrder || 1} must have at least one correct answer`);
                return;
            }

            // Transform questions to match backend DTO structure
            const transformedQuestions = questions.map((question, index) => ({
                questionTextEn: question.questionTextEn || '',
                questionTextRw: question.questionTextRw || '',
                questionTextFr: question.questionTextFr || '',
                explanationEn: question.explanationEn || '',
                explanationRw: question.explanationRw || '',
                explanationFr: question.explanationFr || '',
                questionType: question.questionType || 'MULTIPLE_CHOICE',
                points: question.points || 1,
                questionOrder: index + 1,
                isActive: true,
                options: question.options?.map((option, optionIndex) => ({
                    optionTextEn: option.optionTextEn || '',
                    optionTextRw: option.optionTextRw || '',
                    optionTextFr: option.optionTextFr || '',
                    isCorrect: option.isCorrect || false,
                    optionOrder: optionIndex + 1
                })) || []
            }));

            // Create quiz with questions in the exact format backend expects
            const quizCreationData = {
                quiz: transformedQuizData,
                questions: transformedQuestions
            };

            console.log('Transformed quiz data:', quizCreationData);
            console.log('Quiz structure:', {
                quiz: transformedQuizData,
                questionsCount: transformedQuestions.length,
                firstQuestion: transformedQuestions[0]
            });

            await createFullQuiz(quizCreationData);
            toast.success('Quiz created successfully!');
            navigate('/dashboard/education/quizzes');
        } catch (error) {
            console.error('Error creating quiz:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });

            // Show more specific error message
            if (error.response?.data?.message) {
                toast.error(`Quiz creation failed: ${error.response.data.message}`);
            } else if (error.response?.status === 400) {
                toast.error('Invalid quiz data. Please check all required fields.');
            } else {
                toast.error('Failed to create quiz. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
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
                            {isEditMode ? 'Edit Educational Article' : 'Create Educational Content'}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            {contentType === 'article'
                                ? isEditMode
                                    ? 'Update existing article about Rwanda\'s heritage'
                                    : 'Add new articles to educate about Rwanda\'s heritage'
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

                {/* Article Creation/Edit Form */}
                {contentType === 'article' && (
                    <ArticleCreationForm
                        isEditMode={isEditMode}
                        editingArticle={editingArticle}
                        onSuccess={() => navigate('/dashboard/education/articles')}
                    />
                )}

                {/* Quiz Creation Form */}
                {contentType === 'quiz' && (
                    <div className="space-y-6">
                        {/* Quiz Basic Info */}
                        <QuizInformationForm
                            articles={articles}
                            onSubmit={handleQuizSubmit}
                            isSubmitting={isSubmitting}
                        />

                        {/* Quiz Questions Builder */}
                        <QuizQuestionsBuilder
                            onQuestionsChange={setQuestions}
                            questions={questions}
                            currentQuestionIndex={currentQuestionIndex}
                            setCurrentQuestionIndex={setCurrentQuestionIndex}
                        />
                    </div>
                )}
            </div>
        </ComponentErrorBoundary>
    );
};

export default EducationalContentCreation;
