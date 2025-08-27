package com.rwandaheritage.heritageguard.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CommunityReportDTO {
    
    private Long id;
    
    @NotNull(message = "Content type is required")
    private String contentType; // "TOPIC" or "POST"
    
    @NotNull(message = "Content ID is required")
    private Long contentId;
    
    private String reporterId; // Set by service
    
    @NotBlank(message = "Report reason is required")
    @Pattern(regexp = "^(SPAM|INAPPROPRIATE|OFF_TOPIC|HARASSMENT|MISLEADING|OTHER)$",
            message = "Report reason must be SPAM, INAPPROPRIATE, OFF_TOPIC, HARASSMENT, MISLEADING, or OTHER")
    private String reportReason;
    
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;
    
    private boolean isResolved;
    private String resolvedBy;
    private String resolutionAction;
    private String resolutionNotes;
    private LocalDateTime reportedAt;
    private LocalDateTime resolvedAt;
    
    // Audit fields
    private String createdBy;
    private LocalDateTime createdDate;
    private String updatedBy;
    private LocalDateTime updatedDate;
} 