package com.rwandaheritage.heritageguard.repository;

import com.rwandaheritage.heritageguard.model.SiteMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
 
@Repository
public interface SiteMediaRepository extends JpaRepository<SiteMedia, Long> {
    
    // Find media by heritage site
    List<SiteMedia> findByHeritageSiteId(Long heritageSiteId);
    List<SiteMedia> findByHeritageSiteIdAndIsActiveTrue(Long heritageSiteId);
    List<SiteMedia> findByHeritageSiteIdAndIsPublicTrue(Long heritageSiteId);
    List<SiteMedia> findByHeritageSiteIdAndIsActiveTrueAndIsPublicTrue(Long heritageSiteId);
    
    // Find media by category
    List<SiteMedia> findByCategoryAndIsActiveTrue(String category);
    List<SiteMedia> findByHeritageSiteIdAndCategoryAndIsActiveTrue(Long heritageSiteId, String category);
    
    // Find media by uploader
    List<SiteMedia> findByUploaderUsernameAndIsActiveTrue(String uploaderUsername);
    
    // Find public media for a site
    @Query("SELECT sm FROM SiteMedia sm WHERE sm.heritageSite.id = :siteId AND sm.isActive = true AND sm.isPublic = true")
    List<SiteMedia> findPublicMediaBySiteId(@Param("siteId") Long siteId);
    
    // Find media by file type
    List<SiteMedia> findByFileTypeAndIsActiveTrue(String fileType);
    List<SiteMedia> findByHeritageSiteIdAndFileTypeAndIsActiveTrue(Long heritageSiteId, String fileType);
} 