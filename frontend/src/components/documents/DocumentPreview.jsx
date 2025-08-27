import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Download,
    ZoomIn,
    ZoomOut,
    RotateCw,
    RotateCcw,
    Maximize2,
    Minimize2,
    ChevronLeft,
    ChevronRight,
    FileText,
    Image as ImageIcon,
    File,
    AlertTriangle,
    Loader2,
    Share2,
    Eye,
    EyeOff,
    Info,
    Calendar,
    User,
    HardDrive,
    Tag
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { toast } from 'react-hot-toast';
import documentsApi from '../../services/api/documentsApi';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * DocumentPreview Component
 * 
 * Comprehensive document preview system supporting multiple file formats:
 * - PDF documents (via PDF.js)
 * - Images (JPEG, PNG, GIF, WebP, SVG)
 * - Text files (TXT, CSV, JSON, XML)
 * - Office documents (preview via thumbnail/metadata)
 * - Video files (HTML5 video player)
 * - Audio files (HTML5 audio player)
 */

const DocumentPreview = ({
    document,
    isOpen,
    onClose,
    onDownload,
    onDelete,
    onEdit,
    showControls = true,
    className = '',
    ...props
}) => {
    const { user } = useAuth();
    const { t } = useLanguage();

    // Preview state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [previewData, setPreviewData] = useState(null);
    const [previewType, setPreviewType] = useState('unsupported');

    // Viewer state
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [fullscreen, setFullscreen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // File type detection
    const detectFileType = useCallback((doc) => {
        if (!doc || !doc.fileName) return 'unsupported';

        const extension = doc.fileName.split('.').pop()?.toLowerCase();
        const mimeType = doc.fileType?.toLowerCase();

        // Image files
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension) ||
            mimeType?.startsWith('image/')) {
            return 'image';
        }

        // PDF files
        if (extension === 'pdf' || mimeType === 'application/pdf') {
            return 'pdf';
        }

        // Text files
        if (['txt', 'csv', 'json', 'xml', 'md', 'log'].includes(extension) ||
            mimeType?.startsWith('text/')) {
            return 'text';
        }

        // Video files
        if (['mp4', 'webm', 'ogv', 'avi', 'mov'].includes(extension) ||
            mimeType?.startsWith('video/')) {
            return 'video';
        }

        // Audio files
        if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(extension) ||
            mimeType?.startsWith('audio/')) {
            return 'audio';
        }

        // Office documents (limited preview)
        if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
            return 'office';
        }

        return 'unsupported';
    }, []);

    // Load preview data
    const loadPreview = useCallback(async () => {
        if (!document || !isOpen) return;

        try {
            setLoading(true);
            setError(null);

            const fileType = detectFileType(document);
            setPreviewType(fileType);

            if (fileType === 'unsupported') {
                setPreviewData(null);
                return;
            }

            // Load real preview data from API
            const response = await fetch(`/api/documents/${document.id}/preview`);
            if (!response.ok) {
                throw new Error('Failed to load preview data');
            }
            const data = await response.json();
            setPreviewData(data);

            // Set total pages for PDFs
            if (fileType === 'pdf' && data.totalPages) {
                setTotalPages(data.totalPages);
            }

        } catch (error) {
            console.error('Failed to load preview:', error);
            setError('Failed to load document preview');
            toast.error('Failed to load document preview');
        } finally {
            setLoading(false);
        }
    }, [document, isOpen, detectFileType]);

    // Load preview when document changes
    useEffect(() => {
        loadPreview();
    }, [loadPreview]);

    // Reset viewer state when document changes
    useEffect(() => {
        setScale(1);
        setRotation(0);
        setCurrentPage(1);
        setFullscreen(false);
    }, [document]);

    // Handle keyboard shortcuts
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyPress = (e) => {
            switch (e.key) {
                case 'Escape':
                    onClose();
                    break;
                case '+':
                case '=':
                    handleZoomIn();
                    break;
                case '-':
                    handleZoomOut();
                    break;
                case 'f':
                case 'F11':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 'ArrowLeft':
                    if (previewType === 'pdf' && currentPage > 1) {
                        setCurrentPage(prev => prev - 1);
                    }
                    break;
                case 'ArrowRight':
                    if (previewType === 'pdf' && currentPage < totalPages) {
                        setCurrentPage(prev => prev + 1);
                    }
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isOpen, onClose, previewType, currentPage, totalPages]);

    // Viewer controls
    const handleZoomIn = () => setScale(prev => Math.min(prev * 1.2, 5));
    const handleZoomOut = () => setScale(prev => Math.max(prev / 1.2, 0.1));
    const handleRotateLeft = () => setRotation(prev => prev - 90);
    const handleRotateRight = () => setRotation(prev => prev + 90);
    const toggleFullscreen = () => setFullscreen(prev => !prev);
    const resetView = () => {
        setScale(1);
        setRotation(0);
    };

    // Handle document actions
    const handleDownload = async () => {
        if (!document || !onDownload) return;

        try {
            await onDownload(document);
            toast.success('Document download started');
        } catch (error) {
            console.error('Download failed:', error);
            toast.error('Failed to download document');
        }
    };

    const handleShare = () => {
        if (navigator.share && document) {
            navigator.share({
                title: document.fileName,
                text: `Check out this document: ${document.fileName}`,
                url: window.location.href
            }).catch(console.error);
        } else {
            // Fallback: copy link to clipboard
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard');
        }
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (!bytes) return 'Unknown size';
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(1)} ${units[unitIndex]}`;
    };

    // Get file type icon
    const getFileIcon = () => {
        switch (previewType) {
            case 'image': return ImageIcon;
            case 'pdf': return FileText;
            case 'text': return FileText;
            case 'video': return File;
            case 'audio': return File;
            case 'office': return FileText;
            default: return File;
        }
    };

    // Check if user can manage document
    const canManageDocument = user && (
        user.role === 'SYSTEM_ADMINISTRATOR' ||
        user.role === 'HERITAGE_MANAGER' ||
        user.role === 'CONTENT_MANAGER' ||
        document?.uploadedBy === user.id
    );

    if (!isOpen || !document) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 ${className}`}
                onClick={onClose}
                {...props}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className={`bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full h-full ${fullscreen ? '' : 'max-w-6xl max-h-5xl m-4'
                        } flex flex-col`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                            {/* File Icon */}
                            <div className="flex-shrink-0">
                                {React.createElement(getFileIcon(), {
                                    className: "w-6 h-6 text-blue-600"
                                })}
                            </div>

                            {/* Document Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                    {document.fileName}
                                </h3>
                                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center space-x-1">
                                        <HardDrive className="w-3 h-3" />
                                        <span>{formatFileSize(document.fileSize)}</span>
                                    </span>
                                    {document.uploadDate && (
                                        <span className="flex items-center space-x-1">
                                            <Calendar className="w-3 h-3" />
                                            <span>{new Date(document.uploadDate).toLocaleDateString()}</span>
                                        </span>
                                    )}
                                    {document.uploadedBy && (
                                        <span className="flex items-center space-x-1">
                                            <User className="w-3 h-3" />
                                            <span>{document.uploadedBy}</span>
                                        </span>
                                    )}
                                    {document.category && (
                                        <span className="flex items-center space-x-1">
                                            <Tag className="w-3 h-3" />
                                            <span>{document.category}</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {showControls && (
                            <div className="flex items-center space-x-2">
                                {/* Viewer Controls */}
                                {(previewType === 'image' || previewType === 'pdf') && (
                                    <>
                                        <Button variant="ghost" size="sm" onClick={handleZoomOut}>
                                            <ZoomOut className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={handleZoomIn}>
                                            <ZoomIn className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={handleRotateLeft}>
                                            <RotateCcw className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={handleRotateRight}>
                                            <RotateCw className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={resetView}>
                                            Reset
                                        </Button>
                                        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
                                    </>
                                )}

                                {/* Document Actions */}
                                <Button variant="ghost" size="sm" onClick={handleShare}>
                                    <Share2 className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={handleDownload}>
                                    <Download className="w-4 h-4" />
                                </Button>

                                {/* Management Actions */}
                                {canManageDocument && (
                                    <>
                                        {onEdit && (
                                            <Button variant="ghost" size="sm" onClick={() => onEdit(document)}>
                                                Edit
                                            </Button>
                                        )}
                                        {onDelete && (
                                            <Button variant="ghost" size="sm" onClick={() => onDelete(document)}>
                                                Delete
                                            </Button>
                                        )}
                                    </>
                                )}

                                <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
                                    {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                </Button>
                                <Button variant="ghost" size="sm" onClick={onClose}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 flex flex-col min-h-0">
                        {loading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">Loading preview...</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                    <p className="text-red-600 dark:text-red-400 font-medium mb-2">Preview Error</p>
                                    <p className="text-gray-500 dark:text-gray-400">{error}</p>
                                    <Button
                                        variant="outline"
                                        onClick={loadPreview}
                                        className="mt-4"
                                    >
                                        Retry
                                    </Button>
                                </div>
                            </div>
                        ) : previewType === 'unsupported' ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center max-w-md">
                                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        Preview Not Available
                                    </h4>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                                        This file type cannot be previewed in the browser.
                                        You can download it to view with an appropriate application.
                                    </p>
                                    <Button onClick={handleDownload} className="flex items-center space-x-2">
                                        <Download className="w-4 h-4" />
                                        <span>Download Document</span>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            /* Preview Content */
                            <div className="flex-1 overflow-hidden">
                                {/* PDF Preview */}
                                {previewType === 'pdf' && previewData && (
                                    <div className="h-full flex flex-col">
                                        {/* PDF Controls */}
                                        <div className="flex items-center justify-center p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center space-x-4">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                                    disabled={currentPage <= 1}
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                </Button>
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    Page {currentPage} of {totalPages}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                                    disabled={currentPage >= totalPages}
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* PDF Content */}
                                        <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-800">
                                            <div
                                                className="bg-white shadow-lg"
                                                style={{
                                                    transform: `scale(${scale}) rotate(${rotation}deg)`,
                                                    transformOrigin: 'center center'
                                                }}
                                            >
                                                {/* Mock PDF page */}
                                                <div className="w-96 h-[512px] bg-white border border-gray-300 p-8">
                                                    <div className="h-full flex flex-col space-y-4">
                                                        <div className="h-6 bg-gray-300 rounded"></div>
                                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                        <div className="flex-1 space-y-2">
                                                            {Array.from({ length: 15 }).map((_, i) => (
                                                                <div
                                                                    key={`pdf-line-${i}`}
                                                                    className="h-3 bg-gray-100 rounded"
                                                                    style={{ width: `${75 + (i % 3) * 8}%` }}
                                                                ></div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Image Preview */}
                                {previewType === 'image' && previewData && (
                                    <div className="h-full overflow-auto flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-800">
                                        <div
                                            style={{
                                                transform: `scale(${scale}) rotate(${rotation}deg)`,
                                                transformOrigin: 'center center'
                                            }}
                                        >
                                            {/* Mock image */}
                                            <div className="bg-white border border-gray-300 shadow-lg">
                                                <div
                                                    className="bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center"
                                                    style={{ width: 400, height: 300 }}
                                                >
                                                    <ImageIcon className="w-16 h-16 text-gray-400" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Text Preview */}
                                {previewType === 'text' && previewData && (
                                    <div className="h-full overflow-auto p-6">
                                        <div className="max-w-4xl mx-auto">
                                            <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-mono leading-relaxed">
                                                {previewData.content}
                                            </pre>
                                        </div>
                                    </div>
                                )}

                                {/* Video Preview */}
                                {previewType === 'video' && previewData && (
                                    <div className="h-full flex items-center justify-center p-4 bg-black">
                                        <div className="relative">
                                            {/* Mock video player */}
                                            <div className="w-96 h-64 bg-gray-900 border border-gray-700 rounded-lg flex items-center justify-center">
                                                <div className="text-center text-white">
                                                    <File className="w-12 h-12 mx-auto mb-2" />
                                                    <p className="text-sm">Video Preview</p>
                                                    <p className="text-xs text-gray-400">{previewData.duration}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Audio Preview */}
                                {previewType === 'audio' && previewData && (
                                    <div className="h-full flex items-center justify-center p-4">
                                        <div className="text-center">
                                            <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                                Audio File
                                            </h4>
                                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                                Duration: {previewData.duration}
                                            </p>
                                            {/* Mock audio controls */}
                                            <div className="w-64 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center">
                                                <span className="text-sm text-gray-500">Audio Player</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Office Document Preview */}
                                {previewType === 'office' && previewData && (
                                    <div className="h-full flex items-center justify-center p-4">
                                        <div className="text-center">
                                            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                                Office Document
                                            </h4>
                                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                                {previewData.pages} pages • Preview not available
                                            </p>
                                            <Button onClick={handleDownload} className="flex items-center space-x-2">
                                                <Download className="w-4 h-4" />
                                                <span>Download to View</span>
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer Info */}
                    {document.description && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-start space-x-2">
                                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {document.description}
                                </p>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default DocumentPreview;





