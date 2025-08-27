package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.dto.CommunityReportDTO;
import com.rwandaheritage.heritageguard.service.CommunityModerationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/community-moderation")
@RequiredArgsConstructor
@Slf4j
public class CommunityModerationController {
    
    private final CommunityModerationService communityModerationService;
    
    /**
     * Report content (topic or post)
     */
    @PostMapping("/report")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER', 'COMMUNITY_MEMBER')")
    public ResponseEntity<CommunityReportDTO> reportContent(
            @Valid @RequestBody CommunityReportDTO reportDTO,
            Authentication authentication) {
        
        String reporterId = authentication.getName();
        log.info("User {} reporting content: {} {}", reporterId, reportDTO.getContentType(), reportDTO.getContentId());
        
        CommunityReportDTO createdReport = communityModerationService.reportContent(reportDTO, reporterId);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(createdReport);
    }
    
    /**
     * Get reports for specific content
     */
    @GetMapping("/reports/{contentType}/{contentId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER')")
    public ResponseEntity<List<CommunityReportDTO>> getReportsForContent(
            @PathVariable String contentType,
            @PathVariable Long contentId) {
        
        log.debug("Fetching reports for {} {}", contentType, contentId);
        
        List<CommunityReportDTO> reports = communityModerationService.getReportsForContent(contentType, contentId);
        
        return ResponseEntity.ok(reports);
    }
    
    /**
     * Get all unresolved reports (for moderators)
     */
    @GetMapping("/reports/unresolved")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER')")
    public ResponseEntity<List<CommunityReportDTO>> getUnresolvedReports() {
        
        log.debug("Fetching all unresolved reports");
        
        List<CommunityReportDTO> reports = communityModerationService.getUnresolvedReports();
        
        return ResponseEntity.ok(reports);
    }
} 