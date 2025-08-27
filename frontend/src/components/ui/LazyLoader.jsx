import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const LazyLoader = ({
    children,
    threshold = 0.1,
    rootMargin = '50px',
    placeholder = null,
    onLoad = null,
    onError = null,
    className = '',
    showPerformanceMetrics = false,
    loadingDelay = 0,
    preload = false,
    fallback = null
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [loadTime, setLoadTime] = useState(null);
    const [performanceMetrics, setPerformanceMetrics] = useState({});

    const elementRef = useRef(null);
    const observerRef = useRef(null);
    const loadStartTime = useRef(null);

    // Performance monitoring
    const trackPerformance = useCallback(() => {
        if (!showPerformanceMetrics) return;

        const loadEndTime = performance.now();
        const totalLoadTime = loadEndTime - (loadStartTime.current || loadEndTime);

        setLoadTime(totalLoadTime);

        // Collect additional performance metrics
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const metrics = {};

                    entries.forEach(entry => {
                        if (entry.entryType === 'measure') {
                            metrics[entry.name] = entry.duration;
                        }
                    });

                    setPerformanceMetrics(prev => ({ ...prev, ...metrics }));
                });

                observer.observe({ entryTypes: ['measure'] });

                // Measure specific performance aspects
                performance.mark('lazy-loader-start');
                performance.mark('lazy-loader-end');
                performance.measure('lazy-loader-total', 'lazy-loader-start', 'lazy-loader-end');

                return () => observer.disconnect();
            } catch (e) {
                console.warn('Performance monitoring not supported:', e);
            }
        }
    }, [showPerformanceMetrics]);

    // Intersection Observer for lazy loading
    useEffect(() => {
        if (!elementRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            {
                threshold,
                rootMargin,
            }
        );

        observer.observe(elementRef.current);
        observerRef.current = observer;

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [threshold, rootMargin]);

    // Handle loading state
    useEffect(() => {
        if (isVisible && !isLoaded && !isLoading) {
            setIsLoading(true);
            loadStartTime.current = performance.now();

            // Add loading delay if specified
            const loadTimer = setTimeout(() => {
                setIsLoaded(true);
                setIsLoading(false);
                trackPerformance();

                if (onLoad) {
                    onLoad();
                }
            }, loadingDelay);

            return () => clearTimeout(loadTimer);
        }
    }, [isVisible, isLoaded, isLoading, loadingDelay, onLoad, trackPerformance]);

    // Preload functionality
    useEffect(() => {
        if (preload && !isVisible) {
            const preloadTimer = setTimeout(() => {
                setIsVisible(true);
            }, 1000); // Preload after 1 second

            return () => clearTimeout(preloadTimer);
        }
    }, [preload, isVisible]);

    // Error handling
    const handleError = useCallback((error) => {
        setHasError(true);
        setIsLoading(false);

        if (onError) {
            onError(error);
        }

        console.error('LazyLoader error:', error);
    }, [onError]);

    // Retry loading
    const handleRetry = useCallback(() => {
        setHasError(false);
        setIsLoaded(false);
        setIsLoading(false);
        setIsVisible(false);

        // Re-trigger intersection observer
        if (elementRef.current && observerRef.current) {
            observerRef.current.observe(elementRef.current);
        }
    }, []);

    // Custom placeholder component
    const renderPlaceholder = () => {
        if (placeholder) {
            return typeof placeholder === 'function' ? placeholder() : placeholder;
        }

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex items-center justify-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}
            >
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Loading content...</p>
                </div>
            </motion.div>
        );
    };

    // Error fallback component
    const renderErrorFallback = () => {
        if (fallback) {
            return typeof fallback === 'function' ? fallback(handleRetry) : fallback;
        }

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex items-center justify-center p-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg ${className}`}
            >
                <div className="text-center">
                    <EyeOff className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <p className="text-red-600 dark:text-red-400 text-sm mb-2">Failed to load content</p>
                    <button
                        onClick={handleRetry}
                        className="text-xs text-red-500 hover:text-red-700 underline"
                    >
                        Try again
                    </button>
                </div>
            </motion.div>
        );
    };

    // Performance metrics display
    const renderPerformanceMetrics = () => {
        if (!showPerformanceMetrics || !loadTime) return null;

        return (
            <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
                <div>Load Time: {loadTime.toFixed(2)}ms</div>
                {Object.keys(performanceMetrics).length > 0 && (
                    <div className="mt-1">
                        {Object.entries(performanceMetrics).map(([key, value]) => (
                            <div key={key}>{key}: {value.toFixed(2)}ms</div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <div ref={elementRef} className={className}>
                <AnimatePresence mode="wait">
                    {hasError ? (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderErrorFallback()}
                        </motion.div>
                    ) : isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {renderPlaceholder()}
                        </motion.div>
                    ) : isLoaded ? (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            {children}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="waiting"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderPlaceholder()}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {renderPerformanceMetrics()}
        </>
    );
};

export default LazyLoader;


