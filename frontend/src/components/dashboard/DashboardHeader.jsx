import React, { useState } from 'react';
import { Menu, ChevronDown, LogOut, User, Settings, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { UserAvatar } from '../ui/UserAvatar';

import NotificationDropdown from './NotificationDropdown';
import ThemeToggle from './ThemeToggle';
import { Button } from '../ui/Button';

const DashboardHeader = ({
    onMenuToggle,
    title,
    subtitle,
    className = '',
    ...props
}) => {
    const { user, logout } = useAuth();
    const { t, currentLanguage } = useLanguage();
    const [showUserMenu, setShowUserMenu] = useState(false);

    // User menu items
    const userMenuItems = [
        {
            icon: User,
            label: t('common.profileSettings') || 'Profile',
            action: () => {
                // Navigate to profile
                console.log('Navigate to profile');
                setShowUserMenu(false);
            }
        },
        {
            icon: Settings,
            label: t('common.settings') || 'Settings',
            action: () => {
                // Navigate to settings
                console.log('Navigate to settings');
                setShowUserMenu(false);
            }
        },
        {
            icon: HelpCircle,
            label: 'Help & Support',
            action: () => {
                // Navigate to help
                console.log('Navigate to help');
                setShowUserMenu(false);
            }
        },
        {
            type: 'divider'
        },
        {
            icon: LogOut,
            label: t('common.signOut') || 'Sign Out',
            action: () => {
                logout();
                setShowUserMenu(false);
            },
            danger: true
        }
    ];

    // Get user display name
    const getUserDisplayName = () => {
        if (user?.fullName) return user.fullName;
        if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
        return user?.username || 'User';
    };

    // Get user role display
    const getUserRoleDisplay = () => {
        const roleMap = {
            'SYSTEM_ADMINISTRATOR': 'System Administrator',
            'HERITAGE_MANAGER': 'Heritage Manager',
            'CONTENT_MANAGER': 'Content Manager',
            'COMMUNITY_MEMBER': 'Community Member'
        };
        return roleMap[user?.role] || user?.role || 'User';
    };



    return (
        <header className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ${className}`} {...props}>
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left Section */}
                    <div className="flex items-center space-x-4">
                        {/* Mobile Menu Button - Show on medium screens and below */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onMenuToggle}
                            className="md:hidden"
                        >
                            <Menu className="w-5 h-5" />
                        </Button>

                        {/* Title Section */}
                        {(title || subtitle) && (
                            <div className="hidden sm:block">
                                {title && (
                                    <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {title}
                                    </h1>
                                )}
                                {subtitle && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>



                    {/* Right Section */}
                    <div className="flex items-center space-x-2">


                        {/* Theme Toggle */}
                        <ThemeToggle variant="icon" />

                        {/* Notifications */}
                        <NotificationDropdown />

                        {/* User Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center space-x-3 p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <UserAvatar
                                    user={user}
                                    size="sm"
                                    showOnlineStatus={false}
                                />
                                <div className="hidden lg:block text-left">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {getUserDisplayName()}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {getUserRoleDisplay()}
                                    </div>
                                </div>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </button>

                            {/* User Menu Dropdown */}
                            <AnimatePresence>
                                {showUserMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-1"
                                    >
                                        {/* User Info Header */}
                                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center space-x-3">
                                                <UserAvatar
                                                    user={user}
                                                    size="md"
                                                    showOnlineStatus={false}
                                                />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {getUserDisplayName()}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {getUserRoleDisplay()}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {user?.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Menu Items */}
                                        {userMenuItems.map((item, index) => {
                                            if (item.type === 'divider') {
                                                return (
                                                    <hr key={index} className="my-1 border-gray-200 dark:border-gray-700" />
                                                );
                                            }

                                            const IconComponent = item.icon;

                                            return (
                                                <button
                                                    key={index}
                                                    onClick={item.action}
                                                    className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${item.danger
                                                        ? 'text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                        : 'text-gray-700 dark:text-gray-300'
                                                        }`}
                                                >
                                                    <IconComponent className="w-4 h-4" />
                                                    <span className="text-sm">{item.label}</span>
                                                </button>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>



            {/* Click outside to close user menu */}
            {showUserMenu && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                />
            )}
        </header>
    );
};

export default DashboardHeader;



