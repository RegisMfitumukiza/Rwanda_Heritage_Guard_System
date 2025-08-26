import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RoleBasedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" state={{ from: location, message: "Please sign in to access this page" }} replace />;
    }

    // Check if user has the required role
    if (!allowedRoles.includes(user.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Access Denied
                    </h1>
                    <p className="text-gray-600 mb-4">
                        You don't have permission to access this page.
                    </p>
                    <p className="text-sm text-gray-500">
                        Required roles: {allowedRoles.join(', ')}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Your role: {user.role}
                    </p>
                </div>
            </div>
        );
    }

    return children;
};

export default RoleBasedRoute; 