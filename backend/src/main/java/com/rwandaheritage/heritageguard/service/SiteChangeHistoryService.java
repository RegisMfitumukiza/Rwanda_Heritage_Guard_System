package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.model.SiteChangeHistory;
import com.rwandaheritage.heritageguard.model.HeritageSite;
import com.rwandaheritage.heritageguard.dto.response.SiteChangeHistoryDTO;
import com.rwandaheritage.heritageguard.repository.SiteChangeHistoryRepository;
import com.rwandaheritage.heritageguard.repository.HeritageSiteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
@Transactional
public class SiteChangeHistoryService {
    
    private final SiteChangeHistoryRepository changeHistoryRepository;
    private final HeritageSiteRepository heritageSiteRepository;
    
    // Field display names mapping
    private static final Map<String, String> FIELD_DISPLAY_NAMES = new HashMap<>();
    static {
        FIELD_DISPLAY_NAMES.put("nameEn", "Site Name (English)");
        FIELD_DISPLAY_NAMES.put("nameRw", "Site Name (Kinyarwanda)");
        FIELD_DISPLAY_NAMES.put("nameFr", "Site Name (French)");
        FIELD_DISPLAY_NAMES.put("descriptionEn", "Description (English)");
        FIELD_DISPLAY_NAMES.put("descriptionRw", "Description (Kinyarwanda)");
        FIELD_DISPLAY_NAMES.put("descriptionFr", "Description (French)");
        FIELD_DISPLAY_NAMES.put("significanceEn", "Significance (English)");
        FIELD_DISPLAY_NAMES.put("significanceRw", "Significance (Kinyarwanda)");
        FIELD_DISPLAY_NAMES.put("significanceFr", "Significance (French)");
        FIELD_DISPLAY_NAMES.put("status", "Site Status");
        FIELD_DISPLAY_NAMES.put("category", "Site Category");
        FIELD_DISPLAY_NAMES.put("ownershipType", "Ownership Type");
        FIELD_DISPLAY_NAMES.put("gpsLatitude", "GPS Latitude");
        FIELD_DISPLAY_NAMES.put("gpsLongitude", "GPS Longitude");
        FIELD_DISPLAY_NAMES.put("region", "Region");
        FIELD_DISPLAY_NAMES.put("address", "Address");
        FIELD_DISPLAY_NAMES.put("establishmentYear", "Establishment Year");
        FIELD_DISPLAY_NAMES.put("assignedManagerId", "Assigned Manager");
    }
    
    // Significant fields that should be highlighted
    private static final List<String> SIGNIFICANT_FIELDS = List.of(
        "nameEn", "nameRw", "nameFr", "status", "category", "assignedManagerId"
    );
    
    @Autowired
    public SiteChangeHistoryService(SiteChangeHistoryRepository changeHistoryRepository,
                                   HeritageSiteRepository heritageSiteRepository) {
        this.changeHistoryRepository = changeHistoryRepository;
        this.heritageSiteRepository = heritageSiteRepository;
    }
    
    /**
     * Log a field change to the history
     */
    public void logFieldChange(Long siteId, String fieldName, String action, 
                              String oldValue, String newValue, String changedBy, 
                              String reason, String changeType, String ipAddress, String userAgent) {
        
        HeritageSite site = heritageSiteRepository.findById(siteId)
            .orElseThrow(() -> new RuntimeException("Site not found: " + siteId));
        
        SiteChangeHistory history = SiteChangeHistory.builder()
            .site(site)
            .fieldName(fieldName)
            .action(action)
            .oldValue(oldValue)
            .newValue(newValue)
            .changedBy(changedBy)
            .changedAt(LocalDateTime.now())
            .reason(reason)
            .changeType(changeType)
            .ipAddress(ipAddress)
            .userAgent(userAgent)
            .build();
        
        changeHistoryRepository.save(history);
    }
    
    /**
     * Log a site creation
     */
    public void logSiteCreation(Long siteId, String siteName, String createdBy, 
                               String ipAddress, String userAgent) {
        logFieldChange(siteId, "site", "created", null, siteName, createdBy, 
                      "Site created", "CONTENT", ipAddress, userAgent);
    }
    
    /**
     * Log a site deletion/archiving
     */
    public void logSiteDeletion(Long siteId, String siteName, String deletedBy, 
                               String reason, String ipAddress, String userAgent) {
        logFieldChange(siteId, "site", "deleted", siteName, null, deletedBy, 
                      reason, "MANAGEMENT", ipAddress, userAgent);
    }
    
    /**
     * Log a status change
     */
    public void logStatusChange(Long siteId, String oldStatus, String newStatus, 
                               String changedBy, String reason, String ipAddress, String userAgent) {
        logFieldChange(siteId, "status", "updated", oldStatus, newStatus, changedBy, 
                      reason, "STATUS", ipAddress, userAgent);
    }
    
    /**
     * Log a manager assignment change
     */
    public void logManagerChange(Long siteId, String oldManager, String newManager, 
                               String changedBy, String reason, String ipAddress, String userAgent) {
        logFieldChange(siteId, "assignedManagerId", "updated", oldManager, newManager, changedBy, 
                      reason, "MANAGEMENT", ipAddress, userAgent);
    }
    
    /**
     * Log a site field update
     */
    public void logSiteUpdate(Long siteId, String fieldName, String oldValue, String newValue, 
                              String changedBy, String reason, String ipAddress, String userAgent) {
        // Determine change type based on field name
        String changeType = determineChangeType(fieldName);
        
        logFieldChange(siteId, fieldName, "updated", oldValue, newValue, changedBy, 
                      reason, changeType, ipAddress, userAgent);
    }
    
    /**
     * Determine the type of change based on field name
     */
    private String determineChangeType(String fieldName) {
        if (fieldName.startsWith("name") || fieldName.startsWith("description") || 
            fieldName.startsWith("significance")) {
            return "CONTENT";
        } else if (fieldName.equals("status") || fieldName.equals("category")) {
            return "STATUS";
        } else if (fieldName.equals("gpsLatitude") || fieldName.equals("gpsLongitude") || 
                   fieldName.equals("region") || fieldName.equals("address")) {
            return "LOCATION";
        } else if (fieldName.equals("assignedManagerId")) {
            return "MANAGEMENT";
        } else {
            return "CONTENT";
        }
    }
    
    /**
     * Get change history for a specific site
     */
    public List<SiteChangeHistoryDTO> getSiteChangeHistory(Long siteId) {
        List<SiteChangeHistory> history = changeHistoryRepository.findBySiteIdOrderByChangedAtDesc(siteId);
        return history.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Get change history for a specific site with pagination
     */
    public Page<SiteChangeHistoryDTO> getSiteChangeHistoryPaginated(Long siteId, Pageable pageable) {
        Page<SiteChangeHistory> history = changeHistoryRepository.findBySiteIdOrderByChangedAtDesc(siteId, pageable);
        return history.map(this::convertToDTO);
    }
    
    /**
     * Get changes for a specific field on a site
     */
    public List<SiteChangeHistoryDTO> getFieldChangeHistory(Long siteId, String fieldName) {
        List<SiteChangeHistory> history = changeHistoryRepository.findBySiteIdAndFieldNameOrderByChangedAtDesc(siteId, fieldName);
        return history.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Get changes by type for a site
     */
    public List<SiteChangeHistoryDTO> getChangesByType(Long siteId, String changeType) {
        List<SiteChangeHistory> history = changeHistoryRepository.findBySiteIdAndChangeTypeOrderByChangedAtDesc(siteId, changeType);
        return history.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Get recent changes across all sites
     */
    public Page<SiteChangeHistoryDTO> getRecentChanges(Pageable pageable) {
        Page<SiteChangeHistory> history = changeHistoryRepository.findRecentChanges(pageable);
        return history.map(this::convertToDTO);
    }
    
    /**
     * Get changes within a date range for a site
     */
    public List<SiteChangeHistoryDTO> getChangesByDateRange(Long siteId, LocalDateTime startDate, LocalDateTime endDate) {
        List<SiteChangeHistory> history = changeHistoryRepository.findBySiteIdAndDateRange(siteId, startDate, endDate);
        return history.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Get change statistics for a site
     */
    public Map<String, Object> getSiteChangeStatistics(Long siteId) {
        Map<String, Object> stats = new HashMap<>();
        
        long totalChanges = changeHistoryRepository.countBySiteId(siteId);
        long contentChanges = changeHistoryRepository.countBySiteIdAndChangeType(siteId, "CONTENT");
        long statusChanges = changeHistoryRepository.countBySiteIdAndChangeType(siteId, "STATUS");
        long managementChanges = changeHistoryRepository.countBySiteIdAndChangeType(siteId, "MANAGEMENT");
        
        stats.put("totalChanges", totalChanges);
        stats.put("contentChanges", contentChanges);
        stats.put("statusChanges", statusChanges);
        stats.put("managementChanges", managementChanges);
        
        return stats;
    }
    
    /**
     * Convert entity to DTO
     */
    private SiteChangeHistoryDTO convertToDTO(SiteChangeHistory history) {
        String fieldDisplayName = FIELD_DISPLAY_NAMES.getOrDefault(history.getFieldName(), history.getFieldName());
        boolean isSignificant = SIGNIFICANT_FIELDS.contains(history.getFieldName());
        
        String changeSummary = generateChangeSummary(history);
        
        return SiteChangeHistoryDTO.builder()
            .id(history.getId())
            .siteId(history.getSite().getId())
            .siteName(history.getSite().getNameEn())
            .fieldName(history.getFieldName())
            .action(history.getAction())
            .oldValue(history.getOldValue())
            .newValue(history.getNewValue())
            .changedBy(history.getChangedBy())
            .changedAt(history.getChangedAt())
            .reason(history.getReason())
            .changeType(history.getChangeType())
            .ipAddress(history.getIpAddress())
            .userAgent(history.getUserAgent())
            .fieldDisplayName(fieldDisplayName)
            .formattedChangedAt(formatTimestamp(history.getChangedAt()))
            .changeSummary(changeSummary)
            .isSignificantChange(isSignificant)
            .build();
    }
    
    /**
     * Generate a human-readable change summary
     */
    private String generateChangeSummary(SiteChangeHistory history) {
        String fieldDisplayName = FIELD_DISPLAY_NAMES.getOrDefault(history.getFieldName(), history.getFieldName());
        
        switch (history.getAction()) {
            case "created":
                return String.format("Created new %s", history.getFieldName().equals("site") ? "site" : "field");
            case "updated":
                if (history.getOldValue() == null && history.getNewValue() != null) {
                    return String.format("Set %s to '%s'", fieldDisplayName, history.getNewValue());
                } else if (history.getOldValue() != null && history.getNewValue() == null) {
                    return String.format("Cleared %s (was '%s')", fieldDisplayName, history.getOldValue());
                } else {
                    return String.format("Changed %s from '%s' to '%s'", 
                        fieldDisplayName, history.getOldValue(), history.getNewValue());
                }
            case "deleted":
                return String.format("Deleted %s", history.getFieldName().equals("site") ? "site" : "field");
            default:
                return String.format("%s %s", history.getAction(), fieldDisplayName);
        }
    }
    
    /**
     * Format timestamp for display
     */
    private String formatTimestamp(LocalDateTime timestamp) {
        LocalDateTime now = LocalDateTime.now();
        long hoursDiff = java.time.Duration.between(timestamp, now).toHours();
        
        if (hoursDiff < 1) {
            return "Just now";
        } else if (hoursDiff < 24) {
            return hoursDiff + " hour" + (hoursDiff == 1 ? "" : "s") + " ago";
        } else {
            long daysDiff = hoursDiff / 24;
            return daysDiff + " day" + (daysDiff == 1 ? "" : "s") + " ago";
        }
    }
}
