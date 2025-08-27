package com.rwandaheritage.heritageguard.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArtifactDTO {
    private Long id;

    @NotNull
    @NotEmpty
    private Map<String, String> name;

    private Map<String, String> description;

    @NotBlank
    @Size(min = 1, max = 100)
    private String category;
    
    @NotNull
    private Long heritageSiteId;
    
    // Include heritage site details
    private HeritageSiteDTO heritageSite;
    
    // Media information - can be IDs or full objects
    private List<Long> mediaIds;
    private List<com.rwandaheritage.heritageguard.dto.ArtifactMediaDTO> media;
    
    // Authentication information - can be IDs or full objects
    private List<Long> authenticationIds;
    private List<com.rwandaheritage.heritageguard.dto.ArtifactAuthenticationDTO> authentications;
    
    // Provenance records
    private List<Long> provenanceRecordIds;
    
    // Public visibility
    private Boolean isPublic;
}
