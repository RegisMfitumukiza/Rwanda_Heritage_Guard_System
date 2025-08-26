package com.rwandaheritage.heritageguard.repository;

import com.rwandaheritage.heritageguard.model.CommunityReport;
import com.rwandaheritage.heritageguard.model.CommunityReport.ContentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommunityReportRepository extends JpaRepository<CommunityReport, Long> {
    
    // Find reports by content
    List<CommunityReport> findByContentTypeAndContentIdOrderByReportedAtDesc(ContentType contentType, Long contentId);
    
    // Find unresolved reports by content
    List<CommunityReport> findByContentTypeAndContentIdAndIsResolvedFalseOrderByReportedAtDesc(ContentType contentType, Long contentId);
    
    // Find unresolved reports by content (for automated actions)
    List<CommunityReport> findByContentTypeAndContentIdAndIsResolvedFalse(ContentType contentType, Long contentId);
    
    // Check if user has already reported this content
    boolean existsByReporterIdAndContentTypeAndContentId(String reporterId, ContentType contentType, Long contentId);
    
    // Find all unresolved reports
    List<CommunityReport> findByIsResolvedFalseOrderByReportedAtDesc();
    
    // Find reports by reporter
    List<CommunityReport> findByReporterIdOrderByReportedAtDesc(String reporterId);
    
    // Count reports by content
    long countByContentTypeAndContentIdAndIsResolvedFalse(ContentType contentType, Long contentId);
    
    // Count unresolved reports
    long countByIsResolvedFalse();
    
    // Get content with high report counts (for automated actions)
    @Query("SELECT cr.contentType, cr.contentId, COUNT(cr) as reportCount " +
           "FROM CommunityReport cr " +
           "WHERE cr.isResolved = false " +
           "GROUP BY cr.contentType, cr.contentId " +
           "HAVING COUNT(cr) >= :threshold " +
           "ORDER BY reportCount DESC")
    List<Object[]> findContentWithHighReportCounts(@Param("threshold") int threshold);
    
    // Get report summary for specific content
    @Query("SELECT cr.reportReason, COUNT(cr) " +
           "FROM CommunityReport cr " +
           "WHERE cr.contentType = :contentType AND cr.contentId = :contentId AND cr.isResolved = false " +
           "GROUP BY cr.reportReason")
    List<Object[]> getReportSummaryByReason(@Param("contentType") ContentType contentType, @Param("contentId") Long contentId);
    
    // Find reports resolved by specific moderator
    List<CommunityReport> findByResolvedByOrderByResolvedAtDesc(String resolvedBy);
    
    // Find reports by reason
    List<CommunityReport> findByReportReasonOrderByReportedAtDesc(CommunityReport.ReportReason reportReason);
    
    // Count reports by date range
    long countByReportedAtAfter(java.time.LocalDateTime date);
    
    // Find resolved reports by date
    List<CommunityReport> findByIsResolvedTrueOrderByResolvedAtDesc();
    
    // Find all reports by date
    List<CommunityReport> findAllByOrderByReportedAtDesc();
} 