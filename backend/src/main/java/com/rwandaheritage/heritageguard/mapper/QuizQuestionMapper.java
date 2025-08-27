package com.rwandaheritage.heritageguard.mapper;

import com.rwandaheritage.heritageguard.model.QuizQuestion;
import com.rwandaheritage.heritageguard.model.QuizOption;
import com.rwandaheritage.heritageguard.dto.QuizQuestionDTO;

import java.util.List;
import java.util.stream.Collectors;

public class QuizQuestionMapper {

    public static QuizQuestionDTO toDTO(QuizQuestion question) {
        return toDTO(question, null);
    }

    public static QuizQuestionDTO toDTO(QuizQuestion question, List<QuizOption> options) {
        if (question == null) return null;
        return QuizQuestionDTO.builder()
                .id(question.getId())
                .quizId(question.getQuizId())
                .questionTextEn(question.getQuestionTextEn())
                .questionTextRw(question.getQuestionTextRw())
                .questionTextFr(question.getQuestionTextFr())
                .explanationEn(question.getExplanationEn())
                .explanationRw(question.getExplanationRw())
                .explanationFr(question.getExplanationFr())
                .questionType(question.getQuestionType() != null ? question.getQuestionType().name() : null)
                .points(question.getPoints())
                .questionOrder(question.getQuestionOrder())
                .isActive(question.isActive())
                .createdBy(question.getCreatedBy())
                .createdDate(question.getCreatedDate())
                .updatedBy(question.getUpdatedBy())
                .updatedDate(question.getUpdatedDate())
                .options(options != null ? options.stream()
                        .map(QuizOptionMapper::toDTO)
                        .collect(Collectors.toList()) : null)
                .build();
    }

    public static QuizQuestion toEntity(QuizQuestionDTO dto) {
        if (dto == null) return null;
        return QuizQuestion.builder()
                .id(dto.getId())
                .quizId(dto.getQuizId())
                .questionTextEn(dto.getQuestionTextEn())
                .questionTextRw(dto.getQuestionTextRw())
                .questionTextFr(dto.getQuestionTextFr())
                .explanationEn(dto.getExplanationEn())
                .explanationRw(dto.getExplanationRw())
                .explanationFr(dto.getExplanationFr())
                .questionType(dto.getQuestionType() != null ? QuizQuestion.QuestionType.valueOf(dto.getQuestionType()) : null)
                .points(dto.getPoints())
                .questionOrder(dto.getQuestionOrder())
                .isActive(dto.getIsActive())
                .createdBy(dto.getCreatedBy())
                .createdDate(dto.getCreatedDate())
                .updatedBy(dto.getUpdatedBy())
                .updatedDate(dto.getUpdatedDate())
                .build();
    }
}