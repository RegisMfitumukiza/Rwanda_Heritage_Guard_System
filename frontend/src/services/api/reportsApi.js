import httpClient from './httpClient';

/**
 * Reports API Service
 * Provides access to report generation and management
 */

// API endpoints
const ENDPOINTS = {
    GENERATE: '/api/admin/reports/generate',
    QUICK: '/api/admin/reports/quick',
    FILTER_OPTIONS: '/api/admin/reports/filter-options'
};

/**
 * Main reports API object
 */
export const reportsApi = {
    /**
     * Generate comprehensive report with 3 filters
     */
    generateReport: async (filters) => {
        const { siteStatus, artifactAuthStatus, mediaType } = filters;
        
        const queryParams = new URLSearchParams({
            siteStatus,
            artifactAuthStatus,
            mediaType
        });

        return httpClient.post(`${ENDPOINTS.GENERATE}?${queryParams.toString()}`);
    },

    /**
     * Generate quick report with default filters
     */
    generateQuickReport: async () => {
        return httpClient.get(ENDPOINTS.QUICK);
    },

    /**
     * Get available filter options
     */
    getFilterOptions: async () => {
        return httpClient.get(ENDPOINTS.FILTER_OPTIONS);
    }
};


