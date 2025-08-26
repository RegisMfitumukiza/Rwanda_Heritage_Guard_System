package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.service.UserLanguagePreferenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.constraints.Pattern;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user/language-preferences")
@RequiredArgsConstructor
@Slf4j
public class UserLanguagePreferenceController {
    
    private final UserLanguagePreferenceService languagePreferenceService;
    
    /**
     * Get user's preferred language
     */
    @GetMapping("/preferred")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> getPreferredLanguage(Authentication authentication) {
        String preferredLanguage = languagePreferenceService.getUserPreferredLanguage(authentication.getName());
        Map<String, String> response = Map.of("preferredLanguage", preferredLanguage);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Set user's preferred language
     */
    @PutMapping("/preferred")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> setPreferredLanguage(
            @RequestParam @Pattern(regexp = "^(en|rw|fr)$") String languageCode,
            Authentication authentication) {
        
        languagePreferenceService.setUserPreferredLanguage(authentication.getName(), languageCode);
        
        Map<String, String> response = Map.of(
            "message", "Preferred language updated successfully",
            "preferredLanguage", languageCode
        );
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get user's additional languages
     */
    @GetMapping("/additional")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, List<String>>> getAdditionalLanguages(Authentication authentication) {
        List<String> additionalLanguages = languagePreferenceService.getUserAdditionalLanguages(authentication.getName());
        Map<String, List<String>> response = Map.of("additionalLanguages", additionalLanguages);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Add additional language to user
     */
    @PostMapping("/additional")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> addAdditionalLanguage(
            @RequestParam @Pattern(regexp = "^(en|rw|fr)$") String languageCode,
            Authentication authentication) {
        
        languagePreferenceService.addUserAdditionalLanguage(authentication.getName(), languageCode);
        
        Map<String, String> response = Map.of(
            "message", "Additional language added successfully",
            "languageCode", languageCode
        );
        return ResponseEntity.ok(response);
    }
    
    /**
     * Remove additional language from user
     */
    @DeleteMapping("/additional/{languageCode}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> removeAdditionalLanguage(
            @PathVariable @Pattern(regexp = "^(en|rw|fr)$") String languageCode,
            Authentication authentication) {
        
        languagePreferenceService.removeUserAdditionalLanguage(authentication.getName(), languageCode);
        
        Map<String, String> response = Map.of(
            "message", "Additional language removed successfully",
            "languageCode", languageCode
        );
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get all languages for user (preferred + additional)
     */
    @GetMapping("/all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getAllLanguages(Authentication authentication) {
        String preferredLanguage = languagePreferenceService.getUserPreferredLanguage(authentication.getName());
        List<String> additionalLanguages = languagePreferenceService.getUserAdditionalLanguages(authentication.getName());
        List<String> allLanguages = languagePreferenceService.getAllUserLanguages(authentication.getName());
        
        Map<String, Object> response = Map.of(
            "preferredLanguage", preferredLanguage,
            "additionalLanguages", additionalLanguages,
            "allLanguages", allLanguages
        );
        return ResponseEntity.ok(response);
    }
    
    /**
     * Check if user can understand a specific language
     */
    @GetMapping("/can-understand/{languageCode}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> canUnderstandLanguage(
            @PathVariable @Pattern(regexp = "^(en|rw|fr)$") String languageCode,
            Authentication authentication) {
        
        boolean canUnderstand = languagePreferenceService.canUserUnderstandLanguage(authentication.getName(), languageCode);
        
        Map<String, Object> response = Map.of(
            "languageCode", languageCode,
            "canUnderstand", canUnderstand
        );
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get best available language for user from a list of available languages
     */
    @PostMapping("/best-available")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> getBestAvailableLanguage(
            @RequestBody List<@Pattern(regexp = "^(en|rw|fr)$") String> availableLanguages,
            Authentication authentication) {
        
        String bestLanguage = languagePreferenceService.getBestAvailableLanguage(authentication.getName(), availableLanguages);
        
        Map<String, String> response = Map.of("bestLanguage", bestLanguage);
        return ResponseEntity.ok(response);
    }
} 