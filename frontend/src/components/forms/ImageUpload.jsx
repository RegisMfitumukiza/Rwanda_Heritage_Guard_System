import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Camera, AlertCircle, Check } from 'lucide-react';
import { Button } from '../ui/Button';

const ImageUpload = ({
    label = 'Upload Images',
    name,
    value = [],
    onChange,
    error,
    maxFiles = 10,
    maxSize = 10 * 1024 * 1024, // 10MB
    acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    required = false,
    className = '',
    ...props
}) => {
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Handle file selection
    const handleFileSelect = useCallback((files) => {
        const newFiles = Array.from(files);
        const validFiles = [];
        const errors = [];

        newFiles.forEach((file) => {
            // Check file type
            if (!acceptedTypes.includes(file.type)) {
                errors.push(`${file.name}: Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`);
                return;
            }

            // Check file size
            if (file.size > maxSize) {
                errors.push(`${file.name}: File too large. Maximum size: ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
                return;
            }

            // Check total files limit
            if (value.length + validFiles.length >= maxFiles) {
                errors.push(`Maximum ${maxFiles} files allowed`);
                return;
            }

            // Create file object with preview
            const fileObj = {
                id: `img_${Date.now()}_${validFiles.length}`,
                file,
                name: file.name,
                size: file.size,
                type: file.type,
                preview: URL.createObjectURL(file),
                uploaded: false
            };

            validFiles.push(fileObj);
        });

        if (validFiles.length > 0) {
            const updatedFiles = [...value, ...validFiles];
            onChange(name, updatedFiles);
        }

        if (errors.length > 0) {
            console.error('File upload errors:', errors);
            // In a real app, you'd show these errors to the user
        }
    }, [value, onChange, name, acceptedTypes, maxSize, maxFiles]);

    // Handle drag and drop
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
        const files = e.dataTransfer.files;
        handleFileSelect(files);
    }, [handleFileSelect]);

    // Handle file input change
    const handleInputChange = (e) => {
        const files = e.target.files;
        if (files) {
            handleFileSelect(files);
        }
    };

    // Remove file
    const removeFile = (fileId) => {
        const updatedFiles = value.filter(file => file.id !== fileId);
        // Revoke object URL to prevent memory leaks
        const removedFile = value.find(file => file.id === fileId);
        if (removedFile && removedFile.preview) {
            URL.revokeObjectURL(removedFile.preview);
        }
        onChange(name, updatedFiles);
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className={`space-y-4 ${className}`} {...props}>
            {/* Label */}
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {value.length}/{maxFiles} files
                </span>
            </div>

            {/* Upload Area */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${dragOver
                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : error
                        ? 'border-red-300 bg-red-50 dark:bg-red-900/10'
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

                <div className="text-center">
                    <motion.div
                        animate={{
                            scale: dragOver ? 1.1 : 1,
                            rotate: dragOver ? 5 : 0
                        }}
                        transition={{ duration: 0.2 }}
                        className="mx-auto mb-4"
                    >
                        {dragOver ? (
                            <Camera className="w-12 h-12 text-blue-500 mx-auto" />
                        ) : (
                            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto" />
                        )}
                    </motion.div>

                    <div className="space-y-2">
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                            {dragOver ? 'Drop images here' : 'Upload heritage site images'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Drag and drop images or{' '}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                            >
                                browse files
                            </button>
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            PNG, JPG, WebP up to {(maxSize / 1024 / 1024).toFixed(1)}MB each
                        </p>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400"
                    >
                        <AlertCircle className="w-4 h-4" />
                        <span>{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* File List */}
            <AnimatePresence>
                {value.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                    >
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Selected Images ({value.length})
                        </h4>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {value.map((file) => (
                                <motion.div
                                    key={file.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="relative group"
                                >
                                    {/* Image Preview */}
                                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                                        <img
                                            src={file.preview}
                                            alt={file.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* File Info Overlay */}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeFile(file.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* File Details */}
                                    <div className="mt-2 space-y-1">
                                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatFileSize(file.size)}
                                        </p>
                                    </div>

                                    {/* Upload Status */}
                                    <div className="absolute top-2 right-2">
                                        {file.uploaded ? (
                                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        ) : (
                                            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                                                <Upload className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quick Action Buttons */}
            {value.length === 0 && (
                <div className="flex space-x-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center space-x-2"
                    >
                        <Upload className="w-4 h-4" />
                        <span>Choose Files</span>
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;



