import React from 'react';
import { cn } from '../../lib/utils';
import { touchSpacing, containers } from '../../lib/breakpoints';

const MobileCard = ({
    children,
    variant = 'default',
    size = 'default',
    interactive = false,
    className = '',
    ...props
}) => {
    const baseClasses = cn(
        'bg-white dark:bg-gray-800 rounded-lg border transition-all duration-200',
        interactive && 'cursor-pointer hover:shadow-md active:scale-[0.98] transform',
        className
    );

    const variantClasses = {
        default: 'border-gray-200 dark:border-gray-700 shadow-sm',
        elevated: 'border-gray-200 dark:border-gray-700 shadow-md',
        outlined: 'border-2 border-gray-300 dark:border-gray-600 shadow-none',
        ghost: 'border-transparent shadow-none'
    };

    const sizeClasses = {
        xs: 'p-3',
        sm: 'p-4',
        default: touchSpacing.card,
        lg: 'p-6 sm:p-8',
        xl: 'p-8 sm:p-10'
    };

    return (
        <div
            className={cn(
                baseClasses,
                variantClasses[variant],
                sizeClasses[size]
            )}
            {...props}
        >
            {children}
        </div>
    );
};

// Card Header
export const MobileCardHeader = ({
    children,
    className = '',
    ...props
}) => (
    <div
        className={cn(
            'flex items-center justify-between',
            'pb-4 mb-4 border-b border-gray-200 dark:border-gray-700',
            className
        )}
        {...props}
    >
        {children}
    </div>
);

// Card Title
export const MobileCardTitle = ({
    children,
    size = 'default',
    className = '',
    ...props
}) => {
    const sizeClasses = {
        xs: 'text-sm font-medium',
        sm: 'text-base font-medium',
        default: 'text-lg font-semibold',
        lg: 'text-xl font-semibold',
        xl: 'text-2xl font-bold'
    };

    return (
        <h3
            className={cn(
                'text-gray-900 dark:text-white',
                sizeClasses[size],
                className
            )}
            {...props}
        >
            {children}
        </h3>
    );
};

// Card Subtitle
export const MobileCardSubtitle = ({
    children,
    className = '',
    ...props
}) => (
    <p
        className={cn(
            'text-sm text-gray-600 dark:text-gray-400 mt-1',
            className
        )}
        {...props}
    >
        {children}
    </p>
);

// Card Content
export const MobileCardContent = ({
    children,
    className = '',
    ...props
}) => (
    <div className={cn('', className)} {...props}>
        {children}
    </div>
);

// Card Footer
export const MobileCardFooter = ({
    children,
    className = '',
    ...props
}) => (
    <div
        className={cn(
            'flex items-center justify-between pt-4 mt-4',
            'border-t border-gray-200 dark:border-gray-700',
            className
        )}
        {...props}
    >
        {children}
    </div>
);

// Mobile-specific card variants
export const MobileActionCard = ({
    children,
    onClick,
    className = '',
    ...props
}) => (
    <MobileCard
        interactive
        onClick={onClick}
        className={cn(
            'hover:bg-gray-50 dark:hover:bg-gray-750',
            'active:bg-gray-100 dark:active:bg-gray-700',
            className
        )}
        {...props}
    >
        {children}
    </MobileCard>
);

export const MobileStatsCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    trendValue,
    className = '',
    ...props
}) => (
    <MobileCard
        size="sm"
        className={cn('text-center', className)}
        {...props}
    >
        {Icon && (
            <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-3">
                <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
        )}

        <MobileCardTitle size="sm">{title}</MobileCardTitle>

        <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {value}
        </div>

        {subtitle && (
            <MobileCardSubtitle>{subtitle}</MobileCardSubtitle>
        )}

        {trend && trendValue && (
            <div className={cn(
                'flex items-center justify-center mt-2 text-sm',
                trend === 'up' ? 'text-green-600' : 'text-red-600'
            )}>
                <span className="mr-1">
                    {trend === 'up' ? '↗' : '↘'}
                </span>
                {trendValue}
            </div>
        )}
    </MobileCard>
);

export const MobileFeatureCard = ({
    icon: Icon,
    title,
    description,
    action,
    className = '',
    ...props
}) => (
    <MobileCard
        size="sm"
        className={cn('text-center', className)}
        {...props}
    >
        {Icon && (
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-gray-600 dark:text-gray-400" />
            </div>
        )}

        <MobileCardTitle size="sm">{title}</MobileCardTitle>

        {description && (
            <MobileCardSubtitle>{description}</MobileCardSubtitle>
        )}

        {action && (
            <div className="mt-4">
                {action}
            </div>
        )}
    </MobileCard>
);

export default MobileCard;


