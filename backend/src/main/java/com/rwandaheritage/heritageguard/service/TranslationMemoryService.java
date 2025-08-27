package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.dto.TranslationMemoryDTO;
import com.rwandaheritage.heritageguard.mapper.TranslationMemoryMapper;
import com.rwandaheritage.heritageguard.model.TranslationMemory;
import com.rwandaheritage.heritageguard.repository.TranslationMemoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TranslationMemoryService {
    
    private final TranslationMemoryRepository translationMemoryRepository;
    
    /**
     * Add translation to memory
     */
    @Transactional
    public TranslationMemoryDTO addToMemory(TranslationMemoryDTO memoryDTO, String currentUser) {
        log.debug("Adding translation to memory: {} -> {}", memoryDTO.getSourceText(), memoryDTO.getTargetText());
        
        // Check if similar translation already exists
        Optional<TranslationMemory> existingMemory = translationMemoryRepository
                .findBySourceTextAndSourceLanguageAndTargetLanguage(
                        memoryDTO.getSourceText(), 
                        memoryDTO.getSourceLanguage(),
                        memoryDTO.getTargetLanguage());
        
        TranslationMemory memory;
        if (existingMemory.isPresent()) {
            // Update existing memory entry
            memory = existingMemory.get();
            memory.setTargetText(memoryDTO.getTargetText());
            memory.setContext(memoryDTO.getContext());
            memory.setUsageCount(memory.getUsageCount() + 1);
            memory.setUpdatedDate(LocalDateTime.now());
            log.debug("Updating existing translation memory");
        } else {
            // Create new memory entry
            memory = TranslationMemoryMapper.toEntity(memoryDTO);
            memory.setUsageCount(1);
            memory.setCreatedBy(currentUser);
            memory.setCreatedDate(LocalDateTime.now());
            memory.setUpdatedDate(LocalDateTime.now());
            log.debug("Creating new translation memory");
        }
        
        TranslationMemory savedMemory = translationMemoryRepository.save(memory);
        log.info("Added translation to memory: {} -> {} by user: {}", 
                savedMemory.getSourceText(), savedMemory.getTargetText(), currentUser);
        
        return TranslationMemoryMapper.toDTO(savedMemory);
    }
    
    /**
     * Find translation suggestions from memory
     */
    @Transactional(readOnly = true)
    public List<TranslationMemoryDTO> findSuggestions(String sourceText, String sourceLanguage, String targetLanguage) {
        log.debug("Finding translation suggestions for: {} ({} -> {})", sourceText, sourceLanguage, targetLanguage);
        
        List<TranslationMemory> suggestions = translationMemoryRepository
                .searchTranslationMemory(sourceText, sourceLanguage, targetLanguage);
        
        return suggestions.stream()
                .map(TranslationMemoryMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Find exact match in translation memory
     */
    @Transactional(readOnly = true)
    public Optional<TranslationMemoryDTO> findExactMatch(String sourceText, String sourceLanguage, String targetLanguage) {
        log.debug("Finding exact match for: {} ({} -> {})", sourceText, sourceLanguage, targetLanguage);
        
        Optional<TranslationMemory> memory = translationMemoryRepository
                .findBySourceTextAndSourceLanguageAndTargetLanguage(sourceText, sourceLanguage, targetLanguage);
        
        return memory.map(TranslationMemoryMapper::toDTO);
    }
    
    /**
     * Get all translation memory entries
     */
    @Transactional(readOnly = true)
    public List<TranslationMemoryDTO> getAllTranslationMemory() {
        log.debug("Fetching all translation memory entries");
        
        List<TranslationMemory> memoryEntries = translationMemoryRepository.findAll();
        return memoryEntries.stream()
                .map(TranslationMemoryMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Get translation memory by language pair
     */
    @Transactional(readOnly = true)
    public List<TranslationMemoryDTO> getByLanguagePair(String sourceLanguage, String targetLanguage) {
        log.debug("Fetching translation memory for language pair: {} -> {}", sourceLanguage, targetLanguage);
        
        List<TranslationMemory> memoryEntries = translationMemoryRepository
                .findBySourceLanguageAndTargetLanguage(sourceLanguage, targetLanguage);
        
        return memoryEntries.stream()
                .map(TranslationMemoryMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Search translation memory
     */
    @Transactional(readOnly = true)
    public List<TranslationMemoryDTO> searchTranslationMemory(String searchTerm, String sourceLanguage, String targetLanguage) {
        log.debug("Searching translation memory for: {} ({} -> {})", searchTerm, sourceLanguage, targetLanguage);
        
        List<TranslationMemory> memoryEntries = translationMemoryRepository
                .searchTranslationMemory(searchTerm, sourceLanguage, targetLanguage);
        
        return memoryEntries.stream()
                .map(TranslationMemoryMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Get most frequently used translations
     */
    @Transactional(readOnly = true)
    public List<TranslationMemoryDTO> getMostUsedTranslations(String sourceLanguage, String targetLanguage, int limit) {
        log.debug("Fetching most used translations for {} -> {} (limit: {})", sourceLanguage, targetLanguage, limit);
        
        List<TranslationMemory> memoryEntries = translationMemoryRepository
                .findBySourceLanguageAndTargetLanguageOrderByUsageCountDesc(sourceLanguage, targetLanguage);
        
        // Apply limit manually since JPA doesn't support limit in method name
        if (memoryEntries.size() > limit) {
            memoryEntries = memoryEntries.subList(0, limit);
        }
        
        return memoryEntries.stream()
                .map(TranslationMemoryMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Update translation memory usage count
     */
    @Transactional
    public TranslationMemoryDTO incrementUsageCount(Long id, String currentUser) {
        log.debug("Incrementing usage count for translation memory ID: {}", id);
        
        TranslationMemory memory = translationMemoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Translation memory not found with ID: " + id));
        
        memory.setUsageCount(memory.getUsageCount() + 1);
        memory.setUpdatedDate(LocalDateTime.now());
        
        TranslationMemory savedMemory = translationMemoryRepository.save(memory);
        log.info("Incremented usage count for translation memory: {} (new count: {}) by user: {}", 
                savedMemory.getId(), savedMemory.getUsageCount(), currentUser);
        
        return TranslationMemoryMapper.toDTO(savedMemory);
    }
    
    /**
     * Delete translation memory entry
     */
    @Transactional
    public void deleteTranslationMemory(Long id, String currentUser) {
        log.debug("Deleting translation memory with ID: {}", id);
        
        TranslationMemory memory = translationMemoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Translation memory not found with ID: " + id));
        
        translationMemoryRepository.delete(memory);
        log.info("Deleted translation memory: {} by user: {}", id, currentUser);
    }
    
    /**
     * Clean up old or unused translation memory entries
     */
    @Transactional
    public void cleanupTranslationMemory(int minUsageCount, String currentUser) {
        log.debug("Cleaning up translation memory with usage count < {}", minUsageCount);
        
        List<TranslationMemory> oldEntries = translationMemoryRepository
                .findByUsageCountLessThan(minUsageCount);
        
        translationMemoryRepository.deleteAll(oldEntries);
        log.info("Cleaned up {} old translation memory entries by user: {}", oldEntries.size(), currentUser);
    }
    
    /**
     * Get translation memory statistics
     */
    @Transactional(readOnly = true)
    public TranslationMemoryStats getTranslationMemoryStats() {
        log.debug("Getting translation memory statistics");
        
        long totalEntries = translationMemoryRepository.count();
        long totalUsageCount = translationMemoryRepository.getTotalUsageCount();
        List<Object[]> languagePairStats = translationMemoryRepository.getLanguagePairStats();
        
        return TranslationMemoryStats.builder()
                .totalEntries(totalEntries)
                .totalUsageCount(totalUsageCount)
                .languagePairStats(languagePairStats)
                .build();
    }
    
    /**
     * Statistics DTO for translation memory
     */
    public static class TranslationMemoryStats {
        private final long totalEntries;
        private final long totalUsageCount;
        private final List<Object[]> languagePairStats;
        
        public TranslationMemoryStats(long totalEntries, long totalUsageCount, List<Object[]> languagePairStats) {
            this.totalEntries = totalEntries;
            this.totalUsageCount = totalUsageCount;
            this.languagePairStats = languagePairStats;
        }
        
        public long getTotalEntries() { return totalEntries; }
        public long getTotalUsageCount() { return totalUsageCount; }
        public List<Object[]> getLanguagePairStats() { return languagePairStats; }
        
        public static Builder builder() {
            return new Builder();
        }
        
        public static class Builder {
            private long totalEntries;
            private long totalUsageCount;
            private List<Object[]> languagePairStats;
            
            public Builder totalEntries(long totalEntries) {
                this.totalEntries = totalEntries;
                return this;
            }
            
            public Builder totalUsageCount(long totalUsageCount) {
                this.totalUsageCount = totalUsageCount;
                return this;
            }
            
            public Builder languagePairStats(List<Object[]> languagePairStats) {
                this.languagePairStats = languagePairStats;
                return this;
            }
            
            public TranslationMemoryStats build() {
                return new TranslationMemoryStats(totalEntries, totalUsageCount, languagePairStats);
            }
        }
    }
}
