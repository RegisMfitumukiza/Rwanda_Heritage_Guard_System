package com.rwandaheritage.heritageguard.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "forum_post_versions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ForumPostVersion {
    
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "post_id", nullable = false)
    private Long postId;
    
    @Column(name = "content", columnDefinition = "TEXT")
    private String content;
    
    @Column(name = "language", length = 10)
    private String language;
    
    @Column(name = "modified_by", nullable = false)
    private String modifiedBy;
    
    @Column(name = "modified_date", nullable = false)
    private LocalDateTime modifiedDate;
    
    @Column(name = "change_reason")
    private String changeReason;
    
    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;
    
    @PrePersist
    protected void onCreate() {
        modifiedDate = LocalDateTime.now();
    }
} 