package com.rwandaheritage.heritageguard.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArtifactAuthentication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artifact_id")
    private Artifact artifact;

    private String status; // e.g., "Authentic", "Suspected", "Fake"
    private LocalDate date;
    private String documentation; // optional notes or file path to report

    // File upload path
    private String documentFilePath; // Path to uploaded document file
}