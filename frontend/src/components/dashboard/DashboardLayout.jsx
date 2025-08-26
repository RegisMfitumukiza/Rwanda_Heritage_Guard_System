import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import ComponentErrorBoundary from '../error/ComponentErrorBoundary';

const DashboardLayout = ({
    children,
    title,
    subtitle,
    headerActions,
    sidebarProps = {},
    headerProps = {},
    className = '',
    ...props
}) => {
    const { user } = useAuth();
    const { t } = useLanguage();

    // Sidebar state management
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        // Check localStorage for user preference
        const saved = localStorage.getItem('heritageguard-sidebar-collapsed');
        return saved ? JSON.parse(saved) : false;
    });

    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // Responsive behavior
    useEffect(() => {
        const handleResize = () => {
            // Auto-collapse sidebar on smaller screens
            if (window.innerWidth < 768) {
                setIsSidebarCollapsed(true);
                setIsMobileSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Check initial size

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Save sidebar state to localStorage
    useEffect(() => {
        localStorage.setItem('heritageguard-sidebar-collapsed', JSON.stringify(isSidebarCollapsed));
    }, [isSidebarCollapsed]);

    // Handle sidebar toggle
    const handleSidebarToggle = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    // Handle mobile sidebar toggle
    const handleMobileSidebarToggle = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen);
    };

    // Close mobile sidebar
    const closeMobileSidebar = () => {
        setIsMobileSidebarOpen(false);
    };



    // Get default title based on user role and current path
    const getDefaultTitle = () => {
        if (title) return title;

        const path = window.location.pathname;
        const roleMap = {
            'SYSTEM_ADMINISTRATOR': 'System Administration',
            'HERITAGE_MANAGER': 'Heritage Management',
            'CONTENT_MANAGER': 'Content Management',
            'COMMUNITY_MEMBER': 'My Dashboard'
        };

        // For admin users, provide context-aware titles
        const isAdminUser = ['SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER'].includes(user?.role);

        if (isAdminUser) {
            // Provide context-aware titles for admin users
            if (path.includes('/documents')) {
                return user?.role === 'CONTENT_MANAGER' ? 'Content Management' : 'Document Management';
            }
            if (path.includes('/sites')) {
                return user?.role === 'HERITAGE_MANAGER' ? 'Heritage Management' : 'Heritage Sites';
            }
            if (path.includes('/artifacts')) {
                return user?.role === 'HERITAGE_MANAGER' ? 'Heritage Management' : 'Artifacts';
            }
            if (path.includes('/users')) {
                return user?.role === 'SYSTEM_ADMINISTRATOR' ? 'System Administration' : 'User Management';
            }
            if (path.includes('/analytics')) {
                return user?.role === 'SYSTEM_ADMINISTRATOR' ? 'System Administration' : 'Analytics';
            }

            // Default to role-based title for admin users
            return roleMap[user?.role] || 'Dashboard';
        }

        // For regular users, use path-based titles
        if (path.includes('/sites')) return 'Heritage Sites';
        if (path.includes('/artifacts')) return 'Artifacts';
        if (path.includes('/documents')) return 'Documents';
        if (path.includes('/education')) return 'Education';
        if (path.includes('/community')) return 'Community';
        if (path.includes('/users')) return 'User Management';
        if (path.includes('/analytics')) return 'Analytics';
        if (path.includes('/system')) return 'System Settings';
        if (path.includes('/learning')) return 'Learning';

        return roleMap[user?.role] || 'Dashboard';
    };

    // Get default subtitle
    const getDefaultSubtitle = () => {
        if (subtitle) return subtitle;

        const roleDescriptions = {
            'SYSTEM_ADMINISTRATOR': 'Manage system settings and user access',
            'HERITAGE_MANAGER': 'Manage heritage sites, artifacts, and documentation',
            'CONTENT_MANAGER': 'Create and manage educational content and community',
            'COMMUNITY_MEMBER': 'Explore heritage and track your learning progress'
        };

        return roleDescriptions[user?.role] || 'Welcome to your dashboard';
    };

    // Layout animation variants
    const layoutVariants = {
        expanded: {
            marginLeft: window.innerWidth >= 768 ? '16rem' : '0',
            transition: { duration: 0.3, ease: 'easeInOut' }
        },
        collapsed: {
            marginLeft: window.innerWidth >= 768 ? '4rem' : '0',
            transition: { duration: 0.3, ease: 'easeInOut' }
        }
    };

    return (
        <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex ${className}`} {...props}>
            {/* Sidebar */}
            <DashboardSidebar
                isCollapsed={isSidebarCollapsed}
                onCollapse={handleSidebarToggle}
                isMobileOpen={isMobileSidebarOpen}
                onMobileClose={closeMobileSidebar}
                {...sidebarProps}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Header */}
                <DashboardHeader
                    title={getDefaultTitle()}
                    subtitle={getDefaultSubtitle()}
                    onMenuToggle={handleMobileSidebarToggle}
                    {...headerProps}
                />

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden">
                    {/* Content Container */}
                    <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-6">
                        {/* Custom Header Actions */}
                        {headerActions && (
                            <div className="mb-4 sm:mb-6">
                                {headerActions}
                            </div>
                        )}

                        {/* Page Content */}
                        <ComponentErrorBoundary componentName="Dashboard Content">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4 sm:space-y-6"
                            >
                                {children}
                            </motion.div>
                        </ComponentErrorBoundary>
                    </div>
                </main>

                {/* Footer removed */}
            </div>

            {/* Mobile sidebar backdrop */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                    onClick={closeMobileSidebar}
                />
            )}

            {/* Keyboard shortcuts listener */}
            <KeyboardShortcuts
                onToggleSidebar={handleSidebarToggle}
            />
        </div>
    );
};

// Keyboard shortcuts component
const KeyboardShortcuts = ({ onToggleSidebar }) => {
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Toggle sidebar with Ctrl/Cmd + B
            if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
                event.preventDefault();
                onToggleSidebar();
            }

            // Close modals/dropdowns with Escape
            if (event.key === 'Escape') {
                // Close any open dropdowns or modals
                const openDropdowns = document.querySelectorAll('[data-dropdown-open="true"]');
                openDropdowns.forEach(dropdown => {
                    dropdown.click();
                });
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onToggleSidebar]);

    return null;
};

// Layout wrapper for specific dashboard pages
export const HeritageManagerLayout = ({ children, ...props }) => (
    <DashboardLayout
        title="Heritage Management"
        subtitle="Manage heritage sites, artifacts, and documentation"
        {...props}
    >
        {children}
    </DashboardLayout>
);

export const AdminLayout = ({ children, ...props }) => (
    <DashboardLayout
        title="System Administration"
        subtitle="Manage users, settings, and system configuration"
        {...props}
    >
        {children}
    </DashboardLayout>
);

export const ContentManagerLayout = ({ children, ...props }) => (
    <DashboardLayout
        title="Content Management"
        subtitle="Create and manage educational content and community"
        {...props}
    >
        {children}
    </DashboardLayout>
);

export const CommunityMemberLayout = ({ children, ...props }) => (
    <DashboardLayout
        title="My Dashboard"
        subtitle="Explore heritage and track your learning progress"
        {...props}
    >
        {children}
    </DashboardLayout>
);

export default DashboardLayout;



