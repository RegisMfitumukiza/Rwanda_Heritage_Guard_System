import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    Bell,
    Shield,
    Eye,
    EyeOff,
    Trash2,
    Download,
    Lock,
    Globe,
    Mail,
    MessageSquare,
    Users,
    AlertTriangle,
    CheckCircle,
    X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Navigation from '../components/layout/Navigation';
import { Button } from '../components/ui/Button';

const Settings = () => {
    const { user, logout } = useAuth();
    const { t, changeLanguage } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');

    // Notification preferences
    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        pushNotifications: true,
        forumNotifications: true,
        contentUpdates: true,
        securityAlerts: true,
        marketingEmails: false
    });

    // Privacy settings
    const [privacySettings, setPrivacySettings] = useState({
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        showLocation: true,
        allowMessages: true,
        allowFriendRequests: true
    });

    // Language settings
    const [languageSettings, setLanguageSettings] = useState({
        interfaceLanguage: user?.language || 'en',
        contentLanguage: user?.language || 'en'
    });

    const handleNotificationChange = (key) => {
        setNotificationSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handlePrivacyChange = (key, value) => {
        setPrivacySettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleLanguageChange = (key, value) => {
        setLanguageSettings(prev => ({
            ...prev,
            [key]: value
        }));

        if (key === 'interfaceLanguage') {
            changeLanguage(value);
        }
    };

    const handleSaveSettings = async (section) => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success(`${section} settings saved successfully!`);
        } catch (error) {
            toast.error('Failed to save settings. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportData = async () => {
        setIsLoading(true);
        try {
            // Simulate data export
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Create and download a sample data file
            const data = {
                user: user,
                settings: {
                    notifications: notificationSettings,
                    privacy: privacySettings,
                    language: languageSettings
                },
                exportDate: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `heritageguard-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success('Data exported successfully!');
        } catch (error) {
            toast.error('Failed to export data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== 'DELETE') {
            toast.error('Please type DELETE to confirm account deletion');
            return;
        }

        setIsLoading(true);
        try {
            // Simulate account deletion
            await new Promise(resolve => setTimeout(resolve, 2000));

            toast.success('Account deleted successfully');
            logout();
        } catch (error) {
            toast.error('Failed to delete account. Please try again.');
        } finally {
            setIsLoading(false);
            setShowDeleteModal(false);
            setDeleteConfirmation('');
        }
    };

    const SettingSection = ({ title, icon: Icon, children, onSave, saveText = "Save Changes" }) => (
        <motion.div
            className="bg-white rounded-xl shadow-lg p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Icon className="text-blue-600" size={24} />
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                </div>
                {onSave && (
                    <Button
                        onClick={onSave}
                        disabled={isLoading}
                        className="flex items-center gap-2"
                    >
                        {isLoading ? 'Saving...' : saveText}
                    </Button>
                )}
            </div>
            {children}
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
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
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
                        <p className="text-gray-600">Manage your account preferences and privacy settings</p>
                    </motion.div>

                    {/* Notification Settings */}
                    <SettingSection
                        title="Notification Preferences"
                        icon={Bell}
                        onSave={() => handleSaveSettings('Notification')}
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Mail size={20} className="text-gray-500" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">Email Notifications</h4>
                                        <p className="text-sm text-gray-600">Receive updates via email</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notificationSettings.emailNotifications}
                                        onChange={() => handleNotificationChange('emailNotifications')}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <MessageSquare size={20} className="text-gray-500" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">Forum Notifications</h4>
                                        <p className="text-sm text-gray-600">Get notified about forum activity</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notificationSettings.forumNotifications}
                                        onChange={() => handleNotificationChange('forumNotifications')}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle size={20} className="text-gray-500" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">Security Alerts</h4>
                                        <p className="text-sm text-gray-600">Important security notifications</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notificationSettings.securityAlerts}
                                        onChange={() => handleNotificationChange('securityAlerts')}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </SettingSection>

                    {/* Privacy Settings */}
                    <SettingSection
                        title="Privacy Settings"
                        icon={Shield}
                        onSave={() => handleSaveSettings('Privacy')}
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Profile Visibility
                                </label>
                                <select
                                    value={privacySettings.profileVisibility}
                                    onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="public">Public</option>
                                    <option value="friends">Friends Only</option>
                                    <option value="private">Private</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Eye size={20} className="text-gray-500" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">Show Email Address</h4>
                                        <p className="text-sm text-gray-600">Allow others to see your email</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={privacySettings.showEmail}
                                        onChange={() => handlePrivacyChange('showEmail', !privacySettings.showEmail)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Users size={20} className="text-gray-500" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">Allow Messages</h4>
                                        <p className="text-sm text-gray-600">Let other users send you messages</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={privacySettings.allowMessages}
                                        onChange={() => handlePrivacyChange('allowMessages', !privacySettings.allowMessages)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </SettingSection>

                    {/* Language Settings */}
                    <SettingSection
                        title="Language Settings"
                        icon={Globe}
                        onSave={() => handleSaveSettings('Language')}
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Interface Language
                                </label>
                                <select
                                    value={languageSettings.interfaceLanguage}
                                    onChange={(e) => handleLanguageChange('interfaceLanguage', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="en">English</option>
                                    <option value="rw">Kinyarwanda</option>
                                    <option value="fr">Français</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Content Language
                                </label>
                                <select
                                    value={languageSettings.contentLanguage}
                                    onChange={(e) => handleLanguageChange('contentLanguage', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="en">English</option>
                                    <option value="rw">Kinyarwanda</option>
                                    <option value="fr">Français</option>
                                </select>
                            </div>
                        </div>
                    </SettingSection>

                    {/* Data Management */}
                    <SettingSection title="Data Management" icon={Download}>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Download size={20} className="text-gray-500" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">Export My Data</h4>
                                        <p className="text-sm text-gray-600">Download all your data in JSON format</p>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleExportData}
                                    disabled={isLoading}
                                    variant="outline"
                                    className="flex items-center gap-2"
                                >
                                    <Download size={16} />
                                    Export
                                </Button>
                            </div>
                        </div>
                    </SettingSection>

                    {/* Account Deletion */}
                    <SettingSection title="Danger Zone" icon={Trash2}>
                        <div className="space-y-4">
                            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                                <div className="flex items-center gap-3 mb-3">
                                    <AlertTriangle size={20} className="text-red-600" />
                                    <h4 className="font-medium text-red-900">Delete Account</h4>
                                </div>
                                <p className="text-sm text-red-700 mb-4">
                                    This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                                </p>
                                <Button
                                    onClick={() => setShowDeleteModal(true)}
                                    variant="outline"
                                    className="border-red-300 text-red-700 hover:bg-red-100"
                                >
                                    <Trash2 size={16} />
                                    Delete Account
                                </Button>
                            </div>
                        </div>
                    </SettingSection>
                </div>
            </div>

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <motion.div
                        className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle size={24} className="text-red-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
                        </div>

                        <p className="text-gray-600 mb-4">
                            This action is irreversible. All your data will be permanently deleted.
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type "DELETE" to confirm
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                placeholder="DELETE"
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={handleDeleteAccount}
                                disabled={isLoading || deleteConfirmation !== 'DELETE'}
                                className="flex-1 bg-red-600 hover:bg-red-700"
                            >
                                {isLoading ? 'Deleting...' : 'Delete Account'}
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteConfirmation('');
                                }}
                                variant="outline"
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Settings;
