import React from 'react';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';

const ForgotPassword = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-full max-w-md p-4 sm:p-8 space-y-8 bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="text-center">
        <img
          src="/src/assets/heritage_logo.png"
          alt="Rwanda Heritage Guard"
          className="mx-auto h-12 w-auto"
        />
        <h2 className="mt-6 text-2xl sm:text-3xl font-bold text-gray-900">
          Forgot your password?
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  </div>
);

export default ForgotPassword; 