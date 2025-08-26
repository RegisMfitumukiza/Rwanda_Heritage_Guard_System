import React, { useState } from 'react';
import axios from '../../config/axios';

const AdminUserCreation = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        requestedRole: 'HERITAGE_MANAGER',
        organization: '',
        position: '',
        phoneNumber: '',
        location: '',
        bio: '',
        preferredLanguage: 'en',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const roles = [
        { value: 'HERITAGE_MANAGER', label: 'Heritage Manager' },
        { value: 'CONTENT_MANAGER', label: 'Content Manager' },
        { value: 'SYSTEM_ADMINISTRATOR', label: 'System Administrator' },
    ];

    const languages = [
        { value: 'en', label: 'English' },
        { value: 'rw', label: 'Kinyarwanda' },
        { value: 'fr', label: 'French' },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('/api/auth/admin/create-user', {
                ...formData,
                username: formData.email, // Use email as username
            });
            setSuccess(`User created successfully! Role: ${response.data.role}`);
            setFormData({
                email: '',
                password: '',
                confirmPassword: '',
                fullName: '',
                requestedRole: 'HERITAGE_MANAGER',
                organization: '',
                position: '',
                phoneNumber: '',
                location: '',
                bio: '',
                preferredLanguage: 'en',
            });
        } catch (err) {
            setError(err.userFriendlyMessage || err.response?.data?.message || err.message || 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Admin User Creation</h2>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded-md text-sm mb-4">
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                        className="w-full border rounded px-3 py-2"
                        name="requestedRole"
                        value={formData.requestedRole}
                        onChange={handleChange}
                        required
                    >
                        {roles.map((role) => (
                            <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                    </select>
                </div>

                <input
                    className="w-full border rounded px-3 py-2"
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                />

                <input
                    className="w-full border rounded px-3 py-2"
                    type="email"
                    name="email"
                    placeholder="Email address (will be used as username)"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />

                <input
                    className="w-full border rounded px-3 py-2"
                    type="text"
                    name="organization"
                    placeholder="Organization"
                    value={formData.organization}
                    onChange={handleChange}
                    required
                />

                <input
                    className="w-full border rounded px-3 py-2"
                    type="text"
                    name="position"
                    placeholder="Position"
                    value={formData.position}
                    onChange={handleChange}
                    required
                />

                <input
                    className="w-full border rounded px-3 py-2"
                    type="tel"
                    name="phoneNumber"
                    placeholder="Phone Number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                />

                <input
                    className="w-full border rounded px-3 py-2"
                    type="text"
                    name="location"
                    placeholder="Location"
                    value={formData.location}
                    onChange={handleChange}
                />

                <textarea
                    className="w-full border rounded px-3 py-2"
                    name="bio"
                    placeholder="Bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="3"
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
                    <select
                        className="w-full border rounded px-3 py-2"
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
                    className="w-full border rounded px-3 py-2"
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                <input
                    className="w-full border rounded px-3 py-2"
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                />

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Creating User...' : 'Create User'}
                </button>
            </form>
        </div>
    );
};

export default AdminUserCreation; 