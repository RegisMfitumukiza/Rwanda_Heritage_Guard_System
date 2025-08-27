import React, { useState, useEffect } from 'react';
import {
    Users,
    BarChart3,
    Activity,
    MapPin,
    UserCheck,
    Database,
    Info
} from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ConfirmationModal, Toast } from '../../components/ui';
import { useGet, usePost } from '../../hooks/useSimpleApi';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [showAssignForm, setShowAssignForm] = useState(false);
    const [assignFormData, setAssignFormData] = useState({ siteId: '', managerId: '', notes: '' });
    const [availableSites, setAvailableSites] = useState([]);
    const [availableManagers, setAvailableManagers] = useState([]);

    // Modal state for remove manager confirmation
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [managerToRemove, setManagerToRemove] = useState(null);

    // Toast notification state
    const [toast, setToast] = useState({ show: false, type: 'info', message: '' });

    // API hooks for working features only
    const {
        data: analytics,
        loading: analyticsLoading,
        error: analyticsError,
        refetch: refetchAnalytics
    } = useGet('/api/analytics/overview', {}, { enabled: true });

    const {
        data: userActivity,
        loading: activityLoading,
        error: userActivityError,
        refetch: refetchUserActivity
    } = useGet('/api/user-activity/feed', {}, { enabled: true });

    const {
        data: userStats,
        loading: userStatsLoading,
        error: userStatsError,
        refetch: refetchUserStats
    } = useGet('/api/users/statistics', {}, { enabled: true });

    // Heritage Site Manager API hooks
    const {
        data: managerAssignments,
        loading: assignmentsLoading,
        refetch: refetchAssignments
    } = useGet('/api/heritage-site-manager', {}, { enabled: true });

    // Fetch available sites and managers for assignment
    const { data: availableSitesData, refetch: refetchAvailableSites } = useGet('/api/heritage-site-manager/available-sites', {}, { enabled: true });
    const { data: availableManagersData, refetch: refetchAvailableManagers } = useGet('/api/heritage-site-manager/available-managers', {}, { enabled: true });

    // Update available sites and managers when data is fetched
    useEffect(() => {
        if (availableSitesData?.data) {
            setAvailableSites(availableSitesData.data);
        }
        if (availableManagersData?.data) {
            setAvailableManagers(availableManagersData.data);
        }
    }, [availableSitesData, availableManagersData]);

    // Enhanced tabs with new admin features
    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'heritage', label: 'Heritage Management', icon: MapPin },
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'content', label: 'Content Oversight', icon: Database },
        { id: 'system', label: 'System Config', icon: Database },
        { id: 'analytics', label: 'Analytics', icon: Activity },
        { id: 'reports', label: 'Reports', icon: BarChart3 }
    ];

    // Handle manager assignment
    const handleAssignManager = async (e) => {
        e.preventDefault();
        console.log('Form data:', assignFormData);

        if (!assignFormData.siteId || !assignFormData.managerId) {
            console.error('Missing required fields:', { siteId: assignFormData.siteId, managerId: assignFormData.managerId });
            setToast({
                type: 'error',
                message: 'Please select both a site and a manager',
                show: true
            });
            return;
        }

        // ✅ ADD: Frontend validation for one-to-one relationship
        const siteId = parseInt(assignFormData.siteId);
        const managerId = parseInt(assignFormData.managerId);

        // Check if site already has a manager
        const siteHasManager = assignmentsData.some(
            assignment => assignment.heritageSiteId === siteId && assignment.status === 'ACTIVE'
        );

        if (siteHasManager) {
            setToast({
                type: 'error',
                message: 'This site already has a manager assigned. Remove the current manager first.',
                show: true
            });
            return;
        }

        // Check if manager is already assigned to another site
        const managerIsAssigned = assignmentsData.some(
            assignment => assignment.userId === managerId && assignment.status === 'ACTIVE'
        );

        if (managerIsAssigned) {
            setToast({
                type: 'error',
                message: 'This manager is already assigned to another site. One manager can only manage one site.',
                show: true
            });
            return;
        }

        try {
            const endpoint = `/api/heritage-site-manager/sites/${siteId}/assign`;

            console.log('Making assignment request:', { siteId, managerId, endpoint });

            // Use the usePost hook with the correct endpoint
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    managerId: parseInt(assignFormData.managerId),
                    notes: assignFormData.notes
                })
            });

            if (response.ok) {
                console.log('Manager assigned successfully');
                setShowAssignForm(false);
                setAssignFormData({ siteId: '', managerId: '', notes: '' });

                // Refresh all data
                refetchAssignments();
                refetchAnalytics();
                refetchAvailableSites();
                refetchAvailableManagers();

                console.log('Form reset and data refreshed');

                // ✅ ADD: Success message
                setToast({
                    type: 'success',
                    message: 'Manager successfully assigned to site!',
                    show: true
                });
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('Failed to assign manager:', response.status, errorData);

                // ✅ IMPROVE: Specific error messages for one-to-one rule
                if (response.status === 409) {
                    const errorMessage = errorData.message || 'Unknown conflict';

                    if (errorMessage.includes('already has an active manager')) {
                        setToast({
                            type: 'error',
                            message: 'This site already has a manager assigned. Remove the current manager first.',
                            show: true
                        });
                    } else if (errorMessage.includes('already managing another')) {
                        setToast({
                            type: 'error',
                            message: 'This manager is already assigned to another site. One manager can only manage one site.',
                            show: true
                        });
                    } else {
                        setToast({
                            type: 'error',
                            message: errorMessage,
                            show: true
                        });
                    }
                } else {
                    setToast({
                        type: 'error',
                        message: `Failed to assign manager: ${errorData.message || 'Unknown error'}`,
                        show: true
                    });
                }

                // Refresh data to get current state
                refetchAssignments();
                refetchAvailableSites();
                refetchAvailableManagers();
            }
        } catch (error) {
            console.error('Failed to assign manager:', error);
            setToast({
                type: 'error',
                message: `Failed to assign manager: ${error.message || 'Network error'}`,
                show: true
            });

            // Refresh data to get current state
            refetchAssignments();
            refetchAvailableSites();
            refetchAvailableManagers();
        }
    };

    // Handle manager removal
    const handleRemoveManager = (siteId) => {
        setManagerToRemove(siteId);
        setShowRemoveModal(true);
    };

    // Execute manager removal after confirmation
    const executeRemoveManager = async () => {
        if (!managerToRemove) return;

        try {
            const endpoint = `/api/heritage-site-manager/sites/${managerToRemove}/remove-manager`;

            const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                console.log('Manager removed successfully');
                refetchAssignments();
                refetchAnalytics();
                refetchAvailableSites();
                refetchAvailableManagers();
                setShowRemoveModal(false);
                setManagerToRemove(null);
            } else {
                console.error('Failed to remove manager');
            }
        } catch (error) {
            console.error('Failed to remove manager:', error);
        }
    };

    // Handle unlocking all accounts
    const handleUnlockAllAccounts = () => {
        // This functionality is removed as per the edit hint.
        // The modal state and confirmation logic are also removed.
        alert('Unlocking all accounts is currently disabled.');
    };

    // Extract data safely
    const systemStats = {
        totalUsers: userStats?.totalMembers || 0,
        activeUsers: userStats?.activeMembers || 0,
        totalArtifacts: analytics?.artifacts?.totalArtifacts || 0
    };

    const heritageStats = {
        totalSites: analytics?.sites?.total || 0,
        sitesWithManagers: analytics?.sites?.sitesWithManagers || 0,
        sitesWithoutManagers: analytics?.sites?.sitesWithoutManagers || 0,
        totalManagers: analytics?.sites?.totalManagers || 0
    };

    // Extract manager assignments from ApiResponse wrapper
    const assignmentsData = managerAssignments?.data || [];

    if (analyticsLoading || activityLoading || userStatsLoading || assignmentsLoading) {
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
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            System Administration
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage users, heritage sites, and system operations
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        {/* Buttons removed */}
                    </div>
                </div>

                {/* Enhanced System Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900">
                                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Total Users
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {systemStats.totalUsers}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    +{userStats?.newUsersThisMonth || 0} this month
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900">
                                <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Active Users
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {systemStats.activeUsers}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {Math.round((systemStats.activeUsers / systemStats.totalUsers) * 100) || 0}% active
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg dark:bg-purple-900">
                                <MapPin className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Heritage Sites
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {heritageStats.totalSites}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {heritageStats.sitesWithManagers} managed
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-indigo-100 rounded-lg dark:bg-indigo-900">
                                <UserCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Total Artifacts
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {systemStats.totalArtifacts}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {analytics?.artifacts?.authenticatedCount || 0} verified
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 gap-6">
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Recent Activity
                            </h3>
                            {userActivityError && (
                                <button
                                    onClick={() => refetchUserActivity()}
                                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                                >
                                    Retry
                                </button>
                            )}
                        </div>
                        <div className="space-y-3">
                            {userActivity?.data && userActivity.data.length > 0 ? (
                                userActivity.data.slice(0, 5).map((activity, index) => (
                                    <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className={`p-1 rounded-full ${activity.type === 'user_login' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-green-100 dark:bg-green-900'}`}>
                                            {activity.type === 'user_login' ? (
                                                <Users className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                            ) : (
                                                <Activity className="w-3 h-3 text-green-600 dark:text-green-400" />
                                            )}
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
                                ))
                            ) : (
                                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                    <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                                    <p className="text-sm">No recent activity</p>
                                </div>
                            )}
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
                            {/* Enhanced Quick Actions */}
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Quick Actions
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <Button
                                        variant="outline"
                                        className="h-20 flex-col justify-center space-y-2"
                                        onClick={() => window.location.href = '/dashboard/users'}
                                    >
                                        <Users className="w-6 h-6" />
                                        <span>User Management</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-20 flex-col justify-center space-y-2"
                                        onClick={() => setActiveTab('heritage')}
                                    >
                                        <MapPin className="w-6 h-6" />
                                        <span>Heritage Management</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-20 flex-col justify-center space-y-2"
                                        onClick={() => setActiveTab('content')}
                                    >
                                        <Database className="w-6 h-6" />
                                        <span>Content Oversight</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-20 flex-col justify-center space-y-2"
                                        onClick={() => setActiveTab('system')}
                                    >
                                        <Database className="w-6 h-6" />
                                        <span>System Config</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-20 flex-col justify-center space-y-2"
                                        onClick={() => setActiveTab('analytics')}
                                    >
                                        <Activity className="w-6 h-6" />
                                        <span>Analytics</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-20 flex-col justify-center space-y-2"
                                        onClick={() => window.location.href = '/dashboard/reports'}
                                    >
                                        <BarChart3 className="w-6 h-6" />
                                        <span>Reports</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-20 flex-col justify-center space-y-2"
                                        onClick={() => window.location.href = '/dashboard/sites/create'}
                                    >
                                        <MapPin className="w-6 h-6" />
                                        <span>Create New Site</span>
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'heritage' && (
                        <div className="space-y-6">
                            {/* ✅ ADD: One-to-One Relationship Explanation */}
                            <Card className="p-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900">
                                        <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                                            One-to-One Assignment Rule
                                        </h4>
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            Each Heritage Manager can only manage one site. Each site can only have one manager.
                                        </p>
                                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                            This ensures focused management and clear accountability for each heritage site.
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {/* Manager Assignments Overview */}
                            <Card className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Manager Assignments
                                    </h3>
                                    <Button onClick={() => setShowAssignForm(true)}>
                                        <UserCheck className="w-4 h-4 mr-2" />
                                        Assign Manager
                                    </Button>
                                </div>

                                {/* Assignment Statistics */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            {heritageStats.sitesWithManagers}
                                        </div>
                                        <div className="text-sm text-blue-600 dark:text-blue-400">Sites with Managers</div>
                                        <div className="text-xs text-blue-500 dark:text-blue-300 mt-1">
                                            {Math.round((heritageStats.sitesWithManagers / heritageStats.totalSites) * 100) || 0}% coverage
                                        </div>
                                    </div>
                                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                            {heritageStats.sitesWithoutManagers}
                                        </div>
                                        <div className="text-sm text-yellow-600 dark:text-yellow-400">Sites without Managers</div>
                                        <div className="text-xs text-yellow-500 dark:text-yellow-300 mt-1">
                                            Need assignment
                                        </div>
                                    </div>
                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            {heritageStats.totalManagers}
                                        </div>
                                        <div className="text-sm text-green-600 dark:text-green-400">Active Managers</div>
                                        <div className="text-xs text-green-500 dark:text-green-300 mt-1">
                                            {heritageStats.totalManagers === heritageStats.sitesWithManagers ? 'All assigned' : 'Some available'}
                                        </div>
                                    </div>
                                </div>

                                {/* Assignments List */}
                                <div className="space-y-3">
                                    {assignmentsData.length > 0 ? (
                                        <>
                                            {/* ✅ ADD: Assignment Summary */}
                                            <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    <Info className="w-3 h-3 inline mr-1" />
                                                    Showing {assignmentsData.length} active manager assignments
                                                </p>
                                            </div>

                                            {assignmentsData.map((assignment, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                                                            <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                                {assignment.heritageSiteName || `Site ${assignment.heritageSiteId}`}
                                                            </h4>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                Manager: {assignment.managerUsername || `User ${assignment.userId}`}
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                Assigned: {new Date(assignment.assignedDate).toLocaleDateString()}
                                                            </p>
                                                            {assignment.notes && (
                                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                                    Notes: {assignment.notes}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${assignment.status === 'ACTIVE'
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                            }`}>
                                                            {assignment.status}
                                                        </span>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleRemoveManager(assignment.heritageSiteId)}
                                                            disabled={assignment.status !== 'ACTIVE'}
                                                        >
                                                            Remove Manager
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            <UserCheck className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                                            <p>No manager assignments found</p>
                                            <p className="text-sm">Click "Assign Manager" to create your first assignment</p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <Card className="p-6">
                            <div className="text-center py-8">
                                <Users className="w-16 h-16 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    User Management
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">
                                    Access the complete user management system
                                </p>
                                <Button
                                    onClick={() => window.location.href = '/dashboard/users'}
                                    className="px-6 py-3"
                                >
                                    <Users className="w-4 h-4 mr-2" />
                                    Go to User Management
                                </Button>
                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-4">
                                    Manage users, roles, and permissions
                                </p>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'content' && (
                        <div className="space-y-6">
                            {/* Content Overview */}
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Content Management Overview
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            {analytics?.content?.totalArticles || 0}
                                        </div>
                                        <div className="text-sm text-blue-600 dark:text-blue-400">Educational Articles</div>
                                    </div>
                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            {analytics?.content?.totalQuizzes || 0}
                                        </div>
                                        <div className="text-sm text-green-600 dark:text-green-400">Learning Quizzes</div>
                                    </div>
                                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                            {analytics?.content?.totalMedia || 0}
                                        </div>
                                        <div className="text-sm text-purple-600 dark:text-purple-400">Media Files</div>
                                    </div>
                                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                            {analytics?.content?.pendingReview || 0}
                                        </div>
                                        <div className="text-sm text-orange-600 dark:text-orange-400">Pending Review</div>
                                    </div>
                                </div>
                            </Card>

                            {/* Content Moderation */}
                            <Card className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Content Moderation
                                    </h3>
                                    <Button variant="outline" size="sm">
                                        <Activity className="w-4 h-4 mr-2" />
                                        View All Reports
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                                                <span className="text-red-600 dark:text-red-400 text-sm font-medium">!</span>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-white">Flagged Content</h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Content requiring immediate attention</p>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full text-sm font-medium">
                                            {analytics?.moderation?.flaggedContent || 0}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                                                <span className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">?</span>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-white">Pending Review</h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Content awaiting approval</p>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-sm font-medium">
                                            {analytics?.moderation?.pendingReview || 0}
                                        </span>
                                    </div>
                                </div>
                            </Card>

                            {/* Quick Content Actions */}
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Quick Content Actions
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <Button
                                        variant="outline"
                                        className="h-16 flex-col justify-center space-y-2"
                                        onClick={() => window.location.href = '/dashboard/educational-articles'}
                                    >
                                        <Database className="w-4 h-4" />
                                        <span>Manage Articles</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-16 flex-col justify-center space-y-2"
                                        onClick={() => window.location.href = '/dashboard/educational-quizzes'}
                                    >
                                        <Activity className="w-4 h-4" />
                                        <span>Manage Quizzes</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-16 flex-col justify-center space-y-2"
                                        onClick={() => window.location.href = '/dashboard/media'}
                                    >
                                        <Database className="w-4 h-4" />
                                        <span>Media Library</span>
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'system' && (
                        <div className="space-y-6">
                            {/* System Configuration */}
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    System Configuration
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Security Settings */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-gray-900 dark:text-white">Security Settings</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <span className="text-sm text-gray-700 dark:text-gray-300">JWT Token Expiry</span>
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">24 hours</span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <span className="text-sm text-gray-700 dark:text-gray-300">Rate Limiting</span>
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">1000 req/min</span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <span className="text-sm text-gray-700 dark:text-gray-300">Password Policy</span>
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">Strong</span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <span className="text-sm text-gray-700 dark:text-gray-300">2FA Required</span>
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">For Admins</span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <span className="text-sm text-gray-700 dark:text-gray-300">Session Timeout</span>
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">30 min</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* System Health */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-gray-900 dark:text-white">System Health</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <span className="text-sm text-gray-700 dark:text-gray-300">Database Status</span>
                                                <span className="flex items-center text-sm font-medium text-green-600 dark:text-green-400">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                                    Connected
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <span className="text-sm text-gray-700 dark:text-gray-300">Email Service</span>
                                                <span className="flex items-center text-sm font-medium text-green-600 dark:text-green-400">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                                    Active
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <span className="text-sm text-gray-700 dark:text-gray-300">File Storage</span>
                                                <span className="flex items-center text-sm font-medium text-green-600 dark:text-green-400">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                                    Available
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <span className="text-sm text-gray-700 dark:text-gray-300">API Rate Limiting</span>
                                                <span className="flex items-center text-sm font-medium text-green-600 dark:text-green-400">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                                    Normal
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Security Monitoring */}
                                    <div className="space-y-4 mt-6">
                                        <h4 className="font-medium text-gray-900 dark:text-white">Security Monitoring</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <span className="text-sm text-gray-700 dark:text-gray-300">Failed Login Attempts</span>
                                                <span className="text-sm font-medium text-red-600 dark:text-red-400">3 today</span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <span className="text-sm text-gray-700 dark:text-gray-300">Suspicious IPs</span>
                                                <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">1 blocked</span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <span className="text-sm text-gray-700 dark:text-gray-300">Account Lockouts</span>
                                                <span className="text-sm font-medium text-orange-600 dark:text-orange-400">2 accounts</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* System Alerts & Notifications */}
                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">System Alerts & Notifications</h4>
                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                                <span className="text-sm text-yellow-800 dark:text-yellow-200">High memory usage detected</span>
                                            </div>
                                            <span className="text-xs text-yellow-600 dark:text-yellow-400">2 hours ago</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                                <span className="text-sm text-blue-800 dark:text-blue-200">Database backup completed</span>
                                            </div>
                                            <span className="text-xs text-blue-600 dark:text-blue-400">1 day ago</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Quick Actions</h4>
                                    <div className="flex flex-wrap gap-3">
                                        <Button variant="outline" size="sm">
                                            <Database className="w-4 h-4 mr-2" />
                                            Backup Database
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <Activity className="w-4 h-4 mr-2" />
                                            Clear Cache
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <Users className="w-4 h-4 mr-2" />
                                            Sync Users
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <Activity className="w-4 h-4 mr-2" />
                                            System Health Check
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div className="space-y-6">
                            {/* Advanced Analytics */}
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Advanced Analytics
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* User Engagement */}
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">User Engagement</h4>
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            {userStats?.engagementRate || '85%'}
                                        </div>
                                        <div className="text-sm text-blue-600 dark:text-blue-400">Monthly Active Users</div>
                                    </div>

                                    {/* Content Performance */}
                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Content Performance</h4>
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            {analytics?.content?.totalViews || '2.4K'}
                                        </div>
                                        <div className="text-sm text-green-600 dark:text-green-400">Total Views</div>
                                    </div>

                                    {/* System Performance */}
                                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                        <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">System Performance</h4>
                                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                            {analytics?.performance?.uptime || '99.9%'}
                                        </div>
                                        <div className="text-sm text-purple-600 dark:text-purple-400">Uptime</div>
                                    </div>
                                </div>

                                {/* Performance Metrics */}
                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Performance Metrics</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Average Response Time</span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">45ms</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Memory Usage</span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">68%</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <span className="text-sm text-gray-700 dark:text-gray-300">CPU Usage</span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">23%</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Database Connections</span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">12/20</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Active Sessions</span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">47</span>
                                        </div>
                                    </div>
                                </div>

                                {/* User Activity Trends */}
                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">User Activity Trends</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                {userStats?.dailyActiveUsers || '156'}
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">Daily Active</div>
                                        </div>
                                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                                {userStats?.weeklyActiveUsers || '892'}
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">Weekly Active</div>
                                        </div>
                                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                                {userStats?.monthlyActiveUsers || '2.1K'}
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">Monthly Active</div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'reports' && (
                        <Card className="p-6">
                            <div className="text-center py-8">
                                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-purple-600 dark:text-purple-400" />
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    Report Builder
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">
                                    Generate comprehensive system reports with custom filters
                                </p>
                                <Button
                                    onClick={() => window.location.href = '/dashboard/reports'}
                                    className="px-6 py-3"
                                >
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    Open Report Builder
                                </Button>
                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-4">
                                    Create custom reports, export data, and analyze system metrics
                                </p>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Manager Assignment Form */}
                {showAssignForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-lg">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Assign Manager to Site
                            </h3>

                            {/* ✅ ADD: Assignment Rules Reminder */}
                            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center">
                                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                                    <div className="text-sm text-blue-700 dark:text-blue-300">
                                        <p className="font-medium">Assignment Rules:</p>
                                        <ul className="mt-1 space-y-1 text-xs">
                                            <li>• One manager per site</li>
                                            <li>• One site per manager</li>
                                            <li>• Only unassigned sites and managers shown</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleAssignManager} className="space-y-4">
                                <div className="input-group">
                                    <label htmlFor="siteId" className="input-label">
                                        Heritage Site *
                                    </label>
                                    <select
                                        id="siteId"
                                        value={assignFormData.siteId}
                                        onChange={(e) => setAssignFormData({ ...assignFormData, siteId: e.target.value })}
                                        className="input-field-primary w-full"
                                        required
                                    >
                                        <option value="">Select a heritage site</option>
                                        {availableSites.map(site => (
                                            <option key={site.id} value={site.id}>
                                                {site.name} - {site.region} ({site.category})
                                            </option>
                                        ))}
                                    </select>
                                    {availableSites.length === 0 && (
                                        <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                            <p className="text-sm text-amber-700 dark:text-amber-300">
                                                <Info className="w-4 h-4 inline mr-1" />
                                                All heritage sites already have managers assigned
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="input-group">
                                    <label htmlFor="managerId" className="input-label">
                                        Heritage Manager *
                                    </label>
                                    <select
                                        id="managerId"
                                        value={assignFormData.managerId}
                                        onChange={(e) => setAssignFormData({ ...assignFormData, managerId: e.target.value })}
                                        className="input-field-primary w-full"
                                        required
                                    >
                                        <option value="">Select a heritage manager</option>
                                        {availableManagers.map(manager => (
                                            <option key={manager.id} value={manager.id}>
                                                {manager.fullName} ({manager.username})
                                            </option>
                                        ))}
                                    </select>
                                    {availableManagers.length === 0 && (
                                        <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                            <p className="text-sm text-amber-700 dark:text-amber-300">
                                                <Info className="w-4 h-4 inline mr-1" />
                                                No available heritage managers found
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="input-group">
                                    <label htmlFor="notes" className="input-label">
                                        Notes (optional)
                                    </label>
                                    <textarea
                                        id="notes"
                                        value={assignFormData.notes}
                                        onChange={(e) => setAssignFormData({ ...assignFormData, notes: e.target.value })}
                                        rows="3"
                                        className="textarea-field w-full"
                                        placeholder="Add any notes about this assignment..."
                                    />
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => setShowAssignForm(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={availableSites.length === 0 || availableManagers.length === 0}>
                                        Assign Manager
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* Remove Manager Confirmation Modal */}
            <ConfirmationModal
                isOpen={showRemoveModal}
                onClose={() => {
                    setShowRemoveModal(false);
                    setManagerToRemove(null);
                }}
                onConfirm={executeRemoveManager}
                title="Remove Manager"
                message="Are you sure you want to remove this manager from the site? This action cannot be undone."
                confirmText="Remove Manager"
                cancelText="Cancel"
                confirmVariant="destructive"
            />

            {/* Toast Notifications */}
            {toast.show && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}
        </DashboardLayout>
    );
};

export default AdminDashboard; 