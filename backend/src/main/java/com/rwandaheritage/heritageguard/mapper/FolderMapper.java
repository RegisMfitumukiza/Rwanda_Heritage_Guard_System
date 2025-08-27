package com.rwandaheritage.heritageguard.mapper;

import com.rwandaheritage.heritageguard.dto.FolderDTO;
import com.rwandaheritage.heritageguard.model.Folder;
import java.util.List;
import java.util.stream.Collectors;

public class FolderMapper {
    public static FolderDTO toDTO(Folder folder) {
        if (folder == null) return null;
        return FolderDTO.builder()
                .id(folder.getId())
                .name(folder.getName())
                .description(folder.getDescription())
                .type(folder.getType())
                .parentId(folder.getParent() != null ? folder.getParent().getId() : null)
                .siteId(folder.getSite() != null ? folder.getSite().getId() : null)

                .childFolderIds(folder.getChildren() != null ? folder.getChildren().stream()
                    .filter(c -> c.isActive())
                    .map(Folder::getId)
                    .collect(Collectors.toList()) : null)
                .allowedRoles(folder.getAllowedRoles())
                .isActive(folder.isActive())
                .createdBy(folder.getCreatedBy())
                .createdDate(folder.getCreatedDate())
                .updatedBy(folder.getUpdatedBy())
                .updatedDate(folder.getUpdatedDate())
                .build();
    }

    public static Folder toEntity(FolderDTO dto) {
        if (dto == null) return null;
        return Folder.builder()
                .id(dto.getId())
                .name(dto.getName())
                .description(dto.getDescription())
                .type(dto.getType())
                .parent(null) // Set by service layer if needed
                .children(null) // Set by service layer if needed
                .documents(null) // Set by service layer if needed

                .allowedRoles(dto.getAllowedRoles())
                .isActive(dto.getIsActive())
                .createdBy(dto.getCreatedBy())
                .createdDate(dto.getCreatedDate())
                .updatedBy(dto.getUpdatedBy())
                .updatedDate(dto.getUpdatedDate())
                .build();
    }
} 