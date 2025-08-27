import httpClient from './httpClient';
import { useGet, usePost, usePut, usePatch, useDelete } from '../../hooks/useSimpleApi';

// API Endpoints
const ENDPOINTS = {
    USERS: '/api/users',
    USER_STATISTICS: '/api/users/statistics',
    USER_PROFILE: '/api/users/profile',
    USER_BY_ID: (id) => `/api/users/${id}`,
    USER_STATUS: (id) => `/api/users/${id}/status`,
};

/**
 * User API Service - Using unified httpClient
 */
export const userApi = {
    /**
     * Get all users
     */
    getAllUsers: async (params = {}, options = {}) => {
        try {
            const response = await httpClient.get(ENDPOINTS.USERS, params, options);
            return response;
        } catch (error) {
            console.error('Failed to load users:', error);
            throw error;
        }
    },

    /**
     * Get user by ID
     */
    getUserById: async (userId, options = {}) => {
        try {
            const response = await httpClient.get(ENDPOINTS.USER_BY_ID(userId), {}, options);
            return response;
        } catch (error) {
            console.error(`Failed to load user ${userId}:`, error);
            throw error;
        }
    },

    /**
     * Update user
     */
    updateUser: async (userId, userData, options = {}) => {
        try {
            const response = await httpClient.put(ENDPOINTS.USER_BY_ID(userId), userData, options);
            return response;
        } catch (error) {
            console.error(`Failed to update user ${userId}:`, error);
            throw error;
        }
    },

    /**
     * Delete user
     */
    deleteUser: async (userId, options = {}) => {
        try {
            const response = await httpClient.delete(ENDPOINTS.USER_BY_ID(userId), options);
            return response;
        } catch (error) {
            console.error(`Failed to delete user ${userId}:`, error);
            throw error;
        }
    },

    /**
     * Enable/disable user
     */
    toggleUserStatus: async (userId, enabled, options = {}) => {
        try {
            const response = await httpClient.patch(ENDPOINTS.USER_STATUS(userId), { enabled }, options);
            return response;
        } catch (error) {
            console.error(`Failed to toggle user status ${userId}:`, error);
            throw error;
        }
    },
};

/**
 * Hook for getting all users
 */
export const useUsers = (options = {}) => {
    const { params, ...restOptions } = options;
    return useGet(ENDPOINTS.USERS, params, {
        ...restOptions,
        onSuccess: (data) => {
            console.log('useUsers: Data loaded successfully:', data);
            if (restOptions.onSuccess) restOptions.onSuccess(data);
        },
        onError: (error) => {
            console.error('useUsers: Error loading users:', error);
            if (restOptions.onError) restOptions.onError(error);
        }
    });
};

/**
 * Hook for getting user statistics
 */
export const useUserStatistics = (options = {}) => {
    return useGet(ENDPOINTS.USER_STATISTICS, {}, {
        ...options,
        onSuccess: (data) => {
            console.log('useUserStatistics: Data loaded successfully:', data);
            if (options.onSuccess) options.onSuccess(data);
        },
        onError: (error) => {
            console.error('useUserStatistics: Error loading statistics:', error);
            if (options.onError) options.onError(error);
        }
    });
};

/**
 * Hook for getting current user profile
 */
export const useCurrentUserProfile = (options = {}) => {
    return useGet(ENDPOINTS.USER_PROFILE, {}, {
        ...options,
        onSuccess: (data) => {
            console.log('useCurrentUserProfile: Data loaded successfully:', data);
            if (options.onSuccess) options.onSuccess(data);
        },
        onError: (error) => {
            console.error('useCurrentUserProfile: Error loading profile:', error);
            if (options.onError) options.onError(error);
        }
    });
};

export default userApi;
