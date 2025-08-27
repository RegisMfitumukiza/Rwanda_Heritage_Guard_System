import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ComponentErrorBoundary from '../../components/error/ComponentErrorBoundary';
import {
    MobileCard,
    MobileCardHeader,
    MobileCardTitle,
    MobileCardContent,
    MobileButton,
    MobileBadge,
    MobileTabs,
    MobileTabContent,
    MobileTabList,
    MobileTabTrigger,
    DeleteConfirmationModal,
    MediaUpload,
    MediaGallery,
    AuthenticationForm,
    ProvenanceForm
} from '../../components/ui';

import { useGet, useDelete } from '../../hooks/useSimpleApi';
import { ArrowLeft, Edit, Trash2, Package, Image, Shield, History, Tag, MapPin, Eye, EyeOff, Upload, File } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ArtifactDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showMediaUpload, setShowMediaUpload] = useState(false);
    const [showAuthenticationForm, setShowAuthenticationForm] = useState(false);
    const [showProvenanceForm, setShowProvenanceForm] = useState(false);

    const { data: artifact, loading: isLoading, error } = useGet(`/api/artifacts/${parseInt(id)}`, {}, {
        onSuccess: (data) => console.log('Artifact loaded:', data),
        onError: (error) => console.error('Failed to load artifact:', error)
    });

    const { data: media, refetch: mediaRefetch } = useGet(`/api/artifacts/${parseInt(id)}/media`, {}, {
        onSuccess: (data) => console.log('Artifact media loaded:', data),
        onError: (error) => console.error('Failed to load artifact media:', error)
    });

    const { data: authentications, refetch: authenticationsRefetch } = useGet(`/api/artifacts/${parseInt(id)}/authentications`, {}, {
        onSuccess: (data) => console.log('Artifact authentications loaded:', data),
        onError: (error) => console.error('Failed to load artifact authentications:', error)
    });

    const { data: provenanceRecords, refetch: provenanceRefetch } = useGet(`/api/artifacts/${parseInt(id)}/provenance`, {}, {
        onSuccess: (data) => console.log('Artifact provenance loaded:', data),
        onError: (error) => console.error('Failed to load artifact provenance:', error)
    });

    const deleteArtifact = useDelete(`/api/artifacts/${parseInt(id)}`, {
        onSuccess: () => {
            toast.success('Artifact deleted successfully');
            navigate('/dashboard/artifacts');
        },
        onError: (error) => {
            toast.error('Failed to delete artifact. Please try again.');
            console.error('Delete error:', error);
        }
    });

    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        setShowDeleteModal(false);
        await deleteArtifact.execute();
    };

    const handleMediaUpload = (uploadedMedia) => {
        console.log('Media uploaded:', uploadedMedia);
        // Refresh media data
        if (mediaRefetch) {
            mediaRefetch();
        }
        setShowMediaUpload(false);
    };

    const handleMediaDelete = async (mediaId) => {
        try {
            const response = await fetch(`/api/artifacts/${parseInt(id)}/media/${mediaId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                toast.success('Media file deleted successfully');
                // Refresh media data
                if (mediaRefetch) {
                    mediaRefetch();
                }
            } else {
                throw new Error('Failed to delete media file');
            }
        } catch (error) {
            console.error('Delete media error:', error);
            toast.error('Failed to delete media file');
        }
    };

    const handleAuthenticationSave = () => {
        setShowAuthenticationForm(false);
        // Refresh authentication data
        if (authenticationsRefetch) {
            authenticationsRefetch();
        }
    };

    const handleProvenanceSave = () => {
        setShowProvenanceForm(false);
        // Refresh provenance data
        if (provenanceRefetch) {
            provenanceRefetch();
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !artifact) {
        return (
            <MobileCard>
                <MobileCardContent>
                    <p className="text-red-600">Failed to load artifact details. Please try again.</p>
                </MobileCardContent>
            </MobileCard>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Package },
        { id: 'media', label: 'Media', icon: Image, count: media?.length || 0 },
        { id: 'authentication', label: 'Authentication', icon: Shield, count: authentications?.length || 0 },
        { id: 'provenance', label: 'Provenance', icon: History, count: provenanceRecords?.length || 0 }
    ];

    return (
        <ComponentErrorBoundary componentName="Artifact Details">
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {artifact.name?.en || 'Artifact Details'}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Comprehensive information about this cultural artifact
                        </p>
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-medium">Your Role:</span> {user?.role === 'SYSTEM_ADMINISTRATOR' ? 'System Administrator' :
                                user?.role === 'HERITAGE_MANAGER' ? 'Heritage Manager' :
                                    user?.role === 'CONTENT_MANAGER' ? 'Content Manager' :
                                        user?.role === 'COMMUNITY_MEMBER' ? 'Community Member' : 'User'}
                            {artifact.heritageSite && (
                                <span className="ml-4">
                                    • <span className="font-medium">Site:</span> {artifact.heritageSite.nameEn || artifact.heritageSite.nameRw || artifact.heritageSite.nameFr}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <MobileButton
                            variant="outline"
                            onClick={() => navigate('/dashboard/artifacts')}
                            icon={ArrowLeft}
                        >
                            Back to Artifacts
                        </MobileButton>
                        {(user?.role === 'HERITAGE_MANAGER' || user?.role === 'SYSTEM_ADMINISTRATOR') && (
                            <>
                                <MobileButton
                                    onClick={() => navigate(`/dashboard/artifacts/${id}/edit`)}
                                    icon={Edit}
                                >
                                    Edit
                                </MobileButton>
                                <MobileButton
                                    variant="outline"
                                    onClick={handleDelete}
                                    icon={Trash2}
                                    className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                                >
                                    Delete
                                </MobileButton>
                            </>
                        )}
                    </div>
                </div>

                <MobileTabs value={activeTab} onValueChange={setActiveTab}>
                    <MobileTabList>
                        {tabs.map(tab => (
                            <MobileTabTrigger key={tab.id} value={tab.id}>
                                <tab.icon className="w-4 h-4 mr-2" />
                                {tab.label}
                                {tab.count > 0 && (
                                    <MobileBadge variant="secondary" className="ml-2">
                                        {tab.count}
                                    </MobileBadge>
                                )}
                            </MobileTabTrigger>
                        ))}
                    </MobileTabList>

                    <MobileTabContent value="overview" className="space-y-6">
                        <MobileCard>
                            <MobileCardHeader>
                                <MobileCardTitle icon={Package}>Basic Information</MobileCardTitle>
                            </MobileCardHeader>
                            <MobileCardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name (English)</label>
                                        <p className="text-gray-900 dark:text-white">{artifact.name?.en || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                                        <div className="flex items-center space-x-2">
                                            <Tag className="w-4 h-4 text-gray-400" />
                                            <p className="text-gray-900 dark:text-white">{artifact.category || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Heritage Site</label>
                                        <div className="flex items-center space-x-2">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <p className="text-gray-900 dark:text-white">
                                                {artifact.heritageSite?.nameEn || artifact.heritageSite?.nameRw || artifact.heritageSite?.nameFr || 'N/A'}
                                            </p>
                                        </div>
                                        {artifact.heritageSite && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                {artifact.heritageSite.region} • {artifact.heritageSite.address}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Visibility</label>
                                        <div className="flex items-center space-x-2">
                                            {artifact.isPublic ? <Eye className="w-4 h-4 text-gray-400" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                                            <p className="text-gray-900 dark:text-white">{artifact.isPublic ? 'Public' : 'Private'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                    <p className="text-gray-900 dark:text-white">{artifact.description?.en || 'N/A'}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Heritage Site Details</label>
                                    <div className="space-y-2">
                                        {artifact.heritageSite ? (
                                            <>
                                                <div className="flex items-center space-x-2">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    <p className="text-gray-900 dark:text-white">
                                                        {artifact.heritageSite.nameEn || artifact.heritageSite.nameRw || artifact.heritageSite.nameFr || 'N/A'}
                                                    </p>
                                                </div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {artifact.heritageSite.region} • {artifact.heritageSite.address}
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-gray-500 dark:text-gray-400">No heritage site information available</p>
                                        )}
                                    </div>
                                </div>
                            </MobileCardContent>
                        </MobileCard>
                    </MobileTabContent>

                    <MobileTabContent value="media" className="space-y-6">
                        <MobileCard>
                            <MobileCardHeader>
                                <MobileCardTitle icon={Image}>Media Files</MobileCardTitle>
                                {(user?.role === 'SYSTEM_ADMINISTRATOR' || user?.role === 'HERITAGE_MANAGER') && (
                                    <MobileButton
                                        onClick={() => setShowMediaUpload(true)}
                                        icon={Upload}
                                        size="sm"
                                    >
                                        Add Media
                                    </MobileButton>
                                )}
                            </MobileCardHeader>
                            <MobileCardContent>
                                {showMediaUpload ? (
                                    <MediaUpload
                                        artifactId={parseInt(id)}
                                        onUpload={handleMediaUpload}
                                        onCancel={() => setShowMediaUpload(false)}
                                    />
                                ) : (
                                    <>
                                        <MediaGallery
                                            media={media}
                                            artifactId={parseInt(id)}
                                            onDelete={handleMediaDelete}
                                            canDelete={user?.role === 'SYSTEM_ADMINISTRATOR' || user?.role === 'HERITAGE_MANAGER'}
                                        />
                                    </>
                                )}
                            </MobileCardContent>
                        </MobileCard>
                    </MobileTabContent>

                    <MobileTabContent value="authentication" className="space-y-6">
                        <MobileCard>
                            <MobileCardHeader>
                                <MobileCardTitle icon={Shield}>Authentication Records</MobileCardTitle>
                                {(user?.role === 'SYSTEM_ADMINISTRATOR' || user?.role === 'HERITAGE_MANAGER') && (
                                    <MobileButton
                                        onClick={() => setShowAuthenticationForm(true)}
                                        icon={Shield}
                                        size="sm"
                                    >
                                        Add Record
                                    </MobileButton>
                                )}
                            </MobileCardHeader>
                            <MobileCardContent>
                                {showAuthenticationForm ? (
                                    <AuthenticationForm
                                        artifactId={parseInt(id)}
                                        onSave={handleAuthenticationSave}
                                        onCancel={() => setShowAuthenticationForm(false)}
                                    />
                                ) : (
                                    <>
                                        {authentications && authentications.length > 0 ? (
                                            <div className="space-y-4">
                                                {authentications.map((auth) => (
                                                    <div key={auth.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <MobileBadge variant="secondary">{auth.status}</MobileBadge>
                                                            <span className="text-sm text-gray-500">{auth.date}</span>
                                                        </div>
                                                        <p className="text-gray-700 dark:text-gray-300">{auth.documentation}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <Shield className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                                <p>No authentication records found for this artifact.</p>
                                                {(user?.role === 'SYSTEM_ADMINISTRATOR' || user?.role === 'HERITAGE_MANAGER') && (
                                                    <MobileButton
                                                        onClick={() => setShowAuthenticationForm(true)}
                                                        size="sm"
                                                        icon={Shield}
                                                    >
                                                        Add First Authentication Record
                                                    </MobileButton>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </MobileCardContent>
                        </MobileCard>
                    </MobileTabContent>

                    <MobileTabContent value="provenance" className="space-y-6">
                        <MobileCard>
                            <MobileCardHeader>
                                <MobileCardTitle icon={History}>Provenance History</MobileCardTitle>
                                {(user?.role === 'SYSTEM_ADMINISTRATOR' || user?.role === 'HERITAGE_MANAGER') && (
                                    <MobileButton
                                        onClick={() => setShowProvenanceForm(true)}
                                        icon={History}
                                        size="sm"
                                    >
                                        Add Record
                                    </MobileButton>
                                )}
                            </MobileCardHeader>
                            <MobileCardContent>
                                {showProvenanceForm ? (
                                    <ProvenanceForm
                                        artifactId={parseInt(id)}
                                        onSave={handleProvenanceSave}
                                        onCancel={() => setShowProvenanceForm(false)}
                                    />
                                ) : (
                                    <>
                                        {provenanceRecords && provenanceRecords.length > 0 ? (
                                            <div className="space-y-4">
                                                {provenanceRecords.map((record) => (
                                                    <div key={record.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                {record.previousOwner} → {record.newOwner}
                                                            </span>
                                                            <span className="text-sm text-gray-500">{record.eventDate}</span>
                                                        </div>
                                                        <p className="text-gray-700 dark:text-gray-300">{record.history}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <History className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                                <p>No provenance records found for this artifact.</p>
                                                {(user?.role === 'SYSTEM_ADMINISTRATOR' || user?.role === 'HERITAGE_MANAGER') && (
                                                    <button
                                                        onClick={() => setShowProvenanceForm(true)}
                                                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                                    >
                                                        Add First Provenance Record
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </MobileCardContent>
                        </MobileCard>
                    </MobileTabContent>
                </MobileTabs>
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Artifact"
                message="Are you sure you want to delete this artifact? This action cannot be undone."
                itemName={artifact?.name?.en || 'Artifact'}
                confirmText="Delete Artifact"
                isDeleting={deleteArtifact.loading}
            />
        </ComponentErrorBoundary>
    );
};

export default ArtifactDetails;

