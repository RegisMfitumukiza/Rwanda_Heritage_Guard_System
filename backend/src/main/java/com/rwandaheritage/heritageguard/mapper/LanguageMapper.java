package com.rwandaheritage.heritageguard.mapper;

import com.rwandaheritage.heritageguard.model.Language;
import com.rwandaheritage.heritageguard.dto.LanguageDTO;

public class LanguageMapper {
    
    public static LanguageDTO toDTO(Language language) {
        if (language == null) {
            return null;
        }
        
        return LanguageDTO.builder()
                .id(language.getId())
                .code(language.getCode())
                .name(language.getName())
                .isDefault(language.isDefault())
                .isActive(language.isActive())
                .createdBy(language.getCreatedBy())
                .createdDate(language.getCreatedDate())
                .updatedBy(language.getUpdatedBy())
                .updatedDate(language.getUpdatedDate())
                .build();
    }
    
    public static Language toEntity(LanguageDTO dto) {
        if (dto == null) {
            return null;
        }
        
        return Language.builder()
                .id(dto.getId())
                .code(dto.getCode())
                .name(dto.getName())
                .isDefault(dto.isDefault())
                .isActive(dto.isActive())
                .createdBy(dto.getCreatedBy())
                .createdDate(dto.getCreatedDate())
                .updatedBy(dto.getUpdatedBy())
                .updatedDate(dto.getUpdatedDate())
                .build();
    }
} 