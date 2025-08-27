/**
 * Forum API Service
 * 
 * Provides comprehensive forum functionality including categories, topics, posts, and moderation.
 * Leverages the robust httpClient service for consistent error handling and automatic caching.
 */

import httpClient from './httpClient';
import { useGet, usePost, usePut, useDelete } from '../../hooks/useSimpleApi';

// API Endpoints
const ENDPOINTS = {
    // Categories
    CATEGORIES: '/api/forum/categories',
    CATEGORY: (id) => `/api/forum/categories/${id}`,

    // Topics
    TOPICS: '/api/forum/topics',
    TOPIC: (id) => `/api/forum/topics/${id}`,
    TOPIC_POSTS: (topicId) => `/api/forum/topics/${topicId}/posts`,

    // Posts
    POSTS: '/api/forum/posts',
    POST: (id) => `/api/forum/posts/${id}`,
    POST_REACTIONS: (postId) => `/api/forum/posts/${postId}/reactions`,

    // Reports
    REPORTS: '/api/forum/reports',
    REPORT: (id) => `/api/forum/reports/${id}`,
    REPORT_UPDATE: '/api/forum/reports/update',
    BULK_MODERATE: '/api/forum/reports/bulk-moderate',

    // User preferences
    USER_LANGUAGE_PREFERENCES: '/api/forum/user-language-preferences',

    // Analytics
    ANALYTICS: '/api/forum/analytics',
    USER_STATS: (userId) => `/api/forum/users/${userId}/stats`,

    // Moderation
    MODERATION_ACTIONS: '/api/forum/moderation/actions',
    CONTENT_FLAGS: '/api/forum/content/flags'
};

// Forum Categories API
export const forumCategoriesApi = {
    getAllCategories: async (params = {}) => {
        return httpClient.get(ENDPOINTS.CATEGORIES, params);
    },

    getCategoryById: async (id, params = {}) => {
        return httpClient.get(ENDPOINTS.CATEGORY(id), params);
    },

    createCategory: async (categoryData) => {
        return httpClient.post(ENDPOINTS.CATEGORIES, categoryData);
    },

    updateCategory: async (id, categoryData) => {
        return httpClient.put(ENDPOINTS.CATEGORY(id), categoryData);
    },

    deleteCategory: async (id) => {
        return httpClient.delete(ENDPOINTS.CATEGORY(id));
    },

    getPublicCategories: async (params = {}) => {
        return httpClient.get(ENDPOINTS.CATEGORIES, { ...params, isPublic: true });
    }
};

// Forum Topics API
export const forumTopicsApi = {
    getAllTopics: async (params = {}) => {
        return httpClient.get(ENDPOINTS.TOPICS, params);
    },

    getTopicById: async (id, params = {}) => {
        return httpClient.get(ENDPOINTS.TOPIC(id), params);
    },

    createTopic: async (topicData) => {
        return httpClient.post(ENDPOINTS.TOPICS, topicData);
    },

    updateTopic: async (id, topicData) => {
        return httpClient.put(ENDPOINTS.TOPIC(id), topicData);
    },

    deleteTopic: async (id) => {
        return httpClient.delete(ENDPOINTS.TOPIC(id));
    },

    getTopicsByCategory: async (categoryId, params = {}) => {
        return httpClient.get(ENDPOINTS.TOPICS, { ...params, categoryId });
    },

    getTopicsByUser: async (userId, params = {}) => {
        return httpClient.get(ENDPOINTS.TOPICS, { ...params, createdBy: userId });
    },

    searchTopics: async (query, params = {}) => {
        return httpClient.get(ENDPOINTS.TOPICS, { ...params, search: query });
    },

    getTrendingTopics: async (params = {}) => {
        return httpClient.get(ENDPOINTS.TOPICS, { ...params, sort: 'views,desc' });
    }
};

// Forum Posts API
export const forumPostsApi = {
    getAllPosts: async (params = {}) => {
        return httpClient.get(ENDPOINTS.POSTS, params);
    },

    getPostById: async (id, params = {}) => {
        return httpClient.get(ENDPOINTS.POST(id), params);
    },

    createPost: async (postData) => {
        return httpClient.post(ENDPOINTS.POSTS, postData);
    },

    updatePost: async (id, postData) => {
        return httpClient.put(ENDPOINTS.POST(id), postData);
    },

    deletePost: async (id) => {
        return httpClient.delete(ENDPOINTS.POST(id));
    },

    getPostsByTopic: async (topicId, params = {}) => {
        return httpClient.get(ENDPOINTS.TOPIC_POSTS(topicId), params);
    },

    getPostsByUser: async (userId, params = {}) => {
        return httpClient.get(ENDPOINTS.POSTS, { ...params, createdBy: userId });
    },

    addReaction: async (postId, reactionData) => {
        return httpClient.post(ENDPOINTS.POST_REACTIONS(postId), reactionData);
    },

    removeReaction: async (postId, reactionType) => {
        return httpClient.delete(ENDPOINTS.POST_REACTIONS(postId), { reactionType });
    }
};

// Forum Reports API
export const forumReportsApi = {
    getAllReports: async (params = {}) => {
        return httpClient.get(ENDPOINTS.REPORTS, params);
    },

    getReportById: async (id, params = {}) => {
        return httpClient.get(ENDPOINTS.REPORT(id), params);
    },

    createReport: async (reportData) => {
        return httpClient.post(ENDPOINTS.REPORTS, reportData);
    },

    updateReportStatus: async (reportId, statusData) => {
        return httpClient.post(ENDPOINTS.REPORT_UPDATE, { reportId, statusData });
    },

    bulkModerate: async (moderationData) => {
        return httpClient.post(ENDPOINTS.BULK_MODERATE, moderationData);
    },

    getReportsByStatus: async (status, params = {}) => {
        return httpClient.get(ENDPOINTS.REPORTS, { ...params, status });
    },

    getReportsByContentType: async (contentType, params = {}) => {
        return httpClient.get(ENDPOINTS.REPORTS, { ...params, contentType });
    }
};

// Forum Moderation API
export const forumModerationApi = {
    getModerationActions: async (params = {}) => {
        return httpClient.get(ENDPOINTS.MODERATION_ACTIONS, params);
    },

    performModerationAction: async (actionData) => {
        return httpClient.post(ENDPOINTS.MODERATION_ACTIONS, actionData);
    },

    getContentFlags: async (params = {}) => {
        return httpClient.get(ENDPOINTS.CONTENT_FLAGS, params);
    },

    flagContent: async (flagData) => {
        return httpClient.post(ENDPOINTS.CONTENT_FLAGS, flagData);
    },

    getModerationHistory: async (moderatorId, params = {}) => {
        return httpClient.get(ENDPOINTS.MODERATION_ACTIONS, { ...params, moderatorId });
    }
};

// Forum Analytics API
export const forumAnalyticsApi = {
    getForumAnalytics: async (params = {}) => {
        return httpClient.get(ENDPOINTS.ANALYTICS, params);
    },

    getUserStats: async (userId, params = {}) => {
        return httpClient.get(ENDPOINTS.USER_STATS(userId), params);
    },

    getCategoryStats: async (categoryId, params = {}) => {
        return httpClient.get(ENDPOINTS.ANALYTICS, { ...params, categoryId });
    },

    getTopicStats: async (topicId, params = {}) => {
        return httpClient.get(ENDPOINTS.ANALYTICS, { ...params, topicId });
    },

    getEngagementMetrics: async (params = {}) => {
        return httpClient.get(ENDPOINTS.ANALYTICS, { ...params, type: 'engagement' });
    }
};

// Forum User API
export const forumUserApi = {
    getUserLanguagePreferences: async (params = {}) => {
        return httpClient.get(ENDPOINTS.USER_LANGUAGE_PREFERENCES, params);
    },

    updateUserLanguagePreferences: async (preferences) => {
        return httpClient.put(ENDPOINTS.USER_LANGUAGE_PREFERENCES, preferences);
    },

    getUserActivity: async (userId, params = {}) => {
        return httpClient.get(ENDPOINTS.USER_STATS(userId), { ...params, type: 'activity' });
    },

    getUserContributions: async (userId, params = {}) => {
        return httpClient.get(ENDPOINTS.USER_STATS(userId), { ...params, type: 'contributions' });
    }
};

// React Query hooks for easy integration
export const useForumCategories = (options = {}) => useGet(ENDPOINTS.CATEGORIES, {}, options);
export const useCreateForumCategory = (options = {}) => usePost(ENDPOINTS.CATEGORIES, options);
export const useUpdateForumCategory = (options = {}) => usePut(ENDPOINTS.CATEGORIES, options);
export const useDeleteForumCategory = (options = {}) => useDelete(ENDPOINTS.CATEGORIES, options);

export const useForumTopics = (options = {}) => useGet(ENDPOINTS.TOPICS, {}, options);
export const useCreateForumTopic = (options = {}) => usePost(ENDPOINTS.TOPICS, options);
export const useUpdateForumTopic = (options = {}) => usePut(ENDPOINTS.TOPICS, options);
export const useDeleteForumTopic = (options = {}) => useDelete(ENDPOINTS.TOPICS, options);

export const useForumPosts = (topicId, options = {}) => useGet(ENDPOINTS.TOPIC_POSTS(topicId), {}, { enabled: !!topicId, ...options });
export const useCreateForumPost = (options = {}) => usePost(ENDPOINTS.POSTS, options);
export const useUpdateForumPost = (options = {}) => usePut(ENDPOINTS.POSTS, options);
export const useDeleteForumPost = (options = {}) => useDelete(ENDPOINTS.POSTS, options);

export const useGetReports = (options = {}) => useGet(ENDPOINTS.REPORTS, {}, options);
export const useCreateReport = (options = {}) => usePost(ENDPOINTS.REPORTS, options);
export const useUpdateReportStatus = (options = {}) => usePost(ENDPOINTS.REPORT_UPDATE, options);
export const useBulkModerate = (options = {}) => usePost(ENDPOINTS.BULK_MODERATE, options);

export const useUserLanguagePreferences = (options = {}) => useGet(ENDPOINTS.USER_LANGUAGE_PREFERENCES, {}, options);
export const useUpdateUserLanguagePreferences = (options = {}) => usePut(ENDPOINTS.USER_LANGUAGE_PREFERENCES, options);

export const useForumAnalytics = (options = {}) => useGet(ENDPOINTS.ANALYTICS, {}, options);
export const useUserForumStats = (userId, options = {}) => useGet(ENDPOINTS.USER_STATS(userId), {}, { enabled: !!userId, ...options });

// Export all APIs for direct use
export {
    forumCategoriesApi,
    forumTopicsApi,
    forumPostsApi,
    forumReportsApi,
    forumModerationApi,
    forumAnalyticsApi,
    forumUserApi
};
