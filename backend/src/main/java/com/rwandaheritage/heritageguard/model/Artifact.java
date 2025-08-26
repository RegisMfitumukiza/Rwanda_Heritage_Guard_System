package com.rwandaheritage.heritageguard.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;
import java.util.Map;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Artifact {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ElementCollection
    @CollectionTable(name = "artifact_name", joinColumns = @JoinColumn(name = "artifact_id"))
    @MapKeyColumn(name = "lang")
    @Column(name = "name")
    private Map<String, String> name;

    @ElementCollection
    @CollectionTable(name = "artifact_description", joinColumns = @JoinColumn(name = "artifact_id"))
    @MapKeyColumn(name = "lang")
    @Column(name = "description")
    private Map<String, String> description;

    private String category;

    // Remove location field - artifacts are now linked to heritage sites
    // private String location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "heritage_site_id", nullable = false)
    private HeritageSite heritageSite;

    @OneToMany(mappedBy = "artifact", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ArtifactMedia> media;

    @OneToMany(mappedBy = "artifact", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ArtifactAuthentication> authentications;

    @OneToMany(mappedBy = "artifact", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProvenanceRecord> provenanceRecords;

    private Boolean isPublic;
}
