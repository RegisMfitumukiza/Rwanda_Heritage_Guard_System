package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.dto.ArtifactMediaDTO;
import com.rwandaheritage.heritageguard.mapper.ArtifactMediaMapper;
import com.rwandaheritage.heritageguard.model.ArtifactMedia;
import com.rwandaheritage.heritageguard.service.ArtifactMediaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/artifacts/{artifactId}/media")
public class ArtifactMediaController {
    private final ArtifactMediaService artifactMediaService;

    @Autowired
    public ArtifactMediaController(ArtifactMediaService artifactMediaService) {
        this.artifactMediaService = artifactMediaService;
    }

    /**
     * Upload media file
     * Only SYSTEM_ADMINISTRATOR and HERITAGE_MANAGER can upload
     */
    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER')")
    public ResponseEntity<ArtifactMediaDTO> uploadMedia(
            @PathVariable Long artifactId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "isPublic", required = false) Boolean isPublic,
            @RequestParam(value = "description", required = false) String description
    ) throws IOException {
        ArtifactMedia media = artifactMediaService.uploadMedia(artifactId, file, isPublic, description);
        return new ResponseEntity<>(ArtifactMediaMapper.toDTO(media), HttpStatus.CREATED);
    }

    /**
     * List all media for an artifact (filtered by access)
     */
    @GetMapping
    public ResponseEntity<List<ArtifactMediaDTO>> listMedia(@PathVariable Long artifactId) {
        List<ArtifactMedia> mediaList = artifactMediaService.listMedia(artifactId);
        List<ArtifactMediaDTO> dtos = mediaList.stream().map(ArtifactMediaMapper::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Get media metadata by ID
     */
    @GetMapping("/{mediaId}")
    public ResponseEntity<ArtifactMediaDTO> getMedia(@PathVariable Long artifactId, @PathVariable Long mediaId) {
        Optional<ArtifactMedia> mediaOpt = artifactMediaService.getMedia(mediaId);
        if (mediaOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Media not found");
        }
        return ResponseEntity.ok(ArtifactMediaMapper.toDTO(mediaOpt.get()));
    }

    /**
     * Download media file
     * Only allowed for users with access
     */
    @GetMapping("/{mediaId}/download")
    public ResponseEntity<Resource> downloadMedia(@PathVariable Long artifactId, @PathVariable Long mediaId) {
        Resource file = artifactMediaService.loadMediaFile(mediaId);
        if (file == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + file.getFilename())
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(file);
    }

    /**
     * Delete media
     * Only SYSTEM_ADMINISTRATOR or HERITAGE_MANAGER can delete
     */
    @DeleteMapping("/{mediaId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER')")
    public ResponseEntity<Void> deleteMedia(@PathVariable Long artifactId, @PathVariable Long mediaId) {
        artifactMediaService.deleteMedia(artifactId, mediaId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Update media metadata (description, isPublic)
     * Only SYSTEM_ADMINISTRATOR or HERITAGE_MANAGER can update
     */
    @PatchMapping("/{mediaId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER')")
    public ResponseEntity<ArtifactMediaDTO> updateMediaMetadata(
            @PathVariable Long artifactId,
            @PathVariable Long mediaId,
            @RequestBody ArtifactMediaDTO dto
    ) {
        ArtifactMedia updated = artifactMediaService.updateMediaMetadata(artifactId, mediaId, dto);
        return ResponseEntity.ok(ArtifactMediaMapper.toDTO(updated));
    }

    /**
     * Replace media file
     * Only SYSTEM_ADMINISTRATOR or HERITAGE_MANAGER can replace
     */
    @PutMapping("/{mediaId}/file")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER')")
    public ResponseEntity<ArtifactMediaDTO> replaceMediaFile(
            @PathVariable Long artifactId,
            @PathVariable Long mediaId,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        ArtifactMedia updated = artifactMediaService.replaceMediaFile(artifactId, mediaId, file);
        return ResponseEntity.ok(ArtifactMediaMapper.toDTO(updated));
    }
} 
