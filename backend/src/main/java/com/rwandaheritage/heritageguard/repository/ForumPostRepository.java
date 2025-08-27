package com.rwandaheritage.heritageguard.repository;

import com.rwandaheritage.heritageguard.model.ForumPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ForumPostRepository extends JpaRepository<ForumPost, Long> {
    
    // Find posts by topic
    Page<ForumPost> findByTopicIdAndIsActiveTrueOrderByCreatedDateAsc(Long topicId, Pageable pageable);
    
    // Find posts by topic (simple list)
    List<ForumPost> findByTopicIdAndIsActiveTrueOrderByCreatedDateAsc(Long topicId);
    
    // Find top-level posts (no parent)
    Page<ForumPost> findByTopicIdAndParentPostIdIsNullAndIsActiveTrueOrderByCreatedDateAsc(Long topicId, Pageable pageable);
    
    // Find replies to a specific post
    List<ForumPost> findByParentPostIdAndIsActiveTrueOrderByCreatedDateAsc(Long parentPostId);
    
    // Find posts by language
    Page<ForumPost> findByLanguageAndIsActiveTrue(String language, Pageable pageable);
    
    // Find posts created by specific user
    Page<ForumPost> findByCreatedByAndIsActiveTrue(String createdBy, Pageable pageable);
    
    // Find flagged posts (for moderation)
    Page<ForumPost> findByIsFlaggedTrueAndIsActiveTrue(Pageable pageable);
    
    // Find flagged posts (simple list)
    List<ForumPost> findByIsFlaggedTrueAndIsActiveTrueOrderByCreatedDateDesc();
    
    // Find posts flagged by specific user
    Page<ForumPost> findByFlaggedByAndIsActiveTrue(String flaggedBy, Pageable pageable);
    
    // Search posts by content (case-insensitive)
    @Query("SELECT p FROM ForumPost p WHERE p.isActive = true AND " +
           "LOWER(p.content) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<ForumPost> searchPosts(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    // Search posts in specific topic
    @Query("SELECT p FROM ForumPost p WHERE p.topic.id = :topicId AND p.isActive = true AND " +
           "LOWER(p.content) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<ForumPost> searchPostsInTopic(@Param("topicId") Long topicId, 
                                      @Param("searchTerm") String searchTerm, 
                                      Pageable pageable);
    
    // Count replies for each post
    @Query("SELECT p.id, COUNT(r) FROM ForumPost p LEFT JOIN ForumPost r ON r.parentPostId = p.id " +
           "WHERE p.isActive = true GROUP BY p.id")
    List<Object[]> getPostReplyCounts();
    
    // Find posts by topic and language
    Page<ForumPost> findByTopicIdAndLanguageAndIsActiveTrue(Long topicId, String language, Pageable pageable);
    
    // Find recent posts across all topics
    @Query("SELECT p FROM ForumPost p WHERE p.isActive = true ORDER BY p.createdDate DESC")
    Page<ForumPost> findRecentPosts(Pageable pageable);
    
    // Find posts by multiple topics
    @Query("SELECT p FROM ForumPost p WHERE p.topic.id IN :topicIds AND p.isActive = true " +
           "ORDER BY p.createdDate DESC")
    Page<ForumPost> findByTopicIds(@Param("topicIds") List<Long> topicIds, Pageable pageable);
    
    // Find posts with mentions (simple text search for @username)
    @Query("SELECT p FROM ForumPost p WHERE p.isActive = true AND " +
           "p.content LIKE CONCAT('%@', :username, '%')")
    Page<ForumPost> findPostsWithMentions(@Param("username") String username, Pageable pageable);

    /**
     * Advanced search for posts with multiple filters
     */
    @Query("SELECT p FROM ForumPost p WHERE " +
           "(:searchTerm IS NULL OR LOWER(p.content) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
           "(:topicId IS NULL OR p.topic.id = :topicId) AND " +
           "(:language IS NULL OR p.language = :language) AND " +
           "(:isFlagged IS NULL OR p.isFlagged = :isFlagged) AND " +
           "(:createdBy IS NULL OR p.createdBy = :createdBy) AND " +
           "(:parentPostId IS NULL OR p.parentPostId = :parentPostId) AND " +
           "p.isActive = true " +
           "ORDER BY p.createdDate DESC")
    Page<ForumPost> advancedSearch(
            @Param("searchTerm") String searchTerm,
            @Param("topicId") Long topicId,
            @Param("language") String language,
            @Param("isFlagged") Boolean isFlagged,
            @Param("createdBy") String createdBy,
            @Param("parentPostId") Long parentPostId,
            Pageable pageable);

    /**
     * Advanced search for posts (public topics only)
     */
    @Query("SELECT p FROM ForumPost p JOIN p.topic t WHERE " +
           "(:searchTerm IS NULL OR LOWER(p.content) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
           "(:topicId IS NULL OR p.topic.id = :topicId) AND " +
           "(:language IS NULL OR p.language = :language) AND " +
           "(:isFlagged IS NULL OR p.isFlagged = :isFlagged) AND " +
           "(:createdBy IS NULL OR p.createdBy = :createdBy) AND " +
           "(:parentPostId IS NULL OR p.parentPostId = :parentPostId) AND " +
           "t.isPublic = true AND p.isActive = true " +
           "ORDER BY p.createdDate DESC")
    Page<ForumPost> advancedSearchPublic(
            @Param("searchTerm") String searchTerm,
            @Param("topicId") Long topicId,
            @Param("language") String language,
            @Param("isFlagged") Boolean isFlagged,
            @Param("createdBy") String createdBy,
            @Param("parentPostId") Long parentPostId,
            Pageable pageable);
} 