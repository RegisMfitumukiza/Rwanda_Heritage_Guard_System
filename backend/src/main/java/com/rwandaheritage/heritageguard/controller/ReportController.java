package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
public class ReportController {

    private final ReportService reportService;

    /**
     * Generate comprehensive report with 3 filters
     */
    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateReport(
            @RequestParam String siteStatus,
            @RequestParam String artifactAuthStatus,
            @RequestParam String mediaType
    ) {
        log.info("Admin generating report with filters - Site Status: {}, Artifact Auth: {}, Media Type: {}", 
                siteStatus, artifactAuthStatus, mediaType);

        try {
            Map<String, Object> report = reportService.generateReport(siteStatus, artifactAuthStatus, mediaType);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            log.error("Error generating report: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get available filter options
     */
    @GetMapping("/filter-options")
    public ResponseEntity<Map<String, Object>> getFilterOptions() {
        try {
            Map<String, Object> options = reportService.getFilterOptions();
            return ResponseEntity.ok(options);
        } catch (Exception e) {
            log.error("Error getting filter options: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Quick report generation with default filters
     */
    @GetMapping("/quick")
    public ResponseEntity<Map<String, Object>> generateQuickReport() {
        log.info("Admin generating quick report with default filters");
        
        try {
            Map<String, Object> report = reportService.generateReport("ACTIVE", "AUTHENTICATED", "IMAGE");
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            log.error("Error generating quick report: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}


