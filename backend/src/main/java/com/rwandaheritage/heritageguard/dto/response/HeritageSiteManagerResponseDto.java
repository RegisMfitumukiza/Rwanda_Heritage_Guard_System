package com.rwandaheritage.heritageguard.dto.response;

import com.rwandaheritage.heritageguard.model.HeritageSiteManager;
import com.rwandaheritage.heritageguard.model.HeritageSite;
import com.rwandaheritage.heritageguard.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HeritageSiteManagerResponseDto {
    
    private Long id;
    private Long userId;
    private String managerUsername;
    private String managerFullName;
    private String managerEmail;
    private Long heritageSiteId;
    
    // Enhanced site information
    private String heritageSiteName;
    private String heritageSiteNameEn;
    private String heritageSiteNameRw;
    private String heritageSiteNameFr;
    private String heritageSiteRegion;
    private String heritageSiteStatus;
    private String heritageSiteCategory;
    private String heritageSiteDescription;
    
    private String status;
    private LocalDateTime assignedDate;
    private LocalDateTime lastUpdated;
    private String notes;
    
    private static final Logger log = LoggerFactory.getLogger(HeritageSiteManagerResponseDto.class);

    public static HeritageSiteManagerResponseDto fromEntity(HeritageSiteManager entity) {
        if (entity == null) {
            return null;
        }
        
        HeritageSite site = entity.getHeritageSite();
        User user = entity.getUser();
        
        if (site == null || user == null) {
            log.warn("HeritageSiteManager entity has null relationships: site={}, user={}", site, user);
            return null;
        }
        
        return HeritageSiteManagerResponseDto.builder()
                .id(entity.getId())
                .userId(user.getId())
                .managerUsername(user.getUsername() != null ? user.getUsername() : "Unknown")
                .managerFullName(user.getFullName() != null ? user.getFullName() : "Unknown")
                .managerEmail(user.getEmail() != null ? user.getEmail() : "Unknown")
                .heritageSiteId(site.getId())
                
                // Enhanced site information with null checks and default values
                .heritageSiteName(site.getNameEn() != null ? site.getNameEn() : "Unnamed Site")
                .heritageSiteNameEn(site.getNameEn())
                .heritageSiteNameRw(site.getNameRw())
                .heritageSiteNameFr(site.getNameFr())
                .heritageSiteRegion(site.getRegion() != null ? site.getRegion() : "Unknown Region")
                .heritageSiteStatus(site.getStatus() != null ? site.getStatus() : "UNKNOWN")
                .heritageSiteCategory(site.getCategory() != null ? site.getCategory() : "Uncategorized")
                .heritageSiteDescription(site.getDescriptionEn() != null ? site.getDescriptionEn() : "No description available")
                
                .status(entity.getStatus() != null ? entity.getStatus().name() : "UNKNOWN")
                .assignedDate(entity.getAssignedDate())
                .lastUpdated(entity.getLastUpdated())
                .notes(entity.getNotes())
                .build();
    }
}
