package com.intune.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "matches")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@CompoundIndex(def = "{'userA': 1, 'userB': 1}", unique = true)
public class Match {
    @Id
    private String id;
    
    private String userA;
    private String userB;
    
    @Builder.Default
    private boolean userALiked = false;
    
    @Builder.Default
    private boolean userBLiked = false;
    
    @Builder.Default
    private String status = "pending"; // pending or matched
    
    @Builder.Default
    private double matchScore = 0.0;
    
    private Date createdAt;
    private Date updatedAt;
}
