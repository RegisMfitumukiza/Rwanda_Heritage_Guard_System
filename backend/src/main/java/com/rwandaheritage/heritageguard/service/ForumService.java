package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.dto.ForumTopicDTO;
import com.rwandaheritage.heritageguard.dto.ForumPostDTO;
import com.rwandaheritage.heritageguard.dto.ForumPostUpdateDTO;
import com.rwandaheritage.heritageguard.dto.ForumSearchRequest;
import com.rwandaheritage.heritageguard.dto.ForumSearchResponse;
import com.rwandaheritage.heritageguard.dto.ForumPostVersionDTO;
import com.rwandaheritage.heritageguard.mapper.ForumTopicMapper;
import com.rwandaheritage.heritageguard.mapper.ForumPostMapper;
import com.rwandaheritage.heritageguard.mapper.ForumPostVersionMapper;
import com.rwandaheritage.heritageguard.model.ForumTopic;
import com.rwandaheritage.heritageguard.model.ForumPost;
import com.rwandaheritage.heritageguard.model.ForumPostVersion;
import com.rwandaheritage.heritageguard.model.ForumCategory;
import com.rwandaheritage.heritageguard.model.ForumLike;
import com.rwandaheritage.heritageguard.model.ForumLike.LikeType;
import com.rwandaheritage.heritageguard.repository.ForumTopicRepository;
import com.rwandaheritage.heritageguard.repository.ForumPostRepository;
import com.rwandaheritage.heritageguard.repository.ForumCategoryRepository;
import com.rwandaheritage.heritageguard.repository.ForumLikeRepository;
import com.rwandaheritage.heritageguard.repository.ForumPostVersionRepository;
import com.rwandaheritage.heritageguard.service.MultilingualIntegrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ForumService {
    
    private final ForumTopicRepository topicRepository;
    private final ForumPostRepository postRepository;
    private final ForumCategoryRepository categoryRepository;
    private final NotificationService notificationService;
    private final ForumLikeRepository forumLikeRepository;
    private final ForumPostVersionRepository versionRepository;
    private final ContentFilterService contentFilterService;
    private final MultilingualIntegrationService multilingualService;
    private final ForumTranslationService forumTranslationService;
    private final UserLanguagePreferenceService userLanguagePreferenceService;
    
    // ==================== TOPIC OPERATIONS ====================
    
    /**
     * Create a new forum topic
     */
    public ForumTopicDTO createTopic(ForumTopicDTO topicDTO, String currentUser) {
        log.info("Creating new forum topic: {}", topicDTO.getTitle());
        
        // Validate category exists
        ForumCategory category = categoryRepository.findById(topicDTO.getCategoryId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
        
        ForumTopic topic = ForumTopicMapper.toEntity(topicDTO);
        topic.setCategory(category);
        topic.setCreatedBy(currentUser);
        topic.setUpdatedBy(currentUser);
        
        ForumTopic savedTopic = topicRepository.save(topic);
        log.info("Created forum topic with ID: {}", savedTopic.getId());
        
        return ForumTopicMapper.toDTO(savedTopic);
    }
    
    /**
     * Get topic by ID with access control
     */
    @Transactional(readOnly = true)
    public ForumTopicDTO getTopicById(Long id, boolean isAuthenticated) {
        return getTopicById(id, isAuthenticated, null);
    }
    
    /**
     * Get topic by ID with access control and language support
     */
    @Transactional(readOnly = true)
    public ForumTopicDTO getTopicById(Long id, boolean isAuthenticated, String language) {
        log.debug("Fetching topic by ID: {} with language: {}", id, language);
        
        Optional<ForumTopic> topicOpt = topicRepository.findById(id);
        if (topicOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found");
        }
        
        ForumTopic topic = topicOpt.get();
        
        // Check access control
        if (!topic.getIsActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found");
        }
        
        if (!topic.getIsPublic() && !isAuthenticated) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        
        ForumTopicDTO dto = ForumTopicMapper.toDTO(topic);
        
        // Apply translations if available and language is specified
        if (language != null && topic.getId() != null) {
            // Try to get translated title
            String translatedTitle = multilingualService.getTranslatedText("FORUM_TOPIC", topic.getId(), "title", language);
            if (translatedTitle != null) {
                dto.setTitle(translatedTitle);
            }
            
            // Try to get translated content
            String translatedContent = multilingualService.getTranslatedText("FORUM_TOPIC", topic.getId(), "content", language);
            if (translatedContent != null) {
                dto.setContent(translatedContent);
            }
        }
        
        return dto;
    }
    
    /**
     * Get all topics with filtering
     */
    @Transactional(readOnly = true)
    public List<ForumTopicDTO> getAllTopics(Long categoryId, String language, boolean isAuthenticated) {
        return getAllTopics(categoryId, language, isAuthenticated, null);
    }
    
    /**
     * Get all topics with filtering and translation support
     */
    @Transactional(readOnly = true)
    public List<ForumTopicDTO> getAllTopics(Long categoryId, String language, boolean isAuthenticated, String translationLanguage) {
        log.debug("Fetching topics with filters - categoryId: {}, language: {}, isAuthenticated: {}, translationLanguage: {}", 
                 categoryId, language, isAuthenticated, translationLanguage);
        
        List<ForumTopic> topics;
        
        if (categoryId != null) {
            if (isAuthenticated) {
                topics = topicRepository.findByCategoryIdAndIsActiveTrue(categoryId);
            } else {
                topics = topicRepository.findByCategoryIdAndIsPublicTrueAndIsActiveTrue(categoryId);
            }
        } else if (language != null) {
            if (isAuthenticated) {
                topics = topicRepository.findByLanguageAndIsActiveTrue(language);
            } else {
                topics = topicRepository.findByLanguageAndIsPublicTrueAndIsActiveTrue(language);
            }
        } else {
            if (isAuthenticated) {
                topics = topicRepository.findByIsActiveTrue();
            } else {
                topics = topicRepository.findByIsPublicTrueAndIsActiveTrue();
            }
        }
        
        return topics.stream()
                .map(topic -> {
                    ForumTopicDTO dto = ForumTopicMapper.toDTO(topic);
                    
                    // Apply translations if available and translation language is specified
                    if (translationLanguage != null && topic.getId() != null) {
                        // Try to get translated title
                        String translatedTitle = multilingualService.getTranslatedText("FORUM_TOPIC", topic.getId(), "title", translationLanguage);
                        if (translatedTitle != null) {
                            dto.setTitle(translatedTitle);
                        }
                        
                        // Try to get translated content
                        String translatedContent = multilingualService.getTranslatedText("FORUM_TOPIC", topic.getId(), "content", translationLanguage);
                        if (translatedContent != null) {
                            dto.setContent(translatedContent);
                        }
                    }
                    
                    return dto;
                })
                .collect(Collectors.toList());
    }
    
    /**
     * Search topics
     */
    @Transactional(readOnly = true)
    public List<ForumTopicDTO> searchTopics(String searchTerm, boolean isAuthenticated) {
        log.debug("Searching topics with term: {}", searchTerm);
        
        List<ForumTopic> topics = topicRepository.searchByTitleOrContentContainingIgnoreCase(searchTerm);
        
        // Apply access control
        if (!isAuthenticated) {
            List<ForumTopic> publicTopics = topics.stream()
                    .filter(topic -> topic.getIsPublic())
                    .collect(Collectors.toList());
            topics = publicTopics;
        }
        
        return topics.stream()
                .map(ForumTopicMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Update topic with role-based permissions
     */
    public ForumTopicDTO updateTopic(Long id, ForumTopicDTO topicDTO, String currentUser, String currentUserRole) {
        log.info("Updating topic with ID: {} by user: {} with role: {}", id, currentUser, currentUserRole);
        
        ForumTopic existingTopic = topicRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));
        
        // Check if user can update (creator, SYSTEM_ADMINISTRATOR, HERITAGE_MANAGER, or CONTENT_MANAGER)
        if (!existingTopic.getCreatedBy().equals(currentUser) && 
            !"ROLE_SYSTEM_ADMINISTRATOR".equals(currentUserRole) &&
            !"ROLE_HERITAGE_MANAGER".equals(currentUserRole) &&
            !"ROLE_CONTENT_MANAGER".equals(currentUserRole)) {
            throw new SecurityException("Access denied: Only the creator, system administrator, heritage manager, or content manager can update this topic");
        }
        
        // Update fields
        existingTopic.setTitle(topicDTO.getTitle());
        existingTopic.setContent(topicDTO.getContent());
        existingTopic.setLanguage(topicDTO.getLanguage());
        existingTopic.setIsPublic(topicDTO.getIsPublic());
        existingTopic.setUpdatedBy(currentUser);
        
        ForumTopic updatedTopic = topicRepository.save(existingTopic);
        log.info("Updated topic with ID: {} by user: {}", updatedTopic.getId(), currentUser);
        
        return ForumTopicMapper.toDTO(updatedTopic);
    }
    
    /**
     * Delete topic (soft delete) with role-based permissions
     */
    public void deleteTopic(Long id, String currentUser, String currentUserRole) {
        log.info("Deleting topic with ID: {} by user: {} with role: {}", id, currentUser, currentUserRole);
        
        ForumTopic topic = topicRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));
        
        // Check if user can delete (creator, SYSTEM_ADMINISTRATOR, HERITAGE_MANAGER, or CONTENT_MANAGER)
        if (!topic.getCreatedBy().equals(currentUser) && 
            !"ROLE_SYSTEM_ADMINISTRATOR".equals(currentUserRole) &&
            !"ROLE_HERITAGE_MANAGER".equals(currentUserRole) &&
            !"ROLE_CONTENT_MANAGER".equals(currentUserRole)) {
            throw new SecurityException("Access denied: Only the creator, system administrator, heritage manager, or content manager can delete this topic");
        }
        
        topic.setIsActive(false);
        topic.setUpdatedBy(currentUser);
        topicRepository.save(topic);
        
        log.info("Deleted topic with ID: {} by user: {}", id, currentUser);
    }
    
    // ==================== POST OPERATIONS ====================
    
    /**
     * Create a new forum post
     */
    public ForumPostDTO createPost(ForumPostDTO postDTO, String currentUser) {
        log.info("Creating new forum post for topic: {}", postDTO.getTopicId());
        
        // Validate topic exists and is not locked
        ForumTopic topic = topicRepository.findById(postDTO.getTopicId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));
        
        if (!topic.getIsActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found");
        }
        
        if (topic.getIsLocked()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Topic is locked");
        }
        
        // Validate parent post if it's a reply
        if (postDTO.getParentPostId() != null) {
            Optional<ForumPost> parentPost = postRepository.findById(postDTO.getParentPostId());
            if (parentPost.isEmpty() || !parentPost.get().getIsActive()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Parent post not found");
            }
        }
        
        ForumPost post = ForumPostMapper.toEntity(postDTO);
        post.setTopic(topic);
        post.setCreatedBy(currentUser);
        post.setUpdatedBy(currentUser);
        
        ForumPost savedPost = postRepository.save(post);
        log.info("Created forum post with ID: {}", savedPost.getId());
        
        // === AUTOMATED MODERATION LOGIC ===
        ContentFilterService.ModerationRecommendation recommendation =
            contentFilterService.getModerationRecommendation(postDTO.getContent());
        if (recommendation.getAction() == ContentFilterService.ModerationAction.REJECT) {
            // Auto-delete inappropriate content
            savedPost.setIsActive(false);
            savedPost.setUpdatedBy("SYSTEM");
            postRepository.save(savedPost);
            log.info("[AUTO-MODERATION] Auto-deleted inappropriate post: {} (reason: {})", savedPost.getId(), recommendation.getReason());
            
            // Notify user about auto-deletion
            notificationService.createNotification(
                currentUser,
                "content_deleted",
                "Your post was automatically removed: " + recommendation.getReason(),
                "/forums/topics/" + topic.getId(),
                "SYSTEM"
            );
        } else if (recommendation.getAction() == ContentFilterService.ModerationAction.FLAG) {
            // Auto-flag suspicious content
            savedPost.setIsFlagged(true);
            savedPost.setFlaggedBy("SYSTEM");
            savedPost.setFlagReason(recommendation.getReason());
            savedPost.setUpdatedBy("SYSTEM");
            postRepository.save(savedPost);
            log.info("[AUTO-MODERATION] Auto-flagged suspicious post: {} (reason: {})", savedPost.getId(), recommendation.getReason());
            
            // Notify user about auto-flagging
            notificationService.createNotification(
                currentUser,
                "content_flagged",
                "Your post was automatically flagged for review: " + recommendation.getReason(),
                "/forums/topics/" + topic.getId(),
                "SYSTEM"
            );
        }
        // === END AUTOMATED MODERATION LOGIC ===
        
        // Create notification for topic creator if it's not their own post
        if (!topic.getCreatedBy().equals(currentUser)) {
            notificationService.createNotification(
                topic.getCreatedBy(),
                "reply",
                "Someone replied to your topic: " + topic.getTitle(),
                "/forums/topics/" + topic.getId(),
                currentUser
            );
        }
        
        return ForumPostMapper.toDTO(savedPost);
    }
    
    /**
     * Get posts for a topic
     */
    @Transactional(readOnly = true)
    public List<ForumPostDTO> getPostsByTopic(Long topicId, boolean isAuthenticated) {
        log.debug("Fetching posts for topic: {}", topicId);
        
        // Validate topic exists and check access
        ForumTopic topic = topicRepository.findById(topicId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));
        
        if (!topic.getIsActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found");
        }
        
        if (!topic.getIsPublic() && !isAuthenticated) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        
        List<ForumPost> posts = postRepository.findByTopicIdAndIsActiveTrueOrderByCreatedDateAsc(topicId);
        
        return posts.stream()
                .map(ForumPostMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get post by ID
     */
    @Transactional(readOnly = true)
    public ForumPostDTO getPostById(Long id, boolean isAuthenticated) {
        log.debug("Fetching post by ID: {}", id);
        
        ForumPost post = postRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        
        if (!post.getIsActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
        }
        
        // Check topic access
        ForumTopic topic = post.getTopic();
        if (!topic.getIsPublic() && !isAuthenticated) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        
        return ForumPostMapper.toDTO(post);
    }
    
    /**
     * Update forum post
     */
    public ForumPostDTO updatePost(Long id, ForumPostUpdateDTO updateDTO, String currentUser, String currentUserRole) {
        log.info("Updating post with ID: {} by user: {} with role: {}", id, currentUser, currentUserRole);
        
        ForumPost existingPost = postRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        
        if (!existingPost.getIsActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
        }
        
        // Check if user can update (creator, SYSTEM_ADMINISTRATOR, HERITAGE_MANAGER, or CONTENT_MANAGER)
        if (!existingPost.getCreatedBy().equals(currentUser) && 
            !"ROLE_SYSTEM_ADMINISTRATOR".equals(currentUserRole) &&
            !"ROLE_HERITAGE_MANAGER".equals(currentUserRole) &&
            !"ROLE_CONTENT_MANAGER".equals(currentUserRole)) {
            throw new SecurityException("Access denied: Only the creator, system administrator, heritage manager, or content manager can update this post");
        }
        
        // Save current version before updating
        savePostVersion(existingPost, currentUser, updateDTO.getChangeReason());
        
        // Update fields
        existingPost.setContent(updateDTO.getContent());
        existingPost.setLanguage(updateDTO.getLanguage());
        existingPost.setUpdatedBy(currentUser);
        
        ForumPost updatedPost = postRepository.save(existingPost);
        log.info("Updated post with ID: {} by user: {}", updatedPost.getId(), currentUser);
        
        // Send notification to original creator if modified by someone else
        if (!existingPost.getCreatedBy().equals(currentUser)) {
            notificationService.createNotification(
                existingPost.getCreatedBy(),
                "post_modified",
                "Your post has been modified by " + currentUser + ". Reason: " + updateDTO.getChangeReason(),
                "/forums/posts/" + updatedPost.getId(),
                currentUser
            );
        }
        
        return ForumPostMapper.toDTO(updatedPost);
    }
    
    /**
     * Delete post (soft delete)
     */
    public void deletePost(Long id, String currentUser, String currentUserRole) {
        log.info("Deleting post with ID: {} by user: {} with role: {}", id, currentUser, currentUserRole);
        
        ForumPost post = postRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        
        if (!post.getIsActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
        }
        
        // Check if user can delete (creator, SYSTEM_ADMINISTRATOR, HERITAGE_MANAGER, or CONTENT_MANAGER)
        if (!post.getCreatedBy().equals(currentUser) && 
            !"ROLE_SYSTEM_ADMINISTRATOR".equals(currentUserRole) &&
            !"ROLE_HERITAGE_MANAGER".equals(currentUserRole) &&
            !"ROLE_CONTENT_MANAGER".equals(currentUserRole)) {
            throw new SecurityException("Access denied: Only the creator, system administrator, heritage manager, or content manager can delete this post");
        }
        
        post.setIsActive(false);
        post.setUpdatedBy(currentUser);
        postRepository.save(post);
        
        log.info("Deleted post with ID: {} by user: {}", id, currentUser);
    }
    
    /**
     * Flag post for moderation
     */
    public ForumPostDTO flagPost(Long id, String reason, String currentUser) {
        log.info("Flagging post with ID: {} for moderation", id);
        
        ForumPost post = postRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        
        if (!post.getIsActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
        }
        
        post.setIsFlagged(true);
        post.setFlaggedBy(currentUser);
        post.setFlagReason(reason);
        post.setUpdatedBy(currentUser);
        
        ForumPost updatedPost = postRepository.save(post);
        log.info("Flagged post with ID: {}", updatedPost.getId());
        
        // Create notification for post creator
        notificationService.createNotification(
            post.getCreatedBy(),
            "flag",
            "Your post has been flagged for moderation",
            "/forums/topics/" + post.getTopic().getId(),
            currentUser
        );
        
        return ForumPostMapper.toDTO(updatedPost);
    }
    
    /**
     * Get flagged posts for moderation
     */
    @Transactional(readOnly = true)
    public List<ForumPostDTO> getFlaggedPosts() {
        log.debug("Fetching flagged posts for moderation");
        
        List<ForumPost> flaggedPosts = postRepository.findByIsFlaggedTrueAndIsActiveTrueOrderByCreatedDateDesc();
        
        return flaggedPosts.stream()
                .map(ForumPostMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    // ==================== UTILITY METHODS ====================
    
    /**
     * Get recent topics
     */
    @Transactional(readOnly = true)
    public List<ForumTopicDTO> getRecentTopics(boolean isAuthenticated) {
        log.debug("Fetching recent topics");
        
        List<ForumTopic> topics = topicRepository.findTop10ByIsActiveTrueOrderByCreatedDateDesc();
        
        // Apply access control
        if (!isAuthenticated) {
            List<ForumTopic> publicTopics = topics.stream()
                    .filter(topic -> topic.getIsPublic())
                    .collect(Collectors.toList());
            topics = publicTopics;
        }
        
        return topics.stream()
                .map(ForumTopicMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Get pinned topics
     */
    @Transactional(readOnly = true)
    public List<ForumTopicDTO> getPinnedTopics(boolean isAuthenticated) {
        log.debug("Fetching pinned topics");
        
        List<ForumTopic> topics = topicRepository.findByIsPinnedTrueAndIsActiveTrue();
        
        // Apply access control
        if (!isAuthenticated) {
            List<ForumTopic> publicTopics = topics.stream()
                    .filter(topic -> topic.getIsPublic())
                    .collect(Collectors.toList());
            topics = publicTopics;
        }
        
        return topics.stream()
                .map(ForumTopicMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Get topics by user
     */
    @Transactional(readOnly = true)
    public List<ForumTopicDTO> getTopicsByUser(String username, boolean isAuthenticated) {
        log.debug("Fetching topics by user: {}", username);
        
        List<ForumTopic> topics = topicRepository.findByCreatedByAndIsActiveTrue(username);
        
        // Apply access control
        if (!isAuthenticated) {
            List<ForumTopic> publicTopics = topics.stream()
                    .filter(topic -> topic.getIsPublic())
                    .collect(Collectors.toList());
            topics = publicTopics;
        }
        
        return topics.stream()
                .map(ForumTopicMapper::toDTO)
                .collect(Collectors.toList());
    }

    // ==================== LIKES ====================

    /** Like a topic */
    public void likeTopic(Long topicId, String userId) {
        if (!forumLikeRepository.existsByUserIdAndLikeTypeAndTargetId(userId, LikeType.TOPIC, topicId)) {
            ForumLike like = ForumLike.builder()
                    .userId(userId)
                    .likeType(LikeType.TOPIC)
                    .targetId(topicId)
                    .build();
            forumLikeRepository.save(like);
        }
    }

    /** Unlike a topic */
    public void unlikeTopic(Long topicId, String userId) {
        forumLikeRepository.findByUserIdAndLikeTypeAndTargetId(userId, LikeType.TOPIC, topicId)
                .ifPresent(forumLikeRepository::delete);
    }

    /** Get topic like count */
    @Transactional(readOnly = true)
    public long getTopicLikeCount(Long topicId) {
        return forumLikeRepository.countByLikeTypeAndTargetId(LikeType.TOPIC, topicId);
    }

    /** Check if user liked topic */
    @Transactional(readOnly = true)
    public boolean isTopicLikedByUser(Long topicId, String userId) {
        return forumLikeRepository.existsByUserIdAndLikeTypeAndTargetId(userId, LikeType.TOPIC, topicId);
    }

    /**
     * Pin/Unpin a topic (moderation feature)
     */
    public ForumTopicDTO pinTopic(Long id, boolean pinned, String currentUser) {
        log.info("{} topic with ID: {} by user: {}", pinned ? "Pinning" : "Unpinning", id, currentUser);
        
        ForumTopic topic = topicRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));
        
        if (!topic.getIsActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found");
        }
        
        topic.setIsPinned(pinned);
        topic.setUpdatedBy(currentUser);
        
        ForumTopic updatedTopic = topicRepository.save(topic);
        log.info("{} topic with ID: {} by user: {}", pinned ? "Pinned" : "Unpinned", updatedTopic.getId(), currentUser);
        
        return ForumTopicMapper.toDTO(updatedTopic);
    }

    /**
     * Lock/Unlock a topic (moderation feature)
     */
    public ForumTopicDTO lockTopic(Long id, boolean locked, String currentUser) {
        log.info("{} topic with ID: {} by user: {}", locked ? "Locking" : "Unlocking", id, currentUser);
        
        ForumTopic topic = topicRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));
        
        if (!topic.getIsActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found");
        }
        
        topic.setIsLocked(locked);
        topic.setUpdatedBy(currentUser);
        
        ForumTopic updatedTopic = topicRepository.save(topic);
        log.info("{} topic with ID: {} by user: {}", locked ? "Locked" : "Unlocked", updatedTopic.getId(), currentUser);
        
        return ForumTopicMapper.toDTO(updatedTopic);
    }

    /** Like a post */
    public void likePost(Long postId, String userId) {
        if (!forumLikeRepository.existsByUserIdAndLikeTypeAndTargetId(userId, LikeType.POST, postId)) {
            ForumLike like = ForumLike.builder()
                    .userId(userId)
                    .likeType(LikeType.POST)
                    .targetId(postId)
                    .build();
            forumLikeRepository.save(like);
        }
    }

    /** Unlike a post */
    public void unlikePost(Long postId, String userId) {
        forumLikeRepository.findByUserIdAndLikeTypeAndTargetId(userId, LikeType.POST, postId)
                .ifPresent(forumLikeRepository::delete);
    }

    /** Get post like count */
    @Transactional(readOnly = true)
    public long getPostLikeCount(Long postId) {
        return forumLikeRepository.countByLikeTypeAndTargetId(LikeType.POST, postId);
    }

    /** Check if user liked post */
    @Transactional(readOnly = true)
    public boolean isPostLikedByUser(Long postId, String userId) {
        return forumLikeRepository.existsByUserIdAndLikeTypeAndTargetId(userId, LikeType.POST, postId);
    }

    // ==================== ADVANCED SEARCH ====================

    /**
     * Advanced search for topics with multiple filters
     */
    @Transactional(readOnly = true)
    public ForumSearchResponse<ForumTopicDTO> advancedSearchTopics(ForumSearchRequest request, boolean isAuthenticated) {
        log.debug("Advanced search for topics with filters: {}", request);
        
        Page<ForumTopic> topicsPage;
        
        if (isAuthenticated) {
            topicsPage = topicRepository.advancedSearch(
                request.getSearchTerm(),
                request.getCategoryId(),
                request.getLanguage(),
                request.getIsPublic(),
                request.getIsPinned(),
                request.getIsLocked(),
                request.getCreatedBy(),
                request.toPageable()
            );
        } else {
            topicsPage = topicRepository.advancedSearchPublic(
                request.getSearchTerm(),
                request.getCategoryId(),
                request.getLanguage(),
                request.getIsPinned(),
                request.getIsLocked(),
                request.getCreatedBy(),
                request.toPageable()
            );
        }
        
        Page<ForumTopicDTO> dtoPage = topicsPage.map(ForumTopicMapper::toDTO);
        return ForumSearchResponse.fromPage(dtoPage);
    }

    /**
     * Advanced search for posts with multiple filters
     */
    // ==================== VERSION HISTORY OPERATIONS ====================
    
    /**
     * Save version of post before modification
     */
    private void savePostVersion(ForumPost post, String modifiedBy, String changeReason) {
        // Get next version number
        Integer nextVersion = versionRepository.findLatestVersionNumber(post.getId())
            .map(version -> version + 1)
            .orElse(1);
        
        ForumPostVersion version = ForumPostVersion.builder()
            .postId(post.getId())
            .content(post.getContent())
            .language(post.getLanguage())
            .modifiedBy(modifiedBy)
            .changeReason(changeReason)
            .versionNumber(nextVersion)
            .build();
        
        versionRepository.save(version);
        log.debug("Saved version {} for post {}", nextVersion, post.getId());
    }
    
    /**
     * Get version history for a post
     */
    @Transactional(readOnly = true)
    public List<ForumPostVersionDTO> getPostVersionHistory(Long postId) {
        log.debug("Fetching version history for post: {}", postId);
        
        // Verify post exists
        if (!postRepository.existsById(postId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
        }
        
        List<ForumPostVersion> versions = versionRepository.findByPostIdOrderByVersionNumberAsc(postId);
        
        return versions.stream()
                .map(ForumPostVersionMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Get specific version of a post
     */
    @Transactional(readOnly = true)
    public ForumPostVersionDTO getPostVersion(Long postId, Integer versionNumber) {
        log.debug("Fetching version {} for post: {}", versionNumber, postId);
        
        ForumPostVersion version = versionRepository.findByPostIdAndVersionNumber(postId, versionNumber)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Version not found"));
        
        return ForumPostVersionMapper.toDTO(version);
    }
    
    /**
     * Compare two versions of a post
     */
    @Transactional(readOnly = true)
    public Map<String, Object> comparePostVersions(Long postId, Integer version1, Integer version2) {
        log.debug("Comparing versions {} and {} for post: {}", version1, version2, postId);
        
        ForumPostVersion v1 = versionRepository.findByPostIdAndVersionNumber(postId, version1)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Version " + version1 + " not found"));
        
        ForumPostVersion v2 = versionRepository.findByPostIdAndVersionNumber(postId, version2)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Version " + version2 + " not found"));
        
        Map<String, Object> comparison = new HashMap<>();
        comparison.put("version1", ForumPostVersionMapper.toDTO(v1));
        comparison.put("version2", ForumPostVersionMapper.toDTO(v2));
        comparison.put("contentChanged", !v1.getContent().equals(v2.getContent()));
        comparison.put("languageChanged", !Objects.equals(v1.getLanguage(), v2.getLanguage()));
        
        return comparison;
    }
    
    @Transactional(readOnly = true)
    public ForumSearchResponse<ForumPostDTO> advancedSearchPosts(ForumSearchRequest request, boolean isAuthenticated) {
        log.debug("Advanced search for posts with filters: {}", request);
        
        Page<ForumPost> postsPage;
        
        if (isAuthenticated) {
            postsPage = postRepository.advancedSearch(
                request.getSearchTerm(),
                request.getTopicId(),
                request.getLanguage(),
                request.getIsFlagged(),
                request.getCreatedBy(),
                request.getParentPostId(),
                request.toPageable()
            );
        } else {
            postsPage = postRepository.advancedSearchPublic(
                request.getSearchTerm(),
                request.getTopicId(),
                request.getLanguage(),
                request.getIsFlagged(),
                request.getCreatedBy(),
                request.getParentPostId(),
                request.toPageable()
            );
        }
        
        Page<ForumPostDTO> dtoPage = postsPage.map(ForumPostMapper::toDTO);
        return ForumSearchResponse.fromPage(dtoPage);
    }
    
    /**
     * Get topics by specific language
     */
    @Transactional(readOnly = true)
    public List<ForumTopicDTO> getTopicsByLanguage(String language, Long categoryId, Boolean isPublic, boolean isAuthenticated) {
        log.debug("Fetching topics by language: {} with filters - categoryId: {}, isPublic: {}", 
                 language, categoryId, isPublic);
        
        List<ForumTopic> topics;
        
        if (categoryId != null) {
            if (isPublic != null) {
                if (isPublic && isAuthenticated) {
                    topics = topicRepository.findByCategoryIdAndLanguageAndIsActiveTrue(categoryId, language);
                } else if (isPublic) {
                    topics = topicRepository.findByCategoryIdAndLanguageAndIsPublicTrueAndIsActiveTrue(categoryId, language);
                } else {
                    topics = topicRepository.findByCategoryIdAndLanguageAndIsActiveTrue(categoryId, language);
                }
            } else {
                if (isAuthenticated) {
                    topics = topicRepository.findByCategoryIdAndLanguageAndIsActiveTrue(categoryId, language);
                } else {
                    topics = topicRepository.findByCategoryIdAndLanguageAndIsPublicTrueAndIsActiveTrue(categoryId, language);
                }
            }
        } else {
            if (isPublic != null) {
                if (isPublic && isAuthenticated) {
                    topics = topicRepository.findByLanguageAndIsActiveTrue(language);
                } else if (isPublic) {
                    topics = topicRepository.findByLanguageAndIsPublicTrueAndIsActiveTrue(language);
                } else {
                    topics = topicRepository.findByLanguageAndIsActiveTrue(language);
                }
            } else {
                if (isAuthenticated) {
                    topics = topicRepository.findByLanguageAndIsActiveTrue(language);
                } else {
                    topics = topicRepository.findByLanguageAndIsPublicTrueAndIsActiveTrue(language);
                }
            }
        }
        
        return topics.stream()
            .map(ForumTopicMapper::toDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Get topics in user's preferred language
     */
    @Transactional(readOnly = true)
    public List<ForumTopicDTO> getTopicsInPreferredLanguage(String currentUser, Long categoryId, Boolean isPublic) {
        log.debug("Fetching topics in preferred language for user: {}", currentUser);
        
        // Get user's preferred language
        String userLanguage = userLanguagePreferenceService.getUserPreferredLanguage(currentUser);
        
        // Get topics in user's preferred language
        return getTopicsByLanguage(userLanguage, categoryId, isPublic, true);
    }
} 