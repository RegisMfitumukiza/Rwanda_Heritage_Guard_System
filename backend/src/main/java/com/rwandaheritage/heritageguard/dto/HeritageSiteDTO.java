package com.rwandaheritage.heritageguard.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;

import com.rwandaheritage.heritageguard.dto.ArtifactDTO;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HeritageSiteDTO {
    private Long id;

    @NotBlank(message = "Site name in English is required")
    @Size(max = 500, message = "Site name cannot exceed 500 characters")
    private String nameEn;
    
    @Size(max = 500, message = "Site name cannot exceed 500 characters")
    private String nameRw;
    
    @Size(max = 500, message = "Site name cannot exceed 500 characters")
    private String nameFr;

    @NotBlank(message = "Site description in English is required")
    @Size(max = 10000, message = "Site description cannot exceed 10000 characters")
    private String descriptionEn;
    
    @Size(max = 10000, message = "Site description cannot exceed 10000 characters")
    private String descriptionRw;
    
    @Size(max = 10000, message = "Site description cannot exceed 10000 characters")
    private String descriptionFr;

    @NotBlank(message = "Site significance in English is required")
    @Size(max = 10000, message = "Site significance cannot exceed 10000 characters")
    private String significanceEn;
    
    @Size(max = 10000, message = "Site significance cannot exceed 10000 characters")
    private String significanceRw;
    
    @Size(max = 10000, message = "Site significance cannot exceed 10000 characters")
    private String significanceFr;

    // Simplified location fields
    @NotBlank(message = "Site address is required")
    @Size(max = 1000, message = "Site address cannot exceed 1000 characters")
    private String address;
    
    @NotBlank(message = "Site region is required")
    @Size(max = 100, message = "Site region cannot exceed 100 characters")
    private String region;

    // GPS coordinates for map integration
    @Pattern(regexp = "^-?\\d{1,2}\\.\\d{6}$", message = "Invalid latitude format. Must be between -90 and 90 degrees with 6 decimal places")
    private String gpsLatitude;
    
    @Pattern(regexp = "^-?\\d{1,3}\\.\\d{6}$", message = "Invalid longitude format. Must be between -180 and 180 degrees with 6 decimal places")
    private String gpsLongitude;

    // Core site information
    @NotBlank(message = "Site status is required")
    @Size(max = 50, message = "Site status cannot exceed 50 characters")
    private String status;
    
    @NotBlank(message = "Site category is required")
    @Size(max = 50, message = "Site category cannot exceed 50 characters")
    private String category;
    
    // TODO: Fix database schema mismatch - ownership_type column is enum in DB but should be VARCHAR
    // Temporary fix: using String instead of enum until database schema is updated
    @NotNull(message = "Site ownership type is required")
    private String ownershipType;
    
    // Optional contact information (simplified)
    @Size(max = 500, message = "Contact information cannot exceed 500 characters")
    private String contactInfo;
    
    // Simplified establishment date
    @Pattern(regexp = "^\\d{4}$", message = "Establishment year must be a 4-digit year")
    private String establishmentYear;

    @Builder.Default
    private boolean isActive = true;

    // Audit fields
    private String createdBy;
    private LocalDateTime createdDate;
    private String updatedBy;
    private LocalDateTime updatedDate;

    // Previous manager information for restoration
    private Long previousManagerId;
    private LocalDateTime managerUnassignedDate;
    
    // Archive information
    private String archiveReason;
    private LocalDateTime archiveDate;

    // Media and documents
    private List<SiteMediaDTO> media;
    private List<SiteDocumentDTO> documents;

    // Artifacts associated with this heritage site
    private List<ArtifactDTO> artifacts;

    // Manual getter/setter methods for boolean fields (Lombok compatibility)
    public boolean getIsActive() { return isActive; }
    public void setIsActive(boolean isActive) { this.isActive = isActive; }
} 