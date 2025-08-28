package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.dto.SiteMediaDTO;
import com.rwandaheritage.heritageguard.model.SiteMedia;
import com.rwandaheritage.heritageguard.model.ArtifactMedia;
import com.rwandaheritage.heritageguard.service.SiteMediaService;
import com.rwandaheritage.heritageguard.service.ArtifactMediaService;
import com.rwandaheritage.heritageguard.mapper.SiteMediaMapper;
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
@RequestMapping("/api/media")
public class SiteMediaController {
    private final SiteMediaService siteMediaService;
    private final ArtifactMediaService artifactMediaService;

    @Autowired
    public SiteMediaController(SiteMediaService siteMediaService, ArtifactMediaService artifactMediaService) {
        this.siteMediaService = siteMediaService;
        this.artifactMediaService = artifactMediaService;
    }

    // Public and authenticated users can view
    @GetMapping
    public List<SiteMediaDTO> getAllMedia() {
        return siteMediaService.getAllSiteMedia().stream()
                .map(SiteMediaMapper::toDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public SiteMediaDTO getMediaById(@PathVariable Long id) {
        Optional<SiteMedia> mediaOpt = siteMediaService.getSiteMediaById(id);
        if (mediaOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Site media not found");
        }
        return mediaOpt.map(SiteMediaMapper::toDTO).get();
    }

    // File upload endpoint
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR') or hasRole('HERITAGE_MANAGER') or hasRole('CONTENT_MANAGER')")
    @PostMapping("/upload/{siteId}")
    public ResponseEntity<?> uploadMedia(
            @PathVariable Long siteId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "dateTaken", required = false) String dateTaken,
            @RequestParam(value = "photographer", required = false) String photographer,
            @RequestParam(value = "isPublic", required = false, defaultValue = "true") boolean isPublic
    ) {
        try {
            SiteMedia saved = siteMediaService.storeMediaFile(siteId, file, description, category, dateTaken, photographer, isPublic);
            return ResponseEntity.ok(SiteMediaMapper.toDTO(saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(500).body("File upload failed: " + e.getMessage());
        }
    }

    // File download endpoint
    @GetMapping("/download/{id}")
    public ResponseEntity<?> downloadMedia(@PathVariable Long id) {
        // Add debugging
        System.out.println("Media download requested for ID: " + id);
        
        // First try to find SiteMedia
        Optional<SiteMedia> siteMediaOpt = siteMediaService.getSiteMediaById(id);
        if (siteMediaOpt.isPresent()) {
            SiteMedia media = siteMediaOpt.get();
            System.out.println("SiteMedia found: " + media.getFileName() + ", isPublic: " + media.isPublic() + ", fileType: " + media.getFileType());
            
            Resource fileResource = siteMediaService.loadMediaFile(id);
            if (fileResource == null || !fileResource.exists()) {
                System.out.println("File resource is null or doesn't exist for site media ID: " + id);
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found or access denied");
            }
            
            return buildMediaResponse(media.getFileName(), media.getFileType(), fileResource);
        }
        
        // If not found in SiteMedia, try ArtifactMedia
        Optional<ArtifactMedia> artifactMediaOpt = artifactMediaService.getMedia(id);
        if (artifactMediaOpt.isPresent()) {
            ArtifactMedia media = artifactMediaOpt.get();
            System.out.println("ArtifactMedia found: " + media.getFilePath() + ", isPublic: " + media.getIsPublic());
            
            Resource fileResource = artifactMediaService.loadMediaFile(id);
            if (fileResource == null || !fileResource.exists()) {
                System.out.println("File resource is null or doesn't exist for artifact media ID: " + id);
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found or access denied");
            }
            
            // Extract filename from filePath
            String fileName = media.getFilePath() != null ? media.getFilePath().substring(media.getFilePath().lastIndexOf('\\') + 1) : "artifact_media";
            String fileType = determineFileType(fileName);
            
            return buildMediaResponse(fileName, fileType, fileResource);
        }
        
        // If neither found, return 404
        System.out.println("Media not found in either SiteMedia or ArtifactMedia for ID: " + id);
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Media not found");
    }
    
    // Helper method to build media response
    private ResponseEntity<?> buildMediaResponse(String fileName, String fileType, Resource fileResource) {
        String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8);
        
        // Determine content type based on file type
        String contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        if (fileType != null && fileType.startsWith("image/")) {
            contentType = fileType;
        } else if (fileType != null && fileType.startsWith("video/")) {
            contentType = fileType;
        }
        
        // For images and videos, use inline display; for documents, use attachment
        String contentDisposition = "inline";
        if (fileType != null && 
            (fileType.startsWith("application/") || 
             fileType.startsWith("text/"))) {
            contentDisposition = "attachment; filename=\"" + encodedFileName + "\"";
        }
        
        System.out.println("Serving media with contentType: " + contentType + ", disposition: " + contentDisposition);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
                .contentType(MediaType.parseMediaType(contentType))
                .body(fileResource);
    }
    
    // Helper method to determine file type from filename
    private String determineFileType(String fileName) {
        if (fileName == null) return null;
        
        String extension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
        switch (extension) {
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "png":
                return "image/png";
            case "gif":
                return "image/gif";
            case "webp":
                return "image/webp";
            case "mp4":
                return "video/mp4";
            case "avi":
                return "video/x-msvideo";
            case "mov":
                return "video/quicktime";
            default:
                return "application/octet-stream";
        }
    }

    // Only ADMIN, HERITAGE_MANAGER, CONTENT_MANAGER can create
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR') or hasRole('HERITAGE_MANAGER') or hasRole('CONTENT_MANAGER')")
    @PostMapping
    public SiteMediaDTO createMedia(@Valid @RequestBody SiteMediaDTO mediaDTO) {
        SiteMedia media = SiteMediaMapper.toEntity(mediaDTO);
        SiteMedia saved = siteMediaService.createSiteMedia(media);
        return SiteMediaMapper.toDTO(saved);
    }

    // Only ADMIN, HERITAGE_MANAGER, CONTENT_MANAGER can update
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR') or hasRole('HERITAGE_MANAGER') or hasRole('CONTENT_MANAGER')")
    @PutMapping("/{id}")
    public SiteMediaDTO updateMedia(@PathVariable Long id, @Valid @RequestBody SiteMediaDTO mediaDTO) {
        SiteMedia media = SiteMediaMapper.toEntity(mediaDTO);
        media.setId(id);
        SiteMedia updated = siteMediaService.updateSiteMedia(media);
        return SiteMediaMapper.toDTO(updated);
    }

    // Partial update endpoint for updating specific fields only
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR') or hasRole('HERITAGE_MANAGER') or hasRole('CONTENT_MANAGER')")
    @PatchMapping("/{id}")
    public SiteMediaDTO patchMedia(@PathVariable Long id, @RequestBody java.util.Map<String, Object> updates) {
        SiteMedia updated = siteMediaService.patchSiteMedia(id, updates);
        return SiteMediaMapper.toDTO(updated);
    }

    // Only ADMIN, HERITAGE_MANAGER, CONTENT_MANAGER can delete
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR') or hasRole('HERITAGE_MANAGER') or hasRole('CONTENT_MANAGER')")
    @DeleteMapping("/{id}")
    public void deleteMedia(@PathVariable Long id) {
        siteMediaService.deleteSiteMedia(id);
    }
} 