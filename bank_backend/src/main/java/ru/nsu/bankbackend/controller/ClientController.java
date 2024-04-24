package ru.nsu.bankbackend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.nsu.bankbackend.model.Client;
import ru.nsu.bankbackend.service.ClientService;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/clients")
public class ClientController {
    @Autowired
    private ClientService clientService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TARIFF_MANAGER', 'OPERATOR','ACCOUNTANT')")
    public List<Client> getAllClients() {
        return clientService.findAll();
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
    @PreAuthorize("hasAnyRole('ADMIN', 'TARIFF_MANAGER', 'OPERATOR','ACCOUNTANT')")
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