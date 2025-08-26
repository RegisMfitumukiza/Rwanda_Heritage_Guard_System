package com.rwandaheritage.heritageguard.security;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final Environment environment;
    
    // Rate limits per endpoint type - MUCH HIGHER for development
    private static final int MAX_LOGIN_REQUESTS_PER_MINUTE = 20; // Increased from 5
    private static final int MAX_REGISTER_REQUESTS_PER_MINUTE = 10; // Increased from 3
    private static final int MAX_API_REQUESTS_PER_MINUTE = 1000; // Increased from 100 (10x)
    private static final int MAX_FILE_UPLOAD_REQUESTS_PER_MINUTE = 50; // Increased from 10
    
    // Development mode overrides - Reduced to prevent excessive logging
    private static final int DEV_MAX_API_REQUESTS_PER_MINUTE = 10000; // Increased to 10000 for development
    private static final int DEV_MAX_LOGIN_REQUESTS_PER_MINUTE = 200;
    private static final int DEV_MAX_REGISTER_REQUESTS_PER_MINUTE = 100;
    private static final int DEV_MAX_FILE_UPLOAD_REQUESTS_PER_MINUTE = 500;
    
    private final LoadingCache<String, Integer> loginRequestCounts;
    private final LoadingCache<String, Integer> registerRequestCounts;
    private final LoadingCache<String, Integer> apiRequestCounts;
    private final LoadingCache<String, Integer> fileUploadRequestCounts;

    public RateLimitFilter(Environment environment) {
        super();
        this.environment = environment;
        
        // Check if we're in development mode
        boolean isDev = isDevelopmentMode();
        
        // Use development limits if in dev mode
        int actualApiLimit = isDev ? DEV_MAX_API_REQUESTS_PER_MINUTE : MAX_API_REQUESTS_PER_MINUTE;
        int actualLoginLimit = isDev ? DEV_MAX_LOGIN_REQUESTS_PER_MINUTE : MAX_LOGIN_REQUESTS_PER_MINUTE;
        int actualRegisterLimit = isDev ? DEV_MAX_REGISTER_REQUESTS_PER_MINUTE : MAX_REGISTER_REQUESTS_PER_MINUTE;
        int actualFileUploadLimit = isDev ? DEV_MAX_FILE_UPLOAD_REQUESTS_PER_MINUTE : MAX_FILE_UPLOAD_REQUESTS_PER_MINUTE;
        
        log.info("RateLimitFilter initialized - Environment: {}, API Limit: {} requests/minute", 
                isDev ? "DEVELOPMENT" : "PRODUCTION", actualApiLimit);
        
        // Initialize rate limit caches with proper CacheLoader implementations
        loginRequestCounts = CacheBuilder.newBuilder()
                .expireAfterWrite(1, TimeUnit.MINUTES)
                .build(new CacheLoader<String, Integer>() {
                    @Override
                    public Integer load(String key) {
                        return 0;
                    }
                });
                
        registerRequestCounts = CacheBuilder.newBuilder()
                .expireAfterWrite(1, TimeUnit.MINUTES)
                .build(new CacheLoader<String, Integer>() {
                    @Override
                    public Integer load(String key) {
                        return 0;
                    }
                });
                
        apiRequestCounts = CacheBuilder.newBuilder()
                .expireAfterWrite(1, TimeUnit.MINUTES)
                .build(new CacheLoader<String, Integer>() {
                    @Override
                    public Integer load(String key) {
                        return 0;
                    }
                });
                
        fileUploadRequestCounts = CacheBuilder.newBuilder()
                .expireAfterWrite(1, TimeUnit.MINUTES)
                .build(new CacheLoader<String, Integer>() {
                    @Override
                    public Integer load(String key) {
                        return 0;
                    }
                });
    }
    
    private boolean isDevelopmentMode() {
        String[] activeProfiles = environment.getActiveProfiles();
        for (String profile : activeProfiles) {
            if (profile.equalsIgnoreCase("dev") || profile.equalsIgnoreCase("development")) {
                return true;
            }
        }
        
        // Check for development indicators
        String serverPort = environment.getProperty("server.port");
        if (serverPort != null && serverPort.equals("8080")) {
            return true; // Local development port
        }
        
        String datasourceUrl = environment.getProperty("spring.datasource.url");
        if (datasourceUrl != null && datasourceUrl.contains("localhost")) {
            return true; // Local database
        }
        
        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String clientIp = getClientIP(request);
        String requestUri = request.getRequestURI();
        String method = request.getMethod();
        
        // Skip rate limiting for development tools and health checks
        if (isDevelopmentMode() && (
            requestUri.contains("/actuator") || 
            requestUri.contains("/health") || 
            requestUri.contains("/info") ||
            requestUri.equals("/") ||
            requestUri.equals("/favicon.ico")
        )) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // Apply rate limiting based on endpoint type
        if (requestUri.equals("/api/auth/login") && method.equals("POST")) {
            if (isRateLimitExceeded(clientIp, loginRequestCounts, 
                    isDevelopmentMode() ? DEV_MAX_LOGIN_REQUESTS_PER_MINUTE : MAX_LOGIN_REQUESTS_PER_MINUTE)) {
                handleRateLimitExceeded(response, clientIp, "login");
                return;
            }
        } else if (requestUri.equals("/api/auth/register") && method.equals("POST")) {
            if (isRateLimitExceeded(clientIp, registerRequestCounts, 
                    isDevelopmentMode() ? DEV_MAX_REGISTER_REQUESTS_PER_MINUTE : MAX_REGISTER_REQUESTS_PER_MINUTE)) {
                handleRateLimitExceeded(response, clientIp, "registration");
                return;
            }
        } else if (requestUri.contains("/upload") || requestUri.contains("/media")) {
            if (isRateLimitExceeded(clientIp, fileUploadRequestCounts, 
                    isDevelopmentMode() ? DEV_MAX_FILE_UPLOAD_REQUESTS_PER_MINUTE : MAX_FILE_UPLOAD_REQUESTS_PER_MINUTE)) {
                handleRateLimitExceeded(response, clientIp, "file upload");
                return;
            }
        } else if (requestUri.startsWith("/api/")) {
            if (isRateLimitExceeded(clientIp, apiRequestCounts, 
                    isDevelopmentMode() ? DEV_MAX_API_REQUESTS_PER_MINUTE : MAX_API_REQUESTS_PER_MINUTE)) {
                handleRateLimitExceeded(response, clientIp, "API");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isRateLimitExceeded(String clientIp, LoadingCache<String, Integer> cache, int maxRequests) {
        int requests = 0;
        try {
            requests = cache.get(clientIp);
            if (requests >= maxRequests) {
                return true;
            }
            requests++;
            cache.put(clientIp, requests);
            return false;
        } catch (ExecutionException e) {
            log.error("Error checking rate limit for IP: {}", clientIp, e);
            return false;
        }
    }
    
    private void handleRateLimitExceeded(HttpServletResponse response, String clientIp, String endpointType) throws IOException {
        log.warn("Rate limit exceeded for IP: {} on {} (Limit: {} requests/minute)", 
                clientIp, endpointType, 
                isDevelopmentMode() ? DEV_MAX_API_REQUESTS_PER_MINUTE : MAX_API_REQUESTS_PER_MINUTE);
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType("application/json");
        response.getWriter().write(String.format(
            "{\"error\": \"Too many requests\", \"message\": \"Rate limit exceeded for %s. Please try again in a minute.\", \"retryAfter\": 60}",
            endpointType
        ));
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}