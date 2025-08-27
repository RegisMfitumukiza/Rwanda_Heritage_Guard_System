package com.rwandaheritage.heritageguard.mapper;

import com.rwandaheritage.heritageguard.dto.NotificationDTO;
import com.rwandaheritage.heritageguard.model.Notification;

public class NotificationMapper {
    
    public static NotificationDTO toDTO(Notification entity) {
        if (entity == null) {
            return null;
        }
        
        return NotificationDTO.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .type(entity.getType())
                .content(entity.getContent())
                .relatedUrl(entity.getRelatedUrl())
                .isRead(entity.getIsRead())
                .isActive(entity.getIsActive())
                .createdBy(entity.getCreatedBy())
                .createdDate(entity.getCreatedDate())
                .updatedBy(entity.getUpdatedBy())
                .updatedDate(entity.getUpdatedDate())
                .build();
    }
    
    public static Notification toEntity(NotificationDTO dto) {
        if (dto == null) {
            return null;
        }
        
        return Notification.builder()
                .id(dto.getId())
                .userId(dto.getUserId())
                .type(dto.getType())
                .content(dto.getContent())
                .relatedUrl(dto.getRelatedUrl())
                .isRead(dto.getIsRead())
                .isActive(dto.getIsActive())
                .createdBy(dto.getCreatedBy())
                .createdDate(dto.getCreatedDate())
                .updatedBy(dto.getUpdatedBy())
                .updatedDate(dto.getUpdatedDate())
                .build();
    }
} 