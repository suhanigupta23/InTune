package com.intune.backend.controller;

import com.intune.backend.model.Message;
import com.intune.backend.model.User;
import com.intune.backend.repository.MessageRepository;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/auth")
public class ChatController {

    @Autowired
    private MessageRepository messageRepository;

    @Data
    public static class ChatMessageRequest {
        private String receiverId;
        private String content;
    }

    @PostMapping("/chat")
    public ResponseEntity<?> sendMessage(@RequestBody ChatMessageRequest request) {
        if (request.getReceiverId() == null || request.getContent() == null || request.getContent().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("msg", "Receiver ID and content required"));
        }

        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

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
    public ResponseEntity<?> getChatHistory(@PathVariable String recipientId) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
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
