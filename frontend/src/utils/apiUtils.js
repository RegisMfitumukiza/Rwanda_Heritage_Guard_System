/**
 * Utility functions for API calls with proper error handling
 */

/**
 * Safe fetch wrapper that handles common error cases
 * @param {string} url - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response data or null on error
 */
export const safeFetch = async (url, options = {}) => {
    try {
        // Get token from localStorage
        const token = localStorage.getItem('token');

        // Prepare headers
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // Add authorization if token exists
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers
        });

        // Check if response is HTML (error page) instead of JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.warn(`API endpoint ${url} returned non-JSON response, likely an error page`);
            return null;
        }

        if (response.ok) {
            return await response.json();
        } else if (response.status === 401) {
            console.warn(`User not authenticated for ${url}`);
            return null;
        } else {
            console.warn(`API endpoint ${url} returned error status: ${response.status}`);
            return null;
        }
    } catch (error) {
        console.error(`Failed to fetch ${url}:`, error);
        return null;
    }
};

/**
 * Safe fetch with fallback data
 * @param {string} url - API endpoint
 * @param {*} fallbackData - Data to return on error
 * @param {Object} options - Fetch options
 * @returns {Promise<*>} Response data or fallback data
 */
export const safeFetchWithFallback = async (url, fallbackData, options = {}) => {
    const data = await safeFetch(url, options);
    return data !== null ? data : fallbackData;
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has valid token
 */
export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return token !== null && token !== undefined;
};

