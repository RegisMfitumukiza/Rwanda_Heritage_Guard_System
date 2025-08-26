package com.rwandaheritage.heritageguard.security;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.regex.Pattern;

/**
 * Input Sanitization Utility
 * 
 * Provides methods to sanitize user inputs and prevent:
 * - SQL Injection
 * - XSS attacks
 * - Path traversal attacks
 * - Command injection
 */
@Component
public class InputSanitizer {

    // Patterns for dangerous content
    private static final Pattern SQL_INJECTION_PATTERN = Pattern.compile(
        "(?i)(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT|JAVASCRIPT|ONLOAD|ONERROR|ONCLICK)",
        Pattern.CASE_INSENSITIVE
    );
    
    private static final Pattern XSS_PATTERN = Pattern.compile(
        "(?i)(<script|javascript:|vbscript:|onload|onerror|onclick|onmouseover|onfocus|onblur)",
        Pattern.CASE_INSENSITIVE
    );
    
    private static final Pattern PATH_TRAVERSAL_PATTERN = Pattern.compile(
        "(\\.\\./|\\.\\\\|\\\\|/|%2e%2e%2f|%2e%2e%5c)",
        Pattern.CASE_INSENSITIVE
    );
    
    private static final Pattern COMMAND_INJECTION_PATTERN = Pattern.compile(
        "(?i)(;|&|\\||`|\\$|\\(|\\)|\\{|\\}|\\[|\\]|\\||\\\\|\\/|\\*|\\?|\\^|\\$|\\+|\\-|\\=|\\<|\\>)",
        Pattern.CASE_INSENSITIVE
    );

    /**
     * Sanitize text input
     */
    public String sanitizeText(String input) {
        if (!StringUtils.hasText(input)) {
            return input;
        }
        
        String sanitized = input.trim();
        
        // Remove dangerous patterns
        sanitized = SQL_INJECTION_PATTERN.matcher(sanitized).replaceAll("");
        sanitized = XSS_PATTERN.matcher(sanitized).replaceAll("");
        sanitized = COMMAND_INJECTION_PATTERN.matcher(sanitized).replaceAll("");
        
        // HTML encode special characters
        sanitized = htmlEncode(sanitized);
        
        return sanitized;
    }

    /**
     * Sanitize file path input
     */
    public String sanitizeFilePath(String input) {
        if (!StringUtils.hasText(input)) {
            return input;
        }
        
        String sanitized = input.trim();
        
        // Remove path traversal attempts
        sanitized = PATH_TRAVERSAL_PATTERN.matcher(sanitized).replaceAll("");
        
        // Remove dangerous characters
        sanitized = COMMAND_INJECTION_PATTERN.matcher(sanitized).replaceAll("");
        
        return sanitized;
    }

    /**
     * Sanitize email input
     */
    public String sanitizeEmail(String input) {
        if (!StringUtils.hasText(input)) {
            return input;
        }
        
        String sanitized = input.trim().toLowerCase();
        
        // Basic email validation
        if (!isValidEmail(sanitized)) {
            throw new IllegalArgumentException("Invalid email format");
        }
        
        return sanitized;
    }

    /**
     * Sanitize username input
     */
    public String sanitizeUsername(String input) {
        if (!StringUtils.hasText(input)) {
            return input;
        }
        
        String sanitized = input.trim();
        
        // Remove dangerous patterns
        sanitized = SQL_INJECTION_PATTERN.matcher(sanitized).replaceAll("");
        sanitized = XSS_PATTERN.matcher(sanitized).replaceAll("");
        sanitized = COMMAND_INJECTION_PATTERN.matcher(sanitized).replaceAll("");
        
        // Only allow alphanumeric, underscore, and hyphen
        sanitized = sanitized.replaceAll("[^a-zA-Z0-9_-]", "");
        
        return sanitized;
    }

    /**
     * HTML encode special characters
     */
    private String htmlEncode(String input) {
        return input
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#x27;");
    }

    /**
     * Validate email format
     */
    private boolean isValidEmail(String email) {
        String emailRegex = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";
        return email.matches(emailRegex);
    }

    /**
     * Check if input contains dangerous content
     */
    public boolean containsDangerousContent(String input) {
        if (!StringUtils.hasText(input)) {
            return false;
        }
        
        return SQL_INJECTION_PATTERN.matcher(input).find() ||
               XSS_PATTERN.matcher(input).find() ||
               PATH_TRAVERSAL_PATTERN.matcher(input).find() ||
               COMMAND_INJECTION_PATTERN.matcher(input).find();
    }
}

