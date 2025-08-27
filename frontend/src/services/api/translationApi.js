import httpClient from './httpClient';
import { useGet, usePost, usePut, useDelete, usePatch } from '../../hooks/useSimpleApi';

/**
 * Translation API Service
 * General-purpose translation service for managing translations across all content types
 * (heritage sites, artifacts, documents, etc.) with batch operations and analytics
 * Leverages the robust httpClient service for consistent error handling
 */

// API Endpoints
const ENDPOINTS = {
    // Core translation endpoints
    TRANSLATIONS: '/api/translations',
    TRANSLATIONS_TEXT: '/api/translations/text',
    TRANSLATIONS_CONTENT: '/api/translations/content',
    TRANSLATIONS_BY_TYPE_LANGUAGE: '/api/translations/by-type-language',
    TRANSLATIONS_SEARCH: '/api/translations/search',
    TRANSLATIONS_BATCH: '/api/translations/batch',
    TRANSLATIONS_EXISTS: '/api/translations/exists',
    TRANSLATIONS_BY_STATUS: '/api/translations/by-status',
};

/**
 * Translation Data Structure
 * @typedef {Object} Translation
 * @property {number} id - Unique identifier
 * @property {string} contentType - Content type (HERITAGE_SITE, ARTIFACT, DOCUMENT, etc.)
 * @property {number} contentId - Content ID
 * @property {string} fieldName - Field name being translated
 * @property {string} languageCode - Language code (en, rw, fr)
 * @property {string} originalText - Original text
 * @property {string} translatedText - Translated text
 * @property {string} status - Translation status (PENDING, APPROVED, REJECTED)
 * @property {string} translatorName - Translator name
 * @property {string} reviewerName - Reviewer name
 * @property {string} createdBy - Creator username
 * @property {string} createdDate - Creation date
 * @property {string} updatedBy - Last updater username
 * @property {string} updatedDate - Last update date
 */

/**
 * Translation Search Parameters
 * @typedef {Object} TranslationSearchParams
 * @property {string} contentType - Filter by content type
 * @property {number} contentId - Filter by content ID
 * @property {string} languageCode - Filter by language
 * @property {string} fieldName - Filter by field name
 * @property {string} status - Filter by status
 * @property {string} translatorName - Filter by translator
 */

/**
 * Batch Translation Request
 * @typedef {Object} BatchTranslationRequest
 * @property {Array<Translation>} translations - Array of translations to save
 */

/**
 * Translation API Service
 */
export const translationApi = {
    // ==========================================
    // CORE TRANSLATION OPERATIONS
    // ==========================================

    /**
     * Get translated text for specific content
     * @param {string} contentType - Content type
     * @param {number} contentId - Content ID
     * @param {string} fieldName - Field name
     * @param {string} languageCode - Target language code
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<string>} Translated text
     */
    getTranslatedText: async (contentType, contentId, fieldName, languageCode, options = {}) => {
        const { config = {} } = options;
        const params = {
            contentType,
            contentId,
            fieldName,
            languageCode,
        };

        return httpClient.get(ENDPOINTS.TRANSLATIONS_TEXT, params, config);
    },

    /**
     * Save a new translation
     * @param {Object} translationData - Translation data
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Translation>} Created translation
     */
    saveTranslation: async (translationData, options = {}) => {
        const { config = {} } = options;

        return httpClient.post(ENDPOINTS.TRANSLATIONS, translationData, config);
    },

    /**
     * Update translation
     * @param {number} id - Translation ID
     * @param {Object} translationData - Updated translation data
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Translation>} Updated translation
     */
    updateTranslation: async (id, translationData, options = {}) => {
        const { config = {} } = options;

        return httpClient.put(`${ENDPOINTS.TRANSLATIONS}/${id}`, translationData, config);
    },

    /**
     * Delete translation
     * @param {number} id - Translation ID
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<void>} Success confirmation
     */
    deleteTranslation: async (id, options = {}) => {
        const { config = {} } = options;

        return httpClient.delete(`${ENDPOINTS.TRANSLATIONS}/${id}`, config);
    },

    // ==========================================
    // CONTENT-SPECIFIC OPERATIONS
    // ==========================================

    /**
     * Get all translations for specific content
     * @param {string} contentType - Content type
     * @param {number} contentId - Content ID
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Translation>>} Array of translations
     */
    getTranslationsForContent: async (contentType, contentId, options = {}) => {
        const { config = {} } = options;
        const params = { contentType, contentId };

        return httpClient.get(ENDPOINTS.TRANSLATIONS_CONTENT, params, config);
    },

    /**
     * Get translations by content type and language
     * @param {string} contentType - Content type
     * @param {string} languageCode - Language code
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Translation>>} Array of translations
     */
    getTranslationsByTypeAndLanguage: async (contentType, languageCode, options = {}) => {
        const { config = {} } = options;
        const params = { contentType, languageCode };

        return httpClient.get(ENDPOINTS.TRANSLATIONS_BY_TYPE_LANGUAGE, params, config);
    },

    /**
     * Check if translation exists
     * @param {string} contentType - Content type
     * @param {number} contentId - Content ID
     * @param {string} fieldName - Field name
     * @param {string} languageCode - Language code
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<boolean>} Whether translation exists
     */
    translationExists: async (contentType, contentId, fieldName, languageCode, options = {}) => {
        const { config = {} } = options;
        const params = {
            contentType,
            contentId,
            fieldName,
            languageCode,
        };

        return httpClient.get(ENDPOINTS.TRANSLATIONS_EXISTS, params, config);
    },

    // ==========================================
    // SEARCH & FILTERING
    // ==========================================

    /**
     * Search translations with filters
     * @param {TranslationSearchParams} searchParams - Search parameters
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Translation>>} Array of matching translations
     */
    searchTranslations: async (searchParams = {}, options = {}) => {
        const { config = {} } = options;

        return httpClient.get(ENDPOINTS.TRANSLATIONS_SEARCH, searchParams, config);
    },

    /**
     * Get translations by status
     * @param {string} status - Translation status (PENDING, APPROVED, REJECTED)
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Translation>>} Array of translations with specified status
     */
    getTranslationsByStatus: async (status, options = {}) => {
        const { config = {} } = options;

        return httpClient.get(`${ENDPOINTS.TRANSLATIONS_BY_STATUS}/${status}`, {}, config);
    },

    // ==========================================
    // BATCH OPERATIONS
    // ==========================================

    /**
     * Save multiple translations in batch
     * @param {Array<Object>} translationsData - Array of translation data
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Translation>>} Array of created translations
     */
    batchSaveTranslations: async (translationsData, options = {}) => {
        const { config = {} } = options;

        return httpClient.post(ENDPOINTS.TRANSLATIONS_BATCH, translationsData, config);
    },

    // ==========================================
    // CONTENT TYPE SPECIFIC HELPERS
    // ==========================================

    /**
     * Get translations for a heritage site
     * @param {number} siteId - Heritage site ID
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Translation>>} Array of site translations
     */
    getHeritageSiteTranslations: async (siteId, options = {}) => {
        return translationApi.getTranslationsForContent('HERITAGE_SITE', siteId, options);
    },

    /**
     * Get translations for an artifact
     * @param {number} artifactId - Artifact ID
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Translation>>} Array of artifact translations
     */
    getArtifactTranslations: async (artifactId, options = {}) => {
        return translationApi.getTranslationsForContent('ARTIFACT', artifactId, options);
    },

    /**
     * Get translations for a document
     * @param {number} documentId - Document ID
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<Array<Translation>>} Array of document translations
     */
    getDocumentTranslations: async (documentId, options = {}) => {
        return translationApi.getTranslationsForContent('DOCUMENT', documentId, options);
    },

    /**
     * Get translated name for heritage site
     * @param {number} siteId - Heritage site ID
     * @param {string} languageCode - Target language code
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<string>} Translated site name
     */
    getHeritageSiteName: async (siteId, languageCode, options = {}) => {
        return translationApi.getTranslatedText('HERITAGE_SITE', siteId, 'name', languageCode, options);
    },

    /**
     * Get translated description for heritage site
     * @param {number} siteId - Heritage site ID
     * @param {string} languageCode - Target language code
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<string>} Translated site description
     */
    getHeritageSiteDescription: async (siteId, languageCode, options = {}) => {
        return translationApi.getTranslatedText('HERITAGE_SITE', siteId, 'description', languageCode, options);
    },

    /**
     * Get translated name for artifact
     * @param {number} artifactId - Artifact ID
     * @param {string} languageCode - Target language code
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<string>} Translated artifact name
     */
    getArtifactName: async (artifactId, languageCode, options = {}) => {
        return translationApi.getTranslatedText('ARTIFACT', artifactId, 'name', languageCode, options);
    },

    /**
     * Get translated description for artifact
     * @param {number} artifactId - Artifact ID
     * @param {string} languageCode - Target language code
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<string>} Translated artifact description
     */
    getArtifactDescription: async (artifactId, languageCode, options = {}) => {
        return translationApi.getTranslatedText('ARTIFACT', artifactId, 'description', languageCode, options);
    },

    /**
     * Get translated title for document
     * @param {number} documentId - Document ID
     * @param {string} languageCode - Target language code
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<string>} Translated document title
     */
    getDocumentTitle: async (documentId, languageCode, options = {}) => {
        return translationApi.getTranslatedText('DOCUMENT', documentId, 'title', languageCode, options);
    },

    /**
     * Get translated description for document
     * @param {number} documentId - Document ID
     * @param {string} languageCode - Target language code
     * @param {Object} options - Request options
     * @param {Object} options.config - Additional axios config
     * @returns {Promise<string>} Translated document description
     */
    getDocumentDescription: async (documentId, languageCode, options = {}) => {
        return translationApi.getTranslatedText('DOCUMENT', documentId, 'description', languageCode, options);
    },
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Utility function to get translation status color
 * @param {string} status - Translation status
 * @returns {string} Color class
 */
export const getTranslationStatusColor = (status) => {
    const colors = {
        'PENDING': 'yellow',
        'APPROVED': 'green',
        'REJECTED': 'red',
    };

    return colors[status] || 'gray';
};

/**
 * Utility function to get translation status display
 * @param {string} status - Translation status
 * @returns {string} Display text with icon
 */
export const getTranslationStatusDisplay = (status) => {
    const displays = {
        'PENDING': '⏳ Pending Review',
        'APPROVED': '✅ Approved',
        'REJECTED': '❌ Rejected',
    };

    return displays[status] || status;
};

/**
 * Utility function to get content type display name
 * @param {string} contentType - Content type
 * @returns {string} Display name
 */
export const getContentTypeDisplayName = (contentType) => {
    const displayNames = {
        'HERITAGE_SITE': 'Heritage Site',
        'ARTIFACT': 'Artifact',
        'DOCUMENT': 'Document',
        'FORUM_TOPIC': 'Forum Topic',
        'FORUM_POST': 'Forum Post',
        'FORUM_CATEGORY': 'Forum Category',
        'EDUCATIONAL_ARTICLE': 'Educational Article',
        'TESTIMONIAL': 'Testimonial',
    };

    return displayNames[contentType] || contentType.replace('_', ' ');
};

/**
 * Utility function to format language code to display name
 * @param {string} languageCode - Language code
 * @returns {string} Language display name
 */
export const getLanguageDisplayName = (languageCode) => {
    const languages = {
        'en': 'English',
        'rw': 'Kinyarwanda',
        'fr': 'Français',
    };

    return languages[languageCode] || languageCode;
};

/**
 * Utility function to validate content type
 * @param {string} contentType - Content type to validate
 * @returns {boolean} Whether content type is valid
 */
export const isValidContentType = (contentType) => {
    const validTypes = [
        'HERITAGE_SITE',
        'ARTIFACT',
        'DOCUMENT',
        'FORUM_TOPIC',
        'FORUM_POST',
        'FORUM_CATEGORY',
        'EDUCATIONAL_ARTICLE',
        'TESTIMONIAL',
    ];
    return validTypes.includes(contentType);
};

/**
 * Utility function to validate language code
 * @param {string} languageCode - Language code to validate
 * @returns {boolean} Whether language code is valid
 */
export const isValidLanguageCode = (languageCode) => {
    const validCodes = ['en', 'rw', 'fr'];
    return validCodes.includes(languageCode);
};

/**
 * Utility function to validate translation status
 * @param {string} status - Status to validate
 * @returns {boolean} Whether status is valid
 */
export const isValidTranslationStatus = (status) => {
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
    return validStatuses.includes(status);
};

/**
 * Utility function to check if translation is complete
 * @param {Translation} translation - Translation object
 * @returns {boolean} Whether translation is complete
 */
export const isTranslationComplete = (translation) => {
    return translation &&
        translation.translatedText &&
        translation.translatedText.trim().length > 0 &&
        translation.status === 'APPROVED';
};

/**
 * Utility function to get translation progress for content
 * @param {Array<Translation>} translations - Array of translations
 * @param {Array<string>} requiredLanguages - Required language codes
 * @param {Array<string>} requiredFields - Required field names
 * @returns {Object} Progress information
 */
export const getTranslationProgress = (translations, requiredLanguages, requiredFields) => {
    const total = requiredLanguages.length * requiredFields.length;
    let completed = 0;
    let approved = 0;
    let pending = 0;

    const progress = {};

    requiredLanguages.forEach(language => {
        progress[language] = {};
        requiredFields.forEach(field => {
            const translation = translations.find(t =>
                t.languageCode === language && t.fieldName === field
            );

            if (translation) {
                if (translation.status === 'APPROVED' && translation.translatedText) {
                    completed++;
                    approved++;
                    progress[language][field] = 'completed';
                } else if (translation.status === 'PENDING') {
                    pending++;
                    progress[language][field] = 'pending';
                } else {
                    progress[language][field] = 'incomplete';
                }
            } else {
                progress[language][field] = 'missing';
            }
        });
    });

    return {
        total,
        completed,
        approved,
        pending,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        progress,
    };
};

// ==========================================
// REACT HOOKS
// ==========================================

/**
 * Hook for fetching translations for content
 * @param {string} contentType - Content type
 * @param {number} contentId - Content ID
 * @param {Object} options - Hook options
 * @param {boolean} options.enabled - Whether to enable the query
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and data
 */
export const useContentTranslations = (contentType, contentId, options = {}) => {
    const { enabled = true, onSuccess, onError } = options;
    const params = { contentType, contentId };

    return useGet(ENDPOINTS.TRANSLATIONS_CONTENT, params, {
        enabled: enabled && !!contentType && !!contentId,
        onSuccess,
        onError,
    });
};

/**
 * Hook for fetching translated text
 * @param {string} contentType - Content type
 * @param {number} contentId - Content ID
 * @param {string} fieldName - Field name
 * @param {string} languageCode - Language code
 * @param {Object} options - Hook options
 * @param {boolean} options.enabled - Whether to enable the query
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and data
 */
export const useTranslatedText = (contentType, contentId, fieldName, languageCode, options = {}) => {
    const { enabled = true, onSuccess, onError } = options;
    const params = { contentType, contentId, fieldName, languageCode };

    return useGet(ENDPOINTS.TRANSLATIONS_TEXT, params, {
        enabled: enabled && !!contentType && !!contentId && !!fieldName && !!languageCode,
        onSuccess,
        onError,
    });
};

/**
 * Hook for searching translations
 * @param {TranslationSearchParams} searchParams - Search parameters
 * @param {Object} options - Hook options
 * @param {boolean} options.enabled - Whether to enable the query
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and data
 */
export const useTranslationSearch = (searchParams, options = {}) => {
    const { enabled = true, onSuccess, onError } = options;

    return useGet(ENDPOINTS.TRANSLATIONS_SEARCH, searchParams, {
        enabled: enabled && Object.keys(searchParams).length > 0,
        onSuccess,
        onError,
    });
};

/**
 * Hook for fetching translations by status
 * @param {string} status - Translation status
 * @param {Object} options - Hook options
 * @param {boolean} options.enabled - Whether to enable the query
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and data
 */
export const useTranslationsByStatus = (status, options = {}) => {
    const { enabled = true, onSuccess, onError } = options;

    return useGet(`${ENDPOINTS.TRANSLATIONS_BY_STATUS}/${status}`, {}, {
        enabled: enabled && !!status,
        onSuccess,
        onError,
    });
};

/**
 * Hook for creating a translation (mutation)
 * @param {Object} options - Hook options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and functions
 */
export const useCreateTranslation = (options = {}) => {
    const { onSuccess, onError } = options;

    return usePost(ENDPOINTS.TRANSLATIONS, {
        onSuccess,
        onError,
    });
};

/**
 * Hook for updating a translation (mutation)
 * @param {number} id - Translation ID
 * @param {Object} options - Hook options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and functions
 */
export const useUpdateTranslation = (id, options = {}) => {
    const { onSuccess, onError } = options;

    return usePut(`${ENDPOINTS.TRANSLATIONS}/${id}`, {
        onSuccess,
        onError,
    });
};

/**
 * Hook for deleting a translation (mutation)
 * @param {number} id - Translation ID
 * @param {Object} options - Hook options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and functions
 */
export const useDeleteTranslation = (id, options = {}) => {
    const { onSuccess, onError } = options;

    return useDelete(`${ENDPOINTS.TRANSLATIONS}/${id}`, {
        onSuccess,
        onError,
    });
};

/**
 * Hook for batch saving translations (mutation)
 * @param {Object} options - Hook options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Hook state and functions
 */
export const useBatchSaveTranslations = (options = {}) => {
    const { onSuccess, onError } = options;

    return usePost(ENDPOINTS.TRANSLATIONS_BATCH, {
        onSuccess,
        onError,
    });
};

// Export everything
export default translationApi;