package ru.nsu.bankbackend.service;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import ru.nsu.bankbackend.config.Security.DTO.AuthenticationRequest;
import ru.nsu.bankbackend.config.Security.DTO.AuthenticationResponse;
import ru.nsu.bankbackend.config.Security.JWTUtils;
import ru.nsu.bankbackend.model.User;
import ru.nsu.bankbackend.repository.UserRepository;

import java.util.HashMap;
import java.util.UUID;

@Service
@AllArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final JWTUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    @Transactional
    public AuthenticationResponse signUp(AuthenticationRequest registrationRequest) {
        AuthenticationResponse response = new AuthenticationResponse();
        User user = new User();
        user.setEmail(registrationRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
        user.setRole(registrationRequest.getRole());
        User ourUserResult = userRepository.save(user);
        if (ourUserResult.getId()>0) {
            var jwt = jwtUtils.generateToken(user);
            var refreshToken = jwtUtils.generateRefreshToken(new HashMap<>(), user);
            response.setToken(jwt);
            response.setRefreshToken(refreshToken);
            response.setRole(ourUserResult.getRole());
        }
        return response;
    }

    @Transactional
    public AuthenticationResponse signIn(AuthenticationRequest authorizationRequest) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(authorizationRequest.getEmail(),authorizationRequest.getPassword()));

        AuthenticationResponse response = new AuthenticationResponse();
        var user = userRepository.findByEmail(authorizationRequest.getEmail()).orElseThrow();
        var jwt = jwtUtils.generateToken(user);
        var refreshToken = jwtUtils.generateRefreshToken(new HashMap<>(), user);
        response.setToken(jwt);
        response.setRefreshToken(refreshToken);
        response.setRole(user.getRole());
        return response;
    }

    @Transactional
    public AuthenticationResponse refreshToken(AuthenticationRequest refreshTokenRequest){
        AuthenticationResponse response = new AuthenticationResponse();
        String ourEmail = jwtUtils.extractUsername(refreshTokenRequest.getRefreshToken());
        User users = userRepository.findByEmail(ourEmail).orElseThrow();
        if (jwtUtils.isTokenValid(refreshTokenRequest.getRefreshToken(), users)) {
            var jwt = jwtUtils.generateToken(users);
            response.setToken(jwt);
            response.setRefreshToken(refreshTokenRequest.getRefreshToken());
            response.setRole(users.getRole());
        }
        return response;
    }

    @Transactional
    public boolean resetPassword(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null) {
            String resetToken = UUID.randomUUID().toString();
            user.setResetToken(resetToken);
            userRepository.save(user);
            emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
            return true;
        }
        return false;
    }

    @Transactional
    public boolean requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null) {
            String resetToken = UUID.randomUUID().toString();
            user.setResetToken(resetToken);
            userRepository.save(user);
            emailService.sendPasswordResetEmail(user.getEmail(), resetToken);  // Отправляем письмо
            return true;
        }
        return false;
    }

    public void updatePassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token).orElseThrow(() -> new RuntimeException("Invalid token"));
        if (user != null) {
            user.setPassword(passwordEncoder.encode(newPassword));
            user.setResetToken(null);
            userRepository.save(user);
        } else {
            throw new RuntimeException("Invalid token");
        }
    }

    @Transactional
    public boolean validateToken(String token) {
        try {
            String userEmail = jwtUtils.extractUsername(token);
            User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new RuntimeException("User not found"));
            return jwtUtils.isTokenValid(token, user);
        } catch (Exception e) {
            return false;
        }
    }
}
