import httpClient from './httpClient';

/**
 * Folders API Service
 * Comprehensive service for managing document folders with hierarchical organization
 * Supports tree structures, drag-and-drop, and nested folder operations
 */

// API Endpoints (Note: These would need to be implemented in backend)
const ENDPOINTS = {
    BASE: '/api/folders',
    BY_SITE: '/api/folders/site/{siteId}',
    MOVE: '/api/folders/{id}/move',
    TREE: '/api/folders/tree',
    DOCUMENTS: '/api/folders/{id}/contents', // use ?includeDocuments=true
};



// Default folder types with icons and colors
const FOLDER_TYPES = {
    GENERAL: { name: 'General', icon: 'Folder', color: 'blue' },
    HISTORICAL: { name: 'Historical Records', icon: 'Archive', color: 'amber' },
    ARCHAEOLOGICAL: { name: 'Archaeological', icon: 'Pickaxe', color: 'orange' },
    ARCHITECTURAL: { name: 'Architectural Plans', icon: 'Building', color: 'purple' },
    CONSERVATION: { name: 'Conservation', icon: 'Wrench', color: 'green' },
    RESEARCH: { name: 'Research Papers', icon: 'BookOpen', color: 'indigo' },
    LEGAL: { name: 'Legal Documents', icon: 'Scale', color: 'red' },
    ADMINISTRATIVE: { name: 'Administrative', icon: 'Briefcase', color: 'gray' },
    MEDIA_COVERAGE: { name: 'Media Coverage', icon: 'Newspaper', color: 'pink' },
    PHOTOGRAPHS: { name: 'Photographs', icon: 'Camera', color: 'cyan' },
    MAPS: { name: 'Maps & Surveys', icon: 'Map', color: 'emerald' },
    REPORTS: { name: 'Reports', icon: 'FileText', color: 'slate' }
};

/**
 * Folder Data Structure
 * @typedef {Object} Folder
 * @property {number} id - Unique identifier
 * @property {string} name - Folder name
 * @property {string} description - Folder description
 * @property {string} type - Folder type (from FOLDER_TYPES)
 * @property {number} parentId - Parent folder ID (null for root)
 * @property {number} heritageSiteId - Associated heritage site
 * @property {string} path - Full folder path
 * @property {number} level - Nesting level (0 for root)
 * @property {number} sortOrder - Display order
 * @property {boolean} isPublic - Public visibility
 * @property {Array<Folder>} children - Child folders
 * @property {Array<Document>} documents - Documents in folder
 * @property {number} documentCount - Total documents (including subfolders)
 * @property {string} createdBy - Creator
 * @property {string} createdDate - Creation date
 * @property {string} updatedBy - Last updater
 * @property {string} updatedDate - Last update date
 */

const foldersApi = {
    /**
     * Get folder tree for a heritage site
     * @param {number} siteId - Heritage site ID
     * @param {Object} options - Request options
     * @returns {Promise<Array<Folder>>} Folder tree structure
     */
    getFolderTree: async (siteId, options = {}) => {
        const { config = {} } = options;
        return httpClient.get(ENDPOINTS.TREE, { siteId }, config);
    },

    /**
     * Create new folder for a specific heritage site
     * @param {Object} folderData - Folder data
     * @param {number} siteId - Heritage site ID
     * @param {Object} options - Request options
     * @returns {Promise<Folder>} Created folder
     */
    createFolder: async (folderData, siteId, options = {}) => {
        const { config = {} } = options;
        // Use site-specific endpoint
        return httpClient.post(`${ENDPOINTS.BASE}/site/${siteId}`, folderData, config);
    },

    /**
     * Update folder
     * @param {number} id - Folder ID
     * @param {Object} updates - Folder updates
     * @param {Object} options - Request options
     * @returns {Promise<Folder>} Updated folder
     */
    updateFolder: async (id, updates, options = {}) => {
        const { config = {} } = options;
        console.log('=== FOLDERS API UPDATE DEBUG ===');
        console.log('PUT URL:', `${ENDPOINTS.BASE}/${id}`);
        console.log('Updates payload:', updates);
        return httpClient.put(`${ENDPOINTS.BASE}/${id}`, updates, config);
    },

    /**
     * Update folder permissions only
     * @param {number} id - Folder ID
     * @param {Object} permissions - Permission updates
     * @param {Object} options - Request options
     * @returns {Promise<Folder>} Updated folder
     */
    updateFolderPermissions: async (id, permissions, options = {}) => {
        const { config = {} } = options;
        console.log('=== FOLDERS API PERMISSIONS UPDATE DEBUG ===');
        console.log('PATCH URL:', `${ENDPOINTS.BASE}/${id}/permissions`);
        console.log('Permissions payload:', permissions);
        return httpClient.patch(`${ENDPOINTS.BASE}/${id}/permissions`, permissions, config);
    },

    /**
     * Delete folder
     * @param {number} id - Folder ID
     * @param {boolean} recursive - Delete subfolders and documents
     * @param {Object} options - Request options
     * @returns {Promise<void>} Success response
     */
    deleteFolder: async (id, recursive = false, options = {}) => {
        const { config = {} } = options;
        return httpClient.delete(`${ENDPOINTS.BASE}/${id}`, config);
    },

    /**
     * Move folder to new parent
     * @param {number} folderId - Folder to move
     * @param {number} newParentId - New parent folder ID (null for root)
     * @param {Object} options - Request options
     * @returns {Promise<Folder>} Updated folder
     */
    moveFolder: async (folderId, newParentId, options = {}) => {
        const { config = {} } = options;
        return httpClient.post(ENDPOINTS.MOVE.replace('{id}', folderId), { parentId: newParentId }, config);
    },

    /**
     * Move document to folder
     * @param {number} documentId - Document to move
     * @param {number} folderId - Target folder ID
     * @param {Object} options - Request options
     * @returns {Promise<void>} Success response
     */
    moveDocumentToFolder: async (documentId, folderId, options = {}) => {
        // Placeholder if backend endpoint exists later; currently not implemented
        return Promise.resolve();
    },

    /**
     * Get folder contents (documents and subfolders)
     * @param {number} folderId - Folder ID
     * @param {Object} options - Request options
     * @returns {Promise<Object>} Folder contents
     */
    getFolderContents: async (folderId, options = {}) => {
        const { includeDocuments = true, config = {} } = options;
        return httpClient.get(ENDPOINTS.DOCUMENTS.replace('{id}', folderId), { includeDocuments }, config);
    },

    /**
     * Search folders
     * @param {Object} searchParams - Search parameters
     * @param {Object} options - Request options
     * @returns {Promise<Array<Folder>>} Matching folders
     */
    searchFolders: async (searchParams = {}, options = {}) => {
        const { name, parentId, createdBy, config = {} } = options;
        const params = { name, parentId, createdBy };
        return httpClient.get(`${ENDPOINTS.BASE}/filter`, params, config);
    },

    /**
     * Get folder breadcrumb path
     * @param {number} folderId - Folder ID
     * @param {Array<Folder>} folderTree - Complete folder tree
     * @returns {Array<Object>} Breadcrumb path
     */
    getFolderBreadcrumb: (folderId, folderTree) => {
        const breadcrumb = [];

        const findFolderPath = (folders, targetId, path = []) => {
            for (const folder of folders) {
                const currentPath = [...path, folder];

                if (folder.id === targetId) {
                    return currentPath;
                }

                if (folder.children && folder.children.length > 0) {
                    const found = findFolderPath(folder.children, targetId, currentPath);
                    if (found) return found;
                }
            }
            return null;
        };

        const path = findFolderPath(folderTree, folderId);
        if (path) {
            return path.map(folder => ({
                id: folder.id,
                name: folder.name,
                type: folder.type
            }));
        }

        return breadcrumb;
    },

    /**
     * Get available folder types from backend
     * @param {Object} options - Request options
     * @returns {Promise<Object>} Folder types with metadata
     */
    getFolderTypesFromBackend: async (options = {}) => {
        const { config = {} } = options;
        return httpClient.get('/api/folders/types', {}, config);
    },

    // Utility methods
    getFolderTypes: () => FOLDER_TYPES,

    /**
     * Validate folder name
     * @param {string} name - Folder name to validate
     * @param {Array<Folder>} existingSiblings - Existing sibling folders
     * @returns {Object} Validation result
     */
    validateFolderName: (name, existingSiblings = []) => {
        const errors = [];

        if (!name || name.trim().length === 0) {
            errors.push('Folder name is required');
        } else {
            if (name.length > 100) {
                errors.push('Folder name cannot exceed 100 characters');
            }

            if (!/^[a-zA-Z0-9\s\-_&()[\]]+$/.test(name)) {
                errors.push('Folder name contains invalid characters');
            }

            if (existingSiblings.some(folder =>
                folder.name.toLowerCase() === name.trim().toLowerCase())) {
                errors.push('A folder with this name already exists');
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    },

    /**
     * Calculate folder statistics
     * @param {Array<Folder>} folderTree - Folder tree
     * @returns {Object} Folder statistics
     */
    calculateFolderStats: (folderTree) => {
        const stats = {
            totalFolders: 0,
            totalDocuments: 0,
            maxDepth: 0,
            foldersByType: {}
        };

        const traverseTree = (folders, depth = 0) => {
            stats.maxDepth = Math.max(stats.maxDepth, depth);

            folders.forEach(folder => {
                stats.totalFolders++;
                stats.totalDocuments += folder.documentCount || 0;

                if (!stats.foldersByType[folder.type]) {
                    stats.foldersByType[folder.type] = 0;
                }
                stats.foldersByType[folder.type]++;

                if (folder.children && folder.children.length > 0) {
                    traverseTree(folder.children, depth + 1);
                }
            });
        };

        traverseTree(folderTree);
        return stats;
    }
};

export default foldersApi;

export const searchFolders = async (siteId, searchQuery, includeDocuments = true) => {
    try {
        // First get folders for the specific site
        const siteFoldersResponse = await httpClient.get(`/api/folders/site/${siteId}`);
        let siteFolders = siteFoldersResponse.data || [];

        // If there's a search query, filter the results
        if (searchQuery && searchQuery.length >= 2) {
            const searchResponse = await httpClient.get('/api/folders/search', {
                q: searchQuery
            });
            const searchResults = searchResponse.data || [];

            // Filter search results to only include folders from the selected site
            siteFolders = searchResults.filter(folder =>
                folder.siteId === siteId || folder.heritageSiteId === siteId
            );
        }

        return { data: { items: siteFolders } };
    } catch (error) {
        console.error('Error searching folders:', error);
        throw error;
    }
};

export const getFoldersBySite = async (siteId) => {
    try {
        console.log('API: Getting folders for site:', siteId);
        const response = await httpClient.get(`/api/folders/site/${siteId}`);
        console.log('API: Raw response:', response);

        // Backend now returns the correct format directly
        return response;
    } catch (error) {
        console.error('API: Error getting folders by site:', error);
        throw error;
    }
};

// Get all folders system-wide (for System Administrators)
export const getAllFoldersSystemWide = async () => {
    try {
        console.log('API: Getting all folders system-wide');
        const response = await httpClient.get('/api/folders');
        console.log('API: System-wide folders response:', response);

        // Backend now returns the correct format directly
        return response;
    } catch (error) {
        console.error('API: Error getting system-wide folders:', error);
        throw error;
    }
};




