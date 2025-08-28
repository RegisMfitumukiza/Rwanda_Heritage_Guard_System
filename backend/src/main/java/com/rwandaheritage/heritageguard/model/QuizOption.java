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