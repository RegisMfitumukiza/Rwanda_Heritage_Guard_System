package com.rwandaheritage.heritageguard.mapper;

import com.rwandaheritage.heritageguard.model.EducationalArticle;
import com.rwandaheritage.heritageguard.dto.EducationalArticleDTO;

public class EducationalArticleMapper {
    
    public static EducationalArticleDTO toDTO(EducationalArticle article) {
        if (article == null) return null;
        return EducationalArticleDTO.builder()
                .id(article.getId())
                .titleEn(article.getTitleEn())
                .titleRw(article.getTitleRw())
                .titleFr(article.getTitleFr())
                .contentEn(article.getContentEn())
                .contentRw(article.getContentRw())
                .contentFr(article.getContentFr())
                .summaryEn(article.getSummaryEn())
                .summaryRw(article.getSummaryRw())
                .summaryFr(article.getSummaryFr())
                .category(article.getCategory() != null ? article.getCategory().name() : null)
                .difficultyLevel(article.getDifficultyLevel() != null ? article.getDifficultyLevel().name() : null)
                .estimatedReadTimeMinutes(article.getEstimatedReadTimeMinutes())
                .tags(article.getTags())
                .featuredImage(article.getFeaturedImage())
                .youtubeVideoUrl(article.getYoutubeVideoUrl())
                .relatedArtifactId(article.getRelatedArtifactId())
                .relatedHeritageSiteId(article.getRelatedHeritageSiteId())
                .quizId(article.getQuizId())
                .isPublic(article.isPublic())
                .isActive(article.isActive())
                .publishedDate(article.getPublishedDate())
                .createdBy(article.getCreatedBy())
                .createdDate(article.getCreatedDate())
                .updatedBy(article.getUpdatedBy())
                .updatedDate(article.getUpdatedDate())
                .build();
    }

    public static EducationalArticle toEntity(EducationalArticleDTO dto) {
        if (dto == null) return null;
        return EducationalArticle.builder()
                .id(dto.getId())
                .titleEn(dto.getTitleEn())
                .titleRw(dto.getTitleRw())
                .titleFr(dto.getTitleFr())
                .contentEn(dto.getContentEn())
                .contentRw(dto.getContentRw())
                .contentFr(dto.getContentFr())
                .summaryEn(dto.getSummaryEn())
                .summaryRw(dto.getSummaryRw())
                .summaryFr(dto.getSummaryFr())
                .category(dto.getCategory() != null ? EducationalArticle.ArticleCategory.valueOf(dto.getCategory()) : null)
                .difficultyLevel(dto.getDifficultyLevel() != null ? EducationalArticle.DifficultyLevel.valueOf(dto.getDifficultyLevel()) : null)
                .estimatedReadTimeMinutes(dto.getEstimatedReadTimeMinutes())
                .tags(dto.getTags())
                .featuredImage(dto.getFeaturedImage())
                .youtubeVideoUrl(dto.getYoutubeVideoUrl())
                .relatedArtifactId(dto.getRelatedArtifactId())
                .relatedHeritageSiteId(dto.getRelatedHeritageSiteId())
                .quizId(dto.getQuizId())
                .isPublic(dto.getIsPublic())
                .isActive(dto.getIsActive())
                .publishedDate(dto.getPublishedDate())
                .createdBy(dto.getCreatedBy())
                .createdDate(dto.getCreatedDate())
                .updatedBy(dto.getUpdatedBy())
                .updatedDate(dto.getUpdatedDate())
                .build();
    }
}