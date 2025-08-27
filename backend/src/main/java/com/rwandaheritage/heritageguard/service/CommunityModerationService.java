package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.dto.CommunityReportDTO;
import com.rwandaheritage.heritageguard.dto.ReportSummaryDTO;
import com.rwandaheritage.heritageguard.mapper.CommunityReportMapper;
import com.rwandaheritage.heritageguard.model.CommunityReport;
import com.rwandaheritage.heritageguard.model.ForumPost;
import com.rwandaheritage.heritageguard.model.ForumTopic;
import com.rwandaheritage.heritageguard.repository.CommunityReportRepository;
import com.rwandaheritage.heritageguard.repository.ForumPostRepository;
import com.rwandaheritage.heritageguard.repository.ForumTopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CommunityModerationService {
    
    private final CommunityReportRepository reportRepository;
    private final ForumPostRepository postRepository;
    private final ForumTopicRepository topicRepository;
    private final NotificationService notificationService;
    
    // Thresholds for automated actions
    private static final int REPORT_THRESHOLD_FLAG = 3;
    private static final int REPORT_THRESHOLD_DELETE = 10;
    
    /**
     * Report content (topic or post)
     */
    public CommunityReportDTO reportContent(CommunityReportDTO reportDTO, String reporterId) {
        log.info("Community report received: {} {} by {}", 
                reportDTO.getContentType(), reportDTO.getContentId(), reporterId);
        
        // Check if user has already reported this content
        if (reportRepository.existsByReporterIdAndContentTypeAndContentId(
                reporterId, 
                CommunityReport.ContentType.valueOf(reportDTO.getContentType()), 
                reportDTO.getContentId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "You have already reported this content");
        }
        
        // Validate content exists
        validateContentExists(reportDTO.getContentType(), reportDTO.getContentId());
        
        // Create report
        CommunityReport report = CommunityReport.builder()
                .contentType(CommunityReport.ContentType.valueOf(reportDTO.getContentType()))
                .contentId(reportDTO.getContentId())
                .reporterId(reporterId)
                .reportReason(CommunityReport.ReportReason.valueOf(reportDTO.getReportReason()))
                .description(reportDTO.getDescription())
                .createdBy(reporterId)
                .updatedBy(reporterId)
                .build();
        
        CommunityReport savedReport = reportRepository.save(report);
        log.info("Created community report with ID: {}", savedReport.getId());
        
        // Check if automated action is needed
        processAutomatedActions(reportDTO.getContentType(), reportDTO.getContentId());
        
        return CommunityReportMapper.toDTO(savedReport);
    }
    
    /**
     * Get reports for specific content
     */
    @Transactional(readOnly = true)
    public List<CommunityReportDTO> getReportsForContent(String contentType, Long contentId) {
        log.debug("Fetching reports for {} {}", contentType, contentId);
        
        List<CommunityReport> reports = reportRepository.findByContentTypeAndContentIdOrderByReportedAtDesc(
                CommunityReport.ContentType.valueOf(contentType), contentId);
        
        return reports.stream()
                .map(CommunityReportMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all unresolved reports (for moderators)
     */
    @Transactional(readOnly = true)
    public List<CommunityReportDTO> getUnresolvedReports() {
        log.debug("Fetching all unresolved reports");
        
        List<CommunityReport> reports = reportRepository.findByIsResolvedFalseOrderByReportedAtDesc();
        
        return reports.stream()
                .map(CommunityReportMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Process automated actions based on report thresholds
     */
    private void processAutomatedActions(String contentType, Long contentId) {
        CommunityReport.ContentType type = CommunityReport.ContentType.valueOf(contentType);
        long reportCount = reportRepository.countByContentTypeAndContentIdAndIsResolvedFalse(type, contentId);
        
        log.debug("Processing automated actions for {} {} - report count: {}", 
                contentType, contentId, reportCount);
        
        if (reportCount >= REPORT_THRESHOLD_DELETE) {
            autoDeleteContent(type, contentId, "Community reports exceeded deletion threshold");
        } else if (reportCount >= REPORT_THRESHOLD_FLAG) {
            autoFlagContent(type, contentId, "Multiple community reports");
        }
    }
    
    /**
     * Automatically delete content based on community reports
     */
    private void autoDeleteContent(CommunityReport.ContentType contentType, Long contentId, String reason) {
        log.info("[COMMUNITY-MODERATION] Auto-deleting {} {} due to community reports", contentType, contentId);
        
        if (contentType == CommunityReport.ContentType.POST) {
            ForumPost post = postRepository.findById(contentId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
            
            post.setIsActive(false);
            post.setUpdatedBy("SYSTEM");
            postRepository.save(post);
            
            // Resolve all reports for this content
            List<CommunityReport> reports = reportRepository.findByContentTypeAndContentIdAndIsResolvedFalse(
                    contentType, contentId);
            
            for (CommunityReport report : reports) {
                report.setResolved(true);
                report.setResolvedBy("SYSTEM");
                report.setResolutionAction("AUTO_DELETE");
                report.setResolutionNotes("Content automatically deleted due to multiple community reports");
                report.setResolvedAt(LocalDateTime.now());
                report.setUpdatedBy("SYSTEM");
                reportRepository.save(report);
            }
            
            // Notify post creator
            notificationService.createNotification(
                    post.getCreatedBy(),
                    "content_deleted",
                    "Your post was automatically removed due to community reports: " + reason,
                    "/forums/topics/" + post.getTopic().getId(),
                    "SYSTEM"
            );
        }
    }
    
    /**
     * Automatically flag content based on community reports
     */
    private void autoFlagContent(CommunityReport.ContentType contentType, Long contentId, String reason) {
        log.info("[COMMUNITY-MODERATION] Auto-flagging {} {} due to community reports", contentType, contentId);
        
        if (contentType == CommunityReport.ContentType.POST) {
            ForumPost post = postRepository.findById(contentId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
            
            post.setIsFlagged(true);
            post.setFlaggedBy("SYSTEM");
            post.setFlagReason(reason);
            post.setUpdatedBy("SYSTEM");
            postRepository.save(post);
            
            // Resolve all reports for this content
            List<CommunityReport> reports = reportRepository.findByContentTypeAndContentIdAndIsResolvedFalse(
                    contentType, contentId);
            
            for (CommunityReport report : reports) {
                report.setResolved(true);
                report.setResolvedBy("SYSTEM");
                report.setResolutionAction("AUTO_FLAG");
                report.setResolutionNotes("Content automatically flagged due to multiple community reports");
                report.setResolvedAt(LocalDateTime.now());
                report.setUpdatedBy("SYSTEM");
                reportRepository.save(report);
            }
            
            // Notify post creator
            notificationService.createNotification(
                    post.getCreatedBy(),
                    "content_flagged",
                    "Your post was automatically flagged due to community reports: " + reason,
                    "/forums/topics/" + post.getTopic().getId(),
                    "SYSTEM"
            );
        }
    }
    
    /**
     * Validate that content exists
     */
    private void validateContentExists(String contentType, Long contentId) {
        if ("POST".equals(contentType)) {
            if (!postRepository.existsById(contentId)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
            }
        } else if ("TOPIC".equals(contentType)) {
            if (!topicRepository.existsById(contentId)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found");
            }
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid content type");
        }
    }
} 