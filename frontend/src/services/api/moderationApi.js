import httpClient from './httpClient';
import { useGet, usePost, usePut, useDelete, usePatch } from '../../hooks/useSimpleApi';

/**
 * Moderation API Service
 * General-purpose content moderation service for managing content across all types
 * with bulk operations, automated analysis, history tracking, and statistics
 * Leverages the robust httpClient service for consistent error handling
 */

// API Endpoints
const ENDPOINTS = {
    // Core moderation endpoints
    MODERATION_BULK: '/api/moderation/bulk',
    MODERATION_HISTORY: '/api/moderation/history',
    MODERATION_STATISTICS: '/api/moderation/statistics',
    MODERATION_BULK_ACTION: '/api/moderation/bulk/{bulkActionId}',
    MODERATION_ANALYZE: '/api/moderation/analyze',
    MODERATION_ANALYZE_DETAILED: '/api/moderation/analyze/detailed',
    MODERATION_CONTENT_HISTORY: '/api/moderation/history/content/{contentType}/{contentId}',
    MODERATION_AUTOMATED: '/api/moderation/automated',
};

/**
 * Bulk Moderation Request Data Structure
 * @typedef {Object} BulkModerationRequest
 * @property {string} action - Moderation action (approve, reject, delete, flag)
 * @property {Array<number>} contentIds - Array of content IDs
 * @property {string} contentType - Content type (HERITAGE_SITE, ARTIFACT, DOCUMENT, etc.)
 * @property {string} reason - Reason for moderation action
 * @property {string} moderatorNotes - Additional moderator notes
 */

/**
 * Bulk Moderation Response Data Structure
 * @typedef {Object} BulkModerationResponse
 * @property {string} bulkActionId - Unique bulk action identifier
 * @property {number} totalItems - Total items processed
 * @property {number} successfulItems - Successfully processed items
 * @property {number} failedItems - Failed items
 * @property {Array<Object>} errors - Array of error details
 * @property {string} status - Overall status (COMPLETED, PARTIAL, FAILED)
 * @property {string} startTime - Start time of bulk action
 * @property {string} endTime - End time of bulk action
 */

/**
 * Moderation History Entry Data Structure
 * @typedef {Object} ModerationHistoryEntry
 * @property {number} id - Unique identifier
 * @property {string} contentType - Content type
 * @property {number} contentId - Content ID
 * @property {string} action - Moderation action taken
 * @property {string} reason - Reason for action
 * @property {string} moderatorNotes - Moderator notes
 * @property {string} moderatorUsername - Moderator username
 * @property {string} moderationDate - Date of moderation
 * @property {string} bulkActionId - Associated bulk action ID (if applicable)
 * @property {boolean} wasAutomated - Whether action was automated
 * @property {Object} metadata - Additional metadata
 */

/**
 * Content Analysis Result Data Structure
 * @typedef {Object} ContentAnalysisResult
 * @property {string} contentType - Content type
 * @property {number} contentId - Content ID
 * @property {number} toxicityScore - Toxicity score (0-1)
 * @property {number} spamScore - Spam score (0-1)
 * @property {number} offensiveScore - Offensive language score (0-1)
 * @property {Array<string>} flaggedKeywords - Flagged keywords
 * @property {string} recommendation - Moderation recommendation
 * @property {number} confidenceScore - Confidence in recommendation (0-1)
 * @property {Object} detailedAnalysis - Detailed analysis results
 * @property {string} analysisDate - Analysis date
 */

/**
 * Moderation Statistics Data Structure
 * @typedef {Object} ModerationStatistics
 * @property {number} totalActions - Total moderation actions
 * @property {number} todayActions - Actions today
 * @property {number} weekActions - Actions this week
 * @property {number} monthActions - Actions this month
 * @property {Object} actionsByType - Actions grouped by type
 * @property {Object} actionsByContentType - Actions grouped by content type
 * @property {Object} automatedVsManual - Automated vs manual actions
 * @property {Array<Object>} topModerators - Top moderators by activity
 * @property {Array<Object>} recentTrends - Recent moderation trends
 */

/**
 * Moderation API Service
 */
export const moderationApi = {
    // ==========================================
    // BULK MODERATION OPERATIONS
    // ==========================================

    /**
     * Perform bulk moderation action
     * @param {BulkModerationRequest} bulkRequest - Bulk moderation request
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<BulkModerationResponse>} Bulk operation result
     */
    performBulkModeration: async (bulkRequest, options = {}) => {
        const { config = {} } = options;

        return httpClient.post(ENDPOINTS.MODERATION_BULK, bulkRequest, config);
    },

    /**
     * Get bulk action details
     * @param {string} bulkActionId - Bulk action ID
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<ModerationHistoryEntry>>} Bulk action details
     */
    getBulkActionDetails: async (bulkActionId, options = {}) => {
        const { config = {} } = options;
        const url = ENDPOINTS.MODERATION_BULK_ACTION.replace('{bulkActionId}', bulkActionId);

        return httpClient.get(url, {}, config);
    },

    // ==========================================
    // MODERATION HISTORY
    // ==========================================

    /**
     * Get moderation history with filtering
     * @param {Object} options - Request options
     * @param {string} options.contentType - Filter by content type
     * @param {string} options.moderatorUsername - Filter by moderator
     * @param {string} options.action - Filter by action type
     * @param {string} options.startDate - Start date filter
     * @param {string} options.endDate - End date filter
     * @param {number} options.page - Page number for pagination
     * @param {number} options.size - Page size for pagination
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<ModerationHistoryEntry>>} Moderation history
     */
    getModerationHistory: async (options = {}) => {
        const { 
            contentType, 
            moderatorUsername, 
            action, 
            startDate, 
            endDate, 
            page, 
            size, 
            config = {} 
        } = options;
        
        const params = {};
        if (contentType) params.contentType = contentType;
        if (moderatorUsername) params.moderatorUsername = moderatorUsername;
        if (action) params.action = action;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (page !== undefined) params.page = page;
        if (size !== undefined) params.size = size;

        return httpClient.get(ENDPOINTS.MODERATION_HISTORY, params, config);
    },

    /**
     * Get moderation history for specific content
     * @param {string} contentType - Content type
     * @param {number} contentId - Content ID
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<ModerationHistoryEntry>>} Content moderation history
     */
    getContentModerationHistory: async (contentType, contentId, options = {}) => {
        const { config = {} } = options;
        const url = ENDPOINTS.MODERATION_CONTENT_HISTORY
            .replace('{contentType}', contentType)
            .replace('{contentId}', contentId);

        return httpClient.get(url, {}, config);
    },

    /**
     * Get automated moderation actions
     * @param {Object} options - Request options
     * @param {string} options.startDate - Start date filter
     * @param {string} options.endDate - End date filter
     * @param {string} options.contentType - Filter by content type
     * @param {number} options.page - Page number for pagination
     * @param {number} options.size - Page size for pagination
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<ModerationHistoryEntry>>} Automated actions
     */
    getAutomatedActions: async (options = {}) => {
        const { startDate, endDate, contentType, page, size, config = {} } = options;
        
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (contentType) params.contentType = contentType;
        if (page !== undefined) params.page = page;
        if (size !== undefined) params.size = size;

        return httpClient.get(ENDPOINTS.MODERATION_AUTOMATED, params, config);
    },

    // ==========================================
    // CONTENT ANALYSIS
    // ==========================================

    /**
     * Analyze content for moderation recommendations
     * @param {string} contentType - Content type
     * @param {number} contentId - Content ID
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Object>} Moderation recommendation
     */
    analyzeContent: async (contentType, contentId, options = {}) => {
        const { config = {} } = options;
        const requestData = { contentType, contentId };

        return httpClient.post(ENDPOINTS.MODERATION_ANALYZE, requestData, config);
    },

    /**
     * Get detailed content analysis
     * @param {string} contentType - Content type
     * @param {number} contentId - Content ID
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<ContentAnalysisResult>} Detailed analysis result
     */
    getDetailedAnalysis: async (contentType, contentId, options = {}) => {
        const { config = {} } = options;
        const requestData = { contentType, contentId };

        return httpClient.post(ENDPOINTS.MODERATION_ANALYZE_DETAILED, requestData, config);
    },

    /**
     * Analyze text content directly
     * @param {string} text - Text content to analyze
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Object>} Analysis result
     */
    analyzeText: async (text, options = {}) => {
        const { config = {} } = options;
        const requestData = { text };

        return httpClient.post(ENDPOINTS.MODERATION_ANALYZE, requestData, config);
    },

    // ==========================================
    // MODERATION STATISTICS
    // ==========================================

    /**
     * Get moderation statistics
     * @param {Object} options - Request options
     * @param {string} options.period - Time period (day, week, month, year)
     * @param {string} options.contentType - Filter by content type
     * @param {string} options.moderatorUsername - Filter by moderator
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<ModerationStatistics>} Moderation statistics
     */
    getModerationStatistics: async (options = {}) => {
        const { period, contentType, moderatorUsername, config = {} } = options;
        
        const params = {};
        if (period) params.period = period;
        if (contentType) params.contentType = contentType;
        if (moderatorUsername) params.moderatorUsername = moderatorUsername;

        return httpClient.get(ENDPOINTS.MODERATION_STATISTICS, params, config);
    },

    // ==========================================
    // CONTENT TYPE SPECIFIC HELPERS
    // ==========================================

    /**
     * Moderate heritage site content
     * @param {Array<number>} siteIds - Heritage site IDs
     * @param {string} action - Moderation action
     * @param {string} reason - Reason for action
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<BulkModerationResponse>} Moderation result
     */
    moderateHeritageSites: async (siteIds, action, reason, options = {}) => {
        const bulkRequest = {
            action,
            contentIds: siteIds,
            contentType: 'HERITAGE_SITE',
            reason,
        };

        return moderationApi.performBulkModeration(bulkRequest, options);
    },

    /**
     * Moderate artifact content
     * @param {Array<number>} artifactIds - Artifact IDs
     * @param {string} action - Moderation action
     * @param {string} reason - Reason for action
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<BulkModerationResponse>} Moderation result
     */
    moderateArtifacts: async (artifactIds, action, reason, options = {}) => {
        const bulkRequest = {
            action,
            contentIds: artifactIds,
            contentType: 'ARTIFACT',
            reason,
        };

        return moderationApi.performBulkModeration(bulkRequest, options);
    },

    /**
     * Moderate document content
     * @param {Array<number>} documentIds - Document IDs
     * @param {string} action - Moderation action
     * @param {string} reason - Reason for action
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<BulkModerationResponse>} Moderation result
     */
    moderateDocuments: async (documentIds, action, reason, options = {}) => {
        const bulkRequest = {
            action,
            contentIds: documentIds,
            contentType: 'DOCUMENT',
            reason,
        };

        return moderationApi.performBulkModeration(bulkRequest, options);
    },

    /**
     * Moderate forum content
     * @param {Array<number>} forumContentIds - Forum content IDs
     * @param {string} contentType - Forum content type (FORUM_TOPIC, FORUM_POST, FORUM_CATEGORY)
     * @param {string} action - Moderation action
     * @param {string} reason - Reason for action
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<BulkModerationResponse>} Moderation result
     */
    moderateForumContent: async (forumContentIds, contentType, action, reason, options = {}) => {
        const bulkRequest = {
            action,
            contentIds: forumContentIds,
            contentType,
            reason,
        };

        return moderationApi.performBulkModeration(bulkRequest, options);
    },

    /**
     * Get moderation history for heritage site
     * @param {number} siteId - Heritage site ID
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<ModerationHistoryEntry>>} Site moderation history
     */
    getHeritageSiteModerationHistory: async (siteId, options = {}) => {
        return moderationApi.getContentModerationHistory('HERITAGE_SITE', siteId, options);
    },

    /**
     * Get moderation history for artifact
     * @param {number} artifactId - Artifact ID
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<ModerationHistoryEntry>>} Artifact moderation history
     */
    getArtifactModerationHistory: async (artifactId, options = {}) => {
        return moderationApi.getContentModerationHistory('ARTIFACT', artifactId, options);
    },

    /**
     * Get moderation history for document
     * @param {number} documentId - Document ID
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<ModerationHistoryEntry>>} Document moderation history
     */
    getDocumentModerationHistory: async (documentId, options = {}) => {
        return moderationApi.getContentModerationHistory('DOCUMENT', documentId, options);
    },
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Utility function to get moderation action color
 * @param {string} action - Moderation action
 * @returns {string} Color class
 */
export const getModerationActionColor = (action) => {
    const colors = {
        'approve': 'green',
        'reject': 'red',
        'delete': 'red',
        'flag': 'yellow',
        'hide': 'orange',
        'warn': 'yellow',
        'suspend': 'red',
        'review': 'blue',
    };
    
    return colors[action] || 'gray';
};

/**
 * Utility function to get moderation action display
 * @param {string} action - Moderation action
 * @returns {string} Display text with icon
 */
export const getModerationActionDisplay = (action) => {
    const displays = {
        'approve': '✅ Approve',
        'reject': '❌ Reject',
        'delete': '🗑️ Delete',
        'flag': '🚩 Flag',
        'hide': '👁️ Hide',
        'warn': '⚠️ Warn',
        'suspend': '⏸️ Suspend',
        'review': '🔍 Review',
    };
    
    return displays[action] || action;
};

/**
 * Utility function to get content type display name
 * @param {string} contentType - Content type
 * @returns {string} Display name
 */
export const getContentTypeDisplayName = (contentType) => {
    const displayNames = {
        'HERITAGE_SITE': 'Heritage Site',
        'ARTIFACT': 'Artifact',
        'DOCUMENT': 'Document',
        'FORUM_TOPIC': 'Forum Topic',
        'FORUM_POST': 'Forum Post',
        'FORUM_CATEGORY': 'Forum Category',
        'EDUCATIONAL_ARTICLE': 'Educational Article',
        'TESTIMONIAL': 'Testimonial',
    };
    
    return displayNames[contentType] || contentType.replace('_', ' ');
};

/**
 * Utility function to format toxicity score
 * @param {number} score - Toxicity score (0-1)
 * @returns {Object} Formatted score with level and color
 */
export const formatToxicityScore = (score) => {
    if (score < 0.2) {
        return { level: 'Low', color: 'green', percentage: Math.round(score * 100) };
    } else if (score < 0.5) {
        return { level: 'Medium', color: 'yellow', percentage: Math.round(score * 100) };
    } else if (score < 0.8) {
        return { level: 'High', color: 'orange', percentage: Math.round(score * 100) };
    } else {
        return { level: 'Very High', color: 'red', percentage: Math.round(score * 100) };
    }
};

/**
 * Utility function to get recommendation severity
 * @param {string} recommendation - Moderation recommendation
 * @returns {Object} Severity information
 */
export const getRecommendationSeverity = (recommendation) => {
    const severities = {
        'APPROVE': { level: 'safe', color: 'green', icon: '✅' },
        'REVIEW': { level: 'caution', color: 'yellow', icon: '⚠️' },
        'FLAG': { level: 'warning', color: 'orange', icon: '🚩' },
        'REJECT': { level: 'danger', color: 'red', icon: '❌' },
        'DELETE': { level: 'critical', color: 'red', icon: '🗑️' },
    };
    
    return severities[recommendation] || { level: 'unknown', color: 'gray', icon: '❓' };
};

/**
 * Utility function to validate moderation action
 * @param {string} action - Action to validate
 * @returns {boolean} Whether action is valid
 */
export const isValidModerationAction = (action) => {
    const validActions = [
        'approve', 'reject', 'delete', 'flag', 'hide', 'warn', 'suspend', 'review'
    ];
    return validActions.includes(action);
};

/**
 * Utility function to validate content type
 * @param {string} contentType - Content type to validate
 * @returns {boolean} Whether content type is valid
 */
export const isValidContentType = (contentType) => {
    const validTypes = [
        'HERITAGE_SITE',
        'ARTIFACT',
        'DOCUMENT',
        'FORUM_TOPIC',
        'FORUM_POST',
        'FORUM_CATEGORY',
        'EDUCATIONAL_ARTICLE',
        'TESTIMONIAL',
    ];
    return validTypes.includes(contentType);
};

/**
 * Utility function to calculate moderation workload
 * @param {Array<ModerationHistoryEntry>} history - Moderation history
 * @param {string} period - Time period (day, week, month)
 * @returns {Object} Workload analysis
 */
export const calculateModerationWorkload = (history, period = 'week') => {
    const now = new Date();
    const periodMs = {
        'day': 24 * 60 * 60 * 1000,
        'week': 7 * 24 * 60 * 60 * 1000,
        'month': 30 * 24 * 60 * 60 * 1000,
    };
    
    const cutoff = new Date(now.getTime() - periodMs[period]);
    
    const recentActions = history.filter(entry => 
        new Date(entry.moderationDate) >= cutoff
    );
    
    const actionsByModerator = {};
    const actionsByType = {};
    
    recentActions.forEach(entry => {
        // Count by moderator
        if (!actionsByModerator[entry.moderatorUsername]) {
            actionsByModerator[entry.moderatorUsername] = 0;
        }
        actionsByModerator[entry.moderatorUsername]++;
        
        // Count by action type
        if (!actionsByType[entry.action]) {
            actionsByType[entry.action] = 0;
        }
        actionsByType[entry.action]++;
    });
    
    return {
        totalActions: recentActions.length,
        averagePerDay: recentActions.length / (periodMs[period] / (24 * 60 * 60 * 1000)),
        actionsByModerator,
        actionsByType,
        topModerator: Object.keys(actionsByModerator).reduce((a, b) => 
            actionsByModerator[a] > actionsByModerator[b] ? a : b
        ),
    };
};

// ==========================================
// REACT HOOKS
// ==========================================

/**
 * Hook for fetching moderation history
 * @param {Object} options - Hook options
 * @param {boolean} options.enabled - Whether to enable the query
 * @param {string} options.contentType - Filter by content type
 * @param {string} options.moderatorUsername - Filter by moderator
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and data
 */
export const useModerationHistory = (options = {}) => {
    const { enabled = true, contentType, moderatorUsername, onSuccess, onError } = options;
    const params = {};
    
    if (contentType) params.contentType = contentType;
    if (moderatorUsername) params.moderatorUsername = moderatorUsername;
    
    return useGet(ENDPOINTS.MODERATION_HISTORY, params, {
        enabled,
        onSuccess,
        onError,
    });
};

/**
 * Hook for fetching content moderation history
 * @param {string} contentType - Content type
 * @param {number} contentId - Content ID
 * @param {Object} options - Hook options
 * @param {boolean} options.enabled - Whether to enable the query
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and data
 */
export const useContentModerationHistory = (contentType, contentId, options = {}) => {
    const { enabled = true, onSuccess, onError } = options;
    const url = ENDPOINTS.MODERATION_CONTENT_HISTORY
        .replace('{contentType}', contentType)
        .replace('{contentId}', contentId);
    
    return useGet(url, {}, {
        enabled: enabled && !!contentType && !!contentId,
        onSuccess,
        onError,
    });
};

/**
 * Hook for fetching moderation statistics
 * @param {Object} options - Hook options
 * @param {boolean} options.enabled - Whether to enable the query
 * @param {string} options.period - Time period filter
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and data
 */
export const useModerationStatistics = (options = {}) => {
    const { enabled = true, period, onSuccess, onError } = options;
    const params = {};
    
    if (period) params.period = period;
    
    return useGet(ENDPOINTS.MODERATION_STATISTICS, params, {
        enabled,
        onSuccess,
        onError,
    });
};

/**
 * Hook for fetching automated actions
 * @param {Object} options - Hook options
 * @param {boolean} options.enabled - Whether to enable the query
 * @param {string} options.contentType - Filter by content type
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and data
 */
export const useAutomatedActions = (options = {}) => {
    const { enabled = true, contentType, onSuccess, onError } = options;
    const params = {};
    
    if (contentType) params.contentType = contentType;
    
    return useGet(ENDPOINTS.MODERATION_AUTOMATED, params, {
        enabled,
        onSuccess,
        onError,
    });
};

/**
 * Hook for performing bulk moderation (mutation)
 * @param {Object} options - Hook options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and functions
 */
export const useBulkModeration = (options = {}) => {
    const { onSuccess, onError } = options;

    return usePost(ENDPOINTS.MODERATION_BULK, {
        onSuccess,
        onError,
    });
};

/**
 * Hook for analyzing content (mutation)
 * @param {Object} options - Hook options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and functions
 */
export const useContentAnalysis = (options = {}) => {
    const { onSuccess, onError } = options;

    return usePost(ENDPOINTS.MODERATION_ANALYZE, {
        onSuccess,
        onError,
    });
};

/**
 * Hook for detailed content analysis (mutation)
 * @param {Object} options - Hook options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and functions
 */
export const useDetailedContentAnalysis = (options = {}) => {
    const { onSuccess, onError } = options;

    return usePost(ENDPOINTS.MODERATION_ANALYZE_DETAILED, {
        onSuccess,
        onError,
    });
};

// Export everything
export default moderationApi;