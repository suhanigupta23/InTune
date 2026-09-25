package com.intune.backend.controller;

import com.intune.backend.model.User;
import com.intune.backend.repository.MessageRepository;
import com.intune.backend.service.ChatAuthorizationService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatControllerTest {

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private ChatAuthorizationService chatAuthorizationService;

    private ChatController chatController;

    @BeforeEach
    void setUp() {
        chatController = new ChatController(messageRepository, chatAuthorizationService);
        User sender = User.builder().id("507f1f77bcf86cd799439011").build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(sender, null, Collections.emptyList()));
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void savesMessageWhenChatIsAuthorized() {
        ChatController.ChatMessageRequest request = validMessageRequest();
        when(chatAuthorizationService.canChat(
                org.mockito.ArgumentMatchers.any(User.class),
                org.mockito.ArgumentMatchers.eq(request.getReceiverId())))
                .thenReturn(true);

        var response = chatController.sendMessage(request);

        assertEquals(201, response.getStatusCode().value());
        verify(messageRepository).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void doesNotSaveMessageWhenChatIsUnauthorized() {
        ChatController.ChatMessageRequest request = validMessageRequest();
        when(chatAuthorizationService.canChat(
                org.mockito.ArgumentMatchers.any(User.class),
                org.mockito.ArgumentMatchers.eq(request.getReceiverId())))
                .thenReturn(false);

        var response = chatController.sendMessage(request);

        assertEquals(403, response.getStatusCode().value());
        verify(messageRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    private ChatController.ChatMessageRequest validMessageRequest() {
        ChatController.ChatMessageRequest request = new ChatController.ChatMessageRequest();
        request.setReceiverId("507f1f77bcf86cd799439012");
        request.setContent("Hello");
        return request;
    }
}
