package com.rwandaheritage.heritageguard.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * User Activity Entity
 * 
 * Tracks user activities across the heritage management system
 * for monitoring, analytics, and audit purposes.
 */
@Entity
@Table(name = "user_activities")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "username", nullable = false, length = 100)
    private String username;

    @Column(name = "user_role", nullable = false, length = 50)
    private String userRole;

    @Column(name = "activity_type", nullable = false, length = 100)
    private String activityType;

    @Column(name = "action", nullable = false, length = 255)
    private String action;

    @Column(name = "target", length = 255)
    private String target;

    @Column(name = "target_type", length = 50)
    private String targetType;

    @Column(name = "target_id")
    private Long targetId;

    @Column(name = "session_id", length = 100)
    private String sessionId;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "priority", length = 20)
    @Builder.Default
    private String priority = "LOW";

    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_date", nullable = false, updatable = false)
    private LocalDateTime createdDate;

    @UpdateTimestamp
    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    // Activity Type Constants
    public static final String TYPE_USER_LOGIN = "USER_LOGIN";
    public static final String TYPE_USER_LOGOUT = "USER_LOGOUT";
    public static final String TYPE_SITE_VIEW = "SITE_VIEW";
    public static final String TYPE_SITE_CREATE = "SITE_CREATE";
    public static final String TYPE_SITE_UPDATE = "SITE_UPDATE";
    public static final String TYPE_DOCUMENT_VIEW = "DOCUMENT_VIEW";
    public static final String TYPE_DOCUMENT_UPLOAD = "DOCUMENT_UPLOAD";
    public static final String TYPE_DOCUMENT_DOWNLOAD = "DOCUMENT_DOWNLOAD";
    public static final String TYPE_DOCUMENT_DELETE = "DOCUMENT_DELETE";
    public static final String TYPE_MEDIA_UPLOAD = "MEDIA_UPLOAD";
    public static final String TYPE_SEARCH_QUERY = "SEARCH_QUERY";
    public static final String TYPE_PROFILE_UPDATE = "PROFILE_UPDATE";
    public static final String TYPE_STATUS_CHANGE = "STATUS_CHANGE";
    public static final String TYPE_COMMENT_POST = "COMMENT_POST";
    public static final String TYPE_ARTIFACT_VIEW = "ARTIFACT_VIEW";
    public static final String TYPE_ARTIFACT_AUTHENTICATE = "ARTIFACT_AUTHENTICATE";

    // Priority Constants
    public static final String PRIORITY_LOW = "LOW";
    public static final String PRIORITY_MEDIUM = "MEDIUM";
    public static final String PRIORITY_HIGH = "HIGH";
    public static final String PRIORITY_CRITICAL = "CRITICAL";
}
