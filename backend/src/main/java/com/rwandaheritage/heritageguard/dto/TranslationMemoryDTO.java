package com.rwandaheritage.heritageguard.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TranslationMemoryDTO {
    
    private Long id;
    
    @NotBlank(message = "Source text is required")
    private String sourceText;
    
    @NotBlank(message = "Target text is required")
    private String targetText;
    
    @NotBlank(message = "Source language is required")
    @Pattern(regexp = "^(en|rw|fr)$", message = "Source language must be 'en', 'rw', or 'fr'")
    private String sourceLanguage;
    
    @NotBlank(message = "Target language is required")
    @Pattern(regexp = "^(en|rw|fr)$", message = "Target language must be 'en', 'rw', or 'fr'")
    private String targetLanguage;
    
    @Size(max = 200, message = "Context cannot exceed 200 characters")
    private String context;
    
    @Builder.Default
    private int usageCount = 1;
    
    // Audit fields
    private String createdBy;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
} 