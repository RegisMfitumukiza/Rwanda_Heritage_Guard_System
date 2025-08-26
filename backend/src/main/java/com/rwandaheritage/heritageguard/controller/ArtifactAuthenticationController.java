package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.dto.ArtifactAuthenticationDTO;
import com.rwandaheritage.heritageguard.mapper.ArtifactAuthenticationMapper;
import com.rwandaheritage.heritageguard.model.ArtifactAuthentication;
import com.rwandaheritage.heritageguard.service.ArtifactAuthenticationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/artifacts/{artifactId}/authentications")
public class ArtifactAuthenticationController {
    private final ArtifactAuthenticationService artifactAuthenticationService;

    @Autowired
    public ArtifactAuthenticationController(ArtifactAuthenticationService artifactAuthenticationService) {
        this.artifactAuthenticationService = artifactAuthenticationService;
    }

    /**
     * Add authentication record (without file upload)
     * Only SYSTEM_ADMINISTRATOR and HERITAGE_MANAGER can add
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER')")
    public ResponseEntity<ArtifactAuthenticationDTO> addAuthentication(
            @PathVariable Long artifactId,
            @Valid @RequestBody ArtifactAuthenticationDTO dto
    ) {
        ArtifactAuthentication entity = ArtifactAuthenticationMapper.toEntity(dto);
        ArtifactAuthentication created = artifactAuthenticationService.addAuthentication(artifactId, entity);
        return new ResponseEntity<>(ArtifactAuthenticationMapper.toDTO(created), HttpStatus.CREATED);
    }

    /**
     * Add authentication record with document file upload
     * Only SYSTEM_ADMINISTRATOR and HERITAGE_MANAGER can add
     */
    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER')")
    public ResponseEntity<ArtifactAuthenticationDTO> addAuthenticationWithFile(
            @PathVariable Long artifactId,
            @RequestParam("status") String status,
            @RequestParam("date") String date,
            @RequestParam(value = "documentation", required = false) String documentation,
            @RequestParam(value = "documentFile", required = false) MultipartFile documentFile
    ) throws IOException {
        // Create authentication entity from form data
        ArtifactAuthentication entity = ArtifactAuthentication.builder()
                .status(status)
                .date(java.time.LocalDate.parse(date))
                .documentation(documentation)
                .build();

        ArtifactAuthentication created = artifactAuthenticationService.addAuthentication(artifactId, entity, documentFile);
        return new ResponseEntity<>(ArtifactAuthenticationMapper.toDTO(created), HttpStatus.CREATED);
    }

    /**
     * Download authentication document file
     * Only allowed for users with access to the authentication record
     */
    @GetMapping("/{authenticationId}/document")
    public ResponseEntity<Resource> downloadAuthenticationDocument(
            @PathVariable Long artifactId, 
            @PathVariable Long authenticationId
    ) {
        Optional<ArtifactAuthentication> authOpt = artifactAuthenticationService.getAuthentication(authenticationId);
        if (authOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Authentication record not found");
        }

        ArtifactAuthentication auth = authOpt.get();
        if (auth.getDocumentFilePath() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No document file associated with this authentication");
        }

        Path filePath = Paths.get(auth.getDocumentFilePath());
        if (!Files.exists(filePath)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Document file not found on server");
        }

        Resource file = new FileSystemResource(filePath);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + file.getFilename())
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(file);
    }

    /**
     * List all authentication records for an artifact (filtered by access)
     */
    @GetMapping
    public ResponseEntity<List<ArtifactAuthenticationDTO>> listAuthentications(@PathVariable Long artifactId) {
        List<ArtifactAuthentication> list = artifactAuthenticationService.listAuthentications(artifactId);
        List<ArtifactAuthenticationDTO> dtos = list.stream().map(ArtifactAuthenticationMapper::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Get authentication record by ID
     */
    @GetMapping("/{authenticationId}")
    public ResponseEntity<ArtifactAuthenticationDTO> getAuthentication(@PathVariable Long artifactId, @PathVariable Long authenticationId) {
        Optional<ArtifactAuthentication> authOpt = artifactAuthenticationService.getAuthentication(authenticationId);
        if (authOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Authentication record not found");
        }
        return ResponseEntity.ok(ArtifactAuthenticationMapper.toDTO(authOpt.get()));
    }

    /**
     * Delete authentication record
     * Only SYSTEM_ADMINISTRATOR and HERITAGE_MANAGER can delete
     */
    @DeleteMapping("/{authenticationId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER')")
    public ResponseEntity<Void> deleteAuthentication(@PathVariable Long artifactId, @PathVariable Long authenticationId) {
        artifactAuthenticationService.deleteAuthentication(artifactId, authenticationId);
        return ResponseEntity.noContent().build();
    }
} 