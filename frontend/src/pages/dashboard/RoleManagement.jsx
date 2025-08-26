import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui';
import { Button, Badge, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label, Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui';
import { Shield, Settings, UserCheck, Lock, Users, Eye, Edit, Trash2, Plus, Save, X, Loader2, AlertTriangle, Building, FileText, Info, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useGet, usePost, usePut, useDelete } from '../../hooks/useSimpleApi';

const RoleManagement = () => {
    const { user } = useAuth();
    const { t } = useLanguage();

    const [activeTab, setActiveTab] = useState('overview');
    const [selectedRole, setSelectedRole] = useState('SYSTEM_ADMINISTRATOR');
    const [selectedUser, setSelectedUser] = useState('');
    const [emailForRoleCheck, setEmailForRoleCheck] = useState('');

    // Predefined roles in the system
    const predefinedRoles = [
        { name: 'SYSTEM_ADMINISTRATOR', description: 'Full system access and control', color: 'bg-red-100 text-red-800' },
        { name: 'HERITAGE_MANAGER', description: 'Manage heritage sites and artifacts', color: 'bg-blue-100 text-blue-800' },
        { name: 'CONTENT_MANAGER', description: 'Manage educational content and community', color: 'bg-green-100 text-green-800' },
        { name: 'COMMUNITY_MEMBER', description: 'Access heritage content and learning', color: 'bg-gray-100 text-gray-800' }
    ];

    // API hooks for existing RBAC endpoints
    const { data: roleStats, loading: statsLoading, refetch: refetchStats } = useGet('/api/rbac/statistics', {}, {
        onSuccess: (data) => {
            console.log('Role stats loaded:', data);
            console.log('Available fields:', Object.keys(data || {}));
        },
        onError: (error) => console.error('Failed to load role stats:', error)
    });

    const { data: roleConstraints, loading: constraintsLoading, error: constraintsError } = useGet('/api/rbac/constraints', {}, {
        onSuccess: (data) => console.log('Role constraints loaded:', data),
        onError: (error) => console.error('Failed to load role constraints:', error)
    });

    const { data: roleHierarchy, loading: hierarchyLoading, error: hierarchyError } = useGet('/api/rbac/hierarchy', {}, {
        onSuccess: (data) => console.log('Role hierarchy loaded:', data),
        onError: (error) => console.error('Failed to load role hierarchy:', error)
    });

    const { data: usersByRole, loading: usersByRoleLoading, refetch: refetchUsersByRole } = useGet(`/api/rbac/users-by-role?role=${selectedRole}`, {}, {
        onSuccess: (data) => console.log('Users by role loaded:', data),
        onError: (error) => console.error('Failed to load users by role:', error)
    });

    // Get all users for selection
    const { data: allUsers, loading: allUsersLoading } = useGet('/api/users', {
        page: 0,
        size: 100, // Get all users
        search: '',
        role: '',
        status: ''
    }, {
        onSuccess: (data) => console.log('All users loaded:', data),
        onError: (error) => console.error('Failed to load all users:', error)
    });

    // Role validation
    const validateRoleMutation = usePost('/api/rbac/validate-role', {
        onSuccess: (data) => {
            if (data.isValid) {
                toast.success(t('Role assignment is valid'));
            } else {
                toast.error(data.message || t('Role assignment is invalid'));
            }
        },
        onError: (error) => {
            toast.error(t('Failed to validate role assignment'));
        }
    });

    // Handle role validation
    const handleValidateRole = () => {
        console.log('Validation attempt - selectedUser:', selectedUser, 'selectedRole:', selectedRole);

        if (!selectedUser) {
            toast.error(t('Please select a user'));
            return;
        }
        if (!selectedRole) {
            toast.error(t('Please select a role'));
            return;
        }

        // Find the selected user's email
        const user = allUsers?.users?.find(u => u.email === selectedUser);
        if (!user) {
            toast.error(t('Selected user not found'));
            return;
        }

        console.log('Sending validation request:', { email: user.email, role: selectedRole });

        validateRoleMutation.execute({
            email: user.email,
            role: selectedRole
        });
    };

    // Handle role selection change
    const handleRoleChange = (role) => {
        console.log('Role selection changed from', selectedRole, 'to', role);
        console.log('Previous selectedRole state:', selectedRole);
        console.log('New role to set:', role);

        // Updating selectedRole will change the URL for useGet,
        // which will automatically fetch the correct list.
        setSelectedRole(role);
    };

    // Handle user selection change
    const handleUserChange = (userId) => {
        setSelectedUser(userId);
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
                        {t('Role Management')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {t('Manage user roles and permissions')}
                    </p>
                </div>
            </div>

            {/* Statistics Cards */}
            {!statsLoading && roleStats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 sm:p-5">
                            <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        {t('Total Users')}
                                    </p>
                                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                        {roleStats.totalUsers || 0}
                                    </p>
                                </div>
                                <div className="flex-shrink-0 ml-3">
                                    <Users className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 sm:p-5">
                            <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        {t('Heritage Managers')}
                                    </p>
                                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                        {roleStats.heritageManagers || 0}
                                    </p>
                                </div>
                                <div className="flex-shrink-0 ml-3">
                                    <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 sm:p-5">
                            <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        {t('Content Managers')}
                                    </p>
                                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                        {roleStats.contentManagers || 0}
                                    </p>
                                </div>
                                <div className="flex-shrink-0 ml-3">
                                    <Settings className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 sm:p-5">
                            <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        {t('Community Members')}
                                    </p>
                                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                        {roleStats.communityMembers || 0}
                                    </p>
                                </div>
                                <div className="flex-shrink-0 ml-3">
                                    <UserCheck className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Loading State for Statistics */}
            {statsLoading && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((index) => (
                        <Card key={`stats-skeleton-${index}`}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse"></div>
                                    </div>
                                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* Tab Navigation - More compact and responsive */}
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-1 sm:gap-2 mb-4">
                    <TabsTrigger value="overview" className="text-xs sm:text-sm px-1 sm:px-2 py-1.5 sm:py-2 h-auto">
                        <span className="truncate">{t('Overview')}</span>
                        {roleStats && <Badge variant="secondary" className="ml-1 text-xs hidden sm:inline-flex">{roleStats.totalUsers || 0}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="constraints" className="text-xs sm:text-sm px-1 sm:px-2 py-1.5 sm:py-2 h-auto">
                        <span className="truncate">{t('Constraints')}</span>
                        {roleConstraints && <Badge variant="secondary" className="ml-1 text-xs hidden sm:inline-flex">{Object.keys(roleConstraints || {}).length}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="hierarchy" className="text-xs sm:text-sm px-1 sm:px-2 py-1.5 sm:py-2 h-auto">
                        <span className="truncate">{t('Hierarchy')}</span>
                        {roleHierarchy && <Badge variant="secondary" className="ml-1 text-xs hidden sm:inline-flex">{Object.keys(roleHierarchy?.roleLevels || {}).length}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="users" className="text-xs sm:text-sm px-1 sm:px-2 py-1.5 sm:py-2 h-auto">
                        <span className="truncate">{t('Users by Role')}</span>
                        {usersByRole && <Badge variant="secondary" className="ml-1 text-xs hidden sm:inline-flex">{usersByRole?.userCount || 0}</Badge>}
                    </TabsTrigger>
                </TabsList>

                {/* Tab Content with proper spacing and no overlap */}
                <div className="mt-2 sm:mt-4">
                    <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-0 pt-2">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                    <Shield className="w-5 h-5" />
                                    {t('Role Overview')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 sm:space-y-6 pt-0">
                                {/* Selected Role Indicator */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                                {t('Currently Selected Role:')}
                                            </p>
                                            <p className="text-base sm:text-lg font-semibold text-blue-800 dark:text-blue-200 break-words">
                                                {selectedRole}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="text-xs border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-300 w-fit">
                                            {t('Active')}
                                        </Badge>
                                    </div>
                                </div>
                                {/* Predefined Roles Grid */}
                                <div key={`roles-grid-${selectedRole}`} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                    {predefinedRoles.map((role) => (
                                        <div
                                            key={role.name}
                                            className={`${role.color} p-3 sm:p-4 rounded-lg cursor-pointer transition-all hover:scale-105 hover:shadow-md min-h-[120px] sm:min-h-[140px] flex flex-col justify-between ${selectedRole === role.name
                                                ? 'ring-2 ring-blue-500 ring-offset-2 shadow-lg scale-105'
                                                : ''
                                                }`}
                                            onClick={() => handleRoleChange(role.name)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <h4 className="font-semibold text-sm sm:text-base mb-2 break-words leading-tight flex-1 min-w-0 pr-2">
                                                    {role.name}
                                                </h4>
                                                {selectedRole === role.name && (
                                                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-xs sm:text-sm opacity-80 leading-relaxed break-words">
                                                {role.description}
                                            </p>
                                            <div className="mt-3 pt-2 border-t border-current border-opacity-20">
                                                <span className="text-xs font-medium opacity-70">
                                                    {selectedRole === role.name ? '✓ Selected' : 'Click to select'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Role Validation Section */}
                                <div className="border-t pt-4 sm:pt-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                                        <Label htmlFor="roleValidation" className="text-sm sm:text-base font-medium">
                                            {t('Check Role for User')}
                                        </Label>
                                        <Badge variant="secondary" className="text-xs w-fit">
                                            {t('Validating against:')} {selectedRole}
                                        </Badge>
                                    </div>
                                    <div className="space-y-4 sm:space-y-0 sm:flex sm:items-end sm:gap-4">
                                        <div className="flex-1 min-w-0">
                                            <Select onValueChange={handleUserChange} value={selectedUser}>
                                                <SelectTrigger className="w-full sm:w-[300px] lg:w-[350px] h-11">
                                                    <SelectValue placeholder={t('Select a user')} />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-60 w-full">
                                                    {allUsers?.users?.map((user) => (
                                                        <SelectItem key={user.id} value={user.email} className="py-1">
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="text-sm font-medium truncate">
                                                                    {user.firstName && user.lastName
                                                                        ? `${user.firstName} ${user.lastName}`
                                                                        : user.firstName || user.lastName || user.name || 'No Name'
                                                                    }
                                                                </span>
                                                                <span className="text-xs text-gray-500 truncate">
                                                                    {user.email}
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button
                                            onClick={handleValidateRole}
                                            disabled={validateRoleMutation.isPending}
                                            className="w-full sm:w-auto px-6 h-11"
                                        >
                                            {validateRoleMutation.isPending ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    {t('Validating...')}
                                                </>
                                            ) : (
                                                <>
                                                    <Shield className="w-4 h-4 mr-2" />
                                                    {t('Validate Role')}
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    {selectedUser && allUsers?.users && (
                                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <div className="space-y-2">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        {t('Selected User:')}
                                                    </span>
                                                    <span className="text-sm text-gray-900 dark:text-white font-medium">
                                                        {(() => {
                                                            const user = allUsers.users.find(u => u.email === selectedUser);
                                                            return user?.firstName && user?.lastName
                                                                ? `${user.firstName} ${user.lastName}`
                                                                : user?.firstName || user?.lastName || user?.name || 'No Name';
                                                        })()}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                                        {t('Email:')}
                                                    </span>
                                                    <span className="text-sm text-gray-900 dark:text-white">
                                                        {selectedUser}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                                        {t('Current Role:')}
                                                    </span>
                                                    <Badge variant="outline" className="text-xs w-fit">
                                                        {(() => {
                                                            const user = allUsers.users.find(u => u.email === selectedUser);
                                                            return user?.role || 'Unknown';
                                                        })()}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                    <span className="text-xs text-gray-500">{t('Will validate:')}</span>
                                                    <Badge variant="default" className="text-xs w-fit">
                                                        {selectedRole}
                                                    </Badge>
                                                    <span className="text-xs text-gray-500">{t('← This is the role you clicked')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="constraints" className="space-y-4 mt-0 pt-2">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                            <div>
                                <h3 className="text-lg sm:text-xl font-semibold">{t('Role Limits & Current Usage')}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {t('These are the maximum allowed users for each role type and current counts')}
                                </p>
                            </div>
                            <div className="text-sm text-gray-500">
                                {constraintsLoading ? t('Loading...') : `${Object.keys(roleConstraints || {}).length} constraints`}
                            </div>
                        </div>

                        {constraintsLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[1, 2, 3, 4, 5].map((index) => (
                                    <Card key={`constraint-skeleton-${index}`}>
                                        <CardContent className="p-4">
                                            <div className="space-y-3">
                                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                                                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : roleConstraints ? (
                            <div className="space-y-4">
                                {/* System Administrator Section */}
                                <Card className="border-l-4 border-l-red-500">
                                    <CardContent className="p-4 sm:p-5">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Shield className="w-5 h-5 text-red-500" />
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                                        {t('System Administrator')}
                                                    </h4>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                    {t('Full system access and control. Only one administrator allowed for security.')}
                                                </p>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                                            {roleConstraints.systemAdministrators || 0}
                                                        </div>
                                                        <div className="text-xs text-gray-500">{t('Current')}</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                                                            {roleConstraints.maxSystemAdministrators || 1}
                                                        </div>
                                                        <div className="text-xs text-gray-500">{t('Maximum')}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <Badge
                                                    variant={roleConstraints.systemAdministrators >= (roleConstraints.maxSystemAdministrators || 1) ? "destructive" : "secondary"}
                                                    className="text-xs"
                                                >
                                                    {roleConstraints.systemAdministrators >= (roleConstraints.maxSystemAdministrators || 1) ? t('Limit Reached') : t('Available')}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Manager Roles Section */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Heritage Managers */}
                                    <Card className="border-l-4 border-l-blue-500">
                                        <CardContent className="p-4 sm:p-5">
                                            <div className="flex flex-col h-full">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Building className="w-5 h-5 text-blue-500" />
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                                        {t('Heritage Managers')}
                                                    </h4>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex-1">
                                                    {t('Manage heritage sites, artifacts, and cultural content.')}
                                                </p>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">{t('Current')}</span>
                                                        <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                                            {roleConstraints.heritageManagers || 0}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">{t('Maximum')}</span>
                                                        <span className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                                                            {roleConstraints.maxManagersPerType || 10}
                                                        </span>
                                                    </div>
                                                    {/* Progress Bar */}
                                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                                            style={{
                                                                width: `${Math.min(((roleConstraints.heritageManagers || 0) / (roleConstraints.maxManagersPerType || 10)) * 100, 100)}%`
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge
                                                            variant={roleConstraints.heritageManagers >= (roleConstraints.maxManagersPerType || 10) ? "destructive" : "secondary"}
                                                            className="text-xs"
                                                        >
                                                            {roleConstraints.heritageManagers >= (roleConstraints.maxManagersPerType || 10) ? t('Limit Reached') : t('Available')}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Content Managers */}
                                    <Card className="border-l-4 border-l-green-500">
                                        <CardContent className="p-4 sm:p-5">
                                            <div className="flex flex-col h-full">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <FileText className="w-5 h-5 text-green-500" />
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                                        {t('Content Managers')}
                                                    </h4>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex-1">
                                                    {t('Manage educational content, community, and learning materials.')}
                                                </p>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">{t('Current')}</span>
                                                        <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                                                            {roleConstraints.contentManagers || 0}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">{t('Maximum')}</span>
                                                        <span className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                                                            {roleConstraints.maxManagersPerType || 10}
                                                        </span>
                                                    </div>
                                                    {/* Progress Bar */}
                                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                        <div
                                                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                                            style={{
                                                                width: `${Math.min(((roleConstraints.contentManagers || 0) / (roleConstraints.maxManagersPerType || 10)) * 100, 100)}%`
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge
                                                            variant={roleConstraints.contentManagers >= (roleConstraints.maxManagersPerType || 10) ? "destructive" : "secondary"}
                                                            className="text-xs"
                                                        >
                                                            {roleConstraints.contentManagers >= (roleConstraints.maxManagersPerType || 10) ? t('Limit Reached') : t('Available')}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Community Members Section */}
                                <Card className="border-l-4 border-l-orange-500">
                                    <CardContent className="p-4 sm:p-5">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Users className="w-5 h-5 text-orange-500" />
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                                        {t('Community Members')}
                                                    </h4>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                    {t('Access heritage content, participate in community, and track learning progress.')}
                                                </p>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                                            {roleConstraints.communityMembers || 0}
                                                        </div>
                                                        <div className="text-xs text-gray-500">{t('Current')}</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                                                            ∞
                                                        </div>
                                                        <div className="text-xs text-gray-500">{t('No Limit')}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <Badge variant="secondary" className="text-xs">
                                                    {t('Unlimited')}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Summary Section */}
                                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                                    <CardContent className="p-4 sm:p-5">
                                        <div className="flex items-start gap-3">
                                            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                                    {t('How to Use These Limits')}
                                                </h4>
                                                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                                    <li>• {t('System Administrator: Only one allowed for security')}</li>
                                                    <li>• {t('Manager Roles: Maximum 10 per type to maintain quality')}</li>
                                                    <li>• {t('Community Members: Unlimited to encourage participation')}</li>
                                                    <li>• {t('When limits are reached, you cannot assign more users to that role')}</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="p-6 text-center">
                                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        {t('No Constraints Data')}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {t('Unable to load role constraints. Please try refreshing the page.')}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="hierarchy" className="space-y-4 mt-0 pt-2">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                            <h3 className="text-lg sm:text-xl font-semibold">{t('Role Hierarchy')}</h3>
                            <div className="text-sm text-gray-500">
                                {hierarchyLoading ? t('Loading...') : `${Object.keys(roleHierarchy?.roleLevels || {}).length} hierarchy levels`}
                            </div>
                        </div>
                        {hierarchyLoading ? (
                            <div className="flex justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : hierarchyError ? (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                                    <p className="text-red-600 dark:text-red-400">{t('Error loading hierarchy')}</p>
                                    <p className="text-sm text-gray-500 mt-2">{hierarchyError}</p>
                                </CardContent>
                            </Card>
                        ) : roleHierarchy?.roleLevels && Object.keys(roleHierarchy.roleLevels).length > 0 ? (
                            <div className="space-y-4">
                                {Object.entries(roleHierarchy.roleLevels)
                                    .sort(([, a], [, b]) => b - a) // Sort by level (highest first)
                                    .map(([roleName, level], index) => (
                                        <Card key={roleName} className="hover:shadow-md transition-shadow">
                                            <CardContent className="p-4 sm:p-5">
                                                <div className="space-y-3">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                                                {level}
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white break-words">
                                                                {roleName.replace(/_/g, ' ')}
                                                            </h4>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 break-words">
                                                                Level {level} - {level === 4 ? 'Highest Privilege' : level === 1 ? 'Lowest Privilege' : 'Medium Privilege'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                {roleHierarchy.description && (
                                    <Card>
                                        <CardContent className="p-4">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 text-center break-words">
                                                {roleHierarchy.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                    <p className="text-gray-600 dark:text-gray-400">{t('No hierarchy found')}</p>
                                    <p className="text-sm text-gray-500 mt-2">{t('Role hierarchy will appear here when configured')}</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="users" className="space-y-4 mt-0 pt-2">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3 mb-4">
                            <h3 className="text-lg sm:text-xl font-semibold">{t('Users Assigned to Role')}</h3>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <div className="text-sm text-gray-500">
                                    {usersByRoleLoading ? t('Loading...') : `${usersByRole?.userCount || 0} users`}
                                </div>
                                <Badge variant="outline" className="text-xs w-fit">
                                    {selectedRole}
                                </Badge>
                            </div>
                        </div>

                        {usersByRoleLoading ? (
                            <div className="flex justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : usersByRole?.users && usersByRole.users.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {usersByRole.users.map((user, index) => (
                                    <Card key={user.id || index} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-4 sm:p-5">
                                            <div className="space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">
                                                            {user.fullName || user.username || user.email}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                            {user.email}
                                                        </p>
                                                        {user.username && user.username !== user.email && (
                                                            <p className="text-xs text-gray-500 truncate">
                                                                @{user.username}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Badge
                                                            variant={user.isEnabled ? "default" : "secondary"}
                                                            className="text-xs"
                                                        >
                                                            {user.isEnabled ? t('Active') : t('Inactive')}
                                                        </Badge>
                                                        <Badge variant="outline" className="text-xs">
                                                            {selectedRole}
                                                        </Badge>
                                                    </div>
                                                    {user.dateCreated && (
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(user.dateCreated).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {t('No users found for this role')}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-2 break-words">
                                        {t('Users assigned to')} <span className="font-medium">{selectedRole}</span> {t('will appear here')}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
};

export default RoleManagement;
