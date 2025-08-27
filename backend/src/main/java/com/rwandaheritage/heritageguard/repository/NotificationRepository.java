package com.rwandaheritage.heritageguard.repository;

import com.rwandaheritage.heritageguard.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Find all notifications for a user
    List<Notification> findByUserIdOrderByCreatedDateDesc(String userId);
    
    // Find active notifications for a user
    List<Notification> findByUserIdAndIsActiveTrueOrderByCreatedDateDesc(String userId);
    
    // Find unread notifications for a user
    List<Notification> findByUserIdAndIsReadFalseAndIsActiveTrueOrderByCreatedDateDesc(String userId);
    
    // Find read notifications for a user
    List<Notification> findByUserIdAndIsReadTrueAndIsActiveTrueOrderByCreatedDateDesc(String userId);
    
    // Find notifications by type for a user
    List<Notification> findByUserIdAndTypeAndIsActiveTrueOrderByCreatedDateDesc(String userId, String type);
    
    // Find unread notifications by type for a user
    List<Notification> findByUserIdAndTypeAndIsReadFalseAndIsActiveTrueOrderByCreatedDateDesc(String userId, String type);
    
    // Count unread notifications for a user
    long countByUserIdAndIsReadFalseAndIsActiveTrue(String userId);
    
    // Count notifications by type for a user
    long countByUserIdAndTypeAndIsActiveTrue(String userId, String type);
    
    // Count unread notifications by type for a user
    long countByUserIdAndTypeAndIsReadFalseAndIsActiveTrue(String userId, String type);
    
    // Find recent notifications (last 30 days)
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.createdDate >= :thirtyDaysAgo AND n.isActive = true ORDER BY n.createdDate DESC")
    List<Notification> findRecentNotificationsByUserId(@Param("userId") String userId, @Param("thirtyDaysAgo") java.time.LocalDateTime thirtyDaysAgo);
    
    // Find notifications created by specific user
    List<Notification> findByCreatedByAndIsActiveTrueOrderByCreatedDateDesc(String createdBy);
    
    // Find system notifications
    List<Notification> findByTypeAndIsActiveTrueOrderByCreatedDateDesc(String type);
    
    // Find notifications by content (case-insensitive search)
    @Query("SELECT n FROM Notification n WHERE LOWER(n.content) LIKE LOWER(CONCAT('%', :searchTerm, '%')) AND n.isActive = true ORDER BY n.createdDate DESC")
    List<Notification> searchByContentContainingIgnoreCase(@Param("searchTerm") String searchTerm);
    
    // Find notifications by content for specific user
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND LOWER(n.content) LIKE LOWER(CONCAT('%', :searchTerm, '%')) AND n.isActive = true ORDER BY n.createdDate DESC")
    List<Notification> searchByContentContainingIgnoreCaseForUser(@Param("userId") String userId, @Param("searchTerm") String searchTerm);
    
    // Delete old notifications (cleanup)
    @Query("DELETE FROM Notification n WHERE n.createdDate < :ninetyDaysAgo AND n.isRead = true")
    void deleteOldReadNotifications(@Param("ninetyDaysAgo") java.time.LocalDateTime ninetyDaysAgo);
    
    // Mark all notifications as read for a user
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.userId = :userId AND n.isRead = false")
    void markAllAsReadForUser(@Param("userId") String userId);
    
    // Mark notifications as read by type for a user
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.userId = :userId AND n.type = :type AND n.isRead = false")
    void markAsReadByTypeForUser(@Param("userId") String userId, @Param("type") String type);
} 