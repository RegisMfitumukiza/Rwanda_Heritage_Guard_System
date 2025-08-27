import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronRight, Clock, Users, Star, Phone } from 'lucide-react';
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
    const useGetResult = useGet('/api/heritage-sites', {
        // Use pagination parameters that match the backend
        page: 0,
        size: 12,
        // Try different status values if needed
        // status: 'ACTIVE',
        // status: 'PUBLISHED',
        // status: 'APPROVED'
    }, {
        enabled: isVisible,
        onSuccess: (data) => {
            // Data loaded successfully - no debug logging needed
        },
        onError: (error) => {
            // Error handling - minimal logging for production
            console.error('Failed to load heritage sites:', error.message);
        }
    });

    // Destructure the result to debug the issue
    // The useGet hook returns { data, loading, error }
    const sites = useGetResult?.data;
    const loading = useGetResult?.loading;
    const error = useGetResult?.error;

    // Primary data source - useGet hook is now reliable
    const effectiveSites = sites;

    // Process API response - the API returns a paginated object with sites in 'content' array
    const safeSites = effectiveSites ? (Array.isArray(effectiveSites) ? effectiveSites : effectiveSites.content || effectiveSites.data || effectiveSites.sites || effectiveSites.items || []) : [];

    // Debug logging removed for production

    // Only use real API data - no mock data fallback
    const displaySites = safeSites.filter(site => {
        const siteId = site.id || site._id || site.siteId;
        // Filter out any sites with mock IDs or invalid IDs
        if (!siteId) return false;
        if (typeof siteId === 'string' && siteId.startsWith('mock-')) return false;
        if (isNaN(Number(siteId))) return false;
        return true;
    });

    // Additional safety check
    if (!Array.isArray(displaySites)) {
        return null;
    }

    const handleSiteClick = (site) => {
        // Navigate to the heritage site details page
        const siteId = site.id || site._id || site.siteId;
        if (siteId) {
            // Validate that the ID is numeric before navigating
            if (typeof siteId === 'string' && siteId.startsWith('mock-')) {
                return;
            }
            if (isNaN(Number(siteId))) {
                return;
            }
            navigate(`/heritage-site/${siteId}`);
        }
    };

    const getSiteImage = (site, index) => {
        // Enhanced hero image selection with priority system (same as SiteDetails.jsx)

        // Debug logging for image selection
        console.log(`🔍 Image selection for site ${site.id || site.name}:`, {
            hasMedia: !!site.media,
            mediaCount: site.media?.length || 0,
            mediaCategories: site.media?.map(m => ({ id: m.id, category: m.category, isActive: m.isActive, isPublic: m.isPublic })) || []
        });

        // Priority 1: Hero category image from site media
        if (site.media && site.media.length > 0) {
            const heroImage = site.media.find(media =>
                media.isActive &&
                media.isPublic &&
                (media.category === 'hero' || media.category === 'primary' || media.isPrimary === true)
            );
            if (heroImage) {
                console.log(`✅ Hero image found:`, heroImage);
                // Construct API endpoint for media files (same logic as SiteDetails.jsx)
                if (heroImage.filePath) {
                    if (heroImage.filePath.startsWith('http')) {
                        return heroImage.filePath;
                    }
                    const heroUrl = `/api/media/download/${heroImage.id}`;
                    console.log(`🔗 Hero image URL: ${heroUrl}`);
                    return heroUrl;
                }
            }
        }

        // Priority 2: First available image from site media
        if (site.media && site.media.length > 0) {
            const firstImage = site.media.find(media =>
                media.isActive &&
                media.isPublic &&
                (media.fileType?.startsWith('image/') || media.fileType === 'image' || media.category === 'photos')
            );
            if (firstImage) {
                console.log(`✅ First image found:`, firstImage);
                if (firstImage.filePath) {
                    if (firstImage.filePath.startsWith('http')) {
                        return firstImage.filePath;
                    }
                    const firstImageUrl = `/api/media/download/${firstImage.id}`;
                    console.log(`🔗 First image URL: ${firstImageUrl}`);
                    return firstImageUrl;
                }
            }
        }

        // Priority 3: Any available media file
        if (site.media && site.media.length > 0) {
            const anyMedia = site.media.find(media => media.isActive && media.isPublic);
            if (anyMedia && anyMedia.filePath) {
                if (anyMedia.filePath.startsWith('http')) {
                    return anyMedia.filePath;
                }
                return `/api/media/download/${anyMedia.id}`;
            }
        }

        // Priority 4: Legacy image fields (backward compatibility)
        if (site.imageUrl) {
            return site.imageUrl;
        }

        if (site.images && site.images.length > 0) {
            return site.images[0].url || site.images[0];
        }

        // Priority 5: Category-based default images
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

        // Priority 6: Fallback to alternating default images
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

                        {/* Production Status Panel */}
                        <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm border border-green-200 dark:border-green-800">
                            <h4 className="font-semibold mb-2 text-green-700 dark:text-green-300">✅ Heritage Sites Status</h4>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                <div><strong>Status:</strong> <span className="text-green-600">Active</span></div>
                                <div><strong>Sites Found:</strong> <span className="text-green-600">{safeSites.length}</span></div>
                                <div><strong>Loading:</strong> {loading ? '🔄 Yes' : '⏸️ No'}</div>
                                <div><strong>Error:</strong> {error ? '❌ Yes' : '✅ No'}</div>
                            </div>
                        </div>

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
                        ) : displaySites.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="text-gray-400 text-6xl mb-4">🏛️</div>
                                <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    {t('heritageSites.noSitesAvailable')}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                                    {t('heritageSites.noSitesMessage')}
                                </p>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    <p>API Response: {JSON.stringify(sites)}</p>
                                    <p>Content Array: {sites?.content ? `${sites.content.length} items` : 'No content array'}</p>
                                    <p>Safe Sites Length: {safeSites.length}</p>
                                    <p>Loading: {loading.toString()}</p>
                                    <p>Error: {error ? error.message : 'None'}</p>
                                </div>
                            </div>
                        ) : (
                            <motion.div
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8"
                                variants={staggerContainer}
                            >
                                {displaySites.map((site, index) => (
                                    <motion.div
                                        key={site.id || index}
                                        variants={fadeInUp}
                                        whileHover={{ y: -8 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Card className="min-h-[28rem] w-full max-w-sm overflow-visible hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
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
                                                {/* Category and Ownership Badges */}
                                                <div className="absolute top-3 left-3 space-y-2">
                                                    {site.category && (
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(site.category)}`}>
                                                            {site.category}
                                                        </span>
                                                    )}
                                                    {site.ownershipType && (
                                                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                                                            {site.ownershipType}
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Status Badge */}
                                                <div className="absolute top-3 right-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${site.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                                        site.status === 'UNDER_CONSERVATION' ? 'bg-yellow-100 text-yellow-800' :
                                                            site.status === 'INACTIVE' ? 'bg-red-100 text-red-800' :
                                                                'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {site.status === 'ACTIVE' ? '🟢 Active' :
                                                            site.status === 'UNDER_CONSERVATION' ? '🟡 Conservation' :
                                                                site.status === 'INACTIVE' ? '🔴 Inactive' :
                                                                    site.status || 'Unknown'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Site Information */}
                                            <CardContent className="p-6 flex flex-col min-h-[12rem]">
                                                <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 line-clamp-2 break-words">
                                                    {currentLanguage === 'en' ? (site.nameEn || site.name) :
                                                        currentLanguage === 'fr' ? (site.nameFr || site.nameEn || site.name) :
                                                            currentLanguage === 'rw' ? (site.nameRw || site.nameEn || site.name) :
                                                                (site.nameEn || site.name) || 'Heritage Site'}
                                                </CardTitle>

                                                {/* Show significance when available */}
                                                {(currentLanguage === 'en' ? site.significanceEn :
                                                    currentLanguage === 'fr' ? (site.significanceFr || site.significanceEn) :
                                                        currentLanguage === 'rw' ? (site.significanceRw || site.significanceEn) :
                                                            site.significanceEn) && (
                                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 flex-grow leading-relaxed break-words">
                                                            {currentLanguage === 'en' ? site.significanceEn :
                                                                currentLanguage === 'fr' ? (site.significanceFr || site.significanceEn) :
                                                                    currentLanguage === 'rw' ? (site.significanceRw || site.significanceEn) :
                                                                        site.significanceEn}
                                                        </p>
                                                    )}



                                                {/* Site Details */}
                                                <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                                                    {site.region && (
                                                        <div className="flex items-center">
                                                            <MapPin size={14} className="mr-2 text-blue-500" />
                                                            <span className="font-medium">{site.region}</span>
                                                        </div>
                                                    )}
                                                    {site.address && (
                                                        <div className="flex items-start">
                                                            <MapPin size={14} className="mr-2 text-green-500 mt-0.5" />
                                                            <span className="line-clamp-2">{site.address}</span>
                                                        </div>
                                                    )}
                                                    {site.establishmentYear && (
                                                        <div className="flex items-center">
                                                            <Clock size={14} className="mr-2 text-orange-500" />
                                                            <span>Est. {site.establishmentYear}</span>
                                                        </div>
                                                    )}
                                                    {site.contactInfo && (
                                                        <div className="flex items-center">
                                                            <Phone size={14} className="mr-2 text-purple-500" />
                                                            <span className="line-clamp-1">{site.contactInfo}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Action Button */}
                                                <div className="mt-auto pt-4 pb-2">
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 py-3 hover:shadow-lg transform hover:-translate-y-0.5"
                                                        onClick={() => handleSiteClick(site)}
                                                    >
                                                        {t('heritageSites.exploreDetails')}
                                                        <ChevronRight size={16} className="ml-2" />
                                                    </Button>
                                                </div>
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
