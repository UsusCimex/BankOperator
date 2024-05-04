package ru.nsu.bankbackend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.nsu.bankbackend.dto.PaymentDTO;
import ru.nsu.bankbackend.model.Credit;
import ru.nsu.bankbackend.model.Payment;
import ru.nsu.bankbackend.service.PaymentService;

import java.util.Collections;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/payments")
public class PaymentController {
    @Autowired
    private PaymentService paymentService;

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'TARIFF_MANAGER', 'OPERATOR','ACCOUNTANT')")
    public List<Payment> getAllPayments() {
        return paymentService.findAll();
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TARIFF_MANAGER', 'OPERATOR','ACCOUNTANT')")
    public List<Payment> getPaymentsWithFilters(
            @RequestParam(required = false) String clientName,
            @RequestParam(required = false) Long amount,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date paymentDate,
            @RequestParam(required = false) Long commission
    ) {
        return paymentService.findWithFilters(clientName, amount, paymentDate, commission);
    }

    @GetMapping("/credit/{creditId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TARIFF_MANAGER', 'OPERATOR','ACCOUNTANT')")
    public ResponseEntity<List<Payment>> getCreditsByCreditId(@PathVariable Long creditId) {
        List<Payment> payments = paymentService.findByCreditId(creditId);
        if (payments.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(payments);
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
    public Payment createPayment(@RequestBody PaymentDTO payment) {
        return paymentService.save(payment);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<?> updatePayment(@PathVariable Long id, @RequestBody PaymentDTO paymentDetails) {
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
    @PreAuthorize("hasRole('ADMIN')")
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
