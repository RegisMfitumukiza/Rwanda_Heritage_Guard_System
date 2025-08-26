import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    MapPin,
    FileText,
    Package,
    Users,
    BookOpen,
    MessageSquare,
    BarChart3,
    // Settings icon removed - will be implemented in advanced features
    Shield,
    PlusCircle,
    Search,
    Bell,
    User,
    ChevronLeft,
    ChevronRight,
    Crown,
    Zap,
    Archive
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { UserAvatar } from '../ui/UserAvatar';

const DashboardSidebar = ({
    isCollapsed = false,
    onCollapse,
    isMobileOpen = false,
    onMobileClose,
    className = '',
    ...props
}) => {
    const { user } = useAuth();
    const { t, currentLanguage } = useLanguage();
    const location = useLocation();

    // Navigation items based on user roles
    const getNavigationItems = () => {
        const baseItems = [
            {
                id: 'dashboard',
                label: 'Dashboard',
                icon: Home,
                path: '/dashboard',
                badge: null,
                roles: ['SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER', 'COMMUNITY_MEMBER']
            }
        ];

        // Heritage Manager specific items
        const heritageManagerItems = [
            {
                id: 'sites',
                label: 'Heritage Sites',
                icon: MapPin,
                path: '/dashboard/sites',
                badge: null,
                roles: ['HERITAGE_MANAGER', 'SYSTEM_ADMINISTRATOR'],
                children: [
                    { id: 'sites-list', label: 'All Sites', path: '/dashboard/sites' },
                    { id: 'sites-create', label: 'Add New Site', path: '/dashboard/sites/create', icon: PlusCircle, roles: ['SYSTEM_ADMINISTRATOR'] },
                    { id: 'sites-map', label: 'Sites Map', path: '/dashboard/sites/map' },
                    { id: 'sites-archive', label: 'Archive Management', path: '/dashboard/sites/archive', icon: Archive, roles: ['SYSTEM_ADMINISTRATOR'] }
                ]
            },
            {
                id: 'artifacts',
                label: 'Artifacts',
                icon: Package,
                path: '/dashboard/artifacts',
                roles: ['HERITAGE_MANAGER', 'SYSTEM_ADMINISTRATOR'],
                children: [
                    { id: 'artifacts-list', label: 'All Artifacts', path: '/dashboard/artifacts' },
                    { id: 'artifacts-create', label: 'Add Artifact', path: '/dashboard/artifacts/create', icon: PlusCircle }
                ]
            },
            {
                id: 'documents',
                label: 'Documents',
                icon: FileText,
                path: '/dashboard/documents',
                roles: ['HERITAGE_MANAGER', 'CONTENT_MANAGER', 'SYSTEM_ADMINISTRATOR'],
                children: [
                    { id: 'documents-list', label: 'All Documents', path: '/dashboard/documents' },
                    { id: 'documents-upload', label: 'Upload Document', path: '/dashboard/documents/upload', icon: PlusCircle },
                    { id: 'documents-folders', label: 'Manage Folders', path: '/dashboard/documents/folders' }
                ]
            }
        ];

        // Content Manager specific items
        const contentManagerItems = [
            {
                id: 'education',
                label: 'Education',
                icon: BookOpen,
                path: '/dashboard/education',
                roles: ['CONTENT_MANAGER', 'SYSTEM_ADMINISTRATOR'],
                children: [
                    { id: 'education-articles', label: 'Articles', path: '/dashboard/education/articles' },
                    { id: 'education-quizzes', label: 'Quizzes', path: '/dashboard/education/quizzes' },
                    {
                        id: 'education-create',
                        label: 'Create Content',
                        path: '/dashboard/education/create?type=article',
                        icon: PlusCircle,
                        onClick: (e) => {
                            e.preventDefault();
                            // Default to article creation, but this can be enhanced later
                            window.location.href = '/dashboard/education/create?type=article';
                        }
                    }
                ]
            },
            {
                id: 'community',
                label: 'Community',
                icon: MessageSquare,
                path: '/dashboard/community',
                roles: ['CONTENT_MANAGER', 'SYSTEM_ADMINISTRATOR'],
                children: [
                    { id: 'community-forums', label: 'Forums', path: '/dashboard/community/forums' },
                    { id: 'community-moderation', label: 'Moderation', path: '/dashboard/community/moderation' },
                    { id: 'community-reports', label: 'Reports', path: '/dashboard/community/reports' }
                ]
            }
        ];

        // Admin specific items
        const adminItems = [
            {
                id: 'users',
                label: 'User Management',
                icon: Users,
                path: '/dashboard/users',
                roles: ['SYSTEM_ADMINISTRATOR'],
                children: [
                    { id: 'users-list', label: 'All Users', path: '/dashboard/users' },
                    { id: 'users-create', label: 'Add User', path: '/dashboard/users/create', icon: PlusCircle },
                    { id: 'users-roles', label: 'Manage Roles', path: '/dashboard/users/roles' }
                ]
            },
            {
                id: 'analytics',
                label: 'Analytics',
                icon: BarChart3,
                path: '/dashboard/analytics',
                roles: ['HERITAGE_MANAGER', 'SYSTEM_ADMINISTRATOR'],
                children: [
                    { id: 'analytics-overview', label: 'Overview', path: '/dashboard/analytics' },
                    { id: 'analytics-activity', label: 'User Activity', path: '/dashboard/activity' },
                    { id: 'analytics-sites', label: 'Sites Analytics', path: '/dashboard/analytics/sites' },
                    { id: 'analytics-users', label: 'User Analytics', path: '/dashboard/analytics/users' }
                ]
            },
            // System Settings will be implemented in advanced features
        ];

        // Community Member items
        const communityItems = [
            {
                id: 'browse',
                label: 'Browse Heritage',
                icon: Search,
                path: '/sites',
                roles: ['COMMUNITY_MEMBER']
            },
            {
                id: 'learning',
                label: 'Learning',
                icon: BookOpen,
                path: '/dashboard/learning',
                roles: ['COMMUNITY_MEMBER'],
                children: [
                    { id: 'learning-progress', label: 'My Progress', path: '/dashboard/learning' },
                    { id: 'learning-quizzes', label: 'Take Quizzes', path: '/dashboard/learning/quizzes' }
                ]
            }
        ];

        // Combine items based on user role
        let allItems = [...baseItems];

        if (user?.role === 'HERITAGE_MANAGER' || user?.role === 'SYSTEM_ADMINISTRATOR') {
            allItems = [...allItems, ...heritageManagerItems];
        }

        if (user?.role === 'CONTENT_MANAGER' || user?.role === 'SYSTEM_ADMINISTRATOR') {
            allItems = [...allItems, ...contentManagerItems];
        }

        if (user?.role === 'SYSTEM_ADMINISTRATOR') {
            allItems = [...allItems, ...adminItems];
        }

        if (user?.role === 'COMMUNITY_MEMBER') {
            allItems = [...allItems, ...communityItems];
        }

        return allItems.filter(item =>
            !item.roles || item.roles.includes(user?.role)
        );
    };

    const navigationItems = getNavigationItems();

    // Check if path is active
    const isActiveLink = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    // Get user display info
    const getUserDisplayName = () => {
        if (user?.fullName) return user.fullName;
        if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
        return user?.username || 'User';
    };

    const getUserRoleDisplay = () => {
        const roleMap = {
            'SYSTEM_ADMINISTRATOR': 'System Admin',
            'HERITAGE_MANAGER': 'Heritage Manager',
            'CONTENT_MANAGER': 'Content Manager',
            'COMMUNITY_MEMBER': 'Community Member'
        };
        return roleMap[user?.role] || user?.role || 'User';
    };

    const getRoleIcon = () => {
        const roleIcons = {
            'SYSTEM_ADMINISTRATOR': Crown,
            'HERITAGE_MANAGER': MapPin,
            'CONTENT_MANAGER': BookOpen,
            'COMMUNITY_MEMBER': User
        };
        return roleIcons[user?.role] || User;
    };

    // Navigation Item Component
    const NavigationItem = ({ item, depth = 0 }) => {
        const [isExpanded, setIsExpanded] = useState(isActiveLink(item.path));
        const IconComponent = item.icon;
        const hasChildren = item.children && item.children.length > 0;
        const isActive = isActiveLink(item.path);

        const handleClick = () => {
            if (hasChildren) {
                setIsExpanded(!isExpanded);
            }
            if (isMobileOpen && onMobileClose) {
                onMobileClose();
            }
        };

        return (
            <div className="space-y-1">
                {hasChildren ? (
                    <button
                        onClick={handleClick}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            } ${depth > 0 ? 'ml-6' : ''}`}
                    >
                        <div className="flex items-center space-x-3">
                            {IconComponent && (
                                <IconComponent className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : ''}`} />
                            )}
                            {!isCollapsed && (
                                <span className="truncate">{item.label}</span>
                            )}
                        </div>
                        {!isCollapsed && (
                            <motion.div
                                animate={{ rotate: isExpanded ? 90 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </motion.div>
                        )}
                    </button>
                ) : (
                    <NavLink
                        to={item.path}
                        onClick={() => isMobileOpen && onMobileClose && onMobileClose()}
                        className={({ isActive }) => `
              flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            } ${depth > 0 ? 'ml-6' : ''}
            `}
                    >
                        {IconComponent && (
                            <IconComponent className={`w-5 h-5 flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`} />
                        )}
                        {!isCollapsed && (
                            <span className="truncate">{item.label}</span>
                        )}
                        {!isCollapsed && item.badge && (
                            <span className="ml-auto bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                {item.badge}
                            </span>
                        )}
                    </NavLink>
                )}

                {/* Children */}
                {hasChildren && !isCollapsed && (
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <div className="pl-8 space-y-1">
                                    {item.children.map((child) => (
                                        <NavigationItem key={child.id} item={child} depth={depth + 1} />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        );
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={onMobileClose}
                />
            )}

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{
                    width: isCollapsed ? '4rem' : '16rem',
                    x: isMobileOpen ? 0 : (window.innerWidth >= 1024 ? 0 : '-100%')
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className={`
          fixed md:relative inset-y-0 left-0 z-50
          flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          ${isCollapsed ? 'w-16' : 'w-64'}
          md:translate-x-0 transform transition-all duration-300 ease-in-out
          ${className}
        `}
                {...props}
            >
                {/* Header */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
                    {!isCollapsed && (
                        <div className="flex items-center space-x-2">
                            <img
                                src="/heritage_logo.png"
                                alt="HeritageGuard"
                                className="w-8 h-8"
                            />
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                                HeritageGuard
                            </span>
                        </div>
                    )}

                    {/* Collapse Button */}
                    <button
                        onClick={onCollapse}
                        className="hidden lg:flex p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                        {isCollapsed ? (
                            <ChevronRight className="w-4 h-4" />
                        ) : (
                            <ChevronLeft className="w-4 h-4" />
                        )}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navigationItems.map((item) => (
                        <NavigationItem key={item.id} item={item} />
                    ))}
                </nav>

                {/* User Profile Card */}
                {user && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        {isCollapsed ? (
                            <div className="flex justify-center">
                                <UserAvatar user={user} size="sm" />
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <UserAvatar user={user} size="sm" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {getUserDisplayName()}
                                    </div>
                                    <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                                        {React.createElement(getRoleIcon(), { className: "w-3 h-3" })}
                                        <span className="truncate">{getUserRoleDisplay()}</span>
                                    </div>
                                </div>
                                <Zap className="w-4 h-4 text-green-500" />
                            </div>
                        )}
                    </div>
                )}
            </motion.aside>
        </>
    );
};

export default DashboardSidebar;
