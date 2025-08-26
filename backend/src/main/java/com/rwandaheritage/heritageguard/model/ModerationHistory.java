package com.rwandaheritage.heritageguard.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "moderation_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModerationHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "moderator_id", nullable = false)
    private String moderatorId; // Username of the moderator

    @Column(name = "content_type", nullable = false, length = 20)
    private String contentType; // "TOPIC", "POST", "USER"

    @Column(name = "content_id", nullable = false)
    private Long contentId; // ID of the moderated content

    @Column(name = "action_type", nullable = false, length = 50)
    private String actionType; // "FLAG", "APPROVE", "REJECT", "DELETE", "LOCK", "PIN", "BULK_ACTION"

    @Column(name = "action_reason", length = 500)
    private String actionReason; // Reason for the moderation action

    @Column(name = "previous_status", length = 50)
    private String previousStatus; // Status before moderation

    @Column(name = "new_status", length = 50)
    private String newStatus; // Status after moderation

    @Column(name = "automated", nullable = false)
    @Builder.Default
    private boolean automated = false; // Whether action was automated

    @Column(name = "confidence_score")
    private Double confidenceScore; // For automated actions (0.0 - 1.0)

    @Column(name = "bulk_action_id")
    private String bulkActionId; // For bulk moderation actions

    @Column(name = "affected_count")
    private Integer affectedCount; // Number of items affected in bulk action

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