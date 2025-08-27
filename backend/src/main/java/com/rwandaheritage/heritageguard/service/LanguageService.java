package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.constants.LanguageConstants;
import com.rwandaheritage.heritageguard.dto.LanguageDTO;
import com.rwandaheritage.heritageguard.mapper.LanguageMapper;
import com.rwandaheritage.heritageguard.model.Language;
import com.rwandaheritage.heritageguard.repository.LanguageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LanguageService {
    
    private final LanguageRepository languageRepository;
    
    @Transactional(readOnly = true)
    @Cacheable(value = "languages", key = "'active'")
    public List<LanguageDTO> getActiveLanguages() {
        log.debug("Fetching all active languages");
        List<Language> languages = languageRepository.findActiveLanguagesOrdered();
        return languages.stream()
                .map(LanguageMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<LanguageDTO> getAllLanguages() {
        log.debug("Fetching all languages");
        List<Language> languages = languageRepository.findAll();
        return languages.stream()
                .map(LanguageMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public LanguageDTO getLanguageById(Long id) {
        log.debug("Fetching language by ID: {}", id);
        Optional<Language> language = languageRepository.findById(id);
        return language.map(LanguageMapper::toDTO)
                .orElseThrow(() -> new RuntimeException("Language not found with ID: " + id));
    }
    
    @Transactional(readOnly = true)
    @Cacheable(value = "languages", key = "#code")
    public LanguageDTO getLanguageByCode(String code) {
        log.debug("Fetching language by code: {}", code);
        Optional<Language> language = languageRepository.findByCodeAndIsActiveTrue(code);
        return language.map(LanguageMapper::toDTO)
                .orElseThrow(() -> new RuntimeException("Language not found with code: " + code));
    }
    
    @Transactional(readOnly = true)
    @Cacheable(value = "languages", key = "'default'")
    public LanguageDTO getDefaultLanguage() {
        log.debug("Fetching default language");
        Optional<Language> language = languageRepository.findByIsDefaultTrue();
        return language.map(LanguageMapper::toDTO)
                .orElseThrow(() -> new RuntimeException("No default language found"));
    }
    
    @Transactional
    @CacheEvict(value = "languages", allEntries = true)
    public LanguageDTO addLanguage(LanguageDTO languageDTO, String currentUser) {
        log.debug("Adding new language: {}", languageDTO.getCode());
        
        if (languageRepository.existsByCode(languageDTO.getCode())) {
            throw new RuntimeException("Language with code '" + languageDTO.getCode() + "' already exists");
        }
        
        if (languageDTO.isDefault()) {
            unsetOtherDefaults();
        }
        
        Language language = LanguageMapper.toEntity(languageDTO);
        language.setCreatedBy(currentUser);
        language.setCreatedDate(LocalDateTime.now());
        language.setUpdatedBy(currentUser);
        language.setUpdatedDate(LocalDateTime.now());
        
        Language savedLanguage = languageRepository.save(language);
        log.info("Added new language: {} by user: {}", savedLanguage.getCode(), currentUser);
        
        return LanguageMapper.toDTO(savedLanguage);
    }
    
    @Transactional
    @CacheEvict(value = "languages", allEntries = true)
    public LanguageDTO updateLanguage(Long id, LanguageDTO languageDTO, String currentUser) {
        log.debug("Updating language with ID: {}", id);
        
        Language existingLanguage = languageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Language not found with ID: " + id));
        
        if (!existingLanguage.getCode().equals(languageDTO.getCode()) && 
            languageRepository.existsByCode(languageDTO.getCode())) {
            throw new RuntimeException("Language with code '" + languageDTO.getCode() + "' already exists");
        }
        
        if (languageDTO.isDefault() && !existingLanguage.isDefault()) {
            unsetOtherDefaults();
        }
        
        existingLanguage.setCode(languageDTO.getCode());
        existingLanguage.setName(languageDTO.getName());
        existingLanguage.setDefault(languageDTO.isDefault());
        existingLanguage.setActive(languageDTO.isActive());
        existingLanguage.setUpdatedBy(currentUser);
        existingLanguage.setUpdatedDate(LocalDateTime.now());
        
        Language savedLanguage = languageRepository.save(existingLanguage);
        log.info("Updated language: {} by user: {}", savedLanguage.getCode(), currentUser);
        
        return LanguageMapper.toDTO(savedLanguage);
    }
    
    @Transactional
    @CacheEvict(value = "languages", allEntries = true)
    public void deleteLanguage(Long id, String currentUser) {
        log.debug("Deleting language with ID: {}", id);
        
        Language language = languageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Language not found with ID: " + id));
        
        if (language.isDefault()) {
            throw new RuntimeException("Cannot delete default language");
        }
        
        languageRepository.delete(language);
        log.info("Deleted language: {} by user: {}", language.getCode(), currentUser);
    }
    
    @Transactional
    public LanguageDTO setDefaultLanguage(String languageCode, String currentUser) {
        log.debug("Setting default language to: {}", languageCode);
        
        Language language = languageRepository.findByCodeAndIsActiveTrue(languageCode)
                .orElseThrow(() -> new RuntimeException("Language not found with code: " + languageCode));
        
        unsetOtherDefaults();
        
        language.setDefault(true);
        language.setUpdatedBy(currentUser);
        language.setUpdatedDate(LocalDateTime.now());
        
        Language savedLanguage = languageRepository.save(language);
        log.info("Set default language to: {} by user: {}", savedLanguage.getCode(), currentUser);
        
        return LanguageMapper.toDTO(savedLanguage);
    }
    
    @Transactional
    public LanguageDTO toggleLanguageStatus(Long id, String currentUser) {
        log.debug("Toggling language status for ID: {}", id);
        
        Language language = languageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Language not found with ID: " + id));
        
        if (language.isDefault() && language.isActive()) {
            throw new RuntimeException("Cannot deactivate default language");
        }
        
        language.setActive(!language.isActive());
        language.setUpdatedBy(currentUser);
        language.setUpdatedDate(LocalDateTime.now());
        
        Language savedLanguage = languageRepository.save(language);
        log.info("Toggled language status: {} to {} by user: {}", 
                savedLanguage.getCode(), savedLanguage.isActive(), currentUser);
        
        return LanguageMapper.toDTO(savedLanguage);
    }
    
    @Transactional
    public void initializeDefaultLanguages(String currentUser) {
        log.debug("Initializing default languages");
        
        if (languageRepository.count() > 0) {
            log.info("Languages already exist, skipping initialization");
            return;
        }
        
        createLanguageIfNotExists(LanguageConstants.ENGLISH, LanguageConstants.ENGLISH_NAME, true, currentUser);
        createLanguageIfNotExists(LanguageConstants.KINYARWANDA, LanguageConstants.KINYARWANDA_NAME, false, currentUser);
        createLanguageIfNotExists(LanguageConstants.FRENCH, LanguageConstants.FRENCH_NAME, false, currentUser);
        
        log.info("Initialized default languages");
    }
    
    private void unsetOtherDefaults() {
        Optional<Language> defaultLanguage = languageRepository.findByIsDefaultTrue();
        if (defaultLanguage.isPresent()) {
            Language lang = defaultLanguage.get();
            lang.setDefault(false);
            languageRepository.save(lang);
        }
    }
    
    private void createLanguageIfNotExists(String code, String name, boolean isDefault, String currentUser) {
        if (!languageRepository.existsByCode(code)) {
            Language language = Language.builder()
                    .code(code)
                    .name(name)
                    .isDefault(isDefault)
                    .isActive(true)
                    .createdBy(currentUser)
                    .createdDate(LocalDateTime.now())
                    .updatedBy(currentUser)
                    .updatedDate(LocalDateTime.now())
                    .build();
            
            languageRepository.save(language);
            log.debug("Created language: {}", code);
        }
    }
    
    /**
     * Get language statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getLanguageStatistics() {
        log.debug("Getting language statistics");
        
        Map<String, Object> statistics = new HashMap<>();
        
        // Total languages
        long totalLanguages = languageRepository.count();
        statistics.put("totalLanguages", totalLanguages);
        
        // Active languages
        long activeLanguages = languageRepository.countByIsActiveTrue();
        statistics.put("activeLanguages", activeLanguages);
        
        // Inactive languages
        long inactiveLanguages = totalLanguages - activeLanguages;
        statistics.put("inactiveLanguages", inactiveLanguages);
        
        // Default language
        Optional<Language> defaultLanguage = languageRepository.findByIsDefaultTrue();
        if (defaultLanguage.isPresent()) {
            statistics.put("defaultLanguage", defaultLanguage.get().getCode());
        }
        
        // Languages by code
        List<Language> allLanguages = languageRepository.findAll();
        Map<String, String> languagesByCode = allLanguages.stream()
                .collect(Collectors.toMap(Language::getCode, Language::getName));
        statistics.put("languagesByCode", languagesByCode);
        
        // Recent activity (languages updated in last 30 days)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        long recentlyUpdated = allLanguages.stream()
                .filter(lang -> lang.getUpdatedDate() != null && lang.getUpdatedDate().isAfter(thirtyDaysAgo))
                .count();
        statistics.put("recentlyUpdated", recentlyUpdated);
        
        log.debug("Language statistics: {}", statistics);
        return statistics;
    }
}