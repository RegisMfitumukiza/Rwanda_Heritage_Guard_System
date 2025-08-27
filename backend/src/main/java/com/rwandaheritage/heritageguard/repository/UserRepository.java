package com.rwandaheritage.heritageguard.repository;

import com.rwandaheritage.heritageguard.model.User;
import com.rwandaheritage.heritageguard.model.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * Find user by username
     */
    Optional<User> findByUsername(String username);
    
    /**
     * Find user by email
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Check if username exists (including deleted users)
     */
    boolean existsByUsername(String username);
    
    /**
     * Check if email exists (including deleted users)
     */
    boolean existsByEmail(String email);
    
    /**
     * Find active users by role
     */
    List<User> findByRoleAndIsEnabledTrue(User.Role role);
    
    /**
     * Find enabled and active users
     */
    List<User> findByIsEnabledTrue();
    
    /**
     * Find users by multiple roles
     */
    @Query("SELECT u FROM User u WHERE u.role IN :roles AND u.isEnabled = true")
    List<User> findByRolesAndIsEnabledTrue(@Param("roles") List<User.Role> roles);
    
    /**
     * Find users created by a specific user
     */
    List<User> findByCreatedByAndIsEnabledTrue(String createdBy);
    
    /**
     * Find users created after a specific date
     */
    List<User> findByCreatedDateAfterAndIsEnabledTrue(LocalDateTime date);
    
    /**
     * Find users who haven't logged in for a while
     */
    @Query("SELECT u FROM User u WHERE u.lastLogin < :date OR u.lastLogin IS NULL")
    List<User> findInactiveUsers(@Param("date") LocalDateTime date);
    
    /**
     * Count users by role
     */
    long countByRoleAndIsEnabledTrue(User.Role role);
    
    /**
     * Count total active users
     */
    long countByIsEnabledTrue();
    
    /**
     * Find users by partial username match
     */
    @Query("SELECT u FROM User u WHERE u.username LIKE %:username% AND u.isEnabled = true")
    List<User> findByUsernameContainingIgnoreCase(@Param("username") String username);
    
    /**
     * Find users by partial email match
     */
    @Query("SELECT u FROM User u WHERE u.email LIKE %:email% AND u.isEnabled = true")
    List<User> findByEmailContainingIgnoreCase(@Param("email") String email);
    
    /**
     * Find users by partial name match (first name or last name)
     */
    @Query("SELECT u FROM User u WHERE (u.firstName LIKE %:name% OR u.lastName LIKE %:name%) AND u.isEnabled = true")
    List<User> findByNameContainingIgnoreCase(@Param("name") String name);
    
    /**
     * Find locked accounts
     */
    List<User> findByIsAccountNonLockedFalseAndIsEnabledTrue();
    
    /**
     * Find disabled accounts
     */
    List<User> findByIsEnabledFalse();
    
    /**
     * Find users with expired credentials
     */
    List<User> findByIsCredentialsNonExpiredFalseAndIsEnabledTrue();
    
    /**
     * Find users with expired accounts
     */
    List<User> findByIsAccountNonExpiredFalseAndIsEnabledTrue();
    
    /**
     * Find user by email verification token
     */
    Optional<User> findByEmailVerificationToken(String token);
    
    /**
     * Find user by reset token
     */
    Optional<User> findByResetToken(String token);
    
    /**
     * Find user by unlock token
     */
    Optional<User> findByUnlockToken(String token);

    // Statistics methods
    long countByCreatedDateAfter(LocalDateTime cutoffDate);
    
    long countByEmailVerifiedTrue();
    
    /**
     * Check if user exists by role (for admin validation)
     */
    boolean existsByRole(User.Role role);
    
    /**
     * Check if user exists by email and role (for manager validation)
     */
    boolean existsByEmailAndRole(String email, User.Role role);
    
    /**
     * Find users by role for management purposes
     */
    List<User> findByRole(User.Role role);
    
    /**
     * Count users by role for statistics
     */
    long countByRole(User.Role role);

    // Analytics methods for real data tracking
    @Query("SELECT COUNT(u) FROM User u WHERE u.isEnabled = true AND u.lastLogin > :cutoffTime")
    int getCurrentActiveUsers(@Param("cutoffTime") java.time.LocalDateTime cutoffTime);

    @Query("SELECT COUNT(u) FROM User u WHERE u.isEnabled = true AND DATE(u.createdDate) = :date")
    long getUserCountByDate(@Param("date") java.time.LocalDate date);

    // Default method for current active users (last 30 minutes)
    default int getCurrentActiveUsers() {
        return getCurrentActiveUsers(java.time.LocalDateTime.now().minusMinutes(30));
    }
    
    // ===== NEW STATUS MANAGEMENT METHODS =====
    
    /**
     * Find users by status
     */
    List<User> findByUserStatus(UserStatus status);
    
    /**
     * Count users by status
     */
    long countByUserStatus(UserStatus status);
    
    /**
     * Find users by status and role
     */
    List<User> findByUserStatusAndRole(UserStatus status, User.Role role);
    
    /**
     * Find active users (excluding deleted/disabled)
     */
    @Query("SELECT u FROM User u WHERE u.userStatus = 'ACTIVE'")
    List<User> findActiveUsers();
    
    /**
     * Find suspended users
     */
    @Query("SELECT u FROM User u WHERE u.userStatus = 'SUSPENDED'")
    List<User> findSuspendedUsers();
    
    /**
     * Find disabled users
     */
    @Query("SELECT u FROM User u WHERE u.userStatus = 'DISABLED'")
    List<User> findDisabledUsers();
    
    /**
     * Find soft-deleted users
     */
    @Query("SELECT u FROM User u WHERE u.userStatus = 'DELETED'")
    List<User> findDeletedUsers();
    
    /**
     * Search users by name, email, or role (comprehensive search)
     */
    @Query("SELECT u FROM User u WHERE " +
           "(u.firstName LIKE %:search% OR u.lastName LIKE %:search% OR " +
           "u.email LIKE %:search% OR LOWER(u.role) LIKE LOWER(:search)) " +
           "ORDER BY u.createdDate DESC")
    List<User> findBySearchCriteria(@Param("search") String search);
    
    /**
     * Search users by multiple search terms (for "Manager2 Heritage" type searches)
     * Uses AND logic - user must match BOTH terms
     */
    @Query("SELECT u FROM User u WHERE " +
           "((u.firstName LIKE %:term1% OR u.lastName LIKE %:term1% OR " +
           "u.email LIKE %:term1% OR LOWER(u.role) LIKE LOWER(:term1)) " +
           "AND (u.firstName LIKE %:term2% OR u.lastName LIKE %:term2% OR " +
           "u.email LIKE %:term2% OR LOWER(u.role) LIKE LOWER(:term2))) " +
           "ORDER BY u.createdDate DESC")
    List<User> findByMultipleSearchTerms(@Param("term1") String term1, @Param("term2") String term2);
    
    /**
     * Check if user exists with same first and last name (case-insensitive)
     * Includes ALL users regardless of status (including deleted ones)
     */
    @Query("SELECT COUNT(u) > 0 FROM User u WHERE " +
           "LOWER(u.firstName) = LOWER(:firstName) AND " +
           "LOWER(u.lastName) = LOWER(:lastName)")
    boolean existsByFullName(@Param("firstName") String firstName, @Param("lastName") String lastName);
    
    /**
     * Check if user exists with same first and last name, excluding a specific user ID
     * Includes ALL users regardless of status (including deleted ones)
     */
    @Query("SELECT COUNT(u) > 0 FROM User u WHERE " +
           "LOWER(u.firstName) = LOWER(:firstName) AND " +
           "LOWER(u.lastName) = LOWER(:lastName) AND " +
           "u.id != :excludeUserId")
    boolean existsByFullNameExcludingUser(@Param("firstName") String firstName, @Param("lastName") String lastName, @Param("excludeUserId") Long excludeUserId);
    
    /**
     * Find users by first and last name (for security checks)
     */
    List<User> findByFirstNameAndLastName(String firstName, String lastName);
    
    /**
     * Find available heritage managers (HERITAGE_MANAGER users not currently managing sites)
     */
    @Query("SELECT u FROM User u WHERE u.role = 'HERITAGE_MANAGER' AND u.userStatus = 'ACTIVE' AND " +
           "u.id NOT IN (SELECT hsm.user.id FROM HeritageSiteManager hsm WHERE hsm.status = 'ACTIVE')")
    List<User> findAvailableHeritageManagers();
}