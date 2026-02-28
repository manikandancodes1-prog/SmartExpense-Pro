package com.smartexpense.backend.repository;
import com.smartexpense.backend.model.Category;
import com.smartexpense.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUser(User user);
}