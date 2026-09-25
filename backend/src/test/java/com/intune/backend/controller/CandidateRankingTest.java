package com.intune.backend.controller;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CandidateRankingTest {

    @Test
    void returnsOnlyHighestScoringCandidates() {
        List<AuthController.CandidateResponse> candidates = List.of(
                candidate("low", 60),
                candidate("highest", 95),
                candidate("middle", 80),
                candidate("second", 90));

        List<AuthController.CandidateResponse> result =
                AuthController.selectTopCandidates(candidates, 3);

        assertEquals(List.of("highest", "second", "middle"),
                result.stream().map(AuthController.CandidateResponse::get_id).toList());
    }

    @Test
    void returnsAllCandidatesWhenFewerThanTopKExist() {
        List<AuthController.CandidateResponse> candidates = List.of(
                candidate("first", 90),
                candidate("second", 80));

        assertEquals(2, AuthController.selectTopCandidates(candidates, 10).size());
    }

    @Test
    void returnsExactlyTopKWhenCandidateCountMatchesTopK() {
        List<AuthController.CandidateResponse> candidates = List.of(
                candidate("first", 90),
                candidate("second", 80),
                candidate("third", 70));

        assertEquals(3, AuthController.selectTopCandidates(candidates, 3).size());
    }

    @Test
    void returnsEmptyListWhenThereAreNoCandidates() {
        assertEquals(0, AuthController.selectTopCandidates(List.of(), 10).size());
    }

    private static AuthController.CandidateResponse candidate(String id, double score) {
        return AuthController.CandidateResponse.builder()
                ._id(id)
                .match_score(score)
                .build();
    }
}
