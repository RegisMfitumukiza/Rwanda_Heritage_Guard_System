package com.rwandaheritage.heritageguard.repository;

import com.rwandaheritage.heritageguard.model.Translation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TranslationRepository extends JpaRepository<Translation, Long> {
    
    // Find translation by content type, content ID, field name, and language
    Optional<Translation> findByContentTypeAndContentIdAndFieldNameAndLanguageCode(
        Translation.ContentType contentType, Long contentId, String fieldName, String languageCode);
    
    // Find all translations for a specific content
    List<Translation> findByContentTypeAndContentId(Translation.ContentType contentType, Long contentId);
    
    // Find translations by content type and language
    List<Translation> findByContentTypeAndLanguageCode(Translation.ContentType contentType, String languageCode);
    
    // Find translations by content type, content ID, and field name
    List<Translation> findByContentTypeAndContentIdAndFieldName(
        Translation.ContentType contentType, Long contentId, String fieldName);
    
    // Search translations with filters
    @Query("SELECT t FROM Translation t WHERE " +
           "(:contentType IS NULL OR t.contentType = :contentType) AND " +
           "(:contentId IS NULL OR t.contentId = :contentId) AND " +
           "(:languageCode IS NULL OR t.languageCode = :languageCode) AND " +
           "(:fieldName IS NULL OR t.fieldName = :fieldName) AND " +
           "(:status IS NULL OR t.status = :status)")
    List<Translation> searchTranslations(
        @Param("contentType") Translation.ContentType contentType,
        @Param("contentId") Long contentId,
        @Param("languageCode") String languageCode,
        @Param("fieldName") String fieldName,
        @Param("status") Translation.TranslationStatus status);
    
    // Check if translation exists
    boolean existsByContentTypeAndContentIdAndFieldNameAndLanguageCode(
        Translation.ContentType contentType, Long contentId, String fieldName, String languageCode);
    
    // Find translations by status
    List<Translation> findByStatus(Translation.TranslationStatus status);
    
    // Find translations by content type and status
    List<Translation> findByContentTypeAndStatus(Translation.ContentType contentType, Translation.TranslationStatus status);
    
    // Find translations by creator
    List<Translation> findByCreatedByOrderByCreatedDateDesc(String createdBy);
    
    // Count translations by content type
    @Query("SELECT t.contentType, COUNT(t) FROM Translation t GROUP BY t.contentType")
    List<Object[]> countByContentType();
    
    // Count translations by language code
    @Query("SELECT t.languageCode, COUNT(t) FROM Translation t GROUP BY t.languageCode")
    List<Object[]> countByLanguageCode();
    
    // Count translations created after a specific date
    long countByCreatedDateAfter(java.time.LocalDateTime date);
} 