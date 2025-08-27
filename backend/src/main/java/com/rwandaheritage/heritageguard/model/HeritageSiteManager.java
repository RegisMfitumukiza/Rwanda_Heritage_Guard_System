package com.rwandaheritage.heritageguard.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "heritage_site_managers", 
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"user_id", "heritage_site_id"}, name = "uk_user_site_unique")
       })
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HeritageSiteManager {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "heritage_site_id", nullable = false)
    private HeritageSite heritageSite;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ManagerStatus status = ManagerStatus.ACTIVE;
    
    @CreationTimestamp
    @Column(name = "assigned_date", nullable = false, updatable = false)
    private LocalDateTime assignedDate;
    
    @UpdateTimestamp
    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;
    
    @Column(name = "notes")
    private String notes;
    
    public enum ManagerStatus {
        ACTIVE, INACTIVE, SUSPENDED
    }
}
