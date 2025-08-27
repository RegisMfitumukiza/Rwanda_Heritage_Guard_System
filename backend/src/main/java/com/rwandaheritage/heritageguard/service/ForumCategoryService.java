package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.dto.ForumCategoryDTO;
import com.rwandaheritage.heritageguard.mapper.ForumCategoryMapper;
import com.rwandaheritage.heritageguard.model.ForumCategory;
import com.rwandaheritage.heritageguard.repository.ForumCategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ForumCategoryService {
    
    private final ForumCategoryRepository categoryRepository;
    
    /**
     * Create a new forum category
     */
    public ForumCategoryDTO createCategory(ForumCategoryDTO categoryDTO, String currentUser) {
        log.info("Creating new forum category: {}", categoryDTO.getName());
        
        // Validate category name uniqueness
        if (categoryRepository.existsByNameIgnoreCaseAndIsActiveTrue(categoryDTO.getName())) {
            throw new IllegalArgumentException("Category name already exists: " + categoryDTO.getName());
        }
        
        ForumCategory category = ForumCategoryMapper.toEntity(categoryDTO);
        category.setCreatedBy(currentUser);
        category.setUpdatedBy(currentUser);
        
        ForumCategory savedCategory = categoryRepository.save(category);
        log.info("Created forum category with ID: {}", savedCategory.getId());
        
        return ForumCategoryMapper.toDTO(savedCategory);
    }
    
    /**
     * Get category by ID
     */
    @Transactional(readOnly = true)
    public Optional<ForumCategoryDTO> getCategoryById(Long id) {
        log.debug("Fetching category by ID: {}", id);
        return categoryRepository.findById(id)
                .map(ForumCategoryMapper::toDTO);
    }
    
    /**
     * Get all active categories
     */
    @Transactional(readOnly = true)
    public List<ForumCategoryDTO> getAllActiveCategories() {
        log.debug("Fetching all active categories");
        return categoryRepository.findByIsActiveTrue()
                .stream()
                .map(ForumCategoryMapper::toDTO)
                .toList();
    }

    /**
     * Get all categories with optional filtering
     */
    @Transactional(readOnly = true)
    public List<ForumCategoryDTO> getAllCategories(String language, Boolean isPublic) {
        log.debug("Fetching categories with filters - language: {}, isPublic: {}", language, isPublic);
        
        if (language != null && isPublic != null) {
            if (isPublic) {
                return getPublicCategoriesByLanguage(language);
            } else {
                return getCategoriesByLanguage(language);
            }
        } else if (language != null) {
            return getCategoriesByLanguage(language);
        } else if (isPublic != null) {
            if (isPublic) {
                return getPublicCategories();
            } else {
                return getAllActiveCategories();
            }
        } else {
            return getAllActiveCategories();
        }
    }
    
    /**
     * Get all public and active categories
     */
    @Transactional(readOnly = true)
    public List<ForumCategoryDTO> getPublicCategories() {
        log.debug("Fetching public categories");
        return categoryRepository.findByIsPublicTrueAndIsActiveTrue()
                .stream()
                .map(ForumCategoryMapper::toDTO)
                .toList();
    }
    
    /**
     * Get categories by language
     */
    @Transactional(readOnly = true)
    public List<ForumCategoryDTO> getCategoriesByLanguage(String language) {
        log.debug("Fetching categories by language: {}", language);
        return categoryRepository.findByLanguageAndIsActiveTrue(language)
                .stream()
                .map(ForumCategoryMapper::toDTO)
                .toList();
    }
    
    /**
     * Get public categories by language
     */
    @Transactional(readOnly = true)
    public List<ForumCategoryDTO> getPublicCategoriesByLanguage(String language) {
        log.debug("Fetching public categories by language: {}", language);
        return categoryRepository.findByLanguageAndIsPublicTrueAndIsActiveTrue(language)
                .stream()
                .map(ForumCategoryMapper::toDTO)
                .toList();
    }
    
    /**
     * Search categories by name or description
     */
    @Transactional(readOnly = true)
    public List<ForumCategoryDTO> searchCategories(String searchTerm) {
        log.debug("Searching categories with term: {}", searchTerm);
        return categoryRepository.searchCategories(searchTerm)
                .stream()
                .map(ForumCategoryMapper::toDTO)
                .toList();
    }
    
    /**
     * Update category with ownership-based permissions
     */
    public ForumCategoryDTO updateCategory(Long id, ForumCategoryDTO categoryDTO, String currentUser, String currentUserRole) {
        log.info("Updating category with ID: {} by user: {} with role: {}", id, currentUser, currentUserRole);
        
        ForumCategory existingCategory = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + id));
        
        // Check ownership permissions: creator, SYSTEM_ADMINISTRATOR, HERITAGE_MANAGER, or CONTENT_MANAGER can update
        if (!currentUser.equals(existingCategory.getCreatedBy()) && 
            !"ROLE_SYSTEM_ADMINISTRATOR".equals(currentUserRole) &&
            !"ROLE_HERITAGE_MANAGER".equals(currentUserRole) &&
            !"ROLE_CONTENT_MANAGER".equals(currentUserRole)) {
            throw new SecurityException("Access denied: Only the creator, system administrator, heritage manager, or content manager can update this category");
        }
        
        // Check name uniqueness if name is being changed
        if (!existingCategory.getName().equalsIgnoreCase(categoryDTO.getName()) &&
            categoryRepository.existsByNameIgnoreCaseAndIsActiveTrue(categoryDTO.getName())) {
            throw new IllegalArgumentException("Category name already exists: " + categoryDTO.getName());
        }
        
        // Update fields
        existingCategory.setName(categoryDTO.getName());
        existingCategory.setDescription(categoryDTO.getDescription());
        existingCategory.setLanguage(categoryDTO.getLanguage());
        existingCategory.setIsPublic(categoryDTO.getIsPublic());
        existingCategory.setIsActive(categoryDTO.getIsActive());
        existingCategory.setUpdatedBy(currentUser);
        existingCategory.setUpdatedDate(LocalDateTime.now());
        
        ForumCategory updatedCategory = categoryRepository.save(existingCategory);
        log.info("Updated category with ID: {} by user: {}", updatedCategory.getId(), currentUser);
        
        return ForumCategoryMapper.toDTO(updatedCategory);
    }
    
    /**
     * Soft delete category with ownership-based permissions
     */
    public void deleteCategory(Long id, String currentUser, String currentUserRole) {
        log.info("Soft deleting category with ID: {} by user: {} with role: {}", id, currentUser, currentUserRole);
        
        ForumCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + id));
        
        // Check ownership permissions: creator, SYSTEM_ADMINISTRATOR, HERITAGE_MANAGER, or CONTENT_MANAGER can delete
        if (!currentUser.equals(category.getCreatedBy()) && 
            !"ROLE_SYSTEM_ADMINISTRATOR".equals(currentUserRole) &&
            !"ROLE_HERITAGE_MANAGER".equals(currentUserRole) &&
            !"ROLE_CONTENT_MANAGER".equals(currentUserRole)) {
            throw new SecurityException("Access denied: Only the creator, system administrator, heritage manager, or content manager can delete this category");
        }
        
        category.setIsActive(false);
        category.setUpdatedBy(currentUser);
        category.setUpdatedDate(LocalDateTime.now());
        
        categoryRepository.save(category);
        log.info("Soft deleted category with ID: {} by user: {}", id, currentUser);
    }
    
    /**
     * Get categories created by specific user
     */
    @Transactional(readOnly = true)
    public List<ForumCategoryDTO> getCategoriesByUser(String username) {
        log.debug("Fetching categories created by user: {}", username);
        return categoryRepository.findByCreatedByAndIsActiveTrue(username)
                .stream()
                .map(ForumCategoryMapper::toDTO)
                .toList();
    }
    
    /**
     * Check if category exists and is active
     */
    @Transactional(readOnly = true)
    public boolean categoryExistsAndActive(Long id) {
        return categoryRepository.findById(id)
                .map(category -> category.getIsActive())
                .orElse(false);
    }
    
    /**
     * Get category statistics
     */
    @Transactional(readOnly = true)
    public List<Object[]> getCategoryStatistics() {
        log.debug("Fetching category statistics");
        return categoryRepository.getCategoryTopicCounts();
    }
} 