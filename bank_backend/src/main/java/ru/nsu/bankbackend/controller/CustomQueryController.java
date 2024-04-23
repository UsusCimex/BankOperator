package ru.nsu.bankbackend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.nsu.bankbackend.service.CustomQueryService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/custom")
public class CustomQueryController {
    @Autowired
    private CustomQueryService customQueryService;

    @PostMapping("/query")
    @Secured("ADMIN")
    public ResponseEntity<?> executeCustomQuery(@RequestBody String queryJson) {
        try {
            int count = customQueryService.execute(queryJson);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Запрос выполнен успешно.");
            response.put("affectedRows", count);
            return ResponseEntity.ok().body(response);
        } catch (Exception e) {
            Map<String, String> errorMap = new HashMap<>();
            errorMap.put("error", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorMap);
        }
    }
}