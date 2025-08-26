import React, { useState, useEffect } from 'react';
import {
    MapPin,
    Edit3,
    Upload,
    FileText,
    Activity,
    Eye,
    RefreshCw
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useGet } from '../../hooks/useSimpleApi';

/**
 * Heritage Manager Site View
 * Simplified interface for Heritage Managers to manage their assigned site(s)
 * Focused on single-site management without unnecessary filters/complexity
 */
const HeritageManagerSiteView = () => {
    const { user } = useAuth();
    const [selectedSite, setSelectedSite] = useState(null);
    const [loading, setLoading] = useState(true);

    // Get assigned sites for the current Heritage Manager
    const {
        data: assignedSites,
        loading: sitesLoading,
        error: sitesError,
        refetch: refetchSites
    } = useGet('/api/heritage-site-manager/my-sites', { userId: user?.id }, { enabled: !!user?.id });

    // Get site details for the selected site
    const {
        data: siteDetails,
        loading: detailsLoading,
        refetch: refetchDetails
    } = useGet(`/api/heritage-sites/${selectedSite?.id}`, {}, { enabled: !!selectedSite?.id });

    // Get recent activity for the selected site
    const {
        data: recentActivity,
        loading: activityLoading,
        refetch: refetchActivity
    } = useGet(`/api/heritage-sites/${selectedSite?.id}/activity`, {}, { enabled: !!selectedSite?.id });

    useEffect(() => {
        if (assignedSites?.data && assignedSites.data.length > 0) {
            setSelectedSite(assignedSites.data[0]); // Select first assigned site
        }
        setLoading(false);
    }, [assignedSites]);

    const handleRefresh = () => {
        refetchSites();
        if (selectedSite) {
            refetchDetails();
            refetchActivity();
        }
    };

    if (loading || sitesLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (sitesError) {
        return (
            <Card className="p-6">
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Error Loading Sites
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Unable to load your assigned heritage sites
                    </p>
                    <Button onClick={handleRefresh} variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Again
                    </Button>
                </div>
            </Card>
        );
    }

    if (!assignedSites?.data || assignedSites.data.length === 0) {
        return (
            <Card className="p-6">
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No Sites Assigned
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        You don't have any heritage sites assigned to you yet.
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                        Contact a System Administrator to get assigned to a heritage site.
                    </p>
                </div>
            </Card>
        );
    }

    const site = selectedSite;
    const details = siteDetails?.data || site;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        My Heritage Site
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage the heritage site assigned to you
                    </p>
                </div>
                <Button onClick={handleRefresh} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Site Overview Card */}
            <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                            <MapPin className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {details?.nameEn || details?.heritageSiteName || 'Heritage Site'}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                {details?.region || 'Location not specified'}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${details?.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                            {details?.status || 'UNKNOWN'}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Assigned: {new Date(site?.assignedDate).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {/* Site Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Category</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                            {details?.category || 'Not specified'}
                        </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Ownership</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                            {details?.ownershipType || 'Not specified'}
                        </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Year</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                            {details?.establishmentYear || 'Unknown'}
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Button
                            variant="outline"
                            className="h-16 flex-col justify-center space-y-2"
                            onClick={() => window.location.href = `/dashboard/sites/${details?.id}/edit`}
                        >
                            <Edit3 className="w-5 h-5" />
                            <span className="text-sm">Edit Details</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-16 flex-col justify-center space-y-2"
                            onClick={() => window.location.href = `/dashboard/sites/${details?.id}/media`}
                        >
                            <Upload className="w-5 h-5" />
                            <span className="text-sm">Upload Media</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-16 flex-col justify-center space-y-2"
                            onClick={() => window.location.href = `/dashboard/sites/${details?.id}/documents`}
                        >
                            <FileText className="w-5 h-5" />
                            <span className="text-sm">Documents</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-16 flex-col justify-center space-y-2"
                            onClick={() => window.location.href = `/dashboard/sites/${details?.id}`}
                        >
                            <Eye className="w-5 h-5" />
                            <span className="text-sm">View Site</span>
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Recent Activity
                    </h3>
                    <Button variant="outline" size="sm">
                        <Activity className="w-4 h-4 mr-2" />
                        View All
                    </Button>
                </div>

                {activityLoading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : recentActivity?.data && recentActivity.data.length > 0 ? (
                    <div className="space-y-3">
                        {recentActivity.data.slice(0, 5).map((activity, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                                    <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        {activity.action || activity.type}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(activity.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                        <p className="text-sm">No recent activity</p>
                        <p className="text-xs">Start managing your site to see activity here</p>
                    </div>
                )}
            </Card>

            {/* Site Statistics */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Site Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {details?.mediaCount || 0}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400">Media Files</div>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {details?.documentCount || 0}
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400">Documents</div>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {details?.visitorCount || 0}
                        </div>
                        <div className="text-sm text-purple-600 dark:text-purple-400">Visitors</div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default HeritageManagerSiteView;
