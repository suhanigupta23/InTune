package com.intune.backend.controller;

import com.intune.backend.model.Match;
import com.intune.backend.model.User;
import com.intune.backend.repository.MatchRepository;
import com.intune.backend.repository.UserRepository;
import com.intune.backend.security.JwtTokenProvider;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Value("${ai.similarity.url}")
    private String aiSimilarityUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    // DTOs using Lombok for clean, readable code
    @Data
    public static class RegisterRequest {
        private String name;
        private String email;
        private String phone;
        private String password;
        private String gender;
        private boolean isVerified;
        private String maskedAadhaar;
        private String aadhaarNumber;
    }

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    public static class GoogleLoginRequest {
        private String email;
        private String name;
        private String googleId;
    }

    @Data
    public static class ProfileRequest {
        private String vibeText;
    }

    @Data
    public static class LikeRequest {
        private String candidateId;
        private boolean like;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CandidateResponse {
        private String _id;
        private String anonymousId;
        private String vibeText;
        private String avatarSeed;
        private double match_score;
        private boolean isNewMatch;
    }

    // Helper to generate anonymous ID
    private String generateAnon() {
        String[] adjectives = {"Sky", "Moon", "Star", "Sun", "River", "Cloud"};
        String word = adjectives[(int) (Math.random() * adjectives.length)];
        int num = (int) (100 + Math.random() * 900); // 100-999
        return word + "_" + num;
    }

    private String hashAadhaar(String aadhaar) {
        if (aadhaar == null || aadhaar.trim().isEmpty()) return null;
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(aadhaar.trim().getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("SHA-256 initialization error", e);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest request) {
        if (request.getEmail() == null || request.getPassword() == null || request.getName() == null) {
            return ResponseEntity.badRequest().body(Map.of("msg", "All fields required"));
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("msg", "Account already exists with this email address"));
        }

        if (request.getPhone() != null && !request.getPhone().isEmpty()) {
            if (userRepository.findByPhone(request.getPhone()).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("msg", "Account already exists with this phone number"));
            }
        }

        String aadhHash = null;
        if (request.getAadhaarNumber() != null && !request.getAadhaarNumber().trim().isEmpty()) {
            aadhHash = hashAadhaar(request.getAadhaarNumber());
            if (userRepository.findByAadhaarHash(aadhHash).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("msg", "An account is already verified with this Aadhaar number"));
            }
        }

        String avatarSeed = UUID.randomUUID().toString().substring(0, 7);

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .anonymousId(generateAnon())
                .gender(request.getGender())
                .isVerified(request.isVerified())
                .maskedAadhaar(request.getMaskedAadhaar())
                .aadhaarHash(aadhHash)
                .avatarSeed(avatarSeed)
                .createdAt(new Date())
                .updatedAt(new Date())
                .build();

        userRepository.save(user);

        String token = tokenProvider.generateToken(user.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "_id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "anonymousId", user.getAnonymousId(),
                "token", token
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("msg", "Invalid credentials"));
        }

        User user = userOpt.get();
        String token = tokenProvider.generateToken(user.getId());

        return ResponseEntity.ok(Map.of(
                "_id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "anonymousId", user.getAnonymousId(),
                "token", token
        ));
    }

    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleLoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("msg", "Account does not exist. Please sign up first."));
        }

        User user = userOpt.get();
        String token = tokenProvider.generateToken(user.getId());

        return ResponseEntity.ok(Map.of(
                "_id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "anonymousId", user.getAnonymousId(),
                "token", token
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody ProfileRequest request) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        Optional<User> userOpt = userRepository.findById(currentUser.getId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("msg", "User not found"));
        }

        User user = userOpt.get();
        if (request.getVibeText() != null) {
            user.setVibeText(request.getVibeText());
        }
        user.setUpdatedAt(new Date());
        userRepository.save(user);

        return ResponseEntity.ok(user);
    }

    @GetMapping("/candidates")
    public ResponseEntity<?> getCandidates() {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // Query all verified candidate users excluding self
        List<User> candidates = userRepository.findByIdNot(currentUser.getId()).stream()
                .filter(User::isVerified)
                .collect(Collectors.toList());

        if (candidates.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        // Gather all candidate vibe texts
        List<String> candidateVibes = candidates.stream()
                .map(c -> c.getVibeText() != null && !c.getVibeText().isEmpty() ? c.getVibeText() : "No vibe details provided.")
                .collect(Collectors.toList());

        List<Double> scores = new ArrayList<>();
        boolean success = false;

        // Hit the SBERT FastAPI similarity service
        if (currentUser.getVibeText() != null && !currentUser.getVibeText().trim().isEmpty()) {
            try {
                Map<String, Object> payload = Map.of(
                        "anchor", currentUser.getVibeText(),
                        "candidates", candidateVibes
                );
                Map<String, Object> response = restTemplate.postForObject(aiSimilarityUrl, payload, Map.class);
                if (response != null && response.containsKey("scores")) {
                    List<?> scoresList = (List<?>) response.get("scores");
                    for (Object scoreObj : scoresList) {
                        scores.add(((Number) scoreObj).doubleValue());
                    }
                    success = true;
                }
            } catch (Exception e) {
                // Fallback to local similarity mapping if SBERT is offline
            }
        }

        // Fallback calculations if SBERT fails/is offline
        if (!success) {
            for (User cand : candidates) {
                scores.add(calculateFallbackSimilarity(currentUser.getVibeText(), cand.getVibeText()));
            }
        }

        // Build responses
        List<CandidateResponse> responseList = new ArrayList<>();
        long oneDayAgoMs = System.currentTimeMillis() - (24 * 60 * 60 * 1000L); // 24 hours threshold

        for (int i = 0; i < candidates.size(); i++) {
            User cand = candidates.get(i);
            double score = scores.get(i);
            
            // Check if user is newly registered (within last 24h) and highly compatible (score >= 80%)
            boolean isNewMatch = false;
            if (cand.getCreatedAt() != null && cand.getCreatedAt().getTime() > oneDayAgoMs) {
                if (score >= 80.0) {
                    isNewMatch = true;
                }
            }

            responseList.add(CandidateResponse.builder()
                    ._id(cand.getId())
                    .anonymousId(cand.getAnonymousId())
                    .vibeText(cand.getVibeText())
                    .avatarSeed(cand.getAvatarSeed())
                    .match_score(score)
                    .isNewMatch(isNewMatch)
                    .build());
        }

        // Sort candidates by match score in descending order
        responseList.sort((a, b) -> Double.compare(b.getMatch_score(), a.getMatch_score()));

        return ResponseEntity.ok(responseList);
    }

    @PostMapping("/like")
    public ResponseEntity<?> likeCandidate(@RequestBody LikeRequest request) {
        if (request.getCandidateId() == null) {
            return ResponseEntity.badRequest().body(Map.of("msg", "Candidate ID required"));
        }

        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String userA = currentUser.getId();
        String userB = request.getCandidateId();

        // Maintain consistent alphabetical sorting for unique matches table compound index
        String firstUser = userA.compareTo(userB) < 0 ? userA : userB;
        String secondUser = userA.compareTo(userB) < 0 ? userB : userA;

        Optional<Match> matchOpt = matchRepository.findByUserAAndUserB(firstUser, secondUser);
        Match match;

        if (matchOpt.isEmpty()) {
            match = Match.builder()
                    .userA(firstUser)
                    .userB(secondUser)
                    .userALiked(userA.equals(firstUser) ? request.isLike() : false)
                    .userBLiked(userA.equals(secondUser) ? request.isLike() : false)
                    .status("pending")
                    .createdAt(new Date())
                    .updatedAt(new Date())
                    .build();
        } else {
            match = matchOpt.get();
            if (userA.equals(firstUser)) match.setUserALiked(request.isLike());
            if (userA.equals(secondUser)) match.setUserBLiked(request.isLike());

            if (match.isUserALiked() && match.isUserBLiked()) {
                match.setStatus("matched");
            }
            match.setUpdatedAt(new Date());
        }

        matchRepository.save(match);

        return ResponseEntity.ok(Map.of(
                "matchStatus", match.getStatus(),
                "isMatch", match.getStatus().equals("matched")
        ));
    }

    @GetMapping("/matches")
    public ResponseEntity<?> getMatches() {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String userId = currentUser.getId();

        List<Match> matches = matchRepository.findConfirmedMatchesForUser(userId);

        List<Map<String, Object>> resultList = new ArrayList<>();
        for (Match match : matches) {
            String otherUserId = match.getUserA().equals(userId) ? match.getUserB() : match.getUserA();
            Optional<User> otherUserOpt = userRepository.findById(otherUserId);
            if (otherUserOpt.isPresent()) {
                User otherUser = otherUserOpt.get();
                resultList.add(Map.of(
                        "_id", otherUser.getId(),
                        "name", otherUser.getName(),
                        "email", otherUser.getEmail(),
                        "anonymousId", otherUser.getAnonymousId(),
                        "avatarSeed", otherUser.getAvatarSeed() != null ? otherUser.getAvatarSeed() : "",
                        "status", match.getStatus()
                ));
            }
        }

        return ResponseEntity.ok(resultList);
    }

    // Jaccard similarity fallback calculation mapped to [55, 98] range
    private double calculateFallbackSimilarity(String text1, String text2) {
        if (text1 == null || text2 == null || text1.trim().isEmpty() || text2.trim().isEmpty()) {
            return 50.0;
        }

        Set<String> words1 = new HashSet<>(Arrays.asList(text1.toLowerCase().split("\\W+")));
        Set<String> words2 = new HashSet<>(Arrays.asList(text2.toLowerCase().split("\\W+")));

        Set<String> intersection = new HashSet<>(words1);
        intersection.retainAll(words2);

        Set<String> union = new HashSet<>(words1);
        union.addAll(words2);

        if (union.isEmpty()) return 50.0;

        double jaccard = (double) intersection.size() / union.size();
        return 55.0 + (jaccard * 43.0);
    }
}
