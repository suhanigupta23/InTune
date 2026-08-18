package com.intune.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "messages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    @Id
    private String id;
    
    private String sender;
    private String receiver;
    private String content;
    
    @Builder.Default
    private Date timestamp = new Date();
    
    private Date createdAt;
    private Date updatedAt;
}
