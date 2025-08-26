package com.rwandaheritage.heritageguard.mapper;

import com.rwandaheritage.heritageguard.dto.TestimonialDTO;
import com.rwandaheritage.heritageguard.model.Testimonial;
import com.rwandaheritage.heritageguard.model.User;

public class TestimonialMapper {
    
    public static TestimonialDTO toDTO(Testimonial testimonial) {
        if (testimonial == null) return null;
        
        return TestimonialDTO.builder()
                .id(testimonial.getId())
                .nameEn(testimonial.getNameEn())
                .nameRw(testimonial.getNameRw())
                .nameFr(testimonial.getNameFr())
                .roleEn(testimonial.getRoleEn())
                .roleRw(testimonial.getRoleRw())
                .roleFr(testimonial.getRoleFr())
                .quoteEn(testimonial.getQuoteEn())
                .quoteRw(testimonial.getQuoteRw())
                .quoteFr(testimonial.getQuoteFr())
                .avatarUrl(testimonial.getAvatarUrl())
                .avatarFileName(testimonial.getAvatarFileName())
                .avatarFilePath(testimonial.getAvatarFilePath())
                .isVerified(testimonial.isVerified())
                .isApproved(testimonial.isApproved())
                .isFeatured(testimonial.isFeatured())
                .isActive(testimonial.isActive())
                .language(testimonial.getLanguage())
                .userId(testimonial.getUser() != null ? testimonial.getUser().getId() : null)
                .userName(testimonial.getUser() != null ? testimonial.getUser().getUsername() : null)
                .createdBy(testimonial.getCreatedBy())
                .createdDate(testimonial.getCreatedDate())
                .updatedBy(testimonial.getUpdatedBy())
                .updatedDate(testimonial.getUpdatedDate())
                .approvedBy(testimonial.getApprovedBy())
                .approvedDate(testimonial.getApprovedDate())
                .build();
    }
    
    public static Testimonial toEntity(TestimonialDTO dto) {
        if (dto == null) return null;
        
        return Testimonial.builder()
                .id(dto.getId())
                .nameEn(dto.getNameEn())
                .nameRw(dto.getNameRw())
                .nameFr(dto.getNameFr())
                .roleEn(dto.getRoleEn())
                .roleRw(dto.getRoleRw())
                .roleFr(dto.getRoleFr())
                .quoteEn(dto.getQuoteEn())
                .quoteRw(dto.getQuoteRw())
                .quoteFr(dto.getQuoteFr())
                .avatarUrl(dto.getAvatarUrl())
                .avatarFileName(dto.getAvatarFileName())
                .avatarFilePath(dto.getAvatarFilePath())
                .isVerified(dto.isVerified())
                .isApproved(dto.isApproved())
                .isFeatured(dto.isFeatured())
                .isActive(dto.isActive())
                .language(dto.getLanguage() != null ? dto.getLanguage() : "en")
                .createdBy(dto.getCreatedBy())
                .createdDate(dto.getCreatedDate())
                .updatedBy(dto.getUpdatedBy())
                .updatedDate(dto.getUpdatedDate())
                .approvedBy(dto.getApprovedBy())
                .approvedDate(dto.getApprovedDate())
                .build();
    }
    
    public static Testimonial toEntity(TestimonialDTO dto, User user) {
        Testimonial testimonial = toEntity(dto);
        if (testimonial != null) {
            testimonial.setUser(user);
        }
        return testimonial;
    }
}

