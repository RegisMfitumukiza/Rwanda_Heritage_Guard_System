package com.rwandaheritage.heritageguard.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ForumPostVersionDTO {
    private Long id;
    private Long postId;
    private String content;
    private String language;
    private String modifiedBy;
    private LocalDateTime modifiedDate;
    private String changeReason;
    private Integer versionNumber;
} 