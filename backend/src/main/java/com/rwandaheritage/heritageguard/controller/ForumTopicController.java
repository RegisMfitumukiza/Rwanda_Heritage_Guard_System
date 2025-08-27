package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.dto.ForumTopicDTO;
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
import com.rwandaheritage.heritageguard.dto.ForumSearchRequest;
import com.rwandaheritage.heritageguard.dto.ForumSearchResponse;

@RestController
@RequestMapping("/api/forum/topics")
@RequiredArgsConstructor
@Slf4j
public class ForumTopicController {

    private final ForumService forumService;

    /**
     * Create a new forum topic
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER', 'COMMUNITY_MEMBER')")
    public ResponseEntity<ForumTopicDTO> createTopic(
            @Valid @RequestBody ForumTopicDTO topicDTO,
            Authentication authentication) {
        log.info("Creating forum topic: {}", topicDTO.getTitle());
        
        String currentUser = authentication.getName();
        ForumTopicDTO createdTopic = forumService.createTopic(topicDTO, currentUser);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTopic);
    }

    /**
     * Get all forum topics (public access)
     */
    @GetMapping
    public ResponseEntity<List<ForumTopicDTO>> getAllTopics(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String translationLanguage,
            Authentication authentication) {
        log.debug("Fetching forum topics with filters - categoryId: {}, language: {}, translationLanguage: {}", 
                categoryId, language, translationLanguage);
        
        boolean isAuthenticated = authentication != null;
        List<ForumTopicDTO> topics = forumService.getAllTopics(categoryId, language, isAuthenticated, translationLanguage);
        return ResponseEntity.ok(topics);
    }

    /**
     * Get topic by ID (public access)
     */
    @GetMapping("/{id}")
    public ResponseEntity<ForumTopicDTO> getTopicById(@PathVariable Long id) {
        log.debug("Fetching forum topic by ID: {}", id);
        
        boolean isAuthenticated = true; // This will be determined by security context
        ForumTopicDTO topic = forumService.getTopicById(id, isAuthenticated);
        return ResponseEntity.ok(topic);
    }

    /**
     * Update forum topic
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER', 'COMMUNITY_MEMBER')")
    public ResponseEntity<ForumTopicDTO> updateTopic(
            @PathVariable Long id,
            @Valid @RequestBody ForumTopicDTO topicDTO,
            Authentication authentication) {
        log.info("Updating forum topic with ID: {}", id);
        
        String currentUser = authentication.getName();
        String currentUserRole = authentication.getAuthorities().stream()
                .findFirst()
                .map(Object::toString)
                .orElse("ROLE_GUEST");
        
        ForumTopicDTO updatedTopic = forumService.updateTopic(id, topicDTO, currentUser, currentUserRole);
        
        return ResponseEntity.ok(updatedTopic);
    }

    /**
     * Delete forum topic (soft delete)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER', 'COMMUNITY_MEMBER')")
    public ResponseEntity<Void> deleteTopic(
            @PathVariable Long id,
            Authentication authentication) {
        log.info("Deleting forum topic with ID: {}", id);
        
        String currentUser = authentication.getName();
        String currentUserRole = authentication.getAuthorities().stream()
                .findFirst()
                .map(Object::toString)
                .orElse("ROLE_GUEST");
        
        forumService.deleteTopic(id, currentUser, currentUserRole);
        
        return ResponseEntity.noContent().build();
    }

    /**
     * Search topics by title or content
     */
    @GetMapping("/search")
    public ResponseEntity<List<ForumTopicDTO>> searchTopics(
            @RequestParam String searchTerm,
            @AuthenticationPrincipal Authentication authentication) {
        log.debug("Searching forum topics with term: {}", searchTerm);
        
        boolean isAuthenticated = authentication != null && authentication.isAuthenticated();
        List<ForumTopicDTO> topics = forumService.searchTopics(searchTerm, isAuthenticated);
        return ResponseEntity.ok(topics);
    }

    /**
     * Advanced search for topics with multiple filters
     */
    @PostMapping("/search/advanced")
    public ResponseEntity<ForumSearchResponse<ForumTopicDTO>> advancedSearchTopics(
            @RequestBody ForumSearchRequest request,
            @AuthenticationPrincipal Authentication authentication) {
        log.debug("Advanced search for topics with request: {}", request);
        
        boolean isAuthenticated = authentication != null && authentication.isAuthenticated();
        ForumSearchResponse<ForumTopicDTO> response = forumService.advancedSearchTopics(request, isAuthenticated);
        return ResponseEntity.ok(response);
    }

    /**
     * Advanced search for topics with query parameters (alternative to POST)
     */
    @GetMapping("/search/advanced")
    public ResponseEntity<ForumSearchResponse<ForumTopicDTO>> advancedSearchTopicsGet(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) Boolean isPublic,
            @RequestParam(required = false) Boolean isPinned,
            @RequestParam(required = false) Boolean isLocked,
            @RequestParam(required = false) String createdBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection,
            @AuthenticationPrincipal Authentication authentication) {
        
        ForumSearchRequest request = ForumSearchRequest.builder()
                .searchTerm(searchTerm)
                .categoryId(categoryId)
                .language(language)
                .isPublic(isPublic)
                .isPinned(isPinned)
                .isLocked(isLocked)
                .createdBy(createdBy)
                .page(page)
                .size(size)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .build();
        
        log.debug("Advanced search for topics with GET request: {}", request);
        
        boolean isAuthenticated = authentication != null && authentication.isAuthenticated();
        ForumSearchResponse<ForumTopicDTO> response = forumService.advancedSearchTopics(request, isAuthenticated);
        return ResponseEntity.ok(response);
    }

    /**
     * Get recent topics
     */
    @GetMapping("/recent")
    public ResponseEntity<List<ForumTopicDTO>> getRecentTopics() {
        log.debug("Fetching recent forum topics");
        
        boolean isAuthenticated = true; // This will be determined by security context
        List<ForumTopicDTO> topics = forumService.getRecentTopics(isAuthenticated);
        return ResponseEntity.ok(topics);
    }

    /**
     * Get pinned topics
     */
    @GetMapping("/pinned")
    public ResponseEntity<List<ForumTopicDTO>> getPinnedTopics() {
        log.debug("Fetching pinned forum topics");
        
        boolean isAuthenticated = true; // This will be determined by security context
        List<ForumTopicDTO> topics = forumService.getPinnedTopics(isAuthenticated);
        return ResponseEntity.ok(topics);
    }

    /**
     * Get topics by user
     */
    @GetMapping("/user/{username}")
    public ResponseEntity<List<ForumTopicDTO>> getTopicsByUser(@PathVariable String username) {
        log.debug("Fetching forum topics by user: {}", username);
        
        boolean isAuthenticated = true; // This will be determined by security context
        List<ForumTopicDTO> topics = forumService.getTopicsByUser(username, isAuthenticated);
        return ResponseEntity.ok(topics);
    }

    /**
     * Like a topic
     */
    @PostMapping("/{id}/like")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> likeTopic(@PathVariable Long id, Authentication authentication) {
        forumService.likeTopic(id, authentication.getName());
        return ResponseEntity.ok().build();
    }

    /**
     * Unlike a topic
     */
    @DeleteMapping("/{id}/like")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> unlikeTopic(@PathVariable Long id, Authentication authentication) {
        forumService.unlikeTopic(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    /**
     * Get like count for a topic
     */
    @GetMapping("/{id}/likes/count")
    public ResponseEntity<Long> getTopicLikeCount(@PathVariable Long id) {
        long count = forumService.getTopicLikeCount(id);
        return ResponseEntity.ok(count);
    }

    /**
     * Check if current user liked a topic
     */
    @GetMapping("/{id}/likes/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Boolean> isTopicLikedByUser(@PathVariable Long id, Authentication authentication) {
        boolean liked = forumService.isTopicLikedByUser(id, authentication.getName());
        return ResponseEntity.ok(liked);
    }

    /**
     * Pin/Unpin a topic (moderation feature)
     */
    @PatchMapping("/{id}/pin")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER')")
    public ResponseEntity<ForumTopicDTO> pinTopic(
            @PathVariable Long id,
            @RequestParam(defaultValue = "true") boolean pinned,
            Authentication authentication) {
        log.info("{} topic with ID: {}", pinned ? "Pinning" : "Unpinning", id);
        
        String currentUser = authentication.getName();
        ForumTopicDTO updatedTopic = forumService.pinTopic(id, pinned, currentUser);
        
        return ResponseEntity.ok(updatedTopic);
    }

    /**
     * Lock/Unlock a topic (moderation feature)
     */
    @PatchMapping("/{id}/lock")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER')")
    public ResponseEntity<ForumTopicDTO> lockTopic(
            @PathVariable Long id,
            @RequestParam(defaultValue = "true") boolean locked,
            Authentication authentication) {
        log.info("{} topic with ID: {}", locked ? "Locking" : "Unlocking", id);
        
        String currentUser = authentication.getName();
        ForumTopicDTO updatedTopic = forumService.lockTopic(id, locked, currentUser);
        
        return ResponseEntity.ok(updatedTopic);
    }
    
    /**
     * Get topics by specific language
     */
    @GetMapping("/language/{language}")
    public ResponseEntity<List<ForumTopicDTO>> getTopicsByLanguage(
            @PathVariable String language,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Boolean isPublic,
            Authentication authentication) {
        log.debug("Fetching forum topics by language: {}", language);
        
        boolean isAuthenticated = authentication != null;
        List<ForumTopicDTO> topics = forumService.getTopicsByLanguage(language, categoryId, isPublic, isAuthenticated);
        return ResponseEntity.ok(topics);
    }
    
    /**
     * Get topics in user's preferred language
     */
    @GetMapping("/preferred-language")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ForumTopicDTO>> getTopicsInPreferredLanguage(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Boolean isPublic,
            Authentication authentication) {
        log.debug("Fetching forum topics in user's preferred language");
        
        String currentUser = authentication.getName();
        List<ForumTopicDTO> topics = forumService.getTopicsInPreferredLanguage(currentUser, categoryId, isPublic);
        return ResponseEntity.ok(topics);
    }
} 