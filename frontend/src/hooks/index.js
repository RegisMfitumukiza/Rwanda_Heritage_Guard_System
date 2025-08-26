// Export all hooks for easy importing
export { default as useCache } from './useCache';
export { default as useLoadingState } from './useLoadingState';
export { useLocalStorage } from './useLocalStorage';
export { default as useMobileResponsiveness } from './useMobileResponsiveness';

// Simplified API hooks - replaces the old useApi system
export {
    useGet,
    usePost,
    usePut,
    useDelete,
    usePatch,
    useUpload
} from './useSimpleApi';

export { default as usePerformanceMonitoring } from './usePerformanceMonitoring';
export { useDebounce } from './useDebounce';
