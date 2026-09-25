package com.intune.backend.service;

import com.intune.backend.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserEmbeddingService {

    private final AiSimilarityClient aiSimilarityClient;
    private final String embeddingModel;

    public UserEmbeddingService(
            AiSimilarityClient aiSimilarityClient,
            @Value("${ai.embedding.model}") String embeddingModel) {
        this.aiSimilarityClient = aiSimilarityClient;
        this.embeddingModel = embeddingModel;
    }

    public void refreshEmbedding(User user) {
        user.setEmbedding(null);
        user.setEmbeddingModel(null);

        if (user.getVibeText() == null || user.getVibeText().trim().isEmpty()) {
            return;
        }

        Optional<List<Double>> embedding = aiSimilarityClient.fetchEmbedding(user.getVibeText());
        embedding.ifPresent(values -> {
            user.setEmbedding(values);
            user.setEmbeddingModel(embeddingModel);
        });
    }

    public boolean hasCurrentEmbedding(User user) {
        return user.getEmbedding() != null
                && !user.getEmbedding().isEmpty()
                && embeddingModel.equals(user.getEmbeddingModel());
    }
}
