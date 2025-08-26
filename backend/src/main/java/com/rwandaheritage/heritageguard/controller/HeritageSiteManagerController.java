package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.dto.request.AssignManagerDto;
import com.rwandaheritage.heritageguard.dto.response.ApiResponse;
import com.rwandaheritage.heritageguard.dto.response.HeritageSiteManagerResponseDto;
import com.rwandaheritage.heritageguard.model.User;
import com.rwandaheritage.heritageguard.service.HeritageSiteManagerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/heritage-site-manager")
@RequiredArgsConstructor
@Slf4j
public class HeritageSiteManagerController {
    
    private final HeritageSiteManagerService heritageSiteManagerService;
    
    /**
     * Assign a manager to a heritage site (System Admin only)
     */
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    @PostMapping("/sites/{siteId}/assign")
    public ResponseEntity<ApiResponse<HeritageSiteManagerResponseDto>> assignManagerToSite(
            @PathVariable Long siteId,
            @Valid @RequestBody AssignManagerDto dto) {
        
        log.info("System admin assigning manager {} to heritage site {}", dto.getManagerId(), siteId);
        
        HeritageSiteManagerResponseDto assignment = heritageSiteManagerService.assignManagerToSite(siteId, dto);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(assignment, "Manager successfully assigned to heritage site"));
    }
    
    /**
     * Remove a manager from a heritage site (System Admin only)
     */
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    @DeleteMapping("/sites/{siteId}/remove-manager")
    public ResponseEntity<ApiResponse<Void>> removeManagerFromSite(@PathVariable Long siteId) {
        
        log.info("System admin removing manager from heritage site {}", siteId);
        
        heritageSiteManagerService.removeManagerFromSite(siteId);
        
        return ResponseEntity.ok(ApiResponse.success(null, "Manager successfully removed from heritage site"));
    }
    
    /**
     * Get all manager assignments (System Admin only)
     */
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<HeritageSiteManagerResponseDto>>> getAllManagerAssignments() {
        
        List<HeritageSiteManagerResponseDto> assignments = heritageSiteManagerService.getAllManagerAssignments();
        
        return ResponseEntity.ok(ApiResponse.success(assignments, "Manager assignments retrieved successfully"));
    }
    
    /**
     * Get available heritage sites for assignment (System Admin only)
     */
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    @GetMapping("/available-sites")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAvailableSites() {
        
        List<Map<String, Object>> availableSites = heritageSiteManagerService.getAvailableSitesForAssignment();
        
        return ResponseEntity.ok(ApiResponse.success(availableSites, "Available sites retrieved successfully"));
    }
    
    /**
     * Get available heritage managers for assignment (System Admin only)
     */
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    @GetMapping("/available-managers")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAvailableManagers() {
        
        List<Map<String, Object>> availableManagers = heritageSiteManagerService.getAvailableManagersForAssignment();
        
        return ResponseEntity.ok(ApiResponse.success(availableManagers, "Available managers retrieved successfully"));
    }
    
    // REMOVED: Deprecated endpoints that referenced removed methods
    // These methods are no longer needed since we removed the problematic assignedManagerId field
    // The system now uses HeritageSiteManager table as single source of truth
    
    /**
     * Get the current assigned manager for a specific site
     */
    @GetMapping("/sites/{siteId}/current-manager")
    public ResponseEntity<ApiResponse<User>> getCurrentAssignedManager(@PathVariable Long siteId) {
        
        User currentManager = heritageSiteManagerService.getCurrentAssignedManager(siteId);
        
        if (currentManager == null) {
            return ResponseEntity.ok(ApiResponse.success(null, "No manager currently assigned to this site"));
        }
        
        return ResponseEntity.ok(ApiResponse.success(currentManager, "Current manager retrieved successfully"));
    }
    
    /**
     * Get manager assignment for a specific site (System Admin and assigned manager)
     */
    @GetMapping("/sites/{siteId}")
    public ResponseEntity<ApiResponse<HeritageSiteManagerResponseDto>> getManagerAssignmentForSite(@PathVariable Long siteId) {
        
        HeritageSiteManagerResponseDto assignment = heritageSiteManagerService.getManagerAssignmentForSite(siteId);
        
        return ResponseEntity.ok(ApiResponse.success(assignment, "Manager assignment retrieved successfully"));
    }
    
    /**
     * Get all sites managed by the current user (for heritage managers)
     */
    @PreAuthorize("hasRole('HERITAGE_MANAGER')")
    @GetMapping("/my-sites")
    public ResponseEntity<ApiResponse<List<HeritageSiteManagerResponseDto>>> getMyManagedSites() {
        
        // Get current authenticated user's username
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Getting managed sites for current user: {}", currentUsername);
        
        List<HeritageSiteManagerResponseDto> assignments = heritageSiteManagerService.getSitesManagedByCurrentUser(currentUsername);
        
        return ResponseEntity.ok(ApiResponse.success(assignments, "Your managed sites retrieved successfully"));
    }
    
    /**
     * Update assignment notes (System Admin only)
     */
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    @PatchMapping("/{assignmentId}/notes")
    public ResponseEntity<ApiResponse<HeritageSiteManagerResponseDto>> updateAssignmentNotes(
            @PathVariable Long assignmentId,
            @RequestParam String notes) {
        
        HeritageSiteManagerResponseDto updatedAssignment = heritageSiteManagerService.updateAssignmentNotes(assignmentId, notes);
        
        return ResponseEntity.ok(ApiResponse.success(updatedAssignment, "Assignment notes updated successfully"));
    }
    
    /**
     * Debug endpoint to check assignment state (System Admin only)
     */
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    @GetMapping("/debug-assignment")
    public ResponseEntity<ApiResponse<Map<String, Object>>> debugAssignmentState(
            @RequestParam Long userId,
            @RequestParam Long siteId) {
        
        Map<String, Object> debugInfo = heritageSiteManagerService.debugAssignmentState(userId, siteId);
        
        return ResponseEntity.ok(ApiResponse.success(debugInfo, "Assignment state debug information"));
    }
}
