package com.intune.backend.security;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.cors.CorsConfiguration;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;

class CorsConfigurationTest {

    @Test
    void allowsConfiguredOriginsAndRejectsUnknownOrigins() {
        SecurityConfig securityConfig = new SecurityConfig(
                Mockito.mock(JwtAuthenticationFilter.class),
                Mockito.mock(RateLimitFilter.class),
                "http://localhost:8080, https://in-tune-phi.vercel.app");

        CorsConfiguration configuration = securityConfig.corsConfigurationSource()
                .getCorsConfiguration(new MockHttpServletRequest("GET", "/api/auth/me"));

        assertEquals("http://localhost:8080", configuration.checkOrigin("http://localhost:8080"));
        assertEquals(
                "https://in-tune-phi.vercel.app",
                configuration.checkOrigin("https://in-tune-phi.vercel.app"));
        assertNull(configuration.checkOrigin("https://untrusted.example"));
        assertFalse(Boolean.TRUE.equals(configuration.getAllowCredentials()));
    }
}
