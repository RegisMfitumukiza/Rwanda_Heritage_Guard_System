import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const Toast = ({
    message,
    type = 'info', // 'success', 'error', 'warning', 'info'
    isVisible,
    onClose,
    duration = 5000
}) => {
    useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!isVisible) return null;

    const getToastStyles = () => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-green-50 dark:bg-green-900/20',
                    border: 'border-green-200 dark:border-green-800',
                    text: 'text-green-800 dark:text-green-200',
                    icon: CheckCircle,
                    iconColor: 'text-green-500'
                };
            case 'error':
                return {
                    bg: 'bg-red-50 dark:bg-red-900/20',
                    border: 'border-red-200 dark:border-red-800',
                    text: 'text-red-800 dark:text-red-200',
                    icon: XCircle,
                    iconColor: 'text-red-500'
                };
            case 'warning':
                return {
                    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
                    border: 'border-yellow-200 dark:border-yellow-800',
                    text: 'text-yellow-800 dark:text-yellow-200',
                    icon: AlertTriangle,
                    iconColor: 'text-yellow-500'
                };
            default:
                return {
                    bg: 'bg-blue-50 dark:bg-blue-900/20',
                    border: 'border-blue-200 dark:border-blue-800',
                    text: 'text-blue-800 dark:text-blue-200',
                    icon: Info,
                    iconColor: 'text-blue-500'
                };
        }
    };

    const styles = getToastStyles();
    const Icon = styles.icon;

    return (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-2 duration-300">
            <div className={`flex items-center p-4 rounded-lg border ${styles.bg} ${styles.border} shadow-lg max-w-sm`}>
                <Icon className={`w-5 h-5 ${styles.iconColor} mr-3 flex-shrink-0`} />
                <p className={`text-sm font-medium ${styles.text} flex-1`}>
                    {message}
                </p>
                <button
                    onClick={onClose}
                    className="ml-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default Toast;
