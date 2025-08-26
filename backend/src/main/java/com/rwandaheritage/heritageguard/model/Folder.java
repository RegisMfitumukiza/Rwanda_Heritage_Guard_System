package com.rwandaheritage.heritageguard.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "folders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Folder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Folder parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Folder> children;

    @OneToMany(mappedBy = "folder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Document> documents;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "folder_allowed_roles", joinColumns = @JoinColumn(name = "folder_id"))
    @Column(name = "role", length = 50)
    @Builder.Default
    private List<String> allowedRoles = new ArrayList<>();

    // New descriptive fields and relationships
    @Column(name = "type", length = 100)
    private String type;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;



    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id")
    private HeritageSite site;

    // Audit fields
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_date", nullable = false)
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