package com.rwandaheritage.heritageguard.mapper;

import com.rwandaheritage.heritageguard.dto.LearningProgressDTO;
import com.rwandaheritage.heritageguard.model.LearningProgress;

public class LearningProgressMapper {
    public static LearningProgressDTO toDTO(LearningProgress progress) {
        if (progress == null) return null;
        return LearningProgressDTO.builder()
                .id(progress.getId())
                .userId(progress.getUserId())
                .articleId(progress.getArticleId())
                .quizId(progress.getQuizId())
                .status(progress.getStatus() != null ? progress.getStatus().name() : null)
                .completionPercentage(progress.getCompletionPercentage())
                .lastAccessedDate(progress.getLastAccessedDate())
                .completedDate(progress.getCompletedDate())
                .build();
    }

    public static LearningProgress toEntity(LearningProgressDTO dto) {
        if (dto == null) return null;
        return LearningProgress.builder()
                .id(dto.getId())
                .userId(dto.getUserId())
                .articleId(dto.getArticleId())
                .quizId(dto.getQuizId())
                .status(dto.getStatus() != null ? LearningProgress.ProgressStatus.valueOf(dto.getStatus()) : null)
                .completionPercentage(dto.getCompletionPercentage())
                .lastAccessedDate(dto.getLastAccessedDate())
                .completedDate(dto.getCompletedDate())
                .build();
    }
}
