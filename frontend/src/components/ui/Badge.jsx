import React from 'react';
import { cn } from '../../lib/utils';

const Badge = React.forwardRef(({ 
    children, 
    variant = 'default', 
    size = 'default',
    className = '', 
    ...props 
}, ref) => {
    const baseClasses = 'inline-flex items-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
    
    const variantClasses = {
        default: 'bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    };
    
    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        default: 'px-2.5 py-0.5 text-sm',
        lg: 'px-3 py-1 text-sm'
    };

    return (
        <span
            ref={ref}
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
});

Badge.displayName = 'Badge';

export default Badge;
export { Badge };
