package com.rwandaheritage.heritageguard.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import jakarta.persistence.Column;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EducationalArticleDTO {
    
    private Long id;
    
    @NotBlank(message = "Title in English is required")
    @Size(max = 500, message = "Title cannot exceed 500 characters")
    private String titleEn;
    
    @Size(max = 500, message = "Title cannot exceed 500 characters")
    private String titleRw;
    
    @Size(max = 500, message = "Title cannot exceed 500 characters")
    private String titleFr;
    
    @NotBlank(message = "Content in English is required")
    @Size(min = 10, message = "Content must be at least 10 characters")
    @Size(max = 10000, message = "Content cannot exceed 10000 characters")
    private String contentEn;
    
    @Size(max = 10000, message = "Content cannot exceed 10000 characters")
    private String contentRw;
    
    @Size(max = 10000, message = "Content cannot exceed 10000 characters")
    private String contentFr;
    
    @NotBlank(message = "Summary in English is required")
    @Size(max = 1000, message = "Summary cannot exceed 1000 characters")
    private String summaryEn;
    
    @Size(max = 1000, message = "Summary cannot exceed 1000 characters")
    private String summaryRw;
    
    @Size(max = 1000, message = "Summary cannot exceed 1000 characters")
    private String summaryFr;
    
    @NotBlank(message = "Category is required")
    @Pattern(regexp = "^(HERITAGE_SITES|TRADITIONAL_CRAFTS|CULTURAL_PRACTICES|HISTORICAL_EVENTS|ROYAL_HISTORY|TRADITIONAL_MUSIC|ARCHITECTURE|CUSTOMS_TRADITIONS|GENERAL_EDUCATION)$", 
             message = "Invalid category. Must be one of: HERITAGE_SITES, TRADITIONAL_CRAFTS, CULTURAL_PRACTICES, HISTORICAL_EVENTS, ROYAL_HISTORY, TRADITIONAL_MUSIC, ARCHITECTURE, CUSTOMS_TRADITIONS, GENERAL_EDUCATION")
    private String category;
    
    @NotBlank(message = "Difficulty level is required")
    @Pattern(regexp = "^(BEGINNER|INTERMEDIATE|ADVANCED)$", 
             message = "Invalid difficulty level. Must be one of: BEGINNER, INTERMEDIATE, ADVANCED")
    private String difficultyLevel;
    
    @NotNull(message = "Estimated read time is required")
    @Min(value = 1, message = "Estimated read time must be at least 1 minute")
    @Max(value = 480, message = "Estimated read time cannot exceed 480 minutes")
    private Integer estimatedReadTimeMinutes;

    @Size(max = 10, message = "Cannot have more than 10 tags")
    private List<@Size(max = 50, message = "Tag cannot exceed 50 characters") String> tags;
    
    @Builder.Default
    private boolean isPublic = true;
    
    @Builder.Default
    private boolean isActive = true;
    
    @Column(name = "published_date")
    private LocalDateTime publishedDate;
    
    // New fields for enhanced content
    private String featuredImage; // URL to featured image
    private String youtubeVideoUrl; // Optional YouTube video link
    private Long relatedArtifactId; // Link to related artifact
    private Long relatedHeritageSiteId; // Link to related heritage site
    private Long quizId; // Link to related quiz
    
    // Audit fields
    private String createdBy;
    private LocalDateTime createdDate;
    private String updatedBy;
    private LocalDateTime updatedDate;
    
    // Manual getter/setter methods for boolean fields (Lombok compatibility)
    public boolean getIsPublic() { return isPublic; }
    public void setIsPublic(boolean isPublic) { this.isPublic = isPublic; }
    
    public boolean getIsActive() { return isActive; }
    public void setIsActive(boolean isActive) { this.isActive = isActive; }
}
