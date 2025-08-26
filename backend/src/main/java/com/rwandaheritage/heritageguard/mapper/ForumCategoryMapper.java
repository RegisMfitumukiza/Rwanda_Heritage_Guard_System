package com.rwandaheritage.heritageguard.mapper;

import com.rwandaheritage.heritageguard.dto.ForumCategoryDTO;
import com.rwandaheritage.heritageguard.model.ForumCategory;

public class ForumCategoryMapper {
    
    public static ForumCategoryDTO toDTO(ForumCategory entity) {
        if (entity == null) {
            return null;
        }
        
        return ForumCategoryDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .language(entity.getLanguage())
                .isPublic(entity.getIsPublic())
                .isActive(entity.getIsActive())
                .createdBy(entity.getCreatedBy())
                .createdDate(entity.getCreatedDate())
                .updatedBy(entity.getUpdatedBy())
                .updatedDate(entity.getUpdatedDate())
                .build();
    }
    
    public static ForumCategory toEntity(ForumCategoryDTO dto) {
        if (dto == null) {
            return null;
        }
        
        return ForumCategory.builder()
                .id(dto.getId())
                .name(dto.getName())
                .description(dto.getDescription())
                .language(dto.getLanguage())
                .isPublic(dto.getIsPublic())
                .isActive(dto.getIsActive())
                .createdBy(dto.getCreatedBy())
                .createdDate(dto.getCreatedDate())
                .updatedBy(dto.getUpdatedBy())
                .updatedDate(dto.getUpdatedDate())
                .build();
    }
} 