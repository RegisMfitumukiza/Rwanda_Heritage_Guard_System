package com.rwandaheritage.heritageguard.repository;

import com.rwandaheritage.heritageguard.model.HeritageSite;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
 
@Repository
public interface HeritageSiteRepository extends JpaRepository<HeritageSite, Long> {
    
    // Basic filtering methods
    @Query("SELECT DISTINCT h FROM HeritageSite h LEFT JOIN FETCH h.media WHERE h.id = :id")
    Optional<HeritageSite> findByIdWithMedia(@Param("id") Long id);
    
    @Query("SELECT DISTINCT h FROM HeritageSite h LEFT JOIN FETCH h.documents WHERE h.id = :id")
    Optional<HeritageSite> findByIdWithDocuments(@Param("id") Long id);
    
    List<HeritageSite> findByRegion(String region);
    List<HeritageSite> findByCategory(String category);
    List<HeritageSite> findByStatus(String status);
    List<HeritageSite> findByRegionAndCategory(String region, String category);
    List<HeritageSite> findByIsActiveTrue();
    List<HeritageSite> findByIsActiveFalse();
    List<HeritageSite> findByIsActiveTrueAndRegion(String region);
    List<HeritageSite> findByIsActiveTrueAndCategory(String category);
    
    // Advanced search with multiple criteria
    @Query("SELECT h FROM HeritageSite h WHERE " +
           "(:region IS NULL OR h.region = :region) AND " +
           "(:category IS NULL OR h.category = :category) AND " +
           "(:status IS NULL OR h.status = :status) AND " +
           "(:establishmentYear IS NULL OR h.establishmentYear = :establishmentYear) AND " +
           "h.isActive = true")
    List<HeritageSite> searchSites(@Param("region") String region, 
                                   @Param("category") String category, 
                                   @Param("status") String status,
                                   @Param("establishmentYear") String establishmentYear);
    
    // Search by name (multilingual)
    @Query("SELECT h FROM HeritageSite h WHERE " +
           "h.isActive = true AND " +
           "(LOWER(h.nameEn) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(h.nameRw) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(h.nameFr) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<HeritageSite> searchByName(@Param("searchTerm") String searchTerm);
    
    // Find by creator
    List<HeritageSite> findByCreatedByAndIsActiveTrue(String createdBy);
    
    // Find by ownership type
    List<HeritageSite> findByOwnershipTypeAndIsActiveTrue(String ownershipType);
    
    // Find by status and active state
    List<HeritageSite> findByStatusAndIsActiveTrue(String status);
    
    // Find by multiple statuses and active state
    List<HeritageSite> findByIsActiveTrueAndStatusIn(List<String> statuses);
    
    // Statistics methods
    long countByIsActiveTrue();
    
    long countByCreatedDateAfterAndIsActiveTrue(LocalDateTime cutoffDate);
    
    long countByStatusAndIsActiveTrue(String status);

    // Pagination support
    org.springframework.data.domain.Page<HeritageSite> findByIsActiveTrue(org.springframework.data.domain.Pageable pageable);
    
    @Query("SELECT h FROM HeritageSite h WHERE " +
           "(:region IS NULL OR h.region = :region) AND " +
           "(:category IS NULL OR h.category = :category) AND " +
           "(:status IS NULL OR h.status = :status) AND " +
           "(:establishmentYear IS NULL OR h.establishmentYear = :establishmentYear) AND " +
           "h.isActive = true")
    org.springframework.data.domain.Page<HeritageSite> searchSites(
        @Param("region") String region,
        @Param("category") String category,
        @Param("status") String status,
        @Param("establishmentYear") String establishmentYear,
        org.springframework.data.domain.Pageable pageable
    );

    @Query("SELECT h FROM HeritageSite h WHERE " +
           "h.isActive = true AND " +
           "(LOWER(h.nameEn) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(h.nameRw) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(h.nameFr) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    org.springframework.data.domain.Page<HeritageSite> searchByName(
        @Param("searchTerm") String searchTerm,
        org.springframework.data.domain.Pageable pageable
    );

    // Analytics methods for real data tracking
    @Query("SELECT new map(h.region as region, COUNT(h) as count) FROM HeritageSite h WHERE h.isActive = true GROUP BY h.region ORDER BY count DESC")
    java.util.List<java.util.Map<String, Object>> getSiteCountByRegion();

    @Query("SELECT new map(h.category as category, COUNT(h) as count) FROM HeritageSite h WHERE h.isActive = true GROUP BY h.category ORDER BY count DESC")
    java.util.List<java.util.Map<String, Object>> getSiteCountByCategory();

    @Query("SELECT COUNT(h) FROM HeritageSite h WHERE h.isActive = true AND DATE(h.createdDate) = :date")
    long getSiteCountByDate(@Param("date") java.time.LocalDate date);
    
    // REMOVED: findSitesWithoutActiveManagers method (referenced removed assignedManagerId field)
    // This method is no longer needed since we removed the problematic field
    
    // REMOVED: Methods that referenced removed assignedManagerId field
    // These methods are no longer needed since we removed the problematic field
    // Use HeritageSiteManager table queries instead for manager assignment data
    
    /**
     * Count total heritage managers (users with HERITAGE_MANAGER role)
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = 'HERITAGE_MANAGER' AND u.userStatus = 'ACTIVE'")
    long countTotalHeritageManagers();

    // REMOVED: findByAssignedManagerId method (field removed from model)
    // Use HeritageSiteManager table queries instead for manager assignment data
} 