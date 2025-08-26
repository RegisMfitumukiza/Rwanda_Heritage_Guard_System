import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../config/axios';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Add refresh token state
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [refreshPromise, setRefreshPromise] = useState(null);

    // Proactive token refresh before expiration
    useEffect(() => {
        if (!refreshToken) return;

        const checkTokenExpiry = () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const expiryTime = payload.exp * 1000; // Convert to milliseconds
                const currentTime = Date.now();
                const timeUntilExpiry = expiryTime - currentTime;
                const minutesLeft = Math.floor(timeUntilExpiry / 60000);

                // Show warning if token expires in less than 10 minutes
                if (timeUntilExpiry < 600000 && timeUntilExpiry > 0) {
                    showTokenExpiryWarning(minutesLeft);
                }

                // Refresh token if it expires in less than 5 minutes
                if (timeUntilExpiry < 300000 && timeUntilExpiry > 0) {
                    console.log('Token expiring soon, refreshing proactively...');
                    refreshAccessToken();
                }
            } catch (error) {
                console.error('Error parsing token:', error);
            }
        };

        // Check every 30 seconds for better responsiveness
        const interval = setInterval(checkTokenExpiry, 30000);
        checkTokenExpiry(); // Check immediately

        return () => clearInterval(interval);
    }, [refreshToken]);

    // Improved token refresh function with better race condition handling
    const refreshAccessToken = async () => {
        // If already refreshing, wait for the current refresh to complete
        if (isRefreshing) {
            if (refreshPromise) {
                return refreshPromise;
            }
            // Wait for current refresh to complete
            return new Promise((resolve, reject) => {
                const checkComplete = setInterval(() => {
                    if (!isRefreshing) {
                        clearInterval(checkComplete);
                        const token = localStorage.getItem('token');
                        if (token) {
                            resolve(token);
                        } else {
                            reject(new Error('Token refresh failed'));
                        }
                    }
                }, 100);
            });
        }

        setIsRefreshing(true);
        const promise = new Promise(async (resolve, reject) => {
            try {
                console.log('Refreshing access token...');
                const response = await axios.post('/api/auth/refresh', {
                    refreshToken: refreshToken
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data;

                // Update tokens
                localStorage.setItem('token', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);
                setRefreshToken(newRefreshToken);
                axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

                console.log('Token refreshed successfully');
                resolve(accessToken);
            } catch (error) {
                console.error('Token refresh failed:', error);

                // Provide user-friendly error message
                let errorMessage = 'Your session has expired. Please log in again.';

                if (error.response?.status === 401) {
                    errorMessage = 'Your session has expired. Please log in again.';
                } else if (error.response?.status === 403) {
                    errorMessage = 'Access denied. Please log in again.';
                } else if (error.response?.status === 500) {
                    errorMessage = 'Server is temporarily unavailable. Please try again in a few minutes.';
                } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
                    errorMessage = 'Unable to connect to the server. Please check your connection and try again.';
                } else if (error.message?.includes('timeout')) {
                    errorMessage = 'Request timed out. Please try again.';
                }

                // Show user-friendly error message
                if (window.toast) {
                    window.toast.error(errorMessage);
                }

                // Clear tokens on refresh failure
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                setRefreshToken(null);
                setUser(null);
                delete axios.defaults.headers.common['Authorization'];
                reject(error);
            } finally {
                setIsRefreshing(false);
                setRefreshPromise(null);
            }
        });

        // Add token persistence check on page load
        useEffect(() => {
            const checkTokenPersistence = () => {
                const token = localStorage.getItem('token');
                const refreshToken = localStorage.getItem('refreshToken');

                if (token && refreshToken) {
                    // Try to decode token to check if it's still valid
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        const currentTime = Date.now() / 1000;

                        if (payload.exp && payload.exp > currentTime) {
                            // Token is still valid, set it in axios headers
                            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                            setRefreshToken(refreshToken);

                            // Set temporary user from token payload
                            const tempUser = {
                                username: payload.sub || 'user',
                                role: payload.role || 'COMMUNITY_MEMBER',
                                id: payload.userId || 1,
                                email: payload.email || '',
                                enabled: true
                            };
                            setUser(tempUser);
                            console.log('Restored user session from persistent token');
                        }
                    } catch (error) {
                        console.log('Failed to decode persistent token:', error);
                    }
                }
            };

            // Check on mount and on focus (when user returns to tab)
            checkTokenPersistence();
            window.addEventListener('focus', checkTokenPersistence);

            return () => window.removeEventListener('focus', checkTokenPersistence);
        }, []);

        setRefreshPromise(promise);
        return promise;
    };

    // Show token expiration warning
    const showTokenExpiryWarning = (minutesLeft) => {
        if (minutesLeft <= 5) {
            // Show warning notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Session Expiring Soon', {
                    body: `Your session will expire in ${minutesLeft} minutes. Please save your work.`,
                    icon: '/heritage_favicon.png'
                });
            }

            // Show toast notification
            if (window.toast) {
                window.toast.warning(`Session expiring in ${minutesLeft} minutes. Saving your work...`);
            }
        }
    };

    // Clear any existing tokens for development
    // useEffect(() => {
    //     localStorage.removeItem('token');
    //     localStorage.removeItem('refreshToken');
    //     setRefreshToken(null);
    // }, []);

    // Hydrate user on app load if token exists
    useEffect(() => {
        const token = localStorage.getItem('token');
        console.log('App load useEffect - Token exists:', !!token);

        // Check if current page requires authentication
        const isProtectedPage = !window.location.pathname.match(/^\/(about|contact|login|register|education)$/);
        const isPublicPage = !isProtectedPage;

        console.log('Current path:', window.location.pathname, 'Is protected page:', isProtectedPage);

        if (isPublicPage) {
            // For public pages, don't validate token at all to avoid redirects
            console.log('Public page detected, setting loading to false');
            setLoading(false);
            return;
        }

        // For protected pages, we need to validate the token
        if (token) {
            // Only validate token for protected pages
            console.log('Token found, validating for protected page');

            // Check if token is expired before making the request
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const currentTime = Date.now() / 1000; // Convert to seconds

                if (payload.exp && payload.exp < currentTime) {
                    console.log('Token is expired, clearing tokens');
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    setRefreshToken(null);
                    setUser(null);
                    delete axios.defaults.headers.common['Authorization'];
                    setLoading(false);
                    return;
                }

                console.log('Token is valid, expiration:', new Date(payload.exp * 1000));
            } catch (decodeError) {
                console.log('Could not decode token, clearing tokens');
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                setRefreshToken(null);
                setUser(null);
                delete axios.defaults.headers.common['Authorization'];
                setLoading(false);
                return;
            }

            // Set the token in axios headers immediately
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Also set the refresh token if available
            const storedRefreshToken = localStorage.getItem('refreshToken');
            if (storedRefreshToken) {
                setRefreshToken(storedRefreshToken);
            }

            // Validate the token with the backend
            const validateToken = async () => {
                try {
                    console.log('Validating token with backend...');
                    console.log('Making request to:', '/api/users/profile');
                    console.log('Authorization header:', `Bearer ${token}`);

                    const res = await axios.get('/api/users/profile');

                    console.log('Profile API response:', res.data);
                    if (res.data) {
                        console.log('Setting user from profile API:', res.data);
                        setUser(res.data);
                        console.log('User authenticated successfully:', res.data.username);
                    } else {
                        console.log('No user data in response, clearing tokens');
                        localStorage.removeItem('token');
                        localStorage.removeItem('refreshToken');
                        setRefreshToken(null);
                        setUser(null);
                        delete axios.defaults.headers.common['Authorization'];
                    }
                } catch (error) {
                    console.log('Token validation failed:', error.message);
                    console.log('Error response:', error.response);
                    console.log('Error config:', error.config);
                    console.log('Error status:', error.response?.status);
                    console.log('Error data:', error.response?.data);

                    // Only clear tokens on actual auth failures, not network errors
                    if (error.response?.status === 401) {
                        console.log('401 error detected, clearing tokens');
                        localStorage.removeItem('token');
                        localStorage.removeItem('refreshToken');
                        setRefreshToken(null);
                        setUser(null);
                        delete axios.defaults.headers.common['Authorization'];
                    } else if (error.response?.status === 403) {
                        console.log('403 error detected - Forbidden, clearing tokens');
                        localStorage.removeItem('token');
                        localStorage.removeItem('refreshToken');
                        setRefreshToken(null);
                        setUser(null);
                        delete axios.defaults.headers.common['Authorization'];
                    } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
                        // For network errors, don't clear tokens immediately, just log
                        console.log('Network error during token validation, keeping tokens for now');
                        // Set a temporary user state to prevent immediate redirect
                        // This allows the user to stay on the page if they have a valid token
                        if (token) {
                            console.log('Network error but token exists, setting temporary user state');
                            // Try to decode the token to get basic user info
                            try {
                                const payload = JSON.parse(atob(token.split('.')[1]));
                                const tempUser = {
                                    username: payload.sub || 'user',
                                    role: payload.role || 'COMMUNITY_MEMBER',
                                    // Add other required fields
                                    id: payload.userId || 1,
                                    email: payload.email || '',
                                    enabled: true
                                };
                                setUser(tempUser);
                                console.log('Set temporary user state:', tempUser);

                                // Try to validate the token again after a short delay
                                setTimeout(() => {
                                    console.log('Retrying token validation after network error...');
                                    validateToken();
                                }, 2000);
                            } catch (decodeError) {
                                console.log('Could not decode token, clearing tokens');
                                localStorage.removeItem('token');
                                localStorage.removeItem('refreshToken');
                                setRefreshToken(null);
                                setUser(null);
                                delete axios.defaults.headers.common['Authorization'];
                            }
                        }
                    } else {
                        // For other errors, log but don't clear tokens immediately
                        console.log('Other error during token validation, keeping tokens for now');
                        if (token) {
                            // Try to decode the token to get basic user info
                            try {
                                const payload = JSON.parse(atob(token.split('.')[1]));
                                const tempUser = {
                                    username: payload.sub || 'user',
                                    role: payload.role || 'COMMUNITY_MEMBER',
                                    id: payload.userId || 1,
                                    email: payload.email || '',
                                    enabled: true
                                };
                                setUser(tempUser);
                                console.log('Set temporary user state for other error:', tempUser);
                            } catch (decodeError) {
                                console.log('Could not decode token, clearing tokens');
                                localStorage.removeItem('token');
                                localStorage.removeItem('refreshToken');
                                setRefreshToken(null);
                                setUser(null);
                                delete axios.defaults.headers.common['Authorization'];
                            }
                        }
                    }
                } finally {
                    console.log('Token validation completed, setting loading to false');
                    setLoading(false);
                }
            };

            // Start validation
            validateToken();
        } else {
            console.log('No token found for protected page, setting loading to false');
            // If we're on a protected page and have no token, we should redirect to login
            // But let the ProtectedRoute handle this to avoid conflicts
            setLoading(false);
        }
    }, []);

    // Add a separate effect to handle route changes and maintain authentication state
    useEffect(() => {
        const handleRouteChange = () => {
            const token = localStorage.getItem('token');
            const currentPath = window.location.pathname;

            // If we have a token and we're on a public page, we might want to redirect to dashboard
            if (token && user && currentPath === '/') {
                console.log('User is authenticated and on landing page, considering redirect to dashboard');
                // Don't auto-redirect, let user decide
            }
        };

        // Listen for route changes
        window.addEventListener('popstate', handleRouteChange);
        return () => window.removeEventListener('popstate', handleRouteChange);
    }, [user]);

    // Add a mechanism to prevent unnecessary redirects during authentication
    useEffect(() => {
        // If we have a user but we're still loading, it means we're in the middle of authentication
        if (user && loading) {
            console.log('User exists but still loading, preventing unnecessary redirects');
            // Set loading to false to prevent the ProtectedRoute from showing loading state
            setLoading(false);
        }

        // If we have a token but no user, we might be in the middle of authentication
        const token = localStorage.getItem('token');
        if (token && !user && !loading) {
            console.log('Token exists but no user, might be in authentication process');
            // Don't redirect immediately, let the authentication process complete
        }
    }, [user, loading]);

    // Set up axios interceptor for token refresh (only after initial auth check)
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && user) { // Only set up interceptor if we have both token and user
            console.log('Setting up axios interceptor for token refresh');
            // Set up axios interceptor for token refresh
            const interceptor = axios.interceptors.response.use(
                (response) => response,
                async (error) => {
                    const originalRequest = error.config;

                    // If error is 401 and we haven't tried to refresh the token yet
                    if (error.response?.status === 401 && !originalRequest._retry) {
                        originalRequest._retry = true;

                        try {
                            // Use the improved refresh function
                            const newToken = await refreshAccessToken();

                            // Update the original request with new token
                            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                            return axios(originalRequest);
                        } catch (refreshError) {
                            // Enhanced error handling for refresh failures
                            console.error('Token refresh failed:', refreshError);

                            let errorMessage = 'Your session has expired. Please log in again.';

                            // Provide specific error messages based on error type
                            if (refreshError.response?.status === 401) {
                                errorMessage = 'Your session has expired. Please log in again.';
                            } else if (refreshError.response?.status === 403) {
                                errorMessage = 'Access denied. Please log in again.';
                            } else if (refreshError.code === 'NETWORK_ERROR' ||
                                refreshError.message?.includes('Network Error')) {
                                errorMessage = 'Network connection lost. Please check your connection and try again.';
                            } else if (refreshError.message?.includes('timeout')) {
                                errorMessage = 'Request timed out. Please try again.';
                            }

                            // Show user-friendly message before redirect
                            if (window.toast) {
                                window.toast.error(errorMessage);
                            }

                            // Clear tokens on refresh failure
                            localStorage.removeItem('token');
                            localStorage.removeItem('refreshToken');
                            setRefreshToken(null);
                            setUser(null);
                            delete axios.defaults.headers.common['Authorization'];

                            // Small delay to show the message before redirect
                            setTimeout(() => {
                                window.location.href = '/login';
                            }, 1500);

                            return Promise.reject(refreshError);
                        }
                    }

                    // Handle server down scenarios for non-auth requests
                    if (error.response?.status === 500 && !originalRequest._retry) {
                        originalRequest._retry = true;

                        // Show user-friendly message for server errors
                        if (window.toast) {
                            window.toast.error('Server is temporarily unavailable. Please try again in a few minutes.');
                        }
                    }

                    return Promise.reject(error);
                }
            );

            // Cleanup interceptor on unmount
            return () => {
                axios.interceptors.response.eject(interceptor);
            };
        }
    }, [user, refreshAccessToken]);

    // Enhanced network error handling with retry logic
    const handleNetworkError = (error) => {
        if (error.code === 'NETWORK_ERROR' ||
            error.message.includes('Network Error') ||
            error.message.includes('ERR_NETWORK') ||
            error.message.includes('Failed to fetch')) {

            console.log('Network error detected, will retry when connection is restored');

            // Show user-friendly message
            if (window.toast) {
                window.toast.error('Network connection lost. Please check your internet connection.');
            }

            // Don't logout on network errors, just show a message
            return false; // Don't logout
        }

        // Handle timeout errors
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            console.log('Request timeout detected');
            if (window.toast) {
                window.toast.error('Request timed out. Please try again.');
            }
            return false; // Don't logout on timeout
        }

        return true; // Should logout for other errors
    };

    // Improved logout function with better error handling
    const logout = async (reason = 'User logout') => {
        try {
            console.log(`Logging out user: ${reason}`);

            // Call logout endpoint to invalidate refresh token
            if (refreshToken) {
                await axios.post('/api/auth/logout');
            }
        } catch (err) {
            console.error('Logout error:', err);
            // Don't fail logout on server errors
        } finally {
            // Clear local storage and state regardless of server response
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            setRefreshToken(null);
            setUser(null);
            delete axios.defaults.headers.common['Authorization'];

            // Clear any pending refresh operations
            setIsRefreshing(false);
            setRefreshPromise(null);

            console.log('User logged out successfully');
        }
    };

    const login = async (username, password) => {
        try {
            setError(null);
            const response = await axios.post('/api/auth/login', { username, password });
            const { accessToken, refreshToken: newRefreshToken, user: userData } = response.data;

            // Enhanced user data structure with proper role handling
            const enhancedUser = {
                ...userData,
                // Ensure role is properly set
                role: userData.role || 'COMMUNITY_MEMBER', // Default fallback
                fullName: userData.fullName || (userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : null),
                profilePictureUrl: userData.profilePictureUrl || null,
                authType: 'regular'
            };

            // Debug logging
            console.log('Login response:', response.data);
            console.log('User data from backend:', userData);
            console.log('Enhanced user object:', enhancedUser);

            localStorage.setItem('token', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            setRefreshToken(newRefreshToken);

            // Set user state with additional debugging
            console.log('Setting user state to:', enhancedUser);
            setUser(enhancedUser);

            // Verify user state was set
            setTimeout(() => {
                console.log('User state after setting:', enhancedUser);
                console.log('Current user state:', user);
            }, 100);

            // Set up axios default header
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        } catch (err) {
            // Use the user-friendly message from axios interceptor if available
            let errorMessage = err.userFriendlyMessage || 'Login failed. Please try again.';

            // Fallback to our custom error handling if axios interceptor didn't provide a message
            if (!err.userFriendlyMessage) {
                if (err.response?.status === 401) {
                    // Check if it's a credential error or account status issue
                    const responseData = err.response?.data;
                    if (responseData?.message) {
                        if (responseData.message.toLowerCase().includes('locked') ||
                            responseData.message.toLowerCase().includes('disabled')) {
                            errorMessage = 'Your account is locked or disabled. Please contact support.';
                        } else if (responseData.message.toLowerCase().includes('invalid') ||
                            responseData.message.toLowerCase().includes('credentials')) {
                            errorMessage = 'Invalid username or password. Please check your credentials and try again.';
                        } else {
                            errorMessage = responseData.message;
                        }
                    } else {
                        errorMessage = 'Invalid username or password. Please check your credentials and try again.';
                    }
                } else if (err.response?.status === 403) {
                    errorMessage = 'Your account is locked or disabled. Please contact support.';
                } else if (err.response?.status === 500) {
                    errorMessage = 'Server is temporarily unavailable. Please try again in a few minutes.';
                } else if (err.code === 'NETWORK_ERROR' || err.message?.includes('Network Error')) {
                    errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
                } else if (err.message?.includes('timeout')) {
                    errorMessage = 'Login request timed out. Please try again.';
                } else if (err.response?.data?.message) {
                    // Use server-provided message if available
                    errorMessage = err.response.data.message;
                }
            }

            setError(errorMessage);
            throw err;
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post('/api/auth/register', {
                username: userData.username,
                email: userData.email,
                password: userData.password,
                firstName: userData.firstName,
                lastName: userData.lastName,
                preferredLanguage: userData.preferredLanguage || 'en'
            });

            if (response.data.success) {
                toast.success('Registration successful! Please check your email to verify your account.');
                return { success: true, message: 'Registration successful! Please check your email to verify your account.' };
            } else {
                const errorMessage = response.data.message || 'Registration failed. Please try again.';
                toast.error(errorMessage);
                return { success: false, message: errorMessage };
            }
        } catch (err) {
            // Use the user-friendly message from axios interceptor if available
            let errorMessage = err.userFriendlyMessage || 'Registration failed. Please try again.';

            // Fallback to our custom error handling if axios interceptor didn't provide a message
            if (!err.userFriendlyMessage) {
                if (err.response?.status === 400) {
                    if (err.response.data?.message) {
                        errorMessage = err.response.data.message;
                    } else {
                        errorMessage = 'Please check your input and try again.';
                    }
                } else if (err.response?.status === 409) {
                    if (err.response.data?.message?.includes('username')) {
                        errorMessage = 'Username already exists. Please choose a different username.';
                    } else if (err.response.data?.message?.includes('email')) {
                        errorMessage = 'Email already registered. Please use a different email or try logging in.';
                    } else {
                        errorMessage = 'This account already exists. Please try logging in instead.';
                    }
                } else if (err.response?.status === 422) {
                    errorMessage = 'Please check your input and try again.';
                } else if (err.response?.status === 500) {
                    errorMessage = 'Server is temporarily unavailable. Please try again in a few minutes.';
                } else if (err.code === 'NETWORK_ERROR' || err.message?.includes('Network Error')) {
                    errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
                } else if (err.message?.includes('timeout')) {
                    errorMessage = 'Registration request timed out. Please try again.';
                }
            }

            toast.error(errorMessage);
            return { success: false, message: errorMessage };
        }
    };

    const forgotPassword = async (email) => {
        try {
            await axios.post('/api/auth/forgot-password', { email });
            return { success: true, message: 'Password reset instructions have been sent to your email.' };
        } catch (error) {
            // Use the user-friendly message from axios interceptor if available
            let errorMessage = error.userFriendlyMessage || 'Failed to send password reset. Please try again.';

            // Fallback to our custom error handling if axios interceptor didn't provide a message
            if (!error.userFriendlyMessage) {
                if (error.response?.status === 400) {
                    errorMessage = 'Please provide a valid email address.';
                } else if (error.response?.status === 404) {
                    errorMessage = 'If an account exists with that email, we have sent password reset instructions.';
                } else if (error.response?.status === 500) {
                    errorMessage = 'Server is temporarily unavailable. Please try again in a few minutes.';
                } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
                    errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
                } else if (error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                }
            }

            return { success: false, message: errorMessage };
        }
    };

    const resetPassword = async (token, newPassword) => {
        try {
            const response = await axios.post('/api/auth/reset-password', { token, newPassword });
            return {
                success: true,
                data: {
                    message: response.data.message,
                    passwordStrength: response.data.passwordStrength,
                    suggestions: response.data.suggestions
                }
            };
        } catch (error) {
            // Use the user-friendly message from axios interceptor if available
            let errorMessage = error.userFriendlyMessage || 'Failed to reset password. Please try again.';

            // Fallback to our custom error handling if axios interceptor didn't provide a message
            if (!error.userFriendlyMessage) {
                if (error.response?.status === 400) {
                    if (error.response.data?.message?.includes('password')) {
                        errorMessage = 'Please ensure your password meets the security requirements.';
                    } else if (error.response.data?.message?.includes('token')) {
                        errorMessage = 'Invalid or expired reset token. Please request a new password reset.';
                    } else {
                        errorMessage = 'Please check your input and try again.';
                    }
                } else if (error.response?.status === 401) {
                    errorMessage = 'Invalid or expired reset token. Please request a new password reset.';
                } else if (error.response?.status === 500) {
                    errorMessage = 'Server is temporarily unavailable. Please try again in a few minutes.';
                } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
                    errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
                } else if (error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                }
            }

            return { success: false, message: errorMessage };
        }
    };

    const authenticateWithGoogle = async (googleToken) => {
        try {
            const response = await axios.post('/api/auth/google', { token: googleToken });
            const { token, username, role, email, enabled, accountNonLocked } = response.data;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser({ username, role, email, enabled, accountNonLocked });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    };

    const loginWithGoogle = async (code) => {
        try {
            const response = await axios.post('/api/auth/google/callback', { code });
            const { token, username, role, email, enabled, accountNonLocked, ...googleData } = response.data;

            // Enhanced user data for Google users
            const enhancedUser = {
                username,
                role,
                email,
                enabled,
                accountNonLocked,
                // Google-specific data
                fullName: googleData.fullName || googleData.name || (googleData.firstName && googleData.lastName ? `${googleData.firstName} ${googleData.lastName}` : null),
                profilePictureUrl: googleData.picture || googleData.profilePictureUrl,
                authType: 'google'
            };

            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(enhancedUser);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to authenticate with Google'
            };
        }
    };

    const verifyEmail = async (token) => {
        try {
            await axios.post('/api/auth/verify-email', null, {
                params: { token }
            });
        } catch (error) {
            throw error.response?.data || error;
        }
    };

    const resendVerificationEmail = async (email) => {
        try {
            await axios.post('/api/auth/resend-verification', { email });
        } catch (error) {
            throw error.response?.data || error;
        }
    };

    const requestAccountUnlock = async (email) => {
        try {
            await axios.post('/api/auth/request-unlock', { email });
        } catch (error) {
            throw error.response?.data || error;
        }
    };

    const unlockAccount = async (token) => {
        try {
            await axios.post('/api/auth/unlock-account', null, {
                params: { token }
            });
        } catch (error) {
            throw error.response?.data || error;
        }
    };

    const googleLogin = async (code) => {
        try {
            const response = await axios.post('/api/auth/google/callback', { code });
            const { token, username, role, email, enabled, accountNonLocked } = response.data;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser({ username, role, email, enabled, accountNonLocked });
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to authenticate with Google'
            };
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        register,
        forgotPassword,
        resetPassword,
        verifyEmail,
        resendVerificationEmail,
        requestAccountUnlock,
        unlockAccount,
        googleLogin,
        loginWithGoogle,
        updateUser: (updatedUser) => {
            setUser(updatedUser);
        },
        // Debug function to clear auth state
        clearAuth: () => {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            setRefreshToken(null);
            setUser(null);
            setLoading(false);
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext; 
