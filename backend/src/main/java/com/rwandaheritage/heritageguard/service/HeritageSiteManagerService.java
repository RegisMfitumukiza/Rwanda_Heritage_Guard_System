package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.dto.request.AssignManagerDto;
import com.rwandaheritage.heritageguard.dto.response.HeritageSiteManagerResponseDto;
import com.rwandaheritage.heritageguard.exception.BusinessLogicException;
import com.rwandaheritage.heritageguard.exception.ResourceNotFoundException;
import com.rwandaheritage.heritageguard.model.HeritageSite;
import com.rwandaheritage.heritageguard.model.HeritageSiteManager;
import com.rwandaheritage.heritageguard.model.User;
import com.rwandaheritage.heritageguard.model.UserStatus;
import com.rwandaheritage.heritageguard.repository.HeritageSiteManagerRepository;
import com.rwandaheritage.heritageguard.repository.HeritageSiteRepository;
import com.rwandaheritage.heritageguard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class HeritageSiteManagerService {
    
    private final HeritageSiteManagerRepository heritageSiteManagerRepository;
    private final HeritageSiteRepository heritageSiteRepository;
    private final UserRepository userRepository;
    
    /**
     * Assign a manager to a heritage site (System Admin only)
     */
    public HeritageSiteManagerResponseDto assignManagerToSite(Long siteId, AssignManagerDto dto) {
        log.info("Assigning manager {} to heritage site {}", dto.getManagerId(), siteId);
        
        // Check if site exists
        HeritageSite site = heritageSiteRepository.findById(siteId)
                .orElseThrow(() -> new ResourceNotFoundException("Heritage site not found with id: " + siteId));
        
        // Check if user exists and is a heritage manager
        User manager = userRepository.findById(dto.getManagerId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + dto.getManagerId()));
        
        if (!manager.getRole().name().equals("HERITAGE_MANAGER")) {
            throw new BusinessLogicException("User must have HERITAGE_MANAGER role to be assigned to a site");
        }
        
        // Clean up any existing assignments for this site-manager combination
        List<HeritageSiteManager> existingAssignments = heritageSiteManagerRepository
                .findByHeritageSiteIdAndUserId(siteId, manager.getId());
        
        if (!existingAssignments.isEmpty()) {
            log.info("Found {} existing assignments for site {} and manager {}, physically deleting them...", 
                    existingAssignments.size(), siteId, manager.getId());
            
            // Physically delete old assignments to avoid unique constraint violation
            heritageSiteManagerRepository.deleteAll(existingAssignments);
            log.info("Successfully deleted {} old assignments for site {} and manager {}", 
                    existingAssignments.size(), siteId, manager.getId());
        }
        
        // Check if site already has an active manager
        if (heritageSiteManagerRepository.existsByHeritageSiteIdAndStatus(siteId, HeritageSiteManager.ManagerStatus.ACTIVE)) {
            throw new BusinessLogicException("Heritage site already has an active manager assigned");
        }
        
        // Check if user is already managing another site
        if (heritageSiteManagerRepository.countByUserIdAndStatus(manager.getId(), HeritageSiteManager.ManagerStatus.ACTIVE) > 0) {
            throw new BusinessLogicException("User is already managing another heritage site");
        }
        
        // Create the assignment
        HeritageSiteManager assignment = new HeritageSiteManager();
        assignment.setUser(manager);
        assignment.setHeritageSite(site);
        assignment.setStatus(HeritageSiteManager.ManagerStatus.ACTIVE);
        assignment.setNotes(dto.getNotes());
        
        HeritageSiteManager savedAssignment = heritageSiteManagerRepository.save(assignment);
        
        // The assignedManagerId will be automatically synchronized via JPA lifecycle events
        // No need to manually set it here - the @PostPersist/@PostUpdate will handle it
        log.info("Manager assignment created. HeritageSite.assignedManagerId will be automatically synchronized.");
        
        log.info("Successfully assigned manager {} to heritage site {}", manager.getUsername(), site.getNameEn());
        
        return HeritageSiteManagerResponseDto.fromEntity(savedAssignment);
    }
    
    /**
     * Remove a manager from a heritage site (System Admin only)
     */
    public void removeManagerFromSite(Long siteId) {
        log.info("Removing manager from heritage site {}", siteId);
        
        // Find active assignment for this site
        HeritageSiteManager assignment = heritageSiteManagerRepository
                .findByHeritageSiteIdAndStatus(siteId, HeritageSiteManager.ManagerStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("No active manager found for heritage site: " + siteId));
        
        // Physically delete the assignment to avoid unique constraint issues
        heritageSiteManagerRepository.delete(assignment);
        
        // The assignedManagerId will be automatically synchronized via JPA lifecycle events
        // No need to manually clear it here - the @PostUpdate will handle it
        log.info("Manager assignment removed. HeritageSite.assignedManagerId will be automatically synchronized.");
        
        log.info("Successfully removed (deleted) manager assignment {} for heritage site {}", assignment.getId(), siteId);
    }
    
    /**
     * Get all manager assignments
     */
    @Transactional(readOnly = true)
    public List<HeritageSiteManagerResponseDto> getAllManagerAssignments() {
        List<HeritageSiteManager> assignments = heritageSiteManagerRepository.findByStatus(HeritageSiteManager.ManagerStatus.ACTIVE);
        return assignments.stream()
                .map(HeritageSiteManagerResponseDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Get manager assignment for a specific site
     */
    @Transactional(readOnly = true)
    public HeritageSiteManagerResponseDto getManagerAssignmentForSite(Long siteId) {
        HeritageSiteManager assignment = heritageSiteManagerRepository
                .findByHeritageSiteIdAndStatus(siteId, HeritageSiteManager.ManagerStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("No active manager found for heritage site: " + siteId));
        
        return HeritageSiteManagerResponseDto.fromEntity(assignment);
    }
    
    /**
     * Check if a user is assigned as manager to a specific site
     */
    @Transactional(readOnly = true)
    public boolean isAssignedManager(Long userId, Long siteId) {
        log.info("Checking if user {} is assigned as manager to site {}", userId, siteId);
        
        // Validate parameters
        if (siteId == null || userId == null) {
            log.error("Invalid parameters: siteId={}, userId={}", siteId, userId);
            return false;
        }
        
        // Ensure correct parameter order: userId first, then siteId
        log.info("Executing query: existsByUserIdAndHeritageSiteIdAndStatus(userId={}, siteId={}, status=ACTIVE)", userId, siteId);
        boolean exists = heritageSiteManagerRepository.existsByUserIdAndHeritageSiteIdAndStatus(
                userId, siteId, HeritageSiteManager.ManagerStatus.ACTIVE);
        
        log.info("User {} assignment to site {}: {}", userId, siteId, exists);
        
        // Additional debugging: get the actual assignment record
        Optional<HeritageSiteManager> assignmentOpt = heritageSiteManagerRepository
                .findByUserIdAndHeritageSiteId(userId, siteId);
        
        if (assignmentOpt.isPresent()) {
            HeritageSiteManager assignment = assignmentOpt.get();
            log.info("Found assignment record for user {} and site {}: ID={}, Status={}", 
                    userId, siteId, assignment.getId(), assignment.getStatus());
        } else {
            log.warn("No assignment record found for user {} and site {}", userId, siteId);
            
            // Debug: check what assignments exist for this user
            List<HeritageSiteManager> userAssignments = heritageSiteManagerRepository
                    .findByUserIdAndStatus(userId, HeritageSiteManager.ManagerStatus.ACTIVE);
            log.info("User {} has {} active assignments: {}", userId, userAssignments.size(), 
                    userAssignments.stream()
                            .map(a -> String.format("SiteID=%d, AssignmentID=%d", a.getHeritageSite().getId(), a.getId()))
                            .collect(Collectors.joining(", ")));
        }
        
        return exists;
    }
    
    /**
     * Get all sites managed by a specific user
     */
    @Transactional(readOnly = true)
    public List<HeritageSiteManagerResponseDto> getSitesManagedByUser(Long userId) {
        log.info("Getting sites managed by user {}", userId);
        
        try {
            List<HeritageSiteManager> assignments = heritageSiteManagerRepository
                    .findByUserIdAndStatus(userId, HeritageSiteManager.ManagerStatus.ACTIVE);
            
            log.info("Found {} active assignments for user {}", assignments.size(), userId);
            
            return assignments.stream()
                    .map(HeritageSiteManagerResponseDto::fromEntity)
                    .filter(dto -> dto != null) // Filter out null DTOs
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting sites managed by user {}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Failed to get sites managed by user: " + e.getMessage(), e);
        }
    }
    
    /**
     * Get all sites managed by the current authenticated user
     */
    @Transactional(readOnly = true)
    public List<HeritageSiteManagerResponseDto> getSitesManagedByCurrentUser(String username) {
        log.info("Getting sites managed by current user: {}", username);
        
        try {
            // First find the user by username
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
            
            log.info("Found user: {} with ID: {}", username, currentUser.getId());
            
            // Then get their active site assignments
            List<HeritageSiteManager> assignments = heritageSiteManagerRepository
                    .findByUserIdAndStatus(currentUser.getId(), HeritageSiteManager.ManagerStatus.ACTIVE);
            
            log.info("Found {} active site assignments for user {}", assignments.size(), username);
            
            // Map to DTOs and filter out any null results
            List<HeritageSiteManagerResponseDto> dtos = assignments.stream()
                    .map(assignment -> {
                        try {
                            return HeritageSiteManagerResponseDto.fromEntity(assignment);
                        } catch (Exception e) {
                            log.error("Error mapping assignment {} to DTO: {}", assignment.getId(), e.getMessage(), e);
                            return null;
                        }
                    })
                    .filter(dto -> dto != null) // Filter out null DTOs
                    .collect(Collectors.toList());
            
            log.info("Successfully mapped {} assignments to DTOs for user {}", dtos.size(), username);
            return dtos;
            
        } catch (Exception e) {
            log.error("Error getting sites managed by user {}: {}", username, e.getMessage(), e);
            throw e;
        }
    }
    
    /**
     * Update manager assignment notes
     */
    public HeritageSiteManagerResponseDto updateAssignmentNotes(Long assignmentId, String notes) {
        HeritageSiteManager assignment = heritageSiteManagerRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager assignment not found with id: " + assignmentId));
        
        assignment.setNotes(notes);
        HeritageSiteManager savedAssignment = heritageSiteManagerRepository.save(assignment);
        
        return HeritageSiteManagerResponseDto.fromEntity(savedAssignment);
    }
    
    /**
     * Get available heritage sites for assignment (sites without active managers)
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAvailableSitesForAssignment() {
        log.info("Getting available heritage sites for manager assignment");
        
        // Get all sites that don't have active managers
        // Use HeritageSiteManager table as single source of truth
        List<HeritageSite> availableSites = heritageSiteRepository.findByIsActiveTrue().stream()
            .filter(site -> !heritageSiteManagerRepository.existsByHeritageSiteIdAndStatus(
                site.getId(), HeritageSiteManager.ManagerStatus.ACTIVE))
            .collect(Collectors.toList());
        
        return availableSites.stream()
                .map(site -> {
                    Map<String, Object> siteInfo = new HashMap<>();
                    siteInfo.put("id", site.getId());
                    siteInfo.put("name", site.getNameEn()); // Use English name for now
                    siteInfo.put("region", site.getRegion());
                    siteInfo.put("category", site.getCategory());
                    siteInfo.put("status", site.getStatus());
                    return siteInfo;
                })
                .collect(Collectors.toList());
    }
    
    // REMOVED: getDebugSitesState method (referenced removed assignedManagerId field)
    // This method is no longer needed since we removed the problematic field
    
    // REMOVED: isManagerAssignmentSynchronized method (referenced removed assignedManagerId field)
    // This method is no longer needed since we removed the problematic field
    
    // REMOVED: synchronizeAllManagerAssignments method (referenced removed assignedManagerId field)
    // This method is no longer needed since we removed the problematic field
    
    /**
     * Get the current assigned manager for a specific site
     * @param siteId The heritage site ID
     * @return The assigned manager user, or null if no manager is assigned
     */
    @Transactional(readOnly = true)
    public User getCurrentAssignedManager(Long siteId) {
        HeritageSiteManager activeAssignment = heritageSiteManagerRepository
                .findByHeritageSiteIdAndStatus(siteId, HeritageSiteManager.ManagerStatus.ACTIVE)
                .orElse(null);
        
        return activeAssignment != null ? activeAssignment.getUser() : null;
    }
    
    /**
     * Get available heritage managers for assignment (HERITAGE_MANAGER users not currently managing sites)
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAvailableManagersForAssignment() {
        log.info("Getting available heritage managers for site assignment");
        
        // Get all HERITAGE_MANAGER users who are not currently managing any sites
        List<User> availableManagers = userRepository.findAvailableHeritageManagers();
        
        return availableManagers.stream()
                .map(manager -> {
                    Map<String, Object> managerInfo = new HashMap<>();
                    managerInfo.put("id", manager.getId());
                    managerInfo.put("username", manager.getUsername());
                    managerInfo.put("firstName", manager.getFirstName());
                    managerInfo.put("lastName", manager.getLastName());
                    managerInfo.put("email", manager.getEmail());
                    managerInfo.put("fullName", manager.getFirstName() + " " + manager.getLastName());
                    return managerInfo;
                })
                .collect(Collectors.toList());
    }
    
    /**
     * Event listener for user status changes
     * Automatically deletes manager assignments when user status changes to non-active
     */
    @EventListener
    @Async
    @Transactional
    public void handleUserStatusChange(com.rwandaheritage.heritageguard.event.UserStatusChangedEvent event) {
        Long userId = event.getUserId();
        UserStatus newStatus = event.getNewStatus();
        
        log.info("User status change detected: User {} status changed to {}", userId, newStatus);
        
        // If user is no longer active, delete all their manager assignments
        if (newStatus != UserStatus.ACTIVE) {
            try {
                deactivateAllAssignmentsForUser(userId);
                log.info("Successfully deleted all manager assignments for user {} due to status change to {}", 
                        userId, newStatus);
            } catch (Exception e) {
                log.error("Failed to delete manager assignments for user {} after status change to {}", 
                         userId, newStatus, e);
            }
        }
    }
    
    /**
     * Delete all manager assignments for a specific user
     * Used when user status changes to non-active
     */
    @Transactional
    public void deactivateAllAssignmentsForUser(Long userId) {
        log.info("Deleting all manager assignments for user {}", userId);
        
        List<HeritageSiteManager> assignments = heritageSiteManagerRepository
                .findByUserIdAndStatus(userId, HeritageSiteManager.ManagerStatus.ACTIVE);
        
        if (assignments.isEmpty()) {
            log.info("No active manager assignments found for user {}", userId);
            return;
        }
        
        // Physically delete all assignments to avoid unique constraint issues
        heritageSiteManagerRepository.deleteAll(assignments);
        log.info("Successfully deleted {} manager assignments for user {}", assignments.size(), userId);
    }

    /**
     * Debug method to check current assignment state
     */
    @Transactional(readOnly = true)
    public Map<String, Object> debugAssignmentState(Long userId, Long siteId) {
        Map<String, Object> debugInfo = new HashMap<>();
        
        // Check user
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            debugInfo.put("user", Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "role", user.getRole().name()
            ));
        } else {
            debugInfo.put("user", "NOT_FOUND");
        }
        
        // Check site
        Optional<HeritageSite> siteOpt = heritageSiteRepository.findById(siteId);
        if (siteOpt.isPresent()) {
            HeritageSite site = siteOpt.get();
            debugInfo.put("site", Map.of(
                "id", site.getId(),
                "name", site.getNameEn(),
                "region", site.getRegion(),
                "isActive", site.isActive()
            ));
        } else {
            debugInfo.put("site", "NOT_FOUND");
        }
        
        // Check assignments
        List<HeritageSiteManager> userAssignments = heritageSiteManagerRepository
                .findByUserIdAndStatus(userId, HeritageSiteManager.ManagerStatus.ACTIVE);
        debugInfo.put("userActiveAssignments", userAssignments.stream()
                .map(a -> Map.of(
                    "assignmentId", a.getId(),
                    "siteId", a.getHeritageSite().getId(),
                    "siteName", a.getHeritageSite().getNameEn(),
                    "status", a.getStatus().name()
                ))
                .collect(Collectors.toList()));
        
        // Check site assignments
        Optional<HeritageSiteManager> siteAssignmentOpt = heritageSiteManagerRepository
                .findByHeritageSiteIdAndStatus(siteId, HeritageSiteManager.ManagerStatus.ACTIVE);
        
        if (siteAssignmentOpt.isPresent()) {
            HeritageSiteManager siteAssignment = siteAssignmentOpt.get();
            debugInfo.put("siteActiveAssignments", List.of(Map.of(
                "assignmentId", siteAssignment.getId(),
                "userId", siteAssignment.getUser().getId(),
                "userEmail", siteAssignment.getUser().getEmail(),
                "status", siteAssignment.getStatus().name()
            )));
        } else {
            debugInfo.put("siteActiveAssignments", List.of());
        }
        
        return debugInfo;
    }
}
