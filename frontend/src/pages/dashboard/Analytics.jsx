import React from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import AnalyticsDashboard from '../../components/analytics/AnalyticsDashboard';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * Analytics Page Component
 * 
 * Dedicated page for comprehensive analytics dashboard
 * with professional layout and navigation
 */

const Analytics = () => {
    const { t } = useLanguage();

    return (
        <DashboardLayout>
            <div className="container mx-auto py-8 px-4">
                <AnalyticsDashboard />
            </div>
        </DashboardLayout>
    );
};

export default Analytics;





