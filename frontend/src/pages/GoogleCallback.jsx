import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const GoogleCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { loginWithGoogle } = useAuth();

    useEffect(() => {
        const handleCallback = async () => {
            const params = new URLSearchParams(location.search);
            const code = params.get('code');

            if (code) {
                try {
                    const result = await loginWithGoogle(code);
                    if (result.success) {
                        navigate('/dashboard');
                    } else {
                        // Show the actual error message from the backend
                        console.error('Google login error:', result.error);
                        navigate('/login', { state: { error: result.error || 'Google login failed' } });
                    }
                } catch (error) {
                    // Show the actual error message if available
                    console.error('Google login exception:', error);
                    const errorMessage = error?.response?.data?.message || error?.message || 'Google login failed';
                    navigate('/login', { state: { error: errorMessage } });
                }
            } else {
                navigate('/login', { state: { error: 'No authorization code received' } });
            }
        };

        handleCallback();
    }, [location, navigate, loginWithGoogle]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-4 sm:p-8 bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading...</p>
            </div>
        </div>
    );
};

export default GoogleCallback; 