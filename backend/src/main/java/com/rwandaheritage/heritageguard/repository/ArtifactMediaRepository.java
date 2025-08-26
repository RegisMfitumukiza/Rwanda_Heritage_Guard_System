package com.rwandaheritage.heritageguard.repository;

import com.rwandaheritage.heritageguard.model.ArtifactMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArtifactMediaRepository extends JpaRepository<ArtifactMedia, Long> {
    
    // Basic query methods
    List<ArtifactMedia> findByArtifactId(Long artifactId);
    List<ArtifactMedia> findByIsPublic(Boolean isPublic);
    
    // Combined queries
    List<ArtifactMedia> findByArtifactIdAndIsPublic(Long artifactId, Boolean isPublic);
    
    // Search by description
    @Query("SELECT am FROM ArtifactMedia am WHERE LOWER(am.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<ArtifactMedia> searchByDescription(@Param("searchTerm") String searchTerm);
    
    // Statistics queries
    @Query("SELECT COUNT(am) FROM ArtifactMedia am")
    Long countTotalMedia();

    @Query("SELECT COUNT(am) FROM ArtifactMedia am WHERE am.isPublic = true")
    Long countPublicMedia();
    
    // Find media for multiple artifacts
    @Query("SELECT am FROM ArtifactMedia am WHERE am.artifact.id IN :artifactIds")
    List<ArtifactMedia> findByArtifactIds(@Param("artifactIds") List<Long> artifactIds);
    
    // Find media by file extension
    @Query("SELECT am FROM ArtifactMedia am WHERE am.filePath LIKE '%.%' AND LOWER(SUBSTRING(am.filePath, LOCATE('.', am.filePath) + 1)) = LOWER(:extension)")
    List<ArtifactMedia> findByFileExtension(@Param("extension") String extension);
} 
