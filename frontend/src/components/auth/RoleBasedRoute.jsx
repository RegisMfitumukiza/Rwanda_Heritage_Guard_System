import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RoleBasedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();
    const [retryCount, setRetryCount] = useState(0);
    const [showRetryMessage, setShowRetryMessage] = useState(false);

    // Handle temporary authentication states
    useEffect(() => {
        if (user && user.username === 'user' && user.role === 'COMMUNITY_MEMBER' && user.id === 1) {
            // This is a temporary user state, likely due to network issues
            setShowRetryMessage(true);

            // Auto-retry after 5 seconds
            const timer = setTimeout(() => {
                setRetryCount(prev => prev + 1);
                setShowRetryMessage(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [user]);

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
        // If this is a temporary user state, show a different message
        if (user.username === 'user' && user.role === 'COMMUNITY_MEMBER' && user.id === 1) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            Session Restoring...
                        </h1>
                        <p className="text-gray-600 mb-4">
                            We're having trouble connecting to the server. Please wait while we restore your session.
                        </p>
                        {showRetryMessage && (
                            <p className="text-sm text-blue-600 mt-2">
                                Retrying in a few seconds... (Attempt {retryCount + 1})
                            </p>
                        )}
                        <div className="mt-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
                        </div>
                    </div>
                </div>
            );
        }

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