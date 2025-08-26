import React, { useState, useEffect } from 'react';
import {
    MapPin,
    BookOpen,
    Award,
    Users,
    BarChart3,
    Calendar,
    Eye,
    Star,
    Clock,
    CheckCircle,
    XCircle,
    TrendingUp,
    Target,
    Trophy,
    Bookmark,
    Share2,
    Heart,
    MessageCircle,
    Zap,
    ChevronRight
} from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useGet } from '../../hooks/useSimpleApi';

const CommunityMemberDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedAchievement, setSelectedAchievement] = useState(null);

    // API hooks using new simplified system
    const { data: sites, loading: sitesLoading } = useGet('/api/heritage-sites', {}, {
        onSuccess: (data) => console.log('Heritage sites loaded:', data),
        onError: (error) => console.error('Failed to load heritage sites:', error)
    });

    const { data: articles, loading: articlesLoading } = useGet('/api/education/articles', {}, {
        onSuccess: (data) => console.log('Articles loaded:', data),
        onError: (error) => console.error('Failed to load articles:', error)
    });

    const { data: quizzes, loading: quizzesLoading } = useGet('/api/education/quizzes', {}, {
        onSuccess: (data) => console.log('Quizzes loaded:', data),
        onError: (error) => console.error('Failed to load quizzes:', error)
    });

    const { data: topics, loading: topicsLoading } = useGet('/api/forum/topics', {}, {
        onSuccess: (data) => console.log('Forum topics loaded:', data),
        onError: (error) => console.error('Failed to load forum topics:', error)
    });

    // Calculate statistics from real data
    const userStats = {
        sitesVisited: sites?.content?.length || 0,
        articlesRead: articles?.content?.length || 0,
        quizzesCompleted: quizzes?.content?.length || 0,
        communityPosts: topics?.content?.length || 0
    };

    const recentSites = sites?.content?.slice(0, 5) || [];
    const recentArticles = articles?.content?.slice(0, 3) || [];
    const recentQuizzes = quizzes?.content?.slice(0, 3) || [];

    // Enhanced tabs with better icons and descriptions
    const tabs = [
        { 
            id: 'overview', 
            label: 'Overview', 
            icon: BarChart3, 
            description: 'Your learning journey at a glance',
            color: 'from-blue-500 to-blue-600'
        },
        { 
            id: 'sites', 
            label: 'Heritage Sites', 
            icon: MapPin, 
            description: 'Explore cultural heritage locations',
            color: 'from-green-500 to-green-600'
        },
        { 
            id: 'learning', 
            label: 'Learning', 
            icon: BookOpen, 
            description: 'Educational articles and resources',
            color: 'from-purple-500 to-purple-600'
        },
        { 
            id: 'quizzes', 
            label: 'Quizzes', 
            icon: Award, 
            description: 'Test your knowledge',
            color: 'from-yellow-500 to-yellow-600'
        },
        { 
            id: 'community', 
            label: 'Community', 
            icon: Users, 
            description: 'Connect with fellow enthusiasts',
            color: 'from-pink-500 to-pink-600'
        },
        { 
            id: 'achievements', 
            label: 'Achievements', 
            icon: Trophy, 
            description: 'Track your progress and milestones',
            color: 'from-indigo-500 to-indigo-600'
        }
    ];

    // Enhanced achievements system
    const achievements = [
        {
            id: 1,
            title: 'First Steps',
            description: 'Read your first article',
            icon: BookOpen,
            completed: userStats.articlesRead > 0,
            progress: Math.min(userStats.articlesRead, 1),
            target: 1,
            color: 'from-green-400 to-green-600',
            reward: '10 XP'
        },
        {
            id: 2,
            title: 'Knowledge Seeker',
            description: 'Complete your first quiz',
            icon: Award,
            completed: userStats.quizzesCompleted > 0,
            progress: Math.min(userStats.quizzesCompleted, 1),
            target: 1,
            color: 'from-purple-400 to-purple-600',
            reward: '15 XP'
        },
        {
            id: 3,
            title: 'Explorer',
            description: 'Visit 5 heritage sites',
            icon: MapPin,
            completed: userStats.sitesVisited >= 5,
            progress: Math.min(userStats.sitesVisited, 5),
            target: 5,
            color: 'from-blue-400 to-blue-600',
            reward: '25 XP'
        },
        {
            id: 4,
            title: 'Community Builder',
            description: 'Make 3 community posts',
            icon: Users,
            completed: userStats.communityPosts >= 3,
            progress: Math.min(userStats.communityPosts, 3),
            target: 3,
            color: 'from-pink-400 to-pink-600',
            reward: '20 XP'
        }
    ];

    // Calculate total XP and level
    const totalXP = achievements.reduce((sum, achievement) => {
        return sum + (achievement.completed ? parseInt(achievement.reward.split(' ')[0]) : 0);
    }, 0);
    
    const level = Math.floor(totalXP / 100) + 1;
    const levelProgress = (totalXP % 100) / 100;

    if (sitesLoading || articlesLoading || quizzesLoading || topicsLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Enhanced Header with Level System */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                Community Dashboard
                            </h1>
                            <p className="text-blue-100 text-lg">
                                Explore heritage sites, learn, and engage with the community
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm">
                                <div className="text-sm text-blue-100">Level {level}</div>
                                <div className="text-lg font-bold">{totalXP} XP</div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Level Progress Bar */}
                    <div className="mt-6">
                        <div className="flex justify-between text-sm text-blue-100 mb-2">
                            <span>Level {level}</span>
                            <span>Level {level + 1}</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-3">
                            <div 
                                className="bg-white h-3 rounded-full transition-all duration-500"
                                style={{ width: `${levelProgress * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="p-6 hover:shadow-lg transition-all duration-300 group">
                        <div className="flex items-center">
                            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <MapPin className="w-6 h-6 text-white" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Sites Visited
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {userStats.sitesVisited}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 hover:shadow-lg transition-all duration-300 group">
                        <div className="flex items-center">
                            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Articles Read
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {userStats.articlesRead}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 hover:shadow-lg transition-all duration-300 group">
                        <div className="flex items-center">
                            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <Award className="w-6 h-6 text-white" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Quizzes Completed
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {userStats.quizzesCompleted}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 hover:shadow-lg transition-all duration-300 group">
                        <div className="flex items-center">
                            <div className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Community Posts
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {userStats.communityPosts}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Enhanced Tabs */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-2 shadow-sm">
                    <nav className="flex space-x-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-300 ${
                                        isActive
                                            ? 'bg-gradient-to-r text-white shadow-lg transform scale-105'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700'
                                    }`}
                                    style={isActive ? { background: `linear-gradient(to right, ${tab.color.split(' ')[1]}, ${tab.color.split(' ')[3]})` } : {}}
                                >
                                    <div className="flex items-center justify-center space-x-2">
                                        <Icon className="w-4 h-4" />
                                        <span>{tab.label}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Quick Actions */}
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Quick Actions
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Button 
                                        variant="outline" 
                                        className="h-auto p-4 flex-col space-y-2 hover:shadow-md transition-all duration-300"
                                        onClick={() => setActiveTab('sites')}
                                    >
                                        <MapPin className="w-6 h-6 text-blue-600" />
                                        <span>Explore Sites</span>
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        className="h-auto p-4 flex-col space-y-2 hover:shadow-md transition-all duration-300"
                                        onClick={() => setActiveTab('learning')}
                                    >
                                        <BookOpen className="w-6 h-6 text-green-600" />
                                        <span>Read Articles</span>
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        className="h-auto p-4 flex-col space-y-2 hover:shadow-md transition-all duration-300"
                                        onClick={() => setActiveTab('quizzes')}
                                    >
                                        <Award className="w-6 h-6 text-purple-600" />
                                        <span>Take Quiz</span>
                                    </Button>
                                </div>
                            </Card>

                            {/* Recent Heritage Sites */}
                            <Card className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Recent Heritage Sites
                                    </h3>
                                    <Button variant="outline" size="sm" onClick={() => setActiveTab('sites')}>
                                        View All
                                        <ChevronRight className="ml-1 w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {recentSites.map((site) => (
                                        <div key={site.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-300 group cursor-pointer">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                                    <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                                    {site.name?.en || site.name}
                                                </h4>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                                {site.description?.en || site.description}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    site.status === 'ACTIVE'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                }`}>
                                                    {site.status}
                                                </span>
                                                <Button variant="outline" size="sm" className="group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    View
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* Learning Progress */}
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Learning Progress
                                </h3>
                                <div className="space-y-4">
                                    {recentArticles.map((article) => (
                                        <div key={article.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                                    <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        {article.title?.en || article.title?.rw || article.title?.fr || `Article ${article.id}`}
                                                    </h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Educational Article
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                    Available
                                                </span>
                                                <Button variant="outline" size="sm" className="hover:bg-green-600 hover:text-white transition-colors">
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    Read
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* Quiz Results */}
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Available Quizzes
                                </h3>
                                <div className="space-y-3">
                                    {recentQuizzes.map((quiz) => (
                                        <div key={quiz.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                                    <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        {quiz.title?.en || quiz.title?.rw || quiz.title?.fr || `Quiz ${quiz.id}`}
                                                    </h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Passing Score: {quiz.passingScore}% • Time: {quiz.timeLimit}min
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                    Available
                                                </span>
                                                <Button variant="outline" size="sm" className="hover:bg-purple-600 hover:text-white transition-colors">
                                                    <Award className="w-4 h-4 mr-1" />
                                                    Start
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'sites' && (
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Heritage Sites
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {sites?.content?.map((site) => (
                                    <div key={site.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-300 group cursor-pointer">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                                {site.name?.en || site.name}
                                            </h4>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                            {site.description?.en || site.description}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                site.status === 'ACTIVE'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                            }`}>
                                                {site.status}
                                            </span>
                                            <Button variant="outline" size="sm" className="group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                <Eye className="w-4 h-4 mr-1" />
                                                View Details
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {activeTab === 'learning' && (
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Educational Content
                            </h3>
                            <div className="space-y-4">
                                {articles?.content?.map((article) => (
                                    <div key={article.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-300">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                                <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-white">
                                                    {article.title?.en || article.title?.rw || article.title?.fr || `Article ${article.id}`}
                                                </h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {article.summary?.en || article.summary?.rw || article.summary?.fr || 'No summary available'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                article.isPublic
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                            }`}>
                                                {article.isPublic ? 'Available' : 'Draft'}
                                            </span>
                                            <Button variant="outline" size="sm" className="hover:bg-green-600 hover:text-white transition-colors">
                                                <BookOpen className="w-4 h-4 mr-1" />
                                                Read Article
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {activeTab === 'quizzes' && (
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Available Quizzes
                            </h3>
                            <div className="space-y-4">
                                {quizzes?.content?.map((quiz) => (
                                    <div key={quiz.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-300">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                                <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-white">
                                                    {quiz.title?.en || quiz.title?.rw || quiz.title?.fr || `Quiz ${quiz.id}`}
                                                </h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {quiz.description?.en || quiz.description?.rw || quiz.description?.fr || 'No description available'}
                                                </p>
                                                <div className="flex items-center space-x-4 mt-1">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        Passing Score: {quiz.passingScore}%
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        Time Limit: {quiz.timeLimit}min
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        Max Attempts: {quiz.maxAttempts}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                quiz.isPublic
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                            }`}>
                                                {quiz.isPublic ? 'Available' : 'Draft'}
                                            </span>
                                            <Button variant="outline" size="sm" className="hover:bg-purple-600 hover:text-white transition-colors">
                                                <Award className="w-4 h-4 mr-1" />
                                                Start Quiz
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {activeTab === 'community' && (
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Community Discussions
                            </h3>
                            <div className="space-y-4">
                                {topics?.content?.map((topic) => (
                                    <div key={topic.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-300">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-white">
                                                    {topic.title}
                                                </h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {topic.content}
                                                </p>
                                                <div className="flex items-center space-x-4 mt-1">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        Language: {topic.language}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        Created: {new Date(topic.createdDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                topic.isPublic
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                            }`}>
                                                {topic.isPublic ? 'Public' : 'Private'}
                                            </span>
                                            <Button variant="outline" size="sm" className="hover:bg-blue-600 hover:text-white transition-colors">
                                                <Users className="w-4 h-4 mr-1" />
                                                Join Discussion
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {activeTab === 'achievements' && (
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Achievements & Progress
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                                        Learning Milestones
                                    </h4>
                                    <div className="space-y-3">
                                        {achievements.map((achievement) => {
                                            const Icon = achievement.icon;
                                            return (
                                                <div 
                                                    key={achievement.id} 
                                                    className={`p-3 rounded-lg border transition-all duration-300 cursor-pointer ${
                                                        achievement.completed 
                                                            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700' 
                                                            : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                                                    }`}
                                                    onClick={() => setSelectedAchievement(achievement)}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`p-2 rounded-lg ${
                                                            achievement.completed 
                                                                ? 'bg-gradient-to-r ' + achievement.color
                                                                : 'bg-gray-200 dark:bg-gray-700'
                                                        }`}>
                                                            <Icon className={`w-5 h-5 ${
                                                                achievement.completed ? 'text-white' : 'text-gray-500'
                                                            }`} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {achievement.title}
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {achievement.description}
                                                            </p>
                                                            <div className="mt-2">
                                                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                                    <span>Progress</span>
                                                                    <span>{achievement.progress}/{achievement.target}</span>
                                                                </div>
                                                                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                                                    <div 
                                                                        className={`h-2 rounded-full transition-all duration-500 ${
                                                                            achievement.completed 
                                                                                ? 'bg-gradient-to-r ' + achievement.color.split(' ').slice(1, 3).join(' ')
                                                                                : 'bg-blue-500'
                                                                        }`}
                                                                        style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {achievement.completed && (
                                                            <div className="text-right">
                                                                <div className="text-xs font-medium text-green-600 dark:text-green-400">
                                                                    {achievement.reward}
                                                                </div>
                                                                <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                                        Current Progress
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    Articles Read
                                                </span>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    {userStats.articlesRead}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                                <div className="bg-green-600 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(userStats.articlesRead * 10, 100)}%` }}></div>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    Quizzes Completed
                                                </span>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    {userStats.quizzesCompleted}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                                <div className="bg-purple-600 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(userStats.quizzesCompleted * 10, 100)}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CommunityMemberDashboard; 