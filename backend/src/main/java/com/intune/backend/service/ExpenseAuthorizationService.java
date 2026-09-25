package com.intune.backend.service;

import com.intune.backend.model.Match;
import com.intune.backend.repository.MatchRepository;
import org.springframework.stereotype.Service;

@Service
public class ExpenseAuthorizationService {

    private static final String MATCHED_STATUS = "matched";

    private final MatchRepository matchRepository;

    public ExpenseAuthorizationService(MatchRepository matchRepository) {
        this.matchRepository = matchRepository;
    }

    public boolean hasConfirmedMatch(String currentUserId, String roommateId) {
        if (currentUserId == null || roommateId == null || currentUserId.equals(roommateId)) {
            return false;
        }

        String firstUserId = currentUserId.compareTo(roommateId) < 0 ? currentUserId : roommateId;
        String secondUserId = currentUserId.compareTo(roommateId) < 0 ? roommateId : currentUserId;

        return matchRepository.findByUserAAndUserB(firstUserId, secondUserId)
                .map(Match::getStatus)
                .map(MATCHED_STATUS::equals)
                .orElse(false);
    }
}
