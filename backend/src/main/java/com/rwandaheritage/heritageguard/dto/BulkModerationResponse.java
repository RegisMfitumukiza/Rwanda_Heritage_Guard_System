package com.rwandaheritage.heritageguard.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkModerationResponse {
    
    private String bulkActionId;
    private String actionType;
    private String contentType;
    private int totalRequested;
    private int successfulActions;
    private int failedActions;
    private List<Long> successfulIds;
    private Map<Long, String> failedIdsWithReasons;
    private String reason;
    private boolean automated;
    private Double confidenceScore;
    private LocalDateTime completedAt;
    private String moderatorId;
}