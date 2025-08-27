package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.dto.ProvenanceRecordDTO;
import com.rwandaheritage.heritageguard.mapper.ProvenanceRecordMapper;
import com.rwandaheritage.heritageguard.model.ProvenanceRecord;
import com.rwandaheritage.heritageguard.service.ProvenanceRecordService;
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
@RequestMapping("/api/artifacts/{artifactId}/provenance")
public class ProvenanceRecordController {
    private final ProvenanceRecordService provenanceRecordService;

    @Autowired
    public ProvenanceRecordController(ProvenanceRecordService provenanceRecordService) {
        this.provenanceRecordService = provenanceRecordService;
    }

    /**
     * Add provenance record (without file upload)
     * Only SYSTEM_ADMINISTRATOR and HERITAGE_MANAGER can add
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER')")
    public ResponseEntity<ProvenanceRecordDTO> addProvenanceRecord(
            @PathVariable Long artifactId,
            @Valid @RequestBody ProvenanceRecordDTO dto
    ) {
        ProvenanceRecord entity = ProvenanceRecordMapper.toEntity(dto);
        ProvenanceRecord created = provenanceRecordService.addProvenanceRecord(artifactId, entity);
        return new ResponseEntity<>(ProvenanceRecordMapper.toDTO(created), HttpStatus.CREATED);
    }

    /**
     * Add provenance record with document file upload
     * Only SYSTEM_ADMINISTRATOR and HERITAGE_MANAGER can add
     */
    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER')")
    public ResponseEntity<ProvenanceRecordDTO> addProvenanceRecordWithFile(
            @PathVariable Long artifactId,
            @RequestParam("history") String history,
            @RequestParam("eventDate") String eventDate,
            @RequestParam("previousOwner") String previousOwner,
            @RequestParam("newOwner") String newOwner,
            @RequestParam(value = "documentFile", required = false) MultipartFile documentFile
    ) throws IOException {
        // Create provenance entity from form data
        ProvenanceRecord entity = ProvenanceRecord.builder()
                .history(history)
                .eventDate(java.time.LocalDate.parse(eventDate))
                .previousOwner(previousOwner)
                .newOwner(newOwner)
                .build();

        ProvenanceRecord created = provenanceRecordService.addProvenanceRecord(artifactId, entity, documentFile);
        return new ResponseEntity<>(ProvenanceRecordMapper.toDTO(created), HttpStatus.CREATED);
    }

    /**
     * Download provenance document file
     * Only allowed for users with access to the provenance record
     */
    @GetMapping("/{recordId}/document")
    public ResponseEntity<Resource> downloadProvenanceDocument(
            @PathVariable Long artifactId, 
            @PathVariable Long recordId
    ) {
        Optional<ProvenanceRecord> recordOpt = provenanceRecordService.getProvenanceRecord(recordId);
        if (recordOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Provenance record not found");
        }

        ProvenanceRecord record = recordOpt.get();
        if (record.getDocumentFilePath() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No document file associated with this provenance record");
        }

        Path filePath = Paths.get(record.getDocumentFilePath());
        if (!Files.exists(filePath)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Document file not found on server");
        }

        Resource file = new FileSystemResource(filePath);
        String filename = file.getFilename();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(file);
    }

    /**
     * List all provenance records for an artifact (filtered by access)
     */
    @GetMapping
    public ResponseEntity<List<ProvenanceRecordDTO>> listProvenanceRecords(@PathVariable Long artifactId) {
        List<ProvenanceRecord> list = provenanceRecordService.listProvenanceRecords(artifactId);
        List<ProvenanceRecordDTO> dtos = list.stream().map(ProvenanceRecordMapper::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Get provenance record by ID
     */
    @GetMapping("/{recordId}")
    public ResponseEntity<ProvenanceRecordDTO> getProvenanceRecord(@PathVariable Long artifactId, @PathVariable Long recordId) {
        Optional<ProvenanceRecord> recordOpt = provenanceRecordService.getProvenanceRecord(recordId);
        if (recordOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Provenance record not found");
        }
        return ResponseEntity.ok(ProvenanceRecordMapper.toDTO(recordOpt.get()));
    }

    /**
     * Delete provenance record
     * Only SYSTEM_ADMINISTRATOR and HERITAGE_MANAGER can delete
     */
    @DeleteMapping("/{recordId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER')")
    public ResponseEntity<Void> deleteProvenanceRecord(@PathVariable Long artifactId, @PathVariable Long recordId) {
        provenanceRecordService.deleteProvenanceRecord(artifactId, recordId);
        return ResponseEntity.noContent().build();
    }
}
