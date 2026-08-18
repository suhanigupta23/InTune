package com.intune.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "expenses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Expense {
    @Id
    private String id;
    
    private double amount;
    private String description;
    private String paidBy;
    private String splitWith;
    
    @Builder.Default
    private String category = "General";
    
    @Builder.Default
    private Date date = new Date();
    
    private Date createdAt;
    private Date updatedAt;
}
