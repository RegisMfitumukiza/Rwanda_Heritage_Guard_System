package com.rwandaheritage.heritageguard.repository;

import com.rwandaheritage.heritageguard.model.SiteDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
 
@Repository
public interface SiteDocumentRepository extends JpaRepository<SiteDocument, Long> {
    
    // Find documents by heritage site
    List<SiteDocument> findByHeritageSiteId(Long heritageSiteId);
    List<SiteDocument> findByHeritageSiteIdAndIsActiveTrue(Long heritageSiteId);
    List<SiteDocument> findByHeritageSiteIdAndIsPublicTrue(Long heritageSiteId);
    List<SiteDocument> findByHeritageSiteIdAndIsActiveTrueAndIsPublicTrue(Long heritageSiteId);
    
    // Find documents by category
    List<SiteDocument> findByCategoryAndIsActiveTrue(String category);
    List<SiteDocument> findByHeritageSiteIdAndCategoryAndIsActiveTrue(Long heritageSiteId, String category);
    
    // Find documents by uploader
    List<SiteDocument> findByUploaderUsernameAndIsActiveTrue(String uploaderUsername);
    
    // Find public documents for a site
    @Query("SELECT sd FROM SiteDocument sd WHERE sd.heritageSite.id = :siteId AND sd.isActive = true AND sd.isPublic = true")
    List<SiteDocument> findPublicDocumentsBySiteId(@Param("siteId") Long siteId);
    
    // Find documents by file type
    List<SiteDocument> findByFileTypeAndIsActiveTrue(String fileType);
    long countByFileTypeAndIsActiveTrue(String fileType);
    List<SiteDocument> findByHeritageSiteIdAndFileTypeAndIsActiveTrue(Long heritageSiteId, String fileType);

    @Query("SELECT DISTINCT sd.fileType FROM SiteDocument sd WHERE sd.isActive = true")
    List<String> findDistinctFileTypes();
    
    // Statistics methods for analytics
    long countByIsPublicTrue();
    long countByCreatedDateAfter(java.time.LocalDateTime date);

    // Language statistics (if language column exists)
    long countByLanguageAndIsActiveTrue(String language);

    // Pagination support for documents
    org.springframework.data.domain.Page<SiteDocument> findByIsActiveTrue(org.springframework.data.domain.Pageable pageable);
    org.springframework.data.domain.Page<SiteDocument> findByHeritageSiteIdAndIsActiveTrue(Long heritageSiteId, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT sd FROM SiteDocument sd WHERE sd.isActive = true AND " +
            "(:q IS NULL OR LOWER(sd.fileName) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(sd.description) LIKE LOWER(CONCAT('%', :q, '%'))) AND " +
            "(:category IS NULL OR sd.category = :category) AND " +
            "(:fileType IS NULL OR sd.fileType = :fileType) AND " +
            "(:isPublic IS NULL OR sd.isPublic = :isPublic)")
     java.util.List<SiteDocument> searchDocuments(
         @org.springframework.data.repository.query.Param("q") String q,
         @org.springframework.data.repository.query.Param("category") String category,
         @org.springframework.data.repository.query.Param("fileType") String fileType,
         @org.springframework.data.repository.query.Param("isPublic") Boolean isPublic
     );

    // Analytics methods for real data tracking
    @Query("SELECT COALESCE(SUM(sd.fileSize), 0) FROM SiteDocument sd WHERE sd.isActive = true")
    long getTotalDocumentSize();

    @Query("SELECT COALESCE(SUM(sd.viewCount), 0) FROM SiteDocument sd WHERE sd.isActive = true")
    long getTotalDocumentViews();

    @Query("SELECT COALESCE(SUM(sd.downloadCount), 0) FROM SiteDocument sd WHERE sd.isActive = true")
    long getTotalDocumentDownloads();

    @Query("SELECT COALESCE(SUM(sd.searchCount), 0) FROM SiteDocument sd WHERE sd.isActive = true")
    long getTotalSearchCount();

    @Query("SELECT COALESCE(SUM(sd.viewCount), 0) FROM SiteDocument sd WHERE sd.isActive = true AND DATE(sd.lastViewedAt) = CURDATE()")
    int getTodayVisits();

    @Query("SELECT COALESCE(SUM(sd.downloadCount), 0) FROM SiteDocument sd WHERE sd.isActive = true AND DATE(sd.lastDownloadedAt) = CURDATE()")
    int getTodayDownloads();

    @Query("SELECT COALESCE(SUM(sd.searchCount), 0) FROM SiteDocument sd WHERE sd.isActive = true AND DATE(sd.lastSearchedAt) = CURDATE()")
    int getTodaySearches();

    @Query("SELECT COUNT(sd) FROM SiteDocument sd WHERE sd.isActive = true AND DATE(sd.createdDate) = :date")
    long getDocumentCountByDate(@Param("date") java.time.LocalDate date);

    @Query("SELECT COALESCE(SUM(sd.viewCount + sd.downloadCount + sd.searchCount), 0) FROM SiteDocument sd WHERE sd.isActive = true AND DATE(sd.createdDate) = :date")
    long getActivityCountByDate(@Param("date") java.time.LocalDate date);

    @Query("SELECT new map(sd.id as id, sd.fileName as fileName, sd.uploaderUsername as user, 'viewed' as action, sd.lastViewedAt as timestamp) FROM SiteDocument sd WHERE sd.isActive = true AND sd.lastViewedAt IS NOT NULL ORDER BY sd.lastViewedAt DESC")
    java.util.List<java.util.Map<String, Object>> getRecentActivities(@Param("limit") int limit);
} 