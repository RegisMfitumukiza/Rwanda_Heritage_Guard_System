package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.dto.DocumentDTO;
import com.rwandaheritage.heritageguard.dto.DocumentVersionDTO;
import com.rwandaheritage.heritageguard.mapper.DocumentMapper;
import com.rwandaheritage.heritageguard.mapper.DocumentVersionMapper;
import com.rwandaheritage.heritageguard.model.Document;
import com.rwandaheritage.heritageguard.model.DocumentVersion;
import com.rwandaheritage.heritageguard.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.access.prepost.PreAuthorize;
import com.rwandaheritage.heritageguard.repository.FolderRepository;
import org.springframework.web.server.ResponseStatusException;
import jakarta.validation.Valid;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {
    @Autowired
    private DocumentService documentService;
    @Autowired
    private FolderRepository folderRepository;

    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR') or hasRole('HERITAGE_MANAGER') or hasRole('CONTENT_MANAGER')")
    @PostMapping
    public ResponseEntity<DocumentDTO> createDocument(@Valid @RequestBody DocumentDTO documentDTO) {
        try {
            Document doc = DocumentMapper.toEntity(documentDTO);
            // Set folder if folderId is provided
            if (documentDTO.getFolderId() != null) {
                doc.setFolder(folderRepository.findById(documentDTO.getFolderId()).orElse(null));
            }
            Document created = documentService.createDocument(doc);
            return ResponseEntity.status(HttpStatus.CREATED).body(DocumentMapper.toDTO(created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentDTO> getDocument(@PathVariable Long id) {
        Optional<Document> doc = documentService.getDocument(id);
        if (doc.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(DocumentMapper.toDTO(doc.get()));
    }

    @GetMapping
    public ResponseEntity<List<DocumentDTO>> listDocuments() {
        List<DocumentDTO> documents = documentService.listDocuments().stream()
            .map(DocumentMapper::toDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/folder/{folderId}")
    public ResponseEntity<List<DocumentDTO>> listDocumentsByFolder(@PathVariable Long folderId) {
        List<DocumentDTO> documents = documentService.listDocumentsByFolder(folderId).stream()
            .map(DocumentMapper::toDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(documents);
    }

    // New search and filtering endpoints
    @GetMapping("/search")
    public ResponseEntity<List<DocumentDTO>> searchDocuments(@RequestParam(required = false) String q) {
        List<DocumentDTO> documents = documentService.searchDocuments(q).stream()
            .map(DocumentMapper::toDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/filter")
    public ResponseEntity<List<DocumentDTO>> filterDocuments(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) Boolean isPublic) {
        List<DocumentDTO> documents = documentService.filterDocuments(type, language, author, isPublic).stream()
            .map(DocumentMapper::toDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<DocumentDTO>> getDocumentsByType(@PathVariable String type) {
        List<DocumentDTO> documents = documentService.getDocumentsByType(type).stream()
            .map(DocumentMapper::toDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/language/{language}")
    public ResponseEntity<List<DocumentDTO>> getDocumentsByLanguage(@PathVariable String language) {
        List<DocumentDTO> documents = documentService.getDocumentsByLanguage(language).stream()
            .map(DocumentMapper::toDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/author/{author}")
    public ResponseEntity<List<DocumentDTO>> getDocumentsByAuthor(@PathVariable String author) {
        List<DocumentDTO> documents = documentService.getDocumentsByAuthor(author).stream()
            .map(DocumentMapper::toDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/public")
    public ResponseEntity<List<DocumentDTO>> getPublicDocuments() {
        List<DocumentDTO> documents = documentService.getPublicDocuments().stream()
            .map(DocumentMapper::toDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/creator/{createdBy}")
    public ResponseEntity<List<DocumentDTO>> getDocumentsByCreator(@PathVariable String createdBy) {
        List<DocumentDTO> documents = documentService.getDocumentsByCreator(createdBy).stream()
            .map(DocumentMapper::toDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<DocumentDTO>> getDocumentsByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
            LocalDateTime start = LocalDateTime.parse(startDate, formatter);
            LocalDateTime end = LocalDateTime.parse(endDate, formatter);
            
            List<DocumentDTO> documents = documentService.getDocumentsByDateRange(start, end).stream()
                .map(DocumentMapper::toDTO)
                .collect(Collectors.toList());
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Statistics endpoints
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getDocumentStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalDocuments", documentService.getTotalDocumentCount());
        stats.put("publicDocuments", documentService.getPublicDocumentCount());
        stats.put("privateDocuments", documentService.getTotalDocumentCount() - documentService.getPublicDocumentCount());
        stats.put("recentDocuments", documentService.getRecentDocumentCount(30)); // Last 30 days
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/statistics/types")
    public ResponseEntity<List<Object[]>> getDocumentTypeStatistics() {
        return ResponseEntity.ok(documentService.getDocumentTypeStatistics());
    }

    @GetMapping("/statistics/languages")
    public ResponseEntity<List<Object[]>> getDocumentLanguageStatistics() {
        return ResponseEntity.ok(documentService.getDocumentLanguageStatistics());
    }

    @GetMapping("/types")
    public ResponseEntity<List<String>> getDocumentTypes() {
        List<String> types = List.of("PDF", "DOCX", "DOC", "TXT", "XLSX", "PPTX", "JPG", "PNG", "GIF", "MP4", "MP3");
        return ResponseEntity.ok(types);
    }

    @GetMapping("/languages")
    public ResponseEntity<List<String>> getSupportedLanguages() {
        List<String> languages = List.of("en", "rw", "fr");
        return ResponseEntity.ok(languages);
    }

    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR') or hasRole('HERITAGE_MANAGER') or hasRole('CONTENT_MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<DocumentDTO> updateDocument(@PathVariable Long id, @Valid @RequestBody DocumentDTO documentDTO) {
        try {
            Document updated = documentService.updateDocument(id, DocumentMapper.toEntity(documentDTO));
            return ResponseEntity.ok(DocumentMapper.toDTO(updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR') or hasRole('HERITAGE_MANAGER') or hasRole('CONTENT_MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        try {
            documentService.deleteDocument(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Versioning endpoints
    @PostMapping("/{id}/versions")
    public ResponseEntity<DocumentVersionDTO> addVersion(@PathVariable Long id, @Valid @RequestBody DocumentVersionDTO versionDTO) {
        try {
            DocumentVersion version = DocumentVersionMapper.toEntity(versionDTO);
            DocumentVersion created = documentService.addVersion(id, version);
            return ResponseEntity.status(HttpStatus.CREATED).body(DocumentVersionMapper.toDTO(created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}/versions")
    public ResponseEntity<List<DocumentVersionDTO>> listVersions(@PathVariable Long id) {
        List<DocumentVersionDTO> versions = documentService.listVersions(id).stream()
            .map(DocumentVersionMapper::toDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(versions);
    }

    @GetMapping("/{id}/versions/latest")
    public ResponseEntity<DocumentVersionDTO> getLatestVersion(@PathVariable Long id) {
        Optional<DocumentVersion> version = documentService.getLatestVersion(id);
        return version.map(v -> ResponseEntity.ok(DocumentVersionMapper.toDTO(v)))
                     .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/versions/{versionId}")
    public ResponseEntity<DocumentVersionDTO> getVersion(@PathVariable Long versionId) {
        Optional<DocumentVersion> version = documentService.getVersion(versionId);
        return version.map(v -> ResponseEntity.ok(DocumentVersionMapper.toDTO(v)))
                     .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR') or hasRole('HERITAGE_MANAGER') or hasRole('CONTENT_MANAGER')")
    @PostMapping("/{id}/versions/upload")
    public ResponseEntity<DocumentVersionDTO> uploadVersion(@PathVariable Long id, @RequestParam("file") MultipartFile file, @RequestParam(required = false) String createdBy) throws IOException {
        try {
            DocumentVersion version = documentService.storeVersionFile(id, file, createdBy);
            return ResponseEntity.status(HttpStatus.CREATED).body(DocumentVersionMapper.toDTO(version));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadLatestVersion(@PathVariable Long id) throws IOException {
        try {
            Optional<DocumentVersion> version = documentService.getLatestVersion(id);
            if (version.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Resource resource = documentService.loadVersionFile(version.get().getId());
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + version.get().getFilePath().substring(version.get().getFilePath().lastIndexOf('/') + 1) + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}/versions/{versionId}/download")
    public ResponseEntity<Resource> downloadVersion(@PathVariable Long id, @PathVariable Long versionId) throws IOException {
        try {
            Optional<DocumentVersion> version = documentService.getVersion(versionId);
            if (version.isEmpty() || !version.get().getDocument().getId().equals(id)) {
                return ResponseEntity.notFound().build();
            }
            
            Resource resource = documentService.loadVersionFile(versionId);
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + version.get().getFilePath().substring(version.get().getFilePath().lastIndexOf('/') + 1) + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR') or hasRole('HERITAGE_MANAGER') or hasRole('CONTENT_MANAGER')")
    @DeleteMapping("/versions/{versionId}")
    public ResponseEntity<Void> deleteVersion(@PathVariable Long versionId) {
        try {
            documentService.deleteVersion(versionId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 