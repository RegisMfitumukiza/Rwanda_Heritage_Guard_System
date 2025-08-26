import React, { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LanguageSwitcher = ({ currentLanguage, languages = [], onLanguageChange, transparent = false }) => {
    const [isOpen, setIsOpen] = useState(false);

    const textClasses = transparent ? 'text-white' : 'text-gray-700 dark:text-gray-200';
    const hoverClasses = transparent ? 'hover:bg-white/10' : 'hover:bg-gray-100 dark:hover:bg-gray-800';

    const handleLanguageSelect = (langCode) => {
        onLanguageChange(langCode);
        setIsOpen(false);
    };

    // Safety check for languages array
    if (!languages || languages.length === 0) {
        return null; // Don't render if no languages provided
    }

    const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

    return (
        <div className="relative">
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${textClasses} ${hoverClasses}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Globe size={16} />
                <span className="text-sm font-medium">{currentLang.name}</span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown size={14} />
                </motion.div>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="absolute right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 min-w-[140px]"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        {languages.map((language) => (
                            <motion.button
                                key={language.code}
                                onClick={() => handleLanguageSelect(language.code)}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${currentLanguage === language.code
                                    ? 'text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20'
                                    : 'text-gray-700 dark:text-gray-200'
                                    }`}
                                whileHover={{ x: 2 }}
                                transition={{ duration: 0.2 }}
                            >
                                {language.name}
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LanguageSwitcher; 