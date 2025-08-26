package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.service.UserService;
import com.rwandaheritage.heritageguard.service.UserActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * User Activity Controller
 * 
 * Provides real-time user activity monitoring and session management endpoints.
 * Tracks user behavior, session data, and platform usage patterns for:
 * - Live activity feeds
 * - Active session monitoring
 * - User behavior analytics
 * - Activity statistics and trends
 * 
 * Access restricted to Heritage Managers and System Administrators.
 */
@RestController
@RequestMapping("/api/user-activity")
@PreAuthorize("hasRole('HERITAGE_MANAGER') or hasRole('SYSTEM_ADMINISTRATOR')")
public class UserActivityController {

    private static final Logger log = LoggerFactory.getLogger(UserActivityController.class);

    private final UserService userService;
    private final UserActivityService userActivityService;

    @Autowired
    public UserActivityController(UserService userService, UserActivityService userActivityService) {
        this.userService = userService;
        this.userActivityService = userActivityService;
    }

    /**
     * Get recent activity feed
     * Returns recent user activities across the platform
     * 
     * @param limit Maximum number of activities to return
     * @param type Filter by activity type (optional)
     * @param role Filter by user role (optional)
     * @param timeRange Time range in minutes (default: 30)
     * @return List of recent user activities
     */
    @GetMapping("/feed")
    public ResponseEntity<List<Map<String, Object>>> getActivityFeed(
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "30") int timeRange) {
        
        try {
            List<Map<String, Object>> activities = userActivityService.getRecentActivityFeed(limit, type, role, timeRange);
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            log.error("Failed to get recent activity feed", e);
            return ResponseEntity.internalServerError().body(List.of());
        }
    }

    /**
     * Get active user sessions
     * Returns currently active user sessions with details
     * 
     * @return List of active user sessions
     */
    @GetMapping("/sessions")
    public ResponseEntity<List<Map<String, Object>>> getActiveSessions() {
        try {
            List<Map<String, Object>> sessions = userActivityService.getActiveSessions();
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            log.error("Failed to get active sessions", e);
            return ResponseEntity.internalServerError().body(List.of());
        }
    }

    /**
     * Get activity statistics
     * Returns comprehensive activity metrics and trends
     * 
     * @param days Number of days for statistics (default: 30)
     * @return Activity statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getActivityStatistics(
            @RequestParam(defaultValue = "30") int days) {
        
        try {
            Map<String, Object> stats = userActivityService.getActivityStatistics(days);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Failed to get activity statistics", e);
            return ResponseEntity.internalServerError().body(Map.of());
        }
    }

    /**
     * Get user behavior analytics
     * Returns detailed user behavior patterns and insights
     * 
     * @param timeframe Timeframe for analysis (day, week, month)
     * @return User behavior analytics
     */
    @GetMapping("/behavior")
    public ResponseEntity<Map<String, Object>> getUserBehaviorAnalytics(
            @RequestParam(defaultValue = "week") String timeframe) {
        
        try {
            Map<String, Object> behavior = userActivityService.getUserBehaviorAnalytics(timeframe);
            return ResponseEntity.ok(behavior);
        } catch (Exception e) {
            log.error("Failed to get user behavior analytics", e);
            return ResponseEntity.internalServerError().body(Map.of());
        }
    }

    /**
     * Get user activity logs
     * Returns detailed activity logs for audit purposes
     * 
     * @param userId User ID filter (optional)
     * @param startDate Start date for logs (optional)
     * @param endDate End date for logs (optional)
     * @param limit Maximum number of logs (default: 100)
     * @return Activity logs
     */
    @GetMapping("/logs")
    public ResponseEntity<List<Map<String, Object>>> getActivityLogs(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "100") int limit) {
        
        try {
            List<Map<String, Object>> logs = userActivityService.getActivityLogs(userId, startDate, endDate, limit);
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            log.error("Failed to get activity logs", e);
            return ResponseEntity.internalServerError().body(List.of());
        }
    }

    /**
     * Get latest activity updates
     * Returns the latest activity updates for monitoring
     * 
     * @param since Timestamp to get updates since
     * @return Latest activity updates
     */
    @GetMapping("/latest")
    public ResponseEntity<Map<String, Object>> getLatestUpdates(
            @RequestParam(required = false) String since) {
        
        try {
            Map<String, Object> latest = userActivityService.getLatestUpdates(since);
            return ResponseEntity.ok(latest);
        } catch (Exception e) {
            log.error("Failed to get latest updates", e);
            return ResponseEntity.internalServerError().body(Map.of());
        }
    }

    // Private helper methods for real data processing

    private Map<String, Object> generateActivityStatistics(int days) {
        Map<String, Object> stats = new HashMap<>();
        
        // Real implementation - get statistics from service
        return userActivityService.getActivityStatistics(days);
    }

    private Map<String, Object> generateUserBehaviorAnalytics(String timeframe) {
        // Real implementation - get behavior analytics from service
        return userActivityService.getUserBehaviorAnalytics(timeframe);
    }

    private List<Map<String, Object>> generateActivityLogs(String userId, String startDate, String endDate, int limit) {
        // Real implementation - get activity logs from service
        return userActivityService.getActivityLogs(userId, startDate, endDate, limit);
    }

    private Map<String, Object> generateLatestUpdates(String since) {
        // Real implementation - get latest updates from service
        return userActivityService.getLatestUpdates(since);
    }



    /**
     * Get heritage manager activity feed
     * Returns activity feed specific to heritage managers
     * 
     * @param userId User ID filter (optional)
     * @param limit Maximum number of activities to return
     * @return List of heritage manager activities
     */
    @GetMapping("/activity/heritage-manager")
    @PreAuthorize("hasRole('HERITAGE_MANAGER')")
    public ResponseEntity<List<Map<String, Object>>> getHeritageManagerActivity(
            @RequestParam(required = false) String userId,
            @RequestParam(defaultValue = "10") int limit) {
        
        try {
            log.info("Getting activity feed for heritage manager: {}, limit: {}", userId, limit);
            
            // For now, return placeholder data until the service is fully implemented
            List<Map<String, Object>> activities = new ArrayList<>();
            
            // Placeholder activities - these would come from a real activity service
            Map<String, Object> activity1 = new HashMap<>();
            activity1.put("id", "act-001");
            activity1.put("action", "Site updated");
            activity1.put("description", "Updated site information for Heritage Site A");
            activity1.put("timestamp", LocalDateTime.now().minusHours(2).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            activity1.put("type", "SITE_UPDATE");
            activities.add(activity1);
            
            Map<String, Object> activity2 = new HashMap<>();
            activity2.put("id", "act-002");
            activity2.put("action", "Document uploaded");
            activity2.put("description", "Uploaded new site documentation");
            activity2.put("timestamp", LocalDateTime.now().minusHours(4).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            activity2.put("type", "DOCUMENT_UPLOAD");
            activities.add(activity2);
            
            Map<String, Object> activity3 = new HashMap<>();
            activity3.put("id", "act-003");
            activity3.put("action", "Media added");
            activity3.put("description", "Added new photos to site gallery");
            activity3.put("timestamp", LocalDateTime.now().minusHours(6).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            activity3.put("type", "MEDIA_ADD");
            activities.add(activity3);
            
            return ResponseEntity.ok(activities);
            
        } catch (Exception e) {
            log.error("Failed to get heritage manager activity", e);
            return ResponseEntity.internalServerError().body(List.of());
        }
    }
}
