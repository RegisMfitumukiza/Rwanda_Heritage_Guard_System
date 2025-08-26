package com.rwandaheritage.heritageguard.repository;

import com.rwandaheritage.heritageguard.model.EducationalArticle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EducationalArticleRepository extends JpaRepository<EducationalArticle, Long> {
    
    List<EducationalArticle> findByIsActiveTrueAndIsPublicTrue();
    
    List<EducationalArticle> findByIsActiveTrue();
    
    List<EducationalArticle> findByCategoryAndIsActiveTrueAndIsPublicTrue(String category);
    
    List<EducationalArticle> findByDifficultyLevelAndIsActiveTrueAndIsPublicTrue(String difficultyLevel);
    
    @Query("SELECT ea FROM EducationalArticle ea WHERE ea.isActive = true AND ea.isPublic = true " +
           "AND (LOWER(ea.titleEn) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(ea.titleRw) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(ea.titleFr) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(ea.contentEn) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(ea.contentRw) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(ea.contentFr) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<EducationalArticle> searchArticles(@Param("searchTerm") String searchTerm);

    @Query("SELECT ea FROM EducationalArticle ea WHERE ea.isActive = true " +
           "AND (LOWER(ea.titleEn) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(ea.titleRw) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(ea.titleFr) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(ea.contentEn) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(ea.contentRw) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(ea.contentFr) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<EducationalArticle> searchArticlesIncludingPrivate(@Param("searchTerm") String searchTerm);
    
    List<EducationalArticle> findByCreatedByAndIsActiveTrue(String createdBy);

    // Statistics methods
    long countByIsActiveTrue();
    
    long countByIsActiveTrueAndIsPublicTrue();

    long countByCreatedDateAfterAndIsActiveTrue(LocalDateTime cutoffDate);
}
