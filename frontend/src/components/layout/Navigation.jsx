import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/Button';
import { ChevronDown, Menu, X, Globe, User, LogOut, Settings, Shield, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UserProfileDropdown from './UserProfileDropdown';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from '../dashboard/ThemeToggle';
import logoImage from '../../assets/heritage_logo.png';

const Navigation = ({ transparent = false, showOnAllPages = true }) => {
    const { user, logout } = useAuth();
    const { currentLanguage, languages, changeLanguage } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const mobileMenuRef = useRef(null);
    const searchInputRef = useRef(null);

    // Handle scroll effect for transparent navigation
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };

        if (transparent) {
            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
        }
    }, [transparent]);

    // Handle touch gestures for mobile
    useEffect(() => {
        const handleTouchStart = (e) => {
            setTouchStart(e.targetTouches[0].clientX);
        };

        const handleTouchMove = (e) => {
            setTouchEnd(e.targetTouches[0].clientX);
        };

        const handleTouchEnd = () => {
            if (!touchStart || !touchEnd) return;

            const distance = touchStart - touchEnd;
            const isLeftSwipe = distance > 50;
            const isRightSwipe = distance < -50;

            if (isLeftSwipe && mobileMenuOpen) {
                setMobileMenuOpen(false);
            } else if (isRightSwipe && !mobileMenuOpen) {
                setMobileMenuOpen(true);
            }
        };

        if (mobileMenuRef.current) {
            mobileMenuRef.current.addEventListener('touchstart', handleTouchStart);
            mobileMenuRef.current.addEventListener('touchmove', handleTouchMove);
            mobileMenuRef.current.addEventListener('touchend', handleTouchEnd);
        }

        return () => {
            if (mobileMenuRef.current) {
                mobileMenuRef.current.removeEventListener('touchstart', handleTouchStart);
                mobileMenuRef.current.removeEventListener('touchmove', handleTouchMove);
                mobileMenuRef.current.removeEventListener('touchend', handleTouchEnd);
            }
        };
    }, [mobileMenuOpen]);

    // Handle search functionality
    useEffect(() => {
        if (showSearch && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [showSearch]);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
                setMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    const isHomePage = location.pathname === '/';
    const shouldBeTransparent = transparent && isHomePage && !scrolled;

    const navClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${shouldBeTransparent
        ? 'bg-transparent'
        : 'bg-white dark:bg-gray-900 shadow-lg'
        }`;

    const textClasses = shouldBeTransparent ? 'text-white' : 'text-gray-900 dark:text-gray-100';

    const handleLanguageChange = (langCode) => {
        changeLanguage(langCode);
    };

    const handleMenuClose = () => {
        setMobileMenuOpen(false);
        setShowSearch(false);
    };

    const handleSearch = (query) => {
        if (query.trim()) {
            navigate('/sites', {
                state: { search: query.trim() },
                replace: true
            });
            setSearchQuery('');
            setShowSearch(false);
            setMobileMenuOpen(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        handleSearch(searchQuery);
    };

    // Get navigation items from language context
    const { t } = useLanguage();
    const navigationItems = [
        { name: t('nav.heritageSites'), path: '/', isAnchor: true, anchorId: 'featured-sites' },
        { name: t('nav.education'), path: '/', isAnchor: true, anchorId: 'education' },
        { name: t('nav.artifacts'), path: '/', isAnchor: true, anchorId: 'artifacts' },
        { name: t('nav.community'), path: '/', isAnchor: true, anchorId: 'community' }
    ];

    // Smooth scroll to section
    const scrollToSection = (anchorId) => {
        const element = document.getElementById(anchorId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    const handleNavigationClick = (item, e) => {
        if (item.isAnchor) {
            e.preventDefault();
            scrollToSection(item.anchorId);
            setMobileMenuOpen(false);
        } else {
            setMobileMenuOpen(false);
        }
    };

    // Enhanced mobile menu with better touch support
    const MobileMenu = () => (
        <motion.div
            ref={mobileMenuRef}
            className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="p-4 space-y-4">
                {/* Search Bar */}
                <div className="mb-4">
                    <form onSubmit={handleSearchSubmit} className="relative">
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder={t('nav.searchPlaceholder') || 'Search heritage sites...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-3 pl-10 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px] text-base"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 min-h-[40px] min-w-[40px] flex items-center justify-center"
                            aria-label="Search"
                        >
                            <Search className="h-5 w-5" />
                        </button>
                    </form>
                </div>

                {/* Navigation Links */}
                <div className="space-y-2 mb-4">
                    {navigationItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            onClick={(e) => handleNavigationClick(item, e)}
                            className={`block px-4 py-3 rounded-lg transition-colors min-h-[44px] flex items-center ${item.isAnchor && location.pathname === '/'
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                <hr className="border-gray-200 dark:border-gray-700 my-4" />

                {/* Quick Actions */}
                <div className="space-y-4 mb-4">
                    {/* Theme Toggle */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Theme:</span>
                        <ThemeToggle variant="icon" />
                    </div>

                    {/* Language Switcher */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Language:</span>
                        <select
                            value={currentLanguage}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm text-gray-900 dark:text-gray-100 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {languages.map(lang => (
                                <option key={lang.code} value={lang.code}>
                                    {lang.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Auth Buttons */}
                {!user ? (
                    <div className="space-y-3">
                        <Link to="/login" onClick={handleMenuClose} className="block">
                            <Button variant="outline" className="w-full min-h-[44px] text-base">
                                {t('nav.login')}
                            </Button>
                        </Link>
                        <Link to="/register" onClick={handleMenuClose} className="block">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white min-h-[44px] text-base">
                                {t('nav.register')}
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <Link to="/dashboard" onClick={handleMenuClose} className="block">
                            <Button variant="outline" className="w-full min-h-[44px] text-base">
                                {t('nav.dashboard')}
                            </Button>
                        </Link>
                        <button
                            onClick={() => {
                                logout();
                                handleMenuClose();
                                navigate('/');
                            }}
                            className="flex items-center justify-center w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors min-h-[44px] text-base"
                        >
                            <LogOut className="h-5 w-5 mr-3" />
                            {t('common.signOut')}
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );

    return (
        <nav className={navClasses}>
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                <div className="flex justify-between items-center py-3 sm:py-4">
                    {/* Logo */}
                    <motion.div
                        className="flex items-center"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Link to="/" className="flex items-center">
                            <img src={logoImage} alt="Rwanda Heritage Guard" className="h-8 w-8 sm:h-10 sm:w-10 mr-2 sm:mr-3" />
                            <span className={`font-bold text-lg sm:text-xl hidden sm:block ${textClasses}`}>
                                HeritageGuard
                            </span>
                        </Link>
                    </motion.div>

                    {/* Desktop Menu */}
                    <motion.div
                        className="hidden md:flex items-center space-x-8"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        {navigationItems.map((item, index) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={(e) => handleNavigationClick(item, e)}
                                className={`${textClasses} hover:text-blue-600 transition-colors duration-200 ${item.isAnchor && location.pathname === '/' ? 'text-blue-600 font-medium' :
                                    !item.isAnchor && location.pathname === item.path ? 'text-blue-600 font-medium' : ''
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </motion.div>

                    {/* Right Section */}
                    <motion.div
                        className="hidden md:flex items-center space-x-4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        {/* Language Switcher */}
                        <LanguageSwitcher
                            currentLanguage={currentLanguage}
                            languages={languages}
                            onLanguageChange={handleLanguageChange}
                            transparent={shouldBeTransparent}
                        />

                        {/* Theme Toggle */}
                        <ThemeToggle variant="dropdown" transparent={shouldBeTransparent} />

                        {/* User Profile or Auth Buttons */}
                        <UserProfileDropdown transparent={shouldBeTransparent} />
                    </motion.div>

                    {/* Mobile Menu Button */}
                    <motion.button
                        className={`md:hidden ${textClasses} p-2 rounded-lg hover:bg-white/10 dark:hover:bg-gray-800/50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center`}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        aria-label="Toggle mobile menu"
                        aria-expanded={mobileMenuOpen}
                    >
                        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </motion.button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && <MobileMenu />}
                </AnimatePresence>
            </div>
        </nav>
    );
};

export default Navigation; 