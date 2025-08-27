package com.rwandaheritage.heritageguard.model;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "site_documents")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SiteDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;
    
    @Column(name = "file_type", nullable = false, length = 100)
    private String fileType;
    
    @Column(name = "file_path", nullable = false, length = 1000)
    private String filePath;
    
    @Column(name = "upload_date", length = 50)
    private String uploadDate;
    
    @Column(name = "description", length = 1000)
    private String description;
    
    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "language", length = 10)
    private String language;
    
    @Column(name = "is_public", nullable = false)
    @Builder.Default
    private boolean isPublic = true;
    
    @Column(name = "uploader_username", length = 100)
    private String uploaderUsername;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    // Analytics tracking fields
    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "view_count")
    @Builder.Default
    private Long viewCount = 0L;

    @Column(name = "download_count")
    @Builder.Default
    private Long downloadCount = 0L;

    @Column(name = "search_count")
    @Builder.Default
    private Long searchCount = 0L;

    @Column(name = "last_viewed_at")
    private LocalDateTime lastViewedAt;

    @Column(name = "last_downloaded_at")
    private LocalDateTime lastDownloadedAt;

    @Column(name = "last_searched_at")
    private LocalDateTime lastSearchedAt;

    // Audit fields
    @Column(name = "created_by", length = 100)
    private String createdBy;
    
    @Column(name = "created_date")
    private LocalDateTime createdDate;
    
    @Column(name = "updated_by", length = 100)
    private String updatedBy;
    
    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    @ManyToOne
    @JoinColumn(name = "heritage_site_id")
    private HeritageSite heritageSite;

    // Manual setters for boolean fields to ensure they are available
    public void setIsPublic(boolean isPublic) {
        this.isPublic = isPublic;
    }

    public void setIsActive(boolean isActive) {
        this.isActive = isActive;
    }

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