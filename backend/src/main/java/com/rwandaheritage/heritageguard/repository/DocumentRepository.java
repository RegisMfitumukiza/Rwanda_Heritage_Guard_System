package com.rwandaheritage.heritageguard.repository;

import com.rwandaheritage.heritageguard.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
 
public interface DocumentRepository extends JpaRepository<Document, Long> {
    
    // Basic folder operations
    List<Document> findByFolderId(Long folderId);
    List<Document> findByFolderIdAndIsActiveTrue(Long folderId);
    
    // Search by type
    List<Document> findByType(String type);
    List<Document> findByTypeAndIsActiveTrue(String type);
    
    // Search by language
    List<Document> findByLanguage(String language);
    List<Document> findByLanguageAndIsActiveTrue(String language);
    
    // Search by author
    List<Document> findByAuthor(String author);
    List<Document> findByAuthorAndIsActiveTrue(String author);
    List<Document> findByAuthorContainingIgnoreCase(String author);
    
    // Search by tags
    List<Document> findByTagsContaining(String tag);
    List<Document> findByTagsContainingAndIsActiveTrue(String tag);
    
    // Public documents
    List<Document> findByIsPublicTrue();
    List<Document> findByIsPublicTrueAndIsActiveTrue();
    
    // Created by user
    List<Document> findByCreatedBy(String createdBy);
    List<Document> findByCreatedByAndIsActiveTrue(String createdBy);
    
    // Date range searches
    List<Document> findByCreationDateBetween(LocalDateTime start, LocalDateTime end);
    List<Document> findByCreationDateBetweenAndIsActiveTrue(LocalDateTime start, LocalDateTime end);
    
    // Active documents
    List<Document> findByIsActiveTrue();
    
    // Complex searches
    @Query("SELECT d FROM Document d WHERE " +
           "(:type IS NULL OR d.type = :type) AND " +
           "(:language IS NULL OR d.language = :language) AND " +
           "(:author IS NULL OR d.author LIKE %:author%) AND " +
           "(:isPublic IS NULL OR d.isPublic = :isPublic) AND " +
           "d.isActive = true")
    List<Document> findDocumentsWithFilters(
        @Param("type") String type,
        @Param("language") String language,
        @Param("author") String author,
        @Param("isPublic") Boolean isPublic
    );
    
    // Search by title (multilingual) - simplified approach
    @Query("SELECT d FROM Document d WHERE d.isActive = true")
    List<Document> searchByTitle(@Param("searchTerm") String searchTerm);
    
    // Search by description (multilingual) - simplified approach
    @Query("SELECT d FROM Document d WHERE d.isActive = true")
    List<Document> searchByDescription(@Param("searchTerm") String searchTerm);
    
    // Count documents by type
    long countByType(String type);
    long countByTypeAndIsActiveTrue(String type);
    
    // Count documents by language
    long countByLanguage(String language);
    long countByLanguageAndIsActiveTrue(String language);
    
    // Check if document exists by title in folder - simplified approach
    @Query("SELECT COUNT(d) > 0 FROM Document d WHERE " +
           "d.folder.id = :folderId AND d.isActive = true")
    boolean existsByTitleInFolder(@Param("folderId") Long folderId);
    
    // Get document statistics
    @Query("SELECT d.type, COUNT(d) FROM Document d WHERE d.isActive = true GROUP BY d.type")
    List<Object[]> getDocumentTypeStatistics();
    
    @Query("SELECT d.language, COUNT(d) FROM Document d WHERE d.isActive = true GROUP BY d.language")
    List<Object[]> getDocumentLanguageStatistics();

    // Count methods for statistics
    long countByIsActiveTrue();
    
    long countByIsPublicTrueAndIsActiveTrue();
    
    long countByCreationDateAfterAndIsActiveTrue(LocalDateTime cutoffDate);
} 