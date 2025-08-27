package com.rwandaheritage.heritageguard.mapper;

import com.rwandaheritage.heritageguard.dto.HeritageSiteWithManagerDTO;
import com.rwandaheritage.heritageguard.model.HeritageSite;
import com.rwandaheritage.heritageguard.model.HeritageSiteManager;
import com.rwandaheritage.heritageguard.repository.HeritageSiteManagerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class HeritageSiteWithManagerMapper {
    
    private static HeritageSiteManagerRepository heritageSiteManagerRepository;
    
    @Autowired
    public void setHeritageSiteManagerRepository(HeritageSiteManagerRepository repository) {
        HeritageSiteWithManagerMapper.heritageSiteManagerRepository = repository;
    }
    
    /**
     * Convert HeritageSite entity to HeritageSiteWithManagerDTO
     * Includes manager assignment information from HeritageSiteManager table
     */
    public static HeritageSiteWithManagerDTO toDTO(HeritageSite site) {
        if (site == null) return null;
        
        // Start with basic site information using regular constructor
        HeritageSiteWithManagerDTO dto = new HeritageSiteWithManagerDTO();
        
        // Set basic site fields
        dto.setId(site.getId());
        dto.setNameEn(site.getNameEn());
        dto.setNameRw(site.getNameRw());
        dto.setNameFr(site.getNameFr());
        dto.setDescriptionEn(site.getDescriptionEn());
        dto.setDescriptionRw(site.getDescriptionRw());
        dto.setDescriptionFr(site.getDescriptionFr());
        dto.setSignificanceEn(site.getSignificanceEn());
        dto.setSignificanceRw(site.getSignificanceRw());
        dto.setSignificanceFr(site.getSignificanceFr());
        dto.setAddress(site.getAddress());
        dto.setRegion(site.getRegion());
        dto.setGpsLatitude(site.getGpsLatitude());
        dto.setGpsLongitude(site.getGpsLongitude());
        dto.setStatus(site.getStatus());
        dto.setCategory(site.getCategory());
        dto.setOwnershipType(site.getOwnershipType());
        dto.setContactInfo(site.getContactInfo());
        dto.setEstablishmentYear(site.getEstablishmentYear());
        dto.setPreviousManagerId(site.getPreviousManagerId());
        dto.setManagerUnassignedDate(site.getManagerUnassignedDate());
        dto.setIsActive(site.isActive());
        dto.setCreatedBy(site.getCreatedBy());
        dto.setCreatedDate(site.getCreatedDate());
        dto.setUpdatedBy(site.getUpdatedBy());
        dto.setUpdatedDate(site.getUpdatedDate());
        
        // Add manager assignment information
        if (heritageSiteManagerRepository != null) {
            Optional<HeritageSiteManager> activeAssignment = heritageSiteManagerRepository
                    .findByHeritageSiteIdAndStatus(site.getId(), HeritageSiteManager.ManagerStatus.ACTIVE);
            
            if (activeAssignment.isPresent()) {
                HeritageSiteManager assignment = activeAssignment.get();
                dto.setAssignedManagerId(assignment.getUser().getId());
                dto.setAssignedManagerUsername(assignment.getUser().getUsername());
                dto.setAssignedManagerFullName(assignment.getUser().getFullName());
                dto.setAssignedManagerEmail(assignment.getUser().getEmail());
                dto.setManagerAssignedDate(assignment.getAssignedDate());
                dto.setManagerAssignmentStatus(assignment.getStatus().name());
            }
        }
        
        return dto;
    }
}
