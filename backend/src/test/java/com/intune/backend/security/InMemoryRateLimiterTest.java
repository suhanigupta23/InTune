package com.intune.backend.security;

import org.junit.jupiter.api.Test;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class InMemoryRateLimiterTest {

    private static final Duration WINDOW = Duration.ofMinutes(1);

    @Test
    void allowsRequestsUnderLimitAndRejectsTheNextOne() {
        InMemoryRateLimiter limiter = new InMemoryRateLimiter();

        assertTrue(limiter.tryAcquireAt("user-a:candidates", 3, WINDOW, 1_000).allowed());
        assertTrue(limiter.tryAcquireAt("user-a:candidates", 3, WINDOW, 2_000).allowed());
        assertTrue(limiter.tryAcquireAt("user-a:candidates", 3, WINDOW, 3_000).allowed());
        assertFalse(limiter.tryAcquireAt("user-a:candidates", 3, WINDOW, 4_000).allowed());
    }

    @Test
    void keepsUsersAndEndpointsOnIndependentCounters() {
        InMemoryRateLimiter limiter = new InMemoryRateLimiter();

        assertTrue(limiter.tryAcquireAt("user-a:candidates", 1, WINDOW, 1_000).allowed());
        assertFalse(limiter.tryAcquireAt("user-a:candidates", 1, WINDOW, 2_000).allowed());
        assertTrue(limiter.tryAcquireAt("user-b:candidates", 1, WINDOW, 2_000).allowed());
        assertTrue(limiter.tryAcquireAt("user-a:chat", 1, WINDOW, 2_000).allowed());
    }

    @Test
    void allowsRequestsAfterTheWindowExpires() {
        InMemoryRateLimiter limiter = new InMemoryRateLimiter();

        assertTrue(limiter.tryAcquireAt("user-a:candidates", 1, WINDOW, 1_000).allowed());
        assertFalse(limiter.tryAcquireAt("user-a:candidates", 1, WINDOW, 2_000).allowed());
        assertTrue(limiter.tryAcquireAt("user-a:candidates", 1, WINDOW, 61_000).allowed());
    }

    @Test
    void returnsRetryAfterForRejectedRequests() {
        InMemoryRateLimiter limiter = new InMemoryRateLimiter();

        limiter.tryAcquireAt("user-a:candidates", 1, WINDOW, 1_000);
        InMemoryRateLimiter.RateLimitDecision decision =
                limiter.tryAcquireAt("user-a:candidates", 1, WINDOW, 31_000);

        assertFalse(decision.allowed());
        assertTrue(decision.retryAfterSeconds() > 0);
    }
}
