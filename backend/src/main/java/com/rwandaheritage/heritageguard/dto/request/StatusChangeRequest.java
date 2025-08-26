package com.rwandaheritage.heritageguard.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Request DTO for heritage site status changes
 * Ensures proper validation and audit trail for status modifications
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatusChangeRequest {
    
    @NotBlank(message = "New status is required")
    @Size(max = 50, message = "Status cannot exceed 50 characters")
    private String newStatus;
    
    @NotBlank(message = "Reason for status change is required")
    @Size(max = 1000, message = "Reason cannot exceed 1000 characters")
    private String reason;
    
    @Size(max = 500, message = "Additional notes cannot exceed 500 characters")
    private String notes;
    
    private boolean notifySubscribers = false;
    
    private boolean skipValidation = false; // For admin emergency changes
}





