package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.dto.auth.AuthenticationRequest;
import com.rwandaheritage.heritageguard.dto.auth.AuthenticationResponse;
import com.rwandaheritage.heritageguard.dto.auth.RegisterRequest;
import com.rwandaheritage.heritageguard.model.User;
import com.rwandaheritage.heritageguard.repository.UserRepository;
import com.rwandaheritage.heritageguard.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.http.GenericUrl;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import java.util.regex.Pattern;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import com.rwandaheritage.heritageguard.dto.user.UserProfileDTO;
import com.rwandaheritage.heritageguard.model.UserStatus;


@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;


    @Value("${google.client.id}")
    private String googleClientId;

    @Value("${google.client.secret}")
    private String googleClientSecret;

    @Value("${frontend.url}")
    private String frontendUrl;

    private static final int MIN_PASSWORD_LENGTH = 8;
    private static final int MAX_PASSWORD_LENGTH = 128;
    private static final Pattern UPPERCASE_PATTERN = Pattern.compile("[A-Z]");
    private static final Pattern LOWERCASE_PATTERN = Pattern.compile("[a-z]");
    private static final Pattern DIGIT_PATTERN = Pattern.compile("\\d");
    private static final Pattern SPECIAL_CHAR_PATTERN = Pattern.compile("[!@#$%^&*(),.?\":{}|<>]");
    private static final Pattern COMMON_PASSWORDS_PATTERN = Pattern.compile(
        "^(password|123456|qwerty|admin|welcome|letmein|monkey|dragon|baseball|football)$",
        Pattern.CASE_INSENSITIVE
    );

    // Email pattern constants for role determination
    private static final Pattern HERITAGE_MANAGER_PATTERN = Pattern.compile("^manager\\d+\\.heritage@.*$");
    private static final Pattern CONTENT_MANAGER_PATTERN = Pattern.compile("^manager\\d+\\.content@.*$");
    private static final Pattern ADMIN_PATTERN = Pattern.compile("^admin\\.admin@.*$");
    
    // Role validation constants
    private static final int MAX_MANAGERS_PER_TYPE = 10; // Limit managers per type
    private static final String DEFAULT_LANGUAGE = "en";

    public enum PasswordStrength {
        WEAK("Weak"),
        MEDIUM("Medium"),
        STRONG("Strong"),
        VERY_STRONG("Very Strong");

        private final String displayName;

        PasswordStrength(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    private static class PasswordStrengthResult {
        private final PasswordStrength strength;
        private final int score;
        private final List<String> feedback;

        public PasswordStrengthResult(PasswordStrength strength, int score, List<String> feedback) {
            this.strength = strength;
            this.score = score;
            this.feedback = feedback;
        }

        public PasswordStrength getStrength() {
            return strength;
        }

        public int getScore() {
            return score;
        }

        public List<String> getFeedback() {
            return feedback;
        }
    }

    private PasswordStrengthResult calculatePasswordStrength(String password) {
        int score = 0;
        List<String> feedback = new ArrayList<>();

        // Length scoring
        if (password.length() >= 8) {
            score += 1;
            if (password.length() >= 12) {
                score += 1;
                if (password.length() >= 16) {
                    score += 1;
                }
            }
        }

        // Character type scoring
        if (UPPERCASE_PATTERN.matcher(password).find()) {
            score += 1;
        } else {
            feedback.add("Add uppercase letters to increase strength");
        }
        if (LOWERCASE_PATTERN.matcher(password).find()) {
            score += 1;
        } else {
            feedback.add("Add lowercase letters to increase strength");
        }
        if (DIGIT_PATTERN.matcher(password).find()) {
            score += 1;
        } else {
            feedback.add("Add numbers to increase strength");
        }
        if (SPECIAL_CHAR_PATTERN.matcher(password).find()) {
            score += 2;
        } else {
            feedback.add("Add special characters to increase strength");
        }

        // Complexity scoring
        if (!hasSequentialChars(password)) {
            score += 1;
        } else {
            feedback.add("Avoid sequential characters (e.g., '123', 'abc')");
        }
        if (!hasRepeatedChars(password)) {
            score += 1;
        } else {
            feedback.add("Avoid repeated characters");
        }
        if (!COMMON_PASSWORDS_PATTERN.matcher(password).matches()) {
            score += 2;
        } else {
            feedback.add("Avoid common passwords");
        }

        // Determine strength based on score
        PasswordStrength strength;
        if (score >= 8) {
            strength = PasswordStrength.VERY_STRONG;
        } else if (score >= 6) {
            strength = PasswordStrength.STRONG;
        } else if (score >= 4) {
            strength = PasswordStrength.MEDIUM;
        } else {
            strength = PasswordStrength.WEAK;
        }

        return new PasswordStrengthResult(strength, score, feedback);
    }

    private List<String> validatePassword(String password) {
        List<String> errors = new ArrayList<>();

        if (password == null || password.isEmpty()) {
            errors.add("Password cannot be empty");
            return errors;
        }

        // Basic validation checks
        if (password.length() < MIN_PASSWORD_LENGTH) {
            errors.add("Password must be at least " + MIN_PASSWORD_LENGTH + " characters long");
        }
        if (password.length() > MAX_PASSWORD_LENGTH) {
            errors.add("Password must not exceed " + MAX_PASSWORD_LENGTH + " characters");
        }

        // Get strength result
        PasswordStrengthResult strengthResult = calculatePasswordStrength(password);
        
        // Add strength feedback to errors if password is weak
        if (strengthResult.getStrength() == PasswordStrength.WEAK) {
            errors.add("Password is too weak. " + String.join(" ", strengthResult.getFeedback()));
        }

        // Additional validation checks
        if (!UPPERCASE_PATTERN.matcher(password).find()) {
            errors.add("Password must contain at least one uppercase letter");
        }
        if (!LOWERCASE_PATTERN.matcher(password).find()) {
            errors.add("Password must contain at least one lowercase letter");
        }
        if (!DIGIT_PATTERN.matcher(password).find()) {
            errors.add("Password must contain at least one number");
        }
        if (!SPECIAL_CHAR_PATTERN.matcher(password).find()) {
            errors.add("Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>)");
        }
        if (COMMON_PASSWORDS_PATTERN.matcher(password).matches()) {
            errors.add("Password is too common. Please choose a stronger password");
        }
        if (hasSequentialChars(password)) {
            errors.add("Password contains sequential characters (e.g., '123', 'abc')");
        }
        if (hasRepeatedChars(password)) {
            errors.add("Password contains too many repeated characters");
        }

        return errors;
    }

    private boolean hasSequentialChars(String password) {
        // Check for sequential numbers
        for (int i = 0; i < password.length() - 2; i++) {
            if (Character.isDigit(password.charAt(i)) &&
                Character.isDigit(password.charAt(i + 1)) &&
                Character.isDigit(password.charAt(i + 2))) {
                int n1 = Character.getNumericValue(password.charAt(i));
                int n2 = Character.getNumericValue(password.charAt(i + 1));
                int n3 = Character.getNumericValue(password.charAt(i + 2));
                if ((n2 == n1 + 1 && n3 == n2 + 1) || (n2 == n1 - 1 && n3 == n2 - 1)) {
                    return true;
                }
            }
        }

        // Check for sequential letters
        for (int i = 0; i < password.length() - 2; i++) {
            if (Character.isLetter(password.charAt(i)) &&
                Character.isLetter(password.charAt(i + 1)) &&
                Character.isLetter(password.charAt(i + 2))) {
                char c1 = Character.toLowerCase(password.charAt(i));
                char c2 = Character.toLowerCase(password.charAt(i + 1));
                char c3 = Character.toLowerCase(password.charAt(i + 2));
                if ((c2 == c1 + 1 && c3 == c2 + 1) || (c2 == c1 - 1 && c3 == c2 - 1)) {
                    return true;
                }
            }
        }

        return false;
    }

    private boolean hasRepeatedChars(String password) {
        int maxRepeated = 3; // Maximum allowed repeated characters
        for (int i = 0; i < password.length() - maxRepeated; i++) {
            boolean allSame = true;
            for (int j = 1; j <= maxRepeated; j++) {
                if (password.charAt(i) != password.charAt(i + j)) {
                    allSame = false;
                    break;
                }
            }
            if (allSame) {
                return true;
            }
        }
        return false;
    }

    @Transactional
    public Map<String, Object> register(RegisterRequest request) {
        log.info("Attempting to register user with email: {}", request.getEmail());
        
        // Use email as username
        String username = request.getEmail();
        
        // Check if this is the first admin user
        User.Role userRole;
        if (ADMIN_PATTERN.matcher(request.getEmail().toLowerCase()).matches() && 
            !userRepository.existsByRole(User.Role.SYSTEM_ADMINISTRATOR)) {
            // First admin user - allow registration
            userRole = User.Role.SYSTEM_ADMINISTRATOR;
            log.info("First admin user detected, assigning SYSTEM_ADMINISTRATOR role");
        } else {
            // All other users get COMMUNITY_MEMBER role
            userRole = User.Role.COMMUNITY_MEMBER;
        }
        
        // Validate password and get strength
        List<String> passwordErrors = validatePassword(request.getPassword());
        PasswordStrengthResult strengthResult = calculatePasswordStrength(request.getPassword());
        
        if (!passwordErrors.isEmpty()) {
            log.warn("Password validation failed for user {}: {}", request.getUsername(), passwordErrors);
            throw new RuntimeException("Password validation failed: " + String.join(", ", passwordErrors));
        }

        if (userRepository.existsByUsername(username)) {
            log.warn("Registration failed: Username {} already exists", username);
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration failed: Email {} already exists", request.getEmail());
            throw new RuntimeException("Email already exists");
        }
        
        // Additional check for admin pattern users
        if (ADMIN_PATTERN.matcher(request.getEmail().toLowerCase()).matches() && 
            userRepository.existsByRole(User.Role.SYSTEM_ADMINISTRATOR)) {
            log.warn("Admin registration attempted but admin already exists: {}", request.getEmail());
            throw new RuntimeException("System administrator account already exists. Only one admin is allowed.");
        }

        // Generate email verification token
        String verificationToken = UUID.randomUUID().toString();
        LocalDateTime tokenExpiry = LocalDateTime.now().plusHours(24);

        var user = User.builder()
                .username(username)
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(userRole)
                .isEnabled(true)
                .emailVerified(false)
                .emailVerificationToken(verificationToken)
                .emailVerificationTokenExpiry(tokenExpiry)
                .isAccountNonLocked(true)
                .dateCreated(LocalDateTime.now())
                .preferredLanguage(request.getPreferredLanguage() != null ? request.getPreferredLanguage() : "en")
                .build();

        userRepository.save(user);
        log.info("User registered successfully: {} with role: {}", user.getUsername(), user.getRole());
        
        // Send verification email
        emailService.sendVerificationEmail(user.getEmail(), verificationToken);
        log.info("Verification email sent to: {}", user.getEmail());

        // Generate temporary token that will be invalidated after email verification
        var jwtToken = jwtService.generateToken(user, true);
        log.debug("Generated temporary JWT token for user: {}", user.getUsername());
        
        // Include password strength in response
        Map<String, Object> response = new HashMap<>();
        response.put("token", jwtToken);
        response.put("passwordStrength", strengthResult.getStrength().getDisplayName());
        response.put("passwordScore", strengthResult.getScore());
        response.put("passwordFeedback", strengthResult.getFeedback());
        response.put("role", userRole.name());
        response.put("requiresApproval", false);
        
        return response;
    }

    /**
     * Enhanced role determination based on email patterns and business rules
     * This implements the RBAC constraints where only specific email patterns can have elevated roles
     */
    private User.Role determineUserRole(RegisterRequest request) {
        String email = request.getEmail().toLowerCase();
        
        // Check for admin pattern (only one admin allowed)
        if (ADMIN_PATTERN.matcher(email).matches()) {
            // Verify only one admin exists
            if (userRepository.existsByRole(User.Role.SYSTEM_ADMINISTRATOR)) {
                log.warn("Admin creation attempted but admin already exists: {}", email);
                throw new RuntimeException("System administrator account already exists. Only one admin is allowed.");
            }
            return User.Role.SYSTEM_ADMINISTRATOR;
        }
        
        // Check for heritage manager pattern
        if (HERITAGE_MANAGER_PATTERN.matcher(email).matches()) {
            // Validate manager number and check limits
            int managerNumber = extractManagerNumber(email);
            if (managerNumber > MAX_MANAGERS_PER_TYPE) {
                throw new RuntimeException("Maximum number of heritage managers reached (" + MAX_MANAGERS_PER_TYPE + ")");
            }
            
            // Check if this specific manager number already exists
            if (userRepository.existsByEmailAndRole(email, User.Role.HERITAGE_MANAGER)) {
                throw new RuntimeException("Heritage manager with this number already exists");
            }
            
            return User.Role.HERITAGE_MANAGER;
        }
        
        // Check for content manager pattern
        if (CONTENT_MANAGER_PATTERN.matcher(email).matches()) {
            // Validate manager number and check limits
            int managerNumber = extractManagerNumber(email);
            if (managerNumber > MAX_MANAGERS_PER_TYPE) {
                throw new RuntimeException("Maximum number of content managers reached (" + MAX_MANAGERS_PER_TYPE + ")");
            }
            
            // Check if this specific manager number already exists
            if (userRepository.existsByEmailAndRole(email, User.Role.CONTENT_MANAGER)) {
                throw new RuntimeException("Content manager with this number already exists");
            }
            
            return User.Role.CONTENT_MANAGER;
        }
        
        // Default role for all other emails
        log.info("User {} assigned default role: COMMUNITY_MEMBER", email);
        return User.Role.COMMUNITY_MEMBER;
    }
    
    /**
     * Extract manager number from email pattern (e.g., "manager1.heritage@..." -> 1)
     */
    private int extractManagerNumber(String email) {
        try {
            String[] parts = email.split("\\.");
            if (parts.length >= 2) {
                String managerPart = parts[0];
                if (managerPart.startsWith("manager")) {
                    return Integer.parseInt(managerPart.substring(7)); // Remove "manager" prefix
                }
            }
            throw new RuntimeException("Invalid manager email format");
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid manager number in email");
        }
    }
    
    /**
     * Validate email pattern matches assigned role (for admin-created users)
     */
    private void validateEmailRoleConsistency(String email, User.Role role) {
        String emailLower = email.toLowerCase();
        
        switch (role) {
            case SYSTEM_ADMINISTRATOR:
                if (!ADMIN_PATTERN.matcher(emailLower).matches()) {
                    throw new RuntimeException("System Administrator role requires email pattern: admin.admin@domain.com");
                }
                break;
            case HERITAGE_MANAGER:
                if (!HERITAGE_MANAGER_PATTERN.matcher(emailLower).matches()) {
                    throw new RuntimeException("Heritage Manager role requires email pattern: managerX.heritage@domain.com (where X is a number)");
                }
                break;
            case CONTENT_MANAGER:
                if (!CONTENT_MANAGER_PATTERN.matcher(emailLower).matches()) {
                    throw new RuntimeException("Content Manager role requires email pattern: managerX.content@domain.com (where X is a number)");
                }
                break;
            case COMMUNITY_MEMBER:
                // Community members can use any email pattern
                break;
            default:
                throw new RuntimeException("Invalid role specified");
        }
    }

    @Transactional
    public void verifyEmail(String token) {
        log.info("Attempting to verify email with token");
        
        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> {
                    log.warn("Invalid verification token used");
                    return new RuntimeException("Invalid verification token");
                });

        if (user.getEmailVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            log.warn("Expired verification token used for user: {}", user.getUsername());
            throw new RuntimeException("Verification token has expired");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationTokenExpiry(null);
        userRepository.save(user);
        log.info("Email verified successfully for user: {}", user.getUsername());
    }

    @Transactional
    public void resendVerificationEmail(String email) {
        log.info("Attempting to resend verification email to: {}", email);
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("Resend verification requested for non-existent email: {}", email);
                    return new RuntimeException("User not found");
                });

        if (user.isEmailVerified()) {
            log.warn("Resend verification requested for already verified email: {}", email);
            throw new RuntimeException("Email is already verified");
        }

        // Generate new verification token
        String verificationToken = UUID.randomUUID().toString();
        LocalDateTime tokenExpiry = LocalDateTime.now().plusHours(24);

        user.setEmailVerificationToken(verificationToken);
        user.setEmailVerificationTokenExpiry(tokenExpiry);
        userRepository.save(user);

        emailService.sendVerificationEmail(user.getEmail(), verificationToken);
        log.info("Verification email resent to: {}", user.getEmail());
    }

    @Transactional
    public Map<String, Object> login(String username, String password, boolean rememberMe) {
        log.info("Received login request for user: {}", username);
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
            );
            
            var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));
            
            if (!user.isEnabled()) {
                throw new DisabledException("User account is disabled");
            }
            
            if (!user.isAccountNonLocked()) {
                throw new LockedException("User account is locked");
            }

            // Reset failed login attempts on successful login
            user.resetFailedLoginAttempts();
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);

            // Generate access token with remember-me option and refresh token
            String accessToken = jwtService.generateToken(user, rememberMe);
            String refreshToken = jwtService.generateRefreshToken(user);
            
            // Save refresh token to user
            user.setRefreshToken(refreshToken, jwtService.getTokenExpiryDate(refreshToken));
            userRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", accessToken);
            response.put("refreshToken", refreshToken);
            response.put("tokenType", "Bearer");
            response.put("user", mapUserToDto(user));
            
            return response;
        } catch (BadCredentialsException e) {
            log.warn("Authentication failed for user {}: Bad credentials", username);
            throw new BadCredentialsException("Invalid username or password");
        }
    }

    public Map<String, Object> refreshToken(String refreshToken) {
        try {
            log.info("Processing token refresh request");
            
            if (refreshToken == null || refreshToken.trim().isEmpty()) {
                log.warn("Refresh token is null or empty");
                throw new AuthenticationException("Refresh token is required") {};
            }

            // Verify the refresh token
            String username = jwtService.extractUsername(refreshToken);
            if (username == null) {
                log.warn("Could not extract username from refresh token");
                throw new AuthenticationException("Invalid refresh token format") {};
            }

            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.warn("User not found for refresh token: {}", username);
                    return new UsernameNotFoundException("User not found");
                });

            // Check if user is still active
            if (!user.isEnabled() || !user.isAccountNonLocked()) {
                log.warn("User account is disabled or locked: {}", username);
                throw new AuthenticationException("User account is not active") {};
            }

            // Verify the refresh token matches and is not expired
            if (!user.getRefreshToken().equals(refreshToken)) {
                log.warn("Refresh token mismatch for user: {}", username);
                throw new AuthenticationException("Invalid refresh token") {};
            }

            if (!user.isRefreshTokenValid()) {
                log.warn("Refresh token expired for user: {}", username);
                // Clear the expired token
                user.clearRefreshToken();
                userRepository.save(user);
                throw new AuthenticationException("Refresh token expired") {};
            }

            // Generate new tokens
            String newAccessToken = jwtService.generateToken(user);
            String newRefreshToken = jwtService.generateRefreshToken(user);

            // Update refresh token
            user.setRefreshToken(newRefreshToken, jwtService.getTokenExpiryDate(newRefreshToken));
            userRepository.save(user);

            log.info("Token refresh successful for user: {}", username);

            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", newAccessToken);
            response.put("refreshToken", newRefreshToken);
            response.put("tokenType", "Bearer");
            
            return response;
        } catch (Exception e) {
            log.error("Error refreshing token: {}", e.getMessage(), e);
            throw new AuthenticationException("Token refresh failed: " + e.getMessage()) {};
        }
    }

    public void logout(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        // Clear refresh token
        user.clearRefreshToken();
        userRepository.save(user);
    }

    public AuthenticationResponse authenticateWithGoogle(String googleToken) {
        try {
            // Verify Google token and get user info
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(googleToken);
            if (idToken == null) {
                throw new RuntimeException("Invalid Google token");
            }

            Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");

            // Check if user exists
            Optional<User> existingUser = userRepository.findByEmail(email);
            User user;

            if (existingUser.isPresent()) {
                user = existingUser.get();
                user.setLastLogin(LocalDateTime.now());
                // Update fullName if different
                if (name != null && !name.equals(user.getFullName())) {
                    // Split name into first and last name
                    String[] nameParts = name.split(" ", 2);
                    user.setFirstName(nameParts[0]);
                    user.setLastName(nameParts.length > 1 ? nameParts[1] : null);
                }
                // Update profile picture if available
                if (pictureUrl != null && !pictureUrl.equals(user.getProfilePictureUrl())) {
                    user.setProfilePictureUrl(pictureUrl);
                }
            } else {
                // Create new user with Google authentication
                // Google users are always COMMUNITY_MEMBER regardless of email pattern
                user = User.builder()
                        .username(email.split("@")[0]) // Use part before @ as username
                        .email(email)
                        .password(passwordEncoder.encode(UUID.randomUUID().toString())) // Random password
                        .role(User.Role.COMMUNITY_MEMBER) // Google users are always COMMUNITY_MEMBER
                        .isEnabled(true)
                        .isAccountNonLocked(true)
                        .dateCreated(LocalDateTime.now())
                        .lastLogin(LocalDateTime.now())
                        .firstName(name)
                        .profilePictureUrl(pictureUrl)
                        .preferredLanguage(DEFAULT_LANGUAGE) // Google users get English by default
                        .emailVerified(true) // Google accounts are pre-verified
                        .createdBy("GOOGLE_AUTH") // Audit trail
                        .build();
            }

            userRepository.save(user);
            
            var jwtToken = jwtService.generateToken(user);
            
            return AuthenticationResponse.builder()
                    .token(jwtToken)
                    .username(user.getUsername())
                    .role(user.getRole().name())
                    .email(user.getEmail())
                    .enabled(user.isEnabled())
                    .accountNonLocked(user.isAccountNonLocked())
                    .fullName(user.getFullName())
                    .profilePictureUrl(user.getProfilePictureUrl())
                    .build();
        } catch (Exception e) {
            log.error("Google authentication failed: {}", e.getMessage(), e);
            throw new RuntimeException("Google authentication failed: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void forgotPassword(String email) {
        log.info("Processing password reset request for email: {}", email);
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("Password reset requested for non-existent email: {}", email);
                    return new RuntimeException("User not found");
                });

        // Generate password reset token
        String resetToken = UUID.randomUUID().toString();
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(24)); // Token valid for 24 hours
        userRepository.save(user);
        log.debug("Generated reset token for user: {}", user.getUsername());

        // Send email with reset link
        String resetLink = frontendUrl + "/reset-password?token=" + resetToken;
        emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
        log.info("Password reset email sent to user: {}", user.getUsername());
    }

    @Transactional
    public Map<String, Object> resetPassword(String token, String newPassword) {
        log.info("Processing password reset request");
        
        // Validate password and get strength
        List<String> passwordErrors = validatePassword(newPassword);
        PasswordStrengthResult strengthResult = calculatePasswordStrength(newPassword);
        
        if (!passwordErrors.isEmpty()) {
            log.warn("Password validation failed during reset: {}", passwordErrors);
            throw new RuntimeException("Password validation failed: " + String.join(", ", passwordErrors));
        }

        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            log.warn("Reset token expired for user: {}", user.getUsername());
            throw new RuntimeException("Reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
        log.info("Password reset successful for user: {}", user.getUsername());

        // Include password strength in response
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Password reset successful");
        response.put("passwordStrength", strengthResult.getStrength().getDisplayName());
        response.put("passwordScore", strengthResult.getScore());
        response.put("passwordFeedback", strengthResult.getFeedback());
        
        return response;
    }

    public AuthenticationResponse handleGoogleCallback(String code) {
        log.info("[Google OAuth] handleGoogleCallback called with code: {}", code);
        try {
            log.debug("[Google OAuth] Exchanging authorization code for tokens...");
            GoogleTokenResponse tokenResponse;
            try {
                tokenResponse = new GoogleAuthorizationCodeTokenRequest(
                        new NetHttpTransport(),
                        new GsonFactory(),
                        googleClientId,
                        googleClientSecret,
                        code,
                        frontendUrl + "/auth/google/callback"
                ).setTokenServerUrl(new GenericUrl("https://oauth2.googleapis.com/token")).execute();
                log.debug("[Google OAuth] Token response: {}", tokenResponse);
            } catch (Exception e) {
                log.error("[Google OAuth] Failed to exchange code for tokens: {}", e.getMessage(), e);
                throw new RuntimeException("Failed to exchange code for tokens: " + e.getMessage(), e);
            }

            log.debug("[Google OAuth] Verifying ID token...");
            GoogleIdToken idToken;
            try {
                GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                        new NetHttpTransport(),
                        new GsonFactory()
                )
                        .setAudience(Collections.singletonList(googleClientId))
                        .build();
                idToken = verifier.verify(tokenResponse.getIdToken());
                if (idToken == null) {
                    log.error("[Google OAuth] Invalid ID token received from Google");
                    throw new RuntimeException("Invalid ID token");
                }
                log.debug("[Google OAuth] ID token verified successfully");
            } catch (Exception e) {
                log.error("[Google OAuth] Failed to verify ID token: {}", e.getMessage(), e);
                throw new RuntimeException("Failed to verify ID token: " + e.getMessage(), e);
            }

            Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");

            log.info("[Google OAuth] Successfully verified Google ID token for user: {}", email);

            User user;
            synchronized (email.intern()) {
                Optional<User> existingUser = userRepository.findByEmail(email);
                if (existingUser.isPresent()) {
                    user = existingUser.get();
                    user.setLastLogin(LocalDateTime.now());
                    if (name != null && !name.equals(user.getFullName())) {
                        // Split name into first and last name
                        String[] nameParts = name.split(" ", 2);
                        user.setFirstName(nameParts[0]);
                        user.setLastName(nameParts.length > 1 ? nameParts[1] : null);
                    }
                    // Update profile picture if available
                    if (pictureUrl != null && !pictureUrl.equals(user.getProfilePictureUrl())) {
                        user.setProfilePictureUrl(pictureUrl);
                    }
                    log.info("[Google OAuth] Existing user found: {}", user.getUsername());
                } else {
                    // Create new user with Google authentication
                    // Determine role based on email pattern (same as regular registration)
                    RegisterRequest googleRequest = new RegisterRequest();
                    googleRequest.setEmail(email);
                    User.Role determinedRole = determineUserRole(googleRequest);
                    
                    user = User.builder()
                            .username(email.split("@")[0])
                            .email(email)
                            .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                            .role(determinedRole)
                            .isEnabled(true)
                            .isAccountNonLocked(true)
                            .dateCreated(LocalDateTime.now())
                            .lastLogin(LocalDateTime.now())
                            .firstName(name)
                            .profilePictureUrl(pictureUrl)
                            .preferredLanguage(DEFAULT_LANGUAGE) // Google users get English by default
                            .emailVerified(true) // Google accounts are pre-verified
                            .createdBy("GOOGLE_AUTH") // Audit trail
                            .build();
                    log.info("[Google OAuth] Created new user: {} with role: {}", user.getUsername(), determinedRole);
                }
                userRepository.save(user);
                log.debug("[Google OAuth] Saved user to database");
            }
            var jwtToken = jwtService.generateToken(user);
            log.debug("[Google OAuth] Generated JWT token for user");
            return AuthenticationResponse.builder()
                    .token(jwtToken)
                    .username(user.getUsername())
                    .role(user.getRole().name())
                    .email(user.getEmail())
                    .enabled(user.isEnabled())
                    .accountNonLocked(user.isAccountNonLocked())
                    .fullName(user.getFullName())
                    .profilePictureUrl(user.getProfilePictureUrl())
                    .build();
        } catch (Exception e) {
            log.error("[Google OAuth] Google callback handling failed: {}", e.getMessage(), e);
            throw new RuntimeException("Google authentication failed: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void requestAccountUnlock(String email) {
        log.info("Processing account unlock request for email: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isLockedOut()) {
            log.info("Account is not locked for user: {}", user.getUsername());
            return;
        }

        // Generate unlock token
        String unlockToken = UUID.randomUUID().toString();
        LocalDateTime tokenExpiry = LocalDateTime.now().plusHours(24);

        user.setUnlockToken(unlockToken);
        user.setUnlockTokenExpiry(tokenExpiry);
        userRepository.save(user);

        // Send unlock email
        String unlockLink = frontendUrl + "/unlock-account?token=" + unlockToken;
        emailService.sendUnlockEmail(user.getEmail(), unlockLink);
        log.info("Unlock instructions sent to: {}", email);
    }

    @Transactional
    public void unlockAccount(String token) {
        log.info("Processing account unlock with token");
        User user = userRepository.findByUnlockToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired unlock token"));

        if (user.getUnlockTokenExpiry().isBefore(LocalDateTime.now())) {
            log.warn("Unlock token expired for user: {}", user.getUsername());
            throw new RuntimeException("Unlock token has expired");
        }

        user.resetFailedLoginAttempts();
        user.setUnlockToken(null);
        user.setUnlockTokenExpiry(null);
        userRepository.save(user);
        log.info("Account unlocked for user: {}", user.getUsername());
    }

    @Transactional
    public void adminUnlockAccount(String username) {
        log.info("Admin unlocking account for user: {}", username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.warn("Admin unlock requested for non-existent user: {}", username);
                    return new RuntimeException("User not found");
                });

        user.setAccountNonLocked(true);
        user.setFailedLoginAttempts(0);
        user.setLockoutTime(null);
        userRepository.save(user);
        log.info("Account unlocked successfully for user: {}", username);
    }



    @Transactional
    public Map<String, Object> adminCreateUser(RegisterRequest request) {
        log.info("Admin creating user with email: {} with role: {}", request.getEmail(), request.getRequestedRole());
        
        // Use email as username
        String username = request.getEmail();
        
        // Validate that the requested role is allowed for admin creation
        User.Role userRole;
        if (request.getRequestedRole() == null) {
            throw new RuntimeException("Role is required for admin user creation");
        }
        
        // Enhanced role validation with email pattern consistency
        switch (request.getRequestedRole()) {
            case HERITAGE_MANAGER:
            case CONTENT_MANAGER:
                userRole = request.getRequestedRole();
                // Validate email pattern matches role
                validateEmailRoleConsistency(request.getEmail(), userRole);
                break;
            case SYSTEM_ADMINISTRATOR:
                log.warn("Admin attempted to create another SYSTEM_ADMINISTRATOR: {}", username);
                throw new RuntimeException("System administrator accounts cannot be created through this endpoint");
            case COMMUNITY_MEMBER:
                log.warn("Admin attempted to create COMMUNITY_MEMBER through admin endpoint: {}", username);
                throw new RuntimeException("Community members should register themselves");
            case GUEST:
                log.warn("Admin attempted to create GUEST: {}", username);
                throw new RuntimeException("Guest users do not require accounts");
            default:
                throw new RuntimeException("Invalid role specified");
        }
        
        // Validate password and get strength
        List<String> passwordErrors = validatePassword(request.getPassword());
        PasswordStrengthResult strengthResult = calculatePasswordStrength(request.getPassword());
        
        if (!passwordErrors.isEmpty()) {
            log.warn("Password validation failed for user {}: {}", request.getUsername(), passwordErrors);
            throw new RuntimeException("Password validation failed: " + String.join(", ", passwordErrors));
        }

        if (userRepository.existsByUsername(username)) {
            log.warn("Admin creation failed: Username {} already exists", username);
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Admin creation failed: Email {} already exists", request.getEmail());
            throw new RuntimeException("Email already exists");
        }
        
        // Check for duplicate full names (case-insensitive)
        if (userRepository.existsByFullName(request.getFirstName(), request.getLastName())) {
            log.warn("Admin creation failed: User with name '{} {}' already exists", 
                    request.getFirstName(), request.getLastName());
            throw new RuntimeException("A user with this first and last name already exists");
        }
        
        // Check if user was previously deleted and cannot be recreated
        checkUserRecreationPolicy(request.getEmail(), request.getFirstName(), request.getLastName());

        // No complex validation - all roles can be created with basic info

        // Determine user status based on request with validation
        UserStatus userStatus = validateNewUserStatus(request.getStatus());
        
        var user = User.builder()
                .username(username)
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(userRole)
                .userStatus(userStatus)
                .isEnabled(userStatus == UserStatus.ACTIVE)
                .emailVerified(true) // Auto-verify admin-created accounts
                .isAccountNonLocked(userStatus == UserStatus.ACTIVE)
                .dateCreated(LocalDateTime.now())
                .preferredLanguage(request.getPreferredLanguage() != null ? request.getPreferredLanguage() : DEFAULT_LANGUAGE)
                .createdBy("ADMIN") // Audit trail
                .build();

        userRepository.save(user);
        log.info("Admin created user successfully: {} with role: {}", user.getUsername(), user.getRole());
        
        // Generate JWT token for the new user
        var jwtToken = jwtService.generateToken(user, false);
        log.debug("Generated JWT token for admin-created user: {}", user.getUsername());
        
        // Include password strength in response
        Map<String, Object> response = new HashMap<>();
        response.put("token", jwtToken);
        response.put("passwordStrength", strengthResult.getStrength().getDisplayName());
        response.put("passwordScore", strengthResult.getScore());
        response.put("passwordFeedback", strengthResult.getFeedback());
        response.put("role", userRole.name());
        response.put("message", "User created successfully by administrator");
        
        return response;
    }

    /**
     * Check if any admin user exists in the system
     */
    public boolean hasAnyAdmin() {
        return userRepository.existsByRole(User.Role.SYSTEM_ADMINISTRATOR);
    }

    /**
     * First-time admin setup - creates the initial admin user
     */
    @Transactional
    public Map<String, Object> firstTimeAdminSetup(RegisterRequest request) {
        log.info("First-time admin setup for email: {}", request.getEmail());
        
        // Double-check no admin exists
        if (hasAnyAdmin()) {
            throw new RuntimeException("System administrator already exists");
        }
        
        // Validate admin email pattern
        if (!ADMIN_PATTERN.matcher(request.getEmail().toLowerCase()).matches()) {
            throw new RuntimeException("First admin must use email pattern: admin.admin@domain.com");
        }
        
        // Use email as username
        String username = request.getEmail();
        
        // Validate password and get strength
        List<String> passwordErrors = validatePassword(request.getPassword());
        PasswordStrengthResult strengthResult = calculatePasswordStrength(request.getPassword());
        
        if (!passwordErrors.isEmpty()) {
            log.warn("Password validation failed for first admin {}: {}", username, passwordErrors);
            throw new RuntimeException("Password validation failed: " + String.join(", ", passwordErrors));
        }

        if (userRepository.existsByUsername(username)) {
            log.warn("First admin setup failed: Username {} already exists", username);
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("First admin setup failed: Email {} already exists", request.getEmail());
            throw new RuntimeException("Email already exists");
        }

        // Create the first admin user
        var user = User.builder()
                .username(username)
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(User.Role.SYSTEM_ADMINISTRATOR)
                .isEnabled(true)
                .emailVerified(true) // Auto-verify first admin
                .isAccountNonLocked(true)
                .dateCreated(LocalDateTime.now())
                .preferredLanguage(request.getPreferredLanguage() != null ? request.getPreferredLanguage() : DEFAULT_LANGUAGE)
                .createdBy("SYSTEM") // Audit trail
                .build();

        userRepository.save(user);
        log.info("First admin user created successfully: {} with role: {}", user.getUsername(), user.getRole());
        
        // Generate JWT token for the new admin
        var jwtToken = jwtService.generateToken(user, false);
        log.debug("Generated JWT token for first admin: {}", user.getUsername());
        
        // Include password strength in response
        Map<String, Object> response = new HashMap<>();
        response.put("token", jwtToken);
        response.put("passwordStrength", strengthResult.getStrength().getDisplayName());
        response.put("passwordScore", strengthResult.getScore());
        response.put("passwordFeedback", strengthResult.getFeedback());
        response.put("role", User.Role.SYSTEM_ADMINISTRATOR.name());
        response.put("requiresApproval", false);
        response.put("message", "First admin user created successfully");
        
        return response;
    }


    private UserProfileDTO mapUserToDto(User user) {
        UserProfileDTO dto = new UserProfileDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setEnabled(user.isEnabled());
        dto.setEmailVerified(user.isEmailVerified());
        dto.setFullName(user.getFullName());
        dto.setProfilePictureUrl(user.getProfilePictureUrl());
        dto.setPreferredLanguage(user.getPreferredLanguage());
        dto.setAdditionalLanguages(user.getAdditionalLanguages() != null ? user.getAdditionalLanguages().toArray(new String[0]) : null);
        dto.setEmailNotifications(user.getEmailNotifications());
        dto.setPushNotifications(user.getPushNotifications());
        dto.setDateCreated(user.getDateCreated());
        dto.setLastLogin(user.getLastLogin());
        dto.setLastProfileUpdate(user.getLastProfileUpdate());
        
        // Debug logging
        log.info("Mapping user to DTO - Username: {}, Role: {}, DTO Role: {}", 
                user.getUsername(), user.getRole(), dto.getRole());
        
        return dto;
    }

    private void handleFailedLogin(String username) {
        User user = userRepository.findByUsername(username)
            .orElse(null);
        if (user != null) {
            user.incrementFailedLoginAttempts();
            if (user.getFailedLoginAttempts() >= 5) {
                user.setAccountNonLocked(false);
            }
            userRepository.save(user);
        }
    }
    
    /**
     * Validate new user status - only allow ACTIVE and SUSPENDED for new users
     * This follows security best practices by preventing creation of disabled/deleted users
     */
    private UserStatus validateNewUserStatus(String status) {
        if (status == null) {
            log.info("No status provided, defaulting to ACTIVE");
            return UserStatus.ACTIVE;
        }
        
        try {
            UserStatus userStatus = UserStatus.valueOf(status.toUpperCase());
            
            // Only allow ACTIVE and SUSPENDED for new users
            if (userStatus == UserStatus.ACTIVE || userStatus == UserStatus.SUSPENDED) {
                log.info("Valid new user status: {}", userStatus);
                return userStatus;
            } else {
                log.warn("Invalid status '{}' for new user, defaulting to ACTIVE. Only ACTIVE and SUSPENDED are allowed for new users.", status);
                return UserStatus.ACTIVE;
            }
            
        } catch (IllegalArgumentException e) {
            log.warn("Invalid status value '{}' provided, defaulting to ACTIVE", status);
            return UserStatus.ACTIVE;
        }
    }
    
    /**
     * Security policy: Check if a previously deleted user can be recreated
     * This prevents security bypasses and maintains audit trail integrity
     */
    private void checkUserRecreationPolicy(String email, String firstName, String lastName) {
        // Check if user with same email was previously deleted
        Optional<User> deletedUser = userRepository.findByEmail(email);
        if (deletedUser.isPresent() && deletedUser.get().getUserStatus() == UserStatus.DELETED) {
            log.warn("SECURITY ALERT: Attempt to recreate deleted user with email: {}", email);
            throw new RuntimeException("Cannot recreate a previously deleted user. Please restore the existing user instead.");
        }
        
        // Check if user with same name was previously deleted
        List<User> usersWithSameName = userRepository.findByFirstNameAndLastName(firstName, lastName);
        for (User user : usersWithSameName) {
            if (user.getUserStatus() == UserStatus.DELETED) {
                log.warn("SECURITY ALERT: Attempt to recreate deleted user with name: {} {}", firstName, lastName);
                throw new RuntimeException("Cannot recreate a previously deleted user. Please restore the existing user instead.");
            }
        }
    }
} 