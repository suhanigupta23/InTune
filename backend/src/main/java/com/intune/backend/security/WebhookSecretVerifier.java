package com.intune.backend.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Component
public class WebhookSecretVerifier {

    public static final String SECRET_HEADER = "X-Webhook-Secret";

    private final String configuredSecret;

    public WebhookSecretVerifier(@Value("${app.webhook.secret:}") String configuredSecret) {
        this.configuredSecret = configuredSecret == null ? "" : configuredSecret;
    }

    public boolean isValid(String providedSecret) {
        if (configuredSecret.isBlank() || providedSecret == null) {
            return false;
        }

        return MessageDigest.isEqual(
                configuredSecret.getBytes(StandardCharsets.UTF_8),
                providedSecret.getBytes(StandardCharsets.UTF_8));
    }
}
