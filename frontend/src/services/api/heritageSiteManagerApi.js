import httpClient from './httpClient';

/**
 * Heritage Site Manager API Service
 * 
 * Comprehensive service for managing heritage site manager assignments:
 * - Assign managers to heritage sites
 * - Remove managers from sites
 * - View manager assignments
 * - Manage assignment notes
 * - Role-based access control
 */

// API Endpoints
const ENDPOINTS = {
    BASE: '/api/heritage-site-manager',
    ASSIGN_MANAGER: '/api/heritage-site-manager/sites/{siteId}/assign',
    REMOVE_MANAGER: '/api/heritage-site-manager/sites/{siteId}/remove-manager',
    GET_SITE_ASSIGNMENT: '/api/heritage-site-manager/sites/{siteId}',
    GET_MY_SITES: '/api/heritage-site-manager/my-sites',
    UPDATE_NOTES: '/api/heritage-site-manager/{assignmentId}/notes',
    GET_ALL_ASSIGNMENTS: '/api/heritage-site-manager',
    GET_AVAILABLE_SITES: '/api/heritage-site-manager/available-sites',
    GET_AVAILABLE_MANAGERS: '/api/heritage-site-manager/available-managers'
};



/**
 * Manager Assignment Data Structure
 * @typedef {Object} HeritageSiteManager
 * @property {number} id - Assignment ID
 * @property {number} userId - Manager user ID
 * @property {string} managerUsername - Manager username
 * @property {string} managerFullName - Manager full name
 * @property {number} heritageSiteId - Heritage site ID
 * @property {string} heritageSiteName - Heritage site name
 * @property {string} status - Assignment status (ACTIVE, INACTIVE, SUSPENDED)
 * @property {string} assignedDate - Assignment date
 * @property {string} lastUpdated - Last update date
 * @property {string} notes - Assignment notes
 */

/**
 * Assign Manager Request Data Structure
 * @typedef {Object} AssignManagerRequest
 * @property {number} managerId - User ID of the manager to assign
 * @property {string} notes - Optional notes about the assignment
 */

/**
 * Update Notes Request Data Structure
 * @typedef {Object} UpdateNotesRequest
 * @property {string} notes - New notes for the assignment
 */

const heritageSiteManagerApi = {
    /**
     * Assign a manager to a heritage site (System Admin only)
     * @param {number} siteId - Heritage site ID
     * @param {AssignManagerRequest} requestData - Assignment request data
     * @param {Object} options - Request options
     * @returns {Promise<HeritageSiteManager>} Created manager assignment
     */
    assignManagerToSite: async (siteId, requestData, options = {}) => {
        const endpoint = ENDPOINTS.ASSIGN_MANAGER.replace('{siteId}', siteId);
        return httpClient.post(endpoint, requestData, options.config);
    },

    /**
     * Remove a manager from a heritage site (System Admin only)
     * @param {number} siteId - Heritage site ID
     * @param {Object} options - Request options
     * @returns {Promise<void>} Success response
     */
    removeManagerFromSite: async (siteId, options = {}) => {
        const endpoint = ENDPOINTS.REMOVE_MANAGER.replace('{siteId}', siteId);
        return httpClient.delete(endpoint, options.config);
    },

    /**
     * Get all manager assignments (System Admin only)
     * @param {Object} options - Request options
     * @returns {Promise<Array<HeritageSiteManager>>} Array of manager assignments
     */
    getAllManagerAssignments: async (options = {}) => {
        return httpClient.get(ENDPOINTS.BASE, {}, options.config);
    },

    /**
     * Get manager assignment for a specific site
     * @param {number} siteId - Heritage site ID
     * @param {Object} options - Request options
     * @returns {Promise<HeritageSiteManager>} Manager assignment for the site
     */
    getManagerAssignmentForSite: async (siteId, options = {}) => {
        const endpoint = ENDPOINTS.GET_SITE_ASSIGNMENT.replace('{siteId}', siteId);
        return httpClient.get(endpoint, {}, options.config);
    },

    /**
     * Get all sites managed by the current user (for heritage managers)
     * @param {number} userId - Current user ID
     * @param {Object} options - Request options
     * @returns {Promise<Array<HeritageSiteManager>>} Array of managed sites
     */
    getMyManagedSites: async (userId, options = {}) => {
        const endpoint = ENDPOINTS.GET_MY_SITES;
        return httpClient.get(endpoint, { userId }, options.config);
    },

    /**
     * Get all manager assignments (System Admin only)
     * @param {Object} options - Request options
     * @returns {Promise<Array<HeritageSiteManager>>} Array of all manager assignments
     */
    getAllManagerAssignments: async (options = {}) => {
        return httpClient.get(ENDPOINTS.GET_ALL_ASSIGNMENTS, {}, options.config);
    },

    /**
     * Get available heritage sites for assignment (System Admin only)
     * @param {Object} options - Request options
     * @returns {Promise<Array<Object>>} Array of available sites
     */
    getAvailableSitesForAssignment: async (options = {}) => {
        return httpClient.get(ENDPOINTS.GET_AVAILABLE_SITES, {}, options.config);
    },

    /**
     * Get available heritage managers for assignment (System Admin only)
     * @param {Object} options - Request options
     * @returns {Promise<Array<Object>>} Array of available managers
     */
    getAvailableManagersForAssignment: async (options = {}) => {
        return httpClient.get(ENDPOINTS.GET_AVAILABLE_MANAGERS, {}, options.config);
    },

    /**
     * Update assignment notes (System Admin only)
     * @param {number} assignmentId - Assignment ID
     * @param {string} notes - New notes
     * @param {Object} options - Request options
     * @returns {Promise<HeritageSiteManager>} Updated manager assignment
     */
    updateAssignmentNotes: async (assignmentId, notes, options = {}) => {
        const endpoint = ENDPOINTS.UPDATE_NOTES.replace('{assignmentId}', assignmentId);
        return httpClient.patch(endpoint, { notes }, options.config);
    },

    /**
     * Check if a user is assigned as manager to a specific site
     * @param {number} siteId - Heritage site ID
     * @param {number} userId - User ID to check
     * @param {Object} options - Request options
     * @returns {Promise<boolean>} True if user is assigned manager
     */
    isUserAssignedManager: async (siteId, userId, options = {}) => {
        try {
            const assignment = await heritageSiteManagerApi.getManagerAssignmentForSite(siteId, options);
            return assignment && assignment.userId === userId && assignment.status === 'ACTIVE';
        } catch (error) {
            // If no assignment found, user is not a manager
            return false;
        }
    },

    /**
     * Get active manager assignments count
     * @param {Object} options - Request options
     * @returns {Promise<number>} Count of active assignments
     */
    getActiveAssignmentsCount: async (options = {}) => {
        try {
            const assignments = await heritageSiteManagerApi.getAllManagerAssignments(options);
            return assignments.filter(assignment => assignment.status === 'ACTIVE').length;
        } catch (error) {
            console.error('Failed to get active assignments count:', error);
            return 0;
        }
    },

    /**
     * Get sites without assigned managers
     * @param {Object} options - Request options
     * @returns {Promise<Array<number>>} Array of site IDs without managers
     */
    getSitesWithoutManagers: async (options = {}) => {
        try {
            const assignments = await heritageSiteManagerApi.getAllManagerAssignments(options);
            const assignedSiteIds = assignments
                .filter(assignment => assignment.status === 'ACTIVE')
                .map(assignment => assignment.heritageSiteId);

            // This would need to be combined with heritage sites API
            // For now, return empty array
            return [];
        } catch (error) {
            console.error('Failed to get sites without managers:', error);
            return [];
        }
    }
};

// Import simplified hooks from our new hook system
import { useGet, usePost, usePut, useDelete } from '../../hooks/useSimpleApi';

// React hooks for easy integration
export const useHeritageSiteManagerAssignments = (options = {}) => {
    const { enabled = true, onSuccess, onError } = options;

    return useGet(ENDPOINTS.BASE, {}, {
        enabled,
        onSuccess,
        onError,
        ...options
    });
};

export const useHeritageSiteManagerAssignment = (siteId, options = {}) => {
    const { enabled = true, onSuccess, onError } = options;
    const endpoint = ENDPOINTS.GET_SITE_ASSIGNMENT.replace('{siteId}', siteId);

    return useGet(endpoint, {}, {
        enabled: enabled && !!siteId,
        onSuccess,
        onError,
        ...options
    });
};

export const useMyManagedSites = (userId, options = {}) => {
    const { enabled = true, onSuccess, onError } = options;

    return useGet(ENDPOINTS.GET_MY_SITES, {}, {
        enabled: enabled && !!userId,
        onSuccess,
        onError,
        ...options
    });
};

// Mutations for React Query
export const useAssignManagerToSite = (options = {}) => {
    const { onSuccess, onError } = options;

    return usePost(ENDPOINTS.ASSIGN_MANAGER, {
        onSuccess,
        onError,
        ...options
    });
};

export const useRemoveManagerFromSite = (options = {}) => {
    const { onSuccess, onError } = options;

    return useDelete(ENDPOINTS.REMOVE_MANAGER, {
        onSuccess,
        onError,
        ...options
    });
};

export const useUpdateAssignmentNotes = (options = {}) => {
    const { onSuccess, onError } = options;

    return usePut(ENDPOINTS.UPDATE_NOTES, {
        onSuccess,
        onError,
        ...options
    });
};

// Export everything
export default heritageSiteManagerApi;

