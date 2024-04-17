package ru.nsu.bankbackend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    @GetMapping
    public List<Tariff> getAllTariffs() {
        return tariffService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tariff> getTariffById(@PathVariable Long id) {
        return tariffService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Tariff createTariff(@RequestBody Tariff tariff) {
        return tariffService.save(tariff);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Tariff> updateTariff(@PathVariable Long id, @RequestBody Tariff tariffDetails) {
        return tariffService.update(id, tariffDetails)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTariff(@PathVariable Long id) {
        tariffService.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/customQuery")
    public ResponseEntity<?> executeCustomQuery(@RequestBody String queryJson) {
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
