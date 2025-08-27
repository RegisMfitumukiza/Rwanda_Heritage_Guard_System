package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.model.Document;
import com.rwandaheritage.heritageguard.model.DocumentVersion;
import com.rwandaheritage.heritageguard.model.Folder;
import com.rwandaheritage.heritageguard.repository.DocumentRepository;
import com.rwandaheritage.heritageguard.repository.DocumentVersionRepository;
import com.rwandaheritage.heritageguard.repository.FolderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.IOException;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.beans.factory.annotation.Value;
import java.io.File;

@Service
public class DocumentService {
    @Autowired
    private DocumentRepository documentRepository;
    @Autowired
    private DocumentVersionRepository documentVersionRepository;
    @Autowired
    private FolderRepository folderRepository;

    @Value("${document.upload.dir:uploads/documents}")
    private String documentUploadDir;

    public Document createDocument(Document document) {
        // Set audit fields
        String currentUser = getCurrentUsername();
        document.setCreatedBy(currentUser);
        document.setUpdatedBy(currentUser);
        document.setIsActive(true);
        
        if (document.getCreationDate() == null) {
            document.setCreationDate(LocalDateTime.now());
        }
        
        // Validate folder exists
        if (document.getFolder() != null && document.getFolder().getId() != null) {
            Folder folder = folderRepository.findById(document.getFolder().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Folder not found"));
            document.setFolder(folder);
        }
        
        return documentRepository.save(document);
    }

    private boolean isAllowedToView(Document doc) {
        if (doc.getIsPublic() != null && doc.getIsPublic()) {
            return true;
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return false;
        }
        for (GrantedAuthority authority : auth.getAuthorities()) {
            String role = authority.getAuthority();
            if (role.equals("ROLE_COMMUNITY_MEMBER") || role.equals("ROLE_SYSTEM_ADMINISTRATOR") || role.equals("ROLE_HERITAGE_MANAGER") || role.equals("ROLE_CONTENT_MANAGER")) {
                return true;
            }
        }
        return false;
    }

    public Optional<Document> getDocument(Long id) {
        Optional<Document> docOpt = documentRepository.findById(id);
        if (docOpt.isEmpty()) {
            return Optional.empty();
        }
        
        Document doc = docOpt.get();
        
        // Check if document is active
        if (!doc.isActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found or inactive");
        }
        
        if (!isAllowedToView(doc)) {
            throw new AccessDeniedException("You do not have permission to view this document.");
        }
        return Optional.of(doc);
    }

    public List<Document> listDocuments() {
        List<Document> allDocs = documentRepository.findByIsActiveTrue();
        return allDocs.stream().filter(this::isAllowedToView).toList();
    }

    public List<Document> listDocumentsByFolder(Long folderId) {
        List<Document> allDocs = documentRepository.findByFolderIdAndIsActiveTrue(folderId);
        return allDocs.stream().filter(this::isAllowedToView).toList();
    }

    // Enhanced search and filtering methods
    public List<Document> searchDocuments(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return listDocuments();
        }
        
        List<Document> titleResults = documentRepository.searchByTitle(searchTerm.trim());
        List<Document> descResults = documentRepository.searchByDescription(searchTerm.trim());
        
        // Combine and filter by permissions
        List<Document> combined = titleResults.stream()
            .filter(this::isAllowedToView)
            .toList();
        
        combined.addAll(descResults.stream()
            .filter(this::isAllowedToView)
            .filter(doc -> !combined.contains(doc))
            .toList());
        
        return combined;
    }

    public List<Document> filterDocuments(String type, String language, String author, Boolean isPublic) {
        List<Document> filtered = documentRepository.findDocumentsWithFilters(type, language, author, isPublic);
        return filtered.stream().filter(this::isAllowedToView).toList();
    }

    public List<Document> getDocumentsByType(String type) {
        List<Document> docs = documentRepository.findByTypeAndIsActiveTrue(type);
        return docs.stream().filter(this::isAllowedToView).toList();
    }

    public List<Document> getDocumentsByLanguage(String language) {
        List<Document> docs = documentRepository.findByLanguageAndIsActiveTrue(language);
        return docs.stream().filter(this::isAllowedToView).toList();
    }

    public List<Document> getDocumentsByAuthor(String author) {
        List<Document> docs = documentRepository.findByAuthorContainingIgnoreCase(author);
        return docs.stream().filter(this::isAllowedToView).toList();
    }

    public List<Document> getPublicDocuments() {
        return documentRepository.findByIsPublicTrueAndIsActiveTrue();
    }

    public List<Document> getDocumentsByCreator(String createdBy) {
        List<Document> docs = documentRepository.findByCreatedByAndIsActiveTrue(createdBy);
        return docs.stream().filter(this::isAllowedToView).toList();
    }

    public List<Document> getDocumentsByDateRange(LocalDateTime start, LocalDateTime end) {
        List<Document> docs = documentRepository.findByCreationDateBetweenAndIsActiveTrue(start, end);
        return docs.stream().filter(this::isAllowedToView).toList();
    }

    @Transactional
    public Document updateDocument(Long id, Document updated) {
        Document doc = documentRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));
        
        // Set audit fields
        String currentUser = getCurrentUsername();
        doc.setUpdatedBy(currentUser);
        doc.setUpdatedDate(LocalDateTime.now());
        
        // Check permissions
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) ? auth.getName() : null;
        boolean isAdmin = auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_SYSTEM_ADMINISTRATOR"));
        
        if (!isAdmin && (username == null || !username.equals(doc.getCreatedBy()))) {
            throw new AccessDeniedException("You can only update your own documents.");
        }
        
        // Update fields
        doc.setTitle(updated.getTitle());
        doc.setDescription(updated.getDescription());
        doc.setAuthor(updated.getAuthor());
        doc.setType(updated.getType());
        doc.setTags(updated.getTags());
        doc.setLanguage(updated.getLanguage());
        doc.setIsPublic(updated.getIsPublic());
        
        // Update folder if provided
        if (updated.getFolder() != null && updated.getFolder().getId() != null) {
            Folder folder = folderRepository.findById(updated.getFolder().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Folder not found"));
            doc.setFolder(folder);
        }
        
        return documentRepository.save(doc);
    }

    public void deleteDocument(Long id) {
        Document doc = documentRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));
        
        // Check permissions
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) ? auth.getName() : null;
        boolean isAdmin = auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_SYSTEM_ADMINISTRATOR"));
        
        if (!isAdmin && (username == null || !username.equals(doc.getCreatedBy()))) {
            throw new AccessDeniedException("You can only delete your own documents.");
        }
        
        // Soft delete
        doc.setIsActive(false);
        doc.setUpdatedBy(getCurrentUsername());
        doc.setUpdatedDate(LocalDateTime.now());
        
        documentRepository.save(doc);
    }

    public DocumentVersion addVersion(Long documentId, DocumentVersion version) {
        Document doc = documentRepository.findById(documentId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));
        
        // Set audit fields
        String currentUser = getCurrentUsername();
        version.setCreatedBy(currentUser);
        version.setUpdatedBy(currentUser);
        version.setIsActive(true);
        
        version.setDocument(doc);
        version.setCreatedDate(LocalDateTime.now());
        
        return documentVersionRepository.save(version);
    }

    public List<DocumentVersion> listVersions(Long documentId) {
        return documentVersionRepository.findByDocumentIdOrderByVersionNumberDesc(documentId)
            .stream().filter(DocumentVersion::isActive).toList();
    }

    public Optional<DocumentVersion> getLatestVersion(Long documentId) {
        List<DocumentVersion> versions = listVersions(documentId);
        return versions.isEmpty() ? Optional.empty() : Optional.of(versions.get(0));
    }

    public Optional<DocumentVersion> getVersion(Long versionId) {
        Optional<DocumentVersion> versionOpt = documentVersionRepository.findById(versionId);
        if (versionOpt.isEmpty() || !versionOpt.get().isActive()) {
            return Optional.empty();
        }
        return versionOpt;
    }

    public DocumentVersion storeVersionFile(Long documentId, MultipartFile file, String createdBy) throws IOException {
        // Validate file
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File cannot be empty");
        }
        
        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !isValidFileType(contentType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file type");
        }
        
        // Validate file size (100MB max)
        if (file.getSize() > 100 * 1024 * 1024) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File size cannot exceed 100MB");
        }
        
        Document doc = documentRepository.findById(documentId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));
        
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
        
        // Get next version number
        List<DocumentVersion> existingVersions = listVersions(documentId);
        int nextVersion = existingVersions.isEmpty() ? 1 : existingVersions.get(0).getVersionNumber() + 1;
        
        // Create version record
        DocumentVersion version = DocumentVersion.builder()
            .document(doc)
            .filePath(filePath.toString())
            .versionNumber(nextVersion)
            .fileType(contentType)
            .fileSize(file.getSize())
            .isActive(true)
            .createdBy(createdBy != null ? createdBy : getCurrentUsername())
            .createdDate(LocalDateTime.now())
            .updatedBy(createdBy != null ? createdBy : getCurrentUsername())
            .updatedDate(LocalDateTime.now())
            .build();
        
        return documentVersionRepository.save(version);
    }

    public Resource loadVersionFile(Long versionId) {
        DocumentVersion version = documentVersionRepository.findById(versionId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Version not found"));
        
        if (!version.isActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Version not found or inactive");
        }
        
        // Check permissions for the document
        if (!isAllowedToView(version.getDocument())) {
            throw new AccessDeniedException("You do not have permission to access this document.");
        }
        
        File file = new File(version.getFilePath());
        if (!file.exists()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found on disk");
        }
        
        return new FileSystemResource(file);
    }

    public void deleteVersion(Long versionId) {
        DocumentVersion version = documentVersionRepository.findById(versionId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Version not found"));
        
        // Check permissions
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) ? auth.getName() : null;
        boolean isAdmin = auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_SYSTEM_ADMINISTRATOR"));
        
        if (!isAdmin && (username == null || !username.equals(version.getCreatedBy()))) {
            throw new AccessDeniedException("You can only delete your own versions.");
        }
        
        // Soft delete
        version.setIsActive(false);
        version.setUpdatedBy(getCurrentUsername());
        version.setUpdatedDate(LocalDateTime.now());
        
        documentVersionRepository.save(version);
    }

    // Helper methods
    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !authentication.getPrincipal().equals("anonymousUser")) {
            return authentication.getName();
        }
        return "system";
    }

    private boolean isValidFileType(String contentType) {
        return contentType != null && (
            contentType.equals("application/pdf") ||
            contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
            contentType.equals("application/msword") ||
            contentType.equals("text/plain") ||
            contentType.equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") ||
            contentType.equals("application/vnd.ms-powerpoint") ||
            contentType.equals("image/jpeg") ||
            contentType.equals("image/png") ||
            contentType.equals("image/gif") ||
            contentType.equals("video/mp4") ||
            contentType.equals("audio/mpeg")
        );
    }

    // Statistics methods
    public List<Object[]> getDocumentTypeStatistics() {
        return documentRepository.getDocumentTypeStatistics();
    }

    public List<Object[]> getDocumentLanguageStatistics() {
        return documentRepository.getDocumentLanguageStatistics();
    }

    public Long getTotalDocumentCount() {
        return documentRepository.countByIsActiveTrue();
    }

    public Long getPublicDocumentCount() {
        return documentRepository.countByIsPublicTrueAndIsActiveTrue();
    }

    public Long getRecentDocumentCount(int days) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(days);
        return documentRepository.countByCreationDateAfterAndIsActiveTrue(cutoffDate);
    }
} 