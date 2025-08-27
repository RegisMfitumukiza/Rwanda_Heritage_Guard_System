package com.rwandaheritage.heritageguard.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "learning_progress")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private Long articleId;

    private Long quizId;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ProgressStatus status;

    private Double completionPercentage;

    private LocalDateTime lastAccessedDate;

    private LocalDateTime completedDate;

    public enum ProgressStatus {
        NOT_STARTED,
        IN_PROGRESS,
        COMPLETED
    }
}
