package com.rwandaheritage.heritageguard.mapper;

import com.rwandaheritage.heritageguard.dto.CommunityReportDTO;
import com.rwandaheritage.heritageguard.model.CommunityReport;

public class CommunityReportMapper {
    
    public static CommunityReportDTO toDTO(CommunityReport entity) {
        if (entity == null) return null;
        
        return CommunityReportDTO.builder()
                .id(entity.getId())
                .contentType(entity.getContentType().name())
                .contentId(entity.getContentId())
                .reporterId(entity.getReporterId())
                .reportReason(entity.getReportReason().name())
                .description(entity.getDescription())
                .isResolved(entity.isResolved())
                .resolvedBy(entity.getResolvedBy())
                .resolutionAction(entity.getResolutionAction())
                .resolutionNotes(entity.getResolutionNotes())
                .reportedAt(entity.getReportedAt())
                .resolvedAt(entity.getResolvedAt())
                .createdBy(entity.getCreatedBy())
                .createdDate(entity.getCreatedDate())
                .updatedBy(entity.getUpdatedBy())
                .updatedDate(entity.getUpdatedDate())
                .build();
    }
    
    public static CommunityReport toEntity(CommunityReportDTO dto) {
        if (dto == null) return null;
        
        return CommunityReport.builder()
                .id(dto.getId())
                .contentType(CommunityReport.ContentType.valueOf(dto.getContentType()))
                .contentId(dto.getContentId())
                .reporterId(dto.getReporterId())
                .reportReason(CommunityReport.ReportReason.valueOf(dto.getReportReason()))
                .description(dto.getDescription())
                .isResolved(dto.isResolved())
                .resolvedBy(dto.getResolvedBy())
                .resolutionAction(dto.getResolutionAction())
                .resolutionNotes(dto.getResolutionNotes())
                .reportedAt(dto.getReportedAt())
                .resolvedAt(dto.getResolvedAt())
                .createdBy(dto.getCreatedBy())
                .createdDate(dto.getCreatedDate())
                .updatedBy(dto.getUpdatedBy())
                .updatedDate(dto.getUpdatedDate())
                .build();
    }
} 