import axios from '../../config/axios';
import { toast } from 'react-hot-toast';
import { normalizePaginatedResponse, normalizeErrorResponse } from '../../utils/responseUtils';

/**
 * Unified HTTP Client - Single source of truth for all API calls
 * Replaces mixed fetch/axios/baseApi approaches with consistent, reliable methods
 */

// Configuration
const CONFIG = {
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 2,
    RETRY_DELAY: 1000,
};

// User-friendly error messages
const ERROR_MESSAGES = {
    400: 'Invalid request. Please check your input and try again.',
    401: 'Your session has expired. Please log in again.',
    403: 'Access denied. You don\'t have permission for this action.',
    404: 'The requested resource was not found.',
    409: 'This resource already exists. Please use a different value.',
    422: 'Please check your input and try again.',
    429: 'Too many requests. Please wait a moment before trying again.',
    500: 'Server is temporarily unavailable. Please try again in a few minutes.',
    502: 'Service is temporarily unavailable. Please try again later.',
    503: 'Service is temporarily unavailable. Please try again later.',
    504: 'Request timed out. Please check your connection and try again.',
    NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection and try again.',
    TIMEOUT_ERROR: 'Request timed out. Please try again.',
    SERVER_DOWN: 'Server is currently unavailable. Please try again later.',
    UNKNOWN_ERROR: 'Something went wrong. Please try again or contact support if the problem persists.',
};

/**
 * Get user-friendly error message
 */
const getErrorMessage = (error) => {
    // Check for network errors first
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        return ERROR_MESSAGES.NETWORK_ERROR;
    }

    // Check for server down scenarios
    if (error.code === 'ERR_NETWORK' ||
        error.message.includes('ERR_NETWORK') ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('Network request failed')) {
        return ERROR_MESSAGES.SERVER_DOWN;
    }

    // Check for timeout errors
    if (error.code === 'ECONNABORTED' ||
        error.message === 'timeout of 30000ms exceeded' ||
        error.message.includes('timeout')) {
        return ERROR_MESSAGES.TIMEOUT_ERROR;
    }

    // Check for specific HTTP status codes
    const status = error.response?.status;
    if (status) {
        // Special handling for 500 errors (server down scenarios)
        if (status === 500) {
            // Check if response is empty or contains specific error patterns
            const responseData = error.response?.data;
            if (!responseData || responseData === '' ||
                (typeof responseData === 'string' && responseData.includes('Internal Server Error'))) {
                return ERROR_MESSAGES.SERVER_DOWN;
            }
            return ERROR_MESSAGES[status];
        }
        return ERROR_MESSAGES[status] || ERROR_MESSAGES.UNKNOWN_ERROR;
    }

    // Check for axios specific errors
    if (error.message.includes('Request failed with status code')) {
        const statusMatch = error.message.match(/status code (\d+)/);
        if (statusMatch) {
            const statusCode = parseInt(statusMatch[1]);
            return ERROR_MESSAGES[statusCode] || ERROR_MESSAGES.UNKNOWN_ERROR;
        }
    }

    return ERROR_MESSAGES.UNKNOWN_ERROR;
};

/**
 * Show error notification
 */
const showError = (error, showToast = true) => {
    const message = getErrorMessage(error);
    const status = error.response?.status;

    // Don't show toast for 401 errors (handled by auth redirect)
    if (showToast && status !== 401) {
        toast.error(message, {
            duration: 5000,
            position: 'top-right',
            style: {
                background: '#FEE2E2',
                color: '#DC2626',
                border: '1px solid #FCA5A5',
            },
        });
    }

    // Always log for debugging
    console.error('HTTP Client Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.message,
        response: error.response?.data
    });

    return { message, status };
};

/**
 * Retry function for failed requests
 */
const retry = async (fn, retries = CONFIG.RETRY_ATTEMPTS, delay = CONFIG.RETRY_DELAY) => {
    try {
        return await fn();
    } catch (error) {
        if (retries === 0) throw error;

        // Don't retry on certain error types
        if (error.response?.status === 401 ||
            error.response?.status === 403 ||
            error.code === 'ERR_CANCELED') {
            throw error;
        }

        // Wait and retry
        await new Promise(resolve => setTimeout(resolve, delay));
        return retry(fn, retries - 1, delay * 2);
    }
};

/**
 * Check if endpoint is public (doesn't require authentication)
 */
const isPublicEndpoint = (url) => {
    const publicEndpoints = [
        '/api/heritage-sites',
        '/api/heritage-sites/',
        '/api/heritage-sites/search',
        '/api/heritage-sites/statistics',
        '/api/users/statistics',
        '/api/documents/statistics',
        '/api/artifacts/statistics',
        '/api/education/articles/statistics',
        '/api/testimonials',
        '/api/languages',
        '/api/translations/text',
        '/api/translations/content',
        '/api/forum/topics',
        '/api/forum/posts',
        '/api/education/articles',
        '/api/education/quizzes'
    ];

    return publicEndpoints.some(endpoint => url.startsWith(endpoint));
};

/**
 * Process response data with normalization
 */
const processResponse = (response) => {
    let data = response.data !== undefined ? response.data : response;

    // Normalize paginated responses for consistency
    if (data && (data.content !== undefined || data.items !== undefined)) {
        data = normalizePaginatedResponse(data);
    }

    return data;
};

/**
 * HTTP Client class
 */
class HttpClient {
    constructor() {
        this.axios = axios;
        this.setupInterceptors();
        this.requestCache = new Map();
        this.pendingRequests = new Map();
    }

    /**
     * Setup axios interceptors
     */
    setupInterceptors() {
        // Request interceptor - already handled in config/axios.js
        // Response interceptor for consistent error handling
        this.axios.interceptors.response.use(
            (response) => response,
            (error) => {
                // Don't show toast here - let individual methods handle it
                showError(error, false);
                return Promise.reject(error);
            }
        );
    }

    /**
     * GET request with deduplication and caching
     */
    async get(url, params = {}, config = {}) {
        try {
            // Create cache key
            const cacheKey = `${url}?${JSON.stringify(params)}`;

            // Check if request is already pending
            if (this.pendingRequests.has(cacheKey)) {
                return this.pendingRequests.get(cacheKey);
            }

            // Check cache for public endpoints (5 second cache)
            if (isPublicEndpoint(url)) {
                const cached = this.requestCache.get(cacheKey);
                if (cached && Date.now() - cached.timestamp < 5000) {
                    return cached.data;
                }
            }

            // Don't send Authorization header for public endpoints
            if (!isPublicEndpoint(url)) {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
                }
            }

            // Create promise for this request
            const requestPromise = retry(() =>
                this.axios.get(url, {
                    params,
                    timeout: CONFIG.TIMEOUT,
                    ...config
                })
            ).then(response => {
                const result = processResponse(response);

                // Cache result for public endpoints
                if (isPublicEndpoint(url)) {
                    this.requestCache.set(cacheKey, {
                        data: result,
                        timestamp: Date.now()
                    });
                }

                // Remove from pending requests
                this.pendingRequests.delete(cacheKey);

                return result;
            }).catch(error => {
                // Remove from pending requests on error
                this.pendingRequests.delete(cacheKey);
                throw error;
            });

            // Store pending request
            this.pendingRequests.set(cacheKey, requestPromise);

            return await requestPromise;
        } catch (error) {
            const normalizedError = normalizeErrorResponse(error);
            showError(error);
            // Attach normalized error for consistent handling
            error.normalizedError = normalizedError;
            throw error;
        }
    }

    /**
     * POST request
     */
    async post(url, data = {}, config = {}) {
        try {
            const response = await retry(() =>
                this.axios.post(url, data, {
                    timeout: CONFIG.TIMEOUT,
                    ...config
                })
            );
            return processResponse(response);
        } catch (error) {
            showError(error);
            throw error;
        }
    }

    /**
     * PUT request
     */
    async put(url, data = {}, config = {}) {
        try {
            const response = await retry(() =>
                this.axios.put(url, data, {
                    timeout: CONFIG.TIMEOUT,
                    ...config
                })
            );
            return processResponse(response);
        } catch (error) {
            showError(error);
            throw error;
        }
    }

    /**
     * PATCH request
     */
    async patch(url, data = {}, config = {}) {
        try {
            const response = await retry(() =>
                this.axios.patch(url, data, {
                    timeout: CONFIG.TIMEOUT,
                    ...config
                })
            );
            return processResponse(response);
        } catch (error) {
            showError(error);
            throw error;
        }
    }

    /**
     * DELETE request
     */
    async delete(url, config = {}) {
        try {
            const response = await retry(() =>
                this.axios.delete(url, {
                    timeout: CONFIG.TIMEOUT,
                    ...config
                })
            );
            return processResponse(response);
        } catch (error) {
            showError(error);
            throw error;
        }
    }

    /**
     * Upload file
     */
    async upload(url, file, onProgress = null, config = {}) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            // Add Authorization header for authenticated endpoints
            const headers = {
                'Content-Type': 'multipart/form-data',
            };

            // Don't send Authorization header for public endpoints
            if (!isPublicEndpoint(url)) {
                const token = localStorage.getItem('token');
                if (token) {
                    headers.Authorization = `Bearer ${token}`;
                }
            }

            const response = await this.axios.post(url, formData, {
                timeout: 60000, // Longer timeout for uploads
                onUploadProgress: onProgress,
                headers,
                ...config
            });

            return processResponse(response);
        } catch (error) {
            showError(error);
            throw error;
        }
    }

    /**
     * Download file
     */
    async download(url, filename = null, config = {}) {
        try {
            // Add Authorization header for authenticated endpoints
            const headers = {};

            // Don't send Authorization header for public endpoints
            if (!isPublicEndpoint(url)) {
                const token = localStorage.getItem('token');
                if (token) {
                    headers.Authorization = `Bearer ${token}`;
                }
            }

            const response = await this.axios.get(url, {
                responseType: 'blob',
                timeout: 60000, // Longer timeout for downloads
                headers,
                ...config
            });

            // Create download link
            const blob = new Blob([response.data]);
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);

            return true;
        } catch (error) {
            showError(error);
            throw error;
        }
    }
}

// Create and export singleton instance
const httpClient = new HttpClient();
export default httpClient;
