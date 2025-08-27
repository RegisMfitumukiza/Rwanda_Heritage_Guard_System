package com.rwandaheritage.heritageguard.mapper;

import com.rwandaheritage.heritageguard.dto.ForumTopicDTO;
import com.rwandaheritage.heritageguard.model.ForumTopic;
import com.rwandaheritage.heritageguard.model.ForumCategory;

public class ForumTopicMapper {
    
    public static ForumTopicDTO toDTO(ForumTopic entity) {
        if (entity == null) {
            return null;
        }
        
        return ForumTopicDTO.builder()
                .id(entity.getId())
                .categoryId(entity.getCategory() != null ? entity.getCategory().getId() : null)
                .title(entity.getTitle())
                .content(entity.getContent())
                .language(entity.getLanguage())
                .isPublic(entity.getIsPublic())
                .isActive(entity.getIsActive())
                .isPinned(entity.getIsPinned())
                .isLocked(entity.getIsLocked())
                .createdBy(entity.getCreatedBy())
                .createdDate(entity.getCreatedDate())
                .updatedBy(entity.getUpdatedBy())
                .updatedDate(entity.getUpdatedDate())
                .build();
    }
    
    public static ForumTopic toEntity(ForumTopicDTO dto) {
        if (dto == null) {
            return null;
        }
        
        ForumTopic entity = ForumTopic.builder()
                .id(dto.getId())
                .title(dto.getTitle())
                .content(dto.getContent())
                .language(dto.getLanguage())
                .isPublic(dto.getIsPublic())
                .isActive(dto.getIsActive())
                .isPinned(dto.getIsPinned())
                .isLocked(dto.getIsLocked())
                .createdBy(dto.getCreatedBy())
                .createdDate(dto.getCreatedDate())
                .updatedBy(dto.getUpdatedBy())
                .updatedDate(dto.getUpdatedDate())
                .build();
        
        // Category will be set by service layer
        return entity;
    }
} 