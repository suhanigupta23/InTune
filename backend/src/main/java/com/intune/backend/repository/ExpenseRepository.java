package com.intune.backend.repository;

import com.intune.backend.model.Expense;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseRepository extends MongoRepository<Expense, String> {
    @Query("{ '$or': [ { 'paidBy': ?0, 'splitWith': ?1 }, { 'paidBy': ?1, 'splitWith': ?0 } ] }")
    List<Expense> findExpensesBetweenUsers(String user1, String user2);
}
