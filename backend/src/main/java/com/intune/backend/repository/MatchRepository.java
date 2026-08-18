package com.intune.backend.repository;

import com.intune.backend.model.Match;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatchRepository extends MongoRepository<Match, String> {
    Optional<Match> findByUserAAndUserB(String userA, String userB);
    
    @Query("{ '$or': [ { 'userA': ?0 }, { 'userB': ?0 } ] }")
    List<Match> findMatchesForUser(String userId);
    
    @Query("{ '$or': [ { 'userA': ?0, 'status': 'matched' }, { 'userB': ?0, 'status': 'matched' } ] }")
    List<Match> findConfirmedMatchesForUser(String userId);
}
