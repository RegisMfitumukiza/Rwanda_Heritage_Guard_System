package com.rwandaheritage.heritageguard.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FolderDTO {
    private Long id;
    
    @NotBlank(message = "Folder name is required")
    @Size(min = 1, max = 255, message = "Folder name must be between 1 and 255 characters")
    @Pattern(regexp = "^[a-zA-Z0-9\\s\\-_()]+$", message = "Folder name can only contain letters, numbers, spaces, hyphens, underscores, and parentheses")
    private String name;
    
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;
    
    @Pattern(regexp = "^(GENERAL|HISTORICAL|ARCHAEOLOGICAL|ARCHITECTURAL|CONSERVATION|RESEARCH|LEGAL|ADMINISTRATIVE|MEDIA_COVERAGE|PHOTOGRAPHS|MAPS|REPORTS)$", 
             message = "Invalid folder type")
    private String type;
    
    private Long parentId;
    
    private Long siteId; // Heritage site ID
    

    
    private List<Long> childFolderIds;
    
    @Size(max = 10, message = "Cannot have more than 10 allowed roles")
    private List<@Pattern(regexp = "^(SYSTEM_ADMINISTRATOR|HERITAGE_MANAGER|CONTENT_MANAGER|COMMUNITY_MEMBER|PUBLIC)$", 
                         message = "Invalid role. Must be one of: SYSTEM_ADMINISTRATOR, HERITAGE_MANAGER, CONTENT_MANAGER, COMMUNITY_MEMBER, PUBLIC") String> allowedRoles;
    
    // Audit fields
    @Builder.Default
    private boolean isActive = true;
    
    private String createdBy;
    
    @PastOrPresent(message = "Created date cannot be in the future")
    private LocalDateTime createdDate;
    
    private String updatedBy;
    private LocalDateTime updatedDate;
    
    // Manual getter/setter for boolean field
    public boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(boolean isActive) {
        this.isActive = isActive;
    }
} 