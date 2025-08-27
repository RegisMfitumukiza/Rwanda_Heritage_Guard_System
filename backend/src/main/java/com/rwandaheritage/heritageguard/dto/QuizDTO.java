package com.rwandaheritage.heritageguard.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuizDTO {
    
    private Long id;
    
    @NotBlank(message = "Title in English is required")
    @Size(max = 500, message = "Title cannot exceed 500 characters")
    private String titleEn;
    
    @Size(max = 500, message = "Title cannot exceed 500 characters")
    private String titleRw;
    
    @Size(max = 500, message = "Title cannot exceed 500 characters")
    private String titleFr;
    
    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String descriptionEn;
    
    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String descriptionRw;
    
    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String descriptionFr;
    
    @NotNull(message = "Article ID is required")
    private Long articleId;
    
    @Min(value = 1, message = "Passing score percentage must be at least 1")
    @Max(value = 100, message = "Passing score percentage cannot exceed 100")
    @Builder.Default
    private Integer passingScorePercentage = 70;
    
    @Min(value = 1, message = "Time limit must be at least 1 minute")
    @Max(value = 480, message = "Time limit cannot exceed 480 minutes")
    private Integer timeLimitMinutes;
    
    @Min(value = 1, message = "Max attempts must be at least 1")
    @Max(value = 10, message = "Max attempts cannot exceed 10")
    private Integer maxAttempts;
    
    @Builder.Default
    private boolean isActive = true;
    
    @Builder.Default
    private boolean isPublic = true;
    
    @Size(max = 500, message = "Tags cannot exceed 500 characters")
    private String tags; // Comma-separated tags like "heritage,history,culture"
    
    // Audit fields
    private String createdBy;
    private LocalDateTime createdDate;
    private String updatedBy;
    private LocalDateTime updatedDate;
    
    // Manual getter/setter methods for boolean fields (Lombok compatibility)
    public boolean getIsActive() { return isActive; }
    public void setIsActive(boolean isActive) { this.isActive = isActive; }
    
    public boolean getIsPublic() { return isPublic; }
    public void setIsPublic(boolean isPublic) { this.isPublic = isPublic; }
}
