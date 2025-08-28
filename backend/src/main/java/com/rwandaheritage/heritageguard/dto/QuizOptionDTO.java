package com.rwandaheritage.heritageguard.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuizOptionDTO {
    
    private Long id;
    
    // Question ID is optional during creation, will be set automatically
    private Long questionId;
    
    @NotBlank(message = "Option text in English is required")
    @Size(max = 1000, message = "Option text cannot exceed 1000 characters")
    private String optionTextEn;
    
    @Size(max = 1000, message = "Option text cannot exceed 1000 characters")
    private String optionTextRw;
    
    @Size(max = 1000, message = "Option text cannot exceed 1000 characters")
    private String optionTextFr;
    
    @Builder.Default
    private boolean isCorrect = false;
    
    @Min(value = 1, message = "Option order must be at least 1")
    private Integer optionOrder;
    
    @Builder.Default
    private boolean isActive = true;
    
    // Audit fields
    private String createdBy;
    private LocalDateTime createdDate;
    private String updatedBy;
    private LocalDateTime updatedDate;
    
    // Manual getter/setter methods for boolean fields (Lombok compatibility)
    public boolean getIsCorrect() { return isCorrect; }
    public void setIsCorrect(boolean isCorrect) { this.isCorrect = isCorrect; }
    
    public boolean getIsActive() { return isActive; }
    public void setIsActive(boolean isActive) { this.isActive = isActive; }
}
