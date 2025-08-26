import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import axios from '../../config/axios';
import toast from 'react-hot-toast';

const RegisterForm = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        preferredLanguage: 'en',
    });
    const [passwordStrength, setPasswordStrength] = useState({
        strength: '',
        score: 0,
        feedback: [],
    });

    const languages = [
        { value: 'en', label: 'English' },
        { value: 'rw', label: 'Kinyarwanda' },
        { value: 'fr', label: 'French' },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (name === 'password') {
            const calculateStrength = (password) => {
                let score = 0;
                const feedback = [];
                if (password.length >= 8) {
                    score += 1;
                    if (password.length >= 12) {
                        score += 1;
                        if (password.length >= 16) {
                            score += 1;
                        }
                    }
                } else {
                    feedback.push('Password should be at least 8 characters long');
                }
                if (/[A-Z]/.test(password)) score += 1;
                else feedback.push('Add uppercase letters');
                if (/[a-z]/.test(password)) score += 1;
                else feedback.push('Add lowercase letters');
                if (/[0-9]/.test(password)) score += 1;
                else feedback.push('Add numbers');
                if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 2;
                else feedback.push('Add special characters');
                let strength;
                if (score >= 8) strength = 'Very Strong';
                else if (score >= 6) strength = 'Strong';
                else if (score >= 4) strength = 'Medium';
                else strength = 'Weak';
                return { strength, score, feedback };
            };
            setPasswordStrength(calculateStrength(value));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            toast.error('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const response = await register({
                ...formData,
                username: formData.email, // Use email as username
                // Let backend determine role based on email pattern
            });

            if (response.success) {
                if (response.data.passwordStrength) {
                    setPasswordStrength({
                        strength: response.data.passwordStrength,
                        score: response.data.passwordScore,
                        feedback: response.data.passwordFeedback,
                    });
                }

                toast.success('Registration successful! Please check your email to verify your account.');
                navigate('/login');
            } else {
                setError(response.error || 'Registration failed');
                toast.error(response.error || 'Registration failed');
            }
        } catch (err) {
            const errorMessage = err.userFriendlyMessage || err.message || 'Registration failed';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="space-y-6 mt-8 p-3 sm:p-4" onSubmit={handleSubmit}>
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">{error}</div>
            )}
            <div className="space-y-4">
                <input
                    className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 caret-blue-600 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                />
                <input
                    className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 caret-blue-600 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                />
                <input
                    className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 caret-blue-600 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="Email address (will be used as username)"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preferred Language</label>
                    <select
                        className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        name="preferredLanguage"
                        value={formData.preferredLanguage}
                        onChange={handleChange}
                        required
                    >
                        {languages.map((lang) => (
                            <option key={lang.value} value={lang.value}>{lang.label}</option>
                        ))}
                    </select>
                </div>
                <input
                    className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 caret-blue-600 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <PasswordStrengthIndicator password={formData.password} strength={passwordStrength.strength} score={passwordStrength.score} feedback={passwordStrength.feedback} />
                <input
                    className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 caret-blue-600 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    type="password"
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                />
            </div>
            <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
                disabled={loading}
            >
                {loading ? 'Registering...' : 'Register'}
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Your email address will be used as your username for login.
            </p>
        </form>
    );
};

export default RegisterForm; 