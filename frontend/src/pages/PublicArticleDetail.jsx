import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { X, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import {
    BookOpen,
    ArrowLeft,
    Calendar,
    User,
    Tag,
    Clock,
    Play,
    Award,
    Share2,
    Heart,
    Bookmark,
    ExternalLink,
    MapPin,
    Star,
    Eye,
    FileText,
    Users,
    TrendingUp
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { useGet } from '../hooks/useSimpleApi';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import QuizIndicator from '../components/ui/QuizIndicator';

const PublicArticleDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { user } = useAuth();
    const [isFavorite, setIsFavorite] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [readingProgress, setReadingProgress] = useState(0);
    const [showRelatedModal, setShowRelatedModal] = useState(false);

    // Fetch article details
    const { data: article, loading, error } = useGet(`/api/education/articles/${id}`, {}, {
        enabled: !!id,
        onSuccess: (data) => {
            console.log('✅ Article loaded:', data);
            console.log('📝 Article fields:', {
                titleEn: data.titleEn,
                titleRw: data.titleRw,
                titleFr: data.titleFr,
                contentEn: data.contentEn,
                contentRw: data.contentRw,
                contentFr: data.contentFr,
                summaryEn: data.summaryEn,
                summaryRw: data.summaryRw,
                summaryFr: data.summaryFr,
                featuredImage: data.featuredImage,
                images: data.images
            });
        },
        onError: (error) => console.error('❌ Failed to load article:', error)
    });

    // Fetch associated quiz if article has one
    const { data: quiz } = useGet(
        article?.quizId ? `/api/education/quizzes/${article.quizId}` : null,
        {},
        { enabled: !!article?.quizId }
    );

    const { data: relatedArticles } = useGet(
        `/api/education/articles?category=${article?.category}&limit=6&exclude=${id}`,
        {},
        {
            enabled: !!article?.category && showRelatedModal,
            onSuccess: (data) => console.log('Related articles loaded:', data)
        }
    );

    // Reading progress tracking
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollTop / docHeight) * 100;
            setReadingProgress(Math.min(progress, 100));
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Get localized content based on current language
    const getLocalizedField = (field) => {
        if (!article) return '';
        const lang = t('currentLanguage') || 'en';
        const fieldMap = {
            title: { en: 'titleEn', rw: 'titleRw', fr: 'titleFr' },
            content: { en: 'contentEn', rw: 'contentRw', fr: 'contentFr' },
            summary: { en: 'summaryEn', rw: 'summaryRw', fr: 'summaryFr' }
        };

        if (fieldMap[field] && fieldMap[field][lang]) {
            const localizedValue = article[fieldMap[field][lang]];
            if (localizedValue) return localizedValue;
        }

        // Fallback to English if current language doesn't have content
        const englishValue = article[fieldMap[field]?.['en']];
        if (englishValue) return englishValue;

        // Final fallback to direct field
        return article[field] || '';
    };

    // Get media URL
    const getMediaUrl = (mediaId) => {
        return `/api/media/download/${mediaId}`;
    };

    // Get hero image
    const getHeroImage = () => {
        if (article?.featuredImage) return article.featuredImage;
        if (article?.images && article.images.length > 0) {
            const activeImage = article.images.find(img => img.isActive && img.isPublic);
            if (activeImage) return getMediaUrl(activeImage.id);
        }
        return '/education_placeholder.jpg';
    };

    // Utility functions
    const getCategoryColor = (category) => {
        if (!category) return 'bg-gray-100 text-gray-800';
        const categoryLower = category.toLowerCase();
        if (categoryLower.includes('music')) return 'bg-purple-100 text-purple-800';
        if (categoryLower.includes('craft')) return 'bg-orange-100 text-orange-800';
        if (categoryLower.includes('dance')) return 'bg-pink-100 text-pink-800';
        if (categoryLower.includes('history')) return 'bg-red-100 text-red-800';
        if (categoryLower.includes('culture')) return 'bg-blue-100 text-blue-800';
        if (categoryLower.includes('architecture')) return 'bg-indigo-100 text-indigo-800';
        if (categoryLower.includes('royal')) return 'bg-yellow-100 text-yellow-800';
        return 'bg-gray-100 text-gray-800';
    };

    const getDifficultyColor = (difficulty) => {
        if (!difficulty) return 'bg-gray-100 text-gray-800';
        const difficultyLower = difficulty.toLowerCase();
        if (difficultyLower.includes('beginner')) return 'bg-green-100 text-green-800 border-green-200';
        if (difficultyLower.includes('intermediate')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        if (difficultyLower.includes('advanced')) return 'bg-red-100 text-red-800 border-red-200';
        return 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return 'Unknown';
        }
    };

    // Handle actions
    const handleBackClick = () => navigate(-1);
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: getLocalizedField('title'),
                text: getLocalizedField('summary'),
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            // You can add a toast notification here
        }
    };

    const handleTakeQuiz = () => {
        if (user) {
            navigate(`/dashboard/quiz/${article.quizId}`);
        } else {
            navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading article...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">📚</div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Unable to Load Article
                    </h2>
                    <div className="flex gap-4 justify-center">
                        <Button onClick={handleBackClick} variant="outline">
                            <ArrowLeft className="mr-2" size={16} />Go Back
                        </Button>
                        <Button onClick={() => window.location.reload()}>
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Article not found
    if (!article) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-gray-400 text-6xl mb-4">📚</div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Article Not Found
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        The article you're looking for doesn't exist or has been removed.
                    </p>
                    <Button onClick={handleBackClick} variant="outline">
                        <ArrowLeft className="mr-2" size={16} />Go Back
                    </Button>
                </div>
            </div>
        );
    }

    const heroImage = getHeroImage();

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            {/* Reading Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
                <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${readingProgress}%` }}
                />
            </div>

            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Button
                            onClick={handleBackClick}
                            variant="ghost"
                            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                        >
                            <ArrowLeft className="mr-2" size={16} />
                            Back to Articles
                        </Button>
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={() => setIsBookmarked(!isBookmarked)}
                                variant="ghost"
                                className={`${isBookmarked ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}
                            >
                                <Bookmark size={20} className={isBookmarked ? 'fill-current' : ''} />
                            </Button>
                            <Button
                                onClick={() => setIsFavorite(!isFavorite)}
                                variant="ghost"
                                className={`${isFavorite ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'}`}
                            >
                                <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
                            </Button>
                            <Button onClick={handleShare} variant="ghost" className="text-gray-600 dark:text-gray-400">
                                <Share2 size={20} />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>
            {/* Hero Section */}
            <div className="relative h-auto min-h-96 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 dark:from-blue-800 dark:via-indigo-900 dark:to-purple-900">
                {/* Background Image */}
                {heroImage && heroImage !== '/education_placeholder.jpg' && (
                    <div className="absolute inset-0">
                        <img
                            src={heroImage}
                            alt={getLocalizedField('title')}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60"></div>
                    </div>
                )}

                <div className="relative flex items-center justify-center py-16">
                    <div className="text-center text-white z-10 max-w-4xl mx-auto px-4">
                        {/* Rating - Top Right */}
                        <div className="flex justify-end mb-8">
                            <div className="flex items-center text-white bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                                <Star size={18} className="text-yellow-400 fill-current mr-2" />
                                <span className="font-semibold">4.8</span>
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 max-w-4xl mx-auto leading-tight drop-shadow-lg">
                            {getLocalizedField('title')}
                        </h1>

                        {/* Article Metadata - Consolidated */}
                        <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
                            <span className={`px-4 py-2 rounded-full text-sm font-semibold bg-white/10 backdrop-blur-sm border border-white/30 ${getCategoryColor(article.category)}`}>
                                {article.category?.replace(/_/g, ' ')}
                            </span>
                            <div className="flex items-center text-white bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full border border-white/30">
                                <Award size={16} className="mr-2" />
                                <span className="text-sm font-semibold">{article.difficultyLevel}</span>
                            </div>
                            <div className="flex items-center text-white bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full border border-white/30">
                                <Clock size={16} className="mr-2" />
                                <span className="text-sm font-semibold">{article.estimatedReadTimeMinutes || 15} min</span>
                            </div>
                            <div className="flex items-center text-white bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full border border-white/30">
                                <Calendar size={16} className="mr-2" />
                                <span className="text-sm font-semibold">{formatDate(article.createdDate)}</span>
                            </div>
                        </div>

                        {/* Tags */}
                        {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-2 mb-6">
                                {(Array.isArray(article.tags)
                                    ? article.tags
                                    : article.tags.split(',').map(tag => tag.trim())
                                ).map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1.5 bg-white/10 text-white rounded-lg text-sm border border-white/30"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Article Content */}
                    <div className="lg:col-span-2">
                        {/* Article Summary */}


                        {/* Article Summary */}
                        <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileText size={20} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                        Article Summary
                                    </h3>
                                    {getLocalizedField('summary') ? (
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                            {getLocalizedField('summary')}
                                        </p>
                                    ) : (
                                        <div className="text-gray-500 dark:text-gray-400">
                                            <p>No summary available</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Article Content */}
                        <div className="prose prose-lg max-w-none dark:prose-invert">
                            {getLocalizedField('content') ? (
                                <div
                                    className="leading-relaxed text-gray-800 dark:text-gray-200"
                                    dangerouslySetInnerHTML={{
                                        __html: getLocalizedField('content')
                                    }}
                                />
                            ) : (
                                <div className="text-gray-500 dark:text-gray-400 p-8 text-center">
                                    <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                                    <h3 className="text-xl font-semibold mb-2">No content available</h3>
                                    <p>The article content could not be loaded.</p>
                                </div>
                            )}
                        </div>

                        {/* Related Links */}
                        {(article.relatedArtifactId || article.relatedHeritageSiteId) && (
                            <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    Related Content
                                </h3>
                                <div className="flex gap-3">
                                    {article.relatedArtifactId && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(`/artifacts/${article.relatedArtifactId}`)}
                                        >
                                            <ExternalLink size={16} className="mr-2" />
                                            View Related Artifact
                                        </Button>
                                    )}
                                    {article.relatedArtifactId && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(`/heritage-site/${article.relatedHeritageSiteId}`)}
                                        >
                                            <MapPin size={16} className="mr-2" />
                                            View Related Site
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Quiz Section */}
                        {quiz && (
                            <div className="mt-12 p-8 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 dark:from-purple-600 dark:via-pink-600 dark:to-red-600 rounded-2xl border-0 shadow-2xl overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
                                <div className="text-center relative z-10">
                                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-white/30">
                                        <Award size={32} className="text-white" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-4">
                                        Test Your Knowledge
                                    </h3>
                                    <p className="text-white/90 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
                                        Take a quiz based on this article to test your understanding and earn points.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                        <div className="text-center p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                                            <div className="text-3xl font-bold text-white mb-1">{quiz.passingScorePercentage}%</div>
                                            <div className="text-white/80 text-sm font-medium">Passing Score</div>
                                        </div>
                                        <div className="text-center p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                                            <div className="text-3xl font-bold text-white mb-1">{quiz.timeLimitMinutes} min</div>
                                            <div className="text-white/80 text-sm font-medium">Time Limit</div>
                                        </div>
                                        <div className="text-center p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                                            <div className="text-3xl font-bold text-white mb-1">{quiz.maxAttempts}</div>
                                            <div className="text-white/80 text-sm font-medium">Max Attempts</div>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleTakeQuiz}
                                        className="bg-white text-purple-600 hover:bg-gray-100 px-10 py-4 text-xl font-bold shadow-xl border-0"
                                    >
                                        <Play size={24} className="mr-3" />
                                        Start Quiz Now
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Reading Progress */}
                        <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 dark:from-green-600 dark:via-green-700 dark:to-emerald-700 overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
                            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10"></div>
                            <CardContent className="p-6 relative z-10">
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/30">
                                        <TrendingUp size={28} className="text-white" />
                                    </div>
                                    <h4 className="font-bold text-white text-lg mb-3">Reading Progress</h4>
                                    <div className="w-full bg-white/20 rounded-full h-3 mb-3 backdrop-blur-sm">
                                        <div
                                            className="bg-white h-3 rounded-full transition-all duration-500 ease-out shadow-lg"
                                            style={{ width: `${readingProgress}%` }}
                                        />
                                    </div>
                                    <p className="text-green-100 font-semibold">{Math.round(readingProgress)}% completed</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Related Articles */}
                        <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg flex items-center gap-3 text-gray-800 dark:text-gray-100">
                                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                                        <BookOpen size={20} className="text-white" />
                                    </div>
                                    More Articles
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                                    Discover more articles about Rwanda's cultural heritage and expand your knowledge.
                                </p>
                                <Button
                                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-lg"
                                    onClick={() => setShowRelatedModal(true)}
                                >
                                    Browse Related Articles
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            {/* Related Articles Modal */}
            {showRelatedModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    Related Articles
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    Explore more articles about {article?.category?.replace(/_/g, ' ')}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowRelatedModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <X size={24} />
                            </Button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                            {relatedArticles?.data ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {relatedArticles.data.map((relatedArticle) => (
                                        <div
                                            key={relatedArticle.id}
                                            className="group cursor-pointer p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 border border-gray-200 dark:border-gray-600"
                                            onClick={() => {
                                                setShowRelatedModal(false);
                                                navigate(`/education/articles/${relatedArticle.id}`);
                                            }}
                                        >
                                            {/* Article Image */}
                                            {relatedArticle.featuredImage && (
                                                <div className="w-full h-32 mb-4 rounded-lg overflow-hidden">
                                                    <img
                                                        src={relatedArticle.featuredImage}
                                                        alt={relatedArticle.titleEn}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                    />
                                                </div>
                                            )}

                                            {/* Article Info */}
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
                                                        {relatedArticle.category?.replace(/_/g, ' ')}
                                                    </span>
                                                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
                                                        {relatedArticle.difficultyLevel}
                                                    </span>
                                                </div>

                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {relatedArticle.titleEn || relatedArticle.titleRw || relatedArticle.titleFr}
                                                </h3>

                                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                                                    {relatedArticle.summaryEn || relatedArticle.summaryRw || relatedArticle.summaryFr}
                                                </p>

                                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={14} />
                                                        {relatedArticle.estimatedReadTimeMinutes || 15} min read
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={14} />
                                                        {new Date(relatedArticle.createdDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Quick Switch Button */}
                                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full group-hover:bg-blue-50 group-hover:border-blue-300 dark:group-hover:bg-blue-900/20 dark:group-hover:border-blue-600"
                                                >
                                                    <ArrowRight size={16} className="mr-2 group-hover:translate-x-1 transition-transform" />
                                                    Switch to This Article
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                        No Related Articles Found
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        We couldn't find any related articles in this category.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                            <Button
                                variant="outline"
                                onClick={() => navigate('/education')}
                                className="flex items-center gap-2"
                            >
                                <BookOpen size={16} />
                                Browse All Articles
                            </Button>
                            <Button
                                onClick={() => setShowRelatedModal(false)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicArticleDetail;