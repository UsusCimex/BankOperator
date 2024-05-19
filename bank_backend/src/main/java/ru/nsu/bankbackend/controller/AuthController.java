package ru.nsu.bankbackend.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.nsu.bankbackend.config.Security.DTO.AuthenticationRequest;
import ru.nsu.bankbackend.config.Security.DTO.AuthenticationResponse;
import ru.nsu.bankbackend.config.Security.DTO.EmailRequest;
import ru.nsu.bankbackend.config.Security.DTO.PasswordResetRequest;
import ru.nsu.bankbackend.service.AuthService;

@RestController
@RequestMapping("/")
@AllArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<AuthenticationResponse> signUp(@RequestBody AuthenticationRequest request){
        return ResponseEntity.ok(authService.signUp(request));
    }
    @PostMapping("/signin")
    public ResponseEntity<AuthenticationResponse> signIn(@RequestBody AuthenticationRequest request){
        return ResponseEntity.ok(authService.signIn(request));
    }
    @PostMapping("/request-reset-password")
    public ResponseEntity<?> requestResetPassword(@RequestBody EmailRequest emailRequest) {
        boolean result = authService.requestPasswordReset(emailRequest.getEmail());
        if (result) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam("token") String token, @RequestBody PasswordResetRequest passwordResetRequest) {
        try {
            authService.updatePassword(token, passwordResetRequest.getNewPassword());
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body("Invalid token or password could not be updated.");
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthenticationResponse> refreshToken(@RequestBody AuthenticationRequest request){
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    @GetMapping("/validate-token")
    public ResponseEntity<String> validateToken(@RequestHeader("Authorization") String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            boolean isValid = authService.validateToken(token);
            if (isValid) {
                return ResponseEntity.ok("Token is valid.");
            } else {
                return ResponseEntity.badRequest().body("Token is invalid.");
            }
        }
        return ResponseEntity.badRequest().body("Authorization header must be provided.");
    }
}
