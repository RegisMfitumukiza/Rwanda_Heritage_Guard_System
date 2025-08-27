import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [passwordStrength, setPasswordStrength] = useState({
    strength: '',
    score: 0,
    feedback: [],
  });

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
    setSuccess('');
    setLoading(true);
    const token = searchParams.get('token');
    if (!token) {
      setError('Invalid reset token');
      setLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    try {
      const response = await resetPassword(token, formData.password);
      if (response.passwordStrength) {
        setPasswordStrength({
          strength: response.passwordStrength,
          score: response.passwordScore,
          feedback: response.passwordFeedback,
        });
      }
      setSuccess('Password has been reset successfully. You can now login with your new password.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.userFriendlyMessage || err.message || 'Password reset failed');
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
          type="password"
          name="password"
          placeholder="New Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <PasswordStrengthIndicator
          password={formData.password}
          strength={passwordStrength.strength}
          score={passwordStrength.score}
          feedback={passwordStrength.feedback}
        />
        <input
          className="w-full border rounded px-3 py-2"
          type="password"
          name="confirmPassword"
          placeholder="Confirm New Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded mt-4 disabled:opacity-50"
        disabled={loading || passwordStrength.strength === 'Weak'}
      >
        {loading ? 'Resetting password...' : 'Reset Password'}
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

export default ResetPasswordForm; 