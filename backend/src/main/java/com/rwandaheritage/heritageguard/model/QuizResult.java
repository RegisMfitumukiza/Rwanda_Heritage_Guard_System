package com.rwandaheritage.heritageguard.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_results")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuizResult {
    
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "attempt_id", nullable = false)
    private Long attemptId;
    
    @Column(name = "question_id", nullable = false)
    private Long questionId;
    
    @Column(name = "selected_option_id")
    private Long selectedOptionId;
    
    @Column(name = "is_correct", nullable = false)
    private boolean isCorrect;
    
    @Column(name = "points_earned", nullable = false)
    private Integer pointsEarned;
    
    @Column(name = "max_points", nullable = false)
    private Integer maxPoints;
    
    @Column(name = "time_taken_seconds")
    private Integer timeTakenSeconds;
    
    // Audit fields
    private String createdBy;
    private LocalDateTime createdDate;
    private String updatedBy;
    private LocalDateTime updatedDate;
    
    // Manual getters and setters for fields that might not be generated properly
    public Long getAttemptId() {
        return attemptId;
    }
    
    public void setAttemptId(Long attemptId) {
        this.attemptId = attemptId;
    }
    
    public Long getQuestionId() {
        return questionId;
    }
    
    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }
    
    public Long getSelectedOptionId() {
        return selectedOptionId;
    }
    
    public void setSelectedOptionId(Long selectedOptionId) {
        this.selectedOptionId = selectedOptionId;
    }
    
    public boolean isCorrect() {
        return isCorrect;
    }
    
    public void setCorrect(boolean isCorrect) {
        this.isCorrect = isCorrect;
    }
    
    public Integer getPointsEarned() {
        return pointsEarned;
    }
    
    public void setPointsEarned(Integer pointsEarned) {
        this.pointsEarned = pointsEarned;
    }
    
    public Integer getMaxPoints() {
        return maxPoints;
    }
    
    public void setMaxPoints(Integer maxPoints) {
        this.maxPoints = maxPoints;
    }
    
    public String getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
    
    public LocalDateTime getCreatedDate() {
        return createdDate;
    }
    
    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
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
