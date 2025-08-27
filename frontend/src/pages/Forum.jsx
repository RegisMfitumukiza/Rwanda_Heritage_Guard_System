import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    Plus,
    Search,
    Globe,
    Users,
    Calendar,
    ThumbsUp,
    Reply,
    Flag,
    Edit,
    Trash2,
    Filter,
    TrendingUp,
    Shield,
    Settings,
    Eye,
    EyeOff
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useGet, usePost } from '../hooks/useSimpleApi';

const Forum = () => {
    const [activeTab, setActiveTab] = useState('topics');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateTopic, setShowCreateTopic] = useState(false);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [showCreateCategory, setShowCreateCategory] = useState(false);
    const [newTopicData, setNewTopicData] = useState({ title: '', content: '', categoryId: '' });
    const [newPostData, setNewPostData] = useState({ content: '' });
    const [newCategoryData, setNewCategoryData] = useState({ name: '', description: '', isPublic: true });

    const { currentLanguage } = useLanguage();
    const { user } = useAuth();

    // API hooks using new simplified system
    const { data: categories, loading: categoriesLoading, refetch: refetchCategories } = useGet('/api/forum/categories', {}, {
        onSuccess: (data) => console.log('Forum categories loaded:', data),
        onError: (error) => console.error('Failed to load forum categories:', error)
    });

    const { data: topics, loading: topicsLoading, refetch: refetchTopics } = useGet('/api/forum/topics', {}, {
        onSuccess: (data) => console.log('Forum topics loaded:', data),
        onError: (error) => console.error('Failed to load forum topics:', error)
    });

    const { data: posts, loading: postsLoading } = useGet(`/api/forum/topics/${selectedTopic?.id}/posts`, {}, {
        enabled: !!selectedTopic?.id,
        onSuccess: (data) => console.log('Forum posts loaded:', data),
        onError: (error) => console.error('Failed to load forum posts:', error)
    });

    const { data: userLanguages } = useGet('/api/forum/user-language-preferences', {}, {
        onSuccess: (data) => console.log('User language preferences loaded:', data),
        onError: (error) => console.error('Failed to load user language preferences:', error)
    });

    const { data: reports, loading: reportsLoading, refetch: refetchReports } = useGet('/api/forum/reports', {}, {
        onSuccess: (data) => console.log('Forum reports loaded:', data),
        onError: (error) => console.error('Failed to load forum reports:', error)
    });

    const createTopic = usePost('/api/forum/topics', {
        onSuccess: (data) => {
            console.log('Topic created:', data);
            refetchTopics();
        },
        onError: (error) => console.error('Failed to create topic:', error)
    });

    const createPost = usePost('/api/forum/posts', {
        onSuccess: (data) => {
            console.log('Post created:', data);
        },
        onError: (error) => console.error('Failed to create post:', error)
    });

    const createCategory = usePost('/api/forum/categories', {
        onSuccess: (data) => {
            console.log('Category created:', data);
            refetchCategories();
        },
        onError: (error) => console.error('Failed to create category:', error)
    });

    const updateReportStatus = usePost('/api/forum/reports/update', {
        onSuccess: (data) => {
            console.log('Report status updated:', data);
            refetchReports();
        },
        onError: (error) => console.error('Failed to update report status:', error)
    });

    // Enhanced tabs based on user role
    const getTabs = () => {
        const baseTabs = [
            { id: 'topics', label: 'Topics', icon: MessageSquare },
            { id: 'categories', label: 'Categories', icon: Globe },
            { id: 'my-posts', label: 'My Posts', icon: Users },
            { id: 'trending', label: 'Trending', icon: TrendingUp }
        ];

        // Add moderation tabs for content managers and admins
        if (user?.role === 'CONTENT_MANAGER' || user?.role === 'SYSTEM_ADMINISTRATOR') {
            baseTabs.push(
                { id: 'moderation', label: 'Moderation', icon: Shield },
                { id: 'reports', label: 'Reports', icon: Flag }
            );
        }

        return baseTabs;
    };

    const tabs = getTabs();

    const handleCreateTopic = async () => {
        if (newTopicData.title && newTopicData.content && newTopicData.categoryId) {
            await createTopic.execute({
                title: newTopicData.title,
                content: newTopicData.content,
                categoryId: parseInt(newTopicData.categoryId),
                isPublic: true,
                language: currentLanguage
            });
            setShowCreateTopic(false);
            setNewTopicData({ title: '', content: '', categoryId: '' });
            refetchTopics();
        }
    };

    const handleCreatePost = async () => {
        if (newPostData.content && selectedTopic) {
            await createPost.execute({
                content: newPostData.content,
                topicId: selectedTopic.id,
                language: currentLanguage
            });
            setShowCreatePost(false);
            setNewPostData({ content: '' });
        }
    };

    const handleCreateCategory = async () => {
        if (newCategoryData.name && newCategoryData.description) {
            await createCategory.execute(newCategoryData);
            setShowCreateCategory(false);
            setNewCategoryData({ name: '', description: '', isPublic: true });
            refetchCategories();
        }
    };

    const handleReportAction = async (reportId, action, notes = '') => {
        try {
            await updateReportStatus.execute({
                reportId,
                statusData: { status: action, moderatorNotes: notes }
            });
            refetchReports();
        } catch (error) {
            console.error('Error updating report status:', error);
        }
    };

    const filteredTopics = topics?.content?.filter(topic => {
        if (selectedCategory && topic.categoryId !== selectedCategory) return false;
        if (searchQuery && !topic.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    }) || [];

    if (categoriesLoading || topicsLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Community Forum
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Connect with the heritage community, share knowledge, and discuss cultural topics
                    </p>
                </div>

                {/* Search and Actions */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                type="text"
                                placeholder="Search topics, posts, or categories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setShowCreateTopic(true)}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            New Topic
                        </Button>
                        {(user?.role === 'CONTENT_MANAGER' || user?.role === 'SYSTEM_ADMINISTRATOR') && (
                            <Button
                                onClick={() => setShowCreateCategory(true)}
                                variant="outline"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                New Category
                            </Button>
                        )}
                        <Button variant="outline">
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="p-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                                Categories
                            </h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${selectedCategory === null
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    All Categories
                                </button>
                                {categories?.content?.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm ${selectedCategory === category.id
                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{category.name}</span>
                                            {category.isPublic ? (
                                                <Eye className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <EyeOff className="w-4 h-4 text-yellow-600" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </Card>

                        <Card className="p-4 mt-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                                Language
                            </h3>
                            <div className="space-y-2">
                                <button className="w-full text-left px-3 py-2 rounded-lg text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                    🇺🇸 English
                                </button>
                                <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                                    🇷🇼 Kinyarwanda
                                </button>
                                <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                                    🇫🇷 French
                                </button>
                            </div>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {/* Tabs */}
                        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
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
                        {activeTab === 'topics' && (
                            <div className="space-y-4">
                                {filteredTopics.map((topic) => (
                                    <Card key={topic.id} className="p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <h3
                                                        className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                                                        onClick={() => setSelectedTopic(topic)}
                                                    >
                                                        {topic.title}
                                                    </h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs ${topic.isPublic
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                        }`}>
                                                        {topic.isPublic ? 'Public' : 'Private'}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-400 mb-3">
                                                    {topic.content}
                                                </p>
                                                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                                    <span className="flex items-center space-x-1">
                                                        <Users className="w-4 h-4" />
                                                        <span>{topic.createdBy}</span>
                                                    </span>
                                                    <span className="flex items-center space-x-1">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>{new Date(topic.createdDate).toLocaleDateString()}</span>
                                                    </span>
                                                    <span className="flex items-center space-x-1">
                                                        <Globe className="w-4 h-4" />
                                                        <span className="uppercase">{topic.language}</span>
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 ml-4">
                                                <Button variant="outline" size="sm">
                                                    <Reply className="w-4 h-4 mr-1" />
                                                    Reply
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    <Flag className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {activeTab === 'categories' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {categories?.content?.map((category) => (
                                    <Card key={category.id} className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                                    {category.name}
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                    {category.description}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                    {topics?.content?.filter(t => t.categoryId === category.id).length || 0}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    topics
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {activeTab === 'moderation' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Content Moderation
                                </h3>
                                <div className="text-center py-8">
                                    <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        Moderation Dashboard
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Review and manage reported content here
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'reports' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Content Reports ({reports?.content?.length || 0})
                                </h3>
                                {reports?.content?.map((report) => (
                                    <Card key={report.id} className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Flag className="w-4 h-4 text-red-600" />
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                                        {report.contentType.replace('_', ' ')}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs ${report.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                        report.status === 'REVIEWED' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-green-100 text-green-800'
                                                        }`}>
                                                        {report.status}
                                                    </span>
                                                </div>
                                                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                                                    {report.reason}
                                                </h4>
                                                {report.description && (
                                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                                                        {report.description}
                                                    </p>
                                                )}
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    Reported by {report.reportedBy} on {new Date(report.reportedDate).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 ml-4">
                                                {report.status === 'PENDING' && (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleReportAction(report.id, 'RESOLVED', 'Content approved')}
                                                            className="text-green-600 hover:text-green-700"
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleReportAction(report.id, 'REVIEWED', 'Content flagged')}
                                                            className="text-yellow-600 hover:text-yellow-700"
                                                        >
                                                            Flag
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleReportAction(report.id, 'RESOLVED', 'Content rejected')}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {activeTab === 'my-posts' && (
                            <div className="text-center py-8">
                                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    No posts yet
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    Start participating in the community by creating your first post
                                </p>
                                <Button onClick={() => setShowCreateTopic(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Post
                                </Button>
                            </div>
                        )}

                        {activeTab === 'trending' && (
                            <div className="text-center py-8">
                                <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    Trending topics
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Most popular discussions will appear here
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Create Category Modal */}
                {showCreateCategory && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full">
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                    Create New Category
                                </h2>
                                <form onSubmit={(e) => { e.preventDefault(); handleCreateCategory(); }} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Category Name
                                        </label>
                                        <Input
                                            type="text"
                                            value={newCategoryData.name}
                                            onChange={(e) => setNewCategoryData({ ...newCategoryData, name: e.target.value })}
                                            placeholder="Enter category name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            value={newCategoryData.description}
                                            onChange={(e) => setNewCategoryData({ ...newCategoryData, description: e.target.value })}
                                            placeholder="Enter category description"
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            rows={3}
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="isPublic"
                                            checked={newCategoryData.isPublic}
                                            onChange={(e) => setNewCategoryData({ ...newCategoryData, isPublic: e.target.checked })}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor="isPublic" className="text-sm text-gray-700 dark:text-gray-300">
                                            Public Category
                                        </label>
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setShowCreateCategory(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={createCategory.loading}
                                        >
                                            {createCategory.loading ? 'Creating...' : 'Create Category'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Topic Detail View */}
                {selectedTopic && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            {selectedTopic.title}
                                        </h2>
                                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                            <span>By {selectedTopic.createdBy}</span>
                                            <span>{new Date(selectedTopic.createdDate).toLocaleDateString()}</span>
                                            <span className="uppercase">{selectedTopic.language}</span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedTopic(null)}
                                    >
                                        ✕
                                    </Button>
                                </div>

                                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <p className="text-gray-900 dark:text-white">
                                        {selectedTopic.content}
                                    </p>
                                </div>

                                {/* Posts */}
                                <div className="space-y-4 mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Replies ({posts?.content?.length || 0})
                                    </h3>
                                    {posts?.content?.map((post) => (
                                        <div key={post.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {post.createdBy}
                                                    </span>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                                        {new Date(post.createdDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Button variant="outline" size="sm">
                                                        <ThumbsUp className="w-4 h-4 mr-1" />
                                                        Like
                                                    </Button>
                                                    <Button variant="outline" size="sm">
                                                        <Reply className="w-4 h-4 mr-1" />
                                                        Reply
                                                    </Button>
                                                </div>
                                            </div>
                                            <p className="text-gray-900 dark:text-white">
                                                {post.content}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Create Reply */}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                                        Add a Reply
                                    </h4>
                                    <div className="space-y-3">
                                        <textarea
                                            value={newPostData.content}
                                            onChange={(e) => setNewPostData({ ...newPostData, content: e.target.value })}
                                            placeholder="Write your reply..."
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            rows={4}
                                        />
                                        <div className="flex justify-end space-x-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => setSelectedTopic(null)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleCreatePost}
                                                disabled={!newPostData.content.trim()}
                                            >
                                                Post Reply
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Create Topic Modal */}
                {showCreateTopic && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full">
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                    Create New Topic
                                </h2>
                                <form onSubmit={(e) => { e.preventDefault(); handleCreateTopic(); }} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Category
                                        </label>
                                        <select
                                            value={newTopicData.categoryId}
                                            onChange={(e) => setNewTopicData({ ...newTopicData, categoryId: e.target.value })}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="">Select a category</option>
                                            {categories?.content?.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Title
                                        </label>
                                        <Input
                                            type="text"
                                            value={newTopicData.title}
                                            onChange={(e) => setNewTopicData({ ...newTopicData, title: e.target.value })}
                                            placeholder="Enter topic title..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Content
                                        </label>
                                        <textarea
                                            value={newTopicData.content}
                                            onChange={(e) => setNewTopicData({ ...newTopicData, content: e.target.value })}
                                            placeholder="Write your topic content..."
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            rows={6}
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setShowCreateTopic(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={!newTopicData.title.trim() || !newTopicData.content.trim() || !newTopicData.categoryId}
                                        >
                                            Create Topic
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Forum;
