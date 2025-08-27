import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Plus, Search, Filter, Folder, FolderOpen, FileText, Trash2, Edit, MoreHorizontal, Shield, Users, FolderPlus, Camera } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useGet } from '../../hooks/useSimpleApi';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import ComponentErrorBoundary from '../../components/error/ComponentErrorBoundary';
import FolderTreeView from '../../components/folders/FolderTreeView';
import FolderEditModal from '../../components/folders/FolderEditModal';
import FolderBreadcrumb from '../../components/folders/FolderBreadcrumb';
import FolderPermissionModal from '../../components/folders/FolderPermissionModal';
import BulkFolderCreationModal from '../../components/folders/BulkFolderCreationModal';
import foldersApi, { searchFolders, getFoldersBySite, getAllFoldersSystemWide } from '../../services/api/foldersApi';

const Folders = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();

    // State management
    const [sites, setSites] = useState([]);
    const [selectedSite, setSelectedSite] = useState(null);
    const [folders, setFolders] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingFolder, setEditingFolder] = useState(null);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [managingPermissionsFor, setManagingPermissionsFor] = useState(null);
    const [showBulkCreateModal, setShowBulkCreateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingFolder, setDeletingFolder] = useState(null);
    const [parentFolder, setParentFolder] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [viewMode, setViewMode] = useState('site'); // 'site' or 'system'

    // URL parameters
    const siteId = searchParams.get('siteId');
    const folderId = searchParams.get('folderId');

    // Role-based access control
    const isSystemAdmin = user?.role === 'SYSTEM_ADMINISTRATOR';
    const isHeritageManager = user?.role === 'HERITAGE_MANAGER';
    const isContentManager = user?.role === 'CONTENT_MANAGER';

    // Determine if user can see system view (Admin and Content Manager can)
    const canSeeSystemView = isSystemAdmin || isContentManager;

    // Determine which API endpoint to use for sites based on role
    const sitesEndpoint = isHeritageManager ? '/api/heritage-site-manager/my-sites' : '/api/heritage-sites';
    const sitesParams = isHeritageManager ? {} : { page: 0, size: 50, sort: 'nameEn,asc' };

    // API calls
    const { data: sitesData, loading: sitesLoading, error: sitesError, refetch: refetchSites } = useGet(sitesEndpoint, sitesParams, {
        onSuccess: (data) => {
            console.log('Heritage sites loaded successfully:', data);
            setHasError(false);
            setErrorMessage('');

            // Handle different response formats based on role
            let siteItems = [];
            if (isHeritageManager) {
                // Heritage Manager gets assigned sites from heritage-site-manager API
                if (data && data.data) {
                    siteItems = data.data.map(assignment => assignment.heritageSite || assignment);
                } else if (data && Array.isArray(data)) {
                    siteItems = data.map(assignment => assignment.heritageSite || assignment);
                }
            } else {
                // Admin and other roles get sites from heritage-sites API
                siteItems = data?.data?.items || data?.items || data || [];
            }

            setSites(siteItems);

            // Auto-select site if only one exists
            if (siteItems.length === 1 && !selectedSite) {
                setSelectedSite(siteItems[0]);
            }
        },
        onError: (error) => {
            console.error('Failed to load heritage sites:', error);
            setHasError(true);
            if (error.response?.status === 401) {
                setErrorMessage('Authentication error. Please log in again.');
                toast.error('Authentication error. Please log in again.');
            } else if (error.response?.status === 500) {
                setErrorMessage('Server error. Please try again later.');
                toast.error('Server error. Please try again later.');
            } else if (error.code === 'NETWORK_ERROR' || !error.response) {
                setErrorMessage('Network error. Please check your connection and try again.');
                toast.error('Network error. Please check your connection and try again.');
            } else {
                setErrorMessage('Failed to load heritage sites. Please try again.');
                toast.error('Failed to load heritage sites. Please try again.');
            }
        }
    });

    // Remove automatic folder loading - now using server-side search
    // const { data: foldersData, loading: foldersLoading, refetch: refetchFolders } = useGet('/api/folders', {
    //     siteId: selectedSite?.id,
    //     includeDocuments: true
    // }, {
    //     onSuccess: (data) => {
    //         const folderItems = data?.data?.items || data?.items || data || [];
    //         setFolders(folderItems);
    //     }
    // });

    // Ensure Heritage Managers can only use site view
    useEffect(() => {
        if (isHeritageManager && viewMode === 'system') {
            setViewMode('site');
            // If they have a selected site, load folders for that site
            if (selectedSite) {
                loadInitialFolders(selectedSite.id);
            }
        }
    }, [isHeritageManager, viewMode, selectedSite]);

    // Server-side search function
    const handleSearchFolders = async (query, siteId) => {
        if (!siteId || query.length < 2) {
            setFolders([]);
            setHasSearched(false);
            return;
        }

        setSearchLoading(true);
        setHasError(false);

        try {
            const response = await searchFolders(siteId, query);
            const folderItems = response?.data?.items || response?.items || response || [];
            setFolders(folderItems);
            setHasSearched(true);
        } catch (error) {
            console.error('Search failed:', error);
            setHasError(true);
            setErrorMessage('Failed to search folders. Please try again.');
            setFolders([]);
        } finally {
            setSearchLoading(false);
        }
    };

    // Load initial folders for system overview
    const loadInitialFolders = async (siteId) => {
        if (!siteId) return;

        console.log('Loading initial folders for site:', siteId);
        try {
            const response = await getFoldersBySite(siteId);
            console.log('Initial folders response:', response);

            // Fix the data extraction logic to handle different response structures
            let folderItems = [];
            if (response?.data?.items) {
                folderItems = response.data.items;
            } else if (response?.data && Array.isArray(response.data)) {
                folderItems = response.data;
            } else if (Array.isArray(response)) {
                folderItems = response;
            } else if (response?.items && Array.isArray(response.items)) {
                folderItems = response.items;
            }

            console.log('Extracted folder items:', folderItems);
            console.log('Setting folders to:', folderItems);
            setFolders(folderItems);
        } catch (error) {
            console.error('Failed to load initial folders:', error);
            // Don't show error for initial load, just log it
        }
    };

    // Load system-wide folders for System Administrators
    const loadSystemWideFolders = async () => {
        // Only allow System Administrators and Content Managers to load system-wide folders
        if (!canSeeSystemView) {
            console.log('User does not have permission to view system-wide folders');
            return;
        }

        console.log('Loading system-wide folders');
        try {
            const response = await getAllFoldersSystemWide();
            console.log('System-wide folders response:', response);

            // Fix the data extraction logic to handle different response structures
            let folderItems = [];
            if (response?.data?.items) {
                folderItems = response.data.items;
            } else if (response?.data && Array.isArray(response.data)) {
                folderItems = response.data;
            } else if (Array.isArray(response)) {
                folderItems = response;
            } else if (response?.items && Array.isArray(response.items)) {
                folderItems = response.items;
            }

            console.log('Extracted system-wide folder items:', folderItems);
            console.log('Setting system-wide folders to:', folderItems);
            setFolders(folderItems);
        } catch (error) {
            console.error('Failed to load system-wide folders:', error);
            // Don't show error for initial load, just log it
        }
    };

    // Combined loading state
    const isLoading = sitesLoading;

    // Handle site selection from URL
    useEffect(() => {
        if (siteId && sites.length > 0) {
            const site = sites.find(s => s.id.toString() === siteId);
            if (site) {
                setSelectedSite(site);
            }
        }
    }, [siteId, sites]);

    // Handle search with debouncing
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Trigger search when debounced query changes
    useEffect(() => {
        if (selectedSite && debouncedSearchQuery.length >= 2) {
            handleSearchFolders(debouncedSearchQuery, selectedSite.id);
        } else if (selectedSite && debouncedSearchQuery.length === 0) {
            setFolders([]);
            setHasSearched(false);
        }
    }, [debouncedSearchQuery, selectedSite]);

    // Clear folders when site changes and load initial folders
    useEffect(() => {
        if (selectedSite) {
            console.log('Site changed to:', selectedSite.name);
            setSearchQuery('');
            setHasSearched(false);
            setSelectedFolder(null);

            // Load initial folders after clearing state
            setTimeout(() => {
                loadInitialFolders(selectedSite.id);
            }, 100);
        }
    }, [selectedSite]);

    // Handle folder selection from URL
    useEffect(() => {
        if (folderId && folders.length > 0) {
            const folder = folders.find(f => f.id.toString() === folderId);
            if (folder) {
                setSelectedFolder(folder);
            }
        }
    }, [folderId, folders]);

    // Load system-wide folders on component mount for System Administrators
    useEffect(() => {
        // Only load system-wide folders for users who can access them
        if (canSeeSystemView) {
            loadSystemWideFolders();
        }
    }, [canSeeSystemView]);

    // Remove the separate loadInitialFolders useEffect since it's now combined above

    // Handle site selection
    const handleSiteSelect = (site) => {
        setSelectedSite(site);
        setSearchQuery('');
        setFolders([]);
        setHasSearched(false);
        setSelectedFolder(null);

        // Update URL
        const newSearchParams = new URLSearchParams(searchParams);
        if (site) {
            newSearchParams.set('siteId', site.id);
        } else {
            newSearchParams.delete('siteId');
        }
        newSearchParams.delete('folderId');
        navigate(`?${newSearchParams.toString()}`);
    };

    const handleFolderSelect = (folder) => {
        setSelectedFolder(folder);
        // Update URL
        const params = new URLSearchParams(searchParams);
        if (folder) {
            params.set('folderId', folder.id);
        } else {
            params.delete('folderId');
        }
        navigate(`?${params.toString()}`);
    };

    const handleCreateFolder = () => {
        setShowCreateModal(true);
        setEditingFolder(null);
    };

    const handleEditFolder = (folder) => {
        setEditingFolder(folder);
        setShowCreateModal(true);
    };

    const handleCreateSubfolder = (parentFolder) => {
        setEditingFolder(null);
        setParentFolder(parentFolder);
        setShowCreateModal(true);
    };

    const handleFolderSaved = () => {
        setShowCreateModal(false);
        setEditingFolder(null);
        // Refresh folders if we have a current search
        if (selectedSite && searchQuery.length >= 2) {
            handleSearchFolders(searchQuery, selectedSite.id);
        }
        toast.success('Folder saved successfully');
    };

    const handleFolderDeleted = () => {
        // Refresh folders if we have a current search
        if (selectedSite && searchQuery.length >= 2) {
            handleSearchFolders(searchQuery, selectedSite.id);
        }
        toast.success('Folder deleted successfully');
    };

    const handleManagePermissions = (folder) => {
        setManagingPermissionsFor(folder);
        setShowPermissionModal(true);
    };

    const handleDeleteFolder = (folder) => {
        setDeletingFolder(folder);
        setShowDeleteModal(true);
    };

    const confirmDeleteFolder = async () => {
        if (!deletingFolder) return;

        try {
            await foldersApi.deleteFolder(deletingFolder.id);

            // Refresh folders if we have a current search
            if (selectedSite && searchQuery.length >= 2) {
                handleSearchFolders(searchQuery, selectedSite.id);
            } else if (selectedSite) {
                loadInitialFolders(selectedSite.id);
            } else if (viewMode === 'system' && canSeeSystemView) {
                loadSystemWideFolders();
            }

            toast.success(`Folder "${deletingFolder.name}" deleted successfully`);
            setShowDeleteModal(false);
            setDeletingFolder(null);
        } catch (error) {
            console.error('Failed to delete folder:', error);
            toast.error('Failed to delete folder. Please try again.');
        }
    };

    const cancelDeleteFolder = () => {
        setShowDeleteModal(false);
        setDeletingFolder(null);
    };

    const handlePermissionsSaved = async (updatedFolder) => {
        try {
            // Update the folder with new permissions using the existing updateFolder API
            console.log('Updating folder permissions:', updatedFolder);

            // Call the folders API to update the folder permissions only
            const response = await foldersApi.updateFolderPermissions(updatedFolder.id, {
                allowedRoles: updatedFolder.allowedRoles
            });

            console.log('Permissions updated successfully:', response);

            // Refresh folders if we have a current search
            if (selectedSite && searchQuery.length >= 2) {
                handleSearchFolders(searchQuery, selectedSite.id);
            }
            toast.success('Folder permissions updated successfully');
        } catch (error) {
            console.error('Failed to update folder permissions:', error);
            toast.error('Failed to update folder permissions');
        }
    };

    const handleBulkCreate = () => {
        setShowBulkCreateModal(true);
    };

    const handleBulkCreateSaved = (createdFolders) => {
        // Refresh folders if we have a current search
        if (selectedSite && searchQuery.length >= 2) {
            handleSearchFolders(searchQuery, selectedSite.id);
        }
        toast.success(`Successfully created ${createdFolders.length} folders`);
    };

    const getFolderIcon = (folder) => {
        if (folder.children && folder.children.length > 0) {
            return <FolderOpen className="w-5 h-5 text-blue-500" />;
        }
        return <Folder className="w-5 h-5 text-gray-500" />;
    };

    const getFolderTypeColor = (type) => {
        const colors = {
            GENERAL: 'bg-blue-100 text-blue-800',
            HISTORICAL: 'bg-amber-100 text-amber-800',
            ARCHAEOLOGICAL: 'bg-orange-100 text-orange-800',
            ARCHITECTURAL: 'bg-purple-100 text-purple-800',
            CONSERVATION: 'bg-green-100 text-green-800',
            RESEARCH: 'bg-indigo-100 text-indigo-800',
            LEGAL: 'bg-red-100 text-red-800',
            ADMINISTRATIVE: 'bg-gray-100 text-gray-800',
            MEDIA_COVERAGE: 'bg-pink-100 text-pink-800',
            PHOTOGRAPHS: 'bg-cyan-100 text-cyan-800',
            MAPS: 'bg-emerald-100 text-emerald-800',
            REPORTS: 'bg-slate-100 text-slate-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    return (
        <ComponentErrorBoundary>
            <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Manage Folders</h1>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Organize and structure your documents</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/dashboard/documents')}
                            className="text-gray-600 hover:text-gray-900 w-full sm:w-auto min-h-[40px] px-3 py-2"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="hidden sm:inline">Back to Documents</span>
                            <span className="sm:hidden">Back</span>
                        </Button>
                        <Button
                            onClick={handleCreateFolder}
                            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto min-h-[40px] px-3 py-2"
                            disabled={!selectedSite}
                            title={!selectedSite ? "Select a heritage site first" : "Create new folder"}
                        >
                            <Plus className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="hidden sm:inline">Create Folder</span>
                            <span className="sm:hidden">Create</span>
                        </Button>
                        <Button
                            onClick={handleBulkCreate}
                            variant="outline"
                            className="border-blue-600 text-blue-600 hover:bg-blue-50 w-full sm:w-auto min-h-[40px] px-3 py-2"
                            disabled={!selectedSite}
                            title={!selectedSite ? "Select a heritage site first" : "Create multiple folders at once"}
                        >
                            <Folder className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="hidden sm:inline">Bulk Create</span>
                            <span className="sm:hidden">Bulk</span>
                        </Button>
                    </div>
                </div>

                {/* System-wide Overview for Admins - Moved to top */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center space-x-2">
                            <Shield className="w-5 h-5 text-purple-600" />
                            <span>
                                System Overview
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                                    <Button
                                        variant={viewMode === 'site' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => {
                                            setViewMode('site');
                                            if (selectedSite) {
                                                loadInitialFolders(selectedSite.id);
                                            }
                                        }}
                                        disabled={!selectedSite}
                                        className="w-full sm:w-auto min-h-[36px] px-3 py-2"
                                    >
                                        Site View
                                    </Button>
                                    {canSeeSystemView && (
                                        <Button
                                            variant={viewMode === 'system' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => {
                                                setViewMode('system');
                                                loadSystemWideFolders();
                                            }}
                                            className="w-full sm:w-auto min-h-[36px] px-3 py-2"
                                        >
                                            System View
                                        </Button>
                                    )}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
                                    {viewMode === 'site' ?
                                        (isHeritageManager ?
                                            'Showing folders for your assigned site' :
                                            'Showing folders for selected site'
                                        ) :
                                        'Showing all folders system-wide'
                                    }
                                </div>
                            </div>
                        </div>
                        {selectedSite || viewMode === 'system' ? (
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                                <div className="text-center p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {folders.length}
                                    </div>
                                    <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                                        {viewMode === 'system' ? 'Total Folders' : 'Total Folders'}
                                    </div>
                                </div>
                                <div className="text-center p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">
                                        {folders.filter(f => f.allowedRoles && f.allowedRoles.includes('PUBLIC')).length}
                                    </div>
                                    <div className="text-xs sm:text-sm text-green-600 dark:text-green-400">
                                        Public
                                    </div>
                                </div>
                                <div className="text-center p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        {folders.filter(f => f.parentId === null).length}
                                    </div>
                                    <div className="text-xs sm:text-sm text-purple-600 dark:text-purple-400">
                                        Root
                                    </div>
                                </div>
                                <div className="text-center p-3 sm:p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600 dark:text-orange-400">
                                        {folders.filter(f => f.parentId !== null).length}
                                    </div>
                                    <div className="text-xs sm:text-sm text-orange-600 dark:text-orange-400">
                                        Sub
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                                <Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <h3 className="text-lg font-medium mb-2">
                                    {isHeritageManager ? 'Your Assigned Site is Loading' : 'No Site Selected'}
                                </h3>
                                <p>
                                    {isHeritageManager ?
                                        'Please wait while we load your assigned heritage site...' :
                                        'Select a heritage site from the dropdown below to view folder statistics and manage folders.'
                                    }
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Site Selection */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg">
                            {isHeritageManager ? 'Your Assigned Heritage Site' : 'Select Heritage Site'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                            <select
                                value={selectedSite?.id || ''}
                                onChange={(e) => {
                                    const site = sites.find(s => s.id.toString() === e.target.value);
                                    handleSiteSelect(site);
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base min-h-[40px]"
                                disabled={isLoading}
                            >
                                <option value="">
                                    {isHeritageManager ? 'Loading your assigned site...' : 'Select a heritage site...'}
                                </option>
                                {sites.map(site => (
                                    <option key={site.id} value={site.id}>
                                        {site.nameEn || site.name}
                                    </option>
                                ))}
                            </select>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => refetchSites()}
                                disabled={isLoading}
                                className="w-full sm:w-auto min-h-[40px] px-3 py-2"
                            >
                                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                <span className="ml-2 sm:hidden">Refresh</span>
                                <span className="hidden sm:inline">Refresh</span>
                            </Button>
                        </div>
                        {isHeritageManager && (
                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                You can only manage folders for your assigned heritage site.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Folders Management Section - Full Width */}
                {selectedSite && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center space-x-2">
                                <Folder className="w-5 h-5 text-blue-600" />
                                <span>
                                    {isHeritageManager ?
                                        `Folder Management - ${selectedSite.nameEn || selectedSite.name}` :
                                        `Folder Management - ${selectedSite.nameEn || selectedSite.name}`
                                    }
                                </span>
                            </CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {isHeritageManager ?
                                    'Organize and manage folders for your assigned heritage site' :
                                    'Organize and manage folders for the selected heritage site'
                                }
                            </p>
                        </CardHeader>
                        <CardContent>
                            {/* Search and Filters */}
                            <div className="mb-6">
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                                    <div className="relative flex-1 min-w-0">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <Input
                                            type="text"
                                            placeholder={selectedSite ? "Search folders by name or description..." : "Select a site first to search folders"}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10 text-sm sm:text-base w-full"
                                            disabled={!selectedSite}
                                        />
                                        {searchLoading && (
                                            <RefreshCw className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-4 h-4 animate-spin" />
                                        )}
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={!selectedSite || searchQuery.length < 2}
                                            onClick={() => handleSearchFolders(searchQuery, selectedSite?.id)}
                                            className="w-full sm:w-auto min-h-[36px] px-3 py-2"
                                        >
                                            <Filter className="w-4 h-4 mr-2" />
                                            Search
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={!selectedSite}
                                            onClick={() => loadInitialFolders(selectedSite?.id)}
                                            title="Refresh folders for this site"
                                            className="w-full sm:w-auto min-h-[36px] px-3 py-2"
                                        >
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                            Refresh
                                        </Button>
                                    </div>
                                </div>

                                {/* Search Results Info */}
                                {selectedSite && hasSearched && (
                                    <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                                        {searchLoading ? (
                                            <span className="flex items-center">
                                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                                Searching folders...
                                            </span>
                                        ) : searchQuery.length > 0 ? (
                                            <span>
                                                Found {folders.length} folder{folders.length !== 1 ? 's' : ''} for "{searchQuery}"
                                            </span>
                                        ) : (
                                            <span>Enter at least 2 characters to search folders</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Folders Grid */}
                            <div className="space-y-4">
                                {/* Breadcrumb */}
                                {selectedFolder && (
                                    <FolderBreadcrumb
                                        breadcrumb={[selectedFolder]}
                                        onNavigate={handleFolderSelect}
                                        className="mb-4"
                                    />
                                )}

                                {/* Folders Display */}
                                {searchLoading ? (
                                    <Card>
                                        <CardContent className="p-8 text-center">
                                            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                                            <p className="text-gray-600 dark:text-gray-400">Searching folders...</p>
                                        </CardContent>
                                    </Card>
                                ) : hasSearched && searchQuery.length > 0 ? (
                                    // Show search results
                                    folders.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                                            {folders.map((folder) => (
                                                <Card
                                                    key={folder.id}
                                                    className="cursor-pointer hover:shadow-md transition-shadow"
                                                    onClick={() => handleFolderSelect(folder)}
                                                >
                                                    <CardContent className="p-3 sm:p-4">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base truncate">
                                                                    {folder.name}
                                                                </h3>
                                                                <Badge variant="secondary" className="mb-2 text-xs">
                                                                    {folder.type}
                                                                </Badge>
                                                                {folder.description && (
                                                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                                                        {folder.description}
                                                                    </p>
                                                                )}
                                                                <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                                                    <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                                                    {folder.documentCount || 0} documents
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-1 ml-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEditFolder(folder);
                                                                    }}
                                                                    className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                                                                >
                                                                    <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleManagePermissions(folder);
                                                                    }}
                                                                    className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                                                                >
                                                                    <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteFolder(folder);
                                                                    }}
                                                                    className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                                                                >
                                                                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <Card>
                                            <CardContent className="p-8 text-center">
                                                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                    No folders found
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                                    No folders match your search for "{searchQuery}"
                                                </p>
                                                <div className="space-y-2">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Try:
                                                    </p>
                                                    <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                                                        <li>• Using different keywords</li>
                                                        <li>• Checking spelling</li>
                                                        <li>• Using broader terms</li>
                                                    </ul>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                ) : folders.length > 0 ? (
                                    // Show all folders for the site (system overview)
                                    <div>
                                        <div className="mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                {viewMode === 'system' ? 'All Folders System-Wide' : `All Folders in ${selectedSite.nameEn || selectedSite.name}`}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {folders.length} folder{folders.length !== 1 ? 's' : ''} found
                                                {viewMode === 'system' && ' across all heritage sites'}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                                            {folders.map((folder) => (
                                                <Card
                                                    key={folder.id}
                                                    className="cursor-pointer hover:shadow-md transition-shadow"
                                                    onClick={() => handleFolderSelect(folder)}
                                                >
                                                    <CardContent className="p-3 sm:p-4">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base truncate">
                                                                    {folder.name}
                                                                </h3>
                                                                <div className="flex flex-wrap gap-1 sm:gap-2 mb-2">
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        {folder.type}
                                                                    </Badge>
                                                                    {viewMode === 'system' && folder.siteName && (
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {folder.siteName}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                {folder.description && (
                                                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                                                        {folder.description}
                                                                    </p>
                                                                )}
                                                                <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                                                    <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                                                    {folder.documentCount || 0} documents
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-1 ml-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEditFolder(folder);
                                                                    }}
                                                                    className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                                                                >
                                                                    <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleManagePermissions(folder);
                                                                    }}
                                                                    className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                                                                >
                                                                    <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteFolder(folder);
                                                                    }}
                                                                    className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                                                                >
                                                                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    // Show ready to search message
                                    <Card>
                                        <CardContent className="p-8 text-center">
                                            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                {isHeritageManager ? 'Ready to Search Your Site' : 'Ready to Search'}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                                {isHeritageManager ?
                                                    'Enter at least 2 characters in the search box above to find folders in your assigned site' :
                                                    'Enter at least 2 characters in the search box above to find folders'
                                                }
                                            </p>
                                            <div className="space-y-2">
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    You can search for:
                                                </p>
                                                <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                                                    <li>• Folder names (e.g., "Historical", "Archaeological")</li>
                                                    <li>• Folder descriptions (e.g., "conservation", "legal")</li>
                                                    <li>• Folder types (e.g., "General", "Historical")</li>
                                                </ul>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Media Gallery Section - Full Width Below Folders */}
                {selectedSite && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center space-x-2">
                                <Camera className="w-5 h-5 text-green-600" />
                                <span>Media Gallery</span>
                            </CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Manage media files and documents for {selectedSite.nameEn || selectedSite.name}
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                                <Camera className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <h3 className="text-lg font-medium mb-2">Media Gallery Integration</h3>
                                <p className="mb-4">
                                    The Media Gallery component will be integrated here to provide a seamless experience
                                    for managing both folders and media files in one unified interface.
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate(`/dashboard/media/${selectedSite.id}`)}
                                    className="w-full sm:w-auto min-h-[40px] px-4 py-2"
                                >
                                    <Camera className="w-4 h-4 mr-2" />
                                    <span>Open Media Gallery</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Loading State */}
                {isLoading && (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-500 dark:text-gray-400">Loading folders...</p>
                        </CardContent>
                    </Card>
                )}

                {/* Error State */}
                {hasError && (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <div className="text-red-500 mb-4">
                                <FileText className="w-16 h-16 mx-auto" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Error Loading Folders
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                {errorMessage}
                            </p>
                            <Button onClick={() => refetchSites()} variant="outline">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Try Again
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Modals */}
                {/* Create/Edit Folder Modal */}
                {showCreateModal && (
                    <FolderEditModal
                        isOpen={showCreateModal}
                        onClose={() => setShowCreateModal(false)}
                        folder={editingFolder}
                        parentFolder={parentFolder}
                        siteId={selectedSite?.id}
                        onSave={handleFolderSaved}
                        onDelete={handleFolderDeleted}
                    />
                )}

                {/* Folder Permissions Modal */}
                {showPermissionModal && managingPermissionsFor && (
                    <FolderPermissionModal
                        isOpen={showPermissionModal}
                        onClose={() => {
                            setShowPermissionModal(false);
                            setManagingPermissionsFor(null);
                        }}
                        folder={managingPermissionsFor}
                        onSave={handlePermissionsSaved}
                    />
                )}

                {/* Bulk Folder Creation Modal */}
                {showBulkCreateModal && (
                    <BulkFolderCreationModal
                        isOpen={showBulkCreateModal}
                        onClose={() => setShowBulkCreateModal(false)}
                        siteId={selectedSite?.id}
                        onSave={handleBulkCreateSaved}
                    />
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && deletingFolder && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-sm sm:max-w-md p-4 sm:p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                                        Delete Folder
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                        This action cannot be undone
                                    </p>
                                </div>
                            </div>

                            <div className="mb-4 sm:mb-6">
                                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                                    Are you sure you want to delete the folder <span className="font-semibold">"{deletingFolder.name}"</span>?
                                </p>
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    This will permanently remove the folder and all its contents.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                                <Button
                                    variant="outline"
                                    onClick={cancelDeleteFolder}
                                    className="px-3 py-2 sm:px-4 justify-center"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={confirmDeleteFolder}
                                    className="px-3 py-2 sm:px-4 bg-red-600 hover:bg-red-700 text-white justify-center"
                                >
                                    Delete Folder
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ComponentErrorBoundary>
    );
};

export default Folders;
