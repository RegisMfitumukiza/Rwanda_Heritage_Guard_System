package com.rwandaheritage.heritageguard.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TranslationDTO {
    
    private Long id;
    
    @NotBlank(message = "Content type is required")
    @Pattern(regexp = "^(HERITAGE_SITE|FORUM_TOPIC|FORUM_POST|FORUM_CATEGORY|DOCUMENT|UI_ELEMENT|EDUCATIONAL_CONTENT|EDUCATIONAL_ARTICLE|QUIZ|QUIZ_QUESTION|QUIZ_OPTION)$", 
             message = "Content type must be one of the supported content types")
    private String contentType;
    
    @NotNull(message = "Content ID is required")
    @Min(value = 1, message = "Content ID must be positive")
    private Long contentId;
    
    @NotBlank(message = "Field name is required")
    @Size(max = 100, message = "Field name cannot exceed 100 characters")
    private String fieldName;
    
    @NotBlank(message = "Language code is required")
    @Pattern(regexp = "^(en|rw|fr)$", message = "Language code must be 'en', 'rw', or 'fr'")
    private String languageCode;
    
    @NotBlank(message = "Translated text is required")
    @Size(max = 10000, message = "Translated text cannot exceed 10000 characters")
    private String translatedText;
    
    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(DRAFT|REVIEW|APPROVED|PUBLISHED|REJECTED)$", 
             message = "Status must be DRAFT, REVIEW, APPROVED, PUBLISHED, or REJECTED")
    private String status;
    
    // Audit fields
    private String createdBy;
    private LocalDateTime createdDate;
    private String updatedBy;
    private LocalDateTime updatedDate;
} 