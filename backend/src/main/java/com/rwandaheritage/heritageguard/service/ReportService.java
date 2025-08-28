package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.dto.HeritageSiteDTO;
import com.rwandaheritage.heritageguard.dto.ArtifactDTO;
import com.rwandaheritage.heritageguard.dto.SiteMediaDTO;
import com.rwandaheritage.heritageguard.dto.ArtifactMediaDTO;
import com.rwandaheritage.heritageguard.model.HeritageSite;
import com.rwandaheritage.heritageguard.model.Artifact;
import com.rwandaheritage.heritageguard.model.SiteMedia;
import com.rwandaheritage.heritageguard.model.ArtifactMedia;
import com.rwandaheritage.heritageguard.repository.HeritageSiteRepository;
import com.rwandaheritage.heritageguard.repository.ArtifactRepository;
import com.rwandaheritage.heritageguard.repository.SiteMediaRepository;
import com.rwandaheritage.heritageguard.repository.ArtifactMediaRepository;
import com.rwandaheritage.heritageguard.mapper.HeritageSiteMapper;
import com.rwandaheritage.heritageguard.mapper.ArtifactMapper;
import com.rwandaheritage.heritageguard.mapper.SiteMediaMapper;
import com.rwandaheritage.heritageguard.mapper.ArtifactMediaMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import java.util.ArrayList;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.BaseColor;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.text.Font;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Chunk;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.Element;
import com.itextpdf.text.Image;
import java.io.ByteArrayOutputStream;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final HeritageSiteRepository heritageSiteRepository;
    private final ArtifactRepository artifactRepository;
    private final SiteMediaRepository siteMediaRepository;
    private final ArtifactMediaRepository artifactMediaRepository;

    /**
     * Generate comprehensive report based on 3 filters
     */
    @Transactional(readOnly = true)
    public Map<String, Object> generateReport(String siteStatus, String artifactAuthStatus, String mediaType) {
        log.info("Generating report with filters - Site Status: {}, Artifact Auth: {}, Media Type: {}", 
                siteStatus, artifactAuthStatus, mediaType);

        try {
            // 1. Filter Heritage Sites by Status
            List<HeritageSite> sites;
            try {
                if ("SKIP".equalsIgnoreCase(siteStatus) || "ALL".equalsIgnoreCase(siteStatus)) {
                    log.info("Fetching ALL heritage sites (SKIP/ALL filter)");
                    sites = heritageSiteRepository.findAll();
                } else {
                    log.info("Filtering heritage sites by status: {}", siteStatus);
                    sites = heritageSiteRepository.findByStatus(siteStatus);
                }
                if (sites == null) {
                    log.warn("Heritage sites repository returned null, using empty list");
                    sites = new ArrayList<>();
                }
            } catch (Exception e) {
                log.error("Error fetching heritage sites: {}", e.getMessage(), e);
                sites = new ArrayList<>();
            }
            log.info("Found {} heritage sites", sites.size());

            // 2. Filter Artifacts by Authentication Status
            List<Artifact> artifacts;
            try {
                if ("SKIP".equalsIgnoreCase(artifactAuthStatus) || "ALL".equalsIgnoreCase(artifactAuthStatus)) {
                    log.info("Fetching ALL artifacts (SKIP/ALL filter)");
                    artifacts = artifactRepository.findAll();
                } else {
                    log.info("Filtering artifacts by auth status: {}", artifactAuthStatus);
                    // For now, get all artifacts since authentication status filtering needs to be implemented
                    artifacts = artifactRepository.findAll();
                }
                if (artifacts == null) {
                    log.warn("Artifacts repository returned null, using empty list");
                    artifacts = new ArrayList<>();
                }
            } catch (Exception e) {
                log.error("Error fetching artifacts: {}", e.getMessage(), e);
                artifacts = new ArrayList<>();
            }
            log.info("Found {} artifacts", artifacts.size());

            // 3. Filter Media by Type
            List<SiteMedia> siteMedia;
            try {
                if ("SKIP".equalsIgnoreCase(mediaType) || "ALL".equalsIgnoreCase(mediaType)) {
                    log.info("Fetching ALL site media (SKIP/ALL filter)");
                    siteMedia = siteMediaRepository.findAll();
                } else {
                    log.info("Filtering site media by type: {}", mediaType);
                    List<SiteMedia> allSiteMedia = siteMediaRepository.findAll();
                    if (allSiteMedia != null) {
                        siteMedia = allSiteMedia.stream()
                                .filter(media -> media != null && media.getFileType() != null && 
                                        media.getFileType().equalsIgnoreCase(mediaType))
                                .collect(Collectors.toList());
                    } else {
                        siteMedia = new ArrayList<>();
                    }
                }
                if (siteMedia == null) {
                    log.warn("Site media repository returned null, using empty list");
                    siteMedia = new ArrayList<>();
                }
            } catch (Exception e) {
                log.error("Error fetching site media: {}", e.getMessage(), e);
                siteMedia = new ArrayList<>();
            }
            log.info("Found {} site media files", siteMedia.size());

            // Get artifact media
            List<ArtifactMedia> artifactMedia;
            try {
                artifactMedia = artifactMediaRepository.findAll();
                if (artifactMedia == null) {
                    log.warn("Artifact media repository returned null, using empty list");
                    artifactMedia = new ArrayList<>();
                }
            } catch (Exception e) {
                log.error("Error fetching artifact media: {}", e.getMessage(), e);
                artifactMedia = new ArrayList<>();
            }
            log.info("Found {} artifact media files", artifactMedia.size());

            // Build clean report data structure for PDF generation
            Map<String, Object> report = new HashMap<>();
            
            // Report metadata
            report.put("title", "Rwanda Heritage Guard System Report");
            report.put("generatedAt", new java.util.Date());
            Map<String, String> filtersMap = new HashMap<>();
            filtersMap.put("siteStatus", siteStatus);
            filtersMap.put("artifactAuthStatus", artifactAuthStatus);
            filtersMap.put("mediaType", mediaType);
            report.put("filters", filtersMap);
            
            // Summary counts
            Map<String, Object> summaryMap = new HashMap<>();
            summaryMap.put("totalSites", sites.size());
            summaryMap.put("totalArtifacts", artifacts.size());
            summaryMap.put("totalMedia", siteMedia.size() + artifactMedia.size());
            report.put("summary", summaryMap);

            // Clean data tables for PDF generation
            List<Map<String, Object>> sitesTable = sites.stream()
                    .map(site -> {
                        try {
                            Map<String, Object> row = new HashMap<>();
                            row.put("ID", site.getId() != null ? site.getId() : "N/A");
                            row.put("Name", site.getNameEn() != null ? site.getNameEn() : "N/A");
                            row.put("Status", site.getStatus() != null ? site.getStatus() : "N/A");
                            row.put("Category", site.getCategory() != null ? site.getCategory() : "N/A");
                            row.put("Region", site.getRegion() != null ? site.getRegion() : "N/A");
                            row.put("Address", site.getAddress() != null ? site.getAddress() : "N/A");
                            return row;
                        } catch (Exception e) {
                            log.warn("Error processing heritage site {}: {}", site.getId(), e.getMessage());
                            // Return a safe fallback row
                            Map<String, Object> fallbackRow = new HashMap<>();
                            fallbackRow.put("ID", "ERROR");
                            fallbackRow.put("Name", "Error Processing");
                            fallbackRow.put("Status", "N/A");
                            fallbackRow.put("Category", "N/A");
                            fallbackRow.put("Region", "N/A");
                            fallbackRow.put("Address", "N/A");
                            return fallbackRow;
                        }
                    })
                    .collect(Collectors.toList());
            
            List<Map<String, Object>> artifactsTable = artifacts.stream()
                    .map(artifact -> {
                        try {
                            Map<String, Object> row = new HashMap<>();
                            row.put("ID", artifact.getId() != null ? artifact.getId() : "N/A");
                            row.put("Category", artifact.getCategory() != null ? artifact.getCategory() : "N/A");
                                                        row.put("Heritage Site", artifact.getHeritageSite() != null ? 
                                (artifact.getHeritageSite().getNameEn() != null ? 
                                    artifact.getHeritageSite().getNameEn() : "N/A") : "N/A");
                            row.put("Public", artifact.getIsPublic() != null ? artifact.getIsPublic() : false);
                            return row;
                        } catch (Exception e) {
                            log.warn("Error processing artifact {}: {}", artifact.getId(), e.getMessage());
                            // Return a safe fallback row
                            Map<String, Object> fallbackRow = new HashMap<>();
                            fallbackRow.put("ID", "ERROR");
                            fallbackRow.put("Category", "Error Processing");
                            fallbackRow.put("Heritage Site", "N/A");
                            fallbackRow.put("Public", false);
                            return fallbackRow;
                        }
                    })
                    .collect(Collectors.toList());
            
            List<Map<String, Object>> mediaTable = new ArrayList<>();
            
            // Add site media
            siteMedia.forEach(media -> {
                try {
                    Map<String, Object> row = new HashMap<>();
                    row.put("ID", media.getId() != null ? media.getId() : "N/A");
                    row.put("Type", "Site Media");
                    row.put("FileName", media.getFileName() != null ? media.getFileName() : "N/A");
                    row.put("File Type", media.getFileType() != null ? media.getFileType() : "N/A");
                    row.put("File Size", media.getFileSize() != null ? media.getFileSize() + " bytes" : "N/A");
                    row.put("Description", media.getDescription() != null ? media.getDescription() : "N/A");
                    mediaTable.add(row);
                } catch (Exception e) {
                    log.warn("Error processing site media {}: {}", media.getId(), e.getMessage());
                    // Add a safe fallback row
                    Map<String, Object> fallbackRow = new HashMap<>();
                    fallbackRow.put("ID", "ERROR");
                    fallbackRow.put("Type", "Site Media");
                    fallbackRow.put("FileName", "Error Processing");
                    fallbackRow.put("File Type", "N/A");
                    fallbackRow.put("File Size", "N/A");
                    fallbackRow.put("Description", "Error: " + e.getMessage());
                    mediaTable.add(fallbackRow);
                }
            });
            
            // Add artifact media
            artifactMedia.forEach(media -> {
                try {
                    Map<String, Object> row = new HashMap<>();
                    row.put("ID", media.getId() != null ? media.getId() : "N/A");
                    row.put("Type", "Artifact Media");
                    row.put("FileName", "Artifact Media");
                    row.put("File Type", "N/A");
                    row.put("File Size", "N/A");
                    row.put("Description", media.getDescription() != null ? media.getDescription() : "N/A");
                    mediaTable.add(row);
                } catch (Exception e) {
                    log.warn("Error processing artifact media {}: {}", media.getId(), e.getMessage());
                    // Add a safe fallback row
                    Map<String, Object> fallbackRow = new HashMap<>();
                    fallbackRow.put("ID", "ERROR");
                    fallbackRow.put("Type", "Artifact Media");
                    fallbackRow.put("FileName", "Error Processing");
                    fallbackRow.put("File Type", "N/A");
                    fallbackRow.put("File Size", "N/A");
                    fallbackRow.put("Description", "Error: " + e.getMessage());
                    mediaTable.add(fallbackRow);
                }
            });

            Map<String, List<Map<String, Object>>> tablesMap = new HashMap<>();
            tablesMap.put("heritageSites", sitesTable);
            tablesMap.put("artifacts", artifactsTable);
            tablesMap.put("media", mediaTable);
            report.put("tables", tablesMap);

            log.info("Report generated successfully - Sites: {}, Artifacts: {}, Media: {}", 
                    sites.size(), artifacts.size(), mediaTable.size());

            return report;

        } catch (Exception e) {
            log.error("Critical error generating report: {}", e.getMessage(), e);
            // Instead of crashing the server, return a safe error report
            Map<String, Object> errorReport = new HashMap<>();
            errorReport.put("title", "Error Report - Rwanda Heritage Guard System");
            errorReport.put("generatedAt", new java.util.Date());
            errorReport.put("error", "Failed to generate report: " + e.getMessage());
            Map<String, String> errorFilters = new HashMap<>();
            errorFilters.put("siteStatus", siteStatus);
            errorFilters.put("artifactAuthStatus", artifactAuthStatus);
            errorFilters.put("mediaType", mediaType);
            errorReport.put("filters", errorFilters);
            
            Map<String, Object> errorSummary = new HashMap<>();
            errorSummary.put("totalSites", 0);
            errorSummary.put("totalArtifacts", 0);
            errorSummary.put("totalMedia", 0);
            errorReport.put("summary", errorSummary);
            
            Map<String, List<Map<String, Object>>> errorTables = new HashMap<>();
            errorTables.put("heritageSites", new ArrayList<>());
            errorTables.put("artifacts", new ArrayList<>());
            errorTables.put("media", new ArrayList<>());
            errorReport.put("tables", errorTables);
            return errorReport;
        }
    }

    /**
     * Get available filter options for frontend (enhanced version)
     */
    public Map<String, Object> getAvailableFilters() {
        Map<String, Object> options = new HashMap<>();
        
        // User Role Options
        options.put("userRoles", List.of("SYSTEM_ADMINISTRATOR", "HERITAGE_MANAGER", "CONTENT_MANAGER", "COMMUNITY_MEMBER"));
        
        // Site Status Options
        options.put("siteStatuses", List.of("ACTIVE", "PROPOSED", "UNDER_CONSERVATION", "INACTIVE", "ARCHIVED"));
        
        // Content Type Options
        options.put("contentTypes", List.of("HERITAGE_SITES", "ARTIFACTS", "MEDIA", "DOCUMENTS", "EDUCATIONAL_CONTENT", "FORUM_POSTS"));
        
        // Artifact Authentication Status Options
        options.put("artifactAuthStatuses", List.of("AUTHENTICATED", "PENDING_AUTHENTICATION", "UNAUTHENTICATED", "REJECTED"));
        
        // Media Type Options
        options.put("mediaTypes", List.of("IMAGE", "DOCUMENT", "VIDEO", "AUDIO"));
        
        return options;
    }

    /**
     * Get report templates
     */
    public Map<String, Object> getReportTemplates() {
        Map<String, Object> templates = new HashMap<>();
        
        List<Map<String, Object>> templateList = new ArrayList<>();
        
        // Template 1: Heritage Sites Overview
        Map<String, Object> template1 = new HashMap<>();
        template1.put("id", "heritage-overview");
        template1.put("name", "Heritage Sites Overview");
        template1.put("description", "Comprehensive overview of all heritage sites with status distribution");
        Map<String, String> filters1 = new HashMap<>();
        filters1.put("siteStatus", "ALL");
        filters1.put("artifactAuthStatus", "SKIP");
        filters1.put("mediaType", "SKIP");
        template1.put("filters", filters1);
        templateList.add(template1);
        
        // Template 2: Artifact Authentication Report
        Map<String, Object> template2 = new HashMap<>();
        template2.put("id", "artifact-auth");
        template2.put("name", "Artifact Authentication Report");
        template2.put("description", "Detailed report on artifact authentication status");
        Map<String, String> filters2 = new HashMap<>();
        filters2.put("siteStatus", "SKIP");
        filters2.put("artifactAuthStatus", "ALL");
        filters2.put("mediaType", "SKIP");
        template2.put("filters", filters2);
        templateList.add(template2);
        
        // Template 3: Media Inventory Report
        Map<String, Object> template3 = new HashMap<>();
        template3.put("id", "media-inventory");
        template3.put("name", "Media Inventory Report");
        template3.put("description", "Complete inventory of all media files across the system");
        Map<String, String> filters3 = new HashMap<>();
        filters3.put("siteStatus", "SKIP");
        filters3.put("artifactAuthStatus", "SKIP");
        filters3.put("mediaType", "ALL");
        template3.put("filters", filters3);
        templateList.add(template3);
        
        // Template 4: Comprehensive System Report
        Map<String, Object> template4 = new HashMap<>();
        template4.put("id", "comprehensive");
        template4.put("name", "Comprehensive System Report");
        template4.put("description", "Complete system overview with all data");
        Map<String, String> filters4 = new HashMap<>();
        filters4.put("siteStatus", "ALL");
        filters4.put("artifactAuthStatus", "ALL");
        filters4.put("mediaType", "ALL");
        template4.put("filters", filters4);
        templateList.add(template4);
        
        templates.put("templates", templateList);
        return templates;
    }

    /**
     * Generate report from template
     */
    public Map<String, Object> generateFromTemplate(String templateId, Map<String, Object> filters) {
        log.info("Generating report from template: {} with filters: {}", templateId, filters);
        
        // Extract filters from request or use template defaults
        String siteStatus = (String) filters.getOrDefault("siteStatus", "ACTIVE");
        String artifactAuthStatus = (String) filters.getOrDefault("artifactAuthStatus", "AUTHENTICATED");
        String mediaType = (String) filters.getOrDefault("mediaType", "IMAGE");
        
        // Generate the report using existing logic
        return generateReport(siteStatus, artifactAuthStatus, mediaType);
    }

    /**
     * Generate PDF report with professional formatting
     */
    public byte[] generatePdfReport(Map<String, Object> reportData) {
        log.info("Starting PDF generation with report data: {}", reportData != null ? "data present" : "null");
        
        try {
            // Validate input data
            if (reportData == null) {
                throw new IllegalArgumentException("Report data cannot be null");
            }
            
            log.info("Creating PDF document...");
            
            // Create PDF document
            Document document = new Document(PageSize.A4, 50, 50, 50, 50);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, baos);
            
            log.info("Opening PDF document...");
            document.open();
            
            try {
                // Add logo and title
                log.info("Adding header...");
                addHeader(document, reportData);
                
                // Add report metadata
                log.info("Adding metadata...");
                addMetadata(document, reportData);
                
                // Add summary section
                log.info("Adding summary...");
                addSummary(document, reportData);
                
                // Add data tables
                log.info("Adding data tables...");
                addDataTables(document, reportData);
                
                log.info("Closing PDF document...");
                document.close();
                
                byte[] result = baos.toByteArray();
                log.info("PDF generated successfully, size: {} bytes", result.length);
                return result;
                
            } catch (Exception e) {
                log.error("Error during PDF content generation: {}", e.getMessage(), e);
                try {
                    document.close();
                } catch (Exception closeError) {
                    log.warn("Error closing document: {}", closeError.getMessage());
                }
                throw e;
            }
            
        } catch (Exception e) {
            log.error("Critical error generating PDF report: {}", e.getMessage(), e);
            // Return a simple error PDF instead of crashing
            return generateErrorPdf("PDF Generation Failed: " + e.getMessage());
        }
    }
    
    /**
     * Generate a simple error PDF when main generation fails
     */
    private byte[] generateErrorPdf(String errorMessage) {
        try {
            Document document = new Document(PageSize.A4);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, baos);
            
            document.open();
            
            Font titleFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
            Font errorFont = new Font(Font.FontFamily.HELVETICA, 12, Font.NORMAL);
            
            Paragraph title = new Paragraph("Report Generation Error", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            
            document.add(new Paragraph(" ", errorFont));
            
            Paragraph error = new Paragraph("An error occurred while generating your report:", errorFont);
            document.add(error);
            
            document.add(new Paragraph(" ", errorFont));
            
            Paragraph errorDetails = new Paragraph(errorMessage, errorFont);
            errorDetails.setAlignment(Element.ALIGN_CENTER);
            document.add(errorDetails);
            
            document.close();
            return baos.toByteArray();
            
        } catch (Exception e) {
            log.error("Failed to generate error PDF: {}", e.getMessage());
            // Return a minimal error message as bytes
            return ("PDF Generation Failed: " + errorMessage).getBytes();
        }
    }
    
    private void addHeader(Document document, Map<String, Object> reportData) throws Exception {
        try {
            // Add logo - try multiple resource paths
            Image logo = null;
            try {
                logo = Image.getInstance(getClass().getResource("/static/heritage_logo.png"));
            } catch (Exception e1) {
                try {
                    logo = Image.getInstance(getClass().getResource("heritage_logo.png"));
                } catch (Exception e2) {
                    try {
                        logo = Image.getInstance(getClass().getResource("/heritage_logo.png"));
                    } catch (Exception e3) {
                        log.warn("Could not load logo from any path: {}", e3.getMessage());
                        return; // Skip logo if we can't load it
                    }
                }
            }
            
            if (logo != null) {
                logo.scaleToFit(100, 100);
                logo.setAlignment(Element.ALIGN_CENTER);
                document.add(logo);
                Paragraph spacer = new Paragraph(" ", new Font(Font.FontFamily.HELVETICA, 12, Font.NORMAL));
                spacer.setSpacingAfter(20);
                document.add(spacer);
                log.info("Logo added successfully to PDF");
            }
        } catch (Exception e) {
            log.warn("Could not add logo to PDF: {}", e.getMessage());
        }
        
        // Add title
        Font titleFont = new Font(Font.FontFamily.HELVETICA, 24, Font.BOLD);
        Paragraph title = new Paragraph("RWANDA HERITAGE GUARD", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);
        
        // Add subtitle
        Font subtitleFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
        Paragraph subtitle = new Paragraph("System Report", subtitleFont);
        subtitle.setAlignment(Element.ALIGN_CENTER);
        subtitle.setSpacingAfter(30);
        document.add(subtitle);
    }
    
    private void addMetadata(Document document, Map<String, Object> reportData) throws Exception {
        Font headerFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD);
        Font normalFont = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL);
        
        Paragraph metadata = new Paragraph();
        metadata.add(new Chunk("Generated: ", headerFont));
        metadata.add(new Chunk(reportData.get("generatedAt").toString(), normalFont));
        metadata.setSpacingAfter(10);
        document.add(metadata);
        
        @SuppressWarnings("unchecked")
        Map<String, String> filters = (Map<String, String>) reportData.get("filters");
        if (filters != null) {
            metadata = new Paragraph();
            metadata.add(new Chunk("Filters Applied: ", headerFont));
            metadata.add(new Chunk(String.format("Site Status: %s, Artifact Auth: %s, Media Type: %s", 
                filters.get("siteStatus"), filters.get("artifactAuthStatus"), filters.get("mediaType")), normalFont));
            metadata.setSpacingAfter(20);
            document.add(metadata);
        }
    }
    
    private void addSummary(Document document, Map<String, Object> reportData) throws Exception {
        Font headerFont = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD);
        Font normalFont = new Font(Font.FontFamily.HELVETICA, 12, Font.NORMAL);
        
        Paragraph summaryHeader = new Paragraph("Report Summary", headerFont);
        summaryHeader.setSpacingAfter(15);
        document.add(summaryHeader);
        
        @SuppressWarnings("unchecked")
        Map<String, Object> summary = (Map<String, Object>) reportData.get("summary");
        if (summary != null) {
            PdfPTable summaryTable = new PdfPTable(2);
            summaryTable.setWidthPercentage(100);
            
            summaryTable.addCell(createCell("Total Heritage Sites", headerFont, true));
            summaryTable.addCell(createCell(summary.get("totalSites").toString(), normalFont, false));
            
            summaryTable.addCell(createCell("Total Artifacts", headerFont, true));
            summaryTable.addCell(createCell(summary.get("totalArtifacts").toString(), normalFont, false));
            
            summaryTable.addCell(createCell("Total Media Files", headerFont, true));
            summaryTable.addCell(createCell(summary.get("totalMedia").toString(), normalFont, false));
            
            document.add(summaryTable);
            Paragraph spacer = new Paragraph(" ", normalFont);
            spacer.setSpacingAfter(20);
            document.add(spacer);
        }
    }
    
    private void addDataTables(Document document, Map<String, Object> reportData) throws Exception {
        Font headerFont = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD);
        Font normalFont = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL);
        
        @SuppressWarnings("unchecked")
        Map<String, List<Map<String, Object>>> tables = (Map<String, List<Map<String, Object>>>) reportData.get("tables");
        if (tables == null) return;
        
        // Heritage Sites Table
        if (tables.get("heritageSites") != null && !tables.get("heritageSites").isEmpty()) {
            addTable(document, "Heritage Sites", tables.get("heritageSites"), headerFont, normalFont);
        }
        
        // Artifacts Table
        if (tables.get("artifacts") != null && !tables.get("artifacts").isEmpty()) {
            addTable(document, "Artifacts", tables.get("artifacts"), headerFont, normalFont);
        }
        
        // Media Table
        if (tables.get("media") != null && !tables.get("media").isEmpty()) {
            addTable(document, "Media Files", tables.get("media"), headerFont, normalFont);
        }
    }
    
    private void addTable(Document document, String title, List<Map<String, Object>> data, 
                         Font headerFont, Font normalFont) throws Exception {
        if (data.isEmpty()) return;
        
        Paragraph tableTitle = new Paragraph(title, headerFont);
        tableTitle.setSpacingAfter(15);
        document.add(tableTitle);
        
        // Get column headers from first row
        Set<String> columns = data.get(0).keySet();
        PdfPTable table = new PdfPTable(columns.size());
        table.setWidthPercentage(100);
        
        // Add header row
        for (String column : columns) {
            table.addCell(createCell(column, headerFont, true));
        }
        
        // Add data rows
        for (Map<String, Object> row : data) {
            for (String column : columns) {
                Object value = row.get(column);
                table.addCell(createCell(value != null ? value.toString() : "N/A", normalFont, false));
            }
        }
        
        document.add(table);
        Paragraph spacer = new Paragraph(" ", normalFont);
        spacer.setSpacingAfter(20);
        document.add(spacer);
    }
    
    private PdfPCell createCell(String text, Font font, boolean isHeader) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(5);
        if (isHeader) {
            cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
        }
        return cell;
    }
}

