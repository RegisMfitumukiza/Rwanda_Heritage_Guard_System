package com.rwandaheritage.heritageguard.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ElementCollection
    @CollectionTable(name = "document_title", joinColumns = @JoinColumn(name = "document_id"))
    @MapKeyColumn(name = "lang")
    @Column(name = "title", nullable = false)
    private Map<String, String> title;

    @ElementCollection
    @CollectionTable(name = "document_description", joinColumns = @JoinColumn(name = "document_id"))
    @MapKeyColumn(name = "lang")
    @Column(name = "description", columnDefinition = "TEXT")
    private Map<String, String> description;

    @Column(name = "author", length = 100)
    private String author;

    @Column(name = "creation_date", nullable = false)
    private LocalDateTime creationDate;

    @Column(name = "type", nullable = false, length = 20)
    private String type;

    @ElementCollection
    @CollectionTable(name = "document_tags", joinColumns = @JoinColumn(name = "document_id"))
    @Column(name = "tag", length = 50)
    private List<String> tags;

    @Column(name = "language", nullable = false, length = 10)
    private String language;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "folder_id")
    private Folder folder;

    @Column(name = "is_public", nullable = false)
    @Builder.Default
    private Boolean isPublic = false;

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DocumentVersion> versions;

    // Audit fields
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    // Manual setter for boolean field
    public void setIsActive(boolean isActive) {
        this.isActive = isActive;
    }

    @PrePersist
    protected void onCreate() {
        if (createdDate == null) {
            createdDate = LocalDateTime.now();
        }
        if (updatedDate == null) {
            updatedDate = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = LocalDateTime.now();
    }
} 