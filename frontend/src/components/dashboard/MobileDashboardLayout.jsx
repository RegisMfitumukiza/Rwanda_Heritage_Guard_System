import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import ComponentErrorBoundary from '../error/ComponentErrorBoundary';

const MobileDashboardLayout = ({
    children,
    title,
    subtitle,
    headerActions,
    sidebarProps = {},
    headerProps = {},
    className = '',
    ...props
}) => {
    const { user } = useAuth();
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);



    const getDefaultTitle = () => {
        if (title) return title;
        const path = window.location.pathname;
        if (path.includes('/sites')) return 'Heritage Sites';
        if (path.includes('/artifacts')) return 'Artifacts';
        if (path.includes('/documents')) return 'Documents';
        return 'Dashboard';
    };

    const getDefaultSubtitle = () => {
        if (subtitle) return subtitle;
        return 'Welcome to your dashboard';
    };

    return (
        <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex ${className}`} {...props}>
            {/* Mobile Sidebar */}
            {isMobileSidebarOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden">
                    <div className="fixed left-0 top-0 h-full w-80 max-w-[85vw] z-50 bg-white dark:bg-gray-800">
                        <DashboardSidebar
                            isCollapsed={false}
                            onCollapse={() => setIsMobileSidebarOpen(false)}
                            isMobileOpen={isMobileSidebarOpen}
                            onMobileClose={() => setIsMobileSidebarOpen(false)}
                            {...sidebarProps}
                        />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                <DashboardHeader
                    title={getDefaultTitle()}
                    subtitle={getDefaultSubtitle()}
                    onMenuToggle={() => setIsMobileSidebarOpen(true)}
                    {...headerProps}
                />

                <main className="flex-1 overflow-x-hidden">
                    <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-6">
                        {headerActions && (
                            <div className="mb-4 sm:mb-6">{headerActions}</div>
                        )}

                        <ComponentErrorBoundary componentName="Mobile Dashboard Content">
                            <div className="space-y-4 sm:space-y-6">
                                {children}
                            </div>
                        </ComponentErrorBoundary>
                    </div>
                </main>

                {/* Footer removed */}
            </div>
        </div>
    );
};

export default MobileDashboardLayout;
