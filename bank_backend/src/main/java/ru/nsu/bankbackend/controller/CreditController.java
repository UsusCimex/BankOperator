package ru.nsu.bankbackend.controller;

import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.nsu.bankbackend.dto.CreditDTO;
import ru.nsu.bankbackend.dto.CreditDetailDTO;
import ru.nsu.bankbackend.service.CreditService;

import java.util.Collections;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/credits")
@AllArgsConstructor
public class CreditController {
    private final CreditService creditService;

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'TARIFF_MANAGER', 'OPERATOR','ACCOUNTANT')")
    public Page<CreditDetailDTO> getAllCredits(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "3") int size
    ) {
        return creditService.findAll(PageRequest.of(page, size));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TARIFF_MANAGER', 'OPERATOR','ACCOUNTANT')")
    public Page<CreditDetailDTO> getCreditsWithFilters(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "3") int size,

            @RequestParam(required = false) String clientName,
            @RequestParam(required = false) String tariffName,
            @RequestParam(required = false) Long amount,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date endDate
    ) {
        return creditService.findWithFilters(PageRequest.of(page, size), clientName, tariffName, amount, status, startDate, endDate);
    }

    @GetMapping("/client/{creditId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TARIFF_MANAGER', 'OPERATOR','ACCOUNTANT')")
    public ResponseEntity<List<CreditDetailDTO>> getCreditsByClientId(
            @PathVariable Long creditId
    ) {
        List<CreditDetailDTO> payments = creditService.findByClientId(creditId);
        if (payments.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<?> getCreditById(@PathVariable Long id) {
        return creditService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public CreditDetailDTO createCredit(@RequestBody CreditDTO credit) {
        return creditService.save(credit);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<?> updateCredit(
            @PathVariable Long id,
            @RequestBody CreditDTO creditDetails
    ) {
        try {
            CreditDetailDTO credit = creditService.update(id, creditDetails);
            return ResponseEntity.ok(credit);
        } catch (Exception e) {
            System.out.println("Ошибка выполнения запроса: " + e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Произошла ошибка: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<?> deleteCredit(
            @PathVariable Long id
    ) {
        creditService.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/customQuery")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> executeCustomQuery(
            @RequestBody String queryJson
    ) {
        try {
            List<CreditDetailDTO> response = creditService.executeCustomQuery(queryJson);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Ошибка выполнения запроса: " + e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Произошла ошибка: " + e.getMessage()));
        }
    }
}