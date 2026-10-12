package com.intune.backend.controller;

import com.intune.backend.model.Match;
import com.intune.backend.model.User;
import com.intune.backend.repository.MatchRepository;
import com.intune.backend.repository.UserRepository;
import com.intune.backend.security.JwtTokenProvider;
import com.intune.backend.service.AiSimilarityClient;
import com.intune.backend.service.UserEmbeddingService;
import com.intune.backend.service.VerhoeffChecksumValidator;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LikeAuthorizationTest {

    private static final String CURRENT_USER_ID = "507f1f77bcf86cd799439011";
    private static final String CANDIDATE_ID = "507f1f77bcf86cd799439012";

    @Mock
    private UserRepository userRepository;

    @Mock
    private MatchRepository matchRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private AiSimilarityClient aiSimilarityClient;

    @Mock
    private UserEmbeddingService userEmbeddingService;

    @Mock
    private VerhoeffChecksumValidator verhoeffChecksumValidator;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        User currentUser = User.builder().id(CURRENT_USER_ID).build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(currentUser, null, Collections.emptyList()));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void rejectsSelfMatchBeforeReadingMatchData() {
        AuthController.LikeRequest request = requestFor(CURRENT_USER_ID, true);

        ResponseEntity<?> response = authController.likeCandidate(request);

        assertEquals(400, response.getStatusCode().value());
        verifyNoInteractions(userRepository, matchRepository);
    }

    @Test
    void rejectsNonexistentCandidate() {
        when(userRepository.findById(CANDIDATE_ID)).thenReturn(Optional.empty());

        ResponseEntity<?> response = authController.likeCandidate(requestFor(CANDIDATE_ID, true));

        assertEquals(404, response.getStatusCode().value());
        verifyNoInteractions(matchRepository);
    }

    @Test
    void rejectsUnverifiedCandidate() {
        User candidate = User.builder().id(CANDIDATE_ID).isVerified(false).build();
        when(userRepository.findById(CANDIDATE_ID)).thenReturn(Optional.of(candidate));

        ResponseEntity<?> response = authController.likeCandidate(requestFor(CANDIDATE_ID, true));

        assertEquals(403, response.getStatusCode().value());
        verifyNoInteractions(matchRepository);
    }

    @Test
    void withdrawingLikeReturnsMatchedRecordToPending() {
        User candidate = User.builder().id(CANDIDATE_ID).isVerified(true).build();
        Match existingMatch = Match.builder()
                .userA(CURRENT_USER_ID)
                .userB(CANDIDATE_ID)
                .userALiked(true)
                .userBLiked(true)
                .status("matched")
                .build();

        when(userRepository.findById(CANDIDATE_ID)).thenReturn(Optional.of(candidate));
        when(matchRepository.findByUserAAndUserB(CURRENT_USER_ID, CANDIDATE_ID))
                .thenReturn(Optional.of(existingMatch));

        ResponseEntity<?> response = authController.likeCandidate(requestFor(CANDIDATE_ID, false));

        ArgumentCaptor<Match> savedMatch = ArgumentCaptor.forClass(Match.class);
        verify(matchRepository).save(savedMatch.capture());
        assertEquals("pending", savedMatch.getValue().getStatus());
        assertEquals(false, ((Map<?, ?>) response.getBody()).get("isMatch"));
        assertEquals(200, response.getStatusCode().value());
    }

    private AuthController.LikeRequest requestFor(String candidateId, boolean like) {
        AuthController.LikeRequest request = new AuthController.LikeRequest();
        request.setCandidateId(candidateId);
        request.setLike(like);
        return request;
    }
}
