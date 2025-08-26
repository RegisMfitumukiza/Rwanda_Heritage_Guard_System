package com.rwandaheritage.heritageguard.mapper;

import com.rwandaheritage.heritageguard.dto.SiteDocumentDTO;
import com.rwandaheritage.heritageguard.model.SiteDocument;

public class SiteDocumentMapper {
    public static SiteDocumentDTO toDTO(SiteDocument document) {
        if (document == null) return null;
        
        return SiteDocumentDTO.builder()
                .id(document.getId())
                .fileName(document.getFileName())
                .fileType(document.getFileType())
                .filePath(document.getFilePath())
                .uploadDate(document.getUploadDate())
                .description(document.getDescription())
                .category(document.getCategory())
                .isPublic(document.isPublic())
                .uploaderUsername(document.getUploaderUsername())
                .isActive(document.isActive())
                .createdBy(document.getCreatedBy())
                .createdDate(document.getCreatedDate())
                .updatedBy(document.getUpdatedBy())
                .updatedDate(document.getUpdatedDate())
                .heritageSiteId(document.getHeritageSite() != null ? document.getHeritageSite().getId() : null)
                .build();
    }

    public static SiteDocument toEntity(SiteDocumentDTO dto) {
        if (dto == null) return null;
        
        return SiteDocument.builder()
                .id(dto.getId())
                .fileName(dto.getFileName())
                .fileType(dto.getFileType())
                .filePath(dto.getFilePath())
                .uploadDate(dto.getUploadDate())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .isPublic(dto.getIsPublic())
                .uploaderUsername(dto.getUploaderUsername())
                .isActive(dto.getIsActive())
                .createdBy(dto.getCreatedBy())
                .createdDate(dto.getCreatedDate())
                .updatedBy(dto.getUpdatedBy())
                .updatedDate(dto.getUpdatedDate())
                .build();
    }
} 