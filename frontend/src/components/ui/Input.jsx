import React from 'react';

const Input = React.forwardRef(({
    className = '',
    type = 'text',
    id,
    placeholder,
    value,
    onChange,
    onBlur,
    disabled = false,
    step,
    ...props
}, ref) => {
    return (
        <input
            ref={ref}
            type={type}
            id={id}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            step={step}
            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed ${className}`}
            {...props}
        />
    );
});

Input.displayName = 'Input';

export { Input };
