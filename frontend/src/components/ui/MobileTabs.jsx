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

const MobileTabs = ({ value, onValueChange, children, className = '' }) => {
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

const MobileTabList = ({ children, className = '' }) => {
    return (
        <div className={cn('flex flex-wrap border-b border-gray-200 dark:border-gray-700', className)}>
            {children}
        </div>
    );
};

const MobileTabTrigger = ({ value, children, className = '', ...props }) => {
    const { activeTab, onTabChange } = useTabsContext();
    const isActive = activeTab === value;

    return (
        <button
            type="button"
            onClick={() => onTabChange(value)}
            className={cn(
                'flex items-center px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isActive
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600',
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};

const MobileTabContent = ({ value, children, className = '' }) => {
    const { activeTab } = useTabsContext();

    if (activeTab !== value) {
        return null;
    }

    return (
        <div className={cn('mt-4', className)}>
            {children}
        </div>
    );
};

export { MobileTabs, MobileTabList, MobileTabTrigger, MobileTabContent };


