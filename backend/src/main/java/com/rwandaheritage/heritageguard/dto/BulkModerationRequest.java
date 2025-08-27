package com.rwandaheritage.heritageguard.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkModerationRequest {
    
    @NotBlank(message = "Action type is required")
    @Pattern(regexp = "^(APPROVE|REJECT|DELETE|LOCK|PIN|FLAG)$", 
            message = "Action type must be 'APPROVE', 'REJECT', 'DELETE', 'LOCK', 'PIN', or 'FLAG'")
    private String actionType;
    
    @NotBlank(message = "Content type is required")
    @Pattern(regexp = "^(TOPIC|POST)$", message = "Content type must be 'TOPIC' or 'POST'")
    private String contentType;
    
    @NotEmpty(message = "Content IDs list cannot be empty")
    @Size(max = 100, message = "Cannot process more than 100 items at once")
    private List<Long> contentIds;
    
    @Size(max = 500, message = "Reason cannot exceed 500 characters")
    private String reason;
    
    @Builder.Default
    private boolean automated = false;
    
    @DecimalMin(value = "0.0", message = "Confidence score must be at least 0.0")
    @DecimalMax(value = "1.0", message = "Confidence score must be at most 1.0")
    private Double confidenceScore;
}