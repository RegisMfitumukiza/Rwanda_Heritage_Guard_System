package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.dto.TranslationDTO;
import com.rwandaheritage.heritageguard.model.Translation;
import com.rwandaheritage.heritageguard.model.User;
import com.rwandaheritage.heritageguard.repository.TranslationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import com.rwandaheritage.heritageguard.constants.LanguageConstants;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MultilingualIntegrationService {
    
    private final TranslationService translationService;
    private final LanguageService languageService;
    
    /**
     * Get user's preferred language with fallback to default
     * Note: Consider caching default language for performance in production
     */
    public String getUserLanguage(User user) {
        if (user != null && user.getPreferredLanguage() != null) {
            return user.getPreferredLanguage();
        }
        
        // Fallback to default language
        try {
            return languageService.getDefaultLanguage().getCode();
        } catch (Exception e) {
            log.warn("Could not get default language, falling back to 'en'", e);
            return "en";
        }
    }
    
    /**
     * Get translated text for content with fallback
     */
    public String getTranslatedText(String contentType, Long contentId, String fieldName, String languageCode) {
        // Input validation
        if (contentType == null || contentType.trim().isEmpty()) {
            throw new IllegalArgumentException("Content type cannot be null or empty");
        }
        if (contentId == null || contentId <= 0) {
            throw new IllegalArgumentException("Content ID must be a positive number");
        }
        if (fieldName == null || fieldName.trim().isEmpty()) {
            throw new IllegalArgumentException("Field name cannot be null or empty");
        }
        if (languageCode == null || languageCode.trim().isEmpty()) {
            throw new IllegalArgumentException("Language code cannot be null or empty");
        }
        
        // Validate language code format
        if (!LanguageConstants.isSupportedLanguage(languageCode)) {
            throw new IllegalArgumentException("Language code must be 'en', 'rw', or 'fr'");
        }
        
        try {
            String translatedText = translationService.getTranslatedText(contentType, contentId, fieldName, languageCode);
            if (translatedText != null && !translatedText.trim().isEmpty()) {
                return translatedText;
            }
        } catch (Exception e) {
            log.debug("Translation not found for {}:{}:{}:{}", contentType, contentId, fieldName, languageCode);
        }
        
        // Fallback to default language if not the same
        if (!"en".equals(languageCode)) {
            try {
                String defaultText = translationService.getTranslatedText(contentType, contentId, fieldName, "en");
                if (defaultText != null && !defaultText.trim().isEmpty()) {
                    return defaultText;
                }
            } catch (Exception e) {
                log.debug("Default language translation not found for {}:{}:{}", contentType, contentId, fieldName);
            }
        }
        
        return null; // No translation available
    }
    
    /**
     * Get translated text for content based on user preference
     */
    public String getTranslatedTextForUser(String contentType, Long contentId, String fieldName, User user) {
        String userLanguage = getUserLanguage(user);
        return getTranslatedText(contentType, contentId, fieldName, userLanguage);
    }
    
    /**
     * Check if translation exists for content
     */
    public boolean hasTranslation(String contentType, Long contentId, String fieldName, String languageCode) {
        try {
            String translatedText = translationService.getTranslatedText(contentType, contentId, fieldName, languageCode);
            return translatedText != null && !translatedText.trim().isEmpty();
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Get available languages for content
     */
    public List<String> getAvailableLanguagesForContent(String contentType, Long contentId, String fieldName) {
        try {
            return translationService.getTranslationsForContent(contentType, contentId)
                    .stream()
                    .filter(t -> fieldName.equals(t.getFieldName()))
                    .map(t -> t.getLanguageCode())
                    .distinct()
                    .toList();
        } catch (Exception e) {
            log.debug("Could not get available languages for {}:{}:{}", contentType, contentId, fieldName);
            return List.of();
        }
    }
    
    /**
     * Get content in user's preferred language with fallback
     */
    public String getContentInUserLanguage(String contentType, Long contentId, String fieldName, User user, String defaultContent) {
        // First try user's preferred language
        String translatedText = getTranslatedTextForUser(contentType, contentId, fieldName, user);
        if (translatedText != null) {
            return translatedText;
        }
        
        // Fallback to default content
        return defaultContent;
    }
    
    /**
     * Get content in specific language with fallback
     */
    public String getContentInLanguage(String contentType, Long contentId, String fieldName, String languageCode, String defaultContent) {
        String translatedText = getTranslatedText(contentType, contentId, fieldName, languageCode);
        return translatedText != null ? translatedText : defaultContent;
    }
    
    /**
     * Get content from hardcoded multilingual fields with fallback to translation system
     * This handles the integration between hardcoded fields and dynamic translations
     */
    public String getContentFromHardcodedFields(String contentType, Long contentId, String fieldName, String languageCode, 
                                               String contentEn, String contentRw, String contentFr) {
        // First try the dynamic translation system (highest priority)
        String dynamicTranslation = getTranslatedText(contentType, contentId, fieldName, languageCode);
        if (dynamicTranslation != null) {
            return dynamicTranslation;
        }
        
        // Fallback to hardcoded fields based on language
        switch (languageCode) {
            case "en":
                return contentEn != null ? contentEn : "";
            case "rw":
                return contentRw != null ? contentRw : contentEn; // Fallback to English
            case "fr":
                return contentFr != null ? contentFr : contentEn; // Fallback to English
            default:
                return contentEn != null ? contentEn : "";
        }
    }
    
    /**
     * Migrate hardcoded translations to the dynamic translation system
     */
    public void migrateHardcodedTranslations(String contentType, Long contentId, String fieldName,
                                           String contentEn, String contentRw, String contentFr, String currentUser) {
        try {
            // Migrate Kinyarwanda translation
            if (contentRw != null && !contentRw.trim().isEmpty() && !contentRw.equals(contentEn)) {
                translationService.saveTranslation(
                    com.rwandaheritage.heritageguard.dto.TranslationDTO.builder()
                        .contentType(contentType)
                        .contentId(contentId)
                        .fieldName(fieldName)
                        .languageCode("rw")
                        .translatedText(contentRw)
                        .status("PUBLISHED")
                        .build(),
                    currentUser
                );
            }
            
            // Migrate French translation
            if (contentFr != null && !contentFr.trim().isEmpty() && !contentFr.equals(contentEn)) {
                translationService.saveTranslation(
                    com.rwandaheritage.heritageguard.dto.TranslationDTO.builder()
                        .contentType(contentType)
                        .contentId(contentId)
                        .fieldName(fieldName)
                        .languageCode("fr")
                        .translatedText(contentFr)
                        .status("PUBLISHED")
                        .build(),
                    currentUser
                );
            }
            
            log.info("Migrated hardcoded translations for {}:{}:{}", contentType, contentId, fieldName);
        } catch (Exception e) {
            log.warn("Failed to migrate hardcoded translations for {}:{}:{}", contentType, contentId, fieldName, e);
        }
    }
    
    /**
     * Check if content has translations (either hardcoded or dynamic)
     */
    public boolean hasAnyTranslation(String contentType, Long contentId, String fieldName, String languageCode,
                                   String contentEn, String contentRw, String contentFr) {
        // Check dynamic translation system first
        if (hasTranslation(contentType, contentId, fieldName, languageCode)) {
            return true;
        }
        
        // Check hardcoded fields
        switch (languageCode) {
            case "en":
                return contentEn != null && !contentEn.trim().isEmpty();
            case "rw":
                return contentRw != null && !contentRw.trim().isEmpty();
            case "fr":
                return contentFr != null && !contentFr.trim().isEmpty();
            default:
                return false;
        }
    }
    
    /**
     * Get all available languages for content (both hardcoded and dynamic)
     */
    public List<String> getAllAvailableLanguages(String contentType, Long contentId, String fieldName,
                                                String contentEn, String contentRw, String contentFr) {
        List<String> languages = new java.util.ArrayList<>();
        
        // Add languages from dynamic translation system
        languages.addAll(getAvailableLanguagesForContent(contentType, contentId, fieldName));
        
        // Add languages from hardcoded fields
        if (contentEn != null && !contentEn.trim().isEmpty()) {
            if (!languages.contains("en")) languages.add("en");
        }
        if (contentRw != null && !contentRw.trim().isEmpty()) {
            if (!languages.contains("rw")) languages.add("rw");
        }
        if (contentFr != null && !contentFr.trim().isEmpty()) {
            if (!languages.contains("fr")) languages.add("fr");
        }
        
        return languages;
    }
} 