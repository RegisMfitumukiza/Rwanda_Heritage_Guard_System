package com.rwandaheritage.heritageguard.repository;

import com.rwandaheritage.heritageguard.model.ForumCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ForumCategoryRepository extends JpaRepository<ForumCategory, Long> {
    
    // Find all active categories
    List<ForumCategory> findByIsActiveTrue();
    
    // Find all public and active categories
    List<ForumCategory> findByIsPublicTrueAndIsActiveTrue();
    
    // Find categories by language
    List<ForumCategory> findByLanguageAndIsActiveTrue(String language);
    
    // Find public categories by language
    List<ForumCategory> findByLanguageAndIsPublicTrueAndIsActiveTrue(String language);
    
    // Find category by name (case-insensitive)
    Optional<ForumCategory> findByNameIgnoreCaseAndIsActiveTrue(String name);
    
    // Check if category name exists (for validation)
    boolean existsByNameIgnoreCaseAndIsActiveTrue(String name);
    
    // Find categories created by specific user
    List<ForumCategory> findByCreatedByAndIsActiveTrue(String createdBy);
    
    // Search categories by name or description (case-insensitive)
    @Query("SELECT c FROM ForumCategory c WHERE c.isActive = true AND " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<ForumCategory> searchCategories(@Param("searchTerm") String searchTerm);
    
    // Count topics in each category
    @Query("SELECT c.id, COUNT(t) FROM ForumCategory c LEFT JOIN ForumTopic t ON t.category.id = c.id " +
           "WHERE c.isActive = true GROUP BY c.id")
    List<Object[]> getCategoryTopicCounts();
} 