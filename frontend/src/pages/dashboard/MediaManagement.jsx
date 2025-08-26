import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Camera, Download, Share, Trash2, FolderPlus, Shield, Folder, X, Layout, LayoutGrid, Sidebar, ArrowUp, ArrowDown } from 'lucide-react';
import JSZip from 'jszip';

import MediaUploadGallery from '../../components/media/MediaUploadGallery';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import httpClient from '../../services/api/httpClient';
import { useAuth } from '../../contexts/AuthContext';
import FolderEditModal from '../../components/folders/FolderEditModal';
import FolderTreeView from '../../components/folders/FolderTreeView';

const MediaManagement = () => {
    const { siteId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();



    // State management
    const [siteData, setSiteData] = useState(null);
    const [mediaFiles, setMediaFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [validatingAccess, setValidatingAccess] = useState(false);
    const [exportingArchive, setExportingArchive] = useState(false);
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [showMoveFolderModal, setShowMoveFolderModal] = useState(false);
    const [folders, setFolders] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [folderToMove, setFolderToMove] = useState(null);
    const [showFolderTree, setShowFolderTree] = useState(true);
    // Add layout preference state
    const [folderLayout, setFolderLayout] = useState(() => {
        const saved = localStorage.getItem('folderLayout');
        return saved || 'sidebar'; // 'sidebar', 'top', 'bottom'
    });
    const [stats, setStats] = useState({
        totalFiles: 0,
        totalSize: 0,
        photos: 0,
        videos: 0,
        documents: 0
    });

    // Load site and media data
    useEffect(() => {
        if (!siteId) {
            console.error('No site ID provided to MediaManagement component');
            toast.error('No site ID provided. Please navigate from a valid site.');
            navigate('/dashboard');
            return;
        }

        // For Heritage Managers, ensure they can only access their assigned site
        if (user?.role === 'HERITAGE_MANAGER') {
            // Load user's assignment first to validate access (Heritage Managers should have exactly ONE site)
            console.log('👤 Heritage Manager detected, loading assignments first');
            loadUserAssignments();
        } else {
            // Non-Heritage Managers can proceed directly
            console.log('👤 Non-Heritage Manager, loading data directly');
            loadSiteData();
            loadMediaFiles();
            loadFolders();
        }
    }, [siteId, navigate, user]);

    // Save layout preference when it changes
    useEffect(() => {
        localStorage.setItem('folderLayout', folderLayout);
    }, [folderLayout]);

    // Debug: Log folders state changes and auto-expand parent folders
    useEffect(() => {
        console.log('📁 Folders state updated:', folders);
        console.log('📁 Folders count:', folders.length);
        if (folders.length > 0) {
            console.log('📁 First folder structure:', folders[0]);
            // Check if we have children
            const hasChildren = folders.some(folder => folder.children && folder.children.length > 0);
            console.log('📁 Has children:', hasChildren);

            // Auto-expand parent folder if a subfolder was just created
            const expandParentId = localStorage.getItem('expandParentFolder');
            if (expandParentId) {
                console.log('🔍 Auto-expanding parent folder:', expandParentId);
                // Clear the stored ID
                localStorage.removeItem('expandParentFolder');

                // Find and expand the parent folder
                const expandParentFolder = (folderList, parentId) => {
                    for (const folder of folderList) {
                        if (folder.id == parentId) {
                            // This is the parent folder, expand it
                            console.log('✅ Found parent folder, expanding:', folder.name);
                            // We'll need to communicate with FolderTreeView to expand this folder
                            // For now, we'll add a flag to the folder data
                            folder._shouldExpand = true;
                            return true;
                        }
                        if (folder.children && folder.children.length > 0) {
                            if (expandParentFolder(folder.children, parentId)) {
                                return true;
                            }
                        }
                    }
                    return false;
                };

                expandParentFolder(folders, expandParentId);
            }
        }
    }, [folders]);



    // Load user assignments for Heritage Managers
    const loadUserAssignments = async () => {
        try {
            setValidatingAccess(true);

            // Use the correct endpoint URL
            const response = await httpClient.get('/api/heritage-site-manager/my-sites');
            console.log('API response:', response);

            let assignedSites = [];
            if (response && response.data) {
                assignedSites = response.data;
            } else if (response && Array.isArray(response)) {
                assignedSites = response;
            } else {
                assignedSites = [];
            }

            console.log('Assigned sites:', assignedSites);

            if (assignedSites.length === 0) {
                console.error('No site assignment found for Heritage Manager');
                toast.error('No site assignment found. Please contact your administrator.');
                navigate('/dashboard');
                return;
            }

            // Heritage Managers should only have ONE assigned site
            if (assignedSites.length > 1) {
                console.warn(`Heritage Manager ${user.email} has ${assignedSites.length} site assignments - this is unexpected`);
                toast.warn('Multiple site assignments detected. Please contact your administrator.');
            }

            // Check if user can access the requested site
            const canAccessSite = assignedSites.some(site => {
                // The DTO returns heritageSiteId directly, not nested under heritageSite.id
                const siteIdFromAssignment = site.heritageSiteId || site.id;
                console.log('Comparing site ID from assignment:', siteIdFromAssignment, 'with requested site ID:', siteId);
                return siteIdFromAssignment === parseInt(siteId);
            });

            if (!canAccessSite) {
                console.error(`Heritage Manager ${user.email} cannot access site ${siteId}`);
                console.log('Assigned site:', assignedSites[0]); // Show the assigned site
                toast.error(`Access denied: You are not assigned to this site. Please use the Quick Actions from your dashboard.`);
                navigate('/dashboard');
                return;
            }

            console.log(`Heritage Manager ${user.email} successfully validated access to their assigned site ${siteId}`);
            // Now load the site data and media
            console.log('🚀 Loading site data, media, and folders for Heritage Manager');
            loadSiteData();
            loadMediaFiles();
            loadFolders();
        } catch (error) {
            console.error('Failed to validate site access:', error);
            toast.error('Failed to validate site access. Please try again.');
            navigate('/dashboard');
        } finally {
            setValidatingAccess(false);
        }
    };

    const loadSiteData = async () => {
        try {
            console.log('Loading site data for siteId:', siteId);
            console.log('Current user should only access their assigned site');

            // Use httpClient for authenticated API call
            const response = await httpClient.get(`/api/heritage-sites/${siteId}`);
            setSiteData(response);
            console.log('Site data loaded successfully:', response);
        } catch (error) {
            console.error('Failed to load site:', error);

            if (error.response?.status === 403) {
                toast.error(`Access denied: You are not assigned to this site. Please use the Quick Actions from your dashboard.`);
                // Redirect back to dashboard since user can't access this site
                navigate('/dashboard');
            } else {
                toast.error('Failed to load site data');
            }
        }
    };

    const loadMediaFiles = async () => {
        try {
            setLoading(true);
            console.log('Loading media files for siteId:', siteId);

            // Use httpClient for authenticated API call
            const response = await httpClient.get(`/api/heritage-sites/${siteId}/media`);

            // httpClient.get() returns the data directly, not wrapped in a response object
            const mediaData = response || [];

            // Ensure mediaData is an array and has the expected structure
            if (!Array.isArray(mediaData)) {
                console.warn('Media data is not an array:', mediaData);
                setMediaFiles([]);
                setStats({
                    totalFiles: 0,
                    totalSize: 0,
                    photos: 0,
                    videos: 0,
                    documents: 0
                });
                return;
            }

            setMediaFiles(mediaData);

            // Calculate stats from real data with null checks
            const newStats = {
                totalFiles: mediaData.length,
                totalSize: mediaData.reduce((total, file) => total + (file?.fileSize || 0), 0),
                photos: mediaData.filter(f => f?.category === 'photos').length,
                videos: mediaData.filter(f => f?.category === 'videos').length,
                documents: mediaData.filter(f => f?.category === 'documents').length
            };

            setStats(newStats);

        } catch (error) {
            console.error('Failed to load media files:', error);

            if (error.response?.status === 403) {
                toast.error(`Access denied: You are not assigned to this site. Please use the Quick Actions from your dashboard.`);
                // Redirect back to dashboard since user can't access this site
                navigate('/dashboard');
            } else {
                toast.error('Failed to load media files');
            }
        } finally {
            setLoading(false);
        }
    };

    // Load media files for a specific folder
    const loadMediaFilesForFolder = async (folderId) => {
        try {
            setLoading(true);
            console.log('Loading media files for folderId:', folderId);

            // For now, we'll filter from existing media files
            // In the future, you can implement a backend endpoint to get media by folder
            const response = await httpClient.get(`/api/heritage-sites/${siteId}/media`);
            const allMediaData = response || [];

            // Filter media files by folder (assuming media has a folderId property)
            // Note: This requires the backend to support folder-based media filtering
            const folderMedia = allMediaData.filter(file => file.folderId === folderId);

            setMediaFiles(folderMedia);

            // Update statistics for the folder
            const newStats = {
                totalFiles: folderMedia.length,
                totalSize: folderMedia.reduce((total, file) => total + (file?.fileSize || 0), 0),
                photos: folderMedia.filter(f => f?.category === 'photos').length,
                videos: folderMedia.filter(f => f?.category === 'videos').length,
                documents: folderMedia.filter(f => f?.category === 'documents').length
            };

            setStats(newStats);

            console.log(`Filtered ${folderMedia.length} files for folder ${folderId}`);

        } catch (error) {
            console.error('Failed to load folder media files:', error);
            toast.error('Failed to load folder media files');
        } finally {
            setLoading(false);
        }
    };

    // Handle media upload
    const handleMediaUpload = async (files) => {
        try {
            console.log('Uploading media files:', files);

            // In real app, this would upload to API
            // const uploadedFiles = await mediaApi.uploadFiles(siteId, files);

            // Check if files were uploaded to a specific folder
            const hasFolderInfo = files.some(file => file.folderId && file.folderName);

            if (hasFolderInfo) {
                const folderName = files[0].folderName;
                toast.success(`${files.length} files uploaded to "${folderName}" folder successfully`);

                // If we're viewing a specific folder, refresh the folder view
                if (selectedFolder && files[0].folderId === selectedFolder.id) {
                    await loadMediaFilesForFolder(selectedFolder.id);
                }
            } else {
                toast.success(`${files.length} files uploaded successfully`);
            }

            setMediaFiles(files);

            // Refresh stats
            await loadMediaFiles();
        } catch (error) {
            console.error('Failed to upload files:', error);
            toast.error('Failed to upload files');
        }
    };

    // Handle media changes
    const handleMediaChange = (updatedFiles) => {
        if (!Array.isArray(updatedFiles)) {
            console.warn('handleMediaChange received non-array:', updatedFiles);
            return;
        }

        setMediaFiles(updatedFiles);

        // Update stats with null checks
        const newStats = {
            totalFiles: updatedFiles.length,
            totalSize: updatedFiles.reduce((total, file) => total + (file?.fileSize || 0), 0),
            photos: updatedFiles.filter(f => f?.category === 'photos').length,
            videos: updatedFiles.filter(f => f?.category === 'videos').length,
            documents: updatedFiles.filter(f => f?.category === 'documents').length
        };
        setStats(newStats);
    };

    // Handle export archive (ZIP download)
    const handleExportArchive = async () => {
        try {
            if (!mediaFiles || mediaFiles.length === 0) {
                toast.error('No media files to export');
                return;
            }

            setExportingArchive(true);
            toast.loading('Creating archive...', { duration: 2000 });

            // Create a new ZIP file
            const zip = new JSZip();

            // Create folders for different media types
            const photosFolder = zip.folder('Photos');
            const videosFolder = zip.folder('Videos');
            const documentsFolder = zip.folder('Documents');
            const otherFolder = zip.folder('Other');

            // Track progress
            let processedFiles = 0;
            const totalFiles = mediaFiles.length;

            // Process each media file
            for (const file of mediaFiles) {
                try {
                    // Determine file type and folder
                    let targetFolder;
                    let fileExtension = '';

                    if (file.fileType) {
                        if (file.fileType.startsWith('image/')) {
                            targetFolder = photosFolder;
                            fileExtension = file.fileName?.split('.').pop() || 'jpg';
                        } else if (file.fileType.startsWith('video/')) {
                            targetFolder = videosFolder;
                            fileExtension = file.fileName?.split('.').pop() || 'mp4';
                        } else if (file.fileType.includes('pdf') || file.fileType.includes('document')) {
                            targetFolder = documentsFolder;
                            fileExtension = file.fileName?.split('.').pop() || 'pdf';
                        } else {
                            targetFolder = otherFolder;
                            fileExtension = file.fileName?.split('.').pop() || 'file';
                        }
                    } else {
                        // Fallback based on category
                        if (file.category === 'photos') {
                            targetFolder = photosFolder;
                            fileExtension = 'jpg';
                        } else if (file.category === 'videos') {
                            targetFolder = videosFolder;
                            fileExtension = 'mp4';
                        } else if (file.category === 'documents') {
                            targetFolder = documentsFolder;
                            fileExtension = 'pdf';
                        } else {
                            targetFolder = otherFolder;
                            fileExtension = 'file';
                        }
                    }

                    // Generate filename with metadata
                    const fileName = file.fileName || file.name || `file_${file.id}`;
                    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
                    const finalFileName = `${cleanFileName}.${fileExtension}`;

                    // Download file content
                    const response = await fetch(`/api/media/download/${file.id}`);
                    if (response.ok) {
                        const blob = await response.blob();

                        // Add file to ZIP with metadata
                        const filePath = `${finalFileName}`;
                        targetFolder.file(filePath, blob);

                        // Add metadata file
                        const metadata = {
                            id: file.id,
                            fileName: file.fileName || file.name,
                            fileType: file.fileType,
                            category: file.category,
                            description: file.description || '',
                            dateTaken: file.dateTaken || '',
                            photographer: file.photographer || '',
                            uploadedBy: file.uploadedBy || file.uploaderUsername || '',
                            uploadedAt: file.uploadedAt || file.createdDate || '',
                            tags: file.tags || [],
                            fileSize: file.fileSize || file.size || 0
                        };

                        const metadataFileName = `${cleanFileName}_metadata.json`;
                        targetFolder.file(metadataFileName, JSON.stringify(metadata, null, 2));
                    }

                    processedFiles++;

                    // Update progress
                    if (processedFiles % 5 === 0 || processedFiles === totalFiles) {
                        toast.loading(`Processing files... ${processedFiles}/${totalFiles}`, { duration: 1000 });
                    }

                } catch (fileError) {
                    console.warn(`Failed to process file ${file.id}:`, fileError);
                    // Continue with other files
                }
            }

            // Add site information
            const siteInfo = {
                siteName: siteData?.nameEn || siteData?.nameRw || siteData?.nameFr || 'Heritage Site',
                siteId: siteId,
                exportDate: new Date().toISOString(),
                totalFiles: totalFiles,
                exportedBy: user?.email || 'Unknown',
                fileBreakdown: {
                    photos: mediaFiles.filter(f => f.category === 'photos' || f.fileType?.startsWith('image/')).length,
                    videos: mediaFiles.filter(f => f.category === 'videos' || f.fileType?.startsWith('video/')).length,
                    documents: mediaFiles.filter(f => f.category === 'documents' || f.fileType?.includes('pdf')).length,
                    other: mediaFiles.filter(f => !['photos', 'videos', 'documents'].includes(f.category) && !f.fileType?.startsWith('image/') && !f.fileType?.startsWith('video/') && !f.fileType?.includes('pdf')).length
                }
            };

            zip.file('site_info.json', JSON.stringify(siteInfo, null, 2));
            zip.file('README.txt', `Heritage Site Media Archive

Site: ${siteInfo.siteName}
Exported: ${new Date(siteInfo.exportDate).toLocaleString()}
Total Files: ${siteInfo.totalFiles}

This archive contains all media files for the heritage site, organized by type:
- Photos/: Image files (JPG, PNG, etc.)
- Videos/: Video files (MP4, MOV, etc.)
- Documents/: PDF and document files
- Other/: Other file types

Each file includes a metadata JSON file with additional information.
`);

            // Generate and download ZIP
            toast.loading('Generating ZIP file...', { duration: 2000 });

            const zipBlob = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 6 }
            });

            // Create download link
            const url = URL.createObjectURL(zipBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `heritage_site_${siteId}_media_${new Date().toISOString().split('T')[0]}.zip`;

            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Cleanup
            URL.revokeObjectURL(url);

            toast.success(`Archive exported successfully! ${totalFiles} files included.`);

        } catch (error) {
            console.error('Error creating archive:', error);
            toast.error('Failed to create archive. Please try again.');
        } finally {
            setExportingArchive(false);
        }
    };

    // Handle bulk share
    const handleBulkShare = () => {
        // In real app, this would generate shareable links
        navigator.clipboard.writeText(`${window.location.origin}/dashboard/sites/${siteId}/media`);
        toast.success('Media gallery link copied to clipboard');
    };

    // Folder management functions
    const handleCreateFolder = () => {
        setSelectedFolder(null); // Clear any selected folder for new folder creation
        setShowFolderModal(true);
    };

    const handleCreateSubfolder = (parentFolder) => {
        console.log('🎯 Creating subfolder under:', parentFolder);
        console.log('👨‍👦 Parent folder details:', {
            id: parentFolder.id,
            name: parentFolder.name,
            type: parentFolder.type,
            hasChildren: parentFolder.children && parentFolder.children.length > 0
        });

        // Create a new subfolder under the parent folder
        const subfolderData = {
            id: null, // New folder, no ID
            name: '', // Empty name for new folder
            description: '', // Empty description
            type: 'General', // Default type
            parentId: parentFolder.id, // Set parent ID
            parentName: parentFolder.name, // Store parent name for reference
            isSubfolder: true // Flag to indicate this is a subfolder creation
        };
        console.log('📁 Subfolder data:', subfolderData);
        setSelectedFolder(subfolderData);
        setShowFolderModal(true);
    };

    const handleFolderSave = (folder) => {
        console.log('💾 Folder save called with:', folder);
        console.log('🔍 Is subfolder?', folder.isSubfolder);
        console.log('👨‍👦 Parent ID:', folder.parentId);
        console.log('👨‍👦 Parent Name:', folder.parentName);

        if (folder.isSubfolder) {
            toast.success(`Subfolder "${folder.name}" created successfully under "${folder.parentName || 'parent folder'}"`);
            // Store the parent folder ID to expand it after refresh
            localStorage.setItem('expandParentFolder', folder.parentId);
        } else {
            toast.success(`Folder "${folder.name}" saved successfully`);
        }
        // Refresh folder list after creation/update
        loadFolders();
    };

    const handleFolderModalClose = () => {
        setShowFolderModal(false);
        setSelectedFolder(null); // Clear selected folder when modal closes

        // Refresh folders when modal closes to ensure we have the latest data
        // This is especially important for subfolders
        setTimeout(() => {
            loadFolders();
        }, 100);
    };

    // Load folders for the site
    const loadFolders = async () => {
        try {
            console.log('🔍 Loading folders for siteId:', siteId);
            // Use the tree endpoint to get hierarchical folder structure
            const response = await httpClient.get(`/api/folders/tree`, { siteId });
            console.log('📁 Tree API Response:', response);

            if (response && Array.isArray(response)) {
                console.log('✅ Tree response is array, setting folders:', response);
                setFolders(response);
            } else if (response && response.data && Array.isArray(response.data)) {
                console.log('✅ Tree response has data array, setting folders:', response.data);
                setFolders(response.data);
            } else {
                console.log('⚠️ Tree response format unexpected:', response);
                setFolders([]);
            }
        } catch (error) {
            console.error('❌ Error loading folder tree:', error);
            // Fallback to flat structure if tree endpoint fails
            try {
                console.log('🔄 Falling back to flat folder structure...');
                const fallbackResponse = await httpClient.get(`/api/folders/site/${siteId}`);
                console.log('📁 Fallback API Response:', fallbackResponse);

                let flatFolders = [];
                if (fallbackResponse && Array.isArray(fallbackResponse)) {
                    flatFolders = fallbackResponse;
                } else if (fallbackResponse && fallbackResponse.data && Array.isArray(fallbackResponse.data)) {
                    flatFolders = fallbackResponse.data;
                } else if (fallbackResponse && fallbackResponse.data && fallbackResponse.data.items && Array.isArray(fallbackResponse.data.items)) {
                    flatFolders = fallbackResponse.data.items;
                }

                // Convert flat structure to hierarchical tree
                const treeStructure = convertFlatToTree(flatFolders);
                console.log('🌳 Converted to tree structure:', treeStructure);
                setFolders(treeStructure);
            } catch (fallbackError) {
                console.error('❌ Fallback also failed:', fallbackError);
                setFolders([]);
            }
        }
    };

    // Handle folder selection
    const handleFolderSelect = (folder) => {
        setSelectedFolder(folder);
        console.log('Selected folder:', folder);

        // Filter media files by selected folder
        if (folder) {
            // Load media files for the specific folder
            loadMediaFilesForFolder(folder.id);
        } else {
            // If no folder selected, show all media files
            loadMediaFiles();
        }
    };

    // Handle folder operations
    const handleFolderEdit = (folder) => {
        // Set the folder to edit and open modal
        setSelectedFolder(folder);
        setShowFolderModal(true);
    };

    const handleFolderDelete = async (folder) => {
        if (window.confirm(`Are you sure you want to delete the folder "${folder.name}"? This action cannot be undone.`)) {
            try {
                await httpClient.delete(`/api/folders/${folder.id}`);
                toast.success(`Folder "${folder.name}" deleted successfully`);
                loadFolders(); // Refresh folder list

                // Clear selection if deleted folder was selected
                if (selectedFolder?.id === folder.id) {
                    setSelectedFolder(null);
                }
            } catch (error) {
                console.error('Error deleting folder:', error);
                toast.error('Failed to delete folder');
            }
        }
    };

    const handleFolderMove = (folder) => {
        setFolderToMove(folder);
        setShowMoveFolderModal(true);
    };

    const handleFolderMoveConfirm = async (newParentId) => {
        if (!folderToMove) return;

        try {
            await httpClient.post(`/api/folders/${folderToMove.id}/move`, { parentId: newParentId });
            toast.success(`Folder "${folderToMove.name}" moved successfully`);
            loadFolders(); // Refresh folder list
            setShowMoveFolderModal(false);
            setFolderToMove(null);
        } catch (error) {
            console.error('Error moving folder:', error);
            toast.error('Failed to move folder');
        }
    };

    const handleFolderMoveCancel = () => {
        setShowMoveFolderModal(false);
        setFolderToMove(null);
    };

    // Convert flat folder list to hierarchical tree structure
    const convertFlatToTree = (flatFolders) => {
        if (!Array.isArray(flatFolders)) return [];

        const folderMap = new Map();
        const rootFolders = [];

        // First pass: create a map of all folders
        flatFolders.forEach(folder => {
            folderMap.set(folder.id, { ...folder, children: [] });
        });

        // Second pass: build the tree structure
        flatFolders.forEach(folder => {
            const folderWithChildren = folderMap.get(folder.id);

            if (folder.parentId) {
                // This is a child folder
                const parent = folderMap.get(folder.parentId);
                if (parent) {
                    parent.children.push(folderWithChildren);
                }
            } else {
                // This is a root folder
                rootFolders.push(folderWithChildren);
            }
        });

        return rootFolders;
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Navigation helpers
    const goBack = () => {
        if (siteId) {
            navigate(`/dashboard/sites/${siteId}/edit`);
        } else {
            navigate('/dashboard');
        }
    };

    const goToSiteView = () => {
        if (siteId) {
            navigate(`/dashboard/sites/${siteId}`);
        }
    };

    if (validatingAccess) {
        return (
            <Card>
                <CardContent className="p-8">
                    <div className="flex items-center justify-center space-x-3">
                        <Shield className="w-6 h-6 animate-pulse text-blue-500" />
                        <span className="text-lg">Validating site access...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="p-8">
                    <div className="flex items-center justify-center space-x-3">
                        <Camera className="w-6 h-6 animate-pulse text-blue-500" />
                        <span className="text-lg">Loading media gallery...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Simple header for single site media management */}
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        Media Management
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                        Managing media for your assigned heritage site: {siteData?.nameEn || siteData?.nameRw || siteData?.nameFr || 'Heritage Site'}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={handleExportArchive}
                        disabled={exportingArchive}
                        className="flex items-center space-x-2 text-xs sm:text-sm"
                    >
                        {exportingArchive ? (
                            <>
                                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="hidden sm:inline">Creating Archive...</span>
                                <span className="sm:hidden">Creating...</span>
                            </>
                        ) : (
                            <>
                                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Export Archive (ZIP)</span>
                                <span className="sm:hidden">Export</span>
                            </>
                        )}
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handleBulkShare}
                        className="flex items-center space-x-2 text-xs sm:text-sm"
                    >
                        <Share className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Share Gallery</span>
                        <span className="sm:hidden">Share</span>
                    </Button>

                    {siteId && (
                        <Button
                            variant="outline"
                            onClick={goToSiteView}
                            className="flex items-center space-x-2 text-xs sm:text-sm"
                        >
                            <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">View Site</span>
                            <span className="sm:hidden">View</span>
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        onClick={goBack}
                        className="flex items-center space-x-2 text-xs sm:text-sm"
                    >
                        <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Back to Dashboard</span>
                        <span className="sm:hidden">Back</span>
                    </Button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search media files..."
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        onChange={(e) => console.log('Media search:', e.target.value)}
                    />
                </div>
            </div>
            {/* Media Statistics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6">
                <Card>
                    <CardContent className="p-3 sm:p-6">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Files</p>
                                <p className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.totalFiles}</p>
                            </div>
                            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                <Camera className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-3 sm:p-6">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Size</p>
                                <p className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">{formatFileSize(stats.totalSize)}</p>
                            </div>
                            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                <Download className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-3 sm:p-6">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Photos</p>
                                <p className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.photos}</p>
                            </div>
                            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                                <Camera className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Videos</p>
                                <p className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.videos}</p>
                            </div>
                            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                                <Camera className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Layout Toggle Controls */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mt-6 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-2">
                        <Layout className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Folder Layout</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Choose how folders are positioned relative to the media gallery</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-gray-700 rounded-lg p-1 shadow-sm">
                        <Button
                            variant={folderLayout === 'sidebar' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setFolderLayout('sidebar')}
                            className="flex items-center space-x-2 px-2 sm:px-3 py-2 text-xs"
                            title="Sidebar Layout - Folders on the left side"
                        >
                            <Sidebar className="w-4 h-4" />
                            <span className="hidden sm:inline">Sidebar</span>
                        </Button>
                        <Button
                            variant={folderLayout === 'top' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setFolderLayout('top')}
                            className="flex items-center space-x-2 px-2 sm:px-3 py-2 text-xs"
                            title="Top Layout - Folders above media gallery"
                        >
                            <ArrowUp className="w-4 h-4" />
                            <span className="hidden sm:inline">Top</span>
                        </Button>
                        <Button
                            variant={folderLayout === 'bottom' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setFolderLayout('bottom')}
                            className="flex items-center space-x-2 px-2 sm:px-3 py-2 text-xs"
                            title="Bottom Layout - Folders below media gallery"
                        >
                            <ArrowDown className="w-4 h-4" />
                            <span className="hidden sm:inline">Bottom</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Dynamic Layout: Folders + Media Gallery */}
            {folderLayout === 'sidebar' && (
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6 animate-in slide-in-from-left-2 duration-300">
                    {/* Folder Sidebar */}
                    <div className="xl:col-span-1 order-2 xl:order-1">
                        <Card className="h-fit">
                            <CardHeader className="p-3 sm:p-6">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base sm:text-lg">📁 Folders</CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowFolderTree(!showFolderTree)}
                                        className="text-gray-500 hover:text-gray-700 p-1 sm:p-2"
                                    >
                                        {showFolderTree ? '−' : '+'}
                                    </Button>
                                </div>
                            </CardHeader>
                            {showFolderTree && (
                                <CardContent className="p-3 sm:p-6">
                                    <div className="space-y-3 sm:space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                                {folders.length > 0
                                                    ? `${folders.length} folder${folders.length !== 1 ? 's' : ''}`
                                                    : 'No folders'
                                                }
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleCreateFolder}
                                                className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                                            >
                                                <FolderPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                                New
                                            </Button>
                                        </div>

                                        {folders.length > 0 ? (
                                            <div className="max-h-64 sm:max-h-96 overflow-y-auto">
                                                <FolderTreeView
                                                    folders={folders}
                                                    onFolderSelect={handleFolderSelect}
                                                    onFolderEdit={handleFolderEdit}
                                                    onFolderDelete={handleFolderDelete}
                                                    onFolderMove={handleFolderMove}
                                                    onAddFolder={handleCreateFolder}
                                                    onAddSubfolder={handleCreateSubfolder}
                                                    selectedFolderId={selectedFolder?.id}
                                                    className="border-0 shadow-none bg-transparent"
                                                />
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 sm:py-6 text-gray-500 dark:text-gray-400">
                                                <FolderPlus className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
                                                <p className="text-xs sm:text-sm mb-2 sm:mb-3">No folders yet</p>
                                                <p className="text-xs text-gray-400">Use the "New" button above or Quick Actions below to create your first folder</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    </div>

                    {/* Media Gallery - Takes remaining space */}
                    <div className="xl:col-span-3 order-1 xl:order-2">
                        {selectedFolder && (
                            <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-200">
                                            📁 Viewing: {selectedFolder.name}
                                        </span>
                                        <span className="text-xs text-blue-600 dark:text-blue-400">
                                            ({selectedFolder.type})
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedFolder(null);
                                            loadMediaFiles(); // Load all media files when clearing selection
                                        }}
                                        className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                                    >
                                        Clear Selection
                                    </Button>
                                </div>
                                {selectedFolder.description && (
                                    <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mt-1">
                                        {selectedFolder.description}
                                    </p>
                                )}
                            </div>
                        )}

                        <MediaUploadGallery
                            siteId={siteId}
                            value={mediaFiles || []}
                            onChange={handleMediaChange}
                            onUpload={handleMediaUpload}
                            maxFiles={100}
                            maxSize={100 * 1024 * 1024} // 100MB
                            selectedFolderId={selectedFolder?.id}
                        />
                    </div>
                </div>
            )}

            {/* Top Layout: Folders above Media Gallery */}
            {folderLayout === 'top' && (
                <div className="space-y-4 sm:space-y-6 animate-in slide-in-from-top-2 duration-300">
                    {/* Folders Section */}
                    <Card>
                        <CardHeader className="p-3 sm:p-6">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base sm:text-lg">📁 Folders</CardTitle>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowFolderTree(!showFolderTree)}
                                        className="text-gray-500 hover:text-gray-700 p-1 sm:p-2"
                                    >
                                        {showFolderTree ? '−' : '+'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCreateFolder}
                                        className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                                    >
                                        <FolderPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                        New
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        {showFolderTree && (
                            <CardContent className="p-3 sm:p-6">
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        {folders.length > 0
                                            ? `${folders.length} folder${folders.length !== 1 ? 's' : ''}`
                                            : 'No folders'
                                        }
                                    </div>

                                    {folders.length > 0 ? (
                                        <div className="max-h-48 sm:max-h-64 overflow-y-auto">
                                            <FolderTreeView
                                                folders={folders}
                                                onFolderSelect={handleFolderSelect}
                                                onFolderEdit={handleFolderEdit}
                                                onFolderDelete={handleFolderDelete}
                                                onFolderMove={handleFolderMove}
                                                onAddFolder={handleCreateFolder}
                                                onAddSubfolder={handleCreateSubfolder}
                                                selectedFolderId={selectedFolder?.id}
                                                className="border-0 shadow-none bg-transparent"
                                            />
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 sm:py-6 text-gray-500 dark:text-gray-400">
                                            <FolderPlus className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-xs sm:text-sm mb-2 sm:mb-3">No folders yet</p>
                                            <p className="text-xs text-gray-400">Use the "New" button above or Quick Actions below to create your first folder</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        )}
                    </Card>

                    {/* Media Gallery Section */}
                    <div>
                        {selectedFolder && (
                            <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-200">
                                            📁 Viewing: {selectedFolder.name}
                                        </span>
                                        <span className="text-xs text-blue-600 dark:text-blue-400">
                                            ({selectedFolder.type})
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedFolder(null);
                                            loadMediaFiles(); // Load all media files when clearing selection
                                        }}
                                        className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                                    >
                                        Clear Selection
                                    </Button>
                                </div>
                                {selectedFolder.description && (
                                    <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mt-1">
                                        {selectedFolder.description}
                                    </p>
                                )}
                            </div>
                        )}

                        <MediaUploadGallery
                            siteId={siteId}
                            value={mediaFiles || []}
                            onChange={handleMediaChange}
                            onUpload={handleMediaUpload}
                            maxFiles={100}
                            maxSize={100 * 1024 * 1024} // 100MB
                            selectedFolderId={selectedFolder?.id}
                        />
                    </div>
                </div>
            )}

            {/* Bottom Layout: Folders below Media Gallery */}
            {folderLayout === 'bottom' && (
                <div className="space-y-4 sm:space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                    {/* Media Gallery Section */}
                    <div>
                        {selectedFolder && (
                            <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-200">
                                            📁 Viewing: {selectedFolder.name}
                                        </span>
                                        <span className="text-xs text-blue-600 dark:text-blue-400">
                                            ({selectedFolder.type})
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedFolder(null);
                                            loadMediaFiles(); // Load all media files when clearing selection
                                        }}
                                        className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                                    >
                                        Clear Selection
                                    </Button>
                                </div>
                                {selectedFolder.description && (
                                    <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mt-1">
                                        {selectedFolder.description}
                                    </p>
                                )}
                            </div>
                        )}

                        <MediaUploadGallery
                            siteId={siteId}
                            value={mediaFiles || []}
                            onChange={handleMediaChange}
                            onUpload={handleMediaUpload}
                            maxFiles={100}
                            maxSize={100 * 1024 * 1024} // 100MB
                            selectedFolderId={selectedFolder?.id}
                        />
                    </div>

                    {/* Folders Section */}
                    <Card>
                        <CardHeader className="p-3 sm:p-6">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base sm:text-lg">📁 Folders</CardTitle>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowFolderTree(!showFolderTree)}
                                        className="text-gray-500 hover:text-gray-700 p-1 sm:p-2"
                                    >
                                        {showFolderTree ? '−' : '+'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCreateFolder}
                                        className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                                    >
                                        <FolderPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                        New
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        {showFolderTree && (
                            <CardContent className="p-3 sm:p-6">
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        {folders.length > 0
                                            ? `${folders.length} folder${folders.length !== 1 ? 's' : ''}`
                                            : 'No folders'
                                        }
                                    </div>

                                    {folders.length > 0 ? (
                                        <div className="max-h-48 sm:max-h-64 overflow-y-auto">
                                            <FolderTreeView
                                                folders={folders}
                                                onFolderSelect={handleFolderSelect}
                                                onFolderEdit={handleFolderEdit}
                                                onFolderDelete={handleFolderDelete}
                                                onFolderMove={handleFolderMove}
                                                onAddFolder={handleCreateFolder}
                                                onAddSubfolder={handleCreateSubfolder}
                                                selectedFolderId={selectedFolder?.id}
                                                className="border-0 shadow-none bg-transparent"
                                            />
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 sm:py-6 text-gray-500 dark:text-gray-400">
                                            <FolderPlus className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-xs sm:text-sm mb-2 sm:mb-3">No folders yet</p>
                                            <p className="text-xs text-gray-400">Use the "New" button above or Quick Actions below to create your first folder</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        )}
                    </Card>
                </div>
            )}

            {/* Quick Actions */}
            <Card className="mt-6">
                <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <Button
                            variant="outline"
                            className="flex items-center space-x-2 h-auto p-3 sm:p-4"
                            onClick={() => setShowFolderModal(true)}
                        >
                            <FolderPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                            <div className="text-left">
                                <div className="font-medium text-sm sm:text-base">Create Folder</div>
                                <div className="text-xs sm:text-sm text-gray-500">Organize media files into folders</div>
                            </div>
                        </Button>
                        <Button
                            variant="outline"
                            className="flex items-center space-x-2 h-auto p-3 sm:p-4"
                            onClick={() => setShowFolderTree(!showFolderTree)}
                        >
                            <Folder className="w-4 h-4 sm:w-5 sm:h-5" />
                            <div className="text-left">
                                <div className="font-medium text-sm sm:text-base">{showFolderTree ? 'Hide' : 'Show'} Folders</div>
                                <div className="text-xs sm:text-sm text-gray-500">
                                    {showFolderTree ? 'Hide folder tree view' : 'Show folder tree view'}
                                    <span className="block text-blue-600 dark:text-blue-400">Current: {folderLayout === 'sidebar' ? 'Sidebar' : folderLayout === 'top' ? 'Top' : 'Bottom'}</span>
                                </div>
                            </div>
                        </Button>
                        <Button
                            variant="outline"
                            className="flex items-center space-x-2 h-auto p-3 sm:p-4"
                            onClick={() => {
                                if (folders.length > 0) {
                                    setFolderToMove(folders[0]);
                                    setShowMoveFolderModal(true);
                                } else {
                                    toast.info('No folders available to move. Create a folder first.');
                                }
                            }}
                        >
                            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                            <div className="text-left">
                                <div className="font-medium text-sm sm:text-base">Move Folder</div>
                                <div className="text-xs sm:text-sm text-gray-500">Reorganize folder structure</div>
                            </div>
                        </Button>
                        <Button
                            variant="outline"
                            className="flex items-center space-x-2 h-auto p-3 sm:p-4 sm:col-span-2 lg:col-span-1"
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 rotate-90" />
                            <div className="text-left">
                                <div className="font-medium text-sm sm:text-base">Back to Top</div>
                                <div className="text-xs sm:text-sm text-gray-500">Return to the top of the page</div>
                            </div>
                        </Button>
                    </div>
                </CardContent>
            </Card>



            {/* Usage Guidelines */}
            <Card className="mt-6">
                <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">Media Guidelines</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Recommended Formats</h4>
                            <ul className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <li>• Photos: JPEG, PNG, WebP (max 10MB)</li>
                                <li>• Videos: MP4, WebM (max 100MB)</li>
                                <li>• Documents: PDF (max 25MB)</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Best Practices</h4>
                            <ul className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <li>• Use descriptive file names</li>
                                <li>• Add detailed descriptions</li>
                                <li>• Organize with folders and tags</li>
                                <li>• Compress large files before upload</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Folder Creation/Edit Modal */}
            <FolderEditModal
                isOpen={showFolderModal}
                onClose={handleFolderModalClose}
                folder={selectedFolder} // Pass selected folder for editing
                siteId={parseInt(siteId)}
                onSave={handleFolderSave}
                currentUser={user} // Pass current user for audit fields
            />

            {/* Move Folder Modal */}
            {showMoveFolderModal && folderToMove && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Move Folder
                            </h3>
                            <button
                                onClick={handleFolderMoveCancel}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Move <span className="font-medium text-gray-900 dark:text-white">"{folderToMove.name}"</span> to:
                            </p>

                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="parentFolder"
                                        value=""
                                        defaultChecked
                                        className="text-blue-600"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Root Level (No Parent)</span>
                                </label>

                                {folders
                                    .filter(folder => folder.id !== folderToMove.id && !folder.parentId)
                                    .map(folder => (
                                        <label key={folder.id} className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                name="parentFolder"
                                                value={folder.id}
                                                className="text-blue-600"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                📁 {folder.name}
                                            </span>
                                        </label>
                                    ))
                                }
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <Button
                                onClick={handleFolderMoveCancel}
                                variant="outline"
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    const selectedParent = document.querySelector('input[name="parentFolder"]:checked')?.value;
                                    const parentId = selectedParent === "" ? null : parseInt(selectedParent);
                                    handleFolderMoveConfirm(parentId);
                                }}
                                className="flex-1"
                            >
                                Move Folder
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MediaManagement;





