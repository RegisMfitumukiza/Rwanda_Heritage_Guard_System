package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.model.Artifact;
import com.rwandaheritage.heritageguard.model.ProvenanceRecord;
import com.rwandaheritage.heritageguard.repository.ProvenanceRecordRepository;
import com.rwandaheritage.heritageguard.repository.ArtifactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProvenanceRecordService {
    private final ProvenanceRecordRepository provenanceRecordRepository;
    private final ArtifactRepository artifactRepository;

    @Value("${provenance.document.upload.dir:E:/RWANDA_PROVENANCE_DOCS}")
    private String provenanceDocumentUploadDir;

    @Autowired
    public ProvenanceRecordService(ProvenanceRecordRepository provenanceRecordRepository, ArtifactRepository artifactRepository) {
        this.provenanceRecordRepository = provenanceRecordRepository;
        this.artifactRepository = artifactRepository;
    }

    // Add provenance record with file upload
    public ProvenanceRecord addProvenanceRecord(Long artifactId, ProvenanceRecord record, MultipartFile documentFile) throws IOException {
        enforceCanAdd();
        Artifact artifact = artifactRepository.findById(artifactId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Artifact not found"));

        validateProvenanceRecord(record);

        if (documentFile != null && !documentFile.isEmpty()) {
            validateDocumentFile(documentFile);
            String filePath = saveDocumentFile(artifactId, documentFile);
            record.setDocumentFilePath(filePath);
        }

        record.setArtifact(artifact);
        return provenanceRecordRepository.save(record);
    }

    // Add provenance record without file (existing method for backward compatibility)
    public ProvenanceRecord addProvenanceRecord(Long artifactId, ProvenanceRecord record) {
        try {
            return addProvenanceRecord(artifactId, record, null);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error processing provenance record");
        }
    }

    // Save document file to disk
    private String saveDocumentFile(Long artifactId, MultipartFile file) throws IOException {
        // Create directory structure: E:/RWANDA_PROVENANCE_DOCS/artifact_{artifactId}/
        String uploadDir = provenanceDocumentUploadDir + "/artifact_" + artifactId;
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf('.'));
        }
        String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
        Path filePath = uploadPath.resolve(uniqueFilename);

        // Save file
        file.transferTo(filePath.toFile());
        return filePath.toString();
    }

    // Validate provenance record
    private void validateProvenanceRecord(ProvenanceRecord record) {
        if (record.getHistory() == null || record.getHistory().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "History is required");
        }
        
        if (record.getEventDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event date is required");
        }

        if (record.getEventDate().isAfter(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event date cannot be in the future");
        }

        if (record.getPreviousOwner() == null || record.getPreviousOwner().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Previous owner is required");
        }

        if (record.getNewOwner() == null || record.getNewOwner().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New owner is required");
        }
    }

    // Validate document file
    private void validateDocumentFile(MultipartFile file) {
        if (file.getSize() > 10 * 1024 * 1024) { // 10MB limit
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Document file size exceeds 10MB limit");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid filename");
        }

        String fileExtension = getFileExtension(originalFilename);
        if (!isValidDocumentFile(fileExtension)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file type. Allowed: PDF, DOC, DOCX, JPG, PNG");
        }
    }

    // Get file extension
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.')).toLowerCase();
    }

    // Validate if file extension is allowed
    private boolean isValidDocumentFile(String extension) {
        return extension.equals(".pdf") || extension.equals(".doc") || extension.equals(".docx") ||
               extension.equals(".jpg") || extension.equals(".jpeg") || extension.equals(".png");
    }

    // Get provenance record by ID
    public Optional<ProvenanceRecord> getProvenanceRecord(Long recordId) {
        Optional<ProvenanceRecord> recordOpt = provenanceRecordRepository.findById(recordId);
        if (recordOpt.isEmpty()) return Optional.empty();
        ProvenanceRecord record = recordOpt.get();
        if (!canView(record)) {
            throw new AccessDeniedException("You do not have permission to view this provenance record.");
        }
        return Optional.of(record);
    }

    // List all provenance records for an artifact
    public List<ProvenanceRecord> listProvenanceRecords(Long artifactId) {
        List<ProvenanceRecord> all = provenanceRecordRepository.findByArtifactId(artifactId);
        return all.stream().filter(this::canView).toList();
    }

    // Delete provenance record
    public void deleteProvenanceRecord(Long artifactId, Long recordId) {
        ProvenanceRecord record = provenanceRecordRepository.findById(recordId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Provenance record not found"));
        if (!record.getArtifact().getId().equals(artifactId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Provenance record does not belong to artifact");
        }
        enforceCanDelete();
        
        // Delete associated file if exists
        if (record.getDocumentFilePath() != null) {
            try {
                Path filePath = Paths.get(record.getDocumentFilePath());
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                // Log and continue with deletion
            }
        }
        
        provenanceRecordRepository.deleteById(recordId);
    }

    // --- Access Control ---
    private void enforceCanAdd() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new AccessDeniedException("You must be logged in to add provenance records.");
        }
        boolean allowed = auth.getAuthorities().stream().anyMatch(a ->
            a.getAuthority().equals("ROLE_SYSTEM_ADMINISTRATOR") ||
            a.getAuthority().equals("ROLE_HERITAGE_MANAGER")
        );
        if (!allowed) {
            throw new AccessDeniedException("You do not have permission to add provenance records.");
        }
    }

    private void enforceCanDelete() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new AccessDeniedException("You must be logged in to delete provenance records.");
        }
        boolean allowed = auth.getAuthorities().stream().anyMatch(a ->
            a.getAuthority().equals("ROLE_SYSTEM_ADMINISTRATOR") ||
            a.getAuthority().equals("ROLE_HERITAGE_MANAGER")
        );
        if (!allowed) {
            throw new AccessDeniedException("You do not have permission to delete provenance records.");
        }
    }

    private boolean canView(ProvenanceRecord record) {
        // Anyone who can view the parent artifact can view this
        Artifact artifact = record.getArtifact();
        if (artifact == null) return false;
        if (artifact.getIsPublic() != null && artifact.getIsPublic()) {
            return true;
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return false;
        }
        for (GrantedAuthority authority : auth.getAuthorities()) {
            String role = authority.getAuthority();
            if (role.equals("ROLE_SYSTEM_ADMINISTRATOR") || role.equals("ROLE_HERITAGE_MANAGER") ||
                role.equals("ROLE_CONTENT_MANAGER") || role.equals("ROLE_COMMUNITY_MEMBER")) {
                return true;
            }
        }
        return false;
    }
}
