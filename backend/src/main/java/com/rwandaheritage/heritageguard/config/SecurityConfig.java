package com.rwandaheritage.heritageguard.config;

import com.rwandaheritage.heritageguard.security.JwtAuthenticationFilter;
import com.rwandaheritage.heritageguard.security.RateLimitFilter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
// CORS imports moved to CorsConfig
import org.springframework.http.HttpMethod;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;
    private final RateLimitFilter rateLimitFilter;
    private final CorsConfig corsConfig;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        System.out.println("SecurityConfig: Setting up security filter chain");
        
        http
            // Enable CORS
            .cors(cors -> {
                System.out.println("SecurityConfig: Enabling CORS");
                cors.configurationSource(corsConfig.corsConfigurationSource());
            })
            
            // Disable CSRF for stateless API (JWT-based)
            .csrf(csrf -> {
                System.out.println("SecurityConfig: Disabling CSRF");
                csrf.disable();
            })
            
            // Security headers
            .headers(headers -> headers
                .frameOptions(frame -> frame.deny())
                .contentTypeOptions(contentType -> contentType.disable())
                .httpStrictTransportSecurity(hsts -> hsts
                    .maxAgeInSeconds(31536000)
                )
            )
            
            .authorizeHttpRequests(auth -> {
                System.out.println("SecurityConfig: Setting up authorization rules");
                
                auth
                // Public endpoints
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                .requestMatchers(
                    "/api/auth/register",
                    "/api/auth/forgot-password",
                    "/api/auth/reset-password",
                    "/api/auth/refresh",
                    "/api/auth/google/callback",
                    "/api/auth/google",
                    "/api/auth/verify-email",
                    "/api/auth/resend-verification",
                    "/api/auth/request-unlock",
                    "/api/auth/unlock-account",
                    "/error"
                ).permitAll()
                
                // Authentication endpoints requiring valid token
                .requestMatchers("/api/auth/logout").authenticated()
                .requestMatchers("/api/auth/test-user-data").authenticated()
                
                // OpenAPI/Swagger UI endpoints
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                
                // Role-based access control
                .requestMatchers("/api/admin/**").hasRole("SYSTEM_ADMINISTRATOR")
                .requestMatchers("/api/heritage/**").hasAnyRole("SYSTEM_ADMINISTRATOR", "HERITAGE_MANAGER")
                .requestMatchers("/api/content/**").hasAnyRole("SYSTEM_ADMINISTRATOR", "CONTENT_MANAGER")
                .requestMatchers("/api/community/**").hasAnyRole("SYSTEM_ADMINISTRATOR", "HERITAGE_MANAGER", "CONTENT_MANAGER", "COMMUNITY_MEMBER")
                .requestMatchers("/api/public/**").permitAll()
                
                // User profile endpoints
                .requestMatchers("/api/users/profile/**").authenticated()
                
                // Allow public GET access to heritage sites
                .requestMatchers(HttpMethod.GET, "/api/heritage-sites", "/api/heritage-sites/", "/api/heritage-sites/*", "/api/heritage-sites/search").permitAll()
                // Allow public GET access to media
                .requestMatchers(HttpMethod.GET, "/api/media", "/api/media/", "/api/media/*").permitAll()
                // Allow public GET access to forum search (public topics and posts)
                .requestMatchers(HttpMethod.GET, "/api/forum/topics/search", "/api/forum/topics/search/advanced", "/api/forum/posts/search/advanced").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/forum/topics", "/api/forum/topics/*", "/api/forum/posts/topic/*").permitAll()
                // Allow public GET access to forum language-specific endpoints
                .requestMatchers(HttpMethod.GET, "/api/forum/topics/language/*").permitAll()
                // Allow public GET access to forum translation content (read-only)
                .requestMatchers(HttpMethod.GET, "/api/forum/translations/content/*/*/*", "/api/forum/translations/content/*/*/*/languages").permitAll()
                // Allow public GET access to multilingual endpoints
                .requestMatchers(HttpMethod.GET, "/api/languages/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/translations/text", "/api/translations/content", "/api/translations/by-type-language", "/api/translations/search", "/api/translations/exists").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/translation-memory/suggestions", "/api/translation-memory/exact-match", "/api/translation-memory/by-language-pair", "/api/translation-memory/search", "/api/translation-memory/most-used").permitAll()
                // Allow public GET access to educational articles (public articles only)
                .requestMatchers(HttpMethod.GET, "/api/education/articles", "/api/education/articles/", "/api/education/articles/*", "/api/education/articles/category/*", "/api/education/articles/difficulty/*", "/api/education/articles/search").permitAll()
                // Allow public GET access to educational articles public endpoint
                .requestMatchers(HttpMethod.GET, "/api/education/articles/public").permitAll()
                // Allow public GET access to educational articles multilingual endpoints
                .requestMatchers(HttpMethod.GET, "/api/education/articles/*/language/*", "/api/education/articles/language/*").permitAll()
                // Allow public GET access to quizzes (public quizzes only)
                .requestMatchers(HttpMethod.GET, "/api/education/quizzes", "/api/education/quizzes/", "/api/education/quizzes/*", "/api/education/quizzes/search", "/api/education/quizzes/tags/*", "/api/education/quizzes/with-tags", "/api/education/quizzes/article/*").permitAll()
                // Allow public GET access to quizzes multilingual endpoints
                .requestMatchers(HttpMethod.GET, "/api/education/quizzes/*/language/*", "/api/education/quizzes/language/*").permitAll()
                // Allow public GET access to documents (public documents only)
                .requestMatchers(HttpMethod.GET, "/api/documents/public", "/api/documents/public/*", "/api/documents/types", "/api/documents/languages").permitAll()
                // Allow public GET access to folders (public folders only)
                .requestMatchers(HttpMethod.GET, "/api/folders/permissions").permitAll()
                // Allow public GET access to artifacts (public artifacts only)
                .requestMatchers(HttpMethod.GET, "/api/artifacts", "/api/artifacts/", "/api/artifacts/*", "/api/artifacts/search").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/artifacts/*/media").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/artifacts/*/authentications").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/artifacts/*/provenance").permitAll()
                
                // Allow public GET access to statistics endpoints (for landing page)
                .requestMatchers(HttpMethod.GET, "/api/users/statistics").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/heritage-sites/statistics").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/documents/statistics").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/artifacts/statistics").permitAll()
                
                // User management endpoints - admin only
                .requestMatchers("/api/users", "/api/users/*").hasRole("SYSTEM_ADMINISTRATOR")
                
                // Community management endpoints - content managers and admins
                .requestMatchers("/api/community-reports/**").hasAnyRole("CONTENT_MANAGER", "SYSTEM_ADMINISTRATOR")
                .requestMatchers("/api/moderation/**").hasAnyRole("CONTENT_MANAGER", "SYSTEM_ADMINISTRATOR")
                
                // Notifications endpoints - authenticated users only
                .requestMatchers("/api/notifications", "/api/notifications/*").authenticated()
                
                // Allow public GET access to activity endpoints (for dashboard)
                .requestMatchers(HttpMethod.GET, "/api/activity/**").permitAll()
                // Allow OPTIONS requests for CORS preflight
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/artifacts/statistics/category").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/education/articles/statistics").permitAll()
                
                // Allow public GET access to testimonials (approved testimonials only)
                .requestMatchers(HttpMethod.GET, "/api/testimonials", "/api/testimonials/", "/api/testimonials/*", "/api/testimonials/search", "/api/testimonials/page").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/testimonials/*/avatar").permitAll()
                
                // Allow public access to media download for viewing images
                .requestMatchers(HttpMethod.GET, "/api/media/download/*").permitAll()
                // Restrict document download to COMMUNITY_MEMBER or higher
                .requestMatchers(HttpMethod.GET, "/api/documents/download/*").hasAnyRole("SYSTEM_ADMINISTRATOR", "HERITAGE_MANAGER", "CONTENT_MANAGER", "COMMUNITY_MEMBER")
                // Restrict artifact media download to COMMUNITY_MEMBER or higher
                .requestMatchers(HttpMethod.GET, "/api/artifacts/*/media/*/download").hasAnyRole("SYSTEM_ADMINISTRATOR", "HERITAGE_MANAGER", "CONTENT_MANAGER", "COMMUNITY_MEMBER")
                // Restrict authentication and provenance document download to COMMUNITY_MEMBER or higher
                .requestMatchers(HttpMethod.GET, "/api/artifacts/*/authentications/*/document").hasAnyRole("SYSTEM_ADMINISTRATOR", "HERITAGE_MANAGER", "CONTENT_MANAGER", "COMMUNITY_MEMBER")
                .requestMatchers(HttpMethod.GET, "/api/artifacts/*/provenance/*/document").hasAnyRole("SYSTEM_ADMINISTRATOR", "HERITAGE_MANAGER", "CONTENT_MANAGER", "COMMUNITY_MEMBER")
                // Default: require authentication
                .anyRequest().authenticated();
            })
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\": \"Unauthorized\", \"message\": \"" + authException.getMessage() + "\"}");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\": \"Forbidden\", \"message\": \"Access denied\"}");
                })
            );
     
        return http.build();
    }

    // CORS configuration moved to dedicated CorsConfig class
} 