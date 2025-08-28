import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Shield,
    Award,
    Database,
    FileText,
    Camera,
    Archive,
    Search,
    ChevronRight,
    Clock,
    MapPin,
    Users,
    Globe,
    Calendar
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGet } from '../../hooks/useSimpleApi';

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

const ArtifactSection = ({
    className = "py-20 bg-white dark:bg-gray-950",
    title,
    subtitle,
    showStatistics = true,
    showFeatures = true,
    showCTAButton = true,
    onCTAClick,
    customStatistics,
    customFeatures,
    maxFeatureItems = 8
}) => {
    const navigate = useNavigate();
    const { user, hasPermission } = useAuth();
    const { t, getTranslations } = useLanguage();

    // Use translations for default values
    const defaultTitle = title || t('artifacts.title');
    const defaultSubtitle = subtitle || t('artifacts.subtitle');
    const defaultCTA = t('artifacts.viewGallery');
    // Use hardcoded fallbacks since we don't have full translations yet
    const defaultCategories = [
        { name: 'Traditional Crafts', count: 45 },
        { name: 'Religious Objects', count: 32 },
        { name: 'Royal Artifacts', count: 28 },
        { name: 'Agricultural Tools', count: 67 },
        { name: 'Musical Instruments', count: 23 },
        { name: 'Textiles & Clothing', count: 89 }
    ];
    const defaultStats = {
        totalArtifacts: 'Total Artifacts',
        authenticated: 'Authenticated',
        recentAdditions: 'Recent Additions',
        conservationProjects: 'Conservation Projects'
    };

    // Fetch real artifact statistics from API
    const {
        data: statisticsData,
        loading: statisticsLoading,
        error: statisticsError
    } = useGet('/api/artifacts/statistics', {}, {
        onSuccess: (data) => console.log('Artifact statistics loaded:', data),
        onError: (error) => console.error('Failed to load artifact statistics:', error)
    });

    // Fetch artifact categories statistics
    const {
        data: categoriesData,
        loading: categoriesLoading,
        error: categoriesError
    } = useGet('/api/artifacts/statistics/category', {}, {
        onSuccess: (data) => console.log('Artifact categories loaded:', data),
        onError: (error) => console.error('Failed to load artifact categories:', error)
    });

    // Real-world authentication and documentation features
    const defaultFeatures = [
        {
            id: 1,
            title: 'Expert Verification System',
            description: 'Multi-level authentication by heritage experts and cultural specialists',
            icon: Shield,
            category: 'Authentication',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            id: 2,
            title: 'Digital Certificates',
            description: 'Secure blockchain-based digital certificates for authenticated artifacts',
            icon: Award,
            category: 'Security',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            id: 3,
            title: 'Provenance Tracking',
            description: 'Complete history and ownership documentation with chain of custody',
            icon: Database,
            category: 'Documentation',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        },
        {
            id: 4,
            title: 'Conservation History',
            description: 'Detailed records of preservation efforts and restoration work',
            icon: FileText,
            category: 'Conservation',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
        },
        {
            id: 5,
            title: 'High-Resolution Imaging',
            description: 'Professional photography and 3D scanning for detailed documentation',
            icon: Camera,
            category: 'Imaging',
            color: 'text-red-600',
            bgColor: 'bg-red-50'
        },
        {
            id: 6,
            title: '3D Model Support',
            description: 'Interactive 3D models for detailed examination and virtual tours',
            icon: Archive,
            category: 'Technology',
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50'
        },
        {
            id: 7,
            title: 'Material Analysis',
            description: 'Scientific analysis of artifact materials and composition',
            icon: Search,
            category: 'Research',
            color: 'text-teal-600',
            bgColor: 'bg-teal-50'
        },
        {
            id: 8,
            title: 'Cultural Context',
            description: 'Comprehensive cultural and historical context documentation',
            icon: Globe,
            category: 'Heritage',
            color: 'text-amber-600',
            bgColor: 'bg-amber-50'
        }
    ];

    // Process real statistics from API or use fallback
    const processStatistics = () => {
        if (customStatistics) return customStatistics;

        if (statisticsLoading || statisticsError || !statisticsData) {
            // Fallback statistics for development/offline
            return {
                totalArtifacts: 0,
                authenticatedArtifacts: 0,
                pendingAuthentication: 0,
                categories: [
                    { name: 'Traditional Crafts', count: 0 },
                    { name: 'Royal Artifacts', count: 0 },
                    { name: 'Ceremonial Objects', count: 0 },
                    { name: 'Historical Documents', count: 0 },
                    { name: 'Musical Instruments', count: 0 },
                    { name: 'Textiles & Weaving', count: 0 }
                ],
                recentAdditions: 0,
                conservationProjects: 0
            };
        }

        // Process real API data
        const stats = statisticsData || {};
        const categories = categoriesData || [];

        return {
            totalArtifacts: stats.totalArtifacts || 0,
            authenticatedArtifacts: stats.authenticatedArtifacts || 0,
            pendingAuthentication: stats.pendingAuthentication || 0,
            categories: (categories && categories.length > 0) ? categories.slice(0, 6) : [
                { name: 'Traditional Crafts', count: 0 },
                { name: 'Royal Artifacts', count: 0 },
                { name: 'Ceremonial Objects', count: 0 },
                { name: 'Historical Documents', count: 0 },
                { name: 'Musical Instruments', count: 0 },
                { name: 'Textiles & Weaving', count: 0 }
            ],
            recentAdditions: stats.recentAdditions || 0,
            conservationProjects: stats.conservationProjects || 0
        };
    };

    // Use custom data or processed API data
    const statistics = processStatistics();
    const features = customFeatures || defaultFeatures;

    // Filter features based on user permissions and preferences
    const getDisplayFeatures = () => {
        return features.slice(0, maxFeatureItems);
    };

    const displayFeatures = getDisplayFeatures();

    const handleFeatureClick = (feature) => {
        if (onCTAClick) {
            onCTAClick(feature);
        } else {
            navigate(`/artifacts/${feature.category.toLowerCase()}`);
        }
    };

    const handleCTAClick = () => {
        if (onCTAClick) {
            onCTAClick();
        } else {
            navigate('/artifacts');
        }
    };

    // Fetch featured artifacts for landing page showcase
    const {
        data: featuredArtifactsData,
        loading: artifactsLoading,
        error: artifactsError
    } = useGet('/api/artifacts/featured', {
        limit: 6,
        includeHeritageSite: true,
        includeMedia: true,
        includeAuthentications: true
    }, {
        onSuccess: (data) => console.log('Featured artifacts loaded:', data),
        onError: (error) => console.error('Failed to load featured artifacts:', error)
    });

    // Handle artifact card click
    const handleArtifactClick = (artifact) => {
        // Navigate to the public artifact details page
        navigate(`/artifacts/${artifact.id}`);
    };

    return (
        <section className={className}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

                {showStatistics && (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {statisticsLoading ? (
                            // Loading skeleton
                            Array.from({ length: 4 }).map((_, index) => (
                                <motion.div key={`stats-skeleton-${index}`} variants={fadeInUp} className="text-center">
                                    <Card className="p-6 hover:shadow-lg transition-shadow">
                                        <div className="animate-pulse">
                                            <div className="bg-gray-200 dark:bg-gray-700 h-8 w-8 mx-auto mb-3 rounded"></div>
                                            <div className="bg-gray-200 dark:bg-gray-700 h-8 w-16 mx-auto mb-1 rounded"></div>
                                            <div className="bg-gray-200 dark:bg-gray-700 h-4 w-24 mx-auto rounded"></div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))
                        ) : (
                            <>
                                <motion.div variants={fadeInUp} className="text-center">
                                    <Card className="p-6 hover:shadow-lg transition-shadow">
                                        <Database className="text-blue-600 mx-auto mb-3" size={32} />
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                                            {statistics.totalArtifacts.toLocaleString()}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">{defaultStats.totalArtifacts || 'Total Artifacts'}</p>
                                    </Card>
                                </motion.div>
                                <motion.div variants={fadeInUp} className="text-center">
                                    <Card className="p-6 hover:shadow-lg transition-shadow">
                                        <Award className="text-blue-600 mx-auto mb-3" size={32} />
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                                            {statistics.authenticatedArtifacts.toLocaleString()}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">{defaultStats.authenticated || 'Authenticated'}</p>
                                    </Card>
                                </motion.div>
                                <motion.div variants={fadeInUp} className="text-center">
                                    <Card className="p-6 hover:shadow-lg transition-shadow">
                                        <Clock className="text-orange-600 mx-auto mb-3" size={32} />
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                                            {statistics.recentAdditions.toLocaleString()}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">{defaultStats.recentAdditions || 'Recent Additions'}</p>
                                    </Card>
                                </motion.div>
                                <motion.div variants={fadeInUp} className="text-center">
                                    <Card className="p-6 hover:shadow-lg transition-shadow">
                                        <Users className="text-purple-600 mx-auto mb-3" size={32} />
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                                            {statistics.conservationProjects.toLocaleString()}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">{defaultStats.conservationProjects || 'Conservation Projects'}</p>
                                    </Card>
                                </motion.div>
                            </>
                        )}
                    </motion.div>
                )}

                {showFeatures && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Professional Authentication</h3>
                            <div className="space-y-4">
                                {displayFeatures.slice(0, 4).map((feature) => (
                                    <div key={feature.id} className="flex items-start">
                                        <feature.icon className="text-blue-600 mt-1 mr-3 flex-shrink-0" size={20} />
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{feature.title}</h4>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Digital Documentation</h3>
                            <div className="space-y-4">
                                {displayFeatures.slice(4, 8).map((feature) => (
                                    <div key={feature.id} className="flex items-start">
                                        <feature.icon className="text-blue-600 mt-1 mr-3 flex-shrink-0" size={20} />
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{feature.title}</h4>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Featured Artifacts Showcase */}
                <motion.div
                    className="mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <h3 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
                        Featured Artifacts
                    </h3>

                    {artifactsLoading ? (
                        // Loading skeleton for artifact cards
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div key={`artifact-skeleton-${index}`} className="animate-pulse">
                                    <Card className="overflow-hidden h-full">
                                        <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                                        <div className="p-4">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                                        </div>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    ) : artifactsError ? (
                        <div className="text-center text-gray-500 dark:text-gray-400">
                            <p>Unable to load featured artifacts at the moment.</p>
                        </div>
                    ) : featuredArtifactsData && featuredArtifactsData.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredArtifactsData.map((artifact, index) => (
                                <div key={artifact.id} className="group cursor-pointer" onClick={() => handleArtifactClick(artifact)}>
                                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                                        {/* Artifact Image */}
                                        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                                            {artifact.media && artifact.media.length > 0 ? (
                                                <img
                                                    src={`http://localhost:8080${artifact.media[0].filePath}`}
                                                    alt={artifact.name?.en || 'Artifact'}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Archive className="w-16 h-16 text-gray-400" />
                                                </div>
                                            )}

                                            {/* Fallback icon when image fails to load */}
                                            <div className="w-full h-full flex items-center justify-center hidden">
                                                <Archive className="w-16 h-16 text-gray-400" />
                                            </div>

                                            {/* Category Badge */}
                                            <div className="absolute top-3 left-3">
                                                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                                                    {artifact.category || 'Uncategorized'}
                                                </span>
                                            </div>

                                            {/* Authentication Status */}
                                            {artifact.authentications && artifact.authentications.some(auth => auth.status === 'Authentic') && (
                                                <div className="absolute top-3 right-3">
                                                    <div className="bg-green-500 text-white p-1 rounded-full">
                                                        <Shield className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Artifact Info */}
                                        <div className="p-4 flex-1 flex flex-col">
                                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-2 line-clamp-2">
                                                {artifact.name?.en || 'Untitled Artifact'}
                                            </h4>

                                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2 flex-1">
                                                {artifact.description?.en || 'No description available'}
                                            </p>

                                            {/* Heritage Site Info */}
                                            {artifact.heritageSite && (
                                                <div className="flex items-center text-sm text-gray-500 mb-3">
                                                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                                                    <span className="truncate">
                                                        {artifact.heritageSite.nameEn ||
                                                            artifact.heritageSite.nameRw ||
                                                            artifact.heritageSite.nameFr ||
                                                            'Unknown Site'}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Quick Stats */}
                                            <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>Recently added</span>
                                                </div>
                                                <span className="text-blue-600 font-medium">
                                                    {artifact.authentications && artifact.authentications.some(auth => auth.status === 'Authentic') ? 'Authenticated' : 'Pending'}
                                                </span>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 dark:text-gray-400">
                            <p>No artifacts available yet.</p>
                        </div>
                    )}

                    {/* Explore All Artifacts Button */}
                    <div className="text-center mt-8">
                        <Button
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                            onClick={() => navigate('/artifacts')}
                        >
                            Explore All Artifacts <ChevronRight className="ml-2" size={20} />
                        </Button>
                    </div>
                </motion.div>

                {showCTAButton && (
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <Button
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                            onClick={handleCTAClick}
                        >
                            {defaultCTA} <ChevronRight className="ml-2" size={20} />
                        </Button>
                    </motion.div>
                )}
            </div>
        </section>
    );
};

export default ArtifactSection; 