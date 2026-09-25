package com.intune.backend.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class WebhookSecretVerifierTest {

    @Test
    void acceptsOnlyTheConfiguredSecret() {
        WebhookSecretVerifier verifier = new WebhookSecretVerifier("configured-secret");

        assertTrue(verifier.isValid("configured-secret"));
        assertFalse(verifier.isValid("wrong-secret"));
        assertFalse(verifier.isValid(null));
    }

    @Test
    void rejectsEveryRequestWhenNoSecretIsConfigured() {
        WebhookSecretVerifier verifier = new WebhookSecretVerifier("");

        assertFalse(verifier.isValid("any-secret"));
    }
}
