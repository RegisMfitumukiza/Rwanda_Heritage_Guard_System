package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.dto.NotificationDTO;
import com.rwandaheritage.heritageguard.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Create a test notification (for development/testing only)
     */
    @PostMapping("/test")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER')")
    public ResponseEntity<NotificationDTO> createTestNotification(Authentication authentication) {
        try {
            log.info("Creating test notification for user: {}", authentication.getName());
            
            String currentUser = authentication.getName();
            NotificationDTO notification = notificationService.createNotification(
                currentUser,
                "system",
                "This is a test notification to verify the system is working correctly.",
                "/dashboard",
                currentUser
            );
            
            return ResponseEntity.ok(notification);
            
        } catch (Exception e) {
            log.error("Error creating test notification: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get all notifications for current user
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER', 'COMMUNITY_MEMBER')")
    public ResponseEntity<List<NotificationDTO>> getNotifications(Authentication authentication) {
        try {
            log.debug("Fetching notifications for user: {}", authentication.getName());
            
            if (authentication == null || authentication.getName() == null) {
                log.error("Authentication is null or username is null");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            String currentUser = authentication.getName();
            List<NotificationDTO> notifications = notificationService.getNotificationsByUser(currentUser);
            
            log.debug("Found {} notifications for user: {}", notifications.size(), currentUser);
            return ResponseEntity.ok(notifications);
            
        } catch (Exception e) {
            log.error("Error fetching notifications for user: {}", authentication != null ? authentication.getName() : "unknown", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get unread notifications for current user
     */
    @GetMapping("/unread")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER', 'COMMUNITY_MEMBER')")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(Authentication authentication) {
        log.debug("Fetching unread notifications for user: {}", authentication.getName());
        
        String currentUser = authentication.getName();
        List<NotificationDTO> notifications = notificationService.getUnreadNotificationsByUser(currentUser);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Get unread notification count for current user
     */
    @GetMapping("/unread/count")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER', 'COMMUNITY_MEMBER')")
    public ResponseEntity<Long> getUnreadNotificationCount(Authentication authentication) {
        log.debug("Fetching unread notification count for user: {}", authentication.getName());
        
        String currentUser = authentication.getName();
        long count = notificationService.getUnreadNotificationCount(currentUser);
        return ResponseEntity.ok(count);
    }

    /**
     * Get recent notifications for current user (last 30 days)
     */
    @GetMapping("/recent")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER', 'COMMUNITY_MEMBER')")
    public ResponseEntity<List<NotificationDTO>> getRecentNotifications(Authentication authentication) {
        log.debug("Fetching recent notifications for user: {}", authentication.getName());
        
        String currentUser = authentication.getName();
        List<NotificationDTO> notifications = notificationService.getRecentNotificationsByUser(currentUser);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Mark notification as read
     */
    @PatchMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER', 'COMMUNITY_MEMBER')")
    public ResponseEntity<NotificationDTO> markAsRead(
            @PathVariable Long id,
            Authentication authentication) {
        log.info("Marking notification as read: {}", id);
        
        String currentUser = authentication.getName();
        NotificationDTO notification = notificationService.markAsRead(id, currentUser);
        return ResponseEntity.ok(notification);
    }

    /**
     * Mark all notifications as read for current user
     */
    @PatchMapping("/read-all")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER', 'COMMUNITY_MEMBER')")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        log.info("Marking all notifications as read for user: {}", authentication.getName());
        
        String currentUser = authentication.getName();
        notificationService.markAllAsRead(currentUser);
        return ResponseEntity.noContent().build();
    }
} 