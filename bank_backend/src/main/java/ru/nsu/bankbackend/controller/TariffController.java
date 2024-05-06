package ru.nsu.bankbackend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.nsu.bankbackend.model.Tariff;
import ru.nsu.bankbackend.service.TariffService;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/tariffs")
public class TariffController {

    @Autowired
    private TariffService tariffService;

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'TARIFF_MANAGER', 'OPERATOR','ACCOUNTANT')")
    public Page<Tariff> getAllTariffs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "3") int size
    ) {
        return tariffService.findAll(PageRequest.of(page, size));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TARIFF_MANAGER', 'OPERATOR','ACCOUNTANT')")
    public Page<Tariff> getTariffWithFilters(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "3") int size,

            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long loanTerm,
            @RequestParam(required = false) Long interestRate,
            @RequestParam(required = false) Long maxAmount
    ) {
        return tariffService.findWithFilters(PageRequest.of(page, size), name, loanTerm, interestRate, maxAmount);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TARIFF_MANAGER')")
    public ResponseEntity<Tariff> getTariffById(
            @PathVariable Long id
    ) {
        return tariffService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TARIFF_MANAGER')")
    public Tariff createTariff(
            @RequestBody Tariff tariff
    ) {
        return tariffService.save(tariff);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TARIFF_MANAGER')")
    public ResponseEntity<Tariff> updateTariff(
            @PathVariable Long id,
            @RequestBody Tariff tariffDetails
    ) {
        return tariffService.update(id, tariffDetails)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TARIFF_MANAGER')")
    public ResponseEntity<?> deleteTariff(
            @PathVariable Long id
    ) {
        tariffService.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/customQuery")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> executeCustomQuery(
            @RequestBody String queryJson
    ) {
        try {
            List<Tariff> response = tariffService.executeCustomQuery(queryJson);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Ошибка выполнения запроса: " + e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Произошла ошибка: " + e.getMessage()));
        }
    }
}
