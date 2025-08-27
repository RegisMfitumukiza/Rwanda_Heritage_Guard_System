package com.rwandaheritage.heritageguard.mapper;

import com.rwandaheritage.heritageguard.dto.ModerationHistoryDTO;
import com.rwandaheritage.heritageguard.model.ModerationHistory;

public class ModerationHistoryMapper {
    
    public static ModerationHistoryDTO toDTO(ModerationHistory entity) {
        if (entity == null) {
            return null;
        }
        
        return ModerationHistoryDTO.builder()
                .id(entity.getId())
                .moderatorId(entity.getModeratorId())
                .contentType(entity.getContentType())
                .contentId(entity.getContentId())
                .actionType(entity.getActionType())
                .actionReason(entity.getActionReason())
                .previousStatus(entity.getPreviousStatus())
                .newStatus(entity.getNewStatus())
                .automated(entity.isAutomated())
                .confidenceScore(entity.getConfidenceScore())
                .bulkActionId(entity.getBulkActionId())
                .affectedCount(entity.getAffectedCount())
                .createdBy(entity.getCreatedBy())
                .createdDate(entity.getCreatedDate())
                .updatedBy(entity.getUpdatedBy())
                .updatedDate(entity.getUpdatedDate())
                .build();
    }
    
    public static ModerationHistory toEntity(ModerationHistoryDTO dto) {
        if (dto == null) {
            return null;
        }
        
        return ModerationHistory.builder()
                .id(dto.getId())
                .moderatorId(dto.getModeratorId())
                .contentType(dto.getContentType())
                .contentId(dto.getContentId())
                .actionType(dto.getActionType())
                .actionReason(dto.getActionReason())
                .previousStatus(dto.getPreviousStatus())
                .newStatus(dto.getNewStatus())
                .automated(dto.isAutomated())
                .confidenceScore(dto.getConfidenceScore())
                .bulkActionId(dto.getBulkActionId())
                .affectedCount(dto.getAffectedCount())
                .createdBy(dto.getCreatedBy())
                .createdDate(dto.getCreatedDate())
                .updatedBy(dto.getUpdatedBy())
                .updatedDate(dto.getUpdatedDate())
                .build();
    }
}