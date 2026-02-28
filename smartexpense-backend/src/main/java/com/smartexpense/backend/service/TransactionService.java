package com.smartexpense.backend.service;

import com.smartexpense.backend.model.Transaction;
import com.smartexpense.backend.model.User;
import com.smartexpense.backend.repository.TransactionRepository;
import com.smartexpense.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    public Transaction saveTransaction(Transaction transaction, String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        transaction.setUser(user);
        return transactionRepository.save(transaction);
    }

    public List<Transaction> getTransactionsByUser(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return transactionRepository.findByUser(user);
    }

    public Map<String, Double> getTransactionStats(String email) {
        List<Transaction> transactions = getTransactionsByUser(email);
        
        double income = transactions.stream()
                .filter(t -> t.getType().name().equalsIgnoreCase("INCOME")) 
                .mapToDouble(Transaction::getAmount)
                .sum();

        double expense = transactions.stream()
                .filter(t -> t.getType().name().equalsIgnoreCase("EXPENSE"))
                .mapToDouble(Transaction::getAmount)
                .sum();
        
        Map<String, Double> stats = new HashMap<>();
        stats.put("totalIncome", income);
        stats.put("totalExpense", expense);
        return stats;
    }

    public void deleteTransaction(Long id, String email) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        
        if (!transaction.getUser().getEmail().equals(email)) {
            throw new RuntimeException("You are not authorized to delete this transaction");
        }
        
        transactionRepository.delete(transaction);
    }

    public Transaction updateTransaction(Long id, Transaction updatedDetails, String email) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!transaction.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized to update this transaction");
        }

        transaction.setDescription(updatedDetails.getDescription());
        transaction.setAmount(updatedDetails.getAmount());
        transaction.setType(updatedDetails.getType());
        transaction.setCategory(updatedDetails.getCategory());
        
        return transactionRepository.save(transaction);
    }

    public List<Transaction> getTransactionsByDateRange(String email, String start, String end) {
        LocalDateTime startDate = LocalDate.parse(start).atStartOfDay();
        LocalDateTime endDate = LocalDate.parse(end).atTime(LocalTime.MAX);
        
        return transactionRepository.findTransactionsByDateRange(email, startDate, endDate);
    }

    public Page<Transaction> getTransactionsPaged(String email, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("date").descending());
        return transactionRepository.findByUserWithSearch(email, keyword, pageable);
    }
}