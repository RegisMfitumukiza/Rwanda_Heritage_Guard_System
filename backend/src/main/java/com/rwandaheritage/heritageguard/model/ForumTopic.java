package com.rwandaheritage.heritageguard.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "forum_topics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForumTopic {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private ForumCategory category;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(length = 10)
    private String language; // "en", "rw", "fr"

    @Column(nullable = false)
    @Builder.Default
    private boolean isPublic = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean isPinned = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean isLocked = false;

    // Audit fields
    private String createdBy;
    private LocalDateTime createdDate;
    private String updatedBy;
    private LocalDateTime updatedDate;

    // Manual getter/setter methods for boolean fields (Lombok compatibility)
    public boolean getIsPublic() { return isPublic; }
    public void setIsPublic(boolean isPublic) { this.isPublic = isPublic; }
    
    public boolean getIsActive() { return isActive; }
    public void setIsActive(boolean isActive) { this.isActive = isActive; }
    
    public boolean getIsPinned() { return isPinned; }
    public void setIsPinned(boolean isPinned) { this.isPinned = isPinned; }
    
    public boolean getIsLocked() { return isLocked; }
    public void setIsLocked(boolean isLocked) { this.isLocked = isLocked; }

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