package ru.nsu.bankbackend.config.Security.DTO;

import lombok.Data;

@Data
public class AuthenticationResponse {
    private String token;
    private String refreshToken;
    private String role;
}
