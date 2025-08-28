import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

import ComponentErrorBoundary from '../../components/error/ComponentErrorBoundary';
import {
    MobileCard,
    MobileCardHeader,
    MobileCardTitle,
    MobileCardContent,
    MobileButton,
    MobileBadge,
    MobileTable,
    createColumn,
    LoadingSpinner,
    SkeletonLoader,
    ConfirmationModal
} from '../../components/ui';

import { useGet } from '../../hooks/useSimpleApi';
import { deleteArticle as deleteArticleApi } from '../../services/api/educationApi';
import { toast } from 'react-hot-toast';
import {
    BookOpen,
    Plus,
    Search,
    Filter,
    Eye,
    Edit,
    Trash2,
    Globe,
    Lock,
    Calendar,
    User,
    Tag
} from 'lucide-react';

const EducationalArticles = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [articles, setArticles] = useState([]);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Delete confirmation modal state
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        articleId: null,
        articleTitle: ''
    });

    // API hooks for articles
    const { data: articlesData, loading: articlesLoading, refetch: refetchArticles } = useGet('/api/education/articles', {
        searchTerm,
        category: selectedCategory,
        difficultyLevel: selectedDifficulty
    }, {
        onSuccess: (data) => {
            const articleItems = data?.data || data || [];
            setArticles(articleItems);
        },
        onError: (error) => {
            console.error('Failed to load articles:', error);
            setError('Failed to load articles. Please try again.');
        }
    });

    // Statistics hook
    const { data: statistics, loading: statsLoading } = useGet('/api/education/articles/statistics', {}, {
        onSuccess: (data) => console.log('Article statistics loaded:', data),
        onError: (error) => console.error('Failed to load article statistics:', error)
    });

    const categories = [
        'History', 'Culture', 'Archaeology', 'Architecture',
        'Traditional Crafts', 'Music & Dance', 'Language', 'Religion',
        'Royal Heritage', 'Colonial Period', 'Independence Era', 'Modern Rwanda'
    ];

    const difficultyLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

    // Update articles when data changes
    useEffect(() => {
        if (articlesData) {
            const articleItems = articlesData?.data || articlesData || [];
            console.log('Articles data received:', articlesData);
            console.log('Setting articles to:', articleItems);
            setArticles(articleItems);
        }
    }, [articlesData]);

    // Open delete confirmation modal
    const openDeleteModal = (articleId, articleTitle) => {
        setDeleteModal({
            isOpen: true,
            articleId,
            articleTitle: articleTitle?.en || articleTitle?.rw || articleTitle?.fr || `Article ${articleId}`
        });
    };

    // Close delete confirmation modal
    const closeDeleteModal = () => {
        setDeleteModal({
            isOpen: false,
            articleId: null,
            articleTitle: ''
        });
    };

    // Confirm delete action
    const confirmDelete = async () => {
        const { articleId } = deleteModal;
        if (!articleId) return;

        try {
            await deleteArticleApi(articleId);
            // Remove deleted article from local state
            setArticles(articles.filter(article => article.id !== articleId));
            toast.success('Article deleted successfully');
            closeDeleteModal();
        } catch (err) {
            console.error('Error in delete handler:', err);
            toast.error('Failed to delete article. Please try again.');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        refetchArticles();
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedDifficulty('');
    };

    const articleColumns = [
        createColumn('title', 'Title', (value, row) => (
            <div className="font-medium text-gray-900 dark:text-white">
                {value?.en || value?.rw || value?.fr || `Article ${row.id}`}
            </div>
        )),
        createColumn('category', 'Category', (value) => (
            <MobileBadge variant="outline">{value}</MobileBadge>
        )),
        createColumn('difficultyLevel', 'Difficulty', (value) => {
            const colors = {
                'Beginner': 'success',
                'Intermediate': 'warning',
                'Advanced': 'warning',
                'Expert': 'destructive'
            };
            return <MobileBadge variant={colors[value] || 'secondary'}>{value}</MobileBadge>;
        }),
        createColumn('isPublic', 'Access', (value) => (
            <div className="flex items-center gap-1">
                {value ? (
                    <Globe className="w-4 h-4 text-green-600" />
                ) : (
                    <Lock className="w-4 h-4 text-gray-600" />
                )}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {value ? 'Public' : 'Private'}
                </span>
            </div>
        )),
        createColumn('createdDate', 'Created', (value) => (
            <span className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(value).toLocaleDateString()}
            </span>
        )),
        createColumn('actions', 'Actions', (value, row) => (
            <div className="flex gap-1">
                <MobileButton
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        console.log('View button clicked for article:', row.id);
                        console.log('Navigating to:', `/dashboard/education/articles/${row.id}`);
                        navigate(`/dashboard/education/articles/${row.id}`);
                    }}
                >
                    <Eye className="w-4 h-4" />
                </MobileButton>

                {/* Take Quiz button for Community Members */}
                {user?.role === 'COMMUNITY_MEMBER' && row.quizId && (
                    <MobileButton
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/dashboard/learning/quiz/${row.quizId}`)}
                        className="text-green-600 hover:text-green-700"
                    >
                        <BookOpen className="w-4 h-4" />
                    </MobileButton>
                )}

                {(user?.role === 'SYSTEM_ADMINISTRATOR' || user?.role === 'CONTENT_MANAGER') && (
                    <>
                        <MobileButton
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                console.log('Edit button clicked for article:', row.id);
                                console.log('Navigating to:', `/dashboard/education/articles/${row.id}/edit`);
                                navigate(`/dashboard/education/articles/${row.id}/edit`);
                            }}
                        >
                            <Edit className="w-4 h-4" />
                        </MobileButton>
                        <MobileButton
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteModal(row.id, row.title)}
                            className="text-red-600 hover:text-red-700"
                        >
                            <Trash2 className="w-4 h-4" />
                        </MobileButton>
                    </>
                )}
            </div>
        ))
    ];

    if (articlesLoading && articles.length === 0) {
        return (
            <div className="min-h-screen p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="text-center py-12">
                        <LoadingSpinner />
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading educational articles...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Debug: Log current state
    console.log('Current articles state:', articles);
    console.log('Articles length:', articles.length);
    console.log('Articles loading:', articlesLoading);

    return (
        <ComponentErrorBoundary>
            <div className="space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white truncate">
                            Educational Articles
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                            Manage and explore educational content about Rwanda's heritage
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <MobileButton
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="w-full sm:w-auto"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Filters</span>
                        </MobileButton>
                        {(user?.role === 'SYSTEM_ADMINISTRATOR' || user?.role === 'CONTENT_MANAGER') && (
                            <MobileButton
                                onClick={() => navigate('/dashboard/education/create?type=article')}
                                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Create Article</span>
                                <span className="sm:hidden">Create</span>
                            </MobileButton>
                        )}
                    </div>
                </div>

                {/* Statistics Cards */}
                {!statsLoading && statistics && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        <MobileCard className="p-3 sm:p-4">
                            <MobileCardContent className="text-center p-2 sm:p-4">
                                <div className="text-lg sm:text-2xl font-bold text-blue-600">
                                    {statistics.totalArticles || 0}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Articles</div>
                            </MobileCardContent>
                        </MobileCard>
                        <MobileCard className="p-3 sm:p-4">
                            <MobileCardContent className="text-center p-2 sm:p-4">
                                <div className="text-lg sm:text-2xl font-bold text-green-600">
                                    {statistics.publicArticles || 0}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Public Articles</div>
                            </MobileCardContent>
                        </MobileCard>
                        <MobileCard className="p-3 sm:p-4">
                            <MobileCardContent className="text-center p-2 sm:p-4">
                                <div className="text-lg sm:text-2xl font-bold text-yellow-600">
                                    {statistics.privateArticles || 0}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Private Articles</div>
                            </MobileCardContent>
                        </MobileCard>
                        <MobileCard className="p-3 sm:p-4">
                            <MobileCardContent className="text-center p-2 sm:p-4">
                                <div className="text-lg sm:text-2xl font-bold text-purple-600">
                                    {statistics.recentArticles || 0}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Recent (30 days)</div>
                            </MobileCardContent>
                        </MobileCard>
                    </div>
                )}

                {/* Search and Filters */}
                <MobileCard>
                    <MobileCardContent className="space-y-4 p-4 sm:p-6">
                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <input
                                type="text"
                                placeholder="Search articles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm px-3 py-2"
                            />
                            <MobileButton type="submit" className="w-full sm:w-auto">
                                <Search className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Search</span>
                                <span className="sm:hidden">Search</span>
                            </MobileButton>
                        </form>

                        {showFilters && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm px-3 py-2"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Difficulty
                                    </label>
                                    <select
                                        value={selectedDifficulty}
                                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm px-3 py-2"
                                    >
                                        <option value="">All Levels</option>
                                        {difficultyLevels.map(level => (
                                            <option key={level} value={level}>{level}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-end sm:col-span-2 lg:col-span-1">
                                    <MobileButton
                                        variant="outline"
                                        onClick={clearFilters}
                                        className="w-full"
                                    >
                                        Clear Filters
                                    </MobileButton>
                                </div>
                            </div>
                        )}
                    </MobileCardContent>
                </MobileCard>

                {/* Articles Table */}
                <MobileCard>
                    <MobileCardHeader className="p-4 sm:p-6">
                        <MobileCardTitle icon={BookOpen} className="text-lg sm:text-xl">
                            Articles ({articles.length})
                        </MobileCardTitle>
                    </MobileCardHeader>
                    <MobileCardContent className="p-0 sm:p-6">
                        {error ? (
                            <div className="text-center py-8 px-4 sm:px-6 text-red-600">
                                <p>{error}</p>
                                <MobileButton
                                    onClick={() => refetchArticles()}
                                    className="mt-4"
                                >
                                    Retry
                                </MobileButton>
                            </div>
                        ) : (
                            <div className="space-y-0">
                                {/* Responsive table with horizontal scroll on small screens */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-800">
                                                <tr>
                                                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                                                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">Category</th>
                                                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Difficulty</th>
                                                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Access</th>
                                                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden xl:table-cell">Created</th>
                                                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                {console.log('Rendering articles:', articles)}
                                                {articles.map((article, index) => (
                                                    <tr key={article.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                            <div className="font-medium max-w-[200px] sm:max-w-none truncate">
                                                                {article.titleEn || article.titleRw || article.titleFr || t('education.untitledArticle')}
                                                            </div>
                                                            {/* Mobile-only category and difficulty info */}
                                                            <div className="sm:hidden mt-1 space-y-1">
                                                                <div className="text-xs text-gray-500">
                                                                    <span className="font-medium">Category:</span> {article.category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    <span className="font-medium">Difficulty:</span> {article.difficultyLevel === 'BEGINNER' ? 'Beginner' :
                                                                        article.difficultyLevel === 'INTERMEDIATE' ? 'Intermediate' :
                                                                            article.difficultyLevel === 'ADVANCED' ? 'Advanced' :
                                                                                article.difficultyLevel}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white hidden sm:table-cell">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                                {article.category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white hidden md:table-cell">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${article.difficultyLevel === 'BEGINNER' ? 'bg-green-100 text-green-800' :
                                                                article.difficultyLevel === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-800' :
                                                                    article.difficultyLevel === 'ADVANCED' ? 'bg-red-100 text-red-800' :
                                                                        'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {article.difficultyLevel === 'BEGINNER' ? 'Beginner' :
                                                                    article.difficultyLevel === 'INTERMEDIATE' ? 'Intermediate' :
                                                                        article.difficultyLevel === 'ADVANCED' ? 'Advanced' :
                                                                            article.difficultyLevel}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white hidden lg:table-cell">
                                                            <div className="flex items-center gap-1">
                                                                {article.isPublic ? (
                                                                    <Globe className="w-4 h-4 text-green-600" />
                                                                ) : (
                                                                    <Lock className="w-4 h-4 text-gray-600" />
                                                                )}
                                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {article.isPublic ? 'Public' : 'Private'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white hidden xl:table-cell">
                                                            {new Date(article.createdDate).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                            <div className="flex flex-wrap gap-1">
                                                                <MobileButton
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        console.log('View button clicked for article:', article.id);
                                                                        console.log('Navigating to:', `/dashboard/education/articles/${article.id}`);
                                                                        navigate(`/dashboard/education/articles/${article.id}`);
                                                                    }}
                                                                    className="text-xs px-2 py-1"
                                                                >
                                                                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                    <span className="hidden sm:inline ml-1">View</span>
                                                                </MobileButton>

                                                                {(user?.role === 'SYSTEM_ADMINISTRATOR' || user?.role === 'CONTENT_MANAGER') && (
                                                                    <>
                                                                        <MobileButton
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => {
                                                                                console.log('Edit button clicked for article:', article.id);
                                                                                console.log('Navigating to:', `/dashboard/education/articles/${article.id}/edit`);
                                                                                navigate(`/dashboard/education/articles/${article.id}/edit`);
                                                                            }}
                                                                            className="text-xs px-2 py-1"
                                                                        >
                                                                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                            <span className="hidden sm:inline ml-1">Edit</span>
                                                                        </MobileButton>
                                                                        <MobileButton
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => openDeleteModal(article.id, article.title)}
                                                                            className="text-red-600 hover:text-red-700 text-xs px-2 py-1"
                                                                        >
                                                                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                            <span className="hidden sm:inline ml-1">Delete</span>
                                                                        </MobileButton>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </MobileCardContent>
                </MobileCard>
            </div>
            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete "${deleteModal.articleTitle}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                icon={Trash2}
            />
        </ComponentErrorBoundary>
    );
};

export default EducationalArticles;
