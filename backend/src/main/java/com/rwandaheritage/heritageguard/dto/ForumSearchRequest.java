package com.rwandaheritage.heritageguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForumSearchRequest {
    
    // Search term for full-text search
    private String searchTerm;
    
    // Topic filters
    private Long categoryId;
    private String language;
    private Boolean isPublic;
    private Boolean isPinned;
    private Boolean isLocked;
    private String createdBy;
    
    // Post filters
    private Long topicId;
    private Boolean isFlagged;
    private Long parentPostId;
    
    // Pagination
    @Builder.Default
    private int page = 0;
    
    @Builder.Default
    private int size = 20;
    
    @Builder.Default
    private String sortBy = "createdDate";
    
    @Builder.Default
    private String sortDirection = "DESC";
    
    /**
     * Convert to Spring Pageable
     */
    public Pageable toPageable() {
        Sort sort = Sort.by(
            sortDirection.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC,
            sortBy
        );
        return PageRequest.of(page, size, sort);
    }
} 