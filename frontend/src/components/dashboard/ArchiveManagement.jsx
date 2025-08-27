import React, { useState } from 'react';
import { Archive, RefreshCw, Eye, RotateCcw, Search, Filter, X, ChevronDown } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useGet } from '../../hooks/useSimpleApi';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const ArchiveManagement = () => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        archiveReason: 'All Reasons',
        previousManager: 'All Managers'
    });
    const [showFilters, setShowFilters] = useState(false);
    const [restoreLoading, setRestoreLoading] = useState({});

    // Get archived sites
    const {
        data: archivedSitesData,
        loading: archivedSitesLoading,
        error: archivedSitesError,
        refetch: refetchArchivedSites
    } = useGet('/api/heritage-sites/archived', {}, { enabled: true });

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
                        Only System Administrators can access archived sites
                    </p>
                </div>
            </Card>
        );
    }

    const archivedSites = archivedSitesData || [];

    // Archive reason options for filtering
    const archiveReasons = [
        'Temporary Closure',
        'Under Review',
        'Legal Compliance',
        'Manager Reassignment',
        'Strategic Decision',
        'Quality Control',
        'Other'
    ];

    // Filter sites based on search and filters
    const filteredSites = archivedSites.filter(site => {
        const matchesSearch = !searchTerm ||
            (site.nameEn && site.nameEn.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (site.region && site.region.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesReason = filters.archiveReason === 'All Reasons' ||
            site.archiveReason === filters.archiveReason;

        const matchesManager = filters.previousManager === 'All Managers' ||
            site.previousManagerId?.toString() === filters.previousManager;

        return matchesSearch && matchesReason && matchesManager;
    });

    const handleRestoreSite = async (siteId) => {
        setRestoreLoading(prev => ({ ...prev, [siteId]: true }));

        try {
            const response = await fetch(`/api/heritage-sites/${siteId}/restore`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                toast.success('Site restored successfully!');
                refetchArchivedSites();
            } else {
                const errorData = await response.json();
                toast.error(`Failed to restore site: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error restoring site:', error);
            toast.error('Failed to restore site. Please try again.');
        } finally {
            setRestoreLoading(prev => ({ ...prev, [siteId]: false }));
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // Search is handled by the filter function
    };

    const clearFilters = () => {
        setFilters({
            archiveReason: 'All Reasons',
            previousManager: 'All Managers'
        });
        setSearchTerm('');
    };

    const getArchiveReasonColor = (reason) => {
        const colors = {
            'Temporary Closure': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            'Under Review': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            'Legal Compliance': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            'Manager Reassignment': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            'Strategic Decision': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
            'Quality Control': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
            'Other': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        };
        return colors[reason] || colors['Other'];
    };

    if (archivedSitesError) {
        return (
            <Card className="p-6">
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Archive className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Error Loading Archived Sites
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Unable to load archived heritage sites
                    </p>
                    <Button onClick={refetchArchivedSites} variant="outline">
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
                        Archive Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        View and manage archived heritage sites
                    </p>
                </div>
                <div className="flex space-x-3">
                    <Button onClick={refetchArchivedSites} variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
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
                            placeholder="Search archived sites by name or region..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex items-center space-x-4">
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

                        {showFilters && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={clearFilters}
                                className="flex items-center space-x-2"
                            >
                                <X className="w-4 h-4" />
                                <span>Clear</span>
                            </Button>
                        )}
                    </div>

                    {/* Filter Options */}
                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Archive Reason
                                </label>
                                <select
                                    value={filters.archiveReason}
                                    onChange={(e) => setFilters(prev => ({ ...prev, archiveReason: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                >
                                    <option value="All Reasons">All Reasons</option>
                                    {archiveReasons.map(reason => (
                                        <option key={reason} value={reason}>{reason}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Previous Manager
                                </label>
                                <select
                                    value={filters.previousManager}
                                    onChange={(e) => setFilters(prev => ({ ...prev, previousManager: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                >
                                    <option value="All Managers">All Managers</option>
                                    {archivedSites
                                        .filter(site => site.previousManagerId)
                                        .map(site => site.previousManagerId)
                                        .filter((id, index, arr) => arr.indexOf(id) === index)
                                        .map(id => (
                                            <option key={id} value={id.toString()}>Manager ID: {id}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>
                    )}
                </form>
            </Card>

            {/* Archived Sites List */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Archived Sites ({filteredSites.length})
                    </h2>
                    {archivedSitesLoading && (
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Loading...</span>
                        </div>
                    )}
                </div>

                {filteredSites.length === 0 ? (
                    <div className="text-center py-12">
                        <Archive className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No archived sites found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            {archivedSites.length === 0
                                ? 'There are no archived sites in the system.'
                                : 'Try adjusting your search or filters.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                                        SITE NAME
                                    </th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                                        LOCATION
                                    </th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                                        ARCHIVE REASON
                                    </th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                                        ARCHIVED DATE
                                    </th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                                        PREVIOUS MANAGER
                                    </th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                                        ACTIONS
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSites.map((site) => (
                                    <tr key={site.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center space-x-2">
                                                <Archive className="w-4 h-4 text-gray-400" />
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {site.nameEn || site.name || `Site ${site.id}`}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                            {site.region || 'Not specified'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getArchiveReasonColor(site.archiveReason)}`}>
                                                {site.archiveReason || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                            {site.archiveDate ? new Date(site.archiveDate).toLocaleDateString() : 'Unknown'}
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                            {site.previousManagerId ? `ID: ${site.previousManagerId}` : 'None'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => window.location.href = `/dashboard/sites/${site.id}`}
                                                    title="View site details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleRestoreSite(site.id)}
                                                    disabled={restoreLoading[site.id]}
                                                    title="Restore site"
                                                    className="text-green-600 hover:text-green-700"
                                                >
                                                    {restoreLoading[site.id] ? (
                                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <RotateCcw className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default ArchiveManagement;

