package com.smartexpense.backend.repository;

import com.smartexpense.backend.model.Transaction;
import com.smartexpense.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUser(User user);

    @Query("SELECT t FROM Transaction t WHERE t.user.email = :email AND t.date BETWEEN :startDate AND :endDate")
    List<Transaction> findTransactionsByDateRange(
        @Param("email") String email, 
        @Param("startDate") LocalDateTime startDate, 
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT t FROM Transaction t WHERE t.user.email = :email AND LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Transaction> findByUserWithSearch(
        @Param("email") String email, 
        @Param("keyword") String keyword, 
        Pageable pageable
    );
}