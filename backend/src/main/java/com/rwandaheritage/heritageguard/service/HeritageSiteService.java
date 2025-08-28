package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.model.HeritageSite;

import com.rwandaheritage.heritageguard.repository.HeritageSiteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import com.rwandaheritage.heritageguard.repository.SiteStatusHistoryRepository;
import com.rwandaheritage.heritageguard.model.SiteStatusHistory;
import com.rwandaheritage.heritageguard.service.SiteChangeHistoryService;
import com.rwandaheritage.heritageguard.repository.HeritageSiteManagerRepository;
import com.rwandaheritage.heritageguard.model.HeritageSiteManager;
import lombok.extern.slf4j.Slf4j;
import com.rwandaheritage.heritageguard.model.User;
import com.rwandaheritage.heritageguard.model.User.Role;
import com.rwandaheritage.heritageguard.service.UserService;
import com.rwandaheritage.heritageguard.model.Artifact;


import com.rwandaheritage.heritageguard.model.ArtifactMedia;
import com.rwandaheritage.heritageguard.repository.ArtifactRepository;


import com.rwandaheritage.heritageguard.repository.ArtifactMediaRepository;
import java.util.stream.Collectors;

@Service
@Slf4j
public class HeritageSiteService {
    private final HeritageSiteRepository heritageSiteRepository;
    private final com.rwandaheritage.heritageguard.repository.SiteStatusHistoryRepository siteStatusHistoryRepository;
    private final HeritageSiteManagerService heritageSiteManagerService;
    private final SiteChangeHistoryService siteChangeHistoryService;
    private final HeritageSiteManagerRepository heritageSiteManagerRepository;
    private final UserService userService;
    private final ArtifactRepository artifactRepository;

    private final ArtifactMediaRepository artifactMediaRepository;

    @Autowired
    public HeritageSiteService(HeritageSiteRepository heritageSiteRepository,
                               com.rwandaheritage.heritageguard.repository.SiteStatusHistoryRepository siteStatusHistoryRepository,
                               HeritageSiteManagerService heritageSiteManagerService,
                               SiteChangeHistoryService siteChangeHistoryService,
                               HeritageSiteManagerRepository heritageSiteManagerRepository,
                               UserService userService,
                               ArtifactRepository artifactRepository,
                               ArtifactMediaRepository artifactMediaRepository) {
        this.heritageSiteRepository = heritageSiteRepository;
        this.siteStatusHistoryRepository = siteStatusHistoryRepository;
        this.heritageSiteManagerService = heritageSiteManagerService;
        this.siteChangeHistoryService = siteChangeHistoryService;
        this.heritageSiteManagerRepository = heritageSiteManagerRepository;
        this.userService = userService;
        this.artifactRepository = artifactRepository;
        this.artifactMediaRepository = artifactMediaRepository;
    }

    @Transactional
    public HeritageSite createHeritageSite(HeritageSite site) {
        // Set audit fields
        String currentUser = getCurrentUsername();
        site.setCreatedBy(currentUser);
        site.setUpdatedBy(currentUser);
        site.setIsActive(true);
        
        // Ensure all child entities reference this heritage site
        if (site.getMedia() != null) {
            site.getMedia().forEach(media -> {
                media.setHeritageSite(site);
                media.setCreatedBy(currentUser);
                media.setUpdatedBy(currentUser);
            });
        }
        
        if (site.getDocuments() != null) {
            site.getDocuments().forEach(doc -> {
                doc.setHeritageSite(site);
                doc.setCreatedBy(currentUser);
                doc.setUpdatedBy(currentUser);
            });
        }
        
        // Save the heritage site (cascade will save child entities)
        HeritageSite savedSite = heritageSiteRepository.save(site);
        
        // Log site creation in change history
        try {
            siteChangeHistoryService.logSiteCreation(
                savedSite.getId(),
                savedSite.getNameEn() != null ? savedSite.getNameEn() : "Unnamed Site",
                currentUser,
                "127.0.0.1", // TODO: Get real IP from request context
                "System" // TODO: Get real user agent from request context
            );
        } catch (Exception e) {
            log.warn("Failed to log site creation in change history: {}", e.getMessage());
        }
        
        log.info("Created heritage site '{}' with {} media files and {} documents", 
                savedSite.getNameEn(), 
                savedSite.getMedia() != null ? savedSite.getMedia().size() : 0,
                savedSite.getDocuments() != null ? savedSite.getDocuments().size() : 0);
        
        return savedSite;
    }

    @Transactional(readOnly = true)
    public Optional<HeritageSite> getHeritageSiteById(Long id) {
        // First get the basic site without collections
        Optional<HeritageSite> siteOpt = heritageSiteRepository.findById(id);
        if (!siteOpt.isPresent()) {
            return Optional.empty();
        }
        
        HeritageSite site = siteOpt.get();
        
        // Check if site is active
        if (!site.isActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Heritage site not found or inactive");
        }
        
        // Load media and documents separately to avoid Hibernate MultipleBagFetchException
        try {
            Optional<HeritageSite> siteWithMedia = heritageSiteRepository.findByIdWithMedia(id);
            if (siteWithMedia.isPresent()) {
                site.setMedia(siteWithMedia.get().getMedia());
            }
            
            Optional<HeritageSite> siteWithDocuments = heritageSiteRepository.findByIdWithDocuments(id);
            if (siteWithDocuments.isPresent()) {
                site.setDocuments(siteWithDocuments.get().getDocuments());
            }
        } catch (Exception e) {
            // Log the error but don't fail the entire request
            // Set empty collections to prevent null pointer exceptions
            if (site.getMedia() == null) site.setMedia(new ArrayList<>());
            if (site.getDocuments() == null) site.setDocuments(new ArrayList<>());
            System.err.println("Warning: Could not load media/documents for site " + id + ": " + e.getMessage());
        }
        
        if (isPublicUser()) {
            // Filter media and documents for public users
            if (site.getMedia() != null) {
                site.setMedia(site.getMedia().stream()
                    .filter(media -> media.isActive() && media.isPublic())
                    .collect(Collectors.toList()));
            }
            if (site.getDocuments() != null) {
                site.setDocuments(site.getDocuments().stream()
                    .filter(doc -> doc.isActive() && doc.isPublic())
                    .collect(Collectors.toList()));
            }
        }
        
        return Optional.of(site);
    }

    @Transactional(readOnly = true)
    public List<HeritageSite> getAllHeritageSites() {
        List<HeritageSite> allSites = heritageSiteRepository.findByIsActiveTrue();
        
        if (isPublicUser()) {
            // For public users, filter media and documents to only public ones
            allSites.forEach(site -> {
                if (site.getMedia() != null) {
                    site.setMedia(site.getMedia().stream()
                        .filter(media -> media.isActive() && media.isPublic())
                        .collect(Collectors.toList()));
                }
                if (site.getDocuments() != null) {
                    site.setDocuments(site.getDocuments().stream()
                        .filter(doc -> doc.isActive() && doc.isPublic())
                        .collect(Collectors.toList()));
                }
            });
        }
        
        return allSites;
    }

    public List<HeritageSite> getAllHeritageSites(org.springframework.data.domain.Pageable pageable) {
        org.springframework.data.domain.Page<HeritageSite> page = heritageSiteRepository.findByIsActiveTrue(pageable);
        List<HeritageSite> sites = page.getContent();
        if (isPublicUser()) {
            sites.forEach(site -> {
                if (site.getMedia() != null) {
                    site.setMedia(site.getMedia().stream()
                        .filter(media -> media.isActive() && media.isPublic())
                        .collect(Collectors.toList()));
                }
                if (site.getDocuments() != null) {
                    site.setDocuments(site.getDocuments().stream()
                        .filter(doc -> doc.isActive() && doc.isPublic())
                        .collect(Collectors.toList()));
                }
            });
        }
        return sites;
    }

    public org.springframework.data.domain.Page<HeritageSite> getAllHeritageSitesPage(org.springframework.data.domain.Pageable pageable) {
        return heritageSiteRepository.findByIsActiveTrue(pageable);
    }

    // Efficient search using database queries
    public List<HeritageSite> searchHeritageSites(String region, String category, String status, String establishmentYear) {
        List<HeritageSite> sites = heritageSiteRepository.searchSites(region, category, status, establishmentYear);
        
        if (isPublicUser()) {
            // Filter media and documents for public users
            sites.forEach(site -> {
                if (site.getMedia() != null) {
                    site.setMedia(site.getMedia().stream()
                        .filter(media -> media.isActive() && media.isPublic())
                        .collect(Collectors.toList()));
                }
                if (site.getDocuments() != null) {
                    site.setDocuments(site.getDocuments().stream()
                        .filter(doc -> doc.isActive() && doc.isPublic())
                        .collect(Collectors.toList()));
                }
            });
        }
        
        return sites;
    }

    public org.springframework.data.domain.Page<HeritageSite> searchHeritageSites(String region, String category, String status, String establishmentYear, org.springframework.data.domain.Pageable pageable) {
        return heritageSiteRepository.searchSites(region, category, status, establishmentYear, pageable);
    }

    // Search by name (multilingual)
    public List<HeritageSite> searchHeritageSitesByName(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return getAllHeritageSites();
        }
        
        List<HeritageSite> sites = heritageSiteRepository.searchByName(searchTerm.trim());
        
        if (isPublicUser()) {
            // Filter media and documents for public users
            sites.forEach(site -> {
                if (site.getMedia() != null) {
                    site.setMedia(site.getMedia().stream()
                        .filter(media -> media.isActive() && media.isPublic())
                        .collect(Collectors.toList()));
                }
                if (site.getDocuments() != null) {
                    site.setDocuments(site.getDocuments().stream()
                        .filter(doc -> doc.isActive() && doc.isPublic())
                        .collect(Collectors.toList()));
                }
            });
        }
        
        return sites;
    }

    public org.springframework.data.domain.Page<HeritageSite> searchHeritageSitesByNamePaged(String searchTerm, org.springframework.data.domain.Pageable pageable) {
        return heritageSiteRepository.searchByName(searchTerm, pageable);
    }

    // Get sites by region
    public List<HeritageSite> getHeritageSitesByRegion(String region) {
        List<HeritageSite> sites = heritageSiteRepository.findByIsActiveTrueAndRegion(region);
        
        if (isPublicUser()) {
            sites.forEach(site -> {
                if (site.getMedia() != null) {
                    site.setMedia(site.getMedia().stream()
                        .filter(media -> media.isActive() && media.isPublic())
                        .collect(Collectors.toList()));
                }
                if (site.getDocuments() != null) {
                    site.setDocuments(site.getDocuments().stream()
                        .filter(doc -> doc.isActive() && doc.isPublic())
                        .collect(Collectors.toList()));
                }
            });
        }
        
        return sites;
    }

    // Get sites by category
    public List<HeritageSite> getHeritageSitesByCategory(String category) {
        List<HeritageSite> sites = heritageSiteRepository.findByIsActiveTrueAndCategory(category);
        
        if (isPublicUser()) {
            sites.forEach(site -> {
                if (site.getMedia() != null) {
                    site.setMedia(site.getMedia().stream()
                        .filter(media -> media.isActive() && media.isPublic())
                        .collect(Collectors.toList()));
                }
                if (site.getDocuments() != null) {
                    site.setDocuments(site.getDocuments().stream()
                        .filter(doc -> doc.isActive() && doc.isPublic())
                        .collect(Collectors.toList()));
                }
            });
        }
        
        return sites;
    }

    public HeritageSite updateHeritageSite(HeritageSite site) {
        HeritageSite existing = heritageSiteRepository.findById(site.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Heritage site not found"));
        
        // Store old values for change logging
        Map<String, String> oldValues = new HashMap<>();
        oldValues.put("nameEn", existing.getNameEn());
        oldValues.put("nameRw", existing.getNameRw());
        oldValues.put("nameFr", existing.getNameFr());
        oldValues.put("descriptionEn", existing.getDescriptionEn());
        oldValues.put("descriptionRw", existing.getDescriptionRw());
        oldValues.put("descriptionFr", existing.getDescriptionFr());
        oldValues.put("significanceEn", existing.getSignificanceEn());
        oldValues.put("significanceRw", existing.getSignificanceRw());
        oldValues.put("significanceFr", existing.getSignificanceFr());
        oldValues.put("contactInfo", existing.getContactInfo());
        oldValues.put("status", existing.getStatus());
        oldValues.put("category", existing.getCategory());
        oldValues.put("ownershipType", existing.getOwnershipType());
        oldValues.put("gpsLatitude", existing.getGpsLatitude());
        oldValues.put("gpsLongitude", existing.getGpsLongitude());
        oldValues.put("region", existing.getRegion());
        oldValues.put("address", existing.getAddress());
        oldValues.put("establishmentYear", existing.getEstablishmentYear());
        
        // Set audit fields
        String currentUser = getCurrentUsername();
        existing.setUpdatedBy(currentUser);
        existing.setUpdatedDate(LocalDateTime.now());
        
        HeritageSite savedSite;
        
        // Full update for all authenticated users with appropriate roles
        // Ensure all child entities reference this heritage site
        if (site.getMedia() != null) {
            site.getMedia().forEach(media -> {
                media.setHeritageSite(site);
                media.setUpdatedBy(currentUser);
                media.setUpdatedDate(LocalDateTime.now());
            });
        }
        
        if (site.getDocuments() != null) {
            site.getDocuments().forEach(doc -> {
                doc.setHeritageSite(site);
                doc.setUpdatedBy(currentUser);
                doc.setUpdatedDate(LocalDateTime.now());
            });
        }
        
        // Set audit fields
        site.setUpdatedBy(currentUser);
        site.setUpdatedDate(LocalDateTime.now());
        
        savedSite = heritageSiteRepository.save(site);
        
        // Log changes for each modified field
        logFieldChanges(savedSite, oldValues, currentUser);
        
        return savedSite;
    }
    
    private void logFieldChanges(HeritageSite newSite, Map<String, String> oldValues, String currentUser) {
        try {
            // Check each field for changes
            if (!Objects.equals(oldValues.get("nameEn"), newSite.getNameEn())) {
                siteChangeHistoryService.logSiteUpdate(
                    newSite.getId(), "nameEn", oldValues.get("nameEn"), newSite.getNameEn(),
                    currentUser, "Site name updated", "127.0.0.1", "System"
                );
            }
            
            if (!Objects.equals(oldValues.get("nameRw"), newSite.getNameRw())) {
                siteChangeHistoryService.logSiteUpdate(
                    newSite.getId(), "nameRw", oldValues.get("nameRw"), newSite.getNameRw(),
                    currentUser, "Site name (Kinyarwanda) updated", "127.0.0.1", "System"
                );
            }
            
            if (!Objects.equals(oldValues.get("nameFr"), newSite.getNameFr())) {
                siteChangeHistoryService.logSiteUpdate(
                    newSite.getId(), "nameFr", oldValues.get("nameFr"), newSite.getNameFr(),
                    currentUser, "Site name (French) updated", "127.0.0.1", "System"
                );
            }
            
            if (!Objects.equals(oldValues.get("descriptionEn"), newSite.getDescriptionEn())) {
                siteChangeHistoryService.logSiteUpdate(
                    newSite.getId(), "descriptionEn", oldValues.get("descriptionEn"), newSite.getDescriptionEn(),
                    currentUser, "Description (English) updated", "127.0.0.1", "System"
                );
            }
            
            if (!Objects.equals(oldValues.get("descriptionRw"), newSite.getDescriptionRw())) {
                siteChangeHistoryService.logSiteUpdate(
                    newSite.getId(), "descriptionRw", oldValues.get("descriptionRw"), newSite.getDescriptionRw(),
                    currentUser, "Description (Kinyarwanda) updated", "127.0.0.1", "System"
                );
            }
            
            if (!Objects.equals(oldValues.get("descriptionFr"), newSite.getDescriptionFr())) {
                siteChangeHistoryService.logSiteUpdate(
                    newSite.getId(), "descriptionFr", oldValues.get("descriptionFr"), newSite.getDescriptionFr(),
                    currentUser, "Description (French) updated", "127.0.0.1", "System"
                );
            }
            
            if (!Objects.equals(oldValues.get("significanceEn"), newSite.getSignificanceEn())) {
                siteChangeHistoryService.logSiteUpdate(
                    newSite.getId(), "significanceEn", oldValues.get("significanceEn"), newSite.getSignificanceEn(),
                    currentUser, "Historical significance (English) updated", "127.0.0.1", "System"
                );
            }
            
            if (!Objects.equals(oldValues.get("significanceRw"), newSite.getSignificanceRw())) {
                siteChangeHistoryService.logSiteUpdate(
                    newSite.getId(), "significanceRw", oldValues.get("significanceRw"), newSite.getSignificanceRw(),
                    currentUser, "Historical significance (Kinyarwanda) updated", "127.0.0.1", "System"
                );
            }
            
            if (!Objects.equals(oldValues.get("significanceFr"), newSite.getSignificanceFr())) {
                siteChangeHistoryService.logSiteUpdate(
                    newSite.getId(), "significanceFr", oldValues.get("significanceFr"), newSite.getSignificanceFr(),
                    currentUser, "Historical significance (French) updated", "127.0.0.1", "System"
                );
            }
            
            if (!Objects.equals(oldValues.get("status"), newSite.getStatus())) {
                siteChangeHistoryService.logSiteUpdate(
                    newSite.getId(), "status", oldValues.get("status"), newSite.getStatus(),
                    currentUser, "Site status updated", "127.0.0.1", "System"
                );
            }
            
            if (!Objects.equals(oldValues.get("category"), newSite.getCategory())) {
                siteChangeHistoryService.logSiteUpdate(
                    newSite.getId(), "category", oldValues.get("category"), newSite.getCategory(),
                    currentUser, "Site category updated", "127.0.0.1", "System"
                );
            }
            
            if (!Objects.equals(oldValues.get("region"), newSite.getRegion())) {
                siteChangeHistoryService.logSiteUpdate(
                    newSite.getId(), "region", oldValues.get("region"), newSite.getRegion(),
                    currentUser, "Site region updated", "127.0.0.1", "System"
                );
            }
            
            if (!Objects.equals(oldValues.get("address"), newSite.getAddress())) {
                siteChangeHistoryService.logSiteUpdate(
                    newSite.getId(), "address", oldValues.get("address"), newSite.getAddress(),
                    currentUser, "Site address updated", "127.0.0.1", "System"
                );
            }
            
            if (!Objects.equals(oldValues.get("contactInfo"), newSite.getContactInfo())) {
                siteChangeHistoryService.logSiteUpdate(
                    newSite.getId(), "contactInfo", oldValues.get("contactInfo"), newSite.getContactInfo(),
                    currentUser, "Contact information updated", "127.0.0.1", "System"
                );
            }
            
            if (!Objects.equals(oldValues.get("ownershipType"), newSite.getOwnershipType())) {
                siteChangeHistoryService.logSiteUpdate(
                    newSite.getId(), "ownershipType", oldValues.get("ownershipType"), newSite.getOwnershipType(),
                    currentUser, "Ownership type updated", "127.0.0.1", "System"
                );
            }
            
            if (!Objects.equals(oldValues.get("gpsLatitude"), newSite.getGpsLatitude())) {
                siteChangeHistoryService.logSiteUpdate(
                    newSite.getId(), "gpsLatitude", oldValues.get("gpsLatitude"), newSite.getGpsLatitude(),
                    currentUser, "GPS latitude updated", "127.0.0.1", "System"
                );
            }
            
            if (!Objects.equals(oldValues.get("gpsLongitude"), newSite.getGpsLongitude())) {
                siteChangeHistoryService.logSiteUpdate(
                    newSite.getId(), "gpsLongitude", oldValues.get("gpsLongitude"), newSite.getGpsLongitude(),
                    currentUser, "GPS longitude updated", "127.0.0.1", "System"
                );
            }
            
            if (!Objects.equals(oldValues.get("establishmentYear"), newSite.getEstablishmentYear())) {
                siteChangeHistoryService.logSiteUpdate(
                    newSite.getId(), "establishmentYear", oldValues.get("establishmentYear"), newSite.getEstablishmentYear(),
                    currentUser, "Establishment year updated", "127.0.0.1", "System"
                );
            }
            
        } catch (Exception e) {
            log.warn("Failed to log field changes in change history: {}", e.getMessage());
        }
    }

    public HeritageSite patchHeritageSite(Long id, Map<String, Object> updates) {
        HeritageSite site = heritageSiteRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Heritage site not found"));
        
        // Store old values for change logging
        Map<String, String> oldValues = new HashMap<>();
        oldValues.put("nameEn", site.getNameEn());
        oldValues.put("nameRw", site.getNameRw());
        oldValues.put("nameFr", site.getNameFr());
        oldValues.put("descriptionEn", site.getDescriptionEn());
        oldValues.put("descriptionRw", site.getDescriptionRw());
        oldValues.put("descriptionFr", site.getDescriptionFr());
        oldValues.put("significanceEn", site.getSignificanceEn());
        oldValues.put("significanceRw", site.getSignificanceRw());
        oldValues.put("significanceFr", site.getSignificanceFr());
        oldValues.put("contactInfo", site.getContactInfo());
        oldValues.put("status", site.getStatus());
        oldValues.put("category", site.getCategory());
        oldValues.put("ownershipType", site.getOwnershipType());
        oldValues.put("gpsLatitude", site.getGpsLatitude());
        oldValues.put("gpsLongitude", site.getGpsLongitude());
        oldValues.put("region", site.getRegion());
        oldValues.put("address", site.getAddress());
        oldValues.put("establishmentYear", site.getEstablishmentYear());
        
        // Set audit fields
        String currentUser = getCurrentUsername();
        site.setUpdatedBy(currentUser);
        site.setUpdatedDate(LocalDateTime.now());
        
        log.info("Patching site {} with updates: {}", id, updates);
        
        updates.forEach((key, value) -> {
            log.info("Processing field update: {} = {} (type: {})", key, value, value != null ? value.getClass().getSimpleName() : "null");
            
            switch (key) {
                case "nameEn": site.setNameEn((String) value); break;
                case "nameRw": site.setNameRw((String) value); break;
                case "nameFr": site.setNameFr((String) value); break;
                case "descriptionEn": site.setDescriptionEn((String) value); break;
                case "descriptionRw": site.setDescriptionRw((String) value); break;
                case "descriptionFr": site.setDescriptionFr((String) value); break;
                case "significanceEn": site.setSignificanceEn((String) value); break;
                case "significanceRw": site.setSignificanceRw((String) value); break;
                case "significanceFr": site.setSignificanceFr((String) value); break;
                case "contactInfo": site.setContactInfo((String) value); break;
                case "address": site.setAddress((String) value); break;
                case "region": site.setRegion((String) value); break;
                case "gpsLatitude": site.setGpsLatitude((String) value); break;
                case "gpsLongitude": site.setGpsLongitude((String) value); break;
                case "status": site.setStatus((String) value); break;
                case "category": site.setCategory((String) value); break;
                case "ownershipType": site.setOwnershipType((String) value); break;
                case "establishmentYear": site.setEstablishmentYear((String) value); break;
                case "isActive": site.setIsActive((Boolean) value); break;
                // assignedManagerId field has been removed - use HeritageSiteManagerService instead
                default:
                    log.warn("Unknown field '{}' with value '{}' - ignoring", key, value);
                    break;
            }
        });
        
        HeritageSite savedSite = heritageSiteRepository.save(site);
        
        // Log changes for each modified field
        logFieldChanges(savedSite, oldValues, currentUser);
        
        return savedSite;
    }

    @Transactional
    public void deleteHeritageSite(Long id, String archiveReason) {
        HeritageSite site = heritageSiteRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Heritage site not found"));
        
        log.info("Archiving heritage site '{}' (ID: {}) by user '{}' with reason: {}", 
                site.getNameEn(), id, getCurrentUsername(), archiveReason);
        
        try {
            // Archive the site
            site.setStatus("ARCHIVED");
            site.setIsActive(false); // This was missing - critical fix!
            site.setArchiveReason(archiveReason);
            site.setArchiveDate(LocalDateTime.now());
            site.setUpdatedBy(getCurrentUsername());
            site.setUpdatedDate(LocalDateTime.now());
            
            // Manager information is now handled through HeritageSiteManager table
            site.setManagerUnassignedDate(LocalDateTime.now());
            
            // Save the archived site
            heritageSiteRepository.save(site);
            
            // Log site deletion/archiving in change history
            try {
                siteChangeHistoryService.logSiteDeletion(
                    site.getId(),
                    site.getNameEn() != null ? site.getNameEn() : "Unnamed Site",
                    getCurrentUsername(),
                    archiveReason,
                    "127.0.0.1", // TODO: Get real IP from request context
                    "System" // TODO: Get real user agent from request context
                );
            } catch (Exception e) {
                log.warn("Failed to log site deletion in change history: {}", e.getMessage());
            }
            
            log.info("Successfully archived heritage site '{}' (ID: {}) by user '{}'. Archive reason: {}", 
                    site.getNameEn(), id, getCurrentUsername(), archiveReason);
                    
        } catch (Exception e) {
            log.error("Failed to archive heritage site '{}' (ID: {}): {}", 
                    site.getNameEn(), id, e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Failed to archive heritage site: " + e.getMessage());
        }
    }

    /**
     * Restore an archived heritage site (Admin only)
     * This allows recovery of accidentally archived sites
     */
    @Transactional
    public HeritageSite restoreHeritageSite(Long id) {
        HeritageSite site = heritageSiteRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Heritage site not found"));
        
        if (!"ARCHIVED".equals(site.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Heritage site is not archived");
        }
        
        log.info("Restoring archived heritage site '{}' (ID: {}) by user '{}'", 
                site.getNameEn(), id, getCurrentUsername());
        
        try {
            // Restore the site
            site.setStatus("ACTIVE");
            site.setIsActive(true); // This was missing - critical fix!
            site.setUpdatedBy(getCurrentUsername());
            site.setUpdatedDate(LocalDateTime.now());
            
            // Previous manager restoration is now handled through HeritageSiteManager table
            if (site.getPreviousManagerId() != null) {
                log.info("Previous manager ID {} for site '{}' (ID: {}) should be restored via HeritageSiteManagerService", 
                        site.getPreviousManagerId(), site.getNameEn(), id);
                site.setPreviousManagerId(null);
                site.setManagerUnassignedDate(null);
            }
            
            // Clear archive information
            site.setArchiveReason(null);
            site.setArchiveDate(null);
            
            HeritageSite restoredSite = heritageSiteRepository.save(site);
            
            log.info("Successfully restored heritage site '{}' (ID: {}) by user '{}'", 
                    restoredSite.getNameEn(), id, getCurrentUsername());
            
            return restoredSite;
            
        } catch (Exception e) {
            log.error("Failed to restore heritage site '{}' (ID: {}): {}", 
                    site.getNameEn(), id, e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Failed to restore heritage site: " + e.getMessage());
        }
    }

    // Get sites by creator
    public List<HeritageSite> getHeritageSitesByCreator(String createdBy) {
        return heritageSiteRepository.findByCreatedByAndIsActiveTrue(createdBy);
    }

    // Get sites by ownership type
    public List<HeritageSite> getHeritageSitesByOwnershipType(String ownershipType) {
        return heritageSiteRepository.findByOwnershipTypeAndIsActiveTrue(ownershipType);
    }

    // Get archived sites (Admin only)
    public List<HeritageSite> getArchivedHeritageSites() {
        return heritageSiteRepository.findByStatus("ARCHIVED");
    }

    // Get sites by status (active/inactive)
    public List<HeritageSite> getHeritageSitesByStatus(String status) {
        return heritageSiteRepository.findByStatusAndIsActiveTrue(status);
    }

    /**
     * Get heritage sites based on user role and permissions
     * - SYSTEM_ADMINISTRATOR: sees all active sites
     * - HERITAGE_MANAGER: sees only sites they are assigned to
     * - Other roles: see only public sites
     */
    @Transactional(readOnly = true)
    public List<HeritageSite> getHeritageSitesForUser(Authentication authentication) {
        try {
            if (authentication == null) {
                log.info("No authentication provided, returning public sites only");
                // Return only public sites for unauthenticated users
                return heritageSiteRepository.findByIsActiveTrueAndStatusIn(
                    List.of("ACTIVE", "UNDER_CONSERVATION")
                );
            }

            String username = authentication.getName();
            log.info("Getting heritage sites for user: {}", username);
            
            User user = userService.getUserByUsername(username);
            log.info("Found user: {} with role: {}", username, user.getRole());
            
            if (user == null) {
                log.warn("User not found for username: {}", username);
                return new ArrayList<>();
            }

            // Check user role
            if (user.getRole() == Role.SYSTEM_ADMINISTRATOR) {
                log.info("User {} is admin, returning all active sites", username);
                // Admin sees all active sites
                List<HeritageSite> allSites = heritageSiteRepository.findByIsActiveTrue();
                log.info("Found {} total active sites for admin", allSites.size());
                return allSites;
            } else if (user.getRole() == Role.HERITAGE_MANAGER) {
                log.info("User {} is heritage manager, checking assigned sites", username);
                // Heritage manager sees only assigned sites
                List<HeritageSiteManager> assignments = heritageSiteManagerRepository
                    .findByUserIdAndStatus(user.getId(), HeritageSiteManager.ManagerStatus.ACTIVE);
                
                log.info("Found {} manager assignments for user {}", assignments.size(), username);
                
                List<HeritageSite> assignedSites = assignments.stream()
                    .map(HeritageSiteManager::getHeritageSite)
                    .filter(site -> site != null && site.isActive())
                    .collect(Collectors.toList());
                
                log.info("Returning {} active assigned sites for heritage manager {}", assignedSites.size(), username);
                return assignedSites;
            } else {
                log.info("User {} has role {}, returning public sites only", username, user.getRole());
                // Other roles see only public sites
                List<HeritageSite> publicSites = heritageSiteRepository.findByIsActiveTrueAndStatusIn(
                    List.of("ACTIVE", "UNDER_CONSERVATION")
                );
                log.info("Found {} public sites for user {}", publicSites.size(), username);
                return publicSites;
            }
        } catch (Exception e) {
            log.error("Error getting heritage sites for user: {}", e.getMessage(), e);
            // Return empty list instead of throwing exception
            return new ArrayList<>();
        }
    }

    /**
     * Get heritage sites for artifact creation/editing
     * Simplified version that returns basic site info needed for dropdowns
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getHeritageSitesForArtifact(Authentication authentication) {
        try {
            log.info("Getting heritage sites for artifacts. Authentication: {}", authentication != null ? authentication.getName() : "null");
            
            List<HeritageSite> sites = getHeritageSitesForUser(authentication);
            log.info("Found {} heritage sites for user", sites.size());
            
            return sites.stream()
                .map(site -> {
                    Map<String, Object> siteInfo = new HashMap<>();
                    siteInfo.put("id", site.getId());
                    siteInfo.put("name", site.getNameEn()); // Primary name
                    siteInfo.put("nameRw", site.getNameRw());
                    siteInfo.put("nameFr", site.getNameFr());
                    siteInfo.put("region", site.getRegion());
                    siteInfo.put("address", site.getAddress());
                    siteInfo.put("status", site.getStatus());
                    return siteInfo;
                })
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting heritage sites for artifacts: {}", e.getMessage(), e);
            // Return empty list instead of throwing exception
            return new ArrayList<>();
        }
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !authentication.getPrincipal().equals("anonymousUser")) {
            return authentication.getName();
        }
        return "system";
    }

    private boolean isPublicUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            return true;
        }
        for (GrantedAuthority authority : authentication.getAuthorities()) {
            String role = authority.getAuthority();
            if (role.equals("ROLE_COMMUNITY_MEMBER") || role.equals("ROLE_SYSTEM_ADMINISTRATOR") || role.equals("ROLE_HERITAGE_MANAGER") || role.equals("ROLE_CONTENT_MANAGER")) {
                return false;
            }
        }
        return true;
    }



    // Statistics methods
    public Long getTotalSiteCount() {
        return heritageSiteRepository.count();
    }

    public Long getActiveSiteCount() {
        return heritageSiteRepository.countByIsActiveTrue();
    }

    public Long getPublicSiteCount() {
        return heritageSiteRepository.countByIsActiveTrue();
    }

    public Long getRecentSiteCount(int days) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(days);
        return heritageSiteRepository.countByCreatedDateAfterAndIsActiveTrue(cutoffDate);
    }
    
    /**
     * Get count of sites that have active managers assigned
     * Now uses HeritageSiteManager table as single source of truth
     */
    public Long getSitesWithManagersCount() {
        // Count unique sites with active manager assignments
        return heritageSiteRepository.findByIsActiveTrue().stream()
            .filter(site -> heritageSiteManagerRepository.existsByHeritageSiteIdAndStatus(
                site.getId(), HeritageSiteManager.ManagerStatus.ACTIVE))
            .count();
    }
    
    /**
     * Get count of sites without active managers
     * Now uses HeritageSiteManager table as single source of truth
     */
    public Long getSitesWithoutManagersCount() {
        // Count unique sites without active manager assignments
        return heritageSiteRepository.findByIsActiveTrue().stream()
            .filter(site -> !heritageSiteManagerRepository.existsByHeritageSiteIdAndStatus(
                site.getId(), HeritageSiteManager.ManagerStatus.ACTIVE))
            .count();
    }
    
    /**
     * Get total count of heritage managers (users with HERITAGE_MANAGER role)
     */
    public Long getTotalHeritageManagersCount() {
        return heritageSiteRepository.countTotalHeritageManagers();
    }

    /**
     * Get count of sites by status
     */
    public Long getSiteCountByStatus(String status) {
        return heritageSiteRepository.countByStatusAndIsActiveTrue(status);
    }

    /**
     * Change heritage site status with audit trail
     */
    public com.rwandaheritage.heritageguard.dto.response.StatusChangeResponse changeSiteStatus(
            Long id, 
            com.rwandaheritage.heritageguard.dto.request.StatusChangeRequest request, 
            String currentUser) {
        
        HeritageSite site = heritageSiteRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Heritage site not found"));
        
        String currentStatus = site.getStatus();
        String newStatus = request.getNewStatus();
        
        if (currentStatus != null && currentStatus.equals(newStatus)) {
            return com.rwandaheritage.heritageguard.dto.response.StatusChangeResponse.builder()
                .siteId(id)
                .success(false)
                .errorMessage("Site is already in the requested status")
                .build();
        }
        
        site.setStatus(newStatus);
        site.setUpdatedBy(currentUser);
        site.setUpdatedDate(LocalDateTime.now());
        heritageSiteRepository.save(site);

        // Persist status history
        com.rwandaheritage.heritageguard.model.SiteStatusHistory history = com.rwandaheritage.heritageguard.model.SiteStatusHistory.builder()
            .site(site)
            .previousStatus(currentStatus)
            .newStatus(newStatus)
            .reason(request.getReason())
            .notes(request.getNotes())
            .changedBy(currentUser)
            .changedAt(LocalDateTime.now())
            .build();
        siteStatusHistoryRepository.save(history);
        
        return com.rwandaheritage.heritageguard.dto.response.StatusChangeResponse.builder()
            .siteId(id)
            .previousStatus(currentStatus)
            .newStatus(newStatus)
            .reason(request.getReason())
            .changedBy(currentUser)
            .changedAt(LocalDateTime.now())
            .success(true)
            .build();
    }

    /**
     * Bulk update heritage site statuses
     */
    public com.rwandaheritage.heritageguard.dto.response.BulkStatusUpdateResponse bulkUpdateSiteStatus(
            com.rwandaheritage.heritageguard.dto.request.BulkStatusUpdateRequest request, 
            String currentUser) {
        
        java.util.List<String> errors = new java.util.ArrayList<>();
        java.util.List<com.rwandaheritage.heritageguard.dto.response.StatusChangeResponse> results = new java.util.ArrayList<>();
        int successfulUpdates = 0;
        int failedUpdates = 0;
        
        for (Long siteId : request.getSiteIds()) {
            try {
                com.rwandaheritage.heritageguard.dto.request.StatusChangeRequest scReq = new com.rwandaheritage.heritageguard.dto.request.StatusChangeRequest(
                    request.getNewStatus(),
                    request.getReason(),
                    null,
                    false,
                    false
                );
                com.rwandaheritage.heritageguard.dto.response.StatusChangeResponse response = changeSiteStatus(siteId, scReq, currentUser);
                results.add(response);
                if (response.isSuccess()) {
                    successfulUpdates++;
                } else {
                    failedUpdates++;
                    errors.add("Site " + siteId + ": " + response.getErrorMessage());
                }
            } catch (Exception e) {
                failedUpdates++;
                errors.add("Site " + siteId + ": " + e.getMessage());
            }
        }
        
        return com.rwandaheritage.heritageguard.dto.response.BulkStatusUpdateResponse.builder()
            .totalRequested(request.getSiteIds().size())
            .successfulUpdates(successfulUpdates)
            .failedUpdates(failedUpdates)
            .newStatus(request.getNewStatus())
            .reason(request.getReason())
            .performedBy(currentUser)
            .performedAt(LocalDateTime.now())
            .results(results)
            .errors(errors)
            .build();
    }

    /**
     * Get status change history for a site (placeholder implementation)
     */
    public java.util.List<com.rwandaheritage.heritageguard.dto.response.StatusChangeResponse> getSiteStatusHistory(Long siteId) {
        java.util.List<com.rwandaheritage.heritageguard.model.SiteStatusHistory> items = siteStatusHistoryRepository.findBySiteIdOrderByChangedAtDesc(siteId);
        java.util.List<com.rwandaheritage.heritageguard.dto.response.StatusChangeResponse> results = new java.util.ArrayList<>();
        for (com.rwandaheritage.heritageguard.model.SiteStatusHistory h : items) {
            results.add(
                com.rwandaheritage.heritageguard.dto.response.StatusChangeResponse.builder()
                    .siteId(siteId)
                    .previousStatus(h.getPreviousStatus())
                    .newStatus(h.getNewStatus())
                    .reason(h.getReason())
                    .notes(h.getNotes())
                    .changedBy(h.getChangedBy())
                    .changedAt(h.getChangedAt())
                    .success(true)
                    .build()
            );
        }
        return results;
    }

    // Analytics methods for real data tracking
    /**
     * Get site count by region for analytics
     * @return List of region counts
     */
    public java.util.List<java.util.Map<String, Object>> getSiteCountByRegion() {
        return heritageSiteRepository.getSiteCountByRegion();
    }

    /**
     * Get site count by category for analytics
     * @return List of category counts
     */
    public java.util.List<java.util.Map<String, Object>> getSiteCountByCategory() {
        return heritageSiteRepository.getSiteCountByCategory();
    }

    /**
     * Get site count by date for analytics
     * @param date Date to count sites for
     * @return Count of sites created on that date
     */
    public long getSiteCountByDate(java.time.LocalDate date) {
        return heritageSiteRepository.getSiteCountByDate(date);
    }
    
    /**
     * Check if the current user has permission to manage a specific heritage site
     * @param siteId The heritage site ID
     * @param userId The user ID to check
     * @return true if user has permission, false otherwise
     */
    public boolean hasPermissionToManageSite(Long siteId, Long userId) {
        // System administrators have access to all sites
        if (isSystemAdministrator()) {
            return true;
        }
        
        // Heritage managers can only access their assigned sites
        if (isHeritageManager()) {
            return heritageSiteManagerService.isAssignedManager(userId, siteId);
        }
        
        // Other roles cannot manage sites
        return false;
    }
    
    /**
     * Check if a specific user is assigned to a heritage site
     * @param siteId The heritage site ID
     * @param userId The user ID to check
     * @return true if user is assigned to the site, false otherwise
     */
    public boolean isUserAssignedToSite(Long siteId, Long userId) {
        return heritageSiteManagerService.isAssignedManager(userId, siteId);
    }
    
    /**
     * Check if current user is a system administrator
     */
    private boolean isSystemAdministrator() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_SYSTEM_ADMINISTRATOR"));
    }
    
    /**
     * Check if current user is a heritage manager
     */
    private boolean isHeritageManager() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_HERITAGE_MANAGER"));
    }

        /**
     * Get all artifacts for a specific heritage site with full details
     */
    public Map<String, Object> getSiteArtifacts(Long siteId, String language) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Verify the heritage site exists
            HeritageSite site = heritageSiteRepository.findById(siteId)
                .orElseThrow(() -> new RuntimeException("Heritage site not found with ID: " + siteId));
            
            log.info("Found heritage site: {} - {}", siteId, site.getNameEn());
            
            // Get artifacts for this site
            List<Artifact> artifacts = artifactRepository.findByHeritageSiteId(siteId);
            
            if (artifacts == null) {
                log.warn("No artifacts found for site: {}", siteId);
                artifacts = new ArrayList<>();
            }
            
            log.info("Found {} artifacts for site: {}", artifacts.size(), siteId);
            
            List<Map<String, Object>> artifactData = artifacts.stream()
                .map(artifact -> {
                    Map<String, Object> artifactMap = new HashMap<>();
                    artifactMap.put("id", artifact.getId());
                    artifactMap.put("category", artifact.getCategory());
                    artifactMap.put("isPublic", artifact.getIsPublic());
                    
                    // Get authentication status and details
                    String authStatus = "PENDING_AUTHENTICATION"; // Default
                    List<Map<String, Object>> authentications = new ArrayList<>();
                    if (artifact.getAuthentications() != null && !artifact.getAuthentications().isEmpty()) {
                        authStatus = "AUTHENTICATED";
                        authentications = artifact.getAuthentications().stream()
                            .map(auth -> {
                                Map<String, Object> authMap = new HashMap<>();
                                authMap.put("id", auth.getId());
                                authMap.put("status", auth.getStatus());
                                authMap.put("date", auth.getDate());
                                authMap.put("documentation", auth.getDocumentation());
                                authMap.put("documentFilePath", auth.getDocumentFilePath());
                                return authMap;
                            })
                            .collect(Collectors.toList());
                    }
                    artifactMap.put("authenticationStatus", authStatus);
                    artifactMap.put("authentications", authentications);
                    
                    // Get names in multiple languages
                    List<Map<String, Object>> names = new ArrayList<>();
                    if (artifact.getName() != null) {
                        artifact.getName().forEach((lang, nameText) -> {
                            Map<String, Object> nameMap = new HashMap<>();
                            nameMap.put("languageCode", lang);
                            nameMap.put("nameText", nameText);
                            nameMap.put("isPrimary", "en".equals(lang)); // Assume English is primary
                            names.add(nameMap);
                        });
                    }
                    artifactMap.put("names", names);
                    
                    // Get descriptions in multiple languages
                    List<Map<String, Object>> descriptions = new ArrayList<>();
                    if (artifact.getDescription() != null) {
                        artifact.getDescription().forEach((lang, descText) -> {
                            Map<String, Object> descMap = new HashMap<>();
                            descMap.put("languageCode", lang);
                            descMap.put("descriptionText", descText);
                            descMap.put("isPrimary", "en".equals(lang)); // Assume English is primary
                            descriptions.add(descMap);
                        });
                    }
                    artifactMap.put("descriptions", descriptions);
                    
                    // Get media files
                    List<Map<String, Object>> media = new ArrayList<>();
                    if (artifact.getMedia() != null) {
                        media = artifact.getMedia().stream()
                            .map(mediaItem -> {
                                Map<String, Object> mediaMap = new HashMap<>();
                                mediaMap.put("id", mediaItem.getId()); // Add the ID field
                                mediaMap.put("filePath", mediaItem.getFilePath());
                                mediaMap.put("isPublic", mediaItem.getIsPublic());
                                mediaMap.put("description", mediaItem.getDescription());
                                return mediaMap;
                            })
                            .collect(Collectors.toList());
                    }
                    artifactMap.put("media", media);
                    
                    // Get provenance records
                    List<Map<String, Object>> provenanceRecords = new ArrayList<>();
                    if (artifact.getProvenanceRecords() != null && !artifact.getProvenanceRecords().isEmpty()) {
                        provenanceRecords = artifact.getProvenanceRecords().stream()
                            .map(provenance -> {
                                Map<String, Object> provenanceMap = new HashMap<>();
                                provenanceMap.put("id", provenance.getId());
                                provenanceMap.put("acquisitionDate", provenance.getAcquisitionDate());
                                provenanceMap.put("acquisitionMethod", provenance.getAcquisitionMethod());
                                provenanceMap.put("previousOwner", provenance.getPreviousOwner());
                                provenanceMap.put("provenanceNotes", provenance.getProvenanceNotes());
                                provenanceMap.put("documentFilePath", provenance.getDocumentFilePath());
                                return provenanceMap;
                            })
                            .collect(Collectors.toList());
                    }
                    artifactMap.put("provenanceRecords", provenanceRecords);
                    
                    return artifactMap;
                })
                .collect(Collectors.toList());
            
            result.put("artifacts", artifactData);
            result.put("siteId", siteId);
            result.put("siteName", site.getNameEn());
            result.put("totalCount", artifactData.size());
            
            log.info("Successfully processed {} artifacts for site: {}", artifactData.size(), siteId);
            
        } catch (Exception e) {
            log.error("Error processing artifacts for site {}: {}", siteId, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch artifacts for site: " + siteId, e);
        }
        
        return result;
    }
}