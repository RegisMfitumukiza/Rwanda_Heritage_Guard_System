package com.rwandaheritage.heritageguard.dto;

import lombok.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestimonialDTO {
    
    private Long id;
    
    // Multilingual fields
    @NotBlank(message = "Name in English is required")
    @Size(max = 255, message = "Name cannot exceed 255 characters")
    private String nameEn;
    
    @Size(max = 255, message = "Name cannot exceed 255 characters")
    private String nameRw;
    
    @Size(max = 255, message = "Name cannot exceed 255 characters")
    private String nameFr;
    
    @NotBlank(message = "Role in English is required")
    @Size(max = 255, message = "Role cannot exceed 255 characters")
    private String roleEn;
    
    @Size(max = 255, message = "Role cannot exceed 255 characters")
    private String roleRw;
    
    @Size(max = 255, message = "Role cannot exceed 255 characters")
    private String roleFr;
    
    @NotBlank(message = "Quote in English is required")
    @Size(max = 2000, message = "Quote cannot exceed 2000 characters")
    private String quoteEn;
    
    @Size(max = 2000, message = "Quote cannot exceed 2000 characters")
    private String quoteRw;
    
    @Size(max = 2000, message = "Quote cannot exceed 2000 characters")
    private String quoteFr;
    
    // Avatar fields (optional)
    private String avatarUrl;
    private String avatarFileName;
    private String avatarFilePath;
    
    // Status fields
    private boolean isVerified;
    private boolean isApproved;
    private boolean isFeatured;
    private boolean isActive;
    
    // Language
    @Size(max = 10, message = "Language code cannot exceed 10 characters")
    private String language;
    
    // User relationship
    private Long userId;
    private String userName;
    
    // Audit fields
    private String createdBy;
    private LocalDateTime createdDate;
    private String updatedBy;
    private LocalDateTime updatedDate;
    private String approvedBy;
    private LocalDateTime approvedDate;
    
    // Helper methods for getting localized content
    public String getName(String language) {
        switch (language) {
            case "rw":
                return nameRw != null ? nameRw : nameEn;
            case "fr":
                return nameFr != null ? nameFr : nameEn;
            default:
                return nameEn;
        }
    }
    
    public String getRole(String language) {
        switch (language) {
            case "rw":
                return roleRw != null ? roleRw : roleEn;
            case "fr":
                return roleFr != null ? roleFr : roleEn;
            default:
                return roleEn;
        }
    }
    
    public String getQuote(String language) {
        switch (language) {
            case "rw":
                return quoteRw != null ? quoteRw : quoteEn;
            case "fr":
                return quoteFr != null ? quoteFr : quoteEn;
            default:
                return quoteEn;
        }
    }
}

