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
    } = useGet('/api/heritage-sites', {
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
            console.log('✅ Heritage sites loaded:', data);
            console.log('📊 Data type:', typeof data);
            console.log('📊 Data length:', Array.isArray(data) ? data.length : 'Not an array');
            console.log('📊 Data keys:', data ? Object.keys(data) : 'No data');
            console.log('📊 Raw response:', JSON.stringify(data, null, 2));

            // Check if data is wrapped in a response object
            if (data && typeof data === 'object' && !Array.isArray(data)) {
                console.log('🔍 Data appears to be an object, checking for nested array...');
                console.log('🔍 Possible keys:', Object.keys(data));

                // Check common response wrapper patterns
                if (data.content && Array.isArray(data.content)) {
                    console.log('✅ Found sites in data.content');
                } else if (data.data && Array.isArray(data.data)) {
                    console.log('✅ Found sites in data.data');
                } else if (data.sites && Array.isArray(data.sites)) {
                    console.log('✅ Found sites in data.sites');
                } else if (data.items && Array.isArray(data.items)) {
                    console.log('✅ Found sites in data.items');
                }
            }
        },
        onError: (error) => {
            console.error('❌ Failed to load heritage sites:', error);
            console.error('🔍 Error details:', error.response?.data);
            console.error('🔍 Error status:', error.response?.status);
            console.error('🔍 Error message:', error.message);
            console.error('🔍 Full error object:', error);

            // Check if it's an authentication issue
            if (error.response?.status === 401) {
                console.warn('🔐 Authentication issue detected. This endpoint should be public.');
                console.warn('🔐 Check if there\'s an expired JWT token in localStorage');
            }
        }
    });

    // Process API response - the API returns a paginated object with sites in 'content' array
    const safeSites = effectiveSites ? (Array.isArray(effectiveSites) ? effectiveSites : effectiveSites.content || effectiveSites.data || effectiveSites.sites || effectiveSites.items || []) : [];

    console.log('🔍 Processing sites from API response:', {
        rawSites: sites,
        fallbackData: fallbackData,
        effectiveSites: effectiveSites,
        hasContent: effectiveSites?.content ? 'Yes' : 'No',
        contentLength: effectiveSites?.content?.length || 0,
        safeSitesLength: safeSites.length
    });

    // Temporary workaround: If useGet fails, try manual fetch and use the data
    const [fallbackData, setFallbackData] = React.useState(null);

    React.useEffect(() => {
        if (isVisible && !sites && !loading && !error) {
            console.log('🔄 useGet returned null, trying manual fetch as fallback...');
            fetch('/api/heritage-sites?page=0&size=12')
                .then(res => res.json())
                .then(data => {
                    console.log('🔄 Manual fallback fetch result:', data);
                    if (data && data.content) {
                        console.log('✅ Manual fallback successful, found sites:', data.content.length);
                        setFallbackData(data);
                    }
                })
                .catch(err => console.error('❌ Manual fallback failed:', err));
        }
    }, [isVisible, sites, loading, error]);

    // Use fallback data if useGet failed
    const effectiveSites = sites || fallbackData;

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
        console.warn('displaySites is not an array:', displaySites);
        return null;
    }

    const handleSiteClick = (site) => {
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

                        {/* Debug Information */}
                        <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
                            <h4 className="font-semibold mb-2">🔍 Debug Info:</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                <div>
                                    <strong>Loading:</strong> {loading.toString()}
                                </div>
                                <div>
                                    <strong>Error:</strong> {error ? error.message : 'None'}
                                </div>
                                <div>
                                    <strong>Safe Sites:</strong> {safeSites.length}
                                </div>
                                <div>
                                    <strong>Display Sites:</strong> {displaySites.length}
                                </div>
                                <div>
                                    <strong>API URL:</strong> /api/heritage-sites
                                </div>
                                <div>
                                    <strong>API Params:</strong> page=0, size=12
                                </div>
                                <div>
                                    <strong>Component Visible:</strong> {isVisible.toString()}
                                </div>
                                <div>
                                    <strong>Raw Sites:</strong> {sites ? (Array.isArray(sites) ? sites.length : typeof sites) : 'null'}
                                </div>
                                <div>
                                    <strong>Content Array:</strong> {sites?.content ? `${sites.content.length} items` : 'No content array'}
                                </div>
                            </div>
                            <div className="mt-2 space-x-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        console.log('🔍 Current state:', { sites, safeSites, displaySites, loading, error, isVisible });
                                    }}
                                >
                                    Debug Console
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        console.log('🧪 Testing heritage sites endpoint manually...');
                                        // Clear any potential authentication issues
                                        const token = localStorage.getItem('token');
                                        console.log('🔐 Current token:', token ? 'Present' : 'None');

                                        // Test without authentication
                                        fetch('/api/heritage-sites?page=0&size=5', {
                                            headers: {
                                                'Content-Type': 'application/json',
                                                // Explicitly remove Authorization header
                                                'Authorization': ''
                                            }
                                        })
                                            .then(res => {
                                                console.log('📊 Manual Test Response Status:', res.status);
                                                console.log('📊 Manual Test Response Headers:', res.headers);
                                                return res.json();
                                            })
                                            .then(data => {
                                                console.log('📊 Manual Test Data:', data);
                                                // Test if we can manually set the state
                                                console.log('🧪 Testing manual state update...');
                                                // This will help us see if the issue is with state management
                                                if (data && data.content) {
                                                    console.log('✅ Manual data has content, testing state update');
                                                }
                                            })
                                            .catch(err => console.error('❌ Manual Test Error:', err));
                                    }}
                                >
                                    Test Public Access
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        console.log('🧪 Testing alternative API endpoints...');
                                        // Test different status values
                                        fetch('/api/heritage-sites?status=PUBLISHED&limit=5')
                                            .then(res => res.json())
                                            .then(data => console.log('📊 PUBLISHED sites:', data))
                                            .catch(err => console.error('❌ PUBLISHED error:', err));

                                        fetch('/api/heritage-sites?limit=5')
                                            .then(res => res.json())
                                            .then(data => console.log('📊 No status filter:', data))
                                            .catch(err => console.error('❌ No status error:', err));

                                        fetch('/api/statistics')
                                            .then(res => res.json())
                                            .then(data => console.log('📊 Statistics:', data))
                                            .catch(err => console.error('❌ Statistics error:', err));

                                        // Test the heritage sites endpoint directly
                                        fetch('/api/heritage-sites?page=0&size=5')
                                            .then(res => {
                                                console.log('📊 Heritage Sites Response Status:', res.status);
                                                console.log('📊 Heritage Sites Response Headers:', res.headers);
                                                return res.json();
                                            })
                                            .then(data => console.log('📊 Heritage Sites Direct Fetch:', data))
                                            .catch(err => console.error('❌ Heritage Sites Direct Fetch Error:', err));
                                    }}
                                >
                                    Test Endpoints
                                </Button>
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
