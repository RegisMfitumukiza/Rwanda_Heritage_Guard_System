import httpClient from './httpClient';

/**
 * User Activity API Service
 * 
 * Comprehensive user activity monitoring service:
 * - Real-time activity feeds
 * - User behavior analytics
 * - Activity timeline tracking
 * - Session monitoring
 * - Performance metrics
 */

// API Endpoints
const ENDPOINTS = {
    ACTIVITY_FEED: '/api/activity/feed',
    USER_SESSIONS: '/api/activity/sessions',
    ACTIVITY_LOGS: '/api/activity/logs',
    LATEST: '/api/activity/latest',
    USER_BEHAVIOR: '/api/activity/behavior',
    ACTIVITY_STATS: '/api/activity/stats'
};

// Activity Types
export const ACTIVITY_TYPES = {
    USER_LOGIN: 'user_login',
    USER_LOGOUT: 'user_logout',
    SITE_VIEW: 'site_view',
    SITE_CREATE: 'site_create',
    SITE_UPDATE: 'site_update',
    DOCUMENT_VIEW: 'document_view',
    DOCUMENT_UPLOAD: 'document_upload',
    DOCUMENT_DOWNLOAD: 'document_download',
    DOCUMENT_DELETE: 'document_delete',
    MEDIA_UPLOAD: 'media_upload',
    SEARCH_QUERY: 'search_query',
    PROFILE_UPDATE: 'profile_update',
    STATUS_CHANGE: 'status_change',
    COMMENT_POST: 'comment_post',
    ARTIFACT_VIEW: 'artifact_view',
    ARTIFACT_AUTHENTICATE: 'artifact_authenticate'
};

// Activity Priorities
export const ACTIVITY_PRIORITIES = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
};

/**
 * User Activity Data Structure
 * @typedef {Object} UserActivity
 * @property {string} id - Activity ID
 * @property {string} type - Activity type
 * @property {string} userId - User ID
 * @property {string} username - Username
 * @property {string} userRole - User role
 * @property {string} action - Action description
 * @property {string} target - Target resource
 * @property {Object} metadata - Additional activity data
 * @property {string} timestamp - Activity timestamp
 * @property {string} sessionId - Session ID
 * @property {string} ipAddress - IP address
 * @property {string} userAgent - User agent
 * @property {string} priority - Activity priority
 */

const userActivityApi = {
    /**
     * Get recent activity feed
     * @param {Object} options - Request options
     * @returns {Promise<Array<UserActivity>>} Recent activities
     */
    getRecentActivity: async (options = {}) => {
        try {
            const response = await httpClient.get(ENDPOINTS.ACTIVITY_FEED, options, {});
            return response;
        } catch (error) {
            console.error('Failed to load recent activity:', error);
            throw error;
        }
    },

    /**
     * Get active user sessions
     * @param {Object} options - Request options
     * @returns {Promise<Array>} Active sessions
     */
    getActiveSessions: async (options = {}) => {
        try {
            const response = await httpClient.get(ENDPOINTS.USER_SESSIONS, options, {});
            return response;
        } catch (error) {
            console.error('Failed to load active sessions:', error);
            throw error;
        }
    },

    /**
     * Get user behavior analytics
     * @param {Object} options - Request options
     * @returns {Promise<Object>} User behavior data
     */
    getUserBehaviorAnalytics: async (options = {}) => {
        try {
            const response = await httpClient.get(ENDPOINTS.USER_BEHAVIOR, options, {});
            return response;
        } catch (error) {
            console.error('Failed to load user behavior analytics:', error);
            throw error;
        }
    },

    /**
     * Get activity statistics
     * @param {Object} options - Request options
     * @returns {Promise<Object>} Activity statistics
     */
    getActivityStatistics: async (options = {}) => {
        try {
            const response = await httpClient.get(ENDPOINTS.ACTIVITY_STATS, options, {});
            return response;
        } catch (error) {
            console.error('Failed to load activity statistics:', error);
            throw error;
        }
    },

    /**
     * Get activity logs
     * @param {Object} options - Request options
     * @returns {Promise<Array>} Activity logs
     */
    getActivityLogs: async (options = {}) => {
        try {
            const response = await httpClient.get(ENDPOINTS.ACTIVITY_LOGS, options, {});
            return response;
        } catch (error) {
            console.error('Failed to load activity logs:', error);
            throw error;
        }
    },

    /**
     * Get latest updates
     * @param {Object} options - Request options
     * @returns {Promise<Object>} Latest updates
     */
    getLatestUpdates: async (options = {}) => {
        try {
            const response = await httpClient.get(ENDPOINTS.LATEST, options, {});
            return response;
        } catch (error) {
            console.error('Failed to load latest updates:', error);
            throw error;
        }
    }
};

// React hooks for user activity
import { useGet } from '../../hooks/useSimpleApi';

/**
 * Hook for getting recent user activity
 * @param {Object} options - Hook options
 * @returns {Object} Hook state and data
 */
export const useUserActivity = (options = {}) => {
    return useGet(ENDPOINTS.ACTIVITY_FEED, {}, {
        ...options,
        onSuccess: (data) => {
            console.log('useUserActivity: Data loaded successfully:', data);
            if (options.onSuccess) options.onSuccess(data);
        },
        onError: (error) => {
            console.error('useUserActivity: Error loading activity:', error);
            if (options.onError) options.onError(error);
        }
    });
};

export default userActivityApi;
