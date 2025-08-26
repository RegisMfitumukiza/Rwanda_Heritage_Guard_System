import React, { useState, useEffect } from 'react';
import {
    FileText,
    Image as ImageIcon,
    File,
    PlayCircle,
    Music,
    Archive,
    Download,
    Eye,
    Lock
} from 'lucide-react';
import { Button } from '../ui/Button';

/**
 * DocumentThumbnail Component
 * 
 * Generates and displays thumbnails for different document types
 * with hover effects and quick actions
 */

const DocumentThumbnail = ({
    document,
    size = 'medium', // 'small', 'medium', 'large'
    onClick,
    onPreview,
    onDownload,
    showActions = true,
    showInfo = true,
    className = '',
    ...props
}) => {
    const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
    const [thumbnailError, setThumbnailError] = useState(false);

    // Size configurations
    const sizeConfig = {
        small: {
            container: 'w-20 h-20',
            icon: 'w-8 h-8',
            text: 'text-xs',
            overlay: 'text-xs'
        },
        medium: {
            container: 'w-32 h-32',
            icon: 'w-12 h-12',
            text: 'text-sm',
            overlay: 'text-sm'
        },
        large: {
            container: 'w-48 h-48',
            icon: 'w-16 h-16',
            text: 'text-base',
            overlay: 'text-base'
        }
    };

    const config = sizeConfig[size] || sizeConfig.medium;

    // Detect file type and get appropriate icon
    const getFileTypeInfo = () => {
        if (!document || !document.fileName) {
            return { type: 'unknown', icon: File, color: 'gray' };
        }

        const extension = document.fileName.split('.').pop()?.toLowerCase();
        const mimeType = document.fileType?.toLowerCase();

        // Image files
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension) ||
            mimeType?.startsWith('image/')) {
            return { type: 'image', icon: ImageIcon, color: 'green' };
        }

        // PDF files
        if (extension === 'pdf' || mimeType === 'application/pdf') {
            return { type: 'pdf', icon: FileText, color: 'red' };
        }

        // Text files
        if (['txt', 'csv', 'json', 'xml', 'md', 'log'].includes(extension) ||
            mimeType?.startsWith('text/')) {
            return { type: 'text', icon: FileText, color: 'blue' };
        }

        // Video files
        if (['mp4', 'webm', 'ogv', 'avi', 'mov'].includes(extension) ||
            mimeType?.startsWith('video/')) {
            return { type: 'video', icon: PlayCircle, color: 'purple' };
        }

        // Audio files
        if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(extension) ||
            mimeType?.startsWith('audio/')) {
            return { type: 'audio', icon: Music, color: 'indigo' };
        }

        // Archive files
        if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
            return { type: 'archive', icon: Archive, color: 'yellow' };
        }

        // Office documents
        if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
            return { type: 'office', icon: FileText, color: 'orange' };
        }

        return { type: 'unknown', icon: File, color: 'gray' };
    };

    const fileInfo = getFileTypeInfo();

    // Color variants for different file types
    const colorVariants = {
        red: 'bg-red-100 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
        blue: 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
        green: 'bg-green-100 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
        yellow: 'bg-yellow-100 text-yellow-600 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
        purple: 'bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
        indigo: 'bg-indigo-100 text-indigo-600 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800',
        orange: 'bg-orange-100 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
        gray: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(1)} ${units[unitIndex]}`;
    };

    // Handle thumbnail loading
    const handleThumbnailLoad = () => {
        setThumbnailLoaded(true);
    };

    const handleThumbnailError = () => {
        setThumbnailError(true);
        setThumbnailLoaded(false);
    };

    // Get thumbnail URL
    const getThumbnailUrl = () => {
        if (!document || !document.id) return null;

        // For images, use the document preview URL if available
        if (fileInfo.type === 'image') {
            return `/api/documents/preview/${document.id}`;
        }

        // For PDFs, try to use preview endpoint
        if (fileInfo.type === 'pdf') {
            return `/api/documents/preview/${document.id}`;
        }

        // For other files, don't try to load thumbnails - just show icons
        return null;
    };

    const thumbnailUrl = getThumbnailUrl();
    const shouldShowThumbnail = thumbnailUrl && !thumbnailError &&
        (fileInfo.type === 'image' || fileInfo.type === 'pdf');

    return (
        <div
            className={`relative group cursor-pointer transition-all duration-200 hover:scale-105 ${className}`}
            onClick={onClick}
            {...props}
        >
            {/* Main Thumbnail Container */}
            <div className={`
        ${config.container} 
        border-2 rounded-lg overflow-hidden
        ${colorVariants[fileInfo.color]}
        group-hover:shadow-lg transition-all duration-200
      `}>
                {/* Thumbnail Image or Icon */}
                {shouldShowThumbnail ? (
                    <div className="w-full h-full relative">
                        {!thumbnailLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="animate-pulse">
                                    {React.createElement(fileInfo.icon, {
                                        className: `${config.icon} opacity-50`
                                    })}
                                </div>
                            </div>
                        )}

                        <img
                            src={thumbnailUrl}
                            alt={document.fileName}
                            className={`w-full h-full object-cover transition-opacity duration-300 ${thumbnailLoaded ? 'opacity-100' : 'opacity-0'
                                }`}
                            onLoad={handleThumbnailLoad}
                            onError={handleThumbnailError}
                        />

                        {/* Image Overlay for Better Icon Visibility */}
                        {fileInfo.type !== 'image' && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        )}
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        {React.createElement(fileInfo.icon, {
                            className: config.icon
                        })}
                    </div>
                )}

                {/* File Type Badge */}
                <div className="absolute top-1 right-1">
                    <span className={`
            px-1.5 py-0.5 rounded text-xs font-medium uppercase
            bg-white/90 text-gray-700 backdrop-blur-sm
            dark:bg-gray-800/90 dark:text-gray-300
          `}>
                        {document.fileName?.split('.').pop() || 'File'}
                    </span>
                </div>

                {/* Privacy Indicator */}
                {!document.isPublic && (
                    <div className="absolute top-1 left-1">
                        <Lock className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                    </div>
                )}

                {/* Video Duration Overlay */}
                {fileInfo.type === 'video' && (
                    <div className="absolute bottom-1 right-1">
                        <span className="px-1.5 py-0.5 bg-black/70 text-white text-xs rounded">
                            {document.duration || '0:00'}
                        </span>
                    </div>
                )}

                {/* Action Overlay */}
                {showActions && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
                        {onPreview && (
                            <Button
                                size="xs"
                                variant="secondary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPreview(document);
                                }}
                                className="bg-white/90 text-gray-800 hover:bg-white"
                            >
                                <Eye className="w-3 h-3" />
                            </Button>
                        )}

                        {onDownload && (
                            <Button
                                size="xs"
                                variant="secondary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDownload(document);
                                }}
                                className="bg-white/90 text-gray-800 hover:bg-white"
                            >
                                <Download className="w-3 h-3" />
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Document Info */}
            {showInfo && (
                <div className="mt-2 space-y-1">
                    <h4 className={`${config.text} font-medium text-gray-900 dark:text-white truncate`}>
                        {document.fileName}
                    </h4>

                    <div className={`${config.text} text-gray-500 dark:text-gray-400 space-y-0.5`}>
                        {document.fileSize && (
                            <p className="truncate">{formatFileSize(document.fileSize)}</p>
                        )}

                        {document.uploadDate && (
                            <p className="truncate">
                                {new Date(document.uploadDate).toLocaleDateString()}
                            </p>
                        )}

                        {/* Folder Information */}
                        {document.folderName && (
                            <div className="flex items-center space-x-1">
                                <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                                    📁 {document.folderName}
                                </span>
                            </div>
                        )}

                        {document.description && size === 'large' && (
                            <p className="text-xs truncate">{document.description}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentThumbnail;





