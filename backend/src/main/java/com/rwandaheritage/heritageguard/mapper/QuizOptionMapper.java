package com.rwandaheritage.heritageguard.mapper;

import com.rwandaheritage.heritageguard.model.QuizOption;
import com.rwandaheritage.heritageguard.dto.QuizOptionDTO;

public class QuizOptionMapper {
    
    public static QuizOptionDTO toDTO(QuizOption option) {
        if (option == null) return null;
        return QuizOptionDTO.builder()
                .id(option.getId())
                .questionId(option.getQuestionId())
                .optionTextEn(option.getOptionTextEn())
                .optionTextRw(option.getOptionTextRw())
                .optionTextFr(option.getOptionTextFr())
                .isCorrect(option.isCorrect())
                .optionOrder(option.getOptionOrder())
                .isActive(option.isActive())
                .createdBy(option.getCreatedBy())
                .createdDate(option.getCreatedDate())
                .updatedBy(option.getUpdatedBy())
                .updatedDate(option.getUpdatedDate())
                .build();
    }

    public static QuizOption toEntity(QuizOptionDTO dto) {
        if (dto == null) return null;
        return QuizOption.builder()
                .id(dto.getId())
                .questionId(dto.getQuestionId())
                .optionTextEn(dto.getOptionTextEn())
                .optionTextRw(dto.getOptionTextRw())
                .optionTextFr(dto.getOptionTextFr())
                .isCorrect(dto.getIsCorrect())
                .optionOrder(dto.getOptionOrder())
                .isActive(dto.getIsActive())
                .createdBy(dto.getCreatedBy())
                .createdDate(dto.getCreatedDate())
                .updatedBy(dto.getUpdatedBy())
                .updatedDate(dto.getUpdatedDate())
                .build();
    }
} 