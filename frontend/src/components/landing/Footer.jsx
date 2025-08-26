import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import logoImage from '../../assets/heritage_logo.png';

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

const Footer = ({
    className = "bg-gray-900 text-gray-300 py-12",
    logo = logoImage,
    logoAlt,
    brandName,
    description,
    showLanguageSwitcher = true,
    showContactInfo = false,
    currentLanguage,
    onLanguageChange,
    customLinks = null,
    customLegalLinks = null,
    onLinkClick
}) => {
    const { user } = useAuth();
    const { t, currentLanguage: lang, changeLanguage } = useLanguage();

    // Get current year for dynamic copyright
    const currentYear = new Date().getFullYear();

    // Use translations for default values
    const defaultLogoAlt = logoAlt || t('footer.logoAlt');
    const defaultBrandName = brandName || t('footer.brandName');
    const defaultDescription = description || t('footer.description');
    const defaultLinks = t('footer.quickLinks');
    const defaultLegalLinks = t('footer.legalLinks');
    const defaultContactInfo = t('footer.contactInfo');

    // Use custom links or default links, ensure they are arrays
    const quickLinks = customLinks || (Array.isArray(defaultLinks) ? defaultLinks : []);
    const legalLinks = customLegalLinks || (Array.isArray(defaultLegalLinks) ? defaultLegalLinks : []);

    const handleLanguageChange = (langCode) => {
        if (onLanguageChange) {
            onLanguageChange(langCode);
        } else {
            changeLanguage(langCode);
        }
    };

    const handleLinkClick = (link) => {
        if (onLinkClick) {
            onLinkClick(link);
        }
    };

    return (
        <footer className={className}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-4 gap-8"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {/* Logo and Description */}
                    <motion.div
                        className="col-span-1 md:col-span-2"
                        variants={fadeInUp}
                    >
                        <div className="flex items-center mb-4">
                            <img src={logo} alt={defaultLogoAlt} className="h-10 w-10 mr-3" />
                            <span className="text-white font-bold text-xl">{defaultBrandName}</span>
                        </div>
                        <p className="text-gray-400 mb-4">
                            {defaultDescription}
                        </p>

                        {/* Language Switcher */}
                        {showLanguageSwitcher && (
                            <select
                                value={currentLanguage || lang}
                                onChange={(e) => handleLanguageChange(e.target.value)}
                                className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 text-sm"
                            >
                                {(defaultContactInfo?.languages || []).map(lang => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.name}
                                    </option>
                                ))}
                            </select>
                        )}

                        {/* Contact Information */}
                        {showContactInfo && (
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center text-gray-400 text-sm">
                                    <Mail size={16} className="mr-2" />
                                    <span>{defaultContactInfo?.email}</span>
                                </div>
                                <div className="flex items-center text-gray-400 text-sm">
                                    <Phone size={16} className="mr-2" />
                                    <span>{defaultContactInfo?.phone}</span>
                                </div>
                                <div className="flex items-center text-gray-400 text-sm">
                                    <MapPin size={16} className="mr-2" />
                                    <span>{defaultContactInfo?.address}</span>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div variants={fadeInUp}>
                        <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            {quickLinks.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        to={link.path}
                                        className="hover:text-white transition-colors duration-200 text-sm"
                                        onClick={() => handleLinkClick(link)}
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Legal Links */}
                    <motion.div variants={fadeInUp}>
                        <h3 className="text-white font-semibold mb-4">Legal</h3>
                        <ul className="space-y-2">
                            {legalLinks.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        to={link.path}
                                        className="hover:text-white transition-colors duration-200 text-sm"
                                        onClick={() => handleLinkClick(link)}
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </motion.div>

                <motion.hr
                    className="my-8 border-gray-800"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                />

                {/* Bottom Footer */}
                <motion.div
                    className="flex flex-col md:flex-row justify-between items-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <p className="text-gray-400 text-sm mb-4 md:mb-0">
                        © {currentYear} HeritageGuard. All rights reserved.
                    </p>
                </motion.div>
            </div>
        </footer>
    );
};

export default Footer; 