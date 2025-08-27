package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.model.User;
import com.rwandaheritage.heritageguard.model.UserStatus;
import com.rwandaheritage.heritageguard.service.UserService;
import com.rwandaheritage.heritageguard.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;
    private final AuthenticationService authenticationService;

    @GetMapping("/profile")
    public ResponseEntity<User> getCurrentUserProfile(Authentication authentication) {
        String username = authentication.getName();
        log.info("Fetching profile for user: {}", username);
        
        // Debug authentication object
        if (authentication != null) {
            log.info("Authentication object: {}", authentication);
            log.info("Authentication principal: {}", authentication.getPrincipal());
            log.info("Authentication authorities: {}", authentication.getAuthorities());
            log.info("Authentication is authenticated: {}", authentication.isAuthenticated());
        } else {
            log.warn("Authentication object is null!");
        }
        
        User user = userService.getUserByUsername(username);
        log.info("Retrieved user: {}", user);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getUserStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalMembers", userService.getTotalUserCount());
        stats.put("activeMembers", userService.getActiveUserCount());
        stats.put("recentMembers", userService.getRecentUserCount(30)); // Last 30 days
        stats.put("verifiedMembers", userService.getVerifiedUserCount());
        return ResponseEntity.ok(stats);
    }

    /**
     * Get all users (admin only)
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status) {
        
        try {
            log.info("=== USER LISTING DEBUG ===");
            log.info("Fetching users - page: {}, size: {}, search: {}, role: {}, status: {}", 
                    page, size, search, role, status);
            
            Map<String, Object> response = new HashMap<>();
            
            // Get users with pagination
            log.info("Calling userService.getAllUsers...");
            List<User> users = userService.getAllUsers(page, size, search, role, status);
            log.info("Retrieved {} users from service", users.size());
            
            log.info("Calling userService.getTotalUserCount with filters...");
            long totalUsers = userService.getTotalUserCount(search, role, status);
            log.info("Total user count: {}", totalUsers);
            
            // Log first few users for debugging
            if (!users.isEmpty()) {
                log.info("First user: ID={}, Email={}, Role={}, Enabled={}", 
                    users.get(0).getId(), users.get(0).getEmail(), users.get(0).getRole(), users.get(0).isEnabled());
            }
            
            response.put("users", users);
            response.put("totalUsers", totalUsers);
            response.put("currentPage", page);
            response.put("pageSize", size);
            response.put("totalPages", (int) Math.ceil((double) totalUsers / size));
            
            log.info("Response prepared with {} users, total: {}", users.size(), totalUsers);
            log.info("=== END USER LISTING DEBUG ===");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("=== USER LISTING ERROR ===");
            log.error("Error fetching users", e);
            log.error("Stack trace:", e);
            log.error("=== END USER LISTING ERROR ===");
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get user by ID (admin only)
     */
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        try {
            log.info("Fetching user by ID: {}", id);
            User user = userService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            log.error("Error fetching user by ID: {}", id, e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Enable/Disable user (admin only)
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<Map<String, Object>> updateUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> request) {
        try {
            log.info("Admin updating user status - ID: {}, Enabled: {}", id, request.get("enabled"));
            
            Boolean enabled = request.get("enabled");
            if (enabled == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "enabled field is required"));
            }

            User updatedUser = userService.updateUserStatus(id, enabled);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User status updated successfully");
            response.put("userId", id);
            response.put("enabled", updatedUser.isEnabled());
            response.put("username", updatedUser.getUsername());
            response.put("email", updatedUser.getEmail());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error updating user status - ID: {}", id, e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Unlock user account (admin only)
     */
    @PutMapping("/{id}/unlock")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<Map<String, Object>> unlockUser(@PathVariable Long id) {
        try {
            log.info("Admin unlocking user - ID: {}", id);
            
            User updatedUser = userService.unlockUser(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User unlocked successfully");
            response.put("userId", id);
            response.put("username", updatedUser.getUsername());
            response.put("email", updatedUser.getEmail());
            response.put("accountNonLocked", updatedUser.isAccountNonLocked());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error unlocking user - ID: {}", id, e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete user (admin only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable Long id) {
        try {
            log.info("Admin deleting user - ID: {}", id);
            
            userService.deleteUser(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User deleted successfully");
            response.put("userId", id);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error deleting user - ID: {}", id, e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
    
    // ===== NEW STATUS MANAGEMENT ENDPOINTS =====
    
    /**
     * Suspend user (temporary suspension - can be reactivated)
     */
    @PutMapping("/{id}/suspend")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<Map<String, Object>> suspendUser(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            String reason = request.get("reason");
            String adminUsername = authentication.getName();
            
            if (reason == null || reason.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Reason is required for suspension"));
            }
            
            log.info("Admin suspending user - ID: {}, Reason: {}, Admin: {}", id, reason, adminUsername);
            User updatedUser = userService.suspendUser(id, reason, adminUsername);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User suspended successfully");
            response.put("userId", id);
            response.put("username", updatedUser.getUsername());
            response.put("status", updatedUser.getUserStatus());
            response.put("reason", reason);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error suspending user - ID: {}", id, e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Disable user (permanent deactivation - cannot be reactivated)
     */
    @PutMapping("/{id}/disable")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<Map<String, Object>> disableUser(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            String reason = request.get("reason");
            String adminUsername = authentication.getName();
            
            if (reason == null || reason.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Reason is required for disabling"));
            }
            
            log.info("Admin disabling user - ID: {}, Reason: {}, Admin: {}", id, reason, adminUsername);
            User updatedUser = userService.disableUser(id, reason, adminUsername);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User disabled successfully");
            response.put("userId", id);
            response.put("username", updatedUser.getUsername());
            response.put("status", updatedUser.getUserStatus());
            response.put("reason", reason);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error disabling user - ID: {}", id, e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Soft delete user (mark as deleted but preserve data)
     */
    @PutMapping("/{id}/soft-delete")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<Map<String, Object>> softDeleteUser(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            String reason = request.get("reason");
            String adminUsername = authentication.getName();
            
            if (reason == null || reason.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Reason is required for deletion"));
            }
            
            log.info("Admin soft deleting user - ID: {}, Reason: {}, Admin: {}", id, reason, adminUsername);
            User updatedUser = userService.softDeleteUser(id, reason, adminUsername);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User soft deleted successfully");
            response.put("userId", id);
            response.put("username", updatedUser.getUsername());
            response.put("status", updatedUser.getUserStatus());
            response.put("reason", reason);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error soft deleting user - ID: {}", id, e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Reactivate suspended user
     */
    @PutMapping("/{id}/reactivate")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<Map<String, Object>> reactivateUser(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            String adminUsername = authentication.getName();
            log.info("Admin reactivating user - ID: {}, Admin: {}", id, adminUsername);
            
            User updatedUser = userService.reactivateUser(id, adminUsername);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User reactivated successfully");
            response.put("userId", id);
            response.put("username", updatedUser.getUsername());
            response.put("status", updatedUser.getUserStatus());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error reactivating user - ID: {}", id, e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Restore soft-deleted user
     */
    @PutMapping("/{id}/restore")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<Map<String, Object>> restoreUser(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            String adminUsername = authentication.getName();
            log.info("Admin restoring user - ID: {}, Admin: {}", id, adminUsername);
            
            User updatedUser = userService.restoreUser(id, adminUsername);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User restored successfully");
            response.put("userId", id);
            response.put("username", updatedUser.getUsername());
            response.put("status", updatedUser.getUserStatus());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error restoring user - ID: {}", id, e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get users by status
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<List<User>> getUsersByStatus(@PathVariable String status) {
        try {
            UserStatus userStatus = UserStatus.valueOf(status.toUpperCase());
            List<User> users = userService.getUsersByStatus(userStatus);
            return ResponseEntity.ok(users);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error getting users by status: {}", status, e);
            return ResponseEntity.internalServerError().build();
        }
    }
} 