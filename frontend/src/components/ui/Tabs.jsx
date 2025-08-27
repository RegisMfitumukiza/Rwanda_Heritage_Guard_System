import React, { createContext, useContext, useState } from 'react';
import { cn } from '../../lib/utils';

const TabsContext = createContext();

const useTabsContext = () => {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error('Tabs components must be used within a Tabs component');
    }
    return context;
};

const Tabs = ({ value, onValueChange, children, className = '' }) => {
    const [activeTab, setActiveTab] = useState(value);

    const handleTabChange = (newValue) => {
        setActiveTab(newValue);
        onValueChange?.(newValue);
    };

    return (
        <TabsContext.Provider value={{ activeTab, onTabChange: handleTabChange }}>
            <div className={cn('w-full', className)}>
                {children}
            </div>
        </TabsContext.Provider>
    );
};

const TabsList = ({ children, className = '' }) => {
    return (
        <div className={cn('inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground', className)}>
            {children}
        </div>
    );
};

const TabsTrigger = ({ value, children, className = '', ...props }) => {
    const { activeTab, onTabChange } = useTabsContext();
    const isActive = activeTab === value;

    return (
        <button
            type="button"
            onClick={() => onTabChange(value)}
            className={cn(
                'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'hover:bg-background/50 hover:text-foreground',
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};

const TabsContent = ({ value, children, className = '' }) => {
    const { activeTab } = useTabsContext();

    if (activeTab !== value) {
        return null;
    }

    return (
        <div className={cn('mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', className)}>
            {children}
        </div>
    );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
