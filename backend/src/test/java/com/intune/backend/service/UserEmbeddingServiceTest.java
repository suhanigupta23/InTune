package com.intune.backend.service;

import com.intune.backend.model.User;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class UserEmbeddingServiceTest {

    private static final String MODEL = "sentence-transformers/all-MiniLM-L6-v2";

    @Test
    void storesNewEmbeddingForMatchingProfileText() {
        AiSimilarityClient client = mock(AiSimilarityClient.class);
        when(client.fetchEmbedding("quiet and tidy")).thenReturn(Optional.of(List.of(0.1, 0.2, 0.3)));
        UserEmbeddingService service = new UserEmbeddingService(client, MODEL);
        User user = User.builder()
                .vibeText("quiet and tidy")
                .embedding(List.of(0.9, 0.8))
                .embeddingModel(MODEL)
                .build();

        service.refreshEmbedding(user);

        assertEquals(List.of(0.1, 0.2, 0.3), user.getEmbedding());
        assertEquals(MODEL, user.getEmbeddingModel());
    }

    @Test
    void clearsStaleEmbeddingWhenGenerationFails() {
        AiSimilarityClient client = mock(AiSimilarityClient.class);
        when(client.fetchEmbedding("new profile")).thenReturn(Optional.empty());
        UserEmbeddingService service = new UserEmbeddingService(client, MODEL);
        User user = User.builder()
                .vibeText("new profile")
                .embedding(List.of(0.9, 0.8))
                .embeddingModel(MODEL)
                .build();

        service.refreshEmbedding(user);

        assertNull(user.getEmbedding());
        assertNull(user.getEmbeddingModel());
    }
}
