package com.rwandaheritage.heritageguard.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationResponse {
    private String token;
    private String username;
    private String role;
    private String email;
    private boolean enabled;
    private boolean accountNonLocked;
    private String fullName;
    private String profilePictureUrl;
} 