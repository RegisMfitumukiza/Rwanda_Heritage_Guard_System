package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.dto.*;
import com.rwandaheritage.heritageguard.service.ModerationService;
import com.rwandaheritage.heritageguard.service.ContentFilterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/moderation")
@RequiredArgsConstructor
@Slf4j
public class ModerationController {

    private final ModerationService moderationService;
    private final ContentFilterService contentFilterService;

    /**
     * Perform bulk moderation actions
     */
    @PostMapping("/bulk")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER')")
    public ResponseEntity<BulkModerationResponse> performBulkModeration(
            @Valid @RequestBody BulkModerationRequest request,
            Authentication authentication) {
        log.info("Bulk moderation request received: {} items of type {}", 
                request.getContentIds().size(), request.getContentType());
        
        String moderatorId = authentication.getName();
        BulkModerationResponse response = moderationService.performBulkModeration(request, moderatorId);
        
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    /**
     * Get moderation history
     */
    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER')")
    public ResponseEntity<List<ModerationHistoryDTO>> getModerationHistory(
            @RequestParam(required = false) String moderatorId,
            @RequestParam(required = false) String contentType,
            @RequestParam(required = false) String actionType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        log.debug("Fetching moderation history with filters - moderatorId: {}, contentType: {}, actionType: {}", 
                moderatorId, contentType, actionType);
        
        List<ModerationHistoryDTO> history = moderationService.getModerationHistory(
                moderatorId, contentType, actionType, startDate, endDate);
        
        return ResponseEntity.ok(history);
    }

    /**
     * Get moderation statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER')")
    public ResponseEntity<Map<String, Object>> getModerationStatistics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime since) {
        
        if (since == null) {
            since = LocalDateTime.now().minusDays(30); // Default to last 30 days
        }
        
        log.debug("Fetching moderation statistics since: {}", since);
        
        Map<String, Object> statistics = moderationService.getModerationStatistics(since);
        return ResponseEntity.ok(statistics);
    }

    /**
     * Get bulk action details
     */
    @GetMapping("/bulk/{bulkActionId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER')")
    public ResponseEntity<List<ModerationHistoryDTO>> getBulkActionDetails(@PathVariable String bulkActionId) {
        log.debug("Fetching bulk action details for: {}", bulkActionId);
        
        List<ModerationHistoryDTO> details = moderationService.getBulkActionDetails(bulkActionId);
        return ResponseEntity.ok(details);
    }

    /**
     * Analyze content for moderation
     */
    @PostMapping("/analyze")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER')")
    public ResponseEntity<ContentFilterService.ModerationRecommendation> analyzeContent(
            @RequestBody Map<String, String> request) {
        
        String content = request.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        log.debug("Analyzing content for moderation: {} characters", content.length());
        
        ContentFilterService.ModerationRecommendation recommendation = 
                moderationService.analyzeContentForModeration(content);
        
        return ResponseEntity.ok(recommendation);
    }

    /**
     * Get content analysis result
     */
    @PostMapping("/analyze/detailed")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER')")
    public ResponseEntity<ContentFilterService.ContentAnalysisResult> getDetailedAnalysis(
            @RequestBody Map<String, String> request) {
        
        String content = request.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        log.debug("Performing detailed content analysis: {} characters", content.length());
        
        ContentFilterService.ContentAnalysisResult analysis = contentFilterService.analyzeContent(content);
        
        return ResponseEntity.ok(analysis);
    }

    /**
     * Get moderation history for specific content
     */
    @GetMapping("/history/content/{contentType}/{contentId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER')")
    public ResponseEntity<List<ModerationHistoryDTO>> getContentModerationHistory(
            @PathVariable String contentType,
            @PathVariable Long contentId) {
        
        log.debug("Fetching moderation history for content: {} {}", contentType, contentId);
        
        List<ModerationHistoryDTO> history = moderationService.getModerationHistory(
                null, contentType, null, null, null);
        
        // Filter for specific content ID
        List<ModerationHistoryDTO> filteredHistory = history.stream()
                .filter(h -> h.getContentId().equals(contentId))
                .toList();
        
        return ResponseEntity.ok(filteredHistory);
    }

    /**
     * Get automated moderation actions
     */
    @GetMapping("/automated")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER')")
    public ResponseEntity<List<ModerationHistoryDTO>> getAutomatedActions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.debug("Fetching automated moderation actions - page: {}, size: {}", page, size);
        
        // This would need to be implemented in the service with pagination
        List<ModerationHistoryDTO> automatedActions = moderationService.getModerationHistory(
                null, null, null, null, null);
        
        // Filter for automated actions
        List<ModerationHistoryDTO> filteredActions = automatedActions.stream()
                .filter(ModerationHistoryDTO::isAutomated)
                .toList();
        
        return ResponseEntity.ok(filteredActions);
    }
}