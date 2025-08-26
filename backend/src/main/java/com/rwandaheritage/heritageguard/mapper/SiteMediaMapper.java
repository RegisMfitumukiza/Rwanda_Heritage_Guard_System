package com.rwandaheritage.heritageguard.mapper;

import com.rwandaheritage.heritageguard.dto.SiteMediaDTO;
import com.rwandaheritage.heritageguard.model.SiteMedia;

public class SiteMediaMapper {
    public static SiteMediaDTO toDTO(SiteMedia media) {
        if (media == null) return null;
        
        return SiteMediaDTO.builder()
                .id(media.getId())
                .fileName(media.getFileName())
                .fileType(media.getFileType())
                .filePath(media.getFilePath())
                .fileSize(media.getFileSize())
                .dateTaken(media.getDateTaken())
                .photographer(media.getPhotographer())
                .description(media.getDescription())
                .category(media.getCategory())
                .isPublic(media.isPublic())
                .uploaderUsername(media.getUploaderUsername())
                .isActive(media.isActive())
                .createdBy(media.getCreatedBy())
                .createdDate(media.getCreatedDate())
                .updatedBy(media.getUpdatedBy())
                .updatedDate(media.getUpdatedDate())
                .heritageSiteId(media.getHeritageSite() != null ? media.getHeritageSite().getId() : null)
                .build();
    }

    public static SiteMedia toEntity(SiteMediaDTO dto) {
        if (dto == null) return null;
        
        return SiteMedia.builder()
                .id(dto.getId())
                .fileName(dto.getFileName())
                .fileType(dto.getFileType())
                .filePath(dto.getFilePath())
                .dateTaken(dto.getDateTaken())
                .photographer(dto.getPhotographer())
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