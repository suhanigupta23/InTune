package com.intune.backend.controller;

import com.intune.backend.model.Expense;
import com.intune.backend.model.User;
import com.intune.backend.repository.ExpenseRepository;
import com.intune.backend.service.ExpenseAuthorizationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;

import java.util.Date;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Validated
public class ExpenseController {

    private static final String UNAUTHORIZED_EXPENSE_MESSAGE =
            "Expenses are only available for confirmed roommates";

    private final ExpenseRepository expenseRepository;
    private final ExpenseAuthorizationService expenseAuthorizationService;

    public ExpenseController(
            ExpenseRepository expenseRepository,
            ExpenseAuthorizationService expenseAuthorizationService) {
        this.expenseRepository = expenseRepository;
        this.expenseAuthorizationService = expenseAuthorizationService;
    }

    @Data
    public static class AddExpenseRequest {
        @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
        @Digits(integer = 10, fraction = 2, message = "Amount must have at most 2 decimal places")
        private double amount;

        @NotBlank(message = "Description is required")
        @Size(max = 200, message = "Description must be at most 200 characters")
        private String description;

        @NotBlank(message = "Roommate ID is required")
        @Pattern(regexp = "^[a-fA-F0-9]{24}$", message = "Roommate ID format is invalid")
        private String splitWith;

        @Size(max = 50, message = "Category must be at most 50 characters")
        private String category;
    }

    @PostMapping("/splits")
    public ResponseEntity<?> addExpense(@Valid @RequestBody AddExpenseRequest request) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (!expenseAuthorizationService.hasConfirmedMatch(currentUser.getId(), request.getSplitWith())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("msg", UNAUTHORIZED_EXPENSE_MESSAGE));
        }

        Expense expense = Expense.builder()
                .amount(request.getAmount())
                .description(request.getDescription())
                .paidBy(currentUser.getId())
                .splitWith(request.getSplitWith())
                .category(request.getCategory() != null ? request.getCategory() : "General")
                .date(new Date())
                .createdAt(new Date())
                .updatedAt(new Date())
                .build();

        expenseRepository.save(expense);
        return ResponseEntity.status(HttpStatus.CREATED).body(expense);
    }

    @GetMapping("/splits")
    public ResponseEntity<?> getExpenses(
            @RequestParam
            @NotBlank(message = "Roommate ID is required")
            @Pattern(regexp = "^[a-fA-F0-9]{24}$", message = "Roommate ID format is invalid")
        String roommateId) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (!expenseAuthorizationService.hasConfirmedMatch(currentUser.getId(), roommateId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("msg", UNAUTHORIZED_EXPENSE_MESSAGE));
        }

        List<Expense> expenses = expenseRepository.findExpensesBetweenUsers(currentUser.getId(), roommateId);
        // Sort by date in descending order to match splits ledger sequence
        expenses.sort((a, b) -> b.getDate().compareTo(a.getDate()));

        return ResponseEntity.ok(expenses);
    }
}
