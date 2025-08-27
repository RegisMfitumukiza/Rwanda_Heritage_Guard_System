import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ForgotPasswordForm = () => {
    const navigate = useNavigate();
    const { forgotPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!email) {
            setError('Email is required');
            return;
        }
        setLoading(true);
        try {
            await forgotPassword(email);
            setSuccess('Password reset instructions have been sent to your email.');
            setEmail('');
        } catch (err) {
            setError(err.userFriendlyMessage || err.message || 'Failed to send reset instructions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="space-y-6 mt-8 p-3 sm:p-4" onSubmit={handleSubmit}>
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">{error}</div>
            )}
            {success && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm">{success}</div>
            )}
            <div className="space-y-4">
                <input
                    className="w-full border rounded px-3 py-2"
                    type="email"
                    name="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded mt-4 disabled:opacity-50"
                disabled={loading}
            >
                {loading ? 'Sending instructions...' : 'Send reset instructions'}
            </button>
            <p className="text-center text-sm text-gray-600 mt-4">
                Remember your password?{' '}
                <button
                    type="button"
                    className="text-primary-600 hover:text-primary-500 font-medium"
                    onClick={() => navigate('/login')}
                >
                    Sign in
                </button>
            </p>
        </form>
    );
};

export default ForgotPasswordForm; 