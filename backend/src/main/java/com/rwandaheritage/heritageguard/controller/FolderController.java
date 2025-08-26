package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.dto.FolderDTO;
import com.rwandaheritage.heritageguard.mapper.FolderMapper;
import com.rwandaheritage.heritageguard.model.Folder;
import com.rwandaheritage.heritageguard.service.FolderService;
import com.rwandaheritage.heritageguard.repository.FolderRepository;
import com.rwandaheritage.heritageguard.repository.HeritageSiteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.server.ResponseStatusException;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/folders")
public class FolderController {
    @Autowired
    private FolderService folderService;
    @Autowired
    private FolderRepository folderRepository;
    @Autowired
    private HeritageSiteRepository heritageSiteRepository;

    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR') or hasRole('HERITAGE_MANAGER') or hasRole('CONTENT_MANAGER')")
    @PostMapping
    public ResponseEntity<FolderDTO> createFolder(@Valid @RequestBody FolderDTO folderDTO) {
        try {
            Folder folder = FolderMapper.toEntity(folderDTO);
            // Set parent if parentId is provided
            if (folderDTO.getParentId() != null) {
                folder.setParent(folderRepository.findById(folderDTO.getParentId()).orElse(null));
            }
            Folder created = folderService.createFolder(folder);
            return ResponseEntity.status(HttpStatus.CREATED).body(FolderMapper.toDTO(created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Create folder for a specific heritage site
     * This endpoint ensures proper site association
     * 
     * @param siteId Heritage site ID
     * @param folderDTO Folder data
     * @return Created folder
     */
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR') or hasRole('HERITAGE_MANAGER') or hasRole('CONTENT_MANAGER')")
    @PostMapping("/site/{siteId}")
    public ResponseEntity<FolderDTO> createFolderForSite(
            @PathVariable Long siteId,
            @Valid @RequestBody FolderDTO folderDTO) {
        try {
            Folder folder = FolderMapper.toEntity(folderDTO);
            
            // Set parent if parentId is provided
            if (folderDTO.getParentId() != null) {
                folder.setParent(folderRepository.findById(folderDTO.getParentId()).orElse(null));
            }
            
            // Set the site association
            folder.setSite(heritageSiteRepository.findById(siteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Heritage site not found")));
            
            Folder created = folderService.createFolder(folder);
            return ResponseEntity.status(HttpStatus.CREATED).body(FolderMapper.toDTO(created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<FolderDTO> getFolder(@PathVariable Long id) {
        Optional<Folder> folder = folderService.getFolder(id);
        if (folder.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(folder.map(FolderMapper::toDTO).get());
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> listFolders() {
        List<FolderDTO> folders = folderService.listFolders().stream()
            .map(FolderMapper::toDTO)
            .collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("data", Map.of("items", folders));
        return ResponseEntity.ok(response);
    }

    // New search and filtering endpoints
    @GetMapping("/root")
    public ResponseEntity<List<FolderDTO>> getRootFolders() {
        List<FolderDTO> folders = folderService.getRootFolders().stream()
            .map(FolderMapper::toDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(folders);
    }

    @GetMapping("/{parentId}/children")
    public ResponseEntity<List<FolderDTO>> getChildrenByParentId(@PathVariable Long parentId) {
        List<FolderDTO> folders = folderService.getChildrenByParentId(parentId).stream()
            .map(FolderMapper::toDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(folders);
    }

    @GetMapping("/search")
    public ResponseEntity<List<FolderDTO>> searchFolders(@RequestParam(required = false) String q) {
        List<FolderDTO> folders = folderService.searchFolders(q).stream()
            .map(FolderMapper::toDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(folders);
    }

    @GetMapping("/filter")
    public ResponseEntity<List<FolderDTO>> filterFolders(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long parentId,
            @RequestParam(required = false) String createdBy) {
        List<FolderDTO> folders = folderService.filterFolders(name, parentId, createdBy).stream()
            .map(FolderMapper::toDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(folders);
    }

    @GetMapping("/creator/{createdBy}")
    public ResponseEntity<List<FolderDTO>> getFoldersByCreator(@PathVariable String createdBy) {
        List<FolderDTO> folders = folderService.getFoldersByCreator(createdBy).stream()
            .map(FolderMapper::toDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(folders);
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<FolderDTO>> getFoldersByRole(@PathVariable String role) {
        List<FolderDTO> folders = folderService.getFoldersByRole(role).stream()
            .map(FolderMapper::toDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(folders);
    }

    // Statistics endpoints
    @GetMapping("/{id}/statistics")
    public ResponseEntity<Object> getFolderStatistics(@PathVariable Long id) {
        try {
            long documentCount = folderService.getDocumentCountInFolder(id);
            long childFolderCount = folderService.getChildFolderCount(id);
            
            return ResponseEntity.ok(Map.of(
                "documentCount", documentCount,
                "childFolderCount", childFolderCount
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/statistics/hierarchy")
    public ResponseEntity<List<Object[]>> getFolderHierarchyStatistics() {
        return ResponseEntity.ok(folderService.getFolderHierarchyStatistics());
    }

    @GetMapping("/permissions")
    public ResponseEntity<List<String>> getFolderPermissions() {
        List<String> permissions = List.of("SYSTEM_ADMINISTRATOR", "HERITAGE_MANAGER", "CONTENT_MANAGER", "COMMUNITY_MEMBER", "PUBLIC");
        return ResponseEntity.ok(permissions);
    }

    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR') or hasRole('HERITAGE_MANAGER') or hasRole('CONTENT_MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<FolderDTO> updateFolder(@PathVariable Long id, @Valid @RequestBody FolderDTO folderDTO) {
        try {
            System.out.println("=== UPDATE FOLDER DEBUG ===");
            System.out.println("Folder ID: " + id);
            System.out.println("Folder DTO: " + folderDTO);
            
            Folder folder = FolderMapper.toEntity(folderDTO);
            folder.setId(id);
            
            System.out.println("Mapped Folder Entity: " + folder);
            
            // Set parent if parentId is provided
            if (folderDTO.getParentId() != null) {
                folder.setParent(folderRepository.findById(folderDTO.getParentId()).orElse(null));
            }
            
            Folder updated = folderService.updateFolder(folder);
            System.out.println("Updated Folder: " + updated);
            return ResponseEntity.ok(FolderMapper.toDTO(updated));
        } catch (Exception e) {
            System.err.println("=== UPDATE FOLDER ERROR ===");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR') or hasRole('HERITAGE_MANAGER') or hasRole('CONTENT_MANAGER')")
    @PatchMapping("/{id}/permissions")
    public ResponseEntity<FolderDTO> updateFolderPermissions(
            @PathVariable Long id, 
            @RequestBody Map<String, Object> request) {
        try {
            System.out.println("=== UPDATE FOLDER PERMISSIONS DEBUG ===");
            System.out.println("Folder ID: " + id);
            System.out.println("Request: " + request);
            
            @SuppressWarnings("unchecked")
            List<String> allowedRoles = (List<String>) request.get("allowedRoles");
            
            if (allowedRoles == null) {
                return ResponseEntity.badRequest().build();
            }
            
            Folder updated = folderService.updateFolderPermissions(id, allowedRoles);
            return ResponseEntity.ok(FolderMapper.toDTO(updated));
        } catch (Exception e) {
            System.err.println("=== UPDATE FOLDER PERMISSIONS ERROR ===");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR') or hasRole('HERITAGE_MANAGER') or hasRole('CONTENT_MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFolder(@PathVariable Long id) {
        try {
            folderService.deleteFolder(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get folder tree structure
     * Returns hierarchical folder structure for tree view components
     * 
     * @param siteId Heritage site ID filter (optional)
     * @param parentId Parent folder ID filter (optional)
     * @return Folder tree structure
     */
    @GetMapping("/tree")
    public ResponseEntity<List<Map<String, Object>>> getFolderTree(
            @RequestParam(required = false) Long siteId,
            @RequestParam(required = false) Long parentId) {
        try {
            List<Map<String, Object>> tree = folderService.getFolderTree(siteId, parentId);
            return ResponseEntity.ok(tree);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Move folder to new parent
     * Updates folder hierarchy and recalculates paths
     * 
     * @param id Folder ID to move
     * @param request Move request containing new parent ID
     * @return Updated folder
     */
    @PostMapping("/{id}/move")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR') or hasRole('HERITAGE_MANAGER') or hasRole('CONTENT_MANAGER')")
    public ResponseEntity<FolderDTO> moveFolder(
            @PathVariable Long id, 
            @RequestBody Map<String, Object> request) {
        try {
            Long newParentId = request.get("parentId") != null ? 
                Long.valueOf(request.get("parentId").toString()) : null;
            
            Folder movedFolder = folderService.moveFolder(id, newParentId);
            return ResponseEntity.ok(FolderMapper.toDTO(movedFolder));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get folders by heritage site
     * Returns all folders associated with a specific heritage site
     * 
     * @param siteId Heritage site ID
     * @return List of folders for the site
     */
    @GetMapping("/site/{siteId}")
    public ResponseEntity<Map<String, Object>> getFoldersBySite(@PathVariable Long siteId) {
        try {
            List<Folder> folders = folderService.getFoldersBySite(siteId);
            List<FolderDTO> folderDTOs = folders.stream()
                    .map(FolderMapper::toDTO)
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("data", Map.of("items", folderDTOs));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get folder path breadcrumb
     * Returns the full path hierarchy for navigation
     * 
     * @param id Folder ID
     * @return Folder path breadcrumb
     */
    @GetMapping("/{id}/path")
    public ResponseEntity<List<Map<String, Object>>> getFolderPath(@PathVariable Long id) {
        try {
            List<Map<String, Object>> path = folderService.getFolderPath(id);
            return ResponseEntity.ok(path);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get folder contents (subfolders and documents)
     * Returns combined view of folder contents for display
     * 
     * @param id Folder ID
     * @param includeDocuments Whether to include documents
     * @return Folder contents
     */
    @GetMapping("/{id}/contents")
    public ResponseEntity<Map<String, Object>> getFolderContents(
            @PathVariable Long id,
            @RequestParam(defaultValue = "true") boolean includeDocuments) {
        try {
            Map<String, Object> contents = folderService.getFolderContents(id, includeDocuments);
            return ResponseEntity.ok(contents);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get available folder types with metadata
     * Returns folder types for frontend display
     * 
     * @return Available folder types
     */
    @GetMapping("/types")
    public ResponseEntity<Map<String, Object>> getFolderTypes() {
        try {
            Map<String, Object> types = folderService.getFolderTypes();
            return ResponseEntity.ok(types);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
} 