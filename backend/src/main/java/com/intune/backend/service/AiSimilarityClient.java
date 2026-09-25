package com.intune.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AiSimilarityClient {

    private final RestTemplate restTemplate;
    private final String similarityUrl;
    private final String embeddingUrl;
    private final String embeddingSimilarityUrl;

    public AiSimilarityClient(
            RestTemplate aiRestTemplate,
            @Value("${ai.similarity.url}") String similarityUrl,
            @Value("${ai.embedding.url}") String embeddingUrl,
            @Value("${ai.embedding.similarity.url}") String embeddingSimilarityUrl) {
        this.restTemplate = aiRestTemplate;
        this.similarityUrl = similarityUrl;
        this.embeddingUrl = embeddingUrl;
        this.embeddingSimilarityUrl = embeddingSimilarityUrl;
    }

    public Optional<List<Double>> fetchScores(String anchor, List<String> candidates) {
        try {
            Map<String, Object> payload = Map.of(
                    "anchor", anchor,
                    "candidates", candidates
            );
            Map<String, Object> response = restTemplate.postForObject(similarityUrl, payload, Map.class);

            if (response == null || !(response.get("scores") instanceof List<?> rawScores)) {
                return Optional.empty();
            }

            List<Double> scores = new ArrayList<>();
            for (Object score : rawScores) {
                if (!(score instanceof Number number)) {
                    return Optional.empty();
                }
                scores.add(number.doubleValue());
            }

            if (scores.size() != candidates.size()) {
                return Optional.empty();
            }

            return Optional.of(scores);
        } catch (RestClientException | ClassCastException exception) {
            return Optional.empty();
        }
    }

    public Optional<List<Double>> fetchEmbedding(String text) {
        try {
            Map<String, Object> response = restTemplate.postForObject(
                    embeddingUrl,
                    Map.of("text", text),
                    Map.class);

            if (response == null || !(response.get("embedding") instanceof List<?> rawEmbedding)) {
                return Optional.empty();
            }

            List<Double> embedding = new ArrayList<>();
            for (Object value : rawEmbedding) {
                if (!(value instanceof Number number)) {
                    return Optional.empty();
                }
                embedding.add(number.doubleValue());
            }

            return embedding.isEmpty() ? Optional.empty() : Optional.of(embedding);
        } catch (RestClientException | ClassCastException exception) {
            return Optional.empty();
        }
    }

    public Optional<List<Double>> fetchScoresFromEmbeddings(
            List<Double> anchorEmbedding,
            List<List<Double>> candidateEmbeddings) {
        try {
            Map<String, Object> payload = Map.of(
                    "anchor_embedding", anchorEmbedding,
                    "candidate_embeddings", candidateEmbeddings
            );
            Map<String, Object> response = restTemplate.postForObject(
                    embeddingSimilarityUrl,
                    payload,
                    Map.class);

            if (response == null || !(response.get("scores") instanceof List<?> rawScores)) {
                return Optional.empty();
            }

            List<Double> scores = new ArrayList<>();
            for (Object score : rawScores) {
                if (!(score instanceof Number number)) {
                    return Optional.empty();
                }
                scores.add(number.doubleValue());
            }

            return scores.size() == candidateEmbeddings.size()
                    ? Optional.of(scores)
                    : Optional.empty();
        } catch (RestClientException | ClassCastException exception) {
            return Optional.empty();
        }
    }
}
