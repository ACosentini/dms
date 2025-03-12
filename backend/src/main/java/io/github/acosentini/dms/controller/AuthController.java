package io.github.acosentini.dms.controller;

import io.github.acosentini.dms.dto.JwtResponse;
import io.github.acosentini.dms.dto.LoginRequest;
import io.github.acosentini.dms.dto.RegisterRequest;
import io.github.acosentini.dms.model.User;
import io.github.acosentini.dms.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        String jwt = userService.authenticateUser(loginRequest.getUsername(), loginRequest.getPassword());
        
        User user = userService.getUserByUsername(loginRequest.getUsername());
        
        return ResponseEntity.ok(new JwtResponse(
            jwt,
            user.getId(),
            user.getUsername(),
            user.getEmail()
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        // Check if username is already taken
        if (userService.existsByUsername(registerRequest.getUsername())) {
            return ResponseEntity
                .badRequest()
                .body("Error: Username is already taken!");
        }

        // Check if email is already in use
        if (userService.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity
                .badRequest()
                .body("Error: Email is already in use!");
        }

        // Create new user
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(registerRequest.getPassword());

        userService.registerUser(user);

        return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully!");
    }
} 