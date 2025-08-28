import httpClient from './httpClient';

/**
 * Reports API Service
 * Provides access to report generation and management
 */

// API endpoints - UPDATED to match backend
const ENDPOINTS = {
    AVAILABLE_FILTERS: '/api/admin/reports/available-filters',
    TEMPLATES: '/api/admin/reports/templates',
    GENERATE_PDF: '/api/admin/reports/generate-pdf',
    GENERATE_FROM_TEMPLATE: (templateId) => `/api/admin/reports/templates/${templateId}`
};

/**
 * Main reports API object
 */
export const reportsApi = {
    /**
     * Get available filter options for frontend
     */
    getAvailableFilters: async () => {
        return httpClient.get(ENDPOINTS.AVAILABLE_FILTERS);
    },

    /**
     * Get report templates
     */
    getReportTemplates: async () => {
        return httpClient.get(ENDPOINTS.TEMPLATES);
    },

    /**
     * Generate PDF report with custom filters
     */
    generatePdfReport: async (filters) => {
        return httpClient.post(ENDPOINTS.GENERATE_PDF, filters, {
            responseType: 'blob' // Important for PDF binary data
        });
    },

    /**
     * Generate report from template
     */
    generateFromTemplate: async (templateId, filters) => {
        return httpClient.post(ENDPOINTS.GENERATE_FROM_TEMPLATE(templateId), filters);
    }
};

export default reportsApi;