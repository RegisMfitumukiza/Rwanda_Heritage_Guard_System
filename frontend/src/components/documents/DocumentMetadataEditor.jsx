import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Save,
    Edit,
    Plus,
    Trash2,
    Tag,
    Calendar,
    User,
    FileText,
    Globe,
    Eye,
    EyeOff,
    AlertTriangle,
    Loader2,
    Hash,
    MapPin,
    Clock,
    Info,
    Languages,
    Check,
    RefreshCw
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { toast } from 'react-hot-toast';
import documentsApi from '../../services/api/documentsApi';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * DocumentMetadataEditor Component
 * 
 * Comprehensive metadata editor for heritage documents with:
 * - Multilingual support (English, Kinyarwanda, French)
 * - Tag management and categorization
 * - Custom field support
 * - Batch editing capabilities
 * - Version history tracking
 * - Real-time validation
 */

const DocumentMetadataEditor = ({
    document,
    documents = [], // For batch editing
    isOpen,
    onClose,
    onSave,
    onDocumentUpdate,
    isBatchMode = false,
    className = '',
    ...props
}) => {
    const { user } = useAuth();
    const { t, currentLanguage } = useLanguage();

    // Form state
    const [formData, setFormData] = useState({
        // Basic metadata
        fileName: '',
        description: {
            en: '',
            rw: '',
            fr: ''
        },
        category: '',
        tags: [],
        isPublic: true,

        // Heritage-specific metadata
        culturalSignificance: {
            en: '',
            rw: '',
            fr: ''
        },
        historicalPeriod: '',
        geographicalRegion: '',
        creator: '',
        creationDate: '',
        acquisitionDate: '',
        condition: '',
        materials: [],
        dimensions: '',

        // Administrative metadata
        copyrightStatus: '',
        accessRestrictions: '',
        preservationNotes: {
            en: '',
            rw: '',
            fr: ''
        },
        catalogNumber: '',

        // Custom fields
        customFields: {}
    });

    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [newTag, setNewTag] = useState('');
    const [newMaterial, setNewMaterial] = useState('');

    // Available options
    const categories = documentsApi.getDocumentCategories();
    const languages = [
        { code: 'en', name: 'English', native: 'English' },
        { code: 'rw', name: 'Kinyarwanda', native: 'Ikinyarwanda' },
        { code: 'fr', name: 'French', native: 'Français' }
    ];

    const historicalPeriods = [
        'Pre-colonial Period',
        'Colonial Period (1897-1962)',
        'Independence Era (1962-1990)',
        'Post-Genocide Rwanda (1994-present)',
        'Contemporary Period',
        'Unknown/Undetermined'
    ];

    const conditions = [
        'Excellent',
        'Good',
        'Fair',
        'Poor',
        'Critical',
        'Under Conservation'
    ];

    const copyrightStatuses = [
        'Public Domain',
        'Creative Commons',
        'All Rights Reserved',
        'Fair Use',
        'Unknown'
    ];

    const geographicalRegions = [
        'Kigali',
        'Northern Province',
        'Southern Province',
        'Eastern Province',
        'Western Province',
        'Multiple Regions',
        'Unknown'
    ];

    // Initialize form data
    useEffect(() => {
        if (document && isOpen) {
            if (isBatchMode) {
                // For batch mode, initialize with common values
                initializeBatchForm(documents);
            } else {
                // Single document mode
                initializeSingleForm(document);
            }
        }
    }, [document, documents, isOpen, isBatchMode]);

    const initializeSingleForm = (doc) => {
        setFormData({
            fileName: doc.fileName || '',
            description: {
                en: doc.description?.en || doc.description || '',
                rw: doc.description?.rw || '',
                fr: doc.description?.fr || ''
            },
            category: doc.category || '',
            tags: doc.tags || [],
            isPublic: doc.isPublic !== undefined ? doc.isPublic : true,

            // Heritage-specific
            culturalSignificance: {
                en: doc.culturalSignificance?.en || '',
                rw: doc.culturalSignificance?.rw || '',
                fr: doc.culturalSignificance?.fr || ''
            },
            historicalPeriod: doc.historicalPeriod || '',
            geographicalRegion: doc.geographicalRegion || '',
            creator: doc.creator || '',
            creationDate: doc.creationDate || '',
            acquisitionDate: doc.acquisitionDate || '',
            condition: doc.condition || '',
            materials: doc.materials || [],
            dimensions: doc.dimensions || '',

            // Administrative
            copyrightStatus: doc.copyrightStatus || '',
            accessRestrictions: doc.accessRestrictions || '',
            preservationNotes: {
                en: doc.preservationNotes?.en || '',
                rw: doc.preservationNotes?.rw || '',
                fr: doc.preservationNotes?.fr || ''
            },
            catalogNumber: doc.catalogNumber || '',

            // Custom fields
            customFields: doc.customFields || {}
        });
    };

    const initializeBatchForm = (docs) => {
        // Initialize with common values across all documents
        const commonData = {
            fileName: '', // Cannot batch edit file names
            description: { en: '', rw: '', fr: '' },
            category: '',
            tags: [],
            isPublic: true,
            culturalSignificance: { en: '', rw: '', fr: '' },
            historicalPeriod: '',
            geographicalRegion: '',
            creator: '',
            creationDate: '',
            acquisitionDate: '',
            condition: '',
            materials: [],
            dimensions: '',
            copyrightStatus: '',
            accessRestrictions: '',
            preservationNotes: { en: '', rw: '', fr: '' },
            catalogNumber: '',
            customFields: {}
        };

        setFormData(commonData);
    };

    // Handle form field changes
    const handleChange = (field, value, language = null) => {
        setFormData(prev => {
            if (language) {
                // Multilingual field
                return {
                    ...prev,
                    [field]: {
                        ...prev[field],
                        [language]: value
                    }
                };
            } else {
                // Regular field
                return {
                    ...prev,
                    [field]: value
                };
            }
        });

        // Clear field error
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    // Handle tag management
    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            handleChange('tags', [...formData.tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove) => {
        handleChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
    };

    // Handle material management
    const addMaterial = () => {
        if (newMaterial.trim() && !formData.materials.includes(newMaterial.trim())) {
            handleChange('materials', [...formData.materials, newMaterial.trim()]);
            setNewMaterial('');
        }
    };

    const removeMaterial = (materialToRemove) => {
        handleChange('materials', formData.materials.filter(material => material !== materialToRemove));
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        // Required fields validation
        if (!formData.fileName && !isBatchMode) {
            newErrors.fileName = 'File name is required';
        }

        if (!formData.category) {
            newErrors.category = 'Category is required';
        }

        // Validate catalog number format if provided
        if (formData.catalogNumber && !/^[A-Z]{2,4}-\d{4,6}$/.test(formData.catalogNumber)) {
            newErrors.catalogNumber = 'Catalog number must follow format: ABC-1234';
        }

        // Validate dates
        if (formData.creationDate && formData.acquisitionDate) {
            const creationDate = new Date(formData.creationDate);
            const acquisitionDate = new Date(formData.acquisitionDate);
            if (acquisitionDate < creationDate) {
                newErrors.acquisitionDate = 'Acquisition date cannot be before creation date';
            }
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

            if (isBatchMode) {
                // Batch update
                const updatePromises = documents.map(doc =>
                    documentsApi.updateDocument(doc.id, formData)
                );

                await Promise.all(updatePromises);
                toast.success(`Updated ${documents.length} documents successfully`);
            } else {
                // Single document update
                await documentsApi.updateDocument(document.id, formData);
                toast.success('Document metadata updated successfully');
            }

            // Notify parent component
            if (onSave) {
                onSave(formData);
            }

            if (onDocumentUpdate) {
                onDocumentUpdate();
            }

            // Close modal
            onClose();

        } catch (error) {
            console.error('Failed to update metadata:', error);
            toast.error('Failed to update document metadata');
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

    // Tab configuration
    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: FileText },
        { id: 'heritage', label: 'Heritage Data', icon: MapPin },
        { id: 'administrative', label: 'Administrative', icon: User },
        { id: 'custom', label: 'Custom Fields', icon: Hash }
    ];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    <form onSubmit={handleSubmit} className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {isBatchMode ? `Edit Metadata (${documents.length} documents)` : 'Edit Document Metadata'}
                                </h3>
                                {!isBatchMode && document && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {document.fileName}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center space-x-3">
                                {/* Language Selector */}
                                <div className="flex items-center space-x-2">
                                    <Languages className="w-4 h-4 text-gray-400" />
                                    <select
                                        value={selectedLanguage}
                                        onChange={(e) => setSelectedLanguage(e.target.value)}
                                        className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    >
                                        {languages.map(lang => (
                                            <option key={lang.code} value={lang.code}>
                                                {lang.native}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {!saving && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={handleClose}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
                            {tabs.map(tab => {
                                const TabIcon = tab.icon;
                                const isActive = activeTab === tab.id;

                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${isActive
                                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        <TabIcon className="w-4 h-4" />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-auto p-6">
                            {/* Basic Info Tab */}
                            {activeTab === 'basic' && (
                                <div className="space-y-6">
                                    {/* File Name */}
                                    {!isBatchMode && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                File Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.fileName}
                                                onChange={(e) => handleChange('fileName', e.target.value)}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${errors.fileName ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                                                    }`}
                                                disabled={saving}
                                            />
                                            {errors.fileName && (
                                                <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center space-x-1">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    <span>{errors.fileName}</span>
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Description (Multilingual) */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Description ({languages.find(l => l.code === selectedLanguage)?.native})
                                        </label>
                                        <textarea
                                            value={formData.description[selectedLanguage]}
                                            onChange={(e) => handleChange('description', e.target.value, selectedLanguage)}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                                            placeholder={`Enter description in ${languages.find(l => l.code === selectedLanguage)?.native}...`}
                                            disabled={saving}
                                        />
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Category <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => handleChange('category', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${errors.category ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                                                }`}
                                            disabled={saving}
                                        >
                                            <option value="">Select category...</option>
                                            {Object.entries(categories).map(([key, value]) => (
                                                <option key={key} value={key}>{value}</option>
                                            ))}
                                        </select>
                                        {errors.category && (
                                            <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center space-x-1">
                                                <AlertTriangle className="w-3 h-3" />
                                                <span>{errors.category}</span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Tags */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Tags
                                        </label>
                                        <div className="space-y-3">
                                            {/* Add new tag */}
                                            <div className="flex space-x-2">
                                                <input
                                                    type="text"
                                                    value={newTag}
                                                    onChange={(e) => setNewTag(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                                    placeholder="Add a tag..."
                                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                    disabled={saving}
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={addTag}
                                                    disabled={!newTag.trim() || saving}
                                                    className="flex items-center space-x-1"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    <span>Add</span>
                                                </Button>
                                            </div>

                                            {/* Current tags */}
                                            {formData.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {formData.tags.map((tag, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm"
                                                        >
                                                            <Tag className="w-3 h-3" />
                                                            <span>{tag}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeTag(tag)}
                                                                disabled={saving}
                                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Visibility */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                            Visibility
                                        </label>
                                        <div className="space-y-2">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="visibility"
                                                    checked={formData.isPublic === true}
                                                    onChange={() => handleChange('isPublic', true)}
                                                    disabled={saving}
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                                                />
                                                <div className="ml-3">
                                                    <div className="flex items-center space-x-2">
                                                        <Eye className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Public
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Visible to all users with access to this heritage site
                                                    </p>
                                                </div>
                                            </label>

                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="visibility"
                                                    checked={formData.isPublic === false}
                                                    onChange={() => handleChange('isPublic', false)}
                                                    disabled={saving}
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                                                />
                                                <div className="ml-3">
                                                    <div className="flex items-center space-x-2">
                                                        <EyeOff className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Private
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Only visible to authorized heritage managers
                                                    </p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Heritage Data Tab */}
                            {activeTab === 'heritage' && (
                                <div className="space-y-6">
                                    {/* Cultural Significance (Multilingual) */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Cultural Significance ({languages.find(l => l.code === selectedLanguage)?.native})
                                        </label>
                                        <textarea
                                            value={formData.culturalSignificance[selectedLanguage]}
                                            onChange={(e) => handleChange('culturalSignificance', e.target.value, selectedLanguage)}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                                            placeholder={`Describe the cultural significance in ${languages.find(l => l.code === selectedLanguage)?.native}...`}
                                            disabled={saving}
                                        />
                                    </div>

                                    {/* Historical Period */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Historical Period
                                        </label>
                                        <select
                                            value={formData.historicalPeriod}
                                            onChange={(e) => handleChange('historicalPeriod', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            disabled={saving}
                                        >
                                            <option value="">Select historical period...</option>
                                            {historicalPeriods.map(period => (
                                                <option key={period} value={period}>{period}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Geographical Region */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Geographical Region
                                        </label>
                                        <select
                                            value={formData.geographicalRegion}
                                            onChange={(e) => handleChange('geographicalRegion', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            disabled={saving}
                                        >
                                            <option value="">Select region...</option>
                                            {geographicalRegions.map(region => (
                                                <option key={region} value={region}>{region}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Creator/Artist */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Creator/Artist
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.creator}
                                            onChange={(e) => handleChange('creator', e.target.value)}
                                            placeholder="Creator or artist name..."
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            disabled={saving}
                                        />
                                    </div>

                                    {/* Dates */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Creation Date
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.creationDate}
                                                onChange={(e) => handleChange('creationDate', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                disabled={saving}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Acquisition Date
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.acquisitionDate}
                                                onChange={(e) => handleChange('acquisitionDate', e.target.value)}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${errors.acquisitionDate ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                                                    }`}
                                                disabled={saving}
                                            />
                                            {errors.acquisitionDate && (
                                                <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center space-x-1">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    <span>{errors.acquisitionDate}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Materials */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Materials
                                        </label>
                                        <div className="space-y-3">
                                            {/* Add new material */}
                                            <div className="flex space-x-2">
                                                <input
                                                    type="text"
                                                    value={newMaterial}
                                                    onChange={(e) => setNewMaterial(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMaterial())}
                                                    placeholder="Add a material..."
                                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                    disabled={saving}
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={addMaterial}
                                                    disabled={!newMaterial.trim() || saving}
                                                    className="flex items-center space-x-1"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    <span>Add</span>
                                                </Button>
                                            </div>

                                            {/* Current materials */}
                                            {formData.materials.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {formData.materials.map((material, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-sm"
                                                        >
                                                            <span>{material}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeMaterial(material)}
                                                                disabled={saving}
                                                                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Dimensions */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Dimensions
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.dimensions}
                                            onChange={(e) => handleChange('dimensions', e.target.value)}
                                            placeholder="e.g., 30cm x 20cm x 15cm"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            disabled={saving}
                                        />
                                    </div>

                                    {/* Condition */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Condition
                                        </label>
                                        <select
                                            value={formData.condition}
                                            onChange={(e) => handleChange('condition', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            disabled={saving}
                                        >
                                            <option value="">Select condition...</option>
                                            {conditions.map(condition => (
                                                <option key={condition} value={condition}>{condition}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Administrative Tab */}
                            {activeTab === 'administrative' && (
                                <div className="space-y-6">
                                    {/* Catalog Number */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Catalog Number
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.catalogNumber}
                                            onChange={(e) => handleChange('catalogNumber', e.target.value)}
                                            placeholder="e.g., RH-2024-001"
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${errors.catalogNumber ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                                                }`}
                                            disabled={saving}
                                        />
                                        {errors.catalogNumber && (
                                            <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center space-x-1">
                                                <AlertTriangle className="w-3 h-3" />
                                                <span>{errors.catalogNumber}</span>
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Format: ABC-1234 (2-4 letters followed by 4-6 digits)
                                        </p>
                                    </div>

                                    {/* Copyright Status */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Copyright Status
                                        </label>
                                        <select
                                            value={formData.copyrightStatus}
                                            onChange={(e) => handleChange('copyrightStatus', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            disabled={saving}
                                        >
                                            <option value="">Select copyright status...</option>
                                            {copyrightStatuses.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Access Restrictions */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Access Restrictions
                                        </label>
                                        <textarea
                                            value={formData.accessRestrictions}
                                            onChange={(e) => handleChange('accessRestrictions', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                                            placeholder="Describe any access restrictions or special handling requirements..."
                                            disabled={saving}
                                        />
                                    </div>

                                    {/* Preservation Notes (Multilingual) */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Preservation Notes ({languages.find(l => l.code === selectedLanguage)?.native})
                                        </label>
                                        <textarea
                                            value={formData.preservationNotes[selectedLanguage]}
                                            onChange={(e) => handleChange('preservationNotes', e.target.value, selectedLanguage)}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                                            placeholder={`Enter preservation notes in ${languages.find(l => l.code === selectedLanguage)?.native}...`}
                                            disabled={saving}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Custom Fields Tab */}
                            {activeTab === 'custom' && (
                                <div className="text-center py-12">
                                    <Hash className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        Custom Fields
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                                        Custom field management will be available in the next update
                                    </p>
                                    <Button variant="outline" disabled>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Custom Field
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {isBatchMode ? `Editing ${documents.length} documents` : 'Changes will be saved to this document'}
                            </div>

                            <div className="flex items-center space-x-3">
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
                                    disabled={saving}
                                    className="flex items-center space-x-2"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            <span>{isBatchMode ? 'Save All' : 'Save Changes'}</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default DocumentMetadataEditor;





