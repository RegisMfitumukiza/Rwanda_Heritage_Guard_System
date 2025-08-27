package com.rwandaheritage.heritageguard.mapper;

import com.rwandaheritage.heritageguard.dto.HeritageSiteDTO;
import com.rwandaheritage.heritageguard.model.HeritageSite;

import com.rwandaheritage.heritageguard.dto.SiteMediaDTO;
import com.rwandaheritage.heritageguard.dto.SiteDocumentDTO;
import com.rwandaheritage.heritageguard.dto.ArtifactDTO;
import com.rwandaheritage.heritageguard.mapper.ArtifactMapper;
import java.util.stream.Collectors;

public class HeritageSiteMapper {
    public static HeritageSiteDTO toDTO(HeritageSite site) {
        if (site == null) return null;
        
        return HeritageSiteDTO.builder()
                .id(site.getId())
                .nameEn(site.getNameEn())
                .nameRw(site.getNameRw())
                .nameFr(site.getNameFr())
                .descriptionEn(site.getDescriptionEn())
                .descriptionRw(site.getDescriptionRw())
                .descriptionFr(site.getDescriptionFr())
                .significanceEn(site.getSignificanceEn())
                .significanceRw(site.getSignificanceRw())
                .significanceFr(site.getSignificanceFr())
                .address(site.getAddress())
                .region(site.getRegion())
                .gpsLatitude(site.getGpsLatitude())
                .gpsLongitude(site.getGpsLongitude())
                .status(site.getStatus())
                .category(site.getCategory())
                .ownershipType(site.getOwnershipType())
                .contactInfo(site.getContactInfo())
                .establishmentYear(site.getEstablishmentYear())
                .previousManagerId(site.getPreviousManagerId())
                .managerUnassignedDate(site.getManagerUnassignedDate())
                .archiveReason(site.getArchiveReason())
                .archiveDate(site.getArchiveDate())
                .isActive(site.isActive())
                .createdBy(site.getCreatedBy())
                .createdDate(site.getCreatedDate())
                .updatedBy(site.getUpdatedBy())
                .updatedDate(site.getUpdatedDate())
                .media(site.getMedia() != null ? site.getMedia().stream()
                        .map(SiteMediaMapper::toDTO)
                        .collect(Collectors.toList()) : null)
                .documents(site.getDocuments() != null ? site.getDocuments().stream()
                        .map(SiteDocumentMapper::toDTO)
                        .collect(Collectors.toList()) : null)
                .artifacts(site.getArtifacts() != null ? site.getArtifacts().stream()
                        .map(ArtifactMapper::toDTO)
                        .collect(Collectors.toList()) : null)
                .build();
    }

    public static HeritageSite toEntity(HeritageSiteDTO dto) {
        if (dto == null) return null;
        
        return HeritageSite.builder()
                .id(dto.getId())
                .nameEn(dto.getNameEn())
                .nameRw(dto.getNameRw())
                .nameFr(dto.getNameFr())
                .descriptionEn(dto.getDescriptionEn())
                .descriptionRw(dto.getDescriptionRw())
                .descriptionFr(dto.getDescriptionFr())
                .significanceEn(dto.getSignificanceEn())
                .significanceRw(dto.getSignificanceRw())
                .significanceFr(dto.getSignificanceFr())
                .address(dto.getAddress())
                .region(dto.getRegion())
                .gpsLatitude(dto.getGpsLatitude())
                .gpsLongitude(dto.getGpsLongitude())
                .status(dto.getStatus())
                .category(dto.getCategory())
                .ownershipType(dto.getOwnershipType())
                .contactInfo(dto.getContactInfo())
                .establishmentYear(dto.getEstablishmentYear())
                // assignedManagerId field has been removed - use HeritageSiteManager table instead
                .previousManagerId(dto.getPreviousManagerId())
                .managerUnassignedDate(dto.getManagerUnassignedDate())
                .archiveReason(dto.getArchiveReason())
                .archiveDate(dto.getArchiveDate())
                .isActive(dto.getIsActive())
                .createdBy(dto.getCreatedBy())
                .createdDate(dto.getCreatedDate())
                .updatedBy(dto.getUpdatedBy())
                .updatedDate(dto.getUpdatedDate())
                .media(dto.getMedia() != null ? dto.getMedia().stream()
                        .map(SiteMediaMapper::toEntity)
                        .collect(Collectors.toList()) : null)
                .documents(dto.getDocuments() != null ? dto.getDocuments().stream()
                        .map(SiteDocumentMapper::toEntity)
                        .collect(Collectors.toList()) : null)
                .artifacts(dto.getArtifacts() != null ? dto.getArtifacts().stream()
                        .map(ArtifactMapper::toEntity)
                        .collect(Collectors.toList()) : null)
                .build();
    }
} 