package com.rwandaheritage.heritageguard.mapper;

import com.rwandaheritage.heritageguard.dto.ForumPostVersionDTO;
import com.rwandaheritage.heritageguard.model.ForumPostVersion;

public class ForumPostVersionMapper {
    
    public static ForumPostVersionDTO toDTO(ForumPostVersion version) {
        if (version == null) return null;
        
        return ForumPostVersionDTO.builder()
                .id(version.getId())
                .postId(version.getPostId())
                .content(version.getContent())
                .language(version.getLanguage())
                .modifiedBy(version.getModifiedBy())
                .modifiedDate(version.getModifiedDate())
                .changeReason(version.getChangeReason())
                .versionNumber(version.getVersionNumber())
                .build();
    }
    
    public static ForumPostVersion toEntity(ForumPostVersionDTO dto) {
        if (dto == null) return null;
        
        return ForumPostVersion.builder()
                .id(dto.getId())
                .postId(dto.getPostId())
                .content(dto.getContent())
                .language(dto.getLanguage())
                .modifiedBy(dto.getModifiedBy())
                .modifiedDate(dto.getModifiedDate())
                .changeReason(dto.getChangeReason())
                .versionNumber(dto.getVersionNumber())
                .build();
    }
} 