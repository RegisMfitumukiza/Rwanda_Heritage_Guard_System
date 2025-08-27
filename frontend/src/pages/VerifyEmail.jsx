import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';

const VerifyEmail = () => {
    const [isVerifying, setIsVerifying] = useState(true);
    const [isResending, setIsResending] = useState(false);
    const [email, setEmail] = useState('');
    const { verifyEmail, resendVerificationEmail } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
        if (token) {
            verifyEmailToken();
        } else {
            setIsVerifying(false);
        }
    }, [token]);

    const verifyEmailToken = async () => {
        try {
            await verifyEmail(token);
            toast.success('Email verified successfully! You can now log in.');
            navigate('/login', {
                state: { message: 'Email verified successfully! You can now log in.' }
            });
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to verify email. Please try again.';
            toast.error(errorMessage);
            setIsVerifying(false);
        }
    };

    const handleResendVerification = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Please enter your email address');
            return;
        }

        setIsResending(true);
        try {
            await resendVerificationEmail(email);
            toast.success('If an account exists with that email, we have sent a new verification email.');
        } catch (error) {
            // For security reasons, we show the same message regardless of the error
            toast.success('If an account exists with that email, we have sent a new verification email.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-md p-4 sm:p-8 space-y-8 bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="text-center">
                    <img
                        src="/src/assets/heritage_logo.png"
                        alt="Rwanda Heritage Guard"
                        className="mx-auto h-12 w-auto"
                    />
                    <h2 className="mt-6 text-2xl sm:text-3xl font-bold text-gray-900">
                        Email Verification
                    </h2>
                    {isVerifying ? (
                        <div className="mt-4">
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                            </div>
                            <p className="mt-4 text-sm text-gray-600">
                                Verifying your email...
                            </p>
                        </div>
                    ) : (
                        <div className="mt-4 space-y-4">
                            <p className="text-sm text-gray-600">
                                {token ? 'Invalid or expired verification link.' : 'Please verify your email to continue.'}
                            </p>
                            <form onSubmit={handleResendVerification} className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isResending}
                                >
                                    {isResending ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                                            Sending...
                                        </div>
                                    ) : (
                                        'Resend verification email'
                                    )}
                                </Button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail; 