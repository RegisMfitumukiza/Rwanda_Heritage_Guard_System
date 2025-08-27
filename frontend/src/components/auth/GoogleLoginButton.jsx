import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const GoogleLoginButton = () => {
    const { loginWithGoogle } = useAuth();
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    const handleGoogleLogin = () => {
        const redirectUri = `${window.location.origin}/auth/google/callback`;
        const scope = 'email profile';
        const responseType = 'code';
        const accessType = 'offline';
        const prompt = 'consent';

        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${clientId}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&response_type=${responseType}` +
            `&scope=${encodeURIComponent(scope)}` +
            `&access_type=${accessType}` +
            `&prompt=${prompt}`;

        window.location.href = authUrl;
    };

    return (
        <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
            <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="w-5 h-5"
            />
            Continue with Google
        </button>
    );
};

export default GoogleLoginButton; 