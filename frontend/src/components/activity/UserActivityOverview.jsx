import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Activity,
    Clock,
    Monitor,
    Smartphone,
    Tablet,
    Chrome,
    Globe,
    MapPin,
    Filter,
    RefreshCw,
    Zap,
    Eye,
    Download,
    Upload,
    Search,
    FileText,
    Edit,
    Plus,
    LogIn,
    LogOut,
    User,
    BarChart3,
    MessageSquare,
    Package,
    Shield,
    Camera,
    Trash2,
    TrendingUp,
    TrendingDown,
    Circle,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { UserAvatar } from '../ui/UserAvatar';
import { toast } from 'react-hot-toast';
import userActivityApi, { ACTIVITY_TYPES, ACTIVITY_PRIORITIES } from '../../services/api/userActivityApi';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * UserActivityOverview Component
 * 
 * Comprehensive user activity monitoring:
 * - Recent activity feed with updates
 * - Active user sessions monitoring
 * - User behavior analytics
 * - Activity statistics and trends
 * - Interactive filtering and controls
 */

const UserActivityOverview = ({
    className = '',
    showHeader = true,
    maxActivities = 50,
    autoRefresh = true,
    refreshInterval = 10000, // 10 seconds
    ...props
}) => {
    const { user } = useAuth();
    const { t } = useLanguage();

    // State management
    const [activities, setActivities] = useState([]);
    const [activeSessions, setActiveSessions] = useState([]);
    const [behaviorData, setBehaviorData] = useState(null);
    const [activityStats, setActivityStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    // Filter states
    const [selectedType, setSelectedType] = useState('all');
    const [selectedRole, setSelectedRole] = useState('all');
    const [selectedPriority, setSelectedPriority] = useState('all');
    const [timeRange, setTimeRange] = useState(30); // minutes
    const [showFilters, setShowFilters] = useState(false);

    // View states
    const [activeTab, setActiveTab] = useState('live-feed');
    const [viewMode, setViewMode] = useState('compact');

    // Icon mapping
    const activityIcons = {
        [ACTIVITY_TYPES.USER_LOGIN]: LogIn,
        [ACTIVITY_TYPES.USER_LOGOUT]: LogOut,
        [ACTIVITY_TYPES.SITE_VIEW]: Eye,
        [ACTIVITY_TYPES.SITE_CREATE]: Plus,
        [ACTIVITY_TYPES.SITE_UPDATE]: Edit,
        [ACTIVITY_TYPES.DOCUMENT_VIEW]: FileText,
        [ACTIVITY_TYPES.DOCUMENT_UPLOAD]: Upload,
        [ACTIVITY_TYPES.DOCUMENT_DOWNLOAD]: Download,
        [ACTIVITY_TYPES.DOCUMENT_DELETE]: Trash2,
        [ACTIVITY_TYPES.MEDIA_UPLOAD]: Camera,
        [ACTIVITY_TYPES.SEARCH_QUERY]: Search,
        [ACTIVITY_TYPES.PROFILE_UPDATE]: User,
        [ACTIVITY_TYPES.STATUS_CHANGE]: BarChart3,
        [ACTIVITY_TYPES.COMMENT_POST]: MessageSquare,
        [ACTIVITY_TYPES.ARTIFACT_VIEW]: Package,
        [ACTIVITY_TYPES.ARTIFACT_AUTHENTICATE]: Shield
    };

    // Load activity data
    const loadActivityData = useCallback(async (showRefreshing = false) => {
        try {
            if (showRefreshing) setRefreshing(true);
            else setLoading(true);

            const [activitiesData, sessionsData, behaviorAnalytics, statsData] = await Promise.all([
                userActivityApi.getRealTimeActivity(),
                userActivityApi.getActiveSessions(),
                userActivityApi.getUserBehaviorAnalytics(),
                userActivityApi.getActivityStatistics()
            ]);

            setActivities(activitiesData.slice(0, maxActivities));
            setActiveSessions(sessionsData);
            setBehaviorData(behaviorAnalytics);
            setActivityStats(statsData);
            setLastUpdated(new Date());

        } catch (error) {
            console.error('Failed to load activity data:', error);
            toast.error('Failed to load user activity data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [maxActivities]);

    // Load data on mount
    useEffect(() => {
        loadActivityData();
    }, [loadActivityData]);

    // Auto-refresh setup
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            loadActivityData(true);
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, loadActivityData]);

    // Filter activities
    const filteredActivities = userActivityApi.filterActivities(activities, {
        type: selectedType !== 'all' ? selectedType : null,
        role: selectedRole !== 'all' ? selectedRole : null,
        priority: selectedPriority !== 'all' ? selectedPriority : null,
        timeRange: timeRange
    });

    // Get priority color
    const getPriorityColor = (priority) => {
        const colors = {
            [ACTIVITY_PRIORITIES.LOW]: 'text-gray-500',
            [ACTIVITY_PRIORITIES.MEDIUM]: 'text-blue-500',
            [ACTIVITY_PRIORITIES.HIGH]: 'text-orange-500',
            [ACTIVITY_PRIORITIES.CRITICAL]: 'text-red-500'
        };
        return colors[priority] || 'text-gray-500';
    };

    // Get role color
    const getRoleColor = (role) => {
        const colors = {
            'HERITAGE_MANAGER': 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
            'CONTENT_MANAGER': 'text-green-600 bg-green-50 dark:bg-green-900/20',
            'COMMUNITY_MEMBER': 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
            'SYSTEM_ADMINISTRATOR': 'text-red-600 bg-red-50 dark:bg-red-900/20'
        };
        return colors[role] || 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    };

    // Format role name
    const formatRole = (role) => {
        return role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    // Get session status
    const getSessionStatus = (session) => {
        const lastActivity = new Date(session.lastActivity);
        const now = new Date();
        const diff = now - lastActivity;
        const minutes = Math.floor(diff / (1000 * 60));

        if (minutes < 2) return { status: 'active', color: 'text-green-500', label: 'Active' };
        if (minutes < 10) return { status: 'idle', color: 'text-yellow-500', label: 'Idle' };
        return { status: 'away', color: 'text-gray-500', label: 'Away' };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading user activity...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${className}`} {...props}>
            {/* Header */}
            {showHeader && (
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            User Activity Overview
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Monitor user behavior and platform activity
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        {/* Auto-refresh Toggle */}
                        <Button
                            variant={autoRefresh ? "default" : "outline"}
                            size="sm"
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className="flex items-center space-x-1"
                        >
                            <Zap className="w-4 h-4" />
                            <span>Live</span>
                        </Button>

                        {/* Filters Toggle */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center space-x-1"
                        >
                            <Filter className="w-4 h-4" />
                            <span>Filters</span>
                        </Button>

                        {/* Refresh Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadActivityData(true)}
                            disabled={refreshing}
                            className="flex items-center space-x-1"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            <span>Refresh</span>
                        </Button>
                    </div>
                </div>
            )}

            {/* Last Updated Info */}
            {lastUpdated && (
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>Last updated: {lastUpdated.toLocaleString()}</span>
                    </div>
                    {refreshing && (
                        <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span>Updating...</span>
                        </div>
                    )}
                    {autoRefresh && (
                        <div className="flex items-center space-x-2">
                            <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                            <span>Live updates enabled</span>
                        </div>
                    )}
                </div>
            )}

            {/* Filters Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Activity Type Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Activity Type
                                </label>
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                                >
                                    <option value="all">All Types</option>
                                    <option value={ACTIVITY_TYPES.DOCUMENT_VIEW}>Document Views</option>
                                    <option value={ACTIVITY_TYPES.SITE_VIEW}>Site Views</option>
                                    <option value={ACTIVITY_TYPES.DOCUMENT_UPLOAD}>Document Uploads</option>
                                    <option value={ACTIVITY_TYPES.SITE_UPDATE}>Site Updates</option>
                                    <option value={ACTIVITY_TYPES.USER_LOGIN}>User Logins</option>
                                </select>
                            </div>

                            {/* User Role Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    User Role
                                </label>
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                                >
                                    <option value="all">All Roles</option>
                                    <option value="HERITAGE_MANAGER">Heritage Managers</option>
                                    <option value="CONTENT_MANAGER">Content Managers</option>
                                    <option value="COMMUNITY_MEMBER">Community Members</option>
                                    <option value="SYSTEM_ADMINISTRATOR">System Administrators</option>
                                </select>
                            </div>

                            {/* Priority Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Priority
                                </label>
                                <select
                                    value={selectedPriority}
                                    onChange={(e) => setSelectedPriority(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                                >
                                    <option value="all">All Priorities</option>
                                    <option value={ACTIVITY_PRIORITIES.CRITICAL}>Critical</option>
                                    <option value={ACTIVITY_PRIORITIES.HIGH}>High</option>
                                    <option value={ACTIVITY_PRIORITIES.MEDIUM}>Medium</option>
                                    <option value={ACTIVITY_PRIORITIES.LOW}>Low</option>
                                </select>
                            </div>

                            {/* Time Range Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Time Range
                                </label>
                                <select
                                    value={timeRange}
                                    onChange={(e) => setTimeRange(parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                                >
                                    <option value={5}>Last 5 minutes</option>
                                    <option value={15}>Last 15 minutes</option>
                                    <option value={30}>Last 30 minutes</option>
                                    <option value={60}>Last hour</option>
                                    <option value={240}>Last 4 hours</option>
                                    <option value={1440}>Last 24 hours</option>
                                </select>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                {/* Tab Navigation */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex space-x-8 px-6">
                        {[
                            { id: 'live-feed', label: 'Live Activity Feed', icon: Activity },
                            { id: 'active-sessions', label: 'Active Sessions', icon: Users },
                            { id: 'behavior-analytics', label: 'User Behavior', icon: BarChart3 }
                        ].map(tab => {
                            const IconComponent = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                        }`}
                                >
                                    <IconComponent className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                    {tab.id === 'live-feed' && (
                                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                                            {filteredActivities.length}
                                        </span>
                                    )}
                                    {tab.id === 'active-sessions' && (
                                        <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full">
                                            {activeSessions.length}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {/* Live Activity Feed Tab */}
                    {activeTab === 'live-feed' && (
                        <div className="space-y-4">
                            {filteredActivities.length === 0 ? (
                                <div className="text-center py-12">
                                    <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                    <p className="text-gray-500 dark:text-gray-400">No activities found for the selected filters</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <AnimatePresence>
                                        {filteredActivities.map((activity, index) => {
                                            const IconComponent = activityIcons[activity.type] || Activity;
                                            const formattedActivity = userActivityApi.formatActivity(activity);

                                            return (
                                                <motion.div
                                                    key={activity.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -20 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                >
                                                    {/* Activity Icon */}
                                                    <div className={`p-2 rounded-full ${getPriorityColor(activity.priority)} bg-white dark:bg-gray-800 shadow-sm`}>
                                                        <IconComponent className="w-4 h-4" />
                                                    </div>

                                                    {/* Activity Details */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                {activity.username}
                                                            </span>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(activity.userRole)}`}>
                                                                {formatRole(activity.userRole)}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                            {activity.action} <span className="font-medium">{activity.target}</span>
                                                        </p>
                                                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                            <span>{formattedActivity.timeAgo}</span>
                                                            <span>•</span>
                                                            <span>{activity.metadata?.browser}</span>
                                                            <span>•</span>
                                                            <span>{activity.metadata?.location}</span>
                                                        </div>
                                                    </div>

                                                    {/* Activity Status */}
                                                    <div className="flex items-center space-x-2">
                                                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(activity.priority).replace('text-', 'bg-')}`}></div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Active Sessions Tab */}
                    {activeTab === 'active-sessions' && (
                        <div className="space-y-4">
                            {activeSessions.length === 0 ? (
                                <div className="text-center py-12">
                                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                    <p className="text-gray-500 dark:text-gray-400">No active sessions found</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {activeSessions.map((session) => {
                                        const sessionStatus = getSessionStatus(session);

                                        return (
                                            <Card key={session.id} className="hover:shadow-md transition-shadow">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center space-x-3 mb-3">
                                                        <UserAvatar
                                                            user={{
                                                                fullName: session.username,
                                                                avatar: session.avatar
                                                            }}
                                                            size="sm"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center space-x-2">
                                                                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                                                    {session.username}
                                                                </h4>
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(session.userRole)}`}>
                                                                    {formatRole(session.userRole)}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center space-x-2 mt-1">
                                                                <Circle className={`w-2 h-2 ${sessionStatus.color.replace('text-', 'fill-')}`} />
                                                                <span className={`text-xs ${sessionStatus.color}`}>
                                                                    {sessionStatus.label}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <div className="flex items-center justify-between">
                                                            <span>Current Page:</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                {session.currentPage}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span>Session Duration:</span>
                                                            <span className="font-medium">
                                                                {userActivityApi.getTimeAgo(session.startTime)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span>Total Actions:</span>
                                                            <span className="font-medium">{session.totalActions}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span>Device:</span>
                                                            <div className="flex items-center space-x-1">
                                                                {session.device.type === 'Desktop' && <Monitor className="w-3 h-3" />}
                                                                {session.device.type === 'Mobile' && <Smartphone className="w-3 h-3" />}
                                                                {session.device.type === 'Tablet' && <Tablet className="w-3 h-3" />}
                                                                <span className="text-xs">{session.device.browser}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span>Location:</span>
                                                            <div className="flex items-center space-x-1">
                                                                <MapPin className="w-3 h-3" />
                                                                <span className="text-xs">{session.location}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* User Behavior Analytics Tab */}
                    {activeTab === 'behavior-analytics' && behaviorData && (
                        <div className="space-y-6">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Card>
                                    <CardContent className="p-4 text-center">
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            {behaviorData.activeToday}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Active Today
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4 text-center">
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            {behaviorData.avgSessionDuration}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Avg Session
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4 text-center">
                                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                            {behaviorData.totalUsers}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Total Users
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4 text-center">
                                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                            {Object.values(behaviorData.deviceBreakdown).reduce((a, b) => a + b, 0)}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Active Devices
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Top Pages */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <TrendingUp className="w-5 h-5" />
                                        <span>Most Visited Pages</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {behaviorData.topPages.map((page, index) => (
                                            <div key={index} className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {page.page}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        Avg time: {page.avgTime}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-gray-900 dark:text-white">
                                                        {page.visits.toLocaleString()}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        visits
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Device & Browser Breakdown */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2">
                                            <Monitor className="w-5 h-5" />
                                            <span>Device Breakdown</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {Object.entries(behaviorData.deviceBreakdown).map(([device, count]) => {
                                                const percentage = (count / Object.values(behaviorData.deviceBreakdown).reduce((a, b) => a + b, 0) * 100).toFixed(1);
                                                return (
                                                    <div key={device} className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-2">
                                                            {device === 'desktop' && <Monitor className="w-4 h-4" />}
                                                            {device === 'mobile' && <Smartphone className="w-4 h-4" />}
                                                            {device === 'tablet' && <Tablet className="w-4 h-4" />}
                                                            <span className="font-medium capitalize">{device}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="font-bold">{count}</span>
                                                            <span className="text-sm text-gray-500">({percentage}%)</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2">
                                            <Globe className="w-5 h-5" />
                                            <span>Browser Breakdown</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {Object.entries(behaviorData.browserBreakdown).map(([browser, count]) => {
                                                const percentage = (count / Object.values(behaviorData.browserBreakdown).reduce((a, b) => a + b, 0) * 100).toFixed(1);
                                                return (
                                                    <div key={browser} className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-2">
                                                            <Chrome className="w-4 h-4" />
                                                            <span className="font-medium">{browser}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="font-bold">{count}</span>
                                                            <span className="text-sm text-gray-500">({percentage}%)</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserActivityOverview;


