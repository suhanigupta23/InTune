package com.intune.backend.service;

import com.intune.backend.model.Match;
import com.intune.backend.repository.MatchRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExpenseAuthorizationServiceTest {

    private static final String CURRENT_USER_ID = "507f1f77bcf86cd799439011";
    private static final String ROOMMATE_ID = "507f1f77bcf86cd799439012";

    @Mock
    private MatchRepository matchRepository;

    private ExpenseAuthorizationService authorizationService;

    @BeforeEach
    void setUp() {
        authorizationService = new ExpenseAuthorizationService(matchRepository);
    }

    @Test
    void allowsExpensesForConfirmedMatchRegardlessOfRequestOrder() {
        Match match = Match.builder()
                .userA(CURRENT_USER_ID)
                .userB(ROOMMATE_ID)
                .status("matched")
                .build();
        when(matchRepository.findByUserAAndUserB(CURRENT_USER_ID, ROOMMATE_ID))
                .thenReturn(Optional.of(match));

        assertTrue(authorizationService.hasConfirmedMatch(ROOMMATE_ID, CURRENT_USER_ID));
    }

    @Test
    void rejectsPendingMatch() {
        Match match = Match.builder()
                .userA(CURRENT_USER_ID)
                .userB(ROOMMATE_ID)
                .status("pending")
                .build();
        when(matchRepository.findByUserAAndUserB(CURRENT_USER_ID, ROOMMATE_ID))
                .thenReturn(Optional.of(match));

        assertFalse(authorizationService.hasConfirmedMatch(CURRENT_USER_ID, ROOMMATE_ID));
    }

    @Test
    void rejectsMissingMatch() {
        when(matchRepository.findByUserAAndUserB(CURRENT_USER_ID, ROOMMATE_ID))
                .thenReturn(Optional.empty());

        assertFalse(authorizationService.hasConfirmedMatch(CURRENT_USER_ID, ROOMMATE_ID));
    }

    @Test
    void rejectsSelfAccessWithoutQueryingRepository() {
        assertFalse(authorizationService.hasConfirmedMatch(CURRENT_USER_ID, CURRENT_USER_ID));

        verify(matchRepository, never()).findByUserAAndUserB(CURRENT_USER_ID, CURRENT_USER_ID);
    }
}
