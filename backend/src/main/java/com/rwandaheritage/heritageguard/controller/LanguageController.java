package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.dto.LanguageDTO;
import com.rwandaheritage.heritageguard.service.LanguageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/languages")
@RequiredArgsConstructor
@Slf4j
public class LanguageController {
    
    private final LanguageService languageService;
    
    /**
     * Get all active languages (public access)
     * 
     * @return List of active languages
     * @apiNote This endpoint is publicly accessible and does not require authentication
     */
    @GetMapping
    public ResponseEntity<List<LanguageDTO>> getActiveLanguages() {
        log.debug("GET /api/languages - Getting active languages");
        List<LanguageDTO> languages = languageService.getActiveLanguages();
        return ResponseEntity.ok(languages);
    }
    
    /**
     * Get all languages including inactive (admin only)
     */
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER')")
    public ResponseEntity<List<LanguageDTO>> getAllLanguages() {
        log.debug("GET /api/languages/all - Getting all languages");
        List<LanguageDTO> languages = languageService.getAllLanguages();
        return ResponseEntity.ok(languages);
    }
    
    /**
     * Get language by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<LanguageDTO> getLanguageById(@PathVariable Long id) {
        log.debug("GET /api/languages/{} - Getting language by ID", id);
        LanguageDTO language = languageService.getLanguageById(id);
        return ResponseEntity.ok(language);
    }
    
    /**
     * Get language by code
     */
    @GetMapping("/code/{code}")
    public ResponseEntity<LanguageDTO> getLanguageByCode(@PathVariable String code) {
        log.debug("GET /api/languages/code/{} - Getting language by code", code);
        LanguageDTO language = languageService.getLanguageByCode(code);
        return ResponseEntity.ok(language);
    }
    
    /**
     * Get default language
     */
    @GetMapping("/default")
    public ResponseEntity<LanguageDTO> getDefaultLanguage() {
        log.debug("GET /api/languages/default - Getting default language");
        LanguageDTO language = languageService.getDefaultLanguage();
        return ResponseEntity.ok(language);
    }
    
    /**
     * Add new language
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER')")
    public ResponseEntity<LanguageDTO> addLanguage(@Valid @RequestBody LanguageDTO languageDTO, 
                                                 Authentication authentication) {
        log.debug("POST /api/languages - Adding new language: {}", languageDTO.getCode());
        String currentUser = authentication.getName();
        LanguageDTO savedLanguage = languageService.addLanguage(languageDTO, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedLanguage);
    }
    
    /**
     * Update language
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER')")
    public ResponseEntity<LanguageDTO> updateLanguage(@PathVariable Long id, 
                                                    @Valid @RequestBody LanguageDTO languageDTO,
                                                    Authentication authentication) {
        log.debug("PUT /api/languages/{} - Updating language", id);
        String currentUser = authentication.getName();
        LanguageDTO updatedLanguage = languageService.updateLanguage(id, languageDTO, currentUser);
        return ResponseEntity.ok(updatedLanguage);
    }
    
    /**
     * Delete language
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<Void> deleteLanguage(@PathVariable Long id, Authentication authentication) {
        log.debug("DELETE /api/languages/{} - Deleting language", id);
        String currentUser = authentication.getName();
        languageService.deleteLanguage(id, currentUser);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Set default language
     */
    @PatchMapping("/{code}/set-default")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER')")
    public ResponseEntity<LanguageDTO> setDefaultLanguage(@PathVariable String code, 
                                                        Authentication authentication) {
        log.debug("PATCH /api/languages/{}/set-default - Setting default language", code);
        String currentUser = authentication.getName();
        LanguageDTO defaultLanguage = languageService.setDefaultLanguage(code, currentUser);
        return ResponseEntity.ok(defaultLanguage);
    }
    
    /**
     * Toggle language status (activate/deactivate)
     */
    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER')")
    public ResponseEntity<LanguageDTO> toggleLanguageStatus(@PathVariable Long id, 
                                                          Authentication authentication) {
        log.debug("PATCH /api/languages/{}/toggle-status - Toggling language status", id);
        String currentUser = authentication.getName();
        LanguageDTO updatedLanguage = languageService.toggleLanguageStatus(id, currentUser);
        return ResponseEntity.ok(updatedLanguage);
    }
    
    /**
     * Initialize default languages (admin only)
     */
    @PostMapping("/initialize")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<Void> initializeDefaultLanguages(Authentication authentication) {
        log.debug("POST /api/languages/initialize - Initializing default languages");
        String currentUser = authentication.getName();
        languageService.initializeDefaultLanguages(currentUser);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Get language statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER')")
    public ResponseEntity<Map<String, Object>> getLanguageStatistics() {
        log.debug("GET /api/languages/statistics - Getting language statistics");
        Map<String, Object> statistics = languageService.getLanguageStatistics();
        return ResponseEntity.ok(statistics);
    }
}
