import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { touchTargets, touchSpacing } from '../../lib/breakpoints';

const MobileInput = forwardRef(({
    type = 'text',
    label,
    placeholder,
    error,
    helperText,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    size = 'default',
    variant = 'default',
    fullWidth = true,
    disabled = false,
    loading = false,
    className = '',
    ...props
}, ref) => {
    const sizeClasses = {
        xs: 'text-xs px-2 py-1.5 min-h-[32px]',
        sm: 'text-sm px-3 py-2 min-h-[36px]',
        default: 'text-sm px-4 py-2.5 min-h-[44px]',
        lg: 'text-base px-4 py-3 min-h-[48px]',
        xl: 'text-lg px-5 py-3.5 min-h-[52px]'
    };

    const variantClasses = {
        default: 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
        filled: 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
        outline: 'bg-transparent border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
    };

    const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : '';
    const disabledClasses = disabled ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed' : '';

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label}
                    {props.required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                {LeftIcon && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
                        <LeftIcon className="w-4 h-4" />
                    </div>
                )}

                {loading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full border-2 border-current border-t-transparent w-4 h-4" />
                    </div>
                )}

                <input
                    ref={ref}
                    type={type}
                    className={cn(
                        'w-full rounded-lg transition-all duration-200 focus:outline-none',
                        'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                        touchTargets.input,
                        sizeClasses[size],
                        variantClasses[variant],
                        errorClasses,
                        disabledClasses,
                        LeftIcon && 'pl-10',
                        loading && 'pr-10',
                        fullWidth ? 'w-full' : 'w-auto',
                        className
                    )}
                    placeholder={placeholder}
                    disabled={disabled || loading}
                    {...props}
                />
            </div>

            {error && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                    <span>⚠</span>
                    <span>{error}</span>
                </p>
            )}

            {helperText && !error && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
            )}
        </div>
    );
});

MobileInput.displayName = 'MobileInput';

export default MobileInput;
