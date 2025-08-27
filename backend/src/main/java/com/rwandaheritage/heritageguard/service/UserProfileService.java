package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.dto.user.UserProfileDTO;
import com.rwandaheritage.heritageguard.dto.user.UserProfileUpdateRequest;
import com.rwandaheritage.heritageguard.model.User;
import com.rwandaheritage.heritageguard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserProfileService {
    
    private final UserRepository userRepository;
    
    @Transactional(readOnly = true)
    public UserProfileDTO getProfile(String username, User requestingUser) {
        log.info("Fetching profile for user: {} by requesting user: {}", username, requestingUser.getUsername());
        
        User targetUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
        
        if (!canViewProfile(requestingUser, targetUser)) {
            throw new AccessDeniedException("Access denied to view profile");
        }
        
        return mapToProfileDTO(targetUser);
    }
    
    @Transactional
    public UserProfileDTO updateProfile(String username, UserProfileUpdateRequest request, User requestingUser) {
        log.info("Updating profile for user: {} by requesting user: {}", username, requestingUser.getUsername());
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
        
        if (!canUpdateProfile(requestingUser, user)) {
            throw new AccessDeniedException("Access denied to update profile");
        }
        
        // Update basic profile information
        updateBasicProfileInfo(user, request);

        user.updateProfileTimestamp();
        user.updateLastActivity();
        
        User updatedUser = userRepository.save(user);
        log.info("Profile updated successfully for user: {}", username);
        
        return mapToProfileDTO(updatedUser);
    }
    
    @Transactional(readOnly = true)
    public List<UserProfileDTO> getAllProfiles(User requestingUser) {
        log.info("Fetching all profiles by user: {}", requestingUser.getUsername());
        
        if (canViewAllProfiles(requestingUser)) {
            return userRepository.findAll().stream()
                    .map(this::mapToProfileDTO)
                    .toList();
        } else {
            throw new AccessDeniedException("Access denied to view all profiles");
        }
    }
    
    private boolean canViewProfile(User requestingUser, User targetUser) {
        // Users can always view their own profile
        if (requestingUser.getUsername().equals(targetUser.getUsername())) {
            return true;
        }

        // System administrators can view all profiles
        if (requestingUser.getRole() == User.Role.SYSTEM_ADMINISTRATOR) {
            return true;
        }

        // Heritage Managers and Content Managers can view community member profiles
        if ((requestingUser.getRole() == User.Role.HERITAGE_MANAGER || 
             requestingUser.getRole() == User.Role.CONTENT_MANAGER) && 
            targetUser.getRole() == User.Role.COMMUNITY_MEMBER) {
            return true;
        }

        return false;
    }

    private boolean canUpdateProfile(User requestingUser, User targetUser) {
        // Users can always update their own profile
        if (requestingUser.getUsername().equals(targetUser.getUsername())) {
            return true;
        }

        // System administrators can update all profiles
        if (requestingUser.getRole() == User.Role.SYSTEM_ADMINISTRATOR) {
            return true;
        }

        return false;
    }

    private boolean canViewAllProfiles(User requestingUser) {
        return requestingUser.getRole() == User.Role.SYSTEM_ADMINISTRATOR ||
               requestingUser.getRole() == User.Role.HERITAGE_MANAGER ||
               requestingUser.getRole() == User.Role.CONTENT_MANAGER;
    }



    private void updateBasicProfileInfo(User user, UserProfileUpdateRequest request) {
        if (request.getUsername() != null) user.setUsername(request.getUsername());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getFullName() != null) {
            // Split full name into first and last name
            String[] nameParts = request.getFullName().split(" ", 2);
            user.setFirstName(nameParts[0]);
            user.setLastName(nameParts.length > 1 ? nameParts[1] : null);
        }
        if (request.getProfilePictureUrl() != null) user.setProfilePictureUrl(request.getProfilePictureUrl());
        if (request.getPreferredLanguage() != null) user.setPreferredLanguage(request.getPreferredLanguage());
        if (request.getAdditionalLanguages() != null) user.setAdditionalLanguages(java.util.Arrays.asList(request.getAdditionalLanguages()));
        if (request.getEmailNotifications() != null) user.setEmailNotifications(request.getEmailNotifications());
        if (request.getPushNotifications() != null) user.setPushNotifications(request.getPushNotifications());
    }



    private UserProfileDTO mapToProfileDTO(User user) {
        UserProfileDTO dto = new UserProfileDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setRole(user.getRole());
        dto.setProfilePictureUrl(user.getProfilePictureUrl());
        dto.setPreferredLanguage(user.getPreferredLanguage());
        dto.setAdditionalLanguages(user.getAdditionalLanguages() != null ? user.getAdditionalLanguages().toArray(new String[0]) : new String[0]);
        dto.setEmailNotifications(user.getEmailNotifications());
        dto.setPushNotifications(user.getPushNotifications());
        dto.setDateCreated(user.getDateCreated());
        dto.setLastLogin(user.getLastLogin());
        dto.setLastProfileUpdate(user.getLastProfileUpdate());
        dto.setEmailVerified(user.isEmailVerified());
        dto.setEnabled(user.isEnabled());
        return dto;
    }
} 