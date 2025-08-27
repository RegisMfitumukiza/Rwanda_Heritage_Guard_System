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
    LoadingSpinner
} from '../../components/ui';
import { useGet } from '../../hooks/useSimpleApi';
import { useDelete } from '../../hooks/useSimpleApi';
import { toast } from 'react-hot-toast';
import {
    HelpCircle,
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
    Tag,
    Play,
    BookOpen,
    Clock,
    Target
} from 'lucide-react';

const EducationalQuizzes = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState([]);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // API hooks for quizzes
    const { data: quizzesData, loading: quizzesLoading, refetch: refetchQuizzes } = useGet('/api/education/quizzes', {
        searchTerm,
        tag: selectedTag,
        difficultyLevel: selectedDifficulty
    }, {
        onSuccess: (data) => {
            const quizItems = data?.data || data || [];
            setQuizzes(quizItems);
        },
        onError: (error) => {
            console.error('Failed to load quizzes:', error);
            setError('Failed to load quizzes. Please try again.');
        }
    });

    // Delete quiz hook
    const deleteQuiz = useDelete('/api/education/quizzes', {
        onSuccess: (data, variables) => {
            // Remove deleted quiz from local state
            setQuizzes(quizzes.filter(quiz => quiz.id !== variables));
            toast.success('Quiz deleted successfully');
        },
        onError: (error) => {
            console.error('Failed to delete quiz:', error);
            toast.error('Failed to delete quiz. Please try again.');
        }
    });

    const difficultyLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
    const commonTags = [
        'History', 'Culture', 'Archaeology', 'Architecture',
        'Traditional Crafts', 'Music & Dance', 'Language', 'Religion',
        'Royal Heritage', 'Colonial Period', 'Independence Era', 'Modern Rwanda'
    ];

    // Update quizzes when data changes
    useEffect(() => {
        if (quizzesData) {
            const quizItems = quizzesData?.data || quizzesData || [];
            setQuizzes(quizItems);
        }
    }, [quizzesData]);

    // Statistics hook
    const { data: quizStatistics, loading: statsLoading } = useGet('/api/education/quizzes/statistics', {}, {
        onSuccess: (data) => console.log('Quiz statistics loaded:', data),
        onError: (error) => console.error('Failed to load quiz statistics:', error)
    });

    const handleDeleteQuiz = async (quizId) => {
        if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
            return;
        }

        try {
            await deleteQuiz.execute(quizId);
        } catch (err) {
            // Error handling is done in the hook's onError callback
            console.error('Error in delete handler:', err);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        refetchQuizzes();
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedTag('');
        setSelectedDifficulty('');
    };

    const getDifficultyColor = (difficulty) => {
        const colors = {
            'Beginner': 'success',
            'Intermediate': 'warning',
            'Advanced': 'warning',
            'Expert': 'destructive'
        };
        return colors[difficulty] || 'secondary';
    };




    const quizColumns = [
        createColumn('title', 'Title', (value, row) => (
            <div className="font-medium text-gray-900 dark:text-white">
                {value?.en || value?.rw || value?.fr || `Quiz ${row.id}`}
            </div>
        )),
        createColumn('difficultyLevel', 'Difficulty', (value) => (
            <MobileBadge variant={getDifficultyColor(value)}>{value}</MobileBadge>
        )),
        createColumn('questionCount', 'Questions', (value) => (
            <div className="flex items-center gap-1">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">{value || 0}</span>
            </div>
        )),
        createColumn('estimatedDuration', 'Duration', (value) => (
            <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {value ? `${value} min` : 'N/A'}
                </span>
            </div>
        )),
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
        createColumn('tags', 'Tags', (value) => (
            <div className="flex flex-wrap gap-1">
                {value && value.length > 0 ? (
                    value.slice(0, 2).map((tag, index) => (
                        <MobileBadge key={index} variant="outline" className="text-xs">
                            {tag}
                        </MobileBadge>
                    ))
                ) : (
                    <span className="text-sm text-gray-500">No tags</span>
                )}
                {value && value.length > 2 && (
                    <MobileBadge variant="secondary" className="text-xs">
                        +{value.length - 2}
                    </MobileBadge>
                )}
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
                    onClick={() => navigate(`/dashboard/education/quizzes/${row.id}`)}
                >
                    <Eye className="w-4 h-4" />
                </MobileButton>
                <MobileButton
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/dashboard/learning/quizzes/${row.id}`)}
                    className="text-green-600 hover:text-green-700"
                >
                    <Play className="w-4 h-4" />
                </MobileButton>
                {(user?.role === 'SYSTEM_ADMINISTRATOR' || user?.role === 'CONTENT_MANAGER') && (
                    <>
                        <MobileButton
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/dashboard/education/quizzes/${row.id}/edit`)}
                        >
                            <Edit className="w-4 h-4" />
                        </MobileButton>
                        <MobileButton
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteQuiz(row.id)}
                            className="text-red-600 hover:text-red-700"
                        >
                            <Trash2 className="w-4 h-4" />
                        </MobileButton>
                    </>
                )}
            </div>
        ))
    ];

    if (quizzesLoading && quizzes.length === 0) {
        return (
            <div className="space-y-6">
                <div className="text-center py-12">
                    <LoadingSpinner />
                    <p className="mt-4 text-gray-600">Loading educational quizzes...</p>
                </div>
            </div>
        );
    }

    return (
        <ComponentErrorBoundary>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Educational Quizzes</h1>
                        <p className="text-gray-600 dark:text-gray-400">Manage and explore interactive quizzes about Rwanda's heritage</p>
                    </div>
                    <div className="flex gap-2">
                        <MobileButton
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                        </MobileButton>
                        {(user?.role === 'SYSTEM_ADMINISTRATOR' || user?.role === 'CONTENT_MANAGER') && (
                            <MobileButton
                                onClick={() => navigate('/dashboard/education/create?type=quiz')}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Quiz
                            </MobileButton>
                        )}
                    </div>
                </div>

                {/* Statistics Cards */}
                {!statsLoading && quizStatistics && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <MobileCard>
                            <MobileCardContent className="text-center p-4">
                                <div className="text-2xl font-bold text-blue-600">
                                    {quizStatistics.totalQuizzes || 0}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Total Quizzes</div>
                            </MobileCardContent>
                        </MobileCard>
                        <MobileCard>
                            <MobileCardContent className="text-center p-4">
                                <div className="text-2xl font-bold text-green-600">
                                    {quizStatistics.publicQuizzes || 0}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Public Quizzes</div>
                            </MobileCardContent>
                        </MobileCard>
                        <MobileCard>
                            <MobileCardContent className="text-center p-4">
                                <div className="text-2xl font-bold text-yellow-600">
                                    {quizStatistics.totalQuestions || 0}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Total Questions</div>
                            </MobileCardContent>
                        </MobileCard>
                        <MobileCard>
                            <MobileCardContent className="text-center p-4">
                                <div className="text-2xl font-bold text-purple-600">
                                    {quizStatistics.totalAttempts || 0}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Total Attempts</div>
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
                                placeholder="Search quizzes..."
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
                                        Tag
                                    </label>
                                    <select
                                        value={selectedTag}
                                        onChange={(e) => setSelectedTag(e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="">All Tags</option>
                                        {commonTags.map(tag => (
                                            <option key={tag} value={tag}>{tag}</option>
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

                {/* Quizzes Table */}
                <MobileCard>
                    <MobileCardHeader>
                        <MobileCardTitle icon={HelpCircle}>
                            Quizzes ({quizzes.length})
                        </MobileCardTitle>
                    </MobileCardHeader>
                    <MobileCardContent>
                        {error ? (
                            <div className="text-center py-8 text-red-600">
                                <p>{error}</p>
                                <MobileButton
                                    onClick={loadQuizzes}
                                    className="mt-4"
                                >
                                    Retry
                                </MobileButton>
                            </div>
                        ) : quizzes.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <HelpCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    No quizzes found
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    {searchTerm || selectedTag || selectedDifficulty
                                        ? 'Try adjusting your search criteria or filters.'
                                        : 'No educational quizzes have been created yet.'
                                    }
                                </p>
                                {(user?.role === 'SYSTEM_ADMINISTRATOR' || user?.role === 'CONTENT_MANAGER') && (
                                    <MobileButton
                                        onClick={() => navigate('/dashboard/education/create?type=quiz')}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create First Quiz
                                    </MobileButton>
                                )}
                            </div>
                        ) : (
                            <MobileTable
                                data={quizzes}
                                columns={quizColumns}
                                searchable={false}
                                className="max-h-96 overflow-y-auto"
                            />
                        )}
                    </MobileCardContent>
                </MobileCard>
            </div>
        </ComponentErrorBoundary>
    );
};

export default EducationalQuizzes;
