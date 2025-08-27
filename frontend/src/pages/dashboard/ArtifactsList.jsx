import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ComponentErrorBoundary from '../../components/error/ComponentErrorBoundary';
import {
  createColumn,
  MobileTableWithFilters,
  MobileButton,
  MobileCard,
  MobileCardHeader,
  MobileCardTitle,
  DeleteConfirmationModal
} from '../../components/ui';
import { useGet, useDelete, useDebounce } from '../../hooks';
import { Plus, Eye, Edit, Trash2, Package, MapPin, Tag, EyeOff, Search } from 'lucide-react';

import { toast } from 'react-hot-toast';

const ArtifactsList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [artifactToDelete, setArtifactToDelete] = useState(null);

  // Debounce search query to prevent excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const { data: artifacts, loading: artifactsLoading, error: artifactsError } = useGet('/api/artifacts', {}, {});

  const { data: searchResults, loading: searchLoading, error: searchError } = useGet('/api/artifacts/search', {
    searchTerm: debouncedSearchQuery,
    category: selectedCategory
  }, {
    enabled: !!(debouncedSearchQuery || selectedCategory)
  });

  const { data: statistics } = useGet('/api/artifacts/statistics', {}, {});

  const displayData = debouncedSearchQuery || selectedCategory ? searchResults : artifacts;
  const isLoading = artifactsLoading || searchLoading;
  const hasError = artifactsError || searchError;

  const columns = useMemo(() => [
    createColumn('name', 'Name', {
      render: (value) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-white">
            {value?.en || 'N/A'}
          </span>
          {value?.rw && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {value.rw}
            </span>
          )}
        </div>
      )
    }),
    createColumn('category', 'Category', {
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Tag className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{value || 'N/A'}</span>
        </div>
      )
    }),
    createColumn('heritageSite', 'Heritage Site', {
      render: (value) => (
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-sm">
            {value?.nameEn || value?.nameRw || value?.nameFr || 'N/A'}
          </span>
        </div>
      )
    }),
    createColumn('isPublic', 'Visibility', {
      render: (value) => (
        <div className="flex items-center space-x-2">
          {value ? <Eye className="w-4 h-4 text-gray-400" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
          <span className="text-sm">{value ? 'Public' : 'Private'}</span>
        </div>
      )
    }),
    createColumn('actions', 'Actions', {
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          <MobileButton
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/dashboard/artifacts/${row.id}`)}
            className="p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </MobileButton>
          {(user?.role === 'HERITAGE_MANAGER' || user?.role === 'SYSTEM_ADMINISTRATOR') && (
            <>
              <MobileButton
                size="sm"
                variant="ghost"
                onClick={() => navigate(`/dashboard/artifacts/${row.id}/edit`)}
                className="p-1 hover:bg-green-50 dark:hover:bg-green-900/20"
                title="Edit Artifact"
              >
                <Edit className="w-4 h-4" />
              </MobileButton>
              <MobileButton
                size="sm"
                variant="ghost"
                onClick={() => handleDeleteArtifact(row.id)}
                className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                title="Delete Artifact"
              >
                <Trash2 className="w-4 h-4" />
              </MobileButton>
            </>
          )}
          {user?.role === 'CONTENT_MANAGER' && (
            <div className="text-xs text-gray-400 dark:text-gray-500 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
              View Only
            </div>
          )}
        </div>
      )
    })
  ], [user?.role, navigate]);

  const filters = [
    { key: 'category', label: 'Category', active: !!selectedCategory },
    { key: 'heritageSite', label: 'Heritage Site', active: false }
  ];

  const handleFilterChange = (key, value) => {
    if (key === 'category') {
      setSelectedCategory(value);
    } else if (key === 'heritageSite') {
      // TODO: Implement heritage site filtering
      console.log('Heritage site filter:', value);
    }
  };

  const handleRowClick = (row) => {
    navigate(`/dashboard/artifacts/${row.id}`);
  };

  const deleteArtifact = useDelete('/api/artifacts', {
    onSuccess: () => {
      toast.success('Artifact deleted successfully');
      setShowDeleteModal(false);
      setArtifactToDelete(null);
      // Refresh the artifacts list
      window.location.reload();
    },
    onError: (error) => {
      toast.error('Failed to delete artifact. Please try again.');
      console.error('Delete error:', error);
    }
  });

  const handleDeleteArtifact = (artifactId) => {
    setArtifactToDelete(artifactId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (artifactToDelete) {
      await deleteArtifact.execute(artifactToDelete);
    }
  };

  const StatisticsCards = () => {
    const isSystemAdmin = user?.role === 'SYSTEM_ADMINISTRATOR';

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MobileCard size="sm" className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full mx-auto mb-3">
            <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <MobileCardTitle size="sm">
            {isSystemAdmin ? 'Total Artifacts' : 'Visible Artifacts'}
          </MobileCardTitle>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {statistics?.totalArtifacts || 0}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {isSystemAdmin ? 'All artifacts in system' : 'Artifacts you can access'}
          </p>
        </MobileCard>

        <MobileCard size="sm" className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full mx-auto mb-3">
            <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <MobileCardTitle size="sm">Public</MobileCardTitle>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {statistics?.publicArtifacts || 0}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Publicly accessible
          </p>
        </MobileCard>

        <MobileCard size="sm" className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto mb-3">
            <EyeOff className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <MobileCardTitle size="sm">Private</MobileCardTitle>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {isSystemAdmin ? (statistics?.privateArtifacts || 0) : '—'}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {isSystemAdmin ? 'Restricted access only' : 'Not visible to you'}
          </p>
        </MobileCard>
      </div>
    );
  };

  // Get user role for display
  const getUserRoleDisplay = () => {
    if (user?.role === 'SYSTEM_ADMINISTRATOR') {
      return 'System Administrator';
    } else if (user?.role === 'HERITAGE_MANAGER') {
      return 'Heritage Manager';
    } else if (user?.role === 'CONTENT_MANAGER') {
      return 'Content Manager';
    } else if (user?.role === 'COMMUNITY_MEMBER') {
      return 'Community Member';
    }
    return 'User';
  };

  // Get role-based title and description
  const getRoleBasedContent = () => {
    if (user?.role === 'SYSTEM_ADMINISTRATOR') {
      return {
        title: 'All Artifacts',
        subtitle: 'Complete overview of all cultural artifacts across all heritage sites',
        description: 'As a System Administrator, you have access to view and manage all artifacts in the system.'
      };
    } else if (user?.role === 'HERITAGE_MANAGER') {
      return {
        title: 'My Heritage Site Artifacts',
        subtitle: 'Artifacts from your assigned heritage sites',
        description: 'Manage artifacts within your assigned heritage sites. You can view, edit, and create new artifacts.'
      };
    } else {
      return {
        title: 'Public Artifacts',
        subtitle: 'Publicly accessible cultural artifacts',
        description: 'Browse through publicly available artifacts. Some artifacts may be restricted based on your access level.'
      };
    }
  };

  const roleContent = getRoleBasedContent();

  return (
    <ComponentErrorBoundary componentName="Artifacts List">
      {/* Role-based Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {roleContent.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {roleContent.subtitle}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {roleContent.description}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Logged in as: <span className="font-medium text-gray-700 dark:text-gray-300">{getUserRoleDisplay()}</span>
            </div>
            {(user?.role === 'SYSTEM_ADMINISTRATOR' || user?.role === 'HERITAGE_MANAGER') && (
              <MobileButton
                onClick={() => navigate('/dashboard/artifacts/create')}
                icon={Plus}
                className="mt-2"
              >
                Create Artifact
              </MobileButton>
            )}
          </div>
        </div>
      </div>

      {/* Role-based Access Banner */}
      {user?.role === 'HERITAGE_MANAGER' && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">ℹ</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Heritage Manager Access
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                You can view and manage artifacts from your assigned heritage sites.
                Contact a System Administrator if you need access to additional sites.
              </p>
            </div>
          </div>
        </div>
      )}

      {user?.role === 'CONTENT_MANAGER' && (
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">ℹ</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Content Manager Access
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                You have read-only access to artifacts. You can view artifact details but cannot create, edit, or delete them.
              </p>
            </div>
          </div>
        </div>
      )}

      {user?.role === 'COMMUNITY_MEMBER' && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">ℹ</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                Community Member Access
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                You can view publicly accessible artifacts and contribute to the community through comments and discussions.
              </p>
            </div>
          </div>
        </div>
      )}

      <StatisticsCards />

      {/* Search Error Display */}
      {hasError && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">⚠</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Search Error
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                There was an error while searching artifacts. Please try again or contact support if the problem persists.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search Results Info */}
      {(debouncedSearchQuery || selectedCategory) && !hasError && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Search Results
              </span>
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              {searchLoading ? 'Searching...' : `${displayData?.length || 0} artifacts found`}
            </div>
          </div>
          {(debouncedSearchQuery || selectedCategory) && (
            <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
              {debouncedSearchQuery && `Searching for: "${debouncedSearchQuery}"`}
              {debouncedSearchQuery && selectedCategory && ' and '}
              {selectedCategory && `Category: ${selectedCategory}`}
            </div>
          )}
        </div>
      )}

      <MobileTableWithFilters
        columns={columns}
        data={displayData || []}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFilterChange={handleFilterChange}
        onRowClick={handleRowClick}
        loading={isLoading}
        emptyMessage={
          debouncedSearchQuery || selectedCategory
            ? "No artifacts found matching your search criteria. Try adjusting your search terms or filters."
            : "No artifacts found. Create your first artifact to get started."
        }
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setArtifactToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Artifact"
        message="Are you sure you want to delete this artifact? This action cannot be undone."
        itemName={artifactToDelete ? `Artifact ID: ${artifactToDelete}` : 'Artifact'}
        confirmText="Delete Artifact"
        isDeleting={deleteArtifact.loading}
      />
    </ComponentErrorBoundary>
  );
};

export default ArtifactsList;

