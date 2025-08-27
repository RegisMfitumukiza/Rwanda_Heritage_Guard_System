import React, { useState, useEffect } from 'react';
import { Image, File, Download, Trash2, Eye, EyeOff } from 'lucide-react';
import { useAuthenticatedMedia } from '../../hooks/useAuthenticatedMedia';

const MediaGallery = ({ media, artifactId, onDelete, canDelete = false }) => {
    const { getMediaUrl, downloadMedia, loading: mediaLoading } = useAuthenticatedMedia();
    const [mediaUrls, setMediaUrls] = useState({});

    // Load media URLs when component mounts or media changes
    useEffect(() => {
        const loadMediaUrls = async () => {
            if (!media) return;

            const urls = {};
            for (const mediaItem of media) {
                if (getFileType(mediaItem.filePath) === 'image') {
                    const url = await getMediaUrl(artifactId, mediaItem.id);
                    if (url) {
                        urls[mediaItem.id] = url;
                    }
                }
            }
            setMediaUrls(urls);
        };

        loadMediaUrls();

        // Cleanup function to revoke object URLs
        return () => {
            Object.values(mediaUrls).forEach(url => {
                if (url) URL.revokeObjectURL(url);
            });
        };
    }, [media, artifactId, getMediaUrl]);

    const getFileType = (filePath) => {
        if (!filePath) return 'unknown';
        const ext = filePath.toLowerCase().split('.').pop();
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return 'image';
        if (['glb', 'gltf', 'obj', 'fbx'].includes(ext)) return '3d';
        return 'file';
    };

    const getFileIcon = (fileType) => {
        switch (fileType) {
            case 'image':
                return <Image className="w-8 h-8 text-blue-500" />;
            case '3d':
                return <File className="w-8 h-8 text-purple-500" />;
            default:
                return <File className="w-8 h-8 text-gray-500" />;
        }
    };



    if (!media || media.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <Image className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No media files found for this artifact.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {media.map((mediaItem) => {
                const fileType = getFileType(mediaItem.filePath);
                const isImage = fileType === 'image';

                return (
                    <div key={mediaItem.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                        {/* Media Preview */}
                        <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            {isImage ? (
                                <div className="relative w-full h-full">
                                    {mediaUrls[mediaItem.id] ? (
                                        <img
                                            src={mediaUrls[mediaItem.id]}
                                            alt={mediaItem.description || 'Media file'}
                                            className="w-full h-full object-cover rounded-t-lg"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full">
                                            {mediaLoading ? (
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                            ) : (
                                                <Image className="w-8 h-8 text-gray-400" />
                                            )}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                                        <button
                                            onClick={() => downloadMedia(artifactId, mediaItem.id, mediaItem.description)}
                                            className="opacity-0 hover:opacity-100 bg-white bg-opacity-90 p-2 rounded-full shadow-lg transition-all duration-200"
                                            title="Download"
                                        >
                                            <Download className="w-4 h-4 text-gray-700" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center w-full h-full">
                                    {getFileIcon(fileType)}
                                </div>
                            )}
                        </div>

                        {/* Media Info */}
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                    {mediaItem.isPublic ? (
                                        <Eye className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <EyeOff className="w-4 h-4 text-gray-500" />
                                    )}
                                    <span className="text-xs text-gray-500">
                                        {mediaItem.isPublic ? 'Public' : 'Private'}
                                    </span>
                                </div>
                                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                                    {fileType.toUpperCase()}
                                </span>
                            </div>

                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                                {mediaItem.description || 'Media file'}
                            </p>

                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                    ID: {mediaItem.id}
                                </span>

                                <div className="flex space-x-2">
                                    {canDelete && (
                                        <button
                                            onClick={() => onDelete(mediaItem.id)}
                                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default MediaGallery;
