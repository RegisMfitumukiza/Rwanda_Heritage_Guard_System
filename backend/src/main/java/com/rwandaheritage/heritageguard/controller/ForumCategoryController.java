package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.dto.ForumCategoryDTO;
import com.rwandaheritage.heritageguard.service.ForumCategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/forum/categories")
@RequiredArgsConstructor
@Slf4j
public class ForumCategoryController {

    private final ForumCategoryService categoryService;

    /**
     * Create a new forum category
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER')")
    public ResponseEntity<ForumCategoryDTO> createCategory(
            @Valid @RequestBody ForumCategoryDTO categoryDTO,
            Authentication authentication) {
        log.info("Creating forum category: {}", categoryDTO.getName());
        
        String currentUser = authentication.getName();
        ForumCategoryDTO createdCategory = categoryService.createCategory(categoryDTO, currentUser);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCategory);
    }

    /**
     * Get all forum categories (public access)
     */
    @GetMapping
    public ResponseEntity<List<ForumCategoryDTO>> getAllCategories(
            @RequestParam(required = false) String language,
            @RequestParam(required = false) Boolean isPublic) {
        log.debug("Fetching forum categories with filters - language: {}, isPublic: {}", language, isPublic);
        
        List<ForumCategoryDTO> categories = categoryService.getAllCategories(language, isPublic);
        return ResponseEntity.ok(categories);
    }

    /**
     * Get category by ID (public access)
     */
    @GetMapping("/{id}")
    public ResponseEntity<ForumCategoryDTO> getCategoryById(@PathVariable Long id) {
        log.debug("Fetching forum category by ID: {}", id);
        
        return categoryService.getCategoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update forum category
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER')")
    public ResponseEntity<ForumCategoryDTO> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody ForumCategoryDTO categoryDTO,
            Authentication authentication) {
        log.info("Updating forum category with ID: {}", id);
        
        String currentUser = authentication.getName();
        String currentUserRole = authentication.getAuthorities().stream()
                .findFirst()
                .map(Object::toString)
                .orElse("ROLE_GUEST");
        
        ForumCategoryDTO updatedCategory = categoryService.updateCategory(id, categoryDTO, currentUser, currentUserRole);
        
        return ResponseEntity.ok(updatedCategory);
    }

    /**
     * Delete forum category (soft delete)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER')")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable Long id,
            Authentication authentication) {
        log.info("Deleting forum category with ID: {}", id);
        
        String currentUser = authentication.getName();
        String currentUserRole = authentication.getAuthorities().stream()
                .findFirst()
                .map(Object::toString)
                .orElse("ROLE_GUEST");
        
        categoryService.deleteCategory(id, currentUser, currentUserRole);
        
        return ResponseEntity.noContent().build();
    }

    /**
     * Search categories by name or description
     */
    @GetMapping("/search")
    public ResponseEntity<List<ForumCategoryDTO>> searchCategories(
            @RequestParam String searchTerm) {
        log.debug("Searching forum categories with term: {}", searchTerm);
        
        List<ForumCategoryDTO> categories = categoryService.searchCategories(searchTerm);
        return ResponseEntity.ok(categories);
    }
} 