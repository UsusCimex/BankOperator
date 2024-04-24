package ru.nsu.bankbackend.service;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import ru.nsu.bankbackend.config.Security.AuthenticationRequest;
import ru.nsu.bankbackend.config.Security.AuthenticationResponse;
import ru.nsu.bankbackend.config.Security.JWTUtils;
import ru.nsu.bankbackend.model.User;
import ru.nsu.bankbackend.repository.UserRepository;

import java.util.HashMap;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JWTUtils jwtUtils;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private AuthenticationManager authenticationManager;

    @Transactional
    public AuthenticationResponse signUp(AuthenticationRequest registrationRequest){
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
