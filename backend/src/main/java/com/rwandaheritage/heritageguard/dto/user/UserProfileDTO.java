package com.rwandaheritage.heritageguard.dto.user;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.rwandaheritage.heritageguard.model.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserProfileDTO {
    private Long id;
    
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_-]+$", message = "Username can only contain letters, numbers, underscores, and hyphens")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @Size(max = 100, message = "Full name must not exceed 100 characters")
    private String fullName;

    @JsonProperty("role")
    private User.Role role;
    
    @Size(max = 200, message = "Profile picture URL must not exceed 200 characters")
    private String profilePictureUrl;

    // Language preferences
    private String preferredLanguage;
    private String[] additionalLanguages;

    // Notification preferences
    private Boolean emailNotifications;
    private Boolean pushNotifications;

    // System information
    private LocalDateTime dateCreated;
    private LocalDateTime lastLogin;
    private LocalDateTime lastProfileUpdate;
    private boolean emailVerified;
    private boolean enabled;
} 