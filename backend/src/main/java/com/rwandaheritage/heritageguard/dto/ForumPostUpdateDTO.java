package com.rwandaheritage.heritageguard.dto;

import lombok.*;
import jakarta.validation.constraints.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForumPostUpdateDTO {
    
    @NotBlank(message = "Post content is required")
    @Size(max = 10000, message = "Post content cannot exceed 10000 characters")
    private String content;
    
    @Pattern(regexp = "^(en|rw|fr)$", message = "Language must be 'en', 'rw', or 'fr'")
    private String language;
    
    @NotBlank(message = "Change reason is required")
    @Size(max = 500, message = "Change reason cannot exceed 500 characters")
    private String changeReason;
} 