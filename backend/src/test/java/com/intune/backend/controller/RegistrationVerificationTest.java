package com.intune.backend.controller;

import com.intune.backend.repository.MatchRepository;
import com.intune.backend.repository.UserRepository;
import com.intune.backend.security.JwtTokenProvider;
import com.intune.backend.service.AiSimilarityClient;
import com.intune.backend.service.UserEmbeddingService;
import com.intune.backend.service.VerhoeffChecksumValidator;
import com.intune.backend.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.ArgumentCaptor;

class RegistrationVerificationTest {

    @Test
    void backendDoesNotVerifyRegistrationWithInvalidChecksum() {
        UserRepository userRepository = mock(UserRepository.class);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(userRepository.findByPhone(anyString())).thenReturn(Optional.empty());
        when(userRepository.findByAadhaarHash(anyString())).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId("507f1f77bcf86cd799439011");
            return user;
        });

        AuthController controller = new AuthController();
        ReflectionTestUtils.setField(controller, "userRepository", userRepository);
        ReflectionTestUtils.setField(controller, "matchRepository", mock(MatchRepository.class));
        ReflectionTestUtils.setField(controller, "passwordEncoder", mock(org.springframework.security.crypto.password.PasswordEncoder.class));
        JwtTokenProvider tokenProvider = mock(JwtTokenProvider.class);
        when(tokenProvider.generateToken(anyString())).thenReturn("test-token");
        ReflectionTestUtils.setField(controller, "tokenProvider", tokenProvider);
        ReflectionTestUtils.setField(controller, "aiSimilarityClient", mock(AiSimilarityClient.class));
        ReflectionTestUtils.setField(controller, "userEmbeddingService", mock(UserEmbeddingService.class));
        ReflectionTestUtils.setField(controller, "verhoeffChecksumValidator", new VerhoeffChecksumValidator());

        AuthController.RegisterRequest request = new AuthController.RegisterRequest();
        request.setName("Test User");
        request.setEmail("test@example.com");
        request.setPassword("Password123");
        request.setAadhaarNumber("123456789011");

        controller.registerUser(request);

        ArgumentCaptor<User> savedUser = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(savedUser.capture());
        assertFalse(savedUser.getValue().isVerified());
    }
}
