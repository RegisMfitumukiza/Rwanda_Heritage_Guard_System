package com.rwandaheritage.heritageguard.repository;

import com.rwandaheritage.heritageguard.model.ForumLike;
import com.rwandaheritage.heritageguard.model.ForumLike.LikeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ForumLikeRepository extends JpaRepository<ForumLike, Long> {
    long countByLikeTypeAndTargetId(LikeType likeType, Long targetId);
    boolean existsByUserIdAndLikeTypeAndTargetId(String userId, LikeType likeType, Long targetId);
    Optional<ForumLike> findByUserIdAndLikeTypeAndTargetId(String userId, LikeType likeType, Long targetId);
} 