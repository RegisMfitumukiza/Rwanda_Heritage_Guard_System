import React from 'react';
import { X, AlertTriangle, UserX, Trash2, Unlock, UserCheck } from 'lucide-react';
import { Button } from './Button';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'default', // 'default', 'danger', 'warning', 'success'
    icon: Icon,
    isLoading = false,
    showReasonInput = false,
    reason = '',
    onReasonChange = () => { }
}) => {
    if (!isOpen) return null;

    // Get variant-specific styling
    const getVariantStyles = () => {
        switch (variant) {
            case 'danger':
                return {
                    iconBg: 'bg-red-100 dark:bg-red-900/20',
                    iconColor: 'text-red-600 dark:text-red-400',
                    buttonVariant: 'destructive',
                    borderColor: 'border-red-200 dark:border-red-800'
                };
            case 'warning':
                return {
                    iconBg: 'bg-yellow-100 dark:bg-yellow-900/20',
                    iconColor: 'text-yellow-600 dark:text-yellow-400',
                    buttonVariant: 'outline',
                    borderColor: 'border-yellow-200 dark:border-yellow-800'
                };
            case 'success':
                return {
                    iconBg: 'bg-green-100 dark:bg-green-900/20',
                    iconColor: 'text-green-600 dark:text-green-400',
                    buttonVariant: 'default',
                    borderColor: 'border-green-200 dark:border-green-800'
                };
            default:
                return {
                    iconBg: 'bg-blue-100 dark:bg-blue-900/20',
                    iconColor: 'text-blue-600 dark:text-blue-400',
                    buttonVariant: 'default',
                    borderColor: 'border-blue-200 dark:border-blue-800'
                };
        }
    };

    const styles = getVariantStyles();

    // Handle escape key
    React.useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Handle backdrop click
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={handleBackdropClick}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md mx-4 transform transition-all duration-300 ease-out">
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Header */}
                    <div className={`px-6 py-4 border-b ${styles.borderColor} bg-gray-50 dark:bg-gray-800`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                {Icon && (
                                    <div className={`p-2 rounded-full ${styles.iconBg}`}>
                                        <Icon className={`w-5 h-5 ${styles.iconColor}`} />
                                    </div>
                                )}
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {title}
                                </h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                disabled={isLoading}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-4">
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            {message}
                        </p>

                        {/* Reason Input for Status Changes */}
                        {showReasonInput && (
                            <div className="mt-4">
                                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Reason for this action
                                </label>
                                <textarea
                                    id="reason"
                                    value={reason}
                                    onChange={(e) => onReasonChange(e.target.value)}
                                    placeholder="Please provide a reason for this action..."
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                                    rows={3}
                                    disabled={isLoading}
                                />
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-end space-x-3">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                disabled={isLoading}
                                className="min-w-[80px]"
                            >
                                {cancelText}
                            </Button>
                            <Button
                                variant={styles.buttonVariant}
                                onClick={onConfirm}
                                disabled={isLoading}
                                className="min-w-[80px]"
                            >
                                {isLoading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        <span>Processing...</span>
                                    </div>
                                ) : (
                                    confirmText
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
