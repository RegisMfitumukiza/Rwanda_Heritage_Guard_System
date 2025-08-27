import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Shield, Eye, MessageSquare, FolderOpen, GitBranch, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import axios from '../config/axios';
import { Button } from '../components/ui/Button';
import Layout from '../components/layout/Layout';
import HeroSection from '../components/landing/HeroSection';
import FeaturedSitesSection from '../components/landing/FeaturedSitesSection';
import HeritageSitesSection from '../components/landing/HeritageSitesSection';
import EducationalSection from '../components/landing/EducationalSection';
import ArtifactSection from '../components/landing/ArtifactSection';
import CommunitySection from '../components/landing/CommunitySection';
import ComponentErrorBoundary from '../components/error/ComponentErrorBoundary';
import PrivacyBanner from '../components/ui/PrivacyBanner';
import { useGet } from '../hooks/useSimpleApi';
import usePerformanceMonitoring from '../hooks/usePerformanceMonitoring';

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [showHeritageSites, setShowHeritageSites] = useState(false);

  // Performance monitoring
  const {
    metrics,
    performanceScore,
    performanceGrade,
    isSupported: performanceSupported
  } = usePerformanceMonitoring({
    enabled: true,
    onMetrics: (metrics) => {
      // Log performance metrics for development
      if (process.env.NODE_ENV === 'development') {
        console.log('Performance metrics:', metrics);
      }

      // In production, you could send these to analytics
      // analytics.track('performance_metrics', metrics);
    },
    onError: (error) => {
      console.warn('Performance monitoring error:', error);
    }
  });

  // SEO and Meta Tags Management
  useEffect(() => {
    // Update document title and meta tags dynamically
    document.title = 'Rwanda Heritage Guard - Cultural Heritage Preservation & Digital Documentation';

    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content',
      'Discover, preserve, and explore Rwanda\'s rich cultural heritage through our comprehensive digital platform. Authenticated artifacts, educational content, and community engagement for heritage preservation.'
    );

    // Add Open Graph meta tags
    const ogTags = [
      { property: 'og:title', content: 'Rwanda Heritage Guard - Cultural Heritage Preservation' },
      { property: 'og:description', content: 'Discover and preserve Rwanda\'s cultural heritage through our comprehensive digital platform' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: window.location.href },
      { property: 'og:image', content: '/heritage_logo.png' },
      { property: 'og:site_name', content: 'Rwanda Heritage Guard' }
    ];

    ogTags.forEach(tag => {
      let metaTag = document.querySelector(`meta[property="${tag.property}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('property', tag.property);
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', tag.content);
    });

    // Add Twitter Card meta tags
    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Rwanda Heritage Guard - Cultural Heritage Preservation' },
      { name: 'twitter:description', content: 'Discover and preserve Rwanda\'s cultural heritage through our comprehensive digital platform' },
      { name: 'twitter:image', content: '/heritage_logo.png' }
    ];

    twitterTags.forEach(tag => {
      let metaTag = document.querySelector(`meta[name="${tag.name}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('name', tag.name);
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', tag.content);
    });

    // Add structured data for search engines
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Rwanda Heritage Guard",
      "description": "Cultural heritage preservation and digital documentation platform",
      "url": window.location.origin,
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${window.location.origin}/sites?search={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Rwanda Heritage Guard",
        "logo": {
          "@type": "ImageObject",
          "url": `${window.location.origin}/heritage_logo.png`
        }
      }
    };

    // Remove existing structured data if present
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    // Add canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.href;

    // Add language alternates for multilingual support
    const languages = ['en', 'rw', 'fr'];
    languages.forEach(lang => {
      let langLink = document.querySelector(`link[hreflang="${lang}"]`);
      if (!langLink) {
        langLink = document.createElement('link');
        langLink.rel = 'alternate';
        langLink.hreflang = lang;
        document.head.appendChild(langLink);
      }
      langLink.href = `${window.location.origin}/${lang}`;
    });

  }, []);

  // Fetch real statistics from multiple APIs with automatic caching
  const {
    data: sitesData,
    loading: sitesLoading,
    error: sitesError
  } = useGet('/api/heritage-sites/statistics', {}, {
    enabled: true
  });

  const {
    data: documentsData,
    loading: documentsLoading,
    error: documentsError
  } = useGet('/api/documents/statistics', {}, {
    enabled: true
  });

  const {
    data: membersData,
    loading: membersLoading,
    error: membersError
  } = useGet('/api/users/statistics', {}, {
    enabled: true
  });

  const {
    data: articlesData,
    loading: articlesLoading,
    error: articlesError
  } = useGet('/api/education/articles/statistics', {}, {
    enabled: true
  });

  // Process real statistics from APIs or use fallback with better error handling
  const processStatistics = () => {
    const isLoading = sitesLoading || documentsLoading || membersLoading || articlesLoading;
    const hasError = sitesError || documentsError || membersError || articlesError;

    // If loading, show 0 to prevent layout shifts
    if (isLoading) {
      return {
        totalSites: 0,
        totalDocuments: 0,
        totalMembers: 0,
        totalArticles: 0
      };
    }

    // If error, show fallback data
    if (hasError) {
      console.warn('Some statistics failed to load, using fallback data');
      return {
        totalSites: sitesData?.totalSites || 0,
        totalDocuments: documentsData?.totalDocuments || 0,
        totalMembers: membersData?.totalMembers || 0,
        totalArticles: articlesData?.totalArticles || 0
      };
    }

    // Return real data
    return {
      totalSites: sitesData?.totalSites || 0,
      totalDocuments: documentsData?.totalDocuments || 0,
      totalMembers: membersData?.totalMembers || 0,
      totalArticles: articlesData?.totalArticles || 0
    };
  };

  const statistics = processStatistics();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'rw', name: 'Kinyarwanda' },
    { code: 'fr', name: 'Français' }
  ];

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

  const handleLanguageChange = (langCode) => {
    setCurrentLanguage(langCode);
    // Additional language change logic can be added here
    toast.success(`Language changed to ${languages.find(lang => lang.code === langCode)?.name || langCode}`);
  };

  // Handle cookie consent
  const handleCookieConsent = (preferences) => {
    console.log('Cookie preferences updated:', preferences);

    // In production, you could send this to analytics
    if (preferences.analytics) {
      // Enable analytics tracking
      // analytics.enable();
    }

    if (preferences.marketing) {
      // Enable marketing cookies
      // marketing.enable();
    }

    toast.success('Cookie preferences saved successfully');
  };

  // Performance metrics display (development only)
  const PerformanceMetricsDisplay = () => {
    if (process.env.NODE_ENV !== 'development' || !performanceSupported) return null;

    return (
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-20 right-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-xs"
      >
        <div className="font-bold mb-2">Performance Metrics</div>
        {performanceScore !== null && (
          <div className="mb-2">
            Score: {performanceScore}/100 ({performanceGrade})
          </div>
        )}
        {metrics.lcp && <div>LCP: {metrics.lcp.toFixed(0)}ms</div>}
        {metrics.fid && <div>FID: {metrics.fid.toFixed(0)}ms</div>}
        {metrics.cls && <div>CLS: {metrics.cls.toFixed(3)}</div>}
        {metrics.fcp && <div>FCP: {metrics.fcp.toFixed(0)}ms</div>}
        {metrics.navigation && (
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div>DOM Ready: {metrics.navigation.domInteractive.toFixed(0)}ms</div>
            <div>Load Complete: {metrics.navigation.loadComplete.toFixed(0)}ms</div>
          </div>
        )}
      </motion.div>
    );
  };

  const handleShowHeritageSites = () => {
    setShowHeritageSites(true);
    // Smooth scroll to the heritage sites section
    setTimeout(() => {
      const element = document.getElementById('heritage-sites');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <Layout transparentNav={true}>
      <div className="min-h-screen">
        {/* Performance Metrics Display (Development Only) */}
        <PerformanceMetricsDisplay />

        <section id="hero">
          <ComponentErrorBoundary componentName="Hero Section">
            <HeroSection
              language={currentLanguage}
              showSearchBar={true}
              showStats={true}
              onJoinClick={() => navigate('/register')}
              onShowHeritageSites={handleShowHeritageSites}
              statistics={statistics}
            />
          </ComponentErrorBoundary>
        </section>

        {/* Heritage Sites Section - Shows when explore button is clicked */}
        <section id="heritage-sites">
          <ComponentErrorBoundary componentName="Heritage Sites Section">
            <HeritageSitesSection isVisible={showHeritageSites} />
          </ComponentErrorBoundary>
        </section>
{/* 
        <section id="featured-sites">
          <ComponentErrorBoundary componentName="Featured Sites Section">
            <FeaturedSitesSection />
          </ComponentErrorBoundary>
        </section> */}

        <section id="education">
          <ComponentErrorBoundary componentName="Educational Section">
            <EducationalSection
              onContentClick={(content) => {
                // Navigate to public educational content page
                navigate('/education');
              }}
            />
          </ComponentErrorBoundary>
        </section>

        <section id="artifacts">
          <ComponentErrorBoundary componentName="Artifacts Section">
            <ArtifactSection
              onCTAClick={() => navigate('/artifacts')}
            />
          </ComponentErrorBoundary>
        </section>

        <section id="community">
          <ComponentErrorBoundary componentName="Community Section">
            <CommunitySection
              showStatistics={true}
              showFeatures={true}
              showTestimonials={true}
              showCTA={true}
              onCTAClick={() => navigate('/register')}
              onTestimonialClick={(testimonial) => console.log('Testimonial clicked:', testimonial)}
              onFeatureClick={(feature) => navigate(`/community/${feature.title.toLowerCase().replace(/\s+/g, '-')}`)}
              statistics={statistics}
            />
          </ComponentErrorBoundary>
        </section>
      </div>

      {/* Privacy and Cookie Consent Banner */}
      <PrivacyBanner
        onAccept={handleCookieConsent}
        onDecline={handleCookieConsent}
        showMarketing={false}
        position="bottom"
      />
    </Layout>
  );
};

export default LandingPage;