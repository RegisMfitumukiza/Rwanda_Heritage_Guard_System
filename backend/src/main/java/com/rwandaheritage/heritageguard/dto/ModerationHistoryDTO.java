package com.rwandaheritage.heritageguard.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModerationHistoryDTO {
    private Long id;
    
    @NotBlank(message = "Moderator ID is required")
    private String moderatorId;
    
    @NotBlank(message = "Content type is required")
    @Pattern(regexp = "^(TOPIC|POST|USER)$", message = "Content type must be 'TOPIC', 'POST', or 'USER'")
    private String contentType;
    
    @NotNull(message = "Content ID is required")
    private Long contentId;
    
    @NotBlank(message = "Action type is required")
    @Pattern(regexp = "^(FLAG|APPROVE|REJECT|DELETE|LOCK|PIN|BULK_ACTION)$", 
            message = "Action type must be 'FLAG', 'APPROVE', 'REJECT', 'DELETE', 'LOCK', 'PIN', or 'BULK_ACTION'")
    private String actionType;
    
    @Size(max = 500, message = "Action reason cannot exceed 500 characters")
    private String actionReason;
    
    @Size(max = 50, message = "Previous status cannot exceed 50 characters")
    private String previousStatus;
    
    @Size(max = 50, message = "New status cannot exceed 50 characters")
    private String newStatus;
    
    @Builder.Default
    private boolean automated = false;
    
    @DecimalMin(value = "0.0", message = "Confidence score must be at least 0.0")
    @DecimalMax(value = "1.0", message = "Confidence score must be at most 1.0")
    private Double confidenceScore;
    
    private String bulkActionId;
    
    @Min(value = 1, message = "Affected count must be at least 1")
    private Integer affectedCount;
    
    // Audit fields
    private String createdBy;
    private LocalDateTime createdDate;
    private String updatedBy;
    private LocalDateTime updatedDate;
}