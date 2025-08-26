package com.rwandaheritage.heritageguard.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForumTopicDTO {
    private Long id;
    
    @NotNull(message = "Category ID is required")
    private Long categoryId;
    
    @NotBlank(message = "Topic title is required")
    @Size(max = 200, message = "Topic title cannot exceed 200 characters")
    private String title;
    
    @Size(max = 10000, message = "Content cannot exceed 10000 characters")
    private String content;
    
    @Pattern(regexp = "^(en|rw|fr)$", message = "Language must be 'en', 'rw', or 'fr'")
    private String language;
    
    @Builder.Default
    private boolean isPublic = true;
    @Builder.Default
    private boolean isActive = true;
    @Builder.Default
    private boolean isPinned = false;
    @Builder.Default
    private boolean isLocked = false;
    
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
    
    public boolean getIsPinned() { return isPinned; }
    public void setIsPinned(boolean isPinned) { this.isPinned = isPinned; }
    
    public boolean getIsLocked() { return isLocked; }
    public void setIsLocked(boolean isLocked) { this.isLocked = isLocked; }
} 