import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Folder,
    Save,
    AlertTriangle,
    Archive,
    Building,
    Hammer,
    Wrench,
    BookOpen,
    Scale,
    Briefcase,
    Newspaper,
    Camera,
    Map,
    FileText,
    Info
} from 'lucide-react';
import { Button } from '../ui/Button';
import { toast } from 'react-hot-toast';
import foldersApi from '../../services/api/foldersApi';

// Icon mapping for folder types
const FOLDER_TYPE_ICONS = {
    GENERAL: Folder,
    HISTORICAL: Archive,
    ARCHAEOLOGICAL: Hammer,
    ARCHITECTURAL: Building,
    CONSERVATION: Wrench,
    RESEARCH: BookOpen,
    LEGAL: Scale,
    ADMINISTRATIVE: Briefcase,
    MEDIA_COVERAGE: Newspaper,
    PHOTOGRAPHS: Camera,
    MAPS: Map,
    REPORTS: FileText
};

const FolderEditModal = ({
    isOpen,
    onClose,
    folder = null, // null for create, folder object for edit
    parentFolder = null, // parent folder for creating subfolders
    siteId,
    existingSiblings = [],
    onSave,
    className = '',
    currentUser = null // Add current user prop
}) => {
    // Determine if this is a subfolder creation - use useMemo to prevent infinite loops
    const isSubfolderCreation = useMemo(() => {
        return folder?.isSubfolder && folder?.parentId;
    }, [folder?.isSubfolder, folder?.parentId]);

    const actualParentFolder = useMemo(() => {
        return parentFolder || (isSubfolderCreation ? { id: folder?.parentId, name: folder?.parentName } : null);
    }, [parentFolder, isSubfolderCreation, folder?.parentId, folder?.parentName]);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'GENERAL'
    });

    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    // Initialize form data
    useEffect(() => {
        console.log('🔍 FolderEditModal - folder prop:', folder);
        console.log('🔍 FolderEditModal - isSubfolderCreation:', isSubfolderCreation);
        console.log('🔍 FolderEditModal - actualParentFolder:', actualParentFolder);

        if (folder) {
            // Edit mode or subfolder creation mode
            setFormData({
                name: folder.name || '',
                description: folder.description || '',
                type: folder.type || 'GENERAL'
            });
        } else {
            // Create mode
            setFormData({
                name: '',
                description: '',
                type: 'GENERAL'
            });
        }
        setErrors({});
    }, [folder, isOpen]); // Only depend on folder and isOpen to prevent infinite loops

    // Handle form field changes
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear field error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        // Validate name
        const nameValidation = foldersApi.validateFolderName(formData.name, existingSiblings);
        if (!nameValidation.valid) {
            newErrors.name = nameValidation.errors[0];
        }

        // Validate description length
        if (formData.description && formData.description.length > 500) {
            newErrors.description = 'Description cannot exceed 500 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);

            const folderData = {
                ...formData,
                name: formData.name.trim(),
                description: formData.description.trim(),
                parentId: actualParentFolder?.id || folder?.parentId || null
            };

            // Debug logging
            console.log('=== FOLDER UPDATE DEBUG ===');
            console.log('Folder ID:', folder?.id);
            console.log('Form Data:', formData);
            console.log('Folder Data being sent:', folderData);

            let result;
            if (folder && !isSubfolderCreation) {
                // Update existing folder
                result = await foldersApi.updateFolder(folder.id, folderData);
                toast.success('Folder updated successfully');
            } else {
                // Create new folder or subfolder
                result = await foldersApi.createFolder(folderData, siteId);
                if (isSubfolderCreation) {
                    toast.success(`Subfolder "${folderData.name}" created successfully`);
                } else {
                    toast.success('Folder created successfully');
                }
            }

            // Notify parent component
            if (onSave) {
                onSave(result);
            }

            // Close modal
            onClose();

        } catch (error) {
            console.error('Failed to save folder:', error);
            if (isSubfolderCreation) {
                toast.error('Failed to create subfolder');
            } else {
                toast.error(folder ? 'Failed to update folder' : 'Failed to create folder');
            }
        } finally {
            setSaving(false);
        }
    };

    // Handle modal close
    const handleClose = () => {
        if (!saving) {
            onClose();
        }
    };

    // Get folder types
    const folderTypes = foldersApi.getFolderTypes();

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-hidden"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-sm sm:max-w-md max-h-[75vh] flex flex-col overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                    style={{ maxHeight: '75vh', height: '75vh' }}
                >
                    <form onSubmit={handleSubmit} className="flex flex-col h-full">
                        {/* Header - Always visible */}
                        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {isSubfolderCreation ? 'Create Subfolder' : folder ? 'Edit Folder' : 'Create New Folder'}
                            </h3>
                            {!saving && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClose}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>

                        {/* Content - Scrollable */}
                        <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto min-h-0" style={{ maxHeight: '40vh' }}>
                            {/* Parent Folder Info */}
                            {actualParentFolder && (
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <div className="flex items-center space-x-2 text-sm text-blue-800 dark:text-blue-200">
                                        <Info className="w-4 h-4" />
                                        <span>Creating subfolder in:</span>
                                        <span className="font-medium">{actualParentFolder.name}</span>
                                    </div>
                                </div>
                            )}

                            {/* Folder Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Folder Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    placeholder="Enter folder name"
                                    maxLength={100}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${errors.name ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                    disabled={saving}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center space-x-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        <span>{errors.name}</span>
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {formData.name.length}/100 characters
                                </p>
                            </div>

                            {/* Folder Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Folder Type <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(folderTypes).map(([key, typeInfo]) => {
                                        const TypeIcon = FOLDER_TYPE_ICONS[key] || Folder;
                                        const isSelected = formData.type === key;

                                        return (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => handleChange('type', key)}
                                                disabled={saving}
                                                className={`p-3 border rounded-lg text-left transition-all ${isSelected
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                    }`}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <TypeIcon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-400'
                                                        }`} />
                                                    <span className={`text-xs font-medium ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {typeInfo.name}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    placeholder="Optional description for this folder"
                                    rows={3}
                                    maxLength={500}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none ${errors.description ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                    disabled={saving}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center space-x-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        <span>{errors.description}</span>
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {formData.description.length}/500 characters
                                </p>
                            </div>



                        </div>

                        {/* Footer - Always visible */}
                        <div className="flex items-center justify-end space-x-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={saving || !formData.name.trim()}
                                className="flex items-center space-x-2"
                            >
                                {saving ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                <span>{saving ? 'Saving...' : (isSubfolderCreation ? 'Create Subfolder' : folder ? 'Update Folder' : 'Create Folder')}</span>
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default FolderEditModal;





