package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.dto.TranslationMemoryDTO;
import com.rwandaheritage.heritageguard.service.TranslationMemoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/translation-memory")
@RequiredArgsConstructor
@Slf4j
public class TranslationMemoryController {
    
    private final TranslationMemoryService translationMemoryService;
    
    /**
     * Add translation to memory
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER')")
    public ResponseEntity<TranslationMemoryDTO> addToMemory(@Valid @RequestBody TranslationMemoryDTO memoryDTO,
                                                           Authentication authentication) {
        log.debug("POST /api/translation-memory - Adding translation to memory");
        String currentUser = authentication.getName();
        TranslationMemoryDTO savedMemory = translationMemoryService.addToMemory(memoryDTO, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedMemory);
    }
    
    /**
     * Find translation suggestions from memory
     */
    @GetMapping("/suggestions")
    public ResponseEntity<List<TranslationMemoryDTO>> findSuggestions(@RequestParam String sourceText,
                                                                     @RequestParam String sourceLanguage,
                                                                     @RequestParam String targetLanguage) {
        log.debug("GET /api/translation-memory/suggestions - Finding suggestions for: {} ({} -> {})", 
                sourceText, sourceLanguage, targetLanguage);
        List<TranslationMemoryDTO> suggestions = translationMemoryService.findSuggestions(sourceText, sourceLanguage, targetLanguage);
        return ResponseEntity.ok(suggestions);
    }
    
    /**
     * Find exact match in translation memory
     */
    @GetMapping("/exact-match")
    public ResponseEntity<TranslationMemoryDTO> findExactMatch(@RequestParam String sourceText,
                                                             @RequestParam String sourceLanguage,
                                                             @RequestParam String targetLanguage) {
        log.debug("GET /api/translation-memory/exact-match - Finding exact match for: {} ({} -> {})", 
                sourceText, sourceLanguage, targetLanguage);
        Optional<TranslationMemoryDTO> match = translationMemoryService.findExactMatch(sourceText, sourceLanguage, targetLanguage);
        return match.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Get all translation memory entries
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER')")
    public ResponseEntity<List<TranslationMemoryDTO>> getAllTranslationMemory() {
        log.debug("GET /api/translation-memory - Getting all translation memory entries");
        List<TranslationMemoryDTO> memoryEntries = translationMemoryService.getAllTranslationMemory();
        return ResponseEntity.ok(memoryEntries);
    }
    
    /**
     * Get translation memory by language pair
     */
    @GetMapping("/by-language-pair")
    public ResponseEntity<List<TranslationMemoryDTO>> getByLanguagePair(@RequestParam String sourceLanguage,
                                                                       @RequestParam String targetLanguage) {
        log.debug("GET /api/translation-memory/by-language-pair - Getting memory for {} -> {}", sourceLanguage, targetLanguage);
        List<TranslationMemoryDTO> memoryEntries = translationMemoryService.getByLanguagePair(sourceLanguage, targetLanguage);
        return ResponseEntity.ok(memoryEntries);
    }
    
    /**
     * Search translation memory
     */
    @GetMapping("/search")
    public ResponseEntity<List<TranslationMemoryDTO>> searchTranslationMemory(@RequestParam String searchTerm,
                                                                             @RequestParam(required = false) String sourceLanguage,
                                                                             @RequestParam(required = false) String targetLanguage) {
        log.debug("GET /api/translation-memory/search - Searching for: {} ({} -> {})", searchTerm, sourceLanguage, targetLanguage);
        List<TranslationMemoryDTO> memoryEntries = translationMemoryService.searchTranslationMemory(searchTerm, sourceLanguage, targetLanguage);
        return ResponseEntity.ok(memoryEntries);
    }
    
    /**
     * Get most frequently used translations
     */
    @GetMapping("/most-used")
    public ResponseEntity<List<TranslationMemoryDTO>> getMostUsedTranslations(@RequestParam String sourceLanguage,
                                                                             @RequestParam String targetLanguage,
                                                                             @RequestParam(defaultValue = "10") int limit) {
        log.debug("GET /api/translation-memory/most-used - Getting most used translations for {} -> {} (limit: {})", 
                sourceLanguage, targetLanguage, limit);
        List<TranslationMemoryDTO> memoryEntries = translationMemoryService.getMostUsedTranslations(sourceLanguage, targetLanguage, limit);
        return ResponseEntity.ok(memoryEntries);
    }
    
    /**
     * Increment usage count
     */
    @PatchMapping("/{id}/increment-usage")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER')")
    public ResponseEntity<TranslationMemoryDTO> incrementUsageCount(@PathVariable Long id, Authentication authentication) {
        log.debug("PATCH /api/translation-memory/{}/increment-usage - Incrementing usage count", id);
        String currentUser = authentication.getName();
        TranslationMemoryDTO updatedMemory = translationMemoryService.incrementUsageCount(id, currentUser);
        return ResponseEntity.ok(updatedMemory);
    }
    
    /**
     * Delete translation memory entry
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER')")
    public ResponseEntity<Void> deleteTranslationMemory(@PathVariable Long id, Authentication authentication) {
        log.debug("DELETE /api/translation-memory/{} - Deleting translation memory", id);
        String currentUser = authentication.getName();
        translationMemoryService.deleteTranslationMemory(id, currentUser);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Clean up old translation memory entries
     */
    @PostMapping("/cleanup")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<Void> cleanupTranslationMemory(@RequestParam(defaultValue = "5") int minUsageCount,
                                                        Authentication authentication) {
        log.debug("POST /api/translation-memory/cleanup - Cleaning up with min usage count: {}", minUsageCount);
        String currentUser = authentication.getName();
        translationMemoryService.cleanupTranslationMemory(minUsageCount, currentUser);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Get translation memory statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER')")
    public ResponseEntity<TranslationMemoryService.TranslationMemoryStats> getTranslationMemoryStats() {
        log.debug("GET /api/translation-memory/statistics - Getting translation memory statistics");
        TranslationMemoryService.TranslationMemoryStats stats = translationMemoryService.getTranslationMemoryStats();
        return ResponseEntity.ok(stats);
    }
}
