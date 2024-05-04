package ru.nsu.bankbackend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.nsu.bankbackend.model.Client;
import ru.nsu.bankbackend.model.Credit;
import ru.nsu.bankbackend.service.ClientService;

import java.util.Collections;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/clients")
public class ClientController {
    @Autowired
    private ClientService clientService;

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'TARIFF_MANAGER', 'OPERATOR','ACCOUNTANT')")
    public List<Client> getAllClient() {
        return clientService.findAll();
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TARIFF_MANAGER', 'OPERATOR','ACCOUNTANT')")
    public List<Client> getClientsWithFilters(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String passport,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date birthDate,
            @RequestParam(required = false) String creditStatus,
            @RequestParam(required = false) Boolean hasCredit,
            @RequestParam(required = false) Boolean isBlocked
    ) {
        return clientService.findWithFilters(name, email, phone, passport, birthDate, creditStatus, hasCredit, isBlocked);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<Client> getClientById(@PathVariable Long id) {
        return clientService.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public Client createClient(@RequestBody Client client) {
        return clientService.save(client);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<?> updateClient(@PathVariable Long id, @RequestBody Client clientDetails) {
        try {
            Client client = clientService.update(id, clientDetails);
            return ResponseEntity.ok(client);
        } catch (Exception e) {
            System.out.println("Ошибка выполнения запроса: " + e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Произошла ошибка: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<?> deleteClient(@PathVariable Long id) {
        try {
            clientService.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    @PostMapping("/customQuery")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> executeCustomQuery(@RequestBody String queryJson) {
        try {
            List<Client> response = clientService.executeCustomQuery(queryJson);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Ошибка выполнения запроса: " + e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Произошла ошибка: " + e.getMessage()));
        }
    }
}