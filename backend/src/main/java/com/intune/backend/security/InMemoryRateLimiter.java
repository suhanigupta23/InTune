package com.intune.backend.security;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class InMemoryRateLimiter {

    private final ConcurrentHashMap<String, RequestWindow> windows = new ConcurrentHashMap<>();
    private final AtomicLong lastCleanupMillis = new AtomicLong();

    public RateLimitDecision tryAcquire(String key, int limit, Duration window) {
        return tryAcquireAt(key, limit, window, System.currentTimeMillis());
    }

    RateLimitDecision tryAcquireAt(String key, int limit, Duration window, long nowMillis) {
        if (limit <= 0 || window.isZero() || window.isNegative()) {
            return RateLimitDecision.reject(1);
        }

        RequestWindow requestWindow = windows.computeIfAbsent(
                key,
                ignored -> new RequestWindow(nowMillis));

        RateLimitDecision decision;
        synchronized (requestWindow) {
            if (nowMillis - requestWindow.windowStartMillis >= window.toMillis()) {
                requestWindow.windowStartMillis = nowMillis;
                requestWindow.requestCount = 0;
            }

            if (requestWindow.requestCount >= limit) {
                long remainingMillis = window.toMillis()
                        - (nowMillis - requestWindow.windowStartMillis);
                long retryAfterSeconds = Math.max(1, (remainingMillis + 999) / 1000);
                decision = RateLimitDecision.reject(retryAfterSeconds);
            } else {
                requestWindow.requestCount++;
                decision = RateLimitDecision.allow();
            }
        }

        cleanupExpiredWindows(nowMillis, window);
        return decision;
    }

    private void cleanupExpiredWindows(long nowMillis, Duration window) {
        long cleanupIntervalMillis = Math.max(1_000, window.toMillis());
        long previousCleanup = lastCleanupMillis.get();
        if (nowMillis - previousCleanup < cleanupIntervalMillis
                || !lastCleanupMillis.compareAndSet(previousCleanup, nowMillis)) {
            return;
        }

        windows.entrySet().removeIf(entry ->
                nowMillis - entry.getValue().windowStartMillis >= window.toMillis());
    }

    record RateLimitDecision(boolean allowed, long retryAfterSeconds) {
        static RateLimitDecision allow() {
            return new RateLimitDecision(true, 0);
        }

        static RateLimitDecision reject(long retryAfterSeconds) {
            return new RateLimitDecision(false, retryAfterSeconds);
        }
    }

    private static final class RequestWindow {
        private volatile long windowStartMillis;
        private int requestCount;

        private RequestWindow(long windowStartMillis) {
            this.windowStartMillis = windowStartMillis;
        }
    }
}
