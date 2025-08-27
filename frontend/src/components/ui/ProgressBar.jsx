import React from 'react';
import { cn } from '../../lib/utils';

const ProgressBar = ({
    value = 0,
    max = 100,
    size = 'default',
    variant = 'default',
    showLabel = true,
    animated = true,
    className = '',
    ...props
}) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const sizeClasses = {
        xs: 'h-1',
        sm: 'h-2',
        default: 'h-3',
        lg: 'h-4',
        xl: 'h-6'
    };

    const variantClasses = {
        default: 'bg-blue-600',
        primary: 'bg-blue-600',
        success: 'bg-green-600',
        warning: 'bg-yellow-600',
        danger: 'bg-red-600',
        info: 'bg-cyan-600'
    };

    const baseClasses = 'w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden';
    const progressClasses = cn(
        'transition-all duration-300 ease-out',
        animated && 'animate-pulse',
        variantClasses[variant],
        sizeClasses[size]
    );

    return (
        <div className={cn('w-full', className)} {...props}>
            {showLabel && (
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Progress
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {Math.round(percentage)}%
                    </span>
                </div>
            )}

            <div className={baseClasses}>
                <div
                    className={progressClasses}
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={value}
                    aria-valuemin={0}
                    aria-valuemax={max}
                />
            </div>

            {showLabel && (
                <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {value} of {max}
                    </span>
                </div>
            )}
        </div>
    );
};

// Specialized progress components
export const UploadProgressBar = ({
    fileName,
    progress,
    status = 'uploading',
    onCancel,
    className = '',
    ...props
}) => {
    const statusColors = {
        uploading: 'text-blue-600',
        success: 'text-green-600',
        error: 'text-red-600',
        paused: 'text-yellow-600'
    };

    const statusIcons = {
        uploading: '⏳',
        success: '✅',
        error: '❌',
        paused: '⏸️'
    };

    return (
        <div className={cn('bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4', className)} {...props}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {fileName}
                    </span>
                    <span className={cn('text-sm', statusColors[status])}>
                        {statusIcons[status]}
                    </span>
                </div>
                {status === 'uploading' && onCancel && (
                    <button
                        onClick={onCancel}
                        className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                        Cancel
                    </button>
                )}
            </div>

            <ProgressBar
                value={progress}
                max={100}
                variant={status === 'error' ? 'danger' : 'default'}
                showLabel={false}
            />

            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Status: {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
        </div>
    );
};

export const LoadingProgressBar = ({
    message = 'Loading...',
    progress,
    indeterminate = false,
    className = '',
    ...props
}) => {
    return (
        <div className={cn('w-full', className)} {...props}>
            {message && (
                <div className="text-sm text-gray-700 dark:text-gray-300 mb-2 text-center">
                    {message}
                </div>
            )}

            <ProgressBar
                value={indeterminate ? undefined : progress}
                max={100}
                variant="primary"
                showLabel={false}
                className="w-full"
            />
        </div>
    );
};

export default ProgressBar;


