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
     * Get available filter options for frontend
     */
    @GetMapping("/available-filters")
    public ResponseEntity<Map<String, Object>> getAvailableFilters() {
        try {
            Map<String, Object> options = reportService.getAvailableFilters();
            return ResponseEntity.ok(options);
        } catch (Exception e) {
            log.error("Error getting available filters: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get report templates
     */
    @GetMapping("/templates")
    public ResponseEntity<Map<String, Object>> getReportTemplates() {
        try {
            Map<String, Object> templates = reportService.getReportTemplates();
            return ResponseEntity.ok(templates);
        } catch (Exception e) {
            log.error("Error getting report templates: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Generate report from template
     */
    @PostMapping("/templates/{templateId}")
    public ResponseEntity<Map<String, Object>> generateFromTemplate(
            @PathVariable String templateId,
            @RequestBody Map<String, Object> filters
    ) {
        log.info("Admin generating report from template: {} with filters: {}", templateId, filters);
        
        try {
            Map<String, Object> report = reportService.generateFromTemplate(templateId, filters);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            log.error("Error generating report from template: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Generate PDF report - MAIN endpoint for report generation
     */
    @PostMapping("/generate-pdf")
    public ResponseEntity<byte[]> generatePdfReport(@RequestBody Map<String, Object> filters) {
        log.info("Admin generating PDF report with filters: {}", filters);
        
        try {
            // Validate filters
            if (filters == null) {
                log.error("Filters are null");
                return ResponseEntity.badRequest()
                        .header("Content-Type", "text/plain")
                        .body("Filters cannot be null".getBytes());
            }
            
            // Generate the report data
            log.info("Calling reportService.generateReport...");
            Map<String, Object> report = reportService.generateReport(
                (String) filters.getOrDefault("siteStatus", "ACTIVE"),
                (String) filters.getOrDefault("artifactAuthStatus", "AUTHENTICATED"),
                (String) filters.getOrDefault("mediaType", "IMAGE")
            );
            
            if (report == null) {
                log.error("Report data is null");
                return ResponseEntity.status(500)
                        .header("Content-Type", "text/plain")
                        .body("Failed to generate report data".getBytes());
            }
            
            log.info("Report data generated successfully, creating PDF...");
            log.info("Report data keys: {}", report.keySet());
            
            // Generate PDF from the report data
            log.info("Calling reportService.generatePdfReport...");
            byte[] pdfBytes = reportService.generatePdfReport(report);
            
            if (pdfBytes == null || pdfBytes.length == 0) {
                log.error("PDF bytes are null or empty");
                return ResponseEntity.status(500)
                        .header("Content-Type", "text/plain")
                        .body("Failed to generate PDF bytes".getBytes());
            }
            
            log.info("PDF generated successfully, size: {} bytes", pdfBytes.length);
            
            return ResponseEntity.ok()
                    .header("Content-Type", "application/pdf")
                    .header("Content-Disposition", "attachment; filename=\"heritage_report.pdf\"")
                    .body(pdfBytes);
                    
        } catch (Exception e) {
            log.error("Critical error generating PDF report: {}", e.getMessage(), e);
            // Return detailed error for debugging
            return ResponseEntity.status(500)
                    .header("Content-Type", "text/plain")
                    .body(("PDF Generation Failed: " + e.getMessage()).getBytes());
        }
    }
}


