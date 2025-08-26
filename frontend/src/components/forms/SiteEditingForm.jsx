import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save,
    RefreshCw,
    History,
    AlertTriangle,
    Check,
    X,
    Eye,
    EyeOff,
    Clock,
    User,
    MapPin,
    FileText,
    Camera,
    Settings
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import EditableField from './EditableField';
import EditableMultilingualField from './EditableMultilingualField';
import ImageUpload from './ImageUpload';
import MediaUploadGallery from '../media/MediaUploadGallery';
import LocationInput from '../location/LocationInput';
import SiteStatusManager from '../status/SiteStatusManager';
import DocumentUploadInterface from '../documents/DocumentUploadInterface';

const SiteEditingForm = ({
    site,
    onSave,
    onRefresh,
    onViewHistory,
    className = '',
    ...props
}) => {
    const { user } = useAuth();
    const { t } = useLanguage();

    // State management
    const [siteData, setSiteData] = useState(site || {});
    const [changedFields, setChangedFields] = useState(new Set());
    const [savingFields, setSavingFields] = useState(new Set());
    const [errors, setErrors] = useState({});
    const [showAllFields, setShowAllFields] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    // Update site data when prop changes
    useEffect(() => {
        setSiteData(site || {});
        setChangedFields(new Set());
        setErrors({});
    }, [site]);

    // Site categories for validation
    const siteCategories = [
        { value: 'cultural-sites', label: 'Cultural Sites' },
        { value: 'historical', label: 'Historical Sites' },
        { value: 'archaeological', label: 'Archaeological Sites' },
        { value: 'natural', label: 'Natural Heritage' },
        { value: 'monuments', label: 'Monuments' },
        { value: 'museums', label: 'Museums' },
        { value: 'palaces', label: 'Palaces & Royal Sites' },
        { value: 'religious', label: 'Religious Sites' }
    ];

    // Status options
    const statusOptions = [
        { value: 'Active', label: 'Active', color: 'green' },
        { value: 'Under Conservation', label: 'Under Conservation', color: 'yellow' },
        { value: 'Proposed', label: 'Proposed', color: 'blue' },
        { value: 'Inactive', label: 'Inactive', color: 'gray' }
    ];



    // Handle field save
    const handleFieldSave = async (fieldName, value) => {
        setSavingFields(prev => new Set([...prev, fieldName]));

        try {
            // Simulate API call - in real app, this would be individual field updates
            console.log(`Saving field ${fieldName}:`, value);

            // Call the parent save handler with just this field
            if (onSave) {
                await onSave({
                    id: siteData.id,
                    field: fieldName,
                    value: value,
                    previousValue: siteData[fieldName]
                });
            }

            // Update local state
            setSiteData(prev => ({
                ...prev,
                [fieldName]: value,
                lastModified: new Date().toISOString(),
                modifiedBy: user?.username
            }));

            // Remove from changed fields
            setChangedFields(prev => {
                const newSet = new Set(prev);
                newSet.delete(fieldName);
                return newSet;
            });

            // Clear any errors for this field
            setErrors(prev => ({
                ...prev,
                [fieldName]: undefined
            }));

        } catch (error) {
            console.error(`Failed to save field ${fieldName}:`, error);
            setErrors(prev => ({
                ...prev,
                [fieldName]: 'Failed to save changes. Please try again.'
            }));
            throw error;
        } finally {
            setSavingFields(prev => {
                const newSet = new Set(prev);
                newSet.delete(fieldName);
                return newSet;
            });
        }
    };

    // Handle field cancel
    const handleFieldCancel = (fieldName) => {
        setChangedFields(prev => {
            const newSet = new Set(prev);
            newSet.delete(fieldName);
            return newSet;
        });

        setErrors(prev => ({
            ...prev,
            [fieldName]: undefined
        }));
    };

    // Validation functions
    const validateEmail = (email) => {
        if (!email) return null;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) ? null : 'Please enter a valid email address';
    };

    const validateGPS = (coordinate) => {
        if (!coordinate) return null;
        const num = parseFloat(coordinate);
        return !isNaN(num) && num >= -180 && num <= 180 ? null : 'Please enter a valid coordinate';
    };

    const validateCategory = (category) => {
        return siteCategories.some(cat => cat.value === category) ? null : 'Please select a valid category';
    };

    // Handle refresh
    const handleRefresh = async () => {
        try {
            if (onRefresh) {
                await onRefresh();
                setLastRefresh(new Date());
            }
        } catch (error) {
            console.error('Failed to refresh:', error);
        }
    };

    // Handle images save
    const handleImagesSave = async (images) => {
        return handleFieldSave('images', images);
    };

    // Format time ago
    const formatTimeAgo = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    // Get status color
    const getStatusColor = (status) => {
        const statusOption = statusOptions.find(opt => opt.value === status);
        return statusOption?.color || 'gray';
    };

    return (
        <div className={`max-w-4xl mx-auto space-y-6 ${className}`} {...props}>
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-semibold">
                                Edit Heritage Site
                            </CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Make changes to site information. Each field saves automatically.
                            </p>
                        </div>

                        <div className="flex items-center space-x-2">
                            {/* Show/Hide Advanced Fields */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowAllFields(!showAllFields)}
                                className="flex items-center space-x-2"
                            >
                                {showAllFields ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                <span>{showAllFields ? 'Show Less' : 'Show All'}</span>
                            </Button>

                            {/* Refresh Button */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRefresh}
                                className="flex items-center space-x-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>Refresh</span>
                            </Button>

                            {/* History Button */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onViewHistory && onViewHistory(siteData.id)}
                                className="flex items-center space-x-2"
                            >
                                <History className="w-4 h-4" />
                                <span>History</span>
                            </Button>
                        </div>
                    </div>

                    {/* Status Bar */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-4">
                            {/* Site Status */}
                            <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full bg-${getStatusColor(siteData.status)}-500`} />
                                <span className="text-sm font-medium">{siteData.status || 'Unknown'}</span>
                            </div>

                            {/* Last Modified */}
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <Clock className="w-4 h-4" />
                                <span>
                                    {siteData.lastModified
                                        ? `Modified ${formatTimeAgo(siteData.lastModified)}`
                                        : 'Never modified'
                                    }
                                </span>
                                {siteData.modifiedBy && (
                                    <>
                                        <User className="w-4 h-4" />
                                        <span>by {siteData.modifiedBy}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Changed Fields Indicator */}
                        <AnimatePresence>
                            {changedFields.size > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="flex items-center space-x-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-full text-sm"
                                >
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>{changedFields.size} unsaved change{changedFields.size !== 1 ? 's' : ''}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </CardHeader>
            </Card>

            {/* Basic Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <FileText className="w-5 h-5" />
                        <span>Basic Information</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <EditableMultilingualField
                        label="Site Name"
                        value={siteData.name || {}}
                        onSave={(value) => handleFieldSave('name', value)}
                        onCancel={() => handleFieldCancel('name')}
                        required
                        placeholder={{
                            en: 'Enter site name in English',
                            rw: 'Andika izina ry\'ahantu mu Kinyarwanda',
                            fr: 'Entrez le nom du site en français'
                        }}
                        showHistory
                        onViewHistory={() => onViewHistory && onViewHistory(siteData.id, 'name')}
                        lastModified={formatTimeAgo(siteData.lastModified)}
                        modifiedBy={siteData.modifiedBy}
                    />

                    <EditableMultilingualField
                        label="Description"
                        type="textarea"
                        rows={4}
                        value={siteData.description || {}}
                        onSave={(value) => handleFieldSave('description', value)}
                        onCancel={() => handleFieldCancel('description')}
                        required
                        placeholder={{
                            en: 'Describe the heritage site in English',
                            rw: 'Sobanura ahantu h\'umurage mu Kinyarwanda',
                            fr: 'Décrivez le site du patrimoine en français'
                        }}
                        maxLength={1000}
                        showHistory
                        onViewHistory={() => onViewHistory && onViewHistory(siteData.id, 'description')}
                        lastModified={formatTimeAgo(siteData.lastModified)}
                        modifiedBy={siteData.modifiedBy}
                    />

                    <EditableMultilingualField
                        label="Historical Significance"
                        type="textarea"
                        rows={4}
                        value={siteData.significance || {}}
                        onSave={(value) => handleFieldSave('significance', value)}
                        onCancel={() => handleFieldCancel('significance')}
                        required
                        placeholder={{
                            en: 'Explain the historical importance in English',
                            rw: 'Sobanura akamaro k\'amateka mu Kinyarwanda',
                            fr: 'Expliquez l\'importance historique en français'
                        }}
                        maxLength={1000}
                        showHistory
                        onViewHistory={() => onViewHistory && onViewHistory(siteData.id, 'significance')}
                        lastModified={formatTimeAgo(siteData.lastModified)}
                        modifiedBy={siteData.modifiedBy}
                    />
                </CardContent>
            </Card>

            {/* Location Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <MapPin className="w-5 h-5" />
                        <span>Location Information</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Interactive Location Picker */}
                    <div>
                        <LocationInput
                            label="Heritage Site Location"
                            value={siteData.gpsLatitude && siteData.gpsLongitude ? {
                                lat: parseFloat(siteData.gpsLatitude),
                                lng: parseFloat(siteData.gpsLongitude)
                            } : null}
                            onChange={(location) => {
                                if (location) {
                                    handleFieldSave('gpsLatitude', location.lat.toString());
                                    handleFieldSave('gpsLongitude', location.lng.toString());
                                } else {
                                    handleFieldSave('gpsLatitude', '');
                                    handleFieldSave('gpsLongitude', '');
                                }
                            }}
                            placeholder="Click to update the location on an interactive map"
                            showCoordinates={true}
                            showAddress={false}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <EditableField
                                label="Physical Address"
                                type="textarea"
                                rows={3}
                                value={siteData.address || ''}
                                onSave={(value) => handleFieldSave('address', value)}
                                onCancel={() => handleFieldCancel('address')}
                                required
                                placeholder="Enter the complete physical address"
                                showHistory
                                onViewHistory={() => onViewHistory && onViewHistory(siteData.id, 'address')}
                                lastModified={formatTimeAgo(siteData.lastModified)}
                                modifiedBy={siteData.modifiedBy}
                            />
                        </div>

                        <EditableField
                            label="Region"
                            value={siteData.region || ''}
                            onSave={(value) => handleFieldSave('region', value)}
                            onCancel={() => handleFieldCancel('region')}
                            type="select"
                            required
                            options={[
                                { value: 'KIGALI', label: 'Kigali' },
                                { value: 'SOUTHERN', label: 'Southern' },
                                { value: 'NORTHERN', label: 'Northern' },
                                { value: 'EASTERN', label: 'Eastern' },
                                { value: 'WESTERN', label: 'Western' }
                            ]}
                            placeholder="Select region"
                            validation={(value) => {
                                if (!value) return 'Please select a region';
                                const validRegions = ['KIGALI', 'SOUTHERN', 'NORTHERN', 'EASTERN', 'WESTERN'];
                                if (!validRegions.includes(value)) {
                                    return 'Please select a valid region';
                                }
                                return null;
                            }}
                            showHistory
                            onViewHistory={() => onViewHistory && onViewHistory(siteData.id, 'region')}
                            lastModified={formatTimeAgo(siteData.lastModified)}
                            modifiedBy={siteData.modifiedBy}
                        />



                        <EditableField
                            label="GPS Latitude"
                            value={siteData.gpsLatitude || ''}
                            onSave={(value) => handleFieldSave('gpsLatitude', value)}
                            onCancel={() => handleFieldCancel('gpsLatitude')}
                            placeholder="-1.9441"
                            validation={validateGPS}
                            showHistory
                            onViewHistory={() => onViewHistory && onViewHistory(siteData.id, 'gpsLatitude')}
                            lastModified={formatTimeAgo(siteData.lastModified)}
                            modifiedBy={siteData.modifiedBy}
                        />

                        <EditableField
                            label="GPS Longitude"
                            value={siteData.gpsLongitude || ''}
                            onSave={(value) => handleFieldSave('gpsLongitude', value)}
                            onCancel={() => handleFieldCancel('gpsLongitude')}
                            placeholder="30.0619"
                            validation={validateGPS}
                            showHistory
                            onViewHistory={() => onViewHistory && onViewHistory(siteData.id, 'gpsLongitude')}
                            lastModified={formatTimeAgo(siteData.lastModified)}
                            modifiedBy={siteData.modifiedBy}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Site Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Settings className="w-5 h-5" />
                        <span>Site Details</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <EditableField
                        label="Category"
                        value={siteData.category || ''}
                        onSave={(value) => handleFieldSave('category', value)}
                        onCancel={() => handleFieldCancel('category')}
                        type="select"
                        required
                        options={[
                            { value: 'MUSEUM', label: 'Museum' },
                            { value: 'HISTORICAL_SITE', label: 'Historical Site' },
                            { value: 'ARCHAEOLOGICAL_SITE', label: 'Archaeological Site' },
                            { value: 'CULTURAL_LANDSCAPE', label: 'Cultural Landscape' },
                            { value: 'NATURAL_HERITAGE', label: 'Natural Heritage' },
                            { value: 'INTANGIBLE_HERITAGE', label: 'Intangible Heritage' },
                            { value: 'OTHER', label: 'Other' }
                        ]}
                        placeholder="Select category"
                        validation={(value) => {
                            if (!value) return 'Please select a category';
                            const validCategories = ['MUSEUM', 'HISTORICAL_SITE', 'ARCHAEOLOGICAL_SITE', 'CULTURAL_LANDSCAPE', 'NATURAL_HERITAGE', 'INTANGIBLE_HERITAGE', 'OTHER'];
                            if (!validCategories.includes(value)) {
                                return 'Please select a valid category';
                            }
                            return null;
                        }}
                        showHistory
                        onViewHistory={() => onViewHistory && onViewHistory(siteData.id, 'category')}
                        lastModified={formatTimeAgo(siteData.lastModified)}
                        modifiedBy={siteData.modifiedBy}
                    />

                    <EditableField
                        label="Status"
                        value={siteData.status || ''}
                        onSave={(value) => handleFieldSave('status', value)}
                        onCancel={() => handleFieldCancel('status')}
                        type="select"
                        options={[
                            { value: 'ACTIVE', label: 'Active' },
                            { value: 'INACTIVE', label: 'Inactive' },
                            { value: 'UNDER_MAINTENANCE', label: 'Under Maintenance' },
                            { value: 'CLOSED', label: 'Closed' },
                            { value: 'ARCHIVED', label: 'Archived' }
                        ]}
                        placeholder="Select status"
                        validation={(value) => {
                            if (!value) return 'Please select a status';
                            const validStatuses = ['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE', 'CLOSED', 'ARCHIVED'];
                            if (!validStatuses.includes(value)) {
                                return 'Please select a valid status';
                            }
                            return null;
                        }}
                        showHistory
                        onViewHistory={() => onViewHistory && onViewHistory(siteData.id, 'status')}
                        lastModified={formatTimeAgo(siteData.lastModified)}
                        modifiedBy={siteData.modifiedBy}
                    />

                    <EditableField
                        label="Ownership"
                        value={siteData.ownershipType || ''}
                        onSave={(value) => handleFieldSave('ownershipType', value)}
                        onCancel={() => handleFieldCancel('ownershipType')}
                        type="select"
                        options={[
                            { value: 'PUBLIC', label: 'Public' },
                            { value: 'PRIVATE', label: 'Private' },
                            { value: 'COMMUNITY', label: 'Community' },
                            { value: 'GOVERNMENT', label: 'Government' },
                            { value: 'MIXED', label: 'Mixed' },
                            { value: 'UNKNOWN', label: 'Unknown' }
                        ]}
                        placeholder="Select ownership type"
                        validation={(value) => {
                            if (!value) return 'Please select an ownership type';
                            const validTypes = ['PUBLIC', 'PRIVATE', 'COMMUNITY', 'GOVERNMENT', 'MIXED', 'UNKNOWN'];
                            if (!validTypes.includes(value)) {
                                return 'Please select a valid ownership type';
                            }
                            return null;
                        }}
                        showHistory
                        onViewHistory={() => onViewHistory && onViewHistory(siteData.id, 'ownershipType')}
                        lastModified={formatTimeAgo(siteData.lastModified)}
                        modifiedBy={siteData.modifiedBy}
                    />

                    <EditableField
                        label="Date of Establishment"
                        type="number"
                        value={siteData.establishmentYear || ''}
                        onSave={(value) => handleFieldSave('establishmentYear', value)}
                        onCancel={() => handleFieldCancel('establishmentYear')}
                        placeholder="1989"
                        validation={(value) => {
                            if (!value) return null;
                            const year = parseInt(value);
                            if (isNaN(year) || year < 1000 || year > 2100) {
                                return 'Please enter a valid year between 1000-2100';
                            }
                            return null;
                        }}
                        showHistory
                        onViewHistory={() => onViewHistory && onViewHistory(siteData.id, 'establishmentYear')}
                        lastModified={formatTimeAgo(siteData.lastModified)}
                        modifiedBy={siteData.modifiedBy}
                    />

                    {showAllFields && (
                        <>
                            <div className="md:col-span-2">
                                <EditableField
                                    label="Contact Information"
                                    type="textarea"
                                    rows={3}
                                    value={siteData.contactInfo || ''}
                                    onSave={(value) => handleFieldSave('contactInfo', value)}
                                    onCancel={() => handleFieldCancel('contactInfo')}
                                    placeholder="Phone, email, website, or other contact details"
                                    validation={siteData.contactInfo?.includes('@') ? validateEmail : null}
                                    showHistory
                                    onViewHistory={() => onViewHistory && onViewHistory(siteData.id, 'contactInfo')}
                                    lastModified={formatTimeAgo(siteData.lastModified)}
                                    modifiedBy={siteData.modifiedBy}
                                />
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Images & Media */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Camera className="w-5 h-5" />
                        <span>Images & Media</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <MediaUploadGallery
                        siteId={siteData.id}
                        value={siteData.media || []}
                        onChange={handleImagesSave}
                        maxFiles={20}
                        maxSize={50 * 1024 * 1024} // 50MB per file
                        acceptedTypes={[
                            'image/jpeg', 'image/png', 'image/webp', 'image/gif',
                            'video/mp4', 'video/webm', 'video/quicktime',
                            'application/pdf', 'text/plain'
                        ]}
                        allowedCategories={['hero', 'primary', 'photos', 'videos', 'documents', 'archive']}
                    />

                    {/* Hero Image Management Info */}
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                            🖼️ Hero Image Management
                        </h4>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                            Control which images are displayed prominently on your heritage site.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-600 dark:text-blue-400">
                            <div>
                                <p>• <strong>⭐ Hero Image</strong>: Primary image for site display</p>
                                <p>• <strong>🎯 Primary Image</strong>: Main representative image</p>
                                <p>• <strong>📸 Photos</strong>: General photo collection</p>
                            </div>
                            <div>
                                <p>• <strong>🎥 Videos</strong>: Video content</p>
                                <p>• <strong>📄 Documents</strong>: PDFs and text files</p>
                                <p>• <strong>📦 Archive</strong>: Historical materials</p>
                            </div>
                        </div>
                        <div className="mt-3 p-2 bg-blue-100 dark:bg-blue-800 rounded text-xs text-blue-800 dark:text-blue-200">
                            <strong>💡 Tip:</strong> The first image uploaded will automatically be marked as "Hero Image".
                            You can change this by editing individual media files and selecting a different category.
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Site Status Management */}
            <SiteStatusManager
                site={siteData}
                onStatusChange={(updatedSite) => {
                    setSiteData(updatedSite);
                    // Optionally refresh the site data
                    if (onRefresh) {
                        onRefresh();
                    }
                }}
                showHistory={true}
            />

            {/* Document Management */}
            <DocumentUploadInterface
                siteId={siteData.id}
                onDocumentAdded={(newDoc) => {
                    // Optionally refresh the site data to include new document count
                    if (onRefresh) {
                        onRefresh();
                    }
                }}
                onDocumentDeleted={() => {
                    // Optionally refresh the site data to update document count
                    if (onRefresh) {
                        onRefresh();
                    }
                }}
            />
        </div>
    );
};

export default SiteEditingForm;
