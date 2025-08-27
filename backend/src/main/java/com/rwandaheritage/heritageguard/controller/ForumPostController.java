package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.dto.ForumPostDTO;
import com.rwandaheritage.heritageguard.dto.ForumPostUpdateDTO;
import com.rwandaheritage.heritageguard.dto.ForumSearchRequest;
import com.rwandaheritage.heritageguard.dto.ForumSearchResponse;
import com.rwandaheritage.heritageguard.dto.ForumPostVersionDTO;
import com.rwandaheritage.heritageguard.service.ForumService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/forum/posts")
@RequiredArgsConstructor
@Slf4j
public class ForumPostController {

    private final ForumService forumService;

    /**
     * Create a new forum post
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER', 'COMMUNITY_MEMBER')")
    public ResponseEntity<ForumPostDTO> createPost(
            @Valid @RequestBody ForumPostDTO postDTO,
            Authentication authentication) {
        log.info("Creating forum post for topic: {}", postDTO.getTopicId());
        
        String currentUser = authentication.getName();
        ForumPostDTO createdPost = forumService.createPost(postDTO, currentUser);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPost);
    }

    /**
     * Get posts for a topic (public access)
     */
    @GetMapping("/topic/{topicId}")
    public ResponseEntity<List<ForumPostDTO>> getPostsByTopic(@PathVariable Long topicId) {
        log.debug("Fetching posts for topic: {}", topicId);
        
        boolean isAuthenticated = true; // This will be determined by security context
        List<ForumPostDTO> posts = forumService.getPostsByTopic(topicId, isAuthenticated);
        return ResponseEntity.ok(posts);
    }

    /**
     * Get post by ID (public access)
     */
    @GetMapping("/{id}")
    public ResponseEntity<ForumPostDTO> getPostById(@PathVariable Long id) {
        log.debug("Fetching forum post by ID: {}", id);
        
        boolean isAuthenticated = true; // This will be determined by security context
        ForumPostDTO post = forumService.getPostById(id, isAuthenticated);
        return ResponseEntity.ok(post);
    }

    /**
     * Update forum post
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER', 'COMMUNITY_MEMBER')")
    public ResponseEntity<ForumPostDTO> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody ForumPostUpdateDTO updateDTO,
            Authentication authentication) {
        log.info("Updating forum post with ID: {}", id);
        
        String currentUser = authentication.getName();
        String currentUserRole = authentication.getAuthorities().stream()
                .findFirst()
                .map(Object::toString)
                .orElse("ROLE_GUEST");
        
        ForumPostDTO updatedPost = forumService.updatePost(id, updateDTO, currentUser, currentUserRole);
        
        return ResponseEntity.ok(updatedPost);
    }

    /**
     * Delete forum post (soft delete)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER', 'COMMUNITY_MEMBER')")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long id,
            Authentication authentication) {
        log.info("Deleting forum post with ID: {}", id);
        
        String currentUser = authentication.getName();
        String currentUserRole = authentication.getAuthorities().stream()
                .findFirst()
                .map(Object::toString)
                .orElse("ROLE_GUEST");
        
        forumService.deletePost(id, currentUser, currentUserRole);
        
        return ResponseEntity.noContent().build();
    }

    /**
     * Flag post for moderation
     */
    @PostMapping("/{id}/flag")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER', 'COMMUNITY_MEMBER')")
    public ResponseEntity<ForumPostDTO> flagPost(
            @PathVariable Long id,
            @RequestParam String reason,
            Authentication authentication) {
        log.info("Flagging forum post with ID: {} for moderation", id);
        
        String currentUser = authentication.getName();
        ForumPostDTO flaggedPost = forumService.flagPost(id, reason, currentUser);
        
        return ResponseEntity.ok(flaggedPost);
    }

    /**
     * Get flagged posts for moderation
     */
    @GetMapping("/flagged")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER')")
    public ResponseEntity<List<ForumPostDTO>> getFlaggedPosts() {
        log.debug("Fetching flagged posts for moderation");
        
        List<ForumPostDTO> flaggedPosts = forumService.getFlaggedPosts();
        return ResponseEntity.ok(flaggedPosts);
    }

    /**
     * Advanced search for posts with multiple filters
     */
    @PostMapping("/search/advanced")
    public ResponseEntity<ForumSearchResponse<ForumPostDTO>> advancedSearchPosts(
            @RequestBody ForumSearchRequest request,
            @AuthenticationPrincipal Authentication authentication) {
        log.debug("Advanced search for posts with request: {}", request);
        
        boolean isAuthenticated = authentication != null && authentication.isAuthenticated();
        ForumSearchResponse<ForumPostDTO> response = forumService.advancedSearchPosts(request, isAuthenticated);
        return ResponseEntity.ok(response);
    }

    /**
     * Advanced search for posts with query parameters (alternative to POST)
     */
    @GetMapping("/search/advanced")
    public ResponseEntity<ForumSearchResponse<ForumPostDTO>> advancedSearchPostsGet(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) Long topicId,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) Boolean isFlagged,
            @RequestParam(required = false) String createdBy,
            @RequestParam(required = false) Long parentPostId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection,
            @AuthenticationPrincipal Authentication authentication) {
        
        ForumSearchRequest request = ForumSearchRequest.builder()
                .searchTerm(searchTerm)
                .topicId(topicId)
                .language(language)
                .isFlagged(isFlagged)
                .createdBy(createdBy)
                .parentPostId(parentPostId)
                .page(page)
                .size(size)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .build();
        
        log.debug("Advanced search for posts with GET request: {}", request);
        
        boolean isAuthenticated = authentication != null && authentication.isAuthenticated();
        ForumSearchResponse<ForumPostDTO> response = forumService.advancedSearchPosts(request, isAuthenticated);
        return ResponseEntity.ok(response);
    }

    /**
     * Like a post
     */
    @PostMapping("/{id}/like")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> likePost(@PathVariable Long id, Authentication authentication) {
        forumService.likePost(id, authentication.getName());
        return ResponseEntity.ok().build();
    }

    /**
     * Unlike a post
     */
    @DeleteMapping("/{id}/like")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> unlikePost(@PathVariable Long id, Authentication authentication) {
        forumService.unlikePost(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    /**
     * Get like count for a post
     */
    @GetMapping("/{id}/likes/count")
    public ResponseEntity<Long> getPostLikeCount(@PathVariable Long id) {
        long count = forumService.getPostLikeCount(id);
        return ResponseEntity.ok(count);
    }

    /**
     * Check if current user liked a post
     */
    @GetMapping("/{id}/likes/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Boolean> isPostLikedByUser(@PathVariable Long id, Authentication authentication) {
        boolean liked = forumService.isPostLikedByUser(id, authentication.getName());
        return ResponseEntity.ok(liked);
    }
    
    // ==================== VERSION HISTORY ENDPOINTS ====================
    
    /**
     * Get version history for a post
     */
    @GetMapping("/{id}/versions")
    public ResponseEntity<List<ForumPostVersionDTO>> getPostVersionHistory(@PathVariable Long id) {
        log.debug("Fetching version history for post: {}", id);
        List<ForumPostVersionDTO> versions = forumService.getPostVersionHistory(id);
        return ResponseEntity.ok(versions);
    }
    
    /**
     * Get specific version of a post
     */
    @GetMapping("/{id}/versions/{versionNumber}")
    public ResponseEntity<ForumPostVersionDTO> getPostVersion(
            @PathVariable Long id, 
            @PathVariable Integer versionNumber) {
        log.debug("Fetching version {} for post: {}", versionNumber, id);
        ForumPostVersionDTO version = forumService.getPostVersion(id, versionNumber);
        return ResponseEntity.ok(version);
    }
    
    /**
     * Compare two versions of a post
     */
    @GetMapping("/{id}/versions/compare")
    public ResponseEntity<Map<String, Object>> comparePostVersions(
            @PathVariable Long id,
            @RequestParam Integer version1,
            @RequestParam Integer version2) {
        log.debug("Comparing versions {} and {} for post: {}", version1, version2, id);
        Map<String, Object> comparison = forumService.comparePostVersions(id, version1, version2);
        return ResponseEntity.ok(comparison);
    }
} 