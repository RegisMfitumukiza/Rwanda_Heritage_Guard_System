package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.dto.ArtifactDTO;
import com.rwandaheritage.heritageguard.mapper.ArtifactMapper;
import com.rwandaheritage.heritageguard.model.Artifact;
import com.rwandaheritage.heritageguard.model.HeritageSite;
import com.rwandaheritage.heritageguard.service.ArtifactService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Collections;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/artifacts")
public class ArtifactController {
    private final ArtifactService artifactService;

    @Autowired
    public ArtifactController(ArtifactService artifactService) {
        this.artifactService = artifactService;
    }

    /**
     * Create a new artifact
     * Only SYSTEM_ADMINISTRATOR and HERITAGE_MANAGER can create
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER')")
    public ResponseEntity<ArtifactDTO> createArtifact(@Valid @RequestBody ArtifactDTO dto) {
        Artifact artifact = ArtifactMapper.toEntity(dto);
        // Set heritageSite if heritageSiteId is present
        if (dto.getHeritageSiteId() != null) {
            HeritageSite site = artifactService.getHeritageSiteById(dto.getHeritageSiteId());
            artifact.setHeritageSite(site);
        }
        Artifact created = artifactService.createArtifact(artifact);
        return new ResponseEntity<>(ArtifactMapper.toDTO(created), HttpStatus.CREATED);
    }

    /**
     * Get featured artifacts for landing page display
     * Public access - returns only public artifacts
     */
    @GetMapping("/featured")
    public ResponseEntity<List<ArtifactDTO>> getFeaturedArtifacts(
            @RequestParam(defaultValue = "6") int limit,
            @RequestParam(defaultValue = "true") boolean includeHeritageSite,
            @RequestParam(defaultValue = "true") boolean includeMedia,
            @RequestParam(defaultValue = "false") boolean includeAuthentications
    ) {
        try {
            List<Artifact> featured = artifactService.getFeaturedArtifacts(limit);
            List<ArtifactDTO> dtos = featured.stream()
                .map(artifact -> ArtifactMapper.toDTO(artifact, includeHeritageSite, includeMedia, includeAuthentications))
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            log.error("Error fetching featured artifacts: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.emptyList());
        }
    }

    /**
     * Get artifact by ID
     * Public if isPublic=true, else requires COMMUNITY_MEMBER or higher
     */
    @GetMapping("/{id}")
    public ResponseEntity<ArtifactDTO> getArtifact(@PathVariable Long id) {
        Optional<Artifact> artifactOpt = artifactService.getArtifact(id);
        if (artifactOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Artifact not found");
        }
        return ResponseEntity.ok(ArtifactMapper.toDTO(artifactOpt.get()));
    }

    /**
     * List all artifacts (filtered by access)
     * Public sees only public artifacts, others see all they are allowed
     */
    @GetMapping
    public ResponseEntity<List<ArtifactDTO>> listArtifacts() {
        List<Artifact> artifacts = artifactService.listArtifacts();
        List<ArtifactDTO> dtos = artifacts.stream().map(ArtifactMapper::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Update artifact
     * Only SYSTEM_ADMINISTRATOR and HERITAGE_MANAGER can update
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER')")
    public ResponseEntity<ArtifactDTO> updateArtifact(@PathVariable Long id, @Valid @RequestBody ArtifactDTO dto) {
        Artifact artifact = ArtifactMapper.toEntity(dto);
        
        // Set heritageSite if heritageSiteId is present
        if (dto.getHeritageSiteId() != null) {
            HeritageSite site = artifactService.getHeritageSiteById(dto.getHeritageSiteId());
            artifact.setHeritageSite(site);
        }
        
        Artifact updated = artifactService.updateArtifact(id, artifact);
        return ResponseEntity.ok(ArtifactMapper.toDTO(updated));
    }

    /**
     * Delete artifact
     * Only SYSTEM_ADMINISTRATOR and HERITAGE_MANAGER can delete
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER')")
    public ResponseEntity<Void> deleteArtifact(@PathVariable Long id) {
        artifactService.deleteArtifact(id);
        return ResponseEntity.noContent().build();
    }

    // Advanced search endpoints
    @GetMapping("/search")
    public ResponseEntity<List<ArtifactDTO>> searchArtifacts(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long siteId,
            @RequestParam(required = false) String authenticationStatus
    ) {
        try {
            List<Artifact> results;

            if (searchTerm != null && !searchTerm.trim().isEmpty() || category != null && !category.trim().isEmpty()) {
                results = artifactService.searchArtifacts(searchTerm, category);
            } else if (siteId != null) {
                results = artifactService.findByHeritageSite(siteId);
            } else if (authenticationStatus != null && !authenticationStatus.trim().isEmpty()) {
                results = artifactService.findByAuthenticationStatus(authenticationStatus);
            } else {
                results = artifactService.listArtifacts();
            }
            
            List<ArtifactDTO> dtos = results.stream().map(ArtifactMapper::toDTO).collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            log.error("Error searching artifacts: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.emptyList());
        }
    }

    @GetMapping("/search/name")
    public ResponseEntity<List<ArtifactDTO>> searchByName(@RequestParam String searchTerm) {
        List<Artifact> results = artifactService.searchArtifacts(searchTerm);
        List<ArtifactDTO> dtos = results.stream().map(ArtifactMapper::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Location search removed - artifacts are now linked to heritage sites
    // @GetMapping("/search/location")
    // public ResponseEntity<List<ArtifactDTO>> searchByLocation(@RequestParam String location) {
    //     List<Artifact> results = artifactService.searchByLocation(location);
    //     List<ArtifactDTO> dtos = results.stream().map(ArtifactMapper::toDTO).collect(Collectors.toList());
    //     return ResponseEntity.ok(dtos);
    // }

    @GetMapping("/filter/category/{category}")
    public ResponseEntity<List<ArtifactDTO>> filterByCategory(@PathVariable String category) {
        List<Artifact> results = artifactService.findByCategory(category);
        List<ArtifactDTO> dtos = results.stream().map(ArtifactMapper::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/filter/site/{siteId}")
    public ResponseEntity<List<ArtifactDTO>> filterByHeritageSite(@PathVariable Long siteId) {
        List<Artifact> results = artifactService.findByHeritageSite(siteId);
        List<ArtifactDTO> dtos = results.stream().map(ArtifactMapper::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/filter/authentication-status/{status}")
    public ResponseEntity<List<ArtifactDTO>> filterByAuthenticationStatus(@PathVariable String status) {
        List<Artifact> results = artifactService.findByAuthenticationStatus(status);
        List<ArtifactDTO> dtos = results.stream().map(ArtifactMapper::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Statistics endpoints
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalArtifacts", artifactService.getTotalArtifactCount());
        stats.put("publicArtifacts", artifactService.getPublicArtifactCount());
        stats.put("privateArtifacts", artifactService.getTotalArtifactCount() - artifactService.getPublicArtifactCount());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/statistics/category")
    public ResponseEntity<List<Map<String, Object>>> getStatisticsByCategory() {
        List<Object[]> results = artifactService.getArtifactCountByCategory();
        List<Map<String, Object>> stats = results.stream()
            .map(row -> {
                Map<String, Object> stat = new java.util.HashMap<>();
                stat.put("category", row[0]);
                stat.put("count", row[1]);
                return stat;
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(stats);
    }

} 
