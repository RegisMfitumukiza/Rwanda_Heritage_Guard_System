package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.dto.TranslationDTO;
import com.rwandaheritage.heritageguard.mapper.TranslationMapper;
import com.rwandaheritage.heritageguard.model.Translation;
import com.rwandaheritage.heritageguard.repository.TranslationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TranslationService {
    
    private final TranslationRepository translationRepository;
    
    /**
     * Get translated text for any content
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "translations", key = "#contentType + '_' + #contentId + '_' + #fieldName + '_' + #languageCode")
    public String getTranslatedText(String contentType, Long contentId, String fieldName, String languageCode) {
        log.debug("Getting translation for content: {}:{}, field: {}, language: {}", 
                contentType, contentId, fieldName, languageCode);
        
        try {
            Translation.ContentType type = Translation.ContentType.valueOf(contentType.toUpperCase());
            Optional<Translation> translation = translationRepository
                    .findByContentTypeAndContentIdAndFieldNameAndLanguageCode(type, contentId, fieldName, languageCode);
            
            return translation.map(Translation::getTranslatedText).orElse(null);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid content type: {}", contentType);
            return null;
        }
    }
    
    /**
     * Save translation
     */
    @Transactional
    @CacheEvict(value = "translations", allEntries = true)
    public TranslationDTO saveTranslation(TranslationDTO translationDTO, String currentUser) {
        log.debug("Saving translation for content: {}:{}, field: {}, language: {}", 
                translationDTO.getContentType(), translationDTO.getContentId(), 
                translationDTO.getFieldName(), translationDTO.getLanguageCode());
        
        try {
            Translation.ContentType contentType = Translation.ContentType.valueOf(translationDTO.getContentType().toUpperCase());
            
            // Check if translation already exists
            Optional<Translation> existingTranslation = translationRepository
                    .findByContentTypeAndContentIdAndFieldNameAndLanguageCode(
                            contentType, translationDTO.getContentId(), 
                            translationDTO.getFieldName(), translationDTO.getLanguageCode());
            
            Translation translation;
            if (existingTranslation.isPresent()) {
                // Update existing translation
                translation = existingTranslation.get();
                translation.setTranslatedText(translationDTO.getTranslatedText());
                translation.setStatus(Translation.TranslationStatus.valueOf(translationDTO.getStatus()));
                translation.setUpdatedBy(currentUser);
                translation.setUpdatedDate(LocalDateTime.now());
                log.debug("Updating existing translation");
            } else {
                // Create new translation
                translation = TranslationMapper.toEntity(translationDTO);
                translation.setCreatedBy(currentUser);
                translation.setCreatedDate(LocalDateTime.now());
                translation.setUpdatedBy(currentUser);
                translation.setUpdatedDate(LocalDateTime.now());
                log.debug("Creating new translation");
            }
            
            Translation savedTranslation = translationRepository.save(translation);
            log.info("Saved translation for content: {}:{}, field: {}, language: {} by user: {}", 
                    savedTranslation.getContentType(), savedTranslation.getContentId(),
                    savedTranslation.getFieldName(), savedTranslation.getLanguageCode(), currentUser);
            
            return TranslationMapper.toDTO(savedTranslation);
            
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid content type: " + translationDTO.getContentType());
        }
    }
    
    /**
     * Get all translations for a content
     */
    @Transactional(readOnly = true)
    public List<TranslationDTO> getTranslationsForContent(String contentType, Long contentId) {
        log.debug("Getting translations for content: {}:{}", contentType, contentId);
        
        try {
            Translation.ContentType type = Translation.ContentType.valueOf(contentType.toUpperCase());
            List<Translation> translations = translationRepository.findByContentTypeAndContentId(type, contentId);
            
            return translations.stream()
                    .map(TranslationMapper::toDTO)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            log.warn("Invalid content type: {}", contentType);
            return List.of();
        }
    }
    
    /**
     * Get translations by content type and language
     */
    @Transactional(readOnly = true)
    public List<TranslationDTO> getTranslationsByTypeAndLanguage(String contentType, String languageCode) {
        log.debug("Getting translations for type: {} and language: {}", contentType, languageCode);
        
        try {
            Translation.ContentType type = Translation.ContentType.valueOf(contentType.toUpperCase());
            List<Translation> translations = translationRepository.findByContentTypeAndLanguageCode(type, languageCode);
            
            return translations.stream()
                    .map(TranslationMapper::toDTO)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            log.warn("Invalid content type: {}", contentType);
            return List.of();
        }
    }
    
    /**
     * Search translations with filters
     */
    @Transactional(readOnly = true)
    public List<TranslationDTO> searchTranslations(String contentType, Long contentId, 
                                                  String languageCode, String fieldName, String status) {
        log.debug("Searching translations with filters");
        
        Translation.ContentType type = null;
        Translation.TranslationStatus translationStatus = null;
        
        if (contentType != null) {
            try {
                type = Translation.ContentType.valueOf(contentType.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid content type: {}", contentType);
                return List.of();
            }
        }
        
        if (status != null) {
            try {
                translationStatus = Translation.TranslationStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status: {}", status);
                return List.of();
            }
        }
        
        List<Translation> translations = translationRepository.searchTranslations(
                type, contentId, languageCode, fieldName, translationStatus);
        
        return translations.stream()
                .map(TranslationMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Delete translation
     */
    @Transactional
    public void deleteTranslation(Long id, String currentUser) {
        log.debug("Deleting translation with ID: {}", id);
        
        Translation translation = translationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Translation not found with ID: " + id));
        
        translationRepository.delete(translation);
        log.info("Deleted translation: {} by user: {}", id, currentUser);
    }
    
    /**
     * Batch save translations
     */
    @Transactional
    public List<TranslationDTO> batchSaveTranslations(List<TranslationDTO> translationDTOs, String currentUser) {
        log.debug("Batch saving {} translations", translationDTOs.size());
        
        List<TranslationDTO> savedTranslations = translationDTOs.stream()
                .map(dto -> saveTranslation(dto, currentUser))
                .collect(Collectors.toList());
        
        log.info("Batch saved {} translations by user: {}", savedTranslations.size(), currentUser);
        return savedTranslations;
    }
    
    /**
     * Check if translation exists
     */
    @Transactional(readOnly = true)
    public boolean translationExists(String contentType, Long contentId, String fieldName, String languageCode) {
        try {
            Translation.ContentType type = Translation.ContentType.valueOf(contentType.toUpperCase());
            return translationRepository.existsByContentTypeAndContentIdAndFieldNameAndLanguageCode(
                    type, contentId, fieldName, languageCode);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid content type: {}", contentType);
            return false;
        }
    }
    
    /**
     * Update translation status
     */
    @Transactional
    @CacheEvict(value = "translations", allEntries = true)
    public TranslationDTO updateTranslationStatus(Long id, String status, String currentUser) {
        log.debug("Updating translation status for ID: {} to: {}", id, status);
        
        Translation translation = translationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Translation not found with ID: " + id));
        
        try {
            Translation.TranslationStatus newStatus = Translation.TranslationStatus.valueOf(status.toUpperCase());
            translation.setStatus(newStatus);
            translation.setUpdatedBy(currentUser);
            translation.setUpdatedDate(LocalDateTime.now());
            
            Translation savedTranslation = translationRepository.save(translation);
            log.info("Updated translation status: {} to: {} by user: {}", id, status, currentUser);
            
            return TranslationMapper.toDTO(savedTranslation);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + status);
        }
    }
    
    /**
     * Get translations by status
     */
    @Transactional(readOnly = true)
    public List<TranslationDTO> getTranslationsByStatus(String status) {
        log.debug("Getting translations by status: {}", status);
        
        try {
            Translation.TranslationStatus translationStatus = Translation.TranslationStatus.valueOf(status.toUpperCase());
            List<Translation> translations = translationRepository.findByStatus(translationStatus);
            
            return translations.stream()
                    .map(TranslationMapper::toDTO)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            log.warn("Invalid status: {}", status);
            return List.of();
        }
    }
}


