package com.rwandaheritage.heritageguard.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            final String authHeader = request.getHeader("Authorization");
            final String jwt;
            final String username;

            // Debug logging
            System.out.println("JWT Filter: Processing request to " + request.getRequestURI());
            System.out.println("JWT Filter: Authorization header: " + (authHeader != null ? "present" : "null"));

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                // No JWT token - continue to next filter (this is normal for public endpoints)
                System.out.println("JWT Filter: No JWT token, continuing to next filter");
                filterChain.doFilter(request, response);
                return;
            }

            jwt = authHeader.substring(7);
            username = jwtService.extractUsername(jwt);
            System.out.println("JWT Filter: Extracted username: " + username);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                System.out.println("JWT Filter: Loading user details for username: " + username);
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    System.out.println("JWT Filter: Token is valid, setting authentication");
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    System.out.println("JWT Filter: Authentication set successfully");
                } else {
                    System.out.println("JWT Filter: Token is invalid");
                }
            } else {
                System.out.println("JWT Filter: Username is null or authentication already exists");
            }
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            // Only log JWT-related errors, don't block the request
            // This prevents the filter from interfering with public endpoints
            if (request.getHeader("Authorization") != null) {
                // Only log if there was actually a JWT token
                System.err.println("JWT Filter Error: " + e.getMessage());
                e.printStackTrace();
            }
            // Continue with the filter chain - let Spring Security handle authorization
            filterChain.doFilter(request, response);
        }
    }
} 