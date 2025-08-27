import axios from 'axios';

// Base URL is handled by Vite proxy configuration
// axios.defaults.baseURL = 'http://localhost:8080';

// User-friendly error messages for global axios
const getGlobalErrorMessage = (error) => {
    // Check for network errors first
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        return 'Unable to connect to the server. Please check your internet connection and try again.';
    }

    // Check for server down scenarios
    if (error.code === 'ERR_NETWORK' ||
        error.message.includes('ERR_NETWORK') ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('Network request failed')) {
        return 'Server is currently unavailable. Please try again later.';
    }

    // Check for timeout errors
    if (error.code === 'ECONNABORTED' ||
        error.message === 'timeout of 30000ms exceeded' ||
        error.message.includes('timeout')) {
        return 'Request timed out. Please try again.';
    }

    // Check for specific HTTP status codes
    const status = error.response?.status;
    if (status) {
        // Special handling for 401 errors - distinguish between login failure and session expiration
        if (status === 401) {
            const url = error.config?.url;
            const method = error.config?.method;

            // If it's a login request, show credential error instead of session expired
            if (url && url.includes('/api/auth/login')) {
                return 'Invalid username or password. Please check your credentials and try again.';
            }

            // If it's a POST request to auth endpoints, it might be a registration or other auth issue
            if (method === 'POST' && url && url.includes('/api/auth/')) {
                return 'Authentication failed. Please check your input and try again.';
            }

            // For other requests, it's likely session expiration
            return 'Your session has expired. Please log in again.';
        }

        const errorMessages = {
            400: 'Invalid request. Please check your input and try again.',
            403: 'Access denied. You don\'t have permission for this action.',
            404: 'The requested resource was not found.',
            409: 'This resource already exists. Please use a different value.',
            422: 'Please check your input and try again.',
            429: 'Too many requests. Please wait a moment before trying again.',
            500: 'Server is temporarily unavailable. Please try again in a few minutes.',
            502: 'Service is temporarily unavailable. Please try again later.',
            503: 'Service is temporarily unavailable. Please try again later.',
            504: 'Request timed out. Please check your connection and try again.'
        };

        // Special handling for 500 errors (server down scenarios)
        if (status === 500) {
            const responseData = error.response?.data;
            if (!responseData || responseData === '' ||
                (typeof responseData === 'string' && responseData.includes('Internal Server Error'))) {
                return 'Server is currently unavailable. Please try again later.';
            }
            return errorMessages[status] || 'Something went wrong. Please try again.';
        }

        return errorMessages[status] || 'Something went wrong. Please try again.';
    }

    // Check for axios specific errors
    if (error.message.includes('Request failed with status code')) {
        const statusMatch = error.message.match(/status code (\d+)/);
        if (statusMatch) {
            const statusCode = parseInt(statusMatch[1]);
            const errorMessages = {
                500: 'Server is temporarily unavailable. Please try again in a few minutes.'
            };
            return errorMessages[statusCode] || 'Something went wrong. Please try again.';
        }
    }

    return 'Something went wrong. Please try again or contact support if the problem persists.';
};

// Add a request interceptor to automatically include JWT token
axios.interceptors.request.use(
    config => {
        // Check if this is a public endpoint
        const isPublic = [
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
        ].some(endpoint => config.url?.startsWith(endpoint));

        // Only add Authorization header for non-public endpoints
        if (!isPublic) {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } else {
            console.log('🔍 Axios interceptor: Skipping Authorization header for public endpoint:', config.url);
            // Also log the full config to debug
            console.log('🔍 Axios interceptor: Full config:', config);
        }

        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors with user-friendly messages
axios.interceptors.response.use(
    response => response,
    error => {
        // Transform error message to be user-friendly
        const userFriendlyMessage = getGlobalErrorMessage(error);

        // Update the error message for display
        error.userFriendlyMessage = userFriendlyMessage;

        // Enhanced error logging with more context
        const errorContext = {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            message: error.message,
            userFriendlyMessage: userFriendlyMessage,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };

        // Log errors with different levels based on severity
        if (error.response?.status >= 500) {
            console.error('Server Error:', errorContext);
        } else if (error.response?.status >= 400) {
            console.warn('Client Error:', errorContext);
        } else {
            console.log('Network Error:', errorContext);
        }

        // Handle specific error scenarios
        if (error.response?.status === 401) {
            console.log('401 error detected, but not redirecting automatically');
            // Clear invalid tokens
            if (localStorage.getItem('token')) {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
            }
        }

        // Handle network errors more gracefully
        if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
            console.warn('Network connectivity issue detected');
        }

        return Promise.reject(error);
    }
);

export default axios; 