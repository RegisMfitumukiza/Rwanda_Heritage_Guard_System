package com.rwandaheritage.heritageguard.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "translation_memory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TranslationMemory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "source_text", columnDefinition = "TEXT", nullable = false)
    private String sourceText;
    
    @Column(name = "target_text", columnDefinition = "TEXT", nullable = false)
    private String targetText;
    
    @Column(name = "source_language", nullable = false, length = 10)
    private String sourceLanguage;
    
    @Column(name = "target_language", nullable = false, length = 10)
    private String targetLanguage;
    
    @Column(length = 200)
    private String context;
    
    @Column(name = "usage_count")
    @Builder.Default
    private int usageCount = 1;
    
    // Audit fields
    private String createdBy;
    private LocalDateTime createdDate;
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