package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.dto.CommunityReportDTO;
import com.rwandaheritage.heritageguard.service.CommunityReportService;
import com.rwandaheritage.heritageguard.service.CommunityModerationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/community-reports")
@RequiredArgsConstructor
@Slf4j
public class CommunityReportController {

    private final CommunityReportService communityReportService;
    private final CommunityModerationService communityModerationService;

    /**
     * Get all community reports with optional filtering
     */
    @GetMapping
    @PreAuthorize("hasRole('CONTENT_MANAGER') or hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<List<CommunityReportDTO>> getAllReports(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String contentType,
            @RequestParam(required = false) String reason) {
        
        log.info("Fetching community reports with filters - status: {}, contentType: {}, reason: {}", 
                status, contentType, reason);
        
        try {
            List<CommunityReportDTO> reports = communityReportService.getAllReports(status, contentType, reason);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            log.error("Failed to fetch community reports", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get reports by status
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('CONTENT_MANAGER') or hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<List<CommunityReportDTO>> getReportsByStatus(@PathVariable String status) {
        log.info("Fetching community reports by status: {}", status);
        
        try {
            List<CommunityReportDTO> reports = communityReportService.getAllReports(status, null, null);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            log.error("Failed to fetch reports by status: {}", status, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get reports by content type
     */
    @GetMapping("/type/{contentType}")
    @PreAuthorize("hasRole('CONTENT_MANAGER') or hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<List<CommunityReportDTO>> getReportsByType(@PathVariable String contentType) {
        log.info("Fetching community reports by content type: {}", contentType);
        
        try {
            List<CommunityReportDTO> reports = communityReportService.getAllReports(null, contentType, null);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            log.error("Failed to fetch reports by content type: {}", contentType, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Update report status
     */
    @PutMapping("/{reportId}/status")
    @PreAuthorize("hasRole('CONTENT_MANAGER') or hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<CommunityReportDTO> updateReportStatus(
            @PathVariable Long reportId,
            @RequestBody Map<String, String> request) {
        
        String status = request.get("status");
        String resolutionAction = request.get("resolutionAction");
        String resolutionNotes = request.get("resolutionNotes");
        
        log.info("Updating report {} status to: {}, action: {}", reportId, status, resolutionAction);
        
        try {
            CommunityReportDTO updatedReport = communityReportService.updateReportStatus(
                reportId, status, resolutionAction, resolutionNotes, "current_user"); // TODO: Get actual user
            
            return ResponseEntity.ok(updatedReport);
        } catch (Exception e) {
            log.error("Failed to update report status: {}", reportId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get report by ID
     */
    @GetMapping("/{reportId}")
    @PreAuthorize("hasRole('CONTENT_MANAGER') or hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<CommunityReportDTO> getReportById(@PathVariable Long reportId) {
        log.info("Fetching community report: {}", reportId);
        
        try {
            // This would need to be implemented in the service
            // For now, return a placeholder
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Failed to fetch report: {}", reportId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
