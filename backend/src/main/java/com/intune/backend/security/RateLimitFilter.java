package com.intune.backend.security;

import com.intune.backend.model.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Duration RATE_LIMIT_WINDOW = Duration.ofMinutes(1);

    private final InMemoryRateLimiter rateLimiter;
    private final int candidatesLimit;
    private final int chatLimit;

    public RateLimitFilter(
            InMemoryRateLimiter rateLimiter,
            @Value("${app.rate-limit.candidates.requests-per-minute}") int candidatesLimit,
            @Value("${app.rate-limit.chat.requests-per-minute}") int chatLimit) {
        this.rateLimiter = rateLimiter;
        this.candidatesLimit = candidatesLimit;
        this.chatLimit = chatLimit;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        RateLimitRule rule = ruleFor(request);
        if (rule == null) {
            filterChain.doFilter(request, response);
            return;
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            filterChain.doFilter(request, response);
            return;
        }

        InMemoryRateLimiter.RateLimitDecision decision = rateLimiter.tryAcquire(
                user.getId() + ":" + rule.name(),
                rule.limit(),
                RATE_LIMIT_WINDOW);

        if (!decision.allowed()) {
            response.setStatus(429);
            response.setHeader("Retry-After", String.valueOf(decision.retryAfterSeconds()));
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write("{\"msg\":\"Too many requests. Please try again later.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private RateLimitRule ruleFor(HttpServletRequest request) {
        if ("GET".equalsIgnoreCase(request.getMethod())
                && "/api/auth/candidates".equals(request.getRequestURI())) {
            return new RateLimitRule("candidates", candidatesLimit);
        }
        if ("POST".equalsIgnoreCase(request.getMethod())
                && "/api/auth/chat".equals(request.getRequestURI())) {
            return new RateLimitRule("chat", chatLimit);
        }
        return null;
    }

    private record RateLimitRule(String name, int limit) {
    }
}
