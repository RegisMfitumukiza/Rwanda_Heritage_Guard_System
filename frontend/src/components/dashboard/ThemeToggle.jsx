import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../ui/Button';

const ThemeToggle = ({
    showLabel = false,
    variant = 'icon', // 'icon', 'button', 'dropdown'
    className = '',
    transparent = false, // when nav is transparent on hero
    ...props
}) => {
    const { theme, isDark, toggleTheme, setLightMode, setDarkMode, setSystemMode } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Theme options
    const themeOptions = [
        {
            value: 'light',
            label: 'Light',
            icon: Sun,
            description: 'Light theme'
        },
        {
            value: 'dark',
            label: 'Dark',
            icon: Moon,
            description: 'Dark theme'
        },
        {
            value: 'system',
            label: 'System',
            icon: Monitor,
            description: 'Follow system preference'
        }
    ];

    // Get current theme option
    const getCurrentTheme = () => {
        const savedTheme = localStorage.getItem('heritageguard-theme');
        if (!savedTheme) return 'system';
        return savedTheme;
    };

    const currentTheme = getCurrentTheme();

    // Handle theme change
    const handleThemeChange = (newTheme) => {
        switch (newTheme) {
            case 'light':
                setLightMode();
                break;
            case 'dark':
                setDarkMode();
                break;
            case 'system':
                setSystemMode();
                break;
            default:
                toggleTheme();
        }
        setIsOpen(false);
    };

    // Click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Simple icon toggle variant
    if (variant === 'icon') {
        return (
            <button
                onClick={toggleTheme}
                className={`p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 ${className}`}
                {...props}
            >
                <motion.div
                    key={isDark ? 'dark' : 'light'}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                >
                    {isDark ? (
                        <Sun className="w-5 h-5" />
                    ) : (
                        <Moon className="w-5 h-5" />
                    )}
                </motion.div>
            </button>
        );
    }

    // Button variant with label
    if (variant === 'button') {
        return (
            <Button
                variant="ghost"
                onClick={toggleTheme}
                className={`space-x-2 ${className}`}
                {...props}
            >
                <motion.div
                    key={isDark ? 'dark' : 'light'}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                >
                    {isDark ? (
                        <Sun className="w-4 h-4" />
                    ) : (
                        <Moon className="w-4 h-4" />
                    )}
                </motion.div>
                {showLabel && (
                    <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                )}
            </Button>
        );
    }

    // Dropdown variant with all options
    if (variant === 'dropdown') {
        const triggerClasses = transparent
            ? 'p-2 text-white hover:text-white/90 hover:bg-white/10 rounded-lg transition-all duration-200'
            : 'p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200';
        return (
            <div ref={dropdownRef} className={`relative ${className}`} {...props}>
                {/* Trigger Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={triggerClasses}
                >
                    <motion.div
                        key={isDark ? 'dark' : 'light'}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        {isDark ? (
                            <Moon className="w-5 h-5" />
                        ) : (
                            <Sun className="w-5 h-5" />
                        )}
                    </motion.div>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-1"
                        >
                            {themeOptions.map((option) => {
                                const IconComponent = option.icon;
                                const isSelected = currentTheme === option.value;

                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => handleThemeChange(option.value)}
                                        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <IconComponent className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {option.label}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {option.description}
                                                </div>
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <Check className="w-4 h-4 text-blue-500" />
                                        )}
                                    </button>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return null;
};

export default ThemeToggle;



