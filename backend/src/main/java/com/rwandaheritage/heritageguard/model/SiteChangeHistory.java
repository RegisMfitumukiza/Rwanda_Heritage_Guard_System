package com.rwandaheritage.heritageguard.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "site_change_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteChangeHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", nullable = false)
    private HeritageSite site;

    @Column(name = "field_name", length = 100, nullable = false)
    private String fieldName;

    @Column(name = "action", length = 50, nullable = false)
    private String action; // "created", "updated", "deleted"

    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue;

    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;

    @Column(name = "changed_by", length = 100, nullable = false)
    private String changedBy;

    @Column(name = "changed_at", nullable = false)
    private LocalDateTime changedAt;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    @Column(name = "change_type", length = 50)
    private String changeType; // "CONTENT", "STATUS", "LOCATION", "MEDIA", "MANAGEMENT"

    @PrePersist
    protected void onCreate() {
        if (changedAt == null) {
            changedAt = LocalDateTime.now();
        }
    }
}

