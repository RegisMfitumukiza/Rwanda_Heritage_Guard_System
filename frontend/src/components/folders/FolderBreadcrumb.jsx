import React from 'react';
import { ChevronRight, Home, Folder } from 'lucide-react';
import { Button } from '../ui/Button';

const FolderBreadcrumb = ({
    breadcrumb = [],
    onNavigate,
    showHome = true,
    className = ''
}) => {
    // Handle navigation to folder
    const handleNavigate = (folderId) => {
        if (onNavigate) {
            onNavigate(folderId);
        }
    };

    // Handle navigate to root
    const handleNavigateHome = () => {
        if (onNavigate) {
            onNavigate(null); // null represents root/no folder selected
        }
    };

    return (
        <nav className={`flex items-center space-x-1 text-sm ${className}`}>
            {/* Home/Root */}
            {showHome && (
                <>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNavigateHome}
                        className="flex items-center space-x-1 px-2 py-1 h-auto text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                        <Home className="w-4 h-4" />
                        <span>Documents</span>
                    </Button>

                    {breadcrumb.length > 0 && (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                </>
            )}

            {/* Breadcrumb items */}
            {breadcrumb.map((item, index) => {
                const isLast = index === breadcrumb.length - 1;

                return (
                    <React.Fragment key={item.id}>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleNavigate(item.id)}
                            disabled={isLast}
                            className={`flex items-center space-x-1 px-2 py-1 h-auto ${isLast
                                    ? 'text-gray-900 dark:text-white font-medium cursor-default'
                                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                                }`}
                        >
                            <Folder className="w-4 h-4" />
                            <span className="max-w-32 truncate">{item.name}</span>
                        </Button>

                        {!isLast && (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
};

export default FolderBreadcrumb;





