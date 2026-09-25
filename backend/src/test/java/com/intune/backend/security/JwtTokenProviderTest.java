package com.intune.backend.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtTokenProviderTest {

    private static final String VALID_SECRET = "01234567890123456789012345678901";

    @Test
    void rejectsSecretsShorterThanHs256Minimum() {
        assertThrows(
                IllegalArgumentException.class,
                () -> new JwtTokenProvider("too-short", 60_000L));
    }

    @Test
    void generatesAndValidatesTokenWithValidSecret() {
        JwtTokenProvider tokenProvider = new JwtTokenProvider(VALID_SECRET, 60_000L);

        String token = tokenProvider.generateToken("user-123");

        assertTrue(tokenProvider.validateToken(token));
        assertEquals("user-123", tokenProvider.getUserIdFromJWT(token));
    }
}
