import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    X,
    Image as ImageIcon,
    Video,
    File,
    Camera,
    Play,
    Download,
    Edit,
    Trash2,
    Grid,
    List,
    Search,
    Filter,
    SortAsc,
    SortDesc,
    Eye,
    Plus,
    FolderPlus,
    Move,
    Copy,
    Share,
    Info,
    CheckCircle,
    AlertCircle,
    Clock,
    FileText,
    Tag as TagIcon
} from 'lucide-react';
import MoveToFolderModal from './MoveToFolderModal';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import httpClient from '../../services/api/httpClient';

const MediaUploadGallery = ({
    siteId,
    value = [],
    onChange,
    onUpload,
    onDelete,
    onUpdate,
    maxFiles = 50,
    maxSize = 100 * 1024 * 1024, // 100MB
    acceptedTypes = [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'video/mp4', 'video/webm', 'video/quicktime',
        'application/pdf', 'text/plain'
    ],
    allowedCategories = ['hero', 'primary', 'photos', 'videos', 'documents', 'archive'],
    className = '',
    ...props
}) => {
    const { user } = useAuth();
    const { t } = useLanguage();

    // State management - initialize with empty array to prevent undefined issues
    const [files, setFiles] = useState([]);
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState(new Set());
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [editingFile, setEditingFile] = useState(null);
    const [viewingFile, setViewingFile] = useState(null);
    const [bulkAction, setBulkAction] = useState(null);
    const [toast, setToast] = useState({ type: '', message: '' });
    const [taggingFile, setTaggingFile] = useState(null);
    const [newTag, setNewTag] = useState('');
    const [showMoveToFolderModal, setShowMoveToFolderModal] = useState(false);
    const [fileToMove, setFileToMove] = useState(null);
    const [folders, setFolders] = useState([]);
    const [selectedFolderId, setSelectedFolderId] = useState(null);

    const fileInputRef = useRef(null);
    const uploadAreaRef = useRef(null);

    // Load folders for the site
    const loadFolders = useCallback(async () => {
        try {
            const response = await httpClient.get(`/api/folders/site/${siteId}`);
            let foldersData = [];

            if (response && Array.isArray(response)) {
                foldersData = response;
            } else if (response && response.data && Array.isArray(response.data)) {
                foldersData = response.data;
            }

            setFolders(foldersData);
        } catch (error) {
            console.error('Error loading folders:', error);
            setFolders([]);
        }
    }, [siteId]);

    // Load folders when component mounts or siteId changes
    useEffect(() => {
        if (siteId) {
            loadFolders();
        }
    }, [siteId, loadFolders]);

    // Update files when prop changes - use useCallback to prevent infinite loops
    const processFiles = useCallback((mediaData) => {
        if (!mediaData || !Array.isArray(mediaData)) {
            return [];
        }

        return mediaData.map(file => {
            if (!file || typeof file !== 'object') {
                console.warn('Invalid file object:', file);
                return null;
            }

            // Ensure all required fields have fallback values
            const processedFile = {
                id: file.id || `file_${Date.now()}_${Math.random()}`,
                name: file.fileName || file.name || file.originalFileName || 'Unknown File',
                fileName: file.fileName || file.name || file.originalFileName || 'Unknown File',
                size: file.size || file.fileSize || file.fileLength || (file.filePath ? 1024 * 1024 : 0),
                fileSize: file.size || file.fileSize || file.fileLength || (file.filePath ? 1024 * 1024 : 0),
                type: file.fileType || file.type || file.mimeType || 'application/octet-stream',
                fileType: file.fileType || file.type || file.mimeType || 'application/octet-stream',
                category: file.category || 'photos',
                description: file.description || '',
                uploadedAt: file.uploadedAt || file.createdDate || new Date().toISOString(),
                uploadedBy: file.uploadedBy || file.uploaderUsername || 'Unknown',
                url: file.url || file.filePath || '',
                thumbnail: file.thumbnail || '',
                preview: file.id ? `/api/media/download/${file.id}` : (file.preview || file.url || ''),
                status: file.status || 'completed',
                tags: file.tags || [],
                backendData: file
            };

            // Validate that critical fields are present
            if (!processedFile.id) {
                console.error('File missing ID:', file);
                return null;
            }

            return processedFile;
        }).filter(Boolean); // Remove any null entries
    }, []);

    // Update files when prop changes - with proper dependency management
    useEffect(() => {
        // Only process if value is defined and different from current files
        if (value === undefined) {
            setFiles([]);
            return;
        }

        const processedFiles = processFiles(value);
        setFiles(processedFiles);
    }, [value, processFiles]);

    // File type detection
    const getFileType = (file) => {
        if (file.type?.startsWith('image/')) return 'image';
        if (file.type?.startsWith('video/')) return 'video';
        if (file.type?.includes('pdf')) return 'pdf';
        return 'document';
    };

    // File category mapping with hero image support
    const getCategoryFromType = (type) => {
        switch (type) {
            case 'image': return 'photos';
            case 'video': return 'videos';
            case 'pdf':
            case 'document': return 'documents';
            default: return 'archive';
        }
    };

    // Enhanced category options for hero image selection
    const getCategoryOptions = () => {
        return [
            { value: 'hero', label: 'Hero Image', description: 'Primary image for site display' },
            { value: 'primary', label: 'Primary Image', description: 'Main representative image' },
            { value: 'photos', label: 'Photos', description: 'General photo collection' },
            { value: 'videos', label: 'Videos', description: 'Video content' },
            { value: 'documents', label: 'Documents', description: 'PDFs and text files' },
            { value: 'archive', label: 'Archive', description: 'Historical or reference materials' }
        ];
    };

    // Generate thumbnail for files
    const generateThumbnail = (file) => {
        return new Promise((resolve) => {
            const type = getFileType(file);

            if (type === 'image') {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            } else if (type === 'video') {
                const video = document.createElement('video');
                video.preload = 'metadata';
                video.onloadedmetadata = () => {
                    video.currentTime = 1; // Seek to 1 second
                };
                video.onseeked = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = 320;
                    canvas.height = 180;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL());
                };
                video.src = URL.createObjectURL(file);
            } else {
                resolve(null); // No thumbnail for documents
            }
        });
    };

    // Handle file selection
    const handleFileSelect = useCallback(async (selectedFiles) => {
        const newFiles = Array.from(selectedFiles);
        const validFiles = [];
        const errors = [];

        setUploading(true);

        for (const file of newFiles) {
            // Check file type
            if (!acceptedTypes.includes(file.type)) {
                errors.push(`${file.name}: Unsupported file type`);
                continue;
            }

            // Check file size
            if (file.size > maxSize) {
                errors.push(`${file.name}: File too large (max ${Math.round(maxSize / 1024 / 1024)}MB)`);
                continue;
            }

            // Check total files limit
            if ((value?.length || 0) + validFiles.length >= maxFiles) {
                errors.push(`Maximum ${maxFiles} files allowed`);
                break;
            }

            // Generate thumbnail
            const thumbnail = await generateThumbnail(file);
            const fileType = getFileType(file);

            // Create file object
            const fileObj = {
                id: `file_${Date.now()}_${validFiles.length}`,
                file,
                name: file.name,
                fileName: file.name, // Ensure fileName is set
                size: file.size,
                fileSize: file.size, // Ensure fileSize is set
                type: file.type,
                fileType,
                category: getCategoryFromType(fileType),
                thumbnail,
                preview: fileType === 'image' ? URL.createObjectURL(file) : thumbnail,
                uploadedAt: new Date().toISOString(),
                uploadedBy: user?.username || 'Unknown',
                description: '',
                tags: [],
                metadata: {
                    width: null,
                    height: null,
                    duration: null
                },
                status: 'uploading'
            };

            validFiles.push(fileObj);
        }

        if (validFiles.length > 0) {
            const updatedFiles = [...(value || []), ...validFiles];
            setFiles(updatedFiles);

            // Real upload process
            for (const fileObj of validFiles) {
                try {
                    // Update file status to uploading
                    setFiles(prev => prev.map(f =>
                        f.id === fileObj.id
                            ? { ...f, status: 'uploading' }
                            : f
                    ));

                    // Upload to backend if siteId is available
                    if (siteId) {
                        const formData = new FormData();
                        formData.append('file', fileObj.file);
                        formData.append('description', fileObj.description || '');
                        formData.append('category', fileObj.category || 'photos');
                        formData.append('dateTaken', fileObj.dateTaken || '');
                        formData.append('photographer', fileObj.photographer || '');
                        formData.append('isPublic', 'true');

                        const response = await httpClient.post(`/api/media/upload/${siteId}`, formData, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        });

                        const result = response.data;

                        // Update file status to completed with backend data
                        setFiles(prev => prev.map(f =>
                            f.id === fileObj.id
                                ? {
                                    ...f,
                                    status: 'completed',
                                    url: f.preview,
                                    backendId: result.id,
                                    id: result.id, // Update with backend ID
                                    fileName: result.fileName || f.name, // Use backend fileName
                                    fileSize: result.fileSize || f.size, // Use backend fileSize
                                    fileType: result.fileType || f.fileType, // Use backend fileType
                                    category: result.category || f.category, // Use backend category
                                    description: result.description || f.description, // Use backend description
                                    backendData: result
                                }
                                : f
                        ));
                    } else {
                        // No siteId, just mark as completed (for preview purposes)
                        setFiles(prev => prev.map(f =>
                            f.id === fileObj.id
                                ? { ...f, status: 'completed', url: f.preview }
                                : f
                        ));
                    }
                } catch (error) {
                    console.error('Upload failed for file:', fileObj.name, error);
                    setFiles(prev => prev.map(f =>
                        f.id === fileObj.id
                            ? { ...f, status: 'error', error: error.message }
                            : f
                    ));
                }
            }

            // Get the final state of files after all uploads complete
            const finalFiles = [...(value || []), ...validFiles.map(f => ({
                ...f,
                status: 'completed',
                id: f.backendId || f.id, // Use backend ID if available
                fileName: f.name, // Ensure fileName is set
                fileSize: f.size // Ensure fileSize is set
            }))];

            // Call onChange with the final state
            if (onChange) {
                onChange(finalFiles);
            }
        }

        if (errors.length > 0) {
            console.error('Upload errors:', errors);
        }

        setUploading(false);
        setShowUploadModal(false);
    }, [onChange, acceptedTypes, maxSize, maxFiles, user]);

    // Drag and drop handlers
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFiles = e.dataTransfer.files;
        handleFileSelect(droppedFiles);
    }, []);

    // File input change
    const handleInputChange = (e) => {
        const selectedFiles = e.target.files;
        if (selectedFiles) {
            handleFileSelect(selectedFiles);
        }
    };

    // Delete file
    const handleDeleteFile = async (fileId) => {
        try {
            // First, remove from local state for immediate UI feedback
            const updatedFiles = files.filter(f => f.id !== fileId);
            setFiles(updatedFiles);

            // Call backend API to actually delete the file
            try {
                if (!siteId) {
                    throw new Error('Site ID is required for deletion');
                }
                await httpClient.delete(`/api/heritage-sites/${siteId}/media/${fileId}`);
            } catch (error) {
                // If deletion failed, restore the file to the list
                console.error('Failed to delete media from backend:', error);
                setFiles(files); // Restore original files
                setToast({ type: 'error', message: 'Failed to delete media file' });
                return;
            }

            // Deletion successful, update parent component
            if (onChange) {
                onChange(updatedFiles);
            }

            console.log(`Media file ${fileId} deleted successfully`);
            setToast({ type: 'success', message: 'Media file deleted successfully' });

        } catch (error) {
            console.error('Error deleting media file:', error);
            // Restore the file if there was an error
            setFiles(files);
            setToast({ type: 'error', message: 'Error deleting media file' });
        }
    };

    // Edit file metadata
    const handleEditFile = (file) => {
        setEditingFile(file);
    };

    // Download file
    const handleDownloadFile = async (file) => {
        try {
            if (!file || !file.id) {
                setToast({ type: 'error', message: 'Invalid file for download' });
                return;
            }

            // Create download link
            const downloadUrl = `/api/media/download/${file.id}`;

            // Create temporary anchor element
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = file.name || file.fileName || 'download';
            link.target = '_blank';

            // Add to DOM, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setToast({ type: 'success', message: 'Download started successfully' });

        } catch (error) {
            console.error('Error downloading file:', error);
            setToast({ type: 'error', message: 'Failed to download file' });
        }
    };

    // Tag file
    const handleTagFile = (file) => {
        setTaggingFile(file);
        setNewTag('');
    };

    // Move file to folder
    const handleMoveToFolder = useCallback((file) => {
        setFileToMove(file);
        setShowMoveToFolderModal(true);
    }, []);

    const handleMoveToFolderSuccess = useCallback(() => {
        // Refresh the files list or update the file's folder property
        // This will depend on how your backend handles the move operation
        if (onChange && Array.isArray(files)) {
            const updatedFiles = files.map(f => {
                if (f.id === fileToMove.id) {
                    // Update the folder information if available
                    return { ...f, folderId: fileToMove.folderId };
                }
                return f;
            });
            onChange(updatedFiles);
        }
    }, [onChange, files, fileToMove]);



    // Bulk move files to folder
    const handleBulkMoveToFolder = useCallback(async () => {
        if (!selectedFolderId) {
            setToast({ type: 'error', message: 'Please select a folder' });
            return;
        }

        try {
            setLoading(true);

            // Move all selected files to the selected folder
            const movePromises = Array.from(selectedFiles).map(fileId => {
                const file = files.find(f => f.id === fileId);
                if (file) {
                    return httpClient.post(`/api/media/${fileId}/move`, {
                        folderId: selectedFolderId
                    });
                }
                return Promise.resolve();
            });

            await Promise.all(movePromises);

            setToast({ type: 'success', message: `${selectedFiles.size} files moved successfully` });

            // Clear selection and close modal
            clearSelection();
            setBulkAction(null);
            setSelectedFolderId(null);

            // Refresh files if onChange callback is provided
            if (onChange) {
                const updatedFiles = files.map(f => {
                    if (selectedFiles.has(f.id)) {
                        return { ...f, folderId: selectedFolderId };
                    }
                    return f;
                });
                onChange(updatedFiles);
            }
        } catch (error) {
            console.error('Error moving files:', error);
            setToast({ type: 'error', message: 'Failed to move some files' });
        } finally {
            setLoading(false);
        }
    }, [selectedFolderId, selectedFiles, files, onChange, setToast]);

    // Add tag to file
    const handleAddTag = async (file, tag) => {
        try {
            if (!tag || !tag.trim()) {
                setToast({ type: 'error', message: 'Tag cannot be empty' });
                return;
            }

            // Initialize tags array if it doesn't exist
            if (!file.tags) {
                file.tags = [];
            }

            // Check if tag already exists
            if (file.tags.includes(tag.trim())) {
                setToast({ type: 'warning', message: 'Tag already exists' });
                return;
            }

            // Add tag to local state
            const updatedFiles = files.map(f =>
                f.id === file.id ? { ...f, tags: [...(f.tags || []), tag.trim()] } : f
            );
            setFiles(updatedFiles);

            // Update parent component
            if (onChange) {
                onChange(updatedFiles);
            }

            // Clear input
            setNewTag('');

            // Show success message
            setToast({ type: 'success', message: `Tag "${tag.trim()}" added successfully` });

            // Update the taggingFile state to reflect changes
            setTaggingFile({ ...file, tags: [...(file.tags || []), tag.trim()] });

        } catch (error) {
            console.error('Error adding tag:', error);
            setToast({ type: 'error', message: 'Failed to add tag' });
        }
    };

    // Remove tag from file
    const handleRemoveTag = async (file, tagToRemove) => {
        try {
            // Remove tag from local state
            const updatedFiles = files.map(f =>
                f.id === file.id ? { ...f, tags: (f.tags || []).filter(tag => tag !== tagToRemove) } : f
            );
            setFiles(updatedFiles);

            // Update parent component
            if (onChange) {
                onChange(updatedFiles);
            }

            // Show success message
            setToast({ type: 'success', message: `Tag "${tagToRemove}" removed successfully` });

            // Update the taggingFile state to reflect changes
            setTaggingFile({ ...file, tags: (file.tags || []).filter(tag => tag !== tagToRemove) });

        } catch (error) {
            console.error('Error removing tag:', error);
            setToast({ type: 'error', message: 'Failed to remove tag' });
        }
    };

    // Update file metadata
    const handleUpdateFile = async (fileId, updates) => {
        try {
            // First, update local state for immediate UI feedback
            const updatedFiles = files.map(f =>
                f.id === fileId ? { ...f, ...updates } : f
            );
            setFiles(updatedFiles);

            // Call backend API to persist the changes
            try {
                await httpClient.patch(`/api/media/${fileId}`, {
                    description: updates.description,
                    category: updates.category,
                    dateTaken: updates.dateTaken,
                    photographer: updates.photographer,
                    isPublic: updates.isPublic
                });
            } catch (error) {
                // If update failed, restore the original file
                console.error('Failed to update media in backend:', error);
                setFiles(files); // Restore original files
                setToast({ type: 'error', message: 'Failed to update media file' });
                return;
            }

            // Update successful, update parent component
            if (onChange) {
                onChange(updatedFiles);
            }

            console.log(`Media file ${fileId} updated successfully`);
            setToast({ type: 'success', message: 'Media file updated successfully' });
            setEditingFile(null);

        } catch (error) {
            console.error('Error updating media file:', error);
            // Restore the file if there was an error
            setFiles(files);
            setToast({ type: 'error', message: 'Error updating media file' });
        }
    };

    // Selection handlers
    const toggleFileSelection = (fileId) => {
        const newSelection = new Set(selectedFiles);
        if (newSelection.has(fileId)) {
            newSelection.delete(fileId);
        } else {
            newSelection.add(fileId);
        }
        setSelectedFiles(newSelection);
    };

    const selectAllFiles = () => {
        setSelectedFiles(new Set(files.map(f => f.id)));
    };

    const clearSelection = () => {
        setSelectedFiles(new Set());
    };

    // Bulk actions
    const handleBulkDelete = async () => {
        try {
            if (selectedFiles.size === 0) {
                setToast({ type: 'warning', message: 'No files selected for deletion' });
                return;
            }

            // Get selected files
            const selectedFileList = files.filter(f => selectedFiles.has(f.id));

            // First, remove from local state for immediate UI feedback
            const updatedFiles = files.filter(f => !selectedFiles.has(f.id));
            setFiles(updatedFiles);

            // Call backend API to actually delete each selected file
            if (!siteId) {
                setToast({ type: 'error', message: 'Site ID is required for deletion' });
                return;
            }

            const deletePromises = Array.from(selectedFiles).map(async (fileId) => {
                try {
                    await httpClient.delete(`/api/heritage-sites/${siteId}/media/${fileId}`);
                    return { success: true, fileId };
                } catch (error) {
                    console.error(`Failed to delete media ${fileId}:`, error);
                    return { success: false, fileId, error };
                }
            });

            const results = await Promise.all(deletePromises);
            const successfulDeletions = results.filter(r => r.success).length;
            const failedDeletions = results.filter(r => !r.success).length;

            // Update parent component
            if (onChange) {
                onChange(updatedFiles);
            }

            // Clear selection
            setSelectedFiles(new Set());

            // Show results
            if (failedDeletions === 0) {
                setToast({ type: 'success', message: `Successfully deleted ${successfulDeletions} files` });
            } else if (successfulDeletions === 0) {
                // All deletions failed, restore files
                setFiles(files);
                setToast({ type: 'error', message: 'Failed to delete any files' });
            } else {
                // Some deletions succeeded, some failed
                setToast({ type: 'warning', message: `Deleted ${successfulDeletions} files, ${failedDeletions} failed` });
            }

        } catch (error) {
            console.error('Error in bulk delete:', error);
            // Restore original files if there was an error
            setFiles(files);
            setToast({ type: 'error', message: 'Error during bulk deletion' });
        }
    };

    const handleBulkCategorize = async (category) => {
        try {
            // First, update local state for immediate UI feedback
            const updatedFiles = files.map(f =>
                selectedFiles.has(f.id) ? { ...f, category } : f
            );
            setFiles(updatedFiles);

            // Update each selected file in the backend
            const updatePromises = Array.from(selectedFiles).map(async (fileId) => {
                try {
                    const response = await httpClient.patch(`/api/media/${fileId}`, { category });
                    return response.data;
                } catch (error) {
                    throw new Error(`Failed to update media ${fileId}: ${error.message}`);
                }
            });

            await Promise.all(updatePromises);

            // Update parent component
            if (onChange) {
                onChange(updatedFiles);
            }

            console.log(`Bulk categorized ${selectedFiles.size} files to ${category}`);
            setToast({ type: 'success', message: `${selectedFiles.size} files categorized as ${category}` });
            setSelectedFiles(new Set());

        } catch (error) {
            console.error('Error bulk categorizing files:', error);
            // Restore original files if there was an error
            setFiles(files);
            setToast({ type: 'error', message: 'Error updating file categories' });
        }
    };

    const handleBulkDownload = async () => {
        try {
            if (selectedFiles.size === 0) {
                setToast({ type: 'warning', message: 'No files selected for download' });
                return;
            }

            // Get selected files
            const selectedFileList = files.filter(f => selectedFiles.has(f.id));

            // Download each selected file
            selectedFileList.forEach((file, index) => {
                setTimeout(() => {
                    const downloadUrl = `/api/media/download/${file.id}`;
                    const link = document.createElement('a');
                    link.href = downloadUrl;
                    link.download = file.name || file.fileName || `download_${index + 1}`;
                    link.target = '_blank';

                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }, index * 100); // Stagger downloads to avoid browser blocking
            });

            setToast({ type: 'success', message: `Downloading ${selectedFiles.size} files` });

        } catch (error) {
            console.error('Error bulk downloading files:', error);
            setToast({ type: 'error', message: 'Failed to download files' });
        }
    };

    const handleBulkAddTag = async (tag) => {
        try {
            if (!tag || !tag.trim()) {
                setToast({ type: 'error', message: 'Tag cannot be empty' });
                return;
            }

            if (selectedFiles.size === 0) {
                setToast({ type: 'warning', message: 'No files selected for tagging' });
                return;
            }

            // Get selected files
            const selectedFileList = files.filter(f => selectedFiles.has(f.id));

            // Add tag to all selected files
            const updatedFiles = files.map(f => {
                if (selectedFiles.has(f.id)) {
                    // Initialize tags array if it doesn't exist
                    if (!f.tags) {
                        f.tags = [];
                    }

                    // Check if tag already exists
                    if (!f.tags.includes(tag.trim())) {
                        return { ...f, tags: [...f.tags, tag.trim()] };
                    }
                }
                return f;
            });

            setFiles(updatedFiles);

            // Update parent component
            if (onChange) {
                onChange(updatedFiles);
            }

            // Clear input and close modal
            setNewTag('');
            setBulkAction(null);

            // Show success message
            const addedCount = selectedFileList.filter(f => !f.tags || !f.tags.includes(tag.trim())).length;
            setToast({ type: 'success', message: `Tag "${tag.trim()}" added to ${addedCount} files` });

        } catch (error) {
            console.error('Error bulk adding tag:', error);
            setToast({ type: 'error', message: 'Failed to add tag to files' });
        }
    };

    // Filter and sort files
    const filteredFiles = (files || []).filter(file => {
        if (!file) return false;

        // Safe search with null checks
        const searchLower = (searchQuery || '').toLowerCase();
        const nameMatch = file.name && file.name.toLowerCase && file.name.toLowerCase().includes(searchLower);
        const descriptionMatch = file.description && file.description.toLowerCase && file.description.toLowerCase().includes(searchLower);
        const matchesSearch = nameMatch || descriptionMatch;

        const matchesCategory = filterCategory === 'all' || file.category === filterCategory;
        return matchesSearch && matchesCategory;
    }).sort((a, b) => {
        let aValue, bValue;

        switch (sortBy) {
            case 'name':
                aValue = a.name && a.name.toLowerCase ? a.name.toLowerCase() : '';
                bValue = b.name && b.name.toLowerCase ? b.name.toLowerCase() : '';
                break;
            case 'size':
                aValue = a.size || 0;
                bValue = b.size || 0;
                break;
            case 'type':
                aValue = a.fileType || '';
                bValue = b.fileType || '';
                break;
            case 'date':
            default:
                aValue = a.uploadedAt ? new Date(a.uploadedAt) : new Date(0);
                bValue = b.uploadedAt ? new Date(b.uploadedAt) : new Date(0);
                break;
        }

        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Check if file is an image
    const isImageFile = (fileType) => {
        if (!fileType) return false;
        const type = fileType.toLowerCase();
        return type.startsWith('image/') || type === 'image';
    };

    // Get file icon
    const getFileIcon = (fileType, size = 'w-6 h-6') => {
        if (!fileType) return <File className={size} />;

        const type = fileType.toLowerCase();
        if (type.startsWith('image/') || type === 'image') return <ImageIcon className={size} />;
        if (type.startsWith('video/') || type === 'video') return <Video className={size} />;
        if (type.includes('pdf') || type === 'pdf') return <FileText className={size} />;
        return <File className={size} />;
    };

    // Get status icon
    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'uploading': return <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />;
            case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
            default: return null;
        }
    };

    // Handle view file
    const handleViewFile = (file) => {
        console.log('Viewing file:', file);
        console.log('File type:', file.fileType);
        console.log('File type (original):', file.type);
        console.log('Backend data:', file.backendData);
        setViewingFile(file);
    };

    // Handle file upload
    const handleFileUpload = async (uploadedFiles) => {
        try {
            setUploading(true);

            // Associate files with the currently selected folder if one is selected
            const filesWithFolder = uploadedFiles.map(file => ({
                ...file,
                folderId: selectedFolderId || null,
                folderName: selectedFolderId ? folders.find(f => f.id === selectedFolderId)?.name : null
            }));

            // Update local state
            const updatedFiles = [...files, ...filesWithFolder];
            setFiles(updatedFiles);

            // Call parent onChange callback
            if (onChange) {
                onChange(updatedFiles);
            }

            // Call parent onUpload callback if provided
            if (onUpload) {
                onUpload(filesWithFolder);
            }

            // Show success message with folder information
            if (selectedFolderId) {
                const folderName = folders.find(f => f.id === selectedFolderId)?.name;
                setToast({
                    type: 'success',
                    message: `${uploadedFiles.length} files uploaded to "${folderName}" folder`
                });
            } else {
                setToast({
                    type: 'success',
                    message: `${uploadedFiles.length} files uploaded to root media gallery`
                });
            }

            // Clear any file selection
            setSelectedFiles(new Set());

        } catch (error) {
            console.error('Error uploading files:', error);
            setToast({ type: 'error', message: 'Failed to upload files' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={`space-y-4 sm:space-y-6 w-full ${className}`} {...props}>
            {/* Toast Notifications */}
            {toast.message && (
                <div className={`fixed top-4 left-4 right-4 sm:right-4 z-50 p-3 sm:p-4 rounded-lg shadow-lg max-w-sm sm:max-w-md mx-auto sm:mx-0 ${toast.type === 'success' ? 'bg-green-500 text-white' :
                    toast.type === 'error' ? 'bg-red-500 text-white' :
                        'bg-gray-500 text-white'
                    }`}>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm sm:text-base">{toast.message}</span>
                        <button
                            onClick={() => setToast({ type: '', message: '' })}
                            className="ml-2 text-white hover:text-gray-200 flex-shrink-0"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                        <div>
                            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                                <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                                <span>Media Gallery</span>
                            </CardTitle>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {files?.length || 0} files • {formatFileSize((files || []).reduce((total, file) => total + (file?.size || 0), 0))} total
                            </p>
                        </div>

                        <div className="flex items-center space-x-2 w-full sm:w-auto">
                            {/* Upload Button */}
                            <Button
                                onClick={() => setShowUploadModal(true)}
                                className="flex items-center space-x-2 w-full sm:w-auto justify-center sm:justify-start"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Upload</span>
                            </Button>
                        </div>
                    </div>

                    {/* Controls Bar */}
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        {/* Search and Filter */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 flex-1 w-full lg:w-auto">
                            <div className="relative flex-1 w-full sm:max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search files..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                />
                            </div>

                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-full sm:w-auto text-sm"
                            >
                                <option value="all">All Categories</option>
                                {getCategoryOptions().map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* View Controls */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full lg:w-auto">
                            {/* Sort */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm w-full sm:w-auto"
                                >
                                    <option value="date">Sort by Date</option>
                                    <option value="name">Sort by Name</option>
                                    <option value="size">Sort by Size</option>
                                    <option value="type">Sort by Type</option>
                                </select>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    className="w-full sm:w-auto"
                                >
                                    {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                                </Button>
                            </div>

                            {/* View Mode */}
                            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden w-full sm:w-auto">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 flex-1 sm:flex-none ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                                >
                                    <Grid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 flex-1 sm:flex-none ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Selection Bar */}
                    <AnimatePresence>
                        {selectedFiles.size > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg gap-3"
                            >
                                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                    {selectedFiles.size} file{selectedFiles.size !== 1 ? 's' : ''} selected
                                </span>

                                <div className="grid grid-cols-2 sm:flex sm:flex-row items-stretch sm:items-center gap-2 sm:gap-x-2 w-full sm:w-auto">
                                    <Button size="sm" variant="outline" onClick={() => setBulkAction('tag')} className="w-full justify-center text-xs sm:text-sm">
                                        <TagIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                        Add Tags
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => setBulkAction('category')} className="w-full justify-center text-xs sm:text-sm">
                                        <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                        Change Category
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => setBulkAction('move')} className="w-full justify-center text-xs sm:text-sm">
                                        <Move className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                        Move to Folder
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={handleBulkDownload} className="text-green-600 w-full justify-center text-xs sm:text-sm">
                                        <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                        Download
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={handleBulkDelete} className="text-red-600 w-full justify-center text-xs sm:text-sm">
                                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                        Delete
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={clearSelection} className="w-full justify-center text-xs sm:text-sm col-span-2 sm:col-span-1">
                                        Cancel
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardHeader>
            </Card>

            {/* Upload Modal */}
            <AnimatePresence>
                {showUploadModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={() => setShowUploadModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-lg p-6 m-4 max-w-lg w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-semibold mb-4">Upload Media Files</h3>

                            {/* Folder Selection */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Upload to Folder
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    value={selectedFolderId || ''}
                                    onChange={(e) => setSelectedFolderId(e.target.value || null)}
                                >
                                    <option value="">Root Media Gallery (No folder)</option>
                                    {folders.map((folder) => (
                                        <option key={folder.id} value={folder.id}>
                                            📁 {folder.name}
                                        </option>
                                    ))}
                                </select>
                                {selectedFolderId && (
                                    <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                                        Files will be uploaded to: <strong>{folders.find(f => f.id === selectedFolderId)?.name}</strong>
                                    </p>
                                )}
                            </div>

                            {/* Upload Area */}
                            <div
                                ref={uploadAreaRef}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-lg p-4 sm:p-8 text-center cursor-pointer transition-all duration-200 ${dragOver
                                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                    }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept={acceptedTypes.join(',')}
                                    onChange={handleInputChange}
                                    className="hidden"
                                />

                                <motion.div
                                    animate={{
                                        scale: dragOver ? 1.1 : 1,
                                        rotate: dragOver ? 5 : 0
                                    }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                                </motion.div>

                                <h4 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    {dragOver ? 'Drop files here' : 'Upload media files'}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
                                    Drag and drop files or click to browse
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                    Supports images, videos, PDFs up to {Math.round(maxSize / 1024 / 1024)}MB each
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-6">
                                <Button variant="outline" onClick={() => setShowUploadModal(false)} className="w-full sm:w-auto">
                                    Cancel
                                </Button>
                                <Button onClick={() => fileInputRef.current?.click()} className="w-full sm:w-auto">
                                    Choose Files
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* File Gallery */}
            <Card>
                <CardContent className="p-4 sm:p-6">
                    {filteredFiles.length === 0 ? (
                        /* Empty State */
                        <div className="text-center py-8 sm:py-12">
                            <Camera className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                                {(files || []).length === 0 ? 'No media files yet' : 'No files match your search'}
                            </h3>
                            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 px-4">
                                {(files || []).length === 0
                                    ? 'Upload photos, videos, and documents to get started'
                                    : 'Try adjusting your search or filter criteria'
                                }
                            </p>
                            {(files || []).length === 0 && (
                                <Button onClick={() => setShowUploadModal(true)} className="text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-2.5">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Upload Files
                                </Button>
                            )}
                        </div>
                    ) : (
                        /* File Grid/List */
                        <div className={
                            viewMode === 'grid'
                                ? 'grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4'
                                : 'space-y-2'
                        }>
                            {(filteredFiles || []).map((file) => {
                                // Safety check to prevent undefined errors
                                if (!file || !file.id) {
                                    console.warn('Skipping invalid file:', file);
                                    return null;
                                }

                                return (
                                    <motion.div
                                        key={file.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className={
                                            viewMode === 'grid'
                                                ? 'relative group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow'
                                                : 'flex items-center space-x-2 sm:space-x-4 p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                                        }
                                    >
                                        {/* Selection Checkbox */}
                                        <div className={
                                            viewMode === 'grid'
                                                ? 'absolute top-2 left-2 z-10'
                                                : 'flex-shrink-0'
                                        }>
                                            <input
                                                type="checkbox"
                                                checked={selectedFiles.has(file.id)}
                                                onChange={() => toggleFileSelection(file.id)}
                                                className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                        </div>

                                        {viewMode === 'grid' ? (
                                            /* Grid View */
                                            <>
                                                {/* Preview */}
                                                <div className="aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                                    {isImageFile(file.fileType) && (file.preview || file.id) ? (
                                                        <img
                                                            src={file.preview || `/api/media/download/${file.id}`}
                                                            alt={file.name}
                                                            className="w-full h-full object-cover"
                                                            onLoad={() => {
                                                                console.log(`Image loaded successfully from: ${file.preview || `/api/media/download/${file.id}`}`);
                                                            }}
                                                            onError={(e) => {
                                                                console.log(`Image failed to load from: ${file.preview || `/api/media/download/${file.id}`}`);
                                                                console.log('Image failed to load, showing icon');
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'flex';
                                                            }}
                                                        />
                                                    ) : null}

                                                    {/* Fallback Icon - shown for non-images or when image fails */}
                                                    <div className={`${isImageFile(file.fileType) && (file.preview || file.id) ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                                                        {getFileIcon(file.fileType, 'w-8 h-8 text-gray-400')}
                                                    </div>

                                                    {/* Overlay */}
                                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-wrap justify-center gap-1 p-2">
                                                            <Button size="sm" variant="ghost" className="text-white hover:bg-white hover:bg-opacity-20 w-8 h-8 p-0" onClick={() => handleViewFile(file)}>
                                                                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                                                            </Button>
                                                            <Button size="sm" variant="ghost" className="text-white hover:bg-white hover:bg-opacity-20 w-8 h-8 p-0" onClick={() => handleDownloadFile(file)}>
                                                                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                                                            </Button>
                                                            <Button size="sm" variant="ghost" className="text-white hover:bg-white hover:bg-opacity-20 w-8 h-8 p-0" onClick={() => handleMoveToFolder(file)}>
                                                                <Move className="w-3 h-3 sm:w-4 sm:h-4" />
                                                            </Button>
                                                            <Button size="sm" variant="ghost" className="text-white hover:bg-white hover:bg-opacity-20 w-8 h-8 p-0" onClick={() => handleTagFile(file)}>
                                                                <TagIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                                            </Button>
                                                            <Button size="sm" variant="ghost" className="text-white hover:bg-white hover:bg-opacity-20 w-8 h-8 p-0" onClick={() => handleEditFile(file)}>
                                                                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                                            </Button>
                                                            <Button size="sm" variant="ghost" className="text-white hover:bg-white hover:bg-opacity-20 w-8 h-8 p-0" onClick={() => handleDeleteFile(file.id)}>
                                                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* File Info */}
                                                <div className="p-2 sm:p-3">
                                                    <h4 className="font-medium text-xs sm:text-sm text-gray-900 dark:text-white truncate" title={file.name}>
                                                        {file.name}
                                                    </h4>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                                                        {getStatusIcon(file.status)}
                                                    </div>
                                                    {/* Display tags */}
                                                    {file.tags && file.tags.length > 0 && (
                                                        <div className="mt-1 sm:mt-2 flex flex-wrap gap-1">
                                                            {file.tags.slice(0, 2).map((tag, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="inline-flex items-center px-1 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                            {file.tags.length > 2 && (
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                    +{file.tags.length - 2} more
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            /* List View */
                                            <>
                                                {/* Preview */}
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                                                    {isImageFile(file.fileType) && (file.preview || file.id) ? (
                                                        <img
                                                            src={file.preview || `/api/media/download/${file.id}`}
                                                            alt={file.name}
                                                            className="w-full h-full object-cover rounded"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'flex';
                                                            }}
                                                        />
                                                    ) : null}

                                                    {/* Fallback Icon */}
                                                    <div className={`${isImageFile(file.fileType) && (file.preview || file.id) ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                                                        {getFileIcon(file.fileType, 'w-5 h-5 sm:w-6 sm:h-6 text-gray-400')}
                                                    </div>
                                                </div>

                                                {/* File Details */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">
                                                        {file.name}
                                                    </h4>
                                                    <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                                        <span>{formatDate(file.uploadedAt)}</span>
                                                        {file.folderName && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                                📁 {file.folderName}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {/* Display tags */}
                                                    {file.tags && file.tags.length > 0 && (
                                                        <div className="mt-1 flex flex-wrap gap-1">
                                                            {file.tags.slice(0, 3).map((tag, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="inline-flex items-center px-1 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                            {file.tags.length > 3 && (
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                    +{file.tags.length - 3} more
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Status */}
                                                <div className="flex-shrink-0">
                                                    {getStatusIcon(file.status)}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center space-x-1 flex-shrink-0">
                                                    <Button size="sm" variant="ghost" onClick={() => handleViewFile(file)} className="w-8 h-8 p-0">
                                                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => handleDownloadFile(file)} className="w-8 h-8 p-0">
                                                        <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => handleMoveToFolder(file)} className="w-8 h-8 p-0">
                                                        <Move className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => handleTagFile(file)} className="w-8 h-8 p-0">
                                                        <TagIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => handleEditFile(file)} className="w-8 h-8 p-0">
                                                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => handleDeleteFile(file.id)} className="w-8 h-8 p-0">
                                                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </motion.div>
                                );
                            }).filter(Boolean)}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* View File Modal */}
            <AnimatePresence>
                {viewingFile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={() => setViewingFile(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 m-2 sm:m-4 max-w-4xl w-full max-h-[90vh] overflow-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {viewingFile.name}
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewingFile(null)}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* File Preview */}
                            <div className="mb-4">
                                {(viewingFile.fileType?.startsWith('image/') || viewingFile.fileType === 'image' || viewingFile.type?.startsWith('image/')) ? (
                                    <img
                                        src={viewingFile.preview || viewingFile.url || (viewingFile.backendData?.id ? `/api/media/download/${viewingFile.backendData.id}` : '')}
                                        alt={viewingFile.name}
                                        className="w-full max-h-96 object-contain rounded-lg"
                                        onError={(e) => {
                                            console.log('Image failed to load, trying fallback sources');
                                            // Try alternative sources
                                            if (viewingFile.backendData?.id) {
                                                e.target.src = `/api/media/download/${viewingFile.backendData.id}`;
                                            } else {
                                                e.target.src = '/heritage_placeholder.jpg';
                                            }
                                        }}
                                        onLoad={() => {
                                            console.log('Image loaded successfully from:', viewingFile.preview || viewingFile.url || (viewingFile.backendData?.id ? `/api/media/download/${viewingFile.backendData.id}` : ''));
                                        }}
                                    />
                                ) : (viewingFile.fileType?.startsWith('video/') || viewingFile.fileType === 'video' || viewingFile.type?.startsWith('video/')) ? (
                                    <video
                                        controls
                                        className="w-full max-h-96 rounded-lg"
                                        src={viewingFile.preview || viewingFile.url || (viewingFile.backendData?.id ? `/api/media/download/${viewingFile.backendData.id}` : '')}
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                ) : (
                                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                        <File className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                        <p>Preview not available for this file type</p>
                                        <Button
                                            variant="outline"
                                            className="mt-4"
                                            onClick={() => {
                                                if (viewingFile.backendData?.id) {
                                                    window.open(`/api/media/download/${viewingFile.backendData.id}`, '_blank');
                                                }
                                            }}
                                        >
                                            Download File
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* File Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <div>
                                    <span className="font-medium">File Name:</span>
                                    <span className="ml-2">{viewingFile.name}</span>
                                </div>
                                <div>
                                    <span className="font-medium">File Size:</span>
                                    <span className="ml-2">{formatFileSize(viewingFile.size)}</span>
                                </div>
                                <div>
                                    <span className="font-medium">File Type:</span>
                                    <span className="ml-2">{viewingFile.fileType || 'Unknown'}</span>
                                </div>
                                <div>
                                    <span className="font-medium">Category:</span>
                                    <span className="ml-2">{viewingFile.category || 'Uncategorized'}</span>
                                </div>
                                {viewingFile.description && (
                                    <div className="md:col-span-2">
                                        <span className="font-medium">Description:</span>
                                        <span className="ml-2">{viewingFile.description}</span>
                                    </div>
                                )}
                                {viewingFile.uploadedAt && (
                                    <div>
                                        <span className="font-medium">Uploaded:</span>
                                        <span className="ml-2">{formatDate(viewingFile.uploadedAt)}</span>
                                    </div>
                                )}
                                {viewingFile.uploadedBy && (
                                    <div>
                                        <span className="font-medium">Uploaded By:</span>
                                        <span className="ml-2">{viewingFile.uploadedBy}</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit File Modal */}
            <AnimatePresence>
                {editingFile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={() => setEditingFile(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 m-2 sm:m-4 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-semibold mb-4">Edit File Details</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        id={`description-${editingFile.id}`}
                                        defaultValue={editingFile.description}
                                        placeholder="Add a description for this file..."
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Category
                                    </label>
                                    <select
                                        id={`category-${editingFile.id}`}
                                        defaultValue={editingFile.category}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    >
                                        {getCategoryOptions().map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    {editingFile.category && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {getCategoryOptions().find(opt => opt.value === editingFile.category)?.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 mt-6">
                                <Button variant="outline" onClick={() => setEditingFile(null)}>
                                    Cancel
                                </Button>
                                <Button onClick={() => {
                                    const description = document.querySelector(`#description-${editingFile.id}`)?.value || editingFile.description;
                                    const category = document.querySelector(`#category-${editingFile.id}`)?.value || editingFile.category;

                                    handleUpdateFile(editingFile.id, {
                                        description,
                                        category
                                    });
                                }}>
                                    Save Changes
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tag File Modal */}
            <AnimatePresence>
                {taggingFile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={() => setTaggingFile(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 m-2 sm:m-4 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-semibold mb-4">Add Tags to File</h3>

                            <div className="mb-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    File: <span className="font-medium">{taggingFile.name}</span>
                                </p>

                                {/* Display existing tags */}
                                {taggingFile.tags && taggingFile.tags.length > 0 && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Current Tags:
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {taggingFile.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                >
                                                    {tag}
                                                    <button
                                                        onClick={() => handleRemoveTag(taggingFile, tag)}
                                                        className="ml-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Add New Tag
                                    </label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            placeholder="Enter tag name..."
                                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && newTag.trim()) {
                                                    handleAddTag(taggingFile, newTag.trim());
                                                }
                                            }}
                                        />
                                        <Button
                                            onClick={() => handleAddTag(taggingFile, newTag.trim())}
                                            disabled={!newTag.trim()}
                                            size="sm"
                                        >
                                            Add
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Press Enter or click Add to add the tag
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 mt-6">
                                <Button variant="outline" onClick={() => setTaggingFile(null)}>
                                    Done
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toast Notification */}
            <AnimatePresence>
                {toast.message && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-500 text-white' :
                            toast.type === 'error' ? 'bg-red-500 text-white' :
                                toast.type === 'warning' ? 'bg-yellow-500 text-white' :
                                    'bg-blue-500 text-white'
                            }`}
                    >
                        <div className="flex items-center space-x-2">
                            {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
                            {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                            {toast.type === 'warning' && <AlertCircle className="w-5 h-5" />}
                            <span className="font-medium">{toast.message}</span>
                        </div>
                        <button
                            onClick={() => setToast({ type: '', message: '' })}
                            className="absolute top-2 right-2 text-white hover:text-gray-200"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bulk Tag Modal */}
            <AnimatePresence>
                {bulkAction === 'tag' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={() => setBulkAction(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-lg p-6 m-4 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-semibold mb-4">Add Tags to Multiple Files</h3>

                            <div className="mb-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Adding tags to <span className="font-medium">{selectedFiles.size} selected file(s)</span>
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Tag to Add
                                    </label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            placeholder="Enter tag name..."
                                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && newTag.trim()) {
                                                    handleBulkAddTag(newTag.trim());
                                                }
                                            }}
                                        />
                                        <Button
                                            onClick={() => handleBulkAddTag(newTag.trim())}
                                            disabled={!newTag.trim()}
                                            size="sm"
                                        >
                                            Add to All
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        This tag will be added to all selected files
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 mt-6">
                                <Button variant="outline" onClick={() => setBulkAction(null)}>
                                    Cancel
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bulk Category Modal */}
            <AnimatePresence>
                {bulkAction === 'category' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={() => setBulkAction(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-lg p-6 m-4 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-semibold mb-4">Change Category for Multiple Files</h3>

                            <div className="mb-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Changing category for <span className="font-medium">{selectedFiles.size} selected file(s)</span>
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        New Category
                                    </label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        onChange={(e) => handleBulkCategorize(e.target.value)}
                                    >
                                        <option value="">Select category...</option>
                                        {getCategoryOptions().map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 mt-6">
                                <Button variant="outline" onClick={() => setBulkAction(null)}>
                                    Cancel
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bulk Move to Folder Modal */}
            <AnimatePresence>
                {bulkAction === 'move' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={() => setBulkAction(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-lg p-6 m-4 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-semibold mb-4">Move Files to Folder</h3>

                            <div className="mb-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Moving <span className="font-medium">{selectedFiles.size} selected file(s)</span> to a new folder
                                </p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Choose Destination Folder
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    onChange={(e) => setSelectedFolderId(e.target.value)}
                                >
                                    <option value="">Select folder...</option>
                                    {folders.map((folder) => (
                                        <option key={folder.id} value={folder.id}>
                                            {folder.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end space-x-2 mt-6">
                                <Button variant="outline" onClick={() => setBulkAction(null)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleBulkMoveToFolder}
                                    disabled={!selectedFolderId}
                                    className="flex items-center space-x-2"
                                >
                                    <Move className="w-4 h-4" />
                                    <span>Move Files</span>
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Move to Folder Modal */}
            <MoveToFolderModal
                isOpen={showMoveToFolderModal}
                onClose={() => setShowMoveToFolderModal(false)}
                mediaFile={fileToMove}
                siteId={siteId}
                onMoveSuccess={handleMoveToFolderSuccess}
                currentFolderId={fileToMove?.folderId}
                setToast={setToast}
            />
        </div>
    );
};

export default MediaUploadGallery;





