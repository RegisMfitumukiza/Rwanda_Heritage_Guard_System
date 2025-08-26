package com.rwandaheritage.heritageguard.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
@Slf4j
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    @Value("${jwt.remember-me-expiration}")
    private long rememberMeExpiration;

    public String extractUsername(String token) {
        try {
            String username = extractClaim(token, Claims::getSubject);
            log.debug("Extracted username from token: {}", username);
            return username;
        } catch (Exception e) {
            log.error("Error extracting username from token: {}", e.getMessage());
            throw e;
        }
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        try {
            final Claims claims = extractAllClaims(token);
            return claimsResolver.apply(claims);
        } catch (Exception e) {
            log.error("Error extracting claim from token: {}", e.getMessage());
            throw e;
        }
    }

    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails, jwtExpiration);
    }

    public String generateToken(UserDetails userDetails, boolean rememberMe) {
        long expiration = rememberMe ? rememberMeExpiration : jwtExpiration;
        return generateToken(new HashMap<>(), userDetails, expiration);
    }

    public String generateRefreshToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails, refreshExpiration);
    }

    private String generateToken(Map<String, Object> extraClaims, UserDetails userDetails, long expiration) {
        try {
            String token = Jwts.builder()
                    .setClaims(extraClaims)
                    .setSubject(userDetails.getUsername())
                    .setIssuedAt(new Date(System.currentTimeMillis()))
                    .setExpiration(new Date(System.currentTimeMillis() + expiration))
                    .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                    .compact();
            log.debug("Generated token for user: {} with expiration: {} ms", userDetails.getUsername(), expiration);
            return token;
        } catch (Exception e) {
            log.error("Error generating token for user {}: {}", userDetails.getUsername(), e.getMessage());
            throw e;
        }
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            boolean isValid = (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
            log.debug("Token validation for user {}: {}", userDetails.getUsername(), isValid);
            return isValid;
        } catch (Exception e) {
            log.error("Error validating token: {}", e.getMessage());
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        try {
            boolean expired = extractExpiration(token).before(new Date());
            log.debug("Token expiration check: {}", expired);
            return expired;
        } catch (Exception e) {
            log.error("Error checking token expiration: {}", e.getMessage());
            return true;
        }
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            log.error("Error extracting claims from token: {}", e.getMessage());
            throw e;
        }
    }

    private Key getSigningKey() {
        try {
            byte[] keyBytes = secretKey.getBytes();
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (Exception e) {
            log.error("Error generating signing key: {}", e.getMessage());
            throw e;
        }
    }

    public LocalDateTime getTokenExpiryDate(String token) {
        return extractExpiration(token).toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();
    }
} 