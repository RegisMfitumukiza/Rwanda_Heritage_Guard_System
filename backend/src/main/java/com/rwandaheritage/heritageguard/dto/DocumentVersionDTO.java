package com.rwandaheritage.heritageguard.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentVersionDTO {
    private Long id;
    
    @NotNull(message = "Document ID is required")
    private Long documentId;
    
    @NotBlank(message = "File path is required")
    @Size(max = 500, message = "File path cannot exceed 500 characters")
    private String filePath;
    
    @NotNull(message = "Version number is required")
    @Min(value = 1, message = "Version number must be at least 1")
    private Integer versionNumber;
    
    @NotBlank(message = "File type is required")
    @Pattern(regexp = "^(PDF|DOCX|DOC|TXT|XLSX|PPTX|JPG|PNG|GIF|MP4|MP3)$", 
             message = "File type must be one of: PDF, DOCX, DOC, TXT, XLSX, PPTX, JPG, PNG, GIF, MP4, MP3")
    private String fileType;
    
    @NotNull(message = "File size is required")
    @Min(value = 1, message = "File size must be at least 1 byte")
    @Max(value = 100000000, message = "File size cannot exceed 100MB")
    private Long fileSize;
    
    // Audit fields
    @Builder.Default
    private boolean isActive = true;
    
    private String createdBy;
    
    @NotNull(message = "Created date is required")
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