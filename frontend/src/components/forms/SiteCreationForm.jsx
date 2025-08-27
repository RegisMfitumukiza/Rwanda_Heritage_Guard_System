import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin,
    FileText,
    Camera,
    Check,
    ChevronLeft,
    ChevronRight,
    Save,
    Eye,
    AlertCircle,
    Info
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import MultilingualField from './MultilingualField';
import ImageUpload from './ImageUpload';
import MediaUploadGallery from '../media/MediaUploadGallery';
import LocationInput from '../location/LocationInput';

const SiteCreationForm = ({
    onSubmit,
    onSave,
    onCancel,
    initialData = {},
    className = '',
    ...props
}) => {
    const { user } = useAuth();
    const { t } = useLanguage();

    // Form steps
    const steps = [
        {
            id: 'basic',
            title: 'Basic Information',
            description: 'Site name, description, and significance',
            icon: FileText,
            fields: ['name', 'description', 'significance']
        },
        {
            id: 'location',
            title: 'Location Details',
            description: 'Address, district coordinates, and region',
            icon: MapPin,
            fields: ['address', 'region', 'location', 'gpsLatitude', 'gpsLongitude']
        },
        {
            id: 'details',
            title: 'Site Details',
            description: 'Category, status, and ownership',
            icon: Info,
            fields: ['category', 'status', 'ownership', 'establishmentYear', 'contactInfo']
        },
        {
            id: 'media',
            title: 'Images & Media',
            description: 'Upload site photos and documents',
            icon: Camera,
            fields: ['images']
        }
    ];

    // Form state
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        // Basic Information
        name: { en: '', rw: '', fr: '' },
        description: { en: '', rw: '', fr: '' },
        significance: { en: '', rw: '', fr: '' },

        // Location Details
        address: '',
        region: '',
        location: {
            latitude: '',
            longitude: '',
            coordinates: null
        },
        gpsLatitude: '',
        gpsLongitude: '',

        // Site Details
        category: '',
        status: 'ACTIVE',
        ownership: 'UNKNOWN',
        establishmentYear: '',
        contactInfo: '',

        // Media
        images: [],

        // Metadata
        isActive: true,
        ...initialData
    });

    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Site categories
    const siteCategories = [
        { value: 'CULTURAL', label: 'Cultural Sites' },
        { value: 'HISTORICAL', label: 'Historical Sites' },
        { value: 'ARCHAEOLOGICAL', label: 'Archaeological Sites' },
        { value: 'NATURAL', label: 'Natural Heritage' },
        { value: 'ARCHITECTURAL', label: 'Architectural Monuments' },
        { value: 'MUSEUM', label: 'Museums' },
        { value: 'MEMORIAL', label: 'Memorial Sites' },
        { value: 'RELIGIOUS', label: 'Religious Sites' }
    ];

    // Site status options
    const statusOptions = [
        { value: 'ACTIVE', label: 'Active', color: 'green' },
        { value: 'UNDER_CONSERVATION', label: 'Under Conservation', color: 'yellow' },
        { value: 'PROPOSED', label: 'Proposed', color: 'blue' },
        { value: 'INACTIVE', label: 'Inactive', color: 'gray' }
    ];

    // Rwanda regions
    const regions = [
        { value: 'northern', label: 'Northern Province' },
        { value: 'southern', label: 'Southern Province' },
        { value: 'eastern', label: 'Eastern Province' },
        { value: 'western', label: 'Western Province' },
        { value: 'kigali', label: 'Kigali City' }
    ];

    // Ownership options
    const ownershipOptions = [
        { value: 'PUBLIC', label: 'Public' },
        { value: 'PRIVATE', label: 'Private' },
        { value: 'COMMUNITY', label: 'Community' },
        { value: 'GOVERNMENT', label: 'Government' },
        { value: 'MIXED', label: 'Mixed' },
        { value: 'UNKNOWN', label: 'Unknown' }
    ];

    // Handle field change
    const handleFieldChange = useCallback((fieldName, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));

        // Clear field error when user starts typing
        if (errors[fieldName]) {
            setErrors(prev => ({
                ...prev,
                [fieldName]: undefined
            }));
        }
    }, [errors]);

    // Handle media change
    const handleMediaChange = useCallback((newImages) => {
        handleFieldChange('images', newImages);
    }, [handleFieldChange]);

    // Validate current step
    const validateStep = (stepIndex) => {
        const step = steps[stepIndex];
        const stepErrors = {};

        step.fields.forEach(fieldName => {
            if (fieldName === 'name' || fieldName === 'description' || fieldName === 'significance') {
                // Multilingual fields - require at least one language
                const fieldValue = formData[fieldName];
                const hasValue = Object.values(fieldValue || {}).some(val => val && val.trim());
                if (!hasValue) {
                    stepErrors[fieldName] = 'This field is required in at least one language';
                }
            } else if (fieldName === 'images') {
                // Images are optional but validate if provided
                if (formData.images && formData.images.length > 10) {
                    stepErrors[fieldName] = 'Maximum 10 images allowed';
                }
            } else if (fieldName === 'location') {
                // Location field - require coordinates (manual or from map)
                const location = formData[fieldName];
                if (!location || (!location.latitude && !location.longitude)) {
                    stepErrors[fieldName] = 'Please enter location coordinates manually or select from map';
                }
            } else {
                // Regular fields
                if (fieldName === 'address' || fieldName === 'region' || fieldName === 'category' || fieldName === 'establishmentYear' || fieldName === 'ownership') {
                    if (!formData[fieldName] || !formData[fieldName].trim()) {
                        stepErrors[fieldName] = 'This field is required';
                    }
                }

                // GPS coordinates validation
                if (fieldName === 'gpsLatitude' || fieldName === 'gpsLongitude') {
                    const lat = parseFloat(formData.gpsLatitude);
                    const lng = parseFloat(formData.gpsLongitude);

                    if (isNaN(lat) || lat < -90 || lat > 90) {
                        stepErrors.gpsLatitude = 'Latitude must be between -90 and 90 degrees';
                    }
                    if (isNaN(lng) || lng < -180 || lng > 180) {
                        stepErrors.gpsLongitude = 'Longitude must be between -180 and 180 degrees';
                    }
                }
            }
        });

        setErrors(stepErrors);
        return Object.keys(stepErrors).length === 0;
    };

    // Navigate to next step
    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
        }
    };

    // Navigate to previous step
    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };

    // Save as draft
    const handleSave = async () => {
        setSaving(true);
        try {
            if (onSave) {
                await onSave({
                    ...formData,
                    createdBy: user?.username,
                    isDraft: true
                });
            }
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            setSaving(false);
        }
    };

    // Submit form
    const handleSubmit = async () => {
        // Validate all steps
        let isValid = true;
        for (let i = 0; i < steps.length; i++) {
            if (!validateStep(i)) {
                isValid = false;
                setCurrentStep(i);
                break;
            }
        }

        if (!isValid) return;

        setSubmitting(true);
        try {
            if (onSubmit) {
                await onSubmit({
                    ...formData,
                    createdBy: user?.username,
                    isDraft: false
                });
            }
        } catch (error) {
            console.error('Submit failed:', error);
        } finally {
            setSubmitting(false);
        }
    };

    // Calculate completion percentage
    const getCompletionPercentage = () => {
        const totalSteps = steps.length;
        const completedSteps = steps.filter((_, index) => validateStep(index)).length;
        return Math.round((completedSteps / totalSteps) * 100);
    };

    return (
        <div className={`max-w-4xl mx-auto ${className}`} {...props}>
            {/* Progress Header */}
            <Card className="mb-8">
                <CardContent className="p-6">
                    {/* Progress Bar */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Create New Heritage Site
                            </h2>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Step {currentStep + 1} of {steps.length}
                            </span>
                        </div>

                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                                transition={{ duration: 0.3 }}
                                className="bg-blue-500 h-2 rounded-full"
                            />
                        </div>

                        <div className="flex justify-between mt-2">
                            {steps.map((step, index) => {
                                const IconComponent = step.icon;
                                const isCompleted = index < currentStep;
                                const isCurrent = index === currentStep;

                                return (
                                    <div
                                        key={step.id}
                                        className={`flex flex-col items-center space-y-1 ${index <= currentStep ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted
                                            ? 'bg-green-500 text-white'
                                            : isCurrent
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-200 dark:bg-gray-700'
                                            }`}>
                                            {isCompleted ? (
                                                <Check className="w-4 h-4" />
                                            ) : (
                                                <IconComponent className="w-4 h-4" />
                                            )}
                                        </div>
                                        <span className="text-xs font-medium hidden sm:block">
                                            {step.title}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Current Step Info */}
                    <div className="text-center">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {steps[currentStep].title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {steps[currentStep].description}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Step Content */}
            <Card className="mb-6">
                <CardContent className="p-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            {/* Step 1: Basic Information */}
                            {currentStep === 0 && (
                                <div className="space-y-6">
                                    <MultilingualField
                                        label="Site Name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleFieldChange}
                                        error={errors.name}
                                        placeholder={{
                                            en: 'Enter site name in English',
                                            rw: 'Andika izina ry\'ahantu mu Kinyarwanda',
                                            fr: 'Entrez le nom du site en français'
                                        }}
                                        required
                                    />

                                    <MultilingualField
                                        label="Site Description"
                                        name="description"
                                        type="textarea"
                                        rows={4}
                                        value={formData.description}
                                        onChange={handleFieldChange}
                                        error={errors.description}
                                        placeholder={{
                                            en: 'Describe the heritage site in English',
                                            rw: 'Sobanura ahantu h\'umurage mu Kinyarwanda',
                                            fr: 'Décrivez le site du patrimoine en français'
                                        }}
                                        required
                                    />

                                    <MultilingualField
                                        label="Historical Significance"
                                        name="significance"
                                        type="textarea"
                                        rows={4}
                                        value={formData.significance}
                                        onChange={handleFieldChange}
                                        error={errors.significance}
                                        placeholder={{
                                            en: 'Explain the historical importance in English',
                                            rw: 'Sobanura akamaro k\'amateka mu Kinyarwanda',
                                            fr: 'Expliquez l\'importance historique en français'
                                        }}
                                        required
                                    />
                                </div>
                            )}

                            {/* Step 2: Location Details */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    {/* Location Selection Options */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                District/Area Coordinates <span className="text-red-500">*</span>
                                            </label>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                                Enter coordinates for the district or area where the heritage site is located
                                            </p>
                                        </div>

                                        {/* Manual Coordinate Input */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Latitude <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    step="any"
                                                    placeholder="-1.9441"
                                                    value={formData.gpsLatitude}
                                                    onChange={(e) => {
                                                        const lat = e.target.value;
                                                        handleFieldChange('gpsLatitude', lat);

                                                        // Update location object
                                                        const newLocation = {
                                                            ...formData.location,
                                                            latitude: lat
                                                        };
                                                        handleFieldChange('location', newLocation);
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                />
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    District latitude (e.g., -1.9441 for Kigali City area)
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Longitude <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    step="any"
                                                    placeholder="30.0619"
                                                    value={formData.gpsLongitude}
                                                    onChange={(e) => {
                                                        const lng = e.target.value;
                                                        handleFieldChange('gpsLongitude', lng);

                                                        // Update location object
                                                        const newLocation = {
                                                            ...formData.location,
                                                            longitude: lng
                                                        };
                                                        handleFieldChange('location', newLocation);
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                />
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    District longitude (e.g., 30.0619 for Kigali City area)
                                                </p>
                                            </div>
                                        </div>

                                        {/* Helpful Information */}
                                        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                ℹ️ Why District Coordinates?
                                            </h4>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                Heritage sites are typically located within specific districts or areas.
                                                The coordinates represent the general location of the district where the site is found,
                                                not the exact pinpoint location. This helps with regional organization and mapping.
                                            </p>
                                        </div>

                                        {/* Map Picker Button (Optional) */}
                                        <div className="flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    // Try to open map picker
                                                    alert('Map picker is currently experiencing issues. Please use manual coordinate input above.');
                                                }}
                                                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                Try Map Picker (Experimental)
                                            </button>
                                        </div>

                                        {/* Quick District Presets */}
                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3">
                                                Quick District Presets
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                {[
                                                    { name: 'Kigali City District', lat: -1.9441, lng: 30.0619 },
                                                    { name: 'Huye District', lat: -2.5967, lng: 29.7374 },
                                                    { name: 'Rubavu District', lat: -1.7028, lng: 29.2564 },
                                                    { name: 'Musanze District', lat: -1.4998, lng: 29.6344 },
                                                    { name: 'Nyanza District', lat: -2.3515, lng: 29.7500 },
                                                    { name: 'Karongi District', lat: -2.0597, lng: 29.3478 }
                                                ].map((preset) => (
                                                    <button
                                                        key={preset.name}
                                                        type="button"
                                                        onClick={() => {
                                                            handleFieldChange('gpsLatitude', preset.lat.toString());
                                                            handleFieldChange('gpsLongitude', preset.lng.toString());
                                                            handleFieldChange('location', {
                                                                latitude: preset.lat,
                                                                longitude: preset.lng,
                                                                coordinates: `${preset.lat}, ${preset.lng}`
                                                            });
                                                        }}
                                                        className="text-xs px-3 py-2 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded border border-blue-200 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                                                    >
                                                        {preset.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Physical Address */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Physical Address <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={formData.address}
                                                onChange={(e) => handleFieldChange('address', e.target.value)}
                                                placeholder="Enter the complete physical address"
                                                rows={3}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.address ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                                                    } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                                            />
                                            {errors.address && (
                                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.address}</p>
                                            )}
                                        </div>

                                        {/* Region */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Region <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={formData.region}
                                                onChange={(e) => handleFieldChange('region', e.target.value)}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.region ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                                                    } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                                            >
                                                <option value="">Select Region</option>
                                                {regions.map(region => (
                                                    <option key={region.value} value={region.value}>
                                                        {region.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.region && (
                                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.region}</p>
                                            )}
                                        </div>


                                    </div>

                                    {/* GPS Coordinates Display (Read-only) */}
                                    {formData.location && formData.location.latitude && formData.location.longitude && (
                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                                                GPS Coordinates
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-blue-700 dark:text-blue-300">Latitude:</span>
                                                    <span className="ml-2 font-mono text-blue-900 dark:text-blue-100">
                                                        {parseFloat(formData.location.latitude).toFixed(6)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-blue-700 dark:text-blue-300">Longitude:</span>
                                                    <span className="ml-2 font-mono text-blue-900 dark:text-blue-100">
                                                        {parseFloat(formData.location.longitude).toFixed(6)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 3: Site Details */}
                            {currentStep === 2 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Site Category <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => handleFieldChange('category', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.category ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                                                } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                                        >
                                            <option value="">Select Category</option>
                                            {siteCategories.map(category => (
                                                <option key={category.value} value={category.value}>
                                                    {category.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.category && (
                                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.category}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Site Status
                                        </label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => handleFieldChange('status', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        >
                                            {statusOptions.map(status => (
                                                <option key={status.value} value={status.value}>
                                                    {status.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Ownership <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.ownership}
                                            onChange={(e) => handleFieldChange('ownership', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.ownership ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                                                } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                                        >
                                            <option value="">Select Ownership Type</option>
                                            {ownershipOptions.map(ownership => (
                                                <option key={ownership.value} value={ownership.value}>
                                                    {ownership.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.ownership && (
                                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.ownership}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Year of Establishment <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="1000"
                                            max="2030"
                                            step="1"
                                            placeholder="1995"
                                            value={formData.establishmentYear}
                                            onChange={(e) => handleFieldChange('establishmentYear', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Enter the year when the heritage site was established (e.g., 1995)
                                        </p>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Contact Information
                                        </label>
                                        <textarea
                                            value={formData.contactInfo}
                                            onChange={(e) => handleFieldChange('contactInfo', e.target.value)}
                                            placeholder="Phone, email, website, or other contact details"
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Images & Media */}
                            {currentStep === 3 && (
                                <div>
                                    <MediaUploadGallery
                                        value={formData.images}
                                        onChange={handleMediaChange}
                                        maxFiles={15}
                                        maxSize={25 * 1024 * 1024} // 25MB per file
                                        acceptedTypes={[
                                            'image/jpeg', 'image/png', 'image/webp', 'image/gif',
                                            'video/mp4', 'video/webm',
                                            'application/pdf'
                                        ]}
                                        allowedCategories={['photos', 'videos', 'documents']}
                                    />
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </CardContent>
            </Card>

            {/* Navigation & Actions */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        {/* Previous Button */}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            className="flex items-center space-x-2"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Previous</span>
                        </Button>

                        {/* Save Draft Button */}
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center space-x-2"
                        >
                            <Save className="w-4 h-4" />
                            <span>{saving ? 'Saving...' : 'Save Draft'}</span>
                        </Button>

                        {/* Next/Submit Button */}
                        {currentStep < steps.length - 1 ? (
                            <Button
                                type="button"
                                onClick={nextStep}
                                className="flex items-center space-x-2"
                            >
                                <span>Next</span>
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                            >
                                <Check className="w-4 h-4" />
                                <span>{submitting ? 'Creating...' : 'Create Site'}</span>
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SiteCreationForm;
