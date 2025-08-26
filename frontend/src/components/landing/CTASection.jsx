import React from 'react';
import { motion } from 'framer-motion';
import { Search, Users, Globe, Heart, Award, BookOpen, MapPin, Camera } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import museum from '../../assets/Ethnographic-Museum.jpg';

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

const CTASection = ({
    className = "py-20 bg-blue-600 dark:bg-transparent relative overflow-hidden",
    title,
    subtitle,
    backgroundImage = museum,
    showFeatures = true,
    showButtons = true,
    primaryButtonText,
    secondaryButtonText,
    primaryButtonAction = "/register",
    secondaryButtonAction = "/login",
    customFeatures = null,
    onPrimaryClick,
    onSecondaryClick,
    onFeatureClick
}) => {
    const { user } = useAuth();
    const { t } = useLanguage();

    // Use translations for default values
    const defaultTitle = title || t('cta.title');
    const defaultSubtitle = subtitle || t('cta.subtitle');
    const defaultPrimaryBtn = primaryButtonText || t('cta.primaryButton');
    const defaultSecondaryBtn = secondaryButtonText || (user ? t('cta.dashboardButton') : t('cta.secondaryButton'));
    const defaultFeatures = t('cta.features');
    const defaultAdditionalInfo = t('cta.additionalInfo');

    // Use custom features or default features
    const features = customFeatures || defaultFeatures;

    const handlePrimaryClick = () => {
        if (onPrimaryClick) {
            onPrimaryClick();
        }
    };

    const handleSecondaryClick = () => {
        if (onSecondaryClick) {
            onSecondaryClick();
        }
    };

    const handleFeatureClick = (feature) => {
        if (onFeatureClick) {
            onFeatureClick(feature);
        }
    };

    return (
        <section className={className + ' isolate'}>
            {/* Animated Background */}
            <motion.div
                className="absolute inset-0 opacity-20 dark:opacity-10"
                animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    repeatType: 'reverse'
                }}
                style={{
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: 'cover',
                }}
            />
            {/* Overlay for readability */}
            <div className="absolute inset-0 bg-blue-700/70 dark:hidden" />
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-transparent to-blue-900/20 dark:hidden" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-40">
                {/* Main Title */}
                <motion.h2
                    className="text-3xl sm:text-4xl font-bold text-white mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    {defaultTitle}
                </motion.h2>

                {/* Subtitle */}
                <motion.p
                    className="text-xl text-blue-100 dark:text-white mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    {defaultSubtitle}
                </motion.p>

                {/* Features Grid */}
                {showFeatures && (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {features.map((item, index) => (
                            <motion.div
                                key={item.id}
                                className="text-white cursor-pointer group"
                                variants={fadeInUp}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => handleFeatureClick(item)}
                            >
                                <motion.div
                                    className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <item.icon size={32} />
                                </motion.div>
                                <h3 className="font-semibold mb-2 text-white group-hover:text-blue-200 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-blue-100 group-hover:text-blue-200 transition-colors">
                                    {item.description}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Call-to-Action Buttons */}
                {showButtons && (
                    <motion.div
                        className="relative z-20 flex flex-col sm:flex-row gap-4 justify-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <button
                            type="button"
                            onClick={handlePrimaryClick}
                            aria-label={typeof defaultPrimaryBtn === 'string' ? defaultPrimaryBtn : 'Primary CTA'}
                            className="z-50 inline-flex items-center justify-center rounded-md px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border border-white/30 bg-blue-600 text-white hover:bg-blue-700 dark:bg-white dark:text-blue-900 dark:border-gray-300 dark:hover:bg-gray-100"
                        >
                            {defaultPrimaryBtn}
                        </button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="text-white border-white hover:bg-white hover:text-blue-700 px-8 py-3 text-lg font-semibold transition-all duration-300"
                            onClick={handleSecondaryClick}
                        >
                            {defaultSecondaryBtn}
                        </Button>
                    </motion.div>
                )}

                {/* Additional Info */}
                <motion.div
                    className="mt-8 text-blue-100 text-sm"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <p>{defaultAdditionalInfo}</p>
                </motion.div>
            </div>
        </section>
    );
};

export default CTASection; 