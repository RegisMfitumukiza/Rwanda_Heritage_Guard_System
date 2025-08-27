import httpClient from './httpClient';

/**
 * Heritage Sites API Service
 * Provides comprehensive access to heritage site operations
 * Now uses the unified httpClient for consistent error handling and automatic caching
 */

// API endpoints
const ENDPOINTS = {
    SITES: '/api/heritage-sites',
    SITE_BY_ID: (id) => `/api/heritage-sites/${id}`,
    SITE_STATISTICS: '/api/heritage-sites/statistics',
    SITE_STATUS_CHANGES: '/api/heritage-sites/status/changes',
    SITE_TRENDS: '/api/heritage-sites/trends',
    SITE_SEARCH: '/api/heritage-sites/search',
    SITE_BY_REGION: (region) => `/api/heritage-sites/region/${region}`,
    SITE_BY_CATEGORY: (category) => `/api/heritage-sites/category/${category}`,
    SITE_BY_NAME: (name) => `/api/heritage-sites/name/${name}`,
    SITE_FEATURED: '/api/heritage-sites/featured',
    SITE_ACTIVE: '/api/heritage-sites/active',
    SITE_CONSERVATION: '/api/heritage-sites/conservation',
    SITE_PROPOSED: '/api/heritage-sites/proposed'
};

/**
 * Main heritage sites API object
 */
export const heritageSitesApi = {
    /**
     * Get all heritage sites with pagination and filtering
     */
    getAllSites: async (params = {}) => {
        const {
            page = 0,
            size = 20,
            sort = 'nameEn,asc',
            status,
            category,
            region,
            featured,
            language,
            search,
            ...otherParams
        } = params;

        const queryParams = {
            page,
            size,
            sort,
            ...(status && { status }),
            ...(category && { category }),
            ...(region && { region }),
            ...(featured !== undefined && { featured }),
            ...(language && { language }),
            ...(search && { search }),
            ...otherParams
        };

        return httpClient.get(ENDPOINTS.SITES, queryParams);
    },

    /**
     * Get a single heritage site by ID
     */
    getSiteById: async (id, params = {}) => {
        return httpClient.get(ENDPOINTS.SITE_BY_ID(id), params);
    },

    /**
     * Create a new heritage site
     */
    createSite: async (siteData) => {
        return httpClient.post(ENDPOINTS.SITES, siteData);
    },

    /**
     * Update an existing heritage site
     */
    updateSite: async (id, siteData) => {
        return httpClient.put(ENDPOINTS.SITE_BY_ID(id), siteData);
    },

    /**
     * Delete a heritage site
     */
    deleteSite: async (id) => {
        return httpClient.delete(ENDPOINTS.SITE_BY_ID(id));
    },

    /**
     * Get heritage site statistics
     */
    getSiteStatistics: async (params = {}) => {
        return httpClient.get(ENDPOINTS.SITE_STATISTICS, params);
    },

    /**
     * Get recent status changes
     */
    getStatusChanges: async (params = {}) => {
        return httpClient.get(ENDPOINTS.SITE_STATUS_CHANGES, params);
    },

    /**
     * Get trend data for heritage sites
     */
    getTrendData: async (params = {}) => {
        return httpClient.get(ENDPOINTS.SITE_TRENDS, params);
    },

    /**
     * Search heritage sites
     */
    searchSites: async (searchParams = {}) => {
        return httpClient.get(ENDPOINTS.SITE_SEARCH, searchParams);
    },

    /**
     * Get sites by region
     */
    getSitesByRegion: async (region, params = {}) => {
        return httpClient.get(ENDPOINTS.SITE_BY_REGION(region), params);
    },

    /**
     * Get sites by category
     */
    getSitesByCategory: async (category, params = {}) => {
        return httpClient.get(ENDPOINTS.SITE_BY_CATEGORY(category), params);
    },

    /**
     * Get sites by name
     */
    getSitesByName: async (name, params = {}) => {
        return httpClient.get(ENDPOINTS.SITE_BY_NAME(name), params);
    },

    /**
     * Get featured sites
     */
    getFeaturedSites: async (params = {}) => {
        return httpClient.get(ENDPOINTS.SITE_FEATURED, params);
    },

    /**
     * Get active sites
     */
    getActiveSites: async (params = {}) => {
        return httpClient.get(ENDPOINTS.SITE_ACTIVE, params);
    },

    /**
     * Get sites under conservation
     */
    getConservationSites: async (params = {}) => {
        return httpClient.get(ENDPOINTS.SITE_CONSERVATION, params);
    },

    /**
     * Get proposed sites
     */
    getProposedSites: async (params = {}) => {
        return httpClient.get(ENDPOINTS.SITE_PROPOSED, params);
    },

    /**
     * Update site status
     */
    updateSiteStatus: async (id, statusData) => {
        return httpClient.patch(`${ENDPOINTS.SITE_BY_ID(id)}/status`, statusData);
    },

    /**
     * Upload site images
     */
    uploadSiteImages: async (id, images) => {
        const formData = new FormData();
        images.forEach((image, index) => {
            formData.append(`images`, image);
        });

        return httpClient.upload(`${ENDPOINTS.SITE_BY_ID(id)}/images`, formData);
    },

    /**
     * Get site media
     */
    getSiteMedia: async (id, params = {}) => {
        return httpClient.get(`${ENDPOINTS.SITE_BY_ID(id)}/media`, params);
    }
};

/**
 * React Query hooks for easy integration
 * These now use the new useSimpleApi system internally
 */
export const useHeritageSites = (options = {}) => {
    // Import here to avoid circular dependencies
    const { useGet } = require('../../hooks/useSimpleApi');

    const {
        language,
        page = 0,
        size = 20,
        sort = 'nameEn,asc',
        status,
        category,
        region,
        featured,
        search,
        enabled = true,
        onSuccess,
        onError,
        ...otherOptions
    } = options;

    const queryParams = {
        page,
        size,
        sort,
        ...(language && { language }),
        ...(status && { status }),
        ...(category && { category }),
        ...(region && { region }),
        ...(featured !== undefined && { featured }),
        ...(search && { search })
    };

    return useGet(ENDPOINTS.SITES, queryParams, {
        enabled,
        onSuccess: (data) => {
            // Handle both old PageResponse and new PagedResponse formats
            const normalizedData = data.content ? data : { content: data.items || data, ...data };
            if (onSuccess) onSuccess(normalizedData);
        },
        onError,
        ...otherOptions
    });
};

export const useHeritageSitesSearch = (searchParams = {}, options = {}) => {
    const { useGet } = require('../../hooks/useSimpleApi');

    return useGet(ENDPOINTS.SITE_SEARCH, searchParams, {
        onSuccess: (data) => {
            // Handle both old PageResponse and new PagedResponse formats
            const normalizedData = data.content ? data : { content: data.items || data, ...data };
            console.log('Heritage sites search results:', normalizedData);
            if (options.onSuccess) options.onSuccess(normalizedData);
        },
        onError: (error) => {
            console.error('Failed to search heritage sites:', error);
            if (options.onError) options.onError(error);
        },
        ...options
    });
};

export const useHeritageSitesByName = (searchTerm, options = {}) => {
    const { useGet } = require('../../hooks/useSimpleApi');

    return useGet(ENDPOINTS.SITE_BY_NAME(searchTerm), {}, {
        enabled: !!searchTerm,
        onSuccess: (data) => console.log('Heritage sites by name loaded:', data),
        onError: (error) => console.error('Failed to load heritage sites by name:', error),
        ...options
    });
};

export const useHeritageSitesByRegion = (region, options = {}) => {
    const { useGet } = require('../../hooks/useSimpleApi');

    return useGet(ENDPOINTS.SITE_BY_REGION(region), {}, {
        enabled: !!region,
        onSuccess: (data) => console.log('Heritage sites by region loaded:', data),
        onError: (error) => console.error('Failed to load heritage sites by region:', error),
        ...options
    });
};

export const useHeritageSitesByCategory = (category, options = {}) => {
    const { useGet } = require('../../hooks/useSimpleApi');

    return useGet(ENDPOINTS.SITE_BY_CATEGORY(category), {}, {
        enabled: !!category,
        onSuccess: (data) => console.log('Heritage sites by category loaded:', data),
        onError: (error) => console.error('Failed to load heritage sites by category:', error),
        ...options
    });
};
