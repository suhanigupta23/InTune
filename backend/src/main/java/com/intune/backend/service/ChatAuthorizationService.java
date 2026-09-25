package com.intune.backend.service;

import com.intune.backend.model.User;
import com.intune.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class ChatAuthorizationService {

    private final UserRepository userRepository;

    public ChatAuthorizationService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Anonymous chat is available for verified candidate users, but a user
     * cannot start a conversation with themselves.
     */
    public boolean canChat(User sender, String receiverId) {
        if (sender.getId().equals(receiverId)) {
            return false;
        }

        return userRepository.findVerifiedById(receiverId).isPresent();
    }
}
