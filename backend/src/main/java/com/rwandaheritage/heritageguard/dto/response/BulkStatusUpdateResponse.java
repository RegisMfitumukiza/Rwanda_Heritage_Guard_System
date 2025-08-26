package com.rwandaheritage.heritageguard.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO for bulk heritage site status updates
 * Provides detailed feedback on bulk operations
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkStatusUpdateResponse {
    
    private int totalRequested;
    private int successfulUpdates;
    private int failedUpdates;
    private String newStatus;
    private String reason;
    private String performedBy;
    private LocalDateTime performedAt;
    private List<StatusChangeResponse> results;
    private List<String> errors;
    private String bulkOperationId; // For tracking
}





