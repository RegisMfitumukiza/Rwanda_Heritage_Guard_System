package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.service.ReportService;
import com.rwandaheritage.heritageguard.service.ReportService.ReportFilters;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportController {

    private final ReportService reportService;

    /**
     * Generate comprehensive system report
     */
    @PostMapping("/generate")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<Map<String, Object>> generateReport(@RequestBody ReportFilters filters) {
        log.info("Admin generating system report with filters: {}", filters);
        try {
            Map<String, Object> report = reportService.generateSystemReport(filters);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            log.error("Error generating report: {}", e.getMessage());
            throw new RuntimeException("Failed to generate report: " + e.getMessage());
        }
    }

    /**
     * Generate quick report with query parameters
     */
    @GetMapping("/quick")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<Map<String, Object>> generateQuickReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) List<String> userRoles,
            @RequestParam(required = false) List<String> siteStatuses,
            @RequestParam(required = false) List<String> contentTypes) {
        
        log.info("Admin generating quick report - startDate: {}, endDate: {}, userRoles: {}", startDate, endDate, userRoles);
        
        try {
            ReportFilters filters = new ReportFilters();
            filters.setStartDate(startDate);
            filters.setEndDate(endDate);
            filters.setUserRoles(userRoles);
            filters.setSiteStatuses(siteStatuses);
            filters.setContentTypes(contentTypes);
            
            Map<String, Object> report = reportService.generateSystemReport(filters);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            log.error("Error generating quick report: {}", e.getMessage());
            throw new RuntimeException("Failed to generate quick report: " + e.getMessage());
        }
    }

    /**
     * Export report to CSV
     */
    @PostMapping("/export/csv")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<byte[]> exportReportToCSV(@RequestBody ReportFilters filters) {
        log.info("Admin exporting report to CSV with filters: {}", filters);
        
        try {
            Map<String, Object> report = reportService.generateSystemReport(filters);
            byte[] csvData = reportService.exportReportToCSV(report);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "system_report.csv");
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(csvData);
        } catch (Exception e) {
            log.error("Error exporting report to CSV: {}", e.getMessage());
            throw new RuntimeException("Failed to export report: " + e.getMessage());
        }
    }

    /**
     * Get available report types and filters
     */
    @GetMapping("/available-filters")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<Map<String, Object>> getAvailableFilters() {
        log.info("Admin requesting available report filters");
        
        Map<String, Object> availableFilters = Map.of(
            "userRoles", List.of("SYSTEM_ADMINISTRATOR", "HERITAGE_MANAGER", "CONTENT_MANAGER", "COMMUNITY_MEMBER"),
            "siteStatuses", List.of("ACTIVE", "PROPOSED", "UNDER_CONSERVATION", "INACTIVE"),
            "contentTypes", List.of("ARTIFACTS", "DOCUMENTS", "MEDIA", "ARTICLES", "QUIZZES"),
            "exportFormats", List.of("CSV", "PDF", "EXCEL"),
            "dateRange", Map.of(
                "minDate", LocalDate.now().minusYears(1),
                "maxDate", LocalDate.now()
            )
        );
        
        return ResponseEntity.ok(availableFilters);
    }

    /**
     * Get report templates
     */
    @GetMapping("/templates")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<List<Map<String, Object>>> getReportTemplates() {
        log.info("Admin requesting report templates");
        
        List<Map<String, Object>> templates = List.of(
            Map.of(
                "id", "user-summary",
                "name", "User Summary Report",
                "description", "Overview of user statistics and role distribution",
                "filters", Map.of("includeUserAnalytics", true)
            ),
            Map.of(
                "id", "heritage-overview",
                "name", "Heritage Sites Overview",
                "description", "Comprehensive heritage site statistics and status",
                "filters", Map.of("includeHeritageAnalytics", true)
            ),
            Map.of(
                "id", "content-analysis",
                "name", "Content Analysis Report",
                "description", "Content statistics and distribution analysis",
                "filters", Map.of("includeContentAnalytics", true)
            ),
            Map.of(
                "id", "security-audit",
                "name", "Security Audit Report",
                "description", "Security status and account lockout information",
                "filters", Map.of("includeSecurityAnalytics", true)
            ),
            Map.of(
                "id", "comprehensive",
                "name", "Comprehensive System Report",
                "description", "Complete system overview with all analytics",
                "filters", Map.of("includeAllAnalytics", true)
            )
        );
        
        return ResponseEntity.ok(templates);
    }

    /**
     * Generate report from template
     */
    @PostMapping("/templates/{templateId}")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<Map<String, Object>> generateReportFromTemplate(
            @PathVariable String templateId,
            @RequestBody(required = false) ReportFilters additionalFilters) {
        
        log.info("Admin generating report from template: {} with additional filters: {}", templateId, additionalFilters);
        
        try {
            // Create base filters based on template
            ReportFilters filters = createFiltersFromTemplate(templateId);
            
            // Merge with additional filters if provided
            if (additionalFilters != null) {
                if (additionalFilters.getStartDate() != null) filters.setStartDate(additionalFilters.getStartDate());
                if (additionalFilters.getEndDate() != null) filters.setEndDate(additionalFilters.getEndDate());
                if (additionalFilters.getUserRoles() != null) filters.setUserRoles(additionalFilters.getUserRoles());
                if (additionalFilters.getSiteStatuses() != null) filters.setSiteStatuses(additionalFilters.getSiteStatuses());
                if (additionalFilters.getContentTypes() != null) filters.setContentTypes(additionalFilters.getContentTypes());
            }
            
            Map<String, Object> report = reportService.generateSystemReport(filters);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            log.error("Error generating report from template: {}", e.getMessage());
            throw new RuntimeException("Failed to generate report from template: " + e.getMessage());
        }
    }

    /**
     * Create filters based on template ID
     */
    private ReportFilters createFiltersFromTemplate(String templateId) {
        ReportFilters filters = new ReportFilters();
        
        switch (templateId) {
            case "user-summary":
                // User summary specific filters
                break;
            case "heritage-overview":
                // Heritage specific filters
                break;
            case "content-analysis":
                // Content specific filters
                break;
            case "security-audit":
                // Security specific filters
                break;
            case "comprehensive":
            default:
                // Comprehensive report - include all
                break;
        }
        
        return filters;
    }
}


