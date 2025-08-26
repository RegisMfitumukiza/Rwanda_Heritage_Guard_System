import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Download, Search, Filter, Upload, FileText, ArrowDown, ArrowUp, Layout } from 'lucide-react';
// DashboardLayout removed - already wrapped by ContentManagerLayout in routing
import DocumentUploadInterface from '../../components/documents/DocumentUploadInterface';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useGet } from '../../hooks/useSimpleApi';
import { toast } from 'react-hot-toast';
import ComponentErrorBoundary from '../../components/error/ComponentErrorBoundary';

const DocumentManagement = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // State management
    const [sites, setSites] = useState([]);
    const [selectedSite, setSelectedSite] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Layout management
    const [folderLayout, setFolderLayout] = useState(() => {
        const saved = localStorage.getItem('documentFolderLayout');
        return saved || 'sidebar';
    });

    // URL parameters
    const siteId = searchParams.get('siteId');
    const view = searchParams.get('view') || 'overview';

    // API hooks for data loading
    const { data: sitesData, loading: sitesLoading, refetch: refetchSites } = useGet('/api/heritage-sites', {
        page: 0,
        size: 50,
        sort: 'nameEn,asc'
    }, {
        onSuccess: (data) => {
            console.log('Heritage sites loaded successfully:', data);
            setHasError(false);
            setErrorMessage('');
            const siteItems = data?.data?.items || data?.items || data || [];
            setSites(siteItems);
        },
        onError: (error) => {
            console.error('Failed to load heritage sites:', error);
            setHasError(true);
            // Check if it's an authentication error
            if (error.response?.status === 401) {
                console.error('Authentication error - user may need to re-login');
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

    const { data: documentsData, loading: documentsLoading, refetch: refetchDocuments } = useGet('/api/site-documents', {
        page: 0,
        size: 50,
        sort: 'fileName,asc'
    }, {
        onSuccess: (data) => {
            console.log('Documents loaded successfully:', data);
            setHasError(false);
            setErrorMessage('');
            const docItems = data?.data?.items || data?.items || data || [];
            setDocuments(docItems);
        },
        onError: (error) => {
            console.error('Failed to load documents:', error);
            setHasError(true);
            // Check if it's an authentication error
            if (error.response?.status === 401) {
                console.error('Authentication error - user may need to re-login');
                setErrorMessage('Authentication error. Please log in again.');
                toast.error('Authentication error. Please log in again.');
            } else if (error.response?.status === 500) {
                setErrorMessage('Server error. Please try again later.');
                toast.error('Server error. Please try again later.');
            } else if (error.code === 'NETWORK_ERROR' || !error.response) {
                setErrorMessage('Network error. Please check your connection and try again.');
                toast.error('Network error. Please check your connection and try again.');
            } else {
                setErrorMessage('Failed to load documents. Please try again.');
                toast.error('Failed to load documents. Please try again.');
            }
        }
    });

    // Combined loading state
    const isLoading = sitesLoading || documentsLoading;

    // Handle layout changes
    useEffect(() => {
        localStorage.setItem('documentFolderLayout', folderLayout);
    }, [folderLayout]);

    // Handle site selection from URL
    useEffect(() => {
        if (siteId && sites.length > 0) {
            const site = sites.find(s => s.id.toString() === siteId);
            if (site) {
                setSelectedSite(site);
            }
        }
    }, [siteId, sites]);

    // Load data on mount
    useEffect(() => {
        refetchSites();
        refetchDocuments();
    }, []);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Handle site selection
    const handleSiteSelect = (site) => {
        setSelectedSite(site);
        navigate(`/dashboard/documents?view=site&siteId=${site.id}`);
    };

    // Handle back navigation
    const handleBack = () => {
        if (selectedSite) {
            setSelectedSite(null);
            navigate('/dashboard/documents?view=overview');
        } else {
            navigate('/dashboard');
        }
    };

    // Get documents for selected site
    const getSiteDocuments = (siteId) => {
        return documents.filter(doc => doc.heritageSiteId === siteId);
    };

    // Filter sites by search query
    const filteredSites = React.useMemo(() => {
        if (!debouncedSearchQuery) return sites;

        return sites.filter(site =>
            site.nameEn?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
            site.nameRw?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
            site.nameFr?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
            site.region?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        );
    }, [sites, debouncedSearchQuery]);

    // Calculate statistics
    const totalDocuments = documents.length;
    const totalSitesWithDocs = new Set(documents.map(doc => doc.heritageSiteId)).size;

    return (
        <ComponentErrorBoundary componentName="Document Management">
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Document Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {selectedSite
                                ? `Managing documents for: ${selectedSite.nameEn || selectedSite.nameRw || selectedSite.nameFr}`
                                : "Manage heritage site documents and archives"
                            }
                        </p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                refetchSites();
                                refetchDocuments();
                            }}
                            disabled={isLoading}
                            className="flex items-center space-x-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            <span>Refresh</span>
                        </Button>

                        <Button
                            variant="outline"
                            onClick={handleBack}
                            className="flex items-center space-x-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                        </Button>
                    </div>
                </div>

                {/* Error Display */}
                {hasError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-5 h-5 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
                                    <span className="text-red-600 dark:text-red-400 text-sm font-bold">!</span>
                                </div>
                                <div>
                                    <p className="text-red-800 dark:text-red-200 font-medium">Error loading data</p>
                                    <p className="text-red-600 dark:text-red-300 text-sm">{errorMessage}</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setHasError(false);
                                    setErrorMessage('');
                                    refetchSites();
                                    refetchDocuments();
                                }}
                                className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Retry
                            </Button>
                        </div>
                    </div>
                )}

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search heritage sites..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {searchQuery !== debouncedSearchQuery && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
                        </div>
                    )}
                </div>

                {view === 'overview' || !selectedSite ? (
                    /* Overview Mode */
                    <div className="space-y-6">
                        {/* Loading State */}
                        {isLoading && (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                                    <p className="text-gray-600 dark:text-gray-400">Loading document management data...</p>
                                </div>
                            </div>
                        )}

                        {/* Statistics Cards */}
                        {!isLoading && sites.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                                <FileText className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {totalDocuments}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Total Documents
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                                <Upload className="w-6 h-6 text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {totalSitesWithDocs}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Sites with Documents
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                                                <Search className="w-6 h-6 text-purple-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {sites.length}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Total Heritage Sites
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Empty State */}
                        {!isLoading && sites.length === 0 && !hasError && (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileText className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Heritage Sites Found</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                                        There are no heritage sites available for document management.
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            refetchSites();
                                            refetchDocuments();
                                        }}
                                        className="flex items-center space-x-2 mx-auto"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        <span>Refresh</span>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Sites List */}
                        {!isLoading && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Heritage Sites</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {filteredSites.length > 0 ? (
                                        <div className="space-y-3">
                                            {filteredSites.map((site) => {
                                                const siteDocuments = getSiteDocuments(site.id);

                                                return (
                                                    <div
                                                        key={site.id}
                                                        onClick={() => handleSiteSelect(site)}
                                                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                                                    >
                                                        <div className="flex items-center space-x-4">
                                                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                                                <FileText className="w-6 h-6 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-medium text-gray-900 dark:text-white">
                                                                    {site.nameEn || site.nameRw || site.nameFr}
                                                                </h4>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {site.category} • {site.region}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center space-x-4">
                                                            <div className="text-right">
                                                                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                                                    {siteDocuments.length}
                                                                </div>
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {siteDocuments.length === 1 ? 'Document' : 'Documents'}
                                                                </div>
                                                            </div>

                                                            <Button variant="ghost" size="sm">
                                                                Manage
                                                            </Button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            <p>No heritage sites found matching your search</p>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSearchQuery('')}
                                                className="mt-2"
                                            >
                                                Clear Search
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                ) : (
                    /* Site-specific Document Management */
                    <div>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                                    <p className="text-gray-600 dark:text-gray-400">Loading site data...</p>
                                </div>
                            </div>
                        ) : selectedSite ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Document Management for {selectedSite.nameEn || selectedSite.nameRw || selectedSite.nameFr}
                                    </h2>

                                    {/* Layout Toggle */}
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Layout:</span>
                                        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                            <button
                                                onClick={() => setFolderLayout('sidebar')}
                                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${folderLayout === 'sidebar'
                                                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                                    }`}
                                                title="Sidebar layout (folders on left)"
                                            >
                                                <Layout className="w-4 h-4 inline mr-1" />
                                                Sidebar
                                            </button>
                                            <button
                                                onClick={() => setFolderLayout('top')}
                                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${folderLayout === 'top'
                                                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                                    }`}
                                                title="Top layout (folders above documents)"
                                            >
                                                <ArrowDown className="w-4 h-4 inline mr-1" />
                                                Top
                                            </button>
                                            <button
                                                onClick={() => setFolderLayout('bottom')}
                                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${folderLayout === 'bottom'
                                                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                                    }`}
                                                title="Bottom layout (folders below documents)"
                                            >
                                                <ArrowUp className="w-4 h-4 inline mr-1" />
                                                Bottom
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <DocumentUploadInterface
                                    siteId={selectedSite.id}
                                    folderLayout={folderLayout}
                                    onDocumentAdded={(newDoc) => {
                                        setDocuments(prev => [newDoc, ...prev]);
                                        toast.success('Document uploaded successfully');
                                    }}
                                    onDocumentDeleted={(deletedId) => {
                                        setDocuments(prev => prev.filter(doc => doc.id !== deletedId));
                                    }}
                                />
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Site not found. Please go back and select a valid site.
                                    </p>
                                    <Button onClick={handleBack} className="mt-4">
                                        Back to Overview
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </ComponentErrorBoundary>
    );
};

export default DocumentManagement;





