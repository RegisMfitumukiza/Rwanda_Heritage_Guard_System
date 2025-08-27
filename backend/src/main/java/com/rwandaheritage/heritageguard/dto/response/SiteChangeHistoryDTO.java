package com.rwandaheritage.heritageguard.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SiteChangeHistoryDTO {
    private Long id;
    private Long siteId;
    private String siteName;
    private String fieldName;
    private String action;
    private String oldValue;
    private String newValue;
    private String changedBy;
    private LocalDateTime changedAt;
    private String reason;
    private String changeType;
    private String ipAddress;
    private String userAgent;
    
    // Human-readable field names
    private String fieldDisplayName;
    
    // Formatted timestamp
    private String formattedChangedAt;
    
    // Change summary for display
    private String changeSummary;
    
    // Whether this is a significant change
    private boolean isSignificantChange;
}

