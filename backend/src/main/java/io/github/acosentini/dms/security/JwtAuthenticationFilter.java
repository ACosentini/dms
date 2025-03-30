package io.github.acosentini.dms.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        logger.info("Processing request: {} {}", request.getMethod(), request.getRequestURI());
        
        // Skip token validation for public endpoints
        String path = request.getRequestURI().substring(request.getContextPath().length());
        if (path.startsWith("/hello") || path.startsWith("/auth/")) {
            logger.info("Skipping authentication for public path: {}", path);
            filterChain.doFilter(request, response);
            return;
        }
        
        String token = jwtTokenProvider.resolveToken(request);
        logger.info("Token found: {}", token != null ? "yes" : "no");
        
        if (token == null) {
            logger.warn("No token found in request");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
        
        try {
            boolean isValid = jwtTokenProvider.validateToken(token);
            logger.info("Token validation result: {}", isValid);
            
            if (!isValid) {
                logger.warn("Invalid token");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
            
            Authentication auth = jwtTokenProvider.getAuthentication(token);
            logger.info("Authentication created: {} for user: {}", 
                auth != null, 
                auth != null ? auth.getName() : "none"
            );
            
            if (auth == null) {
                logger.warn("Could not create authentication from token");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
            
            SecurityContextHolder.getContext().setAuthentication(auth);
            logger.info("Authentication set in SecurityContext");
            
        } catch (Exception e) {
            logger.error("Could not set user authentication", e);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
        
        filterChain.doFilter(request, response);
    }
} 