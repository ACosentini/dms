package io.github.acosentini.dms.dto;

import javax.validation.constraints.NotBlank;

public class LogoutRequest {
    @NotBlank
    private String refreshToken;

    // Default constructor
    public LogoutRequest() {}

    // Getters and setters
    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
} 