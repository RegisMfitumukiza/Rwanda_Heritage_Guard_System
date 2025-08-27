import React from 'react';
import { GoogleOAuthProvider as Provider } from '@react-oauth/google';

const GoogleOAuthProvider = ({ children }) => {
    // Replace 'YOUR_GOOGLE_CLIENT_ID' with the client ID from Google Cloud Console
    // Example: '123456789-abcdef.apps.googleusercontent.com'
    return (
        <Provider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            {children}
        </Provider>
    );
};

export default GoogleOAuthProvider; 