package com.rwandaheritage.heritageguard.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentDTO {
    private Long id;
    
    @NotNull(message = "Document title is required")
    @Size(min = 1, message = "At least one language title is required")
    private Map<String, String> title;
    
    @Size(max = 1000, message = "Description cannot exceed 1000 characters per language")
    private Map<String, String> description;
    
    @Size(max = 100, message = "Author name cannot exceed 100 characters")
    private String author;
    
    @NotNull(message = "Creation date is required")
    @PastOrPresent(message = "Creation date cannot be in the future")
    private LocalDateTime creationDate;
    
    @NotNull(message = "Document type is required")
    @Pattern(regexp = "^(PDF|DOCX|DOC|TXT|XLSX|PPTX|JPG|PNG|GIF|MP4|MP3)$", 
             message = "Document type must be one of: PDF, DOCX, DOC, TXT, XLSX, PPTX, JPG, PNG, GIF, MP4, MP3")
    private String type;
    
    @Size(max = 10, message = "Cannot have more than 10 tags")
    private List<@Size(max = 50, message = "Tag cannot exceed 50 characters") String> tags;
    
    @NotNull(message = "Language is required")
    @Pattern(regexp = "^(en|rw|fr)$", message = "Language must be one of: en, rw, fr")
    private String language;
    
    private Long folderId;
    
    @NotNull(message = "Public status is required")
    private Boolean isPublic;
    
    private List<Long> versionIds;
    
    // Audit fields
    @Builder.Default
    private boolean isActive = true;
    
    private String createdBy;
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