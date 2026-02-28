package com.smartexpense.backend.controller;

import com.smartexpense.backend.model.Transaction;
import com.smartexpense.backend.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "http://localhost:5174") 
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    
    @PostMapping
    public ResponseEntity<Transaction> addTransaction(@RequestBody Transaction transaction, Principal principal) {
        return ResponseEntity.ok(transactionService.saveTransaction(transaction, principal.getName()));
    }

    
    @GetMapping
    public ResponseEntity<List<Transaction>> getAllTransactions(Principal principal) {
        return ResponseEntity.ok(transactionService.getTransactionsByUser(principal.getName()));
    }

    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Double>> getStats(Principal principal) {
        return ResponseEntity.ok(transactionService.getTransactionStats(principal.getName()));
    }

    
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTransaction(@PathVariable Long id, Principal principal) {
        transactionService.deleteTransaction(id, principal.getName());
        return ResponseEntity.ok("பரிவர்த்தனை நீக்கப்பட்டது!");
    }

    
    @PutMapping("/{id}")
    public ResponseEntity<Transaction> updateTransaction(@PathVariable Long id, @RequestBody Transaction transaction, Principal principal) {
        return ResponseEntity.ok(transactionService.updateTransaction(id, transaction, principal.getName()));
    }

    
    @GetMapping("/filter")
    public ResponseEntity<List<Transaction>> filterByDate(
            @RequestParam String start, 
            @RequestParam String end, 
            Principal principal) {
        return ResponseEntity.ok(transactionService.getTransactionsByDateRange(principal.getName(), start, end));
    }

    
    @GetMapping("/paged")
    public ResponseEntity<Page<Transaction>> getPagedTransactions(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Principal principal) {
        return ResponseEntity.ok(transactionService.getTransactionsPaged(principal.getName(), keyword, page, size));
    }
}