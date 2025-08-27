package com.rwandaheritage.heritageguard.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PageResponse<T> {
    
    private List<T> content;
    private PaginationMetadata pagination;
    private ResponseMetadata metadata;
    
    // Backward compatibility - alias for content
    public List<T> getItems() {
        return content;
    }
    
    public void setItems(List<T> items) {
        this.content = items;
    }
    
    // Backward compatibility methods for existing controllers
    public int getPage() {
        return pagination != null ? pagination.getPageNumber() : 0;
    }
    
    public void setPage(int page) {
        if (pagination == null) {
            pagination = new PaginationMetadata();
        }
        pagination.setPageNumber(page);
    }
    
    public int getSize() {
        return pagination != null ? pagination.getPageSize() : 0;
    }
    
    public void setSize(int size) {
        if (pagination == null) {
            pagination = new PaginationMetadata();
        }
        pagination.setPageSize(size);
    }
    
    public long getTotalElements() {
        return pagination != null ? pagination.getTotalElements() : 0;
    }
    
    public void setTotalElements(long totalElements) {
        if (pagination == null) {
            pagination = new PaginationMetadata();
        }
        pagination.setTotalElements(totalElements);
    }
    
    public int getTotalPages() {
        return pagination != null ? pagination.getTotalPages() : 0;
    }
    
    public void setTotalPages(int totalPages) {
        if (pagination == null) {
            pagination = new PaginationMetadata();
        }
        pagination.setTotalPages(totalPages);
    }
    
    // Builder method for backward compatibility
    public static class PageResponseBuilder<T> {
        private List<T> content;
        private PaginationMetadata pagination;
        private ResponseMetadata metadata;
        
        public PageResponseBuilder<T> items(List<T> items) {
            this.content = items;
            return this;
        }
        
        public PageResponseBuilder<T> content(List<T> content) {
            this.content = content;
            return this;
        }
        
        public PageResponseBuilder<T> pagination(PaginationMetadata pagination) {
            this.pagination = pagination;
            return this;
        }
        
        public PageResponseBuilder<T> metadata(ResponseMetadata metadata) {
            this.metadata = metadata;
            return this;
        }
        
        public PageResponseBuilder<T> page(int page) {
            if (this.pagination == null) {
                this.pagination = new PaginationMetadata();
            }
            this.pagination.setPageNumber(page);
            return this;
        }
        
        public PageResponseBuilder<T> size(int size) {
            if (this.pagination == null) {
                this.pagination = new PaginationMetadata();
            }
            this.pagination.setPageSize(size);
            return this;
        }
        
        public PageResponseBuilder<T> totalElements(long totalElements) {
            if (this.pagination == null) {
                this.pagination = new PaginationMetadata();
            }
            this.pagination.setTotalElements(totalElements);
            return this;
        }
        
        public PageResponseBuilder<T> totalPages(int totalPages) {
            if (this.pagination == null) {
                this.pagination = new PaginationMetadata();
            }
            this.pagination.setTotalPages(totalPages);
            return this;
        }
        
        public PageResponse<T> build() {
            return new PageResponse<>(content, pagination, metadata);
        }
    }
    
    public static <T> PageResponseBuilder<T> builder() {
        return new PageResponseBuilder<>();
    }
    
    public static <T> PageResponse<T> of(Page<T> page) {
        return PageResponse.<T>builder()
                .content(page.getContent())
                .pagination(PaginationMetadata.builder()
                        .pageNumber(page.getNumber())
                        .pageSize(page.getSize())
                        .totalElements(page.getTotalElements())
                        .totalPages(page.getTotalPages())
                        .hasNext(page.hasNext())
                        .hasPrevious(page.hasPrevious())
                        .isFirst(page.isFirst())
                        .isLast(page.isLast())
                        .build())
                .metadata(ResponseMetadata.builder()
                        .timestamp(java.time.LocalDateTime.now())
                        .success(true)
                        .build())
                .build();
    }
    
    // Backward compatibility method
    public static <T> PageResponse<T> of(List<T> content, int pageNumber, int pageSize, long totalElements) {
        int totalPages = (int) Math.ceil((double) totalElements / pageSize);
        
        return PageResponse.<T>builder()
                .content(content)
                .pagination(PaginationMetadata.builder()
                        .pageNumber(pageNumber)
                        .pageSize(pageSize)
                        .totalElements(totalElements)
                        .totalPages(totalPages)
                        .hasNext(pageNumber < totalPages - 1)
                        .hasPrevious(pageNumber > 0)
                        .isFirst(pageNumber == 0)
                        .isLast(pageNumber == totalPages - 1)
                        .build())
                .metadata(ResponseMetadata.builder()
                        .timestamp(java.time.LocalDateTime.now())
                        .success(true)
                        .build())
                .build();
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaginationMetadata {
        private int pageNumber;
        private int pageSize;
        private long totalElements;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrevious;
        private boolean isFirst;
        private boolean isLast;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResponseMetadata {
        private java.time.LocalDateTime timestamp;
        private boolean success;
        private String message;
        private String requestId;
        private Long processingTimeMs;
    }
}
