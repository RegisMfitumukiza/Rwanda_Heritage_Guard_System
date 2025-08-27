import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
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

const FeaturedSitesSection = ({
    title,
    subtitle,
    maxSites = 8,
    showViewAllButton = true,
    customGridCols,
    customCardHeight,
    customImageHeight,
    customTitleSize,
    customDescriptionSize,
    showLocation = true,
    showCategory = true,
    showFullDescription = false,
    className = "py-20 bg-white dark:bg-gray-950",
    onSiteClick
}) => {
    const navigate = useNavigate();
    const { t, currentLanguage } = useLanguage();

    // Use translations for default values
    const defaultTitle = title || t('featured.title');
    const defaultSubtitle = subtitle || t('featured.subtitle');

    // Fetch featured heritage sites using new simplified API system
    const {
        data: sites = [],
        loading,
        error
    } = useGet('/api/heritage-sites', { status: 'ACTIVE', featured: true }, {
        onSuccess: (data) => console.log('Featured sites loaded:', data),
        onError: (error) => console.error('Failed to load featured sites:', error)
    });

    // Only show section if there is real data (not loading and sites exist)
    // Check both direct array and paginated content array
    const hasSites = sites && (Array.isArray(sites) ? sites.length > 0 : (sites.content && sites.content.length > 0));
    if (!loading && !hasSites) {
        return null;
    }

    // Process API response - the API returns a paginated object with sites in 'content' array
    const featuredSites = sites ? (Array.isArray(sites) ? sites : sites.content || sites.data || sites.sites || sites.items || []) : [];
    const displaySites = featuredSites.slice(0, maxSites);

    // Dynamic display configuration based on number of sites
    const getDisplayConfig = (siteCount) => ({
        gridCols: customGridCols || (siteCount <= 2 ? 'grid-cols-1 md:grid-cols-2' :
            siteCount <= 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' :
                'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'),
        cardHeight: customCardHeight || (siteCount <= 2 ? 'h-80' : siteCount <= 4 ? 'h-64' : 'h-56'),
        imageHeight: customImageHeight || (siteCount <= 2 ? 'h-48' : siteCount <= 4 ? 'h-40' : 'h-32'),
        titleSize: customTitleSize || (siteCount <= 2 ? 'text-xl' : siteCount <= 4 ? 'text-lg' : 'text-base'),
        descriptionSize: customDescriptionSize || (siteCount <= 2 ? 'text-base' : siteCount <= 4 ? 'text-sm' : 'text-xs'),
        showFullDescription: showFullDescription || siteCount <= 2,
        showLocation: showLocation && siteCount <= 4,
        showCategory: showCategory && siteCount <= 4
    });

    const config = getDisplayConfig(displaySites.length);

    const handleSiteClick = (site) => {
        if (onSiteClick) {
            onSiteClick(site);
        } else {
            // Navigate to the heritage site details page
            const siteId = site.id || site._id || site.siteId;
            if (siteId) {
                // Validate that the ID is numeric before navigating
                if (typeof siteId === 'string' && siteId.startsWith('mock-')) {
                    console.error('Mock ID detected, cannot navigate:', siteId);
                    return;
                }
                if (isNaN(Number(siteId))) {
                    console.error('Invalid ID format, cannot navigate:', siteId);
                    return;
                }
                navigate(`/heritage-site/${siteId}`);
            } else {
                console.error('No valid site ID found:', site);
            }
        }
    };

    const getSiteImage = (site, index) => {
        // Priority order for image sources:
        // 1. Site's primary image URL from API
        // 2. Site's images array (first image)
        // 3. Site's media array (first image)
        // 4. Default images based on category
        // 5. Fallback placeholder images

        // Check if site has a primary image URL
        if (site.imageUrl) {
            return site.imageUrl;
        }

        // Check if site has an images array
        if (site.images && site.images.length > 0) {
            return site.images[0].url || site.images[0];
        }

        // Check if site has a media array
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

    return (
        <section className={className} key={currentLanguage}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                        {defaultTitle}
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        {defaultSubtitle}
                    </p>
                </motion.div>

                {loading ? (
                    <div className={`grid ${config.gridCols} gap-6`}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="animate-pulse">
                                <div className={`bg-gray-200 dark:bg-gray-700 ${config.imageHeight} rounded-t-lg`}></div>
                                <div className="bg-white dark:bg-gray-900 p-4 rounded-b-lg">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400 mb-4">{t('common.error')}</p>
                        <Button
                            variant="outline"
                            onClick={() => window.location.reload()}
                        >
                            {t('common.tryAgain')}
                        </Button>
                    </div>
                ) : (
                    <motion.div
                        className={`grid ${config.gridCols} gap-6`}
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {displaySites.map((site, index) => (
                            <motion.div
                                key={site.id}
                                variants={fadeInUp}
                                whileHover={{ y: -5 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                                    <img
                                        src={getSiteImage(site, index)}
                                        alt={site.name}
                                        className={`${config.imageHeight} w-full object-cover`}
                                        loading="lazy"
                                        onError={(e) => {
                                            // Fallback to default image if the main image fails to load
                                            e.target.src = index % 2 === 0 ? museum : kandt;
                                        }}
                                    />
                                    <div className="p-4 flex flex-col h-full">
                                        <h3 className={`font-semibold ${config.titleSize} mb-2 flex-grow`}>
                                            {site.name}
                                        </h3>
                                        {config.showFullDescription && (
                                            <p className={`text-gray-600 ${config.descriptionSize} mb-3 flex-grow`}>
                                                {site.description}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between text-sm mt-auto">
                                            {config.showLocation && site.location && (
                                                <span className="flex items-center text-gray-500">
                                                    <MapPin size={16} className="mr-1" />
                                                    {site.location}
                                                </span>
                                            )}
                                            {config.showCategory && site.category && (
                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                                    {site.category}
                                                </span>
                                            )}
                                        </div>
                                        {!config.showFullDescription && (
                                            <Button
                                                variant="link"
                                                className="text-blue-600 hover:text-blue-700 p-0 mt-2"
                                                onClick={() => handleSiteClick(site)}
                                            >
                                                {t('common.viewDetails')} <ChevronRight size={16} className="ml-1" />
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {showViewAllButton && (
                    <motion.div
                        className="text-center mt-10"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <Link to="/sites">
                            <Button variant="default" size="lg">
                                {displaySites.length <= 2 ? t('featured.learnMore') : t('featured.viewAll')}
                                <ChevronRight className="ml-2" size={20} />
                            </Button>
                        </Link>
                    </motion.div>
                )}
            </div>
        </section>
    );
};

export default FeaturedSitesSection; 