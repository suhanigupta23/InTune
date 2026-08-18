package com.intune.backend.controller;

import com.intune.backend.model.Expense;
import com.intune.backend.model.User;
import com.intune.backend.repository.ExpenseRepository;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class ExpenseController {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Data
    public static class AddExpenseRequest {
        private double amount;
        private String description;
        private String splitWith;
        private String category;
    }

    @PostMapping("/splits")
    public ResponseEntity<?> addExpense(@RequestBody AddExpenseRequest request) {
        if (request.getAmount() <= 0 || request.getDescription() == null || request.getSplitWith() == null) {
            return ResponseEntity.badRequest().body(Map.of("msg", "Amount, description and split roommate required"));
        }

        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

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
    public ResponseEntity<?> getExpenses(@RequestParam String roommateId) {
        if (roommateId == null || roommateId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("msg", "Roommate ID required"));
        }

        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        List<Expense> expenses = expenseRepository.findExpensesBetweenUsers(currentUser.getId(), roommateId);
        // Sort by date in descending order to match splits ledger sequence
        expenses.sort((a, b) -> b.getDate().compareTo(a.getDate()));

        return ResponseEntity.ok(expenses);
    }
}
