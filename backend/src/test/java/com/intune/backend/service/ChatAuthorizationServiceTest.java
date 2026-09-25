package com.intune.backend.service;

import com.intune.backend.model.User;
import com.intune.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ChatAuthorizationServiceTest {

    private final UserRepository userRepository = mock(UserRepository.class);
    private final ChatAuthorizationService authorizationService =
            new ChatAuthorizationService(userRepository);

    @Test
    void allowsChatWithDifferentVerifiedUser() {
        User sender = userWithId("507f1f77bcf86cd799439011");
        User receiver = userWithId("507f1f77bcf86cd799439012");

        when(userRepository.findVerifiedById(receiver.getId()))
                .thenReturn(Optional.of(receiver));

        assertTrue(authorizationService.canChat(sender, receiver.getId()));
    }

    @Test
    void rejectsChatWithUnknownOrUnverifiedUser() {
        User sender = userWithId("507f1f77bcf86cd799439011");
        String receiverId = "507f1f77bcf86cd799439012";

        when(userRepository.findVerifiedById(receiverId))
                .thenReturn(Optional.empty());

        assertFalse(authorizationService.canChat(sender, receiverId));
    }

    @Test
    void rejectsChatWithSelf() {
        User sender = userWithId("507f1f77bcf86cd799439011");

        assertFalse(authorizationService.canChat(sender, sender.getId()));
    }

    private User userWithId(String id) {
        return User.builder().id(id).build();
    }
}
