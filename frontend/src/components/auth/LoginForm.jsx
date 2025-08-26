import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import GoogleLoginButton from './GoogleLoginButton';
import toast from 'react-hot-toast';

const LoginForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        rememberMe: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (location.state?.message) {
            toast.success(location.state.message);
            // Remove the message from state so it doesn't show again
            navigate(location.pathname, { replace: true, state: {} });
        }
        if (location.state?.error) {
            toast.error(location.state.error);
            // Remove the error from state so it doesn't show again
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(formData.username, formData.password, formData.rememberMe);

            // Check if there's a redirect parameter in the URL
            const urlParams = new URLSearchParams(window.location.search);
            const redirectTo = urlParams.get('redirect');

            // Navigate to the redirect URL if available, otherwise to dashboard
            if (redirectTo) {
                navigate(redirectTo);
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            // Use the user-friendly message from axios interceptor if available
            const backendError = err.userFriendlyMessage ||
                err.response?.data?.error ||
                err.response?.data?.message ||
                'Login failed. Please check your credentials.';
            setError(backendError);
            toast.error(backendError, { duration: 5000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="space-y-6 mt-8 p-3 sm:p-4" onSubmit={handleSubmit}>
            {/* Error Display */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <input
                    className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 caret-blue-600 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    type="text"
                    name="username"
                    autoComplete="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
                <div className="relative">
                    <input
                        className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 caret-blue-600 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        autoComplete="current-password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword((v) => !v)}
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.402-3.221 1.125-4.575m2.1-2.1A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.402 3.221-1.125 4.575m-2.1 2.1A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.402-3.221 1.125-4.575" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.274.832-.64 1.624-1.09 2.354M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        )}
                    </button>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            name="rememberMe"
                            type="checkbox"
                            checked={formData.rememberMe}
                            onChange={handleChange}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                            Remember me
                        </label>
                    </div>
                    <button
                        type="button"
                        className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-blue-400 dark:hover:text-blue-300"
                        onClick={() => navigate('/forgot-password')}
                    >
                        Forgot password?
                    </button>
                </div>
            </div>
            <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded mt-4 disabled:opacity-50"
                disabled={loading}
            >
                {loading ? 'Signing in...' : 'Sign in'}
            </button>
            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
                    </div>
                </div>
                <div className="mt-6">
                    <GoogleLoginButton />
                </div>
            </div>
        </form>
    );
};

export default LoginForm; 