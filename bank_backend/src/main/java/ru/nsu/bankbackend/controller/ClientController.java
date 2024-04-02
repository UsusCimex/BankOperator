package ru.nsu.bankbackend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.nsu.bankbackend.dto.ClientDTO;
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
    public List<Client> getAllClients() {
        return clientService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Client> getClientById(@PathVariable Long id) {
        return clientService.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/customQuery")
    public ResponseEntity<?> executeCustomQuery(@RequestBody String queryJson) {
        try {
            ResponseEntity<?> response = clientService.executeCustomQuery(queryJson);
            return response;
        } catch (Exception e) {
            System.out.println("Ошибка выполнения запроса: " + e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Произошла ошибка: " + e.getMessage()));
        }
    }

    @PostMapping
    public Client createClient(@RequestBody Client client) {
        return clientService.save(client);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Client> updateClient(@PathVariable Long id, @RequestBody Client clientDetails) {
        return clientService.findById(id)
                .map(client -> {
                    client.setName(clientDetails.getName());
                    client.setContactInfo(clientDetails.getContactInfo());
                    client.setPassportData(clientDetails.getPassportData());
                    client.setBirthDate(clientDetails.getBirthDate());
                    Client updatedClient = clientService.save(client);
                    return ResponseEntity.ok(updatedClient);
                }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteClient(@PathVariable Long id) {
        return clientService.findById(id)
                .map(client -> {
                    clientService.deleteById(client.getId());
                    return ResponseEntity.ok().build();
                }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}