package com.rwandaheritage.heritageguard.repository;

import com.rwandaheritage.heritageguard.model.ModerationHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ModerationHistoryRepository extends JpaRepository<ModerationHistory, Long> {

    // Find moderation history by moderator
    Page<ModerationHistory> findByModeratorIdOrderByCreatedDateDesc(String moderatorId, Pageable pageable);
    
    // Find moderation history by content type and content ID
    List<ModerationHistory> findByContentTypeAndContentIdOrderByCreatedDateDesc(String contentType, Long contentId);
    
    // Find moderation history by action type
    Page<ModerationHistory> findByActionTypeOrderByCreatedDateDesc(String actionType, Pageable pageable);
    
    // Find automated moderation actions
    Page<ModerationHistory> findByAutomatedTrueOrderByCreatedDateDesc(Pageable pageable);
    
    // Find bulk actions
    Page<ModerationHistory> findByBulkActionIdIsNotNullOrderByCreatedDateDesc(Pageable pageable);
    
    // Find moderation history by date range
    @Query("SELECT mh FROM ModerationHistory mh WHERE mh.createdDate BETWEEN :startDate AND :endDate ORDER BY mh.createdDate DESC")
    List<ModerationHistory> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Find moderation history by moderator and date range
    @Query("SELECT mh FROM ModerationHistory mh WHERE mh.moderatorId = :moderatorId AND mh.createdDate BETWEEN :startDate AND :endDate ORDER BY mh.createdDate DESC")
    List<ModerationHistory> findByModeratorAndDateRange(@Param("moderatorId") String moderatorId, 
                                                       @Param("startDate") LocalDateTime startDate, 
                                                       @Param("endDate") LocalDateTime endDate);
    
    // Count moderation actions by type
    @Query("SELECT mh.actionType, COUNT(mh) FROM ModerationHistory mh WHERE mh.createdDate >= :since GROUP BY mh.actionType")
    List<Object[]> countActionsByTypeSince(@Param("since") LocalDateTime since);
    
    // Count automated vs manual actions
    @Query("SELECT mh.automated, COUNT(mh) FROM ModerationHistory mh WHERE mh.createdDate >= :since GROUP BY mh.automated")
    List<Object[]> countAutomatedVsManualSince(@Param("since") LocalDateTime since);
    
    // Find bulk actions by ID
    List<ModerationHistory> findByBulkActionIdOrderByCreatedDateDesc(String bulkActionId);
    
    // Find high-confidence automated actions
    @Query("SELECT mh FROM ModerationHistory mh WHERE mh.automated = true AND mh.confidenceScore >= :minConfidence ORDER BY mh.createdDate DESC")
    List<ModerationHistory> findHighConfidenceAutomatedActions(@Param("minConfidence") Double minConfidence);
}