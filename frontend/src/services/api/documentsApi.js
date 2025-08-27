import httpClient from './httpClient';

/**
 * Documents API Service
 * Comprehensive service for managing heritage site documents with version control
 */

// API Endpoints
const ENDPOINTS = {
    BASE: '/api/site-documents',
    UPLOAD: '/api/site-documents/upload', // Will use with siteId parameter
    DOWNLOAD: '/api/site-documents/download', // Will use with document id parameter
    CREATE: '/api/site-documents',
    UPDATE: '/api/site-documents', // Will use with document id parameter
    DELETE: '/api/site-documents', // Will use with document id parameter
};

// Supported file types (matching backend validation)
const SUPPORTED_FILE_TYPES = {
    'application/pdf': { extension: '.pdf', name: 'PDF Document', maxSize: 50 * 1024 * 1024 },
    'application/msword': { extension: '.doc', name: 'Word Document (Legacy)', maxSize: 25 * 1024 * 1024 },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
        extension: '.docx', name: 'Word Document', maxSize: 25 * 1024 * 1024
    },
    'text/plain': { extension: '.txt', name: 'Text File', maxSize: 5 * 1024 * 1024 },
    'application/rtf': { extension: '.rtf', name: 'Rich Text Format', maxSize: 10 * 1024 * 1024 }
};

// Document categories
const DOCUMENT_CATEGORIES = {
    HISTORICAL: 'Historical Records',
    ARCHAEOLOGICAL: 'Archaeological Reports',
    ARCHITECTURAL: 'Architectural Plans',
    CONSERVATION: 'Conservation Reports',
    RESEARCH: 'Research Papers',
    LEGAL: 'Legal Documents',
    ADMINISTRATIVE: 'Administrative Records',
    MEDIA: 'Media Coverage',
    OTHER: 'Other Documents'
};

const documentsApi = {
    /**
     * Get all documents
     */
    getAllDocuments: async (options = {}) => {
        const { page = 0, size = 20, sort, config = {} } = options;
        const params = { page, size };
        if (sort) params.sort = sort;
        return httpClient.get(ENDPOINTS.BASE, params, config);
    },

    /**
     * Get document by ID
     */
    getDocumentById: async (id, options = {}) => {
        return httpClient.get(`${ENDPOINTS.BASE}/${id}`, {}, options.config);
    },

    /**
     * Upload document file with metadata
     */
    uploadDocument: async (siteId, file, metadata = {}, onProgress = null, options = {}) => {
        // Validate file type
        if (!SUPPORTED_FILE_TYPES[file.type]) {
            throw new Error(`Unsupported file type: ${file.type}`);
        }

        // Validate file size
        const typeConfig = SUPPORTED_FILE_TYPES[file.type];
        if (file.size > typeConfig.maxSize) {
            throw new Error(`File size exceeds maximum allowed for ${typeConfig.name}`);
        }

        // Create FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('description', metadata.description || '');
        formData.append('category', metadata.category || 'OTHER');
        formData.append('uploadDate', metadata.uploadDate || new Date().toISOString().split('T')[0]);
        formData.append('isPublic', metadata.isPublic !== undefined ? metadata.isPublic : true);
        if (metadata.language) formData.append('language', metadata.language);

        return httpClient.upload(`${ENDPOINTS.UPLOAD}/${siteId}`, file, onProgress, options.config);
    },

    /**
     * Update document metadata
     */
    updateDocument: async (id, updates, options = {}) => {
        return httpClient.put(`${ENDPOINTS.BASE}/${id}`, updates, options.config);
    },

    /**
     * Download document file
     */
    downloadDocument: async (id, options = {}) => {
        return httpClient.download(`${ENDPOINTS.DOWNLOAD}/${id}`, null, options.config);
    },

    /**
     * Delete document
     */
    deleteDocument: async (id, options = {}) => {
        return httpClient.delete(`${ENDPOINTS.BASE}/${id}`, options.config);
    },

    // Utility methods
    getSupportedFileTypes: () => SUPPORTED_FILE_TYPES,
    getDocumentCategories: () => DOCUMENT_CATEGORIES,

    /**
     * Validate file for upload
     */
    validateFile: (file) => {
        const errors = [];

        if (!file) {
            errors.push('No file selected');
            return { valid: false, errors };
        }

        if (!SUPPORTED_FILE_TYPES[file.type]) {
            errors.push(`Unsupported file type: ${file.type}`);
        } else {
            const typeConfig = SUPPORTED_FILE_TYPES[file.type];
            if (file.size > typeConfig.maxSize) {
                errors.push(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum (${(typeConfig.maxSize / 1024 / 1024).toFixed(2)}MB)`);
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            fileInfo: SUPPORTED_FILE_TYPES[file.type]
        };
    },

    /**
     * Create document
     * @param {Object} documentData - Document data
     * @param {Object} options - Request options
     * @returns {Promise} Created document
     */
    createDocument: async (documentData, options = {}) => {
        return httpClient.post(ENDPOINTS.CREATE, documentData, options.config);
    },

    /**
     * Update document
     * @param {string|number} id - Document ID
     * @param {Object} documentData - Updated document data
     * @param {Object} options - Request options
     * @returns {Promise} Updated document
     */
    updateDocument: async (id, documentData, options = {}) => {
        return httpClient.put(`${ENDPOINTS.UPDATE}/${id}`, documentData, options.config);
    },

    /**
     * Delete document
     * @param {string|number} id - Document ID
     * @param {Object} options - Request options
     * @returns {Promise} Deletion result
     */
    deleteDocument: async (id, options = {}) => {
        return httpClient.delete(`${ENDPOINTS.DELETE}/${id}`, options.config);
    },

    /**
     * Get document statistics
     * @param {Object} options - Request options
     * @returns {Promise} Document statistics
     */
    getDocumentStatistics: async (options = {}) => {
        return httpClient.get(`${ENDPOINTS.BASE}/statistics`, {}, options.config);
    },

    /**
     * Search documents
     * @param {string} query - Search query
     * @param {Object} filters - Search filters
     * @param {Object} options - Request options
     * @returns {Promise} Search results
     */
    searchDocuments: async (query, filters = {}, options = {}) => {
        const { page = 0, size = 20, sort, config = {} } = options;
        const params = {
            q: query,
            ...filters
        };
        params.page = page; params.size = size; if (sort) params.sort = sort;
        return httpClient.get(`${ENDPOINTS.BASE}/search`, params, config);
    },

    /**
     * Get documents by site
     * @param {string|number} siteId - Heritage site ID
     * @param {Object} options - Request options
     * @returns {Promise} Site documents
     */
    getDocumentsBySite: async (siteId, options = {}) => {
        return httpClient.get(`${ENDPOINTS.BASE}/site/${siteId}`, {}, options.config);
    },

    /**
     * Format file size for display
     */
    formatFileSize: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};

export default documentsApi;