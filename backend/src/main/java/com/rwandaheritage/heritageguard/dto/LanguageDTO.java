package com.rwandaheritage.heritageguard.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LanguageDTO {
    
    private Long id;
    
    @NotBlank(message = "Language code is required")
    @Pattern(regexp = "^[a-z]{2,3}$", message = "Language code must be 2-3 lowercase letters (ISO format)")
    private String code;
    
    @NotBlank(message = "Language name is required")
    @Size(max = 100, message = "Language name cannot exceed 100 characters")
    private String name;
    
    @Builder.Default
    private boolean isDefault = false;
    
    @Builder.Default
    private boolean isActive = true;
    
    // Audit fields
    private String createdBy;
    private LocalDateTime createdDate;
    private String updatedBy;
    private LocalDateTime updatedDate;
} 