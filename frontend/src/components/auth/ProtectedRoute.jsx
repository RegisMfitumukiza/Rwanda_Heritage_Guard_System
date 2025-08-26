import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Show loading state while checking authentication
    if (loading) {
        console.log('ProtectedRoute: Loading authentication state...');
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Verifying your session...</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Please wait while we restore your session</p>
                </div>
            </div>
        );
    }

    // Check if user is authenticated
    if (!user) {
        console.log('ProtectedRoute: User not authenticated, redirecting to login from:', location.pathname);
        // Redirect to login page and preserve the intended destination
        return <Navigate to="/login" state={{ from: location, message: "Please sign in to access this page" }} replace />;
    }

    // User is authenticated, render the protected content
    console.log('ProtectedRoute: User authenticated, rendering protected content for:', location.pathname);
    return children;
};

export default ProtectedRoute; 