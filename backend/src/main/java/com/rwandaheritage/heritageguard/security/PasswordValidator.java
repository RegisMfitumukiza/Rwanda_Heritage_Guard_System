package com.rwandaheritage.heritageguard.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Slf4j
@Component
public class PasswordValidator {
    private static final int MIN_LENGTH = 8;
    private static final int MAX_LENGTH = 128;
    private static final Pattern UPPERCASE_PATTERN = Pattern.compile("[A-Z]");
    private static final Pattern LOWERCASE_PATTERN = Pattern.compile("[a-z]");
    private static final Pattern DIGIT_PATTERN = Pattern.compile("\\d");
    private static final Pattern SPECIAL_CHAR_PATTERN = Pattern.compile("[!@#$%^&*(),.?\":{}|<>]");
    private static final Pattern COMMON_PASSWORDS_PATTERN = Pattern.compile(
        "^(password|123456|qwerty|admin|welcome|letmein|monkey|dragon|baseball|football)$",
        Pattern.CASE_INSENSITIVE
    );

    public List<String> validatePassword(String password) {
        List<String> errors = new ArrayList<>();

        if (password == null || password.isEmpty()) {
            errors.add("Password cannot be empty");
            return errors;
        }

        // Check length
        if (password.length() < MIN_LENGTH) {
            errors.add("Password must be at least " + MIN_LENGTH + " characters long");
        }
        if (password.length() > MAX_LENGTH) {
            errors.add("Password must not exceed " + MAX_LENGTH + " characters");
        }

        // Check character types
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

        // Check for common passwords
        if (COMMON_PASSWORDS_PATTERN.matcher(password).matches()) {
            errors.add("Password is too common. Please choose a stronger password");
        }

        // Check for sequential characters
        if (hasSequentialChars(password)) {
            errors.add("Password contains sequential characters (e.g., '123', 'abc')");
        }

        // Check for repeated characters
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
} 