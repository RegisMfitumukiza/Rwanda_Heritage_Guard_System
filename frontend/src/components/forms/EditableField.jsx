import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Check, X, Save, AlertCircle, History } from 'lucide-react';
import { Button } from '../ui/Button';

const EditableField = ({
    label,
    value,
    onSave,
    onCancel,
    type = 'text',
    placeholder = '',
    disabled = false,
    required = false,
    multiline = false,
    rows = 3,
    maxLength,
    validation,
    className = '',
    showHistory = false,
    onViewHistory,
    lastModified,
    modifiedBy,
    options = [],
    ...props
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value || '');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const inputRef = useRef(null);

    // Update edit value when prop value changes
    useEffect(() => {
        setEditValue(value || '');
    }, [value]);

    // Focus input when editing starts
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            if (type === 'text' && !multiline) {
                inputRef.current.select();
            }
        }
    }, [isEditing, type, multiline]);

    // Handle edit start
    const handleEdit = () => {
        if (disabled) return;
        setIsEditing(true);
        setError('');
    };

    // Handle save
    const handleSave = async () => {
        // Validate field
        if (required && (!editValue || (type !== 'select' && !editValue.trim()))) {
            setError('This field is required');
            return;
        }

        if (validation) {
            const validationError = validation(editValue);
            if (validationError) {
                setError(validationError);
                return;
            }
        }

        // Check if value actually changed
        if (editValue === value) {
            handleCancel();
            return;
        }

        setSaving(true);
        try {
            await onSave(editValue);
            setIsEditing(false);
            setError('');
        } catch (error) {
            console.error('Save failed:', error);
            setError('Failed to save changes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        setEditValue(value || '');
        setIsEditing(false);
        setError('');
        if (onCancel) {
            onCancel();
        }
    };

    // Handle key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !multiline) {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    // Format display value
    const getDisplayValue = () => {
        if (!value || value.toString().trim() === '') {
            return (
                <span className="text-gray-400 dark:text-gray-500 italic">
                    {placeholder || 'Click to add...'}
                </span>
            );
        }
        return value;
    };

    // Check if field has been modified
    const isModified = value !== editValue && isEditing;

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
                        <div className={`${multiline ? 'whitespace-pre-wrap' : 'truncate'} ${disabled ? 'text-gray-500' : 'text-gray-900 dark:text-white'
                            }`}>
                            {getDisplayValue()}
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
                        {/* Input Field */}
                        <div className="relative">
                            {type === 'select' && options.length > 0 ? (
                                <select
                                    ref={inputRef}
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    disabled={saving}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${error
                                        ? 'border-red-300 bg-red-50 dark:border-red-900/10'
                                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                                        } text-gray-900 dark:text-white ${saving ? 'opacity-50' : ''
                                        }`}
                                >
                                    <option value="">{placeholder || 'Select an option'}</option>
                                    {options.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            ) : multiline ? (
                                <textarea
                                    ref={inputRef}
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder={placeholder}
                                    rows={rows}
                                    maxLength={maxLength}
                                    disabled={saving}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${error
                                        ? 'border-red-300 bg-red-50 dark:bg-red-900/10'
                                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                                        } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${saving ? 'opacity-50' : ''
                                        }`}
                                />
                            ) : (
                                <input
                                    ref={inputRef}
                                    type={type}
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder={placeholder}
                                    maxLength={maxLength}
                                    disabled={saving}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${error
                                        ? 'border-red-300 bg-red-50 dark:bg-red-900/10'
                                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                                        } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${saving ? 'opacity-50' : ''
                                        }`}
                                />
                            )}

                            {/* Character Count */}
                            {maxLength && (
                                <div className="absolute top-2 right-2 text-xs text-gray-400">
                                    {editValue.length}/{maxLength}
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2">
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleSave}
                                disabled={saving || (required && (!editValue || (type !== 'select' && !editValue.trim())))}
                                className="flex items-center space-x-1"
                            >
                                {saving ? (
                                    <>
                                        <Save className="w-3 h-3 animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-3 h-3" />
                                        <span>Save</span>
                                    </>
                                )}
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
                            {isModified && (
                                <div className="flex items-center space-x-1 text-xs text-yellow-600 dark:text-yellow-400">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                                    <span>Modified</span>
                                </div>
                            )}
                        </div>

                        {/* Keyboard Shortcuts */}
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Press Enter to save{multiline ? ' (Ctrl+Enter)' : ''}, Esc to cancel
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400"
                    >
                        <AlertCircle className="w-4 h-4" />
                        <span>{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EditableField;



