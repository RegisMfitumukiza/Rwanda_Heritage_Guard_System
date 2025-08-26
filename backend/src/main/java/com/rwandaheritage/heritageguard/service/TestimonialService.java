package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.dto.TestimonialDTO;
import com.rwandaheritage.heritageguard.mapper.TestimonialMapper;
import com.rwandaheritage.heritageguard.model.Testimonial;
import com.rwandaheritage.heritageguard.model.User;
import com.rwandaheritage.heritageguard.repository.TestimonialRepository;
import com.rwandaheritage.heritageguard.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TestimonialService {
    
    @Autowired
    private TestimonialRepository testimonialRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    private static final String AVATAR_UPLOAD_DIR = "uploads/testimonials/avatars/";
    
    /**
     * Get all approved and active testimonials
     */
    public List<TestimonialDTO> getAllApprovedTestimonials() {
        List<Testimonial> testimonials = testimonialRepository.findByIsApprovedTrueAndIsActiveTrueOrderByCreatedDateDesc();
        return testimonials.stream()
                .map(TestimonialMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Get featured testimonials
     */
    public List<TestimonialDTO> getFeaturedTestimonials() {
        List<Testimonial> testimonials = testimonialRepository.findByIsFeaturedTrueAndIsApprovedTrueAndIsActiveTrueOrderByCreatedDateDesc();
        return testimonials.stream()
                .map(TestimonialMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Get testimonials by language
     */
    public List<TestimonialDTO> getTestimonialsByLanguage(String language) {
        List<Testimonial> testimonials = testimonialRepository.findByLanguageAndIsApprovedTrueAndIsActiveTrueOrderByCreatedDateDesc(language);
        return testimonials.stream()
                .map(TestimonialMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Get featured testimonials by language
     */
    public List<TestimonialDTO> getFeaturedTestimonialsByLanguage(String language) {
        List<Testimonial> testimonials = testimonialRepository.findByLanguageAndIsFeaturedTrueAndIsApprovedTrueAndIsActiveTrueOrderByCreatedDateDesc(language);
        return testimonials.stream()
                .map(TestimonialMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Get testimonial by ID
     */
    public TestimonialDTO getTestimonialById(Long id) {
        Optional<Testimonial> testimonial = testimonialRepository.findById(id);
        if (testimonial.isEmpty() || !testimonial.get().isActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Testimonial not found");
        }
        return TestimonialMapper.toDTO(testimonial.get());
    }
    
    /**
     * Create new testimonial
     */
    public TestimonialDTO createTestimonial(TestimonialDTO testimonialDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        
        Testimonial testimonial = TestimonialMapper.toEntity(testimonialDTO);
        testimonial.setCreatedBy(currentUsername);
        testimonial.setApproved(false); // New testimonials need approval
        testimonial.setActive(true);
        
        // Set user if authenticated
        if (authentication.isAuthenticated() && !"anonymousUser".equals(currentUsername)) {
            Optional<User> user = userRepository.findByUsername(currentUsername);
            user.ifPresent(testimonial::setUser);
        }
        
        Testimonial savedTestimonial = testimonialRepository.save(testimonial);
        return TestimonialMapper.toDTO(savedTestimonial);
    }
    
    /**
     * Update testimonial
     */
    public TestimonialDTO updateTestimonial(Long id, TestimonialDTO testimonialDTO) {
        Optional<Testimonial> existingTestimonial = testimonialRepository.findById(id);
        if (existingTestimonial.isEmpty() || !existingTestimonial.get().isActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Testimonial not found");
        }
        
        Testimonial testimonial = existingTestimonial.get();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        
        // Update fields
        testimonial.setNameEn(testimonialDTO.getNameEn());
        testimonial.setNameRw(testimonialDTO.getNameRw());
        testimonial.setNameFr(testimonialDTO.getNameFr());
        testimonial.setRoleEn(testimonialDTO.getRoleEn());
        testimonial.setRoleRw(testimonialDTO.getRoleRw());
        testimonial.setRoleFr(testimonialDTO.getRoleFr());
        testimonial.setQuoteEn(testimonialDTO.getQuoteEn());
        testimonial.setQuoteRw(testimonialDTO.getQuoteRw());
        testimonial.setQuoteFr(testimonialDTO.getQuoteFr());
        testimonial.setLanguage(testimonialDTO.getLanguage() != null ? testimonialDTO.getLanguage() : "en");
        testimonial.setUpdatedBy(currentUsername);
        
        Testimonial savedTestimonial = testimonialRepository.save(testimonial);
        return TestimonialMapper.toDTO(savedTestimonial);
    }
    
    /**
     * Approve testimonial
     */
    public TestimonialDTO approveTestimonial(Long id) {
        Optional<Testimonial> testimonial = testimonialRepository.findById(id);
        if (testimonial.isEmpty() || !testimonial.get().isActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Testimonial not found");
        }
        
        Testimonial existingTestimonial = testimonial.get();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        
        existingTestimonial.setApproved(true);
        existingTestimonial.setApprovedBy(currentUsername);
        existingTestimonial.setApprovedDate(LocalDateTime.now());
        existingTestimonial.setUpdatedBy(currentUsername);
        
        Testimonial savedTestimonial = testimonialRepository.save(existingTestimonial);
        return TestimonialMapper.toDTO(savedTestimonial);
    }
    
    /**
     * Reject testimonial
     */
    public void rejectTestimonial(Long id) {
        Optional<Testimonial> testimonial = testimonialRepository.findById(id);
        if (testimonial.isEmpty() || !testimonial.get().isActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Testimonial not found");
        }
        
        Testimonial existingTestimonial = testimonial.get();
        existingTestimonial.setActive(false);
        existingTestimonial.setUpdatedBy(SecurityContextHolder.getContext().getAuthentication().getName());
        
        testimonialRepository.save(existingTestimonial);
    }
    
    /**
     * Verify testimonial
     */
    public TestimonialDTO verifyTestimonial(Long id) {
        Optional<Testimonial> testimonial = testimonialRepository.findById(id);
        if (testimonial.isEmpty() || !testimonial.get().isActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Testimonial not found");
        }
        
        Testimonial existingTestimonial = testimonial.get();
        if (!existingTestimonial.isApproved()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Testimonial must be approved before verification");
        }
        
        existingTestimonial.setVerified(true);
        existingTestimonial.setUpdatedBy(SecurityContextHolder.getContext().getAuthentication().getName());
        
        Testimonial savedTestimonial = testimonialRepository.save(existingTestimonial);
        return TestimonialMapper.toDTO(savedTestimonial);
    }
    
    /**
     * Feature testimonial
     */
    public TestimonialDTO featureTestimonial(Long id) {
        Optional<Testimonial> testimonial = testimonialRepository.findById(id);
        if (testimonial.isEmpty() || !testimonial.get().isActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Testimonial not found");
        }
        
        Testimonial existingTestimonial = testimonial.get();
        if (!existingTestimonial.isApproved()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Testimonial must be approved before featuring");
        }
        
        existingTestimonial.setFeatured(true);
        existingTestimonial.setUpdatedBy(SecurityContextHolder.getContext().getAuthentication().getName());
        
        Testimonial savedTestimonial = testimonialRepository.save(existingTestimonial);
        return TestimonialMapper.toDTO(savedTestimonial);
    }
    
    /**
     * Unfeature testimonial
     */
    public TestimonialDTO unfeatureTestimonial(Long id) {
        Optional<Testimonial> testimonial = testimonialRepository.findById(id);
        if (testimonial.isEmpty() || !testimonial.get().isActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Testimonial not found");
        }
        
        Testimonial existingTestimonial = testimonial.get();
        existingTestimonial.setFeatured(false);
        existingTestimonial.setUpdatedBy(SecurityContextHolder.getContext().getAuthentication().getName());
        
        Testimonial savedTestimonial = testimonialRepository.save(existingTestimonial);
        return TestimonialMapper.toDTO(savedTestimonial);
    }
    
    /**
     * Delete testimonial
     */
    public void deleteTestimonial(Long id) {
        Optional<Testimonial> testimonial = testimonialRepository.findById(id);
        if (testimonial.isEmpty() || !testimonial.get().isActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Testimonial not found");
        }
        
        Testimonial existingTestimonial = testimonial.get();
        existingTestimonial.setActive(false);
        existingTestimonial.setUpdatedBy(SecurityContextHolder.getContext().getAuthentication().getName());
        
        testimonialRepository.save(existingTestimonial);
    }
    
    /**
     * Upload avatar for testimonial
     */
    public TestimonialDTO uploadAvatar(Long id, MultipartFile file) {
        Optional<Testimonial> testimonial = testimonialRepository.findById(id);
        if (testimonial.isEmpty() || !testimonial.get().isActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Testimonial not found");
        }
        
        Testimonial existingTestimonial = testimonial.get();
        
        try {
            // Create upload directory if it doesn't exist
            Path uploadDir = Paths.get(AVATAR_UPLOAD_DIR);
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
            
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
            String filename = UUID.randomUUID().toString() + fileExtension;
            Path filePath = uploadDir.resolve(filename);
            
            // Save file
            Files.copy(file.getInputStream(), filePath);
            
            // Update testimonial with avatar info
            existingTestimonial.setAvatarFileName(filename);
            existingTestimonial.setAvatarFilePath(filePath.toString());
            existingTestimonial.setAvatarUrl("/api/testimonials/" + id + "/avatar");
            existingTestimonial.setUpdatedBy(SecurityContextHolder.getContext().getAuthentication().getName());
            
            Testimonial savedTestimonial = testimonialRepository.save(existingTestimonial);
            return TestimonialMapper.toDTO(savedTestimonial);
            
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload avatar", e);
        }
    }
    
    /**
     * Get pending testimonials (for admin review)
     */
    public List<TestimonialDTO> getPendingTestimonials() {
        List<Testimonial> testimonials = testimonialRepository.findByIsApprovedFalseAndIsActiveTrueOrderByCreatedDateDesc();
        return testimonials.stream()
                .map(TestimonialMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Search testimonials
     */
    public List<TestimonialDTO> searchTestimonials(String searchTerm) {
        List<Testimonial> testimonials = testimonialRepository.findBySearchTermAndIsApprovedTrueAndIsActiveTrue(searchTerm);
        return testimonials.stream()
                .map(TestimonialMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Get testimonials with pagination
     */
    public Page<TestimonialDTO> getTestimonialsWithPagination(Pageable pageable) {
        Page<Testimonial> testimonials = testimonialRepository.findByIsApprovedTrueAndIsActiveTrue(pageable);
        return testimonials.map(TestimonialMapper::toDTO);
    }
    
    /**
     * Get testimonials by language with pagination
     */
    public Page<TestimonialDTO> getTestimonialsByLanguageWithPagination(String language, Pageable pageable) {
        Page<Testimonial> testimonials = testimonialRepository.findByLanguageAndIsApprovedTrueAndIsActiveTrue(language, pageable);
        return testimonials.map(TestimonialMapper::toDTO);
    }
    
    /**
     * Get statistics
     */
    public TestimonialStatistics getStatistics() {
        long totalTestimonials = testimonialRepository.countByIsApprovedAndIsActiveTrue(true);
        long verifiedTestimonials = testimonialRepository.countByIsVerifiedAndIsApprovedTrueAndIsActiveTrue(true);
        long featuredTestimonials = testimonialRepository.countByIsFeaturedAndIsApprovedTrueAndIsActiveTrue(true);
        long pendingTestimonials = testimonialRepository.countByIsApprovedAndIsActiveTrue(false);
        
        return new TestimonialStatistics(totalTestimonials, verifiedTestimonials, featuredTestimonials, pendingTestimonials);
    }
    
    /**
     * Statistics class
     */
    public static class TestimonialStatistics {
        private final long totalTestimonials;
        private final long verifiedTestimonials;
        private final long featuredTestimonials;
        private final long pendingTestimonials;
        
        public TestimonialStatistics(long totalTestimonials, long verifiedTestimonials, long featuredTestimonials, long pendingTestimonials) {
            this.totalTestimonials = totalTestimonials;
            this.verifiedTestimonials = verifiedTestimonials;
            this.featuredTestimonials = featuredTestimonials;
            this.pendingTestimonials = pendingTestimonials;
        }
        
        // Getters
        public long getTotalTestimonials() { return totalTestimonials; }
        public long getVerifiedTestimonials() { return verifiedTestimonials; }
        public long getFeaturedTestimonials() { return featuredTestimonials; }
        public long getPendingTestimonials() { return pendingTestimonials; }
    }
}
