package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.model.HeritageSite;
import com.rwandaheritage.heritageguard.model.SiteMedia;
import com.rwandaheritage.heritageguard.repository.HeritageSiteRepository;
import com.rwandaheritage.heritageguard.repository.SiteMediaRepository;
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
public class SiteMediaService {
    private final SiteMediaRepository siteMediaRepository;
    private final HeritageSiteRepository heritageSiteRepository;

    private final String mediaUploadDir;

    @Autowired
    public SiteMediaService(SiteMediaRepository siteMediaRepository, HeritageSiteRepository heritageSiteRepository,
                           @Value("${media.upload.dir:uploads/media}") String mediaUploadDir) {
        this.siteMediaRepository = siteMediaRepository;
        this.heritageSiteRepository = heritageSiteRepository;
        this.mediaUploadDir = mediaUploadDir;
    }

    public SiteMedia createSiteMedia(SiteMedia media) {
        // Set uploader
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            media.setUploaderUsername(auth.getName());
        }
        return siteMediaRepository.save(media);
    }

    public Optional<SiteMedia> getSiteMediaById(Long id) {
        Optional<SiteMedia> mediaOpt = siteMediaRepository.findById(id);
        if (!mediaOpt.isPresent()) return Optional.empty();
        SiteMedia media = mediaOpt.get();
        if (isPublicUser() && !media.isPublic()) {
            // Public users cannot access private media
            return Optional.empty();
        }
        return Optional.of(media);
    }

    public List<SiteMedia> getAllSiteMedia() {
        List<SiteMedia> allMedia = siteMediaRepository.findAll();
        if (isPublicUser()) {
            // Only return public media for public users
            return allMedia.stream().filter(SiteMedia::isPublic).collect(Collectors.toList());
        }
        return allMedia;
    }
    
    /**
     * Get media files for a specific heritage site.
     * This method respects user permissions and only returns media the user can access.
     */
    public List<SiteMedia> getMediaByHeritageSiteId(Long heritageSiteId) {
        // Get media for the site
        List<SiteMedia> siteMedia = siteMediaRepository.findByHeritageSiteIdAndIsActiveTrue(heritageSiteId);
        
        if (isPublicUser()) {
            // Only return public media for public users
            return siteMedia.stream().filter(SiteMedia::isPublic).collect(Collectors.toList());
        }
        
        return siteMedia;
    }

    public SiteMedia updateSiteMedia(SiteMedia media) {
        SiteMedia existing = siteMediaRepository.findById(media.getId()).orElse(null);
        if (existing == null) throw new org.springframework.web.server.ResponseStatusException(
            org.springframework.http.HttpStatus.NOT_FOUND, "Media not found");
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
            media.setUploaderUsername(existing.getUploaderUsername()); // Don't allow changing uploader
            return siteMediaRepository.save(media);
        } else {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.FORBIDDEN, "You do not have permission to update this media file.");
        }
    }

    public void deleteSiteMedia(Long id) {
        SiteMedia media = siteMediaRepository.findById(id).orElse(null);
        if (media == null) throw new org.springframework.web.server.ResponseStatusException(
            org.springframework.http.HttpStatus.NOT_FOUND, "Media not found");
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = false, isHeritageManager = false, isUploader = false;
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            String username = auth.getName();
            isUploader = username.equals(media.getUploaderUsername());
            isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_SYSTEM_ADMINISTRATOR"));
            isHeritageManager = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_HERITAGE_MANAGER"));
        }
        if (isAdmin || isHeritageManager || isUploader) {
            siteMediaRepository.deleteById(id);
        } else {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.FORBIDDEN, "You do not have permission to delete this media file.");
        }
    }

    // --- File upload logic ---
    public SiteMedia storeMediaFile(Long siteId, MultipartFile file, String description, String category, String dateTaken, String photographer, boolean isPublic) throws IOException {
        // Ensure upload directory exists
        Path uploadPath = Paths.get(mediaUploadDir);
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
        SiteMedia media = new SiteMedia();
        media.setFileName(originalFilename);
        media.setFileType(file.getContentType());
        media.setFilePath(filePath.toString());
        media.setFileSize(file.getSize());
        media.setDescription(description);
        media.setCategory(category);
        media.setDateTaken(dateTaken);
        media.setPhotographer(photographer);
        media.setIsPublic(isPublic);
        media.setHeritageSite(site);
        // Set uploader
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            media.setUploaderUsername(auth.getName());
        }
        return siteMediaRepository.save(media);
    }

    // --- File download logic ---
    public Resource loadMediaFile(Long mediaId) {
        System.out.println("loadMediaFile called for mediaId: " + mediaId);
        
        SiteMedia media = siteMediaRepository.findById(mediaId).orElse(null);
        if (media == null) {
            System.out.println("Media not found in database for ID: " + mediaId);
            return null;
        }
        
        System.out.println("Media found: " + media.getFileName() + ", isPublic: " + media.isPublic());
        
        boolean isPublic = isPublicUser();
        System.out.println("isPublicUser() returned: " + isPublic);
        
        if (isPublic && !media.isPublic()) {
            // Public users cannot access private media
            System.out.println("Access denied: Public user trying to access private media");
            return null;
        }
        
        File file = new File(media.getFilePath());
        if (!file.exists()) {
            System.out.println("File does not exist on disk: " + media.getFilePath());
            return null;
        }
        
        System.out.println("File exists, returning FileSystemResource");
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

    // Partial update method for updating specific fields only
    public SiteMedia patchSiteMedia(Long id, java.util.Map<String, Object> updates) {
        SiteMedia existing = siteMediaRepository.findById(id).orElse(null);
        if (existing == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.NOT_FOUND, "Media not found");
        }
        
        // Check permissions
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = false, isHeritageManager = false, isUploader = false;
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            String username = auth.getName();
            isUploader = username.equals(existing.getUploaderUsername());
            isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_SYSTEM_ADMINISTRATOR"));
            isHeritageManager = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_HERITAGE_MANAGER"));
        }
        
        if (!(isAdmin || isHeritageManager || isUploader)) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.FORBIDDEN, "You do not have permission to update this media file.");
        }
        
        // Apply updates only to allowed fields
        if (updates.containsKey("description")) {
            existing.setDescription((String) updates.get("description"));
        }
        if (updates.containsKey("category")) {
            existing.setCategory((String) updates.get("category"));
        }
        if (updates.containsKey("dateTaken")) {
            existing.setDateTaken((String) updates.get("dateTaken"));
        }
        if (updates.containsKey("photographer")) {
            existing.setPhotographer((String) updates.get("photographer"));
        }
        if (updates.containsKey("isPublic")) {
            existing.setIsPublic((Boolean) updates.get("isPublic"));
        }
        
        // Set updated by
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            existing.setUpdatedBy(auth.getName());
        }
        
        return siteMediaRepository.save(existing);
    }
} 