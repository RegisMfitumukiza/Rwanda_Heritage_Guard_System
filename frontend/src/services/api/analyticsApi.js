import httpClient from './httpClient';

/**
 * Analytics API Service
 * 
 * Comprehensive analytics service for heritage platform data visualization:
 * - Site statistics and metrics
 * - Document analytics and trends
 * - User activity monitoring
 * - Performance metrics
 * - Export capabilities
 */

// API Endpoints
const ENDPOINTS = {
    OVERVIEW: '/api/analytics/overview',
    SITES: '/api/analytics/sites',
    DOCUMENTS: '/api/analytics/documents',
    USERS: '/api/analytics/users',
    TRENDS: '/api/analytics/trends',
    EXPORT: '/api/analytics/export',
    CURRENT: '/api/analytics/current'
};



/**
 * Analytics Data Structure
 * @typedef {Object} AnalyticsOverview
 * @property {Object} sites - Site statistics
 * @property {Object} documents - Document statistics
 * @property {Object} users - User statistics
 * @property {Object} activity - Activity metrics
 * @property {Array} trends - Trend data
 * @property {string} lastUpdated - Last update timestamp
 */

const analyticsApi = {
    /**
     * Get analytics overview
     * @param {Object} options - Request options
     * @returns {Promise<AnalyticsOverview>} Overview analytics
     */
    getOverview: async (options = {}) => {
        const response = await httpClient.get(ENDPOINTS.OVERVIEW, {}, options);
        return response;
    },

    /**
     * Get site analytics
     * @param {Object} filters - Analytics filters
     * @param {Object} options - Request options
     * @returns {Promise<Object>} Site analytics data
     */
    getSiteAnalytics: async (filters = {}, options = {}) => {
        const response = await httpClient.get(ENDPOINTS.SITES, filters, options);
        return response;
    },

    /**
     * Get document analytics
     * @param {Object} filters - Analytics filters
     * @param {Object} options - Request options
     * @returns {Promise<Object>} Document analytics data
     */
    getDocumentAnalytics: async (filters = {}, options = {}) => {
        const response = await httpClient.get(ENDPOINTS.DOCUMENTS, filters, options);
        return response;
    },

    /**
     * Get user analytics
     * @param {Object} filters - Analytics filters
     * @param {Object} options - Request options
     * @returns {Promise<Object>} User analytics data
     */
    getUserAnalytics: async (filters = {}, options = {}) => {
        const response = await httpClient.get(ENDPOINTS.USERS, filters, options);
        return response;
    },

    /**
* Get current analytics
* @param {Object} options - Request options
* @returns {Promise<Object>} Current analytics data
*/
    getCurrentAnalytics: async (options = {}) => {
        const response = await httpClient.get(ENDPOINTS.CURRENT, {}, options);
        return response;
    },

    /**
     * Export analytics data
     * @param {string} type - Export type ('csv', 'pdf', 'excel')
     * @param {Object} filters - Data filters
     * @param {Object} options - Request options
     * @returns {Promise<Blob>} Export file
     */
    exportAnalytics: async (type = 'json', filters = {}, options = {}) => {
        const response = await httpClient.get(ENDPOINTS.EXPORT, { type, ...filters }, {
            ...options,
            responseType: 'blob'
        });
        return response;
    },

    /**
     * Get analytics filters
     * @returns {Object} Available filters
     */
    getAvailableFilters: () => {
        return {
            dateRanges: [
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' },
                { value: 'quarter', label: 'This Quarter' },
                { value: 'year', label: 'This Year' },
                { value: 'custom', label: 'Custom Range' }
            ],
            categories: [
                { value: 'all', label: 'All Categories' },
                { value: 'sites', label: 'Heritage Sites' },
                { value: 'documents', label: 'Documents' },
                { value: 'users', label: 'Users' },
                { value: 'activity', label: 'Activity' }
            ],
            regions: [
                { value: 'all', label: 'All Regions' },
                { value: 'kigali', label: 'Kigali' },
                { value: 'northern', label: 'Northern Province' },
                { value: 'southern', label: 'Southern Province' },
                { value: 'eastern', label: 'Eastern Province' },
                { value: 'western', label: 'Western Province' }
            ]
        };
    },

    /**
     * Calculate growth rate
     * @param {number} current - Current value
     * @param {number} previous - Previous value
     * @returns {number} Growth percentage
     */
    calculateGrowthRate: (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    },

    /**
     * Format number for display
     * @param {number} number - Number to format
     * @param {string} type - Format type ('compact', 'full', 'percentage')
     * @returns {string} Formatted number
     */
    formatNumber: (number, type = 'compact') => {
        switch (type) {
            case 'compact':
                if (number >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
                if (number >= 1000) return `${(number / 1000).toFixed(1)}K`;
                return number.toString();
            case 'percentage':
                return `${number.toFixed(1)}%`;
            case 'full':
            default:
                return number.toLocaleString();
        }
    },

    /**
     * Get chart colors for consistent theming
     * @returns {Object} Chart color schemes
     */
    getChartColors: () => {
        return {
            primary: ['#3B82F6', '#1D4ED8', '#1E40AF', '#1E3A8A'],
            secondary: ['#10B981', '#059669', '#047857', '#065F46'],
            accent: ['#F59E0B', '#D97706', '#B45309', '#92400E'],
            neutral: ['#6B7280', '#4B5563', '#374151', '#1F2937'],
            heritage: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6'],
            gradient: {
                primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                warning: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
            }
        };
    }
};

// React hooks for analytics
import { useGet } from '../../hooks/useSimpleApi';

/**
 * Hook for getting analytics overview
 * @param {Object} options - Hook options
 * @returns {Object} Hook state and data
 */
export const useAnalytics = (options = {}) => {
    return useGet(ENDPOINTS.OVERVIEW, {}, {
        ...options,
        onSuccess: (data) => {
            console.log('useAnalytics: Data loaded successfully:', data);
            if (options.onSuccess) options.onSuccess(data);
        },
        onError: (error) => {
            console.error('useAnalytics: Error loading analytics:', error);
            if (options.onError) options.onError(error);
        }
    });
};

export default analyticsApi;




