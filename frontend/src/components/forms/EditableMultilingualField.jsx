import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Check, X, Globe, ChevronDown, AlertCircle, History } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/Button';

const EditableMultilingualField = ({
    label,
    value = {},
    onSave,
    onCancel,
    type = 'text',
    placeholder = {},
    disabled = false,
    required = false,
    rows = 3,
    maxLength,
    validation,
    className = '',
    showHistory = false,
    onViewHistory,
    lastModified,
    modifiedBy,
    ...props
}) => {
    const { currentLanguage, languages } = useLanguage();
    const [isEditing, setIsEditing] = useState(false);
    const [editValues, setEditValues] = useState(value);
    const [activeLanguage, setActiveLanguage] = useState(currentLanguage);
    const [showLanguages, setShowLanguages] = useState(false);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const inputRef = useRef(null);

    // Language configuration
    const languageConfig = {
        en: { label: 'English', flag: '🇺🇸' },
        rw: { label: 'Kinyarwanda', flag: '🇷🇼' },
        fr: { label: 'Français', flag: '🇫🇷' }
    };

    // Update edit values when prop value changes
    useEffect(() => {
        setEditValues(value || {});
    }, [value]);

    // Focus input when editing starts
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            if (type === 'text') {
                inputRef.current.select();
            }
        }
    }, [isEditing, activeLanguage, type]);

    // Handle edit start
    const handleEdit = () => {
        if (disabled) return;
        setIsEditing(true);
        setErrors({});
        setShowLanguages(false);
    };

    // Handle language change
    const handleLanguageChange = (langCode, newValue) => {
        setEditValues(prev => ({
            ...prev,
            [langCode]: newValue
        }));

        // Clear error for this language
        if (errors[langCode]) {
            setErrors(prev => ({
                ...prev,
                [langCode]: undefined
            }));
        }
    };

    // Validate all languages
    const validateAll = () => {
        const newErrors = {};
        let hasValue = false;

        // Check if at least one language has content (for required fields)
        Object.values(editValues).forEach(val => {
            if (val && val.trim()) {
                hasValue = true;
            }
        });

        if (required && !hasValue) {
            newErrors.general = 'This field is required in at least one language';
        }

        // Validate individual languages if validation function provided
        if (validation) {
            languages.forEach(lang => {
                const langValue = editValues[lang.code] || '';
                if (langValue.trim()) {
                    const error = validation(langValue);
                    if (error) {
                        newErrors[lang.code] = error;
                    }
                }
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle save
    const handleSave = async () => {
        if (!validateAll()) {
            return;
        }

        // Check if values actually changed
        const hasChanges = languages.some(lang =>
            (editValues[lang.code] || '') !== (value[lang.code] || '')
        );

        if (!hasChanges) {
            handleCancel();
            return;
        }

        setSaving(true);
        try {
            await onSave(editValues);
            setIsEditing(false);
            setErrors({});
            setShowLanguages(false);
        } catch (error) {
            console.error('Save failed:', error);
            setErrors({ general: 'Failed to save changes. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        setEditValues(value || {});
        setIsEditing(false);
        setErrors({});
        setShowLanguages(false);
        if (onCancel) {
            onCancel();
        }
    };

    // Handle key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !type.includes('textarea')) {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    // Get display value for current language
    const getDisplayValue = () => {
        // Try current language first, then fallback to other languages
        const langOrder = [currentLanguage, 'en', 'rw', 'fr'];

        for (const lang of langOrder) {
            if (value[lang] && value[lang].trim()) {
                return {
                    text: value[lang],
                    language: languageConfig[lang]?.label
                };
            }
        }

        return {
            text: placeholder[currentLanguage] || placeholder.en || 'Click to add...',
            language: null,
            isEmpty: true
        };
    };

    // Get current placeholder
    const getCurrentPlaceholder = () => {
        if (placeholder[activeLanguage]) return placeholder[activeLanguage];
        if (placeholder.en) return placeholder.en;
        return `Enter ${label?.toLowerCase()} in ${languageConfig[activeLanguage]?.label}`;
    };

    // Check for modifications
    const hasModifications = isEditing && languages.some(lang =>
        (editValues[lang.code] || '') !== (value[lang.code] || '')
    );

    const displayValue = getDisplayValue();

    return (
        <div className={`space-y-2 ${className}`} {...props}>
            {/* Label */}
            {label && (
                <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>

                    {/* History Button */}
                    {showHistory && lastModified && (
                        <button
                            type="button"
                            onClick={onViewHistory}
                            className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                            <History className="w-3 h-3" />
                            <span>History</span>
                        </button>
                    )}
                </div>
            )}

            {/* Field Content */}
            <div className="relative">
                {!isEditing ? (
                    /* Display Mode */
                    <div
                        onClick={handleEdit}
                        className={`group relative p-3 border border-transparent rounded-lg cursor-pointer transition-all duration-200 ${disabled
                                ? 'bg-gray-50 dark:bg-gray-800 cursor-not-allowed'
                                : 'hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                    >
                        {/* Display Value */}
                        <div className={`${type === 'textarea' ? 'whitespace-pre-wrap' : 'truncate'} ${disabled ? 'text-gray-500' : displayValue.isEmpty ? 'text-gray-400 dark:text-gray-500 italic' : 'text-gray-900 dark:text-white'
                            }`}>
                            {displayValue.text}
                        </div>

                        {/* Language Indicator */}
                        {displayValue.language && !displayValue.isEmpty && (
                            <div className="flex items-center space-x-1 mt-1">
                                <Globe className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {displayValue.language}
                                </span>
                            </div>
                        )}

                        {/* Completion Indicator */}
                        <div className="flex items-center space-x-1 mt-2">
                            {languages.map((lang) => (
                                <div
                                    key={lang.code}
                                    className={`w-2 h-2 rounded-full ${value[lang.code] && value[lang.code].trim()
                                            ? 'bg-green-500'
                                            : 'bg-gray-300 dark:bg-gray-600'
                                        }`}
                                    title={`${languageConfig[lang.code]?.label}: ${value[lang.code] ? 'Filled' : 'Empty'}`}
                                />
                            ))}
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                {Object.keys(value || {}).filter(lang => value[lang] && value[lang].trim()).length}/{languages.length} languages
                            </span>
                        </div>

                        {/* Edit Icon */}
                        {!disabled && (
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Edit2 className="w-4 h-4 text-gray-400" />
                            </div>
                        )}

                        {/* Last Modified Info */}
                        {lastModified && modifiedBy && (
                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                Last modified {lastModified} by {modifiedBy}
                            </div>
                        )}
                    </div>
                ) : (
                    /* Edit Mode */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-3"
                    >
                        {/* Language Selector */}
                        <div className="flex items-center justify-between">
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
                                            className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20"
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
                                                    {editValues[lang.code] && editValues[lang.code].trim() && (
                                                        <div className="ml-auto w-2 h-2 bg-green-500 rounded-full" />
                                                    )}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Language Indicators */}
                            <div className="flex space-x-1">
                                {languages.map((lang) => (
                                    <div
                                        key={lang.code}
                                        className={`w-2 h-2 rounded-full transition-colors ${editValues[lang.code] && editValues[lang.code].trim()
                                                ? 'bg-green-500'
                                                : lang.code === activeLanguage
                                                    ? 'bg-blue-500'
                                                    : 'bg-gray-300 dark:bg-gray-600'
                                            }`}
                                        title={`${languageConfig[lang.code]?.label}: ${editValues[lang.code] ? 'Filled' : 'Empty'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Input Field */}
                        <div className="relative">
                            {type === 'textarea' ? (
                                <textarea
                                    ref={inputRef}
                                    value={editValues[activeLanguage] || ''}
                                    onChange={(e) => handleLanguageChange(activeLanguage, e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder={getCurrentPlaceholder()}
                                    rows={rows}
                                    maxLength={maxLength}
                                    disabled={saving}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors[activeLanguage] || errors.general
                                            ? 'border-red-300 bg-red-50 dark:bg-red-900/10'
                                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                                        } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${saving ? 'opacity-50' : ''
                                        }`}
                                />
                            ) : (
                                <input
                                    ref={inputRef}
                                    type={type}
                                    value={editValues[activeLanguage] || ''}
                                    onChange={(e) => handleLanguageChange(activeLanguage, e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder={getCurrentPlaceholder()}
                                    maxLength={maxLength}
                                    disabled={saving}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors[activeLanguage] || errors.general
                                            ? 'border-red-300 bg-red-50 dark:bg-red-900/10'
                                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                                        } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${saving ? 'opacity-50' : ''
                                        }`}
                                />
                            )}

                            {/* Character Count */}
                            {maxLength && (
                                <div className="absolute top-2 right-2 text-xs text-gray-400">
                                    {(editValues[activeLanguage] || '').length}/{maxLength}
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2">
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center space-x-1"
                            >
                                <Check className="w-3 h-3" />
                                <span>{saving ? 'Saving...' : 'Save'}</span>
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleCancel}
                                disabled={saving}
                                className="flex items-center space-x-1"
                            >
                                <X className="w-3 h-3" />
                                <span>Cancel</span>
                            </Button>

                            {/* Modified Indicator */}
                            {hasModifications && (
                                <div className="flex items-center space-x-1 text-xs text-yellow-600 dark:text-yellow-400">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                                    <span>Modified</span>
                                </div>
                            )}
                        </div>

                        {/* Keyboard Shortcuts */}
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Press Enter to save{type === 'textarea' ? ' (Ctrl+Enter)' : ''}, Esc to cancel
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Error Messages */}
            <AnimatePresence>
                {(errors[activeLanguage] || errors.general) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400"
                    >
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors[activeLanguage] || errors.general}</span>
                    </motion.div>
                )}
            </AnimatePresence>

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

export default EditableMultilingualField;





