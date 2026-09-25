package com.intune.backend.controller;

import com.intune.backend.model.Expense;
import com.intune.backend.model.User;
import com.intune.backend.repository.ExpenseRepository;
import com.intune.backend.service.ExpenseAuthorizationService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExpenseControllerTest {

    private static final String CURRENT_USER_ID = "507f1f77bcf86cd799439011";
    private static final String ROOMMATE_ID = "507f1f77bcf86cd799439012";

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private ExpenseAuthorizationService expenseAuthorizationService;

    private ExpenseController expenseController;

    @BeforeEach
    void setUp() {
        expenseController = new ExpenseController(expenseRepository, expenseAuthorizationService);

        User currentUser = User.builder().id(CURRENT_USER_ID).build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(currentUser, null));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createsExpenseForConfirmedRoommate() {
        ExpenseController.AddExpenseRequest request = validRequest();
        when(expenseAuthorizationService.hasConfirmedMatch(CURRENT_USER_ID, ROOMMATE_ID))
                .thenReturn(true);

        ResponseEntity<?> response = expenseController.addExpense(request);

        assertEquals(201, response.getStatusCode().value());
        verify(expenseRepository).save(any(Expense.class));
    }

    @Test
    void rejectsExpenseForUnrelatedUser() {
        ExpenseController.AddExpenseRequest request = validRequest();
        when(expenseAuthorizationService.hasConfirmedMatch(CURRENT_USER_ID, ROOMMATE_ID))
                .thenReturn(false);

        ResponseEntity<?> response = expenseController.addExpense(request);

        assertEquals(403, response.getStatusCode().value());
        verify(expenseRepository, never()).save(any(Expense.class));
    }

    @Test
    void returnsExpensesForConfirmedRoommate() {
        when(expenseAuthorizationService.hasConfirmedMatch(CURRENT_USER_ID, ROOMMATE_ID))
                .thenReturn(true);
        when(expenseRepository.findExpensesBetweenUsers(CURRENT_USER_ID, ROOMMATE_ID))
                .thenReturn(new ArrayList<>());

        ResponseEntity<?> response = expenseController.getExpenses(ROOMMATE_ID);

        assertEquals(200, response.getStatusCode().value());
        verify(expenseRepository).findExpensesBetweenUsers(CURRENT_USER_ID, ROOMMATE_ID);
    }

    @Test
    void rejectsExpenseLookupForUnrelatedUser() {
        when(expenseAuthorizationService.hasConfirmedMatch(CURRENT_USER_ID, ROOMMATE_ID))
                .thenReturn(false);

        ResponseEntity<?> response = expenseController.getExpenses(ROOMMATE_ID);

        assertEquals(403, response.getStatusCode().value());
        verifyNoInteractions(expenseRepository);
    }

    private ExpenseController.AddExpenseRequest validRequest() {
        ExpenseController.AddExpenseRequest request = new ExpenseController.AddExpenseRequest();
        request.setAmount(25.50);
        request.setDescription("Groceries");
        request.setSplitWith(ROOMMATE_ID);
        request.setCategory("Food");
        return request;
    }
}
