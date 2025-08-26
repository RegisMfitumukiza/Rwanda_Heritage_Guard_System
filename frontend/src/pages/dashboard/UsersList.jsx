import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card, CardContent, ConfirmationModal, Toast } from '../../components/ui';
import { Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui';
import {
    Users,
    Shield,
    UserCheck,
    UserX,
    UserPlus,
    Search,
    Edit,
    Trash2,
    Unlock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    RefreshCw
} from 'lucide-react';
import { useGet } from '../../hooks/useSimpleApi';

const UsersList = () => {
    const { user } = useAuth();
    const { t } = useLanguage();

    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(20);

    // Modal states
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: null, // 'suspend', 'disable', 'softDelete', 'reactivate', 'restore', 'unlock', 'unlockAll'
        user: null,
        message: '',
        title: '',
        variant: 'default',
        reason: '' // For status change reasons
    });
    const [isProcessing, setIsProcessing] = useState(false);

    // Toast state
    const [toast, setToast] = useState({
        isVisible: false,
        message: '',
        type: 'info'
    });

    // API hooks
    const {
        data: usersData,
        loading: usersLoading,
        error: usersError,
        refetch: refetchUsers
    } = useGet('/api/users', {
        page: currentPage,
        size: pageSize,
        search: searchTerm
    }, {
        onSuccess: (data) => console.log('Users loaded:', data),
        onError: (error) => console.error('Failed to load users:', error)
    });

    // Extract data
    const users = usersData?.users || [];
    const totalUsers = usersData?.totalUsers || 0;

    // Enhanced status calculation using new status management system
    const getActiveUserCount = () => {
        return users.filter(user => user.userStatus === 'ACTIVE').length;
    };

    const getSuspendedUserCount = () => {
        return users.filter(user => user.userStatus === 'SUSPENDED').length;
    };

    const getDisabledUserCount = () => {
        return users.filter(user => user.userStatus === 'DISABLED').length;
    };

    const getDeletedUserCount = () => {
        return users.filter(user => user.userStatus === 'DELETED').length;
    };

    const activeUsers = getActiveUserCount();
    const suspendedUsers = getSuspendedUserCount();
    const disabledUsers = getDisabledUserCount();
    const deletedUsers = getDeletedUserCount();

    // Filter users based on active tab
    const getFilteredUsers = () => {
        if (activeTab === 'all') return users;
        if (activeTab === 'active') return users.filter(u => u.userStatus === 'ACTIVE');
        if (activeTab === 'suspended') return users.filter(u => u.userStatus === 'SUSPENDED');
        if (activeTab === 'disabled') return users.filter(u => u.userStatus === 'DISABLED');
        if (activeTab === 'deleted') return users.filter(u => u.userStatus === 'DELETED');
        return users;
    };

    const filteredUsers = getFilteredUsers();

    // Enhanced status display with new status management system
    const getUserStatus = (user) => {
        const status = user.userStatus || 'ACTIVE';

        switch (status) {
            case 'ACTIVE':
                return {
                    status: 'active',
                    label: t('Active'),
                    variant: 'default',
                    icon: CheckCircle,
                    description: 'Full access to system'
                };
            case 'SUSPENDED':
                return {
                    status: 'suspended',
                    label: t('Suspended'),
                    variant: 'warning',
                    icon: AlertTriangle,
                    description: 'Temporarily suspended - can be reactivated'
                };
            case 'DISABLED':
                return {
                    status: 'disabled',
                    label: t('Disabled'),
                    variant: 'destructive',
                    icon: XCircle,
                    description: 'Permanently deactivated - cannot be reactivated'
                };
            case 'DELETED':
                return {
                    status: 'deleted',
                    label: t('Deleted'),
                    variant: 'secondary',
                    icon: Trash2,
                    description: 'Marked as deleted - data preserved'
                };
            default:
                return {
                    status: 'unknown',
                    label: t('Unknown'),
                    variant: 'secondary',
                    icon: AlertTriangle,
                    description: 'Status unknown'
                };
        }
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(0);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Helper functions to open modals
    const openModal = (type, user, title, message, variant = 'default', reason = '') => {
        setModalConfig({
            isOpen: true,
            type,
            user,
            title,
            message,
            variant,
            reason
        });
    };

    const closeModal = () => {
        setModalConfig({
            isOpen: false,
            type: null,
            user: null,
            message: '',
            title: '',
            variant: 'default',
            reason: ''
        });
        setIsProcessing(false);
    };

    const showToast = (message, type = 'success') => {
        setToast({
            isVisible: true,
            message,
            type
        });
    };

    const hideToast = () => {
        setToast({
            isVisible: false,
            message: '',
            type: 'info'
        });
    };

    // Handle unlocking all suspended accounts
    const handleUnlockAllSuspended = () => {
        openModal(
            'unlockAll',
            null,
            'Unlock All Suspended Users',
            `Are you sure you want to unlock all ${suspendedUsers} suspended users? This will clear their security lockouts and allow them to log in again.`,
            'warning'
        );
    };

    // Handle suspending user (temporary suspension)
    const handleSuspendUser = (userItem) => {
        openModal(
            'suspend',
            userItem,
            'Suspend User',
            `Are you sure you want to suspend user "${userItem.username || userItem.email}"? This will temporarily restrict their access but preserve all their data.`,
            'warning'
        );
    };

    // Handle disabling user (permanent deactivation)
    const handleDisableUser = (userItem) => {
        openModal(
            'disable',
            userItem,
            'Disable User',
            `Are you sure you want to disable user "${userItem.username || userItem.email}"? This will permanently deactivate their account but preserve all their data.`,
            'danger'
        );
    };

    // Handle soft deleting user (mark as deleted but preserve data)
    const handleSoftDeleteUser = (userItem) => {
        openModal(
            'softDelete',
            userItem,
            'Soft Delete User',
            `Are you sure you want to soft delete user "${userItem.username || userItem.email}"? This will mark them as deleted but preserve all their data and content.`,
            'destructive'
        );
    };

    // Handle reactivating suspended user
    const handleReactivateUser = (userItem) => {
        openModal(
            'reactivate',
            userItem,
            'Reactivate User',
            `Are you sure you want to reactivate user "${userItem.username || userItem.email}"? This will restore their full access to the system.`,
            'success'
        );
    };

    // Handle restoring soft-deleted user
    const handleRestoreUser = (userItem) => {
        openModal(
            'reactivate',
            userItem,
            'Restore User',
            `Are you sure you want to restore user "${userItem.username || userItem.email}"? This will restore their account and all access.`,
            'success'
        );
    };

    // Handle unlocking individual user
    const handleUnlockUser = (userItem) => {
        openModal(
            'unlock',
            userItem,
            'Unlock User Account',
            `Are you sure you want to unlock user "${userItem.username || userItem.email}"? This will clear their security lockout and allow them to log in again.`,
            'warning'
        );
    };

    // Handle deleting user
    const handleDeleteUser = (userItem) => {
        openModal(
            'delete',
            userItem,
            'Delete User',
            `Are you sure you want to delete user "${userItem.username || userItem.email}"? This action cannot be undone and will permanently remove the user from the system.`,
            'danger'
        );
    };

    // Execute the confirmed action
    const executeAction = async () => {
        if (!modalConfig.user && modalConfig.type !== 'unlockAll') {
            closeModal();
            return;
        }

        setIsProcessing(true);
        const token = localStorage.getItem('token');

        if (!token) {
            showToast('You must be logged in to perform this action', 'error');
            closeModal();
            return;
        }

        // Validate reason for status changes that require it
        if (['suspend', 'disable', 'softDelete'].includes(modalConfig.type) && !modalConfig.reason?.trim()) {
            showToast('Please provide a reason for this action', 'error');
            return;
        }

        try {
            switch (modalConfig.type) {
                case 'suspend':
                    await executeSuspendUser(modalConfig.user, modalConfig.reason, token);
                    break;
                case 'disable':
                    await executeDisableUser(modalConfig.user, modalConfig.reason, token);
                    break;
                case 'softDelete':
                    await executeSoftDeleteUser(modalConfig.user, modalConfig.reason, token);
                    break;
                case 'reactivate':
                    await executeReactivateUser(modalConfig.user, token);
                    break;
                case 'restore':
                    await executeRestoreUser(modalConfig.user, token);
                    break;
                case 'unlock':
                    await executeUnlockUser(modalConfig.user, token);
                    break;
                case 'unlockAll':
                    await executeUnlockAllSuspended(token);
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.error('Action execution failed:', error);
            showToast('Action failed. Check console for details.', 'error');
        } finally {
            closeModal();
        }
    };

    // Execute toggle status - LEGACY FUNCTION COMMENTED OUT
    // const executeToggleStatus = async (userItem, enabled) => {
    //     const response = await fetch(`/api/users/${userItem.id}/status`, {
    //         method: 'PUT',
    //         headers: {
    //             'Authorization': `Bearer ${token}`,
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify({ enabled })
    //     });

    //     if (response.ok) {
    //         const action = enabled ? 'enabled' : 'disabled';
    //         showToast(`User ${action} successfully!`, 'success');
    //         refetchUsers();
    //     } else {
    //         const errorData = await response.json();
    //         throw new Error(errorData.error || 'Unknown error');
    //     }
    // };

    // Execute delete user - LEGACY FUNCTION COMMENTED OUT
    // const executeDeleteUser = async (userItem) => {
    //     const response = await fetch(`/api/users/${userItem.id}`, {
    //         method: 'DELETE',
    //         headers: {
    //             'Authorization': `Bearer ${token}`,
    //             'Content-Type': 'application/json'
    //         }
    //     });

    //     if (response.ok) {
    //         showToast('User deleted successfully!', 'success');
    //         refetchUsers();
    //     } else {
    //         const errorData = await response.json();
    //         throw new Error(errorData.error || 'Unknown error');
    //     }
    // };

    // Execute unlock user
    const executeUnlockUser = async (userItem, token) => {
        const response = await fetch(`/api/users/${userItem.id}/unlock`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            showToast('User unlocked successfully!', 'success');
            refetchUsers();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Unknown error');
        }
    };

    // Execute unlock all suspended
    const executeUnlockAllSuspended = async (token) => {
        const suspendedUserIds = users
            .filter(u => u.userStatus === 'SUSPENDED')
            .map(u => u.id);

        if (suspendedUserIds.length === 0) {
            showToast('No suspended users to unlock', 'warning');
            return;
        }

        const promises = suspendedUserIds.map(userId =>
            fetch(`/api/users/${userId}/unlock`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
        );

        await Promise.all(promises);
        showToast(`Successfully unlocked ${suspendedUserIds.length} suspended users!`, 'success');
        refetchUsers();
    };

    // ===== NEW STATUS MANAGEMENT EXECUTION FUNCTIONS =====

    // Execute suspend user
    const executeSuspendUser = async (userItem, reason, token) => {
        const response = await fetch(`/api/users/${userItem.id}/suspend`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason })
        });

        if (response.ok) {
            showToast('User suspended successfully!', 'success');
            refetchUsers();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Unknown error');
        }
    };

    // Execute disable user
    const executeDisableUser = async (userItem, reason, token) => {
        const response = await fetch(`/api/users/${userItem.id}/disable`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason })
        });

        if (response.ok) {
            showToast('User disabled successfully!', 'success');
            refetchUsers();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Unknown error');
        }
    };

    // Execute soft delete user
    const executeSoftDeleteUser = async (userItem, reason, token) => {
        const response = await fetch(`/api/users/${userItem.id}/soft-delete`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason })
        });

        if (response.ok) {
            showToast('User soft deleted successfully!', 'success');
            refetchUsers();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Unknown error');
        }
    };

    // Execute reactivate user
    const executeReactivateUser = async (userItem, token) => {
        const response = await fetch(`/api/users/${userItem.id}/reactivate`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            showToast('User reactivated successfully!', 'success');
            refetchUsers();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Unknown error');
        }
    };

    // Execute restore user
    const executeRestoreUser = async (userItem, token) => {
        const response = await fetch(`/api/users/${userItem.id}/restore`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            showToast('User restored successfully!', 'success');
            refetchUsers();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Unknown error');
        }
    };

    if (!user || user.role !== 'SYSTEM_ADMINISTRATOR') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 text-center">
                        <Shield className="w-12 h-12 mx-auto mb-4 text-red-500" />
                        <h2 className="text-xl font-semibold mb-2">{t('Access Denied')}</h2>
                        <p className="text-gray-600">{t('Only system administrators can access this page.')}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {t('User Management')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {t('Manage system users and their permissions')}
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button
                        onClick={() => window.location.href = '/dashboard/users/create'}
                        className="px-6 py-3"
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        {t('Create New User')}
                    </Button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder={t('Search users by name, email, or role...')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                </div>
                <Button
                    onClick={() => refetchUsers()}
                    variant="outline"
                    disabled={usersLoading}
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${usersLoading ? 'animate-spin' : ''}`} />
                    {usersLoading ? t('Loading...') : t('Refresh')}
                </Button>
            </div>

            {/* Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="all">
                        {t('All Users')}
                        <Badge variant="secondary" className="ml-2">
                            {usersLoading ? '...' : totalUsers}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="active">
                        {t('Active')}
                        <Badge variant="secondary" className="ml-2">
                            {activeUsers}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="suspended">
                        {t('Suspended')}
                        <Badge variant="secondary" className="ml-2">
                            {suspendedUsers}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="disabled">
                        {t('Disabled')}
                        <Badge variant="secondary" className="ml-2">
                            {disabledUsers}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="deleted">
                        {t('Deleted')}
                        <Badge variant="secondary" className="ml-2">
                            {deletedUsers}
                        </Badge>
                    </TabsTrigger>
                </TabsList>

                {/* All Users Tab */}
                <TabsContent value="all" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">{t('All Users')}</h3>
                        <span className="text-sm text-gray-500">
                            {usersLoading ? t('Loading...') : `${filteredUsers.length} of ${totalUsers} users`}
                        </span>
                    </div>

                    {usersLoading ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">{t('Loading users...')}</p>
                            </CardContent>
                        </Card>
                    ) : usersError ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <div className="text-red-500 mb-4">
                                    <Shield className="w-12 h-12 mx-auto" />
                                </div>
                                <p className="text-red-600 mb-4">{t('Error loading users')}</p>
                                <Button onClick={() => refetchUsers()} variant="outline">
                                    {t('Retry')}
                                </Button>
                            </CardContent>
                        </Card>
                    ) : filteredUsers.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-600">
                                    {searchTerm ? t('No users found matching your search') : t('No users found')}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {filteredUsers.map((userItem) => {
                                const status = getUserStatus(userItem);

                                return (
                                    <Card key={userItem.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${status.status === 'active' ? 'bg-green-100' :
                                                        status.status === 'inactive' ? 'bg-gray-100' :
                                                            'bg-red-100'
                                                        }`}>
                                                        <status.icon className={`w-5 h-5 ${status.status === 'active' ? 'text-green-600' :
                                                            status.status === 'inactive' ? 'text-gray-600' :
                                                                'text-red-600'
                                                            }`} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                                            {userItem.firstName && userItem.lastName
                                                                ? `${userItem.firstName} ${userItem.lastName}`
                                                                : userItem.firstName || userItem.lastName || userItem.name || 'No Name'
                                                            }
                                                        </h4>
                                                        <p className="text-sm text-gray-500">{userItem.email}</p>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <Badge variant={status.variant}>
                                                                {status.label}
                                                            </Badge>
                                                            <Badge variant="outline">{userItem.role}</Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {/* Hide edit/delete buttons for the current logged-in admin user */}
                                                    {userItem.email !== user.email && (
                                                        <>
                                                            {/* Unlock button removed - use status management instead */}
                                                            {/* Status Management Buttons */}
                                                            {userItem.userStatus === 'ACTIVE' && (
                                                                <>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handleSuspendUser(userItem)}
                                                                        className="text-yellow-600 hover:text-yellow-700"
                                                                    >
                                                                        <AlertTriangle className="w-4 h-4 mr-2" />
                                                                        Suspend
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handleDisableUser(userItem)}
                                                                        className="text-orange-600 hover:text-orange-700"
                                                                    >
                                                                        <UserX className="w-4 h-4 mr-2" />
                                                                        Disable
                                                                    </Button>
                                                                </>
                                                            )}

                                                            {userItem.userStatus === 'SUSPENDED' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleReactivateUser(userItem)}
                                                                    className="text-green-600 hover:text-green-700"
                                                                >
                                                                    <UserCheck className="w-4 h-4 mr-2" />
                                                                    Reactivate
                                                                </Button>
                                                            )}

                                                            {userItem.userStatus === 'DISABLED' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleSoftDeleteUser(userItem)}
                                                                    className="text-red-600 hover:text-red-700"
                                                                >
                                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                                    Soft Delete
                                                                </Button>
                                                            )}

                                                            {userItem.userStatus === 'DELETED' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleRestoreUser(userItem)}
                                                                    className="text-green-600 hover:text-green-700"
                                                                >
                                                                    <UserCheck className="w-4 h-4 mr-2" />
                                                                    Restore
                                                                </Button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>

                {/* Active Users Tab */}
                <TabsContent value="active" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">{t('Active Users')}</h3>
                        <span className="text-sm text-gray-500">
                            {activeUsers} {t('active users')}
                        </span>
                    </div>

                    {filteredUsers.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <UserCheck className="w-12 h-12 mx-auto mb-4 text-green-500" />
                                <p className="text-gray-600">{t('No active users to display')}</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {filteredUsers.map((userItem) => {
                                const status = getUserStatus(userItem);

                                return (
                                    <Card key={userItem.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                        <UserCheck className="w-5 h-5 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                                            {userItem.firstName && userItem.lastName
                                                                ? `${userItem.firstName} ${userItem.lastName}`
                                                                : userItem.firstName || userItem.lastName || userItem.name || 'No Name'
                                                            }
                                                        </h4>
                                                        <p className="text-sm text-gray-500">{userItem.email}</p>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <Badge variant={status.variant}>
                                                                {status.label}
                                                            </Badge>
                                                            <Badge variant="outline">{userItem.role}</Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {userItem.email !== user.email && (
                                                        <>
                                                            {/* Show Unlock button for suspended users */}
                                                            {!userItem.isAccountNonLocked && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleUnlockUser(userItem)}
                                                                    className="text-blue-600 hover:text-blue-700"
                                                                >
                                                                    <Unlock className="w-4 h-4 mr-2" />
                                                                    Unlock
                                                                </Button>
                                                            )}
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleDisableUser(userItem)}
                                                            >
                                                                <UserX className="w-4 h-4 mr-2" />
                                                                Disable
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-red-600 hover:text-red-700"
                                                                onClick={() => handleSoftDeleteUser(userItem)}
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                Soft Delete
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>

                {/* Disabled Users Tab */}
                <TabsContent value="disabled" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold">{t('Disabled Users')}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Permanently deactivated users - cannot be reactivated
                            </p>
                        </div>
                        <span className="text-sm text-gray-500">
                            {disabledUsers} {t('disabled users')}
                        </span>
                    </div>

                    {filteredUsers.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <UserX className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                                <p className="text-gray-600">{t('No disabled users to display')}</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {filteredUsers.map((userItem) => {
                                const status = getUserStatus(userItem);

                                return (
                                    <Card key={userItem.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                        <UserX className="w-5 h-5 text-gray-500" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                                            {userItem.firstName && userItem.lastName
                                                                ? `${userItem.firstName} ${userItem.lastName}`
                                                                : userItem.firstName || userItem.lastName || userItem.name || 'No Name'
                                                            }
                                                        </h4>
                                                        <p className="text-sm text-gray-500">{userItem.email}</p>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <Badge variant={status.variant}>
                                                                {status.label}
                                                            </Badge>
                                                            <Badge variant="outline">{userItem.role}</Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {userItem.email !== user.email && (
                                                        <>
                                                            {/* DISABLED users cannot be reactivated - only soft delete */}
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-red-600 hover:text-red-700"
                                                                onClick={() => handleSoftDeleteUser(userItem)}
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                Soft Delete
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>

                {/* Suspended Users Tab */}
                <TabsContent value="suspended" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold">{t('Suspended Users')}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Temporarily suspended users - can be reactivated
                            </p>
                        </div>
                        {suspendedUsers > 0 && (
                            <Button
                                variant="outline"
                                onClick={handleUnlockAllSuspended}
                                className="px-4 py-2 text-blue-600 hover:text-blue-700 border-blue-600 hover:border-blue-700"
                            >
                                <Unlock className="w-4 h-4 mr-2" />
                                Unlock All Suspended
                            </Button>
                        )}
                    </div>

                    {filteredUsers.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Shield className="w-12 h-12 mx-auto mb-4 text-red-500" />
                                <p className="text-gray-600">{t('No suspended users to display')}</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {filteredUsers.map((userItem) => {
                                const status = getUserStatus(userItem);

                                return (
                                    <Card key={userItem.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                                        <Shield className="w-5 h-5 text-red-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                                            {userItem.firstName && userItem.lastName
                                                                ? `${userItem.firstName} ${userItem.lastName}`
                                                                : userItem.firstName || userItem.lastName || userItem.name || 'No Name'
                                                            }
                                                        </h4>
                                                        <p className="text-sm text-gray-500">{userItem.email}</p>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <Badge variant={status.variant}>
                                                                {status.label}
                                                            </Badge>
                                                            <Badge variant="outline">{userItem.role}</Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {userItem.email !== user.email && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleReactivateUser(userItem)}
                                                                className="text-green-600 hover:text-green-700"
                                                            >
                                                                <UserCheck className="w-4 h-4 mr-2" />
                                                                Reactivate
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleDisableUser(userItem)}
                                                                className="text-orange-600 hover:text-orange-700"
                                                            >
                                                                <UserX className="w-4 h-4 mr-2" />
                                                                Disable
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>

                {/* Deleted Users Tab */}
                <TabsContent value="deleted" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">{t('Deleted Users')}</h3>
                        <span className="text-sm text-gray-500">
                            {deletedUsers} {t('deleted users')}
                        </span>
                    </div>

                    {filteredUsers.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Trash2 className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                                <p className="text-gray-600">{t('No deleted users to display')}</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {filteredUsers.map((userItem) => {
                                const status = getUserStatus(userItem);

                                return (
                                    <Card key={userItem.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                        <Trash2 className="w-5 h-5 text-gray-500" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                                            {userItem.firstName && userItem.lastName
                                                                ? `${userItem.firstName} ${userItem.lastName}`
                                                                : userItem.firstName || userItem.lastName || userItem.name || 'No Name'
                                                            }
                                                        </h4>
                                                        <p className="text-sm text-gray-500">{userItem.email}</p>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <Badge variant={status.variant}>
                                                                {status.label}
                                                            </Badge>
                                                            <Badge variant="outline">{userItem.role}</Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {userItem.email !== user.email && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleRestoreUser(userItem)}
                                                                className="text-green-600 hover:text-green-700"
                                                            >
                                                                <UserCheck className="w-4 h-4 mr-2" />
                                                                Restore
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                onConfirm={executeAction}
                title={modalConfig.title}
                message={modalConfig.message}
                variant={modalConfig.variant}
                icon={
                    modalConfig.type === 'suspend' ? AlertTriangle :
                        modalConfig.type === 'disable' ? UserX :
                            modalConfig.type === 'softDelete' ? Trash2 :
                                modalConfig.type === 'reactivate' || modalConfig.type === 'restore' ? UserCheck :
                                    modalConfig.type === 'unlock' || modalConfig.type === 'unlockAll' ? Unlock :
                                        AlertTriangle
                }
                isLoading={isProcessing}
                confirmText={
                    modalConfig.type === 'suspend' ? 'Suspend' :
                        modalConfig.type === 'disable' ? 'Disable' :
                            modalConfig.type === 'softDelete' ? 'Soft Delete' :
                                modalConfig.type === 'reactivate' ? 'Reactivate' :
                                    modalConfig.type === 'restore' ? 'Restore' :
                                        modalConfig.type === 'unlock' || modalConfig.type === 'unlockAll' ? 'Unlock' :
                                            'Confirm'
                }
                showReasonInput={['suspend', 'disable', 'softDelete'].includes(modalConfig.type)}
                reason={modalConfig.reason}
                onReasonChange={(reason) => setModalConfig(prev => ({ ...prev, reason }))}
            />

            {/* Toast Notifications */}
            <Toast
                isVisible={toast.isVisible}
                message={toast.message}
                type={toast.type}
                onClose={hideToast}
            />
        </div>
    );
};

export default UsersList;
