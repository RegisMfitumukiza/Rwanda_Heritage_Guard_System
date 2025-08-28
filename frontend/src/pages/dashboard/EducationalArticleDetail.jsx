import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

import ComponentErrorBoundary from '../../components/error/ComponentErrorBoundary';
import QuizIndicator from '../../components/ui/QuizIndicator';
import {
    MobileCard,
    MobileCardHeader,
    MobileCardTitle,
    MobileCardContent,
    MobileButton,
    MobileBadge,
    LoadingSpinner,
    SkeletonLoader
} from '../../components/ui';
import { useGet } from '../../hooks/useSimpleApi';
import { toast } from 'react-hot-toast';
import {
    BookOpen,
    ArrowLeft,
    Calendar,
    User,
    Tag,
    Clock,
    Globe,
    ExternalLink,
    Play,
    Award
} from 'lucide-react';

const EducationalArticleDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { currentLanguage } = useLanguage();
    const [article, setArticle] = useState(null);
    const [quiz, setQuiz] = useState(null);

    // Fetch article details
    const { data: articleData, loading: articleLoading, error: articleError } = useGet(`/api/education/articles/${id}`, {}, {
        onSuccess: (data) => {
            setArticle(data);
            // If article has quizId, fetch quiz details
            if (data.quizId) {
                fetchQuiz(data.quizId);
            }
        },
        onError: (error) => {
            console.error('Failed to load article:', error);
            toast.error('Failed to load article');
        }
    });

    // Fetch quiz details if article has one
    const fetchQuiz = async (quizId) => {
        try {
            const response = await fetch(`/api/education/quizzes/${quizId}`);
            if (response.ok) {
                const quizData = await response.json();
                setQuiz(quizData);
            }
        } catch (error) {
            console.error('Failed to fetch quiz:', error);
        }
    };

    // Get localized content based on current language
    const getLocalizedContent = (fieldName) => {
        if (!article) return '';
        const lang = currentLanguage || 'en';
        const field = `${fieldName}${lang === 'en' ? 'En' : lang === 'rw' ? 'Rw' : 'Fr'}`;
        return article[field] || article[`${fieldName}En`] || 'Not available';
    };

    // Handle Take Quiz action
    const handleTakeQuiz = () => {
        if (quiz) {
            navigate(`/dashboard/learning/quiz/${quiz.id}`);
        } else {
            toast.error('No quiz available for this article');
        }
    };

    // Handle external resource links
    const handleExternalResource = (url) => {
        if (url) {
            window.open(url, '_blank');
        }
    };

    if (articleLoading) {
        return (
            <div className="space-y-6">
                <div className="text-center py-12">
                    <LoadingSpinner />
                    <p className="mt-4 text-gray-600">Loading article...</p>
                </div>
            </div>
        );
    }

    if (articleError || !article) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600 mb-4">Failed to load article</p>
                <MobileButton onClick={() => navigate('/dashboard/education/articles')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Articles
                </MobileButton>
            </div>
        );
    }

    const title = getLocalizedContent('title');
    const content = getLocalizedContent('content');
    const summary = getLocalizedContent('summary');

    return (
        <ComponentErrorBoundary>
            <div className="space-y-6">
                {/* Header with back button */}
                <div className="flex items-center justify-between">
                    {/* Take Quiz button - now available to all users */}
                    {quiz && (
                        <MobileButton
                            onClick={handleTakeQuiz}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-lg font-semibold"
                        >
                            <Award className="w-5 h-5 mr-2" />
                            Take Quiz
                        </MobileButton>
                    )}

                    <MobileButton
                        variant="outline"
                        onClick={() => navigate('/dashboard/education/articles')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Articles
                    </MobileButton>
                </div>

                {/* Article Content */}
                <MobileCard>
                    <MobileCardHeader>
                        <div className="space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <MobileCardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {title}
                                    </MobileCardTitle>

                                    {/* Article metadata */}
                                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            <span>{new Date(article.publishedDate || article.createdDate).toLocaleDateString()}</span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <User className="w-4 h-4" />
                                            <span>{article.createdBy || 'Unknown'}</span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <Tag className="w-4 h-4" />
                                            <span>{article.category}</span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            <span>{article.estimatedReadTimeMinutes || 5} min read</span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <Globe className="w-4 h-4" />
                                            <span>{article.isPublic ? 'Public' : 'Private'}</span>
                                        </div>

                                        {/* Quiz Indicator */}
                                        {article.quizId && (
                                            <div className="flex items-center gap-1">
                                                <QuizIndicator
                                                    hasQuiz={true}
                                                    variant="inline"
                                                    size="sm"
                                                    showText={true}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </MobileCardHeader>

                    <MobileCardContent className="space-y-6">
                        {/* Featured Image */}
                        {article.featuredImage && (
                            <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                                <img
                                    src={article.featuredImage}
                                    alt={title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Summary */}
                        {summary && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-400">
                                <p className="text-blue-800 dark:text-blue-200 font-medium">
                                    {summary}
                                </p>
                            </div>
                        )}

                        {/* Main Content */}
                        <div className="prose prose-lg max-w-none dark:prose-invert">
                            <div
                                className="whitespace-pre-wrap leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: content }}
                            />
                        </div>

                        {/* External Resources */}
                        {article.youtubeVideoUrl && (
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <Play className="w-5 h-5 text-red-600" />
                                    Related Video
                                </h3>
                                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        Watch additional content related to this article:
                                    </p>
                                    <MobileButton
                                        variant="outline"
                                        onClick={() => handleExternalResource(article.youtubeVideoUrl)}
                                        className="flex items-center gap-2"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Watch on YouTube
                                    </MobileButton>
                                </div>
                            </div>
                        )}

                        {/* Quiz Information */}
                        {quiz && (
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <QuizIndicator
                                        hasQuiz={true}
                                        variant="inline"
                                        size="lg"
                                        showText={false}
                                    />
                                    Test Your Knowledge
                                </h3>
                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                                    <p className="text-green-800 dark:text-green-200 mb-3">
                                        Take a quiz to test what you've learned from this article.
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-green-700 dark:text-green-300">
                                        <span>Questions: {quiz.questionCount || 'Unknown'}</span>
                                        <span>Time: {quiz.timeLimitMinutes || 'No limit'} min</span>
                                        <span>Passing Score: {quiz.passingScorePercentage || 70}%</span>
                                    </div>

                                    {/* Quiz button now available to all users */}
                                    <MobileButton
                                        onClick={handleTakeQuiz}
                                        className="mt-3 bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <Award className="w-4 h-4 mr-2" />
                                        Start Quiz
                                    </MobileButton>
                                </div>
                            </div>
                        )}

                        {/* Related Content */}
                        {article.relatedArtifactId && (
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold mb-3">Related Artifact</h3>
                                <Link
                                    to={`/dashboard/artifacts/${article.relatedArtifactId}`}
                                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                                >
                                    View Related Artifact
                                    <ArrowLeft className="w-4 h-4 rotate-180" />
                                </Link>
                            </div>
                        )}

                        {article.relatedHeritageSiteId && (
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold mb-3">Related Heritage Site</h3>
                                <Link
                                    to={`/dashboard/sites/${article.relatedHeritageSiteId}`}
                                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                                >
                                    View Related Heritage Site
                                    <ArrowLeft className="w-4 h-4 rotate-180" />
                                </Link>
                            </div>
                        )}
                    </MobileCardContent>
                </MobileCard>
            </div>
        </ComponentErrorBoundary>
    );
};

export default EducationalArticleDetail;


