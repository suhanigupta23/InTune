package com.intune.backend.controller;

import com.intune.backend.model.User;
import com.intune.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/webhook")
public class WebhookController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/omnidim")
    public ResponseEntity<?> handleOmnidimWebhook(@RequestBody Map<String, Object> payload) {
        System.out.println("📥 Received OmniDimension Webhook callback: " + payload);
        
        try {
            // Parse nested "call_report" and "extracted_variables"
            Map<String, Object> callReport = (Map<String, Object>) payload.get("call_report");
            Map<String, Object> extracted = null;
            if (callReport != null) {
                extracted = (Map<String, Object>) callReport.get("extracted_variables");
            }

            String email = null;
            String vibeText = null;

            if (extracted != null) {
                email = (String) extracted.get("email_address");
                if (email == null) email = (String) extracted.get("email");
                
                vibeText = (String) extracted.get("lifestyle_preferences");
                if (vibeText == null) vibeText = (String) extracted.get("special_requirements");
            }

            // Fallbacks to call_report level
            if (callReport != null) {
                if (email == null) email = (String) callReport.get("email_address");
                if (vibeText == null) vibeText = (String) callReport.get("summary");
                if (vibeText == null) vibeText = (String) callReport.get("lifestyle_preferences");
            }

            // Fallbacks to root-level keys
            if (email == null) email = (String) payload.get("user_email");
            if (email == null) email = (String) payload.get("email_address");
            if (email == null) email = (String) payload.get("email");
            
            if (vibeText == null) vibeText = (String) payload.get("summary");
            if (vibeText == null) vibeText = (String) payload.get("transcript");
            if (vibeText == null) vibeText = (String) payload.get("text");

            if (email != null && vibeText != null && !vibeText.trim().isEmpty() && !vibeText.equals("NA")) {
                String targetEmail = email.trim().toLowerCase();
                Optional<User> userOpt = userRepository.findByEmail(targetEmail);
                
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    user.setVibeText(vibeText);
                    user.setUpdatedAt(new Date());
                    userRepository.save(user);
                    System.out.println("✅ Successfully synced vibeText via Webhook for: " + targetEmail);
                    return ResponseEntity.ok(Map.of(
                        "status", "success",
                        "message", "User vibe profile updated successfully"
                    ));
                } else {
                    System.out.println("⚠️ Webhook skipped: User not found with email " + targetEmail);
                }
            }

            return ResponseEntity.ok(Map.of(
                "status", "skipped",
                "message", "Missing required email/vibe parameters or user not found"
            ));

        } catch (Exception e) {
            System.err.println("❌ Webhook error: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }
}
