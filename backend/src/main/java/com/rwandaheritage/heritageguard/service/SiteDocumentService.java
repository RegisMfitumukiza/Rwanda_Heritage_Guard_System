package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.model.HeritageSite;
import com.rwandaheritage.heritageguard.model.SiteDocument;
import com.rwandaheritage.heritageguard.repository.HeritageSiteRepository;
import com.rwandaheritage.heritageguard.repository.SiteDocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SiteDocumentService {
    private final SiteDocumentRepository siteDocumentRepository;
    private final HeritageSiteRepository heritageSiteRepository;
    private final String documentUploadDir;

    @Autowired
    public SiteDocumentService(SiteDocumentRepository siteDocumentRepository, HeritageSiteRepository heritageSiteRepository,
                               @Value("${document.upload.dir:uploads/documents}") String documentUploadDir) {
        this.siteDocumentRepository = siteDocumentRepository;
        this.heritageSiteRepository = heritageSiteRepository;
        this.documentUploadDir = documentUploadDir;
    }

    public SiteDocument createSiteDocument(SiteDocument document) {
        // Set uploader
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            document.setUploaderUsername(auth.getName());
        }
        return siteDocumentRepository.save(document);
    }

    public Optional<SiteDocument> getSiteDocumentById(Long id) {
        Optional<SiteDocument> docOpt = siteDocumentRepository.findById(id);
        if (!docOpt.isPresent()) return Optional.empty();
        SiteDocument doc = docOpt.get();
        if (isPublicUser() && !doc.isPublic()) {
            // Public users cannot access private documents
            return Optional.empty();
        }
        return Optional.of(doc);
    }

    public List<SiteDocument> getAllSiteDocuments() {
        List<SiteDocument> allDocs = siteDocumentRepository.findAll();
        if (isPublicUser()) {
            // Only return public documents for public users
            return allDocs.stream().filter(SiteDocument::isPublic).collect(Collectors.toList());
        }
        return allDocs;
    }

    public List<SiteDocument> getAllSiteDocuments(org.springframework.data.domain.Pageable pageable) {
        org.springframework.data.domain.Page<SiteDocument> page = siteDocumentRepository.findByIsActiveTrue(pageable);
        List<SiteDocument> docs = page.getContent();
        if (isPublicUser()) {
            return docs.stream().filter(SiteDocument::isPublic).collect(Collectors.toList());
        }
        return docs;
    }

    public org.springframework.data.domain.Page<SiteDocument> getAllSiteDocumentsPage(org.springframework.data.domain.Pageable pageable) {
        return siteDocumentRepository.findByIsActiveTrue(pageable);
    }

    public SiteDocument updateSiteDocument(SiteDocument document) {
        SiteDocument existing = siteDocumentRepository.findById(document.getId()).orElse(null);
        if (existing == null) throw new org.springframework.web.server.ResponseStatusException(
            org.springframework.http.HttpStatus.NOT_FOUND, "Document not found");
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = false, isHeritageManager = false, isUploader = false;
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            String username = auth.getName();
            isUploader = username.equals(existing.getUploaderUsername());
            isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_SYSTEM_ADMINISTRATOR"));
            isHeritageManager = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_HERITAGE_MANAGER"));
        }
        if (isAdmin || isHeritageManager || isUploader) {
            // Only allow update if permitted
            document.setUploaderUsername(existing.getUploaderUsername()); // Don't allow changing uploader
            return siteDocumentRepository.save(document);
        } else {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.FORBIDDEN, "You do not have permission to update this document file.");
        }
    }

    public void deleteSiteDocument(Long id) {
        SiteDocument doc = siteDocumentRepository.findById(id).orElse(null);
        if (doc == null) throw new org.springframework.web.server.ResponseStatusException(
            org.springframework.http.HttpStatus.NOT_FOUND, "Document not found");
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = false, isHeritageManager = false, isUploader = false;
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            String username = auth.getName();
            isUploader = username.equals(doc.getUploaderUsername());
            isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_SYSTEM_ADMINISTRATOR"));
            isHeritageManager = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_HERITAGE_MANAGER"));
        }
        if (isAdmin || isHeritageManager || isUploader) {
            siteDocumentRepository.deleteById(id);
        } else {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.FORBIDDEN, "You do not have permission to delete this document file.");
        }
    }

    // --- File upload logic ---
    public SiteDocument storeDocumentFile(Long siteId, MultipartFile file, String description, String category, String uploadDate, boolean isPublic, String language) throws IOException {
        // Ensure upload directory exists
        Path uploadPath = Paths.get(documentUploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String ext = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            ext = originalFilename.substring(originalFilename.lastIndexOf('.'));
        }
        String uniqueFilename = UUID.randomUUID().toString() + ext;
        Path filePath = uploadPath.resolve(uniqueFilename);
        // Save file to disk
        file.transferTo(filePath.toFile());
        // Save metadata to DB
        HeritageSite site = heritageSiteRepository.findById(siteId).orElseThrow(() -> new IllegalArgumentException("Site not found"));
        SiteDocument doc = new SiteDocument();
        doc.setFileName(originalFilename);
        doc.setFileType(file.getContentType());
        doc.setFilePath(filePath.toString());
        doc.setDescription(description);
        doc.setCategory(category);
        // Validate language
        String lang = (language == null || language.isBlank()) ? "en" : language.toLowerCase();
        if (!java.util.Set.of("en", "rw", "fr").contains(lang)) {
            throw new IllegalArgumentException("Unsupported language: " + lang);
        }
        doc.setLanguage(lang);
        doc.setUploadDate(uploadDate);
        doc.setIsPublic(isPublic);
        doc.setHeritageSite(site);
        // Set uploader
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            doc.setUploaderUsername(auth.getName());
        }
        return siteDocumentRepository.save(doc);
    }

    // --- File download logic ---
    public Resource loadDocumentFile(Long documentId) {
        SiteDocument doc = siteDocumentRepository.findById(documentId).orElse(null);
        if (doc == null) return null;
        if (isPublicUser() && !doc.isPublic()) {
            // Public users cannot access private documents
            return null;
        }
        File file = new File(doc.getFilePath());
        if (!file.exists()) return null;
        return new FileSystemResource(file);
    }

    private boolean isPublicUser() {
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            return true;
        }
        for (org.springframework.security.core.GrantedAuthority authority : authentication.getAuthorities()) {
            String role = authority.getAuthority();
            if (role.equals("ROLE_COMMUNITY_MEMBER") || role.equals("ROLE_SYSTEM_ADMINISTRATOR") || role.equals("ROLE_HERITAGE_MANAGER") || role.equals("ROLE_CONTENT_MANAGER")) {
                return false;
            }
        }
        return true;
    }

    // Statistics methods for analytics
    public long getTotalDocumentCount() {
        return siteDocumentRepository.count();
    }

    public long getPublicDocumentCount() {
        return siteDocumentRepository.countByIsPublicTrue();
    }

    public long getRecentDocumentCount(int days) {
        java.time.LocalDateTime cutoffDate = java.time.LocalDateTime.now().minusDays(days);
        return siteDocumentRepository.countByCreatedDateAfter(cutoffDate);
    }

    // Additional analytics helpers
    public java.util.Map<String, Long> getDocumentTypeStatistics() {
        java.util.Map<String, Long> stats = new java.util.HashMap<>();
        java.util.List<String> types = siteDocumentRepository.findDistinctFileTypes();
        for (String type : types) {
            stats.put(type, siteDocumentRepository.countByFileTypeAndIsActiveTrue(type));
        }
        return stats;
    }

    public java.util.Map<String, Long> getDocumentLanguageStatistics() {
        java.util.Map<String, Long> stats = new java.util.HashMap<>();
        String[] languages = new String[]{"en", "rw", "fr"};
        for (String lang : languages) {
            stats.put(lang, siteDocumentRepository.countByLanguageAndIsActiveTrue(lang));
        }
        return stats;
    }

    // Fetch documents by site
    public java.util.List<SiteDocument> getDocumentsBySite(Long siteId) {
        return siteDocumentRepository.findByHeritageSiteIdAndIsActiveTrue(siteId);
    }

    public org.springframework.data.domain.Page<SiteDocument> getDocumentsBySitePage(Long siteId, org.springframework.data.domain.Pageable pageable) {
        return siteDocumentRepository.findByHeritageSiteIdAndIsActiveTrue(siteId, pageable);
    }

    // Search documents with optional filters
    public java.util.List<SiteDocument> searchDocuments(String q, String category, String fileType, Boolean isPublic, org.springframework.data.domain.Pageable pageable) {
        // Basic pagination by delegating to repository then subList; for simplicity reuse existing query and paginate in memory
        List<SiteDocument> list = siteDocumentRepository.searchDocuments((q == null || q.isBlank()) ? null : q, category, fileType, isPublic);
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), list.size());
        if (start > end) return java.util.Collections.emptyList();
        return list.subList(start, end);
    }

    // Full list for totals
    public java.util.List<SiteDocument> searchDocumentsAll(String q, String category, String fileType, Boolean isPublic) {
        return siteDocumentRepository.searchDocuments((q == null || q.isBlank()) ? null : q, category, fileType, isPublic);
    }

    // Aggregate statistics for documents
    public java.util.Map<String, Object> getDocumentStatistics() {
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalDocuments", getTotalDocumentCount());
        stats.put("publicDocuments", getPublicDocumentCount());
        stats.put("recentDocuments", getRecentDocumentCount(30));
        stats.put("byType", getDocumentTypeStatistics());
        stats.put("byLanguage", getDocumentLanguageStatistics());
        return stats;
    }

    // Analytics methods for real data tracking
    public long getTotalDocumentSize() {
        return siteDocumentRepository.getTotalDocumentSize();
    }

    public long getTotalDocumentViews() {
        return siteDocumentRepository.getTotalDocumentViews();
    }

    public long getTotalDocumentDownloads() {
        return siteDocumentRepository.getTotalDocumentDownloads();
    }

    public long getTotalSearchCount() {
        return siteDocumentRepository.getTotalSearchCount();
    }

    public int getTodayVisits() {
        return siteDocumentRepository.getTodayVisits();
    }

    public int getTodayDownloads() {
        return siteDocumentRepository.getTodayDownloads();
    }

    public int getTodaySearches() {
        return siteDocumentRepository.getTodaySearches();
    }

    public java.util.List<java.util.Map<String, Object>> getRecentActivities(int limit) {
        return siteDocumentRepository.getRecentActivities(limit);
    }

    public long getDocumentCountByDate(java.time.LocalDate date) {
        return siteDocumentRepository.getDocumentCountByDate(date);
    }

    public long getActivityCountByDate(java.time.LocalDate date) {
        return siteDocumentRepository.getActivityCountByDate(date);
    }

    // Analytics tracking methods
    /**
     * Track document view for analytics
     * @param documentId Document ID
     */
    public void trackDocumentView(Long documentId) {
        SiteDocument document = siteDocumentRepository.findById(documentId)
            .orElseThrow(() -> new RuntimeException("Document not found"));
        
        document.setViewCount(document.getViewCount() + 1);
        document.setLastViewedAt(java.time.LocalDateTime.now());
        siteDocumentRepository.save(document);
    }

    /**
     * Track document download for analytics
     * @param documentId Document ID
     */
    public void trackDocumentDownload(Long documentId) {
        SiteDocument document = siteDocumentRepository.findById(documentId)
            .orElseThrow(() -> new RuntimeException("Document not found"));
        
        document.setDownloadCount(document.getDownloadCount() + 1);
        document.setLastDownloadedAt(java.time.LocalDateTime.now());
        siteDocumentRepository.save(document);
    }

    /**
     * Track document search for analytics
     * @param documentId Document ID
     */
    public void trackDocumentSearch(Long documentId) {
        SiteDocument document = siteDocumentRepository.findById(documentId)
            .orElseThrow(() -> new RuntimeException("Document not found"));
        
        document.setSearchCount(document.getSearchCount() + 1);
        document.setLastSearchedAt(java.time.LocalDateTime.now());
        siteDocumentRepository.save(document);
    }

    /**
     * Update document file size when file is uploaded
     * @param documentId Document ID
     * @param fileSize File size in bytes
     */
    public void updateDocumentFileSize(Long documentId, Long fileSize) {
        SiteDocument document = siteDocumentRepository.findById(documentId)
            .orElseThrow(() -> new RuntimeException("Document not found"));
        
        document.setFileSize(fileSize);
        siteDocumentRepository.save(document);
    }
} 