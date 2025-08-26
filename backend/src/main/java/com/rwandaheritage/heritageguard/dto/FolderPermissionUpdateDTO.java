package com.rwandaheritage.heritageguard.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FolderPermissionUpdateDTO {
    @NotNull(message = "Folder ID is required")
    private Long id;
    
    @Size(max = 10, message = "Cannot have more than 10 allowed roles")
    private List<@Pattern(regexp = "^(SYSTEM_ADMINISTRATOR|HERITAGE_MANAGER|CONTENT_MANAGER|COMMUNITY_MEMBER|PUBLIC)$", 
                         message = "Invalid role. Must be one of: SYSTEM_ADMINISTRATOR, HERITAGE_MANAGER, CONTENT_MANAGER, COMMUNITY_MEMBER, PUBLIC") String> allowedRoles;
}
