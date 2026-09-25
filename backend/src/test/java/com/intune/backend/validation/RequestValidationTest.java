package com.intune.backend.validation;

import com.intune.backend.controller.AuthController;
import com.intune.backend.controller.ChatController;
import com.intune.backend.controller.ExpenseController;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RequestValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @Test
    void acceptsValidRegistrationRequest() {
        AuthController.RegisterRequest request = validRegistrationRequest();

        assertTrue(validator.validate(request).isEmpty());
    }

    @Test
    void rejectsInvalidEmailAndShortPassword() {
        AuthController.RegisterRequest request = validRegistrationRequest();
        request.setEmail("not-an-email");
        request.setPassword("short");

        assertFalse(validator.validate(request).isEmpty());
    }

    @Test
    void rejectsBlankRequiredProfileText() {
        AuthController.ProfileRequest request = new AuthController.ProfileRequest();
        request.setVibeText("   ");

        assertFalse(validator.validate(request).isEmpty());
    }

    @Test
    void rejectsMessageLongerThanAllowedLimit() {
        ChatController.ChatMessageRequest request = new ChatController.ChatMessageRequest();
        request.setReceiverId("507f1f77bcf86cd799439011");
        request.setContent("a".repeat(2_001));

        assertFalse(validator.validate(request).isEmpty());
    }

    @Test
    void rejectsInvalidExpenseAmountAndRoommateId() {
        ExpenseController.AddExpenseRequest request = new ExpenseController.AddExpenseRequest();
        request.setAmount(0);
        request.setDescription("Rent");
        request.setSplitWith("not-a-mongo-id");

        assertFalse(validator.validate(request).isEmpty());
    }

    private AuthController.RegisterRequest validRegistrationRequest() {
        AuthController.RegisterRequest request = new AuthController.RegisterRequest();
        request.setName("Test User");
        request.setEmail("test@example.com");
        request.setPhone("9876543210");
        request.setPassword("Password123");
        request.setGender("Female");
        request.setMaskedAadhaar("XXXX XXXX 1234");
        request.setAadhaarNumber("123456789012");
        return request;
    }
}
