import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Users, Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { useGet } from '../../hooks/useSimpleApi';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

import heroBackground from '../../assets/Ethnographic-Museum.jpg';

/**
 * Hero Section Component
 * Displays the main landing hero with dynamic content from multiple APIs
 * Leverages our robust httpClient service for data fetching and automatic caching
 */
const HeroSection = ({
    showSearchBar = true,
    showStats = true,
    customTitle,
    customSubtitle,
    customBackground,
    onExploreClick,
    onJoinClick,
    statistics = {} // Accept statistics as props
}) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t, currentLanguage } = useLanguage();
    const searchInputRef = useRef(null);

    // Fetch featured heritage sites using new simplified API system
    const {
        data: featuredSites,
        loading: sitesLoading,
        error: sitesError
    } = useGet('/api/heritage-sites', { language: currentLanguage }, {
        enabled: true,
        onSuccess: (data) => console.log('Featured sites loaded:', data),
        onError: (error) => console.error('Error fetching featured sites:', error)
    });

    // Animation variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    // Get content from language context
    const content = {
        title: customTitle || t('hero.title'),
        subtitle: customSubtitle || t('hero.subtitle'),
        searchPlaceholder: t('hero.searchPlaceholder'),
        exploreButton: t('hero.exploreSites'),
        joinButton: t('hero.joinCommunity'),
        stats: {
            sites: t('hero.stats.sites'),
            documents: t('hero.stats.documents'),
            members: t('hero.stats.members'),
            articles: t('hero.stats.articles')
        }
    };

    const handleSearch = (searchTerm) => {
        if (searchTerm.trim()) {
            navigate('/sites', {
                state: { search: searchTerm.trim() },
                replace: true
            });
        }
    };

    const handleExploreClick = () => {
        if (onExploreClick) {
            onExploreClick();
        } else {
            navigate('/sites');
        }
    };

    const handleJoinClick = () => {
        if (onJoinClick) {
            onJoinClick();
        } else {
            navigate('/register');
        }
    };

    const getStatistics = () => {
        return {
            sites: statistics.totalSites || 0,
            documents: statistics.totalDocuments || 0,
            members: statistics.totalMembers || 0,
            articles: statistics.totalArticles || 0
        };
    };

    const displayStats = getStatistics();

    // Add loading state for better UX
    const isLoading = !statistics || Object.values(statistics).every(val => val === 0);

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `url(${customBackground || heroBackground})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed'
                }}
            >
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50"></div>
            </div>

            {/* Main Content */}
            <motion.div
                className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
            >
                {/* Title */}
                <motion.h1
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-white mb-4 sm:mb-6 md:mb-8 leading-tight px-2"
                    variants={fadeInUp}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    {customTitle || content.title}
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-200 mb-6 sm:mb-8 md:mb-10 max-w-4xl mx-auto leading-relaxed px-4"
                    variants={fadeInUp}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    {customSubtitle || content.subtitle}
                </motion.p>

                {/* Search Bar */}
                {showSearchBar && (
                    <motion.div
                        className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-10 px-4"
                        variants={fadeInUp}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <div className="relative">
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder={content.searchPlaceholder}
                                className="w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 min-h-[44px]"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch(e.target.value);
                                    }
                                }}
                            />
                            <button
                                onClick={() => {
                                    if (searchInputRef.current) {
                                        handleSearch(searchInputRef.current.value);
                                    }
                                }}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                                aria-label="Search"
                            >
                                <Search size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Action Buttons */}
                <motion.div
                    className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 md:mb-12 px-4"
                    variants={fadeInUp}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <Button
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-full min-h-[44px] w-full sm:w-auto"
                        onClick={handleExploreClick}
                    >
                        <MapPin className="mr-2" size={18} />
                        {content.exploreButton}
                    </Button>
                    <Button
                        size="lg"
                        className="bg-white text-gray-900 hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-full min-h-[44px] w-full sm:w-auto"
                        onClick={handleJoinClick}
                    >
                        <Users className="mr-2" size={18} />
                        {content.joinButton}
                    </Button>
                </motion.div>

                {/* Statistics */}
                {showStats && (
                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto px-4"
                        variants={fadeInUp}
                        transition={{ duration: 0.6, delay: 0.5 }}
                    >
                        <div className="text-center">
                            <div className="text-xl md:text-2xl font-bold text-white mb-1">
                                {isLoading ? (
                                    <div className="animate-pulse bg-white/20 h-8 rounded"></div>
                                ) : (
                                    displayStats.sites.toLocaleString()
                                )}
                            </div>
                            <div className="text-xs md:text-sm text-gray-300">
                                {content.stats.sites}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl md:text-2xl font-bold text-white mb-1">
                                {isLoading ? (
                                    <div className="animate-pulse bg-white/20 h-8 rounded"></div>
                                ) : (
                                    displayStats.documents.toLocaleString()
                                )}
                            </div>
                            <div className="text-xs md:text-sm text-gray-300">
                                {content.stats.documents}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl md:text-2xl font-bold text-white mb-1">
                                {isLoading ? (
                                    <div className="animate-pulse bg-white/20 h-8 rounded"></div>
                                ) : (
                                    displayStats.members.toLocaleString()
                                )}
                            </div>
                            <div className="text-xs md:text-sm text-gray-300">
                                {content.stats.members}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl md:text-2xl font-bold text-white mb-1">
                                {isLoading ? (
                                    <div className="animate-pulse bg-white/20 h-8 rounded"></div>
                                ) : (
                                    displayStats.articles.toLocaleString()
                                )}
                            </div>
                            <div className="text-xs md:text-sm text-gray-300">
                                {content.stats.articles}
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </section>
    );
};

export default HeroSection; 