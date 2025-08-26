package com.rwandaheritage.heritageguard.mapper;

import com.rwandaheritage.heritageguard.model.Quiz;
import com.rwandaheritage.heritageguard.dto.QuizDTO;

public class QuizMapper {
    
    public static QuizDTO toDTO(Quiz quiz) {
        if (quiz == null) return null;
        return QuizDTO.builder()
                .id(quiz.getId())
                .titleEn(quiz.getTitleEn())
                .titleRw(quiz.getTitleRw())
                .titleFr(quiz.getTitleFr())
                .descriptionEn(quiz.getDescriptionEn())
                .descriptionRw(quiz.getDescriptionRw())
                .descriptionFr(quiz.getDescriptionFr())
                .articleId(quiz.getArticleId())
                .passingScorePercentage(quiz.getPassingScorePercentage())
                .timeLimitMinutes(quiz.getTimeLimitMinutes())
                .maxAttempts(quiz.getMaxAttempts())
                .isActive(quiz.isActive())
                .isPublic(quiz.isPublic())
                .tags(quiz.getTags())
                .createdBy(quiz.getCreatedBy())
                .createdDate(quiz.getCreatedDate())
                .updatedBy(quiz.getUpdatedBy())
                .updatedDate(quiz.getUpdatedDate())
                .build();
    }

    public static Quiz toEntity(QuizDTO dto) {
        if (dto == null) return null;
        return Quiz.builder()
                .id(dto.getId())
                .titleEn(dto.getTitleEn())
                .titleRw(dto.getTitleRw())
                .titleFr(dto.getTitleFr())
                .descriptionEn(dto.getDescriptionEn())
                .descriptionRw(dto.getDescriptionRw())
                .descriptionFr(dto.getDescriptionFr())
                .articleId(dto.getArticleId())
                .passingScorePercentage(dto.getPassingScorePercentage())
                .timeLimitMinutes(dto.getTimeLimitMinutes())
                .maxAttempts(dto.getMaxAttempts())
                .isActive(dto.getIsActive())
                .isPublic(dto.getIsPublic())
                .tags(dto.getTags())
                .createdBy(dto.getCreatedBy())
                .createdDate(dto.getCreatedDate())
                .updatedBy(dto.getUpdatedBy())
                .updatedDate(dto.getUpdatedDate())
                .build();
    }
} 