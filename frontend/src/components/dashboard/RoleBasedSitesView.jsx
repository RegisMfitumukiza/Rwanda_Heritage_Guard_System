import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminSitesList from './AdminSitesList';
import HeritageManagerSiteView from './HeritageManagerSiteView';

/**
 * Role-Based Sites View Component
 * Automatically renders the appropriate heritage sites interface based on user role
 * 
 * - SYSTEM_ADMINISTRATOR: Gets full AdminSitesList with search, filters, bulk operations
 * - HERITAGE_MANAGER: Gets simplified HeritageManagerSiteView focused on assigned sites
 * - Other roles: Gets appropriate fallback or access denied
 */
const RoleBasedSitesView = () => {
    const { user, loading } = useAuth();

    // Show loading while user data is being fetched
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // If no user, show access denied
    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Access Denied
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        You must be logged in to access this page
                    </p>
                </div>
            </div>
        );
    }

    // Render appropriate view based on user role
    switch (user.role) {
        case 'SYSTEM_ADMINISTRATOR':
            return <AdminSitesList />;

        case 'HERITAGE_MANAGER':
            return <HeritageManagerSiteView />;

        case 'CONTENT_MANAGER':
            // Content managers might need a different view
            return (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Content Manager Access
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            Content managers focus on educational content and community management
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                            Heritage site management is handled by Heritage Managers
                        </p>
                    </div>
                </div>
            );

        case 'COMMUNITY_MEMBER':
            // Community members get read-only access to public sites
            return (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Community Member Access
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            Community members can browse and learn about heritage sites
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                            Use the public heritage sites page to explore sites
                        </p>
                    </div>
                </div>
            );

        default:
            // Unknown role - show access denied
            return (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Unknown Role
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Your user role is not recognized
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                            Contact an administrator for assistance
                        </p>
                    </div>
                </div>
            );
    }
};

export default RoleBasedSitesView;


