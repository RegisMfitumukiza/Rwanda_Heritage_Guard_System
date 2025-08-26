import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, AlertCircle, Info, CheckCircle, XCircle, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/Button';
import { safeFetchWithFallback } from '../../utils/apiUtils';

const NotificationDropdown = ({
    onMarkAsRead,
    onMarkAllAsRead,
    onClearAll,
    onNotificationClick,
    className = '',
    ...props
}) => {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    // Load real notifications from API only when authenticated
    useEffect(() => {
        const loadNotifications = async () => {
            // Only load notifications if user is authenticated
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('No authentication token, skipping notifications load');
                setNotifications([]);
                return;
            }

            try {
                const data = await safeFetchWithFallback('/api/notifications', []);
                console.log('Raw notification data from API:', data);

                // Transform backend data to match frontend expectations
                const transformedNotifications = data.map(notification => {
                    // Safety check for malformed notification data
                    if (!notification || typeof notification !== 'object') {
                        console.warn('Invalid notification data:', notification);
                        return null;
                    }

                    console.log('Processing notification:', notification);
                    console.log('createdDate:', notification.createdDate);
                    console.log('createdDate type:', typeof notification.createdDate);

                    const timestamp = notification.createdDate ? new Date(notification.createdDate) : new Date();
                    console.log('Converted timestamp:', timestamp);
                    console.log('Timestamp valid:', !isNaN(timestamp.getTime()));

                    return {
                        id: notification.id || `temp-${Date.now()}`,
                        type: notification.type || 'info',
                        title: getNotificationTitle(notification.type || 'info'),
                        message: notification.content || 'No content available',
                        timestamp: timestamp,
                        read: Boolean(notification.isRead),
                        relatedUrl: notification.relatedUrl || null
                    };
                }).filter(Boolean); // Remove any null entries

                console.log('Transformed notifications:', transformedNotifications);
                setNotifications(transformedNotifications);
            } catch (error) {
                console.error('Error loading notifications:', error);
                setNotifications([]);
            }
        };

        loadNotifications();
    }, []);

    // Calculate unread count
    useEffect(() => {
        const count = notifications.filter(n => !n.read).length;
        setUnreadCount(count);
    }, [notifications]);

    const displayNotifications = notifications || [];
    const displayUnreadCount = unreadCount || 0;

    // Get notification title based on type
    const getNotificationTitle = (type) => {
        const titles = {
            reply: 'New Reply',
            mention: 'You were mentioned',
            flag: 'Content Flagged',
            moderation: 'Moderation Required',
            system: 'System Notification'
        };
        return titles[type] || 'Notification';
    };

    // Notification type configurations
    const notificationTypes = {
        success: {
            icon: CheckCircle,
            color: 'text-green-500',
            bgColor: 'bg-green-50 dark:bg-green-900/20'
        },
        info: {
            icon: Info,
            color: 'text-blue-500',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20'
        },
        warning: {
            icon: AlertCircle,
            color: 'text-yellow-500',
            bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
        },
        error: {
            icon: XCircle,
            color: 'text-red-500',
            bgColor: 'bg-red-50 dark:bg-red-900/20'
        }
    };

    // Format timestamp with proper null/undefined checks
    const formatTimestamp = (timestamp) => {
        // Handle null/undefined timestamp
        if (!timestamp) {
            return 'Unknown time';
        }

        // Ensure timestamp is a Date object
        const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

        // Check if date is valid
        if (isNaN(date.getTime())) {
            return 'Invalid date';
        }

        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    // Handle notification click
    const handleNotificationClick = (notification) => {
        if (onNotificationClick) {
            onNotificationClick(notification);
        }

        if (onMarkAsRead && !notification.read) {
            onMarkAsRead(notification.id);
        }

        setIsOpen(false);
    };

    // Handle mark all as read
    const handleMarkAllAsRead = () => {
        if (onMarkAllAsRead) {
            onMarkAllAsRead();
        }
    };

    // Handle clear all
    const handleClearAll = () => {
        if (onClearAll) {
            onClearAll();
        }
    };

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} className={`relative ${className}`} {...props}>
            {/* Notification Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
            >
                <Bell className="w-5 h-5" />

                {/* Unread Count Badge */}
                {displayUnreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium"
                    >
                        {displayUnreadCount > 99 ? '99+' : displayUnreadCount}
                    </motion.span>
                )}
            </button>

            {/* Notification Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Notifications
                            </h3>
                            <div className="flex items-center space-x-2">
                                {/* Test button for development */}
                                {process.env.NODE_ENV === 'development' && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={async () => {
                                            try {
                                                const response = await fetch('/api/notifications/test', {
                                                    method: 'POST',
                                                    headers: {
                                                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                                        'Content-Type': 'application/json'
                                                    }
                                                });
                                                if (response.ok) {
                                                    // Reload notifications
                                                    window.location.reload();
                                                }
                                            } catch (error) {
                                                console.error('Error creating test notification:', error);
                                            }
                                        }}
                                        className="text-xs text-blue-600 hover:text-blue-700"
                                    >
                                        Test
                                    </Button>
                                )}
                                {displayUnreadCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleMarkAllAsRead}
                                        className="text-xs"
                                    >
                                        Mark all read
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-96 overflow-y-auto">
                            {(() => {
                                try {
                                    if (displayNotifications.length > 0) {
                                        return displayNotifications.map((notification) => {
                                            // Safety check for notification data
                                            if (!notification || !notification.id) {
                                                console.warn('Invalid notification for rendering:', notification);
                                                return null;
                                            }

                                            const typeConfig = notificationTypes[notification.type] || notificationTypes.info;
                                            const IconComponent = typeConfig.icon;

                                            return (
                                                <motion.div
                                                    key={notification.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className={`p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                                        }`}
                                                    onClick={() => handleNotificationClick(notification)}
                                                >
                                                    <div className="flex items-start space-x-3">
                                                        {/* Icon */}
                                                        <div className={`p-2 rounded-lg ${typeConfig.bgColor}`}>
                                                            <IconComponent className={`w-4 h-4 ${typeConfig.color}`} />
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between">
                                                                <h4 className={`text-sm font-medium ${notification.read
                                                                    ? 'text-gray-700 dark:text-gray-300'
                                                                    : 'text-gray-900 dark:text-white'
                                                                    }`}>
                                                                    {notification.title || 'Untitled'}
                                                                </h4>
                                                                {!notification.read && (
                                                                    <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0 mt-1"></div>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                                                {notification.message || 'No message'}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                                                {formatTimestamp(notification.timestamp)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        }).filter(Boolean); // Remove any null entries
                                    } else {
                                        return (
                                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                                <p className="text-sm">No notifications</p>
                                                <p className="text-xs mt-1">You're all caught up!</p>
                                            </div>
                                        );
                                    }
                                } catch (error) {
                                    console.error('Error rendering notifications:', error);
                                    return (
                                        <div className="p-8 text-center text-red-500 dark:text-red-400">
                                            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p className="text-sm">Error loading notifications</p>
                                            <p className="text-xs mt-1">Please try refreshing the page</p>
                                        </div>
                                    );
                                }
                            })()}
                        </div>

                        {/* Footer removed */}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationDropdown;



