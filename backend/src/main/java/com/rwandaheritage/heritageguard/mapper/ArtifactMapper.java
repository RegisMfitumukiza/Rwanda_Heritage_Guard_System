package com.rwandaheritage.heritageguard.mapper;

import com.rwandaheritage.heritageguard.model.Artifact;
import com.rwandaheritage.heritageguard.dto.ArtifactDTO;
import com.rwandaheritage.heritageguard.dto.HeritageSiteDTO;
import java.util.stream.Collectors;

public class ArtifactMapper {
    public static ArtifactDTO toDTO(Artifact artifact) {
        if (artifact == null) return null;
        return ArtifactDTO.builder()
                .id(artifact.getId())
                .name(artifact.getName())
                .description(artifact.getDescription())
                .category(artifact.getCategory())
                .heritageSiteId(artifact.getHeritageSite() != null ? artifact.getHeritageSite().getId() : null)
                .heritageSite(artifact.getHeritageSite() != null ? HeritageSiteDTO.builder()
                    .id(artifact.getHeritageSite().getId())
                    .nameEn(artifact.getHeritageSite().getNameEn())
                    .nameRw(artifact.getHeritageSite().getNameRw())
                    .nameFr(artifact.getHeritageSite().getNameFr())
                    .region(artifact.getHeritageSite().getRegion())
                    .address(artifact.getHeritageSite().getAddress())
                    .build() : null)
                .mediaIds(artifact.getMedia() != null ? artifact.getMedia().stream().map(m -> m.getId()).collect(Collectors.toList()) : null)
                .authenticationIds(artifact.getAuthentications() != null ? artifact.getAuthentications().stream().map(a -> a.getId()).collect(Collectors.toList()) : null)
                .provenanceRecordIds(artifact.getProvenanceRecords() != null ? artifact.getProvenanceRecords().stream().map(p -> p.getId()).collect(Collectors.toList()) : null)
                .isPublic(artifact.getIsPublic())
                .build();
    }

    public static Artifact toEntity(ArtifactDTO dto) {
        if (dto == null) return null;
        Artifact.ArtifactBuilder builder = Artifact.builder()
                .id(dto.getId())
                .name(dto.getName())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .isPublic(dto.getIsPublic());
        // heritageSite, media, authentications, provenanceRecords set in service
        return builder.build();
    }
}
