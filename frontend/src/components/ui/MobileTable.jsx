import React from 'react';
import { cn } from '../../lib/utils';
import { mobileUtils, touchSpacing } from '../../lib/breakpoints';

const MobileTable = ({
    columns = [],
    data = [],
    onRowClick,
    loading = false,
    emptyMessage = 'No data available',
    className = '',
    ...props
}) => {
    // Mobile card view
    const MobileCardView = () => (
        <div className="space-y-3">
            {data.map((row, rowIndex) => (
                <div
                    key={rowIndex}
                    className={cn(
                        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700',
                        'p-4 space-y-3',
                        onRowClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700',
                        'transition-colors duration-200'
                    )}
                    onClick={() => onRowClick?.(row, rowIndex)}
                >
                    {columns.map((column, colIndex) => (
                        <div key={colIndex} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 sm:w-1/3">
                                {column.header}
                            </span>
                            <div className="mt-1 sm:mt-0 sm:w-2/3">
                                {column.render ? (
                                    column.render(row[column.key], row, rowIndex)
                                ) : (
                                    <span className="text-sm text-gray-900 dark:text-white">
                                        {row[column.key]}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );

    // Desktop table view
    const DesktopTableView = () => (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                className={cn(
                                    'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
                                    column.className
                                )}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {data.map((row, rowIndex) => (
                        <tr
                            key={rowIndex}
                            className={cn(
                                onRowClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700',
                                'transition-colors duration-200'
                            )}
                            onClick={() => onRowClick?.(row, rowIndex)}
                        >
                            {columns.map((column, colIndex) => (
                                <td
                                    key={colIndex}
                                    className={cn(
                                        'px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white',
                                        column.className
                                    )}
                                >
                                    {column.render ? (
                                        column.render(row[column.key], row, rowIndex)
                                    ) : (
                                        row[column.key]
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    if (loading) {
        return (
            <div className={cn('space-y-4', className)}>
                {Array.from({ length: 3 }).map((_, index) => (
                    <div
                        key={`mobile-table-skeleton-${index}`}
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse"
                    >
                        <div className="space-y-3">
                            {columns.map((_, colIndex) => (
                                <div key={`mobile-table-col-${index}-${colIndex}`} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mt-1 sm:mt-0"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className={cn(
                'text-center py-12',
                'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700',
                className
            )}>
                <div className="text-gray-500 dark:text-gray-400">
                    <svg
                        className="mx-auto h-12 w-12 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <p className="text-lg font-medium">{emptyMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={className} {...props}>
            {/* Mobile view (always visible) */}
            <div className="block sm:hidden">
                <MobileCardView />
            </div>

            {/* Desktop view (hidden on mobile) */}
            <div className="hidden sm:block">
                <DesktopTableView />
            </div>
        </div>
    );
};

// Mobile table column definition helper
export const createColumn = (key, header, options = {}) => ({
    key,
    header,
    render: options.render,
    className: options.className || '',
    sortable: options.sortable || false,
    width: options.width || 'auto'
});

// Mobile table with search and filters
export const MobileTableWithFilters = ({
    columns,
    data,
    searchQuery = '',
    onSearchChange,
    filters = [],
    onFilterChange,
    onRowClick,
    loading = false,
    emptyMessage = 'No data available',
    className = '',
    ...props
}) => {
    return (
        <div className={cn('space-y-4', className)}>
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                {onSearchChange && (
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                    </div>
                )}

                {/* Filters */}
                {filters.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                        {filters.map((filter, index) => (
                            <button
                                key={index}
                                onClick={() => onFilterChange?.(filter.key, !filter.active)}
                                className={cn(
                                    'px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap',
                                    'transition-colors duration-200',
                                    filter.active
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                                )}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Table */}
            <MobileTable
                columns={columns}
                data={data}
                onRowClick={onRowClick}
                loading={loading}
                emptyMessage={emptyMessage}
                {...props}
            />
        </div>
    );
};

export default MobileTable;


