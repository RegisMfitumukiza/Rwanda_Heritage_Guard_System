import React from 'react';
import { cn } from '../../lib/utils';

const MobileBadge = ({
    children,
    variant = 'default',
    size = 'default',
    className = '',
    ...props
}) => {
    const baseClasses = 'inline-flex items-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';

    const variantClasses = {
        default: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
        secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
        destructive: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
        outline: 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
        success: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
        warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
    };

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        default: 'px-2.5 py-0.5 text-sm',
        lg: 'px-3 py-1 text-sm'
    };

    return (
        <span
            className={cn(
                baseClasses,
                variantClasses[variant],
                sizeClasses[size],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
};

export default MobileBadge;


