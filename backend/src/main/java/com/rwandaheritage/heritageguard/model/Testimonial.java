package com.rwandaheritage.heritageguard.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "testimonials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Testimonial {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Multilingual fields
    @Column(name = "name_en", nullable = false, length = 255)
    private String nameEn;
    
    @Column(name = "name_rw", length = 255)
    private String nameRw;
    
    @Column(name = "name_fr", length = 255)
    private String nameFr;
    
    @Column(name = "role_en", nullable = false, length = 255)
    private String roleEn;
    
    @Column(name = "role_rw", length = 255)
    private String roleRw;
    
    @Column(name = "role_fr", length = 255)
    private String roleFr;
    
    @Column(name = "quote_en", columnDefinition = "TEXT", nullable = false)
    private String quoteEn;
    
    @Column(name = "quote_rw", columnDefinition = "TEXT")
    private String quoteRw;
    
    @Column(name = "quote_fr", columnDefinition = "TEXT")
    private String quoteFr;
    
    // Avatar fields (optional)
    @Column(name = "avatar_url", length = 1000)
    private String avatarUrl;
    
    @Column(name = "avatar_file_name", length = 255)
    private String avatarFileName;
    
    @Column(name = "avatar_file_path", length = 1000)
    private String avatarFilePath;
    
    // Status fields
    @Column(name = "is_verified", nullable = false)
    @Builder.Default
    private boolean isVerified = false;
    
    @Column(name = "is_approved", nullable = false)
    @Builder.Default
    private boolean isApproved = false;
    
    @Column(name = "is_featured", nullable = false)
    @Builder.Default
    private boolean isFeatured = false;
    
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;
    
    @Column(name = "language", nullable = false, length = 10)
    @Builder.Default
    private String language = "en";
    
    // User relationship (optional - for user-submitted testimonials)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    
    // Audit fields
    @Column(name = "created_by", length = 100)
    private String createdBy;
    
    @Column(name = "created_date")
    private LocalDateTime createdDate;
    
    @Column(name = "updated_by", length = 100)
    private String updatedBy;
    
    @Column(name = "updated_date")
    private LocalDateTime updatedDate;
    
    @Column(name = "approved_by", length = 100)
    private String approvedBy;
    
    @Column(name = "approved_date")
    private LocalDateTime approvedDate;
    
    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
        updatedDate = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedDate = LocalDateTime.now();
    }
    
    // Manual getters and setters for boolean fields to ensure they are available
    public boolean isVerified() {
        return isVerified;
    }
    
    public void setVerified(boolean verified) {
        isVerified = verified;
    }
    
    public boolean isApproved() {
        return isApproved;
    }
    
    public void setApproved(boolean approved) {
        isApproved = approved;
    }
    
    public boolean isFeatured() {
        return isFeatured;
    }
    
    public void setFeatured(boolean featured) {
        isFeatured = featured;
    }
    
    public boolean isActive() {
        return isActive;
    }
    
    public void setActive(boolean active) {
        isActive = active;
    }
}

