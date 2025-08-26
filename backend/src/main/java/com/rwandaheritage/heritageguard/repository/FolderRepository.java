package com.rwandaheritage.heritageguard.repository;

import com.rwandaheritage.heritageguard.model.Folder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
 
public interface FolderRepository extends JpaRepository<Folder, Long> {
    
    // Basic parent operations
    List<Folder> findByParentId(Long parentId);
    List<Folder> findByParentIdAndIsActiveTrue(Long parentId);
    
    // Root folders (no parent)
    List<Folder> findByParentIsNull();
    List<Folder> findByParentIsNullAndIsActiveTrue();
    
    // Active folders
    List<Folder> findByIsActiveTrue();
    
    // Created by user
    List<Folder> findByCreatedBy(String createdBy);
    List<Folder> findByCreatedByAndIsActiveTrue(String createdBy);
    
    // Name operations
    List<Folder> findByNameContainingIgnoreCase(String name);
    List<Folder> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);
    
    // Order-by queries used by FolderService
    List<Folder> findBySiteIdAndIsActiveTrueOrderByName(Long siteId);
    List<Folder> findByParentIdAndIsActiveTrueOrderByName(Long parentId);
    
    // Existence checks
    boolean existsByNameAndParentId(String name, Long parentId);
    boolean existsByNameAndParentIdAndIsActiveTrue(String name, Long parentId);
    
    // Role-based access
    @Query("SELECT f FROM Folder f JOIN f.allowedRoles ar WHERE ar = :role AND f.isActive = true")
    List<Folder> findByAllowedRole(@Param("role") String role);
    
    // Complex searches
    @Query("SELECT f FROM Folder f WHERE " +
           "(:name IS NULL OR f.name LIKE %:name%) AND " +
           "(:parentId IS NULL OR f.parent.id = :parentId) AND " +
           "(:createdBy IS NULL OR f.createdBy = :createdBy) AND " +
           "f.isActive = true")
    List<Folder> findFoldersWithFilters(
        @Param("name") String name,
        @Param("parentId") Long parentId,
        @Param("createdBy") String createdBy
    );
    
    // Search by name
    @Query("SELECT f FROM Folder f WHERE f.name LIKE %:searchTerm% AND f.isActive = true")
    List<Folder> searchByName(@Param("searchTerm") String searchTerm);
    
    // Get folder hierarchy
    @Query("SELECT f FROM Folder f WHERE f.parent.id = :parentId AND f.isActive = true ORDER BY f.name")
    List<Folder> getChildrenByParentId(@Param("parentId") Long parentId);
    
    // Get all descendants of a folder
    @Query("SELECT f FROM Folder f WHERE f.parent.id IN " +
           "(SELECT f2.id FROM Folder f2 WHERE f2.parent.id = :folderId) AND f.isActive = true")
    List<Folder> getDescendants(@Param("folderId") Long folderId);
    
    // Count folders by parent
    long countByParentId(Long parentId);
    long countByParentIdAndIsActiveTrue(Long parentId);
    
    // Count documents in folder
    @Query("SELECT COUNT(d) FROM Document d WHERE d.folder.id = :folderId AND d.isActive = true")
    long countDocumentsInFolder(@Param("folderId") Long folderId);
    
    // Get folder statistics
    @Query("SELECT f.parent.id, COUNT(f) FROM Folder f WHERE f.isActive = true GROUP BY f.parent.id")
    List<Object[]> getFolderHierarchyStatistics();
    
    // Check for cycles in hierarchy
    @Query("SELECT COUNT(f) > 0 FROM Folder f WHERE f.id = :folderId AND f.parent.id = :parentId")
    boolean wouldCreateCycle(@Param("folderId") Long folderId, @Param("parentId") Long parentId);
} 