package com.intune.backend.controller;

import com.intune.backend.model.Message;
import com.intune.backend.model.User;
import com.intune.backend.repository.MessageRepository;
import com.intune.backend.service.ChatAuthorizationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.validation.annotation.Validated;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/auth")
@Validated
public class ChatController {

    private final MessageRepository messageRepository;
    private final ChatAuthorizationService chatAuthorizationService;

    public ChatController(
            MessageRepository messageRepository,
            ChatAuthorizationService chatAuthorizationService) {
        this.messageRepository = messageRepository;
        this.chatAuthorizationService = chatAuthorizationService;
    }

    @Data
    public static class ChatMessageRequest {
        @NotBlank(message = "Receiver ID is required")
        @Pattern(regexp = "^[a-fA-F0-9]{24}$", message = "Receiver ID format is invalid")
        private String receiverId;

        @NotBlank(message = "Message content is required")
        @Size(max = 2_000, message = "Message content must be at most 2,000 characters")
        private String content;
    }

    @PostMapping("/chat")
    public ResponseEntity<?> sendMessage(@Valid @RequestBody ChatMessageRequest request) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (!chatAuthorizationService.canChat(currentUser, request.getReceiverId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("msg", "You are not allowed to chat with this user"));
        }

        Message message = Message.builder()
                .sender(currentUser.getId())
                .receiver(request.getReceiverId())
                .content(request.getContent())
                .timestamp(new Date())
                .createdAt(new Date())
                .updatedAt(new Date())
                .build();

        messageRepository.save(message);
        return ResponseEntity.status(HttpStatus.CREATED).body(message);
    }

    @GetMapping("/chat/{recipientId}")
    public ResponseEntity<?> getChatHistory(
            @PathVariable
            @NotBlank(message = "Recipient ID is required")
            @Pattern(regexp = "^[a-fA-F0-9]{24}$", message = "Recipient ID format is invalid")
        String recipientId) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (!chatAuthorizationService.canChat(currentUser, recipientId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("msg", "You are not allowed to view this chat"));
        }
        
        List<Message> history = messageRepository.findChatHistory(currentUser.getId(), recipientId);
        // Sort history by timestamp ascending to ensure sequential delivery
        history.sort(Comparator.comparing(Message::getTimestamp));

        return ResponseEntity.ok(history);
    }

    @GetMapping("/chats/count")
    public ResponseEntity<?> getActiveChatsCount() {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String userId = currentUser.getId();

        List<Message> allUserMessages = messageRepository.findAllBySenderOrReceiver(userId);

        Set<String> activeChatPartners = new HashSet<>();
        for (Message msg : allUserMessages) {
            if (!msg.getSender().equals(userId)) {
                activeChatPartners.add(msg.getSender());
            }
            if (!msg.getReceiver().equals(userId)) {
                activeChatPartners.add(msg.getReceiver());
            }
        }

        return ResponseEntity.ok(Map.of("count", activeChatPartners.size()));
    }
}
