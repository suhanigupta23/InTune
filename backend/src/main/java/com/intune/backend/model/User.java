package com.intune.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    private String id;
    
    private String name;
    
    @Indexed(unique = true)
    private String email;
    
    private String phone;
    private String password;
    
    @Indexed(unique = true)
    private String anonymousId;
    
    private String gender;
    private boolean isVerified;
    private String maskedAadhaar;
    
    @Indexed(unique = true, sparse = true)
    private String aadhaarHash;
    
    @Builder.Default
    private String vibeText = "";
    
    private String avatarSeed;
    
    @Builder.Default
    private String role = "USER";
    
    private Date createdAt;
    private Date updatedAt;
}
