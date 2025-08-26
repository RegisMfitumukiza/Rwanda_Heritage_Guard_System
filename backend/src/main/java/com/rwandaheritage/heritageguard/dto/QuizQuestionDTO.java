package com.rwandaheritage.heritageguard.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuizQuestionDTO {
    
    private Long id;
    
    @NotNull(message = "Quiz ID is required")
    private Long quizId;
    
    @NotBlank(message = "Question text in English is required")
    @Size(max = 2000, message = "Question text cannot exceed 2000 characters")
    private String questionTextEn;
    
    @Size(max = 2000, message = "Question text cannot exceed 2000 characters")
    private String questionTextRw;
    
    @Size(max = 2000, message = "Question text cannot exceed 2000 characters")
    private String questionTextFr;
    
    @Size(max = 1000, message = "Explanation cannot exceed 1000 characters")
    private String explanationEn;
    
    @Size(max = 1000, message = "Explanation cannot exceed 1000 characters")
    private String explanationRw;
    
    @Size(max = 1000, message = "Explanation cannot exceed 1000 characters")
    private String explanationFr;
    
    private String questionType;
    
    @Min(value = 1, message = "Points must be at least 1")
    @Max(value = 10, message = "Points cannot exceed 10")
    @Builder.Default
    private Integer points = 1;
    
    @Min(value = 1, message = "Question order must be at least 1")
    private Integer questionOrder;
    
    @Builder.Default
    private boolean isActive = true;
    
    // Options for multiple choice questions
    private List<QuizOptionDTO> options;
    
    // Audit fields
    private String createdBy;
    private LocalDateTime createdDate;
    private String updatedBy;
    private LocalDateTime updatedDate;
    
    // Manual getter/setter methods for boolean fields (Lombok compatibility)
    public boolean getIsActive() { return isActive; }
    public void setIsActive(boolean isActive) { this.isActive = isActive; }
}
