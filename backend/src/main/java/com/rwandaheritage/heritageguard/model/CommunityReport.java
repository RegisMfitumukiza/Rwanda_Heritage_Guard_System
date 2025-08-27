package com.rwandaheritage.heritageguard.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "community_reports", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"reporter_id", "content_type", "content_id"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CommunityReport {
    
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", nullable = false, length = 10)
    private ContentType contentType; // TOPIC or POST
    
    @Column(name = "content_id", nullable = false)
    private Long contentId; // ID of the topic or post
    
    @Column(name = "reporter_id", nullable = false)
    private String reporterId; // Username of the person reporting
    
    @Enumerated(EnumType.STRING)
    @Column(name = "report_reason", nullable = false, length = 20)
    private ReportReason reportReason;
    
    @Column(name = "description", length = 500)
    private String description; // Optional additional details
    
    @Column(name = "is_resolved", nullable = false)
    @Builder.Default
    private boolean isResolved = false;
    
    @Column(name = "resolved_by")
    private String resolvedBy; // Username of moderator who resolved
    
    @Column(name = "resolution_action", length = 50)
    private String resolutionAction; // FLAG, DELETE, IGNORE, etc.
    
    @Column(name = "resolution_notes", length = 500)
    private String resolutionNotes;
    
    @Column(name = "reported_at", nullable = false)
    private LocalDateTime reportedAt;
    
    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
    
    // Audit fields
    private String createdBy;
    private LocalDateTime createdDate;
    private String updatedBy;
    private LocalDateTime updatedDate;
    
    @PrePersist
    protected void onCreate() {
        reportedAt = LocalDateTime.now();
        createdDate = LocalDateTime.now();
        updatedDate = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedDate = LocalDateTime.now();
    }
    
    public enum ContentType {
        TOPIC, POST
    }
    
    public enum ReportReason {
        SPAM, INAPPROPRIATE, OFF_TOPIC, HARASSMENT, MISLEADING, OTHER
    }
} 