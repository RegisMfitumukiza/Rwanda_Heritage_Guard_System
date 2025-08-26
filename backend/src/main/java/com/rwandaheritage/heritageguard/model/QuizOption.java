package com.rwandaheritage.heritageguard.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_options")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuizOption {
    
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "question_id", nullable = false)
    private Long questionId;
    
    // Multilingual fields
    @Column(name = "option_text_en", columnDefinition = "TEXT", nullable = false)
    private String optionTextEn;
    
    @Column(name = "option_text_rw", columnDefinition = "TEXT")
    private String optionTextRw;
    
    @Column(name = "option_text_fr", columnDefinition = "TEXT")
    private String optionTextFr;
    
    @Column(name = "is_correct", nullable = false)
    @Builder.Default
    private boolean isCorrect = false;
    
    @Column(name = "option_order", nullable = false)
    private Integer optionOrder;
    
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
    
    public boolean isCorrect() {
        return isCorrect;
    }
    
    public void setIsCorrect(boolean isCorrect) {
        this.isCorrect = isCorrect;
    }
    
    public boolean isActive() {
        return isActive;
    }
    
    public void setIsActive(boolean isActive) {
        this.isActive = isActive;
    }
    
    public Long getQuestionId() {
        return questionId;
    }
    
    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }
    
    public String getOptionTextEn() {
        return optionTextEn;
    }
    
    public void setOptionTextEn(String optionTextEn) {
        this.optionTextEn = optionTextEn;
    }
    
    public String getOptionTextRw() {
        return optionTextRw;
    }
    
    public void setOptionTextRw(String optionTextRw) {
        this.optionTextRw = optionTextRw;
    }
    
    public String getOptionTextFr() {
        return optionTextFr;
    }
    
    public void setOptionTextFr(String optionTextFr) {
        this.optionTextFr = optionTextFr;
    }
    
    public Integer getOptionOrder() {
        return optionOrder;
    }
    
    public void setOptionOrder(Integer optionOrder) {
        this.optionOrder = optionOrder;
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
} 