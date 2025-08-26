import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Save,
    Folder,
    Plus,
    Trash2,
    AlertTriangle,
    CheckCircle,
    ChevronDown
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { toast } from 'react-hot-toast';
import foldersApi from '../../services/api/foldersApi';

const BulkFolderCreationModal = ({
    isOpen,
    onClose,
    siteId,
    onSave,
    className = ''
}) => {
    const [folders, setFolders] = useState([
        { name: '', type: 'GENERAL', description: '' }
    ]);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    // Predefined folder templates for common heritage site structures
    const folderTemplates = {
        'HISTORICAL_SITE': [
            { name: 'Historical Records', type: 'HISTORICAL', description: 'Historical documentation and archives' },
            { name: 'Archaeological Findings', type: 'ARCHAEOLOGICAL', description: 'Archaeological reports and findings' },
            { name: 'Site Surveys', type: 'MAPS', description: 'Site surveys and mapping data' },
            { name: 'Conservation Reports', type: 'CONSERVATION', description: 'Conservation and restoration records' }
        ],
        'MUSEUM': [
            { name: 'Exhibition Records', type: 'GENERAL', description: 'Exhibition documentation and records' },
            { name: 'Collection Management', type: 'ADMINISTRATIVE', description: 'Collection management documents' },
            { name: 'Research Papers', type: 'RESEARCH', description: 'Research and academic papers' },
            { name: 'Media Coverage', type: 'MEDIA_COVERAGE', description: 'Press coverage and media files' }
        ],
        'ARCHAEOLOGICAL_SITE': [
            { name: 'Excavation Reports', type: 'ARCHAEOLOGICAL', description: 'Excavation reports and findings' },
            { name: 'Artifact Documentation', type: 'GENERAL', description: 'Artifact documentation and records' },
            { name: 'Site Plans', type: 'ARCHITECTURAL', description: 'Site architectural plans and layouts' },
            { name: 'Legal Documents', type: 'LEGAL', description: 'Legal and compliance documents' }
        ]
    };

    const addFolder = () => {
        setFolders([...folders, { name: '', type: 'GENERAL', description: '' }]);
    };

    const removeFolder = (index) => {
        if (folders.length > 1) {
            setFolders(folders.filter((_, i) => i !== index));
        }
    };

    const updateFolder = (index, field, value) => {
        const newFolders = [...folders];
        newFolders[index] = { ...newFolders[index], [field]: value };
        setFolders(newFolders);
    };

    const loadTemplate = (templateKey) => {
        const template = folderTemplates[templateKey];
        if (template) {
            setFolders(template);
            toast.success(`Loaded ${templateKey.replace('_', ' ').toLowerCase()} template with ${template.length} folders`);
        }
    };

    const validateFolders = () => {
        const newErrors = {};

        folders.forEach((folder, index) => {
            if (!folder.name.trim()) {
                newErrors[`folder_${index}_name`] = 'Folder name is required';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateFolders()) {
            return;
        }

        try {
            setSaving(true);

            // Create folders sequentially
            const createdFolders = [];
            for (const folder of folders) {
                if (folder.name.trim()) {
                    // Backend will automatically set createdDate, createdBy, isActive, etc.
                    const folderData = {
                        ...folder
                    };
                    const result = await foldersApi.createFolder(folderData, siteId);
                    createdFolders.push(result);
                }
            }

            toast.success(`Successfully created ${createdFolders.length} folders`);

            if (onSave) {
                onSave(createdFolders);
            }

            onClose();
        } catch (error) {
            console.error('Failed to create folders:', error);
            toast.error('Failed to create some folders');
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        if (!saving) {
            setFolders([{ name: '', type: 'GENERAL', description: '' }]);
            setErrors({});
            onClose();
        }
    };

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
                    className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                    style={{ maxHeight: '90vh' }}
                >
                    <form onSubmit={handleSubmit} className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Bulk Folder Creation
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Create multiple folders at once for efficient organization
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleClose}
                                disabled={saving}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Content */}
                        <div className="bulk-folder-modal p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto min-h-0" style={{ maxHeight: 'calc(90vh - 200px)' }}>
                            {/* Template Selection */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-md font-medium text-gray-900 dark:text-white">
                                        Quick Templates
                                    </h4>
                                    {folders.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setFolders([{ name: '', type: 'GENERAL', description: '' }]);
                                                setErrors({});
                                                toast.success('Cleared template, starting with empty folder');
                                            }}
                                            disabled={saving}
                                            className="text-xs text-gray-600 hover:text-gray-700 border-gray-300"
                                            title="Clear template and start over"
                                        >
                                            Clear Template
                                        </Button>
                                    )}
                                </div>
                                <div className="flex space-x-2">
                                    {Object.keys(folderTemplates).map(templateKey => (
                                        <Button
                                            key={templateKey}
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => loadTemplate(templateKey)}
                                            disabled={saving}
                                            className="text-xs"
                                        >
                                            {templateKey.replace('_', ' ')}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Folder List */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <h4 className="text-md font-medium text-gray-900 dark:text-white">
                                            Folders to Create
                                        </h4>
                                        <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                                            {folders.filter(f => f.name.trim()).length} folder{folders.filter(f => f.name.trim()).length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {folders.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    if (window.confirm('Are you sure you want to remove all folders? This action cannot be undone.')) {
                                                        setFolders([{ name: '', type: 'GENERAL', description: '' }]);
                                                        setErrors({});
                                                    }
                                                }}
                                                disabled={saving}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-300 dark:border-red-600"
                                                title="Remove all folders"
                                            >
                                                <Trash2 className="w-3 h-3 mr-1" />
                                                Remove All
                                            </Button>
                                        )}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addFolder}
                                            disabled={saving}
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Folder
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {folders.map((folder, index) => (
                                        <div
                                            key={index}
                                            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Folder {index + 1}
                                                </h5>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeFolder(index)}
                                                    disabled={saving || folders.length === 1}
                                                    className={`h-7 px-2 text-xs transition-colors ${folders.length === 1
                                                            ? 'text-gray-400 cursor-not-allowed'
                                                            : 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-300 dark:border-red-600'
                                                        }`}
                                                    title={folders.length === 1 ? "Cannot remove the last folder" : "Remove this folder"}
                                                >
                                                    <Trash2 className="w-3 h-3 mr-1" />
                                                    Remove
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {/* Folder Name */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Name <span className="text-red-500">*</span>
                                                    </label>
                                                    <Input
                                                        value={folder.name}
                                                        onChange={(e) => updateFolder(index, 'name', e.target.value)}
                                                        placeholder="Folder name"
                                                        disabled={saving}
                                                        className={errors[`folder_${index}_name`] ? 'border-red-300' : ''}
                                                    />
                                                    {errors[`folder_${index}_name`] && (
                                                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                                            {errors[`folder_${index}_name`]}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Folder Type */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Type
                                                    </label>
                                                    <select
                                                        value={folder.type}
                                                        onChange={(e) => updateFolder(index, 'type', e.target.value)}
                                                        disabled={saving}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                    >
                                                        <option value="GENERAL">General</option>
                                                        <option value="HISTORICAL">Historical Records</option>
                                                        <option value="ARCHAEOLOGICAL">Archaeological</option>
                                                        <option value="ARCHITECTURAL">Architectural</option>
                                                        <option value="CONSERVATION">Conservation</option>
                                                        <option value="RESEARCH">Research</option>
                                                        <option value="LEGAL">Legal</option>
                                                        <option value="ADMINISTRATIVE">Administrative</option>
                                                        <option value="MEDIA_COVERAGE">Media Coverage</option>
                                                        <option value="PHOTOGRAPHS">Photographs</option>
                                                        <option value="MAPS">Maps</option>
                                                        <option value="REPORTS">Reports</option>
                                                    </select>
                                                </div>

                                                {/* Description */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Description
                                                    </label>
                                                    <Input
                                                        value={folder.description}
                                                        onChange={(e) => updateFolder(index, 'description', e.target.value)}
                                                        placeholder="Optional description"
                                                        disabled={saving}
                                                    />
                                                </div>


                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Scroll to Bottom Button - Only show when there are many folders */}
                            {folders.length > 2 && (
                                <div className="flex justify-center">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const modal = document.querySelector('.bulk-folder-modal');
                                            if (modal) {
                                                modal.scrollTo({
                                                    top: modal.scrollHeight,
                                                    behavior: 'smooth'
                                                });
                                            }
                                        }}
                                        className="text-xs"
                                    >
                                        <ChevronDown className="w-3 h-3 mr-1" />
                                        Scroll to Bottom
                                    </Button>
                                </div>
                            )}

                            {/* Summary */}
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
                                        <CheckCircle className="w-4 h-4" />
                                        <span className="font-medium">Summary</span>
                                    </div>
                                    <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                                        {folders.filter(f => f.name.trim()).length} folder{folders.filter(f => f.name.trim()).length !== 1 ? 's' : ''} ready
                                    </span>
                                </div>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    Ready to create {folders.filter(f => f.name.trim()).length} folders.
                                    This will establish the organizational structure for your heritage site.
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
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
                                disabled={saving || folders.filter(f => f.name.trim()).length === 0}
                                className="flex items-center space-x-2"
                            >
                                {saving ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Folder className="w-4 h-4" />
                                )}
                                <span>
                                    {saving ? 'Creating...' : `Create ${folders.filter(f => f.name.trim()).length} Folders`}
                                </span>
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default BulkFolderCreationModal;
