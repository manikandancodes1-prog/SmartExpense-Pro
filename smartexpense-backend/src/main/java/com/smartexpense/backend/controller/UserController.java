package com.smartexpense.backend.controller;

import com.smartexpense.backend.model.User;
import com.smartexpense.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5174")
public class UserController {

    @Autowired
    private UserService userService;

    
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Principal principal) {
        
        return ResponseEntity.ok(userService.getUserByEmail(principal.getName()));
    }

    
    @PutMapping("/budget")
    public ResponseEntity<User> updateBudget(@RequestBody Map<String, Double> request, Principal principal) {
        Double newBudget = request.get("budget");
        return ResponseEntity.ok(userService.updateBudget(principal.getName(), newBudget));
    }
}