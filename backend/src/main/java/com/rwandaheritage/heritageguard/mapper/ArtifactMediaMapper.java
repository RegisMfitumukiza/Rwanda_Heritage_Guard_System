package com.rwandaheritage.heritageguard.mapper;

import com.rwandaheritage.heritageguard.model.ArtifactMedia;
import com.rwandaheritage.heritageguard.dto.ArtifactMediaDTO;

public class ArtifactMediaMapper {
    public static ArtifactMediaDTO toDTO(ArtifactMedia media) {
        if (media == null) return null;
        return ArtifactMediaDTO.builder()
                .id(media.getId())
                .artifactId(media.getArtifact() != null ? media.getArtifact().getId() : null)
                .filePath(media.getFilePath())
                .isPublic(media.getIsPublic())
                .description(media.getDescription())
                .build();
    }

    public static ArtifactMedia toEntity(ArtifactMediaDTO dto) {
        if (dto == null) return null;
        return ArtifactMedia.builder()
                .id(dto.getId())
                .filePath(dto.getFilePath())
                .isPublic(dto.getIsPublic())
                .description(dto.getDescription())
                .build();
    }
}
