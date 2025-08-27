package com.rwandaheritage.heritageguard.repository;

import com.rwandaheritage.heritageguard.model.ProvenanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProvenanceRecordRepository extends JpaRepository<ProvenanceRecord, Long> {
    
    // Basic query methods
    List<ProvenanceRecord> findByArtifactId(Long artifactId);
    List<ProvenanceRecord> findByPreviousOwner(String previousOwner);
    List<ProvenanceRecord> findByNewOwner(String newOwner);
    List<ProvenanceRecord> findByEventDate(LocalDate eventDate);
    List<ProvenanceRecord> findByEventDateBetween(LocalDate startDate, LocalDate endDate);
    
    // Combined queries
    List<ProvenanceRecord> findByArtifactIdAndPreviousOwner(Long artifactId, String previousOwner);
    List<ProvenanceRecord> findByArtifactIdAndNewOwner(Long artifactId, String newOwner);
    
    // Search by history
    @Query("SELECT pr FROM ProvenanceRecord pr WHERE LOWER(pr.history) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<ProvenanceRecord> searchByHistory(@Param("searchTerm") String searchTerm);
    
    // Statistics queries
    @Query("SELECT COUNT(pr) FROM ProvenanceRecord pr")
    Long countTotalProvenanceRecords();
    
    // Find recent provenance records
    @Query("SELECT pr FROM ProvenanceRecord pr WHERE pr.eventDate >= :date ORDER BY pr.eventDate DESC")
    List<ProvenanceRecord> findRecentProvenanceRecords(@Param("date") LocalDate date);
    
    // Find provenance records with document files
    @Query("SELECT pr FROM ProvenanceRecord pr WHERE pr.documentFilePath IS NOT NULL")
    List<ProvenanceRecord> findWithDocumentFiles();
    
    // Find provenance records for multiple artifacts
    @Query("SELECT pr FROM ProvenanceRecord pr WHERE pr.artifact.id IN :artifactIds")
    List<ProvenanceRecord> findByArtifactIds(@Param("artifactIds") List<Long> artifactIds);
    
    // Find provenance records by ownership chain
    @Query("SELECT pr FROM ProvenanceRecord pr WHERE pr.previousOwner = :owner OR pr.newOwner = :owner")
    List<ProvenanceRecord> findByOwner(@Param("owner") String owner);
} 