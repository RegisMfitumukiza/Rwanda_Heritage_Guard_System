package com.rwandaheritage.heritageguard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Extended HeritageSiteDTO that includes manager assignment information
 * This maintains backward compatibility while providing manager data
 */
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class HeritageSiteWithManagerDTO extends HeritageSiteDTO {
    
    // Manager assignment information
    private Long assignedManagerId;
    private String assignedManagerUsername;
    private String assignedManagerFullName;
    private String assignedManagerEmail;
    private LocalDateTime managerAssignedDate;
    private String managerAssignmentStatus;
}
