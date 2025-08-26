package com.rwandaheritage.heritageguard.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

// UserStatus enum moved to separate file

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 50)
    private String username;
    
    @Column(nullable = false, length = 100)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(name = "first_name", length = 50)
    private String firstName;
    
    @Column(name = "last_name", length = 50)
    private String lastName;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
    
    @Column(name = "profile_picture_url", length = 500)
    private String profilePictureUrl;
    
    @Column(name = "preferred_language", length = 10)
    private String preferredLanguage;
    
    @ElementCollection
    @CollectionTable(name = "user_additional_languages", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "language", length = 10)
    private List<String> additionalLanguages;
    
    // Notification preferences
    @Column(name = "email_notifications")
    @Builder.Default
    private Boolean emailNotifications = true;
    
    @Column(name = "push_notifications")
    @Builder.Default
    private Boolean pushNotifications = true;
    
    // Email verification
    @Column(name = "email_verified")
    @Builder.Default
    @JsonProperty("emailVerified")
    private boolean emailVerified = false;
    
    @Column(name = "email_verification_token", length = 100)
    private String emailVerificationToken;
    
    @Column(name = "email_verification_token_expiry")
    private LocalDateTime emailVerificationTokenExpiry;
    
    // Password reset
    @Column(name = "reset_token", length = 100)
    private String resetToken;
    
    @Column(name = "reset_token_expiry")
    private LocalDateTime resetTokenExpiry;
    
    // Account lockout
    @Column(name = "failed_login_attempts")
    @Builder.Default
    private int failedLoginAttempts = 0;
    
    @Column(name = "lockout_time")
    private LocalDateTime lockoutTime;
    
    @Column(name = "unlock_token", length = 100)
    private String unlockToken;
    
    @Column(name = "unlock_token_expiry")
    private LocalDateTime unlockTokenExpiry;
    
    // Refresh token
    @Column(name = "refresh_token", length = 500)
    private String refreshToken;
    
    @Column(name = "refresh_token_expiry")
    private LocalDateTime refreshTokenExpiry;
    
    // Profile timestamps
    @Column(name = "date_created")
    private LocalDateTime dateCreated;
    
    @Column(name = "last_profile_update")
    private LocalDateTime lastProfileUpdate;
    
    // Security fields
    @Column(name = "enabled", nullable = false)
    @Builder.Default
    @JsonProperty("isEnabled")
    private boolean isEnabled = true;
    
    @Column(name = "account_non_expired", nullable = false)
    @Builder.Default
    @JsonProperty("isAccountNonExpired")
    private boolean isAccountNonExpired = true;
    
    @Column(name = "account_non_locked", nullable = false)
    @Builder.Default
    @JsonProperty("isAccountNonLocked")
    private boolean isAccountNonLocked = true;
    
    @Column(name = "credentials_non_expired", nullable = false)
    @Builder.Default
    @JsonProperty("isCredentialsNonExpired")
    private boolean isCredentialsNonExpired = true;
    
    @Column(name = "last_login")
    private LocalDateTime lastLogin;
    
    // User status management
    @Enumerated(EnumType.STRING)
    @Column(name = "user_status", nullable = false)
    @Builder.Default
    private UserStatus userStatus = UserStatus.ACTIVE;
    
    @Column(name = "status_reason", length = 500)
    private String statusReason; // Why user was suspended/disabled/deleted
    
    @Column(name = "status_changed_by", length = 50)
    private String statusChangedBy; // Who changed the status
    
    @Column(name = "status_changed_date")
    private LocalDateTime statusChangedDate;
    
    // Audit fields
    @Column(name = "created_by", length = 50)
    private String createdBy;
    
    @Column(name = "created_date")
    private LocalDateTime createdDate;
    
    @Column(name = "updated_by", length = 50)
    private String updatedBy;
    
    @Column(name = "updated_date")
    private LocalDateTime updatedDate;
    
    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
        updatedDate = LocalDateTime.now();
        dateCreated = LocalDateTime.now();
        lastProfileUpdate = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedDate = LocalDateTime.now();
    }
    
    // Helper methods
    public void updateProfileTimestamp() {
        this.lastProfileUpdate = LocalDateTime.now();
    }
    
    public void updateLastActivity() {
        this.lastLogin = LocalDateTime.now();
    }
    
    public void resetFailedLoginAttempts() {
        this.failedLoginAttempts = 0;
        this.lockoutTime = null;
    }
    
    public void incrementFailedLoginAttempts() {
        this.failedLoginAttempts++;
    }
    
    public boolean isLockedOut() {
        return lockoutTime != null && LocalDateTime.now().isBefore(lockoutTime.plusMinutes(30));
    }
    
    public String getPreferredLanguage() {
        return preferredLanguage;
    }
    
    public void setPreferredLanguage(String preferredLanguage) {
        this.preferredLanguage = preferredLanguage;
    }
    
    // Spring Security UserDetails implementation
    public void setRefreshToken(String token, LocalDateTime expiry) {
        this.refreshToken = token;
        this.refreshTokenExpiry = expiry;
    }
    
    public boolean isRefreshTokenValid() {
        return refreshToken != null && refreshTokenExpiry != null && 
               LocalDateTime.now().isBefore(refreshTokenExpiry);
    }
    
    public void clearRefreshToken() {
        this.refreshToken = null;
        this.refreshTokenExpiry = null;
    }
    
    // User status management methods
    public void setStatus(UserStatus status, String reason, String changedBy) {
        this.userStatus = status;
        this.statusReason = reason;
        this.statusChangedBy = changedBy;
        this.statusChangedDate = LocalDateTime.now();
        
        // Update enabled state based on status
        switch (status) {
            case ACTIVE:
                this.isEnabled = true;
                this.isAccountNonLocked = true;
                break;
            case SUSPENDED:
                this.isEnabled = false;
                this.isAccountNonLocked = false;
                break;
            case DISABLED:
                this.isEnabled = false;
                this.isAccountNonLocked = false;
                break;
            case DELETED:
                this.isEnabled = false;
                this.isAccountNonLocked = false;
                break;
        }
    }
    
    public boolean isActive() {
        return userStatus == UserStatus.ACTIVE;
    }
    
    public boolean isSuspended() {
        return userStatus == UserStatus.SUSPENDED;
    }
    
    public boolean isDisabled() {
        return userStatus == UserStatus.DISABLED;
    }
    
    public boolean isDeleted() {
        return userStatus == UserStatus.DELETED;
    }
    
    public boolean canBeReactivated() {
        return userStatus == UserStatus.SUSPENDED;
    }
    
    public boolean canBeRestored() {
        return userStatus == UserStatus.DELETED;
    }
    
    @Override
    public String getUsername() {
        return username;
    }
    
    @Override
    public String getPassword() {
        return password;
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return isAccountNonExpired;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return isAccountNonLocked;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return isCredentialsNonExpired;
    }
    
    @Override
    public boolean isEnabled() {
        return isEnabled;
    }
    
    public String getFullName() {
        if (firstName != null && lastName != null) {
            return firstName + " " + lastName;
        } else if (firstName != null) {
            return firstName;
        } else if (lastName != null) {
            return lastName;
        }
        return username;
    }
    
    public enum Role {
        SYSTEM_ADMINISTRATOR,
        HERITAGE_MANAGER,
        CONTENT_MANAGER,
        COMMUNITY_MEMBER,
        GUEST
    }
}