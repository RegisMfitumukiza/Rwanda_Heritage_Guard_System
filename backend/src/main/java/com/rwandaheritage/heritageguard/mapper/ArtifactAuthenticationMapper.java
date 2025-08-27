package com.rwandaheritage.heritageguard.mapper;

import com.rwandaheritage.heritageguard.model.ArtifactAuthentication;
import com.rwandaheritage.heritageguard.dto.ArtifactAuthenticationDTO;

public class ArtifactAuthenticationMapper {
    public static ArtifactAuthenticationDTO toDTO(ArtifactAuthentication auth) {
        if (auth == null) return null;
        return ArtifactAuthenticationDTO.builder()
                .id(auth.getId())
                .artifactId(auth.getArtifact() != null ? auth.getArtifact().getId() : null)
                .status(auth.getStatus())
                .date(auth.getDate())
                .documentation(auth.getDocumentation())
                .documentFilePath(auth.getDocumentFilePath())
                .build();
    }

    public static ArtifactAuthentication toEntity(ArtifactAuthenticationDTO dto) {
        if (dto == null) return null;
        return ArtifactAuthentication.builder()
                .id(dto.getId())
                .status(dto.getStatus())
                .date(dto.getDate())
                .documentation(dto.getDocumentation())
                .documentFilePath(dto.getDocumentFilePath())
                .build();
    }
}