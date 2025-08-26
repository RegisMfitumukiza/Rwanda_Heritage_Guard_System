package com.rwandaheritage.heritageguard.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SiteMediaDTO {
    private Long id;
    
    @NotBlank(message = "File name is required")
    @Size(max = 255, message = "File name cannot exceed 255 characters")
    private String fileName;
    
    @NotBlank(message = "File type is required")
    @Size(max = 100, message = "File type cannot exceed 100 characters")
    @Pattern(regexp = "^(image/|video/|audio/|application/pdf)$", message = "Invalid file type. Only images, videos, audio, and PDF files are allowed")
    private String fileType;
    
    @NotBlank(message = "File path is required")
    @Size(max = 1000, message = "File path cannot exceed 1000 characters")
    private String filePath;
    
    private Long fileSize;
    
    @Size(max = 50, message = "Date taken cannot exceed 50 characters")
    private String dateTaken;
    
    @Size(max = 200, message = "Photographer name cannot exceed 200 characters")
    private String photographer;
    
    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;
    
    @Size(max = 100, message = "Category cannot exceed 100 characters")
    private String category;
    
    @Builder.Default
    private boolean isPublic = true;
    
    @Size(max = 100, message = "Uploader username cannot exceed 100 characters")
    private String uploaderUsername;

    @Builder.Default
    private boolean isActive = true;

    // Audit fields
    private String createdBy;
    private LocalDateTime createdDate;
    private String updatedBy;
    private LocalDateTime updatedDate;

    private Long heritageSiteId;

    // Manual getter/setter methods for boolean fields (Lombok compatibility)
    public boolean getIsPublic() { return isPublic; }
    public void setIsPublic(boolean isPublic) { this.isPublic = isPublic; }
    
    public boolean getIsActive() { return isActive; }
    public void setIsActive(boolean isActive) { this.isActive = isActive; }
} 