package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.model.Folder;
import com.rwandaheritage.heritageguard.repository.FolderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.time.LocalDateTime;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.access.AccessDeniedException;

@Service
public class FolderService {
    @Autowired
    private FolderRepository folderRepository;

    public Folder createFolder(Folder folder) {
        // Set audit fields
        String currentUser = getCurrentUsername();
        folder.setCreatedBy(currentUser);
        folder.setUpdatedBy(currentUser);
        folder.setIsActive(true);
        folder.setCreatedDate(LocalDateTime.now());
        folder.setUpdatedDate(LocalDateTime.now());
        
        // Validate required fields and name uniqueness
        Long parentId = folder.getParent() != null ? folder.getParent().getId() : null;
        validateFolderName(folder.getName(), parentId, null);
        
        // Validate description length
        if (folder.getDescription() != null && folder.getDescription().length() > 500) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Description cannot exceed 500 characters");
        }
        
        // Validate folder type
        if (folder.getType() != null) {
            String[] validTypes = {"GENERAL", "HISTORICAL", "ARCHAEOLOGICAL", "ARCHITECTURAL", 
                                 "CONSERVATION", "RESEARCH", "LEGAL", "ADMINISTRATIVE", 
                                 "MEDIA_COVERAGE", "PHOTOGRAPHS", "MAPS", "REPORTS"};
            boolean isValidType = false;
            for (String type : validTypes) {
                if (type.equals(folder.getType())) {
                    isValidType = true;
                    break;
                }
            }
            if (!isValidType) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid folder type");
            }
        }
        
        // Validate parent folder exists
        if (folder.getParent() != null && folder.getParent().getId() != null) {
            Folder parent = folderRepository.findById(folder.getParent().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Parent folder not found"));
            folder.setParent(parent);
        }
        
        // Set default allowed roles if not provided
        if (folder.getAllowedRoles() == null || folder.getAllowedRoles().isEmpty()) {
            folder.setAllowedRoles(List.of("SYSTEM_ADMINISTRATOR", "HERITAGE_MANAGER", "CONTENT_MANAGER", "COMMUNITY_MEMBER"));
        }
        
        return folderRepository.save(folder);
    }

    private boolean isAllowedToView(Folder folder) {
        if (folder.getAllowedRoles() == null || folder.getAllowedRoles().isEmpty()) {
            // Default: staff only
            return isStaff();
        }
        if (folder.getAllowedRoles().contains("PUBLIC")) {
            return true;
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return false;
        }
        for (GrantedAuthority authority : auth.getAuthorities()) {
            String role = authority.getAuthority().replace("ROLE_", "");
            if (folder.getAllowedRoles().contains(role)) {
                return true;
            }
        }
        return false;
    }

    private boolean isStaff() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return false;
        }
        for (GrantedAuthority authority : auth.getAuthorities()) {
            String role = authority.getAuthority();
            if (role.equals("ROLE_SYSTEM_ADMINISTRATOR") || role.equals("ROLE_HERITAGE_MANAGER") || role.equals("ROLE_CONTENT_MANAGER")) {
                return true;
            }
        }
        return false;
    }

    public Optional<Folder> getFolder(Long id) {
        Optional<Folder> folderOpt = folderRepository.findById(id);
        if (folderOpt.isEmpty()) {
            return Optional.empty();
        }
        
        Folder folder = folderOpt.get();
        
        // Check if folder is active
        if (!folder.isActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Folder not found or inactive");
        }
        
        if (!isAllowedToView(folder)) {
            throw new AccessDeniedException("You do not have permission to view this folder.");
        }
        return Optional.of(folder);
    }

    public List<Folder> listFolders() {
        List<Folder> allFolders = folderRepository.findByIsActiveTrue();
        return allFolders.stream().filter(this::isAllowedToView).toList();
    }

    public List<Folder> getRootFolders() {
        List<Folder> rootFolders = folderRepository.findByParentIsNullAndIsActiveTrue();
        return rootFolders.stream().filter(this::isAllowedToView).toList();
    }

    public List<Folder> getChildrenByParentId(Long parentId) {
        List<Folder> children = folderRepository.getChildrenByParentId(parentId);
        return children.stream().filter(this::isAllowedToView).toList();
    }

    public List<Folder> searchFolders(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return listFolders();
        }
        
        List<Folder> results = folderRepository.searchByName(searchTerm.trim());
        return results.stream().filter(this::isAllowedToView).toList();
    }

    public List<Folder> filterFolders(String name, Long parentId, String createdBy) {
        List<Folder> filtered = folderRepository.findFoldersWithFilters(name, parentId, createdBy);
        return filtered.stream().filter(this::isAllowedToView).toList();
    }

    public List<Folder> getFoldersByCreator(String createdBy) {
        List<Folder> folders = folderRepository.findByCreatedByAndIsActiveTrue(createdBy);
        return folders.stream().filter(this::isAllowedToView).toList();
    }

    public List<Folder> getFoldersByRole(String role) {
        List<Folder> folders = folderRepository.findByAllowedRole(role);
        return folders.stream().filter(this::isAllowedToView).toList();
    }

    @Transactional
    public Folder updateFolder(Folder folderUpdates) {
        System.out.println("=== FOLDER SERVICE UPDATE DEBUG ===");
        System.out.println("Updating folder ID: " + folderUpdates.getId());
        System.out.println("Updates: " + folderUpdates);
        
        Folder folder = folderRepository.findById(folderUpdates.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Folder not found"));
        
        System.out.println("Found existing folder: " + folder);
        
        // Set audit fields
        String currentUser = getCurrentUsername();
        folder.setUpdatedBy(currentUser);
        folder.setUpdatedDate(LocalDateTime.now());
        
        // Check permissions
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) ? auth.getName() : null;
        boolean isAdmin = auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_SYSTEM_ADMINISTRATOR"));
        
        if (!isAdmin && (username == null || !username.equals(folder.getCreatedBy()))) {
            throw new AccessDeniedException("You can only update your own folders.");
        }
        
        // Update name if provided
        if (folderUpdates.getName() != null && !folderUpdates.getName().trim().isEmpty()) {
            String newName = folderUpdates.getName().trim();
            String currentName = folder.getName();
            
            // Only validate if name actually changed
            if (!newName.equals(currentName)) {
                // Determine the target parent for validation
                Long targetParentId = folderUpdates.getParent() != null ? 
                    folderUpdates.getParent().getId() : 
                    folder.getParent() != null ? folder.getParent().getId() : null;
                
                // Validate name uniqueness in target location
                validateFolderName(newName, targetParentId, folder.getId());
            }
            
            folder.setName(newName);
        }
        
        // Update description if provided
        if (folderUpdates.getDescription() != null) {
            folder.setDescription(folderUpdates.getDescription().trim());
        }
        
        // Update type if provided
        if (folderUpdates.getType() != null) {
            folder.setType(folderUpdates.getType());
        }
        

        
        // Update allowed roles if provided
        if (folderUpdates.getAllowedRoles() != null) {
            folder.setAllowedRoles(folderUpdates.getAllowedRoles());
        }
        
        // Update parent if provided
        if (folderUpdates.getParent() != null && folderUpdates.getParent().getId() != null) {
            Folder parent = folderRepository.findById(folderUpdates.getParent().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Parent folder not found"));
            
            // Check for cycles
            if (isCycle(folder, parent)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot move folder: would create a cycle in hierarchy.");
            }
            
            folder.setParent(parent);
        }
        
        return folderRepository.save(folder);
    }

    @Transactional
    public Folder updateFolderPermissions(Long folderId, List<String> allowedRoles) {
        System.out.println("=== FOLDER SERVICE PERMISSION UPDATE DEBUG ===");
        System.out.println("Updating permissions for folder ID: " + folderId);
        System.out.println("New allowed roles: " + allowedRoles);
        
        Folder folder = folderRepository.findById(folderId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Folder not found"));
        
        // Check permissions
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) ? auth.getName() : null;
        boolean isAdmin = auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_SYSTEM_ADMINISTRATOR"));
        
        if (!isAdmin && (username == null || !username.equals(folder.getCreatedBy()))) {
            throw new AccessDeniedException("You can only update permissions for your own folders.");
        }
        
        // Update allowed roles
        folder.setAllowedRoles(allowedRoles);
        
        // Set audit fields
        folder.setUpdatedBy(getCurrentUsername());
        folder.setUpdatedDate(LocalDateTime.now());
        
        return folderRepository.save(folder);
    }

    public void deleteFolder(Long id) {
        Folder folder = folderRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Folder not found"));
        
        // Check permissions
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) ? auth.getName() : null;
        boolean isAdmin = auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_SYSTEM_ADMINISTRATOR"));
        
        if (!isAdmin && (username == null || !username.equals(folder.getCreatedBy()))) {
            throw new AccessDeniedException("You can only delete your own folders.");
        }
        
        // Check if folder has children
        List<Folder> children = folderRepository.findByParentIdAndIsActiveTrue(id);
        if (!children.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot delete folder: it has child folders. Please delete children first.");
        }
        
        // Check if folder has documents
        long documentCount = folderRepository.countDocumentsInFolder(id);
        if (documentCount > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot delete folder: it contains documents. Please move or delete documents first.");
        }
        
        // Soft delete
        folder.setIsActive(false);
        folder.setUpdatedBy(getCurrentUsername());
        folder.setUpdatedDate(LocalDateTime.now());
        
        folderRepository.save(folder);
    }

    private boolean isCycle(Folder folder, Folder newParent) {
        if (newParent == null || newParent.getId() == null) {
            return false;
        }
        
        // Check if new parent is the same as current folder
        if (newParent.getId().equals(folder.getId())) {
            return true;
        }
        
        // Check if new parent is a descendant of current folder
        return isDescendant(newParent, folder);
    }

    private boolean isDescendant(Folder potentialDescendant, Folder ancestor) {
        if (potentialDescendant.getParent() == null) {
            return false;
        }
        
        if (potentialDescendant.getParent().getId().equals(ancestor.getId())) {
            return true;
        }
        
        return isDescendant(potentialDescendant.getParent(), ancestor);
    }

    // Helper methods
    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !authentication.getPrincipal().equals("anonymousUser")) {
            return authentication.getName();
        }
        return "system";
    }

    // Statistics methods - removed duplicates

    public List<Object[]> getFolderHierarchyStatistics() {
        return folderRepository.getFolderHierarchyStatistics();
    }

    /**
     * Get folder tree structure for tree view components
     * @param siteId Optional site filter
     * @param parentId Optional parent filter
     * @return Hierarchical folder structure
     */
    public List<Map<String, Object>> getFolderTree(Long siteId, Long parentId) {
        List<Folder> folders;
        
        if (siteId != null) {
            // Get folders for a specific site
            folders = folderRepository.findBySiteIdAndIsActiveTrueOrderByName(siteId);
        } else if (parentId != null) {
            // Get folders under a specific parent
            folders = folderRepository.findByParentIdAndIsActiveTrueOrderByName(parentId);
        } else {
            // Get all root folders
            folders = folderRepository.findByParentIdAndIsActiveTrueOrderByName(null);
        }
        
        return buildTreeStructure(folders);
    }

    /**
     * Move folder to new parent
     * @param folderId Folder to move
     * @param newParentId New parent (null for root)
     * @return Updated folder
     */
    @Transactional
    public Folder moveFolder(Long folderId, Long newParentId) {
        Folder folder = getFolder(folderId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Folder not found"));
        
        Folder newParent = null;
        if (newParentId != null) {
            newParent = getFolder(newParentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "New parent folder not found"));
            
            // Check for cycles
            if (isCycle(folder, newParent)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot move folder to its own descendant");
            }
        }
        
        // Check for name conflicts in new location
        if (folderRepository.existsByNameAndParentIdAndIsActiveTrue(folder.getName(), newParentId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Folder with same name already exists in destination");
        }
        
        folder.setParent(newParent);
        folder.setUpdatedBy(getCurrentUsername());
        folder.setUpdatedDate(LocalDateTime.now());
        
        return folderRepository.save(folder);
    }

    /**
     * Get folders by heritage site
     * @param siteId Heritage site ID
     * @return List of folders for the site
     */
    public List<Folder> getFoldersBySite(Long siteId) {
        return folderRepository.findBySiteIdAndIsActiveTrueOrderByName(siteId);
    }

    /**
     * Get folder path breadcrumb
     * @param folderId Folder ID
     * @return Path hierarchy for navigation
     */
    public List<Map<String, Object>> getFolderPath(Long folderId) {
        List<Map<String, Object>> path = new ArrayList<>();
        
        Folder folder = getFolder(folderId).orElse(null);
        while (folder != null) {
            Map<String, Object> pathItem = new HashMap<>();
            pathItem.put("id", folder.getId());
            pathItem.put("name", folder.getName());
            pathItem.put("level", path.size());
            path.add(0, pathItem); // Add to beginning for correct order
            
            folder = folder.getParent();
        }
        
        return path;
    }

    /**
     * Get folder contents (subfolders and documents)
     * @param folderId Folder ID
     * @param includeDocuments Whether to include documents
     * @return Combined folder contents
     */
    public Map<String, Object> getFolderContents(Long folderId, boolean includeDocuments) {
        Map<String, Object> contents = new HashMap<>();
        
        // Get subfolders
        List<Folder> subfolders = folderRepository.findByParentIdAndIsActiveTrueOrderByName(folderId);
        List<Map<String, Object>> subfoldersData = new ArrayList<>();
        
        for (Folder subfolder : subfolders) {
            Map<String, Object> folderData = new HashMap<>();
            folderData.put("id", subfolder.getId());
            folderData.put("name", subfolder.getName());
            folderData.put("type", "folder");
            folderData.put("createdDate", subfolder.getCreatedDate());
            folderData.put("documentCount", getDocumentCountInFolder(subfolder.getId()));
            folderData.put("childFolderCount", getChildFolderCount(subfolder.getId()));
            subfoldersData.add(folderData);
        }
        
        contents.put("folders", subfoldersData);
        
        // Get documents if requested
        if (includeDocuments) {
            // Note: This would need a document service to get actual documents
            // For now, return empty list - this would be implemented when document association is added
            contents.put("documents", new ArrayList<>());
        }
        
        contents.put("totalItems", subfoldersData.size());
        
        return contents;
    }

    /**
     * Build tree structure from flat folder list
     * @param folders Flat list of folders
     * @return Hierarchical tree structure
     */
    private List<Map<String, Object>> buildTreeStructure(List<Folder> folders) {
        List<Map<String, Object>> tree = new ArrayList<>();
        
        for (Folder folder : folders) {
            Map<String, Object> folderData = new HashMap<>();
            folderData.put("id", folder.getId());
            folderData.put("name", folder.getName());
            folderData.put("type", folder.getType());
            folderData.put("description", folder.getDescription());
            folderData.put("path", "/" + folder.getName()); // Simplified path
            folderData.put("level", 0); // Would calculate actual level in full implementation
            folderData.put("parentId", folder.getParent() != null ? folder.getParent().getId() : null);

            folderData.put("documentCount", getDocumentCountInFolder(folder.getId()));
            folderData.put("childFolderCount", getChildFolderCount(folder.getId()));
            folderData.put("createdBy", folder.getCreatedBy());
            folderData.put("createdDate", folder.getCreatedDate());
            folderData.put("updatedBy", folder.getUpdatedBy());
            folderData.put("updatedDate", folder.getUpdatedDate());
            
            // Get child folders recursively
            List<Folder> children = folderRepository.findByParentIdAndIsActiveTrueOrderByName(folder.getId());
            if (!children.isEmpty()) {
                folderData.put("children", buildTreeStructure(children));
            } else {
                folderData.put("children", new ArrayList<>());
            }
            
            tree.add(folderData);
        }
        
        return tree;
    }

    /**
     * Get document count in a folder (including subfolders)
     * @param folderId Folder ID
     * @return Total document count
     */
    public long getDocumentCountInFolder(Long folderId) {
        // For now, return 0 as document association is not fully implemented
        // This would be implemented when document service is connected
        return 0L;
    }

    /**
     * Get child folder count for a folder
     * @param folderId Folder ID
     * @return Number of child folders
     */
    public long getChildFolderCount(Long folderId) {
        return folderRepository.countByParentIdAndIsActiveTrue(folderId);
    }

    /**
     * Get available folder types with metadata
     * @return Map of folder types with display information
     */
    public Map<String, Object> getFolderTypes() {
        Map<String, Object> types = new HashMap<>();
        types.put("GENERAL", Map.of("name", "General", "icon", "Folder", "color", "blue"));
        types.put("HISTORICAL", Map.of("name", "Historical Records", "icon", "Archive", "color", "amber"));
        types.put("ARCHAEOLOGICAL", Map.of("name", "Archaeological", "icon", "Pickaxe", "color", "orange"));
        types.put("ARCHITECTURAL", Map.of("name", "Architectural Plans", "icon", "Building", "color", "purple"));
        types.put("CONSERVATION", Map.of("name", "Conservation", "icon", "Wrench", "color", "green"));
        types.put("RESEARCH", Map.of("name", "Research Papers", "icon", "BookOpen", "color", "indigo"));
        types.put("LEGAL", Map.of("name", "Legal Documents", "icon", "Scale", "color", "red"));
        types.put("ADMINISTRATIVE", Map.of("name", "Administrative", "icon", "Briefcase", "color", "gray"));
        types.put("MEDIA_COVERAGE", Map.of("name", "Media Coverage", "icon", "Newspaper", "color", "pink"));
        types.put("PHOTOGRAPHS", Map.of("name", "Photographs", "icon", "Camera", "color", "cyan"));
        types.put("MAPS", Map.of("name", "Maps & Surveys", "icon", "Map", "color", "emerald"));
        types.put("REPORTS", Map.of("name", "Reports", "icon", "FileText", "color", "slate"));
        return types;
    }

    /**
     * Validate folder name uniqueness in a specific parent location
     * @param folderName Name to validate
     * @param parentId Parent folder ID (null for root)
     * @param excludeFolderId Folder ID to exclude from validation (for updates)
     * @return true if name is unique, false otherwise
     */
    private boolean isFolderNameUnique(String folderName, Long parentId, Long excludeFolderId) {
        // Check if another folder with the same name exists in the same parent
        return !folderRepository.existsByNameAndParentIdAndIsActiveTrue(folderName, parentId);
    }

    /**
     * Validate folder name for creation or update
     * @param folderName Name to validate
     * @param parentId Parent folder ID (null for root)
     * @param currentFolderId Current folder ID for updates (null for creation)
     * @throws ResponseStatusException if validation fails
     */
    private void validateFolderName(String folderName, Long parentId, Long currentFolderId) {
        if (folderName == null || folderName.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Folder name is required");
        }
        
        String trimmedName = folderName.trim();
        
        // Check for duplicate name in same parent
        if (!isFolderNameUnique(trimmedName, parentId, currentFolderId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Folder name must be unique within the same parent folder.");
        }
    }
} 