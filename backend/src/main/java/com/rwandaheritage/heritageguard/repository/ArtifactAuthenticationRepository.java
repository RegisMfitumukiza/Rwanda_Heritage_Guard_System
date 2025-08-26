package com.rwandaheritage.heritageguard.repository;

import com.rwandaheritage.heritageguard.model.ArtifactAuthentication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ArtifactAuthenticationRepository extends JpaRepository<ArtifactAuthentication, Long> {
    
    // Basic query methods
    List<ArtifactAuthentication> findByArtifactId(Long artifactId);
    List<ArtifactAuthentication> findByStatus(String status);
    List<ArtifactAuthentication> findByDate(LocalDate date);
    List<ArtifactAuthentication> findByDateBetween(LocalDate startDate, LocalDate endDate);
    
    // Combined queries
    List<ArtifactAuthentication> findByArtifactIdAndStatus(Long artifactId, String status);
    
    // Search by documentation
    @Query("SELECT aa FROM ArtifactAuthentication aa WHERE LOWER(aa.documentation) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<ArtifactAuthentication> searchByDocumentation(@Param("searchTerm") String searchTerm);
    
    // Statistics queries
    @Query("SELECT COUNT(aa) FROM ArtifactAuthentication aa")
    Long countTotalAuthentications();
    
    @Query("SELECT aa.status, COUNT(aa) FROM ArtifactAuthentication aa GROUP BY aa.status")
    List<Object[]> countByStatus();
    
    // Find recent authentications
    @Query("SELECT aa FROM ArtifactAuthentication aa WHERE aa.date >= :date ORDER BY aa.date DESC")
    List<ArtifactAuthentication> findRecentAuthentications(@Param("date") LocalDate date);
    
    // Find authentications with document files
    @Query("SELECT aa FROM ArtifactAuthentication aa WHERE aa.documentFilePath IS NOT NULL")
    List<ArtifactAuthentication> findWithDocumentFiles();
    
    // Find authentications for multiple artifacts
    @Query("SELECT aa FROM ArtifactAuthentication aa WHERE aa.artifact.id IN :artifactIds")
    List<ArtifactAuthentication> findByArtifactIds(@Param("artifactIds") List<Long> artifactIds);
} 