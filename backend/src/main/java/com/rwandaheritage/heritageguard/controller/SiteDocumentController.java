package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.dto.SiteDocumentDTO;
import com.rwandaheritage.heritageguard.model.SiteDocument;
import com.rwandaheritage.heritageguard.service.SiteDocumentService;
import com.rwandaheritage.heritageguard.mapper.SiteDocumentMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.core.io.Resource;
import jakarta.validation.Valid;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/site-documents")
public class SiteDocumentController {
    private final SiteDocumentService siteDocumentService;

    @Autowired
    public SiteDocumentController(SiteDocumentService siteDocumentService) {
        this.siteDocumentService = siteDocumentService;
    }

    // Public and authenticated users can view
    @GetMapping("")
    public com.rwandaheritage.heritageguard.dto.response.PageResponse<SiteDocumentDTO> getAllDocuments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        org.springframework.data.domain.Page<SiteDocument> docPage = siteDocumentService.getAllSiteDocumentsPage(pageable);
        java.util.List<SiteDocumentDTO> items = docPage.getContent().stream().map(SiteDocumentMapper::toDTO).collect(Collectors.toList());
        long total = docPage.getTotalElements();
        int totalPages = docPage.getTotalPages();
        return com.rwandaheritage.heritageguard.dto.response.PageResponse.<SiteDocumentDTO>builder()
                .items(items)
                .page(page)
                .size(size)
                .totalElements(total)
                .totalPages(totalPages)
                .build();
    }

    @GetMapping("/{id}")
    public SiteDocumentDTO getDocumentById(@PathVariable Long id) {
        Optional<SiteDocument> docOpt = siteDocumentService.getSiteDocumentById(id);
        if (docOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Site document not found");
        }
        return docOpt.map(SiteDocumentMapper::toDTO).get();
    }

    // File upload endpoint
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR') or hasRole('HERITAGE_MANAGER') or hasRole('CONTENT_MANAGER')")
    @PostMapping("/upload/{siteId}")
    public ResponseEntity<?> uploadDocument(
            @PathVariable Long siteId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "uploadDate", required = false) String uploadDate,
            @RequestParam(value = "isPublic", required = false, defaultValue = "true") boolean isPublic,
            @RequestParam(value = "language", required = false) String language
    ) {
        try {
            SiteDocument saved = siteDocumentService.storeDocumentFile(siteId, file, description, category, uploadDate, isPublic, language);
            return ResponseEntity.ok(SiteDocumentMapper.toDTO(saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(500).body("File upload failed: " + e.getMessage());
        }
    }

    // File download endpoint
    @GetMapping("/download/{id}")
    public ResponseEntity<?> downloadDocument(@PathVariable Long id) {
        Resource fileResource = siteDocumentService.loadDocumentFile(id);
        if (fileResource == null || !fileResource.exists()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");
        }
        // Try to get original filename from DB
        Optional<SiteDocument> docOpt = siteDocumentService.getSiteDocumentById(id);
        String fileName = docOpt.map(SiteDocument::getFileName).orElse("document-file");
        String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encodedFileName + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(fileResource);
    }

    // Only ADMIN, HERITAGE_MANAGER, CONTENT_MANAGER can create
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR') or hasRole('HERITAGE_MANAGER') or hasRole('CONTENT_MANAGER')")
    @PostMapping("")
    public SiteDocumentDTO createDocument(@Valid @RequestBody SiteDocumentDTO documentDTO) {
        SiteDocument doc = SiteDocumentMapper.toEntity(documentDTO);
        SiteDocument saved = siteDocumentService.createSiteDocument(doc);
        return SiteDocumentMapper.toDTO(saved);
    }

    // Only ADMIN, HERITAGE_MANAGER, CONTENT_MANAGER can update
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR') or hasRole('HERITAGE_MANAGER') or hasRole('CONTENT_MANAGER')")
    @PutMapping("/{id}")
    public SiteDocumentDTO updateDocument(@PathVariable Long id, @Valid @RequestBody SiteDocumentDTO documentDTO) {
        SiteDocument doc = SiteDocumentMapper.toEntity(documentDTO);
        doc.setId(id);
        SiteDocument updated = siteDocumentService.updateSiteDocument(doc);
        return SiteDocumentMapper.toDTO(updated);
    }

    // Only ADMIN, HERITAGE_MANAGER, CONTENT_MANAGER can delete
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR') or hasRole('HERITAGE_MANAGER') or hasRole('CONTENT_MANAGER')")
    @DeleteMapping("/{id}")
    public void deleteDocument(@PathVariable Long id) {
        siteDocumentService.deleteSiteDocument(id);
    }

    /**
     * Get documents by heritage site
     * Public endpoint
     */
    @GetMapping("/site/{siteId}")
    public ResponseEntity<com.rwandaheritage.heritageguard.dto.response.PageResponse<SiteDocumentDTO>> getDocumentsBySite(
            @PathVariable Long siteId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        org.springframework.data.domain.Page<SiteDocument> docPage = siteDocumentService.getDocumentsBySitePage(siteId, pageable);
        java.util.List<SiteDocumentDTO> items = docPage.getContent().stream().map(SiteDocumentMapper::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(
            com.rwandaheritage.heritageguard.dto.response.PageResponse.<SiteDocumentDTO>builder()
                .items(items)
                .page(page)
                .size(size)
                .totalElements(docPage.getTotalElements())
                .totalPages(docPage.getTotalPages())
                .build()
        );
    }

    /**
     * Search documents with optional filters
     * Public endpoint
     */
    @GetMapping("/search")
    public ResponseEntity<com.rwandaheritage.heritageguard.dto.response.PageResponse<SiteDocumentDTO>> searchDocuments(
            @RequestParam(required = false, name = "q") String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false, name = "type") String fileType,
            @RequestParam(required = false) Boolean isPublic,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        java.util.List<SiteDocument> all = siteDocumentService.searchDocumentsAll(q, category, fileType, isPublic);
        java.util.List<SiteDocumentDTO> items = siteDocumentService.searchDocuments(q, category, fileType, isPublic, pageable).stream().map(SiteDocumentMapper::toDTO).collect(java.util.stream.Collectors.toList());
        long total = all.size();
        int totalPages = (int) Math.ceil((double) total / size);
        return ResponseEntity.ok(
            com.rwandaheritage.heritageguard.dto.response.PageResponse.<SiteDocumentDTO>builder()
                .items(items)
                .page(page)
                .size(size)
                .totalElements(total)
                .totalPages(totalPages)
                .build()
        );
    }

    /**
     * Get document statistics
     * Protected or public depending on requirements; keep public for overview
     */
    @GetMapping("/statistics")
    public ResponseEntity<java.util.Map<String, Object>> getDocumentStatistics() {
        return ResponseEntity.ok(siteDocumentService.getDocumentStatistics());
    }
} 