package com.rwandaheritage.heritageguard.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArtifactMediaDTO {
    private Long id;
    private Long artifactId;
    private String filePath;
    private Boolean isPublic;
    private String description;
}
