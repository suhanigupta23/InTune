package com.intune.backend.controller;

import com.intune.backend.model.User;
import com.intune.backend.repository.UserRepository;
import com.intune.backend.security.WebhookSecretVerifier;
import com.intune.backend.service.UserEmbeddingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class WebhookControllerTest {

    private static final String SECRET = "configured-secret";
    private UserRepository userRepository;
    private UserEmbeddingService userEmbeddingService;
    private WebhookController controller;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        userEmbeddingService = mock(UserEmbeddingService.class);
        controller = new WebhookController(
                userRepository,
                userEmbeddingService,
                new WebhookSecretVerifier(SECRET));
    }

    @Test
    void updatesUserForAuthenticatedValidWebhook() {
        User user = User.builder().id("user-1").build();
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        var response = controller.handleOmnidimWebhook(
                SECRET,
                Map.of("email", "test@example.com", "text", "Quiet and tidy"));

        assertEquals(200, response.getStatusCode().value());
        assertEquals("Quiet and tidy", user.getVibeText());
        verify(userEmbeddingService).refreshEmbedding(user);
        verify(userRepository).save(user);
    }

    @Test
    void rejectsMissingOrIncorrectAuthenticationBeforeReadingUserData() {
        var missingSecretResponse = controller.handleOmnidimWebhook(
                null,
                Map.of("email", "test@example.com", "text", "Quiet and tidy"));
        var incorrectSecretResponse = controller.handleOmnidimWebhook(
                "wrong-secret",
                Map.of("email", "test@example.com", "text", "Quiet and tidy"));

        assertEquals(401, missingSecretResponse.getStatusCode().value());
        assertEquals(401, incorrectSecretResponse.getStatusCode().value());
        verify(userRepository, never()).findByEmail(any());
    }

    @Test
    void rejectsMalformedPayloadWithBadRequest() {
        var response = controller.handleOmnidimWebhook(
                SECRET,
                Map.of("email", "not-an-email", "text", ""));

        assertEquals(400, response.getStatusCode().value());
        verify(userRepository, never()).findByEmail(any());
    }

    @Test
    void doesNotRevealWhetherUnknownUserExists() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        var response = controller.handleOmnidimWebhook(
                SECRET,
                Map.of("email", "unknown@example.com", "text", "Quiet and tidy"));

        assertEquals(200, response.getStatusCode().value());
        assertTrue(response.getBody().toString().contains("processed"));
        verify(userRepository, never()).save(any());
    }

    @Test
    void returnsGenericErrorWhenProcessingFails() {
        when(userRepository.findByEmail("test@example.com"))
                .thenThrow(new IllegalStateException("database details"));

        var response = controller.handleOmnidimWebhook(
                SECRET,
                Map.of("email", "test@example.com", "text", "Quiet and tidy"));

        assertEquals(500, response.getStatusCode().value());
        assertFalse(response.getBody().toString().contains("database details"));
    }
}
