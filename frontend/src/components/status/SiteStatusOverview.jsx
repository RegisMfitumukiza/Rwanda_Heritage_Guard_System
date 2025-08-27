import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    CheckCircle,
    Clock,
    Eye,
    AlertTriangle,
    Filter,
    RefreshCw,
    Download,
    Calendar,
    MapPin,
    Users,
    Search,
    ArrowRight,
    MoreVertical
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useGet } from '../../hooks/useSimpleApi';

// Status configuration (same as SiteStatusManager)
const SITE_STATUSES = {
    'ACTIVE': {
        label: 'Active',
        color: 'green',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        textColor: 'text-green-800 dark:text-green-200',
        borderColor: 'border-green-200 dark:border-green-800',
        icon: CheckCircle
    },
    'UNDER_CONSERVATION': {
        label: 'Under Conservation',
        color: 'yellow',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
        textColor: 'text-yellow-800 dark:text-yellow-200',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        icon: Clock
    },
    'PROPOSED': {
        label: 'Proposed',
        color: 'blue',
        bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        textColor: 'text-blue-800 dark:text-blue-200',
        borderColor: 'border-blue-200 dark:border-blue-800',
        icon: Eye
    },
    'INACTIVE': {
        label: 'Inactive',
        color: 'gray',
        bgColor: 'bg-gray-100 dark:bg-gray-900/20',
        textColor: 'text-gray-800 dark:text-gray-200',
        borderColor: 'border-gray-200 dark:border-gray-800',
        icon: AlertTriangle
    }
    // Note: 'Archived' status is NOT available for Heritage Managers
    // Only SYSTEM_ADMINISTRATOR can archive sites via delete endpoint
};

const SiteStatusOverview = ({
    className = '',
    ...props
}) => {
    const { user } = useAuth();
    const { t } = useLanguage();

    // State management
    const [statusStats, setStatusStats] = useState({});
    const [recentChanges, setRecentChanges] = useState([]);
    const [trendData, setTrendData] = useState({});
    const [selectedPeriod, setSelectedPeriod] = useState('30days');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all');

    // API hooks for data loading
    const { data: statsData, loading: statsLoading, refetch: refetchStats } = useGet('/api/heritage-sites/statistics', {}, {
        onSuccess: (data) => {
            console.log('Site statistics loaded:', data);
        },
        onError: (error) => {
            console.error('Failed to load site statistics:', error);
        }
    });

    const { data: sitesData, loading: sitesLoading, refetch: refetchSites } = useGet('/api/heritage-sites', {}, {
        onSuccess: (data) => {
            console.log('Sites data loaded:', data);
        },
        onError: (error) => {
            console.error('Failed to load sites data:', error);
        }
    });

    // Combined loading state
    const isLoading = statsLoading || sitesLoading;

    // Load data
    useEffect(() => {
        if (statsData && sitesData) {
            processStatusOverview();
        }
    }, [statsData, sitesData, selectedPeriod, filter]);

    // Memoize the processStatusOverview function to prevent infinite loops
    const processStatusOverview = useCallback(async () => {
        try {
            // Process status distribution
            const sites = sitesData || [];
            const statusCounts = {};

            setStatusStats({
                total: sites.length,
                byStatus: statusCounts,
                lastUpdated: new Date().toISOString()
            });

            // Get real recent changes from API
            try {
                const changesResponse = await fetch('/api/heritage-sites/status/changes');
                if (changesResponse.ok) {
                    const changesData = await changesResponse.json();
                    setRecentChanges(changesData);
                }
            } catch (error) {
                console.error('Failed to load recent changes:', error);
            }

            // Get real trend data from API
            try {
                const trendsResponse = await fetch('/api/heritage-sites/status/trends');
                if (trendsResponse.ok) {
                    const trendsData = await trendsResponse.json();
                    setTrendData(trendsData);
                }
            } catch (error) {
                console.error('Failed to load trend data:', error);
            }

        } catch (error) {
            console.error('Failed to load status overview:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [sitesData]);



    // Handle refresh
    const handleRefresh = () => {
        setRefreshing(true);
        refetchStats();
        refetchSites();
        setRefreshing(false);
    };

    // Calculate percentage
    const getPercentage = (count, total) => {
        return total > 0 ? Math.round((count / total) * 100) : 0;
    };

    // Format timestamp
    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const date = new Date(timestamp);
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    const totalSites = statusStats.total || 0;

    return (
        <div className={`space-y-6 ${className}`} {...props}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Site Status Overview
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Monitor heritage site status across the platform
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    {/* Period Filter */}
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    >
                        <option value="7days">Last 7 days</option>
                        <option value="30days">Last 30 days</option>
                        <option value="90days">Last 90 days</option>
                        <option value="1year">Last year</option>
                    </select>

                    {/* Refresh Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="flex items-center space-x-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </Button>

                    {/* Export Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-2"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                    </Button>
                </div>
            </div>

            {loading ? (
                /* Loading State */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <Card key={`status-overview-skeleton-${index}`} className="animate-pulse">
                            <CardContent className="p-6">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <>
                    {/* Status Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Object.entries(SITE_STATUSES).map(([status, config]) => {
                            const count = statusStats.byStatus?.[status] || 0;
                            const percentage = getPercentage(count, totalSites);
                            const trend = trendData[status] || { change: 0, percentage: 0 };
                            const Icon = config.icon;

                            return (
                                <motion.div
                                    key={status}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={`w-12 h-12 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                                                    <Icon className={`w-6 h-6 ${config.textColor}`} />
                                                </div>

                                                {trend.change !== 0 && (
                                                    <div className={`flex items-center space-x-1 text-sm ${trend.change > 0 ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                        {trend.change > 0 ? (
                                                            <TrendingUp className="w-4 h-4" />
                                                        ) : (
                                                            <TrendingDown className="w-4 h-4" />
                                                        )}
                                                        <span>{Math.abs(trend.percentage)}%</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                                    {count}
                                                </h3>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                    {config.label}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {percentage}% of total sites
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Recent Status Changes */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center space-x-2">
                                    <Clock className="w-5 h-5" />
                                    <span>Recent Status Changes</span>
                                </CardTitle>

                                <Button variant="ghost" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {recentChanges.length > 0 ? (
                                <div className="space-y-4">
                                    {recentChanges.map((change) => {
                                        const fromConfig = SITE_STATUSES[change.fromStatus];
                                        const toConfig = SITE_STATUSES[change.toStatus];

                                        return (
                                            <div key={change.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${fromConfig.bgColor} ${fromConfig.textColor}`}>
                                                            {fromConfig.label}
                                                        </span>
                                                        <ArrowRight className="w-3 h-3 text-gray-400" />
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${toConfig.bgColor} ${toConfig.textColor}`}>
                                                            {toConfig.label}
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                                            {change.siteName}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {change.reason}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {formatTimeAgo(change.changedAt)}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        by {change.changedBy}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No recent status changes</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Button
                                    variant="outline"
                                    className="flex items-center space-x-2 h-auto p-4"
                                >
                                    <Search className="w-5 h-5" />
                                    <div className="text-left">
                                        <div className="font-medium">Search Sites by Status</div>
                                        <div className="text-sm text-gray-500">Find sites with specific status</div>
                                    </div>
                                </Button>

                                <Button
                                    variant="outline"
                                    className="flex items-center space-x-2 h-auto p-4"
                                >
                                    <BarChart3 className="w-5 h-5" />
                                    <div className="text-left">
                                        <div className="font-medium">Status Reports</div>
                                        <div className="text-sm text-gray-500">Generate detailed status reports</div>
                                    </div>
                                </Button>

                                <Button
                                    variant="outline"
                                    className="flex items-center space-x-2 h-auto p-4"
                                >
                                    <Users className="w-5 h-5" />
                                    <div className="text-left">
                                        <div className="font-medium">Manage Permissions</div>
                                        <div className="text-sm text-gray-500">Control status change permissions</div>
                                    </div>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
};

export default SiteStatusOverview;





