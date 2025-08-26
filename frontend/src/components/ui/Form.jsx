import React from 'react';

const Form = ({ onSubmit, children, className = '' }) => {
    return (
        <form
            onSubmit={onSubmit}
            className={`space-y-6 ${className}`}
        >
            {children}
        </form>
    );
};

const FormGroup = ({ children, className = '' }) => {
    return (
        <div className={`space-y-2 ${className}`}>
            {children}
        </div>
    );
};

const Label = ({ htmlFor, children, className = '' }) => {
    return (
        <label
            htmlFor={htmlFor}
            className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`}
        >
            {children}
        </label>
    );
};

const Input = React.forwardRef(({ id, type = 'text', placeholder, value, onChange, className = '', ...props }, ref) => {
    return (
        <input
            ref={ref}
            type={type}
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm ${className}`}
            {...props}
        />
    );
});

Input.displayName = 'Input';

const Select = ({ id, value, onChange, children, className = '' }) => {
    return (
        <select
            id={id}
            value={value}
            onChange={onChange}
            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm ${className}`}
        >
            {children}
        </select>
    );
};

const TextArea = React.forwardRef(({ id, value, onChange, rows = 4, className = '', placeholder = '' }, ref) => {
    return (
        <textarea
            ref={ref}
            id={id}
            value={value}
            onChange={onChange}
            rows={rows}
            placeholder={placeholder}
            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm ${className}`}
        />
    );
});

TextArea.displayName = 'TextArea';

const Button = ({ type = 'button', children, onClick, className = '' }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600 ${className}`}
        >
            {children}
        </button>
    );
};

export { Form, FormGroup, Label, Input, Select, TextArea, Button }; 