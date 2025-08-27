import httpClient from './httpClient';

/**
 * File Upload API Service
 * Handles all file upload operations with comprehensive error handling and progress tracking
 */

// API Endpoints
const ENDPOINTS = {
    UPLOAD_SINGLE: (fileType) => `/api/files/upload/${fileType}`,
    UPLOAD_MULTIPLE: (fileType) => `/api/files/upload-multiple/${fileType}`,
    DOWNLOAD: (fileType, filename) => `/api/files/download/${fileType}/${filename}`,
    DELETE: (fileType, filename) => `/api/files/delete/${fileType}/${filename}`,
    FILE_INFO: (fileType, filename) => `/api/files/info/${fileType}/${filename}`,
    CONFIG: '/api/files/config'
};

// File type configurations (matches backend)
export const FILE_TYPES = {
    IMAGE: 'image',
    DOCUMENT: 'document',
    VIDEO: 'video',
    AUDIO: 'audio',
    THREE_D_MODEL: '3d_model'
};

export const ALLOWED_EXTENSIONS = {
    [FILE_TYPES.IMAGE]: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    [FILE_TYPES.DOCUMENT]: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
    [FILE_TYPES.VIDEO]: ['mp4', 'avi', 'mov', 'mkv'],
    [FILE_TYPES.AUDIO]: ['mp3', 'wav', 'flac', 'aac'],
    [FILE_TYPES.THREE_D_MODEL]: ['obj', 'stl', 'ply', 'gltf']
};

export const MAX_FILE_SIZES = {
    [FILE_TYPES.IMAGE]: 10 * 1024 * 1024,      // 10MB
    [FILE_TYPES.DOCUMENT]: 10 * 1024 * 1024,   // 10MB
    [FILE_TYPES.VIDEO]: 100 * 1024 * 1024,     // 100MB
    [FILE_TYPES.AUDIO]: 20 * 1024 * 1024,      // 20MB
    [FILE_TYPES.THREE_D_MODEL]: 50 * 1024 * 1024 // 50MB
};

/**
 * File Upload API Service
 */
export const fileUploadApi = {
    /**
     * Upload a single file
     * @param {string} fileType - Type of file (image, document, video, audio, 3d_model)
     * @param {File} file - File to upload
     * @param {string} description - Optional description
     * @param {Function} onProgress - Progress callback function
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} Upload result
     */
    uploadSingle: async (fileType, file, description = '', onProgress = null, options = {}) => {
        try {
            // Validate file type
            if (!Object.values(FILE_TYPES).includes(fileType)) {
                throw new Error(`Invalid file type: ${fileType}`);
            }

            // Validate file
            validateFile(file, fileType);

            const formData = new FormData();
            formData.append('file', file);
            if (description) {
                formData.append('description', description);
            }

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: onProgress ? (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    onProgress(percentCompleted);
                } : undefined,
                ...options
            };

            const response = await httpClient.post(ENDPOINTS.UPLOAD_SINGLE(fileType), formData, config);
            return response;
        } catch (error) {
            console.error('File upload failed:', error);
            throw error;
        }
    },

    /**
     * Upload multiple files
     * @param {string} fileType - Type of files
     * @param {FileList|Array} files - Files to upload
     * @param {string} description - Optional description
     * @param {Function} onProgress - Progress callback function
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} Upload result
     */
    uploadMultiple: async (fileType, files, description = '', onProgress = null, options = {}) => {
        try {
            // Validate file type
            if (!Object.values(FILE_TYPES).includes(fileType)) {
                throw new Error(`Invalid file type: ${fileType}`);
            }

            if (!files || files.length === 0) {
                throw new Error('No files provided');
            }

            if (files.length > 10) {
                throw new Error('Cannot upload more than 10 files at once');
            }

            // Validate each file
            Array.from(files).forEach(file => validateFile(file, fileType));

            const formData = new FormData();
            Array.from(files).forEach(file => {
                formData.append('files', file);
            });

            if (description) {
                formData.append('description', description);
            }

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: onProgress ? (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    onProgress(percentCompleted);
                } : undefined,
                ...options
            };

            const response = await httpClient.post(ENDPOINTS.UPLOAD_MULTIPLE(fileType), formData, config);
            return response;
        } catch (error) {
            console.error('Multiple file upload failed:', error);
            throw error;
        }
    },

    /**
     * Download a file
     * @param {string} fileType - Type of file
     * @param {string} filename - Name of the file
     * @param {Object} options - Additional options
     * @returns {Promise<void>} Download initiated
     */
    downloadFile: async (fileType, filename, options = {}) => {
        try {
            const url = ENDPOINTS.DOWNLOAD(fileType, filename);
            const response = await httpClient.get(url, {}, {
                responseType: 'blob',
                ...options
            });

            // Create download link
            const blob = new Blob([response]);
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);

            return { success: true, message: 'Download initiated' };
        } catch (error) {
            console.error('File download failed:', error);
            throw error;
        }
    },

    /**
     * Delete a file
     * @param {string} fileType - Type of file
     * @param {string} filename - Name of the file
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} Delete result
     */
    deleteFile: async (fileType, filename, options = {}) => {
        try {
            const response = await httpClient.delete(ENDPOINTS.DELETE(fileType, filename), options);
            return response;
        } catch (error) {
            console.error('File deletion failed:', error);
            throw error;
        }
    },

    /**
     * Get file information
     * @param {string} fileType - Type of file
     * @param {string} filename - Name of the file
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} File information
     */
    getFileInfo: async (fileType, filename, options = {}) => {
        try {
            const response = await httpClient.get(ENDPOINTS.FILE_INFO(fileType, filename), {}, options);
            return response;
        } catch (error) {
            console.error('Failed to get file info:', error);
            throw error;
        }
    },

    /**
     * Get file upload configuration
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} Configuration data
     */
    getConfig: async (options = {}) => {
        try {
            const response = await httpClient.get(ENDPOINTS.CONFIG, {}, options);
            return response;
        } catch (error) {
            console.error('Failed to get file config:', error);
            throw error;
        }
    }
};

// Utility functions

/**
 * Validate a file before upload
 * @param {File} file - File to validate
 * @param {string} fileType - Expected file type
 */
export const validateFile = (file, fileType) => {
    if (!file) {
        throw new Error('File is required');
    }

    if (file.size === 0) {
        throw new Error('File is empty');
    }

    // Check file extension
    const allowedExtensions = ALLOWED_EXTENSIONS[fileType];
    if (allowedExtensions) {
        const fileExtension = getFileExtension(file.name);
        if (!allowedExtensions.includes(fileExtension.toLowerCase())) {
            throw new Error(
                `Invalid file type. Allowed extensions: ${allowedExtensions.join(', ')}`
            );
        }
    }

    // Check file size
    const maxSize = MAX_FILE_SIZES[fileType];
    if (maxSize && file.size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
        throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
    }
};

/**
 * Get file extension from filename
 * @param {string} filename - Name of the file
 * @returns {string} File extension
 */
export const getFileExtension = (filename) => {
    if (!filename || !filename.includes('.')) {
        return '';
    }
    return filename.split('.').pop().toLowerCase();
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Check if file type is image
 * @param {string} fileType - File type or filename
 * @returns {boolean} True if it's an image type
 */
export const isImageFile = (fileType) => {
    if (fileType === FILE_TYPES.IMAGE) return true;

    const extension = getFileExtension(fileType);
    return ALLOWED_EXTENSIONS[FILE_TYPES.IMAGE].includes(extension);
};

/**
 * Check if file type is document
 * @param {string} fileType - File type or filename
 * @returns {boolean} True if it's a document type
 */
export const isDocumentFile = (fileType) => {
    if (fileType === FILE_TYPES.DOCUMENT) return true;

    const extension = getFileExtension(fileType);
    return ALLOWED_EXTENSIONS[FILE_TYPES.DOCUMENT].includes(extension);
};

/**
 * Get appropriate file type based on extension
 * @param {string} filename - Name of the file
 * @returns {string|null} File type or null if unknown
 */
export const getFileTypeFromExtension = (filename) => {
    const extension = getFileExtension(filename);

    for (const [fileType, extensions] of Object.entries(ALLOWED_EXTENSIONS)) {
        if (extensions.includes(extension)) {
            return fileType;
        }
    }

    return null;
};

// React hooks for file upload operations
import { useUpload, usePost, useGet, useDelete } from '../../hooks/useSimpleApi';

/**
 * Hook for single file upload
 * @param {string} fileType - Type of file
 * @param {Object} options - Hook options
 * @returns {Object} Upload hook state and functions
 */
export const useFileUpload = (fileType, options = {}) => {
    return useUpload(ENDPOINTS.UPLOAD_SINGLE(fileType), {
        ...options,
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

/**
 * Hook for multiple file upload
 * @param {string} fileType - Type of files
 * @param {Object} options - Hook options
 * @returns {Object} Upload hook state and functions
 */
export const useMultipleFileUpload = (fileType, options = {}) => {
    return useUpload(ENDPOINTS.UPLOAD_MULTIPLE(fileType), {
        ...options,
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

/**
 * Hook for file deletion
 * @param {string} fileType - Type of file
 * @param {string} filename - Name of the file
 * @param {Object} options - Hook options
 * @returns {Object} Delete hook state and functions
 */
export const useFileDelete = (fileType, filename, options = {}) => {
    return useDelete(ENDPOINTS.DELETE(fileType, filename), options);
};

/**
 * Hook for getting file info
 * @param {string} fileType - Type of file
 * @param {string} filename - Name of the file
 * @param {Object} options - Hook options
 * @returns {Object} File info hook state and data
 */
export const useFileInfo = (fileType, filename, options = {}) => {
    return useGet(ENDPOINTS.FILE_INFO(fileType, filename), {}, {
        enabled: !!(fileType && filename),
        ...options
    });
};

/**
 * Hook for getting file upload configuration
 * @param {Object} options - Hook options
 * @returns {Object} Config hook state and data
 */
export const useFileConfig = (options = {}) => {
    return useGet(ENDPOINTS.CONFIG, {}, options);
};

export default fileUploadApi;
