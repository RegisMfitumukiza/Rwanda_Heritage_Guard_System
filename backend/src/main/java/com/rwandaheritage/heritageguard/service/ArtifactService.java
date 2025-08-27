package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.model.Artifact;
import com.rwandaheritage.heritageguard.model.HeritageSite;
import com.rwandaheritage.heritageguard.repository.ArtifactRepository;
import com.rwandaheritage.heritageguard.repository.HeritageSiteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.List;
import java.util.Optional;

@Service
public class ArtifactService {
    private final ArtifactRepository artifactRepository;
    private final HeritageSiteRepository heritageSiteRepository;

    @Autowired
    public ArtifactService(ArtifactRepository artifactRepository, HeritageSiteRepository heritageSiteRepository) {
        this.artifactRepository = artifactRepository;
        this.heritageSiteRepository = heritageSiteRepository;
    }

    // Create a new artifact
    public Artifact createArtifact(Artifact artifact) {
        enforceCanCreate();
        // Validate unique name per site
        if (artifact.getHeritageSite() != null && artifact.getName() != null) {
            List<Artifact> existing = artifactRepository.findAll();
            for (Artifact a : existing) {
                if (a.getHeritageSite() != null && a.getHeritageSite().getId().equals(artifact.getHeritageSite().getId()) &&
                    a.getName().equals(artifact.getName())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Artifact name must be unique per site");
                }
            }
        }
        // Set heritageSite if only ID is provided
        if (artifact.getHeritageSite() != null && artifact.getHeritageSite().getId() != null) {
            HeritageSite site = heritageSiteRepository.findById(artifact.getHeritageSite().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Heritage site not found"));
            artifact.setHeritageSite(site);
        }
        return artifactRepository.save(artifact);
    }

    // Get artifact by ID with RBAC
    public Optional<Artifact> getArtifact(Long id) {
        Optional<Artifact> artifactOpt = artifactRepository.findByIdWithHeritageSite(id);
        if (artifactOpt.isEmpty()) return Optional.empty();
        Artifact artifact = artifactOpt.get();
        if (!canView(artifact)) {
            throw new AccessDeniedException("You do not have permission to view this artifact.");
        }
        return Optional.of(artifact);
    }

    // List all artifacts with RBAC filtering
    public List<Artifact> listArtifacts() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        List<Artifact> all = artifactRepository.findAllWithHeritageSite();
        
        if (auth != null && auth.getAuthorities() != null) {
            boolean isSystemAdmin = auth.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_SYSTEM_ADMINISTRATOR"));
            
            if (isSystemAdmin) {
                // System Admin sees all artifacts
                return all.stream().filter(this::canView).toList();
            } else {
                // Heritage Manager sees only artifacts from their assigned sites
                // For now, filter by public artifacts or user's assigned sites
                return all.stream()
                    .filter(artifact -> artifact.getIsPublic() || canView(artifact))
                    .toList();
            }
        }
        
        // Default: only public artifacts
        return all.stream().filter(artifact -> artifact.getIsPublic()).toList();
    }

    // Update artifact
    public Artifact updateArtifact(Long id, Artifact updated) {
        Artifact artifact = artifactRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Artifact not found"));
        
        enforceCanEdit(artifact);
        
        // Update fields
        artifact.setName(updated.getName());
        artifact.setDescription(updated.getDescription());
        artifact.setCategory(updated.getCategory());
        artifact.setIsPublic(updated.getIsPublic());
        
        // Update heritageSite if changed
        if (updated.getHeritageSite() != null && updated.getHeritageSite().getId() != null) {
            HeritageSite site = heritageSiteRepository.findById(updated.getHeritageSite().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Heritage site not found"));
            artifact.setHeritageSite(site);
        }
        
        return artifactRepository.save(artifact);
    }

    // Delete artifact
    public void deleteArtifact(Long id) {
        Artifact artifact = artifactRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Artifact not found"));
        enforceCanEdit(artifact);
        artifactRepository.deleteById(id);
    }

    public HeritageSite getHeritageSiteById(Long id) {
        return heritageSiteRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Heritage site not found"));
    }

    // Advanced search methods with RBAC
    public List<Artifact> searchArtifacts(String searchTerm, String category) {
        List<Artifact> results = artifactRepository.searchArtifacts(searchTerm, category);
        return results.stream().filter(this::canView).toList();
    }
    
    public List<Artifact> searchArtifacts(String searchTerm) {
        return searchArtifacts(searchTerm, null);
    }

    public List<Artifact> findByCategory(String category) {
        List<Artifact> results = artifactRepository.findByCategory(category);
        return results.stream().filter(this::canView).toList();
    }

    public List<Artifact> findByAuthenticationStatus(String status) {
        List<Artifact> results = artifactRepository.findByAuthenticationStatus(status);
        return results.stream().filter(this::canView).toList();
    }

    // Find artifacts by heritage site with RBAC
    public List<Artifact> findByHeritageSite(Long siteId) {
        List<Artifact> results = artifactRepository.findByHeritageSiteId(siteId);
        return results.stream().filter(this::canView).toList();
    }

    // Statistics methods
    public Long getTotalArtifactCount() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getAuthorities() != null) {
            boolean isSystemAdmin = auth.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_SYSTEM_ADMINISTRATOR"));
            
            if (isSystemAdmin) {
                // System Admin sees total count of all artifacts
                return artifactRepository.countTotalArtifacts();
            }
        }
        
        // Others see only public artifacts count
        return artifactRepository.countPublicArtifacts();
    }

    public Long getPublicArtifactCount() {
        return artifactRepository.countPublicArtifacts();
    }

    public Long getPrivateArtifactCount() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getAuthorities() != null) {
            boolean isSystemAdmin = auth.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_SYSTEM_ADMINISTRATOR"));
            
            if (isSystemAdmin) {
                // System Admin sees private artifacts count
                return artifactRepository.countTotalArtifacts() - artifactRepository.countPublicArtifacts();
            }
        }
        
        // Others don't see private artifacts count
        return 0L;
    }

    // Get artifact count by category
    public List<Object[]> getArtifactCountByCategory() {
        return artifactRepository.countByCategory();
    }

    // Get authenticated artifact count
    public long getAuthenticatedArtifactCount() {
        return artifactRepository.countByAuthenticationStatus("AUTHENTICATED");
    }

    // Get featured artifacts for landing page display
    public List<Artifact> getFeaturedArtifacts(int limit) {
        List<Artifact> allPublic = artifactRepository.findByIsPublic(true);
        
        // Sort by ID (newest first, assuming higher IDs are newer) and limit results
        return allPublic.stream()
            .sorted((a1, a2) -> Long.compare(a2.getId(), a1.getId()))
            .limit(limit)
            .toList();
    }

    // Permission checking methods
    private boolean canView(Artifact artifact) {
        // Public artifacts can be viewed by anyone
        if (artifact.getIsPublic()) {
            return true;
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }

        // System Administrator can view all artifacts
        if (auth.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_SYSTEM_ADMINISTRATOR"))) {
            return true;
        }

        // Heritage Manager can view artifacts from their assigned sites
        if (auth.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_HERITAGE_MANAGER"))) {
            // TODO: Implement site assignment checking
            // For now, allow Heritage Managers to view all non-public artifacts
            return true;
        }

        // Content Manager and Community Member can view public artifacts only
        return false;
    }

    private void enforceCanCreate() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("Authentication required");
        }

        boolean canCreate = auth.getAuthorities().stream()
                .anyMatch(authority -> 
                    authority.getAuthority().equals("ROLE_SYSTEM_ADMINISTRATOR") ||
                    authority.getAuthority().equals("ROLE_HERITAGE_MANAGER")
                );

        if (!canCreate) {
            throw new AccessDeniedException("Insufficient permissions to create artifacts");
        }
    }

    private void enforceCanEdit(Artifact artifact) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("Authentication required");
        }

        boolean canEdit = auth.getAuthorities().stream()
                .anyMatch(authority -> 
                    authority.getAuthority().equals("ROLE_SYSTEM_ADMINISTRATOR") ||
                    authority.getAuthority().equals("ROLE_HERITAGE_MANAGER")
                );

        if (!canEdit) {
            throw new AccessDeniedException("Insufficient permissions to edit artifacts");
        }
    }
} 
