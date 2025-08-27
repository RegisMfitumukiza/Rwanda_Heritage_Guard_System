import React from 'react';
import { cn } from '../../lib/utils';

const LoadingSpinner = ({
    size = 'default',
    variant = 'default',
    className = '',
    text = '',
    ...props
}) => {
    const sizeClasses = {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        default: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12',
        '2xl': 'w-16 h-16'
    };

    const variantClasses = {
        default: 'border-blue-600',
        primary: 'border-blue-600',
        secondary: 'border-gray-600',
        success: 'border-green-600',
        warning: 'border-yellow-600',
        danger: 'border-red-600',
        light: 'border-gray-300',
        dark: 'border-gray-700'
    };

    const baseClasses = 'animate-spin rounded-full border-2 border-gray-200 border-t-current';
    const classes = cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        className
    );

    return (
        <div className="flex flex-col items-center justify-center space-y-2" {...props}>
            <div className={classes} />
            {text && (
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    {text}
                </p>
            )}
        </div>
    );
};

export default LoadingSpinner;


