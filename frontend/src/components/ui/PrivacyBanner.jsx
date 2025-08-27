import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Cookie, X, Check, Settings } from 'lucide-react';
import { Button } from './Button';

const PrivacyBanner = ({
    onAccept,
    onDecline,
    onCustomize,
    showSettings = false,
    className = '',
    position = 'bottom', // 'bottom' or 'top'
    showAnalytics = true,
    showMarketing = false,
    showNecessary = true
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [showCustomSettings, setShowCustomSettings] = useState(false);
    const [cookiePreferences, setCookiePreferences] = useState({
        necessary: true, // Always true, cannot be disabled
        analytics: showAnalytics,
        marketing: showMarketing
    });

    useEffect(() => {
        // Check if user has already made a choice
        const hasConsent = localStorage.getItem('cookie-consent');
        if (!hasConsent) {
            setIsVisible(true);
        }
    }, []);

    const handleAcceptAll = () => {
        const preferences = {
            necessary: true,
            analytics: true,
            marketing: true,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('cookie-consent', JSON.stringify(preferences));
        setIsVisible(false);

        if (onAccept) {
            onAccept(preferences);
        }
    };

    const handleDecline = () => {
        const preferences = {
            necessary: true,
            analytics: false,
            marketing: false,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('cookie-consent', JSON.stringify(preferences));
        setIsVisible(false);

        if (onDecline) {
            onDecline(preferences);
        }
    };

    const handleCustomSave = () => {
        const preferences = {
            ...cookiePreferences,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('cookie-consent', JSON.stringify(preferences));
        setShowCustomSettings(false);
        setIsVisible(false);

        if (onAccept) {
            onAccept(preferences);
        }
    };

    const handleCustomize = () => {
        setShowCustomSettings(true);
    };

    const updatePreference = (key, value) => {
        setCookiePreferences(prev => ({
            ...prev,
            [key]: value
        }));
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                className={`fixed ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg ${className}`}
                initial={{ y: position === 'top' ? -100 : 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: position === 'top' ? -100 : 100, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    {!showCustomSettings ? (
                        // Main banner
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                                        <Cookie className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                        Cookie Preferences
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        We use cookies to enhance your experience, analyze site traffic, and personalize content.
                                        By continuing to use this site, you consent to our use of cookies.
                                    </p>
                                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        <a
                                            href="/privacy-policy"
                                            className="text-blue-600 dark:text-blue-400 hover:underline"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Privacy Policy
                                        </a>
                                        {' • '}
                                        <a
                                            href="/cookie-policy"
                                            className="text-blue-600 dark:text-blue-400 hover:underline"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Cookie Policy
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCustomize}
                                    className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    <Settings className="w-4 h-4 mr-2" />
                                    Customize
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDecline}
                                    className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    Decline
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleAcceptAll}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    Accept All
                                </Button>
                            </div>
                        </div>
                    ) : (
                        // Custom settings
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Cookie Settings
                                </h3>
                                <button
                                    onClick={() => setShowCustomSettings(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {/* Necessary Cookies */}
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Shield className="w-5 h-5 text-green-600" />
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-gray-100">Necessary Cookies</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Essential for the website to function properly
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={cookiePreferences.necessary}
                                            disabled
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <span className="ml-2 text-xs text-gray-500">Always Active</span>
                                    </div>
                                </div>

                                {/* Analytics Cookies */}
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                                            <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-gray-100">Analytics Cookies</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Help us understand how visitors interact with our website
                                            </p>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={cookiePreferences.analytics}
                                        onChange={(e) => updatePreference('analytics', e.target.checked)}
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>

                                {/* Marketing Cookies */}
                                {showMarketing && (
                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                                                <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-gray-100">Marketing Cookies</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Used to deliver personalized advertisements
                                                </p>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={cookiePreferences.marketing}
                                            onChange={(e) => updatePreference('marketing', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowCustomSettings(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleCustomSave}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Check className="w-4 h-4 mr-2" />
                                    Save Preferences
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PrivacyBanner;

