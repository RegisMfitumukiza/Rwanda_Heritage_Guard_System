package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.dto.TestimonialDTO;
import com.rwandaheritage.heritageguard.service.TestimonialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/testimonials")
public class TestimonialController {
    
    @Autowired
    private TestimonialService testimonialService;
    
    /**
     * Get all approved testimonials (public access)
     */
    @GetMapping
    public ResponseEntity<List<TestimonialDTO>> getAllApprovedTestimonials(
            @RequestParam(required = false) String language,
            @RequestParam(required = false, defaultValue = "false") boolean featured) {
        
        List<TestimonialDTO> testimonials;
        if (featured) {
            testimonials = language != null ? 
                testimonialService.getFeaturedTestimonialsByLanguage(language) :
                testimonialService.getFeaturedTestimonials();
        } else {
            testimonials = language != null ? 
                testimonialService.getTestimonialsByLanguage(language) :
                testimonialService.getAllApprovedTestimonials();
        }
        
        return ResponseEntity.ok(testimonials);
    }
    
    /**
     * Get testimonials with pagination (public access)
     */
    @GetMapping("/page")
    public ResponseEntity<Page<TestimonialDTO>> getTestimonialsWithPagination(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String language) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<TestimonialDTO> testimonials = language != null ?
            testimonialService.getTestimonialsByLanguageWithPagination(language, pageable) :
            testimonialService.getTestimonialsWithPagination(pageable);
        
        return ResponseEntity.ok(testimonials);
    }
    
    /**
     * Get testimonial by ID (public access)
     */
    @GetMapping("/{id}")
    public ResponseEntity<TestimonialDTO> getTestimonialById(@PathVariable Long id) {
        TestimonialDTO testimonial = testimonialService.getTestimonialById(id);
        return ResponseEntity.ok(testimonial);
    }
    
    /**
     * Create new testimonial (authenticated users)
     */
    @PostMapping
    @PreAuthorize("hasRole('COMMUNITY_MEMBER') or hasRole('HERITAGE_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<TestimonialDTO> createTestimonial(@Valid @RequestBody TestimonialDTO testimonialDTO) {
        TestimonialDTO createdTestimonial = testimonialService.createTestimonial(testimonialDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTestimonial);
    }
    
    /**
     * Update testimonial (owner or admin)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HERITAGE_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<TestimonialDTO> updateTestimonial(
            @PathVariable Long id,
            @Valid @RequestBody TestimonialDTO testimonialDTO) {
        TestimonialDTO updatedTestimonial = testimonialService.updateTestimonial(id, testimonialDTO);
        return ResponseEntity.ok(updatedTestimonial);
    }
    
    /**
     * Delete testimonial (admin only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTestimonial(@PathVariable Long id) {
        testimonialService.deleteTestimonial(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Approve testimonial (admin or content manager)
     */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('CONTENT_MANAGER') or hasRole('HERITAGE_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<TestimonialDTO> approveTestimonial(@PathVariable Long id) {
        TestimonialDTO approvedTestimonial = testimonialService.approveTestimonial(id);
        return ResponseEntity.ok(approvedTestimonial);
    }
    
    /**
     * Reject testimonial (admin or content manager)
     */
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('CONTENT_MANAGER') or hasRole('HERITAGE_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<Void> rejectTestimonial(@PathVariable Long id) {
        testimonialService.rejectTestimonial(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Verify testimonial (admin or heritage manager)
     */
    @PutMapping("/{id}/verify")
    @PreAuthorize("hasRole('HERITAGE_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<TestimonialDTO> verifyTestimonial(@PathVariable Long id) {
        TestimonialDTO verifiedTestimonial = testimonialService.verifyTestimonial(id);
        return ResponseEntity.ok(verifiedTestimonial);
    }
    
    /**
     * Feature testimonial (admin or content manager)
     */
    @PutMapping("/{id}/feature")
    @PreAuthorize("hasRole('CONTENT_MANAGER') or hasRole('HERITAGE_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<TestimonialDTO> featureTestimonial(@PathVariable Long id) {
        TestimonialDTO featuredTestimonial = testimonialService.featureTestimonial(id);
        return ResponseEntity.ok(featuredTestimonial);
    }
    
    /**
     * Unfeature testimonial (admin or content manager)
     */
    @PutMapping("/{id}/unfeature")
    @PreAuthorize("hasRole('CONTENT_MANAGER') or hasRole('HERITAGE_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<TestimonialDTO> unfeatureTestimonial(@PathVariable Long id) {
        TestimonialDTO unfeaturedTestimonial = testimonialService.unfeatureTestimonial(id);
        return ResponseEntity.ok(unfeaturedTestimonial);
    }
    
    /**
     * Upload avatar for testimonial (owner or admin)
     */
    @PostMapping("/{id}/avatar")
    @PreAuthorize("hasRole('HERITAGE_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<TestimonialDTO> uploadAvatar(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(null);
        }
        
        TestimonialDTO updatedTestimonial = testimonialService.uploadAvatar(id, file);
        return ResponseEntity.ok(updatedTestimonial);
    }
    
    /**
     * Get avatar image (public access)
     */
    @GetMapping("/{id}/avatar")
    public ResponseEntity<byte[]> getAvatar(@PathVariable Long id) {
        try {
            TestimonialDTO testimonial = testimonialService.getTestimonialById(id);
            if (testimonial.getAvatarFilePath() == null) {
                return ResponseEntity.notFound().build();
            }
            
            Path filePath = Paths.get(testimonial.getAvatarFilePath());
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }
            
            byte[] imageBytes = Files.readAllBytes(filePath);
            String contentType = determineContentType(testimonial.getAvatarFileName());
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(imageBytes);
                    
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Get pending testimonials (admin or content manager)
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('CONTENT_MANAGER') or hasRole('HERITAGE_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<List<TestimonialDTO>> getPendingTestimonials() {
        List<TestimonialDTO> pendingTestimonials = testimonialService.getPendingTestimonials();
        return ResponseEntity.ok(pendingTestimonials);
    }
    
    /**
     * Search testimonials (public access)
     */
    @GetMapping("/search")
    public ResponseEntity<List<TestimonialDTO>> searchTestimonials(@RequestParam String q) {
        if (q == null || q.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        List<TestimonialDTO> searchResults = testimonialService.searchTestimonials(q.trim());
        return ResponseEntity.ok(searchResults);
    }
    
    /**
     * Get testimonials statistics (admin or content manager)
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('CONTENT_MANAGER') or hasRole('HERITAGE_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getStatistics() {
        TestimonialService.TestimonialStatistics stats = testimonialService.getStatistics();
        
        Map<String, Long> statistics = Map.of(
            "totalTestimonials", stats.getTotalTestimonials(),
            "verifiedTestimonials", stats.getVerifiedTestimonials(),
            "featuredTestimonials", stats.getFeaturedTestimonials(),
            "pendingTestimonials", stats.getPendingTestimonials()
        );
        
        return ResponseEntity.ok(statistics);
    }
    
    /**
     * Helper method to determine content type based on file extension
     */
    private String determineContentType(String fileName) {
        if (fileName == null) return "image/jpeg";
        
        String extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        return switch (extension) {
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "webp" -> "image/webp";
            default -> "image/jpeg";
        };
    }
}

