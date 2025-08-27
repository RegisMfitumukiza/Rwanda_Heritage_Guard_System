package com.rwandaheritage.heritageguard.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningProgressDTO {
    private Long id;
    private Long userId;
    private Long articleId;
    private Long quizId;
    private String status;
    private Double completionPercentage;
    private LocalDateTime lastAccessedDate;
    private LocalDateTime completedDate;
}

