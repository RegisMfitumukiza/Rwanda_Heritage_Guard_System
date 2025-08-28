import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Grid,
    List,
    SortAsc,
    SortDesc,
    Eye,
    Download,
    Edit,
    Trash2,
    Share2,
    FolderOpen
} from 'lucide-react';
import { Button } from '../ui/Button';
import { toast } from 'react-hot-toast';
import DocumentThumbnail from './DocumentThumbnail';

/**
 * Simplified DocumentGridView Component
 * 
 * Clean document grid view with essential functionality only
 */

const DocumentGridView = ({
    documents = [],
    loading = false,
    viewMode = 'grid',
    thumbnailSize = 'medium',
    onDocumentClick,
    onDocumentPreview,
    onDocumentDownload,
    onDocumentEdit,
    onDocumentDelete,
    onDocumentShare,
    searchQuery = '',
    categoryFilter = 'all',
    sortBy = 'name',
    sortOrder = 'asc',
    onSortChange,
    selectedFolder = null,
    className = '',
    ...props
}) => {
    // Local state
    const [selectedDocuments, setSelectedDocuments] = useState(new Set());

    // Sort options
    const sortOptions = [
        { value: 'name', label: 'Name' },
        { value: 'uploadDate', label: 'Upload Date' },
        { value: 'fileSize', label: 'File Size' },
        { value: 'category', label: 'Category' }
    ];

    // Filter documents
    const filteredDocuments = documents.filter(doc => {
        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesName = doc.fileName?.toLowerCase().includes(query);
            const matchesDescription = doc.description?.toLowerCase().includes(query);
            const matchesCategory = doc.category?.toLowerCase().includes(query);

            if (!matchesName && !matchesDescription && !matchesCategory) {
                return false;
            }
        }

        // Category filter
        if (categoryFilter && categoryFilter !== 'all') {
            if (doc.category !== categoryFilter) {
                return false;
            }
        }

        // Folder filter (if in folder organization mode)
        if (selectedFolder) {
            if (doc.folderId !== selectedFolder.id) {
                return false;
            }
        }

        return true;
    });

    // Sort documents
    const sortedDocuments = [...filteredDocuments].sort((a, b) => {
        let aValue, bValue;

        switch (sortBy) {
            case 'name':
                aValue = a.fileName?.toLowerCase() || '';
                bValue = b.fileName?.toLowerCase() || '';
                break;
            case 'uploadDate':
                aValue = new Date(a.createdDate || 0);
                bValue = new Date(b.createdDate || 0);
                break;
            case 'fileSize':
                aValue = a.fileSize || 0;
                bValue = b.fileSize || 0;
                break;
            case 'category':
                aValue = a.category?.toLowerCase() || '';
                bValue = b.category?.toLowerCase() || '';
                break;
            default:
                aValue = a.fileName?.toLowerCase() || '';
                bValue = b.fileName?.toLowerCase() || '';
        }

        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    // Handle document selection
    const handleDocumentSelect = (documentId, checked) => {
        const newSelection = new Set(selectedDocuments);
        if (checked) {
            newSelection.add(documentId);
        } else {
            newSelection.delete(documentId);
        }
        setSelectedDocuments(newSelection);
    };

    // Handle document actions
    const handleDocumentAction = (action, document) => {
        switch (action) {
            case 'preview':
                if (onDocumentPreview) onDocumentPreview(document);
                break;
            case 'download':
                if (onDocumentDownload) onDocumentDownload(document);
                break;
            case 'edit':
                if (onDocumentEdit) onDocumentEdit(document);
                break;
            case 'delete':
                if (onDocumentDelete) onDocumentDelete(document.id);
                break;
            case 'share':
                if (onDocumentShare) onDocumentShare(document);
                break;
            default:
                break;
        }
    };

    // Grid view component
    const GridView = () => (
        <div className={`
            grid gap-4
            ${thumbnailSize === 'small' ? 'grid-cols-8 lg:grid-cols-12' : ''}
            ${thumbnailSize === 'medium' ? 'grid-cols-4 lg:grid-cols-6 xl:grid-cols-8' : ''}
            ${thumbnailSize === 'large' ? 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : ''}
        `}>
            {sortedDocuments.map((document, index) => (
                <motion.div
                    key={document.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="relative group"
                >
                    <DocumentThumbnail
                        document={document}
                        size={thumbnailSize}
                        onClick={() => {
                            if (onDocumentClick) {
                                onDocumentClick(document);
                            } else {
                                handleDocumentAction('preview', document);
                            }
                        }}
                        onPreview={() => handleDocumentAction('preview', document)}
                        onDownload={() => handleDocumentAction('download', document)}
                        showActions={true}
                        showInfo={true}
                    />

                    {/* Selection Checkbox */}
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <input
                            type="checkbox"
                            checked={selectedDocuments.has(document.id)}
                            onChange={(e) => handleDocumentSelect(document.id, e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                        />
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                        <Button
                            size="xs"
                            variant="secondary"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDocumentAction('preview', document);
                            }}
                            className="bg-white/90 text-gray-800 hover:bg-white w-6 h-6 p-0"
                        >
                            <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                            size="xs"
                            variant="secondary"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDocumentAction('download', document);
                            }}
                            className="bg-white/90 text-gray-800 hover:bg-white w-6 h-6 p-0"
                        >
                            <Download className="w-3 h-3" />
                        </Button>
                    </div>
                </motion.div>
            ))}
        </div>
    );

    // List view component
    const ListView = () => (
        <div className="space-y-2">
            {sortedDocuments.map((document, index) => (
                <motion.div
                    key={document.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="flex items-center space-x-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
                    onClick={() => handleDocumentAction('preview', document)}
                >
                    {/* Selection Checkbox */}
                    <input
                        type="checkbox"
                        checked={selectedDocuments.has(document.id)}
                        onChange={(e) => handleDocumentSelect(document.id, e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                    />

                    {/* Thumbnail */}
                    <div className="w-12 h-12">
                        <DocumentThumbnail
                            document={document}
                            size="small"
                            showActions={false}
                            showInfo={false}
                        />
                    </div>

                    {/* Document Info */}
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {document.fileName}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {document.description || 'No description'}
                        </p>
                    </div>

                    {/* Metadata */}
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                        <div>{document.category || 'Unknown'}</div>
                        <div>{document.fileSize ? `${(document.fileSize / 1024 / 1024).toFixed(1)} MB` : 'Unknown size'}</div>
                        {/* Folder Information */}
                        {document.folderName && (
                            <div className="mt-1">
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                                    📁 {document.folderName}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            size="xs"
                            variant="ghost"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDocumentAction('preview', document);
                            }}
                        >
                            <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                            size="xs"
                            variant="ghost"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDocumentAction('download', document);
                            }}
                        >
                            <Download className="w-3 h-3" />
                        </Button>
                        <Button
                            size="xs"
                            variant="ghost"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDocumentAction('edit', document);
                            }}
                        >
                            <Edit className="w-3 h-3" />
                        </Button>
                    </div>
                </motion.div>
            ))}
        </div>
    );

    return (
        <div className={`space-y-4 ${className}`} {...props}>
            {/* Header with Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Documents {selectedFolder ? `in "${selectedFolder.name}"` : ''}
                    </h3>
                    {selectedDocuments.size > 0 && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedDocuments.size} selected
                        </span>
                    )}
                </div>

                <div className="flex items-center space-x-2">
                    {/* View Controls */}
                    <div className="flex items-center space-x-1">
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onSortChange && onSortChange('grid', sortBy, sortOrder)}
                        >
                            <Grid className="w-4 h-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onSortChange && onSortChange('list', sortBy, sortOrder)}
                        >
                            <List className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Sort Controls */}
                    <div className="flex items-center space-x-2">
                        <select
                            value={sortBy}
                            onChange={(e) => onSortChange && onSortChange(viewMode, e.target.value, sortOrder)}
                            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                            {sortOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    Sort by {option.label}
                                </option>
                            ))}
                        </select>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onSortChange && onSortChange(viewMode, sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
                        >
                            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-500">Loading documents...</span>
                </div>
            ) : sortedDocuments.length > 0 ? (
                viewMode === 'grid' ? <GridView /> : <ListView />
            ) : (
                <div className="text-center py-12">
                    <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No documents found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        {searchQuery ? 'Try adjusting your search criteria' : 'Upload your first document to get started'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default DocumentGridView;
