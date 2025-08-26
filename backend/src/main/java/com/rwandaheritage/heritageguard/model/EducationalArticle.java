package com.rwandaheritage.heritageguard.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "educational_articles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EducationalArticle {
    
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Multilingual fields (hardcoded approach)
    @Column(name = "title_en", nullable = false, length = 500)
    private String titleEn;
    
    @Column(name = "title_rw", length = 500)
    private String titleRw;
    
    @Column(name = "title_fr", length = 500)
    private String titleFr;
    
    @Column(name = "content_en", columnDefinition = "TEXT", nullable = false)
    private String contentEn;
    
    @Column(name = "content_rw", columnDefinition = "TEXT")
    private String contentRw;
    
    @Column(name = "content_fr", columnDefinition = "TEXT")
    private String contentFr;
    
    @Column(name = "summary_en", length = 1000)
    private String summaryEn;
    
    @Column(name = "summary_rw", length = 1000)
    private String summaryRw;
    
    @Column(name = "summary_fr", length = 1000)
    private String summaryFr;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 50)
    private ArticleCategory category;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty_level", nullable = true, length = 20)
    private DifficultyLevel difficultyLevel;
    
    @Column(name = "estimated_read_time_minutes")
    private Integer estimatedReadTimeMinutes;

    @ElementCollection
    @CollectionTable(name = "educational_article_tags", joinColumns = @JoinColumn(name = "article_id"))
    @Column(name = "tag", length = 50)
    private List<String> tags;
    
    @Column(name = "is_public", nullable = false)
    @Builder.Default
    private boolean isPublic = true;
    
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;
    
    @Column(name = "published_date")
    private LocalDateTime publishedDate;
    
    // New fields for enhanced content
    @Column(name = "featured_image", length = 500)
    private String featuredImage; // URL to featured image
    
    @Column(name = "youtube_video_url", length = 500)
    private String youtubeVideoUrl; // Optional YouTube video link
    
    @Column(name = "related_artifact_id")
    private Long relatedArtifactId; // Link to related artifact
    
    @Column(name = "related_heritage_site_id")
    private Long relatedHeritageSiteId; // Link to related heritage site
    
    @Column(name = "quiz_id")
    private Long quizId; // Link to related quiz
    
    // Audit fields
    private String createdBy;
    private LocalDateTime createdDate;
    private String updatedBy;
    private LocalDateTime updatedDate;
    
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
        if (publishedDate == null) {
            publishedDate = LocalDateTime.now();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedDate = LocalDateTime.now();
    }
    
    public enum ArticleCategory {
        HERITAGE_SITES, TRADITIONAL_CRAFTS, CULTURAL_PRACTICES, 
        HISTORICAL_EVENTS, ROYAL_HISTORY, TRADITIONAL_MUSIC,
        ARCHITECTURE, CUSTOMS_TRADITIONS, GENERAL_EDUCATION
    }
    
    public enum DifficultyLevel {
        BEGINNER, INTERMEDIATE, ADVANCED
    }
} 