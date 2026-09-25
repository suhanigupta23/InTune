package com.intune.backend.controller;

import com.intune.backend.model.User;
import com.intune.backend.repository.UserRepository;
import com.intune.backend.security.WebhookSecretVerifier;
import com.intune.backend.service.UserEmbeddingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/webhook")
public class WebhookController {

    private final UserRepository userRepository;
    private final UserEmbeddingService userEmbeddingService;
    private final WebhookSecretVerifier webhookSecretVerifier;

    public WebhookController(
            UserRepository userRepository,
            UserEmbeddingService userEmbeddingService,
            WebhookSecretVerifier webhookSecretVerifier) {
        this.userRepository = userRepository;
        this.userEmbeddingService = userEmbeddingService;
        this.webhookSecretVerifier = webhookSecretVerifier;
    }

    @PostMapping("/omnidim")
    public ResponseEntity<?> handleOmnidimWebhook(
            @RequestHeader(value = WebhookSecretVerifier.SECRET_HEADER, required = false)
            String providedSecret,
            @RequestBody Map<String, Object> payload) {
        if (!webhookSecretVerifier.isValid(providedSecret)) {
            return ResponseEntity.status(401).body(Map.of(
                    "status", "error",
                    "message", "Webhook authentication failed"));
        }

        try {
            // Parse nested "call_report" and "extracted_variables"
            Map<String, Object> callReport = asMap(payload.get("call_report"));
            Map<String, Object> extracted = callReport == null
                    ? null
                    : asMap(callReport.get("extracted_variables"));

            String email = firstText(extracted, "email_address", "email");
            String vibeText = firstText(extracted, "lifestyle_preferences", "special_requirements");

            // Fallbacks to call_report level
            if (callReport != null) {
                if (email == null) email = firstText(callReport, "email_address", "email");
                if (vibeText == null) {
                    vibeText = firstText(callReport, "summary", "lifestyle_preferences");
                }
            }

            // Fallbacks to root-level keys
            if (email == null) email = firstText(payload, "user_email", "email_address", "email");
            if (vibeText == null) vibeText = firstText(payload, "summary", "transcript", "text");

            if (!isValidEmail(email) || vibeText == null || vibeText.isBlank()
                    || "NA".equalsIgnoreCase(vibeText.trim()) || vibeText.length() > 2_000) {
                return ResponseEntity.badRequest().body(Map.of(
                        "status", "error",
                        "message", "Webhook payload is invalid"));
            }

            String targetEmail = email.trim().toLowerCase();
            Optional<User> userOpt = userRepository.findByEmail(targetEmail);

            if (userOpt.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                        "status", "skipped",
                        "message", "Webhook processed"));
            }

            User user = userOpt.get();
            user.setVibeText(vibeText.trim());
            user.setUpdatedAt(new Date());
            userEmbeddingService.refreshEmbedding(user);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "User vibe profile updated successfully"));

        } catch (Exception e) {
            System.err.println("Webhook processing failed: " + e.getClass().getSimpleName());
            return ResponseEntity.status(500).body(Map.of(
                    "status", "error",
                    "message", "Webhook processing failed"
            ));
        }
    }

    private Map<String, Object> asMap(Object value) {
        return value instanceof Map<?, ?> map
                ? (Map<String, Object>) map
                : null;
    }

    private String firstText(Map<String, Object> values, String... keys) {
        if (values == null) {
            return null;
        }

        for (String key : keys) {
            Object value = values.get(key);
            if (value instanceof String text && !text.isBlank()) {
                return text;
            }
        }
        return null;
    }

    private boolean isValidEmail(String email) {
        return email != null
                && email.length() <= 254
                && email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    }
}
