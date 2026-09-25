package com.intune.backend.validation;

import com.intune.backend.controller.ChatController;
import com.intune.backend.exception.GlobalExceptionHandler;
import com.intune.backend.repository.MessageRepository;
import com.intune.backend.service.ChatAuthorizationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.Mockito.mock;

class ValidationErrorHandlerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(
                        new ChatController(
                                mock(MessageRepository.class),
                                mock(ChatAuthorizationService.class)))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void returnsClientSafeValidationResponseForInvalidRequest() throws Exception {
        mockMvc.perform(post("/api/auth/chat")
                        .contentType(APPLICATION_JSON)
                        .content("{\"receiverId\":\"507f1f77bcf86cd799439012\",\"content\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.msg").value("Validation failed"))
                .andExpect(jsonPath("$.errors.content").exists());
    }
}
