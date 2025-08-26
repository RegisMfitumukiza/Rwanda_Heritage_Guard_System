package com.rwandaheritage.heritageguard.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProvenanceRecordDTO {
    private Long id;
    private Long artifactId;

    @NotBlank
    @Size(min = 1, max = 2000)
    private String history;

    @NotNull
    private LocalDate eventDate;

    @NotBlank
    private String previousOwner;

    @NotBlank
    private String newOwner;

    private String documentFilePath;
}
