package com.rwandaheritage.heritageguard.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    private Long id;
    
    @NotBlank(message = "User ID is required")
    private String userId;
    
    @NotBlank(message = "Notification type is required")
    @Pattern(regexp = "^(reply|mention|flag|moderation|system)$", 
            message = "Type must be 'reply', 'mention', 'flag', 'moderation', or 'system'")
    private String type;
    
    @NotBlank(message = "Notification content is required")
    @Size(max = 10000, message = "Content cannot exceed 10000 characters")
    private String content;
    
    @Size(max = 500, message = "Related URL cannot exceed 500 characters")
    private String relatedUrl;
    
    @Builder.Default
    private boolean isRead = false;
    @Builder.Default
    private boolean isActive = true;
    
    // Audit fields
    private String createdBy;
    private LocalDateTime createdDate;
    private String updatedBy;
    private LocalDateTime updatedDate;

    // Manual getter/setter methods for boolean fields (Lombok compatibility)
    public boolean getIsRead() { return isRead; }
    public void setIsRead(boolean isRead) { this.isRead = isRead; }
    
    public boolean getIsActive() { return isActive; }
    public void setIsActive(boolean isActive) { this.isActive = isActive; }
} 