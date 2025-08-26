import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Camera,
    Edit3,
    Save,
    X,
    Shield,
    Calendar,
    Globe,
    Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Navigation from '../components/layout/Navigation';
import { Button } from '../components/ui/Button';
import { UserAvatar } from '../components/ui/UserAvatar';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const { t } = useLanguage();
    const fileInputRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);

    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        location: user?.location || '',
        bio: user?.bio || '',
        language: user?.language || 'en'
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error('Image size must be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatarPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update user data
            const updatedUser = {
                ...user,
                ...formData,
                avatarUrl: avatarPreview || user?.avatarUrl
            };

            updateUser(updatedUser);
            setIsEditing(false);
            setAvatarPreview(null);
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error('Failed to update profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            fullName: user?.fullName || '',
            email: user?.email || '',
            phone: user?.phone || '',
            location: user?.location || '',
            bio: user?.bio || '',
            language: user?.language || 'en'
        });
        setAvatarPreview(null);
        setIsEditing(false);
    };

    const getRoleDisplayName = (role) => {
        const roleMap = {
            'SYSTEM_ADMINISTRATOR': 'System Administrator',
            'HERITAGE_MANAGER': 'Heritage Manager',
            'CONTENT_MANAGER': 'Content Manager',
            'COMMUNITY_MEMBER': 'Community Member'
        };
        return roleMap[role] || role;
    };

    const getLanguageDisplayName = (code) => {
        const languageMap = {
            'en': 'English',
            'rw': 'Kinyarwanda',
            'fr': 'Français'
        };
        return languageMap[code] || code;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navigation />

            <div className="pt-20 pb-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        className="text-center mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {isEditing ? 'Edit Profile' : 'My Profile'}
                        </h1>
                        <p className="text-gray-600">
                            {isEditing ? 'Update your personal information' : 'Manage your account details'}
                        </p>
                    </motion.div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Profile Card */}
                        <motion.div
                            className="lg:col-span-1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                {/* Avatar Section */}
                                <div className="text-center mb-6">
                                    <div className="relative inline-block">
                                        <div className="relative">
                                            <UserAvatar
                                                user={{
                                                    ...user,
                                                    avatarUrl: avatarPreview || user?.avatarUrl
                                                }}
                                                size="xl"
                                                className="w-32 h-32"
                                            />
                                            {isEditing && (
                                                <button
                                                    onClick={handleAvatarClick}
                                                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                                                >
                                                    <Camera size={16} />
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            className="hidden"
                                        />
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-900 mt-4">
                                        {isEditing ? formData.fullName : user?.fullName}
                                    </h2>
                                    <p className="text-gray-600 text-sm">
                                        {getRoleDisplayName(user?.role)}
                                    </p>
                                </div>

                                {/* Quick Stats */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-600">Member Since</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-600">Language</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {getLanguageDisplayName(user?.language)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-600">Status</span>
                                        <span className="text-sm font-medium text-green-600">
                                            Active
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Profile Form */}
                        <motion.div
                            className="lg:col-span-2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Personal Information
                                    </h3>
                                    {!isEditing ? (
                                        <Button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2"
                                        >
                                            <Edit3 size={16} />
                                            Edit Profile
                                        </Button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={handleSave}
                                                disabled={isLoading}
                                                className="flex items-center gap-2"
                                            >
                                                <Save size={16} />
                                                {isLoading ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={handleCancel}
                                                className="flex items-center gap-2"
                                            >
                                                <X size={16} />
                                                Cancel
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    {/* Full Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                                placeholder="Enter your full name"
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                                placeholder="Enter your email"
                                            />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                                placeholder="Enter your phone number"
                                            />
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Location
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                                placeholder="Enter your location"
                                            />
                                        </div>
                                    </div>

                                    {/* Bio */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Bio
                                        </label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            rows={4}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 resize-none"
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>

                                    {/* Language Preference */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Language Preference
                                        </label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                            <select
                                                name="language"
                                                value={formData.language}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                            >
                                                <option value="en">English</option>
                                                <option value="rw">Kinyarwanda</option>
                                                <option value="fr">Français</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
