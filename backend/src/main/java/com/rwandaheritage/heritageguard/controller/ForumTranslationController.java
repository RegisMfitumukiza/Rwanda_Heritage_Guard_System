package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.dto.TranslationDTO;
import com.rwandaheritage.heritageguard.mapper.TranslationMapper;
import com.rwandaheritage.heritageguard.model.Translation;
import com.rwandaheritage.heritageguard.service.ForumTranslationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/forum/translations")
@RequiredArgsConstructor
@Slf4j
public class ForumTranslationController {
    
    private final ForumTranslationService translationService;
    
    /**
     * Create a new translation for forum content
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('CONTENT_MANAGER', 'HERITAGE_MANAGER', 'SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<TranslationDTO> createTranslation(
            @Valid @RequestBody TranslationDTO translationDTO,
            Authentication authentication) {
        
        log.info("Creating translation for content type: {}", translationDTO.getContentType());
        
        String currentUser = authentication.getName();
        
        Translation translation = translationService.createTranslation(
            translationDTO.getContentType(),
            translationDTO.getContentId(),
            translationDTO.getFieldName(),
            translationDTO.getLanguageCode(),
            translationDTO.getTranslatedText(),
            currentUser
        );
        
        TranslationDTO responseDTO = TranslationMapper.toDTO(translation);
        return ResponseEntity.ok(responseDTO);
    }
    
    /**
     * Update an existing translation
     */
    @PutMapping("/{translationId}")
    @PreAuthorize("hasAnyRole('CONTENT_MANAGER', 'HERITAGE_MANAGER', 'SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<TranslationDTO> updateTranslation(
            @PathVariable Long translationId,
            @Valid @RequestBody TranslationDTO translationDTO,
            Authentication authentication) {
        
        log.info("Updating translation with ID: {}", translationId);
        
        String currentUser = authentication.getName();
        
        Translation translation = translationService.updateTranslation(
            translationId,
            translationDTO.getTranslatedText(),
            currentUser
        );
        
        TranslationDTO responseDTO = TranslationMapper.toDTO(translation);
        return ResponseEntity.ok(responseDTO);
    }
    
    /**
     * Delete a translation
     */
    @DeleteMapping("/{translationId}")
    @PreAuthorize("hasAnyRole('CONTENT_MANAGER', 'HERITAGE_MANAGER', 'SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<Void> deleteTranslation(
            @PathVariable Long translationId,
            Authentication authentication) {
        
        log.info("Deleting translation with ID: {}", translationId);
        
        String currentUser = authentication.getName();
        translationService.deleteTranslation(translationId, currentUser);
        
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Get translation by ID
     */
    @GetMapping("/{translationId}")
    @PreAuthorize("hasAnyRole('CONTENT_MANAGER', 'HERITAGE_MANAGER', 'SYSTEM_ADMINISTRATOR', 'COMMUNITY_MEMBER')")
    public ResponseEntity<TranslationDTO> getTranslationById(@PathVariable Long translationId) {
        
        log.debug("Fetching translation with ID: {}", translationId);
        
        Translation translation = translationService.getTranslationById(translationId);
        TranslationDTO responseDTO = TranslationMapper.toDTO(translation);
        
        return ResponseEntity.ok(responseDTO);
    }
    
    /**
     * Get all translations for specific content
     */
    @GetMapping("/content/{contentType}/{contentId}/{fieldName}")
    @PreAuthorize("hasAnyRole('CONTENT_MANAGER', 'HERITAGE_MANAGER', 'SYSTEM_ADMINISTRATOR', 'COMMUNITY_MEMBER')")
    public ResponseEntity<List<TranslationDTO>> getTranslationsForContent(
            @PathVariable String contentType,
            @PathVariable Long contentId,
            @PathVariable String fieldName) {
        
        log.debug("Fetching translations for {}:{}:{}", contentType, contentId, fieldName);
        
        List<Translation> translations = translationService.getTranslationsForContent(
            contentType, contentId, fieldName);
        
        List<TranslationDTO> responseDTOs = translations.stream()
            .map(TranslationMapper::toDTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(responseDTOs);
    }
    
    /**
     * Get available languages for specific content
     */
    @GetMapping("/content/{contentType}/{contentId}/{fieldName}/languages")
    @PreAuthorize("hasAnyRole('CONTENT_MANAGER', 'HERITAGE_MANAGER', 'SYSTEM_ADMINISTRATOR', 'COMMUNITY_MEMBER')")
    public ResponseEntity<List<String>> getAvailableLanguagesForContent(
            @PathVariable String contentType,
            @PathVariable Long contentId,
            @PathVariable String fieldName) {
        
        log.debug("Fetching available languages for {}:{}:{}", contentType, contentId, fieldName);
        
        List<String> languages = translationService.getAvailableLanguagesForContent(
            contentType, contentId, fieldName);
        
        return ResponseEntity.ok(languages);
    }
    
    /**
     * Get translation statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('CONTENT_MANAGER', 'HERITAGE_MANAGER', 'SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<Map<String, Object>> getTranslationStatistics() {
        
        log.debug("Fetching translation statistics");
        
        Map<String, Object> statistics = translationService.getTranslationStatistics();
        
        return ResponseEntity.ok(statistics);
    }
    
    /**
     * Get translations by user
     */
    @GetMapping("/user/{username}")
    @PreAuthorize("hasAnyRole('CONTENT_MANAGER', 'HERITAGE_MANAGER', 'SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<List<TranslationDTO>> getTranslationsByUser(@PathVariable String username) {
        
        log.debug("Fetching translations by user: {}", username);
        
        List<Translation> translations = translationService.getTranslationsByUser(username);
        
        List<TranslationDTO> responseDTOs = translations.stream()
            .map(TranslationMapper::toDTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(responseDTOs);
    }
    
    /**
     * Get translations for forum topics
     */
    @GetMapping("/topics/{topicId}")
    @PreAuthorize("hasAnyRole('CONTENT_MANAGER', 'HERITAGE_MANAGER', 'SYSTEM_ADMINISTRATOR', 'COMMUNITY_MEMBER')")
    public ResponseEntity<List<TranslationDTO>> getForumTopicTranslations(@PathVariable Long topicId) {
        
        log.debug("Fetching translations for forum topic: {}", topicId);
        
        List<Translation> translations = translationService.getForumTopicTranslations(topicId);
        
        List<TranslationDTO> responseDTOs = translations.stream()
            .map(TranslationMapper::toDTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(responseDTOs);
    }
    
    /**
     * Get translations for forum posts
     */
    @GetMapping("/posts/{postId}")
    @PreAuthorize("hasAnyRole('CONTENT_MANAGER', 'HERITAGE_MANAGER', 'SYSTEM_ADMINISTRATOR', 'COMMUNITY_MEMBER')")
    public ResponseEntity<List<TranslationDTO>> getForumPostTranslations(@PathVariable Long postId) {
        
        log.debug("Fetching translations for forum post: {}", postId);
        
        List<Translation> translations = translationService.getForumPostTranslations(postId);
        
        List<TranslationDTO> responseDTOs = translations.stream()
            .map(TranslationMapper::toDTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(responseDTOs);
    }
    
    /**
     * Get translations for forum categories
     */
    @GetMapping("/categories/{categoryId}")
    @PreAuthorize("hasAnyRole('CONTENT_MANAGER', 'HERITAGE_MANAGER', 'SYSTEM_ADMINISTRATOR', 'COMMUNITY_MEMBER')")
    public ResponseEntity<List<TranslationDTO>> getForumCategoryTranslations(@PathVariable Long categoryId) {
        
        log.debug("Fetching translations for forum category: {}", categoryId);
        
        List<Translation> translations = translationService.getForumCategoryTranslations(categoryId);
        
        List<TranslationDTO> responseDTOs = translations.stream()
            .map(TranslationMapper::toDTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(responseDTOs);
    }
} 