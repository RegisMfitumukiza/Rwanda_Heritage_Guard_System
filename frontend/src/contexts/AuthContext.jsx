import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from '../config/axios';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Debug logger utility
const debugLog = (component, action, data = null, error = null) => {
    const timestamp = new Date().toISOString();
    const logData = {
        timestamp,
        component: 'AuthContext',
        action,
        data,
        error: error ? {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            code: error.code
        } : null
    };

    console.log(`🔐 [${timestamp}] ${component}: ${action}`, logData);

    // Store in localStorage for debugging
    try {
        const logs = JSON.parse(localStorage.getItem('auth_debug_logs') || '[]');
        logs.push(logData);
        if (logs.length > 100) logs.shift(); // Keep only last 100 logs
        localStorage.setItem('auth_debug_logs', JSON.stringify(logs));
    } catch (e) {
        console.warn('Could not save debug log:', e);
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [refreshPromise, setRefreshPromise] = useState(null);
    const [debugMode] = useState(true); // Always enable debug mode for now

    // Debug function to get current auth state
    const getAuthState = () => {
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');
        const currentTime = Date.now();

        let tokenInfo = null;
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                tokenInfo = {
                    username: payload.sub,
                    role: payload.role,
                    exp: payload.exp,
                    iat: payload.iat,
                    isExpired: payload.exp * 1000 < currentTime,
                    timeUntilExpiry: payload.exp * 1000 - currentTime,
                    minutesLeft: Math.floor((payload.exp * 1000 - currentTime) / 60000)
                };
            } catch (e) {
                tokenInfo = { error: 'Could not decode token' };
            }
        }

        return {
            hasToken: !!token,
            hasRefreshToken: !!refreshToken,
            tokenInfo,
            user,
            loading,
            error,
            isRefreshing,
            currentTime: new Date(currentTime).toISOString()
        };
    };

    // Enhanced token refresh with detailed logging
    const refreshAccessToken = useCallback(async () => {
        debugLog('refreshAccessToken', 'START', { hasRefreshToken: !!refreshToken });

        if (isRefreshing && refreshPromise) {
            debugLog('refreshAccessToken', 'ALREADY_REFRESHING', { isRefreshing, hasPromise: !!refreshPromise });
            return refreshPromise;
        }

        if (!refreshToken) {
            const error = new Error('No refresh token available');
            debugLog('refreshAccessToken', 'NO_REFRESH_TOKEN', null, error);
            throw error;
        }

        setIsRefreshing(true);
        debugLog('refreshAccessToken', 'SET_REFRESHING', { isRefreshing: true });

        const promise = new Promise(async (resolve, reject) => {
            try {
                debugLog('refreshAccessToken', 'MAKING_REQUEST', { endpoint: '/api/auth/refresh' });

                const response = await axios.post('/api/auth/refresh', {
                    refreshToken: refreshToken
                });

                const { accessToken: newAccessToken } = response.data;
                debugLog('refreshAccessToken', 'SUCCESS', {
                    hasNewToken: !!newAccessToken,
                    tokenLength: newAccessToken?.length
                });

                localStorage.setItem('token', newAccessToken);
                axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

                // Update refresh token if provided
                if (response.data.refreshToken) {
                    localStorage.setItem('refreshToken', response.data.refreshToken);
                    setRefreshToken(response.data.refreshToken);
                }

                resolve(newAccessToken);
            } catch (error) {
                debugLog('refreshAccessToken', 'FAILED', null, error);

                // Only clear tokens on actual auth failures
                if (error.response?.status === 401) {
                    debugLog('refreshAccessToken', 'CLEARING_TOKENS_401', { reason: 'Refresh token invalid' });
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    setRefreshToken(null);
                    setUser(null);
                    delete axios.defaults.headers.common['Authorization'];
                }

                reject(error);
            } finally {
                setIsRefreshing(false);
                setRefreshPromise(null);
                debugLog('refreshAccessToken', 'FINISHED', { isRefreshing: false });
            }
        });

        setRefreshPromise(promise);
        return promise;
    }, [refreshToken, isRefreshing, refreshPromise]);

    // Simplified token validation
    const validateToken = useCallback(async (token) => {
        debugLog('validateToken', 'START', { hasToken: !!token });

        if (!token) {
            debugLog('validateToken', 'NO_TOKEN');
            return false;
        }

        try {
            // Check if token is expired
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;

            debugLog('validateToken', 'TOKEN_DECODED', {
                username: payload.sub,
                role: payload.role,
                exp: payload.exp,
                currentTime,
                isExpired: payload.exp < currentTime
            });

            if (payload.exp < currentTime) {
                debugLog('validateToken', 'TOKEN_EXPIRED', {
                    expiredAt: new Date(payload.exp * 1000).toISOString()
                });
                return false;
            }

            // Validate with backend
            debugLog('validateToken', 'VALIDATING_WITH_BACKEND', { endpoint: '/api/users/profile' });

            const response = await axios.get('/api/users/profile');

            debugLog('validateToken', 'BACKEND_VALIDATION_SUCCESS', {
                username: response.data?.username,
                role: response.data?.role,
                hasUserData: !!response.data
            });

            if (response.data) {
                setUser(response.data);
                return true;
            } else {
                debugLog('validateToken', 'NO_USER_DATA_FROM_BACKEND');
                return false;
            }
        } catch (error) {
            debugLog('validateToken', 'VALIDATION_FAILED', null, error);

            // Handle specific error types
            if (error.response?.status === 401) {
                debugLog('validateToken', 'AUTH_ERROR_401', { reason: 'Unauthorized' });
                return false;
            } else if (error.response?.status === 403) {
                debugLog('validateToken', 'AUTH_ERROR_403', { reason: 'Forbidden' });
                return false;
            } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
                debugLog('validateToken', 'NETWORK_ERROR', { reason: 'Network issue' });
                // Don't fail on network errors, return true to keep user logged in
                return true;
            }

            return false;
        }
    }, []);

    // Main authentication check on app load
    useEffect(() => {
        const initializeAuth = async () => {
            debugLog('initializeAuth', 'START', {
                pathname: window.location.pathname,
                hasToken: !!localStorage.getItem('token'),
                hasRefreshToken: !!localStorage.getItem('refreshToken')
            });

            const token = localStorage.getItem('token');
            const isProtectedPage = !window.location.pathname.match(/^\/(about|contact|login|register|education)$/);

            debugLog('initializeAuth', 'PAGE_ANALYSIS', {
                pathname: window.location.pathname,
                isProtectedPage
            });

            if (!isProtectedPage) {
                debugLog('initializeAuth', 'PUBLIC_PAGE', { action: 'Setting loading to false' });
                setLoading(false);
                return;
            }

            if (!token) {
                debugLog('initializeAuth', 'NO_TOKEN_PROTECTED_PAGE', { action: 'Setting loading to false' });
                setLoading(false);
                return;
            }

            // Set token in axios headers
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            debugLog('initializeAuth', 'TOKEN_SET_IN_HEADERS');

            // Validate token
            const isValid = await validateToken(token);

            if (isValid) {
                debugLog('initializeAuth', 'TOKEN_VALID', { action: 'User authenticated' });
            } else {
                debugLog('initializeAuth', 'TOKEN_INVALID', { action: 'Clearing tokens' });
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                setRefreshToken(null);
                setUser(null);
                delete axios.defaults.headers.common['Authorization'];
            }

            setLoading(false);
            debugLog('initializeAuth', 'COMPLETED', { loading: false });
        };

        initializeAuth();
    }, [validateToken]);

    // Token expiry monitoring
    useEffect(() => {
        if (!refreshToken) return;

        const checkTokenExpiry = () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const currentTime = Date.now();
                const expiryTime = payload.exp * 1000;
                const timeUntilExpiry = expiryTime - currentTime;
                const minutesLeft = Math.floor(timeUntilExpiry / 60000);

                debugLog('checkTokenExpiry', 'CHECKING', {
                    username: payload.sub,
                    minutesLeft,
                    timeUntilExpiry,
                    willExpireSoon: timeUntilExpiry < 300000
                });

                // Refresh if expiring in less than 5 minutes
                if (timeUntilExpiry < 300000 && timeUntilExpiry > 0) {
                    debugLog('checkTokenExpiry', 'REFRESHING_SOON', { minutesLeft });
                    refreshAccessToken().catch(error => {
                        debugLog('checkTokenExpiry', 'REFRESH_FAILED', null, error);
                    });
                }
            } catch (error) {
                debugLog('checkTokenExpiry', 'PARSE_ERROR', null, error);
            }
        };

        const interval = setInterval(checkTokenExpiry, 60000); // Check every minute
        checkTokenExpiry(); // Check immediately

        return () => clearInterval(interval);
    }, [refreshToken, refreshAccessToken]);

    // Axios interceptor for automatic token refresh
    useEffect(() => {
        if (!user) return;

        debugLog('setupAxiosInterceptor', 'START');

        const interceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                debugLog('axiosInterceptor', 'ERROR_DETECTED', {
                    status: error.response?.status,
                    url: originalRequest.url,
                    method: originalRequest.method,
                    isRetry: originalRequest._retry
                });

                // Handle 401 errors with token refresh
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    debugLog('axiosInterceptor', 'ATTEMPTING_TOKEN_REFRESH');

                    try {
                        const newToken = await refreshAccessToken();
                        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

                        debugLog('axiosInterceptor', 'TOKEN_REFRESHED', {
                            action: 'Retrying original request'
                        });

                        return axios(originalRequest);
                    } catch (refreshError) {
                        debugLog('axiosInterceptor', 'REFRESH_FAILED', null, refreshError);

                        // Clear tokens and redirect to login
                        localStorage.removeItem('token');
                        localStorage.removeItem('refreshToken');
                        setRefreshToken(null);
                        setUser(null);
                        delete axios.defaults.headers.common['Authorization'];

                        window.location.href = '/login';
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
            debugLog('setupAxiosInterceptor', 'CLEANUP');
        };
    }, [user, refreshAccessToken]);

    // Login function
    const login = async (username, password) => {
        debugLog('login', 'START', { username });

        try {
            setError(null);
            const response = await axios.post('/api/auth/login', { username, password });

            const { accessToken, refreshToken: newRefreshToken, user: userData } = response.data;

            debugLog('login', 'SUCCESS', {
                username: userData?.username,
                role: userData?.role,
                hasAccessToken: !!accessToken,
                hasRefreshToken: !!newRefreshToken
            });

            localStorage.setItem('token', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            setRefreshToken(newRefreshToken);
            setUser(userData);
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

            return { success: true, user: userData };
        } catch (err) {
            debugLog('login', 'FAILED', null, err);

            let errorMessage = 'Login failed. Please try again.';
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }

            setError(errorMessage);
            throw err;
        }
    };

    // Logout function
    const logout = async (reason = 'User logout') => {
        debugLog('logout', 'START', { reason });

        try {
            if (refreshToken) {
                await axios.post('/api/auth/logout');
            }
        } catch (err) {
            debugLog('logout', 'BACKEND_LOGOUT_FAILED', null, err);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            setRefreshToken(null);
            setUser(null);
            delete axios.defaults.headers.common['Authorization'];
            setIsRefreshing(false);
            setRefreshPromise(null);

            debugLog('logout', 'COMPLETED', { action: 'Local state cleared' });
        }
    };

    // Debug functions
    const debug = {
        getAuthState,
        getDebugLogs: () => {
            try {
                return JSON.parse(localStorage.getItem('auth_debug_logs') || '[]');
            } catch (e) {
                return [];
            }
        },
        clearDebugLogs: () => {
            localStorage.removeItem('auth_debug_logs');
        },
        forceRefresh: () => refreshAccessToken(),
        simulateError: () => {
            debugLog('debug', 'SIMULATED_ERROR', { message: 'This is a test error' });
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        debug,
        // Add other functions as needed
        register: async () => ({ success: false, message: 'Not implemented' }),
        forgotPassword: async () => ({ success: false, message: 'Not implemented' }),
        resetPassword: async () => ({ success: false, message: 'Not implemented' })
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext; 
