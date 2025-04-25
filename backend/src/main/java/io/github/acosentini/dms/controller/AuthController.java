package io.github.acosentini.dms.controller;

import io.github.acosentini.dms.dto.JwtResponse;
import io.github.acosentini.dms.dto.LoginRequest;
import io.github.acosentini.dms.dto.RegisterRequest;
import io.github.acosentini.dms.dto.TokenRefreshRequest;
import io.github.acosentini.dms.dto.TokenRefreshResponse;
import io.github.acosentini.dms.dto.LogoutRequest;
import io.github.acosentini.dms.model.User;
import io.github.acosentini.dms.service.UserService;
import io.github.acosentini.dms.security.JwtTokenProvider;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.validation.Valid;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        User user = userService.authenticateUser(loginRequest.getUsername(), loginRequest.getPassword());
        
        String accessToken = tokenProvider.generateAccessToken(user);
        String refreshToken = tokenProvider.generateRefreshToken(user);
        
        return ResponseEntity.ok(new JwtResponse(
            accessToken,
            refreshToken,
            user.getId(),
            user.getUsername()
        ));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        if (!tokenProvider.validateRefreshToken(request.getRefreshToken())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Invalid refresh token");
        }

        User user = tokenProvider.getUserFromRefreshToken(request.getRefreshToken());
        String newAccessToken = tokenProvider.generateAccessToken(user);
        
        return ResponseEntity.ok(new TokenRefreshResponse(newAccessToken));
    }

    @PostMapping("/logout")
    @Transactional
    public ResponseEntity<?> logout(@Valid @RequestBody LogoutRequest request) {
        try {
            logger.info("Processing logout request for token: {}", request.getRefreshToken().substring(0, 10) + "...");
            tokenProvider.invalidateRefreshToken(request.getRefreshToken());
            logger.info("Refresh token invalidated successfully");
            return ResponseEntity.ok().body("Logged out successfully");
        } catch (Exception e) {
            logger.error("Error during logout: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error processing logout: " + e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        // Check if username is already taken
        if (userService.existsByUsername(registerRequest.getUsername())) {
            return ResponseEntity
                .badRequest()
                .body("Error: Username is already taken!");
        }

        // Create new user
        User user = new User(
            registerRequest.getUsername(),
            registerRequest.getPassword()
        );

        User registeredUser = userService.registerUser(user);
        
        String accessToken = tokenProvider.generateAccessToken(registeredUser);
        String refreshToken = tokenProvider.generateRefreshToken(registeredUser);

        return ResponseEntity.status(HttpStatus.CREATED).body(new JwtResponse(
            accessToken,
            refreshToken,
            registeredUser.getId(),
            registeredUser.getUsername()
        ));
    }
} 