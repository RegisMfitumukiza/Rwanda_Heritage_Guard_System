import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Camera,
  FileText,
  Users,
  Shield,
  ChevronLeft,
  ChevronRight,
  X,
  Edit
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { LazyImage } from '../components/ui/LazyImage';
import { useGet } from '../hooks/useSimpleApi';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const SiteDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const { user } = useAuth();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [toast, setToast] = useState({ type: '', message: '' });

  // Fetch single heritage site details using new simplified API system
  const {
    data: site,
    loading,
    error,
    refetch,
    refetchWithParams
  } = useGet(`/api/heritage-sites/${id}`, {
    language: currentLanguage
  }, {
    enabled: !!id,
    onSuccess: (data) => {
      console.log('Site details loaded:', data);
      console.log('Current language:', currentLanguage);
      console.log('Site name in different languages:', {
        nameEn: data?.nameEn,
        nameRw: data?.nameRw,
        nameFr: data?.nameFr
      });
    },
    onError: (error) => console.error('Failed to load site details:', error)
  });

  // Get the appropriate name and description based on current language
  const getLocalizedField = (fieldName) => {
    const lang = currentLanguage || 'en';
    return site?.[`${fieldName}${lang === 'en' ? 'En' : lang === 'rw' ? 'Rw' : 'Fr'}`] || site?.[`${fieldName}En`] || 'Not available';
  };

  const siteName = getLocalizedField('name');
  const siteDescription = getLocalizedField('description');
  const siteSignificance = getLocalizedField('significance');

  // Handle media/images - check if site has media
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

  // Enhanced hero image selection with priority system
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
    return { url: '/heritage_placeholder.jpg', caption: 'No image available' };
  };

  const heroImage = getHeroImage(images);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-300 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600 mb-4">Heritage site not found</p>
              <Button onClick={() => navigate('/dashboard/sites')} variant="outline">
                Back to Sites
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Header */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src="/heritage_logo.png"
                alt="HeritageGuard Logo"
                className="h-10 w-10"
                loading="eager"
              />
              <span className="text-xl font-bold text-primary-600">HeritageGuard</span>
            </Link>
            <div className="flex items-center space-x-4">
              {/* Language Switcher */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Language:</span>
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
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <Link to="/dashboard/sites">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('siteDetails.backToSites')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <LazyImage
          src={heroImage.url}
          alt={siteName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-2 text-heritage-title">
              {siteName}
            </h1>
            <div className="flex items-center text-white space-x-6">
              <div className="flex items-center">
                <MapPin size={20} className="mr-2" />
                {site.region} - {site.address}
              </div>
              <div className="flex items-center">
                <Calendar size={20} className="mr-2" />
                {site.establishmentYear || t('siteDetails.ancient')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>{t('siteDetails.aboutThisSite')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-responsive">
                  {siteDescription}
                </p>

                {siteSignificance && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-lg mb-3 text-heritage-title">
                      {t('siteDetails.historicalSignificance')}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {siteSignificance}
                    </p>
                  </div>
                )}

                {site.contactInfo && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-lg mb-3 text-heritage-title">
                      {t('siteDetails.contactInformation')}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {site.contactInfo}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Photo Gallery */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Camera className="mr-2" size={20} />
                    {t('siteDetails.photoGallery')}
                  </CardTitle>

                  {/* Upload Button for Heritage Managers Only */}
                  {user?.role === 'HERITAGE_MANAGER' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // TODO: Implement media upload modal
                        setToast({ type: 'info', message: 'Media upload feature coming soon!' });
                      }}
                      className="flex items-center space-x-2"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{t('siteDetails.addMedia')}</span>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {images.length > 0 && images[0].url !== '/heritage_placeholder.jpg' ? (
                  <div className="space-y-4">
                    {/* Media Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>{images.length} {images.length === 1 ? t('siteDetails.mediaFiles') : t('siteDetails.mediaFilesPlural')}</span>
                      <span>{t('siteDetails.clickToViewFullSize')}</span>
                    </div>

                    {/* Media Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>{t('siteDetails.noPhotosAvailable')}</p>
                    <p className="text-sm mt-2">{t('siteDetails.mediaFilesWillAppearHere')}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Site Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2" size={20} />
                    {t('siteDetails.siteStatus')}
                  </CardTitle>

                  {/* Admin Actions */}
                  {(user?.role === 'SYSTEM_ADMINISTRATOR' || user?.role === 'HERITAGE_MANAGER') && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigate(`/dashboard/sites/${id}/edit`);
                        }}
                        className="flex items-center space-x-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span>{t('siteDetails.editSite')}</span>
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{t('siteDetails.currentStatus')}:</span>
                    <span className={`ml-2 px-3 py-1 rounded-full text-sm ${site.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : site.status === 'under-conservation'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                      {t(`siteDetails.${site.status?.toLowerCase()}`)}
                    </span>
                  </div>

                  {site.ownershipType && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{t('siteDetails.ownership')}:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        {t(`siteDetails.${site.ownershipType.toLowerCase()}`)}
                      </span>
                    </div>
                  )}

                  {site.createdDate && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{t('siteDetails.addedToSystem')}:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        {new Date(site.createdDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>{t('siteDetails.siteInformation')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{t('siteDetails.category')}:</span>
                  <p className="text-gray-600 dark:text-gray-400">
                    {site.category ? t(`siteDetails.${site.category.toLowerCase()}`) || site.category : 'Not specified'}
                  </p>
                </div>

                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{t('siteDetails.region')}:</span>
                  <p className="text-gray-600 dark:text-gray-400">
                    {site.region ? t(`siteDetails.${site.region.toLowerCase()}`) || site.region : 'Not specified'}
                  </p>
                </div>

                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{t('siteDetails.coordinates')}:</span>
                  {site.gpsLatitude && site.gpsLongitude ? (
                    <div className="space-y-2">
                      <p className="text-gray-600 dark:text-gray-400 font-mono text-sm">
                        {site.gpsLatitude}, {site.gpsLongitude}
                      </p>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(`${site.gpsLatitude}, ${site.gpsLongitude}`);
                            setToast({ type: 'success', message: 'Coordinates copied to clipboard!' });
                          }}
                          className="text-xs px-2 py-1"
                        >
                          {t('siteDetails.copy')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const url = `https://www.google.com/maps?q=${site.gpsLatitude},${site.gpsLongitude}`;
                            window.open(url, '_blank');
                          }}
                          className="text-xs px-2 py-1"
                        >
                          View Map
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">Not available</p>
                  )}
                </div>

                {site.address && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{t('siteDetails.address')}:</span>
                    <p className="text-gray-600 dark:text-gray-400">{site.address}</p>
                  </div>
                )}

                {site.contactInfo && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{t('siteDetails.contactInfo')}:</span>
                    <p className="text-gray-600 dark:text-gray-400">{site.contactInfo}</p>
                  </div>
                )}
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
              alt={images[selectedImageIndex]?.caption || `${site.name} image`}
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
    </div>
  );
};

export default SiteDetails;