package com.smartexpense.backend.service;

import com.smartexpense.backend.model.User;
import com.smartexpense.backend.repository.UserRepository;
import com.smartexpense.backend.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    public User register(User user) {
        // Encoding the password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword())); 
        return userRepository.save(user);
    }

    public String login(String email, String password) {
        Optional<User> user = userRepository.findByEmail(email);
        
        // passwordEncoder.matches() is crucial for security
        if (user.isPresent() && passwordEncoder.matches(password, user.get().getPassword())) {
            return jwtUtils.generateToken(email);
        }
        
        // Throwing English exception message for incorrect credentials
        throw new RuntimeException("Invalid email or password!");
    }
}