import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const DeleteConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Deletion",
    message = "Are you sure you want to delete this item?",
    itemName = "",
    confirmText = "Delete",
    cancelText = "Cancel",
    isDeleting = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {title}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        disabled={isDeleting}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {message}
                    </p>
                    {itemName && (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                <span className="font-medium">Item:</span> {itemName}
                            </p>
                        </div>
                    )}
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                        ⚠️ This action cannot be undone.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-md flex items-center space-x-2"
                    >
                        {isDeleting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                <span>Deleting...</span>
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4" />
                                <span>{confirmText}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;







