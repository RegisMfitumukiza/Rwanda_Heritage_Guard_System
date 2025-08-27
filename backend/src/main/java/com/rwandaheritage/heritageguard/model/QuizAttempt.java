package com.rwandaheritage.heritageguard.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_attempts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuizAttempt {
    
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "quiz_id", nullable = false)
    private Long quizId;
    
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;
    
    @Column(name = "end_time")
    private LocalDateTime endTime;
    
    @Column(name = "total_score")
    private Integer totalScore;
    
    @Column(name = "max_possible_score")
    private Integer maxPossibleScore;
    
    @Column(name = "percentage_score")
    private Double percentageScore;
    
    @Column(name = "passed", nullable = false)
    @Builder.Default
    private boolean passed = false;
    
    @Column(name = "attempt_number", nullable = false)
    private Integer attemptNumber;
    
    @Column(name = "time_taken_minutes")
    private Integer timeTakenMinutes;
    
    @Column(name = "is_completed", nullable = false)
    @Builder.Default
    private boolean isCompleted = false;
    
    // Audit fields
    private String createdBy;
    private LocalDateTime createdDate;
    private String updatedBy;
    private LocalDateTime updatedDate;
    
    // Manual getters and setters for fields that might not be generated properly
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public Long getQuizId() {
        return quizId;
    }
    
    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }
    
    public boolean isCompleted() {
        return isCompleted;
    }
    
    public void setIsCompleted(boolean isCompleted) {
        this.isCompleted = isCompleted;
    }
    
    public boolean isPassed() {
        return passed;
    }
    
    public void setPassed(boolean passed) {
        this.passed = passed;
    }
    
    public LocalDateTime getStartTime() {
        return startTime;
    }
    
    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }
    
    public LocalDateTime getEndTime() {
        return endTime;
    }
    
    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }
    
    public Integer getTotalScore() {
        return totalScore;
    }
    
    public void setTotalScore(Integer totalScore) {
        this.totalScore = totalScore;
    }
    
    public Integer getMaxPossibleScore() {
        return maxPossibleScore;
    }
    
    public void setMaxPossibleScore(Integer maxPossibleScore) {
        this.maxPossibleScore = maxPossibleScore;
    }
    
    public Double getPercentageScore() {
        return percentageScore;
    }
    
    public void setPercentageScore(Double percentageScore) {
        this.percentageScore = percentageScore;
    }
    
    public Integer getTimeTakenMinutes() {
        return timeTakenMinutes;
    }
    
    public void setTimeTakenMinutes(Integer timeTakenMinutes) {
        this.timeTakenMinutes = timeTakenMinutes;
    }
    
    public String getUpdatedBy() {
        return updatedBy;
    }
    
    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }
    
    public LocalDateTime getUpdatedDate() {
        return updatedDate;
    }
    
    public void setUpdatedDate(LocalDateTime updatedDate) {
        this.updatedDate = updatedDate;
    }
    
    public Integer getAttemptNumber() {
        return attemptNumber;
    }
    
    public void setAttemptNumber(Integer attemptNumber) {
        this.attemptNumber = attemptNumber;
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
        if (startTime == null) {
            startTime = LocalDateTime.now();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedDate = LocalDateTime.now();
    }
}