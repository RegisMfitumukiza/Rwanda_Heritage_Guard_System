package com.rwandaheritage.heritageguard.mapper;

import com.rwandaheritage.heritageguard.model.TranslationMemory;
import com.rwandaheritage.heritageguard.dto.TranslationMemoryDTO;

public class TranslationMemoryMapper {
    
    public static TranslationMemoryDTO toDTO(TranslationMemory memory) {
        if (memory == null) {
            return null;
        }
        
        return TranslationMemoryDTO.builder()
                .id(memory.getId())
                .sourceText(memory.getSourceText())
                .targetText(memory.getTargetText())
                .sourceLanguage(memory.getSourceLanguage())
                .targetLanguage(memory.getTargetLanguage())
                .context(memory.getContext())
                .usageCount(memory.getUsageCount())
                .createdBy(memory.getCreatedBy())
                .createdDate(memory.getCreatedDate())
                .updatedDate(memory.getUpdatedDate())
                .build();
    }
    
    public static TranslationMemory toEntity(TranslationMemoryDTO dto) {
        if (dto == null) {
            return null;
        }
        
        return TranslationMemory.builder()
                .id(dto.getId())
                .sourceText(dto.getSourceText())
                .targetText(dto.getTargetText())
                .sourceLanguage(dto.getSourceLanguage())
                .targetLanguage(dto.getTargetLanguage())
                .context(dto.getContext())
                .usageCount(dto.getUsageCount())
                .createdBy(dto.getCreatedBy())
                .createdDate(dto.getCreatedDate())
                .updatedDate(dto.getUpdatedDate())
                .build();
    }
} 