import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, Grid, List, Eye, Calendar, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { SearchFilter } from '../components/ui/SearchFilter';
import { Modal } from '../components/ui/Modal';
import { LazyImage } from '../components/ui/LazyImage';
import { useGet } from '../hooks/useSimpleApi';
import { useLanguage } from '../contexts/LanguageContext';

// Debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Heritage site categories in multiple languages
const SITE_CATEGORIES = {
  'cultural-sites': {
    en: 'Cultural Sites',
    rw: 'Ahantu by\'umuco',
    fr: 'Sites Culturels'
  },
  'historical': {
    en: 'Historical',
    rw: 'Amateka',
    fr: 'Historique'
  },
  'archaeological': {
    en: 'Archaeological',
    rw: 'Ubucukumbura',
    fr: 'Archéologique'
  },
  'natural': {
    en: 'Natural Heritage',
    rw: 'Kamere',
    fr: 'Patrimoine Naturel'
  },
  'monuments': {
    en: 'Monuments',
    rw: 'Urwibutso',
    fr: 'Monuments'
  }
};

const REGIONS = {
  'northern': { en: 'Northern Province', rw: 'Intara y\'Amajyaruguru', fr: 'Province du Nord' },
  'southern': { en: 'Southern Province', rw: 'Intara y\'Amajyepfo', fr: 'Province du Sud' },
  'eastern': { en: 'Eastern Province', rw: 'Intara y\'Iburasirazuba', fr: 'Province de l\'Est' },
  'western': { en: 'Western Province', rw: 'Intara y\'Iburengerazuba', fr: 'Province de l\'Ouest' },
  'kigali': { en: 'Kigali City', rw: 'Umujyi wa Kigali', fr: 'Ville de Kigali' }
};

const Sites = () => {
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [selectedSite, setSelectedSite] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [sort, setSort] = useState('nameEn,asc');

  // Fetch heritage sites using new simplified API system
  const {
    data: sitesData,
    loading,
    error,
    refetch
  } = useGet('/api/heritage-sites', {
    language: currentLanguage,
    page,
    size,
    sort,
    ...filters
  }, {
    enabled: true
  });

  // Handle page reset when filters change
  useEffect(() => {
    if (page > 0) {
      setPage(0);
    }
  }, [filters, currentLanguage]);

  // Filter options for the SearchFilter component
  const filterOptions = [
    {
      key: 'category',
      label: 'Category',
      options: Object.entries(SITE_CATEGORIES).map(([key, labels]) => ({
        value: key,
        label: labels[currentLanguage] || labels.en
      }))
    },
    {
      key: 'region',
      label: 'Region',
      options: Object.entries(REGIONS).map(([key, labels]) => ({
        value: key,
        label: labels[currentLanguage] || labels.en
      }))
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'under-conservation', label: 'Under Conservation' },
        { value: 'proposed', label: 'Proposed' }
      ]
    }
  ];

  // Debounced search and filter handlers to prevent excessive API calls
  const handleSearch = useCallback(
    debounce((term) => {
      setSearchTerm(term);
      setPage(0);
    }, 300),
    []
  );

  const handleFilter = useCallback(
    debounce((newFilters) => {
      setFilters(newFilters);
      setPage(0);
    }, 300),
    []
  );

  const openSiteModal = (site) => {
    setSelectedSite(site);
    setShowModal(true);
  };

  const navigateToSiteDetails = (siteId) => {
    navigate(`/dashboard/sites/${siteId}`);
  };

  // Handle different response formats from the API
  const sites = sitesData?.items || sitesData?.content || sitesData || [];
  const totalSites = sitesData?.totalElements || sitesData?.totalElements || sites.length;
  const totalPages = sitesData?.totalPages || sitesData?.totalPages || 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Header */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src="/heritage_logo.png"
                alt="HeritageGuard Logo"
                className="h-10 w-10"
                loading="eager"
              />
              <span className="text-xl font-bold text-primary-600">HeritageGuard</span>
            </Link>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 text-heritage-title mb-2">
                Heritage Sites
              </h1>
              <p className="text-gray-600">
                {totalSites > 0
                  ? `Discover ${totalSites} heritage sites across Rwanda`
                  : 'Explore Rwanda\'s rich cultural heritage'
                }
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2 bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
                aria-label="Grid view"
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
                aria-label="List view"
              >
                <List size={20} />
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <SearchFilter
            onSearch={handleSearch}
            onFilter={handleFilter}
            placeholder="Search heritage sites..."
            filters={filterOptions}
            className="mb-6"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading heritage sites...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600 mb-4">Failed to load heritage sites</p>
              <p className="text-red-500 text-sm mb-4">{error.message || 'An error occurred while fetching data'}</p>
              <Button onClick={refetch} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && (!sites || sites.length === 0) && (
          <div className="text-center py-12">
            <MapPin className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No heritage sites found</h3>
            <p className="text-gray-600">
              {sitesData ? 'No sites match your current filters' : 'No heritage sites are currently available'}
            </p>
            {sitesData && (
              <Button
                onClick={() => {
                  setFilters({});
                  setSearchTerm('');
                  refetch();
                }}
                variant="outline"
                className="mt-4"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Sites Grid/List */}
        {!loading && !error && (
          <>
            {sites.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sites found</h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria or filters
                </p>
              </div>
            ) : (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {sites.map((site) => (
                  <SiteCard
                    key={site.id}
                    site={site}
                    viewMode={viewMode}
                    onQuickView={() => openSiteModal(site)}
                    onViewDetails={() => navigateToSiteDetails(site.id)}
                    currentLanguage={currentLanguage}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <Button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>

                <span className="text-sm text-gray-600">
                  Page {page + 1} of {totalPages} ({totalSites} total sites)
                </span>

                <Button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages - 1}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Site Quick View Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedSite?.name || 'Site Details'}
        size="lg"
      >
        {selectedSite && (
          <SiteQuickView
            site={selectedSite}
            onViewDetails={() => {
              setShowModal(false);
              navigateToSiteDetails(selectedSite.id);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

// Site Card Component
const SiteCard = ({ site, viewMode, onQuickView, onViewDetails, currentLanguage }) => {
  const isGridView = viewMode === 'grid';

  if (isGridView) {
    return (
      <Card className="hover:shadow-lg transition-shadow duration-300 group">
        <div className="relative overflow-hidden rounded-t-lg">
          <LazyImage
            src={site.imageUrl || '/heritage_placeholder.jpg'}
            alt={site.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2">
            <button
              onClick={onQuickView}
              className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full shadow-md transition-all"
              aria-label="Quick view"
            >
              <Eye size={16} />
            </button>
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
            {site.name}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
            {site.description}
          </p>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center">
              <MapPin size={14} className="mr-1" />
              {site.location}
            </div>
            <div className="flex items-center">
              <Calendar size={14} className="mr-1" />
              {site.establishedYear || 'Ancient'}
            </div>
          </div>

          <Button
            onClick={onViewDetails}
            className="w-full"
            size="sm"
          >
            View Details
          </Button>
        </CardContent>
      </Card>
    );
  }

  // List view
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <LazyImage
            src={site.imageUrl || '/heritage_placeholder.jpg'}
            alt={site.name}
            className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
          />

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 mb-1">
              {site.name}
            </h3>
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
              {site.description}
            </p>

            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
              <div className="flex items-center">
                <MapPin size={14} className="mr-1" />
                {site.location}
              </div>
              <div className="flex items-center">
                <Calendar size={14} className="mr-1" />
                {site.establishedYear || 'Ancient'}
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <Button onClick={onQuickView} variant="outline" size="sm">
              <Eye size={14} className="mr-1" />
              Quick View
            </Button>
            <Button onClick={onViewDetails} size="sm">
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Site Quick View Component for Modal
const SiteQuickView = ({ site, onViewDetails }) => {
  return (
    <div className="space-y-4">
      <LazyImage
        src={site.imageUrl || '/heritage_placeholder.jpg'}
        alt={site.name}
        className="w-full h-48 object-cover rounded-lg"
      />

      <div>
        <p className="text-gray-600 mb-4">
          {site.description}
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Location:</span>
            <p className="text-gray-600">{site.location}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Established:</span>
            <p className="text-gray-600">{site.establishedYear || 'Ancient'}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Category:</span>
            <p className="text-gray-600">{site.category}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Status:</span>
            <p className="text-gray-600">{site.status}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button onClick={onViewDetails}>
          View Full Details
        </Button>
      </div>
    </div>
  );
};

export default Sites;