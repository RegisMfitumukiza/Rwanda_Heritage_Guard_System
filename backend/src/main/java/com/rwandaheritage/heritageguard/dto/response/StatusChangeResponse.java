package com.rwandaheritage.heritageguard.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;

/**
 * Response DTO for heritage site status changes
 * Provides comprehensive feedback on status change operations
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatusChangeResponse {
    
    private Long siteId;
    private String siteName;
    private String previousStatus;
    private String newStatus;
    private String reason;
    private String notes;
    private String changedBy;
    private LocalDateTime changedAt;
    private boolean success;
    private String errorMessage;
    private Long changeHistoryId; // Reference to audit trail
}





