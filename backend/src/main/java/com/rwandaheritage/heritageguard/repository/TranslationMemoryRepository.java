package com.rwandaheritage.heritageguard.repository;

import com.rwandaheritage.heritageguard.model.TranslationMemory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TranslationMemoryRepository extends JpaRepository<TranslationMemory, Long> {
    
    // Find translation memory by source text and language pair
    Optional<TranslationMemory> findBySourceTextAndSourceLanguageAndTargetLanguage(
        String sourceText, String sourceLanguage, String targetLanguage);
    
    // Find translation memory by source text (fuzzy search)
    List<TranslationMemory> findBySourceTextContainingIgnoreCase(String sourceText);
    
    // Find translation memory by language pair
    List<TranslationMemory> findBySourceLanguageAndTargetLanguage(String sourceLanguage, String targetLanguage);
    
    // Find translation memory by context
    List<TranslationMemory> findByContextContainingIgnoreCase(String context);
    
    // Find most used translations
    List<TranslationMemory> findBySourceLanguageAndTargetLanguageOrderByUsageCountDesc(
        String sourceLanguage, String targetLanguage);
    
    // Custom query to search translation memory with similarity
    @Query("SELECT tm FROM TranslationMemory tm WHERE " +
           "tm.sourceLanguage = :sourceLanguage AND " +
           "tm.targetLanguage = :targetLanguage AND " +
           "(LOWER(tm.sourceText) LIKE LOWER(CONCAT('%', :sourceText, '%')) OR " +
           "LOWER(tm.context) LIKE LOWER(CONCAT('%', :sourceText, '%'))) " +
           "ORDER BY tm.usageCount DESC, tm.updatedDate DESC")
    List<TranslationMemory> searchTranslationMemory(
        @Param("sourceText") String sourceText,
        @Param("sourceLanguage") String sourceLanguage,
        @Param("targetLanguage") String targetLanguage);
    
    // Check if translation memory exists
    boolean existsBySourceTextAndSourceLanguageAndTargetLanguage(
        String sourceText, String sourceLanguage, String targetLanguage);
    
    // Find translation memory by usage count threshold
    List<TranslationMemory> findByUsageCountGreaterThanEqual(int minUsageCount);
    
    // Find translation memory by usage count less than threshold
    List<TranslationMemory> findByUsageCountLessThan(int maxUsageCount);
    
    // Get total usage count
    @Query("SELECT SUM(tm.usageCount) FROM TranslationMemory tm")
    Long getTotalUsageCount();
    
    // Get language pair statistics
    @Query("SELECT tm.sourceLanguage, tm.targetLanguage, COUNT(tm), SUM(tm.usageCount) " +
           "FROM TranslationMemory tm GROUP BY tm.sourceLanguage, tm.targetLanguage")
    List<Object[]> getLanguagePairStats();
} 