package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.dto.auth.AuthenticationRequest;
import com.rwandaheritage.heritageguard.dto.auth.AuthenticationResponse;
import com.rwandaheritage.heritageguard.dto.auth.RegisterRequest;
import com.rwandaheritage.heritageguard.dto.auth.MessageResponse;
import com.rwandaheritage.heritageguard.dto.auth.ForgotPasswordRequest;
import com.rwandaheritage.heritageguard.dto.auth.ResetPasswordRequest;
import com.rwandaheritage.heritageguard.service.AuthenticationService;
import com.rwandaheritage.heritageguard.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.HashMap;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        log.info("Received registration request for user: {}", request.getUsername());
        Map<String, Object> response = authenticationService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> authenticate(
            @Valid @RequestBody AuthenticationRequest request
    ) {
        log.info("Received login request for user: {}", request.getUsername());
        Map<String, Object> response = authenticationService.login(
            request.getUsername(), 
            request.getPassword(),
            request.isRememberMe()
        );
        
        // Debug logging
        log.info("Login successful for user: {}", request.getUsername());
        log.info("Response contains keys: {}", response.keySet());
        if (response.containsKey("user")) {
            Object user = response.get("user");
            log.info("User object type: {}", user.getClass().getSimpleName());
            log.info("User object: {}", user);
        }
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/google/callback")
    public ResponseEntity<AuthenticationResponse> handleGoogleCallback(
            @RequestBody Map<String, String> request
    ) {
        String code = request.get("code");
        if (code == null) {
            log.error("Google authorization code is missing");
            throw new RuntimeException("Google authorization code is required");
        }
        log.info("Received Google authorization code");
        return ResponseEntity.ok(authenticationService.handleGoogleCallback(code));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        log.info("Processing forgot password request for email: {}", request.getEmail());
        try {
            authenticationService.forgotPassword(request.getEmail());
            return ResponseEntity.ok(new MessageResponse("If an account exists with that email, we have sent password reset instructions"));
        } catch (RuntimeException e) {
            // For security reasons, don't reveal if the email exists or not
            log.warn("Error processing forgot password request: {}", e.getMessage());
            return ResponseEntity.ok(new MessageResponse("If an account exists with that email, we have sent password reset instructions"));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        log.info("Processing password reset request");
        try {
            Map<String, Object> response = authenticationService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error resetting password: {}", e.getMessage());
            throw e;
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refreshToken(@RequestBody Map<String, String> request) {
        log.info("Received token refresh request");
        try {
            String refreshToken = request.get("refreshToken");
            if (refreshToken == null) {
                throw new IllegalArgumentException("Refresh token is required");
            }
            
            Map<String, Object> response = authenticationService.refreshToken(refreshToken);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Token refresh failed: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(@RequestHeader("Authorization") String authHeader) {
        log.info("Processing logout request");
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("Invalid authorization header in logout request");
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid authorization header"));
            }
            
            String token = authHeader.substring(7); // Remove "Bearer "
            String username = jwtService.extractUsername(token);
            
            if (username == null) {
                log.warn("Could not extract username from token during logout");
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid token"));
            }
            
            authenticationService.logout(username);
            log.info("User {} logged out successfully", username);
            
            return ResponseEntity.ok()
                .body(Map.of("message", "Logout successful"));
        } catch (Exception e) {
            log.error("Logout failed: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "Logout failed", "error", e.getMessage()));
        }
    }

    @PostMapping("/verify-email")
    public ResponseEntity<MessageResponse> verifyEmail(@RequestParam String token) {
        log.info("Received email verification request");
        try {
            authenticationService.verifyEmail(token);
            return ResponseEntity.ok(new MessageResponse("Email verified successfully"));
        } catch (RuntimeException e) {
            log.error("Email verification failed: {}", e.getMessage());
            throw e;
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<MessageResponse> resendVerificationEmail(@Valid @RequestBody ForgotPasswordRequest request) {
        log.info("Received resend verification request for email: {}", request.getEmail());
        try {
            authenticationService.resendVerificationEmail(request.getEmail());
            return ResponseEntity.ok(new MessageResponse("If an account exists with that email, we have sent a new verification email"));
        } catch (RuntimeException e) {
            // For security reasons, don't reveal if the email exists or not
            log.warn("Error processing resend verification request: {}", e.getMessage());
            return ResponseEntity.ok(new MessageResponse("If an account exists with that email, we have sent a new verification email"));
        }
    }

    @PostMapping("/request-unlock")
    public ResponseEntity<MessageResponse> requestAccountUnlock(@Valid @RequestBody ForgotPasswordRequest request) {
        log.info("Received account unlock request for email: {}", request.getEmail());
        try {
            authenticationService.requestAccountUnlock(request.getEmail());
            return ResponseEntity.ok(new MessageResponse(
                "If an account exists with that email and is locked, we have sent unlock instructions"
            ));
        } catch (RuntimeException e) {
            // For security reasons, don't reveal if the email exists or not
            log.warn("Error processing unlock request: {}", e.getMessage());
            return ResponseEntity.ok(new MessageResponse(
                "If an account exists with that email and is locked, we have sent unlock instructions"
            ));
        }
    }

    @PostMapping("/unlock-account")
    public ResponseEntity<MessageResponse> unlockAccount(@RequestParam String token) {
        log.info("Processing account unlock request");
        try {
            authenticationService.unlockAccount(token);
            return ResponseEntity.ok(new MessageResponse("Account has been unlocked successfully"));
        } catch (RuntimeException e) {
            log.error("Error unlocking account: {}", e.getMessage());
            throw e;
        }
    }

    // Admin endpoint to manually unlock an account
    @PostMapping("/admin/unlock-account/{username}")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<MessageResponse> adminUnlockAccount(@PathVariable String username) {
        log.info("Admin unlocking account for user: {}", username);
        try {
            authenticationService.adminUnlockAccount(username);
            return ResponseEntity.ok(new MessageResponse("Account has been unlocked successfully"));
        } catch (RuntimeException e) {
            log.error("Error unlocking account: {}", e.getMessage());
            throw e;
        }
    }

    // First-time setup endpoint - only works when no admin exists
    @PostMapping("/first-time-setup")
    public ResponseEntity<Map<String, Object>> firstTimeSetup(@Valid @RequestBody RegisterRequest request) {
        log.info("First-time setup request for email: {}", request.getEmail());
        try {
            // Check if any admin already exists
            if (authenticationService.hasAnyAdmin()) {
                log.warn("First-time setup attempted but admin already exists");
                throw new RuntimeException("System already has an administrator. Use regular registration or admin creation endpoints.");
            }
            
            // Validate admin email pattern
            if (!request.getEmail().toLowerCase().matches("^admin\\.admin@.*$")) {
                throw new RuntimeException("First admin must use email pattern: admin.admin@domain.com");
            }
            
            Map<String, Object> response = authenticationService.firstTimeAdminSetup(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("First-time setup failed: {}", e.getMessage());
            throw e;
        }
    }


    // Admin endpoint to create Heritage Managers and Content Managers
    @PostMapping("/admin/create-user")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<Map<String, Object>> adminCreateUser(@Valid @RequestBody RegisterRequest request) {
        log.info("Admin creating user: {} with role: {}", request.getUsername(), request.getRequestedRole());
        try {
            Map<String, Object> response = authenticationService.adminCreateUser(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error creating user: {}", e.getMessage());
            throw e;
        }
    }

    @PostMapping("/test-user-data")
    public ResponseEntity<Map<String, Object>> testUserData(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof com.rwandaheritage.heritageguard.model.User) {
            com.rwandaheritage.heritageguard.model.User user = (com.rwandaheritage.heritageguard.model.User) authentication.getPrincipal();
            
            Map<String, Object> testData = new HashMap<>();
            testData.put("username", user.getUsername());
            testData.put("role", user.getRole());
            testData.put("roleName", user.getRole().name());
            testData.put("enabled", user.isEnabled());
            testData.put("accountNonLocked", user.isAccountNonLocked());
            
            log.info("Test user data endpoint called for user: {} with role: {}", user.getUsername(), user.getRole());
            
            return ResponseEntity.ok(testData);
        }
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of("error", "No authenticated user found"));
    }
} 