package com.rwandaheritage.heritageguard.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "forum_likes", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "like_type", "target_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForumLike {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId; // Username or user identifier

    @Enumerated(EnumType.STRING)
    @Column(name = "like_type", nullable = false, length = 10)
    private LikeType likeType; // TOPIC or POST

    @Column(name = "target_id", nullable = false)
    private Long targetId; // ID of the topic or post

    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;

    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
    }

    public enum LikeType {
        TOPIC, POST
    }
} 