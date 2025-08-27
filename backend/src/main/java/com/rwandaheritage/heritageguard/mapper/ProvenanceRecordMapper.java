package com.rwandaheritage.heritageguard.mapper;

import com.rwandaheritage.heritageguard.model.ProvenanceRecord;
import com.rwandaheritage.heritageguard.dto.ProvenanceRecordDTO;

public class ProvenanceRecordMapper {
    public static ProvenanceRecordDTO toDTO(ProvenanceRecord record) {
        if (record == null) return null;
        return ProvenanceRecordDTO.builder()
                .id(record.getId())
                .artifactId(record.getArtifact() != null ? record.getArtifact().getId() : null)
                .history(record.getHistory())
                .eventDate(record.getEventDate())
                .previousOwner(record.getPreviousOwner())
                .newOwner(record.getNewOwner())
                .documentFilePath(record.getDocumentFilePath())
                .build();
    }

    public static ProvenanceRecord toEntity(ProvenanceRecordDTO dto) {
        if (dto == null) return null;
        return ProvenanceRecord.builder()
                .id(dto.getId())
                .history(dto.getHistory())
                .eventDate(dto.getEventDate())
                .previousOwner(dto.getPreviousOwner())
                .newOwner(dto.getNewOwner())
                .documentFilePath(dto.getDocumentFilePath())
                .build();
    }
}
