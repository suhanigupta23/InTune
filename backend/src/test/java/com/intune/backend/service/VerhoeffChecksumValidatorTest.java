package com.intune.backend.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class VerhoeffChecksumValidatorTest {

    private final VerhoeffChecksumValidator validator = new VerhoeffChecksumValidator();

    @Test
    void acceptsAValidTwelveDigitChecksum() {
        assertTrue(validator.isValid("123456789010"));
    }

    @Test
    void rejectsAnInvalidChecksum() {
        assertFalse(validator.isValid("123456789011"));
    }

    @Test
    void rejectsValuesThatAreNotTwelveDigits() {
        assertFalse(validator.isValid("1234"));
        assertFalse(validator.isValid(null));
    }
}
