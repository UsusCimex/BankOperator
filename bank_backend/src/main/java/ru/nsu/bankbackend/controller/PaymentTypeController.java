package ru.nsu.bankbackend.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.nsu.bankbackend.model.PaymentType;
import ru.nsu.bankbackend.service.PaymentTypeService;

import java.util.Collections;
import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/paymentTypes")
public class PaymentTypeController {
    private PaymentTypeService paymentTypeService;

    @GetMapping
    public ResponseEntity<List<PaymentType>> getPaymentTypes() {
        return ResponseEntity.ok(paymentTypeService.getAllPaymentTypes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPaymentType(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(paymentTypeService.getPaymentTypeById(id).orElseThrow(() -> new Exception("Тип оплаты не найден!")));
        } catch (Exception e) {
            System.out.println("Ошибка выполнения запроса: " + e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Произошла ошибка: " + e.getMessage()));
        }
    }
}
