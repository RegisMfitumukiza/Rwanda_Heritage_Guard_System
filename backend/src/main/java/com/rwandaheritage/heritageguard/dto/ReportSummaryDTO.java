package com.rwandaheritage.heritageguard.dto;

import lombok.*;
import java.util.Map;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReportSummaryDTO {
    
    private String contentType;
    private Long contentId;
    private int totalReports;
    private int unresolvedReports;
    private Map<String, Integer> reportsByReason; // reason -> count
    private boolean needsAttention; // true if reports >= threshold
    private String recommendedAction; // FLAG, DELETE, IGNORE
} 