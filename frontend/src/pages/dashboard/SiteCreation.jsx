import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Shield } from 'lucide-react';
import SiteCreationForm from '../../components/forms/SiteCreationForm';
import { Button } from '../../components/ui/Button';
import { usePost } from '../../hooks/useSimpleApi';
import { useAuth } from '../../contexts/AuthContext';
import { heritageSitesApi } from '../../services/api/heritageSitesApi';

const SiteCreation = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Check if user has permission to create sites
    if (!user || user.role !== 'SYSTEM_ADMINISTRATOR') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="text-center">
                            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Access Denied</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Only System Administrators can create new heritage sites.
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                Your current role: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{user?.role || 'Unknown'}</span>
                            </p>
                            <Button
                                onClick={() => navigate('/dashboard/sites')}
                                className="flex items-center space-x-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Back to Sites</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Handle form submission
    const handleSubmit = async (formData) => {
        try {
            console.log('Creating heritage site:', formData);

            // Transform the nested multilingual structure to flat fields expected by backend
            const transformedData = {
                // Basic Information - transform nested to flat
                nameEn: formData.name?.en || '',
                nameRw: formData.name?.rw || '',
                nameFr: formData.name?.fr || '',

                descriptionEn: formData.description?.en || '',
                descriptionRw: formData.description?.rw || '',
                descriptionFr: formData.description?.fr || '',

                significanceEn: formData.significance?.en || '',
                significanceRw: formData.significance?.rw || '',
                significanceFr: formData.significance?.fr || '',

                // Location Details
                address: formData.address || '',
                region: formData.region || '',
                gpsLatitude: formData.gpsLatitude || formData.location?.latitude || null,
                gpsLongitude: formData.gpsLongitude || formData.location?.longitude || null,

                // Site Details
                category: formData.category || '',
                status: formData.status || 'ACTIVE',
                ownershipType: formData.ownership || 'UNKNOWN',
                establishmentYear: formData.establishmentYear || null,
                contactInfo: formData.contactInfo || '',

                // Metadata
                isActive: formData.isActive !== false,
                createdBy: formData.createdBy || '',

                // Media - will be uploaded separately after site creation
                // Note: Media will be uploaded after site creation to get the siteId
            };

            console.log('Transformed data for backend:', transformedData);

            // Call the actual API
            const response = await heritageSitesApi.createSite(transformedData);

            console.log('Site created successfully:', response);

            // Upload media files if any were selected
            if (formData.images && formData.images.length > 0) {
                await uploadMediaFiles(response.id, formData.images);
            }

            toast.success('Heritage site created successfully!');
            navigate('/dashboard/sites');
        } catch (error) {
            console.error('Failed to create site:', error);
            toast.error('Failed to create heritage site. Please try again.');
            throw error;
        }
    };

    // Upload media files to the backend
    const uploadMediaFiles = async (siteId, mediaFiles) => {
        if (!mediaFiles || mediaFiles.length === 0) return;

        const uploadPromises = mediaFiles.map(async (mediaFile) => {
            try {
                // Create FormData for file upload
                const formData = new FormData();
                formData.append('file', mediaFile.file);
                formData.append('description', mediaFile.description || '');
                formData.append('category', mediaFile.category || 'photos');
                // If this is the first image, mark it as hero by default
                if (mediaFile === mediaFiles[0]) {
                    formData.append('category', 'hero');
                }
                formData.append('dateTaken', mediaFile.dateTaken || '');
                formData.append('photographer', mediaFile.photographer || '');
                formData.append('isPublic', 'true');

                const response = await fetch(`/api/media/upload/${siteId}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`Upload failed: ${response.status}`);
                }

                const result = await response.json();
                console.log('Media uploaded successfully:', result);
                return result;
            } catch (error) {
                console.error('Failed to upload media:', error);
                toast.error(`Failed to upload ${mediaFile.name}: ${error.message}`);
                throw error;
            }
        });

        try {
            await Promise.all(uploadPromises);
            toast.success(`${mediaFiles.length} media file(s) uploaded successfully!`);
        } catch (error) {
            console.error('Some media uploads failed:', error);
            // Don't fail the entire site creation, just log the error
        }
    };

    // Handle save as draft
    const handleSave = async (formData) => {
        try {
            console.log('Saving draft:', formData);

            // For now, save draft to localStorage
            // In the future, this could call a dedicated draft API endpoint
            const drafts = JSON.parse(localStorage.getItem('heritageSiteDrafts') || '[]');
            const draftId = `draft_${Date.now()}`;
            drafts.push({
                id: draftId,
                ...formData,
                isDraft: true,
                createdAt: new Date().toISOString()
            });
            localStorage.setItem('heritageSiteDrafts', JSON.stringify(drafts));

            toast.success('Draft saved successfully!');
        } catch (error) {
            console.error('Failed to save draft:', error);
            toast.error('Failed to save draft. Please try again.');
            throw error;
        }
    };

    // Handle cancel
    const handleCancel = () => {
        navigate('/dashboard/sites');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Heritage Site</h1>
                            <p className="text-gray-600 dark:text-gray-300 mt-2">Add a new heritage site to the registry</p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => navigate('/dashboard/sites')}
                            className="flex items-center space-x-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Sites</span>
                        </Button>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <SiteCreationForm
                        onSubmit={handleSubmit}
                        onSave={handleSave}
                        onCancel={handleCancel}
                    />
                </div>
            </div>
        </div>
    );
};

export default SiteCreation;



