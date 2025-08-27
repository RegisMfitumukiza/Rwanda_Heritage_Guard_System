package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.model.Translation;
import com.rwandaheritage.heritageguard.model.User;
import com.rwandaheritage.heritageguard.repository.TranslationRepository;
import com.rwandaheritage.heritageguard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ForumTranslationService {
    
    private final TranslationRepository translationRepository;
    private final UserRepository userRepository;
    private final MultilingualIntegrationService multilingualService;
    
    /**
     * Create translation for forum content
     */
    public Translation createTranslation(String contentType, Long contentId, String fieldName, 
                                       String languageCode, String translatedText, String currentUser) {
        log.info("Creating translation for {}:{}:{} in language: {}", contentType, contentId, fieldName, languageCode);
        
        // Validate input
        validateTranslationInput(contentType, contentId, fieldName, languageCode, translatedText);
        
        // Check if translation already exists
        Optional<Translation> existingTranslation = translationRepository
            .findByContentTypeAndContentIdAndFieldNameAndLanguageCode(
                Translation.ContentType.valueOf(contentType), contentId, fieldName, languageCode);
        
        if (existingTranslation.isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, 
                "Translation already exists for this content and language");
        }
        
        // Create new translation
        Translation translation = Translation.builder()
            .contentType(Translation.ContentType.valueOf(contentType))
            .contentId(contentId)
            .fieldName(fieldName)
            .languageCode(languageCode)
            .translatedText(translatedText)
            .status(Translation.TranslationStatus.PUBLISHED)
            .createdBy(currentUser)
            .updatedBy(currentUser)
            .build();
        
        Translation savedTranslation = translationRepository.save(translation);
        log.info("Created translation with ID: {}", savedTranslation.getId());
        
        return savedTranslation;
    }
    
    /**
     * Update existing translation
     */
    public Translation updateTranslation(Long translationId, String translatedText, String currentUser) {
        log.info("Updating translation with ID: {}", translationId);
        
        Translation translation = translationRepository.findById(translationId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Translation not found"));
        
        if (translatedText == null || translatedText.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Translated text cannot be empty");
        }
        
        translation.setTranslatedText(translatedText.trim());
        translation.setUpdatedBy(currentUser);
        translation.setUpdatedDate(LocalDateTime.now());
        
        Translation updatedTranslation = translationRepository.save(translation);
        log.info("Updated translation with ID: {}", updatedTranslation.getId());
        
        return updatedTranslation;
    }
    
    /**
     * Delete translation
     */
    public void deleteTranslation(Long translationId, String currentUser) {
        log.info("Deleting translation with ID: {}", translationId);
        
        Translation translation = translationRepository.findById(translationId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Translation not found"));
        
        translationRepository.delete(translation);
        log.info("Deleted translation with ID: {}", translationId);
    }
    
    /**
     * Get all translations for specific content
     */
    @Transactional(readOnly = true)
    public List<Translation> getTranslationsForContent(String contentType, Long contentId, String fieldName) {
        log.debug("Fetching translations for {}:{}:{}", contentType, contentId, fieldName);
        
        return translationRepository.findByContentTypeAndContentIdAndFieldName(
            Translation.ContentType.valueOf(contentType), contentId, fieldName);
    }
    
    /**
     * Get translation by ID
     */
    @Transactional(readOnly = true)
    public Translation getTranslationById(Long translationId) {
        return translationRepository.findById(translationId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Translation not found"));
    }
    
    /**
     * Get available languages for specific content
     */
    @Transactional(readOnly = true)
    public List<String> getAvailableLanguagesForContent(String contentType, Long contentId, String fieldName) {
        log.debug("Fetching available languages for {}:{}:{}", contentType, contentId, fieldName);
        
        List<Translation> translations = getTranslationsForContent(contentType, contentId, fieldName);
        return translations.stream()
            .map(Translation::getLanguageCode)
            .distinct()
            .collect(Collectors.toList());
    }
    
    /**
     * Get translation statistics for forum content
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getTranslationStatistics() {
        log.debug("Fetching translation statistics");
        
        Map<String, Object> statistics = new HashMap<>();
        
        // Count translations by content type
        List<Object[]> contentTypeStats = translationRepository.countByContentType();
        Map<String, Long> contentTypeCounts = contentTypeStats.stream()
            .collect(Collectors.toMap(
                row -> (String) row[0],
                row -> (Long) row[1]
            ));
        statistics.put("byContentType", contentTypeCounts);
        
        // Count translations by language
        List<Object[]> languageStats = translationRepository.countByLanguageCode();
        Map<String, Long> languageCounts = languageStats.stream()
            .collect(Collectors.toMap(
                row -> (String) row[0],
                row -> (Long) row[1]
            ));
        statistics.put("byLanguage", languageCounts);
        
        // Total translations
        long totalTranslations = translationRepository.count();
        statistics.put("totalTranslations", totalTranslations);
        
        // Recent translations (last 30 days)
        long recentTranslations = translationRepository.countByCreatedDateAfter(
            LocalDateTime.now().minusDays(30));
        statistics.put("recentTranslations", recentTranslations);
        
        return statistics;
    }
    
    /**
     * Get translations created by specific user
     */
    @Transactional(readOnly = true)
    public List<Translation> getTranslationsByUser(String username) {
        log.debug("Fetching translations by user: {}", username);
        
        return translationRepository.findByCreatedByOrderByCreatedDateDesc(username);
    }
    
    /**
     * Get translations for forum topics
     */
    @Transactional(readOnly = true)
    public List<Translation> getForumTopicTranslations(Long topicId) {
        log.debug("Fetching translations for forum topic: {}", topicId);
        
        return translationRepository.findByContentTypeAndContentId(
            Translation.ContentType.FORUM_TOPIC, topicId);
    }
    
    /**
     * Get translations for forum posts
     */
    @Transactional(readOnly = true)
    public List<Translation> getForumPostTranslations(Long postId) {
        log.debug("Fetching translations for forum post: {}", postId);
        
        return translationRepository.findByContentTypeAndContentId(
            Translation.ContentType.FORUM_POST, postId);
    }
    
    /**
     * Get translations for forum categories
     */
    @Transactional(readOnly = true)
    public List<Translation> getForumCategoryTranslations(Long categoryId) {
        log.debug("Fetching translations for forum category: {}", categoryId);
        
        return translationRepository.findByContentTypeAndContentId(
            Translation.ContentType.FORUM_CATEGORY, categoryId);
    }
    
    /**
     * Validate translation input parameters
     */
    private void validateTranslationInput(String contentType, Long contentId, String fieldName, 
                                        String languageCode, String translatedText) {
        if (contentType == null || contentType.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Content type cannot be empty");
        }
        
        if (contentId == null || contentId <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Content ID must be positive");
        }
        
        if (fieldName == null || fieldName.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Field name cannot be empty");
        }
        
        if (languageCode == null || languageCode.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Language code cannot be empty");
        }
        
        if (!isValidLanguageCode(languageCode)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Language code must be 'en', 'rw', or 'fr'");
        }
        
        if (translatedText == null || translatedText.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Translated text cannot be empty");
        }
        
        // Validate content type
        try {
            Translation.ContentType.valueOf(contentType);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Invalid content type. Must be one of: FORUM_TOPIC, FORUM_POST, FORUM_CATEGORY");
        }
    }
    
    /**
     * Check if language code is valid
     */
    private boolean isValidLanguageCode(String languageCode) {
        return "en".equals(languageCode) || "rw".equals(languageCode) || "fr".equals(languageCode);
    }
} 