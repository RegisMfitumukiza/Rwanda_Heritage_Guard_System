package com.rwandaheritage.heritageguard.repository;

import com.rwandaheritage.heritageguard.model.Artifact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ArtifactRepository extends JpaRepository<Artifact, Long> {
    
    // Basic filtering methods
    List<Artifact> findByCategory(String category);
    List<Artifact> findByHeritageSiteId(Long heritageSiteId);
    List<Artifact> findByIsPublic(Boolean isPublic);
    
    // Fetch artifact with heritage site details (JOIN FETCH to avoid lazy loading)
    @Query("SELECT a FROM Artifact a LEFT JOIN FETCH a.heritageSite WHERE a.id = :id")
    Optional<Artifact> findByIdWithHeritageSite(@Param("id") Long id);
    
    // Fetch all artifacts with heritage site details
    @Query("SELECT a FROM Artifact a LEFT JOIN FETCH a.heritageSite")
    List<Artifact> findAllWithHeritageSite();
    
    // Search by name (case-insensitive) - search across all language fields
    @Query("SELECT a FROM Artifact a WHERE " +
           "LOWER(a.name['en']) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(a.name['rw']) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(a.name['fr']) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Artifact> searchByName(@Param("searchTerm") String searchTerm);
    
    // Advanced search with multiple criteria
    @Query("SELECT a FROM Artifact a LEFT JOIN FETCH a.heritageSite WHERE " +
           "(:searchTerm IS NULL OR " +
           "LOWER(a.name['en']) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(a.name['rw']) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(a.name['fr']) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
           "(:category IS NULL OR a.category = :category)")
    List<Artifact> searchArtifacts(@Param("searchTerm") String searchTerm, @Param("category") String category);
    
    // Advanced search with multiple criteria
    // Location field has been removed - artifacts are now linked to heritage sites
    // @Query("SELECT a FROM Artifact a WHERE LOWER(a.location) LIKE LOWER(CONCAT('%', :location, '%'))")
    // List<Artifact> searchByLocation(@Param("location") String location);
    
    // Statistics queries
    @Query("SELECT COUNT(a) FROM Artifact a")
    Long countTotalArtifacts();
    
    @Query("SELECT COUNT(a) FROM Artifact a WHERE a.isPublic = true")
    Long countPublicArtifacts();
    
    @Query("SELECT a.category, COUNT(a) FROM Artifact a GROUP BY a.category")
    List<Object[]> countByCategory();
    
    
    // Find artifacts with authentication records
    @Query("SELECT DISTINCT a FROM Artifact a JOIN a.authentications auth WHERE auth.status = :status")
    List<Artifact> findByAuthenticationStatus(@Param("status") String status);
    
    // Find artifacts with recent authentication
    @Query("SELECT DISTINCT a FROM Artifact a JOIN a.authentications auth WHERE auth.date >= :date")
    List<Artifact> findByRecentAuthentication(@Param("date") java.time.LocalDate date);
    
    // Find artifacts by heritage site and category
    List<Artifact> findByHeritageSiteIdAndCategory(Long heritageSiteId, String category);

    // Analytics methods for real data tracking
    @Query("SELECT COUNT(a) FROM Artifact a JOIN a.authentications auth WHERE auth.status = :status")
    long countByAuthenticationStatus(@Param("status") String status);
} 
