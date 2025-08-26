package com.rwandaheritage.heritageguard.repository;

import com.rwandaheritage.heritageguard.model.SiteChangeHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SiteChangeHistoryRepository extends JpaRepository<SiteChangeHistory, Long> {
    
    /**
     * Find all changes for a specific site, ordered by most recent first
     */
    List<SiteChangeHistory> findBySiteIdOrderByChangedAtDesc(Long siteId);
    
    /**
     * Find changes for a specific site with pagination
     */
    Page<SiteChangeHistory> findBySiteIdOrderByChangedAtDesc(Long siteId, Pageable pageable);
    
    /**
     * Find changes for a specific field on a site
     */
    List<SiteChangeHistory> findBySiteIdAndFieldNameOrderByChangedAtDesc(Long siteId, String fieldName);
    
    /**
     * Find changes by change type for a site
     */
    List<SiteChangeHistory> findBySiteIdAndChangeTypeOrderByChangedAtDesc(Long siteId, String changeType);
    
    /**
     * Find changes made by a specific user
     */
    List<SiteChangeHistory> findByChangedByOrderByChangedAtDesc(String changedBy);
    
    /**
     * Find changes made by a specific user on a specific site
     */
    List<SiteChangeHistory> findBySiteIdAndChangedByOrderByChangedAtDesc(Long siteId, String changedBy);
    
    /**
     * Find recent changes across all sites
     */
    @Query("SELECT h FROM SiteChangeHistory h ORDER BY h.changedAt DESC")
    Page<SiteChangeHistory> findRecentChanges(Pageable pageable);
    
    /**
     * Find changes within a date range for a site
     */
    @Query("SELECT h FROM SiteChangeHistory h WHERE h.site.id = :siteId AND h.changedAt BETWEEN :startDate AND :endDate ORDER BY h.changedAt DESC")
    List<SiteChangeHistory> findBySiteIdAndDateRange(@Param("siteId") Long siteId, 
                                                    @Param("startDate") java.time.LocalDateTime startDate, 
                                                    @Param("endDate") java.time.LocalDateTime endDate);
    
    /**
     * Count total changes for a site
     */
    long countBySiteId(Long siteId);
    
    /**
     * Count changes by type for a site
     */
    long countBySiteIdAndChangeType(Long siteId, String changeType);
}

