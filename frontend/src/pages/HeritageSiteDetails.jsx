import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin,
    Clock,
    Star,
    Calendar,
    ArrowLeft,
    Share2,
    Heart,
    Bookmark,
    Camera,
    Info,
    Navigation,
    ExternalLink,
    Phone,
    Mail,
    Globe,
    Users,
    ChevronLeft,
    ChevronRight,
    X,
    Map,
    Shield,
    BarChart3,
    Eye,
    ClockIcon,
    AlertCircle,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { LazyImage } from '../components/ui/LazyImage';
import { useGet } from '../hooks/useSimpleApi';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
// Map functionality - using Google Maps integration instead of Leaflet
// If you want to use Leaflet, install: npm install leaflet react-leaflet
// Then uncomment the imports below:
// import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
//
// CURRENT IMPLEMENTATION: Uses Google Maps integration for external navigation
// and displays coordinates in a user-friendly format within the modal.

const HeritageSiteDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentLanguage, changeLanguage, t } = useLanguage();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [isFavorite, setIsFavorite] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [showImageModal, setShowImageModal] = useState(false);
    const [showMapModal, setShowMapModal] = useState(false);
    const [toast, setToast] = useState({ type: '', message: '' });

    // New state for artifacts
    const [artifacts, setArtifacts] = useState([]);
    const [artifactsLoading, setArtifactsLoading] = useState(false);
    const [artifactsError, setArtifactsError] = useState(null);
    const [selectedArtifact, setSelectedArtifact] = useState(null);
    const [showArtifactModal, setShowArtifactModal] = useState(false);

    // Validate ID parameter - redirect if invalid
    React.useEffect(() => {
        if (id && (id.startsWith('mock-') || isNaN(Number(id)))) {
            console.warn('Invalid heritage site ID detected:', id);
            navigate('/');
            return;
        }
    }, [id, navigate]);

    // Fetch heritage site details using enhanced API system (same as SiteDetails.jsx)
    const {
        data: site,
        loading,
        error,
        refetch,
        refetchWithParams
    } = useGet(`/api/heritage-sites/${id}`, {
        language: currentLanguage
    }, {
        enabled: !!id && !id.startsWith('mock-') && !isNaN(Number(id)),
        onSuccess: (data) => {
            console.log('✅ Site details loaded:', data);
            console.log('📊 Site ID:', id);
            console.log('📊 Current language:', currentLanguage);
            console.log('📊 Site name in different languages:', {
                nameEn: data?.nameEn,
                nameRw: data?.nameRw,
                nameFr: data?.nameFr
            });
        },
        onError: (error) => {
            console.error('❌ Failed to load site details:', error);
            console.error('🔍 Error details:', error.response?.data);
            console.error('🔍 Error status:', error.response?.status);
            console.error('🔍 Site ID being requested:', id);

            // If it's a 400 error with invalid ID, redirect to home
            if (error.response?.status === 400 && error.response?.data?.message?.includes('Failed to convert')) {
                console.warn('Invalid ID format detected, redirecting to home');
                navigate('/');
            }
        }
    });

    // Fetch artifacts when artifacts tab is selected
    const {
        data: artifactsData,
        loading: artifactsLoadingState,
        error: artifactsErrorState,
        refetch: refetchArtifacts
    } = useGet(`/api/heritage-sites/${id}/artifacts`, {
        language: currentLanguage
    }, {
        enabled: activeTab === 'artifacts' && !!id && !id.startsWith('mock-') && !isNaN(Number(id)),
        onSuccess: (data) => {
            console.log('✅ Artifacts loaded:', data);
            console.log('🔍 Artifacts array:', data?.artifacts);
            if (data?.artifacts && data.artifacts.length > 0) {
                console.log('🔍 First artifact:', data.artifacts[0]);
                console.log('🔍 First artifact media:', data.artifacts[0].media);
            }
            setArtifacts(data?.artifacts || []);
            setArtifactsError(null);
        },
        onError: (error) => {
            console.error('❌ Failed to load artifacts:', error);
            setArtifactsError(error);
            setArtifacts([]);
        }
    });

    // Update local state when API state changes
    useEffect(() => {
        setArtifactsLoading(artifactsLoadingState);
        setArtifactsError(artifactsErrorState);
    }, [artifactsLoadingState, artifactsErrorState]);

    // Calculate artifact statistics
    const artifactStats = React.useMemo(() => {
        if (!artifacts || artifacts.length === 0) {
            return {
                total: 0,
                authenticated: 0,
                pending: 0,
                rejected: 0
            };
        }

        return {
            total: artifacts.length,
            authenticated: artifacts.filter(a => a.authenticationStatus === 'AUTHENTICATED').length,
            pending: artifacts.filter(a => a.authenticationStatus === 'PENDING_AUTHENTICATION').length,
            rejected: artifacts.filter(a => a.authenticationStatus === 'REJECTED').length
        };
    }, [artifacts]);

    // Handle artifact selection
    const handleArtifactClick = (artifact) => {
        setSelectedArtifact(artifact);
        setShowArtifactModal(true);
    };

    // Get authentication status display info
    const getAuthStatusInfo = (status) => {
        switch (status) {
            case 'AUTHENTICATED':
                return {
                    icon: CheckCircle,
                    color: 'text-green-600',
                    bgColor: 'bg-green-100',
                    borderColor: 'border-green-200',
                    label: t('siteDetails.authenticated')
                };
            case 'PENDING_AUTHENTICATION':
                return {
                    icon: ClockIcon,
                    color: 'text-yellow-600',
                    bgColor: 'bg-yellow-100',
                    borderColor: 'border-yellow-200',
                    label: t('siteDetails.pending')
                };
            case 'REJECTED':
                return {
                    icon: XCircle,
                    color: 'text-red-600',
                    bgColor: 'bg-red-100',
                    borderColor: 'border-red-200',
                    label: t('siteDetails.rejected')
                };
            default:
                return {
                    icon: AlertCircle,
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-100',
                    borderColor: 'border-gray-200',
                    label: t('siteDetails.unknown')
                };
        }
    };

    // Get artifact name in current language
    const getArtifactName = (artifact) => {
        if (!artifact || !artifact.names) return 'Unnamed Artifact';

        const currentLangName = artifact.names.find(name =>
            name.languageCode === currentLanguage
        );

        if (currentLangName) return currentLangName.nameText;

        // Fallback to primary name or first available
        const primaryName = artifact.names.find(name => name.isPrimary);
        if (primaryName) return primaryName.nameText;

        return artifact.names[0]?.nameText || 'Unnamed Artifact';
    };

    // Get artifact description in current language
    const getArtifactDescription = (artifact) => {
        if (!artifact || !artifact.descriptions) return '';

        const currentLangDesc = artifact.descriptions.find(desc =>
            desc.languageCode === currentLanguage
        );

        if (currentLangDesc) return currentLangDesc.descriptionText;

        // Fallback to primary description or first available
        const primaryDesc = artifact.descriptions.find(desc => desc.isPrimary);
        if (primaryDesc) return primaryDesc.descriptionText;

        return artifact.descriptions[0]?.descriptionText || '';
    };

    // Get primary image for artifact
    const getArtifactPrimaryImage = (artifact) => {
        if (!artifact || !artifact.media || artifact.media.length === 0) {
            return '/heritage_placeholder.jpg';
        }

        // Get the first media item (since we don't have isPrimary field)
        const mediaItem = artifact.media[0];

        console.log('Media item:', mediaItem);

        if (mediaItem && mediaItem.filePath) {
            // Check if it's already a full URL
            if (mediaItem.filePath.startsWith('http')) {
                return mediaItem.filePath;
            }

            // If we have an ID, construct the download URL
            if (mediaItem.id) {
                return `/api/media/download/${mediaItem.id}`;
            }

            // Fallback: try to use filePath directly if it's a relative path
            if (mediaItem.filePath.startsWith('/')) {
                return mediaItem.filePath;
            }
        }

        return '/heritage_placeholder.jpg';
    };

    // Get the appropriate name and description based on current language (same as SiteDetails.jsx)
    const getLocalizedField = (fieldName) => {
        const lang = currentLanguage || 'en';
        return site?.[`${fieldName}${lang === 'en' ? 'En' : lang === 'rw' ? 'Rw' : 'Fr'}`] || site?.[`${fieldName}En`] || t('siteDetails.notAvailable');
    };

    const siteName = getLocalizedField('name');
    const siteDescription = getLocalizedField('description');
    const siteSignificance = getLocalizedField('significance');

    // Handle media/images - check if site has media (same as SiteDetails.jsx)
    const getMediaUrl = (media) => {
        // Backend provides filePath, we need to construct the URL
        if (media.filePath) {
            // Check if it's already a full URL
            if (media.filePath.startsWith('http')) {
                return media.filePath;
            }
            // Construct API endpoint for media files
            return `/api/media/download/${media.id}`;
        }
        return '/heritage_placeholder.jpg';
    };

    // Debug logging for media data
    console.log('Site data:', site);
    console.log('Site media:', site?.media);

    const images = site?.media && site.media.length > 0
        ? site.media
            .filter(media => {
                console.log('Filtering media:', media);
                const isActive = media.isActive;
                const isPublic = media.isPublic;
                console.log(`Media ${media.id}: isActive=${isActive}, isPublic=${isPublic}`);
                return isActive && isPublic;
            })
            .map(media => {
                const url = getMediaUrl(media);
                console.log(`Media ${media.id} URL: ${url}`);
                return {
                    id: media.id,
                    url: url,
                    caption: media.description || media.fileName || siteName,
                    fileName: media.fileName,
                    fileType: media.fileType,
                    dateTaken: media.dateTaken,
                    photographer: media.photographer,
                    category: media.category
                };
            })
        : [{ url: '/heritage_placeholder.jpg', caption: siteName }];

    console.log('Final images array:', images);

    // Enhanced hero image selection with priority system (same as SiteDetails.jsx)
    const getHeroImage = (images) => {
        // Priority 1: Explicitly marked as "hero" or "primary"
        const heroImage = images.find(img =>
            img.category === 'hero' ||
            img.category === 'primary' ||
            img.isPrimary === true
        );
        if (heroImage) {
            console.log('Hero image found by category/flag:', heroImage.fileName);
            return heroImage;
        }

        // Priority 2: First image (excluding documents, preferring photos)
        const firstImage = images.find(img =>
            img.fileType?.startsWith('image/') ||
            img.fileType === 'image' ||
            img.category === 'photos'
        );
        if (firstImage) {
            console.log('Hero image found by file type (image):', firstImage.fileName);
            return firstImage;
        }

        // Priority 3: Any media file (including videos, documents)
        const anyMedia = images.find(img => img.url !== '/heritage_placeholder.jpg');
        if (anyMedia) {
            console.log('Hero image found (any media):', anyMedia.fileName);
            return anyMedia;
        }

        // Priority 4: Fallback placeholder
        console.log('No media found, using placeholder');
        return { url: '/heritage_placeholder.jpg', caption: t('siteDetails.noImageAvailable') };
    };

    const heroImage = getHeroImage(images);

    // Process site data for backward compatibility
    const processedSite = site ? {
        id: site.id || site._id || site.siteId,
        name: siteName, // Use localized name
        description: siteDescription, // Use localized description
        category: site.category || site.type || site.siteCategory,
        location: site.region && site.address ? `${site.region} - ${site.address}` : site.region || site.address,
        establishedDate: site.establishmentYear || site.establishedDate || site.foundedDate,
        rating: site.rating || site.score || site.visitorRating,
        imageUrl: heroImage.url, // Use hero image
        images: images, // Use processed media array
        coordinates: site.gpsLatitude && site.gpsLongitude ? { lat: site.gpsLatitude, lng: site.gpsLongitude } : null,
        contactInfo: site.contactInfo || site.contact,
        historicalSignificance: siteSignificance, // Use localized significance
        visitingHours: site.visitingHours || site.hours,
        admissionFee: site.admissionFee || site.fee,
        facilities: site.facilities || site.amenities,
        website: site.website || site.url,
        phone: site.phone || site.telephone,
        email: site.email || site.contactEmail
    } : null;

    // Define functions first
    const handleBackClick = () => navigate(-1);
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: processedSite?.name || 'Heritage Site',
                text: processedSite?.description || 'Discover this amazing heritage site',
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    const displaySite = processedSite;

    // If no site data is available, show error
    if (!displaySite) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">🏛️</div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        {t('siteDetails.siteNotFound')}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        {t('siteDetails.siteNotFound')} - {t('siteDetails.notAvailable')}
                    </p>
                    <div className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                        <p>Site ID: {id}</p>
                        <p>API Response: {JSON.stringify(site)}</p>
                        <p>Processed Site: {JSON.stringify(processedSite)}</p>
                        <p>ID Validation: {id ? (id.startsWith('mock-') ? 'Mock ID detected' : isNaN(Number(id)) ? 'Invalid ID format' : 'Valid ID') : 'No ID'}</p>
                    </div>
                    <div className="flex gap-4 justify-center">
                        <Button onClick={handleBackClick} variant="outline">
                            <ArrowLeft className="mr-2" size={16} />
                            {t('siteDetails.goBack')}
                        </Button>
                        <Button onClick={() => navigate('/')}>
                            {t('siteDetails.goHome')}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Image modal functions (same as SiteDetails.jsx)
    const openImageModal = (index) => {
        setSelectedImageIndex(index);
        setShowImageModal(true);
    };

    const nextImage = () => {
        setSelectedImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    // Map functions
    const openMapModal = () => {
        setShowMapModal(true);
    };

    const copyCoordinates = () => {
        if (site.gpsLatitude && site.gpsLongitude) {
            navigator.clipboard.writeText(`${site.gpsLatitude}, ${site.gpsLongitude}`);
            setToast({ type: 'success', message: t('siteDetails.coordinatesCopied') });
        }
    };

    const openGoogleMaps = () => {
        if (site.gpsLatitude && site.gpsLongitude) {
            const url = `https://www.google.com/maps?q=${site.gpsLatitude},${site.gpsLongitude}`;
            window.open(url, '_blank');
        }
    };

    // Dynamic visiting hours logic
    const getVisitingHoursStatus = () => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

        // Check if current time is between 09:00 and 17:00 (9 AM to 5 PM)
        const isOpenTime = currentHour >= 9 && currentHour < 17;

        // Check if it's a weekday (Monday = 1, Tuesday = 2, ..., Friday = 5)
        const isWeekday = currentDay >= 1 && currentDay <= 5;

        if (isOpenTime && isWeekday) {
            return `🟢 ${t('siteDetails.openNow')}`;
        } else if (isOpenTime && (currentDay === 0 || currentDay === 6)) {
            return `🟡 ${t('siteDetails.weekendHours')}`;
        } else {
            return `🔴 ${t('siteDetails.closed')}`;
        }
    };

    const getVisitingHoursDetails = () => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentDay = now.getDay();

        const isOpenTime = currentHour >= 9 && currentHour < 17;
        const isWeekday = currentDay >= 1 && currentDay <= 5;

        if (isOpenTime && isWeekday) {
            return {
                status: t('siteDetails.openNow'),
                color: 'text-green-600',
                bgColor: 'bg-green-100',
                icon: '🟢'
            };
        } else if (isOpenTime && (currentDay === 6)) {
            return {
                status: t('siteDetails.weekendHours'),
                color: 'text-yellow-600',
                bgColor: 'bg-yellow-100',
                icon: '🟡'
            };
        } else {
            return {
                status: t('siteDetails.closed'),
                color: 'text-red-600',
                bgColor: 'bg-red-100',
                icon: '🔴'
            };
        }
    };

    const getCategoryColor = (category) => {
        if (!category) return 'bg-gray-100 text-gray-800';
        const categoryLower = category.toLowerCase();
        if (categoryLower.includes('museum')) return 'bg-blue-100 text-blue-800';
        if (categoryLower.includes('palace') || categoryLower.includes('royal')) return 'bg-purple-100 text-purple-800';
        if (categoryLower.includes('memorial')) return 'bg-red-100 text-red-800';
        if (categoryLower.includes('historical')) return 'bg-orange-100 text-orange-800';
        return 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString) => {
        if (!dateString) return t('siteDetails.unknown');
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return t('siteDetails.unknown');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">{t('siteDetails.loadingSiteDetails')}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        {t('siteDetails.unableToLoadSite')}
                    </h2>
                    <div className="flex gap-4 justify-center">
                        <Button onClick={handleBackClick} variant="outline">
                            <ArrowLeft className="mr-2" size={16} />
                            {t('siteDetails.goBack')}
                        </Button>
                        <Button onClick={() => window.location.reload()}>
                            {t('siteDetails.tryAgain')}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Button
                            onClick={handleBackClick}
                            variant="ghost"
                            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                        >
                            <ArrowLeft className="mr-2" size={16} />
                            {t('siteDetails.backToSites')}
                        </Button>
                        <div className="flex items-center gap-3">
                            {/* Language Switcher */}
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">{t('siteDetails.language')}:</span>
                                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                                    {['en', 'rw', 'fr'].map((lang) => (
                                        <button
                                            key={lang}
                                            onClick={() => {
                                                console.log('Language switching to:', lang);
                                                // Update language context
                                                changeLanguage(lang);
                                                // Force refetch with new language parameter
                                                console.log('Refetching with language:', lang);
                                                refetchWithParams({ language: lang });
                                            }}
                                            className={`px-3 py-1 text-sm font-medium transition-colors ${currentLanguage === lang
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            {lang.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button
                                onClick={() => setIsBookmarked(!isBookmarked)}
                                variant="ghost"
                                className={`${isBookmarked ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}
                            >
                                <Bookmark size={20} className={isBookmarked ? 'fill-current' : ''} />
                            </Button>
                            <Button
                                onClick={() => setIsFavorite(!isFavorite)}
                                variant="ghost"
                                className={`${isFavorite ? 'text-red-600' : 'text-gray-400'}`}
                            >
                                <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
                            </Button>
                            <Button onClick={handleShare} variant="ghost" className="text-gray-600 dark:text-gray-400">
                                <Share2 size={20} />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                {/* Hero Section */}
                <div className="mb-8">
                    <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
                        <LazyImage
                            src={heroImage.url}
                            alt={siteName}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-8">
                            <div className="flex items-center gap-3 mb-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(displaySite.category)}`}>
                                    {displaySite.category}
                                </span>
                                {displaySite.rating && (
                                    <div className="flex items-center text-white">
                                        <Star size={16} className="text-yellow-400 fill-current mr-1" />
                                        <span className="text-sm font-medium">{displaySite.rating}</span>
                                    </div>
                                )}
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
                                {siteName}
                            </h1>
                            <div className="flex items-center text-white/90 text-sm space-x-6">
                                {site.region && site.address && (
                                    <div className="flex items-center">
                                        <MapPin size={16} className="mr-2" />
                                        {site.region} - {site.address}
                                    </div>
                                )}
                                {site.establishmentYear && (
                                    <div className="flex items-center">
                                        <Calendar size={16} className="mr-2" />
                                        Est. {site.establishmentYear}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                    {/* Left Column - Main Content */}
                    <div className="xl:col-span-2">
                        {/* Tabs */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                            <div className="border-b border-gray-200 dark:border-gray-700">
                                <nav className="flex space-x-8 px-6">
                                    {[
                                        { id: 'overview', label: t('siteDetails.overview'), icon: Info },
                                        { id: 'gallery', label: t('siteDetails.photoGallery'), icon: Camera },
                                        { id: 'artifacts', label: t('siteDetails.artifacts'), icon: Shield },
                                        { id: 'visiting', label: t('siteDetails.visitingInfo'), icon: Navigation }
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === tab.id
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                }`}
                                        >
                                            <tab.icon size={16} />
                                            {tab.label}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            <div className="p-6">
                                <AnimatePresence mode="wait">
                                    {activeTab === 'overview' && (
                                        <motion.div
                                            key="overview"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="space-y-6">
                                                <div>
                                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                                        {t('siteDetails.aboutThisSite')}
                                                    </h3>
                                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                                        {siteDescription}
                                                    </p>
                                                </div>

                                                {siteSignificance && (
                                                    <div>
                                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                                            {t('siteDetails.historicalSignificance')}
                                                        </h3>
                                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                                            {siteSignificance}
                                                        </p>
                                                    </div>
                                                )}

                                                {site.contactInfo && (
                                                    <div>
                                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                                            {t('siteDetails.contactInformation')}
                                                        </h3>
                                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                                            {site.contactInfo}
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                                                            {t('siteDetails.visitingHours')}
                                                        </h4>
                                                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                                                            <Clock size={16} className="mr-2" />
                                                            <span className="font-medium">
                                                                {getVisitingHoursStatus()}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                            09:00 - 17:00, {t('siteDetails.mondayToFriday')} - {t('siteDetails.sunday')}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                                                            Contact
                                                        </h4>
                                                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                                                            <Phone size={16} className="mr-2" />
                                                            {site.contactInfo || t('siteDetails.notAvailable')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'gallery' && (
                                        <motion.div
                                            key="gallery"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="space-y-4">
                                                {images.length > 0 && images[0].url !== '/heritage_placeholder.jpg' ? (
                                                    <>
                                                        {/* Media Stats */}
                                                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                                                            <span>{images.length} {images.length === 1 ? t('siteDetails.mediaFiles') : t('siteDetails.mediaFilesPlural')}</span>
                                                            <span>{t('siteDetails.clickToViewFullSize')}</span>
                                                        </div>

                                                        {/* Media Grid */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {images.map((image, index) => (
                                                                <div
                                                                    key={image.id || index}
                                                                    className="relative group cursor-pointer overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
                                                                    onClick={() => openImageModal(index)}
                                                                >
                                                                    <LazyImage
                                                                        src={image.url}
                                                                        alt={image.caption || `${siteName} image ${index + 1}`}
                                                                        className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
                                                                    />

                                                                    {/* Hover Overlay */}
                                                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                                                                        <Camera className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                                                                    </div>

                                                                    {/* Media Info Badge */}
                                                                    <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                                                        {image.fileType?.startsWith('image/') ? 'IMG' : 'DOC'}
                                                                    </div>

                                                                    {/* Hero Image Badge */}
                                                                    {(image.category === 'hero' || image.category === 'primary') && (
                                                                        <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded font-medium">
                                                                            {image.category === 'hero' ? '⭐ HERO' : '🎯 PRIMARY'}
                                                                        </div>
                                                                    )}

                                                                    {/* Caption on Hover */}
                                                                    {image.caption && (
                                                                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                                                            {image.caption}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Media Details */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                            {images.some(img => img.photographer) && (
                                                                <div>
                                                                    <span className="font-medium">{t('siteDetails.photographer')}:</span>
                                                                    <span className="ml-2">{images.find(img => img.photographer)?.photographer}</span>
                                                                </div>
                                                            )}
                                                            {images.some(img => img.dateTaken) && (
                                                                <div>
                                                                    <span className="font-medium">{t('siteDetails.dateTaken')}:</span>
                                                                    <span className="ml-2">{images.find(img => img.dateTaken)?.dateTaken}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                                        <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                                        <p>{t('siteDetails.noPhotosAvailable')}</p>
                                                        <p className="text-sm mt-2">{t('siteDetails.mediaFilesWillAppearHere')}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                    {activeTab === 'artifacts' && (
                                        <motion.div
                                            key="artifacts"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="space-y-6">
                                                {/* Artifacts Overview */}
                                                <div>
                                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                                        {t('siteDetails.artifactsCollection')}
                                                    </h3>
                                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                                        {t('siteDetails.artifactsDescription')}
                                                    </p>
                                                </div>

                                                {/* Loading State */}
                                                {artifactsLoading && (
                                                    <div className="text-center py-12">
                                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                                        <p className="text-gray-600 dark:text-gray-400">Loading artifacts...</p>
                                                    </div>
                                                )}

                                                {/* Error State */}
                                                {artifactsError && (
                                                    <div className="text-center py-8">
                                                        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                                                        <p className="text-red-600 dark:text-red-400 mb-4">Failed to load artifacts</p>
                                                        <Button
                                                            onClick={() => refetchArtifacts()}
                                                            variant="outline"
                                                            className="px-4 py-2"
                                                        >
                                                            Try Again
                                                        </Button>
                                                    </div>
                                                )}

                                                {/* Artifacts Content */}
                                                {!artifactsLoading && !artifactsError && (
                                                    <>


                                                        {/* Artifacts Grid */}
                                                        {artifacts.length > 0 ? (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                                {artifacts.map((artifact, index) => {
                                                                    const authStatus = getAuthStatusInfo(artifact.authenticationStatus);
                                                                    const StatusIcon = authStatus.icon;
                                                                    const artifactName = getArtifactName(artifact);
                                                                    const artifactDesc = getArtifactDescription(artifact);
                                                                    const primaryImage = getArtifactPrimaryImage(artifact);
                                                                    console.log('🔍 Artifact:', artifact);
                                                                    console.log('🔍 Artifact media:', artifact.media);
                                                                    console.log('🔍 Primary image URL:', primaryImage);
                                                                    console.log('🔍 Media item details:', artifact.media?.[0]);

                                                                    return (
                                                                        <motion.div
                                                                            key={artifact.id || index}
                                                                            initial={{ opacity: 0, y: 20 }}
                                                                            animate={{ opacity: 1, y: 0 }}
                                                                            transition={{ delay: index * 0.1 }}
                                                                            className="group"
                                                                        >
                                                                            <Card
                                                                                className="border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                                                                                onClick={() => handleArtifactClick(artifact)}
                                                                            >
                                                                                {/* Artifact Image */}
                                                                                <div className="relative h-48 overflow-hidden rounded-t-lg">
                                                                                    <LazyImage
                                                                                        src={primaryImage}
                                                                                        alt={artifactName}
                                                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                                                    />

                                                                                    {/* Authentication Status Badge */}
                                                                                    <div className="absolute top-3 right-3">
                                                                                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${authStatus.bgColor} ${authStatus.color} border ${authStatus.borderColor}`}>
                                                                                            <StatusIcon size={12} />
                                                                                            {authStatus.label}
                                                                                        </div>
                                                                                    </div>

                                                                                    {/* Hover Overlay */}
                                                                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                                                                                        <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                                                                                    </div>
                                                                                </div>

                                                                                <CardContent className="p-4">
                                                                                    {/* Artifact Name */}
                                                                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                                                        {artifactName}
                                                                                    </h4>

                                                                                    {/* Artifact Description */}
                                                                                    {artifactDesc && (
                                                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                                                                                            {artifactDesc}
                                                                                        </p>
                                                                                    )}

                                                                                    {/* Artifact Metadata */}
                                                                                    <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                                                                                        {artifact.category && (
                                                                                            <div className="flex items-center gap-1">
                                                                                                <Shield size={12} />
                                                                                                <span>Category: {artifact.category}</span>
                                                                                            </div>
                                                                                        )}
                                                                                        {artifact.material && (
                                                                                            <div className="flex items-center gap-1">
                                                                                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                                                                                <span>Material: {artifact.material}</span>
                                                                                            </div>
                                                                                        )}
                                                                                        {artifact.estimatedAge && (
                                                                                            <div className="flex items-center gap-1">
                                                                                                <ClockIcon size={12} />
                                                                                                <span>Age: {artifact.estimatedAge}</span>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </CardContent>
                                                                            </Card>
                                                                        </motion.div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-12">
                                                                <Shield className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                                                <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">No artifacts found</p>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                    This heritage site doesn't have any artifacts yet.
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* View All Artifacts Button */}
                                                        {artifacts.length > 0 && (
                                                            <div className="text-center pt-4">
                                                                <Button
                                                                    onClick={() => navigate(`/dashboard/artifacts?site=${id}`)}
                                                                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                                                >
                                                                    <Shield className="w-4 h-4 mr-2" />
                                                                    {t('siteDetails.viewAllArtifacts')}
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'visiting' && (
                                        <motion.div
                                            key="visiting"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="space-y-6">
                                                {/* Current Status */}
                                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 text-lg">
                                                        {t('siteDetails.currentStatus')}
                                                    </h4>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <span className="text-2xl">{getVisitingHoursDetails().icon}</span>
                                                            <div>
                                                                <p className={`text-lg font-semibold ${getVisitingHoursDetails().color}`}>
                                                                    {getVisitingHoursDetails().status}
                                                                </p>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {new Date().toLocaleString('en-US', {
                                                                        weekday: 'long',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                        timeZoneName: 'short'
                                                                    })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className={`px-4 py-2 rounded-full ${getVisitingHoursDetails().bgColor} ${getVisitingHoursDetails().color} font-medium`}>
                                                            {getVisitingHoursDetails().status}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Regular Hours */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                                                            {t('siteDetails.regularHours')}
                                                        </h4>
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                                                                <span className="font-medium">{t('siteDetails.mondayToFriday')}</span>
                                                                <span className="text-gray-600 dark:text-gray-400">09:00 - 17:00</span>
                                                            </div>
                                                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                                                                <span className="font-medium">{t('siteDetails.saturday')}</span>
                                                                <span className="text-gray-600 dark:text-gray-400">09:00 - 17:00</span>
                                                            </div>
                                                            <div className="flex justify-between items-center py-2">
                                                                <span className="font-medium">{t('siteDetails.sunday')}</span>
                                                                <span className="text-gray-600 dark:text-gray-400">09:00 - 17:00</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                                                            {t('siteDetails.admissionFee')}
                                                        </h4>
                                                        <div className="text-gray-600 dark:text-gray-400">
                                                            {displaySite.admissionFee || t('siteDetails.free')}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Facilities */}
                                                {displaySite.facilities && (
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                                                            {t('siteDetails.facilitiesAndServices')}
                                                        </h4>
                                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                            {displaySite.facilities.map((facility, index) => (
                                                                <div key={index} className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                                                    {facility}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}


                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6 w-full xl:w-auto">


                        {/* Site Information */}
                        <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {t('siteDetails.siteInformation')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Category */}
                                <div>
                                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 text-sm">
                                        {t('siteDetails.category')}:
                                    </h4>
                                    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getCategoryColor(displaySite.category)}`}>
                                        {displaySite.category || t('siteDetails.notSpecified')}
                                    </span>
                                </div>

                                {/* Region */}
                                <div>
                                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 text-sm">
                                        {t('siteDetails.region')}:
                                    </h4>
                                    <p className="text-gray-600 dark:text-gray-400 text-base">
                                        {site.region || t('siteDetails.notSpecified')}
                                    </p>
                                </div>

                                {/* Coordinates */}
                                {site.gpsLatitude && site.gpsLongitude && (
                                    <div>
                                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 text-sm">
                                            {t('siteDetails.coordinates')}:
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-base font-mono mb-3">
                                            {site.gpsLatitude}, {site.gpsLongitude}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={copyCoordinates}
                                                className="text-xs px-3 py-1.5 h-8 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                {t('siteDetails.copy')}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={openMapModal}
                                                className="text-xs px-3 py-1.5 h-8 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                {t('siteDetails.viewMap')}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Address */}
                                {site.address && (
                                    <div>
                                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 text-sm">
                                            {t('siteDetails.address')}:
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                                            {site.address}
                                        </p>
                                    </div>
                                )}

                                {/* Contact Info */}
                                {site.contactInfo && (
                                    <div>
                                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 text-sm">
                                            {t('siteDetails.contactInfo')}:
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-base">
                                            {site.contactInfo}
                                        </p>
                                    </div>
                                )}

                                {/* Established */}
                                {site.establishmentYear && (
                                    <div>
                                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 text-sm">
                                            {t('siteDetails.established')}:
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-base">
                                            {site.establishmentYear}
                                        </p>
                                    </div>
                                )}

                                {/* Ownership */}
                                {site.ownershipType && (
                                    <div>
                                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 text-sm">
                                            {t('siteDetails.ownership')}:
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-base">
                                            {site.ownershipType}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Visiting Hours */}
                        <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {t('siteDetails.visitingHours')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Current Status */}
                                <div className="text-center">
                                    <div className={`inline-flex items-center px-3 py-2 rounded-full ${getVisitingHoursDetails().bgColor} ${getVisitingHoursDetails().color} font-medium text-sm`}>
                                        <span className="mr-2">{getVisitingHoursDetails().icon}</span>
                                        {getVisitingHoursDetails().status}
                                    </div>
                                </div>

                                {/* Hours */}
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-700">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">{t('siteDetails.monToFri')}</span>
                                        <span className="text-gray-600 dark:text-gray-400">09:00-17:00</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-700">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">{t('siteDetails.saturday')}</span>
                                        <span className="text-gray-600 dark:text-gray-400">09:00-17:00</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">{t('siteDetails.sunday')}</span>
                                        <span className="text-gray-600 dark:text-gray-400">09:00-17:00</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Toast Notifications */}
            {toast.message && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${toast.type === 'info' ? 'bg-blue-500 text-white' :
                    toast.type === 'success' ? 'bg-green-500 text-white' :
                        toast.type === 'error' ? 'bg-red-500 text-white' :
                            'bg-gray-500 text-white'
                    }`}>
                    <div className="flex items-center space-x-2">
                        <span>{toast.message}</span>
                        <button
                            onClick={() => setToast({ type: '', message: '' })}
                            className="ml-2 text-white hover:text-gray-200"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Image Gallery Modal */}
            <Modal
                isOpen={showImageModal}
                onClose={() => setShowImageModal(false)}
                size="xl"
                className="p-0"
            >
                <div className="relative">
                    {/* Close Button */}
                    <button
                        onClick={() => setShowImageModal(false)}
                        className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                    >
                        <X size={20} />
                    </button>

                    {/* Navigation Buttons */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </>
                    )}

                    {/* Image */}
                    <div className="w-full h-[70vh] bg-black flex items-center justify-center">
                        <LazyImage
                            src={images[selectedImageIndex]?.url}
                            alt={images[selectedImageIndex]?.caption || `${siteName} image`}
                            className="max-w-full max-h-full object-contain"
                        />
                    </div>

                    {/* Image Caption */}
                    {images[selectedImageIndex]?.caption && (
                        <div className="p-4 bg-white">
                            <p className="text-center text-gray-700">
                                {images[selectedImageIndex].caption}
                            </p>
                        </div>
                    )}

                    {/* Image Counter */}
                    {images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                            {selectedImageIndex + 1} / {images.length}
                        </div>
                    )}
                </div>
            </Modal>

            {/* Artifact Detail Modal */}
            <Modal
                isOpen={showArtifactModal}
                onClose={() => setShowArtifactModal(false)}
                size="xl"
                className="p-0"
            >
                {selectedArtifact && (
                    <div className="relative">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowArtifactModal(false)}
                            className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                        >
                            <X size={20} />
                        </button>

                        {/* Artifact Content */}
                        <div className="w-full bg-white dark:bg-gray-800">
                            {/* Hero Image */}
                            <div className="relative h-96 bg-gray-100 dark:bg-gray-700">
                                <LazyImage
                                    src={getArtifactPrimaryImage(selectedArtifact)}
                                    alt={getArtifactName(selectedArtifact)}
                                    className="w-full h-full object-cover"
                                />

                                {/* Authentication Status Badge */}
                                <div className="absolute top-4 left-4">
                                    {(() => {
                                        const authStatus = getAuthStatusInfo(selectedArtifact.authenticationStatus);
                                        const StatusIcon = authStatus.icon;
                                        return (
                                            <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${authStatus.bgColor} ${authStatus.color} border ${authStatus.borderColor}`}>
                                                <StatusIcon size={16} />
                                                {authStatus.label}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* Artifact Details */}
                            <div className="p-8">
                                <div className="max-w-4xl mx-auto">
                                    {/* Title and Basic Info */}
                                    <div className="mb-8">
                                        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                            {getArtifactName(selectedArtifact)}
                                        </h2>
                                        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                                            {getArtifactDescription(selectedArtifact)}
                                        </p>
                                    </div>

                                    {/* Artifact Information Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Artifact Details</h3>
                                            <div className="space-y-3">
                                                {selectedArtifact.category && (
                                                    <div className="flex items-center gap-3">
                                                        <Shield className="w-5 h-5 text-gray-400" />
                                                        <div>
                                                            <span className="text-sm text-gray-500 dark:text-gray-400">Category</span>
                                                            <p className="text-gray-900 dark:text-gray-100">{selectedArtifact.category}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {selectedArtifact.material && (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-5 h-5 bg-gray-400 rounded-full"></div>
                                                        <div>
                                                            <span className="text-sm text-gray-500 dark:text-gray-400">Material</span>
                                                            <p className="text-gray-900 dark:text-gray-100">{selectedArtifact.material}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {selectedArtifact.estimatedAge && (
                                                    <div className="flex items-center gap-3">
                                                        <ClockIcon className="w-5 h-5 text-gray-400" />
                                                        <div>
                                                            <span className="text-sm text-gray-500 dark:text-gray-400">Estimated Age</span>
                                                            <p className="text-gray-900 dark:text-gray-100">{selectedArtifact.estimatedAge}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Authentication & Provenance</h3>
                                            <div className="space-y-6">
                                                {/* Authentication Status */}
                                                <div className="flex items-center gap-3">
                                                    {(() => {
                                                        const authStatus = getAuthStatusInfo(selectedArtifact.authenticationStatus);
                                                        const StatusIcon = authStatus.icon;
                                                        return (
                                                            <>
                                                                <StatusIcon className={`w-5 h-5 ${authStatus.color}`} />
                                                                <div>
                                                                    <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                                                                    <p className={`${authStatus.color} font-medium`}>{authStatus.label}</p>
                                                                </div>
                                                            </>
                                                        );
                                                    })()}
                                                </div>

                                                {/* Authentication Details */}
                                                {selectedArtifact.authentications && selectedArtifact.authentications.length > 0 && (
                                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Authentication Process</h4>
                                                        {selectedArtifact.authentications.map((auth, index) => (
                                                            <div key={index} className="space-y-2 text-sm">
                                                                {auth.date && (
                                                                    <div className="flex items-center gap-2">
                                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                                        <span className="text-gray-600 dark:text-gray-400">Date: {new Date(auth.date).toLocaleDateString()}</span>
                                                                    </div>
                                                                )}
                                                                {auth.documentation && (
                                                                    <div className="text-gray-700 dark:text-gray-300">
                                                                        <span className="font-medium">Documentation:</span> {auth.documentation}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Provenance Details */}
                                                {selectedArtifact.provenanceRecords && selectedArtifact.provenanceRecords.length > 0 && (
                                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Provenance History</h4>
                                                        {selectedArtifact.provenanceRecords.map((provenance, index) => (
                                                            <div key={index} className="space-y-2 text-sm">
                                                                {provenance.acquisitionDate && (
                                                                    <div className="flex items-center gap-2">
                                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                                        <span className="text-gray-600 dark:text-gray-400">Acquired: {new Date(provenance.acquisitionDate).toLocaleDateString()}</span>
                                                                    </div>
                                                                )}
                                                                {provenance.acquisitionMethod && (
                                                                    <div className="text-gray-700 dark:text-gray-300">
                                                                        <span className="font-medium">Method:</span> {provenance.acquisitionMethod}
                                                                    </div>
                                                                )}
                                                                {provenance.previousOwner && (
                                                                    <div className="text-gray-700 dark:text-gray-300">
                                                                        <span className="font-medium">Previous Owner:</span> {provenance.previousOwner}
                                                                    </div>
                                                                )}
                                                                {provenance.provenanceNotes && (
                                                                    <div className="text-gray-700 dark:text-gray-300">
                                                                        <span className="font-medium">Notes:</span> {provenance.provenanceNotes}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Media Gallery */}
                                    {selectedArtifact.media && selectedArtifact.media.length > 1 && (
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Additional Images</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {selectedArtifact.media.slice(1).map((media, index) => (
                                                    <div key={index} className="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                                        <LazyImage
                                                            src={(() => {
                                                                if (media.filePath) {
                                                                    if (media.filePath.startsWith('http')) {
                                                                        return media.filePath;
                                                                    }
                                                                    if (media.id) {
                                                                        return `/api/media/download/${media.id}`;
                                                                    }
                                                                    if (media.filePath.startsWith('/')) {
                                                                        return media.filePath;
                                                                    }
                                                                }
                                                                return '/heritage_placeholder.jpg';
                                                            })()}
                                                            alt={`${getArtifactName(selectedArtifact)} image ${index + 2}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Map Modal */}
            <Modal
                isOpen={showMapModal}
                onClose={() => setShowMapModal(false)}
                size="xl"
                className="p-0"
            >
                <div className="relative">
                    {/* Close Button */}
                    <button
                        onClick={() => setShowMapModal(false)}
                        className="absolute top-4 right-4 z-10 bg-white bg-opacity-90 text-gray-800 p-2 rounded-full hover:bg-opacity-100 transition-all shadow-lg"
                    >
                        <X size={20} />
                    </button>

                    {/* Map Container */}
                    <div className="w-full h-[80vh] bg-gray-100">
                        {site.gpsLatitude && site.gpsLongitude ? (
                            <div className="w-full h-full flex flex-col items-center justify-center p-8">
                                <div className="text-center mb-6">
                                    <Map size={64} className="mx-auto mb-4 text-blue-600" />
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{siteName}</h3>
                                    <p className="text-gray-600 mb-4">{site.region} - {site.address}</p>
                                    <div className="bg-gray-50 p-4 rounded-lg border">
                                        <p className="text-sm text-gray-500 mb-2">GPS Coordinates:</p>
                                        <p className="text-lg font-mono text-gray-900 bg-white p-3 rounded border">
                                            {site.gpsLatitude}, {site.gpsLongitude}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={copyCoordinates}
                                    >
                                        <MapPin size={16} className="mr-2" />
                                        Copy Coordinates
                                    </Button>
                                    <Button
                                        variant="default"
                                        className="w-full"
                                        onClick={openGoogleMaps}
                                    >
                                        <Globe size={16} className="mr-2" />
                                        Open in Google Maps
                                    </Button>
                                </div>

                                <div className="mt-6 text-center">
                                    <p className="text-sm text-gray-500 mb-2">For interactive map view:</p>
                                    <p className="text-xs text-gray-400">
                                        Install Leaflet: <code className="bg-gray-100 px-2 py-1 rounded">npm install leaflet react-leaflet</code>
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center text-gray-500">
                                    <Map size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>No coordinates available for this site</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Map Info */}
                    <div className="p-4 bg-white border-t">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900">{siteName}</h3>
                                <p className="text-sm text-gray-600">{site.region} - {site.address}</p>
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={copyCoordinates}
                                >
                                    Copy Coordinates
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={openGoogleMaps}
                                >
                                    Open in Google Maps
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
export default HeritageSiteDetails;
