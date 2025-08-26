import React from 'react';
import { cn } from '../../lib/utils';
import { touchTargets, touchSpacing, textSizes } from '../../lib/breakpoints';

const MobileButton = ({
    children,
    variant = 'primary',
    size = 'default',
    fullWidth = false,
    disabled = false,
    loading = false,
    icon: Icon,
    iconPosition = 'left',
    className = '',
    onClick,
    type = 'button',
    ...props
}) => {
    // Base button classes
    const baseClasses = cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-95 transform',
        // Touch-friendly sizing
        touchTargets.button,
        // Responsive padding
        touchSpacing.button,
        // Full width on mobile, auto on larger screens
        fullWidth ? 'w-full' : 'w-auto',
        // Responsive text sizing
        textSizes.sm.md,
        className
    );

    // Variant styles
    const variantClasses = {
        primary: cn(
            'bg-blue-600 text-white',
            'hover:bg-blue-700 active:bg-blue-800',
            'focus:ring-blue-500',
            'border border-transparent'
        ),
        secondary: cn(
            'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100',
            'hover:bg-gray-300 dark:hover:bg-gray-600',
            'focus:ring-gray-500',
            'border border-gray-300 dark:border-gray-600'
        ),
        outline: cn(
            'bg-transparent text-blue-600 dark:text-blue-400',
            'hover:bg-blue-50 dark:hover:bg-blue-900/20',
            'focus:ring-blue-500',
            'border border-blue-600 dark:border-blue-400'
        ),
        ghost: cn(
            'bg-transparent text-gray-700 dark:text-gray-300',
            'hover:bg-gray-100 dark:hover:bg-gray-700',
            'focus:ring-gray-500',
            'border border-transparent'
        ),
        danger: cn(
            'bg-red-600 text-white',
            'hover:bg-red-700 active:bg-red-800',
            'focus:ring-red-500',
            'border border-transparent'
        ),
        success: cn(
            'bg-green-600 text-white',
            'hover:bg-green-700 active:bg-green-800',
            'focus:ring-green-500',
            'border border-transparent'
        )
    };

    // Size variants
    const sizeClasses = {
        xs: 'text-xs px-2 py-1.5 min-h-[32px]',
        sm: 'text-sm px-3 py-2 min-h-[36px]',
        default: 'text-sm px-4 py-2.5 min-h-[44px]',
        lg: 'text-base px-5 py-3 min-h-[48px]',
        xl: 'text-lg px-6 py-3.5 min-h-[52px]'
    };

    // Icon sizing
    const iconSizes = {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        default: 'w-4 h-4',
        lg: 'w-5 h-5',
        xl: 'w-6 h-6'
    };

    // Loading spinner
    const LoadingSpinner = () => (
        <div className="animate-spin rounded-full border-2 border-current border-t-transparent w-4 h-4" />
    );

    // Icon component
    const IconComponent = Icon && (
        <Icon className={cn(
            iconSizes[size],
            iconPosition === 'left' ? 'mr-2' : 'ml-2',
            'flex-shrink-0'
        )} />
    );

    // Content with proper spacing
    const content = (
        <>
            {loading ? (
                <>
                    <LoadingSpinner />
                    <span className="ml-2">Loading...</span>
                </>
            ) : (
                <>
                    {iconPosition === 'left' && IconComponent}
                    {children}
                    {iconPosition === 'right' && IconComponent}
                </>
            )}
        </>
    );

    return (
        <button
            type={type}
            className={cn(
                baseClasses,
                variantClasses[variant],
                sizeClasses[size],
                disabled && 'opacity-50 cursor-not-allowed'
            )}
            disabled={disabled || loading}
            onClick={onClick}
            {...props}
        >
            {content}
        </button>
    );
};

// Mobile-specific button variants
export const MobileIconButton = ({
    icon: Icon,
    size = 'default',
    variant = 'ghost',
    className = '',
    ...props
}) => {
    const iconSizes = {
        xs: 'w-8 h-8',
        sm: 'w-10 h-10',
        default: 'w-12 h-12',
        lg: 'w-14 h-14',
        xl: 'w-16 h-16'
    };

    const iconInnerSizes = {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        default: 'w-5 h-5',
        lg: 'w-6 h-6',
        xl: 'w-7 h-7'
    };

    return (
        <MobileButton
            variant={variant}
            size={size}
            className={cn(
                'p-0 rounded-full',
                iconSizes[size],
                className
            )}
            {...props}
        >
            <Icon className={iconInnerSizes[size]} />
        </MobileButton>
    );
};

// Mobile action button (floating action button style)
export const MobileActionButton = ({
    icon: Icon,
    children,
    className = '',
    ...props
}) => {
    return (
        <MobileButton
            variant="primary"
            size="lg"
            className={cn(
                'fixed bottom-6 right-6 z-50 shadow-lg',
                'rounded-full w-16 h-16 p-0',
                'sm:bottom-8 sm:right-8',
                className
            )}
            {...props}
        >
            <Icon className="w-6 h-6" />
            {children && (
                <span className="sr-only">{children}</span>
            )}
        </MobileButton>
    );
};

// Mobile bottom sheet button
export const MobileBottomButton = ({
    children,
    variant = 'primary',
    className = '',
    ...props
}) => {
    return (
        <MobileButton
            variant={variant}
            size="lg"
            fullWidth
            className={cn(
                'rounded-t-xl rounded-b-none',
                'border-t border-gray-200 dark:border-gray-700',
                'py-4 text-lg font-semibold',
                className
            )}
            {...props}
        >
            {children}
        </MobileButton>
    );
};

export default MobileButton;


