package com.intune.backend.config;

import com.intune.backend.model.User;
import com.intune.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.UUID;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // If there are less than 5 users in the database, seed mock candidates and admin
        if (userRepository.count() < 5) {
            // Seed Admin User (Suhani Gupta)
            seedUser("Suhani Gupta", "suhani@gmail.com", "9999999999", "Admin_Suhani", 
                     "InTune Platform Administrator.", "avatar4", "ADMIN");

            // Seed Roommate Candidates
            seedUser("Aditi Sharma", "aditi@gmail.com", "9876543210", "Sky_412", 
                     "I am a night owl, love listening to soft acoustic music while studying, and prefer a clean room. I enjoy cooking food on weekends.", "avatar1", "USER");
            
            seedUser("Sneha Patel", "sneha@gmail.com", "8765432109", "Star_678", 
                     "I sleep early and wake up at 6 AM. I study quiet, keep my desk neat, and expect my roommate to respect quiet hours. I love drinking tea.", "avatar2", "USER");
            
            seedUser("Riya Verma", "riya@gmail.com", "7654321098", "River_912", 
                     "I am very clean, almost a neat freak. I sleep around midnight. I love having friends over on weekends but keep it quiet during weekdays.", "avatar3", "USER");
            
            System.out.println("🌱 Database successfully seeded with admin and verified roommate candidates!");
        }
    }

    private void seedUser(String name, String email, String phone, String anonymousId, String vibeText, String avatarSeed, String role) {
        if (userRepository.findByEmail(email).isEmpty()) {
            User user = User.builder()
                    .name(name)
                    .email(email)
                    .phone(phone)
                    .password(passwordEncoder.encode("Password123"))
                    .anonymousId(anonymousId)
                    .gender("Female")
                    .isVerified(true)
                    .maskedAadhaar("XXXX XXXX " + (1000 + (int)(Math.random() * 9000)))
                    .vibeText(vibeText)
                    .avatarSeed(avatarSeed)
                    .role(role)
                    .createdAt(new Date())
                    .updatedAt(new Date())
                    .build();
            userRepository.save(user);
        }
    }
}
