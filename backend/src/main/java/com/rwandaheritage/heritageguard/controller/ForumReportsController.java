package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.dto.CommunityReportDTO;
import com.rwandaheritage.heritageguard.dto.ReportSummaryDTO;
import com.rwandaheritage.heritageguard.model.CommunityReport;
import com.rwandaheritage.heritageguard.repository.CommunityReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/forum/reports")
@RequiredArgsConstructor
@Slf4j
public class ForumReportsController {

    private final CommunityReportRepository reportRepository;

    /**
     * Get all forum reports
     * Only moderators and admins can access
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER')")
    public ResponseEntity<List<CommunityReportDTO>> getAllReports() {
        try {
            log.info("Getting all forum reports");
            List<CommunityReport> reports = reportRepository.findByIsResolvedFalseOrderByReportedAtDesc();
            
            // Convert to DTOs (we'll need to implement this mapping)
            List<CommunityReportDTO> reportDTOs = reports.stream()
                .map(report -> CommunityReportDTO.builder()
                    .id(report.getId())
                    .contentType(report.getContentType().name())
                    .contentId(report.getContentId())
                    .reporterId(report.getReporterId())
                    .reportReason(report.getReportReason().name())
                    .description(report.getDescription())
                    .isResolved(report.isResolved())
                    .resolvedBy(report.getResolvedBy())
                    .resolutionAction(report.getResolutionAction())
                    .resolutionNotes(report.getResolutionNotes())
                    .reportedAt(report.getReportedAt())
                    .resolvedAt(report.getResolvedAt())
                    .build())
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(reportDTOs);
        } catch (Exception e) {
            log.error("Failed to get forum reports", e);
            return ResponseEntity.internalServerError().body(List.of());
        }
    }

    /**
     * Update report status
     * Only moderators and admins can update
     */
    @PostMapping("/update")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER')")
    public ResponseEntity<Map<String, Object>> updateReportStatus(
            @RequestParam Long reportId,
            @RequestBody Map<String, Object> statusData,
            Authentication authentication) {
        try {
            log.info("Updating report {} status to {} by moderator {}", 
                    reportId, statusData.get("status"), authentication.getName());
            
            // Find the report
            CommunityReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found: " + reportId));
            
            if (report.isResolved()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Report already resolved"
                ));
            }
            
            // Update report status
            report.setResolved(true);
            report.setResolvedBy(authentication.getName());
            report.setResolutionAction((String) statusData.get("action"));
            report.setResolutionNotes((String) statusData.get("notes"));
            report.setResolvedAt(java.time.LocalDateTime.now());
            
            reportRepository.save(report);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Report status updated successfully",
                "reportId", reportId
            ));
        } catch (Exception e) {
            log.error("Failed to update report status", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to update report status: " + e.getMessage()
            ));
        }
    }

    /**
     * Bulk moderate reports
     * Only moderators and admins can perform bulk actions
     */
    @PostMapping("/bulk-moderate")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER')")
    public ResponseEntity<Map<String, Object>> bulkModerateReports(
            @RequestBody Map<String, Object> bulkData,
            Authentication authentication) {
        try {
            log.info("Bulk moderating {} reports by moderator {}", 
                    bulkData.get("reportIds"), authentication.getName());
            
            @SuppressWarnings("unchecked")
            List<Long> reportIds = (List<Long>) bulkData.get("reportIds");
            String action = (String) bulkData.get("action");
            String notes = (String) bulkData.get("notes");
            
            if (reportIds == null || reportIds.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "No report IDs provided"
                ));
            }
            
            int processedCount = 0;
            int successCount = 0;
            int failureCount = 0;
            
            for (Long reportId : reportIds) {
                try {
                    processedCount++;
                    
                    CommunityReport report = reportRepository.findById(reportId)
                        .orElseThrow(() -> new RuntimeException("Report not found: " + reportId));
                    
                    if (!report.isResolved()) {
                        report.setResolved(true);
                        report.setResolvedBy(authentication.getName());
                        report.setResolutionAction(action);
                        report.setResolutionNotes(notes);
                        report.setResolvedAt(java.time.LocalDateTime.now());
                        
                        reportRepository.save(report);
                        successCount++;
                    }
                    
                } catch (Exception e) {
                    log.error("Failed to process report {}", reportId, e);
                    failureCount++;
                }
            }
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Bulk moderation completed successfully",
                "processedCount", processedCount,
                "successCount", successCount,
                "failureCount", failureCount
            ));
        } catch (Exception e) {
            log.error("Failed to perform bulk moderation", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to perform bulk moderation: " + e.getMessage()
            ));
        }
    }

    /**
     * Get report statistics
     * Only moderators and admins can access
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER')")
    public ResponseEntity<Map<String, Object>> getReportStatistics() {
        try {
            log.info("Getting forum report statistics");
            
            long totalReports = reportRepository.count();
            long unresolvedReports = reportRepository.countByIsResolvedFalse();
            long resolvedReports = totalReports - unresolvedReports;
            
            // Get recent reports (last 7 days)
            java.time.LocalDateTime weekAgo = java.time.LocalDateTime.now().minusDays(7);
            long recentReports = reportRepository.countByReportedAtAfter(weekAgo);
            
            return ResponseEntity.ok(Map.of(
                "totalReports", totalReports,
                "unresolvedReports", unresolvedReports,
                "resolvedReports", resolvedReports,
                "recentReports", recentReports
            ));
        } catch (Exception e) {
            log.error("Failed to get report statistics", e);
            return ResponseEntity.internalServerError().body(Map.of());
        }
    }
}
