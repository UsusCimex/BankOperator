package ru.nsu.bankbackend.config.Security.DTO;

import lombok.Data;

@Data
public class PasswordResetRequest {
    private String newPassword;
    private String confirmPassword;
}