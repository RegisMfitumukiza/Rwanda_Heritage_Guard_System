package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.dto.SiteMediaDTO;
import com.rwandaheritage.heritageguard.model.SiteMedia;
import com.rwandaheritage.heritageguard.service.SiteMediaService;
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

    @Autowired
    public SiteMediaController(SiteMediaService siteMediaService) {
        this.siteMediaService = siteMediaService;
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
        
        Resource fileResource = siteMediaService.loadMediaFile(id);
        if (fileResource == null) {
            System.out.println("File resource is null for media ID: " + id);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found or access denied");
        }
        if (!fileResource.exists()) {
            System.out.println("File does not exist on disk for media ID: " + id);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found on disk");
        }
        
        // Try to get original filename from DB
        Optional<SiteMedia> mediaOpt = siteMediaService.getSiteMediaById(id);
        if (mediaOpt.isEmpty()) {
            System.out.println("Media not found in database for ID: " + id);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Media not found");
        }
        
        SiteMedia media = mediaOpt.get();
        System.out.println("Media found: " + media.getFileName() + ", isPublic: " + media.isPublic() + ", fileType: " + media.getFileType());
        
        String fileName = media.getFileName();
        String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8);
        
        // Determine content type based on file type
        String contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        if (media.getFileType() != null && media.getFileType().startsWith("image/")) {
            contentType = media.getFileType();
        } else if (media.getFileType() != null && media.getFileType().startsWith("video/")) {
            contentType = media.getFileType();
        }
        
        // For images and videos, use inline display; for documents, use attachment
        String contentDisposition = "inline";
        if (media.getFileType() != null && 
            (media.getFileType().startsWith("application/") || 
             media.getFileType().startsWith("text/"))) {
            contentDisposition = "attachment; filename=\"" + encodedFileName + "\"";
        }
        
        System.out.println("Serving media with contentType: " + contentType + ", disposition: " + contentDisposition);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
                .contentType(MediaType.parseMediaType(contentType))
                .body(fileResource);
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