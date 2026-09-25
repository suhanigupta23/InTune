package com.intune.backend.controller;

import com.intune.backend.repository.ExpenseRepository;
import com.intune.backend.repository.UserRepository;
import com.intune.backend.security.InMemoryRateLimiter;
import com.intune.backend.security.JwtAuthenticationFilter;
import com.intune.backend.security.JwtTokenProvider;
import com.intune.backend.security.SecurityConfig;
import com.intune.backend.service.ExpenseAuthorizationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ExpenseController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class ExpenseSecurityWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ExpenseRepository expenseRepository;

    @MockBean
    private ExpenseAuthorizationService expenseAuthorizationService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private InMemoryRateLimiter inMemoryRateLimiter;

    @Test
    void rejectsUnauthenticatedExpenseCreation() throws Exception {
        mockMvc.perform(post("/api/auth/splits")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"amount\":25.50,\"description\":\"Groceries\","
                                + "\"splitWith\":\"507f1f77bcf86cd799439012\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void rejectsUnauthenticatedExpenseLookup() throws Exception {
        mockMvc.perform(get("/api/auth/splits")
                        .param("roommateId", "507f1f77bcf86cd799439012"))
                .andExpect(status().isForbidden());
    }
}
