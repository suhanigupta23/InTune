package com.intune.backend.security;

import com.intune.backend.model.User;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockFilterChain;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

class RateLimitFilterTest {

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void returns429WhenCandidatesLimitIsExceeded() throws ServletException, IOException {
        InMemoryRateLimiter limiter = new InMemoryRateLimiter();
        RateLimitFilter filter = new RateLimitFilter(limiter, 3, 3);
        authenticateAs("user-a");

        for (int attempt = 1; attempt <= 3; attempt++) {
            MockHttpServletResponse response = perform(filter, "GET", "/api/auth/candidates");
            assertEquals(200, response.getStatus());
        }

        MockHttpServletResponse blockedResponse = perform(filter, "GET", "/api/auth/candidates");

        assertEquals(429, blockedResponse.getStatus());
        assertNotNull(blockedResponse.getHeader("Retry-After"));
        assertTrue(blockedResponse.getContentAsString().contains("Too many requests"));
    }

    @Test
    void doesNotLimitUnconfiguredEndpoints() throws ServletException, IOException {
        InMemoryRateLimiter limiter = new InMemoryRateLimiter();
        RateLimitFilter filter = new RateLimitFilter(limiter, 1, 1);
        authenticateAs("user-a");

        MockHttpServletResponse response = perform(filter, "GET", "/api/auth/me");

        assertEquals(200, response.getStatus());
    }

    private void authenticateAs(String userId) {
        User user = User.builder().id(userId).build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null));
    }

    private MockHttpServletResponse perform(
            RateLimitFilter filter,
            String method,
            String path) throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest(method, path);
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain());
        return response;
    }
}
