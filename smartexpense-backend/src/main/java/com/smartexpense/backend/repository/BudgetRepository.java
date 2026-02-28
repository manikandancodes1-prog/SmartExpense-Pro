package com.smartexpense.backend.repository;
import com.smartexpense.backend.model.Budget;
import com.smartexpense.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    Optional<Budget> findByUserAndMonthAndYear(User user, int month, int year);
}