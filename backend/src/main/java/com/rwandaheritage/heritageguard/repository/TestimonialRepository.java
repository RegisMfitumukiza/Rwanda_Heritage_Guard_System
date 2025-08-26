package com.rwandaheritage.heritageguard.repository;

import com.rwandaheritage.heritageguard.model.Testimonial;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TestimonialRepository extends JpaRepository<Testimonial, Long> {
    
    // Find approved and active testimonials
    List<Testimonial> findByIsApprovedTrueAndIsActiveTrueOrderByCreatedDateDesc();
    
    // Find featured testimonials
    List<Testimonial> findByIsFeaturedTrueAndIsApprovedTrueAndIsActiveTrueOrderByCreatedDateDesc();
    
    // Find testimonials by language
    List<Testimonial> findByLanguageAndIsApprovedTrueAndIsActiveTrueOrderByCreatedDateDesc(String language);
    
    // Find featured testimonials by language
    List<Testimonial> findByLanguageAndIsFeaturedTrueAndIsApprovedTrueAndIsActiveTrueOrderByCreatedDateDesc(String language);
    
    // Find testimonials by user
    List<Testimonial> findByUserIdAndIsActiveTrueOrderByCreatedDateDesc(Long userId);
    
    // Find pending testimonials (not approved)
    List<Testimonial> findByIsApprovedFalseAndIsActiveTrueOrderByCreatedDateDesc();
    
    // Find verified testimonials
    List<Testimonial> findByIsVerifiedTrueAndIsApprovedTrueAndIsActiveTrueOrderByCreatedDateDesc();
    
    // Find testimonials by approval status
    List<Testimonial> findByIsApprovedAndIsActiveTrueOrderByCreatedDateDesc(boolean isApproved);
    
    // Find testimonials by verification status
    List<Testimonial> findByIsVerifiedAndIsApprovedTrueAndIsActiveTrueOrderByCreatedDateDesc(boolean isVerified);
    
    // Find testimonials by featured status
    List<Testimonial> findByIsFeaturedAndIsApprovedTrueAndIsActiveTrueOrderByCreatedDateDesc(boolean isFeatured);
    
    // Count testimonials by status
    @Query("SELECT COUNT(t) FROM Testimonial t WHERE t.isApproved = :isApproved AND t.isActive = true")
    long countByIsApprovedAndIsActiveTrue(@Param("isApproved") boolean isApproved);
    
    @Query("SELECT COUNT(t) FROM Testimonial t WHERE t.isVerified = :isVerified AND t.isApproved = true AND t.isActive = true")
    long countByIsVerifiedAndIsApprovedTrueAndIsActiveTrue(@Param("isVerified") boolean isVerified);
    
    @Query("SELECT COUNT(t) FROM Testimonial t WHERE t.isFeatured = :isFeatured AND t.isApproved = true AND t.isActive = true")
    long countByIsFeaturedAndIsApprovedTrueAndIsActiveTrue(@Param("isFeatured") boolean isFeatured);
    
    // Find testimonials with pagination
    Page<Testimonial> findByIsApprovedTrueAndIsActiveTrue(Pageable pageable);
    
    Page<Testimonial> findByLanguageAndIsApprovedTrueAndIsActiveTrue(String language, Pageable pageable);
    
    Page<Testimonial> findByIsApprovedFalseAndIsActiveTrue(Pageable pageable);
    
    // Find testimonials by search term
    @Query("SELECT t FROM Testimonial t WHERE " +
           "(LOWER(t.nameEn) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(t.nameRw) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(t.nameFr) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(t.roleEn) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(t.roleRw) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(t.roleFr) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(t.quoteEn) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(t.quoteRw) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(t.quoteFr) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
           "t.isApproved = true AND t.isActive = true " +
           "ORDER BY t.createdDate DESC")
    List<Testimonial> findBySearchTermAndIsApprovedTrueAndIsActiveTrue(@Param("searchTerm") String searchTerm);
}

