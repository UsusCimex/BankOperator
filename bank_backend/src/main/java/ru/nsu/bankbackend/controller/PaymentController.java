package ru.nsu.bankbackend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.nsu.bankbackend.model.Payment;
import ru.nsu.bankbackend.service.PaymentService;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/payments")
public class PaymentController {
    @Autowired
    private PaymentService paymentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TARIFF_MANAGER', 'OPERATOR','ACCOUNTANT')")
    public List<Payment> getAllPayments() {
        return paymentService.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Long id) {
        return paymentService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public Payment createPayment(@RequestBody Payment payment) {
        return paymentService.save(payment);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<?> updatePayment(@PathVariable Long id, @RequestBody Payment paymentDetails) {
        try {
            Payment payment = paymentService.update(id, paymentDetails);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            System.out.println("Ошибка выполнения запроса: " + e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Произошла ошибка: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<?> deletePayment(@PathVariable Long id) {
        paymentService.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/customQuery")
    @PreAuthorize("hasAnyRole('ADMIN', 'TARIFF_MANAGER', 'OPERATOR','ACCOUNTANT')")
    public ResponseEntity<?> executeCustomQuery(@RequestBody String queryJson) {
        try {
            List<Payment> response = paymentService.executeCustomQuery(queryJson);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Ошибка выполнения запроса: " + e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Произошла ошибка: " + e.getMessage()));
        }
    }
}
