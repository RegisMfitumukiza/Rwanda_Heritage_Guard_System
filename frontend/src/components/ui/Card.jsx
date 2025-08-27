import React from 'react';

const Card = React.forwardRef(({ className = '', ...props }, ref) => (
    <div
        ref={ref}
        className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}
        {...props}
    />
));

const CardHeader = React.forwardRef(({ className = '', ...props }, ref) => (
    <div
        ref={ref}
        className={`px-4 py-3 sm:px-5 sm:py-4 lg:px-6 lg:py-5 border-b border-gray-200 dark:border-gray-700 ${className}`}
        {...props}
    />
));

const CardTitle = React.forwardRef(({ className = '', ...props }, ref) => (
    <h3
        ref={ref}
        className={`text-base sm:text-lg font-semibold text-gray-900 dark:text-white leading-tight ${className}`}
        {...props}
    />
));

const CardContent = React.forwardRef(({ className = '', ...props }, ref) => (
    <div
        ref={ref}
        className={`px-4 py-3 sm:px-5 sm:py-4 lg:px-6 lg:py-5 ${className}`}
        {...props}
    />
));

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardTitle.displayName = 'CardTitle';
CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardTitle, CardContent }; 