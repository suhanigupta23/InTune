package com.intune.backend.controller;

import com.intune.backend.repository.MessageRepository;
import com.intune.backend.security.JwtAuthenticationFilter;
import com.intune.backend.security.JwtTokenProvider;
import com.intune.backend.security.InMemoryRateLimiter;
import com.intune.backend.security.SecurityConfig;
import com.intune.backend.repository.UserRepository;
import com.intune.backend.service.ChatAuthorizationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.containsString;

@WebMvcTest(ChatController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class ChatSecurityWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MessageRepository messageRepository;

    @MockBean
    private ChatAuthorizationService chatAuthorizationService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private InMemoryRateLimiter inMemoryRateLimiter;

    @Test
    void rejectsUnauthenticatedChatRequest() throws Exception {
        mockMvc.perform(post("/api/auth/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"receiverId\":\"507f1f77bcf86cd799439012\",\"content\":\"Hello\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void allowsPreflightFromConfiguredFrontendOrigin() throws Exception {
        mockMvc.perform(options("/api/auth/me")
                        .header("Origin", "http://localhost:8080")
                        .header("Access-Control-Request-Method", "GET")
                        .header("Access-Control-Request-Headers", "Authorization"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:8080"))
                .andExpect(header().string("Access-Control-Allow-Methods", containsString("GET")));
    }

    @Test
    void doesNotReturnCorsHeaderForUntrustedOrigin() throws Exception {
        mockMvc.perform(options("/api/auth/me")
                        .header("Origin", "https://untrusted.example")
                        .header("Access-Control-Request-Method", "GET")
                        .header("Access-Control-Request-Headers", "Authorization"))
                .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }
}
