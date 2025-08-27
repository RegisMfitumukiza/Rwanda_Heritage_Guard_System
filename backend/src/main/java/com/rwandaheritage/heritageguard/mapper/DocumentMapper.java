package com.rwandaheritage.heritageguard.mapper;

import com.rwandaheritage.heritageguard.dto.DocumentDTO;
import com.rwandaheritage.heritageguard.model.Document;
import java.util.List;
import java.util.stream.Collectors;

public class DocumentMapper {
    public static DocumentDTO toDTO(Document doc) {
        if (doc == null) return null;
        return DocumentDTO.builder()
                .id(doc.getId())
                .title(doc.getTitle())
                .description(doc.getDescription())
                .author(doc.getAuthor())
                .creationDate(doc.getCreationDate())
                .type(doc.getType())
                .tags(doc.getTags())
                .language(doc.getLanguage())
                .folderId(doc.getFolder() != null ? doc.getFolder().getId() : null)
                .isPublic(doc.getIsPublic())
                .versionIds(doc.getVersions() != null ? doc.getVersions().stream()
                    .filter(v -> v.isActive())
                    .map(v -> v.getId())
                    .collect(Collectors.toList()) : null)
                .isActive(doc.isActive())
                .createdBy(doc.getCreatedBy())
                .createdDate(doc.getCreatedDate())
                .updatedBy(doc.getUpdatedBy())
                .updatedDate(doc.getUpdatedDate())
                .build();
    }

    public static Document toEntity(DocumentDTO dto) {
        if (dto == null) return null;
        return Document.builder()
                .id(dto.getId())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .author(dto.getAuthor())
                .creationDate(dto.getCreationDate())
                .type(dto.getType())
                .tags(dto.getTags())
                .language(dto.getLanguage())
                .folder(null) // Set by service layer if needed
                .isPublic(dto.getIsPublic())
                .versions(null) // Set by service layer if needed
                .isActive(dto.getIsActive())
                .createdBy(dto.getCreatedBy())
                .createdDate(dto.getCreatedDate())
                .updatedBy(dto.getUpdatedBy())
                .updatedDate(dto.getUpdatedDate())
                .build();
    }
} 