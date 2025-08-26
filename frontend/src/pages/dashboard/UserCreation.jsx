import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui';
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label } from '../../components/ui';
import { Shield, UserPlus, Mail, Lock, User, Calendar, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';

const UserCreation = () => {
    const { user } = useAuth();
    const { t } = useLanguage();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        role: 'HERITAGE_MANAGER',
        status: 'ACTIVE'
    });

    const [errors, setErrors] = useState({});

    // State for loading
    const [isLoading, setIsLoading] = useState(false);

    // Helper function to extract user-friendly error messages
    const extractUserFriendlyError = (errorData) => {
        let message = 'Failed to create user';

        if (errorData.details) {
            message = errorData.details;
        } else if (errorData.message && !errorData.message.includes('Internal Server Error')) {
            message = errorData.message;
        }

        // Clean up technical details
        message = message.replace(/error:\s*'[^']*'/g, '').trim();
        message = message.replace(/,\s*$/, ''); // Remove trailing comma

        // Provide fallback if message is empty
        if (!message || message === 'Failed to create user') {
            message = 'Please check your input and try again';
        }

        return message;
    };

    // Handle form input changes
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = t('Username is required');
        } else if (formData.username.length < 3) {
            newErrors.username = t('Username must be at least 3 characters');
        }

        if (!formData.email.trim()) {
            newErrors.email = t('Email is required');
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = t('Please enter a valid email');
        }

        if (!formData.password) {
            newErrors.password = t('Password is required');
        } else if (formData.password.length < 8) {
            newErrors.password = t('Password must be at least 8 characters');
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = t('Passwords do not match');
        }

        if (!formData.firstName.trim()) {
            newErrors.firstName = t('First name is required');
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = t('Last name is required');
        }


        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form submitted!');

        if (!validateForm()) {
            console.log('Validation failed');
            return;
        }

        setIsLoading(true);
        console.log('Starting user creation...');

        try {
            const userData = {
                username: formData.username.trim(),
                email: formData.email.trim(),
                password: formData.password,
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                requestedRole: formData.role,
                status: formData.status
            };

            console.log('Sending user data:', userData);

            const response = await fetch('/api/auth/admin/create-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(userData)
            });

            console.log('Response status:', response.status);

            if (response.ok) {
                const result = await response.json();
                console.log('Success:', result);
                toast.success('User created successfully!');

                // Reset form
                setFormData({
                    username: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    firstName: '',
                    lastName: '',
                    role: 'HERITAGE_MANAGER',
                    status: 'ACTIVE'
                });
                setErrors({});
            } else {
                const errorData = await response.json();
                console.error('Error response:', errorData);

                // Extract user-friendly error message
                const userMessage = extractUserFriendlyError(errorData);
                toast.error(userMessage);
            }
        } catch (error) {
            console.error('Network error:', error);
            toast.error('Failed to create user. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user || user.role !== 'SYSTEM_ADMINISTRATOR') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 text-center">
                        <Shield className="w-12 h-12 mx-auto mb-4 text-red-500" />
                        <h2 className="text-xl font-semibold mb-2">{t('Access Denied')}</h2>
                        <p className="text-gray-600">{t('Only system administrators can access this page.')}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {t('Create New User')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {t('Add new users to the system')}
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => window.location.href = '/dashboard/users'}
                >
                    <Users className="w-4 h-4 mr-2" />
                    {t('Back to Users')}
                </Button>
            </div>

            {/* User Creation Form */}
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5" />
                        {t('User Information')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    {t('Username')} *
                                </Label>
                                <Input
                                    id="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => handleInputChange('username', e.target.value)}
                                    placeholder={t('Enter username')}
                                    className={errors.username ? 'border-red-500' : ''}
                                />
                                {errors.username && (
                                    <p className="text-sm text-red-600">{errors.username}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    {t('First Name')} *
                                </Label>
                                <Input
                                    id="firstName"
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                                    placeholder={t('Enter first name')}
                                    className={errors.firstName ? 'border-red-500' : ''}
                                />
                                {errors.firstName && (
                                    <p className="text-sm text-red-600">{errors.firstName}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    {t('Last Name')} *
                                </Label>
                                <Input
                                    id="lastName"
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                                    placeholder={t('Enter last name')}
                                    className={errors.lastName ? 'border-red-500' : ''}
                                />
                                {errors.lastName && (
                                    <p className="text-sm text-red-600">{errors.lastName}</p>
                                )}
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                {t('Email Address')} *
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                placeholder={t('Enter email address')}
                                className={errors.email ? 'border-red-500' : ''}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-600">{errors.email}</p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                <strong>Email Pattern Requirements:</strong><br />
                                • <strong>Heritage Manager:</strong> managerX.heritage@domain.com<br />
                                • <strong>Content Manager:</strong> managerX.content@domain.com<br />
                                • <strong>System Admin:</strong> admin.admin@domain.com<br />
                                <em>(where X is a number)</em>
                            </p>
                        </div>





                        {/* Password Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="password" className="flex items-center gap-2">
                                    <Lock className="w-4 h-4" />
                                    {t('Password')} *
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    placeholder={t('Enter password')}
                                    className={errors.password ? 'border-red-500' : ''}
                                />
                                {errors.password && (
                                    <p className="text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                                    <Lock className="w-4 h-4" />
                                    {t('Confirm Password')} *
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                    placeholder={t('Confirm password')}
                                    className={errors.confirmPassword ? 'border-red-500' : ''}
                                />
                                {errors.confirmPassword && (
                                    <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                                )}
                            </div>
                        </div>

                        {/* Role and Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="role" className="flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    {t('Role')} *
                                </Label>
                                <Select value={formData.role} onValueChange={(value) => {
                                    handleInputChange('role', value);
                                }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('Select role')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CONTENT_MANAGER">{t('Content Manager')}</SelectItem>
                                        <SelectItem value="HERITAGE_MANAGER">{t('Heritage Manager')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status" className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {t('Status')} *
                                </Label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    New users can only be created as Active or Suspended. Other statuses can be set after creation.
                                </p>
                                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('Select status')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">{t('Active')} - Normal user with full access (Recommended)</SelectItem>
                                        <SelectItem value="SUSPENDED">{t('Suspended')} - Pre-approved user, needs activation</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setFormData({
                                        username: '',
                                        email: '',
                                        password: '',
                                        confirmPassword: '',
                                        firstName: '',
                                        lastName: '',
                                        role: 'HERITAGE_MANAGER',
                                        status: 'ACTIVE'
                                    });
                                    setErrors({});
                                }}
                            >
                                {t('Clear Form')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="min-w-32"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Create User
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default UserCreation;
