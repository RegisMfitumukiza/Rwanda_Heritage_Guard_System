package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.dto.*;
import com.rwandaheritage.heritageguard.mapper.ModerationHistoryMapper;
import com.rwandaheritage.heritageguard.model.*;
import com.rwandaheritage.heritageguard.repository.*;
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
public class ModerationService {
    
    private final ModerationHistoryRepository moderationHistoryRepository;
    private final ForumTopicRepository topicRepository;
    private final ForumPostRepository postRepository;
    private final ContentFilterService contentFilterService;
    private final NotificationService notificationService;
    
    /**
     * Perform bulk moderation actions
     */
    public BulkModerationResponse performBulkModeration(BulkModerationRequest request, String moderatorId) {
        log.info("Performing bulk moderation: {} on {} items of type {}", 
                request.getActionType(), request.getContentIds().size(), request.getContentType());
        
        String bulkActionId = generateBulkActionId();
        List<Long> successfulIds = new ArrayList<>();
        Map<Long, String> failedIdsWithReasons = new HashMap<>();
        
        for (Long contentId : request.getContentIds()) {
            try {
                performSingleModerationAction(
                    request.getContentType(),
                    contentId,
                    request.getActionType(),
                    request.getReason(),
                    moderatorId,
                    request.isAutomated(),
                    request.getConfidenceScore(),
                    bulkActionId
                );
                successfulIds.add(contentId);
            } catch (Exception e) {
                log.warn("Failed to moderate content {}: {}", contentId, e.getMessage());
                failedIdsWithReasons.put(contentId, e.getMessage());
            }
        }
        
        // Create bulk action history record
        createModerationHistoryRecord(
            moderatorId,
            request.getContentType(),
            null, // No specific content ID for bulk action
            "BULK_ACTION",
            request.getReason(),
            null,
            null,
            request.isAutomated(),
            request.getConfidenceScore(),
            bulkActionId,
            successfulIds.size()
        );
        
        BulkModerationResponse response = BulkModerationResponse.builder()
                .bulkActionId(bulkActionId)
                .actionType(request.getActionType())
                .contentType(request.getContentType())
                .totalRequested(request.getContentIds().size())
                .successfulActions(successfulIds.size())
                .failedActions(failedIdsWithReasons.size())
                .successfulIds(successfulIds)
                .failedIdsWithReasons(failedIdsWithReasons)
                .reason(request.getReason())
                .automated(request.isAutomated())
                .confidenceScore(request.getConfidenceScore())
                .completedAt(LocalDateTime.now())
                .moderatorId(moderatorId)
                .build();
        
        log.info("Bulk moderation completed: {} successful, {} failed", 
                successfulIds.size(), failedIdsWithReasons.size());
        
        return response;
    }
    
    /**
     * Perform single moderation action
     */
    private void performSingleModerationAction(String contentType, Long contentId, String actionType, 
                                             String reason, String moderatorId, boolean automated, 
                                             Double confidenceScore, String bulkActionId) {
        
        String previousStatus = null;
        String newStatus = null;
        
        switch (contentType) {
            case "TOPIC":
                ForumTopic topic = topicRepository.findById(contentId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));
                
                previousStatus = getTopicStatus(topic);
                
                switch (actionType) {
                    case "APPROVE":
                        topic.setIsActive(true);
                        topic.setIsPublic(true);
                        newStatus = "ACTIVE";
                        break;
                    case "REJECT":
                    case "DELETE":
                        topic.setIsActive(false);
                        newStatus = "DELETED";
                        break;
                    case "LOCK":
                        topic.setIsLocked(true);
                        newStatus = "LOCKED";
                        break;
                    case "PIN":
                        topic.setIsPinned(true);
                        newStatus = "PINNED";
                        break;
                    case "FLAG":
                        // Topics don't have a flag field, so we'll just log it
                        newStatus = "FLAGGED";
                        break;
                }
                
                topic.setUpdatedBy(moderatorId);
                topicRepository.save(topic);
                break;
                
            case "POST":
                ForumPost post = postRepository.findById(contentId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
                
                previousStatus = getPostStatus(post);
                
                switch (actionType) {
                    case "APPROVE":
                        post.setIsActive(true);
                        post.setIsFlagged(false);
                        newStatus = "ACTIVE";
                        break;
                    case "REJECT":
                    case "DELETE":
                        post.setIsActive(false);
                        newStatus = "DELETED";
                        break;
                    case "FLAG":
                        post.setIsFlagged(true);
                        post.setFlaggedBy(moderatorId);
                        post.setFlagReason(reason);
                        newStatus = "FLAGGED";
                        break;
                }
                
                post.setUpdatedBy(moderatorId);
                postRepository.save(post);
                break;
        }
        
        // Create moderation history record
        createModerationHistoryRecord(
            moderatorId,
            contentType,
            contentId,
            actionType,
            reason,
            previousStatus,
            newStatus,
            automated,
            confidenceScore,
            bulkActionId,
            null
        );
        
        // Send notification to content creator
        sendModerationNotification(contentType, contentId, actionType, reason);
    }
    
    /**
     * Get topic status string
     */
    private String getTopicStatus(ForumTopic topic) {
        if (!topic.getIsActive()) return "DELETED";
        if (topic.getIsLocked()) return "LOCKED";
        if (topic.getIsPinned()) return "PINNED";
        return "ACTIVE";
    }
    
    /**
     * Get post status string
     */
    private String getPostStatus(ForumPost post) {
        if (!post.getIsActive()) return "DELETED";
        if (post.getIsFlagged()) return "FLAGGED";
        return "ACTIVE";
    }
    
    /**
     * Create moderation history record
     */
    private void createModerationHistoryRecord(String moderatorId, String contentType, Long contentId,
                                             String actionType, String reason, String previousStatus,
                                             String newStatus, boolean automated, Double confidenceScore,
                                             String bulkActionId, Integer affectedCount) {
        
        ModerationHistory history = ModerationHistory.builder()
                .moderatorId(moderatorId)
                .contentType(contentType)
                .contentId(contentId != null ? contentId : 0L)
                .actionType(actionType)
                .actionReason(reason)
                .previousStatus(previousStatus)
                .newStatus(newStatus)
                .automated(automated)
                .confidenceScore(confidenceScore)
                .bulkActionId(bulkActionId)
                .affectedCount(affectedCount)
                .createdBy(moderatorId)
                .build();
        
        moderationHistoryRepository.save(history);
    }
    
    /**
     * Send moderation notification
     */
    private void sendModerationNotification(String contentType, Long contentId, String actionType, String reason) {
        try {
            String contentCreator = null;
            String contentTitle = null;
            
            if ("TOPIC".equals(contentType)) {
                ForumTopic topic = topicRepository.findById(contentId).orElse(null);
                if (topic != null) {
                    contentCreator = topic.getCreatedBy();
                    contentTitle = topic.getTitle();
                }
            } else if ("POST".equals(contentType)) {
                ForumPost post = postRepository.findById(contentId).orElse(null);
                if (post != null) {
                    contentCreator = post.getCreatedBy();
                    contentTitle = post.getContent().substring(0, Math.min(50, post.getContent().length())) + "...";
                }
            }
            
            if (contentCreator != null) {
                notificationService.createNotification(
                    contentCreator,
                    "moderation",
                    String.format("Your %s has been %s: %s", contentType.toLowerCase(), actionType.toLowerCase(), reason),
                    "/forums/" + contentType.toLowerCase() + "s/" + contentId,
                    "system"
                );
            }
        } catch (Exception e) {
            log.warn("Failed to send moderation notification: {}", e.getMessage());
        }
    }
    
    /**
     * Get moderation history
     */
    @Transactional(readOnly = true)
    public List<ModerationHistoryDTO> getModerationHistory(String moderatorId, String contentType, 
                                                          String actionType, LocalDateTime startDate, 
                                                          LocalDateTime endDate) {
        log.debug("Fetching moderation history for moderator: {}", moderatorId);
        
        List<ModerationHistory> history;
        
        if (moderatorId != null && startDate != null && endDate != null) {
            history = moderationHistoryRepository.findByModeratorAndDateRange(moderatorId, startDate, endDate);
        } else if (moderatorId != null) {
            history = moderationHistoryRepository.findByModeratorIdOrderByCreatedDateDesc(moderatorId, null).getContent();
        } else if (contentType != null) {
            history = moderationHistoryRepository.findByContentTypeAndContentIdOrderByCreatedDateDesc(contentType, 0L);
        } else if (actionType != null) {
            history = moderationHistoryRepository.findByActionTypeOrderByCreatedDateDesc(actionType, null).getContent();
        } else {
            history = moderationHistoryRepository.findAll();
        }
        
        return history.stream()
                .map(ModerationHistoryMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Get moderation statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getModerationStatistics(LocalDateTime since) {
        log.debug("Fetching moderation statistics since: {}", since);
        
        Map<String, Object> statistics = new HashMap<>();
        
        // Count actions by type
        List<Object[]> actionCounts = moderationHistoryRepository.countActionsByTypeSince(since);
        Map<String, Long> actionTypeCounts = new HashMap<>();
        for (Object[] result : actionCounts) {
            actionTypeCounts.put((String) result[0], (Long) result[1]);
        }
        statistics.put("actionTypeCounts", actionTypeCounts);
        
        // Count automated vs manual actions
        List<Object[]> automatedCounts = moderationHistoryRepository.countAutomatedVsManualSince(since);
        Map<String, Long> automatedCountsMap = new HashMap<>();
        for (Object[] result : automatedCounts) {
            automatedCountsMap.put((Boolean) result[0] ? "automated" : "manual", (Long) result[1]);
        }
        statistics.put("automatedVsManual", automatedCountsMap);
        
        return statistics;
    }
    
    /**
     * Get bulk action details
     */
    @Transactional(readOnly = true)
    public List<ModerationHistoryDTO> getBulkActionDetails(String bulkActionId) {
        log.debug("Fetching bulk action details for: {}", bulkActionId);
        
        List<ModerationHistory> history = moderationHistoryRepository.findByBulkActionIdOrderByCreatedDateDesc(bulkActionId);
        
        return history.stream()
                .map(ModerationHistoryMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Analyze content and get moderation recommendation
     */
    public ContentFilterService.ModerationRecommendation analyzeContentForModeration(String content) {
        return contentFilterService.getModerationRecommendation(content);
    }
    
    /**
     * Generate unique bulk action ID
     */
    private String generateBulkActionId() {
        return "BULK_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8);
    }
}