import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronRight, Clock, Users, Star } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { useGet } from '../../hooks/useSimpleApi';
import { useLanguage } from '../../contexts/LanguageContext';
import museum from '../../assets/Ethnographic-Museum.jpg';
import kandt from '../../assets/richardkandt.jpg';

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

const slideInFromBottom = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut"
        }
    }
};

const HeritageSitesSection = ({ isVisible = false }) => {
    const navigate = useNavigate();
    const { t, currentLanguage } = useLanguage();

    // Fetch heritage sites using the API
    const {
        data: sites,
        loading,
        error
    } = useGet('/api/heritage-sites', { status: 'ACTIVE', limit: 12 }, {
        enabled: isVisible,
        onSuccess: (data) => console.log('Heritage sites loaded:', data),
        onError: (error) => console.error('Failed to load heritage sites:', error)
    });

    // Ensure sites is always an array to prevent map errors
    const safeSites = Array.isArray(sites) ? sites : [];

    // Mock data for testing when API is not available
    const mockSites = [
        // {
        //     id: 'mock-1',
        //     name: 'Ethnographic Museum of Rwanda',
        //     description: 'A comprehensive museum showcasing Rwanda\'s cultural heritage, traditional artifacts, and historical exhibits.',
        //     category: 'Museum',
        //     location: 'Kigali, Rwanda',
        //     establishedDate: '1989-01-01',
        //     rating: '4.8',
        //     imageUrl: museum
        // },
        // {
        //     id: 'mock-2',
        //     name: 'Richard Kandt House Museum',
        //     description: 'Historical residence of the first German colonial resident, now a museum preserving colonial-era architecture.',
        //     category: 'Historical Site',
        //     location: 'Kigali, Rwanda',
        //     establishedDate: '1907-01-01',
        //     rating: '4.5',
        //     imageUrl: kandt
        // },
        {
            id: 'mock-3',
            name: 'King\'s Palace Museum',
            description:'The Ethnographic Museum in Huye is one of the most important museums in Rwanda, offering a deep insight into the country’s cultural history. It houses a vast collection of artifacts, traditional tools, crafts, musical instruments, and archaeological findings that tell the story of Rwanda’s past and traditions.',
            category: 'Museum',
            location: "RN1 Road, Huye (Butare), Southern Province",
            establishedDate: '1989',
            // rating: '4.7',
            imageUrl: museum
        }
    ];

    // Use mock data if no real data is available and not loading
    const displaySites = safeSites.length > 0 ? safeSites : (!loading && !error ? mockSites : []);

    // Additional safety check
    if (!Array.isArray(displaySites)) {
        console.warn('displaySites is not an array:', displaySites);
        return null;
    }

    const handleSiteClick = (site) => {
        navigate(`/dashboard/sites/${site.id}`);
    };

    const getSiteImage = (site, index) => {
        // Priority order for image sources
        if (site.imageUrl) {
            return site.imageUrl;
        }

        if (site.images && site.images.length > 0) {
            return site.images[0].url || site.images[0];
        }

        if (site.media && site.media.length > 0) {
            const imageMedia = site.media.find(m => m.type === 'image' || m.fileType?.startsWith('image/'));
            if (imageMedia) {
                return imageMedia.url || imageMedia.filePath || imageMedia.fileName;
            }
        }

        // Use category-based default images
        if (site.category) {
            const categoryLower = site.category.toLowerCase();
            if (categoryLower.includes('museum')) {
                return museum;
            } else if (categoryLower.includes('palace') || categoryLower.includes('royal')) {
                return kandt;
            } else if (categoryLower.includes('memorial') || categoryLower.includes('historical')) {
                return museum;
            }
        }

        // Fallback to alternating default images
        return index % 2 === 0 ? museum : kandt;
    };

    const getCategoryColor = (category) => {
        if (!category) return 'bg-gray-100 text-gray-800';

        const categoryLower = category.toLowerCase();
        if (categoryLower.includes('museum')) return 'bg-blue-100 text-blue-800';
        if (categoryLower.includes('palace') || categoryLower.includes('royal')) return 'bg-purple-100 text-purple-800';
        if (categoryLower.includes('memorial')) return 'bg-red-100 text-red-800';
        if (categoryLower.includes('historical')) return 'bg-orange-100 text-orange-800';
        if (categoryLower.includes('archaeological')) return 'bg-green-100 text-green-800';
        if (categoryLower.includes('cultural')) return 'bg-indigo-100 text-indigo-800';
        return 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString) => {
        if (!dateString) return t('heritageSites.unknown');
        try {
            return new Date(dateString).toLocaleDateString(currentLanguage === 'en' ? 'en-US' : 'fr-FR', {
                year: 'numeric',
                month: 'short'
            });
        } catch {
            return t('heritageSites.unknown');
        }
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.section
                    className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={slideInFromBottom}
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Section Header */}
                        <motion.div
                            className="text-center mb-16"
                            variants={fadeInUp}
                        >
                            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                {t('heritageSites.title')}
                            </h2>
                            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                                {t('heritageSites.subtitle')}
                            </p>
                        </motion.div>

                        {/* Heritage Sites Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="animate-pulse">
                                        <Card className="h-80">
                                            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
                                            <CardContent className="p-6">
                                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
                                                <div className="flex justify-between items-center">
                                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                                                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="text-center py-16">
                                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                                <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    {t('heritageSites.loadingError')}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                                    {t('heritageSites.loadingErrorMessage')}
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => window.location.reload()}
                                    className="px-8 py-3"
                                >
                                    {t('heritageSites.tryAgain')}
                                </Button>
                            </div>
                        ) : (
                            <motion.div
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                                variants={staggerContainer}
                            >
                                {displaySites.map((site, index) => (
                                    <motion.div
                                        key={site.id || index}
                                        variants={fadeInUp}
                                        whileHover={{ y: -8 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Card className="h-80 overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                                            {/* Site Image */}
                                            <div className="relative h-48 overflow-hidden">
                                                <img
                                                    src={getSiteImage(site, index)}
                                                    alt={site.name || 'Heritage Site'}
                                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        e.target.src = index % 2 === 0 ? museum : kandt;
                                                    }}
                                                />
                                                {/* Category Badge */}
                                                {site.category && (
                                                    <div className="absolute top-3 left-3">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(site.category)}`}>
                                                            {site.category}
                                                        </span>
                                                    </div>
                                                )}
                                                {/* Rating/Status Badge */}
                                                <div className="absolute top-3 right-3">
                                                    <span className="bg-white/90 text-gray-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                                                        <Star size={12} className="mr-1 text-yellow-500 fill-current" />
                                                        {site.rating || t('heritageSites.new')}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Site Information */}
                                            <CardContent className="p-6 flex flex-col h-32">
                                                <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                                                    {site.name || 'Heritage Site'}
                                                </CardTitle>

                                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">
                                                    {site.description || 'Discover the rich cultural heritage and historical significance of this remarkable site.'}
                                                </p>

                                                {/* Site Details */}
                                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                                                    {site.location && (
                                                        <span className="flex items-center">
                                                            <MapPin size={12} className="mr-1" />
                                                            {site.location}
                                                        </span>
                                                    )}
                                                    {site.establishedDate && (
                                                        <span className="flex items-center">
                                                            <Clock size={12} className="mr-1" />
                                                            {formatDate(site.establishedDate)}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Action Button */}
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 p-4"
                                                    onClick={() => handleSiteClick(site)}
                                                >
                                                    {t('heritageSites.seeMore')}
                                                    <ChevronRight size={16} className="ml-2" />
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}

                        {/* View All Button */}
                        <motion.div
                            className="text-center mt-16"
                            variants={fadeInUp}
                            transition={{ delay: 0.4 }}
                        >
                            <Link to="/sites">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="px-8 py-4 text-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300"
                                >
                                    {t('heritageSites.viewAll')}
                                    <ChevronRight className="ml-2" size={20} />
                                </Button>
                            </Link>
                        </motion.div>
                    </div>
                </motion.section>
            )}
        </AnimatePresence>
    );
};

export default HeritageSitesSection;
