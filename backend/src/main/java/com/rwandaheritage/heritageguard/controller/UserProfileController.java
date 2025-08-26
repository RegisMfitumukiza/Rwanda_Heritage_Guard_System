package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.dto.user.UserProfileDTO;
import com.rwandaheritage.heritageguard.dto.user.UserProfileUpdateRequest;
import com.rwandaheritage.heritageguard.model.User;
import com.rwandaheritage.heritageguard.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
@Slf4j
public class UserProfileController {

    private final UserProfileService userProfileService;

    @GetMapping("/{username}")
    public ResponseEntity<UserProfileDTO> getProfile(
            @PathVariable String username,
            Authentication authentication) {
        log.info("Profile request received for user: {}", username);
        User requestingUser = (User) authentication.getPrincipal();
        UserProfileDTO profile = userProfileService.getProfile(username, requestingUser);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/{username}")
    public ResponseEntity<UserProfileDTO> updateProfile(
            @PathVariable String username,
            @Valid @RequestBody UserProfileUpdateRequest request,
            Authentication authentication) {
        log.info("Profile update request received for user: {}", username);
        User requestingUser = (User) authentication.getPrincipal();
        UserProfileDTO updatedProfile = userProfileService.updateProfile(username, request, requestingUser);
        return ResponseEntity.ok(updatedProfile);
    }

    @GetMapping
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR') or hasRole('HERITAGE_MANAGER') or hasRole('CONTENT_MANAGER')")
    public ResponseEntity<List<UserProfileDTO>> getAllProfiles(Authentication authentication) {
        log.info("All profiles request received from user: {}", authentication.getName());
        User requestingUser = (User) authentication.getPrincipal();
        List<UserProfileDTO> profiles = userProfileService.getAllProfiles(requestingUser);
        return ResponseEntity.ok(profiles);
    }
} 