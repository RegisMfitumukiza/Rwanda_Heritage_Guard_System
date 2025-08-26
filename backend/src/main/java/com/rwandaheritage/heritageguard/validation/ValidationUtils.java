package com.rwandaheritage.heritageguard.validation;

import com.rwandaheritage.heritageguard.exception.BusinessLogicException;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.regex.Pattern;

@Component
public class ValidationUtils {

    // Common validation patterns
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
    );
    
    private static final Pattern PHONE_PATTERN = Pattern.compile(
        "^[+]?[1-9]\\d{1,14}$"
    );
    
    private static final Pattern GPS_LATITUDE_PATTERN = Pattern.compile(
        "^-?([0-8]?[0-9]\\.\\d{6}|90\\.000000)$"
    );
    
    private static final Pattern GPS_LONGITUDE_PATTERN = Pattern.compile(
        "^-?(1[0-7][0-9]\\.\\d{6}|180\\.000000|[0-9]?[0-9]\\.\\d{6})$"
    );
    
    private static final Pattern YEAR_PATTERN = Pattern.compile("^\\d{4}$");

    /**
     * Validate email format
     */
    public void validateEmail(String email) {
        if (!StringUtils.hasText(email)) {
            throw new BusinessLogicException("Email is required");
        }
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new BusinessLogicException("Invalid email format");
        }
    }

    /**
     * Validate phone number format
     */
    public void validatePhoneNumber(String phoneNumber) {
        if (StringUtils.hasText(phoneNumber) && !PHONE_PATTERN.matcher(phoneNumber).matches()) {
            throw new BusinessLogicException("Invalid phone number format");
        }
    }

    /**
     * Validate GPS coordinates
     */
    public void validateGpsCoordinates(String latitude, String longitude) {
        if (StringUtils.hasText(latitude)) {
            if (!GPS_LATITUDE_PATTERN.matcher(latitude).matches()) {
                throw new BusinessLogicException("Invalid latitude format. Must be between -90 and 90 degrees with 6 decimal places");
            }
        }
        
        if (StringUtils.hasText(longitude)) {
            if (!GPS_LONGITUDE_PATTERN.matcher(longitude).matches()) {
                throw new BusinessLogicException("Invalid longitude format. Must be between -180 and 180 degrees with 6 decimal places");
            }
        }
    }

    /**
     * Validate year format
     */
    public void validateYear(String year) {
        if (StringUtils.hasText(year)) {
            if (!YEAR_PATTERN.matcher(year).matches()) {
                throw new BusinessLogicException("Year must be a 4-digit number");
            }
            
            int yearInt = Integer.parseInt(year);
            int currentYear = LocalDate.now().getYear();
            
            if (yearInt < 1000 || yearInt > currentYear + 100) {
                throw new BusinessLogicException("Year must be between 1000 and " + (currentYear + 100));
            }
        }
    }

    /**
     * Validate date string format
     */
    public void validateDateString(String dateString, String fieldName) {
        if (!StringUtils.hasText(dateString)) {
            return;
        }
        
        try {
            LocalDate.parse(dateString, DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (DateTimeParseException e) {
            throw new BusinessLogicException(fieldName + " must be in YYYY-MM-DD format");
        }
    }

    /**
     * Validate datetime string format
     */
    public void validateDateTimeString(String dateTimeString, String fieldName) {
        if (!StringUtils.hasText(dateTimeString)) {
            return;
        }
        
        try {
            LocalDateTime.parse(dateTimeString, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        } catch (DateTimeParseException e) {
            throw new BusinessLogicException(fieldName + " must be in ISO datetime format");
        }
    }

    /**
     * Validate string length
     */
    public void validateStringLength(String value, String fieldName, int minLength, int maxLength) {
        if (!StringUtils.hasText(value)) {
            if (minLength > 0) {
                throw new BusinessLogicException(fieldName + " is required");
            }
            return;
        }
        
        if (value.length() < minLength) {
            throw new BusinessLogicException(fieldName + " must be at least " + minLength + " characters long");
        }
        
        if (value.length() > maxLength) {
            throw new BusinessLogicException(fieldName + " cannot exceed " + maxLength + " characters");
        }
    }

    /**
     * Validate required field
     */
    public void validateRequired(Object value, String fieldName) {
        if (value == null) {
            throw new BusinessLogicException(fieldName + " is required");
        }
        
        if (value instanceof String && !StringUtils.hasText((String) value)) {
            throw new BusinessLogicException(fieldName + " is required");
        }
    }

    /**
     * Validate enum value
     */
    public void validateEnumValue(String value, String fieldName, List<String> allowedValues) {
        if (!StringUtils.hasText(value)) {
            return;
        }
        
        if (!allowedValues.contains(value.toUpperCase())) {
            throw new BusinessLogicException(fieldName + " must be one of: " + String.join(", ", allowedValues));
        }
    }

    /**
     * Validate positive number
     */
    public void validatePositiveNumber(Number value, String fieldName) {
        if (value != null && value.doubleValue() <= 0) {
            throw new BusinessLogicException(fieldName + " must be a positive number");
        }
    }

    /**
     * Validate non-negative number
     */
    public void validateNonNegativeNumber(Number value, String fieldName) {
        if (value != null && value.doubleValue() < 0) {
            throw new BusinessLogicException(fieldName + " cannot be negative");
        }
    }

    /**
     * Validate number range
     */
    public void validateNumberRange(Number value, String fieldName, double min, double max) {
        if (value == null) {
            return;
        }
        
        double doubleValue = value.doubleValue();
        if (doubleValue < min || doubleValue > max) {
            throw new BusinessLogicException(fieldName + " must be between " + min + " and " + max);
        }
    }

    /**
     * Validate file size
     */
    public void validateFileSize(long fileSizeBytes, String fieldName, long maxSizeBytes) {
        if (fileSizeBytes > maxSizeBytes) {
            double maxSizeMB = maxSizeBytes / (1024.0 * 1024.0);
            throw new BusinessLogicException(fieldName + " size cannot exceed " + String.format("%.1f", maxSizeMB) + " MB");
        }
    }

    /**
     * Validate file extension
     */
    public void validateFileExtension(String fileName, String fieldName, List<String> allowedExtensions) {
        if (!StringUtils.hasText(fileName)) {
            throw new BusinessLogicException(fieldName + " filename is required");
        }
        
        String extension = getFileExtension(fileName);
        if (extension == null || !allowedExtensions.contains(extension.toLowerCase())) {
            throw new BusinessLogicException(fieldName + " must have one of these extensions: " + String.join(", ", allowedExtensions));
        }
    }

    /**
     * Get file extension from filename
     */
    private String getFileExtension(String fileName) {
        if (!StringUtils.hasText(fileName)) {
            return null;
        }
        
        int lastDotIndex = fileName.lastIndexOf('.');
        if (lastDotIndex == -1 || lastDotIndex == fileName.length() - 1) {
            return null;
        }
        
        return fileName.substring(lastDotIndex + 1);
    }

    /**
     * Validate URL format
     */
    public void validateUrl(String url, String fieldName) {
        if (!StringUtils.hasText(url)) {
            return;
        }
        
        try {
            new java.net.URL(url);
        } catch (java.net.MalformedURLException e) {
            throw new BusinessLogicException(fieldName + " must be a valid URL");
        }
    }

    /**
     * Validate multilingual content - at least one language required
     */
    public void validateMultilingualContent(String en, String rw, String fr, String fieldName) {
        if (!StringUtils.hasText(en) && !StringUtils.hasText(rw) && !StringUtils.hasText(fr)) {
            throw new BusinessLogicException(fieldName + " must be provided in at least one language");
        }
    }

    /**
     * Validate heritage site status transitions
     */
    public void validateStatusTransition(String currentStatus, String newStatus) {
        // Define allowed status transitions
        if (!isValidStatusTransition(currentStatus, newStatus)) {
            throw new BusinessLogicException("Cannot change status from " + currentStatus + " to " + newStatus);
        }
    }

    private boolean isValidStatusTransition(String currentStatus, String newStatus) {
        // Simplified validation - you can extend this based on business rules
        if (currentStatus == null || newStatus == null) {
            return false;
        }
        
        // Allow any transition for now - extend with specific business rules
        return !currentStatus.equals(newStatus);
    }
}
