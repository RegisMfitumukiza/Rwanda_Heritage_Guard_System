import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

import SiteEditingForm from '../../components/forms/SiteEditingForm';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import SiteChangeHistory from '../../components/history/SiteChangeHistory';


const SiteEditing = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // State management
    const [site, setSite] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [changeHistory, setChangeHistory] = useState([]);

    // Load site data
    useEffect(() => {
        loadSite();
    }, [id]);

    const loadSite = async () => {
        try {
            setLoading(true);
            setError(null);

            // Real API call to get site data with proper authentication
            const response = await fetch(`/api/heritage-sites/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unauthorized: Please log in again');
                } else if (response.status === 403) {
                    throw new Error('Forbidden: You do not have permission to edit this site');
                } else if (response.status === 404) {
                    throw new Error('Site not found');
                } else {
                    throw new Error(`Failed to fetch site data (HTTP ${response.status})`);
                }
            }

            const siteData = await response.json();
            setSite(siteData);

            // Get change history from API with proper authentication
            const historyResponse = await fetch(`/api/heritage-sites/${id}/history`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (historyResponse.ok) {
                const historyData = await historyResponse.json();
                setChangeHistory(historyData);
            } else if (historyResponse.status === 401) {
                console.warn('Unauthorized to access history, continuing without history data');
                setChangeHistory([]);
            } else {
                console.warn('Failed to load history, continuing without history data');
                setChangeHistory([]);
            }

        } catch (error) {
            console.error('Failed to load site:', error);
            setError(error.message || 'Failed to load site data. Please try again.');
            toast.error(error.message || 'Failed to load site data');
        } finally {
            setLoading(false);
        }
    };

    // Handle field save
    const handleFieldSave = async (updateData) => {
        try {
            console.log('Saving field update:', updateData);

            // Prepare the update data for the backend
            const updatePayload = {};

            // Handle different field types
            if (updateData.field === 'name' || updateData.field === 'description' || updateData.field === 'significance') {
                // For multilingual fields, we need to handle the language object properly
                if (typeof updateData.value === 'object' && updateData.value !== null) {
                    // Smart update: Only send fields that have changed content
                    // This prevents overwriting existing content unnecessarily

                    // Get current site data for comparison
                    const currentSite = site;
                    const currentName = currentSite?.name || {};
                    const currentDescription = currentSite?.description || {};
                    const currentSignificance = currentSite?.significance || {};

                    let currentValues;
                    switch (updateData.field) {
                        case 'name': currentValues = currentName; break;
                        case 'description': currentValues = currentDescription; break;
                        case 'significance': currentValues = currentSignificance; break;
                        default: currentValues = {};
                    }

                    // Only update if the value has actually changed
                    if (updateData.value.en !== undefined && updateData.value.en !== currentValues.en) {
                        updatePayload[`${updateData.field}En`] = updateData.value.en;
                    }
                    if (updateData.value.rw !== undefined && updateData.value.rw !== currentValues.rw) {
                        updatePayload[`${updateData.field}Rw`] = updateData.value.rw;
                    }
                    if (updateData.value.fr !== undefined && updateData.value.fr !== currentValues.fr) {
                        updatePayload[`${updateData.field}Fr`] = updateData.value.fr;
                    }

                    console.log('Smart multilingual field update:', updateData.field, '->', updatePayload);
                } else {
                    // If it's a string, assume it's for English
                    updatePayload[`${updateData.field}En`] = updateData.value;
                    console.log('String field update:', updateData.field, '->', updatePayload);
                }
            } else {
                // For regular fields
                updatePayload[updateData.field] = updateData.value;
                console.log('Regular field update:', updateData.field, '->', updatePayload);
            }

            console.log('Final update payload:', updatePayload);

            // Call the backend API to update the site using PATCH for individual field updates
            const response = await fetch(`/api/heritage-sites/${id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatePayload)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unauthorized: Please log in again');
                } else if (response.status === 403) {
                    throw new Error('Forbidden: You do not have permission to update this site');
                } else if (response.status === 404) {
                    throw new Error('Site not found');
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Failed to update site (HTTP ${response.status})`);
                }
            }

            const updatedSite = await response.json();

            // Update local site data with the response from backend
            setSite(prev => ({
                ...prev,
                ...updatedSite,
                lastModified: new Date().toISOString(),
                modifiedBy: user?.username || 'current_user'
            }));

            // Refresh the change history
            const historyResponse = await fetch(`/api/heritage-sites/${id}/history`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (historyResponse.ok) {
                const historyData = await historyResponse.json();
                setChangeHistory(historyData);
            }

            toast.success(`${updateData.field} updated successfully`);

        } catch (error) {
            console.error('Failed to save field:', error);
            toast.error(error.message || 'Failed to save changes');
            throw error;
        }
    };

    // Handle refresh
    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            await loadSite();
            toast.success('Site data refreshed');
        } catch (error) {
            toast.error('Failed to refresh data');
        } finally {
            setRefreshing(false);
        }
    };

    // Handle view history
    const handleViewHistory = (siteId, field = null) => {
        // Scroll to the history section
        const historySection = document.getElementById('site-history-section');
        if (historySection) {
            historySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            toast.success('Scrolled to change history');
        } else {
            toast.error('History section not found');
        }
    };

    // Navigation helpers
    const goBack = () => {
        navigate('/dashboard/sites');
    };

    const goToSiteView = () => {
        // Navigate to the site details page (using the correct dashboard route)
        navigate(`/dashboard/sites/${id}`);
    };

    // Check if user has permission to edit sites
    if (!user || (user.role !== 'SYSTEM_ADMINISTRATOR' && user.role !== 'HERITAGE_MANAGER')) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <Card>
                        <CardContent className="p-8">
                            <div className="text-center">
                                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    You do not have permission to edit heritage sites.
                                </p>
                                <Button onClick={goBack} variant="outline">
                                    Back to Sites
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <Card>
                        <CardContent className="p-8">
                            <div className="flex items-center justify-center space-x-3">
                                <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                                <span className="text-lg text-gray-900 dark:text-white">Loading site data...</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <Card>
                        <CardContent className="p-8">
                            <div className="text-center space-y-4">
                                <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Failed to Load Site
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                                        {error}
                                    </p>
                                </div>
                                <div className="flex justify-center space-x-3">
                                    <Button onClick={loadSite} className="flex items-center space-x-2">
                                        <RefreshCw className="w-4 h-4" />
                                        <span>Try Again</span>
                                    </Button>
                                    <Button variant="outline" onClick={goBack}>
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        <span>Back to Sites</span>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Heritage Site</h1>
                            <p className="text-gray-600 dark:text-gray-300 mt-2">
                                Editing: {site?.nameEn || site?.nameRw || site?.nameFr || site?.name?.en || site?.name?.rw || site?.name?.fr || 'Loading site...'}
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                onClick={goToSiteView}
                                className="flex items-center space-x-2"
                            >
                                <CheckCircle className="w-4 h-4" />
                                <span>View Site</span>
                            </Button>

                            <Button
                                variant="outline"
                                onClick={goBack}
                                className="flex items-center space-x-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Back to Sites</span>
                            </Button>
                        </div>
                    </div>
                </div>



                {/* Form and Content */}
                <div className="space-y-6">
                    <SiteEditingForm
                        site={site}
                        onSave={handleFieldSave}
                        onRefresh={handleRefresh}
                        onViewHistory={handleViewHistory}
                    />

                    {/* Real Change History Component */}
                    <div id="site-history-section" className="mt-6">
                        <SiteChangeHistory
                            siteId={id}
                            siteName={site?.nameEn || site?.name?.en || 'Unknown Site'}
                            onRefresh={handleRefresh}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SiteEditing;





