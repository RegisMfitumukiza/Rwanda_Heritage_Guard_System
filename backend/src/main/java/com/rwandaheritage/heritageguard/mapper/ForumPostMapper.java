package com.rwandaheritage.heritageguard.mapper;

import com.rwandaheritage.heritageguard.dto.ForumPostDTO;
import com.rwandaheritage.heritageguard.model.ForumPost;
import com.rwandaheritage.heritageguard.model.ForumTopic;

public class ForumPostMapper {
    
    public static ForumPostDTO toDTO(ForumPost entity) {
        if (entity == null) {
            return null;
        }
        
        return ForumPostDTO.builder()
                .id(entity.getId())
                .topicId(entity.getTopic() != null ? entity.getTopic().getId() : null)
                .content(entity.getContent())
                .language(entity.getLanguage())
                .parentPostId(entity.getParentPostId())
                .isActive(entity.getIsActive())
                .isFlagged(entity.getIsFlagged())
                .flaggedBy(entity.getFlaggedBy())
                .flagReason(entity.getFlagReason())
                .createdBy(entity.getCreatedBy())
                .createdDate(entity.getCreatedDate())
                .updatedBy(entity.getUpdatedBy())
                .updatedDate(entity.getUpdatedDate())
                .build();
    }
    
    public static ForumPost toEntity(ForumPostDTO dto) {
        if (dto == null) {
            return null;
        }
        
        ForumPost entity = ForumPost.builder()
                .id(dto.getId())
                .content(dto.getContent())
                .language(dto.getLanguage())
                .parentPostId(dto.getParentPostId())
                .isActive(dto.getIsActive())
                .isFlagged(dto.getIsFlagged())
                .flaggedBy(dto.getFlaggedBy())
                .flagReason(dto.getFlagReason())
                .createdBy(dto.getCreatedBy())
                .createdDate(dto.getCreatedDate())
                .updatedBy(dto.getUpdatedBy())
                .updatedDate(dto.getUpdatedDate())
                .build();
        
        // Topic will be set by service layer
        return entity;
    }
} 