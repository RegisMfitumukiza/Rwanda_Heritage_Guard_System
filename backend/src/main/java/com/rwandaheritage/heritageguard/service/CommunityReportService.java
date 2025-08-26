package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.dto.CommunityReportDTO;
import com.rwandaheritage.heritageguard.dto.ReportSummaryDTO;
import com.rwandaheritage.heritageguard.model.CommunityReport;
import com.rwandaheritage.heritageguard.model.CommunityReport.ContentType;
import com.rwandaheritage.heritageguard.model.CommunityReport.ReportReason;
import com.rwandaheritage.heritageguard.repository.CommunityReportRepository;
import com.rwandaheritage.heritageguard.mapper.CommunityReportMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CommunityReportService {

    private final CommunityReportRepository reportRepository;

    /**
     * Get all forum reports with pagination and filtering
     */
    public List<CommunityReportDTO> getAllReports(String status, String contentType, String reason) {
        try {
            List<CommunityReport> reports;
            
            if ("resolved".equals(status)) {
                reports = reportRepository.findByIsResolvedTrueOrderByResolvedAtDesc();
            } else if ("unresolved".equals(status)) {
                reports = reportRepository.findByIsResolvedFalseOrderByReportedAtDesc();
            } else {
                reports = reportRepository.findAllByOrderByReportedAtDesc();
            }
            
            // Apply additional filters
            if (contentType != null) {
                reports = reports.stream()
                    .filter(r -> r.getContentType().name().equalsIgnoreCase(contentType))
                    .collect(Collectors.toList());
            }
            
            if (reason != null) {
                reports = reports.stream()
                    .filter(r -> r.getReportReason().name().equalsIgnoreCase(reason))
                    .collect(Collectors.toList());
            }
            
            return reports.stream()
                .map(CommunityReportMapper::toDTO)
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            log.error("Failed to get all reports", e);
            throw new RuntimeException("Failed to retrieve reports", e);
        }
    }

    /**
     * Get reports for specific content
     */
    public List<CommunityReportDTO> getReportsForContent(ContentType contentType, Long contentId) {
        try {
            List<CommunityReport> reports = reportRepository
                .findByContentTypeAndContentIdOrderByReportedAtDesc(contentType, contentId);
            
            return reports.stream()
                .map(CommunityReportMapper::toDTO)
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            log.error("Failed to get reports for content {}:{}", contentType, e);
            throw new RuntimeException("Failed to retrieve content reports", e);
        }
    }

    /**
     * Update report status
     */
    public CommunityReportDTO updateReportStatus(Long reportId, String newStatus, String resolutionAction, 
                                               String resolutionNotes, String moderatorId) {
        try {
            CommunityReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found: " + reportId));
            
            if (report.isResolved()) {
                throw new RuntimeException("Report already resolved");
            }
            
            // Update report status
            report.setResolved(true);
            report.setResolvedBy(moderatorId);
            report.setResolutionAction(resolutionAction);
            report.setResolutionNotes(resolutionNotes);
            report.setResolvedAt(LocalDateTime.now());
            
            CommunityReport savedReport = reportRepository.save(report);
            
            return CommunityReportMapper.toDTO(savedReport);
            
        } catch (Exception e) {
            log.error("Failed to update report status for report {}", reportId, e);
            throw new RuntimeException("Failed to update report status", e);
        }
    }

    /**
     * Bulk moderate reports
     */
    public Map<String, Object> bulkModerateReports(List<Long> reportIds, String action, 
                                                  String notes, String moderatorId) {
        try {
            int processedCount = 0;
            int successCount = 0;
            int failureCount = 0;
            
            for (Long reportId : reportIds) {
                try {
                    processedCount++;
                    
                    if ("RESOLVE".equals(action)) {
                        updateReportStatus(reportId, "resolved", "FLAG", notes, moderatorId);
                        successCount++;
                    } else if ("IGNORE".equals(action)) {
                        updateReportStatus(reportId, "resolved", "IGNORE", notes, moderatorId);
                        successCount++;
                    } else if ("DELETE".equals(action)) {
                        // This would trigger content deletion logic
                        updateReportStatus(reportId, "resolved", "DELETE", notes, moderatorId);
                        successCount++;
                    }
                    
                } catch (Exception e) {
                    log.error("Failed to process report {}", reportId, e);
                    failureCount++;
                }
            }
            
            return Map.of(
                "success", true,
                "message", "Bulk moderation completed",
                "processedCount", processedCount,
                "successCount", successCount,
                "failureCount", failureCount
            );
            
        } catch (Exception e) {
            log.error("Failed to perform bulk moderation", e);
            throw new RuntimeException("Failed to perform bulk moderation", e);
        }
    }

    /**
     * Get report statistics
     */
    public Map<String, Object> getReportStatistics() {
        try {
            long totalReports = reportRepository.count();
            long unresolvedReports = reportRepository.countByIsResolvedFalse();
            long resolvedReports = totalReports - unresolvedReports;
            
            // Get recent reports (last 7 days)
            LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
            long recentReports = reportRepository.countByReportedAtAfter(weekAgo);
            
            // Get reports by reason
            Map<String, Long> reportsByReason = reportRepository.findAll().stream()
                .filter(r -> !r.isResolved())
                .collect(Collectors.groupingBy(
                    r -> r.getReportReason().name(),
                    Collectors.counting()
                ));
            
            return Map.of(
                "totalReports", totalReports,
                "unresolvedReports", unresolvedReports,
                "resolvedReports", resolvedReports,
                "recentReports", recentReports,
                "reportsByReason", reportsByReason
            );
            
        } catch (Exception e) {
            log.error("Failed to get report statistics", e);
            throw new RuntimeException("Failed to retrieve report statistics", e);
        }
    }

    /**
     * Create a new report
     */
    public CommunityReportDTO createReport(CommunityReportDTO reportDTO, String reporterId) {
        try {
            // Check if user already reported this content
            if (reportRepository.existsByReporterIdAndContentTypeAndContentId(
                    reporterId, ContentType.valueOf(reportDTO.getContentType()), reportDTO.getContentId())) {
                throw new RuntimeException("You have already reported this content");
            }
            
            CommunityReport report = CommunityReportMapper.toEntity(reportDTO);
            report.setReporterId(reporterId);
            report.setReportedAt(LocalDateTime.now());
            report.setCreatedBy(reporterId);
            report.setUpdatedBy(reporterId);
            
            CommunityReport savedReport = reportRepository.save(report);
            
            log.info("New report created: {} by {} for content {}:{}", 
                    report.getReportReason(), reporterId, report.getContentType(), report.getContentId());
            
            return CommunityReportMapper.toDTO(savedReport);
            
        } catch (Exception e) {
            log.error("Failed to create report", e);
            throw new RuntimeException("Failed to create report", e);
        }
    }

    /**
     * Get high-priority reports (content with multiple reports)
     */
    public List<Map<String, Object>> getHighPriorityReports(int threshold) {
        try {
            List<Object[]> highPriorityContent = reportRepository.findContentWithHighReportCounts(threshold);
            
            return highPriorityContent.stream()
                .map(content -> Map.of(
                    "contentType", content[0],
                    "contentId", content[1],
                    "reportCount", content[2]
                ))
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            log.error("Failed to get high priority reports", e);
            throw new RuntimeException("Failed to retrieve high priority reports", e);
        }
    }
}
