import React from 'react';
import { cn } from '../../lib/utils';

const Button = React.forwardRef(({
    className = '',
    variant = 'default',
    size = 'default',
    disabled = false,
    children,
    ...props
}, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

    const variants = {
        default: 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700',
        destructive: 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:text-white dark:hover:bg-red-700',
        outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
        ghost: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
        link: 'text-blue-600 underline-offset-4 hover:underline dark:text-blue-400'
    };

    const sizes = {
        sm: 'h-8 px-3 text-xs sm:text-sm',
        default: 'h-9 px-4 py-2 text-sm',
        lg: 'h-10 px-6 py-2 text-base',
        icon: 'h-9 w-9 p-0'
    };

    const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

    return (
        <button
            ref={ref}
            className={classes}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
});

Button.displayName = 'Button';

export { Button }; 