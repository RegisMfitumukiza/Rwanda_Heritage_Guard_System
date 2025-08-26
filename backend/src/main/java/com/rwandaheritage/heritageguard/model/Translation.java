package com.rwandaheritage.heritageguard.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "translations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Translation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", nullable = false, length = 50)
    private ContentType contentType;
    
    @Column(name = "content_id", nullable = false)
    private Long contentId;
    
    @Column(name = "language_code", nullable = false, length = 10)
    private String languageCode;
    
    @Column(name = "field_name", nullable = false, length = 100)
    private String fieldName;
    
    @Column(name = "translated_text", columnDefinition = "TEXT", nullable = false)
    private String translatedText;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private TranslationStatus status = TranslationStatus.PUBLISHED;
    
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
    
    public enum ContentType {
        HERITAGE_SITE, FORUM_TOPIC, FORUM_POST, FORUM_CATEGORY, 
        DOCUMENT, UI_ELEMENT, EDUCATIONAL_CONTENT, EDUCATIONAL_ARTICLE, 
        QUIZ, QUIZ_QUESTION, QUIZ_OPTION
    }
    
    public enum TranslationStatus {
        DRAFT,      // Initial draft state
        REVIEW,     // Under review
        APPROVED,   // Approved and ready for publishing
        PUBLISHED,  // Published and visible
        REJECTED    // Rejected and needs revision
    }
} 