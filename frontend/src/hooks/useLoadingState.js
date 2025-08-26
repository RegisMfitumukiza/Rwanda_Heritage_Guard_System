import { useState, useCallback, useRef } from 'react';

const useLoadingState = (initialState = false) => {
    const [loading, setLoading] = useState(initialState);
    const [loadingStates, setLoadingStates] = useState({});
    const [loadingMessages, setLoadingMessages] = useState({});
    const loadingRefs = useRef(new Map());

    // Set overall loading state
    const setLoadingState = useCallback((isLoading) => {
        setLoading(isLoading);
    }, []);

    // Set loading state for a specific key
    const setKeyLoading = useCallback((key, isLoading, message = '') => {
        setLoadingStates(prev => ({
            ...prev,
            [key]: isLoading
        }));

        if (message) {
            setLoadingMessages(prev => ({
                ...prev,
                [key]: message
            }));
        }
    }, []);

    // Check if a specific key is loading
    const isKeyLoading = useCallback((key) => {
        return loadingStates[key] || false;
    }, [loadingStates]);

    // Get loading message for a specific key
    const getLoadingMessage = useCallback((key) => {
        return loadingMessages[key] || '';
    }, [loadingMessages]);

    // Set loading with a promise
    const withLoading = useCallback(async (promise, key = 'default', message = '') => {
        try {
            setKeyLoading(key, true, message);
            const result = await promise;
            return result;
        } finally {
            setKeyLoading(key, false);
        }
    }, [setKeyLoading]);

    // Set loading with a promise and custom error handling
    const withLoadingAndError = useCallback(async (promise, key = 'default', message = '', onError) => {
        try {
            setKeyLoading(key, true, message);
            const result = await promise;
            return result;
        } catch (error) {
            if (onError) {
                onError(error);
            }
            throw error;
        } finally {
            setKeyLoading(key, false);
        }
    }, [setKeyLoading]);

    // Batch loading states
    const setBatchLoading = useCallback((keys, isLoading, message = '') => {
        const batchStates = {};
        const batchMessages = {};

        keys.forEach(key => {
            batchStates[key] = isLoading;
            if (message) {
                batchMessages[key] = message;
            }
        });

        setLoadingStates(prev => ({
            ...prev,
            ...batchStates
        }));

        if (message) {
            setLoadingMessages(prev => ({
                ...prev,
                ...batchMessages
            }));
        }
    }, []);

    // Clear all loading states
    const clearLoadingStates = useCallback(() => {
        setLoadingStates({});
        setLoadingMessages({});
        setLoading(false);
    }, []);

    // Get all currently loading keys
    const getLoadingKeys = useCallback(() => {
        return Object.keys(loadingStates).filter(key => loadingStates[key]);
    }, [loadingStates]);

    // Check if any key is loading
    const isAnyLoading = useCallback(() => {
        return Object.values(loadingStates).some(Boolean);
    }, [loadingStates]);

    // Create a loading ref for complex loading scenarios
    const createLoadingRef = useCallback((key) => {
        if (!loadingRefs.current.has(key)) {
            loadingRefs.current.set(key, {
                start: (message = '') => setKeyLoading(key, true, message),
                stop: () => setKeyLoading(key, false),
                setMessage: (message) => setLoadingMessages(prev => ({
                    ...prev,
                    [key]: message
                }))
            });
        }
        return loadingRefs.current.get(key);
    }, [setKeyLoading]);

    return {
        // Basic loading state
        loading,
        setLoading: setLoadingState,

        // Key-based loading states
        loadingStates,
        setKeyLoading,
        isKeyLoading,
        getLoadingMessage,

        // Promise-based loading
        withLoading,
        withLoadingAndError,

        // Batch operations
        setBatchLoading,

        // Utility methods
        clearLoadingStates,
        getLoadingKeys,
        isAnyLoading,
        createLoadingRef
    };
};

export default useLoadingState;


