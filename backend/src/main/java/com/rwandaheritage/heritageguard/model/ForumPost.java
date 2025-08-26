package com.rwandaheritage.heritageguard.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "forum_posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForumPost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    private ForumTopic topic;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(length = 10)
    private String language; // "en", "rw", "fr"

    // Simple parent/child structure for replies
    @Column(name = "parent_post_id")
    private Long parentPostId; // null for top-level posts, ID for replies

    @Column(nullable = false)
    @Builder.Default
    private boolean isActive = true;

    // Simple moderation
    @Column(nullable = false)
    @Builder.Default
    private boolean isFlagged = false;

    @Column(length = 100)
    private String flaggedBy;

    @Column(length = 500)
    private String flagReason;

    // Audit fields
    private String createdBy;
    private LocalDateTime createdDate;
    private String updatedBy;
    private LocalDateTime updatedDate;

    // Manual getter/setter methods for boolean fields (Lombok compatibility)
    public boolean getIsActive() { return isActive; }
    public void setIsActive(boolean isActive) { this.isActive = isActive; }
    
    public boolean getIsFlagged() { return isFlagged; }
    public void setIsFlagged(boolean isFlagged) { this.isFlagged = isFlagged; }

    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
        updatedDate = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = LocalDateTime.now();
    }
} 