package com.rwandaheritage.heritageguard.mapper;

import com.rwandaheritage.heritageguard.dto.DocumentVersionDTO;
import com.rwandaheritage.heritageguard.model.DocumentVersion;

public class DocumentVersionMapper {
    public static DocumentVersionDTO toDTO(DocumentVersion version) {
        if (version == null) return null;
        return DocumentVersionDTO.builder()
                .id(version.getId())
                .documentId(version.getDocument() != null ? version.getDocument().getId() : null)
                .filePath(version.getFilePath())
                .versionNumber(version.getVersionNumber())
                .fileType(version.getFileType())
                .fileSize(version.getFileSize())
                .isActive(version.isActive())
                .createdBy(version.getCreatedBy())
                .createdDate(version.getCreatedDate())
                .updatedBy(version.getUpdatedBy())
                .updatedDate(version.getUpdatedDate())
                .build();
    }

    public static DocumentVersion toEntity(DocumentVersionDTO dto) {
        if (dto == null) return null;
        return DocumentVersion.builder()
                .id(dto.getId())
                .document(null) // Set by service layer if needed
                .filePath(dto.getFilePath())
                .versionNumber(dto.getVersionNumber())
                .fileType(dto.getFileType())
                .fileSize(dto.getFileSize())
                .isActive(dto.getIsActive())
                .createdBy(dto.getCreatedBy())
                .createdDate(dto.getCreatedDate())
                .updatedBy(dto.getUpdatedBy())
                .updatedDate(dto.getUpdatedDate())
                .build();
    }
} 