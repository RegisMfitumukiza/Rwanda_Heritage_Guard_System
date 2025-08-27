package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.dto.HeritageSiteDTO;
import com.rwandaheritage.heritageguard.dto.ArtifactDTO;
import com.rwandaheritage.heritageguard.dto.SiteMediaDTO;
import com.rwandaheritage.heritageguard.dto.ArtifactMediaDTO;
import com.rwandaheritage.heritageguard.repository.HeritageSiteRepository;
import com.rwandaheritage.heritageguard.repository.ArtifactRepository;
import com.rwandaheritage.heritageguard.repository.SiteMediaRepository;
import com.rwandaheritage.heritageguard.repository.ArtifactMediaRepository;
import com.rwandaheritage.heritageguard.mapper.HeritageSiteMapper;
import com.rwandaheritage.heritageguard.mapper.ArtifactMapper;
import com.rwandaheritage.heritageguard.mapper.SiteMediaMapper;
import com.rwandaheritage.heritageguard.mapper.ArtifactMediaMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final HeritageSiteRepository heritageSiteRepository;
    private final ArtifactRepository artifactRepository;
    private final SiteMediaRepository siteMediaRepository;
    private final ArtifactMediaRepository artifactMediaRepository;

    /**
     * Generate comprehensive report based on 3 filters
     */
    @Transactional(readOnly = true)
    public Map<String, Object> generateReport(String siteStatus, String artifactAuthStatus, String mediaType) {
        log.info("Generating report with filters - Site Status: {}, Artifact Auth: {}, Media Type: {}", 
                siteStatus, artifactAuthStatus, mediaType);

        try {
            // 1. Filter Heritage Sites by Status
            List<HeritageSiteDTO> sites = heritageSiteRepository.findByStatus(siteStatus)
                    .stream()
                    .map(HeritageSiteMapper::toDTO)
                    .collect(Collectors.toList());

            // 2. Filter Artifacts by Authentication Status
            List<ArtifactDTO> artifacts = artifactRepository.findByAuthenticationStatus(artifactAuthStatus)
                    .stream()
                    .map(ArtifactMapper::toDTO)
                    .collect(Collectors.toList());

            // 3. Filter Media by Type - Note: findByMediaType methods don't exist, so we'll get all media and filter in memory
            List<SiteMediaDTO> allSiteMedia = siteMediaRepository.findAll()
                    .stream()
                    .filter(media -> mediaType == null || media.getFileType().equalsIgnoreCase(mediaType))
                    .map(SiteMediaMapper::toDTO)
                    .collect(Collectors.toList());

            // For ArtifactMedia, we'll include all since it doesn't have fileType field
            // You can add a mediaType field to ArtifactMedia model later if needed
            List<ArtifactMediaDTO> allArtifactMedia = artifactMediaRepository.findAll()
                    .stream()
                    .map(ArtifactMediaMapper::toDTO)
                    .collect(Collectors.toList());

            // Combine all media
            List<Object> allMedia = new ArrayList<>();
            allMedia.addAll(allSiteMedia);
            allMedia.addAll(allArtifactMedia);

            // Build report data
            Map<String, Object> report = new HashMap<>();
            report.put("sites", sites);
            report.put("artifacts", artifacts);
            report.put("media", allMedia);
            report.put("filters", Map.of(
                "siteStatus", siteStatus,
                "artifactAuthStatus", artifactAuthStatus,
                "mediaType", mediaType
            ));
            report.put("summary", Map.of(
                "totalSites", sites.size(),
                "totalArtifacts", artifacts.size(),
                "totalMedia", allMedia.size()
            ));

            log.info("Report generated successfully - Sites: {}, Artifacts: {}, Media: {}", 
                    sites.size(), artifacts.size(), allMedia.size());

            return report;

        } catch (Exception e) {
            log.error("Error generating report: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate report: " + e.getMessage());
        }
    }

    /**
     * Get available filter options for the frontend
     */
    public Map<String, Object> getFilterOptions() {
        Map<String, Object> options = new HashMap<>();
        
        // Site Status Options
        options.put("siteStatuses", List.of("ACTIVE", "PROPOSED", "CONSERVATION", "ARCHIVED"));
        
        // Artifact Authentication Status Options
        options.put("artifactAuthStatuses", List.of("AUTHENTICATED", "PENDING_AUTHENTICATION", "UNAUTHENTICATED", "REJECTED"));
        
        // Media Type Options
        options.put("mediaTypes", List.of("IMAGE", "DOCUMENT", "VIDEO", "AUDIO"));
        
        return options;
    }
}

