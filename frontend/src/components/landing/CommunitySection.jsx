import React from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Shield, Eye, Search, Globe, Award } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useFeaturedTestimonials } from '../../services/api/testimonialsApi';
import museum from '../../assets/Ethnographic-Museum.jpg';
import { useNavigate } from 'react-router-dom';

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

const CommunitySection = ({
    className = "py-20 bg-white dark:bg-gray-950",
    title,
    subtitle,
    showStatistics = true,
    showFeatures = true,
    showTestimonials = true,
    showCTA = true,
    maxTestimonials = 3,
    onCTAClick,
    onTestimonialClick,
    onFeatureClick,
    statistics = {} // Accept statistics as props
}) => {
    const { user } = useAuth();
    const { t, getTranslations, currentLanguage } = useLanguage();
    const navigate = useNavigate();

    // Fetch testimonials from API
    const { data: apiTestimonials, loading: testimonialsLoading, error: testimonialsError } = useFeaturedTestimonials({
        language: currentLanguage,
        enabled: showTestimonials
    });

    // Use translations for default values
    const defaultTitle = title || t('community.title');
    const defaultSubtitle = subtitle || t('community.subtitle');
    // Use hardcoded fallbacks since we don't have full translations yet
    const defaultStats = {
        members: 'Community Members',
        active: 'Active Members',
        newThisMonth: 'New This Month',
        verified: 'Verified Experts'
    };
    const defaultFeatures = [
        {
            icon: 'Users',
            title: 'Community Members',
            description: 'Connect with heritage enthusiasts',
            color: 'bg-blue-100 text-blue-600',
            action: '/community/members'
        },
        {
            icon: 'MessageSquare',
            title: 'Forum Discussions',
            description: 'Engage in meaningful conversations',
            color: 'bg-blue-100 text-blue-600',
            action: '/community/forums'
        },
        {
            icon: 'Shield',
            title: 'Role-Based Access',
            description: 'Different access levels for different roles',
            color: 'bg-purple-100 text-purple-600',
            action: '/community/roles'
        },
        {
            icon: 'Eye',
            title: 'Content Moderation',
            description: 'Safe and respectful community',
            color: 'bg-orange-100 text-orange-600',
            action: '/community/moderation'
        }
    ];
    const defaultCTA = t('community.cta');
    const defaultCTASub = t('community.ctaSub');
    const defaultJoinBtn = t('community.joinBtn');
    const defaultSignInBtn = user ? t('community.dashboardBtn') : t('community.signInBtn');
    // Icon mapping for string-based icons
    const iconMap = {
        Users,
        MessageSquare,
        Shield,
        Eye,
        Search,
        Globe,
        Award
    };

    // Ensure features have proper structure with fallbacks
    const displayFeatures = (defaultFeatures && defaultFeatures.length > 0)
        ? defaultFeatures.map(feature => ({
            ...feature,
            icon: typeof feature.icon === 'string' ? iconMap[feature.icon] : feature.icon
        }))
        : [
            {
                icon: Users,
                title: "Community Members",
                description: "Connect with heritage enthusiasts",
                color: "bg-blue-100 text-blue-600",
                action: "/community/members"
            },
            {
                icon: MessageSquare,
                title: "Forum Discussions",
                description: "Engage in meaningful conversations",
                color: "bg-blue-100 text-blue-600",
                action: "/community/forums"
            },
            {
                icon: Shield,
                title: "Role-Based Access",
                description: "Different access levels for different roles",
                color: "bg-purple-100 text-purple-600",
                action: "/community/roles"
            },
            {
                icon: Eye,
                title: "Content Moderation",
                description: "Safe and respectful community",
                color: "bg-orange-100 text-orange-600",
                action: "/community/moderation"
            }
        ];
    // Ensure testimonials have proper structure with fallbacks
    const displayTestimonials = (apiTestimonials && apiTestimonials.length > 0)
        ? apiTestimonials.slice(0, maxTestimonials)
        : [
            {
                id: 1,
                name: "Jean Baptiste",
                role: "Heritage Researcher",
                quote: "HeritageGuard has revolutionized how we document and share our cultural heritage. It's an invaluable resource for researchers.",
                avatar: null,
                verified: true
            },
            {
                id: 2,
                name: "Alice Uwimana",
                role: "Museum Curator",
                quote: "The platform has made it easier to collaborate with other institutions and share our collections with a wider audience.",
                avatar: null,
                verified: true
            },
            {
                id: 3,
                name: "Patrick Nshuti",
                role: "History Teacher",
                quote: "My students love the interactive content. It brings our history to life in ways traditional textbooks never could.",
                avatar: null,
                verified: true
            }
        ].slice(0, maxTestimonials);

    // Process statistics with fallbacks
    const processStatistics = () => {
        if (statistics && Object.keys(statistics).length > 0) {
            return {
                totalMembers: statistics.totalMembers || 0,
                activeMembers: statistics.activeMembers || 0,
                recentMembers: statistics.recentMembers || 0,
                verifiedMembers: statistics.verifiedMembers || 0
            };
        }
        return {
            totalMembers: 1250,
            activeMembers: 847,
            recentMembers: 23,
            verifiedMembers: 156
        };
    };



    const displayStats = processStatistics();

    const handleFeatureClick = (feature) => {
        if (onFeatureClick) {
            onFeatureClick(feature);
        } else {
            navigate(feature.action);
        }
    };

    const handleCTAClick = () => {
        if (onCTAClick) {
            onCTAClick();
        } else {
            navigate('/register');
        }
    };

    const handleSecondaryCTAClick = () => {
        if (user) {
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    };

    return (
        <section className={className}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                        {defaultTitle}
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                        {defaultSubtitle}
                    </p>
                </motion.div>

                {/* Statistics Section */}
                {showStatistics && (
                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {/* Statistics display */}
                        <>
                            <motion.div variants={fadeInUp} className="text-center">
                                <Card className="p-6 hover:shadow-lg transition-shadow">
                                    <Users className="text-blue-600 mx-auto mb-3" size={32} />
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                                        {displayStats.totalMembers.toLocaleString()}+
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">{defaultStats.members || 'Community Members'}</p>
                                </Card>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="text-center">
                                <Card className="p-6 hover:shadow-lg transition-shadow">
                                    <Award className="text-blue-600 mx-auto mb-3" size={32} />
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                                        {displayStats.activeMembers.toLocaleString()}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">{defaultStats.active || 'Active Members'}</p>
                                </Card>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="text-center">
                                <Card className="p-6 hover:shadow-lg transition-shadow">
                                    <MessageSquare className="text-purple-600 mx-auto mb-3" size={32} />
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                                        {displayStats.recentMembers}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">{defaultStats.newThisMonth || 'New This Month'}</p>
                                </Card>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="text-center">
                                <Card className="p-6 hover:shadow-lg transition-shadow">
                                    <Shield className="text-orange-600 mx-auto mb-3" size={32} />
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                                        {displayStats.verifiedMembers}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">{defaultStats.verified || 'Verified Experts'}</p>
                                </Card>
                            </motion.div>
                        </>
                    </motion.div>
                )}

                {/* Features Section */}
                {showFeatures && (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {displayFeatures.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                variants={fadeInUp}
                                whileHover={{ y: -5 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card
                                    className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer h-full"
                                    onClick={() => handleFeatureClick(feature)}
                                >
                                    <div className={`w-12 h-12 mx-auto mb-4 rounded-full ${feature.color} flex items-center justify-center`}>
                                        {feature.icon && <feature.icon size={24} />}
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2 text-gray-900">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        {feature.description}
                                    </p>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Testimonials Section */}
                {showTestimonials && (
                    <motion.div
                        className="mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">
                            What Our Community Says
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {testimonialsLoading ? (
                                // Loading skeleton
                                Array.from({ length: maxTestimonials }).map((_, index) => (
                                    <motion.div
                                        key={`skeleton-${index}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                    >
                                        <Card className="p-6 h-full">
                                            <div className="flex items-start mb-4">
                                                <div className="w-12 h-12 bg-gray-200 rounded-full mr-4 flex-shrink-0 animate-pulse"></div>
                                                <div className="flex-1">
                                                    <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                                                    <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                                                <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                                                <div className="h-3 bg-gray-200 rounded w-4/6 animate-pulse"></div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))
                            ) : testimonialsError ? (
                                // Error state
                                <div className="col-span-full text-center py-8">
                                    <p className="text-gray-500">Unable to load testimonials. Please try again later.</p>
                                </div>
                            ) : (
                                // Display testimonials
                                displayTestimonials.map((testimonial, index) => (
                                    <motion.div
                                        key={testimonial.id || index}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                    >
                                        <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                                            <div className="flex items-start mb-4">
                                                {testimonial.avatarUrl ? (
                                                    <img
                                                        src={testimonial.avatarUrl}
                                                        alt={testimonial.nameEn || testimonial.name}
                                                        className="w-12 h-12 rounded-full mr-4 flex-shrink-0 object-cover"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'block';
                                                        }}
                                                    />
                                                ) : null}
                                                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full mr-4 flex-shrink-0 ${testimonial.avatarUrl ? 'hidden' : 'block'}">
                                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white font-semibold text-lg">
                                                        {(testimonial.nameEn || testimonial.name || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center">
                                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                                            {testimonial.nameEn || testimonial.name}
                                                        </h4>
                                                        {testimonial.isVerified && (
                                                            <Award className="ml-2 text-blue-500" size={16} />
                                                        )}
                                                    </div>
                                                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                                                        {testimonial.roleEn || testimonial.role || 'Community Member'}
                                                    </p>
                                                    <p className="text-gray-700 dark:text-gray-200">
                                                        {testimonial.quoteEn || testimonial.quote || 'Insightful contribution about HeritageGuard.'}
                                                    </p>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}

                {/* CTA Section */}
                {showCTA && (
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 relative overflow-hidden">
                            {/* Background Image */}
                            <div
                                className="absolute inset-0 bg-cover bg-center opacity-20"
                                style={{ backgroundImage: `url(${museum})` }}
                            ></div>
                            {/* Content */}
                            <div className="relative z-10">
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                                    {defaultCTA}
                                </h3>
                                <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                                    {defaultCTASub}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button
                                        onClick={handleCTAClick}
                                        className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 font-semibold"
                                        size="lg"
                                    >
                                        {defaultJoinBtn}
                                    </Button>
                                    <Button
                                        onClick={handleSecondaryCTAClick}
                                        variant="outline"
                                        className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 font-semibold"
                                        size="lg"
                                    >
                                        {defaultSignInBtn}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </section>
    );
};

export default CommunitySection; 