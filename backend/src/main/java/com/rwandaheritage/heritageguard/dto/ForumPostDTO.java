package com.rwandaheritage.heritageguard.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForumPostDTO {
    private Long id;
    
    @NotNull(message = "Topic ID is required")
    private Long topicId;
    
    @NotBlank(message = "Post content is required")
    @Size(max = 10000, message = "Post content cannot exceed 10000 characters")
    private String content;
    
    @Pattern(regexp = "^(en|rw|fr)$", message = "Language must be 'en', 'rw', or 'fr'")
    private String language;
    
    // For replies - parent post ID (null for top-level posts)
    private Long parentPostId;
    
    @Builder.Default
    private boolean isActive = true;
    @Builder.Default
    private boolean isFlagged = false;
    private String flaggedBy;
    private String flagReason;
    
    // Audit fields
    private String createdBy;
    private LocalDateTime createdDate;
    private String updatedBy;
    private LocalDateTime updatedDate;

    // Manual getter/setter methods for boolean fields (Lombok compatibility)
    public boolean getIsActive() { return isActive; }
    public void setIsActive(boolean isActive) { this.isActive = isActive; }
    
    public boolean getIsFlagged() { return isFlagged; }
    public void setIsFlagged(boolean isFlagged) { this.isFlagged = isFlagged; }
} 