package com.rwandaheritage.heritageguard.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Security Headers Configuration
 * 
 * Adds security headers to all HTTP responses to protect against:
 * - XSS attacks
 * - Clickjacking
 * - MIME type sniffing
 * - Information disclosure
 */
@Configuration
public class SecurityHeadersConfig {

    @Bean
    public OncePerRequestFilter securityHeadersFilter() {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest request, 
                                         HttpServletResponse response, 
                                         FilterChain filterChain) throws ServletException, IOException {
                
                // Security Headers
                response.setHeader("X-Content-Type-Options", "nosniff");
                response.setHeader("X-Frame-Options", "DENY");
                response.setHeader("X-XSS-Protection", "1; mode=block");
                response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
                response.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
                
                // Content Security Policy (CSP)
                response.setHeader("Content-Security-Policy", 
                    "default-src 'self'; " +
                    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
                    "style-src 'self' 'unsafe-inline'; " +
                    "img-src 'self' data: https:; " +
                    "font-src 'self' data:; " +
                    "connect-src 'self'; " +
                    "frame-ancestors 'none';");
                
                // HSTS (HTTP Strict Transport Security)
                response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
                
                // Remove server information
                response.setHeader("Server", "");
                
                filterChain.doFilter(request, response);
            }
        };
    }
}

