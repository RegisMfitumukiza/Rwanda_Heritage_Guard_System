import httpClient from './httpClient';

// API Endpoints
const ENDPOINTS = {
    // Community Reports
    REPORTS: '/api/community-reports',
    REPORTS_BY_STATUS: '/api/community-reports/status',
    REPORTS_BY_TYPE: '/api/community-reports/type',
    REPORT_BY_ID: (id) => `/api/community-reports/${id}`,
    UPDATE_REPORT: (id) => `/api/community-reports/${id}/status`,

    // Moderation
    MODERATION_STATS: '/api/moderation/statistics',
    MODERATION_HISTORY: '/api/moderation/history',

    // Forum Content for Moderation
    FORUM_TOPICS: '/api/forum/topics',
    FORUM_POSTS: '/api/forum/posts',
    FORUM_CONTENT_BY_ID: (type, id) => `/api/forum/${type}/${id}`,

    // User Management
    USERS_WITH_VIOLATIONS: '/api/users/violations',
    USER_VIOLATIONS: (username) => `/api/users/${username}/violations`,
};

/**
 * Community Management API Service
 */
export const communityApi = {
    /**
     * Get all community reports with filtering
     */
    getReports: async (status = null, contentType = null, reason = null) => {
        try {
            const params = {};
            if (status) params.status = status;
            if (contentType) params.contentType = contentType;
            if (reason) params.reason = reason;

            const response = await httpClient.get(ENDPOINTS.REPORTS, params);
            return response;
        } catch (error) {
            console.error('Failed to fetch reports:', error);
            throw error;
        }
    },

    /**
     * Get reports by status
     */
    getReportsByStatus: async (status) => {
        try {
            const response = await httpClient.get(`${ENDPOINTS.REPORTS_BY_STATUS}/${status}`);
            return response;
        } catch (error) {
            console.error('Failed to fetch reports by status:', error);
            throw error;
        }
    },

    /**
     * Update report status
     */
    updateReportStatus: async (reportId, status, action, notes) => {
        try {
            const response = await httpClient.put(ENDPOINTS.UPDATE_REPORT(reportId), {
                status,
                resolutionAction: action,
                resolutionNotes: notes
            });
            return response;
        } catch (error) {
            console.error('Failed to update report status:', error);
            throw error;
        }
    },

    /**
     * Get moderation statistics
     */
    getModerationStats: async () => {
        try {
            const response = await httpClient.get(ENDPOINTS.MODERATION_STATS);
            return response;
        } catch (error) {
            console.error('Failed to fetch moderation stats:', error);
            throw error;
        }
    },

    /**
     * Get forum content for moderation
     */
    getForumContent: async (contentType, contentId) => {
        try {
            const response = await httpClient.get(ENDPOINTS.FORUM_CONTENT_BY_ID(contentType, contentId));
            return response;
        } catch (error) {
            console.error('Failed to fetch forum content:', error);
            throw error;
        }
    },

    /**
     * Get users with violations
     */
    getUsersWithViolations: async () => {
        try {
            const response = await httpClient.get(ENDPOINTS.USERS_WITH_VIOLATIONS);
            return response;
        } catch (error) {
            console.error('Failed to fetch users with violations:', error);
            throw error;
        }
    },

    /**
     * Get violations for specific user
     */
    getUserViolations: async (username) => {
        try {
            const response = await httpClient.get(ENDPOINTS.USER_VIOLATIONS(username));
            return response;
        } catch (error) {
            console.error('Failed to fetch user violations:', error);
            throw error;
        }
    }
};
