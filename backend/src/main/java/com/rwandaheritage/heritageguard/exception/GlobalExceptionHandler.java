package com.rwandaheritage.heritageguard.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.transaction.TransactionSystemException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import lombok.extern.slf4j.Slf4j;

import jakarta.validation.ConstraintViolationException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;
import java.net.SocketTimeoutException;
import java.net.ConnectException;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // Error codes for different types of errors
    private static final String ERROR_CODE_AUTHENTICATION = "AUTH_001";
    private static final String ERROR_CODE_AUTHORIZATION = "AUTH_002";
    private static final String ERROR_CODE_VALIDATION = "VAL_001";
    private static final String ERROR_CODE_NOT_FOUND = "RES_001";
    private static final String ERROR_CODE_CONFLICT = "RES_002";
    private static final String ERROR_CODE_INTERNAL = "SYS_001";
    private static final String ERROR_CODE_FILE_UPLOAD = "FILE_001";
    private static final String ERROR_CODE_DATABASE = "DB_001";

    /**
     * Create a structured error response
     */
    private Map<String, Object> createErrorResponse(
            String errorCode, 
            String error, 
            String message, 
            String details, 
            HttpStatus status) {
        
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("errorCode", errorCode);
        body.put("error", error);
        body.put("message", message);
        body.put("details", details);
        body.put("path", "/api"); // Will be set by individual handlers
        return body;
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Object> handleBadCredentials(BadCredentialsException ex) {
        Map<String, Object> body = createErrorResponse(
            ERROR_CODE_AUTHENTICATION,
            "Authentication Failed",
            "Invalid username or password",
            "Please check your credentials and try again",
            HttpStatus.UNAUTHORIZED
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    @ExceptionHandler(LockedException.class)
    public ResponseEntity<Map<String, Object>> handleLockedException(LockedException ex) {
        log.error("Account locked: {}", ex.getMessage());
        Map<String, Object> body = createErrorResponse(
            ERROR_CODE_AUTHENTICATION,
            "Account Locked",
            "Your account has been locked due to multiple failed login attempts",
            "Please contact support for assistance in unlocking your account",
            HttpStatus.FORBIDDEN
        );
        return new ResponseEntity<>(body, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Object> handleResponseStatusException(ResponseStatusException ex) {
        Map<String, Object> body = createErrorResponse(
            ERROR_CODE_INTERNAL,
            ex.getStatusCode().toString(),
            ex.getReason() != null ? ex.getReason() : "Request failed",
            "The request could not be processed",
            HttpStatus.valueOf(ex.getStatusCode().value())
        );
        return new ResponseEntity<>(body, ex.getStatusCode());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDeniedException(AccessDeniedException ex) {
        Map<String, Object> body = createErrorResponse(
            ERROR_CODE_AUTHORIZATION,
            "Forbidden",
            ex.getMessage() != null ? ex.getMessage() : "Access Denied",
            "You do not have permission to access this resource",
            HttpStatus.FORBIDDEN
        );
        return new ResponseEntity<>(body, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<Map<String, Object>> handleSecurityException(SecurityException ex) {
        log.warn("Security violation: {}", ex.getMessage());
        Map<String, Object> body = createErrorResponse(
            ERROR_CODE_AUTHORIZATION,
            "Forbidden",
            "Access Denied",
            ex.getMessage(),
            HttpStatus.FORBIDDEN
        );
        return new ResponseEntity<>(body, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        log.error("Runtime error occurred", ex); // Log full stack trace
        Map<String, Object> body = createErrorResponse(
            ERROR_CODE_INTERNAL,
            "Internal Server Error",
            "An unexpected error occurred. Please try again later",
            ex.getMessage(),
            HttpStatus.INTERNAL_SERVER_ERROR
        );
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException ex) {
        log.warn("Invalid argument provided: {}", ex.getMessage());
        Map<String, Object> body = createErrorResponse(
            ERROR_CODE_VALIDATION,
            "Bad Request",
            "Invalid request parameters",
            ex.getMessage(),
            HttpStatus.BAD_REQUEST
        );
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    // Validation exception handlers
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.toList());
        
        log.warn("Validation failed: {}", errors);
        
        Map<String, Object> body = createErrorResponse(
            ERROR_CODE_VALIDATION,
            "Validation Failed",
            "Request validation failed",
            String.join("; ", errors),
            HttpStatus.BAD_REQUEST
        );
        body.put("fieldErrors", errors);
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolation(ConstraintViolationException ex) {
        List<String> errors = ex.getConstraintViolations()
                .stream()
                .map(violation -> violation.getPropertyPath() + ": " + violation.getMessage())
                .collect(Collectors.toList());
        
        log.warn("Constraint violation: {}", errors);
        
        Map<String, Object> body = createErrorResponse(
            ERROR_CODE_VALIDATION,
            "Validation Failed",
            "Constraint validation failed",
            String.join("; ", errors),
            HttpStatus.BAD_REQUEST
        );
        body.put("constraintViolations", errors);
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        log.warn("Type mismatch for parameter: {} = {}", ex.getName(), ex.getValue());
        
        Map<String, Object> body = createErrorResponse(
            ERROR_CODE_VALIDATION,
            "Bad Request",
            "Parameter type mismatch",
            String.format("Parameter '%s' should be of type %s", ex.getName(), ex.getRequiredType().getSimpleName()),
            HttpStatus.BAD_REQUEST
        );
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    // Database exception handlers
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        log.error("Data integrity violation: {}", ex.getMessage());
        
        Map<String, Object> body = createErrorResponse(
            ERROR_CODE_DATABASE,
            "Data Integrity Error",
            "Data integrity constraint violation",
            "The requested operation would violate data integrity rules",
            HttpStatus.CONFLICT
        );
        return new ResponseEntity<>(body, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(EmptyResultDataAccessException.class)
    public ResponseEntity<Map<String, Object>> handleEmptyResult(EmptyResultDataAccessException ex) {
        log.warn("Empty result for operation: {}", ex.getMessage());
        
        Map<String, Object> body = createErrorResponse(
            ERROR_CODE_NOT_FOUND,
            "Not Found",
            "Requested resource not found",
            "The requested resource does not exist or has been removed",
            HttpStatus.NOT_FOUND
        );
        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(TransactionSystemException.class)
    public ResponseEntity<Map<String, Object>> handleTransactionException(TransactionSystemException ex) {
        log.error("Transaction failed: {}", ex.getMessage());
        
        Map<String, Object> body = createErrorResponse(
            ERROR_CODE_DATABASE,
            "Transaction Error",
            "Database transaction failed",
            "The requested operation could not be completed due to a database transaction failure",
            HttpStatus.INTERNAL_SERVER_ERROR
        );
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // File upload exception handlers
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException ex) {
        log.warn("File upload size exceeded: {}", ex.getMessage());
        
        Map<String, Object> body = createErrorResponse(
            ERROR_CODE_FILE_UPLOAD,
            "File Too Large",
            "Uploaded file exceeds maximum allowed size",
            "Please reduce the file size and try again",
            HttpStatus.PAYLOAD_TOO_LARGE
        );
        return new ResponseEntity<>(body, HttpStatus.PAYLOAD_TOO_LARGE);
    }

    // HTTP message parsing exception handlers
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        log.warn("HTTP message not readable: {}", ex.getMessage());
        
        Map<String, Object> body = createErrorResponse(
            ERROR_CODE_VALIDATION,
            "Bad Request",
            "Invalid request body",
            "The request body could not be parsed or is malformed",
            HttpStatus.BAD_REQUEST
        );
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    // Custom exception handlers
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFound(ResourceNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        
        Map<String, Object> body = createErrorResponse(
            ERROR_CODE_NOT_FOUND,
            "Not Found",
            ex.getMessage(),
            "The requested resource does not exist",
            HttpStatus.NOT_FOUND
        );
        
        if (ex.getResourceName() != null) {
            body.put("resourceName", ex.getResourceName());
            body.put("fieldName", ex.getFieldName());
            body.put("fieldValue", ex.getFieldValue());
        }
        
        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(BusinessLogicException.class)
    public ResponseEntity<Map<String, Object>> handleBusinessLogicException(BusinessLogicException ex) {
        log.warn("Business logic violation: {}", ex.getMessage());
        
        Map<String, Object> body = createErrorResponse(
            ex.getErrorCode(),
            "Business Rule Violation",
            ex.getMessage(),
            ex.getBusinessRule() != null ? ex.getBusinessRule() : "Business rule validation failed",
            HttpStatus.BAD_REQUEST
        );
        
        body.put("businessRule", ex.getBusinessRule());
        
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        log.error("Unhandled exception occurred", ex);
        Map<String, Object> body = createErrorResponse(
            ERROR_CODE_INTERNAL,
            "Internal Server Error",
            "An unexpected error occurred. Please try again later",
            "Please contact support if the problem persists",
            HttpStatus.INTERNAL_SERVER_ERROR
        );
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // JWT and authentication related exceptions
    @ExceptionHandler(io.jsonwebtoken.ExpiredJwtException.class)
    public ResponseEntity<Map<String, Object>> handleExpiredJwtException(io.jsonwebtoken.ExpiredJwtException ex) {
        log.warn("JWT token expired: {}", ex.getMessage());
        Map<String, Object> body = createErrorResponse(
            ERROR_CODE_AUTHENTICATION,
            "Token Expired",
            "Your session has expired",
            "Please log in again to continue",
            HttpStatus.UNAUTHORIZED
        );
        return new ResponseEntity<>(body, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(io.jsonwebtoken.MalformedJwtException.class)
    public ResponseEntity<Map<String, Object>> handleMalformedJwtException(io.jsonwebtoken.MalformedJwtException ex) {
        log.warn("Malformed JWT token: {}", ex.getMessage());
        Map<String, Object> body = createErrorResponse(
            ERROR_CODE_AUTHENTICATION,
            "Invalid Token",
            "Invalid authentication token",
            "Please log in again",
            HttpStatus.UNAUTHORIZED
        );
        return new ResponseEntity<>(body, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Handle rate limit exceptions
     */
    @ExceptionHandler(org.springframework.web.HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> handleMethodNotSupported(org.springframework.web.HttpRequestMethodNotSupportedException ex) {
        log.warn("Method not supported: {} {}", ex.getMethod(), ex.getMessage());
        Map<String, Object> body = createErrorResponse(
            "METHOD_001",
            "Method Not Supported",
            "The HTTP method is not supported for this endpoint",
            "Please check the API documentation for supported methods",
            HttpStatus.METHOD_NOT_ALLOWED
        );
        return new ResponseEntity<>(body, HttpStatus.METHOD_NOT_ALLOWED);
    }

    /**
     * Handle network timeout exceptions
     */
    @ExceptionHandler(SocketTimeoutException.class)
    public ResponseEntity<Map<String, Object>> handleSocketTimeoutException(SocketTimeoutException ex) {
        log.warn("Socket timeout: {}", ex.getMessage());
        Map<String, Object> body = createErrorResponse(
            "TIMEOUT_001",
            "Request Timeout",
            "The request timed out",
            "Please try again or contact support if the problem persists",
            HttpStatus.REQUEST_TIMEOUT
        );
        return new ResponseEntity<>(body, HttpStatus.REQUEST_TIMEOUT);
    }

    /**
     * Handle connection exceptions
     */
    @ExceptionHandler(ConnectException.class)
    public ResponseEntity<Map<String, Object>> handleConnectException(ConnectException ex) {
        log.error("Connection failed: {}", ex.getMessage());
        Map<String, Object> body = createErrorResponse(
            "CONN_001",
            "Connection Failed",
            "Unable to connect to the service",
            "Please check your connection and try again",
            HttpStatus.SERVICE_UNAVAILABLE
        );
        return new ResponseEntity<>(body, HttpStatus.SERVICE_UNAVAILABLE);
    }
} 