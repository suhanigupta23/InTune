package com.intune.backend.repository;

import com.intune.backend.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {
    @Query("{ '$or': [ { 'sender': ?0, 'receiver': ?1 }, { 'sender': ?1, 'receiver': ?0 } ] }")
    List<Message> findChatHistory(String user1, String user2);
    
    @Query("{ '$or': [ { 'sender': ?0 }, { 'receiver': ?0 } ] }")
    List<Message> findAllBySenderOrReceiver(String userId);
}
