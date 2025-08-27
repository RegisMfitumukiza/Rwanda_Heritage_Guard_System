package com.rwandaheritage.heritageguard.constants;

/**
 * Constants for supported languages in the HeritageGuard system
 */
public final class LanguageConstants {
    
    // Supported language codes
    public static final String ENGLISH = "en";
    public static final String KINYARWANDA = "rw";
    public static final String FRENCH = "fr";
    
    // Language code pattern for validation
    public static final String LANGUAGE_CODE_PATTERN = "^(en|rw|fr)$";
    
    // Default language
    public static final String DEFAULT_LANGUAGE = ENGLISH;
    
    // Language names
    public static final String ENGLISH_NAME = "English";
    public static final String KINYARWANDA_NAME = "Kinyarwanda";
    public static final String FRENCH_NAME = "French";
    
    private LanguageConstants() {
        // Prevent instantiation
    }
    
    /**
     * Check if a language code is supported
     * 
     * @param languageCode the language code to check
     * @return true if supported, false otherwise
     */
    public static boolean isSupportedLanguage(String languageCode) {
        return languageCode != null && languageCode.matches(LANGUAGE_CODE_PATTERN);
    }
    
    /**
     * Get language name by code
     * 
     * @param languageCode the language code
     * @return the language name
     */
    public static String getLanguageName(String languageCode) {
        if (ENGLISH.equals(languageCode)) {
            return ENGLISH_NAME;
        } else if (KINYARWANDA.equals(languageCode)) {
            return KINYARWANDA_NAME;
        } else if (FRENCH.equals(languageCode)) {
            return FRENCH_NAME;
        }
        return "Unknown";
    }
} 