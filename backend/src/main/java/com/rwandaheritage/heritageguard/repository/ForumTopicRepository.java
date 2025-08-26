package com.rwandaheritage.heritageguard.repository;

import com.rwandaheritage.heritageguard.model.ForumTopic;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ForumTopicRepository extends JpaRepository<ForumTopic, Long> {

    // Find all active topics
    List<ForumTopic> findByIsActiveTrue();
    
    // Find all public and active topics
    List<ForumTopic> findByIsPublicTrueAndIsActiveTrue();
    
    // Find topics by category
    List<ForumTopic> findByCategoryIdAndIsActiveTrue(Long categoryId);
    
    // Find public topics by category
    List<ForumTopic> findByCategoryIdAndIsPublicTrueAndIsActiveTrue(Long categoryId);
    
    // Find topics by language
    List<ForumTopic> findByLanguageAndIsActiveTrue(String language);
    
    // Find public topics by language
    List<ForumTopic> findByLanguageAndIsPublicTrueAndIsActiveTrue(String language);
    
    // Find topics by creator
    List<ForumTopic> findByCreatedByAndIsActiveTrue(String createdBy);
    
    // Check if topic title exists in category
    boolean existsByTitleIgnoreCaseAndCategoryIdAndIsActiveTrue(String title, Long categoryId);
    
    // Find pinned topics
    List<ForumTopic> findByIsPinnedTrueAndIsActiveTrue();
    
    // Check if topic exists and is active
    boolean existsByIdAndIsActiveTrue(Long id);
    
    // Check if topic exists and is public
    boolean existsByIdAndIsPublicTrueAndIsActiveTrue(Long id);
    
    // Search topics by title (case-insensitive)
    @Query("SELECT t FROM ForumTopic t WHERE LOWER(t.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) AND t.isActive = true")
    List<ForumTopic> searchByTitleContainingIgnoreCase(@Param("searchTerm") String searchTerm);
    
    // Search topics by title or content (case-insensitive)
    @Query("SELECT t FROM ForumTopic t WHERE (LOWER(t.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(t.content) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND t.isActive = true")
    List<ForumTopic> searchByTitleOrContentContainingIgnoreCase(@Param("searchTerm") String searchTerm);
    
    // Count topics by category
    long countByCategoryIdAndIsActiveTrue(Long categoryId);
    
    // Find recent topics (ordered by creation date)
    List<ForumTopic> findTop10ByIsActiveTrueOrderByCreatedDateDesc();

    /**
     * Advanced search for topics with multiple filters
     */
    @Query("SELECT t FROM ForumTopic t WHERE " +
           "(:searchTerm IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(t.content) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
           "(:categoryId IS NULL OR t.category.id = :categoryId) AND " +
           "(:language IS NULL OR t.language = :language) AND " +
           "(:isPublic IS NULL OR t.isPublic = :isPublic) AND " +
           "(:isPinned IS NULL OR t.isPinned = :isPinned) AND " +
           "(:isLocked IS NULL OR t.isLocked = :isLocked) AND " +
           "(:createdBy IS NULL OR t.createdBy = :createdBy) AND " +
           "t.isActive = true " +
           "ORDER BY t.isPinned DESC, t.createdDate DESC")
    Page<ForumTopic> advancedSearch(
            @Param("searchTerm") String searchTerm,
            @Param("categoryId") Long categoryId,
            @Param("language") String language,
            @Param("isPublic") Boolean isPublic,
            @Param("isPinned") Boolean isPinned,
            @Param("isLocked") Boolean isLocked,
            @Param("createdBy") String createdBy,
            Pageable pageable);

    /**
     * Advanced search for topics (public only)
     */
    @Query("SELECT t FROM ForumTopic t WHERE " +
           "(:searchTerm IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(t.content) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
           "(:categoryId IS NULL OR t.category.id = :categoryId) AND " +
           "(:language IS NULL OR t.language = :language) AND " +
           "(:isPinned IS NULL OR t.isPinned = :isPinned) AND " +
           "(:isLocked IS NULL OR t.isLocked = :isLocked) AND " +
           "(:createdBy IS NULL OR t.createdBy = :createdBy) AND " +
           "t.isPublic = true AND t.isActive = true " +
           "ORDER BY t.isPinned DESC, t.createdDate DESC")
    Page<ForumTopic> advancedSearchPublic(
            @Param("searchTerm") String searchTerm,
            @Param("categoryId") Long categoryId,
            @Param("language") String language,
            @Param("isPinned") Boolean isPinned,
            @Param("isLocked") Boolean isLocked,
            @Param("createdBy") String createdBy,
            Pageable pageable);
    
    // Find topics by category and language
    List<ForumTopic> findByCategoryIdAndLanguageAndIsActiveTrue(Long categoryId, String language);
    
    // Find public topics by category and language
    List<ForumTopic> findByCategoryIdAndLanguageAndIsPublicTrueAndIsActiveTrue(Long categoryId, String language);
} 