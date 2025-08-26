package com.rwandaheritage.heritageguard.repository;

import com.rwandaheritage.heritageguard.model.PasswordResetToken;
import com.rwandaheritage.heritageguard.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    void deleteByUser(User user);
} 