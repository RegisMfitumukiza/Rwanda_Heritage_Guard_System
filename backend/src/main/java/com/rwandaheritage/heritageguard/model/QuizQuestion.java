package com.rwandaheritage.heritageguard.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_questions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuizQuestion {
    
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "quiz_id", nullable = false)
    private Long quizId;
    
    // Multilingual fields
    @Column(name = "question_text_en", columnDefinition = "TEXT", nullable = false)
    private String questionTextEn;
    
    @Column(name = "question_text_rw", columnDefinition = "TEXT")
    private String questionTextRw;
    
    @Column(name = "question_text_fr", columnDefinition = "TEXT")
    private String questionTextFr;
    
    @Column(name = "explanation_en", columnDefinition = "TEXT")
    private String explanationEn;
    
    @Column(name = "explanation_rw", columnDefinition = "TEXT")
    private String explanationRw;
    
    @Column(name = "explanation_fr", columnDefinition = "TEXT")
    private String explanationFr;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false, length = 20)
    private QuestionType questionType;
    
    @Column(name = "points", nullable = false)
    @Builder.Default
    private Integer points = 1;
    
    @Column(name = "question_order", nullable = false)
    private Integer questionOrder;
    
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;
    
    // Audit fields
    private String createdBy;
    private LocalDateTime createdDate;
    private String updatedBy;
    private LocalDateTime updatedDate;
    
    // Manual getters and setters for fields that might not be generated properly
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Integer getPoints() {
        return points;
    }
    
    public void setPoints(Integer points) {
        this.points = points;
    }
    
    public boolean isActive() {
        return isActive;
    }
    
    public void setIsActive(boolean isActive) {
        this.isActive = isActive;
    }
    
    public Long getQuizId() {
        return quizId;
    }
    
    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }
    
    public String getQuestionTextEn() {
        return questionTextEn;
    }
    
    public void setQuestionTextEn(String questionTextEn) {
        this.questionTextEn = questionTextEn;
    }
    
    public String getQuestionTextRw() {
        return questionTextRw;
    }
    
    public void setQuestionTextRw(String questionTextRw) {
        this.questionTextRw = questionTextRw;
    }
    
    public String getQuestionTextFr() {
        return questionTextFr;
    }
    
    public void setQuestionTextFr(String questionTextFr) {
        this.questionTextFr = questionTextFr;
    }
    
    public String getExplanationEn() {
        return explanationEn;
    }
    
    public void setExplanationEn(String explanationEn) {
        this.explanationEn = explanationEn;
    }
    
    public String getExplanationRw() {
        return explanationRw;
    }
    
    public void setExplanationRw(String explanationRw) {
        this.explanationRw = explanationRw;
    }
    
    public String getExplanationFr() {
        return explanationFr;
    }
    
    public void setExplanationFr(String explanationFr) {
        this.explanationFr = explanationFr;
    }
    
    public QuestionType getQuestionType() {
        return questionType;
    }
    
    public void setQuestionType(QuestionType questionType) {
        this.questionType = questionType;
    }
    
    public Integer getQuestionOrder() {
        return questionOrder;
    }
    
    public void setQuestionOrder(Integer questionOrder) {
        this.questionOrder = questionOrder;
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
    
    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
        updatedDate = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedDate = LocalDateTime.now();
    }
    
    public enum QuestionType {
        MULTIPLE_CHOICE, TRUE_FALSE
    }
} 