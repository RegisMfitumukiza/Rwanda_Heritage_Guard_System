package com.rwandaheritage.heritageguard.repository;

import com.rwandaheritage.heritageguard.model.UserActivity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for UserActivity entity
 * 
 * Provides data access methods for user activity tracking,
 * analytics, and monitoring.
 */
@Repository
public interface UserActivityRepository extends JpaRepository<UserActivity, Long> {

    /**
     * Find activities by user ID
     */
    List<UserActivity> findByUserIdAndIsActiveTrueOrderByCreatedDateDesc(Long userId);

    /**
     * Find activities by username
     */
    List<UserActivity> findByUsernameAndIsActiveTrueOrderByCreatedDateDesc(String username);

    /**
     * Find activities by activity type
     */
    List<UserActivity> findByActivityTypeAndIsActiveTrueOrderByCreatedDateDesc(String activityType);

    /**
     * Find activities by user role
     */
    List<UserActivity> findByUserRoleAndIsActiveTrueOrderByCreatedDateDesc(String userRole);

    /**
     * Find activities by priority
     */
    List<UserActivity> findByPriorityAndIsActiveTrueOrderByCreatedDateDesc(String priority);

    /**
     * Find activities within a time range
     */
    @Query("SELECT ua FROM UserActivity ua WHERE ua.isActive = true AND ua.createdDate >= :startTime ORDER BY ua.createdDate DESC")
    List<UserActivity> findRecentActivities(@Param("startTime") LocalDateTime startTime);

    /**
     * Find activities within a time range with limit
     */
    @Query("SELECT ua FROM UserActivity ua WHERE ua.isActive = true AND ua.createdDate >= :startTime ORDER BY ua.createdDate DESC")
    Page<UserActivity> findRecentActivitiesPageable(@Param("startTime") LocalDateTime startTime, Pageable pageable);

    /**
     * Find activities by type and time range
     */
    @Query("SELECT ua FROM UserActivity ua WHERE ua.isActive = true AND ua.activityType = :type AND ua.createdDate >= :startTime ORDER BY ua.createdDate DESC")
    List<UserActivity> findByTypeAndTimeRange(@Param("type") String type, @Param("startTime") LocalDateTime startTime);

    /**
     * Find activities by role and time range
     */
    @Query("SELECT ua FROM UserActivity ua WHERE ua.isActive = true AND ua.userRole = :role AND ua.createdDate >= :startTime ORDER BY ua.createdDate DESC")
    List<UserActivity> findByRoleAndTimeRange(@Param("role") String role, @Param("startTime") LocalDateTime startTime);

    /**
     * Count activities by type within time range
     */
    @Query("SELECT COUNT(ua) FROM UserActivity ua WHERE ua.isActive = true AND ua.activityType = :type AND ua.createdDate >= :startTime")
    long countByTypeAndTimeRange(@Param("type") String type, @Param("startTime") LocalDateTime startTime);

    /**
     * Count activities by role within time range
     */
    @Query("SELECT COUNT(ua) FROM UserActivity ua WHERE ua.isActive = true AND ua.userRole = :role AND ua.createdDate >= :startTime")
    long countByRoleAndTimeRange(@Param("role") String role, @Param("startTime") LocalDateTime startTime);

    /**
     * Get activity statistics by type
     */
    @Query("SELECT ua.activityType as type, COUNT(ua) as count FROM UserActivity ua WHERE ua.isActive = true AND ua.createdDate >= :startTime GROUP BY ua.activityType ORDER BY count DESC")
    List<Object[]> getActivityTypeStats(@Param("startTime") LocalDateTime startTime);

    /**
     * Get activity statistics by role
     */
    @Query("SELECT ua.userRole as role, COUNT(ua) as count FROM UserActivity ua WHERE ua.isActive = true AND ua.createdDate >= :startTime GROUP BY ua.userRole ORDER BY count DESC")
    List<Object[]> getActivityRoleStats(@Param("startTime") LocalDateTime startTime);

    /**
     * Get activity statistics by priority
     */
    @Query("SELECT ua.priority as priority, COUNT(ua) as count FROM UserActivity ua WHERE ua.isActive = true AND ua.createdDate >= :startTime GROUP BY ua.priority ORDER BY count DESC")
    List<Object[]> getActivityPriorityStats(@Param("startTime") LocalDateTime startTime);

    /**
     * Find active sessions (recent login activities)
     */
    @Query("SELECT ua FROM UserActivity ua WHERE ua.isActive = true AND ua.activityType = 'USER_LOGIN' AND ua.createdDate >= :startTime ORDER BY ua.createdDate DESC")
    List<UserActivity> findActiveSessions(@Param("startTime") LocalDateTime startTime);

    /**
     * Find activities by target type and ID
     */
    List<UserActivity> findByTargetTypeAndTargetIdAndIsActiveTrueOrderByCreatedDateDesc(String targetType, Long targetId);

    /**
     * Find activities by session ID
     */
    List<UserActivity> findBySessionIdAndIsActiveTrueOrderByCreatedDateDesc(String sessionId);

    /**
     * Clean up old activities (for maintenance)
     */
    @Query("DELETE FROM UserActivity ua WHERE ua.createdDate < :cutoffDate")
    void deleteOldActivities(@Param("cutoffDate") LocalDateTime cutoffDate);
}
