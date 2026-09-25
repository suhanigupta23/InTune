
package com.intune.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Public profile shape returned to the frontend.
 * Deliberately excludes password, phone, Aadhaar hash, and other
 * database-internal fields from the User document.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SafeUserResponse {
    private String _id;
    private String name;
    private String email;
    private String anonymousId;
    private String gender;
    private boolean isVerified;
    private String vibeText;
    private String avatarSeed;
}
