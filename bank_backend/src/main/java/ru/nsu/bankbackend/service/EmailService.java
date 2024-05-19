package ru.nsu.bankbackend.service;

import lombok.AllArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    public void sendPasswordResetEmail(String to, String token) {
        String resetLink = "http://localhost:3000/reset-password/" + token;
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Reset your password");
        message.setText("Please click the following link to reset your password:\n" + resetLink);
        mailSender.send(message);
    }
}
