package com.rwandaheritage.heritageguard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private String error;
    private String message;
    private int status;
    private String path;
    private LocalDateTime timestamp;
    private List<String> details;
    private Map<String, Object> additionalInfo;
    
    public static ErrorResponse of(String error, String message, int status, String path) {
        return ErrorResponse.builder()
                .error(error)
                .message(message)
                .status(status)
                .path(path)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    public static ErrorResponse of(String error, String message, int status, String path, List<String> details) {
        return ErrorResponse.builder()
                .error(error)
                .message(message)
                .status(status)
                .path(path)
                .timestamp(LocalDateTime.now())
                .details(details)
                .build();
    }
    
    public static ErrorResponse badRequest(String message, String path) {
        return of("Bad Request", message, 400, path);
    }
    
    public static ErrorResponse unauthorized(String message, String path) {
        return of("Unauthorized", message, 401, path);
    }
    
    public static ErrorResponse forbidden(String message, String path) {
        return of("Forbidden", message, 403, path);
    }
    
    public static ErrorResponse notFound(String message, String path) {
        return of("Not Found", message, 404, path);
    }
    
    public static ErrorResponse conflict(String message, String path) {
        return of("Conflict", message, 409, path);
    }
    
    public static ErrorResponse unprocessableEntity(String message, String path) {
        return of("Unprocessable Entity", message, 422, path);
    }
    
    public static ErrorResponse internalServerError(String message, String path) {
        return of("Internal Server Error", message, 500, path);
    }
}