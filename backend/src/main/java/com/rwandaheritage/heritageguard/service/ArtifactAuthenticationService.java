package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.model.Artifact;
import com.rwandaheritage.heritageguard.model.ArtifactAuthentication;
import com.rwandaheritage.heritageguard.repository.ArtifactAuthenticationRepository;
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
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ArtifactAuthenticationService {
    private final ArtifactAuthenticationRepository artifactAuthenticationRepository;
    private final ArtifactRepository artifactRepository;

    @Value("${authentication.document.upload.dir:E:/RWANDA_AUTH_DOCS}")
    private String authDocumentUploadDir;

    @Autowired
    public ArtifactAuthenticationService(ArtifactAuthenticationRepository artifactAuthenticationRepository, ArtifactRepository artifactRepository) {
        this.artifactAuthenticationRepository = artifactAuthenticationRepository;
        this.artifactRepository = artifactRepository;
    }

    // Add authentication record with file upload
    public ArtifactAuthentication addAuthentication(Long artifactId, ArtifactAuthentication authentication, MultipartFile documentFile) throws IOException {
        enforceCanAdd();
        Artifact artifact = artifactRepository.findById(artifactId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Artifact not found"));

        // Validation
        if (authentication.getStatus() == null || authentication.getStatus().isBlank() ||
            authentication.getDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status and date are required");
        }

        // Handle file upload if provided
        if (documentFile != null && !documentFile.isEmpty()) {
            validateDocumentFile(documentFile);
            String filePath = saveDocumentFile(artifactId, documentFile);
            authentication.setDocumentFilePath(filePath);
        }

        authentication.setArtifact(artifact);

        return artifactAuthenticationRepository.save(authentication);
    }

    // Add authentication record without file (existing method for backward compatibility)
    public ArtifactAuthentication addAuthentication(Long artifactId, ArtifactAuthentication authentication) {
        try {
            return addAuthentication(artifactId, authentication, null);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error processing authentication");
        }
    }

    // Save document file to disk
    private String saveDocumentFile(Long artifactId, MultipartFile file) throws IOException {
        // Create directory structure: E:/RWANDA_AUTH_DOCS/artifact_{artifactId}/
        String uploadDir = authDocumentUploadDir + "/artifact_" + artifactId;
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

    // Add this method for future authentication updates
    public ArtifactAuthentication updateAuthentication(Long artifactId, Long authenticationId, ArtifactAuthentication updated) {
        ArtifactAuthentication authEntity = artifactAuthenticationRepository.findById(authenticationId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Authentication record not found"));

        if (updated.getStatus() != null) authEntity.setStatus(updated.getStatus());
        if (updated.getDate() != null) authEntity.setDate(updated.getDate());
        if (updated.getDocumentation() != null) authEntity.setDocumentation(updated.getDocumentation());
        if (updated.getDocumentFilePath() != null) authEntity.setDocumentFilePath(updated.getDocumentFilePath());

        return artifactAuthenticationRepository.save(authEntity);
    }

    // Get authentication record by ID
    public Optional<ArtifactAuthentication> getAuthentication(Long authenticationId) {
        Optional<ArtifactAuthentication> authOpt = artifactAuthenticationRepository.findById(authenticationId);
        if (authOpt.isEmpty()) return Optional.empty();
        ArtifactAuthentication authentication = authOpt.get();
        if (!canView(authentication)) {
            throw new AccessDeniedException("You do not have permission to view this authentication record.");
        }
        return Optional.of(authentication);
    }

    // List all authentication records for an artifact
    public List<ArtifactAuthentication> listAuthentications(Long artifactId) {
        List<ArtifactAuthentication> all = artifactAuthenticationRepository.findByArtifactId(artifactId);
        return all.stream().filter(this::canView).toList();
    }

    // Delete authentication record
    public void deleteAuthentication(Long artifactId, Long authenticationId) {
        ArtifactAuthentication authentication = artifactAuthenticationRepository.findById(authenticationId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Authentication record not found"));
        if (!authentication.getArtifact().getId().equals(artifactId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Authentication record does not belong to artifact");
        }
        enforceCanDelete();
        
        // Delete associated file if exists
        if (authentication.getDocumentFilePath() != null) {
            try {
                Path filePath = Paths.get(authentication.getDocumentFilePath());
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                // Log and continue with deletion
            }
        }
        
        artifactAuthenticationRepository.deleteById(authenticationId);
    }

    // --- Access Control ---
    private void enforceCanAdd() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new AccessDeniedException("You must be logged in to add authentication records.");
        }
        boolean allowed = auth.getAuthorities().stream().anyMatch(a ->
            a.getAuthority().equals("ROLE_SYSTEM_ADMINISTRATOR") ||
            a.getAuthority().equals("ROLE_HERITAGE_MANAGER")
        );
        if (!allowed) {
            throw new AccessDeniedException("You do not have permission to add authentication records.");
        }
    }

    private void enforceCanDelete() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new AccessDeniedException("You must be logged in to delete authentication records.");
        }
        boolean allowed = auth.getAuthorities().stream().anyMatch(a ->
            a.getAuthority().equals("ROLE_SYSTEM_ADMINISTRATOR") ||
            a.getAuthority().equals("ROLE_HERITAGE_MANAGER")
        );
        if (!allowed) {
            throw new AccessDeniedException("You do not have permission to delete authentication records.");
        }
    }

    private boolean canView(ArtifactAuthentication authentication) {
        // Anyone who can view the parent artifact can view this
        Artifact artifact = authentication.getArtifact();
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