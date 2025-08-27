import React, { createContext, useContext, useState } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

const SelectContext = createContext();

const useSelectContext = () => {
    const context = useContext(SelectContext);
    if (!context) {
        throw new Error('Select components must be used within a Select component');
    }
    return context;
};

const Select = ({ value, onValueChange, children, ...props }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
            <div className="relative" {...props}>
                {children}
            </div>
        </SelectContext.Provider>
    );
};

const SelectTrigger = ({ children, className = '', ...props }) => {
    const { isOpen, setIsOpen } = useSelectContext();

    return (
        <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
                'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            {...props}
        >
            {children}
            <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
    );
};

const SelectValue = ({ placeholder, children }) => {
    const { value } = useSelectContext();

    if (children) {
        return children;
    }

    return value || placeholder || 'Select an option';
};

const SelectContent = ({ children, className = '', ...props }) => {
    const { isOpen } = useSelectContext();

    if (!isOpen) return null;

    return (
        <div
            className={cn(
                'absolute top-full z-50 w-full rounded-md border bg-popover text-popover-foreground shadow-md',
                className
            )}
            {...props}
        >
            <div className="p-1">
                {children}
            </div>
        </div>
    );
};

const SelectItem = ({ value, children, className = '', ...props }) => {
    const { onValueChange, setIsOpen } = useSelectContext();

    const handleClick = () => {
        onValueChange?.(value);
        setIsOpen(false);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={cn(
                'relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
