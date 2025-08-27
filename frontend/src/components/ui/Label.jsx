import React from 'react';

const Label = React.forwardRef(({
    className = '',
    htmlFor,
    children,
    ...props
}, ref) => {
    return (
        <label
            ref={ref}
            htmlFor={htmlFor}
            className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`}
            {...props}
        >
            {children}
        </label>
    );
});

Label.displayName = 'Label';

export { Label };
