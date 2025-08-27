package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.model.User;
import com.rwandaheritage.heritageguard.service.RbacService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/rbac")
@RequiredArgsConstructor
@Slf4j
public class RbacController {

    private final RbacService rbacService;

    /**
     * Get role statistics for the system
     * Accessible by SYSTEM_ADMINISTRATOR only
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<Map<String, Object>> getRoleStatistics() {
        log.info("Admin requested role statistics");
        Map<String, Object> stats = rbacService.getRoleStatistics();
        return ResponseEntity.ok(stats);
    }

    /**
     * Validate if a role can be assigned to an email
     * Accessible by SYSTEM_ADMINISTRATOR only
     */
    @PostMapping("/validate-role")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<Map<String, Object>> validateRoleAssignment(
            @RequestBody Map<String, String> request) {
        
        String email = request.get("email");
        String role = request.get("role");
        
        if (email == null || role == null) {
            Map<String, Object> error = Map.of(
                "isValid", false,
                "message", "Email and role are required",
                "email", email,
                "role", role
            );
            return ResponseEntity.badRequest().body(error);
        }
        
        log.info("Admin validating role assignment: {} -> {}", email, role);
        
        try {
            User.Role userRole = User.Role.valueOf(role.toUpperCase());
            Map<String, Object> validation = rbacService.validateRoleAssignment(email, userRole);
            return ResponseEntity.ok(validation);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = Map.of(
                "isValid", false,
                "message", "Invalid role: " + role,
                "role", role,
                "email", email
            );
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get available roles for a given email pattern
     * Accessible by SYSTEM_ADMINISTRATOR only
     */
    @GetMapping("/available-roles")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<Map<String, Object>> getAvailableRolesForEmail(@RequestParam String email) {
        log.info("Admin checking available roles for email: {}", email);
        
        var availableRoles = rbacService.getAvailableRolesForEmail(email);
        Map<String, Object> response = Map.of(
            "email", email,
            "availableRoles", availableRoles.stream().map(Enum::name).toList()
        );
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get role constraints and limits
     * Accessible by SYSTEM_ADMINISTRATOR only
     */
    @GetMapping("/constraints")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<Map<String, Object>> getRoleConstraints() {
        log.info("Admin requested role constraints");
        Map<String, Object> constraints = rbacService.getRoleConstraints();
        return ResponseEntity.ok(constraints);
    }

    /**
     * Get role hierarchy information
     * Accessible by SYSTEM_ADMINISTRATOR only
     */
    @GetMapping("/hierarchy")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<Map<String, Object>> getRoleHierarchy() {
        log.info("Admin requested role hierarchy");
        Map<String, Object> hierarchy = rbacService.getRoleHierarchy();
        return ResponseEntity.ok(hierarchy);
    }

    /**
     * Check if a user can be promoted to a specific role
     * Accessible by SYSTEM_ADMINISTRATOR only
     */
    @PostMapping("/can-promote")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<Map<String, Object>> canPromoteUser(
            @RequestParam Long userId,
            @RequestParam String newRole) {
        log.info("Admin checking if user {} can be promoted to {}", userId, newRole);
        
        try {
            User.Role role = User.Role.valueOf(newRole.toUpperCase());
            // Note: In a real implementation, you'd fetch the user from the database
            // For now, we'll return a placeholder response
            Map<String, Object> response = Map.of(
                "userId", userId,
                "newRole", newRole,
                "canPromote", true, // Placeholder - implement actual logic
                "message", "User promotion validation completed"
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = Map.of(
                "userId", userId,
                "newRole", newRole,
                "canPromote", false,
                "message", "Invalid role: " + newRole
            );
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get all users by role for management purposes
     * Accessible by SYSTEM_ADMINISTRATOR only
     */
    @GetMapping("/users-by-role")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<Map<String, Object>> getUsersByRole(@RequestParam String role) {
        log.info("Admin requested users by role: {}", role);
        
        try {
            User.Role userRole = User.Role.valueOf(role.toUpperCase());
            var users = rbacService.getUsersByRole(userRole);
            
            Map<String, Object> response = Map.of(
                "role", role,
                "userCount", users.size(),
                "users", users.stream()
                    .map(user -> Map.of(
                        "id", user.getId(),
                        "username", user.getUsername(),
                        "email", user.getEmail(),
                        "fullName", user.getFullName(),
                        "isEnabled", user.isEnabled(),
                        "dateCreated", user.getDateCreated()
                    ))
                    .toList()
            );
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = Map.of(
                "error", "Invalid role: " + role,
                "message", "Please provide a valid role"
            );
            return ResponseEntity.badRequest().body(error);
        }
    }
}

