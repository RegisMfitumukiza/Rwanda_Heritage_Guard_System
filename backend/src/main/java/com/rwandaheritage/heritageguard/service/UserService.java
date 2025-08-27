package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.model.User;
import com.rwandaheritage.heritageguard.model.UserStatus;
import com.rwandaheritage.heritageguard.repository.UserRepository;
import com.rwandaheritage.heritageguard.event.UserStatusChangedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.ApplicationEventPublisher;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional(readOnly = true)
    public User getUserByUsername(String username) {
        log.debug("Finding user by username: {}", username);
        return userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.error("User not found with username: {}", username);
                    return new RuntimeException("User not found");
                });
    }

    @Transactional(readOnly = true)
    public Long getTotalUserCount() {
        try {
            log.info("Getting total user count from repository...");
            Long count = userRepository.count();
            log.info("Total user count: {}", count);
            return count;
        } catch (Exception e) {
            log.error("Error getting total user count", e);
            throw e;
        }
    }
    
    /**
     * Get total user count with search filtering
     */
    @Transactional(readOnly = true)
    public Long getTotalUserCount(String search, String role, String status) {
        try {
            log.info("Getting filtered user count - search: {}, role: {}, status: {}", search, role, status);
            
            long count;
            if (search != null && !search.trim().isEmpty()) {
                String searchTerm = search.trim();
                
                // Check if search contains multiple words (like "Manager2 Heritage")
                if (searchTerm.contains(" ")) {
                    String[] terms = searchTerm.split("\\s+");
                    if (terms.length >= 2) {
                        log.info("Multiple search terms detected for count: '{}' and '{}'", terms[0], terms[1]);
                        count = userRepository.findByMultipleSearchTerms(terms[0], terms[1]).size();
                    } else {
                        count = userRepository.findBySearchCriteria(searchTerm).size();
                    }
                } else {
                    count = userRepository.findBySearchCriteria(searchTerm).size();
                }
            } else if (role != null && !role.trim().isEmpty()) {
                count = userRepository.countByRole(User.Role.valueOf(role.toUpperCase()));
            } else if (status != null && !status.trim().isEmpty()) {
                count = userRepository.countByUserStatus(UserStatus.valueOf(status.toUpperCase()));
            } else {
                count = userRepository.count();
            }
            
            log.info("Filtered user count: {}", count);
            return count;
        } catch (Exception e) {
            log.error("Error getting filtered user count", e);
            throw e;
        }
    }

    // Old method removed - replaced with new status-based method

    public Long getRecentUserCount(int days) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(days);
        return userRepository.countByCreatedDateAfter(cutoffDate);
    }

    public Long getVerifiedUserCount() {
        return userRepository.countByEmailVerifiedTrue();
    }

    // Analytics methods for real data tracking
    public int getCurrentActiveUsers() {
        // Real implementation - get current active sessions
        return userRepository.getCurrentActiveUsers();
    }

    public long getUserCountByDate(java.time.LocalDate date) {
        return userRepository.getUserCountByDate(date);
    }

    /**
     * Get all users with pagination and filtering
     */
    @Transactional(readOnly = true)
    public List<User> getAllUsers(int page, int size, String search, String role, String status) {
        log.info("=== USER SERVICE DEBUG ===");
        log.info("Fetching users - page: {}, size: {}, search: {}, role: {}, status: {}", 
                page, size, search, role, status);
        
        try {
            List<User> users;
            
            // Apply search and filtering
            if (search != null && !search.trim().isEmpty()) {
                log.info("Applying search filter: '{}'", search);
                String searchTerm = search.trim();
                
                // Check if search contains multiple words (like "Manager2 Heritage")
                if (searchTerm.contains(" ")) {
                    String[] terms = searchTerm.split("\\s+");
                    if (terms.length >= 2) {
                        log.info("Multiple search terms detected: '{}' and '{}'", terms[0], terms[1]);
                        users = userRepository.findByMultipleSearchTerms(terms[0], terms[1]);
                    } else {
                        users = userRepository.findBySearchCriteria(searchTerm);
                    }
                } else {
                    users = userRepository.findBySearchCriteria(searchTerm);
                }
            } else if (role != null && !role.trim().isEmpty()) {
                log.info("Applying role filter: '{}'", role);
                users = userRepository.findByRole(User.Role.valueOf(role.toUpperCase()));
            } else if (status != null && !status.trim().isEmpty()) {
                log.info("Applying status filter: '{}'", status);
                users = userRepository.findByUserStatus(UserStatus.valueOf(status.toUpperCase()));
            } else {
                log.info("No filters applied, fetching all users");
                users = userRepository.findAll();
            }
            
            // Apply pagination
            int startIndex = page * size;
            int endIndex = Math.min(startIndex + size, users.size());
            
            if (startIndex < users.size()) {
                users = users.subList(startIndex, endIndex);
                log.info("Applied pagination: page {}, size {}, showing users {} to {}", 
                        page, size, startIndex + 1, endIndex);
            } else {
                users = new ArrayList<>();
                log.info("Page {} is beyond available data, returning empty list", page);
            }
            
            log.info("Final result: {} users after filtering and pagination", users.size());
            log.info("=== END USER SERVICE DEBUG ===");
            return users;
            
        } catch (Exception e) {
            log.error("=== USER SERVICE ERROR ===");
            log.error("Error in getAllUsers", e);
            log.error("=== END USER SERVICE ERROR ===");
            throw e;
        }
    }

    /**
     * Get user by ID
     */
    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        log.debug("Finding user by ID: {}", id);
        return userRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", id);
                    return new RuntimeException("User not found");
                });
    }
    
    /**
     * Check if user exists with same full name
     */
    @Transactional(readOnly = true)
    public boolean userExistsByFullName(String firstName, String lastName) {
        return userRepository.existsByFullName(firstName, lastName);
    }
    
    /**
     * Check if user exists with same full name, excluding a specific user ID
     */
    @Transactional(readOnly = true)
    public boolean userExistsByFullNameExcludingUser(String firstName, String lastName, Long excludeUserId) {
        return userRepository.existsByFullNameExcludingUser(firstName, lastName, excludeUserId);
    }

    /**
     * Update user status (enable/disable) with automatic locking
     */
    @Transactional
    public User updateUserStatus(Long id, boolean enabled) {
        log.info("Updating user status - ID: {}, Enabled: {}", id, enabled);
        
        User user = getUserById(id);
        
        // Prevent admin from disabling themselves
        if (user.getRole() == User.Role.SYSTEM_ADMINISTRATOR && !enabled) {
            throw new RuntimeException("Cannot disable system administrator account");
        }
        
        // Set the enabled status
        user.setEnabled(enabled);
        
        // Security best practice: Automatically lock/unlock account based on enabled status
        if (!enabled) {
            // When disabling: lock the account and reset failed login attempts
            user.setAccountNonLocked(false);
            user.setFailedLoginAttempts(0);
            user.setLockoutTime(null);
            log.info("Account automatically locked for disabled user - ID: {}, Username: {}", 
                    id, user.getUsername());
        } else {
            // When enabling: unlock the account and clear any lockout
            user.setAccountNonLocked(true);
            user.setFailedLoginAttempts(0);
            user.setLockoutTime(null);
            log.info("Account automatically unlocked for enabled user - ID: {}, Username: {}", 
                    id, user.getUsername());
        }
        
        User updatedUser = userRepository.save(user);
        
        log.info("User status updated with automatic locking - ID: {}, Username: {}, Enabled: {}, AccountLocked: {}", 
                id, updatedUser.getUsername(), updatedUser.isEnabled(), !updatedUser.isAccountNonLocked());
        
        return updatedUser;
    }

    /**
     * Unlock user account (clear security lockout)
     */
    @Transactional
    public User unlockUser(Long id) {
        log.info("Unlocking user - ID: {}", id);
        
        User user = getUserById(id);
        
        if (user.isAccountNonLocked()) {
            log.warn("Attempted to unlock an already unlocked account - ID: {}", id);
            return user; // Already unlocked, no action needed
        }
        
        // Clear the security lockout
        user.setAccountNonLocked(true);
        user.setFailedLoginAttempts(0);
        user.setLockoutTime(null);
        
        User updatedUser = userRepository.save(user);
        
        log.info("User unlocked - ID: {}, Username: {}", id, updatedUser.getUsername());
        
        return updatedUser;
    }

    /**
     * Delete user
     */
    @Transactional
    public void deleteUser(Long id) {
        log.info("Deleting user - ID: {}", id);
        
        User user = getUserById(id);
        
        // Prevent admin from deleting themselves
        if (user.getRole() == User.Role.SYSTEM_ADMINISTRATOR) {
            throw new RuntimeException("Cannot delete system administrator account");
        }
        
        userRepository.deleteById(id);
        
        log.info("User deleted - ID: {}, Username: {}", id, user.getUsername());
    }
    
    // ===== NEW STATUS MANAGEMENT METHODS =====
    
    /**
     * Suspend user (temporary suspension - can be reactivated)
     */
    @Transactional
    public User suspendUser(Long id, String reason, String adminUsername) {
        log.info("Suspending user - ID: {}, Reason: {}, Admin: {}", id, reason, adminUsername);
        
        User user = getUserById(id);
        
        // Prevent admin from suspending themselves
        if (user.getRole() == User.Role.SYSTEM_ADMINISTRATOR) {
            throw new RuntimeException("Cannot suspend system administrator account");
        }
        
        // Get old status before change
        UserStatus oldStatus = user.getUserStatus();
        
        // Set status to suspended
        user.setStatus(UserStatus.SUSPENDED, reason, adminUsername);
        
        User updatedUser = userRepository.save(user);
        log.info("User suspended - ID: {}, Username: {}, Status: {}", 
                id, updatedUser.getUsername(), updatedUser.getUserStatus());
        
        // Fire event for status change
        eventPublisher.publishEvent(new UserStatusChangedEvent(this, id, oldStatus, UserStatus.SUSPENDED, adminUsername));
        
        return updatedUser;
    }
    
    /**
     * Disable user (permanent deactivation - cannot be reactivated)
     */
    @Transactional
    public User disableUser(Long id, String reason, String adminUsername) {
        log.info("Disabling user - ID: {}, Reason: {}, Admin: {}", id, reason, adminUsername);
        
        User user = getUserById(id);
        
        // Prevent admin from disabling themselves
        if (user.getRole() == User.Role.SYSTEM_ADMINISTRATOR) {
            throw new RuntimeException("Cannot disable system administrator account");
        }
        
        // Get old status before change
        UserStatus oldStatus = user.getUserStatus();
        
        // Set status to disabled
        user.setStatus(UserStatus.DISABLED, reason, adminUsername);
        
        User updatedUser = userRepository.save(user);
        log.info("User disabled - ID: {}, Username: {}, Status: {}", 
                id, updatedUser.getUsername(), updatedUser.getUserStatus());
        
        // Fire event for status change
        eventPublisher.publishEvent(new UserStatusChangedEvent(this, id, oldStatus, UserStatus.DISABLED, adminUsername));
        
        return updatedUser;
    }
    
    /**
     * Soft delete user (mark as deleted but preserve data)
     */
    @Transactional
    public User softDeleteUser(Long id, String reason, String adminUsername) {
        log.info("Soft deleting user - ID: {}, Reason: {}, Admin: {}", id, reason, adminUsername);
        
        User user = getUserById(id);
        
        // Prevent admin from deleting themselves
        if (user.getRole() == User.Role.SYSTEM_ADMINISTRATOR) {
            throw new RuntimeException("Cannot delete system administrator account");
        }
        
        // Get old status before change
        UserStatus oldStatus = user.getUserStatus();
        
        // Set status to deleted (soft delete)
        user.setStatus(UserStatus.DELETED, reason, adminUsername);
        
        User updatedUser = userRepository.save(user);
        log.info("User soft deleted - ID: {}, Username: {}, Status: {}", 
                id, updatedUser.getUsername(), updatedUser.getUserStatus());
        
        // Fire event for status change
        eventPublisher.publishEvent(new UserStatusChangedEvent(this, id, oldStatus, UserStatus.DELETED, adminUsername));
        
        return updatedUser;
    }
    
    /**
     * Reactivate suspended user
     */
    @Transactional
    public User reactivateUser(Long id, String adminUsername) {
        log.info("Reactivating user - ID: {}, Admin: {}", id, adminUsername);
        
        User user = getUserById(id);
        
        if (!user.canBeReactivated()) {
            throw new RuntimeException("User cannot be reactivated. Current status: " + user.getUserStatus());
        }
        
        // Get old status before change
        UserStatus oldStatus = user.getUserStatus();
        
        // Set status back to active
        user.setStatus(UserStatus.ACTIVE, "Account reactivated", adminUsername);
        
        User updatedUser = userRepository.save(user);
        log.info("User reactivated - ID: {}, Username: {}, Status: {}", 
                id, updatedUser.getUsername(), updatedUser.getUserStatus());
        
        // Fire event for status change
        eventPublisher.publishEvent(new UserStatusChangedEvent(this, id, oldStatus, UserStatus.ACTIVE, adminUsername));
        
        return updatedUser;
    }
    
    /**
     * Restore soft-deleted user
     */
    @Transactional
    public User restoreUser(Long id, String adminUsername) {
        log.info("Restoring user - ID: {}, Admin: {}", id, adminUsername);
        
        User user = getUserById(id);
        
        if (!user.canBeRestored()) {
            throw new RuntimeException("User cannot be restored. Current status: " + user.getUserStatus());
        }
        
        // Get old status before change
        UserStatus oldStatus = user.getUserStatus();
        
        // Set status back to active
        user.setStatus(UserStatus.ACTIVE, "Account restored", adminUsername);
        
        User updatedUser = userRepository.save(user);
        log.info("User restored - ID: {}, Username: {}, Status: {}", 
                id, updatedUser.getUsername(), updatedUser.getUserStatus());
        
        // Fire event for status change
        eventPublisher.publishEvent(new UserStatusChangedEvent(this, id, oldStatus, UserStatus.ACTIVE, adminUsername));
        
        return updatedUser;
    }
    
    /**
     * Get users by status
     */
    @Transactional(readOnly = true)
    public List<User> getUsersByStatus(UserStatus status) {
        log.info("Getting users by status: {}", status);
        return userRepository.findByUserStatus(status);
    }
    
    /**
     * Get active users count (excluding deleted/disabled)
     */
    public Long getActiveUserCount() {
        return userRepository.countByUserStatus(UserStatus.ACTIVE);
    }
    
    /**
     * Get suspended users count
     */
    public Long getSuspendedUserCount() {
        return userRepository.countByUserStatus(UserStatus.SUSPENDED);
    }
    
    /**
     * Get disabled users count
     */
    public Long getDisabledUserCount() {
        return userRepository.countByUserStatus(UserStatus.DISABLED);
    }
} 