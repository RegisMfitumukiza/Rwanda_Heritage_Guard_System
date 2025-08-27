import React, { useState, useEffect } from 'react';
import {
    MapPin,
    Plus,
    Archive,
    Search,
    Filter,
    RefreshCw,
    Eye,
    Edit3,
    Trash2,
    ChevronDown,
    X
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useGet } from '../../hooks/useSimpleApi';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import DeleteSiteModal from '../modals/DeleteSiteModal';

/**
 * Admin Sites List Component
 * Full-featured interface for System Administrators to manage all heritage sites
 * Includes search, filters, bulk operations, and comprehensive site management
 */
const AdminSitesList = () => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        ownershipType: 'All Ownership Types',
        category: 'All Categories',
        year: '',
        status: 'All Statuses'
    });
    const [showFilters, setShowFilters] = useState(false);
    const [selectedSites, setSelectedSites] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);

    // Delete modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [siteToDelete, setSiteToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Get all heritage sites with pagination and filters
    const {
        data: sitesData,
        loading: sitesLoading,
        error: sitesError,
        refetch: refetchSites
    } = useGet('/api/heritage-sites', {
        page: currentPage,
        size: pageSize,
        search: searchTerm,
        ownershipType: filters.ownershipType !== 'All Ownership Types' ? filters.ownershipType : undefined,
        category: filters.category !== 'All Categories' ? filters.category : undefined,
        year: filters.year || undefined,
        status: filters.status !== 'All Statuses' ? filters.status : undefined
    }, { enabled: true });

    // Get available filter options
    const {
        data: filterOptions,
        loading: optionsLoading
    } = useGet('/api/heritage-sites/filter-options', {}, { enabled: true });

    // Access control check
    if (!user || user.role !== 'SYSTEM_ADMINISTRATOR') {
        return (
            <Card className="p-6">
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Archive className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Access Denied
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Only System Administrators can access this interface
                    </p>
                </div>
            </Card>
        );
    }

    const sites = sitesData?.items || [];
    const totalSites = sitesData?.totalElements || 0;
    const totalPages = sitesData?.totalPages || 0;

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(0);
        refetchSites();
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(0);
    };

    const clearFilters = () => {
        setFilters({
            ownershipType: 'All Ownership Types',
            category: 'All Categories',
            year: '',
            status: 'All Statuses'
        });
        setSearchTerm('');
        setCurrentPage(0);
        refetchSites();
    };

    const handleSiteSelection = (siteId) => {
        setSelectedSites(prev =>
            prev.includes(siteId)
                ? prev.filter(id => id !== siteId)
                : [...prev, siteId]
        );
    };

    const handleBulkAction = (action) => {
        if (selectedSites.length === 0) return;

        // Implement bulk actions
        console.log(`Bulk ${action} for sites:`, selectedSites);

        // Clear selection after action
        setSelectedSites([]);
    };

    // Handle individual site actions
    const handleViewSite = (site) => {
        // Navigate to site details page
        window.location.href = `/dashboard/sites/${site.id}`;
    };

    const handleEditSite = (site) => {
        // Navigate to site editing page
        window.location.href = `/dashboard/sites/${site.id}/edit`;
    };

    const handleDeleteSite = async (site) => {
        setSiteToDelete(site);
        setShowDeleteModal(true);
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
                toast.success(`Site "${siteToDelete.nameEn || siteToDelete.name || `Site ${siteToDelete.id}`}" archived successfully`);
                refetchSites();
                setShowDeleteModal(false);
                setSiteToDelete(null);
            } else {
                const errorData = await response.json();
                toast.error(`Failed to archive site: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error archiving site:', error);
            toast.error('Failed to archive site. Please try again.');
        } finally {
            setDeleteLoading(false);
        }
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setSiteToDelete(null);
        setDeleteLoading(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'PROPOSED': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'UNDER_CONSERVATION': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'INACTIVE': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const getOwnershipColor = (ownership) => {
        switch (ownership) {
            case 'GOVERNMENT': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'PRIVATE': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'COMMUNITY': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'MIXED': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    if (sitesError) {
        return (
            <Card className="p-6">
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Error Loading Sites
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Unable to load heritage sites
                    </p>
                    <Button onClick={refetchSites} variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Again
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Heritage Sites Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        View and manage all heritage sites in the system
                    </p>
                </div>
                <div className="flex space-x-3">
                    <Button onClick={() => window.location.href = '/dashboard/sites/create'}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Site
                    </Button>
                    <Button variant="outline" onClick={() => window.location.href = '/dashboard/sites/archive'}>
                        <Archive className="w-4 h-4 mr-2" />
                        View Archived Sites
                    </Button>
                </div>
            </div>

            {/* Search and Filters */}
            <Card className="p-6">
                <form onSubmit={handleSearch} className="space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search sites by name or region..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex items-center justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center space-x-2"
                        >
                            <Filter className="w-4 h-4" />
                            <span>Filters</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </Button>

                        <Button type="submit" variant="outline">
                            <Search className="w-4 h-4 mr-2" />
                            Search
                        </Button>
                    </div>

                    {/* Filter Options */}
                    {showFilters && (
                        <div
                            className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Ownership Type
                                </label>
                                <select
                                    value={filters.ownershipType}
                                    onChange={(e) => handleFilterChange('ownershipType', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                                >
                                    <option>All Ownership Types</option>
                                    {filterOptions?.ownershipTypes?.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Category
                                </label>
                                <select
                                    value={filters.category}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                                >
                                    <option>All Categories</option>
                                    {filterOptions?.categories?.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Year
                                </label>
                                <input
                                    type="text"
                                    placeholder="Filter by year (e.g., 2020)"
                                    value={filters.year}
                                    onChange={(e) => handleFilterChange('year', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Status
                                </label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                                >
                                    <option>All Statuses</option>
                                    {filterOptions?.statuses?.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Clear Filters */}
                    {(searchTerm || Object.values(filters).some(v => v !== 'All Ownership Types' && v !== 'All Categories' && v !== 'All Statuses' && v !== '')) && (
                        <div className="flex justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={clearFilters}
                                className="flex items-center space-x-2"
                            >
                                <X className="w-4 h-4" />
                                <span>Clear Filters</span>
                            </Button>
                        </div>
                    )}
                </form>
            </Card>

            {/* Bulk Actions */}
            {selectedSites.length > 0 && (
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedSites.length} site(s) selected
                        </p>
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleBulkAction('archive')}
                            >
                                <Archive className="w-4 h-4 mr-2" />
                                Archive Selected
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleBulkAction('export')}
                            >
                                Export Selected
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Sites Table */}
            <Card className="p-6">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="text-left py-3 px-4">
                                    <input
                                        type="checkbox"
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedSites(sites.map(site => site.id));
                                            } else {
                                                setSelectedSites([]);
                                            }
                                        }}
                                        checked={selectedSites.length === sites.length && sites.length > 0}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </th>
                                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                                    SITE NAME
                                </th>
                                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                                    LOCATION
                                </th>
                                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                                    OWNERSHIP
                                </th>
                                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                                    YEAR
                                </th>
                                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                                    STATUS
                                </th>
                                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                                    ACTIONS
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sitesLoading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-8">
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : sites.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                                        <p>No heritage sites found</p>
                                        <p className="text-sm">Try adjusting your search or filters</p>
                                    </td>
                                </tr>
                            ) : (
                                sites.map((site) => (
                                    <tr key={site.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="py-3 px-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedSites.includes(site.id)}
                                                onChange={() => handleSiteSelection(site.id)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center space-x-2">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {site.nameEn || site.name || `Site ${site.id}`}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                            {site.region || 'Not specified'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOwnershipColor(site.ownershipType)}`}>
                                                {site.ownershipType || 'UNKNOWN'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                            {site.establishmentYear || 'Unknown'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(site.status)}`}>
                                                {site.status || 'UNKNOWN'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewSite(site)}
                                                    title="View site details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditSite(site)}
                                                    title="Edit site"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteSite(site)}
                                                    className="text-red-600 hover:text-red-700"
                                                    title="Delete site"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalSites)} of {totalSites} sites
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                disabled={currentPage === 0}
                            >
                                Previous
                            </Button>
                            <span className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                                Page {currentPage + 1} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                                disabled={currentPage === totalPages - 1}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Delete Site Modal */}
            <DeleteSiteModal
                isOpen={showDeleteModal}
                onClose={closeDeleteModal}
                onConfirm={confirmDeleteSite}
                site={siteToDelete}
                loading={deleteLoading}
            />
        </div>
    );
};

export default AdminSitesList;
