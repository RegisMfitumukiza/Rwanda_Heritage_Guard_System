package com.rwandaheritage.heritageguard.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/**
 * Pagination Utility
 * 
 * Provides helper methods for pagination operations
 * Ensures consistent pagination behavior across the application
 */
@Slf4j
public class PaginationUtil {
    
    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE = 100;
    public static final String DEFAULT_SORT_FIELD = "createdDate";
    public static final String DEFAULT_SORT_DIRECTION = "desc";
    
    /**
     * Create Pageable with validation and defaults
     */
    public static Pageable createPageable(Integer page, Integer size, String sortBy, String sortDir) {
        // Validate and set defaults
        int pageNumber = (page != null && page >= 0) ? page : 0;
        int pageSize = validatePageSize(size);
        String sortField = (sortBy != null && !sortBy.trim().isEmpty()) ? sortBy : DEFAULT_SORT_FIELD;
        String sortDirection = (sortDir != null && !sortDir.trim().isEmpty()) ? sortDir : DEFAULT_SORT_DIRECTION;
        
        // Create sort
        Sort sort = createSort(sortField, sortDirection);
        
        log.debug("Creating pageable: page={}, size={}, sort={}, direction={}", 
                pageNumber, pageSize, sortField, sortDirection);
        
        return PageRequest.of(pageNumber, pageSize, sort);
    }
    
    /**
     * Validate page size and apply limits
     */
    public static int validatePageSize(Integer size) {
        if (size == null || size <= 0) {
            return DEFAULT_PAGE_SIZE;
        }
        if (size > MAX_PAGE_SIZE) {
            log.warn("Page size {} exceeds maximum, using {}", size, MAX_PAGE_SIZE);
            return MAX_PAGE_SIZE;
        }
        return size;
    }
    
    /**
     * Create Sort object with validation
     */
    public static Sort createSort(String sortBy, String sortDir) {
        try {
            Sort.Direction direction = Sort.Direction.fromString(sortDir.toUpperCase());
            return Sort.by(direction, sortBy);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid sort direction: {}, using default: {}", sortDir, DEFAULT_SORT_DIRECTION);
            return Sort.by(Sort.Direction.fromString(DEFAULT_SORT_DIRECTION), sortBy);
        }
    }
    
    /**
     * Get offset for manual pagination
     */
    public static int getOffset(int page, int size) {
        return page * size;
    }
    
    /**
     * Validate pagination parameters
     */
    public static boolean isValidPagination(Integer page, Integer size) {
        return (page == null || page >= 0) && 
               (size == null || (size > 0 && size <= MAX_PAGE_SIZE));
    }
    
    /**
     * Get pagination info for logging
     */
    public static String getPaginationInfo(int page, int size, long totalElements) {
        int totalPages = (int) Math.ceil((double) totalElements / size);
        return String.format("Page %d of %d, Size: %d, Total: %d", 
                page + 1, totalPages, size, totalElements);
    }
}

