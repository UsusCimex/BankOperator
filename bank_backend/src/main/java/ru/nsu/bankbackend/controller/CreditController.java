package ru.nsu.bankbackend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ru.nsu.bankbackend.model.Credit;
import ru.nsu.bankbackend.service.CreditService;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/credits")
public class CreditController {

    @Autowired
    private CreditService creditService;

    @GetMapping
    @Secured({"ADMIN", "OPERATOR", "ACCOUNTANT", "TARIFF_MANAGER"})
    public List<Credit> getAllCredits() {
        return creditService.findAll();
    }

    @GetMapping("/{id}")
    @Secured({"ADMIN", "OPERATOR"})
    public ResponseEntity<Credit> getCreditById(@PathVariable Long id) {
        System.out.println("received credit id " + id);
        return creditService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Secured({"ADMIN", "OPERATOR"})
    public Credit createCredit(@RequestBody Credit credit) {
        return creditService.save(credit);
    }

    @PutMapping("/{id}")
    @Secured({"ADMIN", "OPERATOR"})
    public ResponseEntity<Credit> updateCredit(@PathVariable Long id, @RequestBody Credit creditDetails) {
        return creditService.update(id, creditDetails)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Secured({"ADMIN", "OPERATOR"})
    public ResponseEntity<?> deleteCredit(@PathVariable Long id) {
        creditService.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/customQuery")
    @Secured({"ADMIN", "OPERATOR", "ACCOUNTANT"})
    public ResponseEntity<?> executeCustomQuery(@RequestBody String queryJson) {
        try {
            List<Credit> response = creditService.executeCustomQuery(queryJson);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Ошибка выполнения запроса: " + e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Произошла ошибка: " + e.getMessage()));
        }
    }
}