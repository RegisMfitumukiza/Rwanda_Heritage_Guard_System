import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Search, Filter, Eye, Edit, Trash2, Layers, Target, ZoomIn, ZoomOut, RefreshCw, RotateCcw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

import { Button, Card, CardContent, CardHeader, CardTitle, Toast } from '../../components/ui';
import { useGet } from '../../hooks/useSimpleApi';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DeleteSiteModal from '../../components/modals/DeleteSiteModal';

// Custom CSS for map container
const mapStyles = `
    .leaflet-container {
        font-family: inherit;
    }
    .leaflet-popup-content {
        margin: 8px 12px;
    }
    .leaflet-popup-content-wrapper {
        border-radius: 8px;
    }
    .leaflet-popup-tip {
        background: white;
    }
`;

// Fix for default marker icons in Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Rwanda geographical bounds
const RWANDA_BOUNDS = [
    [-3.0, 28.8], // Southwest
    [-1.0, 31.2]  // Northeast
];

const RWANDA_CENTER = [-1.9441, 30.0619]; // Kigali

// Map layer configurations
const MAP_LAYERS = {
    openstreetmap: {
        name: 'OpenStreetMap',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap contributors',
        icon: Layers
    },
    satellite: {
        name: 'Satellite',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; Esri, Maxar, GeoEye',
        icon: Target
    }
};

// Custom marker icon for heritage sites
const createCustomIcon = (color = '#3B82F6', size = 'normal') => {
    const iconSize = size === 'large' ? [40, 50] : [32, 40];
    const iconAnchor = size === 'large' ? [20, 50] : [16, 40];

    return new L.Icon({
        iconUrl: `data:image/svg+xml;base64,${btoa(`
            <svg width="${iconSize[0]}" height="${iconSize[1]}" viewBox="0 0 ${iconSize[0]} ${iconSize[1]}" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M${iconSize[0] / 2} 0C${iconSize[0] / 2 * 0.447} 0 0 ${iconSize[0] / 2 * 0.447} 0 ${iconSize[0] / 2}C0 ${iconSize[0] / 2 * 0.75} ${iconSize[0] / 2} ${iconSize[1]} ${iconSize[0] / 2} ${iconSize[1]}S${iconSize[0]} ${iconSize[0] / 2 * 0.75} ${iconSize[0]} ${iconSize[0] / 2}C${iconSize[0]} ${iconSize[0] / 2 * 0.447} ${iconSize[0] / 2 * 0.553} 0 ${iconSize[0] / 2} 0Z" fill="${color}"/>
                <circle cx="${iconSize[0] / 2}" cy="${iconSize[0] / 2}" r="${iconSize[0] / 4}" fill="white"/>
                <circle cx="${iconSize[0] / 2}" cy="${iconSize[0] / 2}" r="${iconSize[0] / 8}" fill="${color}"/>
            </svg>
        `)}`,
        iconSize: iconSize,
        iconAnchor: iconAnchor,
        popupAnchor: [0, -iconSize[1]]
    });
};

// Component to handle map events
const MapEventHandler = ({ onMarkerClick, onMapClick }) => {
    useMapEvents({
        click: (e) => {
            if (onMapClick) {
                onMapClick(e);
            }
        }
    });
    return null;
};

// Component to update map view
const MapUpdater = ({ center, zoom, bounds }) => {
    const map = useMap();

    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds, { padding: [20, 20] });
        } else if (center) {
            map.setView(center, zoom || map.getZoom());
        }
    }, [center, zoom, bounds, map]);

    return null;
};

const SitesMap = () => {
    const { user } = useAuth();
    const { currentLanguage } = useLanguage();

    // Access control - only allow System Admin and Heritage Manager
    if (!user || (user.role !== 'SYSTEM_ADMINISTRATOR' && user.role !== 'HERITAGE_MANAGER')) {
        return (
            <div className="space-y-6">
                <Card className="p-6">
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MapPin className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Access Denied
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Only System Administrators and Heritage Managers can access the Sites Map
                        </p>
                    </div>
                </Card>
            </div>
        );
    }

    // Map state
    const [currentLayer, setCurrentLayer] = useState('openstreetmap');
    const [mapCenter, setMapCenter] = useState(RWANDA_CENTER);
    const [mapZoom, setMapZoom] = useState(8);
    const [selectedSite, setSelectedSite] = useState(null);
    const [viewMode, setViewMode] = useState(() => {
        // Get saved view mode from localStorage, default to 'map'
        return localStorage.getItem('sitesMapViewMode') || 'map';
    });
    const [toast, setToast] = useState(null);

    // Delete modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [siteToDelete, setSiteToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        region: '',
        category: '',
        status: ''
    });

    // Fetch heritage sites based on user role
    const isAdmin = user?.role === 'SYSTEM_ADMINISTRATOR';
    const isHeritageManager = user?.role === 'HERITAGE_MANAGER';

    // For Admin: Get all sites
    const {
        data: allSitesData,
        loading: allSitesLoading,
        error: allSitesError,
        refetch: refetchAllSites
    } = useGet('/api/heritage-sites', {
        language: currentLanguage,
        page: 0,
        size: 1000
    }, {
        enabled: isAdmin
    });

    // For Heritage Manager: Get only assigned sites
    const {
        data: assignedSitesData,
        loading: assignedSitesLoading,
        error: assignedSitesError,
        refetch: refetchAssignedSites
    } = useGet('/api/heritage-site-manager/my-sites', {
        userId: user?.id
    }, {
        enabled: isHeritageManager && !!user?.id
    });

    // Determine which data to use based on role
    const sitesData = isAdmin ? allSitesData : assignedSitesData;
    const loading = isAdmin ? allSitesLoading : assignedSitesLoading;
    const error = isAdmin ? allSitesError : assignedSitesError;
    const refetch = isAdmin ? refetchAllSites : refetchAssignedSites;

    // Extract sites from the appropriate data structure
    const sites = isAdmin
        ? (sitesData?.items || [])
        : (sitesData?.data || sitesData || []);



    // Filter sites based on search and filters
    const filteredSites = sites.filter(site => {
        const matchesSearch = !searchQuery ||
            site.nameEn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            site.nameRw?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            site.nameFr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            site.region?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRegion = !filters.region || site.region === filters.region;
        const matchesCategory = !filters.category || site.category === filters.category;
        const matchesStatus = !filters.status || site.status === filters.status;

        return matchesSearch && matchesRegion && matchesCategory && matchesStatus;
    });

    // Get sites with valid coordinates for map
    const sitesWithCoordinates = useMemo(() => {
        return filteredSites.filter(site =>
            site.gpsLatitude &&
            site.gpsLongitude &&
            !isNaN(parseFloat(site.gpsLatitude)) &&
            !isNaN(parseFloat(site.gpsLongitude))
        );
    }, [filteredSites]);

    // Calculate map bounds based on sites with coordinates
    const mapBounds = useMemo(() => {
        if (sitesWithCoordinates.length === 0) {
            return RWANDA_BOUNDS;
        }

        const lats = sitesWithCoordinates.map(site => parseFloat(site.gpsLatitude));
        const lngs = sitesWithCoordinates.map(site => parseFloat(site.gpsLongitude));

        return [
            [Math.min(...lats), Math.min(...lngs)], // Southwest
            [Math.max(...lats), Math.max(...lngs)]  // Northeast
        ];
    }, [sitesWithCoordinates]);

    // Handle marker click
    const handleMarkerClick = (site) => {
        setSelectedSite(site);
    };

    // Handle map click
    const handleMapClick = (e) => {
        setSelectedSite(null);

        // If admin, show coordinates for reference
        if (user?.role === 'SYSTEM_ADMINISTRATOR') {
            const { lat, lng } = e.latlng;
            setToast({
                type: 'info',
                message: `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                description: 'Click on sites to add these coordinates'
            });
        }
    };

    // Auto-zoom to search results when filters change
    useEffect(() => {
        if (sitesWithCoordinates.length > 0 && (searchQuery || filters.region || filters.category || filters.status)) {
            // Small delay to ensure map is ready
            const timer = setTimeout(() => {
                const map = document.querySelector('.leaflet-container')?._leaflet_map;
                if (map && sitesWithCoordinates.length > 0) {
                    const bounds = [
                        [Math.min(...sitesWithCoordinates.map(site => parseFloat(site.gpsLatitude))),
                        Math.min(...sitesWithCoordinates.map(site => parseFloat(site.gpsLongitude)))],
                        [Math.max(...sitesWithCoordinates.map(site => parseFloat(site.gpsLatitude))),
                        Math.max(...sitesWithCoordinates.map(site => parseFloat(site.gpsLongitude)))]
                    ];
                    map.fitBounds(bounds, { padding: [20, 20] });
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [searchQuery, filters, sitesWithCoordinates]);

    // Get site name in current language
    const getSiteName = (site) => {
        return site[`name${currentLanguage.toUpperCase()}`] || site.nameEn || 'Unnamed Site';
    };

    // Get site description in current language
    const getSiteDescription = (site) => {
        return site[`description${currentLanguage.toUpperCase()}`] || site.descriptionEn || 'No description available';
    };

    // Get marker color based on site status and search highlighting
    const getMarkerColor = (site) => {
        // If site is in search results, make it more prominent
        const isInSearchResults = searchQuery || filters.region || filters.category || filters.status;

        if (isInSearchResults) {
            // Highlight searched sites with brighter colors
            switch (site.status?.toLowerCase()) {
                case 'active': return '#059669'; // Darker green
                case 'under conservation': return '#D97706'; // Darker yellow
                case 'proposed': return '#2563EB'; // Darker blue
                case 'inactive': return '#4B5563'; // Darker gray
                case 'archived': return '#6B7280'; // Darker light gray
                default: return '#2563EB'; // Darker blue
            }
        } else {
            // Normal colors for non-searched sites
            switch (site.status?.toLowerCase()) {
                case 'active': return '#10B981'; // Green
                case 'under conservation': return '#F59E0B'; // Yellow
                case 'proposed': return '#3B82F6'; // Blue
                case 'inactive': return '#6B7280'; // Gray
                case 'archived': return '#9CA3AF'; // Light gray
                default: return '#3B82F6'; // Blue
            }
        }
    };

    const handleArchiveSite = async (siteId) => {
        try {
            const response = await fetch(`/api/heritage-sites/${siteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Refresh the sites data
                refetch();
                // Show success message
                setToast({
                    type: 'success',
                    message: 'Heritage site archived successfully. All data has been preserved and can be restored later.'
                });
            } else {
                const errorData = await response.json();
                const errorMessage = errorData.message || `Failed to archive site (HTTP ${response.status})`;
                setToast({
                    type: 'error',
                    message: `Error archiving site: ${errorMessage}`
                });
            }
        } catch (error) {
            console.error('Error archiving site:', error);
            setToast({
                type: 'error',
                message: `Error archiving site: ${error.message}`
            });
        }
    };

    const confirmDeleteSite = async (archiveReason) => {
        if (!siteToDelete) return;

        setDeleteLoading(true);
        try {
            // Call the delete API with archive reason
            const response = await fetch(`/api/heritage-sites/${siteToDelete.id}?archiveReason=${encodeURIComponent(archiveReason)}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                // Site archived successfully, refresh the list
                setToast({
                    type: 'success',
                    message: `Site "${siteToDelete.nameEn || siteToDelete.name || `Site ${siteToDelete.id}`}" archived successfully`
                });
                refetch();
                setShowDeleteModal(false);
                setSiteToDelete(null);
            } else {
                const errorData = await response.json();
                setToast({
                    type: 'error',
                    message: `Failed to archive site: ${errorData.message || 'Unknown error'}`
                });
            }
        } catch (error) {
            console.error('Error archiving site:', error);
            setToast({
                type: 'error',
                message: 'Failed to archive site. Please try again.'
            });
        } finally {
            setDeleteLoading(false);
        }
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setSiteToDelete(null);
        setDeleteLoading(false);
    };

    const handleRestoreSite = async (siteId) => {
        try {
            const response = await fetch(`/api/heritage-sites/${siteId}/restore`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Refresh the sites data
                refetch();
            } else {
                const errorData = await response.json();
                const errorMessage = errorData.message || `Failed to restore site (HTTP ${response.status})`;
                alert(`Error: ${errorMessage}`);
            }
        } catch (error) {
            console.error('Error restoring site:', error);
            alert(`Error restoring site: ${error.message}`);
        }
    };

    // Get unique values for filters
    const uniqueRegions = [...new Set(sites.map(site => site.region).filter(Boolean))].sort();
    const uniqueCategories = [...new Set(sites.map(site => site.category).filter(Boolean))].sort();
    const uniqueStatuses = [...new Set(sites.map(site => site.status).filter(Boolean))].sort();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">
                        {isAdmin ? 'Loading heritage sites...' : 'Loading your assigned sites...'}
                    </p>
                </div>
            </div>
        );
    }

    // Handle case when Heritage Manager has no assigned sites
    if (isHeritageManager && sites.length === 0 && !loading) {
        return (
            <div className="space-y-6">
                <div className="text-center sm:text-left border-b border-gray-200 dark:border-gray-700 pb-4">
                    <div className="flex items-center space-x-3 justify-center sm:justify-start mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Heritage Sites Map</h1>
                    </div>
                </div>

                <Card className="p-8">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MapPin className="w-10 h-10 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No Sites Assigned
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
                            You don't have any heritage sites assigned to you yet. Please contact your system administrator
                            to have heritage sites assigned to your account.
                        </p>
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-200">
                            <strong>Note:</strong> Once sites are assigned to you, you'll be able to view and manage them on this interactive map.
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                        <p className="text-red-600 mb-4">Failed to load heritage sites</p>
                        <p className="text-red-500 text-sm mb-4">{error.message || 'An error occurred'}</p>
                        <Button onClick={refetch} variant="outline">Try Again</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <style>{mapStyles}</style>
            <div className="space-y-6">
                {/* Header */}
                <div className="space-y-4">
                    {/* Page Title - Clear and Prominent */}
                    <div className="text-center sm:text-left border-b border-gray-200 dark:border-gray-700 pb-4">
                        <div className="flex items-center space-x-3 justify-center sm:justify-start mb-2">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Heritage Sites Map</h1>
                        </div>
                        <p className="text-lg text-gray-700 dark:text-gray-300 mt-2 font-medium">
                            {isAdmin
                                ? `Explore and manage ${sites.length} heritage ${sites.length === 1 ? 'site' : 'sites'} on an interactive map`
                                : sites.length > 0
                                    ? `View and manage your ${sites.length} assigned heritage ${sites.length === 1 ? 'site' : 'sites'}`
                                    : 'No heritage sites assigned to you yet'
                            }
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {isAdmin
                                ? 'Discover Rwanda\'s rich cultural heritage through our comprehensive mapping system'
                                : 'Manage and monitor your assigned heritage sites effectively'
                            }
                        </p>
                    </div>

                    {/* Search and Filters - Mobile Responsive */}
                    <div className="space-y-4">
                        {/* Search Bar */}
                        <div className="flex justify-center sm:justify-start">
                            <div className="relative w-full max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search sites by name or region..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Filters - Stack on mobile, row on larger screens */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto sm:mx-0">
                            {/* Region Filter */}
                            <select
                                value={filters.region}
                                onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                                <option value="">All Regions</option>
                                {uniqueRegions.map(region => (
                                    <option key={region} value={region}>{region}</option>
                                ))}
                            </select>

                            {/* Category Filter */}
                            <select
                                value={filters.category}
                                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                                <option value="">All Categories</option>
                                {uniqueCategories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>

                            {/* Status Filter */}
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                                <option value="">All Statuses</option>
                                {uniqueStatuses.map(status => (
                                    <option key={status} value={status}>
                                        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* View Toggle Buttons - Centered on mobile */}
                        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setMapCenter(RWANDA_CENTER);
                                    setMapZoom(8);
                                }}
                                className="text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800 w-full sm:w-auto"
                            >
                                <RefreshCw className="w-4 h-4 mr-1" />
                                Reset Map View
                            </Button>
                            <Button
                                variant={viewMode === 'map' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => {
                                    setViewMode('map');
                                    localStorage.setItem('sitesMapViewMode', 'map');
                                }}
                                className="flex items-center space-x-2 w-full sm:w-auto"
                            >
                                <MapPin className="w-4 h-4" />
                                <span>Map View</span>
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => {
                                    setViewMode('list');
                                    localStorage.setItem('sitesMapViewMode', 'list');
                                }}
                                className="flex items-center space-x-2 w-full sm:w-auto"
                            >
                                <Eye className="w-4 h-4" />
                                <span>List View</span>
                            </Button>
                        </div>
                    </div>
                </div>
                {/* Search Results Info */}
                {(searchQuery || filters.region || filters.category || filters.status) && (
                    <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                            <div className="flex items-center space-x-2">
                                <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <span className="text-blue-800 dark:text-blue-200 font-medium">
                                    Search Results: {filteredSites.length} sites found
                                </span>
                                {sitesWithCoordinates.length > 0 && (
                                    <span className="text-blue-600 dark:text-blue-300 text-sm">
                                        ({sitesWithCoordinates.length} with coordinates)
                                    </span>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSearchQuery('');
                                    setFilters({ region: '', category: '', status: '' });
                                }}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border-blue-300 dark:border-blue-600 hover:border-blue-400 dark:hover:border-blue-500 bg-white dark:bg-gray-800 w-full sm:w-auto"
                            >
                                Clear Search
                            </Button>
                        </div>
                    </div>
                )}

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <MapPin className="w-5 h-5 text-blue-500" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Total Sites</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{sites.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <MapPin className="w-5 h-5 text-green-500" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">With Coordinates</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {sites.filter(site =>
                                            site.gpsLatitude &&
                                            site.gpsLongitude &&
                                            !isNaN(parseFloat(site.gpsLatitude)) &&
                                            !isNaN(parseFloat(site.gpsLongitude))
                                        ).length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <MapPin className="w-5 h-5 text-purple-500" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">With Managers</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {sites.filter(site =>
                                            site.assignedManagerId &&
                                            site.assignedManagerId !== null &&
                                            site.assignedManagerId !== undefined
                                        ).length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <MapPin className="w-5 h-5 text-orange-500" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Without Managers</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {sites.filter(site =>
                                            !site.assignedManagerId ||
                                            site.assignedManagerId === null ||
                                            site.assignedManagerId === undefined
                                        ).length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>



                {/* Interactive Map */}
                {viewMode === 'map' && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center space-x-2">
                                    <MapPin className="w-5 h-5" />
                                    <span>Interactive Map</span>
                                </CardTitle>

                                {/* Map Controls */}
                                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                                    {/* Layer Selector */}
                                    <select
                                        value={currentLayer}
                                        onChange={(e) => {
                                            const newLayer = e.target.value;
                                            setCurrentLayer(newLayer);
                                            // Force a re-render of the TileLayer by updating a key
                                            setMapZoom(prev => prev); // This triggers a re-render
                                        }}
                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-gray-400"
                                    >
                                        {Object.entries(MAP_LAYERS).map(([key, layer]) => (
                                            <option key={key} value={key}>
                                                {layer.name}
                                            </option>
                                        ))}
                                    </select>

                                    {/* Zoom Controls */}
                                    <div className="flex border border-gray-300 rounded-lg w-full sm:w-auto">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const newZoom = Math.max(6, mapZoom - 1);
                                                setMapZoom(newZoom);
                                                // Also update the map directly for immediate response
                                                const map = document.querySelector('.leaflet-container')?._leaflet_map;
                                                if (map) {
                                                    map.setZoom(newZoom);
                                                }
                                            }}
                                            className="rounded-r-none border-r-0 hover:bg-gray-50 dark:hover:bg-gray-700"
                                            disabled={mapZoom <= 6}
                                        >
                                            <ZoomOut className="w-4 h-4" />
                                        </Button>
                                        <span className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-x border-gray-300">
                                            {mapZoom}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const newZoom = Math.min(18, mapZoom + 1);
                                                setMapZoom(newZoom);
                                                // Also update the map directly for immediate response
                                                const map = document.querySelector('.leaflet-container')?._leaflet_map;
                                                if (map) {
                                                    map.setZoom(newZoom);
                                                }
                                            }}
                                            className="rounded-l-none hover:bg-gray-50 dark:hover:bg-gray-700"
                                            disabled={mapZoom >= 18}
                                        >
                                            <ZoomIn className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* Reset View */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setMapCenter(RWANDA_CENTER);
                                            setMapZoom(8);
                                            // Also reset the map view immediately
                                            const map = document.querySelector('.leaflet-container')?._leaflet_map;
                                            if (map) {
                                                map.setView(RWANDA_CENTER, 8);
                                            }
                                        }}
                                        className="flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <Target className="w-4 h-4" />
                                        <span>Reset</span>
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="h-[600px] relative">
                                <MapContainer
                                    center={mapCenter}
                                    zoom={mapZoom}
                                    style={{ width: '100%', height: '100%' }}
                                    maxBounds={RWANDA_BOUNDS}
                                    maxBoundsViscosity={1.0}
                                    minZoom={6}
                                    maxZoom={18}
                                    className="rounded-b-lg"
                                >
                                    <TileLayer
                                        key={currentLayer} // Force re-render when layer changes
                                        url={MAP_LAYERS[currentLayer].url}
                                        attribution={MAP_LAYERS[currentLayer].attribution}
                                    />

                                    <MapEventHandler
                                        onMarkerClick={handleMarkerClick}
                                        onMapClick={handleMapClick}
                                    />

                                    <MapUpdater
                                        center={mapCenter}
                                        zoom={mapZoom}
                                        bounds={sitesWithCoordinates.length > 0 ? mapBounds : null}
                                    />

                                    {/* Heritage Site Markers */}
                                    {filteredSites
                                        .filter(site => site.gpsLatitude && site.gpsLongitude)
                                        .map(site => (
                                            <Marker
                                                key={site.id}
                                                position={[
                                                    parseFloat(site.gpsLatitude),
                                                    parseFloat(site.gpsLongitude)
                                                ]}
                                                icon={createCustomIcon(getMarkerColor(site), 'normal')}
                                                eventHandlers={{
                                                    click: () => handleMarkerClick(site)
                                                }}
                                            >
                                                <Popup>
                                                    <div className="min-w-[200px]">
                                                        <h3 className="font-semibold text-gray-900 mb-2">
                                                            {getSiteName(site)}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            {getSiteDescription(site).substring(0, 100)}
                                                            {getSiteDescription(site).length > 100 && '...'}
                                                        </p>
                                                        <div className="space-y-1 text-xs text-gray-500">
                                                            <p><strong>Region:</strong> {site.region}</p>
                                                            <p><strong>Category:</strong> {site.category}</p>
                                                            <p><strong>Status:</strong> {site.status}</p>
                                                            <p><strong>Ownership:</strong> {site.ownershipType || 'Unknown'}</p>
                                                            {site.assignedManagerId && (
                                                                <p><strong>Manager:</strong> Assigned</p>
                                                            )}
                                                        </div>
                                                        <div className="mt-3 flex space-x-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-xs"
                                                                onClick={() => window.open(`/dashboard/sites/${site.id}`, '_blank')}
                                                            >
                                                                <Eye className="w-3 h-3 mr-1" />
                                                                View
                                                            </Button>
                                                            {(user?.role === 'SYSTEM_ADMINISTRATOR' || user?.role === 'HERITAGE_MANAGER') && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="text-xs"
                                                                    onClick={() => window.open(`/dashboard/sites/${site.id}/edit`, '_blank')}
                                                                >
                                                                    <Edit className="w-3 h-3 mr-1" />
                                                                    Edit
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        ))}

                                    {/* No Coordinates Warning */}
                                    {sitesWithCoordinates.length === 0 && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90">
                                            <div className="text-center">
                                                <MapPin className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Sites with Coordinates</h3>
                                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                                    None of the heritage sites have GPS coordinates set.
                                                </p>
                                                {user?.role === 'SYSTEM_ADMINISTRATOR' && (
                                                    <div className="space-y-2">
                                                        <Button
                                                            onClick={() => window.open('/dashboard/sites', '_blank')}
                                                            className="flex items-center space-x-2"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                            <span>Add Coordinates</span>
                                                        </Button>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            Click on the map to get coordinates, then add them to your sites
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Sites Without Coordinates Count */}
                                    {sitesWithCoordinates.length > 0 && sitesWithCoordinates.length < sites.length && (
                                        <div className="absolute top-4 left-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 z-[1000]">
                                            <div className="flex items-center space-x-2">
                                                <MapPin className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                                        {sites.length - sitesWithCoordinates.length} sites without coordinates
                                                    </p>
                                                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                                        Add GPS coordinates to see them on the map
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Admin Instructions */}
                                    {user?.role === 'SYSTEM_ADMINISTRATOR' && (
                                        <div className="absolute top-20 left-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-3 z-[1000] max-w-xs">
                                            <div className="flex items-start space-x-2">
                                                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                                                        Map Tips for Admins
                                                    </p>
                                                    <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                                                        <li>• Click anywhere on map to get coordinates</li>
                                                        <li>• Use coordinates to update site locations</li>
                                                        <li>• Switch between map and list views</li>
                                                        <li>• Use filters to find specific sites</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Map Legend */}
                                    <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 z-[1000]">
                                        <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2">Site Status Legend</h4>
                                        <div className="space-y-1 text-xs">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                <span className="text-gray-900 dark:text-white font-medium">Active</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                                <span className="text-gray-900 dark:text-white font-medium">Under Conservation</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                                <span className="text-gray-900 dark:text-white font-medium">Proposed</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                                                <span className="text-gray-900 dark:text-white font-medium">Inactive</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                                                <span className="text-gray-900 dark:text-white font-medium">Archived</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Selected Site Info Panel */}
                                    {selectedSite && (
                                        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm z-[1000]">
                                            <div className="flex items-start justify-between mb-3">
                                                <h3 className="font-semibold text-gray-900 text-lg">
                                                    {getSiteName(selectedSite)}
                                                </h3>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedSite(null)}
                                                    className="text-gray-500 hover:text-gray-700"
                                                >
                                                    ×
                                                </Button>
                                            </div>

                                            <div className="space-y-2 text-sm text-gray-600">
                                                <p><strong>Region:</strong> {selectedSite.region}</p>
                                                <p><strong>Category:</strong> {selectedSite.category}</p>
                                                <p><strong>Status:</strong> {selectedSite.status}</p>
                                                <p><strong>Ownership:</strong> {selectedSite.ownershipType || 'Unknown'}</p>
                                                <p><strong>Coordinates:</strong> {parseFloat(selectedSite.gpsLatitude).toFixed(6)}, {parseFloat(selectedSite.gpsLongitude).toFixed(6)}</p>
                                                {selectedSite.assignedManagerId && (
                                                    <p><strong>Manager:</strong> Assigned</p>
                                                )}
                                            </div>

                                            <div className="mt-4 flex space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => window.open(`/dashboard/sites/${selectedSite.id}`, '_blank')}
                                                    className="flex-1"
                                                >
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    View Details
                                                </Button>
                                                {(user?.role === 'SYSTEM_ADMINISTRATOR' || user?.role === 'HERITAGE_MANAGER') && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => window.open(`/dashboard/sites/${selectedSite.id}/edit`, '_blank')}
                                                        className="flex-1"
                                                    >
                                                        <Edit className="w-4 h-4 mr-1" />
                                                        Edit
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </MapContainer>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Sites List */}
                {viewMode === 'list' && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Sites List ({filteredSites.length} sites)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {filteredSites.map(site => (
                                    <div
                                        key={site.id}
                                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <MapPin className="w-5 h-5 text-blue-500" />
                                            <div>
                                                <h4 className="font-medium text-gray-900">
                                                    {getSiteName(site)}
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    {site.region} • {site.category} • {site.status} • {site.ownershipType || 'Unknown'}
                                                </p>
                                                {site.gpsLatitude && site.gpsLongitude && (
                                                    <p className="text-xs text-green-600 mt-1">
                                                        📍 {parseFloat(site.gpsLatitude).toFixed(6)}, {parseFloat(site.gpsLongitude).toFixed(6)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            {site.assignedManagerId ? (
                                                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                                    Has Manager
                                                </span>
                                            ) : (
                                                <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                                                    No Manager
                                                </span>
                                            )}

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(`/dashboard/sites/${site.id}`, '_blank')}
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                View
                                            </Button>

                                            {(user?.role === 'SYSTEM_ADMINISTRATOR' || user?.role === 'HERITAGE_MANAGER') && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => window.open(`/dashboard/sites/${site.id}/edit`, '_blank')}
                                                >
                                                    <Edit className="w-4 h-4 mr-1" />
                                                    Edit
                                                </Button>
                                            )}

                                            {user?.role === 'SYSTEM_ADMINISTRATOR' && (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSiteToDelete(site);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        className="text-orange-600 hover:text-orange-700 border-orange-300 hover:border-orange-400"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-1" />
                                                        Archive
                                                    </Button>

                                                    {/* Restore button for archived sites */}
                                                    {site.status === 'ARCHIVED' && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                if (confirm(`Are you sure you want to restore "${getSiteName(site)}"? This will bring the site back to active status.`)) {
                                                                    // Call restore API
                                                                    handleRestoreSite(site.id);
                                                                }
                                                            }}
                                                            className="text-green-600 hover:text-green-700 border-green-300 hover:border-green-400"
                                                        >
                                                            <RotateCcw className="w-4 h-4 mr-1" />
                                                            Restore
                                                        </Button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Toast Notifications */}
                {toast && (
                    <Toast
                        type={toast.type}
                        message={toast.message}
                        description={toast.description}
                        onClose={() => setToast(null)}
                    />
                )}

                {/* Delete Site Modal */}
                <DeleteSiteModal
                    isOpen={showDeleteModal}
                    onClose={closeDeleteModal}
                    onConfirm={confirmDeleteSite}
                    site={siteToDelete}
                    loading={deleteLoading}
                />
            </div>
        </>
    );
};

export default SitesMap;
