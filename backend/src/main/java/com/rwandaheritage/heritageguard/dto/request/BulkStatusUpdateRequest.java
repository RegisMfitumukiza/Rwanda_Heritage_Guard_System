package com.rwandaheritage.heritageguard.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

/**
 * Request DTO for bulk heritage site status updates
 * Allows efficient management of multiple sites
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkStatusUpdateRequest {
    
    @NotEmpty(message = "Site IDs list cannot be empty")
    @Size(max = 100, message = "Cannot update more than 100 sites at once")
    private List<Long> siteIds;
    
    @NotBlank(message = "New status is required")
    @Size(max = 50, message = "Status cannot exceed 50 characters")
    private String newStatus;
    
    @NotBlank(message = "Reason for bulk status change is required")
    @Size(max = 1000, message = "Reason cannot exceed 1000 characters")
    private String reason;
    
    @Size(max = 500, message = "Additional notes cannot exceed 500 characters")
    private String notes;
    
    private boolean notifySubscribers = false;
    
    private boolean continueOnError = true; // Continue processing if some sites fail
}





