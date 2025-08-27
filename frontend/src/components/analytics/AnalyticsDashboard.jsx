import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    BarChart3,
    PieChart,
    LineChart,
    Users,
    FileText,
    MapPin,
    Activity,
    Download,
    RefreshCw,
    Calendar,
    Filter,
    Eye,
    Upload,
    Search,
    Clock,
    AlertCircle,
    CheckCircle,
    Zap,
    HardDrive
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { toast } from 'react-hot-toast';
import analyticsApi from '../../services/api/analyticsApi';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import StatsCard from '../dashboard/StatsCard';
import UserActivityOverview from '../activity/UserActivityOverview';

/**
 * AnalyticsDashboard Component
 * 
 * Comprehensive analytics dashboard for heritage platform insights:
 * - Real-time statistics and metrics
 * - Interactive charts and visualizations
 * - Export capabilities
 * - Performance monitoring
 * - Trend analysis
 */

const AnalyticsDashboard = ({
    className = '',
    ...props
}) => {
    const { user } = useAuth();
    const { t } = useLanguage();

    // State management
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [selectedDateRange, setSelectedDateRange] = useState('month');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [refreshing, setRefreshing] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(false);

    // Available filters
    const dateRanges = analyticsApi.getAvailableFilters().dateRanges;
    const categories = analyticsApi.getAvailableFilters().categories;

    // Load analytics data
    const loadAnalytics = useCallback(async (showRefreshing = false) => {
        try {
            if (showRefreshing) setRefreshing(true);
            else setLoading(true);

            const data = await analyticsApi.getOverview({
                dateRange: selectedDateRange,
                category: selectedCategory
            });

            setAnalyticsData(data);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Failed to load analytics:', error);
            toast.error('Failed to load analytics data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedDateRange, selectedCategory]);

    // Load analytics on mount and filter changes
    useEffect(() => {
        loadAnalytics();
    }, [loadAnalytics]);

    // Auto-refresh setup
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            loadAnalytics(true);
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
    }, [autoRefresh, loadAnalytics]);

    // Handle export
    const handleExport = async (type) => {
        try {
            const blob = await analyticsApi.exportAnalytics(type, {
                dateRange: selectedDateRange,
                category: selectedCategory
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `heritage-analytics-${new Date().toISOString().split('T')[0]}.${type}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success(`Analytics exported as ${type.toUpperCase()}`);
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export analytics');
        }
    };

    // Format percentage change
    const formatPercentageChange = (current, previous) => {
        const change = analyticsApi.calculateGrowthRate(current, previous);
        const isPositive = change >= 0;

        return {
            value: Math.abs(change),
            isPositive,
            formatted: `${isPositive ? '+' : '-'}${Math.abs(change).toFixed(1)}%`
        };
    };

    // Get trend icon
    const getTrendIcon = (isPositive) => {
        return isPositive ? TrendingUp : TrendingDown;
    };

    // Get trend color
    const getTrendColor = (isPositive) => {
        return isPositive ? 'text-green-600' : 'text-red-600';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (!analyticsData) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">Failed to load analytics data</p>
                <Button onClick={() => loadAnalytics()} className="mt-4">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                </Button>
            </div>
        );
    }

    const { sites, documents, users, activity, performance, trends } = analyticsData;

    return (
        <div className={`space-y-6 ${className}`} {...props}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Analytics Dashboard
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Comprehensive insights into your heritage platform
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    {/* Date Range Filter */}
                    <select
                        value={selectedDateRange}
                        onChange={(e) => setSelectedDateRange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    >
                        {dateRanges.map(range => (
                            <option key={range.value} value={range.value}>
                                {range.label}
                            </option>
                        ))}
                    </select>

                    {/* Category Filter */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    >
                        {categories.map(category => (
                            <option key={category.value} value={category.value}>
                                {category.label}
                            </option>
                        ))}
                    </select>

                    {/* Auto-refresh Toggle */}
                    <Button
                        variant={autoRefresh ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className="flex items-center space-x-1"
                    >
                        <Zap className="w-4 h-4" />
                        <span>{autoRefresh ? 'Auto' : 'Manual'}</span>
                    </Button>

                    {/* Refresh Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadAnalytics(true)}
                        disabled={refreshing}
                        className="flex items-center space-x-1"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </Button>

                    {/* Export Dropdown */}
                    <div className="relative group">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-1"
                        >
                            <Download className="w-4 h-4" />
                            <span>Export</span>
                        </Button>

                        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            <div className="py-1">
                                <button
                                    onClick={() => handleExport('csv')}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    Export as CSV
                                </button>
                                <button
                                    onClick={() => handleExport('pdf')}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    Export as PDF
                                </button>
                                <button
                                    onClick={() => handleExport('excel')}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    Export as Excel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
                            <span>Refreshing...</span>
                        </div>
                    )}
                </div>
            )}

            {/* Key Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Sites Stats */}
                <StatsCard
                    title="Heritage Sites"
                    value={sites.total}
                    subtitle={`${sites.active} active`}
                    icon={MapPin}
                    color="blue"
                    trend={{
                        value: sites.monthlyGrowth,
                        isPositive: sites.monthlyGrowth > 0,
                        label: "this month"
                    }}
                />

                {/* Documents Stats */}
                <StatsCard
                    title="Documents"
                    value={analyticsApi.formatNumber(documents.total)}
                    subtitle={`${documents.thisMonth} this month`}
                    icon={FileText}
                    color="green"
                    trend={{
                        value: documents.monthlyGrowth,
                        isPositive: documents.monthlyGrowth > 0,
                        label: "vs last month"
                    }}
                />

                {/* Users Stats */}
                <StatsCard
                    title="Active Users"
                    value={users.activeThisMonth}
                    subtitle={`${users.total} total users`}
                    icon={Users}
                    color="purple"
                    trend={{
                        value: users.monthlyGrowth,
                        isPositive: users.monthlyGrowth > 0,
                        label: "user growth"
                    }}
                />

                {/* Activity Stats */}
                <StatsCard
                    title="Total Actions"
                    value={analyticsApi.formatNumber(activity.totalActions)}
                    subtitle={`${activity.thisWeek} this week`}
                    icon={Activity}
                    color="orange"
                    trend={{
                        value: activity.weeklyGrowth,
                        isPositive: activity.weeklyGrowth > 0,
                        label: "vs last week"
                    }}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Site Categories Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <PieChart className="w-5 h-5" />
                            <span>Site Categories</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Object.entries(sites.categoriesDistribution).map(([category, count]) => {
                                const percentage = (count / sites.total * 100).toFixed(1);
                                return (
                                    <div key={category} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {category}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {count}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                ({percentage}%)
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Document Types Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <BarChart3 className="w-5 h-5" />
                            <span>Document Types</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Object.entries(documents.fileTypesDistribution).map(([type, count]) => {
                                const percentage = (count / documents.total * 100).toFixed(1);
                                const barWidth = (count / Math.max(...Object.values(documents.fileTypesDistribution)) * 100);

                                return (
                                    <div key={type} className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {type}
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {count} ({percentage}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${barWidth}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Activity Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Daily Activity Trend */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <LineChart className="w-5 h-5" />
                            <span>Daily Activity (Last 30 Days)</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-48 flex items-end space-x-1">
                            {activity.dailyActivity.slice(-14).map((day, index) => {
                                const maxValue = Math.max(...activity.dailyActivity.map(d => d.views));
                                const height = (day.views / maxValue) * 100;

                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center">
                                        <div
                                            className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                                            style={{ height: `${height}%` }}
                                            title={`${day.views} views on ${new Date(day.date).toLocaleDateString()}`}
                                        ></div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {new Date(day.date).getDate()}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                                <span className="text-gray-600 dark:text-gray-400">Document Views</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Top Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Activity className="w-5 h-5" />
                            <span>Top Actions</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Object.entries(activity.topActions).map(([action, count]) => {
                                const icon = {
                                    'Document Views': Eye,
                                    'Site Visits': MapPin,
                                    'Document Downloads': Download,
                                    'Search Queries': Search,
                                    'Document Uploads': Upload,
                                    'Profile Updates': Users
                                }[action] || Activity;

                                const IconComponent = icon;

                                return (
                                    <div key={action} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <IconComponent className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-900 dark:text-white">
                                                {action}
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            {analyticsApi.formatNumber(count)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Regional Distribution & Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Regional Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <MapPin className="w-5 h-5" />
                            <span>Regional Distribution</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(sites.regionDistribution).map(([region, count]) => {
                                const percentage = (count / sites.total * 100).toFixed(1);
                                const barWidth = (count / Math.max(...Object.values(sites.regionDistribution)) * 100);

                                return (
                                    <div key={region} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {region}
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {count} sites ({percentage}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${barWidth}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* System Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Zap className="w-5 h-5" />
                            <span>System Performance</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {performance.uptime}
                                    </div>
                                    <div className="text-xs text-green-600 dark:text-green-400">
                                        Uptime
                                    </div>
                                </div>

                                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {performance.averageLoadTime}
                                    </div>
                                    <div className="text-xs text-blue-600 dark:text-blue-400">
                                        Avg Load Time
                                    </div>
                                </div>

                                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                        {performance.errorRate}
                                    </div>
                                    <div className="text-xs text-orange-600 dark:text-orange-400">
                                        Error Rate
                                    </div>
                                </div>

                                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        {performance.peakUsers}
                                    </div>
                                    <div className="text-xs text-purple-600 dark:text-purple-400">
                                        Peak Users
                                    </div>
                                </div>
                            </div>

                            {/* Storage Usage */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        Storage Used
                                    </span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {performance.storageUsed} / {performance.storageLimit}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: '23%' }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* User Activity Overview */}
            <div className="mt-8">
                <UserActivityOverview
                    showHeader={false}
                    maxActivities={10}
                    autoRefresh={autoRefresh}
                    refreshInterval={30000}
                />
            </div>
        </div>
    );
};

export default AnalyticsDashboard;


