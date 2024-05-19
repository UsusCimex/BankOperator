package ru.nsu.bankbackend.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.nsu.bankbackend.service.MandatoryPaymentService;

import java.util.Collections;

@RestController
@AllArgsConstructor
@RequestMapping("/api/mandatoryPayments")
public class MandatoryPaymentController {
    private final MandatoryPaymentService mandatoryPaymentService;

    @GetMapping
    public ResponseEntity<?> getMandatoryPayments() {
        return ResponseEntity.ok(mandatoryPaymentService.getAllMandatoryPayments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMandatoryPayment(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(mandatoryPaymentService.getMandatoryPaymentById(id).orElseThrow(() -> new Exception("Обязательный платёж не найден!")));
        } catch (Exception e) {
            System.out.println("Ошибка выполнения запроса: " + e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Произошла ошибка: " + e.getMessage()));
        }
    }
}
