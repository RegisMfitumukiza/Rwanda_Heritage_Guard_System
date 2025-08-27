package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.model.User;
import com.rwandaheritage.heritageguard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserLanguagePreferenceService {
    
    private final UserRepository userRepository;
    private final MultilingualIntegrationService multilingualService;
    
    /**
     * Get user's preferred language
     */
    @Transactional(readOnly = true)
    public String getUserPreferredLanguage(String username) {
        log.debug("Getting preferred language for user: {}", username);
        
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            log.warn("User not found: {}", username);
            return "en"; // Default fallback
        }
        
        User user = userOpt.get();
        String preferredLanguage = user.getPreferredLanguage();
        
        if (preferredLanguage == null || preferredLanguage.trim().isEmpty()) {
            log.debug("No preferred language set for user: {}, using default", username);
            return "en"; // Default fallback
        }
        
        // Validate language code
        if (!isValidLanguageCode(preferredLanguage)) {
            log.warn("Invalid language code for user {}: {}, using default", username, preferredLanguage);
            return "en"; // Default fallback
        }
        
        return preferredLanguage;
    }
    
    /**
     * Set user's preferred language
     */
    public void setUserPreferredLanguage(String username, String languageCode) {
        log.info("Setting preferred language for user {}: {}", username, languageCode);
        
        if (!isValidLanguageCode(languageCode)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Invalid language code. Must be 'en', 'rw', or 'fr'");
        }
        
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        
        User user = userOpt.get();
        user.setPreferredLanguage(languageCode);
        userRepository.save(user);
        
        log.info("Updated preferred language for user {}: {}", username, languageCode);
    }
    
    /**
     * Get user's additional languages
     */
    @Transactional(readOnly = true)
    public List<String> getUserAdditionalLanguages(String username) {
        log.debug("Getting additional languages for user: {}", username);
        
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            log.warn("User not found: {}", username);
            return List.of(); // Empty list
        }
        
        User user = userOpt.get();
        List<String> additionalLanguages = user.getAdditionalLanguages();
        
        if (additionalLanguages == null) {
            return List.of(); // Empty list
        }
        
        // Filter out invalid language codes
        return additionalLanguages.stream()
            .filter(this::isValidLanguageCode)
            .toList();
    }
    
    /**
     * Add additional language to user
     */
    public void addUserAdditionalLanguage(String username, String languageCode) {
        log.info("Adding additional language for user {}: {}", username, languageCode);
        
        if (!isValidLanguageCode(languageCode)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Invalid language code. Must be 'en', 'rw', or 'fr'");
        }
        
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        
        User user = userOpt.get();
        List<String> additionalLanguages = user.getAdditionalLanguages();
        
        if (additionalLanguages == null) {
            additionalLanguages = List.of();
        }
        
        // Check if language already exists
        if (additionalLanguages.contains(languageCode)) {
            log.warn("Language {} already exists for user {}", languageCode, username);
            return;
        }
        
        // Add new language
        List<String> updatedLanguages = new java.util.ArrayList<>(additionalLanguages);
        updatedLanguages.add(languageCode);
        user.setAdditionalLanguages(updatedLanguages);
        userRepository.save(user);
        
        log.info("Added additional language for user {}: {}", username, languageCode);
    }
    
    /**
     * Remove additional language from user
     */
    public void removeUserAdditionalLanguage(String username, String languageCode) {
        log.info("Removing additional language for user {}: {}", username, languageCode);
        
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        
        User user = userOpt.get();
        List<String> additionalLanguages = user.getAdditionalLanguages();
        
        if (additionalLanguages == null || !additionalLanguages.contains(languageCode)) {
            log.warn("Language {} not found for user {}", languageCode, username);
            return;
        }
        
        // Remove language
        List<String> updatedLanguages = new java.util.ArrayList<>(additionalLanguages);
        updatedLanguages.remove(languageCode);
        user.setAdditionalLanguages(updatedLanguages);
        userRepository.save(user);
        
        log.info("Removed additional language for user {}: {}", username, languageCode);
    }
    
    /**
     * Get all languages for user (preferred + additional)
     */
    @Transactional(readOnly = true)
    public List<String> getAllUserLanguages(String username) {
        log.debug("Getting all languages for user: {}", username);
        
        String preferredLanguage = getUserPreferredLanguage(username);
        List<String> additionalLanguages = getUserAdditionalLanguages(username);
        
        List<String> allLanguages = new java.util.ArrayList<>();
        allLanguages.add(preferredLanguage);
        allLanguages.addAll(additionalLanguages);
        
        // Remove duplicates and return
        return allLanguages.stream().distinct().toList();
    }
    
    /**
     * Check if user can understand a specific language
     */
    @Transactional(readOnly = true)
    public boolean canUserUnderstandLanguage(String username, String languageCode) {
        log.debug("Checking if user {} can understand language: {}", username, languageCode);
        
        if (!isValidLanguageCode(languageCode)) {
            return false;
        }
        
        List<String> userLanguages = getAllUserLanguages(username);
        return userLanguages.contains(languageCode);
    }
    
    /**
     * Get best available language for user from a list of available languages
     */
    @Transactional(readOnly = true)
    public String getBestAvailableLanguage(String username, List<String> availableLanguages) {
        log.debug("Getting best available language for user {} from: {}", username, availableLanguages);
        
        List<String> userLanguages = getAllUserLanguages(username);
        
        // First try preferred language
        String preferredLanguage = getUserPreferredLanguage(username);
        if (availableLanguages.contains(preferredLanguage)) {
            return preferredLanguage;
        }
        
        // Then try additional languages in order
        for (String userLanguage : userLanguages) {
            if (availableLanguages.contains(userLanguage)) {
                return userLanguage;
            }
        }
        
        // Fallback to first available language or default
        if (!availableLanguages.isEmpty()) {
            return availableLanguages.get(0);
        }
        
        return "en"; // Ultimate fallback
    }
    
    /**
     * Validate language code
     */
    private boolean isValidLanguageCode(String languageCode) {
        return "en".equals(languageCode) || "rw".equals(languageCode) || "fr".equals(languageCode);
    }
} 