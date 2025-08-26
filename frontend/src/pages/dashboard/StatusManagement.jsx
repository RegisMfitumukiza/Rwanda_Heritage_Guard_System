import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import SiteStatusManager from '../../components/status/SiteStatusManager';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { useGet } from '../../hooks/useSimpleApi';

const StatusManagement = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // State management
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSite, setSelectedSite] = useState(null);
    const [refreshCounter, setRefreshCounter] = useState(0);

    // URL parameters
    const siteId = searchParams.get('siteId');

    // Fetch heritage sites using new simplified API system
    const { data: sitesData, loading: sitesLoading, refetch: refetchSites } = useGet('/api/heritage-sites', {
        page: 0,
        size: 50,
        sort: 'nameEn,asc'
    }, {
        onSuccess: (data) => {
            setSites(data?.content || []);
            setLoading(false);
        },
        onError: (error) => {
            console.error('Failed to load sites:', error);
            toast.error('Failed to load heritage sites');
            setLoading(false);
        }
    });

    // Update sites when data changes
    useEffect(() => {
        if (sitesData?.content) {
            setSites(sitesData.content);
        }
    }, [sitesData]);

    // Handle URL parameters
    useEffect(() => {
        if (siteId && sites.length > 0) {
            const site = sites.find(s => s.id.toString() === siteId);
            if (site) {
                setSelectedSite(site);
            }
        }
    }, [siteId, sites]);

    // Handle status change
    const handleStatusChange = (updatedSite) => {
        setSites(prev => prev.map(site =>
            site.id === updatedSite.id ? updatedSite : site
        ));
        setSelectedSite(updatedSite);
        toast.success('Site status updated successfully');

        // Refresh sites data to get updated status
        refetchSites();
    };

    // Handle back navigation - always go back to dashboard
    const handleBack = () => {
        navigate('/dashboard');
    };

    // Handle refresh - refresh both sites and status data
    const handleRefresh = async () => {
        try {
            await refetchSites();

            // If we have a selected site, also refresh its data
            if (selectedSite) {
                // Find the updated site data
                const updatedSite = sites.find(site => site.id === selectedSite.id);
                if (updatedSite) {
                    setSelectedSite(updatedSite);
                }
            }

            // Increment refresh counter to force SiteStatusManager to refresh
            setRefreshCounter(prev => prev + 1);
            toast.success('Data refreshed successfully');
        } catch (error) {
            console.error('Failed to refresh data:', error);
            toast.error('Failed to refresh data');
        }
    };

    const content = (
        <div className="space-y-6">
            {/* Simple header for single site management */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Status Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {selectedSite
                            ? `Managing status for: ${selectedSite.nameEn || selectedSite.nameRw || selectedSite.nameFr}`
                            : "Loading site information..."
                        }
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={sitesLoading}
                        className="flex items-center space-x-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${sitesLoading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        className="flex items-center space-x-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Dashboard</span>
                    </Button>
                </div>
            </div>

            {/* Single site status management */}
            {selectedSite ? (
                <SiteStatusManager
                    key={`${selectedSite.id}-${refreshCounter}`}
                    site={selectedSite}
                    onStatusChange={handleStatusChange}
                    showHistory={true}
                />
            ) : (
                <Card>
                    <CardContent className="p-8 text-center">
                        {loading ? (
                            <div className="flex items-center justify-center space-x-2">
                                <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                                <span className="text-gray-500">Loading site information...</span>
                            </div>
                        ) : (
                            <>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Site not found. Please go back to the dashboard.
                                </p>
                                <Button onClick={handleBack} className="mt-4">
                                    Back to Dashboard
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );

    // Always return simple content for single site management
    return content;
};

export default StatusManagement;