import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            // Redirect to role-specific dashboard
            switch (user.role) {
                case 'SYSTEM_ADMINISTRATOR':
                    navigate('/dashboard/admin');
                    break;
                case 'HERITAGE_MANAGER':
                    navigate('/dashboard/heritage-manager');
                    break;
                case 'CONTENT_MANAGER':
                    navigate('/dashboard/content-manager');
                    break;
                case 'COMMUNITY_MEMBER':
                    navigate('/dashboard/community-member');
                    break;
                default:
                    navigate('/dashboard/community-member'); // Default fallback
            }
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
            </div>
        </div>
    );
};

export default Dashboard; 