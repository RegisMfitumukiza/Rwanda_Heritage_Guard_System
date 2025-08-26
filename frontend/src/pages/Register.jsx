import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const Register = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header - Industry Standard Pattern */}
            <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo + Brand - Left Side */}
                        <Link
                            to="/"
                            className="flex items-center gap-3 text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            <img
                                src="/src/assets/heritage_logo.png"
                                alt="HeritageGuard"
                                className="h-8 w-auto"
                            />
                            <span className="text-xl font-bold">HeritageGuard</span>
                        </Link>

                        {/* Theme Toggle - Right Side */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                        >
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content - Centered Form */}
            <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
                <div className="w-full max-w-md">
                    {/* Form Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            Create your account
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Join HeritageGuard today
                        </p>
                    </div>

                    {/* Register Form */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
                        <RegisterForm />
                    </div>

                    {/* Footer Links */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Register; 