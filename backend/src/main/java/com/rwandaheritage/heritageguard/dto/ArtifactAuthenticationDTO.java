package com.rwandaheritage.heritageguard.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArtifactAuthenticationDTO {
    private Long id;
    private Long artifactId;
    @NotBlank
    @Pattern(regexp = "^(Authentic|Suspected|Fake|Pending|Inconclusive)$", message = "Status must be one of: Authentic, Suspected, Fake, Pending, Inconclusive")
    private String status;
    
    @NotNull
    @PastOrPresent
    private LocalDate date;

    private String documentation;

    // File upload path
    private String documentFilePath;
}