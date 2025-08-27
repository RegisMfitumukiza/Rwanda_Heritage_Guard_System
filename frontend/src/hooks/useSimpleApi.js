import { useState, useEffect, useCallback } from 'react';
import httpClient from '../services/api/httpClient';

/**
 * Simple, reliable API hooks that replace the complex useApi
 * No complex caching, no refs, no race conditions - just simple data fetching
 */

/**
 * Hook for GET requests
 */
export const useGet = (url, params = {}, options = {}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        if (!url) return;

        setLoading(true);
        setError(null);

        try {
            const result = await httpClient.get(url, params);
            setData(result);
            if (options.onSuccess) options.onSuccess(result);
        } catch (err) {
            console.error(`Failed to fetch data from ${url}:`, err);
            setError(err);
            if (options.onError) options.onError(err);
        } finally {
            setLoading(false);
        }
    }, [url, JSON.stringify(params)]);

    const refetch = useCallback(() => {
        fetchData();
    }, [fetchData]);

    // Add a refetch with new params function
    const refetchWithParams = useCallback((newParams) => {
        // Update params and trigger fetch
        const updatedParams = { ...params, ...newParams };
        const fetchWithNewParams = async () => {
            if (!url) return;
            setLoading(true);
            setError(null);
            try {
                const result = await httpClient.get(url, updatedParams);
                setData(result);
                if (options.onSuccess) options.onSuccess(result);
            } catch (err) {
                console.error(`Failed to fetch data from ${url}:`, err);
                setError(err);
                if (options.onError) options.onError(err);
            } finally {
                setLoading(false);
            }
        };
        fetchWithNewParams();
    }, [url, params, options.onSuccess, options.onError]);

    useEffect(() => {
        if (options.enabled !== false) {
            fetchData();
        }
    }, [fetchData]);

    return { data, loading, error, refetch, refetchWithParams };
};

/**
 * Hook for POST requests
 */
export const usePost = (url, options = {}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async (data) => {
        if (!url) return;

        setLoading(true);
        setError(null);

        try {
            const result = await httpClient.post(url, data);
            if (options.onSuccess) options.onSuccess(result);
            return result;
        } catch (err) {
            setError(err);
            if (options.onError) options.onError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [url, options.onSuccess, options.onError]);

    return { execute, loading, error };
};

/**
 * Hook for PUT requests
 */
export const usePut = (url, options = {}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async (data) => {
        if (!url) return;

        setLoading(true);
        setError(null);

        try {
            const result = await httpClient.put(url, data);
            if (options.onSuccess) options.onSuccess(result);
            return result;
        } catch (err) {
            setError(err);
            if (options.onError) options.onError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [url, options.onSuccess, options.onError]);

    return { execute, loading, error };
};

/**
 * Hook for DELETE requests
 */
export const useDelete = (url, options = {}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async () => {
        if (!url) return;

        setLoading(true);
        setError(null);

        try {
            const result = await httpClient.delete(url);
            if (options.onSuccess) options.onSuccess(result);
            return result;
        } catch (err) {
            setError(err);
            if (options.onError) options.onError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [url, options.onSuccess, options.onError]);

    return { execute, loading, error };
};

/**
 * Hook for PATCH requests
 */
export const usePatch = (url, options = {}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async (data) => {
        if (!url) return;

        setLoading(true);
        setError(null);

        try {
            const result = await httpClient.patch(url, data);
            if (options.onSuccess) options.onSuccess(result);
            return result;
        } catch (err) {
            setError(err);
            if (options.onError) options.onError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [url, options.onSuccess, options.onError]);

    return { execute, loading, error };
};

/**
 * Hook for file uploads
 */
export const useUpload = (url, options = {}) => {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);

    const execute = useCallback(async (file) => {
        if (!url || !file) return;

        setLoading(true);
        setError(null);
        setProgress(0);

        try {
            const onProgress = (progressEvent) => {
                const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
                setProgress(percentCompleted);
            };

            const result = await httpClient.upload(url, file, onProgress);
            if (options.onSuccess) options.onSuccess(result);
            return result;
        } catch (err) {
            setError(err);
            if (options.onError) options.onError(err);
            throw err;
        } finally {
            setLoading(false);
            setProgress(0);
        }
    }, [url, options.onSuccess, options.onError]);

    return { execute, loading, progress, error };
};

export default { useGet, usePost, usePut, useDelete, usePatch, useUpload };
