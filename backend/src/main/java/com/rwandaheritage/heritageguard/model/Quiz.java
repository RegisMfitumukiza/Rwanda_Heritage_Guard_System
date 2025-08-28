package com.rwandaheritage.heritageguard.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "quizzes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Quiz {
    
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Multilingual fields
    @Column(name = "title_en", nullable = false, length = 500)
    private String titleEn;
    
    @Column(name = "title_rw", length = 500)
    private String titleRw;
    
    @Column(name = "title_fr", length = 500)
    private String titleFr;
    
    @Column(name = "description_en", length = 1000)
    private String descriptionEn;
    
    @Column(name = "description_rw", length = 1000)
    private String descriptionRw;
    
    @Column(name = "description_fr", length = 1000)
    private String descriptionFr;
    
    @Column(name = "article_id", nullable = false)
    private Long articleId;
    
    @Column(name = "passing_score_percentage", nullable = false)
    @Builder.Default
    private Integer passingScorePercentage = 70;
    
    @Column(name = "time_limit_minutes")
    private Integer timeLimitMinutes;
    
    @Column(name = "max_attempts")
    private Integer maxAttempts;
    
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;
    
    @Column(name = "is_public", nullable = false)
    @Builder.Default
    private boolean isPublic = true;
    
    @Column(name = "tags", length = 500)
    private String tags; // Comma-separated tags like "heritage,history,culture"
    
    @Column(name = "difficulty_level", length = 50)
    private String difficultyLevel; // BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    
    @Column(name = "category", length = 100)
    private String category; // History, Culture, Archaeology, etc.
    
    // Audit fields
    private String createdBy;
    private LocalDateTime createdDate;
    private String updatedBy;
    private LocalDateTime updatedDate;
    
    // Manual getters and setters for boolean fields to ensure they are available
    public boolean isActive() {
        return isActive;
    }
    
    public void setIsActive(boolean isActive) {
        this.isActive = isActive;
    }
    
    public boolean isPublic() {
        return isPublic;
    }
    
    public void setIsPublic(boolean isPublic) {
        this.isPublic = isPublic;
    }
    
    public Integer getMaxAttempts() {
        return maxAttempts;
    }
    
    public void setMaxAttempts(Integer maxAttempts) {
        this.maxAttempts = maxAttempts;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Integer getPassingScorePercentage() {
        return passingScorePercentage;
    }
    
    public void setPassingScorePercentage(Integer passingScorePercentage) {
        this.passingScorePercentage = passingScorePercentage;
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