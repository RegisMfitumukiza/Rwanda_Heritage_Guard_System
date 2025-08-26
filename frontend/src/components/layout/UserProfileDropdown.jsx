import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ChevronDown, User, LogOut, Settings, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAvatar } from '../ui/UserAvatar';

const UserProfileDropdown = ({ transparent = false }) => {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const textClasses = transparent ? 'text-white' : 'text-gray-900 dark:text-gray-100';
    const hoverClasses = transparent ? 'hover:bg-white/10' : 'hover:bg-gray-100 dark:hover:bg-gray-800';

    if (!user) {
        return (
            <div className="flex items-center space-x-4">
                <Link to="/login">
                    <button className={`${textClasses} hover:text-blue-400 transition-colors font-medium`}>
                        {t('nav.login')}
                    </button>
                </Link>
                <Link to="/register">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        {t('nav.register')}
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center space-x-2 ${textClasses} hover:text-blue-600 transition-colors`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <UserAvatar user={user} size="sm" />
                <span className="hidden sm:block font-medium">{user.fullName || user.username}</span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown size={16} />
                </motion.div>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-center">
                                <UserAvatar user={user} size="md" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.fullName || user.username}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                    <div className="flex items-center mt-1">
                                        <Shield className="h-3 w-3 text-blue-600 mr-1" />
                                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                            {user.role?.toLowerCase().replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                            <Link to="/dashboard">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <User className="h-4 w-4 mr-3" />
                                    {t('nav.dashboard')}
                                </button>
                            </Link>

                            <Link to="/profile">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <User className="h-4 w-4 mr-3" />
                                    Profile
                                </button>
                            </Link>

                            <Link to="/settings">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <Settings className="h-4 w-4 mr-3" />
                                    Settings
                                </button>
                            </Link>
                        </div>

                        {/* Logout */}
                        <div className="border-t border-gray-100 dark:border-gray-700 pt-1">
                            <button
                                onClick={() => {
                                    logout();
                                    setIsOpen(false);
                                    navigate('/');
                                }}
                                className="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <LogOut className="h-4 w-4 mr-3" />
                                {t('common.signOut')}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserProfileDropdown; 