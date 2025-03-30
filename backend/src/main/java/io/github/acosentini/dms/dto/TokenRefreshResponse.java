package io.github.acosentini.dms.dto;

public class TokenRefreshResponse {
    private String accessToken;

    // Default constructor
    public TokenRefreshResponse() {}

    public TokenRefreshResponse(String accessToken) {
        this.accessToken = accessToken;
    }

    // Getters and setters
    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }
} 