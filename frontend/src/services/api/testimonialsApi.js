import httpClient from './httpClient';
import { useGet, usePost, usePut, useDelete, usePatch, useUpload } from '../../hooks/useSimpleApi';

/**
 * Testimonials API Service
 * Comprehensive service for managing testimonials with multilingual support and avatar handling
 */

// API Endpoints
const ENDPOINTS = {
    BASE: '/api/testimonials',
    SEARCH: '/api/testimonials/search',
    PAGE: '/api/testimonials/page',
    PENDING: '/api/testimonials/pending',
    STATISTICS: '/api/testimonials/statistics',
    AVATAR: '/api/testimonials/{id}/avatar',
};

/**
 * Testimonial Data Structure
 * @typedef {Object} Testimonial
 * @property {number} id - Unique identifier
 * @property {string} nameEn - Name in English
 * @property {string} nameRw - Name in Kinyarwanda
 * @property {string} nameFr - Name in French
 * @property {string} roleEn - Role in English
 * @property {string} roleRw - Role in Kinyarwanda
 * @property {string} roleFr - Role in French
 * @property {string} quoteEn - Quote in English
 * @property {string} quoteRw - Quote in Kinyarwanda
 * @property {string} quoteFr - Quote in French
 * @property {string} avatarUrl - Avatar URL
 * @property {string} avatarFileName - Avatar file name
 * @property {string} avatarFilePath - Avatar file path
 * @property {boolean} isVerified - Whether testimonial is verified
 * @property {boolean} isApproved - Whether testimonial is approved
 * @property {boolean} isFeatured - Whether testimonial is featured
 * @property {boolean} isActive - Whether testimonial is active
 * @property {string} language - Language code
 * @property {number} userId - Associated user ID
 * @property {string} userName - Associated user name
 * @property {string} createdBy - Creator username
 * @property {string} createdDate - Creation date
 * @property {string} updatedBy - Last updater username
 * @property {string} updatedDate - Last update date
 * @property {string} approvedBy - Approver username
 * @property {string} approvedDate - Approval date
 */

/**
 * Testimonials API Service
 */
export const testimonialsApi = {
    /**
     * Get all approved testimonials
     * @param {Object} options - Request options
     * @param {string} options.language - Language for content (en, rw, fr)
     * @param {boolean} options.featured - Whether to get featured testimonials only
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Testimonial>>} Array of testimonials
     */
    getAllTestimonials: async (options = {}) => {
        const { language, featured = false, config = {} } = options;
        const params = {};
        if (language) params.language = language;
        if (featured) params.featured = true;

        return httpClient.get(ENDPOINTS.BASE, params, config);
    },

    /**
     * Get featured testimonials
     * @param {Object} options - Request options
     * @param {string} options.language - Language for content
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Testimonial>>} Array of featured testimonials
     */
    getFeaturedTestimonials: async (options = {}) => {
        const { language, config = {} } = options;
        const params = { featured: true };
        if (language) params.language = language;

        return httpClient.get(ENDPOINTS.BASE, params, config);
    },

    /**
     * Get testimonials by language
     * @param {string} language - Language code (en, rw, fr)
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Testimonial>>} Array of testimonials
     */
    getTestimonialsByLanguage: async (language, options = {}) => {
        const { config = {} } = options;
        const params = { language };

        return httpClient.get(ENDPOINTS.BASE, params, config);
    },

    /**
     * Get testimonial by ID
     * @param {number} id - Testimonial ID
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Testimonial>} Testimonial details
     */
    getTestimonialById: async (id, options = {}) => {
        const { config = {} } = options;

        return httpClient.get(`${ENDPOINTS.BASE}/${id}`, {}, config);
    },

    /**
     * Create new testimonial
     * @param {Testimonial} testimonialData - Testimonial data
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Testimonial>} Created testimonial
     */
    createTestimonial: async (testimonialData, options = {}) => {
        const { config = {} } = options;

        return httpClient.post(ENDPOINTS.BASE, testimonialData, config);
    },

    /**
     * Update testimonial
     * @param {number} id - Testimonial ID
     * @param {Testimonial} testimonialData - Updated testimonial data
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Testimonial>} Updated testimonial
     */
    updateTestimonial: async (id, testimonialData, options = {}) => {
        const { config = {} } = options;

        return httpClient.put(`${ENDPOINTS.BASE}/${id}`, testimonialData, config);
    },

    /**
     * Delete testimonial
     * @param {number} id - Testimonial ID
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<void>}
     */
    deleteTestimonial: async (id, options = {}) => {
        const { config = {} } = options;

        return httpClient.delete(`${ENDPOINTS.BASE}/${id}`, config);
    },

    /**
     * Approve testimonial
     * @param {number} id - Testimonial ID
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Testimonial>} Approved testimonial
     */
    approveTestimonial: async (id, options = {}) => {
        const { config = {} } = options;

        return httpClient.put(`${ENDPOINTS.BASE}/${id}/approve`, {}, config);
    },

    /**
     * Reject testimonial
     * @param {number} id - Testimonial ID
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<void>}
     */
    rejectTestimonial: async (id, options = {}) => {
        const { config = {} } = options;

        return httpClient.put(`${ENDPOINTS.BASE}/${id}/reject`, {}, config);
    },

    /**
     * Verify testimonial
     * @param {number} id - Testimonial ID
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Testimonial>} Verified testimonial
     */
    verifyTestimonial: async (id, options = {}) => {
        const { config = {} } = options;

        return httpClient.put(`${ENDPOINTS.BASE}/${id}/verify`, {}, config);
    },

    /**
     * Feature testimonial
     * @param {number} id - Testimonial ID
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Testimonial>} Featured testimonial
     */
    featureTestimonial: async (id, options = {}) => {
        const { config = {} } = options;

        return httpClient.put(`${ENDPOINTS.BASE}/${id}/feature`, {}, config);
    },

    /**
     * Unfeature testimonial
     * @param {number} id - Testimonial ID
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Testimonial>} Unfeatured testimonial
     */
    unfeatureTestimonial: async (id, options = {}) => {
        const { config = {} } = options;

        return httpClient.put(`${ENDPOINTS.BASE}/${id}/unfeature`, {}, config);
    },

    /**
     * Upload avatar for testimonial
     * @param {number} id - Testimonial ID
     * @param {File} file - Avatar file
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Testimonial>} Updated testimonial with avatar
     */
    uploadAvatar: async (id, file, options = {}) => {
        const { config = {} } = options;

        return httpClient.upload(`${ENDPOINTS.BASE}/${id}/avatar`, file, null, config);
    },

    /**
     * Get avatar URL
     * @param {number} id - Testimonial ID
     * @returns {string} Avatar URL
     */
    getAvatarUrl: (id) => `${ENDPOINTS.AVATAR.replace('{id}', id)}`,

    /**
     * Get pending testimonials
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Testimonial>>} Array of pending testimonials
     */
    getPendingTestimonials: async (options = {}) => {
        const { config = {} } = options;

        return httpClient.get(ENDPOINTS.PENDING, {}, config);
    },

    /**
     * Search testimonials
     * @param {string} searchTerm - Search term
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Testimonial>>} Array of matching testimonials
     */
    searchTestimonials: async (searchTerm, options = {}) => {
        const { config = {} } = options;
        const params = { q: searchTerm };

        return httpClient.get(ENDPOINTS.SEARCH, params, config);
    },

    /**
     * Get testimonials with pagination
     * @param {Object} options - Request options
     * @param {number} options.page - Page number (0-based)
     * @param {number} options.size - Page size
     * @param {string} options.language - Language for content
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Object>} Paginated testimonials
     */
    getTestimonialsWithPagination: async (options = {}) => {
        const { page = 0, size = 10, language, config = {} } = options;
        const params = { page, size };
        if (language) params.language = language;

        return httpClient.get(ENDPOINTS.PAGE, params, config);
    },

    /**
     * Get testimonials statistics
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Object>} Testimonials statistics
     */
    getStatistics: async (options = {}) => {
        const { config = {} } = options;

        return httpClient.get(ENDPOINTS.STATISTICS, {}, config);
    },
};

/**
 * Hook for getting all testimonials
 * @param {Object} options - Hook options
 * @param {string} options.language - Language for content
 * @param {boolean} options.featured - Whether to get featured testimonials only
 * @param {boolean} options.enabled - Whether to execute the request
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and functions
 */
export const useTestimonials = (options = {}) => {
    const { language, featured = false, enabled = true, onSuccess, onError } = options;
    const params = { language, featured };

    return useGet(ENDPOINTS.BASE, params, {
        enabled,
        onSuccess,
        onError,
    });
};

/**
 * Hook for getting featured testimonials
 * @param {Object} options - Hook options
 * @param {string} options.language - Language for content
 * @param {boolean} options.enabled - Whether to execute the request
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and functions
 */
export const useFeaturedTestimonials = (options = {}) => {
    const { language, enabled = true, onSuccess, onError } = options;
    const params = { language, featured: true };

    return useGet(ENDPOINTS.BASE, params, {
        enabled,
        onSuccess,
        onError,
    });
};

/**
 * Hook for getting a testimonial by ID
 * @param {number} id - Testimonial ID
 * @param {Object} options - Hook options
 * @param {boolean} options.enabled - Whether to execute the request
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and functions
 */
export const useTestimonial = (id, options = {}) => {
    const { enabled = true, onSuccess, onError } = options;

    return useGet(`${ENDPOINTS.BASE}/${id}`, {}, {
        enabled: enabled && !!id,
        onSuccess,
        onError,
    });
};

/**
 * Hook for creating a testimonial
 * @param {Object} options - Hook options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and functions
 */
export const useCreateTestimonial = (options = {}) => {
    const { onSuccess, onError } = options;

    return usePost(ENDPOINTS.BASE, {
        onSuccess,
        onError,
    });
};

/**
 * Hook for updating a testimonial
 * @param {number} id - Testimonial ID
 * @param {Object} options - Hook options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and functions
 */
export const useUpdateTestimonial = (id, options = {}) => {
    const { onSuccess, onError } = options;

    return usePut(`${ENDPOINTS.BASE}/${id}`, {
        onSuccess,
        onError,
    });
};

/**
 * Hook for deleting a testimonial
 * @param {number} id - Testimonial ID
 * @param {Object} options - Hook options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and functions
 */
export const useDeleteTestimonial = (id, options = {}) => {
    const { onSuccess, onError } = options;

    return useDelete(`${ENDPOINTS.BASE}/${id}`, {
        onSuccess,
        onError,
    });
};

/**
 * Hook for approving a testimonial
 * @param {number} id - Testimonial ID
 * @param {Object} options - Hook options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and functions
 */
export const useApproveTestimonial = (id, options = {}) => {
    const { onSuccess, onError } = options;

    return usePut(`${ENDPOINTS.BASE}/${id}/approve`, {
        onSuccess,
        onError,
    });
};

/**
 * Hook for rejecting a testimonial
 * @param {number} id - Testimonial ID
 * @param {Object} options - Hook options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and functions
 */
export const useRejectTestimonial = (id, options = {}) => {
    const { onSuccess, onError } = options;

    return usePut(`${ENDPOINTS.BASE}/${id}/reject`, {
        onSuccess,
        onError,
    });
};

/**
 * Hook for verifying a testimonial
 * @param {number} id - Testimonial ID
 * @param {Object} options - Hook options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and functions
 */
export const useVerifyTestimonial = (id, options = {}) => {
    const { onSuccess, onError } = options;

    return usePut(`${ENDPOINTS.BASE}/${id}/verify`, {
        onSuccess,
        onError,
    });
};

/**
 * Hook for featuring a testimonial
 * @param {number} id - Testimonial ID
 * @param {Object} options - Hook options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and functions
 */
export const useFeatureTestimonial = (id, options = {}) => {
    const { onSuccess, onError } = options;

    return usePut(`${ENDPOINTS.BASE}/${id}/feature`, {
        onSuccess,
        onError,
    });
};

/**
 * Hook for unfeaturing a testimonial
 * @param {number} id - Testimonial ID
 * @param {Object} options - Hook options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and functions
 */
export const useUnfeatureTestimonial = (id, options = {}) => {
    const { onSuccess, onError } = options;

    return usePut(`${ENDPOINTS.BASE}/${id}/unfeature`, {
        onSuccess,
        onError,
    });
};

/**
 * Hook for uploading avatar
 * @param {number} id - Testimonial ID
 * @param {Object} options - Hook options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and functions
 */
export const useUploadAvatar = (id, options = {}) => {
    const { onSuccess, onError } = options;

    return useUpload(`${ENDPOINTS.BASE}/${id}/avatar`, {
        onSuccess,
        onError,
    });
};

/**
 * Hook for searching testimonials
 * @param {string} searchTerm - Search term
 * @param {Object} options - Hook options
 * @param {boolean} options.enabled - Whether to execute the request
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and functions
 */
export const useSearchTestimonials = (searchTerm, options = {}) => {
    const { enabled = true, onSuccess, onError } = options;
    const params = { q: searchTerm };

    return useGet(ENDPOINTS.SEARCH, params, {
        enabled: enabled && !!searchTerm,
        onSuccess,
        onError,
    });
};

/**
 * Hook for getting testimonials statistics
 * @param {Object} options - Hook options
 * @param {boolean} options.enabled - Whether to execute the request
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and functions
 */
export const useTestimonialsStatistics = (options = {}) => {
    const { enabled = true, onSuccess, onError } = options;

    return useGet(ENDPOINTS.STATISTICS, {}, {
        enabled,
        onSuccess,
        onError,
    });
};

export default testimonialsApi;
