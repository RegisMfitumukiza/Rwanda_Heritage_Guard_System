package com.rwandaheritage.heritageguard.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignManagerDto {
    
    @NotNull(message = "Manager user ID is required")
    @Positive(message = "Manager user ID must be positive")
    private Long managerId;
    
    private String notes;
}
