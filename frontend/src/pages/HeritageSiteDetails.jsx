import React, { useState } from 'react';
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
    Users
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { useGet } from '../hooks/useSimpleApi';
import { useLanguage } from '../contexts/LanguageContext';
import museum from '../assets/Ethnographic-Museum.jpg';
import kandt from '../assets/richardkandt.jpg';

const HeritageSiteDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('overview');
    const [isFavorite, setIsFavorite] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);

    // Validate ID parameter - redirect if invalid
    React.useEffect(() => {
        if (id && (id.startsWith('mock-') || isNaN(Number(id)))) {
            console.warn('Invalid heritage site ID detected:', id);
            navigate('/');
            return;
        }
    }, [id, navigate]);

    // Fetch heritage site details
    const {
        data: site,
        loading,
        error
    } = useGet(`/api/heritage-sites/${id}`, {}, {
        enabled: !!id && !id.startsWith('mock-') && !isNaN(Number(id)),
        onSuccess: (data) => {
            console.log('✅ Site details loaded:', data);
            console.log('📊 Site ID:', id);
            console.log('📊 Site data type:', typeof data);
            console.log('📊 Data length:', Array.isArray(data) ? data.length : 'Not an array');
            console.log('📊 Data keys:', data ? Object.keys(data) : 'No data');
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

    // Process site data
    const processedSite = site ? {
        id: site.id || site._id || site.siteId,
        name: site.name || site.title || site.siteName,
        description: site.description || site.summary || site.content,
        category: site.category || site.type || site.siteCategory,
        location: site.location || site.address || site.region,
        establishedDate: site.establishedDate || site.foundedDate || site.creationDate,
        rating: site.rating || site.score || site.visitorRating,
        imageUrl: site.imageUrl || site.primaryImage || site.thumbnail,
        images: site.images || site.gallery || site.photoGallery,
        coordinates: site.coordinates || site.geoLocation,
        contactInfo: site.contactInfo || site.contact,
        historicalSignificance: site.historicalSignificance || site.significance,
        visitingHours: site.visitingHours || site.hours,
        admissionFee: site.admissionFee || site.fee,
        facilities: site.facilities || site.amenities,
        website: site.website || site.url,
        phone: site.phone || site.telephone,
        email: site.email || site.contactEmail
    } : null;

    // No mock data - only use real API data

    // Define functions first
    const handleBackClick = () => navigate(-1);
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: displaySite?.name || 'Heritage Site',
                text: displaySite?.description || 'Discover this amazing heritage site',
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
                        Site Not Found
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        The heritage site you're looking for could not be found or is not available.
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
                            Go Back
                        </Button>
                        <Button onClick={() => navigate('/')}>
                            Go Home
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const getSiteImage = (site, index = 0) => {
        if (site.imageUrl) return site.imageUrl;
        if (site.images && site.images.length > 0) {
            return site.images[index]?.url || site.images[index];
        }
        return index % 2 === 0 ? museum : kandt;
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
        if (!dateString) return 'Unknown';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return 'Unknown';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading site details...</p>
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
                        Unable to Load Site Details
                    </h2>
                    <div className="flex gap-4 justify-center">
                        <Button onClick={handleBackClick} variant="outline">
                            <ArrowLeft className="mr-2" size={16} />
                            Go Back
                        </Button>
                        <Button onClick={() => window.location.reload()}>
                            Try Again
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
                            Back to Sites
                        </Button>
                        <div className="flex items-center gap-3">
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
                                className={`${isFavorite ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'}`}
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="mb-8">
                    <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
                        <img
                            src={getSiteImage(displaySite)}
                            alt={displaySite.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-8">
                            <div className="flex items-center gap-3 mb-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(displaySite.category)}`}>
                                    {displaySite.category}
                                </span>
                                <div className="flex items-center text-white">
                                    <Star size={16} className="text-yellow-400 fill-current mr-1" />
                                    <span className="text-sm font-medium">{displaySite.rating}</span>
                                </div>
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
                                {displaySite.name}
                            </h1>
                            <div className="flex items-center text-white/90 text-sm">
                                <MapPin size={16} className="mr-2" />
                                {displaySite.location}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2">
                        {/* Tabs */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                            <div className="border-b border-gray-200 dark:border-gray-700">
                                <nav className="flex space-x-8 px-6">
                                    {[
                                        { id: 'overview', label: 'Overview', icon: Info },
                                        { id: 'gallery', label: 'Gallery', icon: Camera },
                                        { id: 'visiting', label: 'Visiting Info', icon: Navigation },
                                        { id: 'contact', label: 'Contact', icon: ExternalLink }
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
                                                        About This Site
                                                    </h3>
                                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                                        {displaySite.description}
                                                    </p>
                                                </div>

                                                {displaySite.historicalSignificance && (
                                                    <div>
                                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                                            Historical Significance
                                                        </h3>
                                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                                            {displaySite.historicalSignificance}
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                                                            Established
                                                        </h4>
                                                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                                                            <Calendar size={16} className="mr-2" />
                                                            {formatDate(displaySite.establishedDate)}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                                                            Category
                                                        </h4>
                                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(displaySite.category)}`}>
                                                            {displaySite.category}
                                                        </span>
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
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {displaySite.images && displaySite.images.length > 0 ? (
                                                    displaySite.images.map((image, index) => (
                                                        <div key={index} className="aspect-square rounded-lg overflow-hidden">
                                                            <img
                                                                src={getSiteImage(displaySite, index)}
                                                                alt={`${displaySite.name} - Image ${index + 1}`}
                                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                            />
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                                                        <Camera size={48} className="mx-auto mb-4 opacity-50" />
                                                        <p>No images available for this site</p>
                                                    </div>
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
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                                                            Visiting Hours
                                                        </h4>
                                                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                                                            <Clock size={16} className="mr-2" />
                                                            {displaySite.visitingHours || 'Not specified'}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                                                            Admission Fee
                                                        </h4>
                                                        <div className="text-gray-600 dark:text-gray-400">
                                                            {displaySite.admissionFee || 'Not specified'}
                                                        </div>
                                                    </div>
                                                </div>

                                                {displaySite.facilities && (
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                                                            Facilities & Services
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

                                    {activeTab === 'contact' && (
                                        <motion.div
                                            key="contact"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                                                            Contact Information
                                                        </h4>
                                                        <div className="space-y-3">
                                                            {displaySite.phone && (
                                                                <div className="flex items-center text-gray-600 dark:text-gray-400">
                                                                    <Phone size={16} className="mr-2" />
                                                                    {displaySite.phone}
                                                                </div>
                                                            )}
                                                            {displaySite.email && (
                                                                <div className="flex items-center text-gray-600 dark:text-gray-400">
                                                                    <Mail size={16} className="mr-2" />
                                                                    {displaySite.email}
                                                                </div>
                                                            )}
                                                            {displaySite.website && (
                                                                <div className="flex items-center text-gray-600 dark:text-gray-400">
                                                                    <Globe size={16} className="mr-2" />
                                                                    <a
                                                                        href={displaySite.website}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-blue-600 hover:text-blue-800 underline"
                                                                    >
                                                                        Visit Website
                                                                        <ExternalLink size={14} className="ml-1 inline" />
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                                                            Location
                                                        </h4>
                                                        <div className="text-gray-600 dark:text-gray-400">
                                                            <div className="flex items-start mb-2">
                                                                <MapPin size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                                                                <span>{displaySite.location}</span>
                                                            </div>
                                                            {displaySite.coordinates && (
                                                                <div className="text-sm text-gray-500 dark:text-gray-500">
                                                                    Coordinates: {displaySite.coordinates.lat}, {displaySite.coordinates.lng}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <Card className="border border-gray-200 dark:border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-lg">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button className="w-full" variant="default">
                                    <Navigation size={16} className="mr-2" />
                                    Get Directions
                                </Button>
                                <Button className="w-full" variant="outline">
                                    <Calendar size={16} className="mr-2" />
                                    Plan Visit
                                </Button>
                                <Button className="w-full" variant="outline">
                                    <Users size={16} className="mr-2" />
                                    Book Tour
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Site Information */}
                        <Card className="border border-gray-200 dark:border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-lg">Site Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                                        Category
                                    </h4>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(displaySite.category)}`}>
                                        {displaySite.category}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                                        Established
                                    </h4>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        {formatDate(displaySite.establishedDate)}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                                        Rating
                                    </h4>
                                    <div className="flex items-center">
                                        <Star size={16} className="text-yellow-400 fill-current mr-1" />
                                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                                            {displaySite.rating} / 5.0
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Visiting Hours */}
                        <Card className="border border-gray-200 dark:border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-lg">Visiting Hours</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center text-gray-600 dark:text-gray-400">
                                    <Clock size={16} className="mr-2" />
                                    <span className="text-sm">
                                        {displaySite.visitingHours || 'Not specified'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeritageSiteDetails;