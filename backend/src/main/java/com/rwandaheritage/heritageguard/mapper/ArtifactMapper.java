package com.rwandaheritage.heritageguard.mapper;

import com.rwandaheritage.heritageguard.model.Artifact;
import com.rwandaheritage.heritageguard.dto.ArtifactDTO;
import com.rwandaheritage.heritageguard.dto.HeritageSiteDTO;
import com.rwandaheritage.heritageguard.dto.ArtifactMediaDTO;
import com.rwandaheritage.heritageguard.dto.ArtifactAuthenticationDTO;
import java.util.stream.Collectors;

public class ArtifactMapper {
    
    // Enhanced method with optional parameters for rich data
    public static ArtifactDTO toDTO(Artifact artifact, boolean includeHeritageSite, boolean includeMedia, boolean includeAuthentications) {
        if (artifact == null) return null;
        
        ArtifactDTO.ArtifactDTOBuilder builder = ArtifactDTO.builder()
                .id(artifact.getId())
                .name(artifact.getName())
                .description(artifact.getDescription())
                .category(artifact.getCategory())
                .isPublic(artifact.getIsPublic());
        
        // Include heritage site details if requested
        if (includeHeritageSite && artifact.getHeritageSite() != null) {
            builder.heritageSiteId(artifact.getHeritageSite().getId())
                   .heritageSite(HeritageSiteDTO.builder()
                        .id(artifact.getHeritageSite().getId())
                        .nameEn(artifact.getHeritageSite().getNameEn())
                        .nameRw(artifact.getHeritageSite().getNameRw())
                        .nameFr(artifact.getHeritageSite().getNameFr())
                        .region(artifact.getHeritageSite().getRegion())
                        .address(artifact.getHeritageSite().getAddress())
                        .build());
        } else {
            builder.heritageSiteId(artifact.getHeritageSite() != null ? artifact.getHeritageSite().getId() : null);
        }
        
        // Include media details if requested
        if (includeMedia && artifact.getMedia() != null) {
            builder.media(artifact.getMedia().stream()
                .map(media -> ArtifactMediaDTO.builder()
                    .id(media.getId())
                    .filePath(media.getFilePath())
                    .description(media.getDescription())
                    .isPublic(media.getIsPublic())
                    .build())
                .collect(Collectors.toList()));
        } else {
            builder.mediaIds(artifact.getMedia() != null ? 
                artifact.getMedia().stream().map(m -> m.getId()).collect(Collectors.toList()) : null);
        }
        
        // Include authentication details if requested
        if (includeAuthentications && artifact.getAuthentications() != null) {
            builder.authentications(artifact.getAuthentications().stream()
                .map(auth -> ArtifactAuthenticationDTO.builder()
                    .id(auth.getId())
                    .status(auth.getStatus())
                    .date(auth.getDate())
                    .documentation(auth.getDocumentation())
                    .build())
                .collect(Collectors.toList()));
        } else {
            builder.authenticationIds(artifact.getAuthentications() != null ? 
                artifact.getAuthentications().stream().map(a -> a.getId()).collect(Collectors.toList()) : null);
        }
        
        // Always include provenance record IDs for now
        builder.provenanceRecordIds(artifact.getProvenanceRecords() != null ? 
            artifact.getProvenanceRecords().stream().map(p -> p.getId()).collect(Collectors.toList()) : null);
        
        return builder.build();
    }
    
    // Default method for backward compatibility
    public static ArtifactDTO toDTO(Artifact artifact) {
        return toDTO(artifact, true, false, false);
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
