import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Folder, Move, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
// Remove toast import since we'll use the parent's toast state
import httpClient from '../../services/api/httpClient';

const MoveToFolderModal = ({
    isOpen,
    onClose,
    mediaFile,
    siteId,
    onMoveSuccess,
    currentFolderId = null,
    setToast
}) => {
    const [folders, setFolders] = useState([]);
    const [selectedFolderId, setSelectedFolderId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [foldersLoading, setFoldersLoading] = useState(true);

    // Load folders for the site
    useEffect(() => {
        if (isOpen && siteId) {
            loadFolders();
        }
    }, [isOpen, siteId]);

    const loadFolders = async () => {
        try {
            setFoldersLoading(true);
            const response = await httpClient.get(`/api/folders/site/${siteId}`);
            let foldersData = [];

            if (response && Array.isArray(response)) {
                foldersData = response;
            } else if (response && response.data && Array.isArray(response.data)) {
                foldersData = response.data;
            }

            // Filter out the current folder to prevent moving to same location
            if (currentFolderId) {
                foldersData = foldersData.filter(folder => folder.id !== currentFolderId);
            }

            setFolders(foldersData);
        } catch (error) {
            console.error('Error loading folders:', error);
            setToast({ type: 'error', message: 'Failed to load folders' });
            setFolders([]);
        } finally {
            setFoldersLoading(false);
        }
    };

    const handleMove = async () => {
        if (!selectedFolderId) {
            setToast({ type: 'error', message: 'Please select a folder' });
            return;
        }

        try {
            setLoading(true);

            // Call the API to move the media file to the selected folder
            await httpClient.post(`/api/media/${mediaFile.id}/move`, {
                folderId: selectedFolderId
            });

            setToast({ type: 'success', message: `"${mediaFile.name}" moved successfully` });
            onMoveSuccess && onMoveSuccess();
            onClose();
        } catch (error) {
            console.error('Error moving media file:', error);
            setToast({ type: 'error', message: 'Failed to move media file' });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedFolderId(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 m-2 sm:m-4 max-w-md w-full max-h-[90vh] overflow-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <CardHeader className="p-0 mb-3 sm:mb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white text-lg sm:text-xl">
                                <Move className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                                <span>Move to Folder</span>
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClose}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 w-8 h-8 p-0"
                            >
                                <X className="w-4 h-4 sm:w-5 sm:h-5" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {/* File Info */}
                        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                    <Folder className="w-5 h-5 text-blue-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {mediaFile?.name || 'Unknown file'}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Select destination folder
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Folder Selection */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Choose Destination Folder
                            </label>

                            {foldersLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading folders...</p>
                                </div>
                            ) : folders.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm">No folders available</p>
                                    <p className="text-xs">Create a folder first to organize your media</p>
                                </div>
                            ) : (
                                <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                                    {folders.map((folder) => (
                                        <div
                                            key={folder.id}
                                            className={`p-3 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selectedFolderId === folder.id
                                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                                                    : ''
                                                }`}
                                            onClick={() => setSelectedFolderId(folder.id)}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-4 h-4 rounded-full border-2 ${selectedFolderId === folder.id
                                                        ? 'border-blue-500 bg-blue-500'
                                                        : 'border-gray-300 dark:border-gray-600'
                                                    }`}>
                                                    {selectedFolderId === folder.id && (
                                                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {folder.name}
                                                    </p>
                                                    {folder.description && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                            {folder.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Warning */}
                        {selectedFolderId && (
                            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                                <div className="flex items-start space-x-2">
                                    <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                        Moving a file will update its location. The file will no longer appear in its current location.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleMove}
                                disabled={!selectedFolderId || loading}
                                className="flex items-center space-x-2"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                    <Move className="w-4 h-4" />
                                )}
                                <span>{loading ? 'Moving...' : 'Move File'}</span>
                            </Button>
                        </div>
                    </CardContent>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default MoveToFolderModal;
