import httpClient from './httpClient';

/**
 * Artifacts API Service
 * Comprehensive service for artifact documentation, authentication, and management
 * with multilingual support, media management, authentication records, and provenance tracking
 * Leverages the robust httpClient service for consistent error handling and automatic caching
 */

// API Endpoints
const ENDPOINTS = {
    // Artifact management endpoints
    ARTIFACTS: '/api/artifacts',
    ARTIFACT_SEARCH: '/api/artifacts/search',
    ARTIFACT_SEARCH_NAME: '/api/artifacts/search/name',
    ARTIFACT_SEARCH_LOCATION: '/api/artifacts/search/location',
    ARTIFACT_FILTER_CATEGORY: '/api/artifacts/filter/category',
    ARTIFACT_FILTER_PERIOD: '/api/artifacts/filter/period',
    ARTIFACT_FILTER_CONDITION: '/api/artifacts/filter/condition',
    ARTIFACT_FILTER_SITE: '/api/artifacts/filter/site',
    ARTIFACT_FILTER_ACQUISITION: '/api/artifacts/filter/acquisition-method',
    ARTIFACT_FILTER_AUTH_STATUS: '/api/artifacts/filter/authentication-status',

    // Artifact statistics endpoints
    ARTIFACT_STATISTICS: '/api/artifacts/statistics',
    ARTIFACT_STATS_CATEGORY: '/api/artifacts/statistics/category',
    ARTIFACT_STATS_PERIOD: '/api/artifacts/statistics/period',
    ARTIFACT_STATS_CONDITION: '/api/artifacts/statistics/condition',
    ARTIFACT_STATS_ACQUISITION: '/api/artifacts/statistics/acquisition-method',
    ARTIFACT_FEATURED: '/api/artifacts/featured',

    // Artifact media endpoints
    ARTIFACT_MEDIA: '/api/artifacts/{artifactId}/media',
    ARTIFACT_MEDIA_UPLOAD: '/api/artifacts/{artifactId}/media/upload',
    ARTIFACT_MEDIA_DOWNLOAD: '/api/artifacts/{artifactId}/media/{mediaId}/download',
    ARTIFACT_MEDIA_ITEM: '/api/artifacts/{artifactId}/media/{mediaId}',
    ARTIFACT_MEDIA_FILE: '/api/artifacts/{artifactId}/media/{mediaId}/file',

    // Artifact authentication endpoints
    ARTIFACT_AUTHENTICATIONS: '/api/artifacts/{artifactId}/authentications',
    ARTIFACT_AUTH_UPLOAD: '/api/artifacts/{artifactId}/authentications/upload',
    ARTIFACT_AUTH_ITEM: '/api/artifacts/{artifactId}/authentications/{authId}',
    ARTIFACT_AUTH_DOCUMENT: '/api/artifacts/{artifactId}/authentications/{authId}/document',

    // Provenance record endpoints
    ARTIFACT_PROVENANCE: '/api/artifacts/{artifactId}/provenance',
    ARTIFACT_PROVENANCE_UPLOAD: '/api/artifacts/{artifactId}/provenance/upload',
    ARTIFACT_PROVENANCE_ITEM: '/api/artifacts/{artifactId}/provenance/{recordId}',
    ARTIFACT_PROVENANCE_DOCUMENT: '/api/artifacts/{artifactId}/provenance/{recordId}/document',
};



/**
 * Artifact Data Structure
 * @typedef {Object} Artifact
 * @property {number} id - Unique identifier
 * @property {Object} name - Multilingual name {en, rw, fr}
 * @property {Object} description - Multilingual description {en, rw, fr}
 * @property {string} category - Artifact category
 * @property {string} period - Historical period
 * @property {string} physicalCharacteristics - Physical characteristics
 * @property {string} condition - Artifact condition
 * @property {string} acquisitionMethod - Acquisition method
 * @property {string} acquisitionDate - Acquisition date
 * @property {string} location - Current location
 * @property {number} heritageSiteId - Associated heritage site ID
 * @property {boolean} isPublic - Whether artifact is public
 * @property {Array<number>} mediaIds - Associated media IDs
 * @property {Array<number>} authenticationIds - Authentication record IDs
 * @property {Array<number>} provenanceRecordIds - Provenance record IDs
 * @property {string} createdBy - Creator username
 * @property {string} createdDate - Creation date
 * @property {string} updatedBy - Last updater username
 * @property {string} updatedDate - Last update date
 */

/**
 * Artifact Media Data Structure
 * @typedef {Object} ArtifactMedia
 * @property {number} id - Unique identifier
 * @property {number} artifactId - Associated artifact ID
 * @property {string} filePath - File path
 * @property {boolean} isPublic - Whether media is public
 * @property {string} description - Media description
*/

/**
 * Artifact Authentication Data Structure
 * @typedef {Object} ArtifactAuthentication
 * @property {number} id - Unique identifier
 * @property {number} artifactId - Associated artifact ID
 * @property {string} status - Authentication status (Authentic, Suspected, Fake, Pending, Inconclusive)
 * @property {string} method - Authentication method
 * @property {string} date - Authentication date
 * @property {string} expertName - Expert name
 * @property {string} documentation - Authentication documentation
 * @property {string} documentFilePath - Document file path
 * @property {string} documentFileName - Document file name
 * @property {string} uploadDate - Upload date
 * @property {string} uploadedBy - Uploader username
 * @property {string} createdBy - Creator username
 * @property {string} createdDate - Creation date
 * @property {string} updatedBy - Last updater username
 * @property {string} updatedDate - Last update date
 */

/**
 * Provenance Record Data Structure
 * @typedef {Object} ProvenanceRecord
 * @property {number} id - Unique identifier
 * @property {number} artifactId - Associated artifact ID
 * @property {string} history - Historical information
 * @property {string} eventDate - Event date
 * @property {string} previousOwner - Previous owner
 * @property {string} newOwner - New owner
 * @property {string} documentFilePath - Document file path
 */

/**
 * Search Parameters for Artifacts
 * @typedef {Object} ArtifactSearchParams
 * @property {string} searchTerm - Search by artifact name
 * @property {string} location - Search by location
 * @property {string} category - Filter by category
 * @property {string} period - Filter by period
 * @property {string} condition - Filter by condition
 * @property {number} siteId - Filter by heritage site
 * @property {string} acquisitionMethod - Filter by acquisition method
 * @property {string} authenticationStatus - Filter by authentication status
 * @property {boolean} isPublic - Filter by public status
 */

/**
 * Artifacts API Service
 */
export const artifactsApi = {
    // ==========================================
    // ARTIFACT CRUD OPERATIONS
    // ==========================================

    /**
     * Create a new artifact
     * @param {Object} artifactData - Artifact data
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Artifact>} Created artifact
     */
    createArtifact: async (artifactData, options = {}) => {
        const { config = {} } = options;

        return httpClient.post(ENDPOINTS.ARTIFACTS, artifactData, config);
    },

    /**
     * Get all artifacts (public only for unauthenticated users)
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Artifact>>} Array of artifacts
     */
    getAllArtifacts: async (options = {}) => {
        const { config = {} } = options;

        return httpClient.get(ENDPOINTS.ARTIFACTS, {}, config);
    },

    /**
     * Get artifact by ID
     * @param {number} id - Artifact ID
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Artifact>} Artifact details
     */
    getArtifactById: async (id, options = {}) => {
        const { config = {} } = options;

        return httpClient.get(`${ENDPOINTS.ARTIFACTS}/${id}`, {}, config);
    },

    /**
     * Update artifact
     * @param {number} id - Artifact ID
     * @param {Object} artifactData - Updated artifact data
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Artifact>} Updated artifact
     */
    updateArtifact: async (id, artifactData, options = {}) => {
        const { config = {} } = options;

        return httpClient.put(`${ENDPOINTS.ARTIFACTS}/${id}`, artifactData, config);
    },

    /**
     * Delete artifact
     * @param {number} id - Artifact ID
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<void>} Success confirmation
     */
    deleteArtifact: async (id, options = {}) => {
        const { config = {} } = options;

        return httpClient.delete(`${ENDPOINTS.ARTIFACTS}/${id}`, config);
    },

    // ==========================================
    // ARTIFACT SEARCH & FILTERING
    // ==========================================

    /**
     * Advanced search with multiple filter criteria
     * @param {ArtifactSearchParams} searchParams - Search parameters
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Artifact>>} Array of matching artifacts
     */
    searchArtifacts: async (searchParams = {}, options = {}) => {
        const { config = {} } = options;

        return httpClient.get(ENDPOINTS.ARTIFACT_SEARCH, searchParams, config);
    },

    /**
     * Search artifacts by name
     * @param {string} searchTerm - Search term for artifact name
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Artifact>>} Array of matching artifacts
     */
    searchArtifactsByName: async (searchTerm, options = {}) => {
        const { config = {} } = options;

        return httpClient.get(ENDPOINTS.ARTIFACT_SEARCH_NAME, { searchTerm }, config);
    },

    /**
     * Search artifacts by location
     * @param {string} location - Location to search
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Artifact>>} Array of matching artifacts
     */
    searchArtifactsByLocation: async (location, options = {}) => {
        const { config = {} } = options;

        return httpClient.get(ENDPOINTS.ARTIFACT_SEARCH_LOCATION, { location }, config);
    },

    /**
     * Filter artifacts by category
     * @param {string} category - Category to filter by
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Artifact>>} Array of artifacts in category
     */
    getArtifactsByCategory: async (category, options = {}) => {
        const { config = {} } = options;

        return httpClient.get(`${ENDPOINTS.ARTIFACT_FILTER_CATEGORY}/${category}`, {}, config);
    },

    /**
     * Filter artifacts by period
     * @param {string} period - Period to filter by
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Artifact>>} Array of artifacts from period
     */
    getArtifactsByPeriod: async (period, options = {}) => {
        const { config = {} } = options;

        return httpClient.get(`${ENDPOINTS.ARTIFACT_FILTER_PERIOD}/${period}`, {}, config);
    },

    /**
     * Filter artifacts by condition
     * @param {string} condition - Condition to filter by
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Artifact>>} Array of artifacts with condition
     */
    getArtifactsByCondition: async (condition, options = {}) => {
        const { config = {} } = options;

        return httpClient.get(`${ENDPOINTS.ARTIFACT_FILTER_CONDITION}/${condition}`, {}, config);
    },

    /**
     * Filter artifacts by heritage site
     * @param {number} siteId - Heritage site ID
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Artifact>>} Array of artifacts from site
     */
    getArtifactsBySite: async (siteId, options = {}) => {
        const { config = {} } = options;

        return httpClient.get(`${ENDPOINTS.ARTIFACT_FILTER_SITE}/${siteId}`, {}, config);
    },

    /**
     * Filter artifacts by acquisition method
     * @param {string} method - Acquisition method
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Artifact>>} Array of artifacts by acquisition method
     */
    getArtifactsByAcquisitionMethod: async (method, options = {}) => {
        const { config = {} } = options;

        return httpClient.get(`${ENDPOINTS.ARTIFACT_FILTER_ACQUISITION}/${method}`, {}, config);
    },

    /**
     * Filter artifacts by authentication status
     * @param {string} status - Authentication status
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Artifact>>} Array of artifacts by authentication status
     */
    getArtifactsByAuthenticationStatus: async (status, options = {}) => {
        const { config = {} } = options;

        return httpClient.get(`${ENDPOINTS.ARTIFACT_FILTER_AUTH_STATUS}/${status}`, {}, config);
    },

    // ==========================================
    // ARTIFACT STATISTICS
    // ==========================================

    /**
     * Get overall artifact statistics
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Object>} Overall statistics
     */
    getArtifactStatistics: async (options = {}) => {
        const { config = {} } = options;

        return httpClient.get(ENDPOINTS.ARTIFACT_STATISTICS, {}, config);
    },

    /**
     * Get artifact statistics by category
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Object>>} Category statistics
     */
    getArtifactCategoryStatistics: async (options = {}) => {
        const { config = {} } = options;

        return httpClient.get(ENDPOINTS.ARTIFACT_STATS_CATEGORY, {}, config);
    },

    /**
     * Get artifact statistics by period
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Object>>} Period statistics
     */
    getArtifactPeriodStatistics: async (options = {}) => {
        const { config = {} } = options;

        return httpClient.get(ENDPOINTS.ARTIFACT_STATS_PERIOD, {}, config);
    },

    /**
     * Get artifact statistics by condition
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Object>>} Condition statistics
     */
    getArtifactConditionStatistics: async (options = {}) => {
        const { config = {} } = options;

        return httpClient.get(ENDPOINTS.ARTIFACT_STATS_CONDITION, {}, config);
    },

    /**
     * Get artifact statistics by acquisition method
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Object>>} Acquisition method statistics
     */
    getArtifactAcquisitionStatistics: async (options = {}) => {
        const { config = {} } = options;

        return httpClient.get(ENDPOINTS.ARTIFACT_STATS_ACQUISITION, {}, config);
    },

    /**
     * Get featured artifacts for landing page display
     * @param {Object} options - Request options
     * @param {number} options.limit - Number of artifacts to return (default: 6)
     * @param {boolean} options.includeHeritageSite - Include heritage site details (default: true)
     * @param {boolean} options.includeMedia - Include media details (default: true)
     * @param {boolean} options.includeAuthentications - Include authentication details (default: false)
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Artifact>>} Array of featured artifacts
     */
    getFeaturedArtifacts: async (options = {}) => {
        const {
            limit = 6,
            includeHeritageSite = true,
            includeMedia = true,
            includeAuthentications = false,
            config = {}
        } = options;

        const params = {
            limit,
            includeHeritageSite,
            includeMedia,
            includeAuthentications
        };

        return httpClient.get(ENDPOINTS.ARTIFACT_FEATURED, params, config);
    },

    // ==========================================
    // ARTIFACT MEDIA MANAGEMENT
    // ==========================================

    /**
     * Upload media for an artifact
     * @param {number} artifactId - Artifact ID
     * @param {File} file - File to upload
     * @param {Object} metadata - Media metadata
     * @param {Object} options - Request options
     * @param {Function} options.onUploadProgress - Upload progress callback
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<ArtifactMedia>} Created media
     */
    uploadArtifactMedia: async (artifactId, file, metadata = {}, options = {}) => {
        const { onUploadProgress, config = {} } = options;
        const url = ENDPOINTS.ARTIFACT_MEDIA_UPLOAD.replace('{artifactId}', artifactId);

        const formData = new FormData();
        formData.append('documentFile', file);

        // Add metadata fields
        Object.keys(metadata).forEach(key => {
            formData.append(key, metadata[key]);
        });

        return httpClient.post(url, formData, {
            ...config,
            headers: {
                'Content-Type': 'multipart/form-data',
                ...config.headers,
            },
            onUploadProgress,
        });
    },

    /**
     * Get all media for an artifact
     * @param {number} artifactId - Artifact ID
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<ArtifactMedia>>} Array of media
     */
    getArtifactMedia: async (artifactId, options = {}) => {
        const { config = {} } = options;
        const url = ENDPOINTS.ARTIFACT_MEDIA.replace('{artifactId}', artifactId);

        return httpClient.get(url, {}, config);
    },

    /**
     * Get media metadata by ID
     * @param {number} artifactId - Artifact ID
     * @param {number} mediaId - Media ID
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<ArtifactMedia>} Media metadata
     */
    getArtifactMediaById: async (artifactId, mediaId, options = {}) => {
        const { config = {} } = options;
        const url = ENDPOINTS.ARTIFACT_MEDIA_ITEM
            .replace('{artifactId}', artifactId)
            .replace('{mediaId}', mediaId);

        return httpClient.get(url, {}, config);
    },

    /**
     * Download media file
     * @param {number} artifactId - Artifact ID
     * @param {number} mediaId - Media ID
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Blob>} File blob
     */
    downloadArtifactMedia: async (artifactId, mediaId, options = {}) => {
        const { config = {} } = options;
        const url = ENDPOINTS.ARTIFACT_MEDIA_DOWNLOAD
            .replace('{artifactId}', artifactId)
            .replace('{mediaId}', mediaId);

        return httpClient.get(url, {}, { ...config, responseType: 'blob' });
    },

    /**
     * Update media metadata
     * @param {number} artifactId - Artifact ID
     * @param {number} mediaId - Media ID
     * @param {Object} metadata - Updated metadata
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<ArtifactMedia>} Updated media
     */
    updateArtifactMedia: async (artifactId, mediaId, metadata, options = {}) => {
        const { config = {} } = options;
        const url = ENDPOINTS.ARTIFACT_MEDIA_ITEM
            .replace('{artifactId}', artifactId)
            .replace('{mediaId}', mediaId);

        return httpClient.patch(url, metadata, config);
    },

    /**
     * Replace media file
     * @param {number} artifactId - Artifact ID
     * @param {number} mediaId - Media ID
     * @param {File} file - New file
     * @param {Object} options - Request options
     * @param {Function} options.onUploadProgress - Upload progress callback
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<ArtifactMedia>} Updated media
     */
    replaceArtifactMediaFile: async (artifactId, mediaId, file, options = {}) => {
        const { onUploadProgress, config = {} } = options;
        const url = ENDPOINTS.ARTIFACT_MEDIA_FILE
            .replace('{artifactId}', artifactId)
            .replace('{mediaId}', mediaId);

        const formData = new FormData();
        formData.append('documentFile', file);

        return httpClient.put(url, formData, {
            ...config,
            headers: {
                'Content-Type': 'multipart/form-data',
                ...config.headers,
            },
            onUploadProgress,
        });
    },

    /**
     * Delete artifact media
     * @param {number} artifactId - Artifact ID
     * @param {number} mediaId - Media ID
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<void>} Success confirmation
     */
    deleteArtifactMedia: async (artifactId, mediaId, options = {}) => {
        const { config = {} } = options;
        const url = ENDPOINTS.ARTIFACT_MEDIA_ITEM
            .replace('{artifactId}', artifactId)
            .replace('{mediaId}', mediaId);

        return httpClient.delete(url, config);
    },

    // ==========================================
    // ARTIFACT AUTHENTICATION MANAGEMENT
    // ==========================================

    /**
     * Add authentication record
     * @param {number} artifactId - Artifact ID
     * @param {Object} authData - Authentication data
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<ArtifactAuthentication>} Created authentication record
     */
    addArtifactAuthentication: async (artifactId, authData, options = {}) => {
        const { config = {} } = options;
        const url = ENDPOINTS.ARTIFACT_AUTHENTICATIONS.replace('{artifactId}', artifactId);

        return httpClient.post(url, authData, config);
    },

    /**
     * Add authentication record with file upload
     * @param {number} artifactId - Artifact ID
     * @param {Object} authData - Authentication data
     * @param {File} file - Supporting document file
     * @param {Object} options - Request options
     * @param {Function} options.onUploadProgress - Upload progress callback
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<ArtifactAuthentication>} Created authentication record
     */
    addArtifactAuthenticationWithFile: async (artifactId, authData, file, options = {}) => {
        const { onUploadProgress, config = {} } = options;
        const url = ENDPOINTS.ARTIFACT_AUTH_UPLOAD.replace('{artifactId}', artifactId);

        const formData = new FormData();
        formData.append('file', file);

        // Add authentication data fields
        Object.keys(authData).forEach(key => {
            formData.append(key, authData[key]);
        });

        return httpClient.post(url, formData, {
            ...config,
            headers: {
                'Content-Type': 'multipart/form-data',
                ...config.headers,
            },
            onUploadProgress,
        });
    },

    /**
     * Get all authentication records for an artifact
     * @param {number} artifactId - Artifact ID
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<ArtifactAuthentication>>} Array of authentication records
     */
    getArtifactAuthentications: async (artifactId, options = {}) => {
        const { config = {} } = options;
        const url = ENDPOINTS.ARTIFACT_AUTHENTICATIONS.replace('{artifactId}', artifactId);

        return httpClient.get(url, {}, config);
    },

    /**
     * Get authentication record by ID
     * @param {number} artifactId - Artifact ID
     * @param {number} authId - Authentication ID
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<ArtifactAuthentication>} Authentication record
     */
    getArtifactAuthenticationById: async (artifactId, authId, options = {}) => {
        const { config = {} } = options;
        const url = ENDPOINTS.ARTIFACT_AUTH_ITEM
            .replace('{artifactId}', artifactId)
            .replace('{authId}', authId);

        return httpClient.get(url, {}, config);
    },

    /**
     * Download authentication document
     * @param {number} artifactId - Artifact ID
     * @param {number} authId - Authentication ID
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Blob>} Document blob
     */
    downloadAuthenticationDocument: async (artifactId, authId, options = {}) => {
        const { config = {} } = options;
        const url = ENDPOINTS.ARTIFACT_AUTH_DOCUMENT
            .replace('{artifactId}', artifactId)
            .replace('{authId}', authId);

        return httpClient.get(url, {}, { ...config, responseType: 'blob' });
    },

    /**
     * Delete authentication record
     * @param {number} artifactId - Artifact ID
     * @param {number} authId - Authentication ID
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<void>} Success confirmation
     */
    deleteArtifactAuthentication: async (artifactId, authId, options = {}) => {
        const { config = {} } = options;
        const url = ENDPOINTS.ARTIFACT_AUTH_ITEM
            .replace('{artifactId}', artifactId)
            .replace('{authId}', authId);

        return httpClient.delete(url, config);
    },

    // ==========================================
    // PROVENANCE RECORD MANAGEMENT
    // ==========================================

    /**
     * Add provenance record
     * @param {number} artifactId - Artifact ID
     * @param {Object} provenanceData - Provenance data
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<ProvenanceRecord>} Created provenance record
     */
    addProvenanceRecord: async (artifactId, provenanceData, options = {}) => {
        const { config = {} } = options;
        const url = ENDPOINTS.ARTIFACT_PROVENANCE.replace('{artifactId}', artifactId);

        return httpClient.post(url, provenanceData, config);
    },

    /**
     * Add provenance record with file upload
     * @param {number} artifactId - Artifact ID
     * @param {Object} provenanceData - Provenance data
     * @param {File} file - Supporting document file
     * @param {Object} options - Request options
     * @param {Function} options.onUploadProgress - Upload progress callback
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<ProvenanceRecord>} Created provenance record
     */
    addProvenanceRecordWithFile: async (artifactId, provenanceData, file, options = {}) => {
        const { onUploadProgress, config = {} } = options;
        const url = ENDPOINTS.ARTIFACT_PROVENANCE_UPLOAD.replace('{artifactId}', artifactId);

        const formData = new FormData();
        formData.append('documentFile', file);

        // Add provenance data fields
        Object.keys(provenanceData).forEach(key => {
            formData.append(key, provenanceData[key]);
        });

        return httpClient.post(url, formData, {
            ...config,
            headers: {
                'Content-Type': 'multipart/form-data',
                ...config.headers,
            },
            onUploadProgress,
        });
    },

    /**
     * Get all provenance records for an artifact
     * @param {number} artifactId - Artifact ID
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<ProvenanceRecord>>} Array of provenance records
     */
    getProvenanceRecords: async (artifactId, options = {}) => {
        const { config = {} } = options;
        const url = ENDPOINTS.ARTIFACT_PROVENANCE.replace('{artifactId}', artifactId);

        return httpClient.get(url, {}, config);
    },

    /**
     * Get provenance record by ID
     * @param {number} artifactId - Artifact ID
     * @param {number} recordId - Provenance record ID
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<ProvenanceRecord>} Provenance record
     */
    getProvenanceRecordById: async (artifactId, recordId, options = {}) => {
        const { config = {} } = options;
        const url = ENDPOINTS.ARTIFACT_PROVENANCE_ITEM
            .replace('{artifactId}', artifactId)
            .replace('{recordId}', recordId);

        return httpClient.get(url, {}, config);
    },

    /**
     * Download provenance document
     * @param {number} artifactId - Artifact ID
     * @param {number} recordId - Provenance record ID
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Blob>} Document blob
     */
    downloadProvenanceDocument: async (artifactId, recordId, options = {}) => {
        const { config = {} } = options;
        const url = ENDPOINTS.ARTIFACT_PROVENANCE_DOCUMENT
            .replace('{artifactId}', artifactId)
            .replace('{recordId}', recordId);

        return httpClient.get(url, {}, { ...config, responseType: 'blob' });
    },

    /**
     * Delete provenance record
     * @param {number} artifactId - Artifact ID
     * @param {number} recordId - Provenance record ID
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<void>} Success confirmation
     */
    deleteProvenanceRecord: async (artifactId, recordId, options = {}) => {
        const { config = {} } = options;
        const url = ENDPOINTS.ARTIFACT_PROVENANCE_ITEM
            .replace('{artifactId}', artifactId)
            .replace('{recordId}', recordId);

        return httpClient.delete(url, config);
    },
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Utility function to get authentication status color
 * @param {string} status - Authentication status
 * @returns {string} Color class or hex code
 */
export const getAuthenticationStatusColor = (status) => {
    const colors = {
        'Authentic': 'green',
        'Suspected': 'yellow',
        'Fake': 'red',
        'Pending': 'blue',
        'Inconclusive': 'gray',
    };

    return colors[status] || 'gray';
};

/**
 * Utility function to format artifact condition
 * @param {string} condition - Artifact condition
 * @returns {string} Formatted condition with icon
 */
export const formatArtifactCondition = (condition) => {
    const conditions = {
        'Excellent': '⭐ Excellent',
        'Good': '✅ Good',
        'Fair': '⚠️ Fair',
        'Poor': '❌ Poor',
    };

    return conditions[condition] || condition;
};

// ==========================================
// REACT HOOKS
// ==========================================

// Import useSimpleApi hooks
import { useGet, usePost, usePut, useDelete, usePatch } from '../../hooks/useSimpleApi';

/**
 * Hook for fetching all artifacts
 * @param {Object} options - Hook options
 * @param {boolean} options.enabled - Whether to enable the query
 * @returns {Object} Hook state and data
 */
export const useArtifacts = (options = {}) => {
    const { enabled = true, onSuccess, onError } = options;

    return useGet(ENDPOINTS.ARTIFACTS, {}, {
        enabled,
        onSuccess,
        onError,
        ...options
    });
};

/**
 * Hook for fetching an artifact by ID
 * @param {number} id - Artifact ID
 * @param {Object} options - Hook options
 * @param {boolean} options.enabled - Whether to enable the query
 * @returns {Object} Hook state and data
 */
export const useArtifact = (id, options = {}) => {
    const { enabled = true, onSuccess, onError } = options;

    return useGet(`${ENDPOINTS.ARTIFACTS}/${id}`, {}, {
        enabled: enabled && !!id,
        onSuccess,
        onError,
        ...options
    });
};

/**
 * Hook for searching artifacts
 * @param {ArtifactSearchParams} searchParams - Search parameters
 * @param {Object} options - Hook options
 * @param {boolean} options.enabled - Whether to enable the query
 * @returns {Object} Hook state and data
 */
export const useArtifactSearch = (searchParams, options = {}) => {
    const { enabled = true, onSuccess, onError } = options;

    return useGet(ENDPOINTS.ARTIFACT_SEARCH, searchParams, {
        enabled: enabled && Object.keys(searchParams).length > 0,
        onSuccess,
        onError,
        ...options
    });
};

/**
 * Hook for fetching artifacts by category
 * @param {string} category - Category
 * @param {Object} options - Hook options
 * @param {boolean} options.enabled - Whether to enable the query
 * @returns {Object} Hook state and data
 */
export const useArtifactsByCategory = (category, options = {}) => {
    const { enabled = true, onSuccess, onError } = options;

    return useGet(`${ENDPOINTS.ARTIFACT_FILTER_CATEGORY}/${category}`, {}, {
        enabled: enabled && !!category,
        onSuccess,
        onError,
        ...options
    });
};

/**
 * Hook for fetching artifact statistics
 * @param {Object} options - Hook options
 * @param {boolean} options.enabled - Whether to enable the query
 * @returns {Object} Hook state and data
 */
export const useArtifactStatistics = (options = {}) => {
    const { enabled = true, onSuccess, onError } = options;

    return useGet(ENDPOINTS.ARTIFACT_STATISTICS, {}, {
        enabled,
        onSuccess,
        onError,
        ...options
    });
};

/**
 * Hook for fetching artifact media
 * @param {number} artifactId - Artifact ID
 * @param {Object} options - Hook options
 * @param {boolean} options.enabled - Whether to enable the query
 * @returns {Object} Hook state and data
 */
export const useArtifactMedia = (artifactId, options = {}) => {
    const { enabled = true, onSuccess, onError } = options;
    const url = ENDPOINTS.ARTIFACT_MEDIA.replace('{artifactId}', artifactId);

    return useGet(url, {}, {
        enabled: enabled && !!artifactId,
        onSuccess,
        onError,
        ...options
    });
};

/**
 * Hook for fetching artifact authentications
 * @param {number} artifactId - Artifact ID
 * @param {Object} options - Hook options
 * @param {boolean} options.enabled - Whether to enable the query
 * @returns {Object} Hook state and data
 */
export const useArtifactAuthentications = (artifactId, options = {}) => {
    const { enabled = true, onSuccess, onError } = options;
    const url = ENDPOINTS.ARTIFACT_AUTHENTICATIONS.replace('{artifactId}', artifactId);

    return useGet(url, {}, {
        enabled: enabled && !!artifactId,
        onSuccess,
        onError,
        ...options
    });
};

/**
 * Hook for fetching provenance records
 * @param {number} artifactId - Artifact ID
 * @param {Object} options - Hook options
 * @param {boolean} options.enabled - Whether to enable the query
 * @returns {Object} Hook state and data
 */
export const useProvenanceRecords = (artifactId, options = {}) => {
    const { enabled = true, onSuccess, onError } = options;
    const url = ENDPOINTS.ARTIFACT_PROVENANCE.replace('{artifactId}', artifactId);

    return useGet(url, {}, {
        enabled: enabled && !!artifactId,
        onSuccess,
        onError,
        ...options
    });
};

/**
 * Hook for creating an artifact (mutation)
 * @param {Object} options - Hook options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and functions
 */
export const useCreateArtifact = (options = {}) => {
    const { onSuccess, onError } = options;

    return usePost(ENDPOINTS.ARTIFACTS, {
        onSuccess,
        onError,
        ...options
    });
};

/**
 * Hook for getting a single artifact (query)
 * @param {number} id - Artifact ID
 * @param {Object} options - Hook options
 * @returns {Object} Hook state and data
 */
export const useGetArtifact = (id, options = {}) => {
    const { onSuccess, onError } = options;

    return useGet(`${ENDPOINTS.ARTIFACTS}/${id}`, {}, {
        enabled: !!id,
        onSuccess,
        onError,
        ...options
    });
};

/**
 * Hook for updating an artifact (mutation)
 * @param {number} id - Artifact ID
 * @param {Object} options - Hook options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and functions
 */
export const useUpdateArtifact = (id, options = {}) => {
    const { onSuccess, onError } = options;

    return usePut(`${ENDPOINTS.ARTIFACTS}/${id}`, {
        onSuccess,
        onError,
        ...options
    });
};

/**
 * Hook for deleting an artifact (mutation)
 * @param {number} id - Artifact ID
 * @param {Object} options - Hook options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and functions
 */
export const useDeleteArtifact = (id, options = {}) => {
    const { onSuccess, onError } = options;

    return useDelete(`${ENDPOINTS.ARTIFACTS}/${id}`, {
        onSuccess,
        onError,
        ...options
    });
};

/**
 * Hook for uploading artifact media (mutation)
 * @param {number} artifactId - Artifact ID
 * @param {Object} options - Hook options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @param {Function} options.onUploadProgress - Upload progress callback
 * @returns {Object} Hook state and functions
 */
export const useUploadArtifactMedia = (artifactId, options = {}) => {
    const { onSuccess, onError, onUploadProgress } = options;
    const url = ENDPOINTS.ARTIFACT_MEDIA_UPLOAD.replace('{artifactId}', artifactId);

    return usePost(url, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress,
        onSuccess,
        onError,
        ...options
    });
};

/**
 * Hook for adding artifact authentication (mutation)
 * @param {number} artifactId - Artifact ID
 * @param {Object} options - Hook options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and functions
 */
export const useAddArtifactAuthentication = (artifactId, options = {}) => {
    const { onSuccess, onError } = options;
    const url = ENDPOINTS.ARTIFACT_AUTHENTICATIONS.replace('{artifactId}', artifactId);

    return usePost(url, {
        onSuccess,
        onError,
        ...options
    });
};

/**
 * Hook for adding provenance record (mutation)
 * @param {number} artifactId - Artifact ID
 * @param {Object} options - Hook options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and functions
 */
export const useAddProvenanceRecord = (artifactId, options = {}) => {
    const { onSuccess, onError } = options;
    const url = ENDPOINTS.ARTIFACT_PROVENANCE.replace('{artifactId}', artifactId);

    return usePost(url, {
        onSuccess,
        onError,
        ...options
    });
};

/**
 * Utility function to get artifact condition color classes
 * @param {string} condition - Artifact condition
 * @returns {string} CSS classes for condition styling
 */
export const getArtifactConditionColor = (condition) => {
    switch (condition?.toLowerCase()) {
        case 'excellent':
            return 'text-green-600 dark:text-green-400';
        case 'very good':
            return 'text-blue-600 dark:text-blue-400';
        case 'good':
            return 'text-green-600 dark:text-green-400';
        case 'fair':
            return 'text-yellow-600 dark:text-yellow-400';
        case 'poor':
            return 'text-orange-600 dark:text-orange-400';
        case 'fragile':
            return 'text-red-600 dark:text-red-400';
        default:
            return 'text-gray-600 dark:text-gray-400';
    }
};

/**
 * Utility function to get artifact condition icon
 * @param {string} condition - Artifact condition
 * @returns {string} Icon emoji for condition
 */
export const getArtifactConditionIcon = (condition) => {
    const icons = {
        'Excellent': '⭐',
        'Very Good': '✨',
        'Good': '✓',
        'Fair': '⚠️',
        'Poor': '🔶',
        'Fragile': '🚨'
    };
    return icons[condition] || '❓';
};

// Export everything
export default artifactsApi;
