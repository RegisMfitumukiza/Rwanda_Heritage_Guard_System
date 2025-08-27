package com.rwandaheritage.heritageguard.repository;

import com.rwandaheritage.heritageguard.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    
    List<Quiz> findByIsActiveTrueAndIsPublicTrue();
    
    List<Quiz> findByIsActiveTrue();
    
    List<Quiz> findByArticleIdAndIsActiveTrueAndIsPublicTrue(Long articleId);
    
    List<Quiz> findByArticleIdAndIsActiveTrue(Long articleId);
    
    @Query("SELECT q FROM Quiz q WHERE q.isActive = true AND q.isPublic = true " +
           "AND (LOWER(q.titleEn) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(q.titleRw) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(q.titleFr) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(q.descriptionEn) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(q.descriptionRw) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(q.descriptionFr) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<Quiz> searchQuizzes(@Param("searchTerm") String searchTerm);
    
    List<Quiz> findByCreatedByAndIsActiveTrue(String createdBy);
    
    @Query("SELECT q FROM Quiz q WHERE q.isActive = true AND q.isPublic = true " +
           "AND (q.tags LIKE CONCAT('%', :tag, '%'))")
    List<Quiz> findByTag(@Param("tag") String tag);
    
    @Query("SELECT DISTINCT q FROM Quiz q WHERE q.isActive = true AND q.isPublic = true " +
           "AND q.tags IS NOT NULL AND q.tags != ''")
    List<Quiz> findAllWithTags();
    
    long countByIsPublicTrueAndIsActiveTrue();
} 