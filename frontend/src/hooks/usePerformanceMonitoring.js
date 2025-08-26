import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook for monitoring performance metrics including Core Web Vitals
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether to enable monitoring
 * @param {boolean} options.trackCLS - Track Cumulative Layout Shift
 * @param {boolean} options.trackFID - Track First Input Delay
 * @param {boolean} options.trackLCP - Track Largest Contentful Paint
 * @param {boolean} options.trackFCP - Track First Contentful Paint
 * @param {Function} options.onMetrics - Callback when metrics are collected
 * @param {Function} options.onError - Callback when errors occur
 */
export const usePerformanceMonitoring = ({
    enabled = true,
    trackCLS: shouldTrackCLS = true,
    trackFID: shouldTrackFID = true,
    trackLCP: shouldTrackLCP = true,
    trackFCP: shouldTrackFCP = true,
    onMetrics = null,
    onError = null
} = {}) => {
    const [metrics, setMetrics] = useState({});
    const [isSupported, setIsSupported] = useState(false);
    const observerRef = useRef(null);
    const clsObserverRef = useRef(null);
    const navigationObserverRef = useRef(null);

    // Check if Performance Observer is supported
    useEffect(() => {
        setIsSupported('PerformanceObserver' in window);
    }, []);

    // Track First Contentful Paint (FCP)
    const trackFCP = useCallback(() => {
        if (!shouldTrackFCP || !isSupported) return;

        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (entry.name === 'first-contentful-paint') {
                        setMetrics(prev => ({
                            ...prev,
                            fcp: entry.startTime
                        }));

                        if (onMetrics) {
                            onMetrics({ fcp: entry.startTime });
                        }
                    }
                });
            });

            observer.observe({ entryTypes: ['paint'] });
            observerRef.current = observer;

            return () => observer.disconnect();
        } catch (error) {
            console.warn('FCP tracking failed:', error);
            if (onError) onError(error);
        }
    }, [shouldTrackFCP, isSupported, onMetrics, onError]);

    // Track Largest Contentful Paint (LCP)
    const trackLCP = useCallback(() => {
        if (!shouldTrackLCP || !isSupported) return;

        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];

                if (lastEntry) {
                    setMetrics(prev => ({
                        ...prev,
                        lcp: lastEntry.startTime
                    }));

                    if (onMetrics) {
                        onMetrics({ lcp: lastEntry.startTime });
                    }
                }
            });

            observer.observe({ entryTypes: ['largest-contentful-paint'] });
            observerRef.current = observer;

            return () => observer.disconnect();
        } catch (error) {
            console.warn('LCP tracking failed:', error);
            if (onError) onError(error);
        }
    }, [shouldTrackLCP, isSupported, onMetrics, onError]);

    // Track First Input Delay (FID)
    const trackFID = useCallback(() => {
        if (!shouldTrackFID || !isSupported) return;

        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    const fid = entry.processingStart - entry.startTime;

                    setMetrics(prev => ({
                        ...prev,
                        fid
                    }));

                    if (onMetrics) {
                        onMetrics({ fid });
                    }
                });
            });

            observer.observe({ entryTypes: ['first-input'] });
            observerRef.current = observer;

            return () => observer.disconnect();
        } catch (error) {
            console.warn('FID tracking failed:', error);
            if (onError) onError(error);
        }
    }, [shouldTrackFID, isSupported, onMetrics, onError]);

    // Track Cumulative Layout Shift (CLS)
    const trackCLS = useCallback(() => {
        if (!shouldTrackCLS || !isSupported) return;

        try {
            let clsValue = 0;
            let clsEntries = [];

            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                        clsEntries.push(entry);
                    }
                }
            });

            observer.observe({ entryTypes: ['layout-shift'] });
            clsObserverRef.current = observer;

            // Report CLS when page becomes hidden
            const handleVisibilityChange = () => {
                if (document.visibilityState === 'hidden') {
                    setMetrics(prev => ({
                        ...prev,
                        cls: clsValue
                    }));

                    if (onMetrics) {
                        onMetrics({ cls: clsValue });
                    }
                }
            };

            document.addEventListener('visibilitychange', handleVisibilityChange);

            return () => {
                observer.disconnect();
                document.removeEventListener('visibilitychange', handleVisibilityChange);
            };
        } catch (error) {
            console.warn('CLS tracking failed:', error);
            if (onError) onError(error);
        }
    }, [shouldTrackCLS, isSupported, onMetrics, onError]);

    // Track Navigation Timing
    const trackNavigationTiming = useCallback(() => {
        if (!isSupported) return;

        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (entry.entryType === 'navigation') {
                        const navigationMetrics = {
                            domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
                            loadComplete: entry.loadEventEnd - entry.loadEventStart,
                            domInteractive: entry.domInteractive,
                            domComplete: entry.domComplete,
                            redirectCount: entry.redirectCount,
                            transferSize: entry.transferSize,
                            encodedBodySize: entry.encodedBodySize,
                            decodedBodySize: entry.decodedBodySize
                        };

                        setMetrics(prev => ({
                            ...prev,
                            navigation: navigationMetrics
                        }));

                        if (onMetrics) {
                            onMetrics({ navigation: navigationMetrics });
                        }
                    }
                });
            });

            observer.observe({ entryTypes: ['navigation'] });
            navigationObserverRef.current = observer;

            return () => observer.disconnect();
        } catch (error) {
            console.warn('Navigation timing tracking failed:', error);
            if (onError) onError(error);
        }
    }, [isSupported, onMetrics, onError]);

    // Track Resource Loading
    const trackResourceLoading = useCallback(() => {
        if (!isSupported) return;

        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const resourceMetrics = {
                    totalResources: entries.length,
                    totalSize: entries.reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
                    slowResources: entries.filter(entry => entry.duration > 1000).length,
                    resourceTypes: entries.reduce((acc, entry) => {
                        const type = entry.initiatorType || 'other';
                        acc[type] = (acc[type] || 0) + 1;
                        return acc;
                    }, {})
                };

                setMetrics(prev => ({
                    ...prev,
                    resources: resourceMetrics
                }));

                if (onMetrics) {
                    onMetrics({ resources: resourceMetrics });
                }
            });

            observer.observe({ entryTypes: ['resource'] });
            observerRef.current = observer;

            return () => observer.disconnect();
        } catch (error) {
            console.warn('Resource loading tracking failed:', error);
            if (onError) onError(error);
        }
    }, [isSupported, onMetrics, onError]);

    // Initialize all tracking
    useEffect(() => {
        if (!enabled || !isSupported) return;

        const cleanupFunctions = [];

        // Start tracking various metrics
        if (shouldTrackFCP) cleanupFunctions.push(trackFCP());
        if (shouldTrackLCP) cleanupFunctions.push(trackLCP());
        if (shouldTrackFID) cleanupFunctions.push(trackFID());
        if (shouldTrackCLS) cleanupFunctions.push(trackCLS());

        cleanupFunctions.push(trackNavigationTiming());
        cleanupFunctions.push(trackResourceLoading());

        // Cleanup function
        return () => {
            cleanupFunctions.forEach(cleanup => {
                if (typeof cleanup === 'function') {
                    cleanup();
                }
            });
        };
    }, [enabled, isSupported, shouldTrackFCP, shouldTrackLCP, shouldTrackFID, shouldTrackCLS, trackNavigationTiming, trackResourceLoading]);

    // Get performance score based on metrics
    const getPerformanceScore = useCallback(() => {
        if (!metrics.lcp && !metrics.fid && !metrics.cls) return null;

        let score = 100;

        // LCP scoring (0-100)
        if (metrics.lcp) {
            if (metrics.lcp <= 2500) score -= 0;
            else if (metrics.lcp <= 4000) score -= 10;
            else score -= 25;
        }

        // FID scoring (0-100)
        if (metrics.fid) {
            if (metrics.fid <= 100) score -= 0;
            else if (metrics.fid <= 300) score -= 10;
            else score -= 25;
        }

        // CLS scoring (0-100)
        if (metrics.cls) {
            if (metrics.cls <= 0.1) score -= 0;
            else if (metrics.cls <= 0.25) score -= 10;
            else score -= 25;
        }

        return Math.max(0, score);
    }, [metrics]);

    // Get performance grade
    const getPerformanceGrade = useCallback(() => {
        const score = getPerformanceScore();
        if (score === null) return null;

        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }, [getPerformanceScore]);

    // Reset metrics
    const resetMetrics = useCallback(() => {
        setMetrics({});
    }, []);

    return {
        metrics,
        isSupported,
        performanceScore: getPerformanceScore(),
        performanceGrade: getPerformanceGrade(),
        resetMetrics,
        // Individual metric getters
        fcp: metrics.fcp,
        lcp: metrics.lcp,
        fid: metrics.fid,
        cls: metrics.cls,
        navigation: metrics.navigation,
        resources: metrics.resources
    };
};

export default usePerformanceMonitoring;
