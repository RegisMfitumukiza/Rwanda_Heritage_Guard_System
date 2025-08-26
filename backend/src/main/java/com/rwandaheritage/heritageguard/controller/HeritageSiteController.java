package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.dto.HeritageSiteDTO;
import com.rwandaheritage.heritageguard.dto.HeritageSiteWithManagerDTO;
import com.rwandaheritage.heritageguard.dto.SiteMediaDTO;
import com.rwandaheritage.heritageguard.dto.SiteDocumentDTO;
import com.rwandaheritage.heritageguard.dto.request.StatusChangeRequest;
import com.rwandaheritage.heritageguard.dto.request.BulkStatusUpdateRequest;
import com.rwandaheritage.heritageguard.dto.response.StatusChangeResponse;
import com.rwandaheritage.heritageguard.dto.response.BulkStatusUpdateResponse;
import com.rwandaheritage.heritageguard.constants.SiteStatus;
import com.rwandaheritage.heritageguard.constants.SiteCategory;
import com.rwandaheritage.heritageguard.model.HeritageSite;
import com.rwandaheritage.heritageguard.model.HeritageSiteManager;
import com.rwandaheritage.heritageguard.model.User;
import com.rwandaheritage.heritageguard.repository.HeritageSiteRepository;
import com.rwandaheritage.heritageguard.service.HeritageSiteService;
// import com.rwandaheritage.heritageguard.service.MultilingualService; // Service doesn't exist
import com.rwandaheritage.heritageguard.service.UserService;
import com.rwandaheritage.heritageguard.service.HeritageSiteManagerService;
import com.rwandaheritage.heritageguard.model.SiteMedia;
import com.rwandaheritage.heritageguard.model.SiteDocument;
import com.rwandaheritage.heritageguard.service.MultilingualIntegrationService;
import com.rwandaheritage.heritageguard.service.SiteMediaService;
import com.rwandaheritage.heritageguard.service.SiteDocumentService;
import com.rwandaheritage.heritageguard.mapper.HeritageSiteMapper;
import com.rwandaheritage.heritageguard.mapper.HeritageSiteWithManagerMapper;
import com.rwandaheritage.heritageguard.mapper.SiteMediaMapper;
import com.rwandaheritage.heritageguard.mapper.SiteDocumentMapper;
import com.rwandaheritage.heritageguard.dto.response.PageResponse;
import com.rwandaheritage.heritageguard.dto.response.PagedResponse;
import com.rwandaheritage.heritageguard.dto.response.SiteChangeHistoryDTO;
import com.rwandaheritage.heritageguard.service.SiteChangeHistoryService;
import com.rwandaheritage.heritageguard.dto.response.HeritageSiteManagerResponseDto;
import com.rwandaheritage.heritageguard.dto.request.AssignManagerDto;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/heritage-sites")
public class HeritageSiteController {
    private static final Logger log = LoggerFactory.getLogger(HeritageSiteController.class);
    
    private final HeritageSiteService heritageSiteService;
    private final MultilingualIntegrationService multilingualService;
    private final SiteMediaService siteMediaService;
    private final SiteDocumentService siteDocumentService;
    private final SiteChangeHistoryService siteChangeHistoryService;
    private final UserService userService;
    private final HeritageSiteManagerService heritageSiteManagerService;
    private final HeritageSiteRepository heritageSiteRepository;

    @Autowired
    public HeritageSiteController(HeritageSiteService heritageSiteService, 
                                 MultilingualIntegrationService multilingualService,
                                 SiteMediaService siteMediaService,
                                 SiteDocumentService siteDocumentService,
                                 SiteChangeHistoryService siteChangeHistoryService,
                                 UserService userService,
                                 HeritageSiteManagerService heritageSiteManagerService,
                                 HeritageSiteRepository heritageSiteRepository) {
        this.heritageSiteService = heritageSiteService;
        this.multilingualService = multilingualService;
        this.siteMediaService = siteMediaService;
        this.siteDocumentService = siteDocumentService;
        this.siteChangeHistoryService = siteChangeHistoryService;
        this.userService = userService;
        this.heritageSiteManagerService = heritageSiteManagerService;
        this.heritageSiteRepository = heritageSiteRepository;
    }

    /**
     * Advanced search/filtering for heritage sites.
     * Public endpoint: No authentication required.
     */
    @GetMapping("/search")
    public PagedResponse<HeritageSiteDTO> searchSites(
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String establishmentYear,
            @RequestParam(required = false) String language,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        User user = authentication != null ? (User) authentication.getPrincipal() : null;
        String userLanguage = multilingualService.getUserLanguage(user);
        String targetLanguage = language != null ? language : userLanguage;
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        org.springframework.data.domain.Page<com.rwandaheritage.heritageguard.model.HeritageSite> sitePage = heritageSiteService.searchHeritageSites(region, category, status, establishmentYear, pageable);
        List<HeritageSiteDTO> items = sitePage.getContent().stream().map(site -> toDTOWithMediaAndDocs(site, targetLanguage)).collect(Collectors.toList());
        return PagedResponse.of(sitePage, items);
    }

    /**
     * Search heritage sites by name (multilingual).
     * Public endpoint: No authentication required.
     */
    @GetMapping("/search/name")
    public PagedResponse<HeritageSiteDTO> searchSitesByName(
            @RequestParam String searchTerm,
            @RequestParam(required = false) String language,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Search term is required");
        }
        
        User user = authentication != null ? (User) authentication.getPrincipal() : null;
        String userLanguage = multilingualService.getUserLanguage(user);
        String targetLanguage = language != null ? language : userLanguage;
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        org.springframework.data.domain.Page<com.rwandaheritage.heritageguard.model.HeritageSite> sitePage = heritageSiteService.searchHeritageSitesByNamePaged(searchTerm.trim(), pageable);
        List<HeritageSiteDTO> items = sitePage.getContent().stream().map(site -> toDTOWithMediaAndDocs(site, targetLanguage)).collect(Collectors.toList());
        return PagedResponse.of(sitePage, items);
    }

    /**
     * Get heritage sites by region.
     * Public endpoint: No authentication required.
     */
    @GetMapping("/region/{region}")
    public List<HeritageSiteDTO> getSitesByRegion(
            @PathVariable String region,
            @RequestParam(required = false) String language,
            Authentication authentication
    ) {
        User user = authentication != null ? (User) authentication.getPrincipal() : null;
        String userLanguage = multilingualService.getUserLanguage(user);
        String targetLanguage = language != null ? language : userLanguage;
        
        return heritageSiteService.getHeritageSitesByRegion(region)
                .stream()
                .map(site -> toDTOWithMediaAndDocs(site, targetLanguage))
                .collect(Collectors.toList());
    }

    /**
     * Get heritage sites by category.
     * Public endpoint: No authentication required.
     */
    @GetMapping("/category/{category}")
    public List<HeritageSiteDTO> getSitesByCategory(
            @PathVariable String category,
            @RequestParam(required = false) String language,
            Authentication authentication
    ) {
        User user = authentication != null ? (User) authentication.getPrincipal() : null;
        String userLanguage = multilingualService.getUserLanguage(user);
        String targetLanguage = language != null ? language : userLanguage;
        
        return heritageSiteService.getHeritageSitesByCategory(category)
                .stream()
                .map(site -> toDTOWithMediaAndDocs(site, targetLanguage))
                .collect(Collectors.toList());
    }

    /**
     * Get heritage sites by creator.
     * Protected endpoint: Requires ADMIN or HERITAGE_MANAGER role.
     */
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR') or hasRole('HERITAGE_MANAGER')")
    @GetMapping("/creator/{createdBy}")
    public List<HeritageSiteDTO> getSitesByCreator(
            @PathVariable String createdBy,
            @RequestParam(required = false) String language,
            Authentication authentication
    ) {
        User user = authentication != null ? (User) authentication.getPrincipal() : null;
        String userLanguage = multilingualService.getUserLanguage(user);
        String targetLanguage = language != null ? language : userLanguage;
        
        return heritageSiteService.getHeritageSitesByCreator(createdBy)
                .stream()
                .map(site -> toDTOWithMediaAndDocs(site, targetLanguage))
                .collect(Collectors.toList());
    }

    /**
     * Get heritage sites by ownership type.
     * Protected endpoint: Requires ADMIN or HERITAGE_MANAGER role.
     */
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR') or hasRole('HERITAGE_MANAGER')")
    @GetMapping("/ownership/{ownershipType}")
    public List<HeritageSiteDTO> getSitesByOwnershipType(
            @PathVariable String ownershipType,
            @RequestParam(required = false) String language,
            Authentication authentication
    ) {
        User user = authentication != null ? (User) authentication.getPrincipal() : null;
        String userLanguage = multilingualService.getUserLanguage(user);
        String targetLanguage = language != null ? language : userLanguage;
        
        // Validate ownership type
        String validTypes = "PUBLIC, PRIVATE, COMMUNITY, GOVERNMENT, MIXED, UNKNOWN";
        if (!validTypes.contains(ownershipType.toUpperCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid ownership type. Valid types: " + validTypes);
        }
        
        return heritageSiteService.getHeritageSitesByOwnershipType(ownershipType.toUpperCase())
                .stream()
                .map(site -> toDTOWithMediaAndDocs(site, targetLanguage))
                .collect(Collectors.toList());
    }

    /**
     * Get all heritage sites.
     * Public endpoint: No authentication required.
     * Returns sites with manager assignment information for better frontend integration.
     */
    @GetMapping
    public PagedResponse<HeritageSiteWithManagerDTO> getAllSites(
            @RequestParam(required = false) String language,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sort,
            Authentication authentication
    ) {
        // Validate language parameter if provided
        if (language != null && !language.matches("^(en|rw|fr)$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Language must be 'en', 'rw', or 'fr'");
        }
        
        User user = authentication != null ? (User) authentication.getPrincipal() : null;
        String userLanguage = multilingualService.getUserLanguage(user);
        String targetLanguage = language != null ? language : userLanguage;
        
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        org.springframework.data.domain.Page<com.rwandaheritage.heritageguard.model.HeritageSite> sitePage = heritageSiteService.getAllHeritageSitesPage(pageable);
        List<HeritageSiteWithManagerDTO> items = sitePage.getContent().stream().map(site -> toDTOWithManagerAndMediaAndDocs(site, targetLanguage)).collect(Collectors.toList());
        return PagedResponse.of(sitePage, items);
    }

    /**
     * Get all heritage sites without pagination (for admin dashboard).
     * Protected endpoint: Requires ADMIN role.
     */
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    @GetMapping("/all")
    public ResponseEntity<List<HeritageSiteDTO>> getAllSitesWithoutPagination(
            @RequestParam(required = false) String language,
            Authentication authentication
    ) {
        // Validate language parameter if provided
        if (language != null && !language.matches("^(en|rw|fr)$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Language must be 'en', 'rw', or 'fr'");
        }
        
        User user = authentication != null ? (User) authentication.getPrincipal() : null;
        String userLanguage = multilingualService.getUserLanguage(user);
        String targetLanguage = language != null ? language : userLanguage;
        
        List<com.rwandaheritage.heritageguard.model.HeritageSite> sites = heritageSiteService.getAllHeritageSites();
        List<HeritageSiteDTO> siteDTOs = sites.stream()
            .map(site -> toDTOWithMediaAndDocs(site, targetLanguage))
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(siteDTOs);
    }

    /**
     * Get archived heritage sites (Admin only)
     * Protected endpoint: Requires ADMIN role only.
     */
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    @GetMapping("/archived")
    public ResponseEntity<List<HeritageSiteDTO>> getArchivedSites(
            @RequestParam(required = false) String language,
            Authentication authentication
    ) {
        // Validate language parameter if provided
        if (language != null && !language.matches("^(en|rw|fr)$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Language must be 'en', 'rw', or 'fr'");
        }
        
        User user = authentication != null ? (User) authentication.getPrincipal() : null;
        String userLanguage = multilingualService.getUserLanguage(user);
        String targetLanguage = language != null ? language : userLanguage;
        
        List<HeritageSite> sites = heritageSiteService.getArchivedHeritageSites();
        List<HeritageSiteDTO> siteDTOs = sites.stream()
            .map(site -> toDTOWithMediaAndDocs(site, targetLanguage))
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(siteDTOs);
    }

    /**
     * Get a heritage site by ID.
     * Public endpoint: No authentication required.
     */
    @GetMapping("/{id}")
    public HeritageSiteDTO getSiteById(
            @PathVariable Long id,
            @RequestParam(required = false) String language,
            Authentication authentication
    ) {
        User user = authentication != null ? (User) authentication.getPrincipal() : null;
        String userLanguage = multilingualService.getUserLanguage(user);
        String targetLanguage = language != null ? language : userLanguage;
        
        Optional<HeritageSite> siteOpt = heritageSiteService.getHeritageSiteById(id);
        if (siteOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Heritage site not found");
        }
        return siteOpt.map(site -> toDTOWithMediaAndDocs(site, targetLanguage)).get();
    }

    /**
     * Create a new heritage site.
     * Protected endpoint: Requires ADMIN role only.
     */
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    @PostMapping
    public ResponseEntity<HeritageSiteDTO> createSite(@Valid @RequestBody HeritageSiteDTO siteDTO) {
        try {
            HeritageSite site = HeritageSiteMapper.toEntity(siteDTO);
            HeritageSite saved = heritageSiteService.createHeritageSite(site);
            return ResponseEntity.status(HttpStatus.CREATED).body(this.toDTOWithMediaAndDocs(saved));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to create heritage site: " + e.getMessage());
        }
    }

    /**
     * Update a heritage site.
     * Protected endpoint: Requires ADMIN, HERITAGE_MANAGER, or CONTENT_MANAGER role.
     * Heritage managers can only update their assigned sites.
     */
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR') or hasRole('HERITAGE_MANAGER') or hasRole('CONTENT_MANAGER')")
    @PutMapping("/{id}")
    public HeritageSiteDTO updateSite(@PathVariable Long id, @Valid @RequestBody HeritageSiteDTO siteDTO, Authentication authentication) {
        try {
            // Check if user has permission to update this site
            if (authentication != null && authentication.getPrincipal() instanceof User) {
                User user = (User) authentication.getPrincipal();
                if (!heritageSiteService.hasPermissionToManageSite(id, user.getId())) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to update this heritage site");
                }
            }
            
            HeritageSite site = HeritageSiteMapper.toEntity(siteDTO);
            site.setId(id);
            HeritageSite updated = heritageSiteService.updateHeritageSite(site);
            return this.toDTOWithMediaAndDocs(updated);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to update heritage site: " + e.getMessage());
        }
    }

    /**
     * Archive a heritage site (soft delete).
     * Protected endpoint: Requires ADMIN role only.
     * This preserves all cultural heritage data while marking the site as inactive.
     */
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSite(@PathVariable Long id, @RequestParam String archiveReason, Authentication authentication) {
        try {
            if (archiveReason == null || archiveReason.trim().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Archive reason is required");
            }
            heritageSiteService.deleteHeritageSite(id, archiveReason.trim());
            return ResponseEntity.noContent().build();
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to archive heritage site: " + e.getMessage());
        }
    }

    /**
     * Restore an archived heritage site.
     * Protected endpoint: Requires ADMIN role only.
     * This allows recovery of accidentally archived sites.
     */
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    @PostMapping("/{id}/restore")
    public ResponseEntity<HeritageSiteDTO> restoreSite(@PathVariable Long id, Authentication authentication) {
        try {
            HeritageSite restored = heritageSiteService.restoreHeritageSite(id);
            return ResponseEntity.ok(this.toDTOWithMediaAndDocs(restored));
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to restore heritage site: " + e.getMessage());
        }
    }
    
    /**
     * Get media for a heritage site.
     * Protected endpoint: Requires HERITAGE_MANAGER or SYSTEM_ADMINISTRATOR role.
     * Heritage Managers can only access media for sites they are assigned to.
     */
    @PreAuthorize("hasRole('HERITAGE_MANAGER') or hasRole('SYSTEM_ADMINISTRATOR')")
    @GetMapping("/{id}/media")
    public ResponseEntity<List<SiteMediaDTO>> getSiteMedia(@PathVariable Long id) {
        try {
            // Get current user info
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            User currentUser = userService.getUserByUsername(username);
            
            if (currentUser == null) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
            }
            
            // Check if Heritage Manager is assigned to this site
            if (currentUser.getRole() == User.Role.HERITAGE_MANAGER) {
                log.info("Checking assignment for Heritage Manager {} (ID: {}) to site {}", 
                    currentUser.getUsername(), currentUser.getId(), id);
                
                boolean isAssigned = heritageSiteService.isUserAssignedToSite(id, currentUser.getId());
                log.info("Assignment check result for user {} to site {}: {}", 
                    currentUser.getId(), id, isAssigned);
                
                if (!isAssigned) {
                    // Log detailed information for debugging
                    log.warn("Heritage Manager {} (ID: {}) attempted to access site {} but is not assigned", 
                        currentUser.getUsername(), currentUser.getId(), id);
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                        "You can only access media for sites you are assigned to");
                }
                log.info("Heritage Manager {} (ID: {}) successfully accessed site {} media", 
                    currentUser.getUsername(), currentUser.getId(), id);
            }
            
            // Get media for the site
            List<SiteMedia> mediaList = siteMediaService.getMediaByHeritageSiteId(id);
            
            List<SiteMediaDTO> mediaDTOs = mediaList.stream()
                    .map(SiteMediaMapper::toDTO)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(mediaDTOs);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to get site media: " + e.getMessage());
        }
    }
    

    
    /**
     * Upload media for a heritage site.
     * Protected endpoint: Requires HERITAGE_MANAGER role only.
     * Heritage Managers can only upload media to sites they are assigned to.
     */
    @PreAuthorize("hasRole('HERITAGE_MANAGER')")
    @PostMapping("/{id}/media")
    public ResponseEntity<SiteMediaDTO> uploadMedia(
            @PathVariable Long id,
            @Valid @RequestBody SiteMediaDTO mediaDTO) {
        try {
            // Get current user info
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            User currentUser = userService.getUserByUsername(username);
            
            if (currentUser == null) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
            }
            
            // Check if Heritage Manager is assigned to this site
            boolean isAssigned = heritageSiteService.isUserAssignedToSite(id, currentUser.getId());
            if (!isAssigned) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                    "You can only upload media to sites you are assigned to");
            }
            
            // Set the heritage site ID
            mediaDTO.setHeritageSiteId(id);
            SiteMedia media = SiteMediaMapper.toEntity(mediaDTO);
            SiteMedia saved = siteMediaService.createSiteMedia(media);
            return ResponseEntity.status(HttpStatus.CREATED).body(SiteMediaMapper.toDTO(saved));
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to upload media: " + e.getMessage());
        }
    }
    
    /**
     * Delete media from a heritage site.
     * Protected endpoint: Requires HERITAGE_MANAGER role only.
     * Heritage Managers can only delete media from sites they are assigned to.
     */
    @PreAuthorize("hasRole('HERITAGE_MANAGER')")
    @DeleteMapping("/{id}/media/{mediaId}")
    public ResponseEntity<Void> deleteMedia(@PathVariable Long id, @PathVariable Long mediaId) {
        try {
            // Get current user info
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            User currentUser = userService.getUserByUsername(username);
            
            if (currentUser == null) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
            }
            
            // Check if Heritage Manager is assigned to this site
            boolean isAssigned = heritageSiteService.isUserAssignedToSite(id, currentUser.getId());
            if (!isAssigned) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                    "You can only delete media from sites you are assigned to");
            }
            
            siteMediaService.deleteSiteMedia(mediaId);
            return ResponseEntity.noContent().build();
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to delete media: " + e.getMessage());
        }
    }
    
    /**
     * Get documents for a heritage site.
     * Protected endpoint: Requires HERITAGE_MANAGER or SYSTEM_ADMINISTRATOR role.
     * Heritage Managers can only access documents for sites they are assigned to.
     */
    @PreAuthorize("hasRole('HERITAGE_MANAGER') or hasRole('SYSTEM_ADMINISTRATOR')")
    @GetMapping("/{id}/documents")
    public ResponseEntity<List<SiteDocumentDTO>> getSiteDocuments(@PathVariable Long id) {
        try {
            // Get current user info
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            User currentUser = userService.getUserByUsername(username);
            
            if (currentUser == null) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
            }
            
            // Check if Heritage Manager is assigned to this site
            if (currentUser.getRole() == User.Role.HERITAGE_MANAGER) {
                boolean isAssigned = heritageSiteService.isUserAssignedToSite(id, currentUser.getId());
                if (!isAssigned) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                        "You can only access documents for sites you are assigned to");
                }
            }
            
            // Get documents for the site
            List<SiteDocument> documentList = siteDocumentService.getDocumentsBySite(id);
            List<SiteDocumentDTO> documentDTOs = documentList.stream()
                    .map(SiteDocumentMapper::toDTO)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(documentDTOs);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to get site documents: " + e.getMessage());
        }
    }
    
    /**
     * Upload document for a heritage site.
     * Protected endpoint: Requires HERITAGE_MANAGER role only.
     * Heritage Managers can only upload documents to sites they are assigned to.
     */
    @PreAuthorize("hasRole('HERITAGE_MANAGER')")
    @PostMapping("/{id}/documents")
    public ResponseEntity<SiteDocumentDTO> uploadDocument(
            @PathVariable Long id,
            @Valid @RequestBody SiteDocumentDTO documentDTO) {
        try {
            // Get current user info
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            User currentUser = userService.getUserByUsername(username);
            
            if (currentUser == null) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
            }
            
            // Check if Heritage Manager is assigned to this site
            boolean isAssigned = heritageSiteService.isUserAssignedToSite(id, currentUser.getId());
            if (!isAssigned) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                    "You can only upload documents to sites you are assigned to");
            }
            
            // Set the heritage site ID
            documentDTO.setHeritageSiteId(id);
            SiteDocument document = SiteDocumentMapper.toEntity(documentDTO);
            SiteDocument saved = siteDocumentService.createSiteDocument(document);
            return ResponseEntity.status(HttpStatus.CREATED).body(SiteDocumentMapper.toDTO(saved));
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to upload document: " + e.getMessage());
        }
    }
    
    /**
     * Delete document from a heritage site.
     * Protected endpoint: Requires HERITAGE_MANAGER role only.
     * Heritage Managers can only delete documents from sites they are assigned to.
     */
    @PreAuthorize("hasRole('HERITAGE_MANAGER')")
    @DeleteMapping("/{id}/documents/{docId}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id, @PathVariable Long docId) {
        try {
            // Get current user info
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            User currentUser = userService.getUserByUsername(username);
            
            if (currentUser == null) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
            }
            
            // Check if Heritage Manager is assigned to this site
            boolean isAssigned = heritageSiteService.isUserAssignedToSite(id, currentUser.getId());
            if (!isAssigned) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                    "You can only delete documents from sites you are assigned to");
            }
            
            siteDocumentService.deleteSiteDocument(docId);
            return ResponseEntity.noContent().build();
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to delete document: " + e.getMessage());
        }
    }

    /**
     * Partially update a heritage site.
     * PATCH endpoint: Only provided fields will be updated. 
     * Requires ADMIN, HERITAGE_MANAGER, or CONTENT_MANAGER role.
     * CONTENT_MANAGER can only update content fields, not site structure.
     */
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR') or hasRole('HERITAGE_MANAGER') or hasRole('CONTENT_MANAGER')")
    @PatchMapping("/{id}")
    public HeritageSiteDTO patchSite(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        try {
            HeritageSite patched = heritageSiteService.patchHeritageSite(id, updates);
            return toDTOWithMediaAndDocs(patched);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to patch heritage site: " + e.getMessage());
        }
    }

    /**
     * Get heritage site statistics
     * Public endpoint: No authentication required.
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getSiteStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSites", heritageSiteService.getTotalSiteCount());
        stats.put("activeSites", heritageSiteService.getActiveSiteCount());
        stats.put("publicSites", heritageSiteService.getPublicSiteCount());
        stats.put("recentSites", heritageSiteService.getRecentSiteCount(30)); // Last 30 days
        
        // Add status distribution
        Map<String, Long> statusDistribution = new HashMap<>();
        for (SiteStatus status : SiteStatus.values()) {
            statusDistribution.put(status.getLabel(), heritageSiteService.getSiteCountByStatus(status.getLabel()));
        }
        stats.put("statusDistribution", statusDistribution);
        
        return ResponseEntity.ok(stats);
    }

    /**
     * Change heritage site status with proper validation and audit trail
     * Protected endpoint: Requires ADMIN or HERITAGE_MANAGER role.
     * Heritage Managers can only change status of sites they are assigned to.
     */
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER')")
    @PostMapping("/{id}/status")
    public ResponseEntity<StatusChangeResponse> changeSiteStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusChangeRequest request,
            Authentication authentication) {
        try {
            String currentUser = authentication.getName();
            User currentUserEntity = userService.getUserByUsername(currentUser);
            
            // Check if Heritage Manager is assigned to this site
            if (currentUserEntity.getRole() == User.Role.HERITAGE_MANAGER) {
                boolean isAssigned = heritageSiteService.isUserAssignedToSite(id, currentUserEntity.getId());
                if (!isAssigned) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                        StatusChangeResponse.builder()
                            .siteId(id)
                            .success(false)
                            .errorMessage("You can only change status of sites you are assigned to")
                            .build()
                    );
                }
            }
            
            StatusChangeResponse response = heritageSiteService.changeSiteStatus(id, request, currentUser);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                StatusChangeResponse.builder()
                    .siteId(id)
                    .success(false)
                    .errorMessage("Failed to change status: " + e.getMessage())
                    .build()
            );
        }
    }

    /**
     * Bulk update heritage site statuses
     * Protected endpoint: Requires ADMIN role only.
     */
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    @PostMapping("/bulk/status")
    public ResponseEntity<BulkStatusUpdateResponse> bulkUpdateSiteStatus(
            @Valid @RequestBody BulkStatusUpdateRequest request,
            Authentication authentication) {
        try {
            String currentUser = authentication.getName();
            BulkStatusUpdateResponse response = heritageSiteService.bulkUpdateSiteStatus(request, currentUser);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                BulkStatusUpdateResponse.builder()
                    .totalRequested(request.getSiteIds().size())
                    .successfulUpdates(0)
                    .failedUpdates(request.getSiteIds().size())
                    .newStatus(request.getNewStatus())
                    .reason(request.getReason())
                    .performedBy(authentication.getName())
                    .performedAt(java.time.LocalDateTime.now())
                    .errors(List.of("Bulk operation failed: " + e.getMessage()))
                    .build()
            );
        }
    }

    /**
     * Get available site statuses and their allowed transitions
     * Public endpoint: No authentication required.
     */
    @GetMapping("/statuses")
    public ResponseEntity<Map<String, Object>> getAvailableStatuses() {
        Map<String, Object> response = new HashMap<>();
        
        List<Map<String, Object>> statuses = new ArrayList<>();
        for (SiteStatus status : SiteStatus.values()) {
            Map<String, Object> statusInfo = new HashMap<>();
            statusInfo.put("value", status.name());
            statusInfo.put("label", status.getLabel());
            statusInfo.put("description", status.getDescription());
            statusInfo.put("allowedTransitions", status.getAllowedTransitions());
            statuses.add(statusInfo);
        }
        
        response.put("statuses", statuses);
        return ResponseEntity.ok(response);
    }

    /**
     * Update assigned manager for a heritage site
     * Protected endpoint: Requires ADMIN role only.
     * Updated to use HeritageSiteManagerService for proper manager assignment.
     */
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    @PutMapping("/{id}/assign-manager")
    public ResponseEntity<HeritageSiteDTO> assignManagerToSite(
            @PathVariable Long id,
            @RequestParam Long managerId,
            Authentication authentication) {
        try {
            // Use HeritageSiteManagerService for proper manager assignment
            AssignManagerDto assignDto = new AssignManagerDto();
            assignDto.setManagerId(managerId);
            heritageSiteManagerService.assignManagerToSite(id, assignDto);
            
            HeritageSite updatedSite = heritageSiteService.getHeritageSiteById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Heritage site not found"));
            return ResponseEntity.ok(this.toDTOWithMediaAndDocs(updatedSite));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to assign manager: " + e.getMessage());
        }
    }

    /**
     * Remove assigned manager from a heritage site
     * Protected endpoint: Requires ADMIN role only.
     * Updated to use HeritageSiteManagerService for proper manager removal.
     */
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    @DeleteMapping("/{id}/assign-manager")
    public ResponseEntity<HeritageSiteDTO> removeManagerFromSite(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            // Use HeritageSiteManagerService for proper manager removal
            heritageSiteManagerService.removeManagerFromSite(id);
            
            HeritageSite updatedSite = heritageSiteService.getHeritageSiteById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Heritage site not found"));
            return ResponseEntity.ok(this.toDTOWithMediaAndDocs(updatedSite));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to remove manager: " + e.getMessage());
        }
    }

    /**
     * Get all sites assigned to a specific manager
     * Protected endpoint: Requires ADMIN or HERITAGE_MANAGER role.
     * Updated to use HeritageSiteManagerService for proper manager assignment data.
     */
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR') or hasRole('HERITAGE_MANAGER')")
    @GetMapping("/manager/{managerId}")
    public ResponseEntity<List<HeritageSiteWithManagerDTO>> getSitesByManager(
            @PathVariable Long managerId,
            @RequestParam(required = false) String language,
            Authentication authentication) {
        try {
            // Use HeritageSiteManagerService to get proper manager assignment data
            List<HeritageSiteManagerResponseDto> assignments = heritageSiteManagerService.getSitesManagedByUser(managerId);
            
            User user = authentication != null ? (User) authentication.getPrincipal() : null;
            String userLanguage = multilingualService.getUserLanguage(user);
            String targetLanguage = language != null ? language : userLanguage;
            
            // Convert assignments to site DTOs with manager info
            List<HeritageSiteWithManagerDTO> siteDTOs = assignments.stream()
                .map(assignment -> {
                    // Get the site details
                    Optional<HeritageSite> siteOpt = heritageSiteService.getHeritageSiteById(assignment.getHeritageSiteId());
                    if (siteOpt.isPresent()) {
                        HeritageSite site = siteOpt.get();
                        HeritageSiteWithManagerDTO dto = toDTOWithManagerAndMediaAndDocs(site, targetLanguage);
                        // Ensure manager info is set from the assignment
                        dto.setAssignedManagerId(assignment.getUserId());
                        dto.setAssignedManagerUsername(assignment.getManagerUsername());
                        dto.setAssignedManagerFullName(assignment.getManagerFullName());
                        dto.setAssignedManagerEmail(assignment.getManagerEmail());
                        dto.setManagerAssignedDate(assignment.getAssignedDate());
                        dto.setManagerAssignmentStatus(assignment.getStatus());
                        return dto;
                    }
                    return null;
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(siteDTOs);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to get sites by manager: " + e.getMessage());
        }
    }

    /**
     * Get available site categories
     * Public endpoint: No authentication required.
     */
    @GetMapping("/categories")
    public ResponseEntity<Map<String, Object>> getAvailableCategories() {
        Map<String, Object> response = new HashMap<>();
        
        List<Map<String, Object>> categories = new ArrayList<>();
        for (SiteCategory category : SiteCategory.values()) {
            Map<String, Object> categoryInfo = new HashMap<>();
            categoryInfo.put("value", category.name());
            categoryInfo.put("label", category.getLabel());
            categoryInfo.put("description", category.getDescription());
            categories.add(categoryInfo);
        }
        
        response.put("categories", categories);
        return ResponseEntity.ok(response);
    }

    /**
     * Get filter options for heritage sites
     * Public endpoint: No authentication required.
     */
    @GetMapping("/filter-options")
    public ResponseEntity<Map<String, Object>> getFilterOptions() {
        Map<String, Object> response = new HashMap<>();
        
        // Categories
        List<Map<String, Object>> categories = new ArrayList<>();
        for (SiteCategory category : SiteCategory.values()) {
            Map<String, Object> categoryInfo = new HashMap<>();
            categoryInfo.put("value", category.name());
            categoryInfo.put("label", category.getLabel());
            categoryInfo.put("description", category.getDescription());
            categories.add(categoryInfo);
        }
        
        // Regions
        List<Map<String, Object>> regions = new ArrayList<>();
        regions.add(Map.of("value", "northern", "label", "Northern Province"));
        regions.add(Map.of("value", "southern", "label", "Southern Province"));
        regions.add(Map.of("value", "eastern", "label", "Eastern Province"));
        regions.add(Map.of("value", "western", "label", "Western Province"));
        regions.add(Map.of("value", "kigali", "label", "Kigali City"));
        
        // Statuses
        List<Map<String, Object>> statuses = new ArrayList<>();
        statuses.add(Map.of("value", "ACTIVE", "label", "Active"));
        statuses.add(Map.of("value", "UNDER_CONSERVATION", "label", "Under Conservation"));
        statuses.add(Map.of("value", "PROPOSED", "label", "Proposed"));
        statuses.add(Map.of("value", "INACTIVE", "label", "Inactive"));
        
        // Ownership types
        List<Map<String, Object>> ownershipTypes = new ArrayList<>();
        ownershipTypes.add(Map.of("value", "PUBLIC", "label", "Public"));
        ownershipTypes.add(Map.of("value", "PRIVATE", "label", "Private"));
        ownershipTypes.add(Map.of("value", "COMMUNITY", "label", "Community"));
        ownershipTypes.add(Map.of("value", "GOVERNMENT", "label", "Government"));
        ownershipTypes.add(Map.of("value", "MIXED", "label", "Mixed"));
        ownershipTypes.add(Map.of("value", "UNKNOWN", "label", "Unknown"));
        
        response.put("categories", categories);
        response.put("regions", regions);
        response.put("statuses", statuses);
        response.put("ownershipTypes", ownershipTypes);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get status history for a heritage site
     * Protected endpoint: Requires ADMIN or HERITAGE_MANAGER role.
     */
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR') or hasRole('HERITAGE_MANAGER')")
    @GetMapping("/{id}/status/history")
    public ResponseEntity<List<StatusChangeResponse>> getSiteStatusHistory(@PathVariable Long id) {
        try {
            List<StatusChangeResponse> history = heritageSiteService.getSiteStatusHistory(id);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Site not found or no status history available");
        }
    }

    /**
     * Get activity feed for a specific heritage site
     * Protected endpoint: Requires ADMIN or HERITAGE_MANAGER role.
     */
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR') or hasRole('HERITAGE_MANAGER')")
    @GetMapping("/{id}/activity")
    public ResponseEntity<List<Map<String, Object>>> getSiteActivity(@PathVariable Long id) {
        try {
            // For now, return placeholder activity data
            // This would ideally come from a real activity tracking service
            List<Map<String, Object>> activities = new ArrayList<>();
            
            // Placeholder activities - these would come from a real activity service
            Map<String, Object> activity1 = new HashMap<>();
            activity1.put("id", "act-001");
            activity1.put("action", "Site updated");
            activity1.put("description", "Updated site information");
            activity1.put("timestamp", java.time.LocalDateTime.now().minusHours(2).format(java.time.format.DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            activity1.put("type", "SITE_UPDATE");
            activity1.put("user", "Heritage Manager");
            activities.add(activity1);
            
            Map<String, Object> activity2 = new HashMap<>();
            activity2.put("id", "act-002");
            activity2.put("action", "Document uploaded");
            activity2.put("description", "Added new site documentation");
            activity2.put("timestamp", java.time.LocalDateTime.now().minusHours(4).format(java.time.format.DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            activity2.put("type", "DOCUMENT_UPLOAD");
            activity2.put("user", "Heritage Manager");
            activities.add(activity2);
            
            Map<String, Object> activity3 = new HashMap<>();
            activity3.put("id", "act-003");
            activity3.put("action", "Media added");
            activity3.put("description", "Added new photos to site gallery");
            activity3.put("timestamp", java.time.LocalDateTime.now().minusHours(6).format(java.time.format.DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            activity3.put("type", "MEDIA_ADD");
            activity3.put("user", "Heritage Manager");
            activities.add(activity3);
            
            return ResponseEntity.ok(activities);
            
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Site not found or no activity available");
        }
    }

    /**
     * Get general change history for a heritage site
     * Protected endpoint: Requires ADMIN or HERITAGE_MANAGER role.
     */
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR') or hasRole('HERITAGE_MANAGER')")
    @GetMapping("/{id}/history")
    public ResponseEntity<List<SiteChangeHistoryDTO>> getSiteHistory(@PathVariable Long id) {
        try {
            List<SiteChangeHistoryDTO> history = siteChangeHistoryService.getSiteChangeHistory(id);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Site not found or no history available");
        }
    }

    /**
     * Get heritage sites for artifact creation/editing
     * Role-based access: admins see all, heritage managers see only assigned sites
     */
    @GetMapping("/for-artifacts")
    public ResponseEntity<List<Map<String, Object>>> getHeritageSitesForArtifacts(Authentication authentication) {
        try {
            List<Map<String, Object>> sites = heritageSiteService.getHeritageSitesForArtifact(authentication);
            return ResponseEntity.ok(sites);
        } catch (Exception e) {
            log.error("Error fetching heritage sites for artifacts: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Test endpoint to debug heritage site access
     */
    @GetMapping("/test-access")
    public ResponseEntity<Map<String, Object>> testHeritageSiteAccess(Authentication authentication) {
        try {
            Map<String, Object> response = new HashMap<>();
            
            if (authentication != null) {
                response.put("authenticated", true);
                response.put("username", authentication.getName());
                response.put("authorities", authentication.getAuthorities().stream()
                    .map(Object::toString)
                    .collect(Collectors.toList()));
                
                // Test basic repository access
                long totalSites = heritageSiteRepository.count();
                long activeSites = heritageSiteRepository.countByIsActiveTrue();
                
                response.put("totalSites", totalSites);
                response.put("activeSites", activeSites);
                
                // Test user service access
                try {
                    User user = userService.getUserByUsername(authentication.getName());
                    response.put("userFound", true);
                    response.put("userRole", user.getRole().toString());
                    response.put("userId", user.getId());
                } catch (Exception e) {
                    response.put("userFound", false);
                    response.put("userError", e.getMessage());
                }
                
            } else {
                response.put("authenticated", false);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error in test endpoint: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("stackTrace", e.getStackTrace());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // --- Helper method to map media and documents ---
    private HeritageSiteDTO toDTOWithMediaAndDocs(HeritageSite site) {
        return toDTOWithMediaAndDocs(site, "en"); // Default to English
    }
    
    // --- Helper method to map media and documents with language support ---
    private HeritageSiteDTO toDTOWithMediaAndDocs(HeritageSite site, String language) {
        HeritageSiteDTO dto = HeritageSiteMapper.toDTO(site);
        
        // Apply translations if available (integrating hardcoded and dynamic translations)
        if (site.getId() != null) {
            // Get name in requested language (dynamic translation takes priority over hardcoded)
            String translatedName = multilingualService.getContentFromHardcodedFields(
                "HERITAGE_SITE", site.getId(), "name", language,
                site.getNameEn(), site.getNameRw(), site.getNameFr()
            );
            if (translatedName != null && !translatedName.trim().isEmpty()) {
                // Set the translated content in the appropriate language field
                switch (language) {
                    case "rw":
                        dto.setNameRw(translatedName);
                        break;
                    case "fr":
                        dto.setNameFr(translatedName);
                        break;
                    default:
                        dto.setNameEn(translatedName);
                        break;
                }
            }
            
            // Get description in requested language
            String translatedDescription = multilingualService.getContentFromHardcodedFields(
                "HERITAGE_SITE", site.getId(), "description", language,
                site.getDescriptionEn(), site.getDescriptionRw(), site.getDescriptionFr()
            );
            if (translatedDescription != null && !translatedDescription.trim().isEmpty()) {
                // Set the translated content in the appropriate language field
                switch (language) {
                    case "rw":
                        dto.setDescriptionRw(translatedDescription);
                        break;
                    case "fr":
                        dto.setDescriptionFr(translatedDescription);
                        break;
                    default:
                        dto.setDescriptionEn(translatedDescription);
                        break;
                }
            }
            
            // Get significance in requested language
            String translatedSignificance = multilingualService.getContentFromHardcodedFields(
                "HERITAGE_SITE", site.getId(), "significance", language,
                site.getSignificanceEn(), site.getSignificanceRw(), site.getSignificanceFr()
            );
            if (translatedSignificance != null && !translatedSignificance.trim().isEmpty()) {
                // Set the translated content in the appropriate language field
                switch (language) {
                    case "rw":
                        dto.setSignificanceRw(translatedSignificance);
                        break;
                    case "fr":
                        dto.setSignificanceFr(translatedSignificance);
                        break;
                    default:
                        dto.setSignificanceEn(translatedSignificance);
                        break;
                }
            }
        }
        
        if (site.getMedia() != null) {
            List<SiteMediaDTO> mediaDTOs = site.getMedia().stream()
                    .map(SiteMediaMapper::toDTO)
                    .collect(Collectors.toList());
            dto.setMedia(mediaDTOs);
        }
        if (site.getDocuments() != null) {
            List<SiteDocumentDTO> docDTOs = site.getDocuments().stream()
                    .map(SiteDocumentMapper::toDTO)
                    .collect(Collectors.toList());
            dto.setDocuments(docDTOs);
        }
        return dto;
    }
    
    // --- Helper method to map manager info, media and documents with language support ---
    private HeritageSiteWithManagerDTO toDTOWithManagerAndMediaAndDocs(HeritageSite site, String language) {
        HeritageSiteWithManagerDTO dto = HeritageSiteWithManagerMapper.toDTO(site);
        
        // Apply translations if available (integrating hardcoded and dynamic translations)
        if (site.getId() != null) {
            // Get name in requested language (dynamic translation takes priority over hardcoded)
            String translatedName = multilingualService.getContentFromHardcodedFields(
                "HERITAGE_SITE", site.getId(), "name", language,
                site.getNameEn(), site.getNameRw(), site.getNameFr()
            );
            if (translatedName != null && !translatedName.trim().isEmpty()) {
                // Set the translated content in the appropriate language field
                switch (language) {
                    case "rw":
                        dto.setNameRw(translatedName);
                        break;
                    case "fr":
                        dto.setNameFr(translatedName);
                        break;
                    default:
                        dto.setNameEn(translatedName);
                        break;
                }
            }
            
            // Get description in requested language
            String translatedDescription = multilingualService.getContentFromHardcodedFields(
                "HERITAGE_SITE", site.getId(), "description", language,
                site.getDescriptionEn(), site.getDescriptionRw(), site.getDescriptionFr()
            );
            if (translatedDescription != null && !translatedDescription.trim().isEmpty()) {
                // Set the translated content in the appropriate language field
                switch (language) {
                    case "rw":
                        dto.setDescriptionRw(translatedDescription);
                        break;
                    case "fr":
                        dto.setDescriptionFr(translatedDescription);
                        break;
                    default:
                        dto.setDescriptionEn(translatedDescription);
                        break;
                }
            }
            
            // Get significance in requested language
            String translatedSignificance = multilingualService.getContentFromHardcodedFields(
                "HERITAGE_SITE", site.getId(), "significance", language,
                site.getSignificanceEn(), site.getSignificanceRw(), site.getSignificanceFr()
            );
            if (translatedSignificance != null && !translatedSignificance.trim().isEmpty()) {
                // Set the translated content in the appropriate language field
                switch (language) {
                    case "rw":
                        dto.setSignificanceRw(translatedSignificance);
                        break;
                    case "fr":
                        dto.setSignificanceFr(translatedSignificance);
                        break;
                    default:
                        dto.setSignificanceEn(translatedSignificance);
                        break;
                }
            }
        }
        
        if (site.getMedia() != null) {
            List<SiteMediaDTO> mediaDTOs = site.getMedia().stream()
                    .map(SiteMediaMapper::toDTO)
                    .collect(Collectors.toList());
            dto.setMedia(mediaDTOs);
        }
        if (site.getDocuments() != null) {
            List<SiteDocumentDTO> docDTOs = site.getDocuments().stream()
                    .map(SiteDocumentMapper::toDTO)
                    .collect(Collectors.toList());
            dto.setDocuments(docDTOs);
        }
        return dto;
    }
} 