package com.rwandaheritage.heritageguard.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuizResultDTO {
    
    private Long id;
    
    @NotNull(message = "Attempt ID is required")
    private Long attemptId;
    
    @NotNull(message = "Question ID is required")
    private Long questionId;
    
    private Long selectedOptionId;
    
    @Builder.Default
    private boolean isCorrect = false;
    
    @Min(value = 0, message = "Points earned cannot be negative")
    private Integer pointsEarned;
    
    @Min(value = 0, message = "Max points cannot be negative")
    private Integer maxPoints;
    
    @Min(value = 0, message = "Time taken cannot be negative")
    private Integer timeTakenSeconds;
    
    // Audit fields
    private String createdBy;
    private LocalDateTime createdDate;
    private String updatedBy;
    private LocalDateTime updatedDate;
    
    // Manual getter/setter methods for boolean fields (Lombok compatibility)
    public boolean getIsCorrect() { return isCorrect; }
    public void setIsCorrect(boolean isCorrect) { this.isCorrect = isCorrect; }
} 