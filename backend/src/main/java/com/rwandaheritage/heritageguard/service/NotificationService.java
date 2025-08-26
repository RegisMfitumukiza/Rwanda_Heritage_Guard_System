package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.dto.NotificationDTO;
import com.rwandaheritage.heritageguard.mapper.NotificationMapper;
import com.rwandaheritage.heritageguard.model.Notification;
import com.rwandaheritage.heritageguard.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    
    /**
     * Create a new notification
     */
    public NotificationDTO createNotification(String userId, String type, String content, String relatedUrl, String createdBy) {
        log.info("Creating notification for user: {}, type: {}", userId, type);
        
        Notification notification = Notification.builder()
                .userId(userId)
                .type(type)
                .content(content)
                .relatedUrl(relatedUrl)
                .isRead(false)
                .isActive(true)
                .createdBy(createdBy)
                .createdDate(LocalDateTime.now()) // Explicitly set creation date
                .updatedDate(LocalDateTime.now()) // Explicitly set update date
                .build();
        
        Notification savedNotification = notificationRepository.save(notification);
        log.info("Created notification with ID: {}", savedNotification.getId());
        
        return NotificationMapper.toDTO(savedNotification);
    }
    
    /**
     * Get all notifications for a user
     */
    @Transactional(readOnly = true)
    public List<NotificationDTO> getNotificationsByUser(String userId) {
        try {
            log.debug("Fetching notifications for user: {}", userId);
            
            if (userId == null || userId.trim().isEmpty()) {
                log.error("User ID is null or empty");
                throw new IllegalArgumentException("User ID cannot be null or empty");
            }
            
            List<Notification> notifications = notificationRepository.findByUserIdAndIsActiveTrueOrderByCreatedDateDesc(userId);
            
            log.debug("Found {} notifications for user: {}", notifications.size(), userId);
            return notifications.stream()
                    .map(NotificationMapper::toDTO)
                    .collect(Collectors.toList());
                    
        } catch (Exception e) {
            log.error("Error fetching notifications for user: {}", userId, e);
            throw new RuntimeException("Failed to fetch notifications", e);
        }
    }
    
    /**
     * Get unread notifications for a user
     */
    @Transactional(readOnly = true)
    public List<NotificationDTO> getUnreadNotificationsByUser(String userId) {
        log.debug("Fetching unread notifications for user: {}", userId);
        
        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadFalseAndIsActiveTrueOrderByCreatedDateDesc(userId);
        
        return notifications.stream()
                .map(NotificationMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Mark notification as read
     */
    public NotificationDTO markAsRead(Long id, String currentUser) {
        log.info("Marking notification as read: {}", id);
        
        Notification notification = notificationRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        
        if (!notification.getUserId().equals(currentUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        
        notification.setIsRead(true);
        notification.setUpdatedBy(currentUser);
        
        Notification updatedNotification = notificationRepository.save(notification);
        return NotificationMapper.toDTO(updatedNotification);
    }
    
    /**
     * Mark all notifications as read for a user
     */
    public void markAllAsRead(String userId) {
        log.info("Marking all notifications as read for user: {}", userId);
        notificationRepository.markAllAsReadForUser(userId);
    }
    
    /**
     * Get unread notification count for a user
     */
    @Transactional(readOnly = true)
    public long getUnreadNotificationCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalseAndIsActiveTrue(userId);
    }
    
    /**
     * Get recent notifications for a user (last 30 days)
     */
    @Transactional(readOnly = true)
    public List<NotificationDTO> getRecentNotificationsByUser(String userId) {
        log.debug("Fetching recent notifications for user: {}", userId);
        
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<Notification> notifications = notificationRepository.findRecentNotificationsByUserId(userId, thirtyDaysAgo);
        
        return notifications.stream()
                .map(NotificationMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Delete old read notifications (cleanup)
     */
    public void deleteOldReadNotifications() {
        log.info("Deleting old read notifications");
        LocalDateTime ninetyDaysAgo = LocalDateTime.now().minusDays(90);
        notificationRepository.deleteOldReadNotifications(ninetyDaysAgo);
    }
} 