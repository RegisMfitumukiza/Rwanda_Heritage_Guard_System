import { useState, useEffect, useCallback } from 'react';
import { breakpoints } from '../lib/breakpoints';

const useMobileResponsiveness = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const [screenSize, setScreenSize] = useState('lg');
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [orientation, setOrientation] = useState('portrait');

    // Check if device supports touch
    const checkTouchSupport = useCallback(() => {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }, []);

    // Get current screen size
    const getScreenSize = useCallback((width) => {
        if (width < parseInt(breakpoints.sm)) return 'xs';
        if (width < parseInt(breakpoints.md)) return 'sm';
        if (width < parseInt(breakpoints.lg)) return 'md';
        if (width < parseInt(breakpoints.xl)) return 'lg';
        return '2xl';
    }, []);

    // Get orientation
    const getOrientation = useCallback(() => {
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    }, []);

    // Update screen size and device type
    const updateScreenInfo = useCallback(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const newScreenSize = getScreenSize(width);
        const newOrientation = getOrientation();

        setScreenSize(newScreenSize);
        setOrientation(newOrientation);

        // Set device type flags
        setIsMobile(width < parseInt(breakpoints.md));
        setIsTablet(width >= parseInt(breakpoints.md) && width < parseInt(breakpoints.lg));
        setIsDesktop(width >= parseInt(breakpoints.lg));
    }, [getScreenSize, getOrientation]);

    // Initialize and set up event listeners
    useEffect(() => {
        // Check touch support
        setIsTouchDevice(checkTouchSupport());

        // Set initial screen info
        updateScreenInfo();

        // Add event listeners
        const handleResize = () => {
            updateScreenInfo();
        };

        const handleOrientationChange = () => {
            // Small delay to ensure dimensions are updated
            setTimeout(updateScreenInfo, 100);
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleOrientationChange);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleOrientationChange);
        };
    }, [checkTouchSupport, updateScreenInfo]);

    // Check if current screen size matches breakpoint
    const isBreakpoint = useCallback((breakpoint) => {
        return screenSize === breakpoint;
    }, [screenSize]);

    // Check if screen size is at least a certain breakpoint
    const isAtLeast = useCallback((breakpoint) => {
        const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
        const currentIndex = breakpointOrder.indexOf(screenSize);
        const targetIndex = breakpointOrder.indexOf(breakpoint);
        return currentIndex >= targetIndex;
    }, [screenSize]);

    // Check if screen size is at most a certain breakpoint
    const isAtMost = useCallback((breakpoint) => {
        const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
        const currentIndex = breakpointOrder.indexOf(screenSize);
        const targetIndex = breakpointOrder.indexOf(breakpoint);
        return currentIndex <= targetIndex;
    }, [screenSize]);

    // Get responsive class based on current screen size
    const getResponsiveClass = useCallback((classes) => {
        if (typeof classes === 'string') return classes;

        const currentSize = screenSize;
        return classes[currentSize] || classes.default || '';
    }, [screenSize]);

    // Check if device is in landscape mode
    const isLandscape = orientation === 'landscape';

    // Check if device is in portrait mode
    const isPortrait = orientation === 'portrait';

    // Get device pixel ratio for high-DPI displays
    const getDevicePixelRatio = useCallback(() => {
        return window.devicePixelRatio || 1;
    }, []);

    // Check if device supports high-DPI
    const isHighDPI = useCallback(() => {
        return getDevicePixelRatio() > 1;
    }, [getDevicePixelRatio]);

    // Get viewport dimensions
    const getViewportDimensions = useCallback(() => {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            ratio: window.innerWidth / window.innerHeight
        };
    }, []);

    // Check if device supports specific features
    const supportsFeature = useCallback((feature) => {
        const featureSupport = {
            touch: isTouchDevice,
            highDPI: isHighDPI(),
            orientation: 'orientation' in window,
            geolocation: 'geolocation' in navigator,
            webGL: 'WebGLRenderingContext' in window,
            serviceWorker: 'serviceWorker' in navigator,
            pushNotifications: 'PushManager' in window,
            webRTC: 'RTCPeerConnection' in window,
            webAudio: 'AudioContext' in window || 'webkitAudioContext' in window
        };

        return featureSupport[feature] || false;
    }, [isTouchDevice, isHighDPI]);

    return {
        // Device type flags
        isMobile,
        isTablet,
        isDesktop,
        isTouchDevice,

        // Screen information
        screenSize,
        orientation,
        isLandscape,
        isPortrait,

        // Breakpoint utilities
        isBreakpoint,
        isAtLeast,
        isAtMost,

        // Responsive utilities
        getResponsiveClass,
        getDevicePixelRatio,
        isHighDPI,
        getViewportDimensions,

        // Feature detection
        supportsFeature,

        // Constants
        breakpoints
    };
};

export default useMobileResponsiveness;


