import React, { useState } from 'react';
import {
    BookOpen,
    FileText,
    Languages,
    BarChart3,
    Settings,
    Plus,
    Edit,
    Trash2,
    Eye,
    Users,
    Calendar,
    Tag,
    X,
    Save
} from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Label, Select, TextArea } from '../../components/ui/Form';
import { useGet, usePost, useDelete } from '../../hooks/useSimpleApi';
import { useContentTranslations } from '../../services/api/translationApi';

// Content Creation Modal Component
const ContentCreationModal = ({ isOpen, onClose, contentType, onSubmit, isSubmitting }) => {
    const [formData, setFormData] = useState({
        title: { en: '', rw: '', fr: '' },
        content: { en: '', rw: '', fr: '' },
        category: '',
        difficultyLevel: '',
        summary: '',
        estimatedReadTimeMinutes: 5, // Required by backend
        tags: '',
        isPublic: true,
        isActive: true, // Required by backend
        featuredImage: '',
        youtubeVideoUrl: '',
        relatedArtifactId: '',
        relatedHeritageSiteId: '',
        // Quiz specific fields
        passingScore: 70,
        timeLimit: 30,
        questions: []
    });

    const categories = [
        'HERITAGE_SITES', 'TRADITIONAL_CRAFTS', 'CULTURAL_PRACTICES',
        'HISTORICAL_EVENTS', 'ROYAL_HISTORY', 'TRADITIONAL_MUSIC',
        'ARCHITECTURE', 'CUSTOMS_TRADITIONS', 'GENERAL_EDUCATION'
    ];
    const difficultyLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

    const handleInputChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Transform frontend data structure to match backend DTO
        const transformedData = {
            // Title fields - convert from nested to flat
            titleEn: formData.title.en,
            titleRw: formData.title.rw,
            titleFr: formData.title.fr,

            // Content fields - convert from nested to flat
            contentEn: formData.content.en,
            contentRw: formData.content.rw,
            contentFr: formData.content.fr,

            // Summary fields - convert from single to language-specific
            summaryEn: formData.summary,
            summaryRw: formData.summary, // For now, use same as English
            summaryFr: formData.summary, // For now, use same as English

            // Basic fields
            category: formData.category,
            difficultyLevel: formData.difficultyLevel,
            estimatedReadTimeMinutes: formData.estimatedReadTimeMinutes || 5,

            // Tags and other fields
            tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
            isPublic: formData.isPublic,
            isActive: true, // Default value as required by backend

            // Enhanced content fields
            featuredImage: formData.featuredImage,
            youtubeVideoUrl: formData.youtubeVideoUrl,
            relatedArtifactId: formData.relatedArtifactId ? parseInt(formData.relatedArtifactId) : undefined,
            relatedHeritageSiteId: formData.relatedHeritageSiteId ? parseInt(formData.relatedHeritageSiteId) : undefined
        };

        onSubmit(transformedData);
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Create New ${contentType === 'article' ? 'Article' : 'Quiz'}`}
            size="xl"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title Section */}
                <div className="space-y-4">
                    <Label>Title *</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="title-en">English *</Label>
                            <Input
                                id="title-en"
                                placeholder="Enter title in English"
                                value={formData.title.en}
                                onChange={(e) => handleInputChange('title.en', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="title-rw">Kinyarwanda</Label>
                            <Input
                                id="title-rw"
                                placeholder="Enter title in Kinyarwanda"
                                value={formData.title.rw}
                                onChange={(e) => handleInputChange('title.rw', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="title-fr">French</Label>
                            <Input
                                id="title-fr"
                                placeholder="Enter title in French"
                                value={formData.title.fr}
                                onChange={(e) => handleInputChange('title.fr', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="space-y-4">
                    <Label>Content *</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="content-en">English *</Label>
                            <TextArea
                                id="content-en"
                                placeholder={`Write ${contentType} content in English`}
                                rows={6}
                                value={formData.content.en}
                                onChange={(e) => handleInputChange('content.en', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="content-rw">Kinyarwanda</Label>
                            <TextArea
                                id="content-rw"
                                placeholder={`Write ${contentType} content in Kinyarwanda`}
                                rows={6}
                                value={formData.content.rw}
                                onChange={(e) => handleInputChange('content.rw', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="content-fr">French</Label>
                            <TextArea
                                id="content-fr"
                                placeholder={`Write ${contentType} content in French`}
                                rows={6}
                                value={formData.content.fr}
                                onChange={(e) => handleInputChange('content.fr', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div>
                    <Label htmlFor="summary">Summary *</Label>
                    <TextArea
                        id="summary"
                        placeholder="Brief summary of the content"
                        rows={3}
                        value={formData.summary}
                        onChange={(e) => handleInputChange('summary', e.target.value)}
                        required
                    />
                </div>

                {/* Basic Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select
                            id="category"
                            value={formData.category}
                            onChange={(e) => handleInputChange('category', e.target.value)}
                            required
                        >
                            <option value="">Select category</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="difficultyLevel">Difficulty Level *</Label>
                        <Select
                            id="difficultyLevel"
                            value={formData.difficultyLevel}
                            onChange={(e) => handleInputChange('difficultyLevel', e.target.value)}
                            required
                        >
                            <option value="">Select difficulty</option>
                            {difficultyLevels.map(level => (
                                <option key={level} value={level}>{level}</option>
                            ))}
                        </Select>
                    </div>
                </div>

                {/* Estimated Read Time */}
                <div>
                    <Label htmlFor="estimatedReadTimeMinutes">Estimated Read Time (minutes) *</Label>
                    <Input
                        id="estimatedReadTimeMinutes"
                        type="number"
                        min="1"
                        max="480"
                        value={formData.estimatedReadTimeMinutes || 5}
                        onChange={(e) => handleInputChange('estimatedReadTimeMinutes', parseInt(e.target.value) || 5)}
                        required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                        How long it takes to read this content (1-480 minutes)
                    </p>
                </div>

                {/* Quiz Specific Fields */}
                {contentType === 'quiz' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="passingScore">Passing Score (%)</Label>
                            <Input
                                id="passingScore"
                                type="number"
                                min="0"
                                max="100"
                                value={formData.passingScore}
                                onChange={(e) => handleInputChange('passingScore', parseInt(e.target.value))}
                            />
                        </div>
                        <div>
                            <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                            <Input
                                id="timeLimit"
                                type="number"
                                min="1"
                                value={formData.timeLimit}
                                onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value))}
                            />
                        </div>
                    </div>
                )}

                {/* Tags */}
                <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                        id="tags"
                        placeholder="Enter tags separated by commas (e.g., History, Culture, Rwanda)"
                        value={formData.tags}
                        onChange={(e) => handleInputChange('tags', e.target.value)}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                        Tags help users find your content more easily
                    </p>
                </div>

                {/* Enhanced Content Fields */}
                <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                        Enhanced Content Options
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="featuredImage">Featured Image URL</Label>
                            <Input
                                id="featuredImage"
                                placeholder="https://example.com/image.jpg"
                                value={formData.featuredImage}
                                onChange={(e) => handleInputChange('featuredImage', e.target.value)}
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Optional: Add a featured image to make your content more engaging
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="youtubeVideoUrl">YouTube Video URL</Label>
                            <Input
                                id="youtubeVideoUrl"
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={formData.youtubeVideoUrl}
                                onChange={(e) => handleInputChange('youtubeVideoUrl', e.target.value)}
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Optional: Link to a YouTube video for additional content
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="relatedArtifactId">Related Artifact ID</Label>
                                <Input
                                    id="relatedArtifactId"
                                    type="number"
                                    placeholder="123"
                                    value={formData.relatedArtifactId}
                                    onChange={(e) => handleInputChange('relatedArtifactId', e.target.value)}
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Optional: Link to a related artifact
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="relatedHeritageSiteId">Related Heritage Site ID</Label>
                                <Input
                                    id="relatedHeritageSiteId"
                                    type="number"
                                    placeholder="456"
                                    value={formData.relatedHeritageSiteId}
                                    onChange={(e) => handleInputChange('relatedHeritageSiteId', e.target.value)}
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Optional: Link to a related heritage site
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Public/Private Toggle */}
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="isPublic"
                        checked={formData.isPublic}
                        onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="isPublic">Make this {contentType} public</Label>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isSubmitting ? 'Creating...' : `Create ${contentType === 'article' ? 'Article' : 'Quiz'}`}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

const ContentManagerDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createType, setCreateType] = useState('article');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingContent, setEditingContent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);
    // API hooks
    const { data: articles, loading: articlesLoading, error: articlesError, refetch: refetchArticles } = useGet('/api/education/articles', {}, {
        onSuccess: (data) => {
            console.log('Articles loaded:', data);
        },
        onError: (error) => {
            console.error('Failed to load articles:', error);
        }
    });
    const { data: quizzes, loading: quizzesLoading, error: quizzesError, refetch: refetchQuizzes } = useGet('/api/education/quizzes', {}, {
        onSuccess: (data) => {
            console.log('Quizzes loaded:', data);
        },
        onError: (error) => {
            console.error('Failed to load quizzes:', error);
        }
    });

    // Statistics API hooks
    const { data: articleStats, loading: articleStatsLoading } = useGet('/api/education/articles/statistics', {}, {
        onSuccess: (data) => {
            console.log('Article statistics loaded:', data);
        },
        onError: (error) => {
            console.error('Failed to load article statistics:', error);
        }
    });

    const { data: quizStats, loading: quizStatsLoading } = useGet('/api/education/quizzes/statistics', {}, {
        onSuccess: (data) => {
            console.log('Quiz statistics loaded:', data);
        },
        onError: (error) => {
            console.error('Failed to load quiz statistics:', error);
        }
    });

    const { data: translations, loading: translationsLoading } = useContentTranslations('EDUCATIONAL_ARTICLE', null, 'title');

    const createArticle = usePost('/api/education/articles', {
        onSuccess: (data) => {
            console.log('Article created successfully:', data);
            setShowCreateModal(false);
            refetchArticles();
            alert('Article created successfully!');
        },
        onError: (error) => {
            console.error('Failed to create article:', error);
            alert('Failed to create article. Please try again.');
        }
    });

    const createQuiz = usePost('/api/education/quizzes', {
        onSuccess: (data) => {
            console.log('Quiz created successfully:', data);
            setShowCreateModal(false);
            refetchQuizzes();
            alert('Quiz created successfully!');
        },
        onError: (error) => {
            console.error('Failed to create quiz:', error);
            alert('Failed to create quiz. Please try again.');
        }
    });

    const updateArticle = usePost(`/api/education/articles/${editingContent?.id}`, {
        onSuccess: (data) => {
            console.log('Article updated successfully:', data);
            setShowEditModal(false);
            setEditingContent(null);
            refetchArticles();
            alert('Article updated successfully!');
        },
        onError: (error) => {
            console.error('Failed to update article:', error);
            alert('Failed to update article. Please try again.');
        }
    });

    const updateQuiz = usePost(`/api/education/quizzes/${editingContent?.id}`, {
        onSuccess: (data) => {
            console.log('Quiz updated successfully:', data);
            setShowEditModal(false);
            setEditingContent(null);
            refetchQuizzes();
            alert('Quiz updated successfully!');
        },
        onError: (error) => {
            console.error('Failed to update quiz:', error);
            alert('Failed to update quiz. Please try again.');
        }
    });

    const deleteArticle = useDelete('/api/education/articles', {
        onSuccess: (data) => {
            console.log('Article deleted successfully:', data);
            refetchArticles();
            alert('Article deleted successfully!');
        },
        onError: (error) => {
            console.error('Failed to delete article:', error);
            alert('Failed to delete article. Please try again.');
        }
    });

    const deleteQuiz = useDelete('/api/education/quizzes', {
        onSuccess: (data) => {
            console.log('Quiz deleted successfully:', data);
            refetchQuizzes();
            alert('Quiz deleted successfully!');
        },
        onError: (error) => {
            console.error('Failed to delete quiz:', error);
            alert('Failed to delete quiz. Please try again.');
        }
    });

    // Calculate statistics from dedicated statistics endpoints
    const contentStats = {
        totalArticles: articleStats?.totalArticles || 0,
        totalQuizzes: quizStats?.totalQuizzes || 0,
        publishedContent: (articleStats?.publicArticles || 0) + (quizStats?.publicQuizzes || 0),
        draftContent: (articleStats?.privateArticles || 0) + (quizStats?.totalQuizzes - (quizStats?.publicQuizzes || 0) || 0)
    };

    const recentContent = [
        ...(articles?.content?.slice(0, 3) || []).map(article => ({
            id: article.id,
            title: article.titleEn,
            type: 'article',
            status: article.isPublic ? 'published' : 'draft',
            language: 'en',
            createdDate: article.createdDate
        })),
        ...(quizzes?.content?.slice(0, 2) || []).map(quiz => ({
            id: quiz.id,
            title: quiz.titleEn,
            type: 'quiz',
            status: quiz.isPublic ? 'published' : 'draft',
            language: 'en',
            createdDate: quiz.createdDate
        }))
    ].sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'articles', label: 'Articles', icon: FileText },
        { id: 'quizzes', label: 'Quizzes', icon: BookOpen },
        { id: 'languages', label: 'Languages', icon: Languages },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'settings', label: 'Settings', icon: Settings }
    ];

    const handleCreateContent = (type) => {
        setCreateType(type);
        setShowCreateModal(true);
    };

    const handleEditContent = (content, type) => {
        setEditingContent({ ...content, type });
        setShowEditModal(true);
    };

    const handleDeleteContent = async (id, type) => {
        if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
            if (type === 'article') {
                await deleteArticle.execute(id);
            } else if (createType === 'quiz') {
                await deleteQuiz.execute(id);
            }
        }
    };

    const handleBulkPublish = async () => {
        if (selectedItems.length === 0) {
            alert('Please select items to publish');
            return;
        }

        if (window.confirm(`Publish ${selectedItems.length} selected items?`)) {
            // Implementation for bulk publish
            alert('Bulk publish functionality will be implemented');
            setSelectedItems([]);
        }
    };

    const handleBulkUnpublish = async () => {
        if (selectedItems.length === 0) {
            alert('Please select items to unpublish');
            return;
        }

        if (window.confirm(`Unpublish ${selectedItems.length} selected items?`)) {
            // Implementation for bulk unpublish
            alert('Bulk unpublish functionality will be implemented');
            setSelectedItems([]);
        }
    };

    const handleSelectAll = () => {
        if (activeTab === 'articles') {
            setSelectedItems(articles?.content?.map(a => a.id) || []);
        } else if (activeTab === 'quizzes') {
            setSelectedItems(quizzes?.content?.map(q => q.id) || []);
        }
    };

    const handleSelectItem = (id) => {
        setSelectedItems(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    // Filter content based on search and filters
    const filteredContent = () => {
        let content = [];

        if (activeTab === 'articles') {
            content = articles?.content || [];
        } else if (activeTab === 'quizzes') {
            content = quizzes?.content || [];
        }

        return content.filter(item => {
            const matchesSearch = !searchTerm ||
                (item.titleEn && item.titleEn.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.summary && item.summary.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesCategory = !selectedCategory || item.category === selectedCategory;
            const matchesDifficulty = !selectedDifficulty || item.difficultyLevel === selectedDifficulty;
            const matchesStatus = !selectedStatus ||
                (selectedStatus === 'published' && item.isPublic) ||
                (selectedStatus === 'draft' && !item.isPublic);

            return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
        });
    };



    if (articlesLoading || quizzesLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <>
            <DashboardLayout>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Content Management
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Manage educational content, quizzes, and translations
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <Button
                                onClick={() => handleCreateContent('article')}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                New Article
                            </Button>
                            <Button
                                onClick={() => handleCreateContent('quiz')}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                New Quiz
                            </Button>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900">
                                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Total Articles
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {contentStats.totalArticles}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900">
                                    <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Total Quizzes
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {contentStats.totalQuizzes}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-purple-100 rounded-lg dark:bg-purple-900">
                                    <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Published
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {contentStats.publishedContent}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-yellow-100 rounded-lg dark:bg-yellow-900">
                                    <Edit className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        Drafts
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {contentStats.draftContent}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="-mb-px flex space-x-8">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="space-y-6">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* Recent Content */}
                                <Card className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Recent Content
                                        </h3>
                                        <Button variant="outline" size="sm">
                                            View All
                                        </Button>
                                    </div>
                                    <div className="space-y-3">
                                        {recentContent.map((content) => (
                                            <div key={`${content.type}-${content.id}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`p-2 rounded-lg ${content.type === 'article'
                                                        ? 'bg-blue-100 dark:bg-blue-900'
                                                        : 'bg-green-100 dark:bg-green-900'
                                                        }`}>
                                                        {content.type === 'article' ? (
                                                            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                        ) : (
                                                            <BookOpen className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                                            {content.title}
                                                        </h4>
                                                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                                                            <span className="capitalize">{content.type}</span>
                                                            <span>•</span>
                                                            <span>{content.language}</span>
                                                            <span>•</span>
                                                            <span className={`px-2 py-1 rounded-full text-xs ${content.status === 'published'
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                                }`}>
                                                                {content.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteContent(content.id, content.type)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>

                                {/* Quick Actions */}
                                <Card className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Quick Actions
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <Button
                                            variant="outline"
                                            className="h-20 flex-col justify-center space-y-2"
                                            onClick={() => handleCreateContent('article')}
                                        >
                                            <Plus className="w-6 h-6" />
                                            <span>Create Article</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="h-20 flex-col justify-center space-y-2"
                                            onClick={() => handleCreateContent('quiz')}
                                        >
                                            <Plus className="w-6 h-6" />
                                            <span>Create Quiz</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="h-20 flex-col justify-center space-y-2"
                                        >
                                            <Languages className="w-6 h-6" />
                                            <span>Manage Translations</span>
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {activeTab === 'articles' && (
                            <Card className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Educational Articles
                                    </h3>
                                    <Button onClick={() => handleCreateContent('article')}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        New Article
                                    </Button>
                                </div>

                                {/* Search and Filters */}
                                <div className="mb-6 space-y-4">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex-1">
                                            <Input
                                                placeholder="Search articles..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Select
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                            >
                                                <option value="">All Categories</option>
                                                <option value="History">History</option>
                                                <option value="Culture">Culture</option>
                                                <option value="Archaeology">Archaeology</option>
                                                <option value="Architecture">Architecture</option>
                                                <option value="Traditional Crafts">Traditional Crafts</option>
                                            </Select>
                                            <Select
                                                value={selectedDifficulty}
                                                onChange={(e) => setSelectedDifficulty(e.target.value)}
                                            >
                                                <option value="">All Difficulties</option>
                                                <option value="Beginner">Beginner</option>
                                                <option value="Intermediate">Intermediate</option>
                                                <option value="Advanced">Advanced</option>
                                                <option value="Expert">Expert</option>
                                            </Select>
                                            <Select
                                                value={selectedStatus}
                                                onChange={(e) => setSelectedStatus(e.target.value)}
                                            >
                                                <option value="">All Status</option>
                                                <option value="published">Published</option>
                                                <option value="draft">Draft</option>
                                            </Select>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setSearchTerm('');
                                                    setSelectedCategory('');
                                                    setSelectedDifficulty('');
                                                    setSelectedStatus('');
                                                }}
                                                className="text-gray-600 hover:text-gray-800"
                                            >
                                                Reset Filters
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Bulk Actions */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleSelectAll}
                                                className="text-sm"
                                            >
                                                Select All
                                            </Button>
                                            {selectedItems.length > 0 && (
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {selectedItems.length} selected
                                                </span>
                                            )}
                                        </div>

                                        {selectedItems.length > 0 && (
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={handleBulkPublish}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    Publish Selected
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={handleBulkUnpublish}
                                                    className="bg-yellow-600 hover:bg-yellow-700"
                                                >
                                                    Unpublish Selected
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setSelectedItems([])}
                                                >
                                                    Clear Selection
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {filteredContent().map((article) => (
                                        <div key={article.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(article.id)}
                                                    onChange={() => handleSelectItem(article.id)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        {article.titleEn}
                                                    </h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {article.category} • {article.difficultyLevel} • {new Date(article.createdDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 rounded-full text-xs ${article.isPublic
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                    }`}>
                                                    {article.isPublic ? 'Published' : 'Draft'}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditContent(article, 'article')}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteContent(article.id, 'article')}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {activeTab === 'quizzes' && (
                            <Card className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Educational Quizzes
                                    </h3>
                                    <Button onClick={() => handleCreateContent('quiz')}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        New Quiz
                                    </Button>
                                </div>

                                {/* Search and Filters */}
                                <div className="mb-6 space-y-4">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex-1">
                                            <Input
                                                placeholder="Search quizzes..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Select
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                            >
                                                <option value="">All Categories</option>
                                                <option value="History">History</option>
                                                <option value="Culture">Culture</option>
                                                <option value="Archaeology">Archaeology</option>
                                                <option value="Architecture">Architecture</option>
                                                <option value="Traditional Crafts">Traditional Crafts</option>
                                            </Select>
                                            <Select
                                                value={selectedDifficulty}
                                                onChange={(e) => setSelectedDifficulty(e.target.value)}
                                            >
                                                <option value="">All Difficulties</option>
                                                <option value="Beginner">Beginner</option>
                                                <option value="Intermediate">Intermediate</option>
                                                <option value="Advanced">Advanced</option>
                                                <option value="Expert">Expert</option>
                                            </Select>
                                            <Select
                                                value={selectedStatus}
                                                onChange={(e) => setSelectedStatus(e.target.value)}
                                            >
                                                <option value="">All Status</option>
                                                <option value="published">Published</option>
                                                <option value="draft">Draft</option>
                                            </Select>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setSearchTerm('');
                                                    setSelectedCategory('');
                                                    setSelectedDifficulty('');
                                                    setSelectedStatus('');
                                                }}
                                                className="text-gray-600 hover:text-gray-800"
                                            >
                                                Reset Filters
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Bulk Actions */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleSelectAll}
                                                className="text-sm"
                                            >
                                                Select All
                                            </Button>
                                            {selectedItems.length > 0 && (
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {selectedItems.length} selected
                                                </span>
                                            )}
                                        </div>

                                        {selectedItems.length > 0 && (
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={handleBulkPublish}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    Publish Selected
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={handleBulkUnpublish}
                                                    className="bg-yellow-600 hover:bg-yellow-700"
                                                >
                                                    Unpublish Selected
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setSelectedItems([])}
                                                >
                                                    Clear Selection
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {filteredContent().map((quiz) => (
                                        <div key={quiz.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(quiz.id)}
                                                    onChange={() => handleSelectItem(quiz.id)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        {quiz.titleEn}
                                                    </h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {quiz.category} • {quiz.difficultyLevel} • Passing Score: {quiz.passingScore}% • Time Limit: {quiz.timeLimit}min
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 rounded-full text-xs ${quiz.isPublic
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                    }`}>
                                                    {quiz.isPublic ? 'Published' : 'Draft'}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditContent(quiz, 'quiz')}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteContent(quiz.id, 'quiz')}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {activeTab === 'languages' && (
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Language Management
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className="text-lg font-medium">🇺🇸</span>
                                            <span className="font-medium">English</span>
                                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Default</span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Primary language for content
                                        </p>
                                    </div>
                                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className="text-lg font-medium">🇷🇼</span>
                                            <span className="font-medium">Kinyarwanda</span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Local language support
                                        </p>
                                    </div>
                                    <div className="p-4 border border-gray-600 dark:border-gray-700 rounded-lg">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className="text-lg font-medium">🇫🇷</span>
                                            <span className="font-medium">French</span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            International language support
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {activeTab === 'analytics' && (
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Content Analytics
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                                            Content Distribution
                                        </h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Articles</span>
                                                <span className="font-medium">{contentStats.totalArticles}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Quizzes</span>
                                                <span className="font-medium">{contentStats.totalQuizzes}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Published</span>
                                                <span className="font-medium">{contentStats.publishedContent}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Drafts</span>
                                                <span className="font-medium">{contentStats.draftContent}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                                            Recent Activity
                                        </h4>
                                        <div className="space-y-2">
                                            {recentContent.slice(0, 5).map((content) => (
                                                <div key={`${content.type}-${content.id}`} className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {content.title}
                                                    </span>
                                                    <span className="text-gray-500 dark:text-gray-500">
                                                        {new Date(content.createdDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {activeTab === 'settings' && (
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Content Settings
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                Auto-publish Content
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Automatically publish content when created
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                Require Translation Review
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Require approval for translations
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </DashboardLayout>

            {/* Content Creation Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title={`Create New ${createType === 'article' ? 'Article' : 'Quiz'}`}
                size="xl"
            >
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const data = {
                        titleEn: formData.get('titleEn'),
                        titleRw: formData.get('titleRw'),
                        titleFr: formData.get('titleFr'),
                        contentEn: formData.get('contentEn'),
                        contentRw: formData.get('contentRw'),
                        contentFr: formData.get('contentFr'),
                        summary: formData.get('summary'),
                        category: formData.get('category'),
                        difficultyLevel: formData.get('difficultyLevel'),
                        tags: formData.get('tags'),
                        isPublic: formData.get('isPublic') === 'on',
                        featuredImage: formData.get('featuredImage'),
                        youtubeVideoUrl: formData.get('youtubeVideoUrl'),
                        relatedArtifactId: formData.get('relatedArtifactId') ? parseInt(formData.get('relatedArtifactId')) : undefined,
                        relatedHeritageSiteId: formData.get('relatedHeritageSiteId') ? parseInt(formData.get('relatedHeritageSiteId')) : undefined
                    };

                    if (createType === 'quiz') {
                        data.passingScore = parseInt(formData.get('passingScore'));
                        data.timeLimit = parseInt(formData.get('timeLimit'));
                    }

                    if (createType === 'article') {
                        createArticle.execute(data);
                    } else if (createType === 'quiz') {
                        createQuiz.execute(data);
                    }
                }} className="space-y-6">

                    {/* Title Section */}
                    <div className="space-y-4">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title *</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="titleEn" className="text-xs text-gray-600 dark:text-gray-400">English *</Label>
                                <Input
                                    id="titleEn"
                                    name="titleEn"
                                    placeholder="Enter title in English"
                                    required
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="titleRw" className="text-xs text-gray-600 dark:text-gray-400">Kinyarwanda</Label>
                                <Input
                                    id="titleRw"
                                    name="titleRw"
                                    placeholder="Enter title in Kinyarwanda"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="titleFr" className="text-xs text-gray-600 dark:text-gray-400">French</Label>
                                <Input
                                    id="titleFr"
                                    name="titleFr"
                                    placeholder="Enter title in French"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="space-y-4">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Content *</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="contentEn" className="text-xs text-gray-600 dark:text-gray-400">English *</Label>
                                <TextArea
                                    id="contentEn"
                                    name="contentEn"
                                    placeholder={`Write ${createType} content in English`}
                                    rows={6}
                                    required
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="contentRw" className="text-xs text-gray-600 dark:text-gray-400">Kinyarwanda</Label>
                                <TextArea
                                    id="contentRw"
                                    name="contentRw"
                                    placeholder={`Write ${createType} content in Kinyarwanda`}
                                    rows={6}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="contentFr" className="text-xs text-gray-600 dark:text-gray-400">French</Label>
                                <TextArea
                                    id="contentFr"
                                    name="contentFr"
                                    placeholder={`Write ${createType} content in French`}
                                    rows={6}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div>
                        <Label htmlFor="summary" className="text-sm font-medium text-gray-700 dark:text-gray-300">Summary *</Label>
                        <TextArea
                            id="summary"
                            name="summary"
                            placeholder="Brief summary of the content"
                            rows={3}
                            required
                            className="mt-1"
                        />
                    </div>

                    {/* Basic Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-300">Category *</Label>
                            <Select
                                id="category"
                                name="category"
                                required
                                className="mt-1"
                            >
                                <option value="">Select category</option>
                                <option value="History">History</option>
                                <option value="Culture">Culture</option>
                                <option value="Archaeology">Archaeology</option>
                                <option value="Architecture">Architecture</option>
                                <option value="Traditional Crafts">Traditional Crafts</option>
                                <option value="Natural Heritage">Natural Heritage</option>
                                <option value="Religious Sites">Religious Sites</option>
                                <option value="Modern Rwanda">Modern Rwanda</option>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="difficultyLevel" className="text-sm font-medium text-gray-700 dark:text-gray-300">Difficulty Level *</Label>
                            <Select
                                id="difficultyLevel"
                                name="difficultyLevel"
                                required
                                className="mt-1"
                            >
                                <option value="">Select difficulty</option>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                                <option value="Expert">Expert</option>
                            </Select>
                        </div>
                    </div>

                    {/* Estimated Read Time */}
                    <div>
                        <Label htmlFor="estimatedReadTimeMinutes" className="text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Read Time (minutes) *</Label>
                        <Input
                            id="estimatedReadTimeMinutes"
                            name="estimatedReadTimeMinutes"
                            type="number"
                            min="1"
                            max="480"
                            defaultValue="5"
                            required
                            className="mt-1"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            How long it takes to read this content (1-480 minutes)
                        </p>
                    </div>

                    {/* Quiz Specific Fields */}
                    {createType === 'quiz' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="passingScore" className="text-sm font-medium text-gray-700 dark:text-gray-300">Passing Score (%)</Label>
                                <Input
                                    id="passingScore"
                                    name="passingScore"
                                    type="number"
                                    min="0"
                                    max="100"
                                    defaultValue="70"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="timeLimit" className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Limit (minutes)</Label>
                                <Input
                                    id="timeLimit"
                                    name="timeLimit"
                                    type="number"
                                    min="1"
                                    defaultValue="30"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    <div>
                        <Label htmlFor="tags" className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags</Label>
                        <Input
                            id="tags"
                            name="tags"
                            placeholder="Enter tags separated by commas (e.g., History, Culture, Rwanda)"
                            className="mt-1"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Tags help users find your content more easily
                        </p>
                    </div>

                    {/* Enhanced Content Fields */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                            Enhanced Content Options
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="featuredImage" className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured Image</Label>
                                <div className="mt-1 space-y-2">
                                    <Input
                                        id="featuredImage"
                                        name="featuredImage"
                                        placeholder="https://example.com/image.jpg"
                                        className="mb-2"
                                    />
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    // For now, just show the filename
                                                    // In a real implementation, you'd upload to server
                                                    alert(`File selected: ${file.name}\n\nNote: File upload functionality will be implemented in the backend.`);
                                                }
                                            }}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    Optional: Add a featured image to make your content more engaging
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="youtubeVideoUrl" className="text-sm font-medium text-gray-700 dark:text-gray-300">YouTube Video URL</Label>
                                <Input
                                    id="youtubeVideoUrl"
                                    name="youtubeVideoUrl"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="mt-1"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Optional: Link to a YouTube video for additional content
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="relatedArtifactId" className="text-sm font-medium text-gray-700 dark:text-gray-300">Related Artifact ID</Label>
                                    <Input
                                        id="relatedArtifactId"
                                        name="relatedArtifactId"
                                        type="number"
                                        placeholder="123"
                                        className="mt-1"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Optional: Link to a related artifact
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="relatedHeritageSiteId" className="text-sm font-medium text-gray-700 dark:text-gray-300">Related Heritage Site ID</Label>
                                    <Input
                                        id="relatedHeritageSiteId"
                                        name="relatedHeritageSiteId"
                                        type="number"
                                        placeholder="456"
                                        className="mt-1"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Optional: Link to a related heritage site
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Public/Private Toggle */}
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="isPublic"
                            name="isPublic"
                            defaultChecked
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor="isPublic" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Make this {createType} public
                        </Label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowCreateModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Create {createType === 'article' ? 'Article' : 'Quiz'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Content Edit Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingContent(null);
                }}
                title={`Edit ${editingContent?.type === 'article' ? 'Article' : 'Quiz'}`}
                size="xl"
            >
                {editingContent && (
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        const data = {
                            titleEn: formData.get('titleEn'),
                            titleRw: formData.get('titleRw'),
                            titleFr: formData.get('titleFr'),
                            contentEn: formData.get('contentEn'),
                            contentRw: formData.get('contentRw'),
                            contentFr: formData.get('contentFr'),
                            summary: formData.get('summary'),
                            category: formData.get('category'),
                            difficultyLevel: formData.get('difficultyLevel'),
                            tags: formData.get('tags'),
                            isPublic: formData.get('isPublic') === 'on',
                            featuredImage: formData.get('featuredImage'),
                            youtubeVideoUrl: formData.get('youtubeVideoUrl'),
                            relatedArtifactId: formData.get('relatedArtifactId') ? parseInt(formData.get('relatedArtifactId')) : undefined,
                            relatedHeritageSiteId: formData.get('relatedHeritageSiteId') ? parseInt(formData.get('relatedHeritageSiteId')) : undefined
                        };

                        if (editingContent.type === 'quiz') {
                            data.passingScore = parseInt(formData.get('passingScore'));
                            data.timeLimit = parseInt(formData.get('timeLimit'));
                        }

                        if (editingContent.type === 'article') {
                            updateArticle.execute(data);
                        } else if (editingContent.type === 'quiz') {
                            updateQuiz.execute(data);
                        }
                    }} className="space-y-6">

                        {/* Title Section */}
                        <div className="space-y-4">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title *</Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="edit-titleEn" className="text-xs text-gray-600 dark:text-gray-400">English *</Label>
                                    <Input
                                        id="edit-titleEn"
                                        name="titleEn"
                                        defaultValue={editingContent.titleEn}
                                        placeholder="Enter title in English"
                                        required
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-titleRw" className="text-xs text-gray-600 dark:text-gray-400">Kinyarwanda</Label>
                                    <Input
                                        id="edit-titleRw"
                                        name="titleRw"
                                        placeholder="Enter title in Kinyarwanda"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-titleFr" className="text-xs text-gray-600 dark:text-gray-400">French</Label>
                                    <Input
                                        id="edit-titleFr"
                                        name="titleFr"
                                        placeholder="Enter title in French"
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="space-y-4">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Content *</Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="edit-contentEn" className="text-xs text-gray-600 dark:text-gray-400">English *</Label>
                                    <TextArea
                                        id="edit-contentEn"
                                        name="contentEn"
                                        defaultValue={editingContent.contentEn}
                                        placeholder={`Write ${editingContent.type} content in English`}
                                        rows={6}
                                        required
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-contentRw" className="text-xs text-gray-600 dark:text-gray-400">Kinyarwanda</Label>
                                    <TextArea
                                        id="edit-contentRw"
                                        name="contentRw"
                                        placeholder={`Write ${editingContent.type} content in Kinyarwanda`}
                                        rows={6}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-contentFr" className="text-xs text-gray-600 dark:text-gray-400">French</Label>
                                    <TextArea
                                        id="edit-contentFr"
                                        name="contentFr"
                                        placeholder={`Write ${editingContent.type} content in French`}
                                        rows={6}
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div>
                            <Label htmlFor="edit-summary" className="text-sm font-medium text-gray-700 dark:text-gray-300">Summary *</Label>
                            <TextArea
                                id="edit-summary"
                                name="summary"
                                defaultValue={editingContent.summary}
                                placeholder="Brief summary of the content"
                                rows={3}
                                required
                                className="mt-1"
                            />
                        </div>

                        {/* Basic Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-category" className="text-sm font-medium text-gray-700 dark:text-gray-300">Category *</Label>
                                <Select
                                    id="edit-category"
                                    name="category"
                                    defaultValue={editingContent.category}
                                    required
                                    className="mt-1"
                                >
                                    <option value="">Select category</option>
                                    <option value="History">History</option>
                                    <option value="Culture">Culture</option>
                                    <option value="Archaeology">Archaeology</option>
                                    <option value="Architecture">Architecture</option>
                                    <option value="Traditional Crafts">Traditional Crafts</option>
                                    <option value="Natural Heritage">Natural Heritage</option>
                                    <option value="Religious Sites">Religious Sites</option>
                                    <option value="Modern Rwanda">Modern Rwanda</option>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="edit-difficultyLevel" className="text-sm font-medium text-gray-700 dark:text-gray-300">Difficulty Level *</Label>
                                <Select
                                    id="edit-difficultyLevel"
                                    name="difficultyLevel"
                                    defaultValue={editingContent.difficultyLevel}
                                    required
                                    className="mt-1"
                                >
                                    <option value="">Select difficulty</option>
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                    <option value="Expert">Expert</option>
                                </Select>
                            </div>
                        </div>

                        {/* Estimated Read Time */}
                        <div>
                            <Label htmlFor="edit-estimatedReadTimeMinutes" className="text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Read Time (minutes) *</Label>
                            <Input
                                id="edit-estimatedReadTimeMinutes"
                                name="estimatedReadTimeMinutes"
                                type="number"
                                min="1"
                                max="480"
                                defaultValue={editingContent.estimatedReadTimeMinutes || 5}
                                required
                                className="mt-1"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                How long it takes to read this content (1-480 minutes)
                            </p>
                        </div>

                        {/* Quiz Specific Fields */}
                        {editingContent.type === 'quiz' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit-passingScore" className="text-sm font-medium text-gray-700 dark:text-gray-300">Passing Score (%)</Label>
                                    <Input
                                        id="edit-passingScore"
                                        name="passingScore"
                                        type="number"
                                        min="0"
                                        max="100"
                                        defaultValue={editingContent.passingScore}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-timeLimit" className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Limit (minutes)</Label>
                                    <Input
                                        id="edit-timeLimit"
                                        name="timeLimit"
                                        type="number"
                                        min="1"
                                        defaultValue={editingContent.timeLimit}
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        <div>
                            <Label htmlFor="edit-tags" className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags</Label>
                            <Input
                                id="edit-tags"
                                name="tags"
                                defaultValue={editingContent.tags}
                                placeholder="Enter tags separated by commas (e.g., History, Culture, Rwanda)"
                                className="mt-1"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Tags help users find your content more easily
                            </p>
                        </div>

                        {/* Enhanced Content Fields */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                                Enhanced Content Options
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="edit-featuredImage" className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured Image</Label>
                                    <div className="mt-1 space-y-2">
                                        <Input
                                            id="edit-featuredImage"
                                            name="featuredImage"
                                            defaultValue={editingContent.featuredImage}
                                            placeholder="https://example.com/image.jpg"
                                            className="mb-2"
                                        />
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        // For now, just show the filename
                                                        // In a real implementation, you'd upload to server
                                                        alert(`File selected: ${file.name}\n\nNote: File upload functionality will be implemented in the backend.`);
                                                    }
                                                }}
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Optional: Add a featured image to make your content more engaging
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="edit-youtubeVideoUrl" className="text-sm font-medium text-gray-700 dark:text-gray-300">YouTube Video URL</Label>
                                    <Input
                                        id="edit-youtubeVideoUrl"
                                        name="youtubeVideoUrl"
                                        defaultValue={editingContent.youtubeVideoUrl}
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        className="mt-1"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Optional: Link to a YouTube video for additional content
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="edit-relatedArtifactId" className="text-sm font-medium text-gray-700 dark:text-gray-300">Related Artifact ID</Label>
                                        <Input
                                            id="edit-relatedArtifactId"
                                            name="relatedArtifactId"
                                            type="number"
                                            defaultValue={editingContent.relatedArtifactId}
                                            placeholder="123"
                                            className="mt-1"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Optional: Link to a related artifact
                                        </p>
                                    </div>

                                    <div>
                                        <Label htmlFor="edit-relatedHeritageSiteId" className="text-sm font-medium text-gray-700 dark:text-gray-300">Related Heritage Site ID</Label>
                                        <Input
                                            id="edit-relatedHeritageSiteId"
                                            name="relatedHeritageSiteId"
                                            type="number"
                                            defaultValue={editingContent.relatedHeritageSiteId}
                                            placeholder="456"
                                            className="mt-1"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Optional: Link to a related heritage site
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Public/Private Toggle */}
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="edit-isPublic"
                                name="isPublic"
                                defaultChecked={editingContent.isPublic}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <Label htmlFor="edit-isPublic" className="text-sm font-medium text-gray-700 dark:text-gray-700">
                                Make this {editingContent.type} public
                            </Label>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditingContent(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Update {editingContent.type === 'article' ? 'Article' : 'Quiz'}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </>
    );
};

export default ContentManagerDashboard; 