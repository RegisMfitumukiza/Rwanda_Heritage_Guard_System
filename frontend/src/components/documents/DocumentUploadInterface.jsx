import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    File,
    FileText,
    X,
    Check,
    AlertTriangle,
    Loader2,
    Plus,
    Download,
    Eye,
    Edit,
    Trash2,
    Clock,
    User,
    FolderOpen,
    FolderPlus,
    Search,
    Filter
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { toast } from 'react-hot-toast';
import documentsApi from '../../services/api/documentsApi';
import foldersApi from '../../services/api/foldersApi';
import FolderTreeView from '../folders/FolderTreeView';
import FolderEditModal from '../folders/FolderEditModal';
import FolderBreadcrumb from '../folders/FolderBreadcrumb';
import DocumentGridView from './DocumentGridView';
import DocumentPreview from './DocumentPreview';

const DocumentUploadInterface = ({
    siteId,
    onDocumentAdded,
    onDocumentDeleted,
    onError,
    className = '',
    ...props
}) => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const fileInputRef = useRef(null);

    // State management
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragOver, setDragOver] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showUploadModal, setShowUploadModal] = useState(false);

    // Folder management state
    const [folders, setFolders] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [folderBreadcrumb, setFolderBreadcrumb] = useState([]);
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [editingFolder, setEditingFolder] = useState(null);
    const [parentFolder, setParentFolder] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list'
    const [thumbnailSize, setThumbnailSize] = useState('medium'); // 'small', 'medium', 'large'
    const [previewDocument, setPreviewDocument] = useState(null);
    const [showDocumentPreview, setShowDocumentPreview] = useState(false);

    // Upload form state
    const [uploadMetadata, setUploadMetadata] = useState({
        description: '',
        category: 'OTHER',
        isPublic: true
    });

    // File type icons
    const getFileIcon = (fileType) => {
        if (fileType?.includes('pdf')) return FileText;
        if (fileType?.includes('word') || fileType?.includes('doc')) return FileText;
        if (fileType?.includes('text')) return File;
        return File;
    };

    // Load documents and folders
    const loadDocuments = useCallback(async () => {
        if (!siteId) return;

        try {
            setLoading(true);
            const [siteDocs, folderTree] = await Promise.all([
                documentsApi.getDocumentsBySite(siteId, { page: 0, size: 50, sort: 'fileName,asc' }),
                foldersApi.getFolderTree(siteId)
            ]);
            const docItems = siteDocs?.data?.items || siteDocs?.items || siteDocs || [];
            setDocuments(docItems);
            setFolders(folderTree);
        } catch (error) {
            console.error('Failed to load documents:', error);
            const errorMessage = 'Failed to load documents. Please try again.';
            toast.error(errorMessage);
            if (onError) {
                onError(error);
            }
        } finally {
            setLoading(false);
        }
    }, [siteId, onError]);

    // Load documents on mount
    React.useEffect(() => {
        loadDocuments();
    }, [loadDocuments]);

    // Handle file selection
    const handleFileSelect = (files) => {
        const fileArray = Array.from(files);
        const validFiles = [];
        const errors = [];

        fileArray.forEach(file => {
            const validation = documentsApi.validateFile(file);
            if (validation.valid) {
                validFiles.push(file);
            } else {
                errors.push(`${file.name}: ${validation.errors.join(', ')}`);
            }
        });

        if (errors.length > 0) {
            toast.error(`Some files were rejected:\n${errors.join('\n')}`);
        }

        if (validFiles.length > 0) {
            setSelectedFiles(validFiles);
            setShowUploadModal(true);
        }
    };

    // Handle drag and drop
    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFileSelect(e.dataTransfer.files);
    };

    // Handle file input change
    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileSelect(e.target.files);
        }
    };

    // Upload files
    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        try {
            setUploading(true);
            const uploadPromises = selectedFiles.map(async (file, index) => {
                try {
                    const result = await documentsApi.uploadDocument(
                        siteId,
                        file,
                        uploadMetadata,
                        (progress) => {
                            setUploadProgress((prev) => {
                                const newProgress = { ...prev };
                                // Extract the progress percentage from the progress object
                                const progressPercent = typeof progress === 'object' && progress.progress !== undefined
                                    ? progress.progress
                                    : (typeof progress === 'number' ? progress : 0);
                                newProgress[index] = progressPercent;
                                return newProgress;
                            });
                        }
                    );
                    return { success: true, result, file };
                } catch (error) {
                    return { success: false, error: error.message, file };
                }
            });

            const results = await Promise.all(uploadPromises);
            const successful = results.filter(r => r.success);
            const failed = results.filter(r => !r.success);

            if (successful.length > 0) {
                toast.success(`Successfully uploaded ${successful.length} document(s)`);

                // Add new documents to the list
                const newDocuments = successful.map(r => r.result);
                setDocuments(prev => [...newDocuments, ...prev]);

                // Notify parent
                newDocuments.forEach(doc => {
                    if (onDocumentAdded) onDocumentAdded(doc);
                });
            }

            if (failed.length > 0) {
                const errorMessage = failed.map(f => `${f.file.name}: ${f.error}`).join('\n');
                toast.error(`Failed to upload ${failed.length} document(s):\n${errorMessage}`);
            }

            // Reset form
            setSelectedFiles([]);
            setUploadMetadata({ description: '', category: 'OTHER', isPublic: true });
            setShowUploadModal(false);
            setUploadProgress({});

        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Upload failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    // Delete document
    const handleDelete = async (documentId) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;

        try {
            await documentsApi.deleteDocument(documentId);
            setDocuments(prev => prev.filter(doc => doc.id !== documentId));
            toast.success('Document deleted successfully');

            if (onDocumentDeleted) onDocumentDeleted(documentId);
        } catch (error) {
            console.error('Failed to delete document:', error);
            toast.error('Failed to delete document');
        }
    };

    // Download document
    const handleDownload = async (document) => {
        try {
            const blob = await documentsApi.downloadDocument(document.id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = document.fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Download started');
        } catch (error) {
            console.error('Download failed:', error);
            toast.error('Failed to download document');
        }
    };

    // Filter documents
    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = !searchQuery ||
            doc.fileName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    // Format file size
    const formatFileSize = (bytes) => {
        return documentsApi.formatFileSize(bytes);
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    // Folder management handlers
    const handleFolderSelect = (folder) => {
        setSelectedFolder(folder);
        if (folder) {
            const breadcrumb = foldersApi.getFolderBreadcrumb(folder.id, folders);
            setFolderBreadcrumb(breadcrumb);
        } else {
            setFolderBreadcrumb([]);
        }
    };

    const handleCreateFolder = (parentFolder = null) => {
        setEditingFolder(null);
        setParentFolder(parentFolder);
        setShowFolderModal(true);
    };

    const handleEditFolder = (folder) => {
        setEditingFolder(folder);
        setParentFolder(null);
        setShowFolderModal(true);
    };

    const handleDeleteFolder = async (folder) => {
        if (!window.confirm(`Are you sure you want to delete the folder "${folder.name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await foldersApi.deleteFolder(folder.id, true); // recursive delete
            toast.success('Folder deleted successfully');
            loadDocuments(); // Reload to refresh folder tree
        } catch (error) {
            console.error('Failed to delete folder:', error);
            toast.error('Failed to delete folder');
        }
    };

    const handleMoveFolder = async (folderId, newParentId) => {
        try {
            await foldersApi.moveFolder(folderId, newParentId);
            toast.success('Folder moved successfully');
            loadDocuments(); // Reload to refresh folder tree
        } catch (error) {
            console.error('Failed to move folder:', error);
            toast.error('Failed to move folder');
        }
    };

    const handleFolderSave = (savedFolder) => {
        loadDocuments(); // Reload to refresh folder tree
    };

    const handleBreadcrumbNavigate = (folderId) => {
        if (folderId === null) {
            // Navigate to root
            setSelectedFolder(null);
            setFolderBreadcrumb([]);
        } else {
            // Find folder in tree and navigate to it
            const findFolder = (folderList) => {
                for (const folder of folderList) {
                    if (folder.id === folderId) {
                        return folder;
                    }
                    if (folder.children) {
                        const found = findFolder(folder.children);
                        if (found) return found;
                    }
                }
                return null;
            };

            const folder = findFolder(folders);
            if (folder) {
                handleFolderSelect(folder);
            }
        }
    };

    // Document interaction handlers
    const handleDocumentPreview = (document) => {
        setPreviewDocument(document);
        setShowDocumentPreview(true);
    };

    const handleDocumentClick = (document) => {
        handleDocumentPreview(document);
    };

    const handleDocumentEdit = (document, updatedMetadata = null) => {
        if (updatedMetadata) {
            // Handle metadata update - refresh document list
            loadDocuments();
        } else {
            // This will be handled by DocumentGridView
            return;
        }
    };

    const handleDocumentShare = (document) => {
        if (navigator.share && document) {
            navigator.share({
                title: document.fileName,
                text: `Check out this heritage document: ${document.fileName}`,
                url: window.location.href
            }).catch(console.error);
        } else {
            // Fallback: copy link to clipboard
            navigator.clipboard.writeText(window.location.href);
            toast.success('Document link copied to clipboard');
        }
    };

    // View mode and sorting handlers
    const handleViewModeChange = (newViewMode, sortBy, sortOrder) => {
        if (newViewMode) setViewMode(newViewMode);
        // Handle sorting changes if needed
    };

    const supportedTypes = documentsApi.getSupportedFileTypes();
    const categories = documentsApi.getDocumentCategories();

    return (
        <div className={`space-y-6 ${className}`} {...props}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Document Management
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Upload and manage heritage site documents with folder organization
                    </p>
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center space-x-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Upload Documents</span>
                    </Button>
                </div>
            </div>



            {/* Search and Filter */}
            <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search documents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                </div>

                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                    <option value="all">All Categories</option>
                    {Object.entries(categories).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                    ))}
                </select>
            </div>

            {/* Main Content Area */}
            <div className="w-full">
                {/* Documents List - Only show when documents exist */}
                <div className="w-full">
                    {documents.length > 0 ? (
                        <DocumentGridView
                            documents={filteredDocuments}
                            loading={loading}
                            viewMode={viewMode}
                            thumbnailSize={thumbnailSize}
                            onDocumentClick={handleDocumentClick}
                            onDocumentPreview={handleDocumentPreview}
                            onDocumentDownload={handleDownload}
                            onDocumentEdit={handleDocumentEdit}
                            onDocumentDelete={handleDelete}
                            onDocumentShare={handleDocumentShare}
                            searchQuery={searchQuery}
                            categoryFilter={categoryFilter}
                            sortBy="name"
                            sortOrder="asc"
                            onSortChange={handleViewModeChange}
                        />
                    ) : (
                        /* Empty State - Show when no documents */
                        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                            <div className="text-gray-400 dark:text-gray-500 mb-4">
                                <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No documents found</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">
                                Upload your first document to get started.
                            </p>
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center space-x-2"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Upload Documents</span>
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={Object.keys(supportedTypes).join(',')}
                onChange={handleFileInputChange}
                className="hidden"
            />

            {/* Upload Modal */}
            <AnimatePresence>
                {showUploadModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={() => !uploading && setShowUploadModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Upload Documents
                                    </h3>
                                    {!uploading && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowUploadModal(false)}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>

                                {/* Selected Files */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Selected Files ({selectedFiles.length})
                                    </label>
                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                        {selectedFiles.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                                <div className="flex items-center space-x-2">
                                                    <File className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-900 dark:text-white truncate">
                                                        {file.name}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {formatFileSize(file.size)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Metadata Form */}
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            value={uploadMetadata.description}
                                            onChange={(e) => setUploadMetadata(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Describe these documents..."
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Category
                                        </label>
                                        <select
                                            value={uploadMetadata.category}
                                            onChange={(e) => setUploadMetadata(prev => ({ ...prev, category: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        >
                                            {Object.entries(categories).map(([key, value]) => (
                                                <option key={key} value={key}>{value}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="isPublic"
                                            checked={uploadMetadata.isPublic}
                                            onChange={(e) => setUploadMetadata(prev => ({ ...prev, isPublic: e.target.checked }))}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <label htmlFor="isPublic" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                            Make documents publicly visible
                                        </label>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end space-x-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowUploadModal(false)}
                                        disabled={uploading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleUpload}
                                        disabled={uploading || selectedFiles.length === 0}
                                        className="flex items-center space-x-2"
                                    >
                                        {uploading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Upload className="w-4 h-4" />
                                        )}
                                        <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                                    </Button>
                                </div>

                                {/* Upload Progress */}
                                {uploading && uploadProgress && typeof uploadProgress === 'object' && Object.keys(uploadProgress).length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        {selectedFiles.map((file, index) => (
                                            <div key={index} className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400 truncate">
                                                        {file.name}
                                                    </span>
                                                    <span className="text-gray-500">
                                                        {typeof uploadProgress[index] === 'number' ? uploadProgress[index] : 0}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                                                    <div
                                                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                                        style={{ width: `${typeof uploadProgress[index] === 'number' ? uploadProgress[index] : 0}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Folder Edit Modal */}
            <FolderEditModal
                isOpen={showFolderModal}
                onClose={() => {
                    setShowFolderModal(false);
                    setEditingFolder(null);
                    setParentFolder(null);
                }}
                folder={editingFolder}
                parentFolder={parentFolder}
                siteId={siteId}
                onSave={handleFolderSave}
            />

            {/* Document Preview Modal */}
            <DocumentPreview
                document={previewDocument}
                isOpen={showDocumentPreview}
                onClose={() => {
                    setShowDocumentPreview(false);
                    setPreviewDocument(null);
                }}
                onDownload={handleDownload}
                onEdit={handleDocumentEdit}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default DocumentUploadInterface;
