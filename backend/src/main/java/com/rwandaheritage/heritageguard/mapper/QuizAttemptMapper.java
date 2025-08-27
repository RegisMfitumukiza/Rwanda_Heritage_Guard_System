package com.rwandaheritage.heritageguard.mapper;

import com.rwandaheritage.heritageguard.model.QuizAttempt;
import com.rwandaheritage.heritageguard.dto.QuizAttemptDTO;

public class QuizAttemptMapper {
    
    public static QuizAttemptDTO toDTO(QuizAttempt attempt) {
        if (attempt == null) return null;
        return QuizAttemptDTO.builder()
                .id(attempt.getId())
                .quizId(attempt.getQuizId())
                .userId(attempt.getUserId())
                .startTime(attempt.getStartTime())
                .endTime(attempt.getEndTime())
                .totalScore(attempt.getTotalScore())
                .maxPossibleScore(attempt.getMaxPossibleScore())
                .percentageScore(attempt.getPercentageScore())
                .passed(attempt.isPassed())
                .attemptNumber(attempt.getAttemptNumber())
                .timeTakenMinutes(attempt.getTimeTakenMinutes())
                .isCompleted(attempt.isCompleted())
                .createdBy(attempt.getCreatedBy())
                .createdDate(attempt.getCreatedDate())
                .updatedBy(attempt.getUpdatedBy())
                .updatedDate(attempt.getUpdatedDate())
                .build();
    }

    public static QuizAttempt toEntity(QuizAttemptDTO dto) {
        if (dto == null) return null;
        return QuizAttempt.builder()
                .id(dto.getId())
                .quizId(dto.getQuizId())
                .userId(dto.getUserId())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .totalScore(dto.getTotalScore())
                .maxPossibleScore(dto.getMaxPossibleScore())
                .percentageScore(dto.getPercentageScore())
                .passed(dto.getPassed())
                .attemptNumber(dto.getAttemptNumber())
                .timeTakenMinutes(dto.getTimeTakenMinutes())
                .isCompleted(dto.getIsCompleted())
                .createdBy(dto.getCreatedBy())
                .createdDate(dto.getCreatedDate())
                .updatedBy(dto.getUpdatedBy())
                .updatedDate(dto.getUpdatedDate())
                .build();
    }
} 