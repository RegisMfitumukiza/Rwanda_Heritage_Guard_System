package com.rwandaheritage.heritageguard.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuizAttemptDTO {
    
    private Long id;
    
    @NotNull(message = "Quiz ID is required")
    private Long quizId;
    
    @NotBlank(message = "User ID is required")
    private String userId;
    
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    
    @Min(value = 0, message = "Total score cannot be negative")
    private Integer totalScore;
    
    @Min(value = 0, message = "Max possible score cannot be negative")
    private Integer maxPossibleScore;
    
    @Min(value = 0, message = "Percentage score cannot be negative")
    @Max(value = 100, message = "Percentage score cannot exceed 100")
    private Double percentageScore;
    
    @Builder.Default
    private boolean passed = false;
    
    @NotNull(message = "Attempt number is required")
    @Min(value = 1, message = "Attempt number must be at least 1")
    private Integer attemptNumber;
    
    @Min(value = 0, message = "Time taken cannot be negative")
    private Integer timeTakenMinutes;
    
    @Builder.Default
    private boolean isCompleted = false;
    
    // Audit fields
    private String createdBy;
    private LocalDateTime createdDate;
    private String updatedBy;
    private LocalDateTime updatedDate;
    
    // Manual getter/setter methods for boolean fields (Lombok compatibility)
    public boolean getPassed() { return passed; }
    public void setPassed(boolean passed) { this.passed = passed; }
    
    public boolean getIsCompleted() { return isCompleted; }
    public void setIsCompleted(boolean isCompleted) { this.isCompleted = isCompleted; }
} 