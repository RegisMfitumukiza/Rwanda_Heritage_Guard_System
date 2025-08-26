package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.dto.EducationalArticleDTO;
import com.rwandaheritage.heritageguard.mapper.EducationalArticleMapper;
import com.rwandaheritage.heritageguard.model.EducationalArticle;
import com.rwandaheritage.heritageguard.model.User;
import com.rwandaheritage.heritageguard.repository.EducationalArticleRepository;
import com.rwandaheritage.heritageguard.service.MultilingualIntegrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EducationalArticleService {
    
    private final EducationalArticleRepository articleRepository;
    private final MultilingualIntegrationService multilingualService;

    @Autowired
    public EducationalArticleService(EducationalArticleRepository articleRepository, 
                                   MultilingualIntegrationService multilingualService) {
        this.articleRepository = articleRepository;
        this.multilingualService = multilingualService;
    }

    // Create a new educational article
    public EducationalArticleDTO createArticle(EducationalArticleDTO articleDTO) {
        enforceCanCreate();
        
        EducationalArticle article = EducationalArticleMapper.toEntity(articleDTO);

        // Ensure new fields are mapped
        article.setFeaturedImage(articleDTO.getFeaturedImage());
        article.setYoutubeVideoUrl(articleDTO.getYoutubeVideoUrl());
        article.setRelatedArtifactId(articleDTO.getRelatedArtifactId());
        article.setRelatedHeritageSiteId(articleDTO.getRelatedHeritageSiteId());
        article.setQuizId(articleDTO.getQuizId());

        // Set audit fields
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String createdBy = (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser"))
            ? auth.getName() : "system";
        article.setCreatedBy(createdBy);
        article.setCreatedDate(LocalDateTime.now());
        
        // Set published date if not provided
        if (article.getPublishedDate() == null) {
            article.setPublishedDate(LocalDateTime.now());
        }
        
        EducationalArticle savedArticle = articleRepository.save(article);
        return EducationalArticleMapper.toDTO(savedArticle);
    }

    // Get article by ID
    public EducationalArticleDTO getArticle(Long id) {
        EducationalArticle article = articleRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Educational article not found"));
        
        if (!canView(article)) {
            throw new AccessDeniedException("You do not have permission to view this article.");
        }
        
        return EducationalArticleMapper.toDTO(article);
    }

    // List all articles (with filtering based on user role)
    public List<EducationalArticleDTO> listArticles() {
        List<EducationalArticle> articles;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            // Authenticated users can see all active articles
            articles = articleRepository.findByIsActiveTrue();
        } else {
            // Public users can only see public articles
            articles = articleRepository.findByIsActiveTrueAndIsPublicTrue();
        }
        
        return articles.stream()
            .map(EducationalArticleMapper::toDTO)
            .collect(Collectors.toList());
    }

    // List articles by category
    public List<EducationalArticleDTO> listArticlesByCategory(String category) {
        List<EducationalArticle> articles = articleRepository.findByCategoryAndIsActiveTrueAndIsPublicTrue(category);
        return articles.stream()
            .map(EducationalArticleMapper::toDTO)
            .collect(Collectors.toList());
    }

    // List articles by difficulty level
    public List<EducationalArticleDTO> listArticlesByDifficulty(String difficultyLevel) {
        List<EducationalArticle> articles = articleRepository.findByDifficultyLevelAndIsActiveTrueAndIsPublicTrue(difficultyLevel);
        return articles.stream()
            .map(EducationalArticleMapper::toDTO)
            .collect(Collectors.toList());
    }

    // Search articles
    public List<EducationalArticleDTO> searchArticles(String searchTerm, boolean includePrivate) {
        List<EducationalArticle> articles;
        boolean canViewPrivate = false;
        if (includePrivate) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
                for (GrantedAuthority authority : auth.getAuthorities()) {
                    String role = authority.getAuthority();
                    if (role.equals("ROLE_CONTENT_MANAGER") || role.equals("ROLE_SYSTEM_ADMINISTRATOR")) {
                        canViewPrivate = true;
                        break;
                    }
                }
            }
        }
        if (canViewPrivate) {
            articles = articleRepository.searchArticlesIncludingPrivate(searchTerm);
        } else {
            articles = articleRepository.searchArticles(searchTerm);
        }
        return articles.stream()
            .map(EducationalArticleMapper::toDTO)
            .collect(Collectors.toList());
    }

    // Update article
    public EducationalArticleDTO updateArticle(Long id, EducationalArticleDTO articleDTO) {
        EducationalArticle existingArticle = articleRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Educational article not found"));
        
        enforceCanEdit(existingArticle);
        
        // Update fields
        existingArticle.setTitleEn(articleDTO.getTitleEn());
        existingArticle.setTitleRw(articleDTO.getTitleRw());
        existingArticle.setTitleFr(articleDTO.getTitleFr());
        existingArticle.setContentEn(articleDTO.getContentEn());
        existingArticle.setContentRw(articleDTO.getContentRw());
        existingArticle.setContentFr(articleDTO.getContentFr());
        existingArticle.setSummaryEn(articleDTO.getSummaryEn());
        existingArticle.setSummaryRw(articleDTO.getSummaryRw());
        existingArticle.setSummaryFr(articleDTO.getSummaryFr());
        existingArticle.setCategory(articleDTO.getCategory() != null ? EducationalArticle.ArticleCategory.valueOf(articleDTO.getCategory()) : null);
        existingArticle.setDifficultyLevel(articleDTO.getDifficultyLevel() != null ? EducationalArticle.DifficultyLevel.valueOf(articleDTO.getDifficultyLevel()) : null);
        existingArticle.setEstimatedReadTimeMinutes(articleDTO.getEstimatedReadTimeMinutes());
        existingArticle.setFeaturedImage(articleDTO.getFeaturedImage());
        existingArticle.setYoutubeVideoUrl(articleDTO.getYoutubeVideoUrl());
        existingArticle.setRelatedArtifactId(articleDTO.getRelatedArtifactId());
        existingArticle.setRelatedHeritageSiteId(articleDTO.getRelatedHeritageSiteId());
        existingArticle.setQuizId(articleDTO.getQuizId());
        existingArticle.setIsPublic(articleDTO.getIsPublic());
        existingArticle.setIsActive(articleDTO.getIsActive());
        existingArticle.setPublishedDate(articleDTO.getPublishedDate());
        
        // Update audit fields
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String updatedBy = (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) 
            ? auth.getName() : "system";
        existingArticle.setUpdatedBy(updatedBy);
        existingArticle.setUpdatedDate(LocalDateTime.now());
        
        EducationalArticle savedArticle = articleRepository.save(existingArticle);
        return EducationalArticleMapper.toDTO(savedArticle);
    }

    // Delete article (soft delete)
    public void deleteArticle(Long id) {
        EducationalArticle article = articleRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Educational article not found"));
        
        enforceCanEdit(article);
        
        // Soft delete
        article.setIsActive(false);
        article.setUpdatedBy(getCurrentUsername());
        article.setUpdatedDate(LocalDateTime.now());
        
        articleRepository.save(article);
    }

    // Get articles by creator
    public List<EducationalArticleDTO> getArticlesByCreator(String createdBy) {
        List<EducationalArticle> articles = articleRepository.findByCreatedByAndIsActiveTrue(createdBy);
        return articles.stream()
            .map(EducationalArticleMapper::toDTO)
            .collect(Collectors.toList());
    }

    // ===== MULTILINGUAL METHODS =====

    // Get article in specific language
    public EducationalArticleDTO getArticleInLanguage(Long id, String languageCode) {
        EducationalArticle article = articleRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Educational article not found"));
        
        if (!canView(article)) {
            throw new AccessDeniedException("You do not have permission to view this article.");
        }
        
        EducationalArticleDTO dto = EducationalArticleMapper.toDTO(article);
        
        // Apply language-specific content
        dto.setTitleEn(multilingualService.getContentInLanguage("EDUCATIONAL_ARTICLE", id, "title", languageCode, article.getTitleEn()));
        dto.setTitleRw(multilingualService.getContentInLanguage("EDUCATIONAL_ARTICLE", id, "title", "rw", article.getTitleRw()));
        dto.setTitleFr(multilingualService.getContentInLanguage("EDUCATIONAL_ARTICLE", id, "title", "fr", article.getTitleFr()));
        
        dto.setContentEn(multilingualService.getContentInLanguage("EDUCATIONAL_ARTICLE", id, "content", languageCode, article.getContentEn()));
        dto.setContentRw(multilingualService.getContentInLanguage("EDUCATIONAL_ARTICLE", id, "content", "rw", article.getContentRw()));
        dto.setContentFr(multilingualService.getContentInLanguage("EDUCATIONAL_ARTICLE", id, "content", "fr", article.getContentFr()));
        
        dto.setSummaryEn(multilingualService.getContentInLanguage("EDUCATIONAL_ARTICLE", id, "summary", languageCode, article.getSummaryEn()));
        dto.setSummaryRw(multilingualService.getContentInLanguage("EDUCATIONAL_ARTICLE", id, "summary", "rw", article.getSummaryRw()));
        dto.setSummaryFr(multilingualService.getContentInLanguage("EDUCATIONAL_ARTICLE", id, "summary", "fr", article.getSummaryFr()));
        
        return dto;
    }

    // Get article for specific user (using user's preferred language)
    public EducationalArticleDTO getArticleForUser(Long id, User user) {
        EducationalArticle article = articleRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Educational article not found"));
        
        if (!canView(article)) {
            throw new AccessDeniedException("You do not have permission to view this article.");
        }
        
        EducationalArticleDTO dto = EducationalArticleMapper.toDTO(article);
        String userLanguage = multilingualService.getUserLanguage(user);
        
        // Apply user's preferred language content
        dto.setTitleEn(multilingualService.getContentInUserLanguage("EDUCATIONAL_ARTICLE", id, "title", user, article.getTitleEn()));
        dto.setContentEn(multilingualService.getContentInUserLanguage("EDUCATIONAL_ARTICLE", id, "content", user, article.getContentEn()));
        dto.setSummaryEn(multilingualService.getContentInUserLanguage("EDUCATIONAL_ARTICLE", id, "summary", user, article.getSummaryEn()));
        
        return dto;
    }

    // List articles in specific language
    public List<EducationalArticleDTO> listArticlesInLanguage(String languageCode) {
        List<EducationalArticle> articles = articleRepository.findByIsActiveTrueAndIsPublicTrue();
        return articles.stream()
            .map(EducationalArticleMapper::toDTO)
            .collect(Collectors.toList());
    }

    // Get public articles with optional filtering
    public List<EducationalArticleDTO> getPublicArticles(String searchTerm, String category, String difficultyLevel) {
        List<EducationalArticle> articles = articleRepository.findByIsActiveTrueAndIsPublicTrue();
        
        // Apply filters
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            articles = articles.stream()
                .filter(article -> 
                    (article.getTitleEn() != null && article.getTitleEn().toLowerCase().contains(searchTerm.toLowerCase())) ||
                    (article.getTitleRw() != null && article.getTitleRw().toLowerCase().contains(searchTerm.toLowerCase())) ||
                    (article.getTitleFr() != null && article.getTitleFr().toLowerCase().contains(searchTerm.toLowerCase())) ||
                    (article.getSummaryEn() != null && article.getSummaryEn().toLowerCase().contains(searchTerm.toLowerCase())) ||
                    (article.getContentEn() != null && article.getContentEn().toLowerCase().contains(searchTerm.toLowerCase()))
                )
                .collect(Collectors.toList());
        }
        
        if (category != null && !category.trim().isEmpty()) {
            articles = articles.stream()
                .filter(article -> article.getCategory() != null && category.equals(article.getCategory().name()))
                .collect(Collectors.toList());
        }

        if (difficultyLevel != null && !difficultyLevel.trim().isEmpty()) {
            articles = articles.stream()
                .filter(article -> article.getDifficultyLevel() != null && difficultyLevel.equals(article.getDifficultyLevel().name()))
                .collect(Collectors.toList());
        }
        
        return articles.stream()
            .map(EducationalArticleMapper::toDTO)
            .collect(Collectors.toList());
    }

    // List articles for specific user (using user's preferred language)
    public List<EducationalArticleDTO> listArticlesForUser(User user) {
        List<EducationalArticle> articles;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            articles = articleRepository.findByIsActiveTrue();
        } else {
            articles = articleRepository.findByIsActiveTrueAndIsPublicTrue();
        }
        
        String userLanguage = multilingualService.getUserLanguage(user);
        
        return articles.stream()
            .map(article -> {
                EducationalArticleDTO dto = EducationalArticleMapper.toDTO(article);
                
                // Apply user's preferred language content
                dto.setTitleEn(multilingualService.getContentInUserLanguage("EDUCATIONAL_ARTICLE", article.getId(), "title", user, article.getTitleEn()));
                dto.setContentEn(multilingualService.getContentInUserLanguage("EDUCATIONAL_ARTICLE", article.getId(), "content", user, article.getContentEn()));
                dto.setSummaryEn(multilingualService.getContentInUserLanguage("EDUCATIONAL_ARTICLE", article.getId(), "summary", user, article.getSummaryEn()));
                
                return dto;
            })
            .collect(Collectors.toList());
    }

    // --- Access Control Helpers ---
    private void enforceCanCreate() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new AccessDeniedException("You must be logged in to create educational articles.");
        }
        boolean allowed = auth.getAuthorities().stream().anyMatch(a ->
            a.getAuthority().equals("ROLE_SYSTEM_ADMINISTRATOR") ||
            a.getAuthority().equals("ROLE_CONTENT_MANAGER")
        );
        if (!allowed) {
            throw new AccessDeniedException("You do not have permission to create educational articles.");
        }
    }

    private void enforceCanEdit(EducationalArticle article) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new AccessDeniedException("You must be logged in to modify educational articles.");
        }
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_SYSTEM_ADMINISTRATOR"));
        boolean isContentManager = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_CONTENT_MANAGER"));
        
        if (!isAdmin && !isContentManager) {
            throw new AccessDeniedException("You do not have permission to modify educational articles.");
        }
    }

    private boolean canView(EducationalArticle article) {
        if (article.isPublic() && article.isActive()) {
            return true;
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return false;
        }
        for (GrantedAuthority authority : auth.getAuthorities()) {
            String role = authority.getAuthority();
            if (role.equals("ROLE_SYSTEM_ADMINISTRATOR") || role.equals("ROLE_CONTENT_MANAGER") ||
                role.equals("ROLE_COMMUNITY_MEMBER")) {
                return true;
            }
        }
        return false;
    }

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) 
            ? auth.getName() : "system";
    }

    // Statistics methods
    public Long getTotalArticleCount() {
        return articleRepository.countByIsActiveTrue();
    }

    public Long getPublicArticleCount() {
        return articleRepository.countByIsActiveTrueAndIsPublicTrue();
    }

    public Long getRecentArticleCount(int days) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(days);
        return articleRepository.countByCreatedDateAfterAndIsActiveTrue(cutoffDate);
    }
} 