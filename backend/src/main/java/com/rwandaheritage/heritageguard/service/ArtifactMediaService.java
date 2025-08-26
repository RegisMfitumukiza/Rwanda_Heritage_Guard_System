package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.dto.ArtifactMediaDTO;
import com.rwandaheritage.heritageguard.model.Artifact;
import com.rwandaheritage.heritageguard.model.ArtifactMedia;
import com.rwandaheritage.heritageguard.repository.ArtifactMediaRepository;
import com.rwandaheritage.heritageguard.repository.ArtifactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ArtifactMediaService {
    private final ArtifactMediaRepository artifactMediaRepository;
    private final ArtifactRepository artifactRepository;

    @Value("${artifact.media.upload.dir:E:/RWANDA_ARTIFACT_MEDIA}")
    private String mediaUploadDir;

    @Autowired
    public ArtifactMediaService(ArtifactMediaRepository artifactMediaRepository, ArtifactRepository artifactRepository) {
        this.artifactMediaRepository = artifactMediaRepository;
        this.artifactRepository = artifactRepository;
    }

    // Upload media (image/3D model)
    public ArtifactMedia uploadMedia(Long artifactId, MultipartFile file, Boolean isPublic, String description) throws IOException {
        Artifact artifact = artifactRepository.findById(artifactId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Artifact not found"));
        validateFile(file);
        // Ensure upload directory exists
        String uploadDir = mediaUploadDir + "/" + artifactId;
        Path uploadPath = Paths.get(uploadDir);
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
        // Create ArtifactMedia
        ArtifactMedia media = ArtifactMedia.builder()
            .artifact(artifact)
            .filePath(filePath.toString())
            .isPublic(isPublic != null ? isPublic : false)
            .description(description)
            .build();
        return artifactMediaRepository.save(media);
    }

    // Get media by ID
    public Optional<ArtifactMedia> getMedia(Long mediaId) {
        Optional<ArtifactMedia> mediaOpt = artifactMediaRepository.findById(mediaId);
        if (mediaOpt.isEmpty()) return Optional.empty();
        ArtifactMedia media = mediaOpt.get();
        if (!canView(media)) {
            throw new AccessDeniedException("You do not have permission to view this media.");
        }
        return Optional.of(media);
    }

    // List all media for an artifact
    public List<ArtifactMedia> listMedia(Long artifactId) {
        List<ArtifactMedia> all = artifactMediaRepository.findByArtifactId(artifactId);
        return all.stream().filter(this::canView).toList();
    }

    // Delete media
    public void deleteMedia(Long artifactId, Long mediaId) {
        ArtifactMedia media = artifactMediaRepository.findById(mediaId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Media not found"));

        if (!media.getArtifact().getId().equals(artifactId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Media does not belong to artifact");
        }
        enforceCanDelete(media);
        // Delete file from disk
        Path filePath = Paths.get(media.getFilePath());
        try {
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log and continue
        }
        artifactMediaRepository.deleteById(mediaId);
    }

    // Download media file
    public Resource loadMediaFile(Long mediaId) {
        ArtifactMedia media = artifactMediaRepository.findById(mediaId).orElse(null);
        if (media == null) return null;
        if (!canView(media)) {
            throw new AccessDeniedException("You do not have permission to download this file.");
        }
        Path filePath = Paths.get(media.getFilePath());
        if (!Files.exists(filePath)) return null;
        return new FileSystemResource(filePath);
    }

    /**
     * Update media metadata (description, isPublic)
     */
    public ArtifactMedia updateMediaMetadata(Long artifactId, Long mediaId, ArtifactMediaDTO dto) {
        // Get the media
        ArtifactMedia media = artifactMediaRepository.findById(mediaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Media not found"));

        // Verify it belongs to the specified artifact
        if (!media.getArtifact().getId().equals(artifactId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Media does not belong to the specified artifact");
        }

        // Update fields
        if (dto.getDescription() != null) {
            media.setDescription(dto.getDescription());
        }
        if (dto.getIsPublic() != null) {
            media.setIsPublic(dto.getIsPublic());
        }
        return artifactMediaRepository.save(media);
    }

    /**
     * Replace media file
     */
    public ArtifactMedia replaceMediaFile(Long artifactId, Long mediaId, MultipartFile file) throws IOException {
        // Get the media
        ArtifactMedia media = artifactMediaRepository.findById(mediaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Media not found"));

        // Verify it belongs to the specified artifact
        if (!media.getArtifact().getId().equals(artifactId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Media does not belong to the specified artifact");
        }

        // Validate file
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File cannot be empty");
        }

        // Validate file type
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid filename");
        }

        String fileExtension = getFileExtension(originalFilename);
        if (!isValidMediaFile(fileExtension)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file type. Allowed: images and 3D models");
        }

        // Delete old file
        String oldFilePath = media.getFilePath();
        if (oldFilePath != null) {
            File oldFile = new File(oldFilePath);
            if (oldFile.exists()) {
                oldFile.delete();
            }
        }

        // Create directory if it doesn't exist
        String uploadDir = mediaUploadDir + "/" + artifactId;
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        // Generate new filename
        String newFilename = UUID.randomUUID().toString() + fileExtension;
        String newFilePath = uploadDir + "/" + newFilename;

        // Save new file
        File dest = new File(newFilePath);
        file.transferTo(dest);

        // Update media record
        media.setFilePath(newFilePath);

        return artifactMediaRepository.save(media);
    }

    // --- Validation and Access Control ---
    private void validateFile(MultipartFile file) {
        if (file.getSize() > 20 * 1024 * 1024) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File size exceeds 20MB limit.");
        }
        String fileType = file.getContentType();
        if (fileType == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unable to determine file type.");
        }
        if (!fileType.startsWith("image/") &&
            !fileType.equals("model/gltf-binary") &&
            !fileType.equals("model/gltf+json") &&
            !fileType.equals("application/octet-stream")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file type. Allowed: images and GLB/GLTF models.");
        }
    }

    private boolean canView(ArtifactMedia media) {
        if (media.getIsPublic() != null && media.getIsPublic()) {
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

    private void enforceCanDelete(ArtifactMedia media) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new AccessDeniedException("You must be logged in to delete media.");
        }
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_SYSTEM_ADMINISTRATOR"));
        boolean isManager = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_HERITAGE_MANAGER"));
        if (!isAdmin && !isManager) {
            throw new AccessDeniedException("You do not have permission to delete this media file.");
        }
    }

    /**
     * Get file extension from filename
     */
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.'));
    }

    /**
     * Validate if file extension is allowed for media files
     */
    private boolean isValidMediaFile(String extension) {
        String ext = extension.toLowerCase();
        // Image extensions
        if (ext.equals(".jpg") || ext.equals(".jpeg") || ext.equals(".png") || ext.equals(".gif") || 
            ext.equals(".bmp") || ext.equals(".webp")) {
            return true;
        }
        // 3D model extensions
        if (ext.equals(".glb") || ext.equals(".gltf") || ext.equals(".obj") || ext.equals(".fbx")) {
            return true;
        }
        return false;
    }
} 