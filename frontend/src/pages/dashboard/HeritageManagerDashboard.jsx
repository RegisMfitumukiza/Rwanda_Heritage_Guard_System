import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
    MapPin,
    Package,
    FileText,
    BarChart3,
    Plus,
    TrendingUp,
    Clock,
    CheckCircle,
    Users,
    Camera,
    Upload,
    Search,
    Filter,
    MoreVertical,
    Edit,
    Archive,
    Shield,
    Globe,
    Calendar,
    Activity,
    Settings,
    RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatsCard from '../../components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle, DashboardSkeleton } from '../../components/ui';
import { Button } from '../../components/ui/Button';
import ComponentErrorBoundary from '../../components/error/ComponentErrorBoundary';
import { useGet } from '../../hooks/useSimpleApi';
import heritageSiteManagerApi from '../../services/api/heritageSiteManagerApi';
import { heritageSitesApi } from '../../services/api/heritageSitesApi';
import { toast } from 'react-hot-toast';

/**
 * Heritage Manager Dashboard - Production-ready implementation
 * Features:
 * - Role-based access control
 * - Real-time statistics
 * - Quick actions based on user permissions
 * - Error boundaries and loading states
 * - Responsive design with mobile optimization
 * - Performance optimization with useMemo and useCallback
 */
const HeritageManagerDashboard = () => {
    const { user } = useAuth();
    const { t, currentLanguage } = useLanguage();
    const navigate = useNavigate();

    // State management with proper initialization
    const [stats, setStats] = useState({
        sites: { total: 0, active: 0, pending: 0, underConservation: 0 },
        artifacts: { total: 0, authenticated: 0, pending: 0 },
        documents: { total: 0, recent: 0, versions: 0 },
        activity: { uploads: 0, views: 0, downloads: 0 }
    });
    const [recentActivities, setRecentActivities] = useState([]);
    const [myManagedSites, setMyManagedSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // API hooks with proper error handling
    const {
        data: analyticsData,
        loading: analyticsLoading,
        error: analyticsError,
        refetch: refetchAnalytics
    } = useGet('/api/analytics/heritage-manager', {}, {
        onSuccess: (data) => {
            if (data) {
                setStats({
                    sites: {
                        total: data.sites?.total || 0,
                        active: data.sites?.active || 0,
                        pending: data.sites?.pending || 0,
                        underConservation: data.sites?.underConservation || 0
                    },
                    artifacts: {
                        total: data.artifacts?.total || 0,
                        authenticated: data.artifacts?.authenticated || 0,
                        pending: data.artifacts?.pending || 0
                    },
                    documents: {
                        total: data.documents?.total || 0,
                        recent: data.documents?.recent || 0,
                        versions: data.documents?.versions || 0
                    },
                    activity: {
                        uploads: data.activity?.uploads || 0,
                        views: data.activity?.views || 0,
                        downloads: data.activity?.downloads || 0
                    }
                });
            }
        },
        onError: (error) => {
            console.error('Failed to load analytics:', error);
            setError('Failed to load dashboard statistics');
        }
    });

    // Load user's managed sites
    const {
        data: managedSitesData,
        loading: managedSitesLoading,
        error: managedSitesError,
        refetch: refetchManagedSites
    } = useGet('/api/heritage-site-manager/my-sites', {}, {
        onSuccess: (data) => {
            console.log('Managed sites data received:', data); // Debug log
            if (data && data.data) {
                // Handle ApiResponse wrapper: data.data contains the actual sites
                const sites = Array.isArray(data.data) ? data.data : [];
                console.log('Processed sites:', sites); // Debug log
                if (sites.length > 0) {
                    console.log('First site details:', sites[0]); // Debug log
                }
                setMyManagedSites(sites);
            } else if (data && Array.isArray(data)) {
                // Fallback: direct array response
                console.log('Direct array response:', data); // Debug log
                setMyManagedSites(data);
            } else {
                setMyManagedSites([]);
            }
        },
        onError: (error) => {
            console.error('Failed to load managed sites:', error);
            // Don't set error state for this as it's not critical
        }
    });

    // Load recent activities
    const {
        data: activitiesData,
        loading: activitiesLoading,
        error: activitiesError,
        refetch: refetchActivities
    } = useGet('/api/user-activity/activity/heritage-manager', { limit: 10 }, {
        onSuccess: (data) => {
            if (data && data.data) {
                // Handle ApiResponse wrapper: data.data contains the actual activities
                setRecentActivities(Array.isArray(data.data) ? data.data : []);
            } else if (data && Array.isArray(data)) {
                // Fallback: direct array response
                setRecentActivities(data);
            } else {
                setRecentActivities([]);
            }
        },
        onError: (error) => {
            console.error('Failed to load activities:', error);
        }
    });



    // Combined loading state
    useEffect(() => {
        const isLoading = analyticsLoading || managedSitesLoading || activitiesLoading;
        setLoading(isLoading);
    }, [analyticsLoading, managedSitesLoading, activitiesLoading]);

    // Error handling
    useEffect(() => {
        if (analyticsError || managedSitesError || activitiesError) {
            const errorMessage = analyticsError?.message || managedSitesError?.message ||
                activitiesError?.message || 'An error occurred';
            setError(errorMessage);
        }
    }, [analyticsError, managedSitesError, activitiesError]);

    // Memoized quick actions based on user role and assigned site
    const quickActions = useMemo(() => {
        if (user?.role === 'HERITAGE_MANAGER' && myManagedSites.length > 0) {
            // Heritage Manager actions - site-specific (single site only)
            const primarySite = myManagedSites[0]; // Get the assigned site
            const siteName = getSiteDisplayName(primarySite);
            const siteRegion = getSiteRegion(primarySite);

            return [
                {
                    title: 'Edit My Site',
                    description: `Modify ${siteName}`,
                    icon: Edit,
                    color: 'blue',
                    action: `/dashboard/sites/${primarySite.heritageSiteId}`,
                },
                {
                    title: 'Site Documents',
                    description: `Manage documents and files for ${siteName}`,
                    icon: FileText,
                    color: 'blue',
                    action: `/dashboard/documents?siteId=${primarySite.heritageSiteId}`,
                    disabled: false
                },
                {
                    title: 'Site Status',
                    description: `View and update status for ${siteName}`,
                    icon: Activity,
                    color: 'green',
                    action: `/dashboard/status?siteId=${primarySite.heritageSiteId}`,
                    disabled: false
                },
                {
                    title: 'Site Media',
                    description: `Manage photos, videos, and documents for ${siteName}`,
                    icon: Camera,
                    color: 'purple',
                    action: `/dashboard/sites/${primarySite.heritageSiteId}/media`,
                    disabled: false
                },

            ];
        } else if (user?.role === 'SYSTEM_ADMINISTRATOR') {
            // System Administrator actions - global
            return [
                {
                    title: 'Add Heritage Site',
                    description: 'Create new heritage site',
                    icon: Plus,
                    color: 'green',
                    action: '/dashboard/sites/create',
                },
                {
                    title: 'Manage All Sites',
                    description: 'View and manage all heritage sites',
                    icon: Edit,
                    color: 'blue',
                    action: '/dashboard/sites',
                },
                {
                    title: 'Document Management',
                    description: 'Organize and manage all documents',
                    icon: FileText,
                    color: 'yellow',
                    action: '/dashboard/documents',
                },
                {
                    title: 'System Settings',
                    description: 'Configure system settings',
                    icon: Settings,
                    color: 'indigo',
                    action: '/dashboard/settings',
                }
            ];
        } else {
            // Default actions for other roles or no assigned site
            return [
                {
                    title: 'Browse Sites',
                    description: 'View available heritage sites',
                    icon: MapPin,
                    color: 'blue',
                    action: '/dashboard/sites',
                },
                {
                    title: 'Contact Admin',
                    description: 'Request site assignment',
                    icon: Users,
                    color: 'gray',
                    action: '/dashboard/support',
                }
            ];
        }
    }, [user?.role, myManagedSites]);

    // Memoized stats cards with enhanced descriptions and encouraging messages
    const statsCards = useMemo(() => [
        {
            title: 'My Assigned Site',
            value: stats.sites.total,
            icon: MapPin,
            color: 'blue',
            description: stats.sites.total === 0
                ? 'No site assigned yet'
                : stats.sites.total === 1
                    ? 'Heritage site I manage'
                    : 'Heritage sites I manage'
        },
        {
            title: 'Site Status',
            value: stats.sites.active > 0 ? 'Active' : 'Inactive',
            icon: CheckCircle,
            color: stats.sites.active > 0 ? 'green' : 'red',
            description: stats.sites.active > 0
                ? 'Site is accessible and operational'
                : 'Site requires attention or is under maintenance'
        },
        {
            title: 'Documents',
            value: stats.documents.total,
            icon: FileText,
            color: 'orange',
            description: stats.documents.total === 0
                ? 'Start by adding your first document'
                : `${stats.documents.total} document${stats.documents.total === 1 ? '' : 's'} in your site(s)`
        },
        {
            title: 'Site Artifacts',
            value: stats.artifacts.total,
            icon: Package,
            color: 'purple',
            description: stats.artifacts.total === 0
                ? 'Begin cataloging your site artifacts'
                : `${stats.artifacts.total} artifact${stats.artifacts.total === 1 ? '' : 's'} in your site(s)`
        }
    ], [stats]);

    // Callback functions for performance optimization
    const handleQuickAction = useCallback((action) => {
        navigate(action);
    }, [navigate]);

    const handleRefresh = useCallback(async () => {
        try {
            setLoading(true);
            await Promise.all([
                refetchAnalytics(),
                refetchManagedSites(),
                refetchActivities()
            ]);
            toast.success('Dashboard refreshed successfully');
        } catch (error) {
            console.error('Failed to refresh dashboard:', error);
            toast.error('Failed to refresh dashboard');
        } finally {
            setLoading(false);
        }
    }, [refetchAnalytics, refetchManagedSites, refetchActivities]);

    const handleErrorRetry = useCallback(() => {
        setError(null);
        handleRefresh();
    }, [handleRefresh]);

    // Loading state
    if (loading) {
        return (
            <DashboardLayout
                title="Heritage Management"
                subtitle="Manage heritage sites, artifacts, and documentation"
                showSearch={true}
            >
                <DashboardSkeleton />
            </DashboardLayout>
        );
    }

    // Error state
    if (error) {
        return (
            <DashboardLayout
                title="Heritage Management"
                subtitle="Manage heritage sites, artifacts, and documentation"
                showSearch={true}
            >
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                    <AlertCircle className="w-16 h-16 text-red-500" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white text-center">
                        Failed to Load Dashboard
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                        {error}
                    </p>
                    <div className="flex space-x-3">
                        <Button onClick={handleErrorRetry} variant="outline">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retry
                        </Button>
                        <Button onClick={() => window.location.reload()}>
                            Reload Page
                        </Button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title="Heritage Management"
            subtitle="Manage heritage sites, artifacts, and documentation"
            showSearch={true}
        >
            <ComponentErrorBoundary>
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-white mb-2">Heritage Management</h1>
                        <p className="text-slate-400">
                            {myManagedSites.length > 0
                                ? myManagedSites.length === 1
                                    ? `Managing ${getSiteDisplayName(myManagedSites[0])}`
                                    : `Managing ${myManagedSites.length} heritage sites`
                                : 'No sites assigned yet - Contact an administrator'
                            }
                        </p>
                    </div>
                    <Button onClick={handleRefresh} variant="outline" size="sm" className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </Button>
                </div>

                {/* Statistics Cards - Only show if sites are assigned */}
                {myManagedSites.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {/* My Assigned Sites */}
                        <Card className="bg-slate-800 border-slate-700 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="bg-blue-500/20 p-3 rounded-lg">
                                    <MapPin className="w-6 h-6 text-blue-400" />
                                </div>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm font-medium mb-1">MY ASSIGNED SITE</p>
                                <p className="text-white text-3xl font-bold mb-2">{stats.sites.total}</p>
                                <p className="text-slate-400 text-xs leading-tight">
                                    {stats.sites.total === 0
                                        ? 'No site assigned yet'
                                        : stats.sites.total === 1
                                            ? 'Heritage site I manage'
                                            : 'Heritage sites I manage'
                                    }
                                </p>
                            </div>
                        </Card>

                        {/* Site Status */}
                        <Card className="bg-slate-800 border-slate-700 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`${stats.sites.active > 0 ? 'bg-green-500/20' : 'bg-red-500/20'} p-3 rounded-lg`}>
                                    <CheckCircle className={`w-6 h-6 ${stats.sites.active > 0 ? 'text-green-400' : 'text-red-400'}`} />
                                </div>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm font-medium mb-1">SITE STATUS</p>
                                <p className="text-white text-3xl font-bold mb-2">
                                    {stats.sites.active > 0 ? 'Active' : 'Inactive'}
                                </p>
                                <p className="text-slate-400 text-xs leading-tight">
                                    {stats.sites.active > 0
                                        ? 'Site is accessible and operational'
                                        : 'Site requires attention or is under maintenance'
                                    }
                                </p>
                            </div>
                        </Card>

                        {/* Documents */}
                        <Card className="bg-slate-800 border-slate-700 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="bg-orange-500/20 p-3 rounded-lg">
                                    <FileText className="w-6 h-6 text-orange-400" />
                                </div>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm font-medium mb-1">DOCUMENTS</p>
                                <p className="text-white text-3xl font-bold mb-2">{stats.documents.total}</p>
                                <p className="text-slate-400 text-xs leading-tight">
                                    {stats.documents.total === 0
                                        ? 'Start by adding your first document'
                                        : `${stats.documents.total} document${stats.documents.total === 1 ? '' : 's'} in your site(s)`
                                    }
                                </p>
                            </div>
                        </Card>

                        {/* Site Artifacts */}
                        <Card className="bg-slate-800 border-slate-700 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="bg-purple-500/20 p-3 rounded-lg">
                                    <Package className="w-6 h-6 text-purple-400" />
                                </div>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm font-medium mb-1">SITE ARTIFACTS</p>
                                <p className="text-white text-3xl font-bold mb-2">{stats.artifacts.total}</p>
                                <p className="text-slate-400 text-xs leading-tight">
                                    {stats.artifacts.total === 0
                                        ? 'Begin cataloging your site artifacts'
                                        : `${stats.artifacts.total} artifact${stats.artifacts.total === 1 ? '' : 's'} in your site(s)`
                                    }
                                </p>
                            </div>
                        </Card>
                    </div>
                ) : (
                    <div className="mb-6">
                        <Card className="p-8 text-center">
                            <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                No Sites Assigned
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                You haven't been assigned to any heritage sites yet. Please contact a system administrator to get started.
                            </p>
                            <Button variant="outline" onClick={handleRefresh}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Check for Assignments
                            </Button>
                        </Card>
                    </div>
                )}

                {/* Quick Actions - Only show if sites are assigned */}
                {myManagedSites.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center mb-4">
                            <Activity className="w-5 h-5 mr-2 text-white" />
                            <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {quickActions.map((action) => (
                                <Card
                                    key={action.title}
                                    className="bg-slate-800 border-slate-700 p-6 hover:bg-slate-700 cursor-pointer transition-colors"
                                    onClick={() => handleQuickAction(action.action)}
                                >
                                    <div className="text-center">
                                        <div className={`mx-auto mb-4 p-3 bg-${action.color}-500/20 rounded-lg w-fit`}>
                                            <action.icon className={`w-6 h-6 text-${action.color}-400`} />
                                        </div>
                                        <h3 className="text-white font-medium text-base mb-2">{action.title}</h3>
                                        <p className="text-slate-400 text-sm leading-tight">
                                            {action.description}
                                        </p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main Content Grid - Only show if sites are assigned */}
                {myManagedSites.length > 0 && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* My Managed Site */}
                        <Card className="bg-slate-800 border-slate-700">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between text-white">
                                    <span className="flex items-center">
                                        <MapPin className="w-5 h-5 mr-2 text-blue-400" />
                                        My Managed Site
                                    </span>
                                    <Link to="/dashboard/sites">
                                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                            View All
                                        </Button>
                                    </Link>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {myManagedSites.slice(0, 3).map((site) => {
                                        const siteName = getSiteDisplayName(site);
                                        const siteRegion = getSiteRegion(site);
                                        const siteStatus = getSiteStatus(site);
                                        const statusColor = getStatusColor(siteStatus);

                                        // Debug logging
                                        console.log('Processing site:', {
                                            id: site.id,
                                            heritageSiteId: site.heritageSiteId,
                                            name: site.heritageSiteName,
                                            nameEn: site.heritageSiteNameEn,
                                            region: site.heritageSiteRegion,
                                            status: site.heritageSiteStatus,
                                            processed: { siteName, siteRegion, siteStatus }
                                        });

                                        return (
                                            <div
                                                key={site.id || site.heritageSiteId}
                                                className="flex items-center justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                                            >
                                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                    <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-white truncate">
                                                            {siteName}
                                                        </p>
                                                        <div className="flex items-center space-x-2 text-sm text-slate-400">
                                                            <span className="truncate">{siteRegion}</span>
                                                            <span className="text-slate-500">•</span>
                                                            <span className={`${statusColor} font-medium`}>
                                                                {siteStatus}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Link to={`/dashboard/sites/${site.heritageSiteId || site.id}`} className="flex-shrink-0 ml-2">
                                                    <Button variant="outline" size="sm" className="text-xs">
                                                        View Details
                                                    </Button>
                                                </Link>
                                            </div>
                                        );
                                    })}

                                    {myManagedSites.length === 0 && (
                                        <div className="text-center py-8 text-slate-400">
                                            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            <p className="font-medium mb-2">No sites assigned yet</p>
                                            <p className="text-sm">Contact a system administrator to get started with heritage site management.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activities */}
                        <Card className="bg-slate-800 border-slate-700">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between text-white">
                                    <span className="flex items-center">
                                        <Activity className="w-5 h-5 mr-2 text-green-400" />
                                        Recent Activities
                                    </span>
                                    <Link to="/dashboard/activity">
                                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                            View All
                                        </Button>
                                    </Link>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {recentActivities.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentActivities.slice(0, 5).map((activity, index) => (
                                            <div
                                                key={activity.id || index}
                                                className="flex items-start space-x-3 p-3 bg-slate-700 rounded-lg"
                                            >
                                                <div className={`w-2 h-2 rounded-full bg-${getActivityColor(activity.type)}-500 mt-2 flex-shrink-0`} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-white font-medium truncate">
                                                        {activity.description || activity.action || 'Activity performed'}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        {formatTimestamp(activity.timestamp)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-slate-400">
                                        <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p className="font-medium mb-2">No recent activities</p>
                                        <p className="text-sm">Start managing your heritage site to see your activity history here.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}


            </ComponentErrorBoundary>
        </DashboardLayout>
    );
};

// Helper functions
const getSiteDisplayName = (site) => {
    console.log('getSiteDisplayName called with:', site); // Debug log

    if (!site) return 'Unknown Site';

    // Try to get the best available name from enhanced DTO fields
    const name = site.heritageSiteNameEn || site.heritageSiteNameRw || site.heritageSiteNameFr || site.heritageSiteName;
    console.log('Available names:', {
        heritageSiteNameEn: site.heritageSiteNameEn,
        heritageSiteNameRw: site.heritageSiteNameRw,
        heritageSiteNameFr: site.heritageSiteNameFr,
        heritageSiteName: site.heritageSiteName,
        selected: name
    }); // Debug log

    if (name && name.trim() !== '') return name;

    // Fallback to site ID if no name is available
    const fallbackName = `Site ${site.heritageSiteId || site.id}`;
    console.log('Using fallback name:', fallbackName); // Debug log
    return fallbackName;
};

const getSiteRegion = (site) => {
    console.log('getSiteRegion called with:', site); // Debug log

    if (!site) return 'No region specified';

    // Use the enhanced DTO field for region
    const region = site.heritageSiteRegion || site.region;
    console.log('Region found:', region); // Debug log

    if (region && region.trim() !== '') return region;

    return 'No region specified';
};

const getSiteStatus = (site) => {
    console.log('getSiteStatus called with:', site); // Debug log

    if (!site) return 'UNKNOWN';

    // Use the enhanced DTO field for status
    const status = site.heritageSiteStatus || site.status;
    console.log('Status found:', status); // Debug log

    if (status && status.trim() !== '') return status.toUpperCase();

    return 'ACTIVE'; // Default status
};

const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
        case 'ACTIVE': return 'text-green-400';
        case 'UNDER_CONSERVATION': return 'text-yellow-400';
        case 'PENDING': return 'text-orange-400';
        case 'PROPOSED': return 'text-blue-400';
        case 'INACTIVE': return 'text-red-400';
        default: return 'text-slate-400';
    }
};

const getActivityColor = (type) => {
    switch (type) {
        case 'CREATE': return 'green';
        case 'UPDATE': return 'blue';
        case 'DELETE': return 'red';
        case 'STATUS_CHANGE': return 'yellow';
        case 'SITE_UPDATE': return 'blue';
        case 'DOCUMENT_UPLOAD': return 'green';
        case 'MEDIA_ADD': return 'purple';
        default: return 'gray';
    }
};

const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
        case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
        case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
        case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
};

const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown time';

    try {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now - time;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days}d ago`;
        } else if (hours > 0) {
            return `${hours}h ago`;
        } else {
            return 'Just now';
        }
    } catch (error) {
        return 'Unknown time';
    }
};

export default HeritageManagerDashboard; 