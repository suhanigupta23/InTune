package com.intune.backend.repository;

import com.intune.backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);
    Optional<User> findByAnonymousId(String anonymousId);
    Optional<User> findByAadhaarHash(String aadhaarHash);

    @Query("{ '_id': ?0, 'isVerified': true }")
    Optional<User> findVerifiedById(String userId);

    List<User> findByIdNot(String id);
}
