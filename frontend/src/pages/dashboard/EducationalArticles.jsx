import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

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
    SkeletonLoader
} from '../../components/ui';
import { useGet } from '../../hooks/useSimpleApi';
import { usePost, useDelete } from '../../hooks/useSimpleApi';
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
    const [articles, setArticles] = useState([]);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('');
    const [showFilters, setShowFilters] = useState(false);

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

    // Delete article hook
    const deleteArticle = useDelete('/api/education/articles', {
        onSuccess: (data, variables) => {
            // Remove deleted article from local state
            setArticles(articles.filter(article => article.id !== variables));
            toast.success('Article deleted successfully');
        },
        onError: (error) => {
            console.error('Failed to delete article:', error);
            toast.error('Failed to delete article. Please try again.');
        }
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

    const handleDeleteArticle = async (articleId) => {
        if (!window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
            return;
        }

        try {
            await deleteArticle.execute(articleId);
        } catch (err) {
            // Error handling is done in the hook's onError callback
            console.error('Error in delete handler:', err);
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
                {/* Test button to debug */}
                <button
                    onClick={() => {
                        console.log('Test button clicked for article:', row.id);
                        console.log('Row data:', row);
                        console.log('Navigate function:', navigate);
                    }}
                    className="px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
                >
                    Test
                </button>
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
                            onClick={() => handleDeleteArticle(row.id)}
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
            <div className="space-y-6">
                <div className="text-center py-12">
                    <LoadingSpinner />
                    <p className="mt-4 text-gray-600">Loading educational articles...</p>
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
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Educational Articles</h1>
                        <p className="text-gray-600 dark:text-gray-400">Manage and explore educational content about Rwanda's heritage</p>
                    </div>
                    <div className="flex gap-2">
                        {/* Test button to debug navigation */}
                        <button
                            onClick={() => {
                                console.log('Test button clicked!');
                                console.log('Navigate function:', navigate);
                                console.log('Current user:', user);
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Test Button
                        </button>
                        <MobileButton
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                        </MobileButton>
                        {(user?.role === 'SYSTEM_ADMINISTRATOR' || user?.role === 'CONTENT_MANAGER') && (
                            <MobileButton
                                onClick={() => navigate('/dashboard/education/create?type=article')}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Article
                            </MobileButton>
                        )}
                    </div>
                </div>

                {/* Statistics Cards */}
                {!statsLoading && statistics && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <MobileCard>
                            <MobileCardContent className="text-center p-4">
                                <div className="text-2xl font-bold text-blue-600">
                                    {statistics.totalArticles || 0}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Total Articles</div>
                            </MobileCardContent>
                        </MobileCard>
                        <MobileCard>
                            <MobileCardContent className="text-center p-4">
                                <div className="text-2xl font-bold text-green-600">
                                    {statistics.publicArticles || 0}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Public Articles</div>
                            </MobileCardContent>
                        </MobileCard>
                        <MobileCard>
                            <MobileCardContent className="text-center p-4">
                                <div className="text-2xl font-bold text-yellow-600">
                                    {statistics.privateArticles || 0}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Private Articles</div>
                            </MobileCardContent>
                        </MobileCard>
                        <MobileCard>
                            <MobileCardContent className="text-center p-4">
                                <div className="text-2xl font-bold text-purple-600">
                                    {statistics.recentArticles || 0}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Recent (30 days)</div>
                            </MobileCardContent>
                        </MobileCard>
                    </div>
                )}

                {/* Search and Filters */}
                <MobileCard>
                    <MobileCardContent className="space-y-4">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Search articles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            <MobileButton type="submit">
                                <Search className="w-4 h-4 mr-2" />
                                Search
                            </MobileButton>
                        </form>

                        {showFilters && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
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
                                        Difficulty
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
                                <div className="flex items-end">
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
                    <MobileCardHeader>
                        <MobileCardTitle icon={BookOpen}>
                            Articles ({articles.length})
                        </MobileCardTitle>
                    </MobileCardHeader>
                    <MobileCardContent>
                        {error ? (
                            <div className="text-center py-8 text-red-600">
                                <p>{error}</p>
                                <MobileButton
                                    onClick={() => refetchArticles()}
                                    className="mt-4"
                                >
                                    Retry
                                </MobileButton>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Simple HTML table for reliable display */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-800">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Difficulty</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Access</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {console.log('Rendering articles:', articles)}
                                            {articles.map((article, index) => (
                                                <tr key={article.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        <div className="font-medium">
                                                            {article.titleEn || article.titleRw || article.titleFr || `Article ${article.id}`}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                            {article.category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
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
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
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
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        {new Date(article.createdDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        <div className="flex gap-1">
                                                            {/* Test button to debug */}
                                                            <button
                                                                onClick={() => {
                                                                    console.log('Test button clicked for article:', article.id);
                                                                    console.log('Article data:', article);
                                                                    console.log('Navigate function:', navigate);
                                                                }}
                                                                className="px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
                                                            >
                                                                Test
                                                            </button>
                                                            <MobileButton
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    console.log('View button clicked for article:', article.id);
                                                                    console.log('Navigating to:', `/dashboard/education/articles/${article.id}`);
                                                                    navigate(`/dashboard/education/articles/${article.id}`);
                                                                }}
                                                            >
                                                                <Eye className="w-4 h-4" />
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
                                                                    >
                                                                        <Edit className="w-4 h-4" />
                                                                    </MobileButton>
                                                                    <MobileButton
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleDeleteArticle(article.id)}
                                                                        className="text-red-600 hover:text-red-700"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
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
                        )}
                    </MobileCardContent>
                </MobileCard>
            </div>
        </ComponentErrorBoundary>
    );
};

export default EducationalArticles;
