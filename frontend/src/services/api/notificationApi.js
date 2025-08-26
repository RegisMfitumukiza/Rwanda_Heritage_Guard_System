import httpClient from './httpClient';

/**
 * Notification API Service
 * User notification management service for handling notification delivery,
 * read status tracking, and notification preferences
 * Leverages the robust httpClient service for consistent error handling and automatic caching
 */

// API Endpoints
const ENDPOINTS = {
    // Core notification endpoints
    NOTIFICATIONS: '/api/notifications',
    NOTIFICATIONS_UNREAD: '/api/notifications/unread',
    NOTIFICATIONS_UNREAD_COUNT: '/api/notifications/unread/count',
    NOTIFICATIONS_RECENT: '/api/notifications/recent',
    NOTIFICATIONS_MARK_READ: '/api/notifications/{id}/read',
    NOTIFICATIONS_MARK_ALL_READ: '/api/notifications/mark-all-read',
    NOTIFICATIONS_DELETE: '/api/notifications/{id}',
    NOTIFICATIONS_PREFERENCES: '/api/notifications/preferences',
};



/**
 * Notification Data Structure
 * @typedef {Object} Notification
 * @property {number} id - Unique identifier
 * @property {string} type - Notification type (SYSTEM, MODERATION, FORUM, CONTENT, etc.)
 * @property {string} title - Notification title
 * @property {string} message - Notification message
 * @property {string} category - Notification category
 * @property {boolean} isRead - Whether notification has been read
 * @property {string} priority - Priority level (LOW, MEDIUM, HIGH, URGENT)
 * @property {string} actionUrl - URL for notification action
 * @property {Object} metadata - Additional metadata
 * @property {string} recipientUsername - Recipient username
 * @property {string} senderUsername - Sender username (if applicable)
 * @property {string} createdDate - Creation date
 * @property {string} readDate - Date when read (if applicable)
 * @property {string} expiryDate - Expiry date (if applicable)
 */

/**
 * Notification Preferences Data Structure
 * @typedef {Object} NotificationPreferences
 * @property {string} username - Username
 * @property {boolean} emailNotifications - Enable email notifications
 * @property {boolean} pushNotifications - Enable push notifications
 * @property {boolean} systemNotifications - Enable system notifications
 * @property {boolean} moderationNotifications - Enable moderation notifications
 * @property {boolean} forumNotifications - Enable forum notifications
 * @property {boolean} contentNotifications - Enable content notifications
 * @property {string} frequency - Notification frequency (REAL_TIME, HOURLY, DAILY, WEEKLY)
 * @property {Array<string>} mutedCategories - Muted notification categories
 * @property {string} updatedDate - Last update date
 */

/**
 * Notification API Service
 */
export const notificationApi = {
    // ==========================================
    // CORE NOTIFICATION OPERATIONS
    // ==========================================

    /**
     * Get all notifications for current user
     * @param {Object} options - Request options
     * @param {number} options.page - Page number for pagination
     * @param {number} options.size - Page size for pagination
     * @param {string} options.type - Filter by notification type
     * @param {string} options.category - Filter by category
     * @param {boolean} options.unreadOnly - Show only unread notifications
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Notification>>} Array of notifications
     */
    getNotifications: async (options = {}) => {
        try {
            const { page, size, type, category, unreadOnly, config = {} } = options;
            const params = {};

            if (page !== undefined) params.page = page;
            if (size !== undefined) params.size = size;
            if (type) params.type = type;
            if (category) params.category = category;
            if (unreadOnly !== undefined) params.unreadOnly = unreadOnly;

            const response = await httpClient.get(ENDPOINTS.NOTIFICATIONS, params, config);

            // Validate response is JSON
            if (response.data && typeof response.data === 'string' && response.data.startsWith('<!DOCTYPE')) {
                console.error('Server returned HTML instead of JSON for notifications. This indicates a server error.');
                throw new Error('Server returned HTML instead of JSON. This usually indicates a server error.');
            }

            return response;

        } catch (error) {
            console.error('Failed to load notifications:', error);

            // Return empty array instead of throwing to prevent component crashes
            return {
                data: [],
                status: 500,
                error: error.message
            };
        }
    },

    /**
     * Get unread notifications
     * @param {Object} options - Request options
     * @param {number} options.limit - Limit number of results
     * @param {string} options.type - Filter by notification type
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Notification>>} Array of unread notifications
     */
    getUnreadNotifications: async (options = {}) => {
        const { limit, type, config = {} } = options;
        const params = {};

        if (limit !== undefined) params.limit = limit;
        if (type) params.type = type;

        return httpClient.get(ENDPOINTS.NOTIFICATIONS_UNREAD, params, config);
    },

    /**
     * Get unread notification count
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<number>} Unread notification count
     */
    getUnreadNotificationCount: async (options = {}) => {
        const { config = {} } = options;

        return httpClient.get(ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT, {}, config);
    },

    /**
     * Get recent notifications
     * @param {Object} options - Request options
     * @param {number} options.limit - Limit number of results (default: 10)
     * @param {string} options.period - Time period (day, week, month)
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Notification>>} Array of recent notifications
     */
    getRecentNotifications: async (options = {}) => {
        const { limit = 10, period, config = {} } = options;
        const params = { limit };

        if (period) params.period = period;

        return httpClient.get(ENDPOINTS.NOTIFICATIONS_RECENT, params, config);
    },

    /**
     * Mark notification as read
     * @param {number} notificationId - Notification ID
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Notification>} Updated notification
     */
    markAsRead: async (notificationId, options = {}) => {
        const { config = {} } = options;
        const url = ENDPOINTS.NOTIFICATIONS_MARK_READ.replace('{id}', notificationId);

        return httpClient.patch(url, {}, config);
    },

    /**
     * Mark all notifications as read
     * @param {Object} options - Request options
     * @param {string} options.type - Mark only specific type as read
     * @param {string} options.category - Mark only specific category as read
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Object>} Operation result
     */
    markAllAsRead: async (options = {}) => {
        const { type, category, config = {} } = options;
        const params = {};

        if (type) params.type = type;
        if (category) params.category = category;

        return httpClient.patch(ENDPOINTS.NOTIFICATIONS_MARK_ALL_READ, params, config);
    },

    /**
     * Delete notification
     * @param {number} notificationId - Notification ID
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<void>} Success confirmation
     */
    deleteNotification: async (notificationId, options = {}) => {
        const { config = {} } = options;
        const url = ENDPOINTS.NOTIFICATIONS_DELETE.replace('{id}', notificationId);

        return httpClient.delete(url, {}, config);
    },

    // ==========================================
    // NOTIFICATION PREFERENCES
    // ==========================================

    /**
     * Get notification preferences
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<NotificationPreferences>} User notification preferences
     */
    getNotificationPreferences: async (options = {}) => {
        const { config = {} } = options;

        return httpClient.get(ENDPOINTS.NOTIFICATIONS_PREFERENCES, {}, config);
    },

    /**
     * Update notification preferences
     * @param {Object} preferences - Notification preferences
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<NotificationPreferences>} Updated preferences
     */
    updateNotificationPreferences: async (preferences, options = {}) => {
        const { config = {} } = options;

        return httpClient.put(ENDPOINTS.NOTIFICATIONS_PREFERENCES, preferences, config);
    },

    // ==========================================
    // NOTIFICATION TYPE SPECIFIC HELPERS
    // ==========================================

    /**
     * Get system notifications
     * @param {Object} options - Request options
     * @param {boolean} options.unreadOnly - Show only unread notifications
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Notification>>} Array of system notifications
     */
    getSystemNotifications: async (options = {}) => {
        return notificationApi.getNotifications({
            ...options,
            type: 'SYSTEM',
        });
    },

    /**
     * Get moderation notifications
     * @param {Object} options - Request options
     * @param {boolean} options.unreadOnly - Show only unread notifications
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Notification>>} Array of moderation notifications
     */
    getModerationNotifications: async (options = {}) => {
        return notificationApi.getNotifications({
            ...options,
            type: 'MODERATION',
        });
    },

    /**
     * Get forum notifications
     * @param {Object} options - Request options
     * @param {boolean} options.unreadOnly - Show only unread notifications
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Notification>>} Array of forum notifications
     */
    getForumNotifications: async (options = {}) => {
        return notificationApi.getNotifications({
            ...options,
            type: 'FORUM',
        });
    },

    /**
     * Get content notifications
     * @param {Object} options - Request options
     * @param {boolean} options.unreadOnly - Show only unread notifications
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Notification>>} Array of content notifications
     */
    getContentNotifications: async (options = {}) => {
        return notificationApi.getNotifications({
            ...options,
            type: 'CONTENT',
        });
    },

    /**
     * Get high priority notifications
     * @param {Object} options - Request options
     * @param {boolean} options.unreadOnly - Show only unread notifications
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Notification>>} Array of high priority notifications
     */
    getHighPriorityNotifications: async (options = {}) => {
        const notifications = await notificationApi.getNotifications(options);
        return notifications.filter(n => n.priority === 'HIGH' || n.priority === 'URGENT');
    },

    /**
     * Get urgent notifications only
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Notification>>} Array of urgent notifications
     */
    getUrgentNotifications: async (options = {}) => {
        const notifications = await notificationApi.getNotifications(options);
        return notifications.filter(n => n.priority === 'URGENT');
    },

    // ==========================================
    // BULK OPERATIONS
    // ==========================================

    /**
     * Mark multiple notifications as read
     * @param {Array<number>} notificationIds - Array of notification IDs
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Object>>} Array of operation results
     */
    markMultipleAsRead: async (notificationIds, options = {}) => {
        const promises = notificationIds.map(id =>
            notificationApi.markAsRead(id, options)
        );

        return Promise.allSettled(promises);
    },

    /**
     * Delete multiple notifications
     * @param {Array<number>} notificationIds - Array of notification IDs
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Object>>} Array of operation results
     */
    deleteMultipleNotifications: async (notificationIds, options = {}) => {
        const promises = notificationIds.map(id =>
            notificationApi.deleteNotification(id, options)
        );

        return Promise.allSettled(promises);
    },
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Utility function to get notification type color
 * @param {string} type - Notification type
 * @returns {string} Color class
 */
export const getNotificationTypeColor = (type) => {
    const colors = {
        'SYSTEM': 'blue',
        'MODERATION': 'orange',
        'FORUM': 'purple',
        'CONTENT': 'green',
        'SECURITY': 'red',
        'ANNOUNCEMENT': 'indigo',
    };

    return colors[type] || 'gray';
};

/**
 * Utility function to get notification type icon
 * @param {string} type - Notification type
 * @returns {string} Icon name or emoji
 */
export const getNotificationTypeIcon = (type) => {
    const icons = {
        'SYSTEM': '⚙️',
        'MODERATION': '🛡️',
        'FORUM': '💬',
        'CONTENT': '📄',
        'SECURITY': '🔒',
        'ANNOUNCEMENT': '📢',
    };

    return icons[type] || '📌';
};

/**
 * Utility function to get priority color
 * @param {string} priority - Priority level
 * @returns {string} Color class
 */
export const getPriorityColor = (priority) => {
    const colors = {
        'LOW': 'gray',
        'MEDIUM': 'blue',
        'HIGH': 'orange',
        'URGENT': 'red',
    };

    return colors[priority] || 'gray';
};

/**
 * Utility function to get priority display
 * @param {string} priority - Priority level
 * @returns {string} Display text with icon
 */
export const getPriorityDisplay = (priority) => {
    const displays = {
        'LOW': '🔵 Low',
        'MEDIUM': '🟡 Medium',
        'HIGH': '🟠 High',
        'URGENT': '🔴 Urgent',
    };

    return displays[priority] || priority;
};

/**
 * Utility function to format notification time
 * @param {string} date - Date string
 * @returns {string} Formatted relative time
 */
export const formatNotificationTime = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffMs = now - notificationDate;

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
        return 'Just now';
    } else if (diffMinutes < 60) {
        return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
        return `${diffHours}h ago`;
    } else if (diffDays < 7) {
        return `${diffDays}d ago`;
    } else {
        return notificationDate.toLocaleDateString();
    }
};

/**
 * Utility function to validate notification type
 * @param {string} type - Notification type to validate
 * @returns {boolean} Whether type is valid
 */
export const isValidNotificationType = (type) => {
    const validTypes = [
        'SYSTEM', 'MODERATION', 'FORUM', 'CONTENT', 'SECURITY', 'ANNOUNCEMENT'
    ];
    return validTypes.includes(type);
};

/**
 * Utility function to validate priority level
 * @param {string} priority - Priority to validate
 * @returns {boolean} Whether priority is valid
 */
export const isValidPriority = (priority) => {
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    return validPriorities.includes(priority);
};

/**
 * Utility function to check if notification is recent
 * @param {string} date - Notification date
 * @param {number} hours - Hours to consider as recent (default: 24)
 * @returns {boolean} Whether notification is recent
 */
export const isRecentNotification = (date, hours = 24) => {
    const notificationDate = new Date(date);
    const cutoff = new Date(Date.now() - (hours * 60 * 60 * 1000));
    return notificationDate >= cutoff;
};

/**
 * Utility function to group notifications by type
 * @param {Array<Notification>} notifications - Array of notifications
 * @returns {Object} Notifications grouped by type
 */
export const groupNotificationsByType = (notifications) => {
    return notifications.reduce((groups, notification) => {
        const type = notification.type;
        if (!groups[type]) {
            groups[type] = [];
        }
        groups[type].push(notification);
        return groups;
    }, {});
};

/**
 * Utility function to group notifications by date
 * @param {Array<Notification>} notifications - Array of notifications
 * @returns {Object} Notifications grouped by date
 */
export const groupNotificationsByDate = (notifications) => {
    return notifications.reduce((groups, notification) => {
        const date = new Date(notification.createdDate).toDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(notification);
        return groups;
    }, {});
};

/**
 * Utility function to filter notifications by read status
 * @param {Array<Notification>} notifications - Array of notifications
 * @param {boolean} unreadOnly - Whether to show only unread
 * @returns {Array<Notification>} Filtered notifications
 */
export const filterNotificationsByReadStatus = (notifications, unreadOnly = false) => {
    if (!unreadOnly) return notifications;
    return notifications.filter(notification => !notification.isRead);
};

// ==========================================
// REACT HOOKS
// ==========================================

// Import simplified hooks from our new hook system
import { useGet, usePost, usePut, usePatch, useDelete } from '../../hooks/useSimpleApi';

/**
 * Hook for fetching notifications
 * @param {Object} options - Hook options
 * @param {boolean} options.enabled - Whether to enable the query
 * @param {boolean} options.unreadOnly - Show only unread notifications
 * @param {string} options.type - Filter by notification type
 * @returns {Object} Hook state and data
 */
export const useNotifications = (options = {}) => {
    const { enabled = true, unreadOnly, type } = options;
    const params = {};

    if (unreadOnly !== undefined) params.unreadOnly = unreadOnly;
    if (type) params.type = type;

    return useGet(ENDPOINTS.NOTIFICATIONS, params, {
        enabled,
        onSuccess: (data) => {
            console.log('useNotifications: Data loaded successfully:', data);
            if (options.onSuccess) options.onSuccess(data);
        },
        onError: (error) => {
            console.error('useNotifications: Error loading notifications:', error);
            if (options.onError) options.onError(error);
        }
    });
};

/**
 * Hook for fetching unread notifications
 * @param {Object} options - Hook options
 * @param {boolean} options.enabled - Whether to enable the query
 * @param {number} options.limit - Limit number of results
 * @returns {Object} Hook state and data
 */
export const useUnreadNotifications = (options = {}) => {
    const { enabled = true, limit } = options;
    const params = {};

    if (limit !== undefined) params.limit = limit;

    return useGet(ENDPOINTS.NOTIFICATIONS_UNREAD, params, {
        enabled,
        onSuccess: (data) => {
            console.log('useUnreadNotifications: Data loaded successfully:', data);
            if (options.onSuccess) options.onSuccess(data);
        },
        onError: (error) => {
            console.error('useUnreadNotifications: Error loading unread notifications:', error);
            if (options.onError) options.onError(error);
        }
    });
};

/**
 * Hook for fetching unread notification count
 * @param {Object} options - Hook options
 * @param {boolean} options.enabled - Whether to enable the query
 * @returns {Object} Hook state and data
 */
export const useUnreadNotificationCount = (options = {}) => {
    const { enabled = true } = options;

    return useGet(ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT, {}, {
        enabled,
        onSuccess: (data) => {
            console.log('useUnreadNotificationCount: Data loaded successfully:', data);
            if (options.onSuccess) options.onSuccess(data);
        },
        onError: (error) => {
            console.error('useUnreadNotificationCount: Error loading unread count:', error);
            if (options.onError) options.onError(error);
        }
    });
};

/**
 * Hook for fetching recent notifications
 * @param {Object} options - Hook options
 * @param {boolean} options.enabled - Whether to enable the query
 * @param {number} options.limit - Limit number of results
 * @returns {Object} Hook state and data
 */
export const useRecentNotifications = (options = {}) => {
    const { enabled = true, limit = 10 } = options;
    const params = { limit };

    return useGet(ENDPOINTS.NOTIFICATIONS_RECENT, params, {
        enabled,
        onSuccess: (data) => {
            console.log('useRecentNotifications: Data loaded successfully:', data);
            if (options.onSuccess) options.onSuccess(data);
        },
        onError: (error) => {
            console.error('useRecentNotifications: Error loading recent notifications:', error);
            if (options.onError) options.onError(error);
        }
    });
};

/**
 * Hook for fetching notification preferences
 * @param {Object} options - Hook options
 * @param {boolean} options.enabled - Whether to enable the query
 * @returns {Object} Hook state and data
 */
export const useNotificationPreferences = (options = {}) => {
    const { enabled = true } = options;

    return useGet(ENDPOINTS.NOTIFICATIONS_PREFERENCES, {}, {
        enabled,
        onSuccess: (data) => {
            console.log('useNotificationPreferences: Data loaded successfully:', data);
            if (options.onSuccess) options.onSuccess(data);
        },
        onError: (error) => {
            console.error('useNotificationPreferences: Error loading preferences:', error);
            if (options.onError) options.onError(error);
        }
    });
};

/**
 * Hook for marking notification as read (mutation)
 * @param {Object} options - Hook options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and functions
 */
export const useMarkNotificationAsRead = (options = {}) => {
    const { onSuccess, onError } = options;

    return usePatch(ENDPOINTS.NOTIFICATIONS_MARK_READ, {
        onSuccess,
        onError,
    });
};

/**
 * Hook for marking all notifications as read (mutation)
 * @param {Object} options - Hook options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and functions
 */
export const useMarkAllNotificationsAsRead = (options = {}) => {
    const { onSuccess, onError } = options;

    return usePatch(ENDPOINTS.NOTIFICATIONS_MARK_ALL_READ, {
        onSuccess,
        onError,
    });
};

/**
 * Hook for deleting notification (mutation)
 * @param {Object} options - Hook options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and functions
 */
export const useDeleteNotification = (options = {}) => {
    const { onSuccess, onError } = options;

    return useDelete(ENDPOINTS.NOTIFICATIONS_DELETE, {
        onSuccess,
        onError,
    });
};

/**
 * Hook for updating notification preferences (mutation)
 * @param {Object} options - Hook options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and functions
 */
export const useUpdateNotificationPreferences = (options = {}) => {
    const { onSuccess, onError } = options;

    return usePut(ENDPOINTS.NOTIFICATIONS_PREFERENCES, {
        onSuccess,
        onError,
    });
};

// Export everything
export default notificationApi;