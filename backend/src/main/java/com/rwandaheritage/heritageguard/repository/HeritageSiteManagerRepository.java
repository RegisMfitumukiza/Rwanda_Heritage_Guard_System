package com.rwandaheritage.heritageguard.repository;

import com.rwandaheritage.heritageguard.model.HeritageSiteManager;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HeritageSiteManagerRepository extends JpaRepository<HeritageSiteManager, Long> {
    
    /**
     * Check if a user is assigned as manager to a specific site
     */
    boolean existsByUserIdAndHeritageSiteIdAndStatus(Long userId, Long heritageSiteId, HeritageSiteManager.ManagerStatus status);
    
    /**
     * Find manager assignment by site ID
     */
    Optional<HeritageSiteManager> findByHeritageSiteIdAndStatus(Long heritageSiteId, HeritageSiteManager.ManagerStatus status);
    
    /**
     * Find all sites managed by a specific user
     */
    List<HeritageSiteManager> findByUserIdAndStatus(Long userId, HeritageSiteManager.ManagerStatus status);
    
    /**
     * Find all active manager assignments
     */
    List<HeritageSiteManager> findByStatus(HeritageSiteManager.ManagerStatus status);
    
    /**
     * Check if a site has an assigned manager
     */
    boolean existsByHeritageSiteIdAndStatus(Long heritageSiteId, HeritageSiteManager.ManagerStatus status);
    
    /**
     * Count sites managed by a user
     */
    long countByUserIdAndStatus(Long userId, HeritageSiteManager.ManagerStatus status);
    
    /**
     * Find manager assignment by user and site
     */
    Optional<HeritageSiteManager> findByUserIdAndHeritageSiteId(Long userId, Long heritageSiteId);
    
    /**
     * Find all manager assignments by heritage site ID and user ID (for cleanup)
     */
    List<HeritageSiteManager> findByHeritageSiteIdAndUserId(Long heritageSiteId, Long userId);
    
    /**
     * Find all manager assignments by heritage site ID (for cleanup)
     */
    List<HeritageSiteManager> findByHeritageSiteId(Long heritageSiteId);
}
