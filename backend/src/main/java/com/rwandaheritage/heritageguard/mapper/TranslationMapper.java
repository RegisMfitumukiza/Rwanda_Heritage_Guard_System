package com.rwandaheritage.heritageguard.mapper;

import com.rwandaheritage.heritageguard.dto.TranslationDTO;
import com.rwandaheritage.heritageguard.model.Translation;

public class TranslationMapper {
    
    public static TranslationDTO toDTO(Translation translation) {
        if (translation == null) {
            return null;
        }
        
        return TranslationDTO.builder()
            .id(translation.getId())
            .contentType(translation.getContentType().name())
            .contentId(translation.getContentId())
            .fieldName(translation.getFieldName())
            .languageCode(translation.getLanguageCode())
            .translatedText(translation.getTranslatedText())
            .status(translation.getStatus().name())
            .createdBy(translation.getCreatedBy())
            .createdDate(translation.getCreatedDate())
            .updatedBy(translation.getUpdatedBy())
            .updatedDate(translation.getUpdatedDate())
            .build();
    }
    
    public static Translation toEntity(TranslationDTO dto) {
        if (dto == null) {
            return null;
        }
        
        return Translation.builder()
            .id(dto.getId())
            .contentType(Translation.ContentType.valueOf(dto.getContentType()))
            .contentId(dto.getContentId())
            .fieldName(dto.getFieldName())
            .languageCode(dto.getLanguageCode())
            .translatedText(dto.getTranslatedText())
            .status(Translation.TranslationStatus.valueOf(dto.getStatus()))
            .createdBy(dto.getCreatedBy())
            .createdDate(dto.getCreatedDate())
            .updatedBy(dto.getUpdatedBy())
            .updatedDate(dto.getUpdatedDate())
            .build();
    }
} 