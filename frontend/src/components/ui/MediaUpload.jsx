import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image, File, CheckCircle, AlertCircle, Upload as UploadIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

const MediaUpload = ({
    onUpload,
    onCancel,
    artifactId,
    maxFileSize = 20 * 1024 * 1024, // 20MB
    acceptedTypes = ['image/*', 'model/gltf-binary', 'model/gltf+json', 'application/octet-stream'],
    maxFiles = 5
}) => {
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const fileInputRef = useRef(null);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    }, []);

    const handleFiles = (newFiles) => {
        const validFiles = newFiles.filter(file => {
            // Check file size
            if (file.size > maxFileSize) {
                toast.error(`${file.name} is too large. Maximum size is ${Math.round(maxFileSize / 1024 / 1024)}MB`);
                return false;
            }

            // Check file type
            const isValidType = acceptedTypes.some(type => {
                if (type.endsWith('/*')) {
                    return file.type.startsWith(type.slice(0, -1));
                }
                return file.type === type;
            });

            if (!isValidType) {
                toast.error(`${file.name} is not a supported file type`);
                return false;
            }

            return true;
        });

        if (files.length + validFiles.length > maxFiles) {
            toast.error(`Maximum ${maxFiles} files allowed`);
            return;
        }

        setFiles(prev => [...prev, ...validFiles]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[index];
            return newProgress;
        });
    };

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFiles(Array.from(e.target.files));
        }
    };

    const uploadFiles = async () => {
        if (files.length === 0) return;

        setUploading(true);
        const results = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const formData = new FormData();
            formData.append('file', file);
            formData.append('isPublic', 'true');
            formData.append('description', `Uploaded ${file.name}`);

            try {
                setUploadProgress(prev => ({ ...prev, [i]: 0 }));

                const response = await fetch(`/api/artifacts/${artifactId}/media/upload`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                });

                if (response.ok) {
                    const result = await response.json();
                    results.push(result);
                    setUploadProgress(prev => ({ ...prev, [i]: 100 }));
                    toast.success(`${file.name} uploaded successfully!`);
                } else {
                    throw new Error(`Upload failed: ${response.statusText}`);
                }
            } catch (error) {
                console.error('Upload error:', error);
                toast.error(`Failed to upload ${file.name}: ${error.message}`);
                setUploadProgress(prev => ({ ...prev, [i]: -1 }));
            }
        }

        setUploading(false);

        if (results.length > 0) {
            onUpload(results);
            setFiles([]);
            setUploadProgress({});
        }
    };

    const getFileIcon = (file) => {
        if (file.type.startsWith('image/')) {
            return <Image className="w-8 h-8 text-blue-500" />;
        }
        return <File className="w-8 h-8 text-purple-500" />;
    };

    const getFilePreview = (file) => {
        if (file.type.startsWith('image/')) {
            return (
                <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-16 h-16 object-cover rounded-lg"
                />
            );
        }
        return (
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                {getFileIcon(file)}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {/* Drag & Drop Area */}
            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <UploadIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Drop files here or click to browse
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Supports images (JPG, PNG, GIF) and 3D models (GLB, GLTF, OBJ, FBX)
                </p>
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    Choose Files
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={acceptedTypes.join(',')}
                    onChange={handleFileInput}
                    className="hidden"
                />
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                        Files to Upload ({files.length})
                    </h4>
                    {files.map((file, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            {getFilePreview(file)}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                {uploadProgress[index] !== undefined && (
                                    <div className="mt-2">
                                        {uploadProgress[index] === 100 ? (
                                            <div className="flex items-center text-green-600">
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                <span className="text-xs">Uploaded</span>
                                            </div>
                                        ) : uploadProgress[index] === -1 ? (
                                            <div className="flex items-center text-red-600">
                                                <AlertCircle className="w-4 h-4 mr-1" />
                                                <span className="text-xs">Failed</span>
                                            </div>
                                        ) : (
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${uploadProgress[index]}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                disabled={uploading}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Action Buttons */}
            {files.length > 0 && (
                <div className="flex space-x-3">
                    <button
                        type="button"
                        onClick={uploadFiles}
                        disabled={uploading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {uploading ? 'Uploading...' : `Upload ${files.length} File${files.length > 1 ? 's' : ''}`}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={uploading}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

export default MediaUpload;
