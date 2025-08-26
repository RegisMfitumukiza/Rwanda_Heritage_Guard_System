package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.dto.TranslationDTO;
import com.rwandaheritage.heritageguard.service.TranslationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/translations")
@RequiredArgsConstructor
@Slf4j
public class TranslationController {
    
    private final TranslationService translationService;
    
    /**
     * Get translated text for any content
     */
    @GetMapping("/text")
    public ResponseEntity<String> getTranslatedText(@RequestParam String contentType,
                                                   @RequestParam Long contentId,
                                                   @RequestParam String fieldName,
                                                   @RequestParam String languageCode) {
        log.debug("GET /api/translations/text - Getting translation for content: {}:{}, field: {}, language: {}", 
                contentType, contentId, fieldName, languageCode);
        
        String translatedText = translationService.getTranslatedText(contentType, contentId, fieldName, languageCode);
        return ResponseEntity.ok(translatedText);
    }
    
    /**
     * Save translation
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER')")
    public ResponseEntity<TranslationDTO> saveTranslation(@Valid @RequestBody TranslationDTO translationDTO,
                                                        Authentication authentication) {
        log.debug("POST /api/translations - Saving translation");
        String currentUser = authentication.getName();
        TranslationDTO savedTranslation = translationService.saveTranslation(translationDTO, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedTranslation);
    }
    
    /**
     * Get all translations for a content
     */
    @GetMapping("/content")
    public ResponseEntity<List<TranslationDTO>> getTranslationsForContent(@RequestParam String contentType,
                                                                         @RequestParam Long contentId) {
        log.debug("GET /api/translations/content - Getting translations for content: {}:{}", contentType, contentId);
        List<TranslationDTO> translations = translationService.getTranslationsForContent(contentType, contentId);
        return ResponseEntity.ok(translations);
    }
    
    /**
     * Get translations by content type and language
     */
    @GetMapping("/by-type-language")
    public ResponseEntity<List<TranslationDTO>> getTranslationsByTypeAndLanguage(@RequestParam String contentType,
                                                                                @RequestParam String languageCode) {
        log.debug("GET /api/translations/by-type-language - Getting translations for type: {} and language: {}", 
                contentType, languageCode);
        List<TranslationDTO> translations = translationService.getTranslationsByTypeAndLanguage(contentType, languageCode);
        return ResponseEntity.ok(translations);
    }
    
    /**
     * Search translations with filters
     */
    @GetMapping("/search")
    public ResponseEntity<List<TranslationDTO>> searchTranslations(@RequestParam(required = false) String contentType,
                                                                  @RequestParam(required = false) Long contentId,
                                                                  @RequestParam(required = false) String languageCode,
                                                                  @RequestParam(required = false) String fieldName,
                                                                  @RequestParam(required = false) String status) {
        log.debug("GET /api/translations/search - Searching translations with filters");
        List<TranslationDTO> translations = translationService.searchTranslations(contentType, contentId, languageCode, fieldName, status);
        return ResponseEntity.ok(translations);
    }
    
    /**
     * Delete translation
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER')")
    public ResponseEntity<Void> deleteTranslation(@PathVariable Long id, Authentication authentication) {
        log.debug("DELETE /api/translations/{} - Deleting translation", id);
        String currentUser = authentication.getName();
        translationService.deleteTranslation(id, currentUser);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Batch save translations
     */
    @PostMapping("/batch")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER')")
    public ResponseEntity<List<TranslationDTO>> batchSaveTranslations(@Valid @RequestBody List<TranslationDTO> translationDTOs,
                                                                     Authentication authentication) {
        log.debug("POST /api/translations/batch - Batch saving {} translations", translationDTOs.size());
        String currentUser = authentication.getName();
        List<TranslationDTO> savedTranslations = translationService.batchSaveTranslations(translationDTOs, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedTranslations);
    }
    
    /**
     * Check if translation exists
     */
    @GetMapping("/exists")
    public ResponseEntity<Boolean> translationExists(@RequestParam String contentType,
                                                   @RequestParam Long contentId,
                                                   @RequestParam String fieldName,
                                                   @RequestParam String languageCode) {
        log.debug("GET /api/translations/exists - Checking if translation exists");
        boolean exists = translationService.translationExists(contentType, contentId, fieldName, languageCode);
        return ResponseEntity.ok(exists);
    }
    
    /**
     * Update translation status
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER')")
    public ResponseEntity<TranslationDTO> updateTranslationStatus(@PathVariable Long id,
                                                               @RequestParam String status,
                                                               Authentication authentication) {
        log.debug("PATCH /api/translations/{}/status - Updating translation status to: {}", id, status);
        String currentUser = authentication.getName();
        TranslationDTO updatedTranslation = translationService.updateTranslationStatus(id, status, currentUser);
        return ResponseEntity.ok(updatedTranslation);
    }
    
    /**
     * Get translations by status
     */
    @GetMapping("/by-status/{status}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER')")
    public ResponseEntity<List<TranslationDTO>> getTranslationsByStatus(@PathVariable String status) {
        log.debug("GET /api/translations/by-status/{} - Getting translations by status", status);
        List<TranslationDTO> translations = translationService.getTranslationsByStatus(status);
        return ResponseEntity.ok(translations);
    }
}
