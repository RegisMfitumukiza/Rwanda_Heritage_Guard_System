package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.model.User;
import com.rwandaheritage.heritageguard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class RbacService {

    private final UserRepository userRepository;

    // Email pattern constants for role determination
    private static final Pattern HERITAGE_MANAGER_PATTERN = Pattern.compile("^manager\\d+\\.heritage@.*$");
    private static final Pattern CONTENT_MANAGER_PATTERN = Pattern.compile("^manager\\d+\\.content@.*$");
    private static final Pattern ADMIN_PATTERN = Pattern.compile("^admin\\.admin@.*$");
    
    // Role constraints
    private static final int MAX_MANAGERS_PER_TYPE = 10;
    private static final int MAX_ADMINS = 1;

    /**
     * Get role statistics for the system
     */
    public Map<String, Object> getRoleStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalUsers", userRepository.countByIsEnabledTrue());
        stats.put("heritageManagers", userRepository.countByRole(User.Role.HERITAGE_MANAGER));
        stats.put("contentManagers", userRepository.countByRole(User.Role.CONTENT_MANAGER));
        stats.put("systemAdministrators", userRepository.countByRole(User.Role.SYSTEM_ADMINISTRATOR));
        stats.put("communityMembers", userRepository.countByRole(User.Role.COMMUNITY_MEMBER));
        
        return stats;
    }

    /**
     * Validate if a role can be assigned to an email
     */
    public Map<String, Object> validateRoleAssignment(String email, User.Role role) {
        Map<String, Object> validation = new HashMap<>();
        String emailLower = email.toLowerCase();
        
        boolean isValid = true;
        String message = "";
        
        switch (role) {
            case SYSTEM_ADMINISTRATOR:
                if (!ADMIN_PATTERN.matcher(emailLower).matches()) {
                    isValid = false;
                    message = "System administrator must use admin.admin@... email pattern";
                } else if (userRepository.existsByRole(User.Role.SYSTEM_ADMINISTRATOR)) {
                    isValid = false;
                    message = "System administrator account already exists";
                }
                break;
                
            case HERITAGE_MANAGER:
                if (!HERITAGE_MANAGER_PATTERN.matcher(emailLower).matches()) {
                    isValid = false;
                    message = "Heritage manager must use managerX.heritage@... email pattern";
                } else {
                    int currentCount = (int) userRepository.countByRole(User.Role.HERITAGE_MANAGER);
                    if (currentCount >= MAX_MANAGERS_PER_TYPE) {
                        isValid = false;
                        message = "Maximum number of heritage managers reached (" + MAX_MANAGERS_PER_TYPE + ")";
                    }
                }
                break;
                
            case CONTENT_MANAGER:
                if (!CONTENT_MANAGER_PATTERN.matcher(emailLower).matches()) {
                    isValid = false;
                    message = "Content manager must use managerX.content@... email pattern";
                } else {
                    int currentCount = (int) userRepository.countByRole(User.Role.CONTENT_MANAGER);
                    if (currentCount >= MAX_MANAGERS_PER_TYPE) {
                        isValid = false;
                        message = "Maximum number of content managers reached (" + MAX_MANAGERS_PER_TYPE + ")";
                    }
                }
                break;
                
            case COMMUNITY_MEMBER:
                // Community members can use any email pattern
                isValid = true;
                message = "Valid community member email";
                break;
                
            default:
                isValid = false;
                message = "Invalid role specified";
        }
        
        validation.put("isValid", isValid);
        validation.put("message", message);
        validation.put("role", role.name());
        validation.put("email", email);
        
        return validation;
    }

    /**
     * Get available roles for a given email pattern
     */
    public List<User.Role> getAvailableRolesForEmail(String email) {
        String emailLower = email.toLowerCase();
        List<User.Role> availableRoles = new java.util.ArrayList<>();
        
        // Check admin pattern
        if (ADMIN_PATTERN.matcher(emailLower).matches() && 
            !userRepository.existsByRole(User.Role.SYSTEM_ADMINISTRATOR)) {
            availableRoles.add(User.Role.SYSTEM_ADMINISTRATOR);
        }
        
        // Check heritage manager pattern
        if (HERITAGE_MANAGER_PATTERN.matcher(emailLower).matches()) {
            int currentCount = (int) userRepository.countByRole(User.Role.HERITAGE_MANAGER);
            if (currentCount < MAX_MANAGERS_PER_TYPE) {
                availableRoles.add(User.Role.HERITAGE_MANAGER);
            }
        }
        
        // Check content manager pattern
        if (CONTENT_MANAGER_PATTERN.matcher(emailLower).matches()) {
            int currentCount = (int) userRepository.countByRole(User.Role.CONTENT_MANAGER);
            if (currentCount < MAX_MANAGERS_PER_TYPE) {
                availableRoles.add(User.Role.CONTENT_MANAGER);
            }
        }
        
        // Community member is always available
        availableRoles.add(User.Role.COMMUNITY_MEMBER);
        
        return availableRoles;
    }

    /**
     * Get role constraints and limits
     */
    public Map<String, Object> getRoleConstraints() {
        Map<String, Object> constraints = new HashMap<>();
        
        constraints.put("maxAdmins", MAX_ADMINS);
        constraints.put("maxManagersPerType", MAX_MANAGERS_PER_TYPE);
        constraints.put("currentAdmins", userRepository.countByRole(User.Role.SYSTEM_ADMINISTRATOR));
        constraints.put("currentHeritageManagers", userRepository.countByRole(User.Role.HERITAGE_MANAGER));
        constraints.put("currentContentManagers", userRepository.countByRole(User.Role.CONTENT_MANAGER));
        
        return constraints;
    }

    /**
     * Check if a user can be promoted to a specific role
     */
    public boolean canPromoteUser(User user, User.Role newRole) {
        if (user.getRole() == newRole) {
            return false; // Already has the role
        }
        
        // Check if the new role is available for this user's email
        List<User.Role> availableRoles = getAvailableRolesForEmail(user.getEmail());
        return availableRoles.contains(newRole);
    }

    /**
     * Get all users by role for management purposes
     */
    public List<User> getUsersByRole(User.Role role) {
        return userRepository.findByRole(role);
    }

    /**
     * Get role hierarchy information
     */
    public Map<String, Object> getRoleHierarchy() {
        Map<String, Object> hierarchy = new HashMap<>();
        
        // Define role hierarchy (higher number = higher privilege)
        Map<String, Integer> roleLevels = new HashMap<>();
        roleLevels.put("COMMUNITY_MEMBER", 1);
        roleLevels.put("CONTENT_MANAGER", 2);
        roleLevels.put("HERITAGE_MANAGER", 3);
        roleLevels.put("SYSTEM_ADMINISTRATOR", 4);
        
        hierarchy.put("roleLevels", roleLevels);
        hierarchy.put("description", "Higher numbers indicate higher privilege levels");
        
        return hierarchy;
    }
}

