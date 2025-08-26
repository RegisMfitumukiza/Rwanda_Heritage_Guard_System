import React from 'react';
import { cn } from '../../lib/utils';

const SkeletonLoader = ({
    variant = 'default',
    className = '',
    lines = 1,
    ...props
}) => {
    const baseClasses = 'animate-pulse bg-gray-300 dark:bg-gray-700 rounded';

    const variants = {
        default: 'h-4 w-full',
        title: 'h-6 w-3/4',
        subtitle: 'h-4 w-1/2',
        text: 'h-4 w-full',
        avatar: 'h-10 w-10 rounded-full',
        button: 'h-9 w-20',
        card: 'h-32 w-full',
        image: 'h-48 w-full',
        table: 'h-12 w-full',
        form: 'h-10 w-full',
        stats: 'h-16 w-24',
        chart: 'h-64 w-full'
    };

    const classes = cn(baseClasses, variants[variant], className);

    if (variant === 'text' && lines > 1) {
        return (
            <div className="space-y-2" {...props}>
                {Array.from({ length: lines }).map((_, index) => (
                    <div
                        key={`skeleton-line-${index}`}
                        className={cn(
                            baseClasses,
                            'h-4',
                            index === lines - 1 ? 'w-3/4' : 'w-full'
                        )}
                    />
                ))}
            </div>
        );
    }

    return <div className={classes} {...props} />;
};

// Specialized skeleton components
export const CardSkeleton = ({ className = '', ...props }) => (
    <div className={cn('bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4', className)} {...props}>
        <div className="space-y-3">
            <SkeletonLoader variant="title" />
            <SkeletonLoader variant="subtitle" />
            <SkeletonLoader variant="text" lines={3} />
        </div>
    </div>
);

export const TableSkeleton = ({ rows = 5, columns = 4, className = '', ...props }) => (
    <div className={cn('space-y-3', className)} {...props}>
        {/* Header */}
        <div className="flex space-x-4">
            {Array.from({ length: columns }).map((_, index) => (
                <SkeletonLoader key={`table-header-${index}`} variant="title" className="flex-1" />
            ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={`table-row-${rowIndex}`} className="flex space-x-4">
                {Array.from({ length: columns }).map((_, colIndex) => (
                    <SkeletonLoader key={`table-cell-${rowIndex}-${colIndex}`} variant="text" className="flex-1" />
                ))}
            </div>
        ))}
    </div>
);

export const StatsCardSkeleton = ({ className = '', ...props }) => (
    <div className={cn('bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4', className)} {...props}>
        <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
                <SkeletonLoader variant="subtitle" />
                <SkeletonLoader variant="title" />
                <SkeletonLoader variant="text" />
            </div>
            <SkeletonLoader variant="avatar" />
        </div>
    </div>
);

export const FormSkeleton = ({ fields = 4, className = '', ...props }) => (
    <div className={cn('space-y-4', className)} {...props}>
        {Array.from({ length: fields }).map((_, index) => (
            <div key={`form-field-${index}`} className="space-y-2">
                <SkeletonLoader variant="subtitle" className="w-24" />
                <SkeletonLoader variant="form" />
            </div>
        ))}
        <div className="flex space-x-3 pt-4">
            <SkeletonLoader variant="button" />
            <SkeletonLoader variant="button" className="w-16" />
        </div>
    </div>
);

export const DashboardSkeleton = ({ className = '', ...props }) => (
    <div className={cn('space-y-6', className)} {...props}>
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
                <StatsCardSkeleton key={`dashboard-stats-${index}`} />
            ))}
        </div>

        {/* Content Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CardSkeleton />
            <CardSkeleton />
        </div>

        {/* Table */}
        <CardSkeleton>
            <TableSkeleton rows={5} columns={4} />
        </CardSkeleton>
    </div>
);

export default SkeletonLoader;


