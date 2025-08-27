package com.rwandaheritage.heritageguard.mapper;

import com.rwandaheritage.heritageguard.model.QuizResult;
import com.rwandaheritage.heritageguard.dto.QuizResultDTO;

public class QuizResultMapper {
    
    public static QuizResultDTO toDTO(QuizResult result) {
        if (result == null) return null;
        return QuizResultDTO.builder()
                .id(result.getId())
                .attemptId(result.getAttemptId())
                .questionId(result.getQuestionId())
                .selectedOptionId(result.getSelectedOptionId())
                .isCorrect(result.isCorrect())
                .pointsEarned(result.getPointsEarned())
                .maxPoints(result.getMaxPoints())
                .timeTakenSeconds(result.getTimeTakenSeconds())
                .createdBy(result.getCreatedBy())
                .createdDate(result.getCreatedDate())
                .updatedBy(result.getUpdatedBy())
                .updatedDate(result.getUpdatedDate())
                .build();
    }

    public static QuizResult toEntity(QuizResultDTO dto) {
        if (dto == null) return null;
        return QuizResult.builder()
                .id(dto.getId())
                .attemptId(dto.getAttemptId())
                .questionId(dto.getQuestionId())
                .selectedOptionId(dto.getSelectedOptionId())
                .isCorrect(dto.getIsCorrect())
                .pointsEarned(dto.getPointsEarned())
                .maxPoints(dto.getMaxPoints())
                .timeTakenSeconds(dto.getTimeTakenSeconds())
                .createdBy(dto.getCreatedBy())
                .createdDate(dto.getCreatedDate())
                .updatedBy(dto.getUpdatedBy())
                .updatedDate(dto.getUpdatedDate())
                .build();
    }
} 