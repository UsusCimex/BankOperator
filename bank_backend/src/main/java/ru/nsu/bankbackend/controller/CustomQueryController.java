package ru.nsu.bankbackend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.nsu.bankbackend.service.CustomQueryService;

import java.util.List;

@RestController
@RequestMapping("/api/custom")
public class CustomQueryController {
    @Autowired
    private CustomQueryService customQueryService;

    @PostMapping("/query")
    public ResponseEntity<?> executeCustomQuery(@RequestBody String query) {
        try {
            // Возможная валидация запроса
            List<?> result = customQueryService.execute(query);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}