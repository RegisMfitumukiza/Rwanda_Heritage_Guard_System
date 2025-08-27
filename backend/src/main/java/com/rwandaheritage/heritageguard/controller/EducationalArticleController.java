package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.dto.EducationalArticleDTO;
import com.rwandaheritage.heritageguard.model.User;
import com.rwandaheritage.heritageguard.service.EducationalArticleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/education/articles")
public class EducationalArticleController {
    
    private final EducationalArticleService articleService;

    @Autowired
    public EducationalArticleController(EducationalArticleService articleService) {
        this.articleService = articleService;
    }

    /**
     * Create a new educational article
     * Only SYSTEM_ADMINISTRATOR and CONTENT_MANAGER can create
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'CONTENT_MANAGER')")
    public ResponseEntity<EducationalArticleDTO> createArticle(@Valid @RequestBody EducationalArticleDTO articleDTO) {
        EducationalArticleDTO created = articleService.createArticle(articleDTO);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * Get educational article by ID
     * Public if isPublic=true, else requires COMMUNITY_MEMBER or higher
     */
    @GetMapping("/{id}")
    public ResponseEntity<EducationalArticleDTO> getArticle(@PathVariable Long id) {
        EducationalArticleDTO article = articleService.getArticle(id);
        return ResponseEntity.ok(article);
    }

    /**
     * List all educational articles (filtered by access)
     * Public sees only public articles, others see all they are allowed
     */
    @GetMapping
    public ResponseEntity<List<EducationalArticleDTO>> listArticles() {
        List<EducationalArticleDTO> articles = articleService.listArticles();
        return ResponseEntity.ok(articles);
    }

    /**
     * List articles by category
     * Public access for public articles
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<EducationalArticleDTO>> listArticlesByCategory(@PathVariable String category) {
        List<EducationalArticleDTO> articles = articleService.listArticlesByCategory(category);
        return ResponseEntity.ok(articles);
    }

    /**
     * List articles by difficulty level
     * Public access for public articles
     */
    @GetMapping("/difficulty/{difficultyLevel}")
    public ResponseEntity<List<EducationalArticleDTO>> listArticlesByDifficulty(@PathVariable String difficultyLevel) {
        List<EducationalArticleDTO> articles = articleService.listArticlesByDifficulty(difficultyLevel);
        return ResponseEntity.ok(articles);
    }

    /**
     * Search articles
     * Public access for public articles
     */
    @GetMapping("/search")
    public ResponseEntity<List<EducationalArticleDTO>> searchArticles(@RequestParam String searchTerm,
                                                                     @RequestParam(defaultValue = "false") boolean includePrivate) {
        List<EducationalArticleDTO> articles = articleService.searchArticles(searchTerm, includePrivate);
        return ResponseEntity.ok(articles);
    }

    /**
     * Get article in specific language
     * Public access for public articles
     */
    @GetMapping("/{id}/language/{languageCode}")
    public ResponseEntity<EducationalArticleDTO> getArticleInLanguage(
            @PathVariable Long id, @PathVariable String languageCode) {
        EducationalArticleDTO article = articleService.getArticleInLanguage(id, languageCode);
        return ResponseEntity.ok(article);
    }

    /**
     * Get article for current user (using user's preferred language)
     * Requires authentication
     */
    @GetMapping("/{id}/user")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER', 'COMMUNITY_MEMBER')")
    public ResponseEntity<EducationalArticleDTO> getArticleForUser(@PathVariable Long id) {
        // TODO: Get current user from authentication context
        // For now, using null user which will fallback to default language
        EducationalArticleDTO article = articleService.getArticleForUser(id, null);
        return ResponseEntity.ok(article);
    }

    /**
     * List articles in specific language
     * Public access for public articles
     */
    @GetMapping("/language/{languageCode}")
    public ResponseEntity<List<EducationalArticleDTO>> listArticlesInLanguage(
            @PathVariable String languageCode) {
        List<EducationalArticleDTO> articles = articleService.listArticlesInLanguage(languageCode);
        return ResponseEntity.ok(articles);
    }

    /**
     * Get public articles for guests and community members
     * No authentication required
     */
    @GetMapping("/public")
    public ResponseEntity<List<EducationalArticleDTO>> getPublicArticles(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String difficultyLevel) {
        
        List<EducationalArticleDTO> articles = articleService.getPublicArticles(searchTerm, category, difficultyLevel);
        return ResponseEntity.ok(articles);
    }

    /**
     * Get article for current user (using user's preferred language)
     * Requires authentication
     */
    @GetMapping("/user")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER', 'COMMUNITY_MEMBER')")
    public ResponseEntity<List<EducationalArticleDTO>> listArticlesForUser() {
        // TODO: Get current user from authentication context
        // For now, using null user which will fallback to default language
        List<EducationalArticleDTO> articles = articleService.listArticlesForUser(null);
        return ResponseEntity.ok(articles);
    }

    /**
     * Update educational article
     * Only SYSTEM_ADMINISTRATOR and CONTENT_MANAGER can update
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'CONTENT_MANAGER')")
    public ResponseEntity<EducationalArticleDTO> updateArticle(@PathVariable Long id, @Valid @RequestBody EducationalArticleDTO articleDTO) {
        EducationalArticleDTO updated = articleService.updateArticle(id, articleDTO);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete educational article (soft delete)
     * Only SYSTEM_ADMINISTRATOR and CONTENT_MANAGER can delete
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'CONTENT_MANAGER')")
    public ResponseEntity<Void> deleteArticle(@PathVariable Long id) {
        articleService.deleteArticle(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get articles by creator
     * Only SYSTEM_ADMINISTRATOR and CONTENT_MANAGER can view
     */
    @GetMapping("/creator/{createdBy}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'CONTENT_MANAGER')")
    public ResponseEntity<List<EducationalArticleDTO>> getArticlesByCreator(@PathVariable String createdBy) {
        List<EducationalArticleDTO> articles = articleService.getArticlesByCreator(createdBy);
        return ResponseEntity.ok(articles);
    }

    /**
     * Get educational article statistics
     * Public access
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getArticleStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalArticles", articleService.getTotalArticleCount());
        stats.put("publicArticles", articleService.getPublicArticleCount());
        stats.put("privateArticles", articleService.getTotalArticleCount() - articleService.getPublicArticleCount());
        stats.put("recentArticles", articleService.getRecentArticleCount(30)); // Last 30 days
        return ResponseEntity.ok(stats);
    }
} 