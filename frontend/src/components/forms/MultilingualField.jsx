import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/Button';

const MultilingualField = ({
    label,
    name,
    value = {},
    onChange,
    error = {},
    type = 'text',
    placeholder = {},
    required = false,
    rows = 3,
    className = '',
    ...props
}) => {
    const { currentLanguage, languages } = useLanguage();
    const [activeLanguage, setActiveLanguage] = useState(currentLanguage);
    const [showLanguages, setShowLanguages] = useState(false);

    // Language configuration
    const languageConfig = {
        en: { label: 'English', flag: '🇺🇸' },
        rw: { label: 'Kinyarwanda', flag: '🇷🇼' },
        fr: { label: 'Français', flag: '🇫🇷' }
    };

    // Handle input change
    const handleChange = (lang, newValue) => {
        const updatedValue = {
            ...value,
            [lang]: newValue
        };
        onChange(name, updatedValue);
    };

    // Check if field has content in any language
    const hasContent = Object.values(value || {}).some(val => val && val.trim());

    // Check if required field is missing
    const isMissingRequired = required && !hasContent;

    // Get placeholder for current language
    const getCurrentPlaceholder = () => {
        if (placeholder[activeLanguage]) return placeholder[activeLanguage];
        if (placeholder.en) return placeholder.en;
        return `Enter ${label.toLowerCase()} in ${languageConfig[activeLanguage]?.label}`;
    };

    return (
        <div className={`space-y-3 ${className}`} {...props}>
            {/* Label */}
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {/* Language Selector */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowLanguages(!showLanguages)}
                        className="flex items-center space-x-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <span className="text-lg">{languageConfig[activeLanguage]?.flag}</span>
                        <span className="text-gray-700 dark:text-gray-300">
                            {languageConfig[activeLanguage]?.label}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>

                    {/* Language Dropdown */}
                    <AnimatePresence>
                        {showLanguages && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20"
                            >
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        type="button"
                                        onClick={() => {
                                            setActiveLanguage(lang.code);
                                            setShowLanguages(false);
                                        }}
                                        className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${activeLanguage === lang.code ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                            }`}
                                    >
                                        <span className="text-lg">{languageConfig[lang.code]?.flag}</span>
                                        <span className="text-sm text-gray-900 dark:text-white">
                                            {languageConfig[lang.code]?.label}
                                        </span>
                                        {value[lang.code] && (
                                            <div className="ml-auto w-2 h-2 bg-green-500 rounded-full" />
                                        )}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Input Field */}
            <div className="relative">
                {type === 'textarea' ? (
                    <textarea
                        value={value[activeLanguage] || ''}
                        onChange={(e) => handleChange(activeLanguage, e.target.value)}
                        placeholder={getCurrentPlaceholder()}
                        rows={rows}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${error[activeLanguage]
                                ? 'border-red-300 bg-red-50 dark:bg-red-900/10'
                                : isMissingRequired
                                    ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10'
                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                            } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                    />
                ) : (
                    <input
                        type={type}
                        value={value[activeLanguage] || ''}
                        onChange={(e) => handleChange(activeLanguage, e.target.value)}
                        placeholder={getCurrentPlaceholder()}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${error[activeLanguage]
                                ? 'border-red-300 bg-red-50 dark:bg-red-900/10'
                                : isMissingRequired
                                    ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10'
                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                            } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                    />
                )}

                {/* Language Indicator */}
                <div className="absolute top-2 right-2 flex space-x-1">
                    {languages.map((lang) => (
                        <div
                            key={lang.code}
                            className={`w-2 h-2 rounded-full transition-colors ${value[lang.code] && value[lang.code].trim()
                                    ? 'bg-green-500'
                                    : lang.code === activeLanguage
                                        ? 'bg-blue-500'
                                        : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                            title={`${languageConfig[lang.code]?.label}: ${value[lang.code] ? 'Filled' : 'Empty'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Error Messages */}
            <AnimatePresence>
                {(error[activeLanguage] || isMissingRequired) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-sm text-red-600 dark:text-red-400"
                    >
                        {error[activeLanguage] || (isMissingRequired && `${label} is required in at least one language`)}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Help Text */}
            <div className="text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                    <Globe className="w-3 h-3" />
                    <span>
                        Fill in {languages.length} languages.
                        {Object.keys(value || {}).filter(lang => value[lang] && value[lang].trim()).length > 0 && (
                            <span className="text-green-600 dark:text-green-400 ml-1">
                                ({Object.keys(value || {}).filter(lang => value[lang] && value[lang].trim()).length}/{languages.length} completed)
                            </span>
                        )}
                    </span>
                </div>
            </div>

            {/* Click outside to close dropdown */}
            {showLanguages && (
                <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowLanguages(false)}
                />
            )}
        </div>
    );
};

export default MultilingualField;



