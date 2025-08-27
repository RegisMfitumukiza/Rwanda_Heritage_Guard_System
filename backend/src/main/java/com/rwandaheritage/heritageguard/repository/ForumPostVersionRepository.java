package com.rwandaheritage.heritageguard.repository;

import com.rwandaheritage.heritageguard.model.ForumPostVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ForumPostVersionRepository extends JpaRepository<ForumPostVersion, Long> {
    
    // Find all versions for a post, ordered by version number
    List<ForumPostVersion> findByPostIdOrderByVersionNumberAsc(Long postId);
    
    // Find latest version number for a post
    @Query("SELECT MAX(v.versionNumber) FROM ForumPostVersion v WHERE v.postId = :postId")
    Optional<Integer> findLatestVersionNumber(@Param("postId") Long postId);
    
    // Find specific version of a post
    Optional<ForumPostVersion> findByPostIdAndVersionNumber(Long postId, Integer versionNumber);
    
    // Count versions for a post
    long countByPostId(Long postId);
} 