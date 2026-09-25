package com.intune.backend.service;

import org.junit.jupiter.api.Test;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.net.SocketTimeoutException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AiSimilarityClientTest {

    private static final String URL = "http://localhost:8000/api/similarity";
    private static final String EMBEDDING_URL = "http://localhost:8000/api/embedding";
    private static final String EMBEDDING_SIMILARITY_URL = "http://localhost:8000/api/similarity/embeddings";
    private static final List<String> CANDIDATES = List.of("quiet and tidy", "social and active");

    @Test
    void returnsScoresWhenFastApiRespondsSuccessfully() {
        RestTemplate restTemplate = mock(RestTemplate.class);
        when(restTemplate.postForObject(eq(URL), any(), eq(Map.class)))
                .thenReturn(Map.of("scores", List.of(88.5, 71.2)));

        Optional<List<Double>> result = client(restTemplate).fetchScores("quiet lifestyle", CANDIDATES);

        assertEquals(Optional.of(List.of(88.5, 71.2)), result);
    }

    @Test
    void returnsEmptyResultWhenFastApiIsUnavailable() {
        RestTemplate restTemplate = mock(RestTemplate.class);
        when(restTemplate.postForObject(eq(URL), any(), eq(Map.class)))
                .thenThrow(new ResourceAccessException("Connection refused"));

        assertTrue(client(restTemplate).fetchScores("quiet lifestyle", CANDIDATES).isEmpty());
    }

    @Test
    void returnsEmptyResultWhenFastApiReadTimesOut() {
        RestTemplate restTemplate = mock(RestTemplate.class);
        when(restTemplate.postForObject(eq(URL), any(), eq(Map.class)))
                .thenThrow(new ResourceAccessException("Read timed out", new SocketTimeoutException()));

        assertTrue(client(restTemplate).fetchScores("quiet lifestyle", CANDIDATES).isEmpty());
    }

    @Test
    void returnsEmptyResultWhenFastApiReturnsServerError() {
        RestTemplate restTemplate = mock(RestTemplate.class);
        when(restTemplate.postForObject(eq(URL), any(), eq(Map.class)))
                .thenThrow(HttpServerErrorException.create(
                        org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                        "AI service error",
                        null,
                        null,
                        null));

        assertTrue(client(restTemplate).fetchScores("quiet lifestyle", CANDIDATES).isEmpty());
    }

    @Test
    void returnsEmbeddingWhenFastApiGeneratesOneSuccessfully() {
        RestTemplate restTemplate = mock(RestTemplate.class);
        when(restTemplate.postForObject(eq(EMBEDDING_URL), any(), eq(Map.class)))
                .thenReturn(Map.of("embedding", List.of(0.12, -0.43, 0.81)));

        assertEquals(
                Optional.of(List.of(0.12, -0.43, 0.81)),
                client(restTemplate).fetchEmbedding("quiet lifestyle"));
    }

    @Test
    void returnsScoresFromStoredEmbeddings() {
        RestTemplate restTemplate = mock(RestTemplate.class);
        when(restTemplate.postForObject(eq(EMBEDDING_SIMILARITY_URL), any(), eq(Map.class)))
                .thenReturn(Map.of("scores", List.of(88.5, 71.2)));

        assertEquals(
                Optional.of(List.of(88.5, 71.2)),
                client(restTemplate).fetchScoresFromEmbeddings(
                        List.of(0.12, -0.43, 0.81),
                        List.of(List.of(0.10, -0.40, 0.80), List.of(0.20, 0.10, -0.10))));
    }

    private AiSimilarityClient client(RestTemplate restTemplate) {
        return new AiSimilarityClient(
                restTemplate,
                URL,
                EMBEDDING_URL,
                EMBEDDING_SIMILARITY_URL);
    }
}
