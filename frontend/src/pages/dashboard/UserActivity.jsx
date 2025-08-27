import React from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import UserActivityOverview from '../../components/activity/UserActivityOverview';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * User Activity Page Component
 * 
 * Dedicated page for comprehensive user activity monitoring
 * with real-time updates and analytics
 */

const UserActivity = () => {
    const { t } = useLanguage();

    return (
        <DashboardLayout>
            <div className="container mx-auto py-8 px-4">
                <UserActivityOverview />
            </div>
        </DashboardLayout>
    );
};

export default UserActivity;



