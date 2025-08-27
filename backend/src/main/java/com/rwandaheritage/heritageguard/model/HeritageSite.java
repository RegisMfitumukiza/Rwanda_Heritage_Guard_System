package com.rwandaheritage.heritageguard.model;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import com.rwandaheritage.heritageguard.model.Artifact;



@Entity
@Table(name = "heritage_sites")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HeritageSite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Multilingual fields
    @Column(name = "name_en", nullable = false, length = 500)
    private String nameEn;
    
    @Column(name = "name_rw", length = 500)
    private String nameRw;
    
    @Column(name = "name_fr", length = 500)
    private String nameFr;

    @Column(name = "description_en", columnDefinition = "TEXT", nullable = false)
    private String descriptionEn;
    
    @Column(name = "description_rw", columnDefinition = "TEXT")
    private String descriptionRw;
    
    @Column(name = "description_fr", columnDefinition = "TEXT")
    private String descriptionFr;

    @Column(name = "significance_en", columnDefinition = "TEXT", nullable = false)
    private String significanceEn;
    
    @Column(name = "significance_rw", columnDefinition = "TEXT")
    private String significanceRw;
    
    @Column(name = "significance_fr", columnDefinition = "TEXT")
    private String significanceFr;

    // Simplified location fields
    @Column(name = "address", nullable = false, length = 1000)
    private String address;
    
    @Column(name = "region", nullable = false, length = 100)
    private String region;
    
    // GPS coordinates for map integration
    @Column(name = "gps_latitude", length = 20)
    private String gpsLatitude;
    
    @Column(name = "gps_longitude", length = 20)
    private String gpsLongitude;
    
    // Core site information
    @Column(name = "status", nullable = false, length = 50)
    private String status;
    
    @Column(name = "category", nullable = false, length = 50)
    private String category;
    
    // TODO: Fix database schema mismatch - ownership_type column is enum in DB but should be VARCHAR
    // Temporary fix: using String instead of enum until database schema is updated
    @Column(name = "ownership_type", nullable = false, length = 50)
    @Builder.Default
    private String ownershipType = "UNKNOWN";
    
    // Optional contact information (simplified)
    @Column(name = "contact_info", length = 500)
    private String contactInfo;
    
    // Simplified establishment date
    @Column(name = "establishment_year", length = 4)
    private String establishmentYear;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    // Audit fields
    @Column(name = "created_by", length = 100)
    private String createdBy;
    
    @Column(name = "created_date")
    private LocalDateTime createdDate;
    
    @Column(name = "updated_by", length = 100)
    private String updatedBy;
    
    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    // Media and documents
    @OneToMany(mappedBy = "heritageSite", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SiteMedia> media;

    @OneToMany(mappedBy = "heritageSite", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SiteDocument> documents;

    // Artifacts associated with this heritage site
    @OneToMany(mappedBy = "heritageSite", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Artifact> artifacts;

    // Previous manager information for restoration
    @Column(name = "previous_manager_id")
    private Long previousManagerId;
    
    @Column(name = "manager_unassigned_date")
    private LocalDateTime managerUnassignedDate;
    
    // JPA relationship to HeritageSiteManager (read-only, for validation purposes)
    @OneToMany(mappedBy = "heritageSite", fetch = FetchType.LAZY)
    private List<HeritageSiteManager> managerAssignments;
    
    // Archive information
    @Column(name = "archive_reason", length = 500)
    private String archiveReason;
    
    @Column(name = "archive_date")
    private LocalDateTime archiveDate;

    // Manual getters and setters for fields that might not be generated properly
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public boolean isActive() {
        return isActive;
    }
    
    public void setIsActive(boolean isActive) {
        this.isActive = isActive;
    }
    
    public List<SiteMedia> getMedia() {
        return media;
    }
    
    public void setMedia(List<SiteMedia> media) {
        this.media = media;
    }
    
    public List<SiteDocument> getDocuments() {
        return documents;
    }
    
    public void setDocuments(List<SiteDocument> documents) {
        this.documents = documents;
    }

    public List<Artifact> getArtifacts() {
        return this.artifacts;
    }
    
    public void setArtifacts(List<Artifact> artifacts) {
        this.artifacts = artifacts;
    }
    
    public String getNameEn() {
        return nameEn;
    }
    
    public void setNameEn(String nameEn) {
        this.nameEn = nameEn;
    }
    
    public String getNameRw() {
        return nameRw;
    }
    
    public void setNameRw(String nameRw) {
        this.nameRw = nameRw;
    }
    
    public String getNameFr() {
        return nameFr;
    }
    
    public void setNameFr(String nameFr) {
        this.nameFr = nameFr;
    }
    
    public String getDescriptionEn() {
        return descriptionEn;
    }
    
    public void setDescriptionEn(String descriptionEn) {
        this.descriptionEn = descriptionEn;
    }
    
    public String getDescriptionRw() {
        return descriptionRw;
    }
    
    public void setDescriptionRw(String descriptionRw) {
        this.descriptionRw = descriptionRw;
    }
    
    public String getDescriptionFr() {
        return descriptionFr;
    }
    
    public void setDescriptionFr(String descriptionFr) {
        this.descriptionFr = descriptionFr;
    }
    
    public String getSignificanceEn() {
        return significanceEn;
    }
    
    public void setSignificanceEn(String significanceEn) {
        this.significanceEn = significanceEn;
    }
    
    public String getSignificanceRw() {
        return significanceRw;
    }
    
    public void setSignificanceRw(String significanceRw) {
        this.significanceRw = significanceRw;
    }
    
    public String getSignificanceFr() {
        return significanceFr;
    }
    
    public void setSignificanceFr(String significanceFr) {
        this.significanceFr = significanceFr;
    }
    
    public String getContactInfo() {
        return contactInfo;
    }
    
    public void setContactInfo(String contactInfo) {
        this.contactInfo = contactInfo;
    }
    
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public String getRegion() {
        return region;
    }
    
    public void setRegion(String region) {
        this.region = region;
    }
    
    public String getGpsLatitude() {
        return gpsLatitude;
    }
    
    public void setGpsLatitude(String gpsLatitude) {
        this.gpsLatitude = gpsLatitude;
    }
    
    public String getGpsLongitude() {
        return gpsLongitude;
    }
    
    public void setGpsLongitude(String gpsLongitude) {
        this.gpsLongitude = gpsLongitude;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public String getOwnershipType() {
        return ownershipType;
    }
    
    public void setOwnershipType(String ownershipType) {
        this.ownershipType = ownershipType;
    }
    
    public String getEstablishmentYear() {
        return establishmentYear;
    }
    
    public void setEstablishmentYear(String establishmentYear) {
        this.establishmentYear = establishmentYear;
    }
    
    public String getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
    
    public LocalDateTime getUpdatedDate() {
        return updatedDate;
    }
    
    public void setUpdatedDate(LocalDateTime updatedDate) {
        this.updatedDate = updatedDate;
    }

    public Long getPreviousManagerId() {
        return previousManagerId;
    }

    public void setPreviousManagerId(Long previousManagerId) {
        this.previousManagerId = previousManagerId;
    }
    
    public LocalDateTime getManagerUnassignedDate() {
        return managerUnassignedDate;
    }
    
    public void setManagerUnassignedDate(LocalDateTime managerUnassignedDate) {
        this.managerUnassignedDate = managerUnassignedDate;
    }
    
    public List<HeritageSiteManager> getManagerAssignments() {
        return managerAssignments;
    }
    
    public void setManagerAssignments(List<HeritageSiteManager> managerAssignments) {
        this.managerAssignments = managerAssignments;
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