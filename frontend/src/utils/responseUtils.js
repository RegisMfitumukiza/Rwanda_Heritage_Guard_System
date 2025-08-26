/**
 * Utility functions for handling different API response formats
 */

/**
 * Normalizes paginated responses to a consistent format
 * Handles both old PageResponse and new PagedResponse formats
 * @param {Object} data - The response data
 * @returns {Object} Normalized response with consistent structure
 */
export const normalizePaginatedResponse = (data) => {
    if (!data) return data;

    // If it's already in the new PagedResponse format
    if (data.content !== undefined) {
        return {
            ...data,
            items: data.content, // Add items alias for backward compatibility
        };
    }

    // If it's in the old PageResponse format
    if (data.items !== undefined) {
        return {
            ...data,
            content: data.items, // Add content property for new format
        };
    }

    // If it's a simple array response
    if (Array.isArray(data)) {
        return {
            content: data,
            items: data,
            page: 0,
            size: data.length,
            totalElements: data.length,
            totalPages: 1,
            first: true,
            last: true,
            empty: data.length === 0,
            numberOfElements: data.length
        };
    }

    // Return as-is for other formats
    return data;
};

/**
 * Normalizes error responses to a consistent format
 * @param {Object} error - The error object
 * @returns {Object} Normalized error with consistent structure
 */
export const normalizeErrorResponse = (error) => {
    if (!error) return error;

    // Extract error information from different formats
    const errorData = error.response?.data || error;

    return {
        message: errorData.message || error.message || 'An error occurred',
        status: errorData.status || error.response?.status || 500,
        error: errorData.error || 'Unknown Error',
        details: errorData.details || errorData.fieldErrors || [],
        timestamp: errorData.timestamp || new Date().toISOString(),
        path: errorData.path || error.config?.url || '',
        originalError: error
    };
};

/**
 * Checks if a response is paginated
 * @param {Object} data - The response data
 * @returns {boolean} True if the response appears to be paginated
 */
export const isPaginatedResponse = (data) => {
    return data && (
        data.content !== undefined ||
        data.items !== undefined ||
        (data.page !== undefined && data.totalElements !== undefined)
    );
};

/**
 * Extracts the main content from a response
 * @param {Object} data - The response data
 * @returns {Array|Object} The main content (array for paginated, object/value for single)
 */
export const extractContent = (data) => {
    if (!data) return data;

    // For paginated responses
    if (isPaginatedResponse(data)) {
        return data.content || data.items || [];
    }

    // For single item responses
    return data;
};

/**
 * Creates a success response wrapper
 * @param {*} data - The response data
 * @param {string} message - Optional success message
 * @returns {Object} Wrapped success response
 */
export const createSuccessResponse = (data, message = 'Success') => {
    return {
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    };
};

/**
 * Creates an error response wrapper
 * @param {string} message - Error message
 * @param {Object} error - Optional error details
 * @returns {Object} Wrapped error response
 */
export const createErrorResponse = (message, error = null) => {
    return {
        success: false,
        message,
        error: normalizeErrorResponse(error),
        timestamp: new Date().toISOString()
    };
};

export default {
    normalizePaginatedResponse,
    normalizeErrorResponse,
    isPaginatedResponse,
    extractContent,
    createSuccessResponse,
    createErrorResponse
};
