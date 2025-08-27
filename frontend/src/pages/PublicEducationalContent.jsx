import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useGet } from '../hooks/useSimpleApi';
import {
    MobileCard,
    MobileCardContent,
    MobileButton,
    LoadingSpinner,
    Badge
} from '../components/ui';
import {
    BookOpen,
    Search,
    Filter,
    Globe,
    Clock,
    Tag,
    Play,
    Award,
    ArrowRight,
    Eye
} from 'lucide-react';

const PublicEducationalContent = () => {
    const { currentLanguage } = useLanguage();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [showArticleModal, setShowArticleModal] = useState(false);

    // Fetch public educational articles
    const { data: articlesData, loading: articlesLoading, error: articlesError } = useGet('/api/education/articles/public', {
        searchTerm,
        category: selectedCategory,
        difficultyLevel: selectedDifficulty
    }, {
        onSuccess: (data) => console.log('Public articles loaded:', data),
        onError: (error) => console.error('Failed to load public articles:', error)
    });

    const articles = articlesData?.data || articlesData || [];

    const categories = [
        'History', 'Culture', 'Archaeology', 'Architecture',
        'Traditional Crafts', 'Music & Dance', 'Language', 'Religion',
        'Royal Heritage', 'Colonial Period', 'Independence Era', 'Modern Rwanda'
    ];

    const difficultyLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

    const handleSearch = (e) => {
        e.preventDefault();
        // Search is handled by the API hook
    };

    const clearFilters = () => {
        setSelectedCategory('');
        setSelectedDifficulty('');
        setSearchTerm('');
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'beginner': return 'bg-green-100 text-green-800';
            case 'intermediate': return 'bg-yellow-100 text-yellow-800';
            case 'advanced': return 'bg-orange-100 text-orange-800';
            case 'expert': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleReadArticle = (article) => {
        setSelectedArticle(article);
        setShowArticleModal(true);
    };

    const handleTakeQuiz = (articleId, quizId) => {
        // Close modal first
        setShowArticleModal(false);
        setSelectedArticle(null);

        // Check if user is authenticated
        if (!localStorage.getItem('token')) {
            navigate('/login?redirect=' + encodeURIComponent(`/dashboard/learning/quiz/${quizId}`));
        } else {
            navigate(`/dashboard/learning/quiz/${quizId}`);
        }
    };

    const closeArticleModal = () => {
        setShowArticleModal(false);
        setSelectedArticle(null);
    };

    if (articlesLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-12">
                        <LoadingSpinner />
                        <p className="mt-4 text-gray-600">Loading educational content...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Rwanda Heritage Learning Center
                            </h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Discover the rich history and culture of Rwanda through educational articles
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link to="/">
                                <MobileButton variant="outline">
                                    Back to Home
                                </MobileButton>
                            </Link>
                            <Link to="/login">
                                <MobileButton>
                                    Sign In
                                </MobileButton>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search and Filters */}
                <MobileCard className="mb-8">
                    <MobileCardContent className="space-y-4">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Search articles about Rwanda's heritage..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            <MobileButton type="submit">
                                <Search className="w-4 h-4 mr-2" />
                                Search
                            </MobileButton>
                        </form>

                        <div className="flex items-center justify-between">
                            <MobileButton
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2"
                            >
                                <Filter className="w-4 h-4" />
                                {showFilters ? 'Hide' : 'Show'} Filters
                            </MobileButton>

                            {showFilters && (
                                <MobileButton
                                    variant="outline"
                                    onClick={clearFilters}
                                    className="text-sm"
                                >
                                    Clear All
                                </MobileButton>
                            )}
                        </div>

                        {showFilters && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Difficulty Level
                                    </label>
                                    <select
                                        value={selectedDifficulty}
                                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="">All Levels</option>
                                        {difficultyLevels.map(level => (
                                            <option key={level} value={level}>{level}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </MobileCardContent>
                </MobileCard>

                {/* Content Stats */}
                <div className="mb-8">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                            <BookOpen className="w-5 h-5" />
                            <span className="font-medium">
                                {articles.length} Educational Articles Available
                            </span>
                        </div>
                        <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                            Click on any article card to read the full content. Sign in to take quizzes and track your learning progress.
                        </p>
                    </div>
                </div>

                {/* Articles Grid */}
                {articlesError ? (
                    <div className="text-center py-12">
                        <p className="text-red-600 mb-4">Failed to load articles</p>
                        <MobileButton onClick={() => window.location.reload()}>
                            Try Again
                        </MobileButton>
                    </div>
                ) : articles.length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No articles found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {searchTerm || selectedCategory || selectedDifficulty
                                ? 'Try adjusting your search criteria or filters.'
                                : 'No educational articles are currently available.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articles.map((article) => (
                            <MobileCard
                                key={article.id}
                                className="h-full flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => handleReadArticle(article)}
                            >
                                <MobileCardContent className="flex-1 flex flex-col p-6">
                                    {/* Featured Image */}
                                    {article.featuredImage && (
                                        <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden mb-4">
                                            <img
                                                src={article.featuredImage}
                                                alt={article.titleEn || 'Article'}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* Article Info */}
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                            {article.titleEn || `Article ${article.id}`}
                                        </h3>

                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                                            {article.summaryEn || 'No summary available'}
                                        </p>

                                        {/* Metadata */}
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                <Tag className="w-4 h-4" />
                                                <span>{article.category}</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                <Clock className="w-4 h-4" />
                                                <span>{article.estimatedReadTimeMinutes || 5} min read</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Badge className={getDifficultyColor(article.difficultyLevel)}>
                                                    {article.difficultyLevel}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* External Resources */}
                                        {article.youtubeVideoUrl && (
                                            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <Play className="w-4 h-4 text-red-600" />
                                                    <span>Video content available</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Quiz Available */}
                                        {article.quizId && (
                                            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                                <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                                                    <Award className="w-4 h-4" />
                                                    <span>Quiz available to test your knowledge</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Button */}
                                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <div className="text-blue-600 hover:text-blue-700 font-medium text-center">
                                            Read Article →
                                        </div>
                                    </div>
                                </MobileCardContent>
                            </MobileCard>
                        ))}
                    </div>
                )}

                {/* Call to Action */}
                <div className="mt-12 text-center">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
                        <h2 className="text-2xl font-bold mb-4">
                            Ready to Test Your Knowledge?
                        </h2>
                        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                            Sign in to access quizzes, track your learning progress, and unlock the full
                            educational experience of Rwanda's heritage.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Link to="/register">
                                <MobileButton className="bg-white text-blue-600 hover:bg-gray-100">
                                    Create Account
                                </MobileButton>
                            </Link>
                            <Link to="/login">
                                <MobileButton variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                                    Sign In
                                </MobileButton>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Article Modal */}
            {showArticleModal && selectedArticle && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {selectedArticle.titleEn || `Article ${selectedArticle.id}`}
                                </h2>
                                <button
                                    onClick={closeArticleModal}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Article Content */}
                            <div className="space-y-6">
                                {/* Featured Image */}
                                {selectedArticle.featuredImage && (
                                    <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                                        <img
                                            src={selectedArticle.featuredImage}
                                            alt={selectedArticle.titleEn || 'Article'}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                {/* Article Metadata */}
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <Tag className="w-4 h-4" />
                                        <span>{selectedArticle.category}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        <span>{selectedArticle.estimatedReadTimeMinutes || 5} min read</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Badge className={getDifficultyColor(selectedArticle.difficultyLevel)}>
                                            {selectedArticle.difficultyLevel}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Article Content */}
                                <div className="prose prose-lg max-w-none dark:prose-invert">
                                    <div
                                        className="whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300"
                                        dangerouslySetInnerHTML={{ __html: selectedArticle.contentEn || 'Content not available' }}
                                    />
                                </div>

                                {/* External Resources */}
                                {selectedArticle.youtubeVideoUrl && (
                                    <div className="border-t pt-6">
                                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                            <Play className="w-5 h-5 text-red-600" />
                                            Related Video
                                        </h3>
                                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                Watch additional content related to this article:
                                            </p>
                                            <a
                                                href={selectedArticle.youtubeVideoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
                                            >
                                                Watch on YouTube →
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* Quiz Section */}
                                {selectedArticle.quizId && (
                                    <div className="border-t pt-6">
                                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                            <Award className="w-5 h-5 text-green-600" />
                                            Test Your Knowledge
                                        </h3>
                                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                                            <p className="text-green-800 dark:text-green-200 mb-4">
                                                Take a quiz to test what you've learned from this article.
                                            </p>
                                            <MobileButton
                                                onClick={() => handleTakeQuiz(selectedArticle.id, selectedArticle.quizId)}
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                <Award className="w-4 h-4 mr-2" />
                                                Take Quiz
                                            </MobileButton>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <MobileButton variant="outline" onClick={closeArticleModal}>
                                    Close
                                </MobileButton>
                                {selectedArticle.quizId && (
                                    <MobileButton
                                        onClick={() => handleTakeQuiz(selectedArticle.id, selectedArticle.quizId)}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <Award className="w-4 h-4 mr-2" />
                                        Take Quiz
                                    </MobileButton>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicEducationalContent;
